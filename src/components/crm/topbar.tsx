import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanies, useCurrentProfile, useDeals, useLeads } from "@/lib/crm-data";
import { leadName, initials, brl } from "@/lib/crm";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function Topbar({ title }: { title: string }) {
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { data: leads = [] } = useLeads();
  const { data: companies = [] } = useCompanies();
  const { data: deals = [] } = useDeals();
  const { data: profile } = useCurrentProfile();

  const results = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (t.length < 2) return [];
    const hit = (v: unknown) => String(v ?? "").toLowerCase().includes(t);
    return [
      ...leads
        .filter((l) => hit(leadName(l)) || hit(l["email"]) || hit(l["phone"]) || hit(l["company_name"]))
        .slice(0, 6)
        .map((l) => ({ id: l["id"], label: leadName(l), sub: l["company_name"], kind: "Lead" })),
      ...companies
        .filter((c) => hit(c["trade_name"]) || hit(c["cnpj"]))
        .slice(0, 4)
        .map((c) => ({ id: c["id"], label: c["trade_name"], sub: c["cnpj"], kind: "Empresa" })),
      ...deals
        .filter((d) => hit(d["title"]))
        .slice(0, 4)
        .map((d) => ({ id: d["lead_id"], label: d["title"], sub: brl(d["value"]), kind: "Negócio" })),
    ];
  }, [term, leads, companies, deals]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/90 px-6 backdrop-blur">
      <h1 className="font-display text-lg font-bold">{title}</h1>

      <div className="relative ml-auto w-full max-w-sm">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar lead, empresa, CNPJ, negócio..."
          className="bg-[var(--surface)] pl-9"
        />
        {results.length > 0 && (
          <div className="panel absolute top-12 z-40 w-full overflow-hidden p-1">
            {results.map((r, i) => (
              <button
                key={`${r.kind}-${r.id}-${i}`}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-secondary"
                onClick={() => {
                  setTerm("");
                  if (r.id) navigate({ to: "/leads/$leadId", params: { leadId: String(r.id) } });
                }}
              >
                <span className="truncate">{r.label}</span>
                <span className="label-mono ml-3 shrink-0">{r.kind}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <button className="relative rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Bell className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80">
          <p className="label-mono">Notificações</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Alertas de tarefas atrasadas, reuniões e leads parados aparecem nos painéis de Tarefas e
            Leads que precisam de atenção.
          </p>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
            {initials(profile?.["name"])}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="max-w-[220px] truncate">
            {profile?.["name"] ?? "Usuário"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
