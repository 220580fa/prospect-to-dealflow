import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { AlertTriangle, Clock, Flame, MessageCircle, Sparkles } from "lucide-react";
import { brl, compact, daysSince } from "@/lib/crm";
import { cn } from "@/lib/utils";
import type { Row } from "@/lib/crm-data";

export type KanbanCard = {
  id: string;
  stageId: string;
  title: string;
  subtitle?: string;
  value: number;
  owner?: string;
  temperature?: string | null;
  score?: number | null;
  idleDays: number | null;
  hasOverdueTask?: boolean;
  isNew?: boolean;
  unreadCount?: number;
  raw: Row;
};

function CardItem({
  card,
  onOpen,
  onWhatsApp,
}: {
  card: KanbanCard;
  onOpen: (c: KanbanCard) => void;
  onWhatsApp?: (c: KanbanCard) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: card.id });
  const idle = card.idleDays ?? 0;
  const stale = idle >= 7;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(card)}
      className={cn(
        "relative cursor-grab rounded-lg border border-border bg-[var(--surface)] p-3 transition-colors hover:border-[var(--flow)]/50",
        card.isNew && "border-[var(--signal)]/60",
        isDragging && "opacity-40",
      )}
    >
      {card.isNew && (
        <span className="absolute -top-2 -right-2 z-10 flex items-center gap-1 rounded-full bg-[var(--signal)] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#0B1020] uppercase shadow-[0_0_12px_var(--signal)]">
          <Sparkles className="h-3 w-3" /> Novo
        </span>
      )}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm leading-tight font-semibold">{card.title}</p>
        {card.temperature === "quente" && (
          <Flame className="h-3.5 w-3.5 shrink-0 text-[var(--friction)]" />
        )}
      </div>

      {card.subtitle && (
        <p className="mt-1 truncate text-xs text-muted-foreground">{card.subtitle}</p>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className="kpi-number text-sm text-[var(--signal)]">{brl(card.value)}</span>
        {card.owner && <span className="label-mono">{card.owner}</span>}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]",
            stale
              ? "bg-[var(--friction)]/15 text-[var(--friction)]"
              : "bg-secondary text-muted-foreground",
          )}
        >
          <Clock className="h-3 w-3" /> {idle}d na etapa
        </span>
        {card.hasOverdueTask && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--friction)]/15 px-2 py-0.5 text-[10px] text-[var(--friction)]">
            <AlertTriangle className="h-3 w-3" /> tarefa atrasada
          </span>
        )}
        {typeof card.score === "number" && (
          <span className="label-mono">score {card.score}</span>
        )}
        {onWhatsApp && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWhatsApp(card);
            }}
            title="Abrir conversa de WhatsApp"
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--flow)]/15 px-2 py-0.5 text-[10px] text-[var(--flow)] transition-colors hover:bg-[var(--flow)]/25"
          >
            <MessageCircle className="h-3 w-3" /> WhatsApp
            {!!card.unreadCount && (
              <span className="ml-1 rounded-full bg-[var(--friction)] px-1.5 font-bold text-white">
                {card.unreadCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function Column({
  stage,
  cards,
  onOpen,
  onWhatsApp,
}: {
  stage: Row;
  cards: KanbanCard[];
  onOpen: (c: KanbanCard) => void;
  onWhatsApp?: (c: KanbanCard) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage["id"] });
  const total = cards.reduce((s, c) => s + c.value, 0);

  return (
    <div className="flex w-[288px] shrink-0 flex-col">
      <div className="mb-3 flex items-baseline justify-between border-b-2 pb-2" style={{ borderColor: stage["color"] ?? "var(--flow)" }}>
        <div>
          <p className="text-sm font-semibold">{stage["name"]}</p>
          <p className="label-mono mt-1">
            {cards.length} · {compact(total)}
          </p>
        </div>
        <span className="label-mono">{stage["probability"]}%</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[240px] flex-1 flex-col gap-2 rounded-lg p-2 transition-colors",
          isOver ? "bg-[var(--flow)]/10" : "bg-transparent",
        )}
      >
        {cards.map((c) => (
          <CardItem key={c.id} card={c} onOpen={onOpen} onWhatsApp={onWhatsApp} />
        ))}
        {cards.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">Sem cards</p>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({
  stages,
  cards,
  onOpen,
  onMove,
  onWhatsApp,
}: {
  stages: Row[];
  cards: KanbanCard[];
  onOpen: (c: KanbanCard) => void;
  onMove: (card: KanbanCard, stageId: string) => void;
  onWhatsApp?: (c: KanbanCard) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const active = useMemo(() => cards.find((c) => c.id === activeId) ?? null, [activeId, cards]);

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const over = e.over?.id ? String(e.over.id) : null;
    const card = cards.find((c) => c.id === String(e.active.id));
    if (!over || !card || card.stageId === over) return;
    onMove(card, over);
  };

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((s) => (
          <Column
            key={s["id"]}
            stage={s}
            cards={cards.filter((c) => c.stageId === s["id"])}
            onOpen={onOpen}
            onWhatsApp={onWhatsApp}
          />
        ))}
      </div>
      <DragOverlay>
        {active && (
          <div className="w-[272px] rounded-lg border border-[var(--signal)] bg-[var(--surface)] p-3">
            <p className="text-sm font-semibold">{active.title}</p>
            <p className="kpi-number mt-2 text-sm text-[var(--signal)]">{brl(active.value)}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

export const idleDaysOf = (row: Row) => daysSince(row["stage_entered_at"] ?? row["updated_at"]);
