
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Welcome! You are authenticated.</p>
        <LogoutButton />
      </div>
    </ProtectedRoute>
  );
}
