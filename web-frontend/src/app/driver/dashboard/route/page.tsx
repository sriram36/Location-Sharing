"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import DynamicMap from "@/components/DynamicMap";
import { Route, MapPin, Bus } from "lucide-react";

interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  stop_order: number;
}

interface RouteData {
  id: string;
  name: string;
  description: string | null;
}

export default function DriverRoutePage() {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createSupabaseClient();
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError("Your session has expired. Please sign in again."); return; }

        const { data: bus, error: busErr } = await supabase
          .from("buses").select("id, name").eq("driver_id", user.id).single();
        if (busErr || !bus) { setError("No bus has been assigned to you yet. Contact the administrator."); return; }

        const { data: routeData, error: routeErr } = await supabase
          .from("routes").select("id, name, description").eq("bus_id", bus.id).single();
        if (routeErr || !routeData) { setError("No route has been assigned to your bus yet. Contact the administrator."); return; }

        setRoute(routeData);

        const { data: stopsData, error: stopsErr } = await supabase
          .from("route_stops").select("id, name, latitude, longitude, stop_order")
          .eq("route_id", routeData.id).order("stop_order");
        if (stopsErr) { setError("Could not load route stops. Try refreshing."); return; }

        const fetched = stopsData ?? [];
        setStops(fetched);
        if (fetched.length > 0) setSelectedStop(fetched[0]);
      } catch {
        setError("Could not load your route. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading your route…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto">
            <Bus className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-xl p-5 shadow-sm">
            <p className="text-red-700 dark:text-red-300 font-medium text-sm">{error}</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Contact your school administrator.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center shrink-0">
          <Route className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white truncate">{route?.name}</p>
          {route?.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{route.description}</p>
          )}
        </div>
        <span className="ml-auto shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
          {stops.length} stop{stops.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Stop list */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stops</h2>
          </div>
          {stops.length === 0 ? (
            <div className="text-center py-10">
              <MapPin className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No stops on this route yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {stops.map((stop) => (
                <li key={stop.id}>
                  <button
                    onClick={() => setSelectedStop(stop)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                      selectedStop?.id === stop.id
                        ? "bg-blue-50 dark:bg-blue-950/50"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                      selectedStop?.id === stop.id
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                    }`}>
                      {stop.stop_order}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{stop.name}</p>
                      <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Map */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {selectedStop ? `Stop #${selectedStop.stop_order} — ${selectedStop.name}` : "Map"}
            </h2>
          </div>
          <div className="h-[380px]">
            {selectedStop ? (
              <DynamicMap lat={selectedStop.latitude} lng={selectedStop.longitude} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">Select a stop to view on map</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
