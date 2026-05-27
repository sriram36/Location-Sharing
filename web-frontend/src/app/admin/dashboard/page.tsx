"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { Users, Bus, Route, ClipboardList, MapPin, Plus, Activity } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalBuses: number;
  totalRoutes: number;
  totalAssignments: number;
  activeBuses: number;
}

interface FleetBus {
  id: string;
  name: string;
  status: "active" | "inactive" | "maintenance";
  users: { name: string | null } | null;
}

const statusStyles = {
  active:      { dot: "bg-green-500", badge: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300", label: "Active" },
  inactive:    { dot: "bg-gray-400",  badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",   label: "Inactive" },
  maintenance: { dot: "bg-amber-500", badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300", label: "Maintenance" },
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalBuses: 0, totalRoutes: 0, totalAssignments: 0, activeBuses: 0 });
  const [buses, setBuses] = useState<FleetBus[]>([]);
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");
  const router = useRouter();

  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
  }, []);

  useEffect(() => {
    const supabase = createSupabaseClient();
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    (async () => {
      try {
        const [
          { count: usersCount },
          { count: busesCount },
          { count: routesCount },
          { count: assignmentsCount },
          { data: activeLocs },
          { data: busData },
        ] = await Promise.all([
          supabase.from("users").select("id", { count: "exact", head: true }),
          supabase.from("buses").select("id", { count: "exact", head: true }),
          supabase.from("routes").select("id", { count: "exact", head: true }),
          supabase.from("student_assignments").select("id", { count: "exact", head: true }),
          supabase.from("bus_locations").select("bus_id").gte("timestamp", thirtyMinsAgo),
          supabase.from("buses").select("id, name, status, users(name)").order("name").limit(20),
        ]);

        const ids = new Set((activeLocs ?? []).map((l: { bus_id: string }) => l.bus_id));
        setActiveIds(ids);
        setStats({
          totalUsers: usersCount ?? 0,
          totalBuses: busesCount ?? 0,
          totalRoutes: routesCount ?? 0,
          totalAssignments: assignmentsCount ?? 0,
          activeBuses: ids.size,
        });
        setBuses((busData ?? []) as unknown as FleetBus[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statCards = useMemo(() => [
    { label: "Total Users",       value: stats.totalUsers,       icon: Users,         color: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400" },
    { label: "Fleet Size",        value: stats.totalBuses,       icon: Bus,           color: "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400" },
    { label: "Active Right Now",  value: stats.activeBuses,      icon: Activity,      color: "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400" },
    { label: "Assignments",       value: stats.totalAssignments, icon: ClipboardList, color: "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400" },
  ], [stats.totalUsers, stats.totalBuses, stats.activeBuses, stats.totalAssignments]);

  const quickActions = useMemo(() => [
    { label: "Add User",       icon: Users,         href: "/admin/dashboard/users",        desc: "Create parent, driver, or admin" },
    { label: "Add Bus",        icon: Bus,           href: "/admin/dashboard/buses",         desc: "Register a bus to the fleet" },
    { label: "Create Route",   icon: Route,         href: "/admin/dashboard/routes",        desc: "Define routes and stops" },
    { label: "Assign Student", icon: ClipboardList, href: "/admin/dashboard/assignments",   desc: "Link a student to a bus" },
  ], []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {today}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
            <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center mb-4`}>
              <Icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ label, icon: Icon, href, desc }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className="group flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl p-4 shadow-sm text-left transition-all hover:shadow-md"
            >
              <div className="w-9 h-9 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                <Icon className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fleet */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fleet</h2>
          <button
            onClick={() => router.push("/admin/dashboard/buses")}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add bus
          </button>
        </div>

        {buses.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-10 text-center shadow-sm">
            <Bus className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No buses registered yet</p>
            <button
              onClick={() => router.push("/admin/dashboard/buses")}
              className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Add your first bus
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bus</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Driver</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Live</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {buses.map((bus) => {
                  const s = statusStyles[bus.status] ?? statusStyles.inactive;
                  const live = activeIds.has(bus.id);
                  return (
                    <tr key={bus.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-sm text-gray-900 dark:text-white">{bus.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {bus.users?.name ?? <span className="italic">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {live ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
                            <MapPin className="w-3.5 h-3.5" /> Tracking
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-600">Offline</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
