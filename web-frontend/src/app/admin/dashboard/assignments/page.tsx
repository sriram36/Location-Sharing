"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { assignmentSchema } from "@/lib/validation";

interface StudentAssignment {
  id: string;
  parent_id: string;
  bus_id: string;
  route_id: string | null;
  student_name: string;
  active: boolean;
  created_at: string;
  users?: { name: string; email: string };
  buses?: { name: string };
}

interface User { id: string; name: string; email: string }
interface Bus  { id: string; name: string }

function dbError(msg: string): string {
  if (msg.includes("duplicate key") || msg.includes("unique")) return "This assignment already exists.";
  if (msg.includes("foreign key")) return "Invalid parent or bus selection.";
  if (msg.includes("row-level security")) return "Permission denied.";
  return "Something went wrong. Please try again.";
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [users, setUsers]   = useState<User[]>([]);
  const [buses, setBuses]   = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ parent_id: "", bus_id: "", student_name: "" });

  const fetchAssignments = async () => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("student_assignments")
      .select("*, users!student_assignments_parent_id_fkey(name, email), buses(name)")
      .order("created_at", { ascending: false });
    if (error) toast.error(dbError(error.message));
    else setAssignments(data || []);
  };

  useEffect(() => {
    const init = async () => {
      const supabase = createSupabaseClient();
      const [aRes, uRes, bRes] = await Promise.all([
        supabase.from("student_assignments")
          .select("*, users!student_assignments_parent_id_fkey(name, email), buses(name)")
          .order("created_at", { ascending: false }),
        supabase.from("users").select("id, name, email").eq("role", "parent").order("name"),
        supabase.from("buses").select("id, name").order("name"),
      ]);
      if (aRes.error) toast.error(dbError(aRes.error.message));
      else setAssignments(aRes.data || []);
      setUsers(uRes.data || []);
      setBuses(bRes.data || []);
      setLoading(false);
    };
    init();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = assignmentSchema.safeParse({
      parent_id: form.parent_id,
      bus_id: form.bus_id,
      student_name: form.student_name,
    });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("student_assignments").insert([{
      parent_id: form.parent_id,
      bus_id: form.bus_id,
      student_name: form.student_name.trim(),
      active: true,
    }]);
    if (error) toast.error(dbError(error.message));
    else {
      toast.success(`Assignment for "${form.student_name.trim()}" created.`);
      setModalOpen(false);
      setForm({ parent_id: "", bus_id: "", student_name: "" });
      fetchAssignments();
    }
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

  if (loading) return <p className="p-4 text-muted-foreground">Loading assignments…</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Assignments</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Create Assignment
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {["Student", "Parent", "Bus", "Status", "Actions"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {assignments.map((a) => (
              <tr key={a.id}>
                <td className="px-6 py-4 font-medium">{a.student_name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  <div className="font-medium text-foreground">{a.users?.name}</div>
                  <div className="text-xs">{a.users?.email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{a.buses?.name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    a.active
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}>
                    {a.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => toggleStatus(a.id, a.active, a.student_name)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      a.active
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                    }`}
                  >
                    {a.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(a.id, a.student_name)}
                    className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded text-xs font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {assignments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No assignments yet.</div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Student Assignment</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Parent *</label>
                <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700">
                  <option value="">Select a parent</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bus *</label>
                <select value={form.bus_id} onChange={(e) => setForm({ ...form, bus_id: e.target.value })}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700">
                  <option value="">Select a bus</option>
                  {buses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Student Name *</label>
                <input type="text" value={form.student_name}
                  onChange={(e) => setForm({ ...form, student_name: e.target.value })}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700"
                  placeholder="e.g. Emma Johnson" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium">
                  Create
                </button>
                <button type="button"
                  onClick={() => { setModalOpen(false); setForm({ parent_id: "", bus_id: "", student_name: "" }); }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 py-2 px-4 rounded-md font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
