import ProtectedRoute from "@/components/ProtectedRoute";
import DriverNav from "@/components/DriverNav";

export const dynamic = 'force-dynamic';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="driver">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-5 py-6 max-w-2xl">
          <DriverNav />
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}