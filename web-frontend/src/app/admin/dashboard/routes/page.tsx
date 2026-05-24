"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

type Route = {
  id: string;
  name: string;
  bus_id: string | null;
  buses: { name: string }[] | null;
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

export default function ManageRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [, setBuses] = useState<Bus[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const supabase = createSupabaseClient();
    const { data: routeData, error: routeError } = await supabase.from("routes").select(`id, name, bus_id, buses (name)`);
    const { data: busData, error: busError } = await supabase.from("buses").select("id, name");

    if (routeError || busError) {
      alert(routeError?.message || busError?.message);
    } else {
      setRoutes(routeData);
      setBuses(busData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedRouteId) {
      const supabase = createSupabaseClient();
      const fetchStops = async () => {
        const { data, error } = await supabase.from("route_stops").select("*").eq("route_id", selectedRouteId).order("stop_order");
        if (error) alert(error.message);
        else setStops(data);
      };
      fetchStops();
    } else {
      setStops([]);
    }
  }, [selectedRouteId]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Routes and Stops</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Routes</h2>
          <ul>
            {routes.map(route => (
              <li key={route.id} onClick={() => setSelectedRouteId(route.id)} className={`p-2 cursor-pointer rounded ${selectedRouteId === route.id ? 'bg-blue-200 dark:bg-blue-800' : ''}`}>
                {route.name} ({route.buses && route.buses.length > 0 ? route.buses[0].name : 'Unassigned'})
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4">Stops for Selected Route</h2>
          {selectedRouteId ? (
            <div>
              <ul>
                {stops.map(stop => (
                  <li key={stop.id} className="p-2 border-b">
                    {stop.stop_order}. {stop.name} ({stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)})
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Select a route to see its stops.</p>
          )}
        </div>
      </div>
    </div>
  );
}
