"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Mail, ShieldCheck, Calendar } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: string;
  created_at: string;
}

const roleBadge: Record<string, string> = {
  admin:  "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  driver: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  parent: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const supabase = createSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      supabase.from("users").select("*").eq("id", session.user.id).single().then(({ data }) => {
        if (data) { setUser(data); setDisplayName(data.name ?? ""); }
        setLoading(false);
      });
    });
  }, []);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdating(true);
    setMessage(null);
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("users").update({ name: displayName.trim() }).eq("id", user.id);
    if (error) {
      setMessage({ text: "Could not update your profile. Please try again.", success: false });
    } else {
      setMessage({ text: "Profile updated successfully!", success: true });
      setUser({ ...user, name: displayName.trim() });
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400">User not found. Please sign in again.</p>
        </div>
      </div>
    );
  }

  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();

  return (
    <div className="container mx-auto px-6 py-8 max-w-2xl">
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your account information</p>
        </div>

        {/* Identity card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">{user.name || user.email}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${roleBadge[user.role] ?? roleBadge.parent}`}>
                {user.role}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3 h-3" />
                Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* Account info (read-only) */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Account Information</h2>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800/60">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Email address</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
              </div>
              <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 shrink-0">Cannot change</span>
            </div>
            <div className="flex items-center gap-3 py-2">
              <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{user.role}</p>
              </div>
              <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 shrink-0">Set by admin</span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Update Profile</h2>
          </div>
          <form onSubmit={updateProfile} className="px-5 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Full Name</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your full name"
                disabled={updating}
              />
            </div>

            {message && (
              <Alert className={message.success ? "border-green-200 bg-green-50 dark:bg-green-950/50" : "border-red-200 bg-red-50 dark:bg-red-950/50"}>
                <span className="flex items-start gap-2">
                  {message.success
                    ? <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    : <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
                  <AlertDescription className={message.success ? "text-green-800 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
                    {message.text}
                  </AlertDescription>
                </span>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={updating}>
                {updating ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
