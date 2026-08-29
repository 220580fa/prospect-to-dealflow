import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "pipeline_summary",
  title: "Resumo do pipeline",
  description: "Resume as negociações do funil: total aberto, ganho, perdido e valores em BRL.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase.from("deals").select("status, value");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const rows = (data ?? []) as Array<{ status: string; value: number | null }>;
    const summary = rows.reduce<Record<string, { count: number; value: number }>>((acc, row) => {
      const key = row.status ?? "desconhecido";
      const bucket = acc[key] ?? { count: 0, value: 0 };
      bucket.count += 1;
      bucket.value += Number(row.value ?? 0);
      acc[key] = bucket;
      return acc;
    }, {});
    const total = rows.reduce((sum, row) => sum + Number(row.value ?? 0), 0);

    return {
      content: [{ type: "text", text: JSON.stringify({ total_deals: rows.length, total_value: total, by_status: summary }) }],
      structuredContent: { total_deals: rows.length, total_value: total, by_status: summary },
    };
  },
});
