# Database Migrations

Apply in order using the Supabase CLI (`npx supabase db push`) or the Supabase dashboard SQL editor.

| File | Purpose |
|---|---|
| `20240904000001_initial_schema.sql` | Creates all tables, indexes, and `updated_at` triggers |
| `20240904000002_handle_user_sync.sql` | Functions to keep `public.users` in sync with `auth.users` on update/delete |
| `20240904000003_row_level_security.sql` | RLS policies — role-based access for admin, driver, parent |
| `20240904000004_sample_data.sql` | Optional seed data for development/testing |
| `20250904000001_handle_new_user.sql` | Trigger to auto-create a `public.users` row on signup |

## Schema at a glance

```
users            id, name, email, phone, role (admin|driver|parent)
buses            id, name, driver_id → users, status (active|inactive|maintenance)
routes           id, name, bus_id → buses, description
bus_locations    id, bus_id → buses, latitude, longitude, timestamp, speed, heading
route_stops      id, route_id → routes, name, latitude, longitude, stop_order
student_assignments  parent_id → users, bus_id → buses, route_id, pickup/dropoff stop, student_name
notifications    user_id → users, title, message, type, read
```

All primary keys are `UUID` using `gen_random_uuid()`. RLS is enabled on all tables.
