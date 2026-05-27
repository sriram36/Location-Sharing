"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";

type Role = 'admin' | 'driver' | 'parent';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseClient();

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      if (requiredRole) {
        // Read role from JWT user_metadata — no extra DB round-trip needed.
        // If the role is missing (edge case), fall back to a DB query.
        const role: string | undefined = session.user.user_metadata?.role;

        if (role) {
          if (role !== requiredRole) {
            router.replace(`/${role}/dashboard`);
            return;
          }
        } else {
          const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .single();
          if (!profile) { router.replace("/login"); return; }
          if (profile.role !== requiredRole) {
            router.replace(`/${profile.role}/dashboard`);
            return;
          }
        }
      }

      setLoading(false);
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => listener.subscription.unsubscribe();
  }, [router, requiredRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
