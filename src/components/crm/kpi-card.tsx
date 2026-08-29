import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  tone = "default",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "signal" | "flow" | "friction";
  className?: string;
}) {
  const toneColor =
    tone === "signal"
      ? "text-[var(--signal)]"
      : tone === "flow"
        ? "text-[var(--flow)]"
        : tone === "friction"
          ? "text-[var(--friction)]"
          : "text-foreground";

  return (
    <div className={cn("panel p-5", className)}>
      <p className="label-mono">{label}</p>
      <p className={cn("kpi-number mt-3 text-3xl", toneColor)}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
