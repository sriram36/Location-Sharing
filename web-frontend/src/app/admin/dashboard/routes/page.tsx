"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

type Route = {
  id: string;
  name: string;
  description: string | null;
  bus_id: string | null;
  buses: { name: string } | null;
};

type Stop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  stop_order: number;
};

type Bus = {
  id: string;
  name: string;
};

function CreateRouteForm({ buses, onCreated }: { buses: Bus[]; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busId, setBusId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase
      .from("routes")
      .insert({ name, description: description || null, bus_id: busId || null });
    if (error) alert(error.message);
    else { setName(""); setDescription(""); setBusId(""); onCreated(); }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h2 className="text-lg font-bold mb-3">Create New Route</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Route name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-700"
          required
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-700"
        />
        <select
          value={busId}
          onChange={(e) => setBusId(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-700"
        >
          <option value="">Assign bus (optional)</option>
          {buses.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Creating..." : "Create Route"}
      </button>
    </form>
  );
}

function AddStopForm({ routeId, nextOrder, onAdded }: { routeId: string; nextOrder: number; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) { alert("Invalid coordinates"); return; }
    setLoading(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("route_stops").insert({
      route_id: routeId,
      name,
      latitude,
      longitude,
      stop_order: nextOrder,
    });
    if (error) alert(error.message);
    else { setName(""); setLat(""); setLng(""); onAdded(); }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-3 border rounded bg-gray-50 dark:bg-gray-800">
      <h3 className="text-sm font-semibold mb-2">Add Stop #{nextOrder}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          type="text"
          placeholder="Stop name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-700 text-sm"
          required
        />
        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-700 text-sm"
          required
        />
        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-700 text-sm"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? "Adding..." : "Add Stop"}
      </button>
    </form>
  );
}

export default function ManageRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("routes")
      .select("id, name, description, bus_id, buses(name)")
      .order("name");
    if (error) alert(error.message);
    else setRoutes((data ?? []) as unknown as Route[]);
  };

  const fetchBuses = async () => {
    const supabase = createSupabaseClient();
    const { data } = await supabase.from("buses").select("id, name").order("name");
    setBuses(data ?? []);
  };

  const fetchStops = async (routeId: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("route_stops")
      .select("*")
      .eq("route_id", routeId)
      .order("stop_order");
    if (error) alert(error.message);
    else setStops(data ?? []);
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchRoutes(), fetchBuses()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedRouteId) fetchStops(selectedRouteId);
    else setStops([]);
  }, [selectedRouteId]);

  const handleDeleteRoute = async (id: string, name: string) => {
    if (!confirm(`Delete route "${name}"? All stops will also be deleted.`)) return;
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("routes").delete().eq("id", id);
    if (error) alert(error.message);
    else {
      if (selectedRouteId === id) setSelectedRouteId(null);
      fetchRoutes();
    }
  };

  const handleDeleteStop = async (id: string) => {
    if (!confirm("Delete this stop?")) return;
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("route_stops").delete().eq("id", id);
    if (error) alert(error.message);
    else if (selectedRouteId) fetchStops(selectedRouteId);
  };

  const handleRouteCreated = async () => {
    await fetchRoutes();
  };

  if (loading) return <p className="p-8">Loading...</p>;

  const selectedRoute = routes.find((r) => r.id === selectedRouteId);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Manage Routes & Stops</h1>

      <CreateRouteForm buses={buses} onCreated={handleRouteCreated} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Route list */}
        <div>
          <h2 className="text-lg font-bold mb-3">Routes ({routes.length})</h2>
          {routes.length === 0 ? (
            <p className="text-gray-500 italic">No routes yet. Create one above.</p>
          ) : (
            <ul className="space-y-2">
              {routes.map((route) => (
                <li
                  key={route.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedRouteId === route.id
                      ? "bg-blue-100 border-blue-400 dark:bg-blue-900 dark:border-blue-600"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedRouteId(route.id === selectedRouteId ? null : route.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{route.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Bus: {route.buses?.name ?? <span className="italic">Unassigned</span>}
                      </p>
                      {route.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{route.description}</p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleDeleteRoute(route.id, route.name); }}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Stops panel */}
        <div>
          <h2 className="text-lg font-bold mb-3">
            {selectedRoute ? `Stops — ${selectedRoute.name}` : "Stops"}
          </h2>

          {!selectedRouteId ? (
            <p className="text-gray-500 italic">Select a route to manage its stops.</p>
          ) : (
            <>
              {stops.length === 0 ? (
                <p className="text-gray-500 italic mb-2">No stops yet. Add one below.</p>
              ) : (
                <ul className="space-y-2 mb-2">
                  {stops.map((stop) => (
                    <li
                      key={stop.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 mr-2">
                          #{stop.stop_order}
                        </span>
                        <span className="font-medium">{stop.name}</span>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteStop(stop.id)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <AddStopForm
                routeId={selectedRouteId}
                nextOrder={stops.length + 1}
                onAdded={() => fetchStops(selectedRouteId)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
