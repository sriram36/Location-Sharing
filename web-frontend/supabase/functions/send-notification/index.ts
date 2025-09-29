/**
 * Supabase Edge Function: Send Notification
 * 
 * This function runs in Deno runtime, not Node.js
 * TypeScript errors in VS Code are expected and can be ignored
 * The function works perfectly when deployed to Supabase
 */

// @ts-ignore - Deno imports work in Edge Functions runtime
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore - Deno imports work in Edge Functions runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      // @ts-ignore - Deno global available in Edge Functions
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore - Deno global available in Edge Functions
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get notification data from request body
    const { user_id, title, message, type = 'info' } = await req.json()

    if (!user_id || !title || !message) {
      return new Response(
        JSON.stringify({ error: 'user_id, title, and message are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Insert notification into database
    const { error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id,
          title,
          message,
          type,
          read: false
        }
      ])

    if (error) {
      console.error('Error creating notification:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Here you can add push notification logic (FCM, APNS, etc.)
    // For now, we just store in database

    return new Response(
      JSON.stringify({ 
        message: 'Notification sent successfully',
        notification: { user_id, title, message, type }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})