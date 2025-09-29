-- Row Level Security (RLS) policies for the school bus tracking system
-- These policies control who can access what data based on user roles

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Users table policies
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (is_admin(auth.uid()));

-- Buses table policies
CREATE POLICY "Authenticated users can view buses" ON public.buses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage buses" ON public.buses
  FOR ALL USING (is_admin(auth.uid()));

-- Routes table policies
CREATE POLICY "Authenticated users can view routes" ON public.routes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage routes" ON public.routes
  FOR ALL USING (is_admin(auth.uid()));

-- Bus locations table policies
CREATE POLICY "Authenticated users can view bus locations" ON public.bus_locations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Drivers can insert their bus locations" ON public.bus_locations
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) = 'driver' AND
    EXISTS (SELECT 1 FROM public.buses WHERE id = bus_id AND driver_id = auth.uid())
  );

CREATE POLICY "Admins can manage all bus locations" ON public.bus_locations
  FOR ALL USING (is_admin(auth.uid()));

-- Route stops table policies
CREATE POLICY "Authenticated users can view route stops" ON public.route_stops
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage route stops" ON public.route_stops
  FOR ALL USING (is_admin(auth.uid()));

-- Student assignments table policies
CREATE POLICY "Parents can view their own assignments" ON public.student_assignments
  FOR SELECT USING (
    parent_id = auth.uid() OR
    is_admin(auth.uid()) OR
    (get_user_role(auth.uid()) = 'driver' AND 
     EXISTS (SELECT 1 FROM public.buses WHERE id = bus_id AND driver_id = auth.uid()))
  );

CREATE POLICY "Admins can manage student assignments" ON public.student_assignments
  FOR ALL USING (is_admin(auth.uid()));

-- Notifications table policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (is_admin(auth.uid()));