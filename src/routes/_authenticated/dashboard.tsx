import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  useDeals,
  useLeads,
  useMeetings,
  useProfiles,
  useStages,
  useTasks,
} from "@/lib/crm-data";
import { KpiCard } from "@/components/crm/kpi-card";
import { Pick } from "@/components/crm/dialogs";
import { PROSPECT_FUNNEL_ID, SALES_FUNNEL_ID, brl, compact, dateTime, leadName, pct } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard comercial — Glodeu CRM" },
      { name: "description", content: "Pipeline, conversão, forecast e performance do time comercial." },
      { property: "og:title", content: "Dashboard comercial — Glodeu CRM" },
      { property: "og:description", content: "Pipeline, conversão, forecast e performance do time." },
    ],
  }),
  component: Dashboard,
});

const PERIODS = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
  { value: "365", label: "Últimos 12 meses" },
];

function Dashboard() {
  const [period, setPeriod] = useState("30");
  const [owner, setOwner] = useState("all");

  const { data: leads = [] } = useLeads();
  const { data: deals = [] } = useDeals();
  const { data: tasks = [] } = useTasks();
  const { data: meetings = [] } = useMeetings();
  const { data: stages = [] } = useStages();
  const { data: profiles = [] } = useProfiles();

  const since = Date.now() - Number(period) * 86400000;
  const inPeriod = (d?: string | null) => (d ? new Date(d).getTime() >= since : false);
  const byOwner = (r: Record<string, any>) => owner === "all" || r["owner_id"] === owner;

  const m = useMemo(() => {
    const fLeads = leads.filter(byOwner);
    const fDeals = deals.filter(byOwner);
    const open = fDeals.filter((d) => d["status"] === "aberto");
    const won = fDeals.filter((d) => d["status"] === "ganho" && inPeriod(d["won_at"]));
    const lost = fDeals.filter((d) => d["status"] === "perdido" && inPeriod(d["lost_at"]));
    const pipeline = open.reduce((s, d) => s + Number(d["value"] ?? 0), 0);
    const forecast = open.reduce(
      (s, d) => s + (Number(d["value"] ?? 0) * Number(d["probability"] ?? 0)) / 100,
      0,
    );
    const revenue = won.reduce((s, d) => s + Number(d["value"] ?? 0), 0);
    const closed = won.length + lost.length;
    return {
      newLeads: fLeads.filter((l) => inPeriod(l["created_at"])).length,
      activeLeads: fLeads.filter((l) => l["status"] === "ativo").length,
      pipeline,
      forecast,
      revenue,
      won: won.length,
      lost: lost.length,
      winRate: closed ? (won.length / closed) * 100 : 0,
      ticket: won.length ? revenue / won.length : 0,
      overdue: tasks.filter(
        (t) => byOwner(t) && t["status"] === "pendente" && new Date(t["due_at"]) < new Date(),
      ).length,
      meetingsDone: meetings.filter((x) => byOwner(x) && x["status"] === "realizada").length,
      noShow: meetings.filter((x) => byOwner(x) && x["status"] === "no_show").length,
      upcoming: meetings
        .filter((x) => byOwner(x) && x["status"] === "agendada" && new Date(x["scheduled_at"]) > new Date())
        .sort((a, b) => +new Date(a["scheduled_at"]) - +new Date(b["scheduled_at"]))
        .slice(0, 5),
    };
  }, [leads, deals, tasks, meetings, owner, period]);

  const prospectStages = stages.filter((s) => s["funnel_id"] === PROSPECT_FUNNEL_ID);
  const salesStages = stages.filter((s) => s["funnel_id"] === SALES_FUNNEL_ID);
  const maxStage = Math.max(
    1,
    ...prospectStages.map((s) => leads.filter((l) => l["stage_id"] === s["id"]).length),
  );

  const ranking = profiles
    .map((p) => {
      const w = deals.filter((d) => d["owner_id"] === p["id"] && d["status"] === "ganho");
      return {
        name: p["name"] as string,
        revenue: w.reduce((s, d) => s + Number(d["value"] ?? 0), 0),
        deals: w.length,
        leads: leads.filter((l) => l["owner_id"] === p["id"]).length,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-48">
          <Pick value={period} onChange={setPeriod} options={PERIODS} />
        </div>
        <div className="w-56">
          <Pick
            value={owner}
            onChange={setOwner}
            options={[{ value: "all", label: "Todos os vendedores" }, ...profiles.map((p) => ({ value: p["id"], label: p["name"] }))]}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Novos leads" value={m.newLeads} hint={`${m.activeLeads} leads ativos`} tone="flow" />
        <KpiCard label="Pipeline aberto" value={brl(m.pipeline)} hint={`Forecast ${brl(m.forecast)}`} tone="signal" />
        <KpiCard label="Receita ganha" value={brl(m.revenue)} hint={`${m.won} negócios fechados`} tone="signal" />
        <KpiCard label="Taxa de conversão" value={pct(m.winRate)} hint={`${m.lost} perdidos no período`} />
        <KpiCard label="Ticket médio" value={brl(m.ticket)} />
        <KpiCard label="Reuniões realizadas" value={m.meetingsDone} hint={`${m.noShow} no-show`} tone="flow" />
        <KpiCard label="Tarefas atrasadas" value={m.overdue} tone="friction" />
        <KpiCard label="Negócios em aberto" value={deals.filter((d) => d["status"] === "aberto").length} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="panel p-5">
          <p className="label-mono">Funil de Prospecção</p>
          <div className="mt-4 space-y-3">
            {prospectStages.map((s) => {
              const count = leads.filter((l) => l["stage_id"] === s["id"] && byOwner(l)).length;
              return (
                <div key={s["id"]}>
                  <div className="flex justify-between text-sm">
                    <span>{s["name"]}</span>
                    <span className="kpi-number">{count}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(count / maxStage) * 100}%`,
                        backgroundColor: s["color"] ?? "var(--flow)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel p-5">
          <p className="label-mono">Funil de Venda — valor por etapa</p>
          <div className="mt-4 space-y-3">
            {salesStages.map((s) => {
              const ds = deals.filter((d) => d["stage_id"] === s["id"] && byOwner(d));
              const v = ds.reduce((acc, d) => acc + Number(d["value"] ?? 0), 0);
              return (
                <div key={s["id"]} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
                  <span>{s["name"]}</span>
                  <span className="text-muted-foreground">
                    {ds.length} · <span className="kpi-number text-[var(--signal)]">{compact(v)}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="panel p-5">
          <p className="label-mono">Ranking de vendedores</p>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="label-mono text-left">
                <th className="pb-2">Vendedor</th>
                <th className="pb-2">Leads</th>
                <th className="pb-2">Ganhos</th>
                <th className="pb-2 text-right">Receita</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r) => (
                <tr key={r.name} className="border-t border-border">
                  <td className="py-2">{r.name}</td>
                  <td>{r.leads}</td>
                  <td>{r.deals}</td>
                  <td className="kpi-number py-2 text-right text-[var(--signal)]">{brl(r.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel p-5">
          <p className="label-mono">Próximas reuniões</p>
          <div className="mt-4 space-y-3">
            {m.upcoming.map((mt) => {
              const lead = leads.find((l) => l["id"] === mt["lead_id"]);
              return (
                <div key={mt["id"]} className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-0">
                  <span>{lead ? leadName(lead) : "Reunião"}</span>
                  <span className="text-muted-foreground">{dateTime(mt["scheduled_at"])}</span>
                </div>
              );
            })}
            {m.upcoming.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma reunião agendada.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
