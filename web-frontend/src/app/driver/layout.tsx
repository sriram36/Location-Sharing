import ProtectedRoute from "@/components/ProtectedRoute";
import DriverNav from "@/components/DriverNav";

export const dynamic = 'force-dynamic';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="driver">
      <div className="container mx-auto px-4 py-8">
        <DriverNav />
        {children}
      </div>
    </ProtectedRoute>
  );
}