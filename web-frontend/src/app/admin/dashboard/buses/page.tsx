"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { busSchema } from "@/lib/validation";

type Bus = {
  id: string;
  name: string;
  status: "active" | "inactive" | "maintenance";
  driver_id: string | null;
  users: { name: string } | null;
};

type Driver = { id: string; name: string | null };

function dbError(msg: string): string {
  if (msg.includes("duplicate key") || msg.includes("unique"))
    return "A bus with this name already exists.";
  if (msg.includes("row-level security") || msg.includes("permission"))
    return "Permission denied.";
  if (msg.includes("foreign key"))
    return "Cannot delete — this bus is referenced by routes or assignments.";
  return "Something went wrong. Please try again.";
}

function CreateBusForm({ drivers, onCreated }: { drivers: Driver[]; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [driverId, setDriverId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = busSchema.safeParse({ name, driver_id: driverId || null, status: "inactive" });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase
      .from("buses")
      .insert({ name: name.trim(), driver_id: driverId || null, status: "inactive" });
    if (error) toast.error(dbError(error.message));
    else { toast.success(`Bus "${name.trim()}" added.`); setName(""); setDriverId(""); onCreated(); }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4">Add New Bus</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Bus name (e.g. Bus A-10)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-700"
        />
        <select
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-700"
        >
          <option value="">Assign driver (optional)</option>
          {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Adding…" : "Add Bus"}
        </button>
      </div>
    </form>
  );
}

function EditBusDialog({ bus, drivers, onUpdated }: { bus: Bus; drivers: Driver[]; onUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(bus.name);
  const [driverId, setDriverId] = useState(bus.driver_id ?? "");
  const [status, setStatus] = useState<Bus["status"]>(bus.status);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const parsed = busSchema.safeParse({ name, driver_id: driverId || null, status });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase
      .from("buses")
      .update({ name: name.trim(), driver_id: driverId || null, status })
      .eq("id", bus.id);
    if (error) toast.error(dbError(error.message));
    else { toast.success("Bus updated."); setOpen(false); onUpdated(); }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Bus</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Bus Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Assigned Driver</label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700"
            >
              <option value="">Unassigned</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Bus["status"])}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700"
            >
              <option value="inactive">Inactive</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const statusBadge: Record<Bus["status"], string> = {
  active:      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  inactive:    "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  maintenance: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

export default function ManageBusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const supabase = createSupabaseClient();
    const [{ data: busData, error: busErr }, { data: driverData, error: driverErr }] = await Promise.all([
      supabase.from("buses").select("id, name, status, driver_id, users(name)").order("name"),
      supabase.from("users").select("id, name").eq("role", "driver").order("name"),
    ]);
    if (busErr || driverErr) toast.error(dbError(busErr?.message ?? driverErr?.message ?? ""));
    else {
      setBuses((busData ?? []) as unknown as Bus[]);
      setDrivers(driverData ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete bus "${name}"? This cannot be undone.`)) return;
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("buses").delete().eq("id", id);
    if (error) toast.error(dbError(error.message));
    else { toast.success(`Bus "${name}" deleted.`); fetchData(); }
  };

  if (loading) return <p className="p-4 text-muted-foreground">Loading buses…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Buses</h1>
      <CreateBusForm drivers={drivers} onCreated={fetchData} />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left">
              <th className="p-3 font-semibold">Bus Name</th>
              <th className="p-3 font-semibold">Driver</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {buses.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No buses yet. Add one above.</td></tr>
            )}
            {buses.map((bus) => (
              <tr key={bus.id} className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-3 font-medium">{bus.name}</td>
                <td className="p-3 text-muted-foreground">
                  {bus.users?.name ?? <span className="italic">Unassigned</span>}
                </td>
                <td className="p-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge[bus.status]}`}>
                    {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <EditBusDialog bus={bus} drivers={drivers} onUpdated={fetchData} />
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(bus.id, bus.name)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
