"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { assignmentSchema } from "@/lib/validation";
import { Plus, Trash2, X, ClipboardList } from "lucide-react";

interface Assignment {
  id: string;
  parent_id: string;
  bus_id: string;
  student_name: string;
  active: boolean;
  created_at: string;
  users?: { name: string; email: string };
  buses?: { name: string };
}
interface User { id: string; name: string; email: string }
interface Bus  { id: string; name: string }

const sel = "flex h-9 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1 text-sm text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors";

function dbError(msg: string): string {
  if (msg.includes("duplicate key") || msg.includes("unique")) return "This assignment already exists.";
  if (msg.includes("foreign key")) return "Invalid parent or bus selection.";
  return "Something went wrong. Please try again.";
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form, setForm] = useState({ parent_id: "", bus_id: "", student_name: "" });

  const fetchAssignments = async () => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("student_assignments")
      .select("*, users!student_assignments_parent_id_fkey(name, email), buses(name)")
      .order("created_at", { ascending: false });
    if (error) toast.error(dbError(error.message));
    else setAssignments(data ?? []);
  };

  useEffect(() => {
    (async () => {
      const supabase = createSupabaseClient();
      const [aRes, uRes, bRes] = await Promise.all([
        supabase.from("student_assignments")
          .select("*, users!student_assignments_parent_id_fkey(name, email), buses(name)")
          .order("created_at", { ascending: false }),
        supabase.from("users").select("id, name, email").eq("role", "parent").order("name"),
        supabase.from("buses").select("id, name").order("name"),
      ]);
      if (aRes.error) toast.error(dbError(aRes.error.message));
      else setAssignments(aRes.data ?? []);
      setUsers(uRes.data ?? []);
      setBuses(bRes.data ?? []);
      setLoading(false);
    })();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = assignmentSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setCreateLoading(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("student_assignments").insert([{
      parent_id: form.parent_id, bus_id: form.bus_id,
      student_name: form.student_name.trim(), active: true,
    }]);
    if (error) toast.error(dbError(error.message));
    else {
      toast.success(`Assignment for "${form.student_name.trim()}" created.`);
      setModalOpen(false);
      setForm({ parent_id: "", bus_id: "", student_name: "" });
      fetchAssignments();
    }
    setCreateLoading(false);
  };

  const toggleStatus = async (id: string, current: boolean, name: string) => {
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("student_assignments").update({ active: !current }).eq("id", id);
    if (error) toast.error(dbError(error.message));
    else { toast.success(`${name} marked as ${!current ? "active" : "inactive"}.`); fetchAssignments(); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete assignment for "${name}"?`)) return;
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("student_assignments").delete().eq("id", id);
    if (error) toast.error(dbError(error.message));
    else { toast.success(`Assignment for "${name}" deleted.`); fetchAssignments(); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{assignments.length} student assignments</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Assignment
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          {assignments.length === 0 ? (
            <div className="text-center py-14">
              <ClipboardList className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No assignments yet</p>
              <button onClick={() => setModalOpen(true)} className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Create the first assignment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    {["Student", "Parent", "Bus", "Status", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-sm text-gray-900 dark:text-white">{a.student_name}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{a.users?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{a.users?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{a.buses?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          a.active
                            ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}>
                          {a.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => toggleStatus(a.id, a.active, a.student_name)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                              a.active
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-200"
                                : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 hover:bg-green-200"
                            }`}
                          >
                            {a.active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => handleDelete(a.id, a.student_name)}
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
            </div>
          )}
        </div>
      )}

      {/* Create modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl w-full max-w-md">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Assignment</h2>
              <button
                onClick={() => { setModalOpen(false); setForm({ parent_id: "", bus_id: "", student_name: "" }); }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Modal body */}
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="a-parent">Parent <span className="text-red-500">*</span></Label>
                <select
                  id="a-parent"
                  value={form.parent_id}
                  onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                  className={sel}
                  disabled={createLoading}
                >
                  <option value="">Select a parent</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-bus">Bus <span className="text-red-500">*</span></Label>
                <select
                  id="a-bus"
                  value={form.bus_id}
                  onChange={(e) => setForm({ ...form, bus_id: e.target.value })}
                  className={sel}
                  disabled={createLoading}
                >
                  <option value="">Select a bus</option>
                  {buses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-student">Student name <span className="text-red-500">*</span></Label>
                <Input
                  id="a-student"
                  placeholder="e.g. Emma Johnson"
                  value={form.student_name}
                  onChange={(e) => setForm({ ...form, student_name: e.target.value })}
                  disabled={createLoading}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="submit" disabled={createLoading} className="flex-1">
                  {createLoading ? "Creating…" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setModalOpen(false); setForm({ parent_id: "", bus_id: "", student_name: "" }); }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
