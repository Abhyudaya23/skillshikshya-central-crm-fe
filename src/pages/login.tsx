import { useState } from "react";
import { MailCheck } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth";
import { apiErrorMessage } from "@/lib/api";
import { authService } from "@/services/auth.service";

type Mode = "login" | "forgot-email" | "forgot-sent";

export default function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (status === "authenticated") return <Navigate to="/" replace />;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Request failed"));
    } finally {
      setBusy(false);
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      await login(email, password);
      navigate("/", { replace: true });
    });
  };

  const handleForgotEmail = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      await authService.forgotPassword(email);
      setMode("forgot-sent");
    });
  };

  return (
    <div className="bg-background flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="bg-brand-container font-headline mx-auto mb-2 flex size-12 items-center justify-center rounded-xl text-lg font-bold text-white">
            SC
          </div>
          <CardTitle className="font-headline text-xl">SkillShikshya Central CRM</CardTitle>
          <CardDescription>
            {mode === "login" && "Sign in to your SkillShikshya account"}
            {mode === "forgot-email" && "Enter your email to receive a reset link"}
            {mode === "forgot-sent" && "Check your inbox"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@skillshikshya.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-brand text-xs hover:underline"
                    onClick={() => setMode("forgot-email")}
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" variant="brand" className="w-full" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          )}

          {mode === "forgot-email" && (
            <form onSubmit={handleForgotEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fp-email">Email</Label>
                <Input
                  id="fp-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-muted-foreground text-xs">
                  We'll email you a reset link. It expires in 15 minutes.
                </p>
              </div>
              <Button type="submit" variant="brand" className="w-full" disabled={busy}>
                {busy ? "Sending…" : "Send reset link"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setMode("login")}
              >
                Back to sign in
              </Button>
            </form>
          )}

          {mode === "forgot-sent" && (
            <div className="space-y-4 text-center">
              <div className="bg-brand-container/10 text-brand mx-auto flex size-12 items-center justify-center rounded-full">
                <MailCheck className="size-6" />
              </div>
              <p className="text-muted-foreground text-sm">
                If an account exists for <span className="text-foreground font-medium">{email}</span>,
                we've sent a password reset link. It expires in 15 minutes.
              </p>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setMode("login")}
              >
                Back to sign in
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
