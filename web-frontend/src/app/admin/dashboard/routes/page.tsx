"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Route = {
  id: string;
  name: string;
  bus_id: string | null;
  buses: { name: string }[] | null;
};

type Stop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  sequence: number;
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
      const fetchStops = async () => {
        const { data, error } = await supabase.from("stops").select("*").eq("route_id", selectedRouteId).order("sequence");
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
          {/* Form to create a new route would go here */}
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
              {/* Form to create a new stop would go here */}
              <ul>
                {stops.map(stop => (
                  <li key={stop.id} className="p-2 border-b">
                    {stop.sequence}. {stop.name} ({stop.lat}, {stop.lng})
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
