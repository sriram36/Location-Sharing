"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function DriverDashboard() {
  const [isTripActive, setIsTripActive] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; ts: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busId, setBusId] = useState<string | null>(null);
  const [busName, setBusName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tripActiveRef = useRef(false); // stable ref for visibility handler
  const busIdRef = useRef<string | null>(null);

  const supabase = createSupabaseClient();

  const sendLocation = useCallback(async (latitude: number, longitude: number) => {
    const id = busIdRef.current;
    if (!id) return;
    setSending(true);
    const { error: err } = await supabase
      .from("bus_locations")
      .insert({ bus_id: id, latitude, longitude });
    setSending(false);
    if (err) setError("Could not send location to server. Check your connection.");
    else {
      setError(null);
      setLocation({ latitude, longitude, ts: new Date().toISOString() });
    }
  }, [supabase]);

  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> =>
    new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      })
    ), []);

  const startInterval = useCallback(() => {
    if (intervalRef.current) return; // already running
    intervalRef.current = setInterval(async () => {
      try {
        const pos = await getCurrentPosition();
        await sendLocation(pos.coords.latitude, pos.coords.longitude);
      } catch {
        // silently ignore individual GPS failures mid-trip
      }
    }, 10000);
  }, [getCurrentPosition, sendLocation]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Pause/resume interval when the tab is hidden/visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!tripActiveRef.current) return;
      if (document.visibilityState === "hidden") {
        stopInterval();
      } else {
        startInterval();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [startInterval, stopInterval]);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError("Your session has expired. Please sign in again."); setLoading(false); return; }

        const { data: driver, error: driverErr } = await supabase
          .from("users").select("id").eq("id", user.id).eq("role", "driver").single();
        if (driverErr || !driver) {
          setError("Your account is not registered as a driver. Contact the administrator.");
          setLoading(false); return;
        }

        const { data: bus, error: busErr } = await supabase
          .from("buses").select("id, name").eq("driver_id", user.id).single();
        if (busErr || !bus) {
          setError("No bus has been assigned to you yet. Contact the administrator.");
          setLoading(false); return;
        }

        setBusId(bus.id);
        setBusName(bus.name);
        busIdRef.current = bus.id;
      } catch {
        setError("Could not load your dashboard. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [supabase]);

  const startTrip = async () => {
    if (!navigator.geolocation) {
      setError("Your browser does not support GPS location. Please use a modern browser on a mobile device.");
      return;
    }
    setError(null);

    try {
      const pos = await getCurrentPosition();
      await sendLocation(pos.coords.latitude, pos.coords.longitude);
      setIsTripActive(true);
      tripActiveRef.current = true;
      startInterval();
    } catch {
      setError("Location access denied. Please allow location permission in your browser settings.");
    }
  };

  const stopTrip = () => {
    stopInterval();
    setIsTripActive(false);
    tripActiveRef.current = false;
    setLocation(null);
  };

  // Cleanup on unmount
  useEffect(() => () => stopInterval(), [stopInterval]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-xl font-medium">Loading driver information…</p>
        </div>
      </div>
    );
  }

  if (error && !isTripActive) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md text-center">
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-700 dark:text-red-300 font-medium mb-2">{error}</p>
            <p className="text-red-500 dark:text-red-400 text-sm">Contact the school administration for assistance.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Driver Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Assigned Bus: <span className="font-semibold text-blue-600 dark:text-blue-400">{busName}</span>
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className={`w-4 h-4 rounded-full ${isTripActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-lg font-medium">
              {isTripActive
                ? sending ? "Sending location…" : "Trip Active — Sharing Location"
                : "Trip Inactive"}
            </span>
          </div>

          {isTripActive ? (
            <button
              onClick={stopTrip}
              className="w-full max-w-xs px-6 py-3 text-lg font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Stop Trip
            </button>
          ) : (
            <button
              onClick={startTrip}
              disabled={!busId}
              className="w-full max-w-xs px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Start Trip
            </button>
          )}
        </div>
      </div>

      {error && isTripActive && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">{error}</p>
        </div>
      )}

      {location && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">Current Location</h3>
          <p className="text-blue-700 dark:text-blue-300 font-mono text-sm">
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </p>
          <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
            Last updated: {new Date(location.ts).toLocaleTimeString()}
          </p>
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instructions</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Press <strong>Start Trip</strong> to begin sharing your location with parents</li>
          <li>• Your GPS coordinates are sent every 10 seconds while the trip is active</li>
          <li>• Switching tabs or minimising the browser automatically pauses updates</li>
          <li>• Press <strong>Stop Trip</strong> when you have completed your route</li>
        </ul>
      </div>
    </div>
  );
}
