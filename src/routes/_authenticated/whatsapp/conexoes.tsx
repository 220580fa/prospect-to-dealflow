import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Link2,
  Loader2,
  Plus,
  QrCode,
  RefreshCw,
  Trash2,
  Unplug,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, Pick } from "@/components/crm/dialogs";
import { useProfiles, insertRow, updateRow, type Row } from "@/lib/crm-data";
import { useQuickReplies, useWhatsAppConnections } from "@/lib/whatsapp-data";
import { CONNECTION_STATUS_LABEL, TEMPLATE_VARIABLES, formatPhone } from "@/lib/whatsapp/shared";
import {
  createWhatsAppConnection,
  deleteWhatsAppConnection,
  disconnectWhatsApp,
  getWhatsAppQrCode,
  getWhatsAppStatus,
  getWhatsAppWebhookUrl,
} from "@/lib/whatsapp.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/whatsapp/conexoes")({
  head: () => ({
    meta: [
      { title: "Conexões de WhatsApp — Glodeu CRM" },
      { name: "description", content: "Conecte números de WhatsApp via Evolution API, leia o QR Code e gerencie respostas rápidas." },
      { property: "og:title", content: "Conexões de WhatsApp — Glodeu CRM" },
      { property: "og:description", content: "Multi-instância de WhatsApp com QR Code e webhook seguro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConexoesPage,
});

const STATUS_TONE: Record<string, string> = {
  conectado: "text-[var(--signal)]",
  conectando: "text-[var(--flow)]",
  desconectado: "text-muted-foreground",
  erro: "text-[var(--friction)]",
};

function ConexoesPage() {
  const qc = useQueryClient();
  const { data: connections = [] } = useWhatsAppConnections();
  const { data: profiles = [] } = useProfiles();
  const [creating, setCreating] = useState(false);
  const [qrFor, setQrFor] = useState<Row | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["whatsapp_connections"] });

  const checkStatus = useServerFn(getWhatsAppStatus);
  const disconnect = useServerFn(disconnectWhatsApp);
  const removeConn = useServerFn(deleteWhatsAppConnection);
  const webhookUrl = useServerFn(getWhatsAppWebhookUrl);

  const run = async (id: string, fn: () => Promise<unknown>, ok: string) => {
    setBusy(id);
    try {
      await fn();
      toast.success(ok);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha na operação.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Conexões WhatsApp Web via Evolution API. As credenciais ficam apenas no backend — nunca no
          navegador.
        </p>
        <Button className="ml-auto" onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar conexão
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {connections.map((c) => {
          const responsible = profiles.find((p) => p["id"] === c["responsible_user_id"]);
          const status = String(c["status"]);
          return (
            <div key={c["id"]} className="panel space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-sm font-bold">{c["name"]}</p>
                  <p className="label-mono mt-1">instância {c["instance_name"]}</p>
                </div>
                <span className={cn("label-mono", STATUS_TONE[status])}>
                  {status === "conectado" ? "🟢" : status === "conectando" ? "🟡" : "⚪"}{" "}
                  {CONNECTION_STATUS_LABEL[status] ?? status}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Número: </span>
                  {c["phone_number"] ? formatPhone(c["phone_number"]) : "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Responsável: </span>
                  {responsible?.["name"] ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Novos leads automáticos: </span>
                  {c["auto_create_lead"] ? "sim" : "não"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setQrFor(c)} disabled={busy === c["id"]}>
                  <QrCode className="mr-2 h-4 w-4" />
                  {status === "conectado" ? "Reconectar" : "Conectar WhatsApp"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy === c["id"]}
                  onClick={() =>
                    run(
                      c["id"],
                      () => checkStatus({ data: { connectionId: c["id"] } }),
                      "Status atualizado.",
                    )
                  }
                >
                  {busy === c["id"] ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Status
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy === c["id"]}
                  onClick={() =>
                    run(
                      c["id"],
                      async () => {
                        const r: any = await webhookUrl({
                          data: { connectionId: c["id"], refresh: true },
                        });
                        await navigator.clipboard?.writeText(r.url).catch(() => {});
                      },
                      "Webhook reconfigurado na Evolution API (URL copiada).",
                    )
                  }
                >
                  <Link2 className="mr-2 h-4 w-4" /> Webhook
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy === c["id"]}
                  onClick={() =>
                    run(
                      c["id"],
                      () => disconnect({ data: { connectionId: c["id"] } }),
                      "WhatsApp desconectado.",
                    )
                  }
                >
                  <Unplug className="mr-2 h-4 w-4" /> Desconectar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={busy === c["id"]}
                  onClick={() => {
                    if (!confirm(`Excluir a conexão "${c["name"]}"?`)) return;
                    run(
                      c["id"],
                      () => removeConn({ data: { connectionId: c["id"] } }),
                      "Conexão excluída.",
                    );
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
        {connections.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma conexão cadastrada. Clique em “Adicionar conexão” e informe a URL da Evolution
            API, o nome da instância e a API Key.
          </p>
        )}
      </div>

      <QuickReplies />

      <NewConnectionDialog
        open={creating}
        onOpenChange={setCreating}
        profiles={profiles}
        onSaved={refresh}
      />
      <QrDialog connection={qrFor} onOpenChange={() => setQrFor(null)} onDone={refresh} />
    </div>
  );
}

function NewConnectionDialog({
  open,
  onOpenChange,
  profiles,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profiles: Row[];
  onSaved: () => void;
}) {
  const create = useServerFn(createWhatsAppConnection);
  const [form, setForm] = useState({
    name: "",
    instanceName: "",
    baseUrl: "",
    apiKey: "",
    responsibleUserId: "",
    autoCreateLead: "sim",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    try {
      await create({
        data: {
          name: form.name.trim(),
          instanceName: form.instanceName.trim(),
          baseUrl: form.baseUrl.trim(),
          apiKey: form.apiKey.trim(),
          responsibleUserId: form.responsibleUserId || null,
          autoCreateLead: form.autoCreateLead === "sim",
        },
      });
      toast.success("Conexão criada. Agora clique em “Conectar WhatsApp” para ler o QR Code.");
      onOpenChange(false);
      setForm({ name: "", instanceName: "", baseUrl: "", apiKey: "", responsibleUserId: "", autoCreateLead: "sim" });
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível criar a conexão.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova conexão de WhatsApp</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Nome da conexão">
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="WhatsApp Comercial"
            />
          </Field>
          <Field label="Instance name (Evolution API)">
            <Input
              value={form.instanceName}
              onChange={(e) => set("instanceName", e.target.value)}
              placeholder="glodeu-comercial"
            />
          </Field>
          <Field label="URL da Evolution API">
            <Input
              value={form.baseUrl}
              onChange={(e) => set("baseUrl", e.target.value)}
              placeholder="https://evolution.seudominio.com.br"
            />
          </Field>
          <Field label="API Key (armazenada apenas no backend)">
            <Input
              type="password"
              value={form.apiKey}
              onChange={(e) => set("apiKey", e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          <Field label="Responsável">
            <Pick
              value={form.responsibleUserId}
              onChange={(v) => set("responsibleUserId", v)}
              options={[
                { value: "", label: "Sem responsável" },
                ...profiles.map((p) => ({ value: p["id"], label: p["name"] })),
              ]}
            />
          </Field>
          <Field label="Criar lead automaticamente ao receber mensagem de número desconhecido">
            <Pick
              value={form.autoCreateLead}
              onChange={(v) => set("autoCreateLead", v)}
              options={[
                { value: "sim", label: "Sim — criar lead na Triagem" },
                { value: "nao", label: "Não — apenas registrar a conversa" },
              ]}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button
            onClick={submit}
            disabled={saving || !form.name || !form.instanceName || !form.baseUrl || !form.apiKey}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Criar conexão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QrDialog({
  connection,
  onOpenChange,
  onDone,
}: {
  connection: Row | null;
  onOpenChange: (v: boolean) => void;
  onDone: () => void;
}) {
  const qr = useServerFn(getWhatsAppQrCode);
  const status = useServerFn(getWhatsAppStatus);
  const [state, setState] = useState<{
    qr?: string | null;
    pairing?: string | null;
    status?: string;
    loading: boolean;
  }>({ loading: false });

  const load = async () => {
    if (!connection) return;
    setState({ loading: true });
    try {
      const r: any = await qr({ data: { connectionId: connection["id"] } });
      setState({ loading: false, qr: r.qrBase64, pairing: r.pairingCode, status: r.status });
      if (r.status === "conectado") onDone();
    } catch (e) {
      setState({ loading: false });
      toast.error(e instanceof Error ? e.message : "Não foi possível obter o QR Code.");
    }
  };

  // Gera o QR automaticamente ao abrir o diálogo
  useEffect(() => {
    if (connection) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection?.["id"]]);

  // Enquanto o diálogo estiver aberto, confere o status a cada 5s
  useEffect(() => {
    if (!connection) return;
    const t = setInterval(async () => {
      try {
        const r: any = await status({ data: { connectionId: connection["id"] } });
        if (r.status === "conectado") {
          setState((s) => ({ ...s, status: "conectado" }));
          toast.success("WhatsApp conectado!");
          onDone();
          onOpenChange(false);
        }
      } catch {
        /* silencioso */
      }
    }, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection?.["id"]]);

  const confirm = async () => {
    if (!connection) return;
    setState((s) => ({ ...s, loading: true }));
    try {
      const r: any = await status({ data: { connectionId: connection["id"] } });
      setState((s) => ({ ...s, loading: false, status: r.status }));
      if (r.status === "conectado") {
        toast.success("WhatsApp conectado!");
        onDone();
        onOpenChange(false);
      } else {
        toast.message("Ainda não conectado. Leia o QR Code e tente novamente.");
      }
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast.error(e instanceof Error ? e.message : "Falha ao verificar o status.");
    }
  };

  return (
    <Dialog
      open={!!connection}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setState({ loading: false });
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar {connection?.["name"]}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            No celular: WhatsApp → Aparelhos conectados → Conectar aparelho → escaneie o código.
          </p>
          {state.qr ? (
            <img
              src={state.qr.startsWith("data:") ? state.qr : `data:image/png;base64,${state.qr}`}
              alt="QR Code para conectar o WhatsApp"
              className="mx-auto h-64 w-64 rounded-lg bg-white p-2"
            />
          ) : (
            <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              {state.loading ? "Gerando QR Code..." : "Clique em “Gerar QR Code”"}
            </div>
          )}
          {state.pairing && (
            <p className="text-sm">
              <span className="text-muted-foreground">Código de pareamento: </span>
              <span className="font-mono font-bold tracking-widest">{state.pairing}</span>
            </p>
          )}
          {state.status === "conectado" && (
            <p className="text-sm text-[var(--signal)]">🟢 Conectado</p>
          )}
          {state.qr && (
            <p className="text-xs text-muted-foreground">
              O QR Code expira em ~40s. Se não funcionar, clique em “Gerar QR Code” novamente.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={load} disabled={state.loading}>
            {state.loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <QrCode className="mr-2 h-4 w-4" />
            )}
            Gerar QR Code
          </Button>
          <Button onClick={confirm} disabled={state.loading}>
            Já escaneei
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QuickReplies() {
  const qc = useQueryClient();
  const { data: replies = [] } = useQuickReplies();
  const [form, setForm] = useState({ shortcut: "", title: "", body: "" });
  const refresh = () => qc.invalidateQueries({ queryKey: ["whatsapp_quick_replies"] });

  const add = async () => {
    try {
      await insertRow("whatsapp_quick_replies", {
        shortcut: form.shortcut.startsWith("/") ? form.shortcut : `/${form.shortcut}`,
        title: form.title,
        body: form.body,
      });
      setForm({ shortcut: "", title: "", body: "" });
      toast.success("Resposta rápida criada.");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível salvar.");
    }
  };

  return (
    <section className="panel space-y-4 p-5">
      <div>
        <p className="label-mono">Respostas rápidas</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Variáveis disponíveis: {TEMPLATE_VARIABLES.join(" ")}
        </p>
      </div>

      <div className="space-y-2">
        {replies.map((r) => (
          <div key={r["id"]} className="flex items-start gap-3 border-b border-border pb-2 last:border-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {r["shortcut"]} · {r["title"]}
              </p>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">{r["body"]}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                await updateRow("whatsapp_quick_replies", r["id"], { active: false });
                refresh();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-[160px_1fr]">
        <Field label="Atalho">
          <Input
            value={form.shortcut}
            onChange={(e) => setForm((f) => ({ ...f, shortcut: e.target.value }))}
            placeholder="/proposta"
          />
        </Field>
        <Field label="Título">
          <Input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Envio de proposta"
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Mensagem">
            <Textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="Olá {{primeiro_nome}}, ..."
              rows={3}
            />
          </Field>
        </div>
      </div>
      <Button onClick={add} disabled={!form.shortcut || !form.title || !form.body}>
        <Plus className="mr-2 h-4 w-4" /> Adicionar resposta rápida
      </Button>
    </section>
  );
}
