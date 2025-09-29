# Supabase Functions

This directory contains Edge Functions for the school bus tracking system.

## Available Functions

### 1. delete-user
**Path:** `/functions/delete-user`
**Purpose:** Securely delete users from both auth.users and public.users tables
**Usage:** Called from admin dashboard when deleting users

### 2. send-notification
**Path:** `/functions/send-notification`  
**Purpose:** Send notifications to users (stores in database, can be extended for push notifications)
**Usage:** Can be triggered by various events like bus arrivals, delays, etc.

## Deployment

To deploy these functions to Supabase:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy delete-user
supabase functions deploy send-notification
```

## Local Development

To test functions locally:

```bash
# Start local development
supabase start

# Serve functions locally
supabase functions serve

# Test delete-user function
curl -X POST 'http://localhost:54321/functions/v1/delete-user' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"userId": "user-uuid-here"}'

# Test send-notification function
curl -X POST 'http://localhost:54321/functions/v1/send-notification' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"user_id": "user-uuid", "title": "Test", "message": "Test notification", "type": "info"}'
```

## Environment Variables

Make sure these are set in your Supabase project:
- `SUPABASE_URL`: Your project URL
- `SUPABASE_ANON_KEY`: Your anon/public key  
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (for admin operations)