import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCompanies, useContacts, useLeads } from "@/lib/crm-data";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/empresas")({
  head: () => ({
    meta: [
      { title: "Empresas — Glodeu CRM" },
      { name: "description", content: "Cadastro de empresas com segmento, porte, contatos e negócios vinculados." },
      { property: "og:title", content: "Empresas — Glodeu CRM" },
      { property: "og:description", content: "Cadastro de empresas com segmento, porte, contatos e negócios vinculados." },
    ],
  }),
  component: EmpresasPage,
});

function EmpresasPage() {
  const { data: companies = [] } = useCompanies();
  const { data: contacts = [] } = useContacts();
  const { data: leads = [] } = useLeads();
  const [term, setTerm] = useState("");
  const rows = companies.filter((c) =>
    `${c["trade_name"]} ${c["cnpj"]} ${c["segment"]}`.toLowerCase().includes(term.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <Input
        placeholder="Buscar empresa, CNPJ ou segmento"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="max-w-sm"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((c) => (
          <div key={c["id"]} className="panel p-5">
            <p className="font-display text-base font-bold">{c["trade_name"]}</p>
            <p className="label-mono mt-1">{c["segment"] ?? "Sem segmento"}</p>
            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <p>CNPJ: {c["cnpj"] ?? "—"}</p>
              <p>{c["city"] ?? "—"}/{c["state"] ?? "—"} · {c["employees"] ?? 0} funcionários</p>
              <p>{contacts.filter((x) => x["company_id"] === c["id"]).length} contatos · {leads.filter((l) => l["company_id"] === c["id"]).length} leads</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
