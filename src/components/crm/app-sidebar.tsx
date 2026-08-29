import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Building2,
  CalendarDays,
  CheckSquare,
  Contact,
  Gauge,
  KanbanSquare,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  PieChart,
  Plug,
  Settings,
  Target,
  Users,
  UserSquare2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/funis", label: "CRM / Funis", icon: KanbanSquare },
  { to: "/leads", label: "Leads", icon: UserSquare2 },
  { to: "/empresas", label: "Empresas", icon: Building2 },
  { to: "/contatos", label: "Contatos", icon: Contact },
  { to: "/tarefas", label: "Tarefas", icon: CheckSquare },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/atividades", label: "Atividades", icon: Activity },
  { to: "/conversas", label: "Conversas", icon: MessageSquare },
  { to: "/relatorios", label: "Relatórios", icon: PieChart },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/usuarios", label: "Usuários", icon: Users },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
  { to: "/integracoes", label: "Integrações", icon: Plug },
] as const;

export function AppSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-[236px]",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <span className="font-display text-sm font-extrabold tracking-[0.24em] text-foreground">
            GLODEU
          </span>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              title={label}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <Icon
                className={cn("h-4 w-4 shrink-0", active && "text-[var(--signal)]")}
                strokeWidth={1.6}
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="label-mono border-t border-sidebar-border px-4 py-4">
          Movimento organizado
        </div>
      )}
    </aside>
  );
}
