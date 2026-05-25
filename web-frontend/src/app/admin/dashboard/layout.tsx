import ProtectedRoute from "@/components/ProtectedRoute";
import AdminNav from "@/components/AdminNav";

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <AdminNav />
        {/* lg:pl-56 offsets content past the fixed sidebar width */}
        <main className="lg:pl-56">
          <div className="px-5 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
