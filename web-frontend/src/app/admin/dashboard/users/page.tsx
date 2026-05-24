"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createUserSchema, editUserSchema } from "@/lib/validation";

type User = { id: string; name: string | null; phone: string | null; role: string | null; created_at: string };

function dbError(msg: string): string {
  if (msg.includes("User already registered") || msg.includes("already been registered"))
    return "An account with this email already exists.";
  if (msg.includes("duplicate key") || msg.includes("unique"))
    return "A user with this email already exists.";
  if (msg.includes("row-level security") || msg.includes("permission"))
    return "Permission denied.";
  if (msg.includes("Password should be at least"))
    return "Password must be at least 8 characters.";
  return "Something went wrong. Please try again.";
}


function CreateUserForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]       = useState("parent");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = createUserSchema.safeParse({ name, email, password, phone, role });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim(), phone: phone.trim() || undefined, role } },
    });
    if (error) toast.error(dbError(error.message));
    else {
      toast.success(`Account created for ${name.trim()}. They must confirm their email before signing in.`);
      setName(""); setPhone(""); setEmail(""); setPassword(""); setRole("parent");
      onCreated();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4">Create New User</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="Full name *" value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-700" />
        <input type="email" placeholder="Email address *" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-700" />
        <input type="password" placeholder="Password (min 8 chars) *" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-700" />
        <input type="tel" placeholder="Phone number (optional)" value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-700" />
        <select value={role} onChange={(e) => setRole(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-700">
          <option value="parent">Parent</option>
          <option value="driver">Driver</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" disabled={loading}
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400">
          {loading ? "Creating…" : "Create User"}
        </button>
      </div>
    </form>
  );
}

function EditUserDialog({ user, onUpdated }: { user: User; onUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName]   = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [role, setRole]   = useState(user.role || "parent");
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
        <Button variant="outline" size="sm" className="mr-2">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700">
              <option value="parent">Parent</option>
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button onClick={handleSave} disabled={loading}>{loading ? "Saving…" : "Save Changes"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ManageUsersPage() {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from("users").select("*").order("name");
    if (error) toast.error(dbError(error.message));
    else setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Delete "${name}"? This permanently removes their account and all login credentials.`)) return;
    const supabase = createSupabaseClient();
    const { error } = await supabase.functions.invoke("delete-user", { body: { userId } });
    if (error) toast.error("Could not delete user. Please try again.");
    else { toast.success(`"${name}" deleted.`); fetchUsers(); }
  };

  const roleBadge: Record<string, string> = {
    admin:  "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    driver: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    parent: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  };

  if (loading) return <p className="p-4 text-muted-foreground">Loading users…</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
      <CreateUserForm onCreated={fetchUsers} />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left">
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Phone</th>
              <th className="p-3 font-semibold">Role</th>
              <th className="p-3 font-semibold">Joined</th>
              <th className="p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No users yet.</td></tr>
            )}
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-3 font-medium">{user.name || <span className="italic text-muted-foreground">No name</span>}</td>
                <td className="p-3 text-muted-foreground">{user.phone || "—"}</td>
                <td className="p-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleBadge[user.role ?? "parent"] ?? roleBadge.parent}`}>
                    {user.role ?? "parent"}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="p-3 flex gap-2">
                  <EditUserDialog user={user} onUpdated={fetchUsers} />
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id, user.name ?? "user")}>
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
