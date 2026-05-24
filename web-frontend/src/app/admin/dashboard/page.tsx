"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BusStatusCard } from "@/components/ui/bus-status-card";
import { BusManagementTable } from "@/components/ui/bus-management-table";
import { StatsCard } from "@/components/ui/stats-card";
import { ActionCard } from "@/components/ui/action-card";
import { LoadingScreen } from "@/components/ui/loading";
import { Users, Bus, Route, UserPlus, MapPin, Shield, TrendingUp, Activity, Plus } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalBuses: number;
  totalRoutes: number;
  totalAssignments: number;
  activeBuses: number;
}

interface LiveBus {
  id: string;
  name: string;
  driver_id: string | null;
  users: { name: string | null } | null;
  latestLocation?: { latitude: number; longitude: number; timestamp: string } | null;
}

interface TableBus {
  id: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  route: string;
  status: "active" | "idle" | "maintenance";
  studentCount: number;
  capacity: number;
  lastLocation: string;
  lastUpdate: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBuses: 0,
    totalRoutes: 0,
    totalAssignments: 0,
    activeBuses: 0,
  });
  const [liveBuses, setLiveBuses] = useState<LiveBus[]>([]);
  const [tableBuses, setTableBuses] = useState<TableBus[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseClient();
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const fetchAll = async () => {
      try {
        const [
          { count: usersCount },
          { count: busesCount },
          { count: routesCount },
          { count: assignmentsCount },
          { data: activeBusesData },
          { data: busesData },
        ] = await Promise.all([
          supabase.from("users").select("*", { count: "exact", head: true }),
          supabase.from("buses").select("*", { count: "exact", head: true }),
          supabase.from("routes").select("*", { count: "exact", head: true }),
          supabase.from("student_assignments").select("*", { count: "exact", head: true }),
          supabase
            .from("bus_locations")
            .select("bus_id")
            .gte("timestamp", thirtyMinsAgo),
          supabase
            .from("buses")
            .select("id, name, driver_id, users(name)")
            .limit(10),
        ]);

        const activeIds = new Set(
          (activeBusesData ?? []).map((l: { bus_id: string }) => l.bus_id)
        );

        setStats({
          totalUsers: usersCount ?? 0,
          totalBuses: busesCount ?? 0,
          totalRoutes: routesCount ?? 0,
          totalAssignments: assignmentsCount ?? 0,
          activeBuses: activeIds.size,
        });

        // Build live bus cards
        const buses = (busesData ?? []) as unknown as LiveBus[];
        setLiveBuses(buses.slice(0, 4));

        // Build management table rows
        const rows: TableBus[] = buses.map((b) => ({
          id: b.id,
          busNumber: b.name,
          driverName: b.users?.name ?? "Unassigned",
          driverPhone: "—",
          route: "—",
          status: activeIds.has(b.id) ? "active" : "idle",
          studentCount: 0,
          capacity: 40,
          lastLocation: "—",
          lastUpdate: "—",
        }));
        setTableBuses(rows);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const quickActions = [
    { title: "Add New User", description: "Create parent, driver, or admin accounts", icon: UserPlus, href: "/admin/dashboard/users", color: "blue" as const },
    { title: "Add New Bus", description: "Register a new bus to the fleet", icon: Bus, href: "/admin/dashboard/buses", color: "green" as const },
    { title: "Create Route", description: "Define new bus routes and schedules", icon: Route, href: "/admin/dashboard/routes", color: "purple" as const },
    { title: "Assign Students", description: "Link students to buses and routes", icon: Users, href: "/admin/dashboard/assignments", color: "orange" as const },
  ];

  if (loading) return <LoadingScreen message="Loading dashboard..." />;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
        <CardHeader className="relative z-10 pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </CardTitle>
              <p className="text-lg text-muted-foreground">
                Monitor and manage your school bus tracking system
              </p>
              <div className="flex items-center space-x-6 mt-4">
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  <div className="w-2 h-2 bg-white rounded-full mr-2" />
                  System Online
                </Badge>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} gradient="primary" change={{ value: "", trend: "neutral" }} />
        <StatsCard title="Fleet Size" value={stats.totalBuses} icon={Bus} gradient="success" change={{ value: "", trend: "neutral" }} />
        <StatsCard
          title="Active Buses"
          value={stats.activeBuses}
          icon={MapPin}
          gradient="warning"
          change={{ value: `${Math.round((stats.activeBuses / Math.max(stats.totalBuses, 1)) * 100)}%`, trend: stats.activeBuses > 0 ? "up" : "neutral" }}
        />
        <StatsCard title="Assignments" value={stats.totalAssignments} icon={Shield} gradient="danger" change={{ value: "", trend: "neutral" }} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <ActionCard
              key={action.title}
              title={action.title}
              description={action.description}
              icon={action.icon}
              color={action.color}
              onClick={() => router.push(action.href)}
            />
          ))}
        </div>
      </div>

      {/* Live Buses */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center">
            <Bus className="h-6 w-6 mr-2 text-primary" />
            Fleet Overview
          </h2>
          <Button onClick={() => router.push("/admin/dashboard/buses")}>
            <Plus className="h-4 w-4 mr-2" />Add Bus
          </Button>
        </div>

        {liveBuses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No buses registered yet.{" "}
              <button className="text-blue-600 underline" onClick={() => router.push("/admin/dashboard/buses")}>
                Add your first bus
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {liveBuses.map((bus) => (
              <BusStatusCard
                key={bus.id}
                busNumber={bus.name}
                driverName={bus.users?.name ?? "Unassigned"}
                currentLocation="—"
                status={tableBuses.find((t) => t.id === bus.id)?.status ?? "idle"}
                studentCount={0}
                maxCapacity={40}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bus Management Table */}
      {tableBuses.length > 0 && <BusManagementTable data={tableBuses} />}

      {/* System Health */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Activity className="h-6 w-6 mr-2 text-green-600" />
              System Health Monitor
            </CardTitle>
            <Badge variant="default" className="bg-green-500">
              <div className="w-2 h-2 bg-white rounded-full mr-2" />
              All Systems Operational
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
                  <Bus className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{stats.activeBuses} / {stats.totalBuses}</div>
                <div className="text-sm text-muted-foreground mb-3">Buses Online</div>
                <Progress value={(stats.activeBuses / Math.max(stats.totalBuses, 1)) * 100} className="h-2" />
                <div className="mt-2">
                  <Badge variant={stats.activeBuses > 0 ? "default" : "secondary"}>
                    {stats.activeBuses > 0 ? "Active" : "Offline"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Route className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{stats.totalRoutes}</div>
                <div className="text-sm text-muted-foreground mb-3">Active Routes</div>
                <Badge variant={stats.totalRoutes > 0 ? "default" : "secondary"}>
                  {stats.totalRoutes > 0 ? "Running" : "None"}
                </Badge>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">
                  {Math.round((stats.activeBuses / Math.max(stats.totalBuses, 1)) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground mb-3">Fleet Utilization</div>
                <Badge variant={(stats.activeBuses / Math.max(stats.totalBuses, 1)) > 0.7 ? "default" : "secondary"}>
                  {(stats.activeBuses / Math.max(stats.totalBuses, 1)) > 0.7 ? "High" : "Low"}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
