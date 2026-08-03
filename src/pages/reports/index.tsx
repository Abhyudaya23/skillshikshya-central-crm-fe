import { useQuery } from "@tanstack/react-query";
import { Download, Filter } from "lucide-react";
import { toast } from "sonner";
import { DonutChart, HBarList, MiniBars } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataSource } from "@/context/data-source";
import {
  counselorLeaderboard,
  courseDemand,
  KPIS,
  leadFunnel,
  priorityMix,
  sourceBreakdown,
} from "@/data/lead-analytics";
import { formatNPR } from "@/lib/leads-format";
import { leadsService } from "@/services/leads.service";
import { Skeleton } from "@/components/ui/skeleton";

const DONUT_COLORS = ["#00694c", "#008561", "#67dbae", "#f59e0b", "#64748b", "#0ea5e9", "#a855f7"];

function LiveReports() {
  const sampleQ = useQuery({
    queryKey: ["reports-sample"],
    queryFn: () => leadsService.list({ page: 1, page_size: 100, ordering: "-created_at" }),
    staleTime: 60 * 1000,
  });
  const sample = sampleQ.data?.results ?? [];

  const byStatus = new Map<string, number>();
  const bySource = new Map<string, number>();
  const byCourse = new Map<string, number>();
  for (const l of sample) {
    byStatus.set(l.status_name ?? "—", (byStatus.get(l.status_name ?? "—") ?? 0) + 1);
    bySource.set(l.source_name ?? "—", (bySource.get(l.source_name ?? "—") ?? 0) + 1);
    if (l.primary_course_name) byCourse.set(l.primary_course_name, (byCourse.get(l.primary_course_name) ?? 0) + 1);
  }
  const bars = (m: Map<string, number>, n = 6) =>
    [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, value]) => ({ label, value }));
  const sourceSlices = bars(bySource).map((d, i) => ({
    label: d.label,
    count: d.value,
    pct: Math.round((d.value / Math.max(1, sample.length)) * 100),
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-brand font-mono text-[11px] font-bold tracking-wider uppercase">Modern analytics</p>
        <h1 className="font-headline mt-1 text-3xl font-semibold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Live distributions from the latest {sample.length} leads. Full aggregate reporting arrives with
          the backend endpoints noted in lead-additional.md.
        </p>
      </div>
      {sampleQ.isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">By status</CardTitle>
            </CardHeader>
            <CardContent>
              <HBarList data={bars(byStatus)} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">By source</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart slices={sourceSlices} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top courses</CardTitle>
            </CardHeader>
            <CardContent>
              {byCourse.size ? (
                <HBarList data={bars(byCourse)} />
              ) : (
                <p className="text-muted-foreground text-sm">No course data.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const { source } = useDataSource();
  if (source === "api") return <LiveReports />;

  return <MockReports />;
}

function MockReports() {
  const funnel = leadFunnel();
  const sources = sourceBreakdown();
  const leaders = counselorLeaderboard();
  const courses = courseDemand();
  const priorities = priorityMix();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-brand font-mono text-[11px] font-bold tracking-wider uppercase">
            Modern analytics
          </p>
          <h1 className="font-headline mt-1 text-3xl font-semibold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Source performance, conversion, course demand, counselor output, and revenue.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info("Filters — prototype")}>
            <Filter /> Filters
          </Button>
          <Button variant="outline" onClick={() => toast.info("Export — prototype")}>
            <Download /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead sources</CardTitle>
            <CardDescription>Share of leads by acquisition channel</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart slices={sources} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversion funnel</CardTitle>
            <CardDescription>Leads reaching each stage</CardDescription>
          </CardHeader>
          <CardContent>
            <HBarList data={funnel.map((f) => ({ label: f.label, value: f.count }))} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course demand</CardTitle>
            <CardDescription>Top primary course interests</CardDescription>
          </CardHeader>
          <CardContent>
            <HBarList data={courses} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Priority mix</CardTitle>
            <CardDescription>Hot / Warm / Cool / Cold</CardDescription>
          </CardHeader>
          <CardContent>
            <MiniBars values={priorities.map((p) => p.value)} />
            <div className="text-muted-foreground mt-2 flex justify-between text-xs">
              {priorities.map((p) => (
                <span key={p.label}>{p.label}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Counselor output</CardTitle>
            <CardDescription>Admissions closed</CardDescription>
          </CardHeader>
          <CardContent>
            <HBarList
              data={leaders.map((l) => ({ label: l.name.split(" ")[0], value: l.admissions }))}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue trend</CardTitle>
            <CardDescription>Collected fees (last 7 weeks)</CardDescription>
          </CardHeader>
          <CardContent>
            <MiniBars values={[73, 56, 67, 49, 76, 62, 84]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign quality</CardTitle>
            <CardDescription>Avg. lead score by campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <MiniBars values={[66, 74, 46, 81, 53]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enrollment</CardTitle>
            <CardDescription>Batch fill rate</CardDescription>
          </CardHeader>
          <CardContent>
            <MiniBars values={[58, 64, 79, 51, 69]} />
          </CardContent>
        </Card>
      </div>

      <p className="text-muted-foreground text-center text-xs">
        Static preview — figures derive from the mock lead dataset. Enrolled revenue booked to date:{" "}
        <span className="text-foreground font-semibold">{formatNPR(KPIS.revenue)}</span>.
      </p>
    </div>
  );
}
