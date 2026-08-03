import { Flame, Snowflake, Thermometer, ThermometerSun } from "lucide-react";
import { PRIORITY_BY_CODE, STATUS_BY_CODE } from "@/data/lead-lookups";
import { cn } from "@/lib/utils";
import type { LeadPriorityCode, LeadStatusCode } from "@/types/leads";

const STATUS_CLASSES: Record<string, string> = {
  open: "bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/20 dark:text-sky-300",
  active: "bg-brand-fixed-dim/20 text-brand-container ring-1 ring-brand/15",
  won: "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/25 dark:text-emerald-300",
  lost: "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
  neutral: "bg-muted text-muted-foreground ring-1 ring-border",
};

const PILL = "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

/** Tint a hex color for the pill background (~12% alpha). */
function tint(hex: string): React.CSSProperties {
  const clean = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#64748b";
  return { color: clean, backgroundColor: `${clean}1f` };
}

/**
 * Status badge. On the mock path pass a fixed `status` code (semantic colors);
 * on the live path pass `name` + `color` (the admin-defined status hex).
 */
export function StatusBadge({
  status,
  name,
  color,
  className,
}: {
  status?: LeadStatusCode;
  name?: string;
  color?: string;
  className?: string;
}) {
  if (color) {
    return (
      <span className={cn(PILL, className)} style={tint(color)}>
        <span className="size-1.5 rounded-full bg-current opacity-70" />
        {name ?? status ?? "—"}
      </span>
    );
  }
  const meta = status ? STATUS_BY_CODE.get(status) : undefined;
  return (
    <span className={cn(PILL, STATUS_CLASSES[meta?.category ?? "neutral"], className)}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {name ?? meta?.label ?? status ?? "—"}
    </span>
  );
}

const PRIORITY_META: Record<
  LeadPriorityCode,
  { cls: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  hot: { cls: "bg-orange-500/10 text-orange-600 ring-1 ring-orange-500/20 dark:text-orange-400", Icon: Flame },
  warm: { cls: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-400", Icon: ThermometerSun },
  cool: { cls: "bg-yellow-500/10 text-yellow-700 ring-1 ring-yellow-500/20 dark:text-yellow-400", Icon: Thermometer },
  cold: { cls: "bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/20 dark:text-sky-400", Icon: Snowflake },
};

/** Pick a thermometer icon when a live priority name hints hot/warm/cool/cold. */
function iconForName(name: string) {
  const n = name.toLowerCase();
  if (n.includes("hot")) return Flame;
  if (n.includes("warm")) return ThermometerSun;
  if (n.includes("cool")) return Thermometer;
  if (n.includes("cold")) return Snowflake;
  return null;
}

export function PriorityBadge({
  priority,
  name,
  color,
  className,
  showLabel = true,
}: {
  priority?: LeadPriorityCode;
  name?: string;
  color?: string;
  className?: string;
  showLabel?: boolean;
}) {
  // No priority assigned (e.g. leads from the public enroll form) — show nothing
  // rather than a misleading default.
  if (!color && !name && !priority) return null;
  if (color || name) {
    const label = name ?? priority ?? "—";
    const Icon = iconForName(label);
    return (
      <span
        title={label}
        className={cn("inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", className)}
        style={color ? tint(color) : undefined}
      >
        {Icon ? <Icon className="size-3" /> : <span className="size-1.5 rounded-full bg-current opacity-70" />}
        {showLabel && label}
      </span>
    );
  }
  const meta = priority ? PRIORITY_META[priority] : undefined;
  const label = (priority && PRIORITY_BY_CODE.get(priority)?.label) ?? priority ?? "—";
  const Icon = meta?.Icon ?? Thermometer;
  return (
    <span
      title={label}
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        meta?.cls ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      <Icon className="size-3" />
      {showLabel && label}
    </span>
  );
}

export function ScoreBar({ score, className }: { score: number; className?: string }) {
  const tone =
    score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : score >= 30 ? "bg-orange-500" : "bg-slate-400";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="bg-muted relative h-1.5 w-12 overflow-hidden rounded-full">
        <span className={cn("absolute inset-y-0 left-0 rounded-full", tone)} style={{ width: `${score}%` }} />
      </span>
      <span className="text-xs font-semibold tabular-nums">{score}</span>
    </span>
  );
}
