import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarPlus,
  CheckCircle2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LeadDialog,
  LossDialog,
  MeetingDialog,
  QualificationDialog,
  TaskDialog,
} from "@/components/crm/dialogs";
import {
  useActivities,
  useDeals,
  useLeads,
  useLossReasons,
  useMeetings,
  useProfiles,
  useStages,
  useTasks,
  updateRow,
  type Row,
} from "@/lib/crm-data";
import {
  PROSPECT_FUNNEL_ID,
  SALES_FUNNEL_ID,
  brl,
  dateTime,
  daysSince,
  leadName,
  scoreLabel,
} from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/leads/$leadId")({
  head: () => ({
    meta: [
      { title: "Detalhe do lead — Glodeu CRM" },
      { name: "description", content: "Visão 360° do lead: dados, histórico, tarefas, reuniões e qualificação." },
      { property: "og:title", content: "Detalhe do lead — Glodeu CRM" },
      { property: "og:description", content: "Visão 360° do lead na operação comercial." },
    ],
  }),
  component: LeadDetail,
});

function LeadDetail() {
  const { leadId } = Route.useParams();
  const qc = useQueryClient();
  const { data: leads = [] } = useLeads();
  const { data: stages = [] } = useStages();
  const { data: profiles = [] } = useProfiles();
  const { data: tasks = [] } = useTasks();
  const { data: meetings = [] } = useMeetings();
  const { data: deals = [] } = useDeals();
  const { data: activities = [] } = useActivities(leadId);
  const { data: reasons = [] } = useLossReasons();

  const [editing, setEditing] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [qualifying, setQualifying] = useState(false);
  const [losing, setLosing] = useState(false);

  const lead = leads.find((l) => l["id"] === leadId) as Row | undefined;
  const refresh = () =>
    ["leads", "deals", "tasks", "meetings", "activities"].forEach((k) =>
      qc.invalidateQueries({ queryKey: [k] }),
    );

  if (!lead) {
    return <p className="text-muted-foreground">Carregando lead...</p>;
  }

  const owner = profiles.find((p) => p["id"] === lead["owner_id"]);
  const stage = stages.find((s) => s["id"] === lead["stage_id"]);
  const leadTasks = tasks.filter((t) => t["lead_id"] === leadId);
  const leadMeetings = meetings.filter((m) => m["lead_id"] === leadId);
  const leadDeals = deals.filter((d) => d["lead_id"] === leadId);
  const prospectStages = stages.filter((s) => s["funnel_id"] === PROSPECT_FUNNEL_ID);
  const firstSalesStage = stages
    .filter((s) => s["funnel_id"] === SALES_FUNNEL_ID)
    .sort((a, b) => a["position"] - b["position"])[0];

  const completeTask = async (id: string) => {
    await updateRow("tasks", id, { status: "concluida", completed_at: new Date().toISOString() });
    toast.success("Tarefa concluída.");
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <Link to="/leads" className="mt-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-extrabold">{leadName(lead)}</h2>
          <p className="text-sm text-muted-foreground">
            {lead["job_title"] ?? "—"} · {lead["company_name"] ?? "Sem empresa"} · {stage?.["name"]}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button variant="outline" onClick={() => setTaskOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Tarefa
          </Button>
          <Button variant="outline" onClick={() => setMeetingOpen(true)}>
            <CalendarPlus className="mr-2 h-4 w-4" /> Reunião
          </Button>
          <Button onClick={() => setQualifying(true)}>
            <Sparkles className="mr-2 h-4 w-4" /> Qualificar e converter
          </Button>
          <Button variant="destructive" onClick={() => setLosing(true)}>
            <XCircle className="mr-2 h-4 w-4" /> Perdido
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="panel space-y-3 p-5">
            <p className="label-mono">Contato</p>
            <p className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-[var(--flow)]" /> {lead["phone"] ?? "—"}
            </p>
            <p className="flex items-center gap-2 text-sm break-all">
              <Mail className="h-4 w-4 text-[var(--flow)]" /> {lead["email"] ?? "—"}
            </p>
          </div>
          <div className="panel space-y-3 p-5">
            <p className="label-mono">Qualificação</p>
            <Info label="Responsável" value={owner?.["name"] ?? "—"} />
            <Info label="Origem" value={lead["source"] ?? "—"} />
            <Info label="Temperatura" value={String(lead["temperature"] ?? "—")} />
            <Info
              label="Score"
              value={`${lead["lead_score"] ?? 0} · ${scoreLabel(Number(lead["lead_score"] ?? 0))}`}
            />
            <Info label="Valor potencial" value={brl(lead["potential_value"])} />
            <Info label="Dias na etapa" value={`${daysSince(lead["stage_entered_at"]) ?? 0}d`} />
          </div>
        </aside>

        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="tarefas">Tarefas ({leadTasks.length})</TabsTrigger>
            <TabsTrigger value="reunioes">Reuniões ({leadMeetings.length})</TabsTrigger>
            <TabsTrigger value="negocios">Negócios ({leadDeals.length})</TabsTrigger>
            <TabsTrigger value="notas">Notas</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="panel mt-4 p-5">
            <div className="space-y-4">
              {activities.map((a) => (
                <div key={a["id"]} className="border-l-2 border-[var(--flow)]/40 pl-4">
                  <p className="text-sm font-medium">{a["title"]}</p>
                  {a["description"] && (
                    <p className="text-sm text-muted-foreground">{a["description"]}</p>
                  )}
                  <p className="label-mono mt-1">{dateTime(a["occurred_at"])}</p>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma interação registrada ainda.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tarefas" className="panel mt-4 p-5">
            <div className="space-y-3">
              {leadTasks.map((t) => (
                <div key={t["id"]} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{t["title"]}</p>
                    <p className="label-mono">
                      {dateTime(t["due_at"])} · {t["priority"]} · {t["status"]}
                    </p>
                  </div>
                  {t["status"] === "pendente" && (
                    <Button size="sm" variant="ghost" onClick={() => completeTask(t["id"])}>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Concluir
                    </Button>
                  )}
                </div>
              ))}
              {leadTasks.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma tarefa para este lead.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reunioes" className="panel mt-4 p-5">
            <div className="space-y-3">
              {leadMeetings.map((mt) => (
                <div key={mt["id"]} className="border-b border-border pb-2 last:border-0">
                  <p className="text-sm font-medium">{dateTime(mt["scheduled_at"])}</p>
                  <p className="label-mono">{mt["status"]}</p>
                  {mt["notes"] && <p className="mt-1 text-sm text-muted-foreground">{mt["notes"]}</p>}
                </div>
              ))}
              {leadMeetings.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma reunião registrada.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="negocios" className="panel mt-4 p-5">
            <div className="space-y-3">
              {leadDeals.map((d) => (
                <div key={d["id"]} className="flex justify-between border-b border-border pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{d["title"]}</p>
                    <p className="label-mono">
                      {stages.find((s) => s["id"] === d["stage_id"])?.["name"]} · {d["status"]}
                    </p>
                  </div>
                  <span className="kpi-number text-[var(--signal)]">{brl(d["value"])}</span>
                </div>
              ))}
              {leadDeals.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma oportunidade. Use “Qualificar e converter” após a reunião.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notas" className="panel mt-4 p-5">
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {lead["notes"] ?? "Sem observações."}
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <LeadDialog
        open={editing}
        onOpenChange={setEditing}
        lead={lead}
        stages={prospectStages}
        profiles={profiles}
        existingLeads={leads}
        onSaved={refresh}
      />
      <TaskDialog
        open={taskOpen}
        onOpenChange={setTaskOpen}
        leads={leads}
        profiles={profiles}
        defaults={{ lead_id: leadId, owner_id: lead["owner_id"] }}
        onSaved={refresh}
      />
      <MeetingDialog
        open={meetingOpen}
        onOpenChange={setMeetingOpen}
        lead={lead}
        profiles={profiles}
        onSaved={refresh}
      />
      <QualificationDialog
        open={qualifying}
        onOpenChange={setQualifying}
        lead={lead}
        meeting={leadMeetings[0] ?? null}
        profiles={profiles}
        salesFunnelId={SALES_FUNNEL_ID}
        salesStageId={firstSalesStage?.["id"]}
        onDone={refresh}
      />
      <LossDialog
        open={losing}
        onOpenChange={setLosing}
        table="leads"
        rowId={leadId}
        reasons={reasons}
        onDone={refresh}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
