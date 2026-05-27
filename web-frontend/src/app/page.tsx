"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bus, MapPin, Users, Shield, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase.from("users").select("role").eq("id", session.user.id).single()
        .then(({ data }) => { if (data?.role) router.push(`/${data.role}/dashboard`); });
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Topbar */}
      <header className="border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bus className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">School Bus Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => router.push("/login")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Sign In <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <div className="container mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            Real-time GPS tracking
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight mb-6">
            Know exactly where<br />
            <span className="text-blue-600">your child&apos;s bus is</span>
          </h1>

          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Real-time GPS tracking for school buses. Parents track live. Drivers share location.
            Administrators manage the entire fleet — one platform.
          </p>

          <button
            onClick={() => router.push("/login")}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl transition-colors shadow-sm"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Features */}
        <div className="container mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: MapPin,
                color: "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400",
                title: "Live GPS Tracking",
                desc: "Bus location updates every 10 seconds while the driver has the trip active. Parents always know where the bus is.",
              },
              {
                icon: Users,
                color: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
                title: "Role-Based Access",
                desc: "Separate dashboards for parents, drivers, and administrators. Each role sees exactly what they need.",
              },
              {
                icon: Shield,
                color: "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
                title: "Secure by Default",
                desc: "Row-level security ensures parents can only see their own child's bus. No data leaks between accounts.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-7 shadow-sm"
              >
                <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-6">
        <p className="text-center text-sm text-gray-400 dark:text-gray-600">
          <span suppressHydrationWarning>&copy; {new Date().getFullYear()} School Bus Tracker. All rights reserved.</span>
        </p>
      </footer>
    </div>
  );
}
