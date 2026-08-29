import { createFileRoute } from "@tanstack/react-router";
import { useDeals, useLeads, useLossReasons, useProfiles, useStages } from "@/lib/crm-data";
import { KpiCard } from "@/components/crm/kpi-card";
import { PROSPECT_FUNNEL_ID, brl, pct } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios comerciais — Glodeu CRM" },
      { name: "description", content: "Conversão por etapa, motivos de perda, origem dos leads e performance por vendedor." },
      { property: "og:title", content: "Relatórios comerciais — Glodeu CRM" },
      { property: "og:description", content: "Conversão por etapa, motivos de perda, origem dos leads e performance por vendedor." },
    ],
  }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const { data: leads = [] } = useLeads();
  const { data: deals = [] } = useDeals();
  const { data: stages = [] } = useStages();
  const { data: profiles = [] } = useProfiles();
  const { data: reasons = [] } = useLossReasons();

  const won = deals.filter((d) => d["status"] === "ganho");
  const lost = deals.filter((d) => d["status"] === "perdido");
  const revenue = won.reduce((s, d) => s + Number(d["value"] ?? 0), 0);
  const closed = won.length + lost.length;

  const bySource = Object.entries(
    leads.reduce<Record<string, number>>((acc, l) => {
      const k = l["source"] ?? "Não informado";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const byReason = reasons
    .map((r) => ({ name: r["name"] as string, count: lost.filter((d) => d["loss_reason_id"] === r["id"]).length }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Receita ganha" value={brl(revenue)} tone="signal" />
        <KpiCard label="Negócios ganhos" value={won.length} />
        <KpiCard label="Negócios perdidos" value={lost.length} tone="friction" />
        <KpiCard label="Win rate" value={pct(closed ? (won.length / closed) * 100 : 0)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="panel p-5">
          <p className="label-mono">Conversão por etapa (Prospecção)</p>
          <div className="mt-4 space-y-2 text-sm">
            {stages
              .filter((s) => s["funnel_id"] === PROSPECT_FUNNEL_ID)
              .map((s) => (
                <div key={s["id"]} className="flex justify-between border-b border-border py-2 last:border-0">
                  <span>{s["name"]}</span>
                  <span className="kpi-number">{leads.filter((l) => l["stage_id"] === s["id"]).length}</span>
                </div>
              ))}
          </div>
        </section>

        <section className="panel p-5">
          <p className="label-mono">Origem dos leads</p>
          <div className="mt-4 space-y-2 text-sm">
            {bySource.map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border py-2 last:border-0">
                <span>{k}</span>
                <span className="kpi-number">{v}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <p className="label-mono">Motivos de perda</p>
          <div className="mt-4 space-y-2 text-sm">
            {byReason.map((r) => (
              <div key={r.name} className="flex justify-between border-b border-border py-2 last:border-0">
                <span>{r.name}</span>
                <span className="kpi-number text-[var(--friction)]">{r.count}</span>
              </div>
            ))}
            {byReason.length === 0 && <p className="text-muted-foreground">Sem perdas registradas.</p>}
          </div>
        </section>
      </div>

      <section className="panel p-5">
        <p className="label-mono">Performance por vendedor</p>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="label-mono text-left">
              <th className="pb-2">Vendedor</th>
              <th className="pb-2">Leads</th>
              <th className="pb-2">Ganhos</th>
              <th className="pb-2">Perdidos</th>
              <th className="pb-2 text-right">Receita</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => {
              const w = won.filter((d) => d["owner_id"] === p["id"]);
              return (
                <tr key={p["id"]} className="border-t border-border">
                  <td className="py-2">{p["name"]}</td>
                  <td>{leads.filter((l) => l["owner_id"] === p["id"]).length}</td>
                  <td>{w.length}</td>
                  <td>{lost.filter((d) => d["owner_id"] === p["id"]).length}</td>
                  <td className="kpi-number py-2 text-right text-[var(--signal)]">
                    {brl(w.reduce((s, d) => s + Number(d["value"] ?? 0), 0))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
