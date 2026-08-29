import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listLeadsTool from "./tools/list-leads";
import createLeadTool from "./tools/create-lead";
import listTasksTool from "./tools/list-tasks";
import createTaskTool from "./tools/create-task";
import pipelineSummaryTool from "./tools/pipeline-summary";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "sales-navigator-pro",
  title: "Sales Navigator Pro",
  version: "0.1.0",
  instructions:
    "Ferramentas do CRM Glodeu (Sales Navigator Pro). Use list_leads e list_tasks para consultar a operação comercial, create_lead e create_task para registrar novas oportunidades e follow-ups, e pipeline_summary para o panorama de negociações. Todas as ações acontecem como o usuário autenticado.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  // SDK types trip exactOptionalPropertyTypes on the optional outputSchema field.
  tools: [listLeadsTool, createLeadTool, listTasksTool, createTaskTool, pipelineSummaryTool] as never,
});
