import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeadDialog, Pick } from "@/components/crm/dialogs";
import { useLeads, useProfiles, useStages } from "@/lib/crm-data";
import { PROSPECT_FUNNEL_ID, brl, dateShort, daysSince, leadName } from "@/lib/crm";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/leads/")({
  head: () => ({
    meta: [
      { title: "Leads — Glodeu CRM" },
      { name: "description", content: "Base completa de leads com filtros por etapa, responsável, origem e temperatura." },
      { property: "og:title", content: "Leads — Glodeu CRM" },
      { property: "og:description", content: "Base completa de leads da operação comercial." },
    ],
  }),
  component: LeadsPage,
});

function LeadsPage() {
  const qc = useQueryClient();
  const { data: leads = [] } = useLeads();
  const { data: stages = [] } = useStages();
  const { data: profiles = [] } = useProfiles();
  const [term, setTerm] = useState("");
  const [stage, setStage] = useState("all");
  const [owner, setOwner] = useState("all");
  const [creating, setCreating] = useState(false);

  const prospectStages = stages.filter((s) => s["funnel_id"] === PROSPECT_FUNNEL_ID);

  const rows = useMemo(() => {
    const t = term.toLowerCase();
    return leads.filter(
      (l) =>
        (stage === "all" || l["stage_id"] === stage) &&
        (owner === "all" || l["owner_id"] === owner) &&
        (!t ||
          leadName(l).toLowerCase().includes(t) ||
          String(l["company_name"] ?? "").toLowerCase().includes(t) ||
          String(l["email"] ?? "").toLowerCase().includes(t)),
    );
  }, [leads, term, stage, owner]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por nome, empresa ou e-mail"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="max-w-xs"
        />
        <div className="w-48">
          <Pick
            value={stage}
            onChange={setStage}
            options={[{ value: "all", label: "Todas as etapas" }, ...prospectStages.map((s) => ({ value: s["id"], label: s["name"] }))]}
          />
        </div>
        <div className="w-52">
          <Pick
            value={owner}
            onChange={setOwner}
            options={[{ value: "all", label: "Todos os responsáveis" }, ...profiles.map((p) => ({ value: p["id"], label: p["name"] }))]}
          />
        </div>
        <Button className="ml-auto" onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo lead
        </Button>
      </div>

      <div className="panel overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="label-mono border-b border-border text-left">
              <th className="p-3">Lead</th>
              <th className="p-3">Empresa</th>
              <th className="p-3">Etapa</th>
              <th className="p-3">Responsável</th>
              <th className="p-3">Temp.</th>
              <th className="p-3">Parado</th>
              <th className="p-3 text-right">Potencial</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => {
              const idle = daysSince(l["stage_entered_at"] ?? l["updated_at"]) ?? 0;
              return (
                <tr key={l["id"]} className="border-b border-border last:border-0 hover:bg-secondary/40">
                  <td className="p-3">
                    <Link
                      to="/leads/$leadId"
                      params={{ leadId: l["id"] }}
                      className="font-medium hover:text-[var(--signal)]"
                    >
                      {leadName(l)}
                    </Link>
                    <p className="text-xs text-muted-foreground">{l["email"] ?? l["phone"] ?? "—"}</p>
                  </td>
                  <td className="p-3">{l["company_name"] ?? "—"}</td>
                  <td className="p-3">{stages.find((s) => s["id"] === l["stage_id"])?.["name"] ?? "—"}</td>
                  <td className="p-3">{profiles.find((p) => p["id"] === l["owner_id"])?.["name"] ?? "—"}</td>
                  <td className="p-3 capitalize">{l["temperature"] ?? "—"}</td>
                  <td className={cn("p-3", idle >= 7 && "text-[var(--friction)]")}>
                    {idle}d · {dateShort(l["stage_entered_at"])}
                  </td>
                  <td className="kpi-number p-3 text-right text-[var(--signal)]">
                    {brl(l["potential_value"])}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  Nenhum lead encontrado com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <LeadDialog
        open={creating}
        onOpenChange={setCreating}
        stages={prospectStages}
        profiles={profiles}
        existingLeads={leads}
        defaults={{ funnel_id: PROSPECT_FUNNEL_ID, stage_id: prospectStages[0]?.["id"] }}
        onSaved={() => qc.invalidateQueries({ queryKey: ["leads"] })}
      />
    </div>
  );
}
