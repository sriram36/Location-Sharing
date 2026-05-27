"use client";

import { useState, useEffect, useCallback } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { busSchema } from "@/lib/validation";
import { Plus, Pencil, Trash2, Bus } from "lucide-react";

type BusStatus = "active" | "inactive" | "maintenance";
type BusRow = { id: string; name: string; status: BusStatus; driver_id: string | null; users: { name: string } | null };
type Driver = { id: string; name: string | null };

const sel = "flex h-9 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1 text-sm text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors";

const statusStyles: Record<BusStatus, string> = {
  active:      "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  inactive:    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  maintenance: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

function dbError(msg: string): string {
  if (msg.includes("duplicate key") || msg.includes("unique")) return "A bus with this name already exists.";
  if (msg.includes("foreign key")) return "Cannot delete — this bus is referenced by routes or assignments.";
  return "Something went wrong. Please try again.";
}

function CreateBusPanel({ drivers, onCreated }: { drivers: Driver[]; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [driverId, setDriverId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = busSchema.safeParse({ name, driver_id: driverId || null, status: "inactive" });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("buses").insert({ name: name.trim(), driver_id: driverId || null, status: "inactive" });
    if (error) toast.error(dbError(error.message));
    else { toast.success(`Bus "${name.trim()}" added.`); setName(""); setDriverId(""); onCreated(); }
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">New Bus</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="b-name">Bus name <span className="text-red-500">*</span></Label>
          <Input id="b-name" placeholder="e.g. Bus A-10" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="b-driver">Assign driver</Label>
          <select id="b-driver" value={driverId} onChange={(e) => setDriverId(e.target.value)} className={sel} disabled={loading}>
            <option value="">Unassigned</option>
            {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Adding…" : "Add Bus"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function EditBusDialog({ bus, drivers, onUpdated }: { bus: BusRow; drivers: Driver[]; onUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(bus.name);
  const [driverId, setDriverId] = useState(bus.driver_id ?? "");
  const [status, setStatus] = useState<BusStatus>(bus.status);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const parsed = busSchema.safeParse({ name, driver_id: driverId || null, status });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("buses").update({ name: name.trim(), driver_id: driverId || null, status }).eq("id", bus.id);
    if (error) toast.error(dbError(error.message));
    else { toast.success("Bus updated."); setOpen(false); onUpdated(); }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Edit Bus</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="eb-name">Bus Name</Label>
            <Input id="eb-name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eb-driver">Assigned Driver</Label>
            <select id="eb-driver" value={driverId} onChange={(e) => setDriverId(e.target.value)} className={sel} disabled={loading}>
              <option value="">Unassigned</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eb-status">Status</Label>
            <select id="eb-status" value={status} onChange={(e) => setStatus(e.target.value as BusStatus)} className={sel} disabled={loading}>
              <option value="inactive">Inactive</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ManageBusesPage() {
  const [buses, setBuses] = useState<BusRow[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createSupabaseClient();
    const [{ data: busData, error: busErr }, { data: driverData }] = await Promise.all([
      supabase.from("buses").select("id, name, status, driver_id, users(name)").order("name"),
      supabase.from("users").select("id, name").eq("role", "driver").order("name"),
    ]);
    if (busErr) toast.error(dbError(busErr.message));
    else setBuses((busData ?? []) as unknown as BusRow[]);
    setDrivers(driverData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBusCreated = useCallback(() => { fetchData(); setShowForm(false); }, [fetchData]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete bus "${name}"? This cannot be undone.`)) return;
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("buses").delete().eq("id", id);
    if (error) toast.error(dbError(error.message));
    else { toast.success(`Bus "${name}" deleted.`); fetchData(); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fleet</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{buses.length} buses registered</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Cancel" : "Add Bus"}
        </button>
      </div>

      {showForm && (
        <CreateBusPanel drivers={drivers} onCreated={handleBusCreated} />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          {buses.length === 0 ? (
            <div className="text-center py-14">
              <Bus className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No buses yet</p>
              <button onClick={() => setShowForm(true)} className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Add your first bus
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  {["Bus Name", "Driver", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {buses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-sm text-gray-900 dark:text-white">{bus.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {bus.users?.name ?? <span className="italic">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${statusStyles[bus.status]}`}>
                        {bus.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <EditBusDialog bus={bus} drivers={drivers} onUpdated={fetchData} />
                        <button
                          onClick={() => handleDelete(bus.id, bus.name)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
