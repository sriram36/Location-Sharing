"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { MapPin, Navigation, StopCircle, Bus, Clock, Wifi, WifiOff } from "lucide-react";

export default function DriverDashboard() {
  const [isTripActive, setIsTripActive] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; ts: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busId, setBusId] = useState<string | null>(null);
  const [busName, setBusName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tripActiveRef = useRef(false);
  const busIdRef = useRef<string | null>(null);
  const supabase = useRef(createSupabaseClient()).current;

  const sendLocation = useCallback(async (latitude: number, longitude: number) => {
    const id = busIdRef.current;
    if (!id) return;
    setSending(true);
    const { error: err } = await supabase.from("bus_locations").insert({ bus_id: id, latitude, longitude });
    setSending(false);
    if (err) setError("Could not send location. Check your connection.");
    else {
      setError(null);
      setLocation({ latitude, longitude, ts: new Date().toISOString() });
      setUpdateCount((c) => c + 1);
    }
  }, [supabase]);

  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> =>
    new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true, timeout: 10000, maximumAge: 0,
      })
    ), []);

  const startInterval = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(async () => {
      try {
        const pos = await getCurrentPosition();
        await sendLocation(pos.coords.latitude, pos.coords.longitude);
      } catch { /* silently ignore mid-trip GPS glitches */ }
    }, 10000);
  }, [getCurrentPosition, sendLocation]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  useEffect(() => {
    const handle = () => {
      if (!tripActiveRef.current) return;
      if (document.visibilityState === "hidden") stopInterval(); else startInterval();
    };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, [startInterval, stopInterval]);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError("Your session has expired. Please sign in again."); setLoading(false); return; }
        const { data: driver } = await supabase.from("users").select("id").eq("id", user.id).eq("role", "driver").single();
        if (!driver) { setError("Your account is not registered as a driver. Contact the administrator."); setLoading(false); return; }
        const { data: bus } = await supabase.from("buses").select("id, name").eq("driver_id", user.id).single();
        if (!bus) { setError("No bus has been assigned to you yet. Contact the administrator."); setLoading(false); return; }
        setBusId(bus.id);
        setBusName(bus.name);
        busIdRef.current = bus.id;
      } catch { setError("Could not load your dashboard. Check your connection and try again."); }
      finally { setLoading(false); }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => stopInterval(), [stopInterval]);

  const startTrip = async () => {
    if (!navigator.geolocation) { setError("GPS not supported. Please use a modern mobile browser."); return; }
    setError(null);
    try {
      const pos = await getCurrentPosition();
      await sendLocation(pos.coords.latitude, pos.coords.longitude);
      setIsTripActive(true);
      tripActiveRef.current = true;
      setUpdateCount(1);
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
    setUpdateCount(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-lg font-medium text-muted-foreground">Loading driver information…</p>
        </div>
      </div>
    );
  }

  if (error && !isTripActive) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-sm w-full mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto">
            <Bus className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-5">
            <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">Contact your school administrator.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">

      {/* Bus header */}
      <div className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center shrink-0">
          <Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Assigned bus</p>
          <p className="font-semibold text-gray-900 dark:text-white truncate">{busName}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          {isTripActive ? (
            <span className="flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950 px-2 py-1 rounded-full">
              <Wifi className="w-3 h-3" /> Live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              <WifiOff className="w-3 h-3" /> Offline
            </span>
          )}
        </div>
      </div>

      {/* Main Start/Stop card */}
      <div className={`rounded-2xl border p-8 text-center transition-all duration-500 shadow-sm ${
        isTripActive
          ? "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800"
          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
      }`}>

        {/* Status ring */}
        <div className="relative inline-flex mb-6">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 ${
            isTripActive
              ? "bg-green-500 shadow-lg shadow-green-500/30"
              : "bg-gray-200 dark:bg-gray-700"
          }`}>
            {isTripActive
              ? <Navigation className="w-12 h-12 text-white" />
              : <Navigation className="w-12 h-12 text-gray-500 dark:text-gray-400" />
            }
          </div>
          {isTripActive && (
            <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-25" />
          )}
        </div>

        <p className={`text-xl font-bold mb-1 ${isTripActive ? "text-green-700 dark:text-green-300" : "text-gray-700 dark:text-gray-300"}`}>
          {isTripActive
            ? sending ? "Sending location…" : "Sharing Live Location"
            : "Trip Not Started"}
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          {isTripActive
            ? "Parents can see your bus on the map in real time"
            : "Press Start Trip when you begin your route"}
        </p>

        {isTripActive ? (
          <button
            onClick={stopTrip}
            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-2xl transition-all shadow-md"
          >
            <StopCircle className="w-5 h-5" />
            Stop Trip
          </button>
        ) : (
          <button
            onClick={startTrip}
            disabled={!busId}
            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-green-600 hover:bg-green-700 active:scale-95 rounded-2xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Navigation className="w-5 h-5" />
            Start Trip
          </button>
        )}
      </div>

      {/* Error during active trip */}
      {error && isTripActive && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">{error}</p>
          <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-0.5">Location updates will retry automatically.</p>
        </div>
      )}

      {/* Live location info */}
      {location && isTripActive && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" /> Current Location
          </p>
          <p className="font-mono text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg">
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Updated {new Date(location.ts).toLocaleTimeString()}
            </span>
            <span>{updateCount} update{updateCount !== 1 ? "s" : ""} sent</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">How it works</p>
        <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span> Tap <strong>Start Trip</strong> when you begin your route</li>
          <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span> Your GPS is shared with parents every 10 seconds</li>
          <li className="flex items-start gap-2"><span className="text-yellow-500 mt-0.5">•</span> Switching tabs pauses updates automatically</li>
          <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">•</span> Tap <strong>Stop Trip</strong> when your route is complete</li>
        </ul>
      </div>

    </div>
  );
}
