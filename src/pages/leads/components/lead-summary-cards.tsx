import { CalendarClock, GraduationCap, Sparkles, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LeadListItem } from "@/types/leads";
import { isDueToday, isOverdue, TODAY } from "@/lib/leads-format";

function countThisMonth(leads: LeadListItem[]): number {
  return leads.filter((l) => {
    if (l.status !== "enrolled") return false;
    const d = new Date(l.createdAt);
    return d.getFullYear() === TODAY.getFullYear() && d.getMonth() === TODAY.getMonth();
  }).length;
}

export function LeadSummaryCards({ leads }: { leads: LeadListItem[] }) {
  const newLeads = leads.filter((l) => l.status === "new").length;
  const dueToday = leads.filter((l) => isDueToday(l.nextFollowUpAt)).length;
  const overdue = leads.filter(
    (l) => l.nextFollowUpAt && isOverdue(l.nextFollowUpAt) && l.status !== "enrolled",
  ).length;
  const enrolled = countThisMonth(leads);

  const hotDue = leads.filter((l) => isDueToday(l.nextFollowUpAt) && l.priority === "hot").length;

  const cards = [
    {
      label: "New leads",
      value: newLeads,
      icon: Sparkles,
      tone: "text-sky-600 dark:text-sky-400",
      delta: "+12.8% vs last week",
      deltaTone: "up" as const,
    },
    {
      label: "Follow-ups due today",
      value: dueToday,
      icon: CalendarClock,
      tone: "text-brand",
      delta: hotDue > 0 ? `${hotDue} high priority` : "on track",
      deltaTone: hotDue > 0 ? ("warn" as const) : ("up" as const),
    },
    {
      label: "Overdue follow-ups",
      value: overdue,
      icon: TriangleAlert,
      tone: "text-destructive",
      delta: overdue > 0 ? "needs attention" : "all clear",
      deltaTone: overdue > 0 ? ("warn" as const) : ("up" as const),
    },
    {
      label: "Enrolled this month",
      value: enrolled,
      icon: GraduationCap,
      tone: "text-emerald-600 dark:text-emerald-400",
      delta: "+7 this month",
      deltaTone: "up" as const,
    },
  ];

  const deltaClass = {
    up: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    warn: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className="gap-2 py-5">
          <CardHeader className="flex-row items-center justify-between">
            <CardDescription className="font-mono text-[11px] font-medium tracking-wider uppercase">
              {c.label}
            </CardDescription>
            <c.icon className={cn("size-4", c.tone)} />
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-headline text-2xl font-semibold">{c.value}</p>
            <span
              className={cn(
                "inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-semibold",
                deltaClass[c.deltaTone],
              )}
            >
              {c.delta}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
