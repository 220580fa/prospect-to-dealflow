import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IMPACTS,
  NEXT_ACTIONS,
  PRIORITIES,
  SOURCES,
  TASK_TYPES,
  TEMPERATURES,
  TIMINGS,
  leadName,
} from "@/lib/crm";
import { insertRow, logActivity, updateRow, type Row } from "@/lib/crm-data";
import { scheduleGoogleMeeting } from "@/lib/calendar.functions";

/* ---------------- Lead ---------------- */

export function LeadDialog({
  open,
  onOpenChange,
  lead,
  stages,
  profiles,
  existingLeads,
  defaults,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead?: Row | null;
  stages: Row[];
  profiles: Row[];
  existingLeads: Row[];
  defaults?: Row;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Row>(() => ({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company_name: "",
    job_title: "",
    source: "Outbound",
    temperature: "morno",
    potential_value: 0,
    notes: "",
    ...defaults,
    ...(lead ?? {}),
  }));
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const [saving, setSaving] = useState(false);

  const duplicate = existingLeads.find(
    (l) =>
      l["id"] !== form["id"] &&
      ((form["email"] && l["email"] === form["email"]) ||
        (form["phone"] && l["phone"] === form["phone"])),
  );

  const save = async () => {
    if (!form["first_name"]) {
      toast.error("Informe o nome do lead.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        first_name: form["first_name"],
        last_name: form["last_name"] || null,
        email: form["email"] || null,
        phone: form["phone"] || null,
        company_name: form["company_name"] || null,
        job_title: form["job_title"] || null,
        source: form["source"] || null,
        temperature: form["temperature"] || "morno",
        potential_value: Number(form["potential_value"] ?? 0),
        notes: form["notes"] || null,
        owner_id: form["owner_id"] ?? profiles[0]?.["id"] ?? null,
        funnel_id: form["funnel_id"] ?? defaults?.["funnel_id"],
        stage_id: form["stage_id"] ?? stages[0]?.["id"],
      };
      if (lead?.["id"]) {
        await updateRow("leads", lead["id"], payload);
      } else {
        const created = await insertRow("leads", { ...payload, stage_entered_at: new Date().toISOString() });
        await logActivity({
          lead_id: created["id"],
          type: "criacao",
          title: "Lead criado",
          description: `Origem: ${payload.source ?? "—"}`,
        });
      }
      toast.success(lead ? "Lead atualizado." : "Lead criado.");
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar lead.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{lead ? "Editar lead" : "Novo lead"}</DialogTitle>
          <DialogDescription>Dados básicos de identificação e qualificação inicial.</DialogDescription>
        </DialogHeader>

        {duplicate && (
          <div className="rounded-md border border-[var(--friction)]/40 bg-[var(--friction)]/10 p-3 text-xs text-[var(--friction)]">
            Possível duplicidade: {leadName(duplicate)} já usa este e-mail/telefone.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome*">
            <Input value={form["first_name"] ?? ""} onChange={(e) => set("first_name", e.target.value)} />
          </Field>
          <Field label="Sobrenome">
            <Input value={form["last_name"] ?? ""} onChange={(e) => set("last_name", e.target.value)} />
          </Field>
          <Field label="E-mail">
            <Input type="email" value={form["email"] ?? ""} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Telefone/WhatsApp">
            <Input value={form["phone"] ?? ""} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Empresa">
            <Input value={form["company_name"] ?? ""} onChange={(e) => set("company_name", e.target.value)} />
          </Field>
          <Field label="Cargo">
            <Input value={form["job_title"] ?? ""} onChange={(e) => set("job_title", e.target.value)} />
          </Field>
          <Field label="Origem">
            <Pick value={form["source"]} onChange={(v) => set("source", v)} options={SOURCES.map((s) => ({ value: s, label: s }))} />
          </Field>
          <Field label="Temperatura">
            <Pick
              value={form["temperature"]}
              onChange={(v) => set("temperature", v)}
              options={TEMPERATURES.map((t) => ({ value: t.value, label: t.label }))}
            />
          </Field>
          <Field label="Responsável">
            <Pick
              value={form["owner_id"] ?? profiles[0]?.["id"]}
              onChange={(v) => set("owner_id", v)}
              options={profiles.map((p) => ({ value: p["id"], label: p["name"] }))}
            />
          </Field>
          <Field label="Etapa">
            <Pick
              value={form["stage_id"] ?? stages[0]?.["id"]}
              onChange={(v) => set("stage_id", v)}
              options={stages.map((s) => ({ value: s["id"], label: s["name"] }))}
            />
          </Field>
          <Field label="Valor potencial (R$)">
            <Input
              type="number"
              value={form["potential_value"] ?? 0}
              onChange={(e) => set("potential_value", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Observações">
          <Textarea value={form["notes"] ?? ""} onChange={(e) => set("notes", e.target.value)} />
        </Field>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Task ---------------- */

export function TaskDialog({
  open,
  onOpenChange,
  task,
  leads,
  profiles,
  defaults,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task?: Row | null;
  leads: Row[];
  profiles: Row[];
  defaults?: Row;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Row>(() => ({
    title: "",
    type: "follow_up",
    priority: "media",
    due_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    ...defaults,
    ...(task ?? {}),
  }));
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form["title"]) {
      toast.error("Informe o título da tarefa.");
      return;
    }
    const payload = {
      title: form["title"],
      type: form["type"],
      priority: form["priority"],
      description: form["description"] || null,
      lead_id: form["lead_id"] || null,
      owner_id: form["owner_id"] ?? profiles[0]?.["id"] ?? null,
      due_at: new Date(form["due_at"]).toISOString(),
    };
    try {
      if (task?.["id"]) await updateRow("tasks", task["id"], payload);
      else await insertRow("tasks", { ...payload, status: "pendente" });
      toast.success("Tarefa salva.");
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar tarefa.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
          <DialogDescription>Toda tarefa tem dono, prazo e prioridade.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Título*">
            <Input value={form["title"] ?? ""} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tipo">
              <Pick value={form["type"]} onChange={(v) => set("type", v)} options={TASK_TYPES} />
            </Field>
            <Field label="Prioridade">
              <Pick value={form["priority"]} onChange={(v) => set("priority", v)} options={PRIORITIES} />
            </Field>
            <Field label="Vencimento">
              <Input
                type="datetime-local"
                value={String(form["due_at"]).slice(0, 16)}
                onChange={(e) => set("due_at", e.target.value)}
              />
            </Field>
            <Field label="Responsável">
              <Pick
                value={form["owner_id"] ?? profiles[0]?.["id"]}
                onChange={(v) => set("owner_id", v)}
                options={profiles.map((p) => ({ value: p["id"], label: p["name"] }))}
              />
            </Field>
          </div>
          <Field label="Lead vinculado">
            <Pick
              value={form["lead_id"]}
              onChange={(v) => set("lead_id", v)}
              options={leads.slice(0, 100).map((l) => ({ value: l["id"], label: leadName(l) }))}
            />
          </Field>
          <Field label="Descrição">
            <Textarea value={form["description"] ?? ""} onChange={(e) => set("description", e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Meeting ---------------- */

export function MeetingDialog({
  open,
  onOpenChange,
  lead,
  profiles,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead: Row | null;
  profiles: Row[];
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Row>({
    scheduled_at: new Date(Date.now() + 172800000).toISOString().slice(0, 16),
    participants: "",
    meeting_url: "",
    notes: "",
    duration: 60,
  });
  const [useGoogle, setUseGoogle] = useState(true);
  const [guestEmail, setGuestEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const email = (guestEmail || (lead?.["email"] as string) || "").trim();

  const save = async () => {
    if (!lead) return;
    setSaving(true);
    try {
      const startISO = new Date(form["scheduled_at"]).toISOString();
      let meetingUrl: string | null = form["meeting_url"] || null;

      if (useGoogle) {
        if (!email) {
          toast.error("Informe o e-mail do lead para enviar o convite.");
          setSaving(false);
          return;
        }
        const extras = String(form["participants"] ?? "")
          .split(/[;,\s]+/)
          .filter((v) => v.includes("@"));
        const ev = await scheduleGoogleMeeting({
          data: {
            summary: `Reunião · ${leadName(lead)}`,
            description: form["notes"] || null,
            startISO,
            minutes: Number(form["duration"]) || 60,
            attendees: Array.from(new Set([email, ...extras])),
          },
        });
        meetingUrl = ev.meetLink ?? ev.htmlLink ?? meetingUrl;
      }

      await insertRow("meetings", {
        lead_id: lead["id"],
        owner_id: lead["owner_id"] ?? profiles[0]?.["id"] ?? null,
        scheduled_at: startISO,
        participants: form["participants"] || null,
        meeting_url: meetingUrl,
        notes: form["notes"] || null,
        status: "agendada",
      });
      await logActivity({
        lead_id: lead["id"],
        type: "reuniao",
        title: useGoogle ? "Reunião agendada (convite enviado por e-mail)" : "Reunião agendada",
        description: `${new Date(startISO).toLocaleString("pt-BR")}${meetingUrl ? ` · ${meetingUrl}` : ""}`,
      });
      toast.success(
        useGoogle ? `Reunião criada na Google Agenda e convite enviado para ${email}.` : "Reunião agendada.",
      );
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao agendar reunião.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agendar reunião</DialogTitle>
          <DialogDescription>{lead ? leadName(lead) : ""}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Data e hora">
            <Input
              type="datetime-local"
              value={form["scheduled_at"]}
              onChange={(e) => set("scheduled_at", e.target.value)}
            />
          </Field>
          <Field label="Participantes">
            <Input value={form["participants"]} onChange={(e) => set("participants", e.target.value)} />
          </Field>
          <Field label="Link da reunião">
            <Input value={form["meeting_url"]} onChange={(e) => set("meeting_url", e.target.value)} />
          </Field>
          <Field label="Pauta">
            <Textarea value={form["notes"]} onChange={(e) => set("notes", e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save}>Agendar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Qualification (SQL -> Venda) ---------------- */

export function QualificationDialog({
  open,
  onOpenChange,
  lead,
  meeting,
  profiles,
  salesStageId,
  salesFunnelId,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead: Row | null;
  meeting?: Row | null;
  profiles: Row[];
  salesStageId?: string;
  salesFunnelId: string;
  onDone: () => void;
}) {
  const [form, setForm] = useState<Row>({
    problem: "",
    current_situation: "",
    impacts: [] as string[],
    need_level: 3,
    interest_products: "",
    is_decision_maker: true,
    decision_makers: "",
    budget_status: "Tem orçamento definido",
    potential_value: lead?.["potential_value"] ?? 0,
    timing: "Até 30 dias",
    competitors_present: false,
    competitors: "",
    interest_level: 4,
    probability: 40,
    discussed_points: "",
    objections: "",
    next_action: "Enviar proposta",
    next_action_at: new Date(Date.now() + 172800000).toISOString().slice(0, 16),
  });
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const [saving, setSaving] = useState(false);

  const toggleImpact = (i: string) =>
    set(
      "impacts",
      (form["impacts"] as string[]).includes(i)
        ? (form["impacts"] as string[]).filter((x) => x !== i)
        : [...(form["impacts"] as string[]), i],
    );

  const submit = async () => {
    if (!lead) return;
    if (!form["problem"] || !form["next_action"]) {
      toast.error("Problema principal e próxima ação são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      const value = Number(form["potential_value"] ?? 0);
      const deal = await insertRow("deals", {
        lead_id: lead["id"],
        company_id: lead["company_id"] ?? null,
        contact_id: lead["contact_id"] ?? null,
        title: `${lead["company_name"] ?? leadName(lead)} — Oportunidade`,
        funnel_id: salesFunnelId,
        stage_id: salesStageId,
        owner_id: lead["owner_id"],
        value,
        probability: Number(form["probability"] ?? 40),
        expected_close_date: form["expected_close_date"] || null,
        status: "aberto",
        source: lead["source"] ?? null,
        stage_entered_at: new Date().toISOString(),
      });

      await insertRow("meeting_qualifications", {
        meeting_id: meeting?.["id"] ?? null,
        lead_id: lead["id"],
        deal_id: deal["id"],
        problem: form["problem"],
        current_situation: form["current_situation"] || null,
        impacts: form["impacts"],
        need_level: Number(form["need_level"]),
        interest_products: form["interest_products"] || null,
        is_decision_maker: form["is_decision_maker"],
        decision_makers: form["decision_makers"] || null,
        budget_status: form["budget_status"],
        potential_value: value,
        timing: form["timing"],
        expected_close_date: form["expected_close_date"] || null,
        competitors_present: form["competitors_present"],
        competitors: form["competitors"] || null,
        interest_level: Number(form["interest_level"]),
        probability: Number(form["probability"]),
        discussed_points: form["discussed_points"] || null,
        objections: form["objections"] || null,
        next_action: form["next_action"],
        next_action_owner_id: lead["owner_id"],
        next_action_at: new Date(form["next_action_at"]).toISOString(),
      });

      if (meeting?.["id"]) {
        await updateRow("meetings", meeting["id"], {
          status: "realizada",
          outcome: form["discussed_points"] || null,
          next_steps: form["next_action"],
        });
      }

      await insertRow("tasks", {
        title: form["next_action"],
        type: "follow_up",
        priority: "alta",
        status: "pendente",
        lead_id: lead["id"],
        deal_id: deal["id"],
        owner_id: lead["owner_id"] ?? profiles[0]?.["id"] ?? null,
        due_at: new Date(form["next_action_at"]).toISOString(),
      });

      await updateRow("leads", lead["id"], {
        status: "convertido",
        potential_value: value,
        probability: Number(form["probability"]),
        last_interaction_at: new Date().toISOString(),
      });

      await logActivity({
        lead_id: lead["id"],
        deal_id: deal["id"],
        type: "qualificacao",
        title: "Qualificação pós-reunião concluída",
        description: `Lead convertido em oportunidade — ${form["next_action"]}`,
      });

      toast.success("Lead qualificado e movido para o Funil de Venda.");
      onDone();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao qualificar lead.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Qualificação pós-reunião</DialogTitle>
          <DialogDescription>
            Obrigatório para transformar {lead ? leadName(lead) : "o lead"} em oportunidade no Funil
            de Venda.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <Section title="1. Necessidade">
            <Field label="Qual o principal problema do cliente?*">
              <Textarea value={form["problem"]} onChange={(e) => set("problem", e.target.value)} />
            </Field>
            <Field label="Como ele resolve isso hoje?">
              <Textarea
                value={form["current_situation"]}
                onChange={(e) => set("current_situation", e.target.value)}
              />
            </Field>
            <Field label="Impactos do problema">
              <div className="grid gap-2 sm:grid-cols-3">
                {IMPACTS.map((i) => (
                  <label key={i} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={(form["impacts"] as string[]).includes(i)}
                      onCheckedChange={() => toggleImpact(i)}
                    />
                    {i}
                  </label>
                ))}
              </div>
            </Field>
            <Field label={`Nível de necessidade: ${form["need_level"]}/5`}>
              <Input
                type="range"
                min={1}
                max={5}
                value={form["need_level"]}
                onChange={(e) => set("need_level", e.target.value)}
              />
            </Field>
          </Section>

          <Section title="2. Decisão e orçamento">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="É o decisor?">
                <Pick
                  value={String(form["is_decision_maker"])}
                  onChange={(v) => set("is_decision_maker", v === "true")}
                  options={[
                    { value: "true", label: "Sim" },
                    { value: "false", label: "Não" },
                  ]}
                />
              </Field>
              <Field label="Outros decisores">
                <Input
                  value={form["decision_makers"]}
                  onChange={(e) => set("decision_makers", e.target.value)}
                />
              </Field>
              <Field label="Situação do orçamento">
                <Pick
                  value={form["budget_status"]}
                  onChange={(v) => set("budget_status", v)}
                  options={[
                    "Tem orçamento definido",
                    "Tem verba, sem valor definido",
                    "Precisa aprovar internamente",
                    "Não tem orçamento agora",
                  ].map((s) => ({ value: s, label: s }))}
                />
              </Field>
              <Field label="Valor potencial (R$)">
                <Input
                  type="number"
                  value={form["potential_value"]}
                  onChange={(e) => set("potential_value", e.target.value)}
                />
              </Field>
            </div>
          </Section>

          <Section title="3. Tempo e concorrência">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prazo para decidir">
                <Pick
                  value={form["timing"]}
                  onChange={(v) => set("timing", v)}
                  options={TIMINGS.map((t) => ({ value: t, label: t }))}
                />
              </Field>
              <Field label="Previsão de fechamento">
                <Input
                  type="date"
                  value={form["expected_close_date"] ?? ""}
                  onChange={(e) => set("expected_close_date", e.target.value)}
                />
              </Field>
              <Field label="Avalia concorrentes?">
                <Pick
                  value={String(form["competitors_present"])}
                  onChange={(v) => set("competitors_present", v === "true")}
                  options={[
                    { value: "false", label: "Não" },
                    { value: "true", label: "Sim" },
                  ]}
                />
              </Field>
              <Field label="Quais concorrentes">
                <Input
                  value={form["competitors"]}
                  onChange={(e) => set("competitors", e.target.value)}
                />
              </Field>
            </div>
          </Section>

          <Section title="4. Interesse e próximos passos">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={`Nível de interesse: ${form["interest_level"]}/5`}>
                <Input
                  type="range"
                  min={1}
                  max={5}
                  value={form["interest_level"]}
                  onChange={(e) => set("interest_level", e.target.value)}
                />
              </Field>
              <Field label={`Probabilidade estimada: ${form["probability"]}%`}>
                <Input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={form["probability"]}
                  onChange={(e) => set("probability", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Pontos discutidos">
              <Textarea
                value={form["discussed_points"]}
                onChange={(e) => set("discussed_points", e.target.value)}
              />
            </Field>
            <Field label="Objeções levantadas">
              <Textarea value={form["objections"]} onChange={(e) => set("objections", e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Próxima ação*">
                <Pick
                  value={form["next_action"]}
                  onChange={(v) => set("next_action", v)}
                  options={NEXT_ACTIONS.map((n) => ({ value: n, label: n }))}
                />
              </Field>
              <Field label="Prazo da próxima ação">
                <Input
                  type="datetime-local"
                  value={form["next_action_at"]}
                  onChange={(e) => set("next_action_at", e.target.value)}
                />
              </Field>
            </div>
          </Section>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={saving}>
            Qualificar e enviar para Venda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Loss ---------------- */

export function LossDialog({
  open,
  onOpenChange,
  table,
  rowId,
  reasons,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  table: "leads" | "deals";
  rowId: string | null;
  reasons: Row[];
  onDone: () => void;
}) {
  const [reason, setReason] = useState<string | undefined>();
  const [notes, setNotes] = useState("");

  const save = async () => {
    if (!rowId || !reason) {
      toast.error("Selecione o motivo da perda.");
      return;
    }
    await updateRow(table, rowId, {
      status: "perdido",
      loss_reason_id: reason,
      loss_notes: notes || null,
      ...(table === "deals" ? { lost_at: new Date().toISOString() } : {}),
    });
    await logActivity({
      [table === "deals" ? "deal_id" : "lead_id"]: rowId,
      type: "perda",
      title: "Marcado como perdido",
      description: notes || null,
    });
    toast.success("Registro marcado como perdido.");
    onDone();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Marcar como perdido</DialogTitle>
          <DialogDescription>O motivo é obrigatório para alimentar os relatórios.</DialogDescription>
        </DialogHeader>
        <Field label="Motivo*">
          <Pick
            value={reason}
            onChange={setReason}
            options={reasons.map((r) => ({ value: r["id"], label: r["name"] }))}
          />
        </Field>
        <Field label="Detalhes">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={save}>
            Confirmar perda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- primitives ---------------- */

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="label-mono">{label}</Label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel space-y-4 p-4">
      <p className="font-display text-sm font-bold">{title}</p>
      {children}
    </div>
  );
}

export function Pick({
  value,
  onChange,
  options,
  placeholder = "Selecionar",
}: {
  value?: string | null | undefined;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <Select {...(value ? { value } : {})} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
