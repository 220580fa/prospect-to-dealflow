import { createFileRoute } from "@tanstack/react-router";
import { useActivities, useLeads } from "@/lib/crm-data";
import { dateTime, leadName } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/atividades")({
  head: () => ({
    meta: [
      { title: "Atividades — Glodeu CRM" },
      { name: "description", content: "Histórico completo de interações, mudanças de etapa e registros do time comercial." },
      { property: "og:title", content: "Atividades — Glodeu CRM" },
      { property: "og:description", content: "Histórico completo de interações, mudanças de etapa e registros do time comercial." },
    ],
  }),
  component: AtividadesPage,
});

function AtividadesPage() {
  const { data: activities = [] } = useActivities();
  const { data: leads = [] } = useLeads();

  return (
    <div className="panel p-5">
      <p className="label-mono">Últimas atividades</p>
      <div className="mt-4 space-y-4">
        {activities.map((a) => (
          <div key={a["id"]} className="border-l-2 border-[var(--flow)]/40 pl-4">
            <p className="text-sm font-medium">{a["title"]}</p>
            <p className="text-sm text-muted-foreground">
              {leadName(leads.find((l) => l["id"] === a["lead_id"]) ?? {}) || "—"}
              {a["description"] ? ` · ${a["description"]}` : ""}
            </p>
            <p className="label-mono mt-1">{dateTime(a["occurred_at"])}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
