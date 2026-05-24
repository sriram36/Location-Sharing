# School Bus Tracking System

Real-time school bus tracking application for administrators, drivers, and parents. Built with Next.js 15, Supabase, and shadcn/ui.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.5 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Maps | Leaflet + react-leaflet |
| Runtime | React 19 |

## Quick Start

**Prerequisites:** Node.js 18+, a Supabase project

```bash
cd web-frontend
npm install
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Push the database schema and deploy edge functions:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
npx supabase functions deploy delete-user
npx supabase functions deploy send-notification
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## User Roles

| Role | Dashboard | Access |
|---|---|---|
| `admin` | `/admin/dashboard` | Full fleet, user, and route management |
| `driver` | `/driver/dashboard` | Location sharing, assigned route |
| `parent` | `/parent/dashboard` | Live tracking of their child's bus |

Role is set in `raw_user_meta_data.role` at signup and synced to `public.users` via the `handle_new_user` trigger. Protected routes enforce role via `ProtectedRoute` component.

## Project Structure

```
web-frontend/
├── src/
│   ├── app/
│   │   ├── admin/dashboard/    # Fleet, user, route, assignment management
│   │   ├── driver/dashboard/   # Driver portal
│   │   ├── parent/dashboard/   # Parent tracking view
│   │   ├── login/              # Auth page (sign in / sign up)
│   │   ├── profile/            # User profile editor
│   │   └── dashboard/          # Role-based redirect after login
│   ├── components/
│   │   ├── ui/                 # shadcn/ui + custom bus-specific components
│   │   ├── Navigation.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── Map.tsx / DynamicMap.tsx
│   │   ├── LogoutButton.tsx
│   │   └── ThemeToggle.tsx
│   └── lib/
│       ├── supabaseClient.ts   # createSupabaseClient() factory
│       └── utils.ts
├── supabase/
│   ├── migrations/             # 5 ordered SQL migrations
│   └── functions/              # delete-user, send-notification (Deno)
├── public/
│   └── favicon.ico
├── .env.example
└── components.json             # shadcn/ui config
```

## Database Schema

Tables (all in `public` schema with RLS enabled):

- **users** — profiles synced from `auth.users` (`id`, `name`, `email`, `phone`, `role`)
- **buses** — fleet vehicles (`id`, `name`, `driver_id`, `status`)
- **routes** — named routes linked to buses
- **bus_locations** — real-time GPS points (`bus_id`, `latitude`, `longitude`, `timestamp`, `speed`, `heading`)
- **route_stops** — ordered stops per route (`route_id`, `name`, `latitude`, `longitude`, `stop_order`)
- **student_assignments** — links parents to buses/routes with pickup/dropoff stops
- **notifications** — in-app alerts per user

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix lint issues
npm run type-check   # TypeScript check without emitting
npm run format       # Prettier format all files
```

## Deployment

Deploy to Vercel with one command (recommended):

```bash
vercel --prod
```

Set the same environment variables from `.env.local` in your Vercel project settings. Supabase runs independently — no extra server setup needed.

## Key Implementation Notes

- `createSupabaseClient()` must only be called inside `useEffect` or event handlers, never at module or component render level. This prevents build failures during Next.js static generation.
- Authenticated page trees (`/admin`, `/driver`, `/parent`) use `export const dynamic = 'force-dynamic'` in their layout to skip static generation.
- The `handle_new_user` database trigger automatically populates `public.users` on every signup.
