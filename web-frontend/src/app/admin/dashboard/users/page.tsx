"use client";

import { useState, useEffect, useCallback } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createUserSchema, editUserSchema } from "@/lib/validation";
import { Plus, Pencil, Trash2, Users } from "lucide-react";

type User = { id: string; name: string | null; email?: string; phone: string | null; role: string | null; created_at: string };

const sel = "flex h-9 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1 text-sm text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors";

function dbError(msg: string): string {
  if (msg.includes("User already registered") || msg.includes("already been registered")) return "An account with this email already exists.";
  if (msg.includes("duplicate key") || msg.includes("unique")) return "A user with this email already exists.";
  if (msg.includes("row-level security") || msg.includes("permission")) return "Permission denied.";
  if (msg.includes("Password should be at least")) return "Password must be at least 8 characters.";
  return "Something went wrong. Please try again.";
}

const roleBadge: Record<string, string> = {
  admin:  "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  driver: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  parent: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

function CreateUserPanel({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("parent");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = createUserSchema.safeParse({ name, email, password, phone, role });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: { name: name.trim(), phone: phone.trim() || undefined, role } },
    });
    if (error) toast.error(dbError(error.message));
    else {
      toast.success(`Account created for ${name.trim()}. They must confirm their email before signing in.`);
      setName(""); setEmail(""); setPassword(""); setPhone(""); setRole("parent");
      onCreated();
    }
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">New User</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="u-name">Full name <span className="text-red-500">*</span></Label>
          <Input id="u-name" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="u-email">Email <span className="text-red-500">*</span></Label>
          <Input id="u-email" type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="u-password">Password <span className="text-red-500">*</span></Label>
          <Input id="u-password" type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="u-phone">Phone</Label>
          <Input id="u-phone" type="tel" placeholder="+1 234 567 8900" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="u-role">Role <span className="text-red-500">*</span></Label>
          <select id="u-role" value={role} onChange={(e) => setRole(e.target.value)} className={sel} disabled={loading}>
            <option value="parent">Parent</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating…" : "Create User"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function EditUserDialog({ user, onUpdated }: { user: User; onUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [role, setRole] = useState(user.role ?? "parent");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const parsed = editUserSchema.safeParse({ name, phone, role });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("users").update({ name: name.trim(), phone: phone.trim() || null, role }).eq("id", user.id);
    if (error) toast.error(dbError(error.message));
    else { toast.success("User updated."); setOpen(false); onUpdated(); }
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
        <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="eu-name">Full Name</Label>
            <Input id="eu-name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eu-phone">Phone</Label>
            <Input id="eu-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eu-role">Role</Label>
            <select id="eu-role" value={role} onChange={(e) => setRole(e.target.value)} className={sel} disabled={loading}>
              <option value="parent">Parent</option>
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
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

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from("users").select("id, name, email, phone, role, created_at").order("name");
    if (error) toast.error(dbError(error.message));
    else setUsers(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Delete "${name}"? This permanently removes their account.`)) return;
    const supabase = createSupabaseClient();
    const { error } = await supabase.functions.invoke("delete-user", { body: { userId } });
    if (error) toast.error("Could not delete user. Please try again.");
    else { toast.success(`"${name}" deleted.`); fetchUsers(); }
  };

  const handleUserCreated = useCallback(() => { fetchUsers(); setShowForm(false); }, [fetchUsers]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{users.length} total accounts</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Cancel" : "Add User"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <CreateUserPanel onCreated={handleUserCreated} />
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          {users.length === 0 ? (
            <div className="text-center py-14">
              <Users className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No users yet</p>
              <button onClick={() => setShowForm(true)} className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Create the first user
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  {["Name", "Phone", "Role", "Joined", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {user.name || <span className="italic text-gray-400">No name</span>}
                      </p>
                      {user.email && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{user.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${roleBadge[user.role ?? "parent"] ?? roleBadge.parent}`}>
                        {user.role ?? "parent"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <EditUserDialog user={user} onUpdated={fetchUsers} />
                        <button
                          onClick={() => handleDelete(user.id, user.name ?? "user")}
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
