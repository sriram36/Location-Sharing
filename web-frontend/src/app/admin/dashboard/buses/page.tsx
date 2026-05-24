"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

type Bus = {
  id: string;
  name: string;
  driver_id: string | null;
  users: { name: string }[] | null;
};

type Driver = {
  id: string;
  name: string | null;
};

function CreateBusForm({ drivers, onBusCreated }: { drivers: Driver[], onBusCreated: () => void }) {
  const [name, setName] = useState("");
  const [driverId, setDriverId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("buses").insert({ name, driver_id: driverId });
    if (error) {
      alert(error.message);
    } else {
      setName("");
      setDriverId(null);
      onBusCreated();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleCreateBus} className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4">Create New Bus</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="Bus Name (e.g., Bus A-10)" value={name} onChange={(e) => setName(e.target.value)} className="p-2 border rounded" required />
        <select value={driverId || ""} onChange={(e) => setDriverId(e.target.value || null)} className="p-2 border rounded">
          <option value="">Assign a Driver (Optional)</option>
          {drivers.map(driver => (
            <option key={driver.id} value={driver.id}>{driver.name}</option>
          ))}
        </select>
        <button type="submit" disabled={loading} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400">
          {loading ? "Creating..." : "Create Bus"}
        </button>
      </div>
    </form>
  );
}

export default function ManageBusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBusesAndDrivers = async () => {
    setLoading(true);
    const supabase = createSupabaseClient();
    const { data: busData, error: busError } = await supabase.from("buses").select(`
      id,
      name,
      driver_id,
      users ( name )
    `);
    const { data: driverData, error: driverError } = await supabase.from("users").select("id, name").eq("role", "driver");

    if (busError || driverError) {
      alert(busError?.message || driverError?.message);
    } else {
      setBuses(busData);
      setDrivers(driverData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBusesAndDrivers();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Buses</h1>
      <CreateBusForm drivers={drivers} onBusCreated={fetchBusesAndDrivers} />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
          <thead>
            <tr className="w-full bg-gray-100 dark:bg-gray-700 text-left">
              <th className="p-3 font-semibold">Bus Name</th>
              <th className="p-3 font-semibold">Assigned Driver</th>
              <th className="p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => (
              <tr key={bus.id} className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-3">{bus.name}</td>
                <td className="p-3">{bus.users && bus.users.length > 0 ? bus.users[0].name : <span className="text-gray-400">Unassigned</span>}</td>
                <td className="p-3">
                  <button className="text-blue-500 hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
