import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLeads, useMeetings, useProfiles, updateRow } from "@/lib/crm-data";
import { dateTime, leadName } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda de reuniões — Glodeu CRM" },
      { name: "description", content: "Reuniões agendadas, realizadas, remarcadas e no-show do time comercial." },
      { property: "og:title", content: "Agenda de reuniões — Glodeu CRM" },
      { property: "og:description", content: "Reuniões agendadas, realizadas, remarcadas e no-show do time comercial." },
    ],
  }),
  component: AgendaPage,
});

function AgendaPage() {
  const qc = useQueryClient();
  const { data: meetings = [] } = useMeetings();
  const { data: leads = [] } = useLeads();
  const { data: profiles = [] } = useProfiles();

  const setStatus = async (id: string, status: string) => {
    await updateRow("meetings", id, { status });
    toast.success("Reunião atualizada.");
    qc.invalidateQueries({ queryKey: ["meetings"] });
  };

  const upcoming = meetings.filter((m) => m["status"] === "agendada");
  const past = meetings.filter((m) => m["status"] !== "agendada");

  const Row = ({ m, actions }: { m: any; actions?: boolean }) => (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3 last:border-0">
      <div>
        <p className="text-sm font-medium">
          {leadName(leads.find((l) => l["id"] === m["lead_id"]) ?? {}) || "Reunião"}
        </p>
        <p className="label-mono mt-1">
          {dateTime(m["scheduled_at"])} · {profiles.find((p) => p["id"] === m["owner_id"])?.["name"] ?? "—"} · {m["status"]}
        </p>
      </div>
      {actions && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setStatus(m["id"], "realizada")}>
            Realizada
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setStatus(m["id"], "no_show")}>
            No-show
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setStatus(m["id"], "cancelada")}>
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="panel p-5">
        <p className="label-mono">Próximas reuniões · {upcoming.length}</p>
        <div className="mt-3">
          {upcoming.map((m) => (
            <Row key={m["id"]} m={m} actions />
          ))}
          {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma reunião agendada.</p>}
        </div>
      </section>
      <section className="panel p-5">
        <p className="label-mono">Histórico · {past.length}</p>
        <div className="mt-3">
          {past.slice(0, 30).map((m) => (
            <Row key={m["id"]} m={m} />
          ))}
        </div>
      </section>
    </div>
  );
}
