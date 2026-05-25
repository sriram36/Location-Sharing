import ProtectedRoute from "@/components/ProtectedRoute";

export const dynamic = 'force-dynamic';

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="parent">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-5 py-6 max-w-3xl">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}