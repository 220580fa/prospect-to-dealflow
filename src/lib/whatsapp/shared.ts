// Client-safe WhatsApp helpers (no secrets, no server imports).

export type WhatsAppDirection = "inbound" | "outbound";
export type WhatsAppStatus = "queued" | "sent" | "delivered" | "read" | "failed";

const digits = (v: string) => (v ?? "").replace(/\D+/g, "");

/**
 * Normaliza números brasileiros para o formato E.164 sem "+": 55 + DDD + número.
 * Aceita "+55 11 99999-9999", "5511999999999", "11999999999", "(11) 9999-9999".
 */
export function normalizePhone(input?: string | null): string | null {
  let d = digits(String(input ?? ""));
  if (!d) return null;
  d = d.replace(/^0+/, "");
  if (d.length > 13 && d.startsWith("55")) d = d.slice(0, 13);
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) return d;
  if (d.length === 10 || d.length === 11) return `55${d}`;
  if (d.length >= 8 && d.length <= 9) return null; // sem DDD: não dá para identificar
  return d.length >= 11 ? d : null;
}

/** Variações plausíveis do mesmo número (com e sem o 9º dígito). */
export function phoneVariants(input?: string | null): string[] {
  const base = normalizePhone(input);
  if (!base) return [];
  const set = new Set<string>([base]);
  if (base.startsWith("55")) {
    const rest = base.slice(2);
    set.add(rest);
    if (rest.length === 11 && rest[2] === "9") {
      const without9 = rest.slice(0, 2) + rest.slice(3);
      set.add(without9);
      set.add(`55${without9}`);
    }
    if (rest.length === 10) {
      const with9 = `${rest.slice(0, 2)}9${rest.slice(2)}`;
      set.add(with9);
      set.add(`55${with9}`);
    }
  }
  return [...set];
}

export function formatPhone(input?: string | null): string {
  const d = normalizePhone(input);
  if (!d) return input ?? "—";
  const rest = d.startsWith("55") ? d.slice(2) : d;
  if (rest.length === 11) return `+55 (${rest.slice(0, 2)}) ${rest.slice(2, 7)}-${rest.slice(7)}`;
  if (rest.length === 10) return `+55 (${rest.slice(0, 2)}) ${rest.slice(2, 6)}-${rest.slice(6)}`;
  return `+${d}`;
}

export type QuickReplyVars = {
  nome?: string | null;
  primeiro_nome?: string | null;
  empresa?: string | null;
  vendedor?: string | null;
  data_reuniao?: string | null;
  link_reuniao?: string | null;
};

export function renderTemplate(body: string, vars: QuickReplyVars): string {
  return body.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_m, key: string) => {
    const value = (vars as Record<string, string | null | undefined>)[key.toLowerCase()];
    return value ? String(value) : "";
  });
}

export const TEMPLATE_VARIABLES = [
  "{{nome}}",
  "{{primeiro_nome}}",
  "{{empresa}}",
  "{{vendedor}}",
  "{{data_reuniao}}",
  "{{link_reuniao}}",
] as const;

export const CONNECTION_STATUS_LABEL: Record<string, string> = {
  conectado: "Conectado",
  conectando: "Aguardando QR Code",
  desconectado: "Desconectado",
  erro: "Erro",
};
