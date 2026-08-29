import { createFileRoute } from "@tanstack/react-router";
import { useDeals, useGoals, useProfiles } from "@/lib/crm-data";
import { brl, pct } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({
    meta: [
      { title: "Metas comerciais — Glodeu CRM" },
      { name: "description", content: "Metas de receita e atividades por vendedor com acompanhamento de atingimento." },
      { property: "og:title", content: "Metas comerciais — Glodeu CRM" },
      { property: "og:description", content: "Metas de receita e atividades por vendedor com acompanhamento de atingimento." },
    ],
  }),
  component: MetasPage,
});

function MetasPage() {
  const { data: goals = [] } = useGoals();
  const { data: deals = [] } = useDeals();
  const { data: profiles = [] } = useProfiles();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {goals.map((g) => {
        const start = new Date(g["period_start"]).getTime();
        const end = new Date(g["period_end"]).getTime();
        const realized = deals
          .filter(
            (d) =>
              d["status"] === "ganho" &&
              d["owner_id"] === g["owner_id"] &&
              d["won_at"] &&
              new Date(d["won_at"]).getTime() >= start &&
              new Date(d["won_at"]).getTime() <= end,
          )
          .reduce((s, d) => s + Number(d["value"] ?? 0), 0);
        const target = Number(g["target"] ?? 0);
        const ratio = target ? (realized / target) * 100 : 0;
        return (
          <div key={g["id"]} className="panel p-5">
            <p className="label-mono">{g["metric"]} · {g["period_type"]}</p>
            <p className="mt-2 text-sm font-semibold">
              {profiles.find((p) => p["id"] === g["owner_id"])?.["name"] ?? "Time"}
            </p>
            <p className="kpi-number mt-3 text-2xl text-[var(--signal)]">{brl(realized)}</p>
            <p className="text-xs text-muted-foreground">meta {brl(target)} · {pct(ratio)}</p>
            <div className="mt-3 h-2 rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-[var(--signal)]"
                style={{ width: `${Math.min(100, ratio)}%` }}
              />
            </div>
          </div>
        );
      })}
      {goals.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma meta cadastrada.</p>}
    </div>
  );
}
