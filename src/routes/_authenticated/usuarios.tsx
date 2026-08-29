import { createFileRoute } from "@tanstack/react-router";
import { useProfiles, useRoles, useTeams } from "@/lib/crm-data";
import { initials } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuários e times — Glodeu CRM" },
      { name: "description", content: "Equipe comercial, papéis de acesso e distribuição por time." },
      { property: "og:title", content: "Usuários e times — Glodeu CRM" },
      { property: "og:description", content: "Equipe comercial, papéis de acesso e distribuição por time." },
    ],
  }),
  component: UsuariosPage,
});

function UsuariosPage() {
  const { data: profiles = [] } = useProfiles();
  const { data: teams = [] } = useTeams();
  const { data: roles = [] } = useRoles();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {profiles.map((p) => (
        <div key={p["id"]} className="panel flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
            {initials(p["name"])}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{p["name"]}</p>
            <p className="label-mono mt-1">
              {p["job_title"] ?? "Vendedor"} · {teams.find((t) => t["id"] === p["team_id"])?.["name"] ?? "Sem time"}
            </p>
            <p className="truncate text-xs text-muted-foreground">{p["email"] ?? "—"}</p>
            <p className="label-mono mt-1">
              {roles.find((r) => r["user_id"] === p["auth_user_id"])?.["role"] ?? "vendedor"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
