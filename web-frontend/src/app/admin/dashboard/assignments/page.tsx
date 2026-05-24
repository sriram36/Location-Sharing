"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { createSupabaseClient } from "@/lib/supabaseClient";

interface StudentAssignment {
  id: string;
  parent_id: string;
  bus_id: string;
  route_id: string | null;
  student_name: string;
  active: boolean;
  created_at: string;
  users?: {
    full_name: string;
    email: string;
  };
  buses?: {
    license_plate: string;
    capacity: number;
  };
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface Bus {
  id: string;
  license_plate: string;
  capacity: number;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    parent_id: "",
    bus_id: "",
    student_name: "",
  });

  const fetchAssignments = async () => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("student_assignments")
      .select(`
        *,
        users!student_assignments_parent_id_fkey(full_name, email),
        buses(license_plate, capacity)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching assignments:", error);
    } else {
      setAssignments(data || []);
    }
  };

  const fetchUsers = async () => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, role")
      .eq("role", "parent")
      .order("full_name");

    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(data || []);
    }
  };

  const fetchBuses = async () => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("buses")
      .select("id, license_plate, capacity")
      .order("license_plate");

    if (error) {
      console.error("Error fetching buses:", error);
    } else {
      setBuses(data || []);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchAssignments(), fetchUsers(), fetchBuses()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAssignment.parent_id || !newAssignment.bus_id || !newAssignment.student_name) {
      alert("Please fill in all required fields");
      return;
    }

    const supabase = createSupabaseClient();
    const { error } = await supabase
      .from("student_assignments")
      .insert([{
        parent_id: newAssignment.parent_id,
        bus_id: newAssignment.bus_id,
        student_name: newAssignment.student_name,
        active: true,
      }]);

    if (error) {
      console.error("Error creating assignment:", error);
      alert("Error creating assignment");
    } else {
      setIsCreateModalOpen(false);
      setNewAssignment({ parent_id: "", bus_id: "", student_name: "" });
      fetchAssignments();
    }
  };

  const toggleAssignmentStatus = async (id: string, currentStatus: boolean) => {
    const supabase = createSupabaseClient();
    const { error } = await supabase
      .from("student_assignments")
      .update({ active: !currentStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating assignment:", error);
      alert("Error updating assignment");
    } else {
      fetchAssignments();
    }
  };

  const deleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    const supabase = createSupabaseClient();
    const { error } = await supabase
      .from("student_assignments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting assignment:", error);
      alert("Error deleting assignment");
    } else {
      fetchAssignments();
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-xl">Loading assignments...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Student Assignments
            </h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Create Assignment
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Parent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bus</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{assignment.student_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div>
                        <div className="font-medium">{assignment.users?.full_name}</div>
                        <div className="text-xs">{assignment.users?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{assignment.buses?.license_plate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        assignment.active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {assignment.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => toggleAssignmentStatus(assignment.id, assignment.active)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          assignment.active
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {assignment.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteAssignment(assignment.id)}
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
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No student assignments found.</p>
              </div>
            )}
          </div>
        </div>

        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create Student Assignment</h2>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Parent *</label>
                  <select
                    value={newAssignment.parent_id}
                    onChange={(e) => setNewAssignment({ ...newAssignment, parent_id: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select a parent</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.full_name} ({user.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Bus *</label>
                  <select
                    value={newAssignment.bus_id}
                    onChange={(e) => setNewAssignment({ ...newAssignment, bus_id: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select a bus</option>
                    {buses.map((bus) => (
                      <option key={bus.id} value={bus.id}>{bus.license_plate} (Capacity: {bus.capacity})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Student Name *</label>
                  <input
                    type="text"
                    value={newAssignment.student_name}
                    onChange={(e) => setNewAssignment({ ...newAssignment, student_name: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter student name"
                    required
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium">Create Assignment</button>
                  <button
                    type="button"
                    onClick={() => { setIsCreateModalOpen(false); setNewAssignment({ parent_id: "", bus_id: "", student_name: "" }); }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
