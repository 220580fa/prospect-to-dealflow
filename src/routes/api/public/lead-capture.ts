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

export const Route = createFileRoute("/api/public/lead-capture")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        const expectedToken = process.env["GLODEU_FORM_TOKEN"];
        if (expectedToken && request.headers.get("x-form-token") !== expectedToken) {
          return json({ error: "Token inválido" }, 401);
        }

        let raw: unknown;
        const contentType = request.headers.get("content-type") ?? "";
        try {
          if (contentType.includes("application/json")) {
            raw = await request.json();
          } else {
            raw = Object.fromEntries((await request.formData()).entries());
          }
        } catch {
          return json({ error: "Payload inválido" }, 400);
        }

        const parsed = schema.safeParse(raw);
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
