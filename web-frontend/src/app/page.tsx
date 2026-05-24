


"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Bus, Users, MapPin, Shield } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseClient();
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
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
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 gradient-primary opacity-20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 gradient-success opacity-20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' } as any} />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 gradient-warning opacity-20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' } as any} />
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center justify-center w-24 h-24 gradient-primary rounded-full mb-8 animate-float shadow-2xl">
            <Bus className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-gradient mb-6">
            School Bus Tracker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Real-time GPS tracking for school buses. Parents see exactly where their child&apos;s bus is.
            Drivers share their location. Administrators manage the fleet.
          </p>
          <div className="flex justify-center animate-slide-up" style={{ animationDelay: '0.3s' } as any}>
            <Button
              onClick={() => router.push('/login')}
              className="px-10 py-4 text-lg font-semibold rounded-xl hover-lift shadow-lg gradient-primary text-white border-0"
            >
              Sign In
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="glass-card hover-lift rounded-2xl p-8 text-center group animate-slide-up" style={{ animationDelay: '0.4s' } as any}>
            <div className="mx-auto w-16 h-16 gradient-success rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Real-Time Tracking
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              See your child&apos;s bus on a live map, updated every 10 seconds while the driver
              has the trip active.
            </p>
            <div className="mt-6 flex items-center justify-center">
              <StatusIndicator status="online" showLabel />
            </div>
          </div>

          <div className="glass-card hover-lift rounded-2xl p-8 text-center group animate-slide-up" style={{ animationDelay: '0.5s' } as any}>
            <div className="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Multi-Role Access
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Separate dashboards for parents, drivers, and administrators — each role
              sees only what they need.
            </p>
            <div className="mt-6 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' } as any} />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' } as any} />
            </div>
          </div>

          <div className="glass-card hover-lift rounded-2xl p-8 text-center group animate-slide-up" style={{ animationDelay: '0.6s' } as any}>
            <div className="mx-auto w-16 h-16 gradient-warning rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Secure & Reliable
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Built on Supabase with row-level security — each parent can only see
              their own child&apos;s bus. No data leaks between accounts.
            </p>
            <div className="mt-6">
              <div className="flex items-center justify-center space-x-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} School Bus Tracker System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
