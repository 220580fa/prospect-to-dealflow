import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_lead",
  title: "Criar lead",
  description: "Cria um novo lead no CRM Glodeu.",
  inputSchema: {
    first_name: z.string().trim().min(1).describe("Nome do contato principal."),
    last_name: z.string().trim().optional().describe("Sobrenome do contato."),
    company_name: z.string().trim().optional().describe("Empresa do lead."),
    email: z.string().trim().email().optional().describe("E-mail de contato."),
    phone: z.string().trim().optional().describe("Telefone ou WhatsApp."),
    source: z.string().trim().optional().describe("Origem do lead (ex.: indicação, inbound)."),
    potential_value: z.number().nonnegative().optional().describe("Valor potencial estimado em BRL."),
    notes: z.string().trim().optional().describe("Observações iniciais."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase.from("leads").insert(input).select().single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { lead: data },
    };
  },
});
