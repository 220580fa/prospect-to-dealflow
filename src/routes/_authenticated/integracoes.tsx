import { createFileRoute } from "@tanstack/react-router";
import { useAutomations } from "@/lib/crm-data";

export const Route = createFileRoute("/_authenticated/integracoes")({
  head: () => ({
    meta: [
      { title: "Integrações e automações — Glodeu CRM" },
      { name: "description", content: "Regras automáticas de tarefas, alertas e distribuição de leads." },
      { property: "og:title", content: "Integrações e automações — Glodeu CRM" },
      { property: "og:description", content: "Regras automáticas de tarefas, alertas e distribuição de leads." },
    ],
  }),
  component: IntegracoesPage,
});

function IntegracoesPage() {
  const { data: rules = [] } = useAutomations();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Automações internas do CRM. Integrações externas (WhatsApp, e-mail, formulários) podem ser
        conectadas depois via endpoints públicos do próprio sistema.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {rules.map((r) => (
          <div key={r["id"]} className="panel p-5">
            <p className="font-display text-sm font-bold">{r["name"]}</p>
            <p className="label-mono mt-1">
              {r["trigger_type"] ?? "gatilho"} → {r["action_type"] ?? "ação"}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{r["description"] ?? ""}</p>
            <p className="label-mono mt-3">{r["active"] ? "Ativa" : "Inativa"}</p>
          </div>
        ))}
        {rules.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma automação configurada.</p>
        )}
      </div>
    </div>
  );
}
