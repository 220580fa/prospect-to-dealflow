export const PROSPECT_FUNNEL_ID = "11111111-1111-4111-8111-111111111111";
export const SALES_FUNNEL_ID = "22222222-2222-4222-8222-222222222222";

export const brl = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(v ?? 0));

export const compact = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(
    Number(v ?? 0),
  );

export const pct = (v: number | null | undefined) => `${Math.round(Number(v ?? 0))}%`;

export const daysSince = (date?: string | null) => {
  if (!date) return null;
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
};

export const dateTime = (d?: string | null) =>
  d ? new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

export const dateShort = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : "—";

export const agingTone = (days: number | null, limits = { green: 3, yellow: 7 }) => {
  if (days === null) return "friction";
  if (days <= limits.green) return "signal";
  if (days <= limits.yellow) return "flow";
  return "friction";
};

export const TEMPERATURES = [
  { value: "frio", label: "Frio" },
  { value: "morno", label: "Morno" },
  { value: "quente", label: "Quente" },
] as const;

export const SOURCES = [
  "Outbound",
  "Inbound",
  "Google Ads",
  "Meta Ads",
  "Instagram",
  "LinkedIn",
  "Indicação",
  "Evento",
  "Parceiro",
  "Site",
  "Importação",
  "Outro",
];

export const TASK_TYPES = [
  { value: "ligacao", label: "Ligação" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "E-mail" },
  { value: "follow_up", label: "Follow-up" },
  { value: "reuniao", label: "Reunião" },
  { value: "proposta", label: "Enviar proposta" },
  { value: "retorno", label: "Retornar contato" },
  { value: "outro", label: "Tarefa personalizada" },
];

export const PRIORITIES = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

export const FOLLOWUP_CHANNELS = ["Ligação", "WhatsApp", "E-mail", "Reunião", "LinkedIn", "Outro"];
export const FOLLOWUP_RESULTS = [
  "Contato realizado",
  "Sem resposta",
  "Interessado",
  "Solicitou retorno",
  "Reunião marcada",
  "Proposta solicitada",
  "Não interessado",
];

export const IMPACTS = [
  "Aumento de custos",
  "Perda de produtividade",
  "Retrabalho",
  "Falta de controle",
  "Falta de previsibilidade",
  "Perda de receita",
  "Riscos operacionais",
  "Dificuldade de gestão",
  "Outro",
];

export const NEXT_ACTIONS = [
  "Enviar proposta",
  "Enviar apresentação",
  "Enviar orçamento",
  "Enviar informações adicionais",
  "Agendar nova reunião",
  "Fazer follow-up",
  "Aguardar retorno do cliente",
  "Outra",
];

export const TIMINGS = [
  "Imediatamente",
  "Até 30 dias",
  "31 a 60 dias",
  "61 a 90 dias",
  "Mais de 90 dias",
  "Sem previsão",
];

export const scoreLabel = (score: number) => {
  if (score <= 30) return "Frio";
  if (score <= 60) return "Morno";
  if (score <= 80) return "Quente";
  return "Muito quente";
};

export const leadName = (l: { first_name?: string | null; last_name?: string | null }) =>
  [l.first_name, l.last_name].filter(Boolean).join(" ");

export const initials = (name?: string | null) =>
  (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
