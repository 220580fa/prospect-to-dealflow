import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAutomations } from "@/lib/crm-data";
import { useWhatsAppConnections } from "@/lib/whatsapp-data";

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
  const { data: connections = [] } = useWhatsAppConnections();
  const connected = connections.filter((c) => c["status"] === "conectado").length;

  return (
    <div className="space-y-4">
      <section className="panel flex flex-wrap items-center gap-4 p-5">
        <MessageCircle className="h-6 w-6 text-[var(--signal)]" />
        <div className="min-w-0">
          <p className="font-display text-sm font-bold">WhatsApp (Evolution API)</p>
          <p className="text-sm text-muted-foreground">
            {connections.length} conexão(ões) cadastrada(s) · {connected} conectada(s). Credenciais
            protegidas no backend.
          </p>
        </div>
        <Button className="ml-auto" asChild>
          <Link to="/whatsapp/conexoes">Gerenciar conexões</Link>
        </Button>
      </section>

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
