import { createFileRoute } from "@tanstack/react-router";
import { useTemplates } from "@/lib/crm-data";

export const Route = createFileRoute("/_authenticated/conversas")({
  head: () => ({
    meta: [
      { title: "Conversas e templates — Glodeu CRM" },
      { name: "description", content: "Modelos de mensagem para WhatsApp e e-mail usados na cadência comercial." },
      { property: "og:title", content: "Conversas e templates — Glodeu CRM" },
      { property: "og:description", content: "Modelos de mensagem para WhatsApp e e-mail usados na cadência comercial." },
    ],
  }),
  component: ConversasPage,
});

function ConversasPage() {
  const { data: templates = [] } = useTemplates();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Modelos de mensagem disponíveis para acelerar follow-ups. O envio acontece no canal do
        vendedor; aqui fica o padrão de comunicação do time.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((t) => (
          <div key={t["id"]} className="panel p-5">
            <p className="font-display text-sm font-bold">{t["name"]}</p>
            <p className="label-mono mt-1">{t["channel"] ?? "geral"}</p>
            <p className="mt-3 text-sm whitespace-pre-wrap text-muted-foreground">{t["body"]}</p>
          </div>
        ))}
        {templates.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum template cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
