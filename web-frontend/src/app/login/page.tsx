"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bus, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, Mail } from "lucide-react";
import { loginSchema, signupSchema, forgotPasswordSchema } from "@/lib/validation";

type Mode = "signin" | "signup" | "forgot";

function friendlyError(msg: string): string {
  if (msg.includes("User already registered") || msg.includes("already been registered"))
    return "An account with this email already exists. Please sign in instead.";
  if (msg.includes("Invalid login credentials"))
    return "Incorrect email or password.";
  if (msg.includes("Email not confirmed"))
    return "Please confirm your email address first — check your inbox for the verification link.";
  if (msg.includes("Password should be at least"))
    return "Password must be at least 8 characters long.";
  if (msg.includes("rate limit") || msg.includes("too many requests"))
    return "Too many attempts. Please wait a minute and try again.";
  if (msg.includes("valid email") || msg.includes("invalid format"))
    return "Please enter a valid email address.";
  if (msg.includes("Network") || msg.includes("fetch"))
    return "Connection error. Check your internet and try again.";
  return msg;
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Show success message if redirected from password reset
    if (searchParams.get("reset") === "success") {
      setMessage({ text: "Password updated! You can now sign in with your new password.", success: true });
    }
  }, [searchParams]);

  useEffect(() => {
    const supabase = createSupabaseClient();
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("users").select("role").eq("id", session.user.id).single();
        if (profile?.role) router.push(`/${profile.role}/dashboard`);
      }
    };
    checkUser();
  }, [router]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setMessage(null);
    setPassword("");
    setName("");
    setShowPassword(false);
  };

  // ── Sign in / Sign up ────────────────────────────────────────────────────
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (mode === "signup") {
      const parsed = signupSchema.safeParse({ email, password, name });
      if (!parsed.success) { setMessage({ text: parsed.error.issues[0].message, success: false }); return; }
    } else {
      const parsed = loginSchema.safeParse({ email, password });
      if (!parsed.success) { setMessage({ text: parsed.error.issues[0].message, success: false }); return; }
    }

    setLoading(true);
    const supabase = createSupabaseClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name.trim(), role: "parent" },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (error) setMessage({ text: friendlyError(error.message), success: false });
      else setMessage({ text: "Account created! Check your email for a confirmation link before signing in.", success: true });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ text: friendlyError(error.message), success: false });
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase.from("users").select("role").eq("id", user?.id ?? "").single();
        if (profile?.role) router.push(`/${profile.role}/dashboard`);
        else setMessage({ text: "Profile not found. Contact the administrator.", success: false });
      }
    }
    setLoading(false);
  };

  // ── Forgot password ───────────────────────────────────────────────────────
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) { setMessage({ text: parsed.error.issues[0].message, success: false }); return; }

    setLoading(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) setMessage({ text: friendlyError(error.message), success: false });
    else setMessage({
      text: "Reset link sent! Check your inbox and click the link to set a new password.",
      success: true,
    });
  };

  // ── UI helpers ────────────────────────────────────────────────────────────
  const cardTitle =
    mode === "signup" ? "Create Account" :
    mode === "forgot" ? "Reset Password" :
    "Welcome Back";

  const cardDesc =
    mode === "signup" ? "Sign up as a parent to track your child's bus" :
    mode === "forgot" ? "Enter your email and we'll send you a reset link" :
    "Sign in to access the school bus tracking system";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              {mode === "forgot"
                ? <Mail className="w-7 h-7 text-white" />
                : <Bus className="w-7 h-7 text-white" />
              }
            </div>
            <CardTitle className="text-2xl font-bold">{cardTitle}</CardTitle>
            <CardDescription className="text-sm mt-1">{cardDesc}</CardDescription>
          </CardHeader>

          <CardContent className="pt-4">

            {/* ── Forgot password form ── */}
            {mode === "forgot" && (
              <form onSubmit={handleForgot} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                {message && <MessageAlert message={message} />}

                <Button type="submit" className="w-full" disabled={loading || message?.success}>
                  {loading ? "Sending…" : "Send Reset Link"}
                </Button>

                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mx-auto"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to sign in
                </button>
              </form>
            )}

            {/* ── Sign in / Sign up form ── */}
            {mode !== "forgot" && (
              <form onSubmit={handleAuth} className="space-y-4" noValidate>
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jane Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      autoComplete="name"
                      autoFocus
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                    autoFocus={mode === "signin"}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {mode === "signup" && (
                    <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                  )}
                </div>

                {message && <MessageAlert message={message} />}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? (mode === "signup" ? "Creating account…" : "Signing in…")
                    : (mode === "signup" ? "Create Account" : "Sign In")}
                </Button>

                <div className="text-center text-sm">
                  <button
                    type="button"
                    className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                    onClick={() => switchMode(mode === "signup" ? "signin" : "signup")}
                    disabled={loading}
                  >
                    {mode === "signup"
                      ? "Already have an account? Sign in"
                      : "Don't have an account? Sign up"}
                  </button>
                </div>
              </form>
            )}

          </CardContent>
        </Card>
      </div>

      <div className="text-center pb-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} School Bus Tracker — Admins and drivers are added by your administrator.
        </p>
      </div>
    </div>
  );
}

function MessageAlert({ message }: { message: { text: string; success: boolean } }) {
  return (
    <Alert className={message.success
      ? "border-green-300 bg-green-50 dark:bg-green-950"
      : "border-red-300 bg-red-50 dark:bg-red-950"
    }>
      <span className="flex items-start gap-2">
        {message.success
          ? <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
          : <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
        }
        <AlertDescription className={message.success
          ? "text-green-800 dark:text-green-300"
          : "text-red-800 dark:text-red-300"
        }>
          {message.text}
        </AlertDescription>
      </span>
    </Alert>
  );
}
