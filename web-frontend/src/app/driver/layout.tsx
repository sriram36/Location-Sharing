import ProtectedRoute from "@/components/ProtectedRoute";

export const dynamic = 'force-dynamic';

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="driver">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </ProtectedRoute>
  );
}