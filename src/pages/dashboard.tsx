import { CalendarClock, Layers, Sparkles, TrendingUp, TriangleAlert, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { DonutChart, FunnelChart } from "@/components/charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth";
import { useDataSource } from "@/context/data-source";
import { LiveDashboard } from "@/pages/dashboard-live";
import {
  counselorLeaderboard,
  KPIS,
  leadFunnel,
  recentActivities,
  sourceBreakdown,
  upcomingFollowUps,
} from "@/data/lead-analytics";
import { formatNPR, formatDateTime, relativeToToday } from "@/lib/leads-format";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/pages/leads/components/lead-badges";

const ACTIVITY_BADGE: Record<string, { label: string; cls: string }> = {
  call: { label: "Call", cls: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  status_change: { label: "Status", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  assignment_change: { label: "Assign", cls: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  follow_up: { label: "Follow-up", cls: "bg-brand-fixed-dim/25 text-brand-container" },
  enrollment: { label: "Enrolled", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  payment: { label: "Payment", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
};

function Kpi({
  label,
  value,
  icon: Icon,
  delta,
  deltaTone = "up",
  tone,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  delta: string;
  deltaTone?: "up" | "warn";
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
      <CardContent className="space-y-2">
        <p className="font-headline text-2xl font-semibold">{value}</p>
        <span
          className={cn(
            "inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-semibold",
            deltaTone === "up"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
          )}
        >
          {delta}
        </span>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { source } = useDataSource();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  if (source === "api") return <LiveDashboard firstName={firstName} />;

  return <MockDashboard />;
}

function MockDashboard() {
  const { user } = useAuth();
  const funnel = leadFunnel();
  const sources = sourceBreakdown();
  const leaders = counselorLeaderboard();
  const upcoming = upcomingFollowUps();
  const activities = recentActivities();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-brand font-mono text-[11px] font-bold tracking-wider uppercase">
          CRM command center
        </p>
        <h1 className="font-headline mt-1 text-3xl font-semibold tracking-tight">
          Welcome back, {user?.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track demand, counselor execution, and admissions movement across the institute.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="New leads" value={KPIS.newLeads} icon={Sparkles} delta="+12.8% vs last week" tone="text-sky-600 dark:text-sky-400" />
        <Kpi label="Follow-ups today" value={KPIS.dueToday} icon={CalendarClock} delta="action needed" deltaTone="warn" tone="text-brand" />
        <Kpi label="Overdue" value={KPIS.overdue} icon={TriangleAlert} delta="needs attention" deltaTone="warn" tone="text-destructive" />
        <Kpi label="Admissions" value={KPIS.admissions} icon={Layers} delta="+7 this month" tone="text-violet-600 dark:text-violet-400" />
        <Kpi label="Enrolled revenue" value={formatNPR(KPIS.revenue)} icon={Wallet} delta="82% collected" tone="text-emerald-600 dark:text-emerald-400" />
      </div>

      {/* Funnel + sources */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead funnel</CardTitle>
            <CardDescription>Inquiry to enrollment by current stage</CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart stages={funnel} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead sources</CardTitle>
            <CardDescription>Top acquisition channels</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart slices={sources} />
          </CardContent>
        </Card>
      </div>

      {/* Activities + upcoming + leaderboard */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activities</CardTitle>
            <CardDescription>Latest CRM touchpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {activities.map((a) => {
              const badge = ACTIVITY_BADGE[a.type] ?? { label: "Event", cls: "bg-muted text-muted-foreground" };
              return (
                <Link
                  key={a.id}
                  to={`/leads/${a.leadId}`}
                  className="bg-surface-container-low hover:bg-accent flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{a.title}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {a.leadName} · {relativeToToday(a.at)}
                    </p>
                  </div>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", badge.cls)}>
                    {badge.label}
                  </span>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming follow-ups</CardTitle>
            <CardDescription>Next counselor actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.map((u) => (
              <Link
                key={u.id}
                to={`/leads/${u.id}`}
                className="bg-surface-container-low hover:bg-accent flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{u.name}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {formatDateTime(u.dueAt)} — {u.purpose}
                  </p>
                </div>
                <PriorityBadge priority={u.priority as never} showLabel={false} />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Counselor leaderboard</CardTitle>
            <CardDescription>Conversions this cycle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {leaders.map((l, i) => (
              <div
                key={l.id}
                className="bg-surface-container-low flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground font-mono text-xs font-bold">#{i + 1}</span>
                  <div>
                    <p className="text-sm font-semibold">{l.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {l.admissions} admissions · {l.followUps} follow-ups
                    </p>
                  </div>
                </div>
                <span className="text-brand flex items-center gap-1 text-sm font-bold">
                  <TrendingUp className="size-3.5" />
                  {l.conversionPct}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
