import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Check, CheckCheck, Clock3, Send, TriangleAlert, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { sendWhatsAppMessage } from "@/lib/whatsapp.functions";
import {
  markConversationRead,
  useLeadConversation,
  useQuickReplies,
  useWhatsAppConnections,
  useWhatsAppMessages,
  useWhatsAppRealtime,
} from "@/lib/whatsapp-data";
import { formatPhone, normalizePhone, renderTemplate } from "@/lib/whatsapp/shared";
import { leadName } from "@/lib/crm";
import { cn } from "@/lib/utils";
import type { Row } from "@/lib/crm-data";

function StatusIcon({ status }: { status: string }) {
  if (status === "failed") return <TriangleAlert className="h-3 w-3 text-[var(--friction)]" />;
  if (status === "read") return <CheckCheck className="h-3 w-3 text-[var(--flow)]" />;
  if (status === "delivered") return <CheckCheck className="h-3 w-3 opacity-70" />;
  if (status === "sent") return <Check className="h-3 w-3 opacity-70" />;
  return <Clock3 className="h-3 w-3 opacity-70" />;
}

const hhmm = (d?: string | null) =>
  d ? new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";

export function WhatsAppChat({
  lead,
  conversation: conversationProp,
  sellerName,
  className,
}: {
  lead?: Row | null;
  conversation?: Row | null;
  sellerName?: string | null;
  className?: string;
}) {
  useWhatsAppRealtime();
  const qc = useQueryClient();
  const { data: leadConversation } = useLeadConversation(
    conversationProp ? null : (lead?.["id"] ?? null),
  );
  const conversation = conversationProp ?? leadConversation ?? null;
  const { data: messages = [] } = useWhatsAppMessages(conversation?.["id"] ?? null);
  const { data: connections = [] } = useWhatsAppConnections();
  const { data: quickReplies = [] } = useQuickReplies();
  const send = useServerFn(sendWhatsAppMessage);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [connectionId, setConnectionId] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const connected = useMemo(
    () => connections.filter((c) => c["status"] === "conectado"),
    [connections],
  );
  const activeConnection =
    connections.find((c) => c["id"] === (conversation?.["connection_id"] ?? connectionId)) ??
    connected[0] ??
    null;

  const phone = normalizePhone(
    conversation?.["phone"] ?? lead?.["whatsapp"] ?? lead?.["phone"] ?? null,
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, conversation?.["id"]]);

  useEffect(() => {
    if (conversation?.["id"] && Number(conversation["unread_count"] ?? 0) > 0) {
      markConversationRead(conversation["id"]).then(() =>
        qc.invalidateQueries({ queryKey: ["whatsapp_conversations"] }),
      );
    }
  }, [conversation?.["id"], conversation?.["unread_count"], qc]);

  const applyQuickReply = (body: string) => {
    const name = lead ? leadName(lead) : (conversation?.["contact_name"] ?? "");
    setText(
      renderTemplate(body, {
        nome: name,
        primeiro_nome: name.split(" ")[0] ?? "",
        empresa: lead?.["company_name"] ?? "",
        vendedor: sellerName ?? "",
        data_reuniao: "",
        link_reuniao: "",
      }),
    );
  };

  const onSend = async () => {
    const message = text.trim();
    if (!message || sending) return;
    if (!activeConnection) {
      toast.error("Nenhuma conexão de WhatsApp conectada. Configure em WhatsApp → Conexões.");
      return;
    }
    if (!phone) {
      toast.error("Este lead não tem um número de WhatsApp válido.");
      return;
    }
    setSending(true);
    try {
      await send({
        data: {
          leadId: lead?.["id"] ?? conversation?.["lead_id"] ?? null,
          conversationId: conversation?.["id"] ?? null,
          connectionId: activeConnection["id"],
          phone,
          message,
        },
      });
      setText("");
      qc.invalidateQueries({ queryKey: ["whatsapp_messages"] });
      qc.invalidateQueries({ queryKey: ["whatsapp_conversations"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível enviar a mensagem.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={cn("flex h-[540px] flex-col", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {lead ? leadName(lead) : (conversation?.["contact_name"] ?? "Conversa")}
          </p>
          <p className="label-mono truncate">{phone ? formatPhone(phone) : "sem número"}</p>
        </div>
        <div className="text-right">
          {activeConnection ? (
            <p className="label-mono">
              <span className="text-[var(--signal)]">●</span> {activeConnection["name"]}
            </p>
          ) : (
            <p className="label-mono text-[var(--friction)]">sem conexão</p>
          )}
          {!conversation && connected.length > 1 && (
            <select
              value={connectionId || (connected[0]?.["id"] ?? "")}
              onChange={(e) => setConnectionId(e.target.value)}
              className="mt-1 rounded-md border border-border bg-transparent px-2 py-1 text-xs"
            >
              {connected.map((c) => (
                <option key={c["id"]} value={c["id"]}>
                  {c["name"]}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto py-4 pr-1">
        {messages.map((m) => {
          const out = m["direction"] === "outbound";
          return (
            <div key={m["id"]} className={cn("flex", out ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[78%] rounded-lg px-3 py-2 text-sm",
                  out
                    ? "bg-[var(--signal)]/15 text-foreground"
                    : "bg-secondary text-foreground",
                  m["status"] === "failed" && "border border-[var(--friction)]",
                )}
              >
                {m["message_type"] !== "text" && (
                  <p className="label-mono mb-1">{m["message_type"]}</p>
                )}
                <p className="whitespace-pre-wrap break-words">{m["body"] ?? "—"}</p>
                {m["media_url"] && (
                  <a
                    href={m["media_url"]}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block text-xs text-[var(--flow)] underline"
                  >
                    abrir mídia
                  </a>
                )}
                <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                  <span>{hhmm(m["sent_at"] ?? m["received_at"] ?? m["created_at"])}</span>
                  {out && <StatusIcon status={String(m["status"])} />}
                </div>
                {m["error_message"] && (
                  <p className="mt-1 text-[10px] text-[var(--friction)]">{m["error_message"]}</p>
                )}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma mensagem ainda. Envie a primeira pelo campo abaixo.
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border pt-3">
        <div className="flex items-end gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" title="Respostas rápidas">
                <Zap className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 p-2">
              <p className="label-mono mb-2 px-1">Respostas rápidas</p>
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {quickReplies.map((q) => (
                  <button
                    key={q["id"]}
                    onClick={() => applyQuickReply(q["body"])}
                    className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary"
                  >
                    <span className="font-semibold">{q["shortcut"]}</span> · {q["title"]}
                  </button>
                ))}
                {quickReplies.length === 0 && (
                  <p className="px-2 py-2 text-xs text-muted-foreground">
                    Cadastre respostas rápidas em WhatsApp → Conexões.
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Digite uma mensagem..."
            rows={2}
            className="min-h-[44px] flex-1 resize-none"
          />
          <Button onClick={onSend} disabled={sending || !text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="label-mono mt-2">Enter envia · Shift+Enter quebra linha</p>
      </div>
    </div>
  );
}
