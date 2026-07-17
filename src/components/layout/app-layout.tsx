import { KeyRound, LogOut } from "lucide-react";
import { useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ChangePasswordDialog } from "@/components/layout/change-password-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth";

export function AppLayout() {
  const { status, user, logout } = useAuth();
  const navigate = useNavigate();
  const [changePwOpen, setChangePwOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="w-64 space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  const initials =
    user?.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="flex h-dvh overflow-hidden">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 md:px-6">
          <div className="md:hidden">
            <div className="bg-brand flex size-8 items-center justify-center rounded-lg text-sm font-bold text-white">
              SC
            </div>
          </div>
          <div className="hidden md:block" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <span className="bg-brand/10 text-brand flex size-8 items-center justify-center rounded-full text-xs font-semibold">
                  {initials}
                </span>
                <span className="hidden text-sm font-medium sm:block">{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p>{user?.name}</p>
                <p className="text-muted-foreground text-xs font-normal">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setChangePwOpen(true)}>
                <KeyRound /> Change password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  void logout().then(() => navigate("/login"));
                }}
              >
                <LogOut /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <ChangePasswordDialog open={changePwOpen} onOpenChange={setChangePwOpen} />
    </div>
  );
}
