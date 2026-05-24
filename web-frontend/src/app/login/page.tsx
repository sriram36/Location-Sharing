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
import { Bus, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { loginSchema, signupSchema } from "@/lib/validation";

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

function validate(email: string, password: string, name: string, isSignUp: boolean): string | null {
  const schema = isSignUp ? signupSchema : loginSchema;
  const result = schema.safeParse(isSignUp ? { email, password, name } : { email, password });
  if (!result.success) return result.error.issues[0].message;
  return null;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseClient();
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (profile?.role) router.push(`/${profile.role}/dashboard`);
      }
    };
    checkUser();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const validationError = validate(email, password, name, isSignUp);
    if (validationError) { setMessage({ text: validationError, success: false }); return; }

    setLoading(true);
    const supabase = createSupabaseClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name.trim(), role: "parent" },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (error) {
        setMessage({ text: friendlyError(error.message), success: false });
      } else {
        setMessage({
          text: "Account created! Check your email for a confirmation link before signing in.",
          success: true,
        });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ text: friendlyError(error.message), success: false });
      } else {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
          .single();
        if (profile?.role) {
          router.push(`/${profile.role}/dashboard`);
        } else {
          setMessage({ text: "Profile not found. Contact the administrator.", success: false });
        }
      }
    }
    setLoading(false);
  };

  const switchMode = () => {
    setIsSignUp((v) => !v);
    setMessage(null);
    setName("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? "Sign up as a parent to track your child's bus"
                : "Sign in to access the school bus tracking system"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4" noValidate>
              {isSignUp && (
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignUp ? "At least 8 characters" : "Your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {isSignUp && (
                  <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                )}
              </div>

              {message && (
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
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? (isSignUp ? "Creating account…" : "Signing in…")
                  : (isSignUp ? "Create Account" : "Sign In")}
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                  onClick={switchMode}
                  disabled={loading}
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
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
