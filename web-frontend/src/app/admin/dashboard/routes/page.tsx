"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { routeSchema, stopSchema } from "@/lib/validation";
import { Plus, Trash2, Route, MapPin, ChevronRight } from "lucide-react";

type RouteRow = { id: string; name: string; description: string | null; bus_id: string | null; buses: { name: string } | null };
type Stop = { id: string; name: string; latitude: number; longitude: number; stop_order: number };
type Bus = { id: string; name: string };

const sel = "flex h-9 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1 text-sm text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors";

function dbError(msg: string): string {
  if (msg.includes("duplicate key") || msg.includes("unique")) return "Already exists with this name.";
  if (msg.includes("foreign key")) return "Cannot delete — referenced by other records.";
  return "Something went wrong. Please try again.";
}

export default function ManageRoutesPage() {
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Create route form
  const [rName, setRName] = useState("");
  const [rDesc, setRDesc] = useState("");
  const [rBusId, setRBusId] = useState("");
  const [rLoading, setRLoading] = useState(false);

  // Add stop form
  const [sName, setSName] = useState("");
  const [sLat, setSLat] = useState("");
  const [sLng, setSLng] = useState("");
  const [sLoading, setSLoading] = useState(false);

  const fetchRoutes = async () => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from("routes").select("id, name, description, bus_id, buses(name)").order("name");
    if (error) toast.error(dbError(error.message));
    else setRoutes((data ?? []) as unknown as RouteRow[]);
  };

  const fetchStops = async (routeId: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from("route_stops").select("id, name, latitude, longitude, stop_order").eq("route_id", routeId).order("stop_order");
    if (error) toast.error(dbError(error.message));
    else setStops(data ?? []);
  };

  useEffect(() => {
    (async () => {
      const supabase = createSupabaseClient();
      const [routeRes, busRes] = await Promise.all([
        supabase.from("routes").select("id, name, description, bus_id, buses(name)").order("name"),
        supabase.from("buses").select("id, name").order("name"),
      ]);
      if (routeRes.error) toast.error(dbError(routeRes.error.message));
      else setRoutes((routeRes.data ?? []) as unknown as RouteRow[]);
      setBuses(busRes.data ?? []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (selectedRouteId) fetchStops(selectedRouteId);
    else setStops([]);
  }, [selectedRouteId]);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = routeSchema.safeParse({ name: rName, description: rDesc, bus_id: rBusId || null });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setRLoading(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("routes").insert({ name: rName.trim(), description: rDesc.trim() || null, bus_id: rBusId || null });
    if (error) toast.error(dbError(error.message));
    else { toast.success(`Route "${rName.trim()}" created.`); setRName(""); setRDesc(""); setRBusId(""); fetchRoutes(); setShowForm(false); }
    setRLoading(false);
  };

  const handleDeleteRoute = async (id: string, name: string) => {
    if (!confirm(`Delete route "${name}"? All its stops will also be deleted.`)) return;
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("routes").delete().eq("id", id);
    if (error) toast.error(dbError(error.message));
    else { toast.success(`Route "${name}" deleted.`); if (selectedRouteId === id) setSelectedRouteId(null); fetchRoutes(); }
  };

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRouteId) return;
    const latitude = parseFloat(sLat);
    const longitude = parseFloat(sLng);
    const parsed = stopSchema.safeParse({ name: sName, latitude, longitude });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSLoading(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("route_stops").insert({
      route_id: selectedRouteId, name: sName.trim(), latitude, longitude, stop_order: stops.length + 1,
    });
    if (error) toast.error(dbError(error.message));
    else { toast.success(`Stop "${sName.trim()}" added.`); setSName(""); setSLat(""); setSLng(""); fetchStops(selectedRouteId); }
    setSLoading(false);
  };

  const handleDeleteStop = async (id: string, name: string) => {
    if (!confirm(`Remove stop "${name}"?`)) return;
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("route_stops").delete().eq("id", id);
    if (error) toast.error(dbError(error.message));
    else { toast.success(`Stop "${name}" removed.`); if (selectedRouteId) fetchStops(selectedRouteId); }
  };

  const selectedRoute = routes.find((r) => r.id === selectedRouteId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Routes & Stops</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{routes.length} routes configured</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Cancel" : "New Route"}
        </button>
      </div>

      {/* Create route form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">New Route</h2>
          <form onSubmit={handleCreateRoute} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="r-name">Route name <span className="text-red-500">*</span></Label>
              <Input id="r-name" placeholder="e.g. Morning Route A" value={rName} onChange={(e) => setRName(e.target.value)} disabled={rLoading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-desc">Description</Label>
              <Input id="r-desc" placeholder="Optional description" value={rDesc} onChange={(e) => setRDesc(e.target.value)} disabled={rLoading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-bus">Assigned bus</Label>
              <select id="r-bus" value={rBusId} onChange={(e) => setRBusId(e.target.value)} className={sel} disabled={rLoading}>
                <option value="">Unassigned</option>
                {buses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <Button type="submit" disabled={rLoading}>
                {rLoading ? "Creating…" : "Create Route"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Routes list */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Routes ({routes.length})</h2>
          </div>
          {routes.length === 0 ? (
            <div className="text-center py-10">
              <Route className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No routes yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {routes.map((route) => (
                <li
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id === selectedRouteId ? null : route.id)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                    selectedRouteId === route.id
                      ? "bg-blue-50 dark:bg-blue-950/50"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selectedRouteId === route.id ? "rotate-90 text-blue-600" : "text-gray-400"}`} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{route.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {route.buses?.name ?? "No bus assigned"}
                        {route.description && ` · ${route.description}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteRoute(route.id, route.name); }}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Stops panel */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {selectedRoute ? `Stops — ${selectedRoute.name}` : "Stops"}
            </h2>
          </div>

          {!selectedRouteId ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">Select a route to manage its stops</p>
            </div>
          ) : (
            <div>
              {/* Stop list */}
              {stops.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <MapPin className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No stops yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {stops.map((stop) => (
                    <li key={stop.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center shrink-0">
                          {stop.stop_order}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{stop.name}</p>
                          <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteStop(stop.id, stop.name)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Add stop form */}
              <div className="border-t border-gray-100 dark:border-gray-800 p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">Add Stop #{stops.length + 1}</p>
                <form onSubmit={handleAddStop} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="s-name">Stop name</Label>
                    <Input id="s-name" placeholder="e.g. Oak Street" value={sName} onChange={(e) => setSName(e.target.value)} disabled={sLoading} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="s-lat">Latitude</Label>
                      <Input id="s-lat" type="number" step="any" placeholder="−90 to 90" value={sLat} onChange={(e) => setSLat(e.target.value)} disabled={sLoading} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="s-lng">Longitude</Label>
                      <Input id="s-lng" type="number" step="any" placeholder="−180 to 180" value={sLng} onChange={(e) => setSLng(e.target.value)} disabled={sLoading} />
                    </div>
                  </div>
                  <Button type="submit" size="sm" disabled={sLoading} className="w-full">
                    {sLoading ? "Adding…" : "Add Stop"}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
