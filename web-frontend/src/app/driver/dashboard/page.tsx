"use client";
import { useState, useRef, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function DriverDashboard() {
  const [isTripActive, setIsTripActive] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busId, setBusId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createSupabaseClient();

  // Get the driver's assigned bus
  const getDriverBus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("User not authenticated");
        return null;
      }

      // Get the driver's assigned bus
      const { data: driver, error: driverError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .eq("role", "driver")
        .single();

      if (driverError || !driver) {
        setError("User is not a registered driver");
        return null;
      }

      // Get the bus assigned to this driver
      const { data: bus, error: busError } = await supabase
        .from("buses")
        .select("id")
        .eq("driver_id", user.id)
        .single();

      if (busError || !bus) {
        setError("No bus assigned to this driver");
        return null;
      }

      setBusId(bus.id);
      setLoading(false);
      return bus.id;
    } catch (err) {
      setError("Error fetching driver bus assignment");
      console.error(err);
      setLoading(false);
      return null;
    }
  };

  // Function to send location to Supabase
  const sendLocationToSupabase = async (latitude: number, longitude: number) => {
    if (!busId) {
      setError("No bus ID available");
      return;
    }

    const { error } = await supabase
      .from("bus_locations")
      .insert({ bus_id: busId, latitude, longitude });

    if (error) {
      console.error("Error sending location:", error);
      setError("Could not send location to server.");
    }
  };

  // Start watching the user's position
  const startTrip = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsTripActive(true);
    setError(null);

    // Get location immediately
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        sendLocationToSupabase(latitude, longitude);
      },
      () => {
        setError("Unable to retrieve your location.");
      }
    );

    // Then, get location every 10 seconds
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        sendLocationToSupabase(latitude, longitude);
      });
    }, 10000); // Every 10 seconds
  };

  // Stop watching the user's position
  const stopTrip = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsTripActive(false);
    setLocation(null);
  };

  // Initialize driver dashboard
  useEffect(() => {
    getDriverBus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl font-medium">Loading driver information...</p>
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Driver Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bus ID: <span className="font-mono text-blue-600 dark:text-blue-400">{busId}</span>
        </p>
      </div>

      <div className="grid gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className={`w-4 h-4 rounded-full ${isTripActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-lg font-medium">
                {isTripActive ? "Trip Active - Sharing Location" : "Trip Inactive"}
              </span>
            </div>

            {isTripActive ? (
              <button
                onClick={stopTrip}
                className="w-full max-w-xs px-6 py-3 text-lg font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                🛑 Stop Trip
              </button>
            ) : (
              <button
                onClick={startTrip}
                className="w-full max-w-xs px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!busId}
              >
                🚀 Start Trip
              </button>
            )}
          </div>
        </div>

        {location && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
              <span className="mr-2">📍</span>
              Current Location
            </h3>
            <div className="space-y-2">
              <p className="text-blue-700 dark:text-blue-300">
                <strong>Coordinates:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-sm">
                <strong>Last updated:</strong> {new Date().toLocaleTimeString()}
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-sm">
                � Location updates every 10 seconds while trip is active
              </p>
            </div>
          </div>
        )}

        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📋 Instructions</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Click &quot;Start Trip&quot; to begin sharing your location</li>
            <li>• Your location will be updated every 10 seconds</li>
            <li>• Parents can track your bus in real-time</li>
            <li>• Click &quot;Stop Trip&quot; when you&apos;ve completed your route</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
