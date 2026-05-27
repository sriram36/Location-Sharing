"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bus, LogOut, Settings, ChevronDown, LayoutDashboard } from "lucide-react";

interface User { id: string; email: string; role: string; name?: string }

const roleLabel: Record<string, string> = {
  admin: "Administrator", driver: "Driver", parent: "Parent",
};

const roleBadge: Record<string, string> = {
  admin:  "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  driver: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  parent: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
};

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);

  useEffect(() => {
    const supabase = createSupabaseClient();
    supabaseRef.current = supabase;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: profile } = await supabase.from("users").select("id, email, role, name").eq("id", session.user.id).single();
        if (profile) setUser(profile);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setUser(null);
        router.push("/");
      } else {
        const { data: profile } = await supabase.from("users").select("id, email, role, name").eq("id", session.user.id).single();
        if (profile) setUser(profile);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    const supabase = supabaseRef.current ?? createSupabaseClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  // Admin uses its own full sidebar — no top nav
  if (isLoading || !user || pathname.startsWith("/admin")) return null;

  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();

  return (
    <nav className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-20">
      <div className="container mx-auto px-5 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bus className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm text-gray-900 dark:text-white">School Bus Tracker</span>
        </div>

        {/* Dashboard link */}
        <button
          onClick={() => router.push(`/${user.role}/dashboard`)}
          className={`hidden sm:flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
            pathname.startsWith(`/${user.role}/dashboard`)
              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                {user.name ?? user.email}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg py-1 z-50">
                {/* Identity */}
                <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name ?? user.email}</p>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full mt-1 ${roleBadge[user.role] ?? roleBadge.parent}`}>
                    {roleLabel[user.role] ?? user.role}
                  </span>
                </div>
                {/* Actions */}
                <button
                  onClick={() => { setMenuOpen(false); router.push("/profile"); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-400" /> Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
