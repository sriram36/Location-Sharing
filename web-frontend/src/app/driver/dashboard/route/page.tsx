"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import DynamicMap from "@/components/DynamicMap";

interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  stop_order: number;
}

interface Route {
  id: string;
  name: string;
  description: string | null;
}

export default function DriverRoutePage() {
  const [route, setRoute] = useState<Route | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createSupabaseClient();
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError("Your session has expired. Please sign in again."); setLoading(false); return; }

        // Get driver's assigned bus
        const { data: bus, error: busErr } = await supabase
          .from("buses")
          .select("id, name")
          .eq("driver_id", user.id)
          .single();

        if (busErr || !bus) {
          setError("No bus has been assigned to you yet. Contact the administrator.");
          setLoading(false); return;
        }

        // Get route assigned to this bus
        const { data: routeData, error: routeErr } = await supabase
          .from("routes")
          .select("id, name, description")
          .eq("bus_id", bus.id)
          .single();

        if (routeErr || !routeData) {
          setError("No route has been assigned to your bus yet. Contact the administrator.");
          setLoading(false); return;
        }

        setRoute(routeData);

        // Get stops for this route
        const { data: stopsData, error: stopsErr } = await supabase
          .from("route_stops")
          .select("id, name, latitude, longitude, stop_order")
          .eq("route_id", routeData.id)
          .order("stop_order");

        if (stopsErr) {
          setError("Could not load route stops. Try refreshing the page.");
          setLoading(false); return;
        }

        const fetchedStops = stopsData ?? [];
        setStops(fetchedStops);
        if (fetchedStops.length > 0) setSelectedStop(fetchedStops[0]);
      } catch {
        setError("Could not load your route. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-xl font-medium">Loading your route…</p>
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
            <p className="text-red-500 dark:text-red-400 text-sm">Contact the school administration for assistance.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{route?.name}</h1>
        {route?.description && (
          <p className="text-muted-foreground mt-1">{route.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stop list */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold mb-3">
            Stops <span className="text-muted-foreground text-sm font-normal">({stops.length})</span>
          </h2>
          {stops.length === 0 ? (
            <p className="text-muted-foreground italic text-sm">No stops have been added to this route yet.</p>
          ) : (
            <ul className="space-y-2">
              {stops.map((stop) => (
                <li key={stop.id}>
                  <button
                    onClick={() => setSelectedStop(stop)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedStop?.id === stop.id
                        ? "border-blue-400 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 w-6 text-center">
                        #{stop.stop_order}
                      </span>
                      <span className="font-medium text-sm">{stop.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 ml-8 font-mono">
                      {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Map */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold mb-3">
            {selectedStop ? `Stop #${selectedStop.stop_order} — ${selectedStop.name}` : "Map"}
          </h2>
          <div className="h-80 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
            {selectedStop ? (
              <DynamicMap lat={selectedStop.latitude} lng={selectedStop.longitude} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-sm">Select a stop to view on map</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
