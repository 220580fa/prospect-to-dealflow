/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const db = supabaseAdmin as any;

export type AgentMode = "analyze_lead" | "suggest_reply" | "execute_next_action";

type AgentRequest = {
  mode: AgentMode;
  leadId?: string | null;
  conversationId?: string | null;
  userId?: string | null;
};

type AgentResult = {
  actionId: string;
  summary: string;
  suggestedMessage: string | null;
  nextAction: Record<string, unknown> | null;
  usedFallback: boolean;
};

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function leadFullName(lead: any) {
  return [lead?.first_name, lead?.last_name].filter(Boolean).join(" ").trim();
}

async function getProfileId(authUserId?: string | null) {
  if (!authUserId) return null;
  const { data } = await db
    .from("profiles")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  return data?.id ?? null;
}

async function buildContext(input: AgentRequest) {
  let conversation: any = null;
  let lead: any = null;

  if (input.conversationId) {
    const { data } = await db
      .from("whatsapp_conversations")
      .select("*")
      .eq("id", input.conversationId)
      .maybeSingle();
    conversation = data;
  }

  const leadId = input.leadId ?? conversation?.lead_id ?? null;
  if (leadId) {
    const { data } = await db.from("leads").select("*").eq("id", leadId).maybeSingle();
    lead = data;
  }

  const { data: stage } = lead?.stage_id
    ? await db
        .from("stages")
        .select("id, name, funnel_id, probability")
        .eq("id", lead.stage_id)
        .maybeSingle()
    : { data: null };

  const { data: owner } = lead?.owner_id
    ? await db
        .from("profiles")
        .select("id, name, email, job_title")
        .eq("id", lead.owner_id)
        .maybeSingle()
    : { data: null };

  const { data: messages } = conversation?.id
    ? await db
        .from("whatsapp_messages")
        .select("id, direction, message_type, body, status, sent_at, received_at, created_at")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  const { data: activities } = lead?.id
    ? await db
        .from("activities")
        .select("type, title, description, result, occurred_at")
        .eq("lead_id", lead.id)
        .order("occurred_at", { ascending: false })
        .limit(20)
    : { data: [] };

  return {
    lead,
    stage,
    owner,
    conversation,
    messages: (messages ?? []).reverse(),
    activities: activities ?? [],
  };
}

function fallbackResponse(mode: AgentMode, ctx: Awaited<ReturnType<typeof buildContext>>) {
  const name = leadFullName(ctx.lead) || ctx.conversation?.contact_name || "esse lead";
  const first = String(name).split(" ")[0] || "Olá";
  const company = ctx.lead?.company_name ? ` da ${ctx.lead.company_name}` : "";
  const latestInbound = [...ctx.messages]
    .reverse()
    .find((message: any) => message.direction === "inbound" && message.body);

  if (mode === "suggest_reply") {
    const message = latestInbound?.body
      ? `Olá, ${first}. Perfeito, obrigado pelo retorno. Para eu te ajudar melhor, me conta rapidamente qual é hoje o principal ponto que mais atrapalha o processo comercial${company}: falta de follow-up, controle dos leads, previsibilidade ou integração entre canais?`
      : `Olá, ${first}. Tudo bem por aí? Queria entender melhor o momento comercial${company} para identificar onde vocês podem estar perdendo oportunidades e qual seria o próximo passo mais simples.`;
    return {
      summary:
        "Sugestão gerada localmente porque o endpoint da Naia/Davi ainda não foi configurado.",
      suggestedMessage: message,
      nextAction: { type: "follow_up", label: "Validar dor comercial do lead" },
      raw: { fallback: true },
    };
  }

  if (mode === "execute_next_action") {
    return {
      summary:
        "Próxima ação sugerida localmente. Configure o endpoint da Naia/Davi para execução inteligente completa.",
      suggestedMessage: null,
      nextAction: { type: "task", title: "Fazer follow-up consultivo", priority: "media" },
      raw: { fallback: true },
    };
  }

  return {
    summary: `${name} está na etapa ${ctx.stage?.name ?? "não identificada"}. Revise histórico, última mensagem e próxima tarefa antes de avançar no funil.`,
    suggestedMessage: null,
    nextAction: { type: "analysis", label: "Revisar qualificação e próxima ação" },
    raw: { fallback: true },
  };
}

async function callConfiguredAgent(
  mode: AgentMode,
  context: Awaited<ReturnType<typeof buildContext>>,
) {
  const endpoint = process.env["NAIA_AGENT_WEBHOOK_URL"];
  if (!endpoint) return null;

  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const apiKey = process.env["NAIA_AGENT_API_KEY"];
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      agent: "naia",
      mode,
      channel: "crm_lovable",
      lead_data: context.lead,
      pipeline_stage: context.stage,
      responsible_user: context.owner,
      conversation: context.conversation,
      conversation_history: context.messages,
      activity_history: context.activities,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }
  if (!response.ok) {
    throw new Error(
      cleanText(data?.error ?? data?.message, `Naia endpoint retornou HTTP ${response.status}`),
    );
  }
  return {
    summary: cleanText(data?.summary ?? data?.analysis, "Análise concluída pela Naia."),
    suggestedMessage: cleanText(data?.suggested_message ?? data?.reply, "") || null,
    nextAction: data?.next_action ?? null,
    raw: data,
  };
}

async function maybeCreateTask(
  actionId: string,
  mode: AgentMode,
  ctx: Awaited<ReturnType<typeof buildContext>>,
  result: { nextAction: Record<string, unknown> | null },
) {
  if (mode !== "execute_next_action" || !ctx.lead?.id) return;
  const action = result.nextAction ?? {};
  const title = cleanText(action["title"] ?? action["label"], "Próxima ação sugerida pela Naia");
  const due = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await db.from("tasks").insert({
    title,
    lead_id: ctx.lead.id,
    company_id: ctx.lead.company_id ?? null,
    owner_id: ctx.owner?.id ?? ctx.lead.owner_id ?? null,
    type: cleanText(action["type"], "follow_up"),
    description: `Criada pela Naia/Davi a partir da ação ${actionId}.`,
    due_at: due,
    priority: cleanText(action["priority"], "media"),
  });
}

export async function requestNaiaAction(input: AgentRequest): Promise<AgentResult> {
  const ctx = await buildContext(input);
  const actorId = await getProfileId(input.userId);
  const latestMessage = [...ctx.messages].reverse()[0] ?? null;
  const requestPayload = {
    mode: input.mode,
    lead_id: ctx.lead?.id ?? null,
    conversation_id: ctx.conversation?.id ?? null,
    latest_message_id: latestMessage?.id ?? null,
  };

  let responsePayload: any = null;
  let normalized: ReturnType<typeof fallbackResponse>;
  let usedFallback = false;

  try {
    const agentResponse = await callConfiguredAgent(input.mode, ctx);
    if (agentResponse) {
      normalized = agentResponse;
      responsePayload = agentResponse.raw;
    } else {
      normalized = fallbackResponse(input.mode, ctx);
      responsePayload = normalized.raw;
      usedFallback = true;
    }
  } catch (error) {
    normalized = fallbackResponse(input.mode, ctx);
    responsePayload = {
      fallback: true,
      error: error instanceof Error ? error.message : "Falha ao chamar endpoint da Naia",
    };
    usedFallback = true;
  }

  const { data, error } = await db
    .from("ai_actions")
    .insert({
      lead_id: ctx.lead?.id ?? null,
      conversation_id: ctx.conversation?.id ?? null,
      message_id: latestMessage?.id ?? null,
      actor_id: actorId,
      agent: "naia",
      mode: input.mode,
      status: input.mode === "execute_next_action" ? "executed" : "suggested",
      summary: normalized.summary,
      suggested_message: normalized.suggestedMessage,
      next_action: normalized.nextAction ?? {},
      request_payload: requestPayload,
      response_payload: responsePayload ?? {},
      executed_at: input.mode === "execute_next_action" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  await maybeCreateTask(data.id, input.mode, ctx, { nextAction: normalized.nextAction });

  if (ctx.lead?.id) {
    await db.from("activities").insert({
      lead_id: ctx.lead.id,
      actor_id: actorId,
      type: "ia_naia",
      channel: "crm",
      title: input.mode === "suggest_reply" ? "Naia sugeriu resposta" : "Naia analisou o lead",
      description: normalized.summary,
      metadata: { ai_action_id: data.id, mode: input.mode, used_fallback: usedFallback },
    });
  }

  return {
    actionId: data.id,
    summary: normalized.summary,
    suggestedMessage: normalized.suggestedMessage,
    nextAction: normalized.nextAction,
    usedFallback,
  };
}
