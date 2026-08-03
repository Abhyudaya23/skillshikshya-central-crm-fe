import {
  ArrowRightLeft,
  CalendarClock,
  CreditCard,
  FileText,
  GraduationCap,
  Mail,
  MessageCircle,
  PhoneCall,
  RefreshCw,
  StickyNote,
  UserRound,
} from "lucide-react";
import { formatDateTime, formatDuration } from "@/lib/leads-format";
import { cn } from "@/lib/utils";
import type { Activity, ActivityType } from "@/types/leads";

const ICONS: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  form_submission: FileText,
  call: PhoneCall,
  email: Mail,
  whatsapp: MessageCircle,
  sms: MessageCircle,
  office_visit: UserRound,
  online_meeting: UserRound,
  note: StickyNote,
  follow_up: CalendarClock,
  status_change: RefreshCw,
  assignment_change: ArrowRightLeft,
  enrollment: GraduationCap,
  payment: CreditCard,
};

const TONES: Partial<Record<ActivityType, string>> = {
  call: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  follow_up: "bg-brand-fixed-dim/25 text-brand-container",
  status_change: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  assignment_change: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  enrollment: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  payment: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-headline text-base font-semibold">No activity yet</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Calls, notes, and follow-ups will appear here.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-1">
      {activities.map((a, i) => {
        const Icon = ICONS[a.type] ?? StickyNote;
        const tone = TONES[a.type] ?? "bg-muted text-muted-foreground";
        const last = i === activities.length - 1;
        return (
          <li key={a.id} className="relative flex gap-3 pb-5">
            {!last && <span className="bg-border absolute top-9 left-[15px] h-full w-px" />}
            <span className={cn("z-10 flex size-8 shrink-0 items-center justify-center rounded-full", tone)}>
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-sm font-medium">{a.title}</p>
                <time className="text-muted-foreground shrink-0 text-xs">{formatDateTime(a.at)}</time>
              </div>
              {a.notes && <p className="text-muted-foreground mt-0.5 text-sm">{a.notes}</p>}
              <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-3 text-xs">
                <span>By {a.performedBy}</span>
                {a.durationSeconds != null && <span>Duration: {formatDuration(a.durationSeconds)}</span>}
                {a.followUpAt && <span>Follow-up: {formatDateTime(a.followUpAt)}</span>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
