"use client";
import { useState, useEffect, useRef } from "react";
import DynamicMap from "@/components/DynamicMap";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

interface Assignment {
  bus_id: string;
  student_name: string;
  buses: { name: string } | null;
}

interface BusLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export default function ParentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const channelRef = useRef<ReturnType<ReturnType<typeof createSupabaseClient>["channel"]> | null>(null);
  const supabase = useRef(createSupabaseClient()).current;

  // Fetch all active assignments for this parent
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Your session has expired. Please sign in again."); setLoading(false); return; }

      const { data, error: err } = await supabase
        .from("student_assignments")
        .select("bus_id, student_name, buses(name)")
        .eq("parent_id", user.id)
        .eq("active", true)
        .order("student_name");

      if (err || !data || data.length === 0) {
        setError("Your child has not been assigned to a bus yet. Contact the school administrator.");
        setLoading(false);
        return;
      }

      setAssignments(data as unknown as Assignment[]);
      setLoading(false);
    };
    init();
  // supabase ref is stable — intentionally omitted
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever selected assignment changes, fetch location + subscribe realtime
  useEffect(() => {
    if (assignments.length === 0) return;

    const busId = assignments[selectedIdx]?.bus_id;
    if (!busId) return;

    // Clean up previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setBusLocation(null);
    setLocationLoading(true);
    setRealtimeStatus("connecting");

    // Fetch latest location
    const fetchLatest = async () => {
      const { data } = await supabase
        .from("bus_locations")
        .select("latitude, longitude, timestamp")
        .eq("bus_id", busId)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single();
      if (data) setBusLocation(data);
      setLocationLoading(false);
    };
    fetchLatest();

    // Subscribe to real-time inserts for this bus
    const channel = supabase
      .channel(`bus-location-${busId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bus_locations", filter: `bus_id=eq.${busId}` },
        (payload: { new: BusLocation }) => {
          const { latitude, longitude, timestamp } = payload.new;
          setBusLocation({ latitude, longitude, timestamp });
        }
      )
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED")    setRealtimeStatus("connected");
        if (status === "CLOSED")        setRealtimeStatus("disconnected");
        if (status === "CHANNEL_ERROR") setRealtimeStatus("disconnected");
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  // supabase ref is stable — intentionally omitted
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments, selectedIdx]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-xl font-medium">Loading bus information…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md text-center">
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-700 dark:text-red-300 font-medium mb-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentAssignment = assignments[selectedIdx];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Track Your Child&apos;s Bus</h1>
        <div className="flex items-center gap-2">
          {realtimeStatus === "connected" ? (
            <Badge className="bg-green-500 gap-1">
              <Wifi className="h-3 w-3" /> Live
            </Badge>
          ) : realtimeStatus === "connecting" ? (
            <Badge variant="secondary" className="gap-1">
              <Wifi className="h-3 w-3 animate-pulse" /> Connecting…
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <WifiOff className="h-3 w-3" /> Disconnected
            </Badge>
          )}
        </div>
      </div>

      {/* Child selector — shown only when parent has multiple children */}
      {assignments.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {assignments.map((a, i) => (
            <button
              key={a.bus_id + a.student_name}
              onClick={() => setSelectedIdx(i)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                selectedIdx === i
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400"
              }`}
            >
              {a.student_name}
            </button>
          ))}
        </div>
      )}

      {/* Map card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {currentAssignment?.student_name} — {currentAssignment?.buses?.name ?? "Bus"}
          </h2>
        </div>
        <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          {locationLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Loading map…</p>
              </div>
            </div>
          ) : busLocation ? (
            <DynamicMap lat={busLocation.latitude} lng={busLocation.longitude} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-pulse w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3" />
                <p className="text-muted-foreground">Waiting for bus location…</p>
                <p className="text-muted-foreground text-xs mt-1">The bus may not have started its route yet.</p>
              </div>
            </div>
          )}
        </div>

        {busLocation && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between flex-wrap gap-2">
            <p className="text-green-800 dark:text-green-200 text-sm font-mono">
              {busLocation.latitude.toFixed(5)}, {busLocation.longitude.toFixed(5)}
            </p>
            <p className="text-green-600 dark:text-green-400 text-xs">
              Updated: {new Date(busLocation.timestamp).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>

      {/* All children summary (when multiple) */}
      {assignments.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">All Children</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {assignments.map((a, i) => (
              <button
                key={a.bus_id + a.student_name}
                onClick={() => setSelectedIdx(i)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  selectedIdx === i
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-950"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                }`}
              >
                <p className="font-medium">{a.student_name}</p>
                <p className="text-sm text-muted-foreground">{a.buses?.name ?? "Bus not assigned"}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
