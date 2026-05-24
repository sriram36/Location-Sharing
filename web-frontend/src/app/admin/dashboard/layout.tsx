import ProtectedRoute from "@/components/ProtectedRoute";
import AdminNav from "@/components/AdminNav";

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="container mx-auto px-4 py-8">
        <AdminNav />
        {children}
      </div>
    </ProtectedRoute>
  );
}
