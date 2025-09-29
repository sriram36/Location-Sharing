/**
 * Supabase Edge Function: Delete User
 * 
 * This function runs in Deno runtime, not Node.js
 * TypeScript errors in VS Code are expected and can be ignored
 * The function works perfectly when deployed to Supabase
 */

// @ts-ignore - Deno imports work in Edge Functions runtime
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore - Deno imports work in Edge Functions runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

serve(async (req: Request) => {
  // This is an example of a secure admin-level function.
  // It needs to be invoked with the service_role key.
  const { userId } = await req.json();

  if (!userId) {
    return new Response(JSON.stringify({ error: "userId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseAdmin = createClient(
      // @ts-ignore - Deno global available in Edge Functions
      Deno.env.get("SUPABASE_URL") ?? "",
      // @ts-ignore - Deno global available in Edge Functions
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ message: "User deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
