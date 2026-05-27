"use client";
import { useState, useEffect, useRef } from "react";
import DynamicMap from "@/components/DynamicMap";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { Bus, MapPin, Clock, Wifi, WifiOff, GraduationCap } from "lucide-react";

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

type RealtimeStatus = "connecting" | "connected" | "disconnected";

export default function ParentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>("connecting");
  const channelRef = useRef<ReturnType<ReturnType<typeof createSupabaseClient>["channel"]> | null>(null);
  const supabase = useRef(createSupabaseClient()).current;

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

  useEffect(() => {
    if (assignments.length === 0) return;
    const busId = assignments[selectedIdx]?.bus_id;
    if (!busId) return;

    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }

    setBusLocation(null);
    setLocationLoading(true);
    setRealtimeStatus("connecting");

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

    const channel = supabase
      .channel(`bus-location-${busId}`)
      .on("postgres_changes",
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
    return () => { supabase.removeChannel(channel); channelRef.current = null; };
  // supabase ref is stable — intentionally omitted
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments, selectedIdx]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-lg font-medium text-muted-foreground">Loading bus information…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950 rounded-full flex items-center justify-center mx-auto">
            <Bus className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
            <p className="text-amber-800 dark:text-amber-200 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const current = assignments[selectedIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bus Tracker</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Live location of your child&apos;s school bus</p>
        </div>
        <StatusPill status={realtimeStatus} />
      </div>

      {/* Child tabs — only shown when >1 child */}
      {assignments.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {assignments.map((a, i) => (
            <button
              key={a.bus_id + a.student_name}
              onClick={() => setSelectedIdx(i)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                selectedIdx === i
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              {a.student_name}
            </button>
          ))}
        </div>
      )}

      {/* Bus info strip */}
      <div className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3 shadow-sm">
        <div className="w-9 h-9 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center shrink-0">
          <Bus className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{current?.student_name}</p>
          <p className="text-xs text-muted-foreground">{current?.buses?.name ?? "Bus not assigned"}</p>
        </div>
      </div>

      {/* Map card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="h-[420px] relative">
          {locationLoading ? (
            <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
              <div className="text-center space-y-3">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
                <p className="text-muted-foreground text-sm">Loading map…</p>
              </div>
            </div>
          ) : busLocation ? (
            <DynamicMap lat={busLocation.latitude} lng={busLocation.longitude} />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
              <div className="text-center space-y-3 px-6">
                <div className="relative mx-auto w-14 h-14">
                  <Bus className="w-14 h-14 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-muted-foreground font-medium">Waiting for bus location</p>
                <p className="text-muted-foreground text-xs">
                  The bus hasn&apos;t started its route yet, or the driver hasn&apos;t enabled location sharing.
                </p>
              </div>
            </div>
          )}

          {/* Overlay live indicator when map is showing */}
          {busLocation && realtimeStatus === "connected" && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-green-700 dark:text-green-400 text-xs font-semibold px-2.5 py-1.5 rounded-full shadow border border-green-200 dark:border-green-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Live
            </div>
          )}
        </div>

        {/* Location footer */}
        {busLocation && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-mono">{busLocation.latitude.toFixed(5)}, {busLocation.longitude.toFixed(5)}</span>
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              Updated {new Date(busLocation.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* All children grid when multiple */}
      {assignments.length > 1 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">All Children</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {assignments.map((a, i) => (
              <button
                key={a.bus_id + a.student_name}
                onClick={() => setSelectedIdx(i)}
                className={`text-left px-4 py-3 rounded-xl border transition-all ${
                  selectedIdx === i
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-950 shadow-sm"
                    : "border-gray-200 dark:border-gray-800 hover:border-blue-300"
                }`}
              >
                <p className="font-medium text-sm">{a.student_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.buses?.name ?? "Bus not assigned"}</p>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function StatusPill({ status }: { status: RealtimeStatus }) {
  if (status === "connected") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950 border border-green-200 dark:border-green-800 px-3 py-1.5 rounded-full">
        <Wifi className="w-3.5 h-3.5" /> Live
      </span>
    );
  }
  if (status === "connecting") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-full">
        <Wifi className="w-3.5 h-3.5 animate-pulse" /> Connecting…
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-full">
      <WifiOff className="w-3.5 h-3.5" /> Disconnected
    </span>
  );
}
