# Supabase Migrations

This directory contains SQL migration files for the school bus tracking system database schema.

## Migration Files

### 1. `20240904000001_initial_schema.sql`
**Purpose:** Creates the initial database schema
**Includes:**
- Users table with roles (admin, driver, parent)
- Buses table with driver assignments
- Routes table linked to buses
- Bus locations table for real-time tracking
- Route stops table for bus stop management
- Student assignments linking parents to buses
- Notifications table for app alerts
- Indexes for performance optimization
- Triggers for automatic timestamp updates

### 2. `20240904000002_handle_user_sync.sql`
**Purpose:** Syncs Supabase Auth users with public users table
**Includes:**
- Function to handle new user creation
- Function to handle user updates
- Function to handle user deletion
- Triggers to keep auth.users and public.users in sync

### 3. `20240904000003_row_level_security.sql`
**Purpose:** Implements Row Level Security (RLS) policies
**Includes:**
- Helper functions for role checking
- Policies for data access control
- Admin-only access for management tables
- User-specific access for personal data
- Driver access for their assigned buses
- Parent access for their student assignments

### 4. `20240904000004_sample_data.sql`
**Purpose:** Provides sample data for testing
**Includes:**
- Sample users (admin, drivers, parents)
- Sample buses with driver assignments
- Sample routes with stops
- Sample student assignments
- Sample bus locations for real-time testing
- Sample notifications

## How to Apply Migrations

### Option 1: Manual Application (Recommended for existing projects)
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file in order
4. Run them one by one

### Option 2: Using Supabase CLI (For new setups)
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in your project
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

## Migration Order

**IMPORTANT:** Apply migrations in this exact order:
1. `20240904000001_initial_schema.sql` - Creates tables and basic structure
2. `20240904000002_handle_user_sync.sql` - Sets up user synchronization
3. `20240904000003_row_level_security.sql` - Implements security policies
4. `20240904000004_sample_data.sql` - Adds sample data for testing

## Database Schema Overview

```
users (auth sync)
├── id (UUID, PK)
├── name (TEXT)
├── email (TEXT, UNIQUE)
├── phone (TEXT)
├── role (admin|driver|parent)
└── timestamps

buses
├── id (UUID, PK)
├── name (TEXT)
├── driver_id (UUID, FK → users.id)
├── status (active|inactive|maintenance)
└── timestamps

routes
├── id (UUID, PK)
├── name (TEXT)
├── bus_id (UUID, FK → buses.id)
├── description (TEXT)
└── timestamps

bus_locations (real-time tracking)
├── id (UUID, PK)
├── bus_id (UUID, FK → buses.id)
├── latitude (DOUBLE)
├── longitude (DOUBLE)
├── timestamp (TIMESTAMP)
├── speed (DOUBLE)
└── heading (DOUBLE)

route_stops
├── id (UUID, PK)
├── route_id (UUID, FK → routes.id)
├── name (TEXT)
├── latitude (DOUBLE)
├── longitude (DOUBLE)
├── stop_order (INTEGER)
└── estimated_time (TIME)

student_assignments
├── id (UUID, PK)
├── parent_id (UUID, FK → users.id)
├── bus_id (UUID, FK → buses.id)
├── route_id (UUID, FK → routes.id)
├── pickup_stop_id (UUID, FK → route_stops.id)
├── dropoff_stop_id (UUID, FK → route_stops.id)
├── student_name (TEXT)
└── active (BOOLEAN)

notifications
├── id (UUID, PK)
├── user_id (UUID, FK → users.id)
├── title (TEXT)
├── message (TEXT)
├── type (info|warning|alert|success)
├── read (BOOLEAN)
└── created_at (TIMESTAMP)
```

## Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Role-based access control** (admin, driver, parent)
- **Data isolation** - users only see their relevant data
- **Admin override** - admins can manage all data
- **Driver restrictions** - drivers only access their assigned buses
- **Parent restrictions** - parents only see their student's information

## Testing Your Setup

After applying all migrations, you can test with the sample data:

1. **Admin Login:** `kollisriram6@gmail.com` (you need to sign up first)
2. **Driver Logins:** `driver1@school.com`, `driver2@school.com` (you need to create these)
3. **Parent Logins:** `parent1@school.com`, `parent2@school.com` (you need to create these)

The sample data includes realistic bus routes, stops, and assignments to test all functionality.