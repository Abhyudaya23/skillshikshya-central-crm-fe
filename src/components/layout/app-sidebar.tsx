import {
  LayoutDashboard,
  PhoneCall,
  Timer,
  UserRound,
  Users,
  ShieldCheck,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/leads", label: "Leads", icon: UserRound },
  { to: "/calls", label: "Calls", icon: PhoneCall },
  { to: "/call-minutes", label: "Call Minutes", icon: Timer },
  { to: "/users", label: "Users", icon: Users },
];

const adminItems: NavItem[] = [{ to: "/roles", label: "Roles & Permissions", icon: ShieldCheck }];

export function AppSidebar() {
  const { user } = useAuth();
  const items = user?.is_staff ? [...navItems, ...adminItems] : navItems;

  return (
    <aside className="bg-sidebar border-sidebar-border hidden w-60 shrink-0 flex-col border-r md:flex">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="bg-brand flex size-8 items-center justify-center rounded-lg text-sm font-bold text-white">
          SC
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Success Central</p>
          <p className="text-muted-foreground text-xs">SkillShikshya CRM</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand/10 text-brand"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="text-muted-foreground border-t p-4 text-xs">
        Skill Shikshya Pvt. Ltd.
        <br />
        Sankhamul, Kathmandu
      </div>
    </aside>
  );
}
