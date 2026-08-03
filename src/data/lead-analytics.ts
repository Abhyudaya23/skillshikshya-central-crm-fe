/**
 * Derived analytics over the mock lead dataset. Pure functions computed once
 * at module load — feed the dashboard command center and the reports console.
 * When the API ships these become server-side aggregates.
 */

import { isDueToday, isOverdue, TODAY } from "@/lib/leads-format";
import type { Activity, LeadStatusCode } from "@/types/leads";
import { ALL_LEADS } from "./mock-leads";
import { COUNSELORS, counselorName, sourceLabel } from "./lead-lookups";

const active = ALL_LEADS.filter((l) => !l.isArchived);

/* ------------------------------------------------------------------- KPIs */

const enrolledLeads = active.filter((l) => l.status === "enrolled");

export const KPIS = {
  newLeads: active.filter((l) => l.status === "new").length,
  dueToday: active.filter((l) => isDueToday(l.nextFollowUpAt)).length,
  overdue: active.filter(
    (l) => l.nextFollowUpAt && isOverdue(l.nextFollowUpAt) && l.status !== "enrolled",
  ).length,
  admissions: active.filter((l) =>
    ["enrollment_pending", "enrolled"].includes(l.status),
  ).length,
  enrolled: enrolledLeads.length,
  revenue: enrolledLeads.reduce((sum, l) => sum + (l.enrollment?.agreedAmount ?? 0), 0),
  totalActive: active.length,
};

/* ------------------------------------------------------------ lead funnel */

/** Map the 13 lifecycle statuses into a 5-stage acquisition funnel. */
const FUNNEL_MAP: Record<LeadStatusCode, number> = {
  new: 0,
  contact_attempted: 0,
  contacted: 1,
  follow_up_scheduled: 1,
  qualified: 2,
  counseling_completed: 2,
  on_hold: 1,
  enrollment_pending: 3,
  enrolled: 4,
  lost: 1,
  not_interested: 1,
  invalid: 0,
  duplicate: 0,
};

export interface FunnelStage {
  label: string;
  count: number;
  pct: number;
}

export function leadFunnel(): FunnelStage[] {
  const labels = ["New", "Contacted", "Qualified", "Admission", "Enrolled"];
  // Cumulative funnel: each stage counts leads that reached it or beyond.
  const reached = [0, 0, 0, 0, 0];
  for (const lead of active) {
    const stage = FUNNEL_MAP[lead.status];
    for (let i = 0; i <= stage; i++) reached[i] += 1;
  }
  const top = reached[0] || 1;
  return labels.map((label, i) => ({
    label,
    count: reached[i],
    pct: Math.round((reached[i] / top) * 100),
  }));
}

/* --------------------------------------------------------- source split */

export interface SourceSlice {
  label: string;
  count: number;
  pct: number;
  color: string;
}

const SOURCE_COLORS = ["#00694c", "#008561", "#67dbae", "#f59e0b", "#64748b", "#0ea5e9", "#a855f7"];

export function sourceBreakdown(): SourceSlice[] {
  const counts = new Map<string, number>();
  for (const lead of active) {
    counts.set(lead.source, (counts.get(lead.source) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const total = active.length || 1;
  const top = sorted.slice(0, 5);
  const otherCount = sorted.slice(5).reduce((s, [, c]) => s + c, 0);
  const slices: SourceSlice[] = top.map(([src, count], i) => ({
    label: sourceLabel(src as never),
    count,
    pct: Math.round((count / total) * 100),
    color: SOURCE_COLORS[i % SOURCE_COLORS.length],
  }));
  if (otherCount > 0) {
    slices.push({
      label: "Other",
      count: otherCount,
      pct: Math.round((otherCount / total) * 100),
      color: SOURCE_COLORS[5],
    });
  }
  return slices;
}

/* --------------------------------------------------- counselor leaderboard */

export interface LeaderRow {
  id: string;
  name: string;
  admissions: number;
  followUps: number;
  conversionPct: number;
}

export function counselorLeaderboard(): LeaderRow[] {
  return COUNSELORS.map((c) => {
    const owned = active.filter((l) => l.assignedTo === c.id);
    const admissions = owned.filter((l) => l.status === "enrolled").length;
    const followUps = owned.reduce((s, l) => s + l.followUps.length, 0);
    const conversionPct = owned.length ? Math.round((admissions / owned.length) * 100) : 0;
    return { id: c.id, name: c.name, admissions, followUps, conversionPct };
  })
    .filter((r) => r.admissions > 0 || r.followUps > 0)
    .sort((a, b) => b.admissions - a.admissions || b.conversionPct - a.conversionPct)
    .slice(0, 5);
}

/* ---------------------------------------------------- lists for dashboard */

export interface UpcomingRow {
  id: string;
  name: string;
  dueAt: string;
  purpose: string;
  priority: string;
}

export function upcomingFollowUps(limit = 5): UpcomingRow[] {
  return active
    .filter((l) => l.nextFollowUpAt)
    .sort((a, b) => new Date(a.nextFollowUpAt!).getTime() - new Date(b.nextFollowUpAt!).getTime())
    .slice(0, limit)
    .map((l) => ({
      id: l.id,
      name: l.fullName,
      dueAt: l.nextFollowUpAt!,
      purpose: l.followUps[0]?.purpose ?? "Follow up",
      priority: l.priority ?? "",
    }));
}

export interface RecentActivityRow extends Activity {
  leadId: string;
  leadName: string;
}

export function recentActivities(limit = 6): RecentActivityRow[] {
  const all: RecentActivityRow[] = [];
  for (const lead of active) {
    for (const a of lead.activities) {
      if (a.type === "form_submission") continue;
      all.push({ ...a, leadId: lead.id, leadName: lead.fullName });
    }
  }
  return all
    .filter((a) => new Date(a.at).getTime() <= TODAY.getTime())
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit);
}

/* ------------------------------------------------------------ report data */

export interface BarDatum {
  label: string;
  value: number;
}

export function courseDemand(limit = 6): BarDatum[] {
  const counts = new Map<string, number>();
  for (const lead of active) {
    const primary = lead.courseInterests.find((c) => c.isPrimary);
    if (primary) counts.set(primary.courseName, (counts.get(primary.courseName) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
}

export function priorityMix(): BarDatum[] {
  const order = ["hot", "warm", "cool", "cold"] as const;
  return order.map((p) => ({
    label: p[0].toUpperCase() + p.slice(1),
    value: active.filter((l) => l.priority === p).length,
  }));
}

export { counselorName };
