import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Funil "Prospecção" / etapa "Triagem"
const FUNNEL_PROSPECCAO = "11111111-1111-4111-8111-111111111111";
const STAGE_TRIAGEM = "f907367c-87e5-44ef-bbea-1ae48194d2f1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-form-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const str = z.string().trim().min(1).max(300).optional();

const schema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  first_name: str,
  last_name: str,
  email: z.string().trim().email().max(200).optional(),
  phone: str,
  whatsapp: str,
  company_name: str,
  job_title: str,
  website: str,
  segment: str,
  city: str,
  state: str,
  source: str,
  campaign: str,
  product_interest: str,
  message: z.string().trim().max(4000).optional(),
  notes: z.string().trim().max(4000).optional(),
  // honeypot anti-spam: se preenchido, descartamos silenciosamente
  _hp: z.string().optional(),
});

// aceita nomes de campos em português usados por formulários do site
const ALIASES: Record<string, string> = {
  nome: "name",
  "nome-completo": "name",
  nome_completo: "name",
  fullname: "name",
  "full-name": "name",
  primeiro_nome: "first_name",
  sobrenome: "last_name",
  "e-mail": "email",
  mail: "email",
  telefone: "phone",
  celular: "phone",
  fone: "phone",
  tel: "phone",
  zap: "whatsapp",
  empresa: "company_name",
  company: "company_name",
  cargo: "job_title",
  site: "website",
  segmento: "segment",
  cidade: "city",
  estado: "state",
  uf: "state",
  origem: "source",
  campanha: "campaign",
  interesse: "product_interest",
  produto: "product_interest",
  assunto: "product_interest",
  mensagem: "message",
  msg: "message",
  comentario: "message",
  "comentário": "message",
  observacoes: "notes",
  "observações": "notes",
};

function normalize(input: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined || v === null || v === "") continue;
    const key = ALIASES[k.trim().toLowerCase()] ?? k.trim().toLowerCase();
    out[key] = typeof v === "string" ? v : String(v);
  }
  return out;
}

export const Route = createFileRoute("/api/public/lead-capture")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      GET: async () =>
        json({ ok: true, endpoint: "lead-capture", methods: ["POST"], status: "online" }),
      POST: async ({ request }) => {
        const expectedToken = process.env["GLODEU_FORM_TOKEN"];
        if (expectedToken && request.headers.get("x-form-token") !== expectedToken) {
          return json({ error: "Token inválido" }, 401);
        }

        // Post nativo de <form> (sem fetch): responder com redirect em vez de JSON
        const accept = request.headers.get("accept") ?? "";
        const wantsHtml = accept.includes("text/html");

        let raw: Record<string, unknown> = {};
        const body = await request.text().catch(() => "");
        if (body) {
          try {
            const parsedJson = JSON.parse(body);
            if (parsedJson && typeof parsedJson === "object") raw = parsedJson as Record<string, unknown>;
          } catch {
            const params = new URLSearchParams(body);
            if ([...params.keys()].length > 0) {
              raw = Object.fromEntries(params.entries());
            } else {
              // multipart/form-data
              const boundary = (request.headers.get("content-type") ?? "").split("boundary=")[1];
              if (boundary) {
                for (const part of body.split(`--${boundary}`)) {
                  const m = part.match(/name="([^"]+)"\r?\n\r?\n([\s\S]*?)\r?\n?$/);
                  if (m && m[1]) raw[m[1]] = (m[2] ?? "").trim();
                }
              }
            }
          }
        }
        if (Object.keys(raw).length === 0) {
          const qs = new URL(request.url).searchParams;
          raw = Object.fromEntries(qs.entries());
        }

        const parsed = schema.safeParse(normalize(raw));
        if (!parsed.success) {
          return json({ error: "Dados inválidos", details: parsed.error.flatten() }, 400);
        }
        const d = parsed.data;

        if (d._hp) return json({ ok: true });


        const fullName = (d.first_name ?? d.name ?? "").trim();
        if (!fullName && !d.email && !d.phone) {
          return json({ error: "Informe ao menos nome, e-mail ou telefone" }, 400);
        }

        const parts = fullName.split(/\s+/);
        const firstName = parts[0] || d.company_name || d.email || "Contato";
        const lastName = d.last_name ?? (parts.length > 1 ? parts.slice(1).join(" ") : null);

        const notes = [d.message, d.notes].filter(Boolean).join("\n\n") || null;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const db = supabaseAdmin as any;

        const { data: lead, error } = await db
          .from("leads")
          .insert({
            first_name: firstName,
            last_name: lastName,
            email: d.email ?? null,
            phone: d.phone ?? null,
            whatsapp: d.whatsapp ?? d.phone ?? null,
            company_name: d.company_name ?? null,
            job_title: d.job_title ?? null,
            website: d.website ?? null,
            segment: d.segment ?? null,
            city: d.city ?? null,
            state: d.state ?? null,
            source: d.source ?? "site glodeu.com.br",
            campaign: d.campaign ?? null,
            product_interest: d.product_interest ?? null,
            notes,
            funnel_id: FUNNEL_PROSPECCAO,
            stage_id: STAGE_TRIAGEM,
            temperature: "morno",
            status: "ativo",
            last_interaction_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (error) return json({ error: error.message }, 500);

        await db.from("activities").insert({
          lead_id: lead.id,
          type: "nota",
          title: "Formulário recebido do site glodeu.com.br",
          description: notes,
          occurred_at: new Date().toISOString(),
        });

        return json({ ok: true, lead_id: lead.id }, 201);
      },
    },
  },
});
