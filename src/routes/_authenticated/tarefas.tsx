import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pick, TaskDialog } from "@/components/crm/dialogs";
import { useLeads, useProfiles, useTasks, updateRow } from "@/lib/crm-data";
import { dateTime, leadName } from "@/lib/crm";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tarefas")({
  head: () => ({
    meta: [
      { title: "Tarefas — Glodeu CRM" },
      { name: "description", content: "Agenda operacional do time: tarefas atrasadas, de hoje e futuras com dono e prioridade." },
      { property: "og:title", content: "Tarefas — Glodeu CRM" },
      { property: "og:description", content: "Agenda operacional do time: tarefas atrasadas, de hoje e futuras com dono e prioridade." },
    ],
  }),
  component: TarefasPage,
});

function TarefasPage() {
  const qc = useQueryClient();
  const { data: tasks = [] } = useTasks();
  const { data: leads = [] } = useLeads();
  const { data: profiles = [] } = useProfiles();
  const [owner, setOwner] = useState("all");
  const [creating, setCreating] = useState(false);

  const groups = useMemo(() => {
    const now = new Date();
    const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const list = tasks.filter((t) => owner === "all" || t["owner_id"] === owner);
    const pending = list.filter((t) => t["status"] === "pendente");
    return {
      atrasadas: pending.filter((t) => new Date(t["due_at"]) < now),
      hoje: pending.filter((t) => new Date(t["due_at"]) >= now && new Date(t["due_at"]) <= endToday),
      futuras: pending.filter((t) => new Date(t["due_at"]) > endToday),
      concluidas: list.filter((t) => t["status"] === "concluida").slice(0, 20),
    };
  }, [tasks, owner]);

  const complete = async (id: string) => {
    await updateRow("tasks", id, { status: "concluida", completed_at: new Date().toISOString() });
    toast.success("Tarefa concluída.");
    qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  const Section = ({ title, items, tone }: { title: string; items: any[]; tone?: string }) => (
    <section className="panel p-5">
      <p className={cn("label-mono", tone)}>{title} · {items.length}</p>
      <div className="mt-4 space-y-3">
        {items.map((t) => (
          <div key={t["id"]} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0">
            <div>
              <p className="text-sm font-medium">{t["title"]}</p>
              <p className="label-mono mt-1">
                {dateTime(t["due_at"])} · {t["priority"]}
                {leadName(leads.find((l) => l["id"] === t["lead_id"]) ?? {}) || "sem lead"}
              </p>
            </div>
            {t["status"] === "pendente" && (
              <Button size="sm" variant="ghost" onClick={() => complete(t["id"])}>
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nada por aqui.</p>}
      </div>
    </section>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-56">
          <Pick
            value={owner}
            onChange={setOwner}
            options={[{ value: "all", label: "Todos os responsáveis" }, ...profiles.map((p) => ({ value: p["id"], label: p["name"] }))]}
          />
        </div>
        <Button className="ml-auto" onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova tarefa
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Section title="Atrasadas" items={groups.atrasadas} tone="text-[var(--friction)]" />
        <Section title="Para hoje" items={groups.hoje} tone="text-[var(--signal)]" />
        <Section title="Próximas" items={groups.futuras} />
        <Section title="Concluídas recentes" items={groups.concluidas} />
      </div>

      <TaskDialog
        open={creating}
        onOpenChange={setCreating}
        leads={leads}
        profiles={profiles}
        onSaved={() => qc.invalidateQueries({ queryKey: ["tasks"] })}
      />
    </div>
  );
}
