// WhatsAppService — toda a lógica de WhatsApp vive aqui (server-only).
// Nenhuma página/componente fala com a Evolution API diretamente.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getProvider, type ProviderCredentials } from "./provider.server";
import { normalizePhone, phoneVariants, renderTemplate } from "./shared";

const db = supabaseAdmin as any;

function normalizeEvolutionBaseUrl(url: string) {
  const parsed = new URL(url.trim());
  parsed.pathname = parsed.pathname
    .replace(/\/(manager|dashboard)(\/.*)?$/i, "")
    .replace(/\/+$/, "");
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString().replace(/\/$/, "");
}

export const PROSPECT_FUNNEL_ID = "11111111-1111-4111-8111-111111111111";
export const TRIAGEM_STAGE_ID = "f907367c-87e5-44ef-bbea-1ae48194d2f1";

export type ConnectionRow = Record<string, any>;

export function webhookUrlFor(origin: string, token: string) {
  return `${origin.replace(/\/+$/, "")}/api/public/whatsapp-webhook?token=${token}`;
}

export async function getConnection(connectionId: string): Promise<ConnectionRow> {
  const { data, error } = await db
    .from("whatsapp_connections")
    .select("*")
    .eq("id", connectionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Conexão de WhatsApp não encontrada");
  return data;
}

export async function getCredentials(connection: ConnectionRow): Promise<ProviderCredentials & { webhookToken: string }> {
  const { data, error } = await db
    .from("whatsapp_connection_secrets")
    .select("*")
    .eq("connection_id", connection["id"])
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Credenciais da conexão não encontradas");
  return {
    baseUrl: data.base_url,
    apiKey: data.api_key,
    instanceName: connection["instance_name"],
    webhookToken: data.webhook_token,
  };
}

async function setStatus(connectionId: string, patch: Record<string, unknown>) {
  await db
    .from("whatsapp_connections")
    .update({ ...patch, last_status_at: new Date().toISOString() })
    .eq("id", connectionId);
}

// ---------- instância / conexão ----------

export async function createInstance(connectionId: string, origin: string) {
  const conn = await getConnection(connectionId);
  const creds = await getCredentials(conn);
  const provider = getProvider(conn["provider"]);
  await provider.createInstance(creds, webhookUrlFor(origin, creds.webhookToken));
  await setStatus(connectionId, { status: "conectando" });
}

export async function getQRCode(connectionId: string, origin: string) {
  const conn = await getConnection(connectionId);
  const creds = await getCredentials(conn);
  const provider = getProvider(conn["provider"]);
  await provider.createInstance(creds, webhookUrlFor(origin, creds.webhookToken));
  const qr = await provider.getQRCode(creds);
  if (qr.status === "conectado") {
    const st = await provider.getConnectionStatus(creds);
    await setStatus(connectionId, {
      status: "conectado",
      phone_number: st.phoneNumber ?? conn["phone_number"],
      profile_name: st.profileName ?? conn["profile_name"],
    });
  } else {
    await setStatus(connectionId, { status: "conectando" });
  }
  return qr;
}

export async function getConnectionStatus(connectionId: string) {
  const conn = await getConnection(connectionId);
  const creds = await getCredentials(conn);
  const provider = getProvider(conn["provider"]);
  const st = await provider.getConnectionStatus(creds);
  await setStatus(connectionId, {
    status: st.status,
    ...(st.phoneNumber ? { phone_number: st.phoneNumber } : {}),
    ...(st.profileName ? { profile_name: st.profileName } : {}),
  });
  return st;
}

export async function disconnectInstance(connectionId: string) {
  const conn = await getConnection(connectionId);
  const creds = await getCredentials(conn);
  await getProvider(conn["provider"]).disconnectInstance(creds);
  await setStatus(connectionId, { status: "desconectado" });
}

export async function deleteConnection(connectionId: string) {
  const conn = await getConnection(connectionId);
  try {
    const creds = await getCredentials(conn);
    await getProvider(conn["provider"]).deleteInstance(creds);
  } catch (e) {
    console.error("[whatsapp] falha ao remover instância remota", e);
  }
  await db.from("whatsapp_connections").delete().eq("id", connectionId);
}

// ---------- leads / conversas ----------

export async function findLeadByPhone(phone: string) {
  const variants = phoneVariants(phone);
  if (!variants.length) return null;
  const digitsOnly = variants.map((v) => v.replace(/\D/g, ""));
  const tails = digitsOnly.map((v) => v.slice(-8)).filter(Boolean);
  const { data } = await db
    .from("leads")
    .select("id, first_name, last_name, phone, whatsapp, owner_id, company_name")
    .or(tails.map((t) => `phone.ilike.%${t}%,whatsapp.ilike.%${t}%`).join(","))
    .limit(20);
  if (!data?.length) return null;
  const match = data.find((l: any) =>
    [l.phone, l.whatsapp].some((p: string | null) => {
      const n = normalizePhone(p);
      return n ? variants.includes(n) : false;
    }),
  );
  return match ?? data[0];
}

export async function createLeadFromWhatsApp(
  phone: string,
  pushName: string | null,
  connection: ConnectionRow,
) {
  const name = (pushName ?? "").trim() || `WhatsApp ${phone.slice(-4)}`;
  const parts = name.split(/\s+/);
  const { data, error } = await db
    .from("leads")
    .insert({
      first_name: parts[0],
      last_name: parts.length > 1 ? parts.slice(1).join(" ") : null,
      phone,
      whatsapp: phone,
      funnel_id: PROSPECT_FUNNEL_ID,
      stage_id: TRIAGEM_STAGE_ID,
      owner_id: connection["responsible_user_id"] ?? null,
      source: "WhatsApp",
      status: "ativo",
      temperature: "morno",
      stage_entered_at: new Date().toISOString(),
      last_interaction_at: new Date().toISOString(),
      notes: `Lead criado automaticamente pela conexão ${connection["name"]}.`,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  await db.from("activities").insert({
    lead_id: data.id,
    type: "whatsapp",
    channel: "whatsapp",
    title: "Lead criado via WhatsApp",
    description: `Primeira mensagem recebida na conexão ${connection["name"]}.`,
    occurred_at: new Date().toISOString(),
  });
  return data;
}

export async function createConversation(params: {
  connectionId: string;
  phone: string;
  leadId?: string | null | undefined;
  contactName?: string | null | undefined;
  assignedUserId?: string | null | undefined;
}) {
  const { data: existing } = await db
    .from("whatsapp_conversations")
    .select("*")
    .eq("connection_id", params.connectionId)
    .eq("phone", params.phone)
    .maybeSingle();
  if (existing) {
    const patch: Record<string, unknown> = {};
    if (params.leadId && !existing.lead_id) patch["lead_id"] = params.leadId;
    if (params.contactName && !existing.contact_name) patch["contact_name"] = params.contactName;
    if (params.assignedUserId && !existing.assigned_user_id)
      patch["assigned_user_id"] = params.assignedUserId;
    if (Object.keys(patch).length) {
      const { data: upd } = await db
        .from("whatsapp_conversations")
        .update(patch)
        .eq("id", existing.id)
        .select()
        .single();
      return upd ?? existing;
    }
    return existing;
  }
  const { data, error } = await db
    .from("whatsapp_conversations")
    .insert({
      connection_id: params.connectionId,
      phone: params.phone,
      lead_id: params.leadId ?? null,
      contact_name: params.contactName ?? null,
      assigned_user_id: params.assignedUserId ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function resolveConversation(connection: ConnectionRow, phone: string, pushName: string | null) {
  let lead = await findLeadByPhone(phone);
  if (!lead && connection["auto_create_lead"]) {
    lead = await createLeadFromWhatsApp(phone, pushName, connection);
  }
  const conversation = await createConversation({
    connectionId: connection["id"],
    phone,
    leadId: lead?.id ?? null,
    contactName: pushName ?? null,
    assignedUserId: lead?.owner_id ?? connection["responsible_user_id"] ?? null,
  });
  return { lead, conversation };
}

// ---------- mensagens ----------

export async function saveMessage(msg: Record<string, any>) {
  const { data, error } = await db
    .from("whatsapp_messages")
    .insert(msg)
    .select()
    .maybeSingle();
  if (error) {
    if (String(error.code) === "23505") return null; // duplicada (webhook reenviado)
    throw new Error(error.message);
  }
  const when = msg["received_at"] ?? msg["sent_at"] ?? new Date().toISOString();
  const preview = (msg["body"] ?? `[${msg["message_type"]}]`).slice(0, 120);
  const inbound = msg["direction"] === "inbound";
  const { data: conv } = await db
    .from("whatsapp_conversations")
    .select("unread_count")
    .eq("id", msg["conversation_id"])
    .maybeSingle();
  await db
    .from("whatsapp_conversations")
    .update({
      last_message_at: when,
      last_message_preview: preview,
      unread_count: inbound ? Number(conv?.unread_count ?? 0) + 1 : 0,
      status: "aberta",
    })
    .eq("id", msg["conversation_id"]);

  if (msg["lead_id"]) {
    await db.from("leads").update({ last_interaction_at: when }).eq("id", msg["lead_id"]);
    await db.from("activities").insert({
      lead_id: msg["lead_id"],
      type: inbound ? "whatsapp_recebido" : "whatsapp_enviado",
      channel: "whatsapp",
      title: inbound ? "WhatsApp recebido" : "WhatsApp enviado",
      description: preview,
      occurred_at: when,
      ...(msg["user_id"] ? { actor_id: msg["user_id"] } : {}),
    });
  }
  return data;
}

export async function sendWhatsAppMessage(params: {
  leadId?: string | null | undefined;
  connectionId?: string | null | undefined;
  conversationId?: string | null | undefined;
  phone?: string | null | undefined;
  message: string;
  userId?: string | null | undefined;
  mediaUrl?: string | null | undefined;
  messageType?: string | undefined;
}) {
  let conversation: any = null;
  if (params.conversationId) {
    const { data } = await db
      .from("whatsapp_conversations")
      .select("*")
      .eq("id", params.conversationId)
      .maybeSingle();
    conversation = data;
  }

  const connectionId = params.connectionId ?? conversation?.connection_id ?? (await defaultConnectionId());
  if (!connectionId) throw new Error("Nenhuma conexão de WhatsApp configurada");
  const connection = await getConnection(connectionId);
  if (connection["status"] !== "conectado") {
    throw new Error(`A conexão "${connection["name"]}" não está conectada ao WhatsApp`);
  }

  let phone = normalizePhone(params.phone ?? conversation?.phone ?? null);
  let leadId = params.leadId ?? conversation?.lead_id ?? null;
  if (!phone && leadId) {
    const { data: lead } = await db
      .from("leads")
      .select("phone, whatsapp")
      .eq("id", leadId)
      .maybeSingle();
    phone = normalizePhone(lead?.whatsapp ?? lead?.phone ?? null);
  }
  if (!phone) throw new Error("Número de WhatsApp inválido ou não informado");

  if (!conversation) {
    if (!leadId) {
      const lead = await findLeadByPhone(phone);
      leadId = lead?.id ?? null;
    }
    conversation = await createConversation({
      connectionId,
      phone,
      leadId,
      assignedUserId: params.userId ?? null,
    });
  }

  const creds = await getCredentials(connection);
  const provider = getProvider(connection["provider"]);

  const base = {
    conversation_id: conversation.id,
    lead_id: leadId,
    connection_id: connectionId,
    direction: "outbound" as const,
    message_type: params.messageType ?? (params.mediaUrl ? "document" : "text"),
    body: params.message,
    media_url: params.mediaUrl ?? null,
    sender_phone: connection["phone_number"] ?? null,
    recipient_phone: phone,
    user_id: params.userId ?? null,
    sent_at: new Date().toISOString(),
  };

  try {
    const result = params.mediaUrl
      ? await provider.sendMedia(creds, phone, params.mediaUrl, params.messageType ?? "document", params.message)
      : await provider.sendText(creds, phone, params.message);
    const saved = await saveMessage({
      ...base,
      external_message_id: result.externalMessageId,
      status: "sent",
    });
    return { ok: true as const, message: saved, conversationId: conversation.id };
  } catch (e) {
    const reason = e instanceof Error ? e.message : "Erro desconhecido";
    await saveMessage({ ...base, status: "failed", error_message: reason });
    throw new Error(reason);
  }
}

async function defaultConnectionId(): Promise<string | null> {
  const { data } = await db
    .from("whatsapp_connections")
    .select("id")
    .eq("status", "conectado")
    .order("created_at")
    .limit(1);
  return data?.[0]?.id ?? null;
}

// ---------- webhook ----------

function extractContent(data: any): { type: string; body: string | null; mediaUrl: string | null } {
  const m = data?.message ?? {};
  if (m.conversation) return { type: "text", body: m.conversation, mediaUrl: null };
  if (m.extendedTextMessage?.text)
    return { type: "text", body: m.extendedTextMessage.text, mediaUrl: null };
  if (m.imageMessage)
    return { type: "image", body: m.imageMessage.caption ?? "[imagem]", mediaUrl: data?.mediaUrl ?? null };
  if (m.audioMessage) return { type: "audio", body: "[áudio]", mediaUrl: data?.mediaUrl ?? null };
  if (m.videoMessage)
    return { type: "video", body: m.videoMessage.caption ?? "[vídeo]", mediaUrl: data?.mediaUrl ?? null };
  if (m.documentMessage)
    return {
      type: "document",
      body: m.documentMessage.fileName ?? "[documento]",
      mediaUrl: data?.mediaUrl ?? null,
    };
  if (m.stickerMessage) return { type: "sticker", body: "[figurinha]", mediaUrl: null };
  if (m.locationMessage) return { type: "location", body: "[localização]", mediaUrl: null };
  return { type: data?.messageType ?? "text", body: null, mediaUrl: null };
}

const STATUS_MAP: Record<string, string> = {
  PENDING: "queued",
  SERVER_ACK: "sent",
  DELIVERY_ACK: "delivered",
  READ: "read",
  PLAYED: "read",
  ERROR: "failed",
};

export async function processWebhook(token: string, payload: any) {
  const { data: secret } = await db
    .from("whatsapp_connection_secrets")
    .select("connection_id")
    .eq("webhook_token", token)
    .maybeSingle();
  if (!secret) return { ok: false, reason: "token inválido" as const };

  const connection = await getConnection(secret.connection_id);
  const event = String(payload?.event ?? "").toLowerCase().replace(/_/g, ".");
  const data = payload?.data ?? {};

  if (event === "connection.update") {
    const state = data?.state ?? data?.connection;
    const status = state === "open" ? "conectado" : state === "close" ? "desconectado" : "conectando";
    await setStatus(connection["id"], {
      status,
      ...(data?.wuid || data?.owner
        ? { phone_number: String(data.wuid ?? data.owner).split("@")[0] }
        : {}),
    });
    return { ok: true, event };
  }

  if (event === "messages.update" || event === "message.update") {
    const items = Array.isArray(data) ? data : [data];
    for (const item of items) {
      const id = item?.keyId ?? item?.key?.id;
      const st = STATUS_MAP[String(item?.status ?? "").toUpperCase()];
      if (id && st) {
        await db
          .from("whatsapp_messages")
          .update({ status: st })
          .eq("connection_id", connection["id"])
          .eq("external_message_id", id);
      }
    }
    return { ok: true, event };
  }

  if (event !== "messages.upsert" && event !== "send.message") return { ok: true, event, skipped: true };

  const items = Array.isArray(data) ? data : [data];
  for (const item of items) {
    const remoteJid: string = item?.key?.remoteJid ?? "";
    if (!remoteJid || remoteJid.endsWith("@g.us") || remoteJid.includes("broadcast")) continue;
    const phone = normalizePhone(remoteJid.split("@")[0]);
    if (!phone) continue;
    const fromMe = Boolean(item?.key?.fromMe);
    const { type, body, mediaUrl } = extractContent(item);
    const ts = item?.messageTimestamp
      ? new Date(Number(item.messageTimestamp) * 1000).toISOString()
      : new Date().toISOString();

    const { lead, conversation } = await resolveConversation(
      connection,
      phone,
      fromMe ? null : (item?.pushName ?? null),
    );

    await saveMessage({
      conversation_id: conversation.id,
      lead_id: lead?.id ?? conversation.lead_id ?? null,
      connection_id: connection["id"],
      external_message_id: item?.key?.id ?? null,
      direction: fromMe ? "outbound" : "inbound",
      message_type: type,
      body,
      media_url: mediaUrl,
      status: fromMe ? "sent" : "delivered",
      sender_phone: fromMe ? (connection["phone_number"] ?? null) : phone,
      recipient_phone: fromMe ? phone : (connection["phone_number"] ?? null),
      ...(fromMe ? { sent_at: ts } : { received_at: ts }),
    });
  }
  return { ok: true, event };
}

// ---------- automações ----------

export async function runStageAutomations(leadId: string, stageId: string, userId?: string | null) {
  const { data: rules } = await db
    .from("automation_rules")
    .select("*")
    .eq("active", true)
    .eq("trigger_event", "stage_changed")
    .eq("action_type", "whatsapp");
  if (!rules?.length) return { sent: 0 };

  const { data: lead } = await db.from("leads").select("*").eq("id", leadId).maybeSingle();
  if (!lead) return { sent: 0 };
  const { data: owner } = lead.owner_id
    ? await db.from("profiles").select("name").eq("id", lead.owner_id).maybeSingle()
    : { data: null };

  let sent = 0;
  for (const rule of rules) {
    const condStage = rule.condition?.stage_id;
    if (condStage && condStage !== stageId) continue;
    const template = rule.action_config?.message;
    if (!template) continue;
    const first = String(lead.first_name ?? "").split(" ")[0] ?? "";
    const text = renderTemplate(template, {
      nome: [lead.first_name, lead.last_name].filter(Boolean).join(" "),
      primeiro_nome: first,
      empresa: lead.company_name,
      vendedor: owner?.name ?? "Equipe Glodeu",
    });
    try {
      await sendWhatsAppMessage({
        leadId,
        connectionId: rule.action_config?.connection_id ?? null,
        message: text,
        userId: userId ?? null,
      });
      sent += 1;
    } catch (e) {
      console.error("[whatsapp] automação falhou", e);
    }
  }
  return { sent };
}

export async function profileIdFor(authUserId?: string | null): Promise<string | null> {
  if (!authUserId) return null;
  const { data } = await db
    .from("profiles")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  return data?.id ?? null;
}

export async function createConnection(input: {
  name: string;
  instanceName: string;
  baseUrl: string;
  apiKey: string;
  responsibleUserId?: string | null | undefined;
  autoCreateLead?: boolean | undefined;
}) {
  const { data, error } = await db
    .from("whatsapp_connections")
    .insert({
      name: input.name,
      instance_name: input.instanceName,
      provider: "evolution",
      responsible_user_id: input.responsibleUserId ?? null,
      auto_create_lead: input.autoCreateLead ?? true,
      status: "desconectado",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  const { error: secretError } = await db
    .from("whatsapp_connection_secrets")
    .insert({
      connection_id: data.id,
      base_url: normalizeEvolutionBaseUrl(input.baseUrl),
      api_key: input.apiKey,
    });
  if (secretError) {
    await db.from("whatsapp_connections").delete().eq("id", data.id);
    throw new Error(secretError.message);
  }
  return data;
}

export async function updateCredentials(connectionId: string, patch: { baseUrl?: string | undefined; apiKey?: string | undefined }) {
  const values: Record<string, unknown> = {};
  if (patch.baseUrl) values["base_url"] = normalizeEvolutionBaseUrl(patch.baseUrl);
  if (patch.apiKey) values["api_key"] = patch.apiKey;
  if (!Object.keys(values).length) return;
  const { error } = await db
    .from("whatsapp_connection_secrets")
    .update(values)
    .eq("connection_id", connectionId);
  if (error) throw new Error(error.message);
}

export async function webhookInfo(connectionId: string, origin: string) {
  const conn = await getConnection(connectionId);
  const creds = await getCredentials(conn);
  return { url: webhookUrlFor(origin, creds.webhookToken) };
}

export async function refreshWebhook(connectionId: string, origin: string) {
  const conn = await getConnection(connectionId);
  const creds = await getCredentials(conn);
  await getProvider(conn["provider"]).setWebhook(creds, webhookUrlFor(origin, creds.webhookToken));
  return { url: webhookUrlFor(origin, creds.webhookToken) };
}
