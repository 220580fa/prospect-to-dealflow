import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_task",
  title: "Criar tarefa",
  description: "Cria uma tarefa de follow-up no CRM, opcionalmente vinculada a um lead.",
  inputSchema: {
    title: z.string().trim().min(1).describe("Título da tarefa."),
    due_at: z.string().trim().min(1).describe("Data/hora de vencimento em ISO 8601."),
    description: z.string().trim().optional().describe("Detalhes da tarefa."),
    type: z.string().trim().optional().describe("Tipo da tarefa (ex.: ligacao, email, reuniao)."),
    lead_id: z.string().uuid().optional().describe("ID do lead relacionado."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, due_at, description, type, lead_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const payload: Record<string, unknown> = { title, due_at };
    if (description) payload['description'] = description;
    if (type) payload['type'] = type;
    if (lead_id) payload['lead_id'] = lead_id;
    const { data, error } = await supabase.from("tasks").insert(payload).select().single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { task: data },
    };
  },
});
