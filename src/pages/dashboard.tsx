import { PhoneCall, Target, Timer, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth";
import { useUsers } from "@/hooks/use-users";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useUsers(1, 100);

  const users = data?.results ?? [];
  const activeCount = users.filter((u) => u.is_active).length;
  const callers = users.filter((u) => !u.exclude_from_calls);
  const totalDailyTarget = callers.reduce((sum, u) => sum + (u.daily_call_target_min ?? 0), 0);
  const totalEnrollTarget = users.reduce(
    (sum, u) => sum + (Number(u.monthly_enrollment_target) || 0),
    0,
  );

  const stats = [
    {
      label: "Team members",
      value: data?.count ?? 0,
      sub: `${activeCount} active`,
      icon: Users,
    },
    {
      label: "Call agents",
      value: callers.length,
      sub: "included in call rotation",
      icon: PhoneCall,
    },
    {
      label: "Daily call target",
      value: `${totalDailyTarget} min`,
      sub: "combined team talk-time goal",
      icon: Timer,
    },
    {
      label: "Monthly enrollment target",
      value: `NPR ${totalEnrollTarget.toLocaleString()}`,
      sub: "combined team goal",
      icon: Target,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-muted-foreground text-sm">
          Success Central — SkillShikshya counseling &amp; sales operations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="gap-2 py-5">
            <CardHeader className="flex-row items-center justify-between">
              <CardDescription>{s.label}</CardDescription>
              <s.icon className="text-brand size-4" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-semibold">{s.value}</p>
              )}
              <p className="text-muted-foreground mt-1 text-xs">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming next</CardTitle>
          <CardDescription>
            These modules light up as their backend APIs ship.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="secondary">Leads</Badge>
          <Badge variant="secondary">Calls</Badge>
          <Badge variant="secondary">Call Minutes</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
