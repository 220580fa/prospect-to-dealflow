import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCompanies, useContacts } from "@/lib/crm-data";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/contatos")({
  head: () => ({
    meta: [
      { title: "Contatos — Glodeu CRM" },
      { name: "description", content: "Pessoas vinculadas às empresas, com papel de decisor, influenciador ou usuário." },
      { property: "og:title", content: "Contatos — Glodeu CRM" },
      { property: "og:description", content: "Pessoas vinculadas às empresas, com papel de decisor, influenciador ou usuário." },
    ],
  }),
  component: ContatosPage,
});

function ContatosPage() {
  const { data: contacts = [] } = useContacts();
  const { data: companies = [] } = useCompanies();
  const [term, setTerm] = useState("");
  const rows = contacts.filter((c) =>
    `${c["first_name"]} ${c["last_name"]} ${c["email"]}`.toLowerCase().includes(term.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <Input
        placeholder="Buscar contato"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="max-w-sm"
      />
      <div className="panel overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="label-mono border-b border-border text-left">
              <th className="p-3">Nome</th>
              <th className="p-3">Empresa</th>
              <th className="p-3">Cargo</th>
              <th className="p-3">Contato</th>
              <th className="p-3">Papel</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c["id"]} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{c["first_name"]} {c["last_name"]}</td>
                <td className="p-3">{companies.find((x) => x["id"] === c["company_id"])?.["trade_name"] ?? "—"}</td>
                <td className="p-3">{c["job_title"] ?? "—"}</td>
                <td className="p-3">{c["email"] ?? c["phone"] ?? "—"}</td>
                <td className="p-3">{c["is_decision_maker"] ? "Decisor" : c["is_influencer"] ? "Influenciador" : "Usuário"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
