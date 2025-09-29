"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bus, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Redirect to appropriate dashboard based on role
        const { data: userProfile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (userProfile?.role) {
          router.push(`/${userProfile.role}/dashboard`);
        }
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      if (!error) {
        setMessage("Sign up successful! Please check your email to confirm your account.");
      } else {
        setMessage(error.message);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        // Get user profile to determine role
        const { data: userProfile } = await supabase
          .from('users')
          .select('role')
          .eq('email', email)
          .single();
        
        if (userProfile?.role) {
          router.push(`/${userProfile.role}/dashboard`);
        } else {
          // If no role found, redirect to a default page or show error
          setMessage("User profile not found. Please contact administrator.");
        }
      } else {
        setMessage(error.message);
      }
    }
    setLoading(false);
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
                ? "Sign up to access the school bus tracking system" 
                : "Sign in to your account to continue"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="absolute right-0 top-0 h-full w-10 px-0 py-2 hover:bg-transparent border-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {message && (
                <Alert className={message.includes("successful") ? "border-green-200 bg-green-50 dark:bg-green-950" : ""}>
                  <AlertDescription className={message.includes("successful") ? "text-green-700 dark:text-green-400" : ""}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading 
                  ? (isSignUp ? "Creating Account..." : "Signing In...") 
                  : (isSignUp ? "Create Account" : "Sign In")
                }
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm disabled:opacity-50"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setMessage("");
                  }}
                  disabled={loading}
                >
                  {isSignUp 
                    ? "Already have an account? Sign in" 
                    : "Don't have an account? Sign up"
                  }
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center pb-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} School Bus Tracker System
        </p>
      </div>
    </div>
  );
}
