import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_leads",
  title: "Listar leads",
  description: "Lista leads do CRM Glodeu, com filtro opcional por status, temperatura ou busca textual.",
  inputSchema: {
    search: z.string().trim().min(1).optional().describe("Texto para buscar no nome ou empresa do lead."),
    status: z.string().trim().min(1).optional().describe("Filtra por status do lead (ex.: aberto, ganho, perdido)."),
    limit: z.number().int().min(1).max(100).default(20).describe("Quantidade máxima de leads retornados."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("leads")
      .select("id, first_name, last_name, company_name, email, phone, status, temperature, lead_score, potential_value, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (status) query = query.eq("status", status);
    if (search) query = query.or(`first_name.ilike.%${search}%,company_name.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { leads: data ?? [] },
    };
  },
});
