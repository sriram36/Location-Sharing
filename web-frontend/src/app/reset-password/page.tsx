"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bus, KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
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
    let settled = false;
    // eslint-disable-next-line prefer-const
    let timeoutId: ReturnType<typeof setTimeout>;

    const settle = (state: PageState) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      setPageState(state);
    };

    // Listen for PASSWORD_RECOVERY — fires if the exchange happens after our listener is set up
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") settle("ready");
    });

    // Detect which kind of reset link the user arrived from
    const searchParams = new URLSearchParams(window.location.search);
    const code      = searchParams.get("code");       // PKCE flow (?code=xxx)
    const tokenHash = searchParams.get("token_hash"); // Email OTP flow (?token_hash=xxx&type=recovery)
    const typeParam = searchParams.get("type");

    if (code) {
      // PKCE: exchange the code for a session.
      // If the singleton already exchanged it (Navigation ran first), this call will
      // fail — that's fine, the session already exists; catch it via getSession below.
      supabase.auth.exchangeCodeForSession(code)
        .then(({ error: err }) => {
          if (!err) return; // PASSWORD_RECOVERY event will fire via onAuthStateChange
          // Exchange failed → code already used by singleton; fall back to session check
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) settle("ready");
            else settle("invalid");
          });
        });
    } else if (tokenHash && typeParam === "recovery") {
      // Email OTP recovery flow
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" })
        .then(({ error: err }) => {
          if (err) settle("invalid");
          // PASSWORD_RECOVERY event fires on success
        });
    } else {
      // No URL token — maybe Navigation's getSession() already exchanged the code.
      // Just check whether a session exists.
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) settle("ready");
        // else wait for PASSWORD_RECOVERY event (legacy hash flow handled by the client)
      });
    }

    // Fallback timeout — long enough for any network round-trip
    timeoutId = setTimeout(() => settle("invalid"), 10_000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
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

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-gray-800/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bus className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-sm">School Bus Tracker</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">

          {pageState === "loading" && (
            <div className="text-center space-y-4">
              <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
              <p className="text-gray-500 dark:text-gray-400">Verifying reset link…</p>
            </div>
          )}

          {pageState === "invalid" && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Link expired</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                  Password reset links expire after 1 hour. Please request a new one.
                </p>
              </div>
              <Button className="w-full h-11" onClick={() => router.push("/login")}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
              </Button>
            </div>
          )}

          {pageState === "success" && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Password updated!</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Redirecting you to sign in…</p>
              </div>
            </div>
          )}

          {pageState === "ready" && (
            <>
              <div className="mb-8">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-xl flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Set new password</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Choose a strong password for your account</p>
              </div>

              <form onSubmit={handleReset} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Password
                  </Label>
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
                    <button type="button" tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm New Password
                  </Label>
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
                    <button type="button" tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={() => setShowConfirm((v) => !v)}>
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {password.length > 0 && <StrengthBar password={password} />}

                {error && (
                  <Alert className="border-red-200 bg-red-50 dark:bg-red-950/50">
                    <span className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
                    </span>
                  </Alert>
                )}

                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? "Updating password…" : "Set New Password"}
                </Button>

                <button type="button" onClick={() => router.push("/login")}
                  className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-6">
        &copy; {new Date().getFullYear()} School Bus Tracker
      </p>
    </div>
  );
}

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
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? colour : "bg-gray-200 dark:bg-gray-700"}`} />
        ))}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
    </div>
  );
}
