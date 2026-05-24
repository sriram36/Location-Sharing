"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ThemeToggle";
import { KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { resetPasswordSchema } from "@/lib/validation";

type PageState = "loading" | "ready" | "success" | "invalid";

export default function ResetPasswordPage() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseClient();

    // Supabase fires PASSWORD_RECOVERY when the user arrives via the reset email link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setPageState("ready");
      }
    });

    // In case the page loads after the event has already fired (e.g. hard refresh),
    // check if there's an active session from the recovery token
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setPageState("ready");
      else {
        // Wait up to 3 s for the PASSWORD_RECOVERY event before declaring invalid
        setTimeout(() => {
          setPageState((prev) => (prev === "loading" ? "invalid" : prev));
        }, 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }

    setLoading(true);
    const supabase = createSupabaseClient();
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateErr) {
      setError(
        updateErr.message.includes("same password")
          ? "Your new password must be different from your current password."
          : "Could not update your password. The reset link may have expired — request a new one."
      );
    } else {
      setPageState("success");
      await supabase.auth.signOut();
      setTimeout(() => router.push("/login?reset=success"), 2000);
    }
  };

  // ── States ────────────────────────────────────────────────────────────────
  if (pageState === "loading") {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
          <p className="text-muted-foreground">Verifying reset link…</p>
        </div>
      </Shell>
    );
  }

  if (pageState === "invalid") {
    return (
      <Shell>
        <div className="text-center py-6 space-y-3">
          <div className="mx-auto w-14 h-14 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <p className="font-semibold text-lg">Link invalid or expired</p>
          <p className="text-sm text-muted-foreground">
            Password reset links expire after 1 hour. Please request a new one.
          </p>
          <Button className="mt-2" onClick={() => router.push("/login")}>
            Back to Sign In
          </Button>
        </div>
      </Shell>
    );
  }

  if (pageState === "success") {
    return (
      <Shell>
        <div className="text-center py-6 space-y-3">
          <div className="mx-auto w-14 h-14 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
          </div>
          <p className="font-semibold text-lg">Password updated!</p>
          <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <form onSubmit={handleReset} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              autoFocus
              className="pr-10"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              className="pr-10"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => setShowConfirm((v) => !v)}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Inline strength hint */}
        {password.length > 0 && (
          <StrengthBar password={password} />
        )}

        {error && (
          <Alert className="border-red-300 bg-red-50 dark:bg-red-950">
            <span className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <AlertDescription className="text-red-800 dark:text-red-300">{error}</AlertDescription>
            </span>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Updating password…" : "Set New Password"}
        </Button>
      </form>
    </Shell>
  );
}

// ── Shared card shell ─────────────────────────────────────────────────────
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
            <CardDescription>Choose a strong password for your account</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Password strength indicator ────────────────────────────────────────────
function StrengthBar({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const label = ["Too short", "Weak", "Fair", "Good", "Strong"][score];
  const colour = ["bg-red-400", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"][score];

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? colour : "bg-gray-200 dark:bg-gray-700"}`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
