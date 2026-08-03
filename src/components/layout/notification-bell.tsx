import { Bell, TriangleAlert, Upload, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataSource } from "@/context/data-source";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

/** Static preview shown on the Mock data source. */
const MOCK_NOTICES = [
  {
    icon: TriangleAlert,
    title: "4 overdue follow-ups",
    meta: "Two hot leads need action today.",
    tone: "text-destructive bg-destructive/10",
  },
  {
    icon: Wallet,
    title: "Payment received",
    meta: "NPR 25,000 posted for Prithvi Man Singh.",
    tone: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    icon: Upload,
    title: "Import complete",
    meta: "78 Facebook campaign leads are ready.",
    tone: "text-brand bg-brand-fixed-dim/25",
  },
];

/** Compact "time ago" using the real clock (leads-format TODAY is frozen). */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export function NotificationBell() {
  const { source } = useDataSource();
  const isApi = source === "api";
  const navigate = useNavigate();

  const listQ = useNotifications(isApi);
  const countQ = useUnreadCount(isApi);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = listQ.data?.results ?? [];
  const unread = isApi ? (countQ.data ?? 0) : MOCK_NOTICES.length;

  function open(id: number, link: string | null, isRead: boolean) {
    if (!isRead) markRead.mutate(id);
    if (link) navigate(link);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hover:bg-surface-container-low relative cursor-pointer rounded-full p-2 transition-all active:scale-95"
          aria-label="Notifications"
        >
          <Bell className="text-muted-foreground size-5" />
          {unread > 0 && (
            <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {isApi ? (
            unread > 0 && (
              <button
                type="button"
                className="text-brand text-xs font-medium hover:underline"
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
              >
                Mark all read
              </button>
            )
          ) : (
            <span className="text-muted-foreground text-xs font-normal">{unread} new</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Mock preview */}
        {!isApi && (
          <div className="space-y-1 p-1">
            {MOCK_NOTICES.map((n) => (
              <div key={n.title} className="hover:bg-surface-container-low flex gap-3 rounded-md p-2">
                <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", n.tone)}>
                  <n.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-muted-foreground text-xs">{n.meta}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Live */}
        {isApi && (
          <div className="max-h-96 space-y-1 overflow-y-auto p-1">
            {listQ.isLoading && (
              <p className="text-muted-foreground p-4 text-center text-sm">Loading…</p>
            )}
            {!listQ.isLoading && items.length === 0 && (
              <p className="text-muted-foreground p-6 text-center text-sm">You're all caught up.</p>
            )}
            {items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => open(n.id, n.link, n.is_read)}
                className={cn(
                  "hover:bg-surface-container-low flex w-full gap-3 rounded-md p-2 text-left",
                  !n.is_read && "bg-brand-fixed-dim/10",
                )}
              >
                <span
                  className={cn(
                    "mt-1 size-2 shrink-0 rounded-full",
                    n.is_read ? "bg-transparent" : "bg-brand",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm", n.is_read ? "font-medium" : "font-semibold")}>{n.title}</p>
                  <p className="text-muted-foreground line-clamp-2 text-xs">{n.message}</p>
                  <p className="text-muted-foreground mt-0.5 text-[11px]">{timeAgo(n.created_at)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
