import { useState } from "react";
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

type Mode = "login" | "forgot-email" | "forgot-otp" | "forgot-reset";

export default function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
      const res = await authService.forgotPassword(email);
      toast.success(res.detail);
      setMode("forgot-otp");
    });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const res = await authService.verifyOtp(email, otp);
      toast.success(res.detail);
      setMode("forgot-reset");
    });
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    void run(async () => {
      const res = await authService.resetPassword(email, newPassword, confirm);
      toast.success(res.detail);
      setPassword("");
      setOtp("");
      setNewPassword("");
      setConfirm("");
      setMode("login");
    });
  };

  return (
    <div className="bg-muted/40 flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="bg-brand mx-auto mb-2 flex size-12 items-center justify-center rounded-xl text-lg font-bold text-white">
            SC
          </div>
          <CardTitle className="text-xl">Success Central CRM</CardTitle>
          <CardDescription>
            {mode === "login" && "Sign in to your SkillShikshya account"}
            {mode === "forgot-email" && "Enter your email to receive a reset OTP"}
            {mode === "forgot-otp" && `Enter the 6-digit OTP sent to ${email}`}
            {mode === "forgot-reset" && "Choose a new password"}
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
              </div>
              <Button type="submit" variant="brand" className="w-full" disabled={busy}>
                {busy ? "Sending…" : "Send OTP"}
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

          {mode === "forgot-otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP code</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="483921"
                  required
                  className="text-center text-lg tracking-[0.5em]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <p className="text-muted-foreground text-xs">OTPs expire in 15 minutes.</p>
              </div>
              <Button type="submit" variant="brand" className="w-full" disabled={busy}>
                {busy ? "Verifying…" : "Verify OTP"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setMode("forgot-email")}
              >
                Resend OTP
              </Button>
            </form>
          )}

          {mode === "forgot-reset" && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="np">New password</Label>
                <Input
                  id="np"
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cp">Confirm new password</Label>
                <Input
                  id="cp"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              <Button type="submit" variant="brand" className="w-full" disabled={busy}>
                {busy ? "Resetting…" : "Reset password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
