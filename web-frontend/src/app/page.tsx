


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
            Experience the future of school transportation with real-time GPS tracking, 
            intelligent route management, and comprehensive safety monitoring.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.3s' } as any}>
            <Button 
              onClick={() => router.push('/login')}
              className="px-10 py-4 text-lg font-semibold rounded-xl hover-lift shadow-lg gradient-primary text-white border-0"
            >
              Get Started
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
            <button className="px-8 py-4 text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Watch Demo
            </button>
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
              Live GPS tracking of school buses with millimeter precision, 
              real-time notifications, and predictive arrival times powered by AI.
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
              Intuitive dashboards tailored for parents, drivers, and administrators 
              with advanced permissions and role-based feature access.
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
              Military-grade encryption, 99.9% uptime guarantee, and comprehensive 
              audit trails ensure your data is always protected and accessible.
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
