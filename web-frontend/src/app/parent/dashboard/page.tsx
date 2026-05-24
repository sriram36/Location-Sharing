"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DynamicMap from "@/components/DynamicMap";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function ParentDashboard() {
  const [busLocation, setBusLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [busId, setBusId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseClient();

  useEffect(() => {
    // First, get the current user and their assigned bus
    const getCurrentUserBus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("User not authenticated");
          return;
        }

        // Get the parent's assigned bus through student_assignments
        const { data: assignment, error: assignmentError } = await supabase
          .from("student_assignments")
          .select("bus_id")
          .eq("parent_id", user.id)
          .limit(1)
          .single();

        if (assignmentError || !assignment) {
          setError("No bus assigned to this parent");
          return;
        }

        setBusId(assignment.bus_id);
        return assignment.bus_id;
      } catch (err) {
        setError("Error fetching user bus assignment");
        console.error(err);
      }
    };

    // Fetch the initial location
    const fetchInitialLocation = async (busId: string) => {
      const { data, error } = await supabase
        .from("bus_locations")
        .select("latitude, longitude")
        .eq("bus_id", busId)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching initial location:", error);
        setError("Could not fetch bus location");
      } else if (data) {
        setBusLocation(data);
      }
      setLoading(false);
    };

    // Initialize the dashboard
    const initializeDashboard = async () => {
      const userBusId = await getCurrentUserBus();
      if (userBusId) {
        await fetchInitialLocation(userBusId);
        
        // Subscribe to real-time updates for this specific bus
        const channel = supabase
          .channel("realtime-bus-locations")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "bus_locations",
              filter: `bus_id=eq.${userBusId}`,
            },
            (payload) => {
              console.log("New bus location received!", payload.new);
              const { latitude, longitude } = payload.new as { latitude: number; longitude: number };
              setBusLocation({ latitude, longitude });
            }
          )
          .subscribe();
          
        return () => {
          supabase.removeChannel(channel);
        };
      }
    };

    initializeDashboard();

  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl font-medium">Loading bus information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-600 dark:text-red-400 text-lg font-medium mb-2">{error}</p>
            <p className="text-red-500 dark:text-red-300 text-sm">Please contact the school administration for assistance.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Track Your Child's Bus
        </h1>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Live Tracking</span>
        </div>
      </div>
      
      <div className="grid gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">🗺️</span>
            Live Bus Location
          </h2>
          <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            {busLocation ? (
              <DynamicMap lat={busLocation.latitude} lng={busLocation.longitude} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-pulse w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3"></div>
                  <p className="text-gray-500 dark:text-gray-400">Waiting for bus location...</p>
                </div>
              </div>
            )}
          </div>
          {busLocation && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-200 flex items-center">
                <span className="mr-2">📍</span>
                Bus is currently at: {busLocation.latitude.toFixed(6)}, {busLocation.longitude.toFixed(6)}
              </p>
              <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
