import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WhatsAppChat } from "@/components/crm/whatsapp-chat";
import { Pick } from "@/components/crm/dialogs";
import {
  useWhatsAppConnections,
  useWhatsAppConversations,
  useWhatsAppRealtime,
} from "@/lib/whatsapp-data";
import { formatPhone } from "@/lib/whatsapp/shared";
import { useCurrentProfile, useLeads, useProfiles, useStages, updateRow, logActivity } from "@/lib/crm-data";
import { dateTime, leadName } from "@/lib/crm";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/whatsapp/")({
  head: () => ({
    meta: [
      { title: "Inbox de WhatsApp — Glodeu CRM" },
      { name: "description", content: "Caixa de entrada de WhatsApp integrada ao funil: converse com leads e mova etapas sem sair da conversa." },
      { property: "og:title", content: "Inbox de WhatsApp — Glodeu CRM" },
      { property: "og:description", content: "Conversas de WhatsApp conectadas aos leads do CRM." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WhatsAppInbox,
});

function WhatsAppInbox() {
  useWhatsAppRealtime();
  const qc = useQueryClient();
  const { data: conversations = [] } = useWhatsAppConversations();
  const { data: connections = [] } = useWhatsAppConnections();
  const { data: leads = [] } = useLeads();
  const { data: stages = [] } = useStages();
  const { data: profiles = [] } = useProfiles();
  const { data: profile } = useCurrentProfile();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const visible = useMemo(
    () => conversations.filter((c) => filter === "all" || c["connection_id"] === filter),
    [conversations, filter],
  );
  const conversation = visible.find((c) => c["id"] === selectedId) ?? visible[0] ?? null;
  const lead = leads.find((l) => l["id"] === conversation?.["lead_id"]) ?? null;
  const stage = stages.find((s) => s["id"] === lead?.["stage_id"]);
  const owner = profiles.find((p) => p["id"] === lead?.["owner_id"]);
  const funnelStages = stages
    .filter((s) => s["funnel_id"] === lead?.["funnel_id"])
    .sort((a, b) => a["position"] - b["position"]);

  const changeStage = async (stageId: string) => {
    if (!lead) return;
    await updateRow("leads", lead["id"], {
      stage_id: stageId,
      stage_entered_at: new Date().toISOString(),
    });
    await logActivity({
      lead_id: lead["id"],
      type: "mudanca_etapa",
      title: `Movido para ${stages.find((s) => s["id"] === stageId)?.["name"]}`,
    });
    toast.success("Etapa atualizada.");
    qc.invalidateQueries({ queryKey: ["leads"] });
    qc.invalidateQueries({ queryKey: ["activities"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <Pick
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "Todas as conexões" },
              ...connections.map((c) => ({ value: c["id"], label: c["name"] })),
            ]}
          />
        </div>
        <div className="label-mono ml-auto">{visible.length} conversas</div>
        <Button variant="outline" asChild>
          <Link to="/whatsapp/conexoes">
            <Settings2 className="mr-2 h-4 w-4" /> Conexões
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[300px_1fr_280px]">
        <aside className="panel max-h-[600px] overflow-y-auto p-2">
          {visible.map((c) => {
            const l = leads.find((x) => x["id"] === c["lead_id"]);
            const active = c["id"] === conversation?.["id"];
            return (
              <button
                key={c["id"]}
                onClick={() => setSelectedId(c["id"])}
                className={cn(
                  "w-full rounded-md px-3 py-3 text-left transition-colors",
                  active ? "bg-secondary" : "hover:bg-secondary/60",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold">
                    {l ? leadName(l) : (c["contact_name"] ?? formatPhone(c["phone"]))}
                  </span>
                  {Number(c["unread_count"] ?? 0) > 0 && (
                    <span className="rounded-full bg-[var(--friction)] px-2 text-[10px] font-bold text-white">
                      {c["unread_count"]}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {c["last_message_preview"] ?? "—"}
                </p>
                <p className="label-mono mt-1">{dateTime(c["last_message_at"])}</p>
              </button>
            );
          })}
          {visible.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nenhuma conversa ainda.
            </p>
          )}
        </aside>

        <section className="panel p-4">
          {conversation ? (
            <WhatsAppChat
              conversation={conversation}
              lead={lead}
              sellerName={profile?.["name"] ?? null}
            />
          ) : (
            <div className="flex h-[540px] flex-col items-center justify-center gap-3 text-muted-foreground">
              <MessageSquare className="h-8 w-8" />
              <p className="text-sm">Selecione uma conversa para começar.</p>
            </div>
          )}
        </section>

        <aside className="panel space-y-3 p-5">
          <p className="label-mono">Informações do lead</p>
          {lead ? (
            <>
              <Info label="Nome" value={leadName(lead)} />
              <Info label="Empresa" value={lead["company_name"] ?? "—"} />
              <Info label="Telefone" value={formatPhone(lead["whatsapp"] ?? lead["phone"])} />
              <Info label="E-mail" value={lead["email"] ?? "—"} />
              <Info label="Funil" value={lead["funnel_id"] ? (stage ? "Ativo" : "—") : "—"} />
              <Info label="Etapa" value={stage?.["name"] ?? "—"} />
              <Info label="Responsável" value={owner?.["name"] ?? "—"} />
              <div className="pt-2">
                <p className="label-mono mb-1">Mudar etapa</p>
                <Pick
                  value={lead["stage_id"] ?? ""}
                  onChange={changeStage}
                  options={funnelStages.map((s) => ({ value: s["id"], label: s["name"] }))}
                />
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/leads/$leadId" params={{ leadId: lead["id"] }}>
                  Abrir ficha do lead
                </Link>
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Conversa sem lead vinculado{conversation ? ` (${formatPhone(conversation["phone"])})` : ""}.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium break-all">{value}</span>
    </div>
  );
}
