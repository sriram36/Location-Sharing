# Edge Functions

Deno-based Supabase Edge Functions deployed to `llgvreodmsfbfvqamubi`.

## Functions

### `delete-user`
Deletes a user from both `auth.users` and `public.users`. Called from the admin users page.

```bash
npx supabase functions deploy delete-user
```

### `send-notification`
Inserts a notification row for a user. Can be triggered server-side for bus events.

```bash
npx supabase functions deploy send-notification
```

## Deploy all

```bash
npx supabase functions deploy delete-user
npx supabase functions deploy send-notification
```

## Local testing

```bash
# Start local Supabase (requires Docker)
npx supabase start
npx supabase functions serve

# Test delete-user
curl -X POST http://localhost:54321/functions/v1/delete-user \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"userId":"<uuid>"}'

# Test send-notification
curl -X POST http://localhost:54321/functions/v1/send-notification \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"<uuid>","title":"Test","message":"Hello","type":"info"}'
```
