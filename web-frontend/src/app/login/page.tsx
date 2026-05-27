"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Bus, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft,
  MapPin, Users, Shield,
} from "lucide-react";
import { loginSchema, signupSchema, forgotPasswordSchema } from "@/lib/validation";

type Mode = "signin" | "signup" | "forgot";

function friendlyError(msg: string): string {
  if (msg.includes("User already registered") || msg.includes("already been registered"))
    return "An account with this email already exists. Please sign in instead.";
  if (msg.includes("Invalid login credentials"))
    return "Incorrect email or password.";
  if (msg.includes("Email not confirmed"))
    return "Please confirm your email address first — check your inbox.";
  if (msg.includes("Password should be at least"))
    return "Password must be at least 8 characters long.";
  if (msg.includes("rate limit") || msg.includes("too many requests"))
    return "Too many attempts. Please wait a minute and try again.";
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
    if (searchParams.get("reset") === "success") {
      setMessage({ text: "Password updated! You can now sign in with your new password.", success: true });
    }
  }, [searchParams]);

  useEffect(() => {
    const supabase = createSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase.from("users").select("role").eq("id", session.user.id).single()
        .then(({ data }) => { if (data?.role) router.push(`/${data.role}/dashboard`); });
    });
  }, [router]);

  const switchMode = (next: Mode) => {
    setMode(next); setMessage(null); setPassword(""); setName(""); setShowPassword(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const parsed = mode === "signup"
      ? signupSchema.safeParse({ email, password, name })
      : loginSchema.safeParse({ email, password });
    if (!parsed.success) { setMessage({ text: parsed.error.issues[0].message, success: false }); return; }

    setLoading(true);
    const supabase = createSupabaseClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name: name.trim(), role: "parent" }, emailRedirectTo: `${window.location.origin}/login` },
      });
      setMessage(error
        ? { text: friendlyError(error.message), success: false }
        : { text: "Account created! Check your email for a confirmation link.", success: true });
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

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) { setMessage({ text: parsed.error.issues[0].message, success: false }); return; }
    setLoading(true);
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setMessage(error
        ? { text: friendlyError(error.message), success: false }
        : { text: "Reset link sent! Check your inbox and click the link to set a new password.", success: true });
    } catch {
      setMessage({ text: "Connection error. Check your internet and try again.", success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/[0.03]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">School Bus Tracker</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Know exactly where<br />your child's bus is.
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-12">
            Real-time GPS tracking for school buses. Parents, drivers, and administrators — one platform.
          </p>

          <div className="space-y-5">
            {[
              { icon: MapPin, title: "Live GPS tracking", desc: "Bus location updates every 10 seconds while the driver is active" },
              { icon: Users,  title: "Role-based access",  desc: "Separate dashboards for parents, drivers, and administrators" },
              { icon: Shield, title: "Secure by default",  desc: "Row-level security ensures parents only see their child's bus" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-blue-200 text-sm mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-blue-300 text-xs">
          <span suppressHydrationWarning>&copy; {new Date().getFullYear()} School Bus Tracker</span>
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-950">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-gray-800/60">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bus className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">School Bus Tracker</span>
          </div>
          <div className="hidden lg:block" />
          <ThemeToggle />
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Welcome back"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                {mode === "signup" ? "Sign up as a parent to track your child's bus"
                  : mode === "forgot" ? "Enter your email and we'll send you a reset link"
                  : "Sign in to continue to your dashboard"}
              </p>
            </div>

            {/* Forgot password form */}
            {mode === "forgot" && (
              <form onSubmit={handleForgot} className="space-y-4" noValidate>
                <FormField label="Email address" id="email">
                  <Input id="email" type="email" placeholder="you@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} disabled={loading} autoComplete="email" autoFocus />
                </FormField>

                {message && <Msg message={message} />}

                <Button type="submit" className="w-full h-11" disabled={loading || message?.success}>
                  {loading ? "Sending…" : "Send reset link"}
                </Button>

                <button type="button" onClick={() => switchMode("signin")}
                  className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                </button>
              </form>
            )}

            {/* Sign in / Sign up form */}
            {mode !== "forgot" && (
              <form onSubmit={handleAuth} className="space-y-4" noValidate>
                {mode === "signup" && (
                  <FormField label="Full name" id="name">
                    <Input id="name" type="text" placeholder="Jane Smith" value={name}
                      onChange={(e) => setName(e.target.value)} disabled={loading} autoComplete="name" autoFocus />
                  </FormField>
                )}

                <FormField label="Email address" id="email">
                  <Input id="email" type="email" placeholder="you@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} disabled={loading} autoComplete="email"
                    autoFocus={mode === "signin"} />
                </FormField>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</Label>
                    {mode === "signin" && (
                      <button type="button" onClick={() => switchMode("forgot")}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      disabled={loading} autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      className="pr-10" />
                    <button type="button" tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {mode === "signup" && <p className="text-xs text-gray-400">Minimum 8 characters</p>}
                </div>

                {message && <Msg message={message} />}

                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading
                    ? (mode === "signup" ? "Creating account…" : "Signing in…")
                    : (mode === "signup" ? "Create account" : "Sign in")}
                </Button>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
                  <button type="button"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline disabled:opacity-50"
                    onClick={() => switchMode(mode === "signup" ? "signin" : "signup")} disabled={loading}>
                    {mode === "signup" ? "Sign in" : "Sign up"}
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-6">
          Admins and drivers are added by your school administrator.
        </p>
      </div>
    </div>
  );
}

function FormField({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</Label>
      {children}
    </div>
  );
}

function Msg({ message }: { message: { text: string; success: boolean } }) {
  return (
    <Alert className={message.success ? "border-green-200 bg-green-50 dark:bg-green-950/50" : "border-red-200 bg-red-50 dark:bg-red-950/50"}>
      <span className="flex items-start gap-2">
        {message.success
          ? <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
          : <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
        <AlertDescription className={message.success ? "text-green-800 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
          {message.text}
        </AlertDescription>
      </span>
    </Alert>
  );
}
