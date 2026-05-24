"use client";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type User = {
  id: string;
  name: string | null;
  email?: string;
  phone: string | null;
  role: string | null;
  created_at: string;
};

function CreateUserForm({ onUserCreated }: { onUserCreated: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("parent");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseClient();

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone, role },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setRole("parent");
    onUserCreated();
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleCreateUser}
      className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
    >
      <h2 className="text-xl font-bold mb-4">Create New User</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="p-2 border rounded"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="parent">Parent</option>
          <option value="driver">Driver</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </div>
    </form>
  );
}

function EditUserDialog({
  user,
  onUserUpdated,
}: {
  user: User;
  onUserUpdated: () => void;
}) {
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [role, setRole] = useState(user.role || "parent");
  const [loading, setLoading] = useState(false);

  const handleUpdateUser = async () => {
    setLoading(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase
      .from("users")
      .update({ name, phone, role })
      .eq("id", user.id);

    if (error) alert(error.message);
    else onUserUpdated();
    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mr-2">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="p-2 border rounded"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="parent">Parent</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
          <Button onClick={handleUpdateUser} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from("users").select("*");
    if (error) setError(error.message);
    else setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This also deletes their login credentials."
      )
    ) {
      try {
        const supabase = createSupabaseClient();
        const { error } = await supabase.functions.invoke("delete-user", {
          body: { userId },
        });
        if (error) throw error;
        alert("User deleted successfully.");
        fetchUsers();
      } catch (error: unknown) {
        alert(`Error deleting user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
      <CreateUserForm onUserCreated={fetchUsers} />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow">
          <thead>
            <tr className="w-full bg-gray-100 dark:bg-gray-700 text-left">
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Phone</th>
              <th className="p-3 font-semibold">Role</th>
              <th className="p-3 font-semibold">Joined</th>
              <th className="p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <td className="p-3">{user.name || "N/A"}</td>
                <td className="p-3">{user.phone || "N/A"}</td>
                <td className="p-3">{user.role || "N/A"}</td>
                <td className="p-3">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <EditUserDialog user={user} onUserUpdated={fetchUsers} />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                  >
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
