import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard, idleDaysOf, type KanbanCard } from "@/components/crm/kanban";
import { LeadDialog, LossDialog, Pick, QualificationDialog } from "@/components/crm/dialogs";
import {
  useDeals,
  useLeads,
  useLossReasons,
  useMeetings,
  useProfiles,
  useStages,
  useTasks,
  updateRow,
  logActivity,
  type Row,
} from "@/lib/crm-data";
import { PROSPECT_FUNNEL_ID, SALES_FUNNEL_ID, brl, compact, leadName } from "@/lib/crm";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/funis")({
  head: () => ({
    meta: [
      { title: "Funis de Prospecção e Venda — Glodeu CRM" },
      { name: "description", content: "Kanban de prospecção e venda com arrastar e soltar, alertas de estagnação e qualificação obrigatória." },
      { property: "og:title", content: "Funis de Prospecção e Venda — Glodeu CRM" },
      { property: "og:description", content: "Kanban comercial com qualificação pós-reunião obrigatória." },
    ],
  }),
  component: FunisPage,
});

function FunisPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [funnel, setFunnel] = useState<string>(PROSPECT_FUNNEL_ID);
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [newLead, setNewLead] = useState(false);
  const [qualifyLead, setQualifyLead] = useState<Row | null>(null);
  const [lossTarget, setLossTarget] = useState<{ table: "leads" | "deals"; id: string } | null>(null);

  const { data: stages = [] } = useStages();
  const { data: leads = [] } = useLeads();
  const { data: deals = [] } = useDeals();
  const { data: tasks = [] } = useTasks();
  const { data: meetings = [] } = useMeetings();
  const { data: profiles = [] } = useProfiles();
  const { data: reasons = [] } = useLossReasons();

  const isProspect = funnel === PROSPECT_FUNNEL_ID;
  const funnelStages = useMemo(
    () => stages.filter((s) => s["funnel_id"] === funnel).sort((a, b) => a["position"] - b["position"]),
    [stages, funnel],
  );
  const sqlStage = stages.find((s) => s["funnel_id"] === PROSPECT_FUNNEL_ID && s["name"] === "SQL");
  const firstSalesStage = stages
    .filter((s) => s["funnel_id"] === SALES_FUNNEL_ID)
    .sort((a, b) => a["position"] - b["position"])[0];

  const refresh = () => {
    ["leads", "deals", "tasks", "meetings", "activities", "meeting_qualifications"].forEach((k) =>
      qc.invalidateQueries({ queryKey: [k] }),
    );
  };

  const overdueByLead = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t["status"] === "pendente" && new Date(t["due_at"]) < new Date() && t["lead_id"])
        set.add(t["lead_id"]);
    });
    return set;
  }, [tasks]);

  const cards: KanbanCard[] = useMemo(() => {
    const source = isProspect
      ? leads.filter((l) => l["funnel_id"] === funnel && l["status"] !== "perdido" && l["status"] !== "convertido")
      : deals.filter((d) => d["funnel_id"] === funnel && d["status"] === "aberto");
    return source
      .filter((r) => ownerFilter === "all" || r["owner_id"] === ownerFilter)
      .map((r) => ({
        id: r["id"],
        stageId: r["stage_id"],
        title: isProspect ? leadName(r) || "Lead" : r["title"],
        subtitle: isProspect ? (r["company_name"] ?? r["job_title"] ?? "") : (r["source"] ?? ""),
        value: Number((isProspect ? r["potential_value"] : r["value"]) ?? 0),
        owner: profiles.find((p) => p["id"] === r["owner_id"])?.["name"]?.split(" ")[0],
        temperature: r["temperature"] ?? null,
        score: isProspect ? (r["lead_score"] ?? null) : (r["probability"] ?? null),
        idleDays: idleDaysOf(r),
        hasOverdueTask: overdueByLead.has(isProspect ? r["id"] : r["lead_id"]),
        isNew:
          isProspect &&
          Date.now() - new Date(r["created_at"]).getTime() < 1000 * 60 * 60 * 48 &&
          !r["last_interaction_at"] === false
            ? Date.now() - new Date(r["created_at"]).getTime() < 1000 * 60 * 60 * 48
            : isProspect && Date.now() - new Date(r["created_at"]).getTime() < 1000 * 60 * 60 * 48,
        raw: r,
      }));
  }, [isProspect, leads, deals, funnel, ownerFilter, profiles, overdueByLead]);

  const totals = cards.reduce((s, c) => s + c.value, 0);

  const onMove = async (card: KanbanCard, stageId: string) => {
    if (isProspect && sqlStage && stageId === sqlStage["id"]) {
      const done = meetings.some((m) => m["lead_id"] === card.id && m["status"] === "realizada");
      if (!done) {
        toast.info("Registre a reunião realizada e responda a qualificação para avançar para SQL.");
      }
      setQualifyLead(card.raw);
      return;
    }
    const table = isProspect ? "leads" : "deals";
    const stage = stages.find((s) => s["id"] === stageId);
    try {
      if (!isProspect && stage?.["name"] === "Ganho") {
        await updateRow("deals", card.id, {
          stage_id: stageId,
          status: "ganho",
          won_at: new Date().toISOString(),
          stage_entered_at: new Date().toISOString(),
        });
      } else {
        await updateRow(table, card.id, {
          stage_id: stageId,
          stage_entered_at: new Date().toISOString(),
        });
      }
      await logActivity({
        [isProspect ? "lead_id" : "deal_id"]: card.id,
        type: "mudanca_etapa",
        title: `Movido para ${stage?.["name"]}`,
      });
      toast.success(`Movido para ${stage?.["name"]}.`);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível mover o card.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={funnel} onValueChange={setFunnel}>
          <TabsList>
            <TabsTrigger value={PROSPECT_FUNNEL_ID}>Prospecção</TabsTrigger>
            <TabsTrigger value={SALES_FUNNEL_ID}>Funil de Venda</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="w-56">
          <Pick
            value={ownerFilter}
            onChange={setOwnerFilter}
            options={[
              { value: "all", label: "Todos os vendedores" },
              ...profiles.map((p) => ({ value: p["id"], label: p["name"] })),
            ]}
          />
        </div>
        <div className="label-mono ml-auto">
          {cards.length} cards · {compact(totals)} ({brl(totals)})
        </div>
        {isProspect && (
          <Button onClick={() => setNewLead(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo lead
          </Button>
        )}
      </div>

      <KanbanBoard
        stages={funnelStages}
        cards={cards}
        onOpen={(c) =>
          navigate({
            to: "/leads/$leadId",
            params: { leadId: isProspect ? c.id : (c.raw["lead_id"] ?? c.id) },
          })
        }
        onMove={onMove}
      />

      <LeadDialog
        open={newLead}
        onOpenChange={setNewLead}
        stages={funnelStages}
        profiles={profiles}
        existingLeads={leads}
        defaults={{ funnel_id: PROSPECT_FUNNEL_ID, stage_id: funnelStages[0]?.["id"] }}
        onSaved={refresh}
      />

      <QualificationDialog
        open={!!qualifyLead}
        onOpenChange={(v) => !v && setQualifyLead(null)}
        lead={qualifyLead}
        meeting={meetings.find((m) => m["lead_id"] === qualifyLead?.["id"]) ?? null}
        profiles={profiles}
        salesFunnelId={SALES_FUNNEL_ID}
        salesStageId={firstSalesStage?.["id"]}
        onDone={refresh}
      />

      <LossDialog
        open={!!lossTarget}
        onOpenChange={(v) => !v && setLossTarget(null)}
        table={lossTarget?.table ?? "leads"}
        rowId={lossTarget?.id ?? null}
        reasons={reasons}
        onDone={refresh}
      />
    </div>
  );
}
