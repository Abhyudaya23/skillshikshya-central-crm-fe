import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CheckCircle2, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { DonutChart, HBarList } from "@/components/charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { leadsService, type LeadListParams } from "@/services/leads.service";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/leads-format";

const DONUT_COLORS = ["#00694c", "#008561", "#67dbae", "#f59e0b", "#64748b", "#0ea5e9", "#a855f7"];

function useCount(key: string, params: LeadListParams) {
  return useQuery({
    queryKey: ["lead-count", key],
    queryFn: () => leadsService.list({ ...params, page: 1, page_size: 1 }).then((d) => d.count),
    staleTime: 60 * 1000,
  });
}

function Kpi({
  label,
  value,
  loading,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <Card className="gap-2 py-5">
      <CardHeader className="flex-row items-center justify-between">
        <CardDescription className="font-mono text-[11px] font-medium tracking-wider uppercase">
          {label}
        </CardDescription>
        <Icon className={cn("size-4", tone)} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="font-headline text-2xl font-semibold">{value ?? 0}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function LiveDashboard({ firstName }: { firstName: string }) {
  const now = new Date().toISOString();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const total = useCount("total", {});
  const converted = useCount("converted", { is_converted: true });
  const due = useCount("due", { next_followup_at__lte: now });
  const thisMonth = useCount("month", { created_at__gte: monthStart });

  // A sample of the latest leads drives the distribution charts (approximate for
  // large datasets — see lead-additional.md; real aggregates await BE endpoints).
  const sampleQ = useQuery({
    queryKey: ["lead-sample"],
    queryFn: () => leadsService.list({ page: 1, page_size: 100, ordering: "-created_at" }),
    staleTime: 60 * 1000,
  });
  const sample = sampleQ.data?.results ?? [];

  const byStatus = new Map<string, { count: number; color: string }>();
  const bySource = new Map<string, number>();
  for (const l of sample) {
    const sName = l.status_name ?? "—";
    byStatus.set(sName, { count: (byStatus.get(sName)?.count ?? 0) + 1, color: l.status_color ?? "#64748b" });
    const src = l.source_name ?? "—";
    bySource.set(src, (bySource.get(src) ?? 0) + 1);
  }
  const statusBars = [...byStatus.entries()].map(([label, v]) => ({ label, value: v.count }));
  const sourceSlices = [...bySource.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, count], i) => ({
      label,
      count,
      pct: Math.round((count / Math.max(1, sample.length)) * 100),
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));

  const recent = sample.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-brand font-mono text-[11px] font-bold tracking-wider uppercase">
          CRM command center
        </p>
        <h1 className="font-headline mt-1 text-3xl font-semibold tracking-tight">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Live pipeline snapshot from the backend.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total leads" value={total.data} loading={total.isLoading} icon={Users} tone="text-sky-600 dark:text-sky-400" />
        <Kpi label="Follow-ups due" value={due.data} loading={due.isLoading} icon={CalendarClock} tone="text-destructive" />
        <Kpi label="New this month" value={thisMonth.data} loading={thisMonth.isLoading} icon={Sparkles} tone="text-brand" />
        <Kpi label="Converted" value={converted.data} loading={converted.isLoading} icon={CheckCircle2} tone="text-emerald-600 dark:text-emerald-400" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status distribution</CardTitle>
            <CardDescription>Latest {sample.length} leads by status</CardDescription>
          </CardHeader>
          <CardContent>
            {sampleQ.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : statusBars.length ? (
              <HBarList data={statusBars} />
            ) : (
              <p className="text-muted-foreground text-sm">No leads yet.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead sources</CardTitle>
            <CardDescription>Latest {sample.length} leads</CardDescription>
          </CardHeader>
          <CardContent>
            {sampleQ.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : sourceSlices.length ? (
              <DonutChart slices={sourceSlices} />
            ) : (
              <p className="text-muted-foreground text-sm">No leads yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent leads</CardTitle>
          <CardDescription>Newest inquiries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {recent.map((l) => (
            <Link
              key={l.id}
              to={`/leads/${l.id}`}
              className="bg-surface-container-low hover:bg-accent flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{l.full_name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {l.primary_course_name ?? l.source_name ?? "—"} · {formatDate(l.created_at)}
                </p>
              </div>
              {l.status_name && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ color: l.status_color ?? undefined, backgroundColor: `${l.status_color ?? "#64748b"}1f` }}
                >
                  {l.status_name}
                </span>
              )}
            </Link>
          ))}
          {!sampleQ.isLoading && recent.length === 0 && (
            <p className="text-muted-foreground py-6 text-center text-sm">No leads yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
