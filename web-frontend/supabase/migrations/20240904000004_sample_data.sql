-- Sample data for testing the school bus tracking system
-- Run this after the initial schema and security policies are in place

-- Insert sample users with specific UUIDs for consistency
INSERT INTO public.users (id, name, email, phone, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sriram Kolli', 'kollisriram6@gmail.com', '+1234567890', 'admin'),
('550e8400-e29b-41d4-a716-446655440002', 'Mike Driver', 'driver1@school.com', '+1234567891', 'driver'),
('550e8400-e29b-41d4-a716-446655440003', 'Sarah Driver', 'driver2@school.com', '+1234567892', 'driver'),
('550e8400-e29b-41d4-a716-446655440004', 'Lisa Driver', 'driver3@school.com', '+1234567893', 'driver'),
('550e8400-e29b-41d4-a716-446655440005', 'Mary Parent', 'parent1@school.com', '+1234567894', 'parent'),
('550e8400-e29b-41d4-a716-446655440006', 'David Parent', 'parent2@school.com', '+1234567895', 'parent'),
('550e8400-e29b-41d4-a716-446655440007', 'Jennifer Parent', 'parent3@school.com', '+1234567896', 'parent'),
('550e8400-e29b-41d4-a716-446655440008', 'Robert Parent', 'parent4@school.com', '+1234567897', 'parent')
ON CONFLICT (id) DO NOTHING;

-- Insert sample buses
INSERT INTO public.buses (id, name, driver_id, status) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Bus Route A - Elementary', '550e8400-e29b-41d4-a716-446655440002', 'active'),
('650e8400-e29b-41d4-a716-446655440002', 'Bus Route B - Middle School', '550e8400-e29b-41d4-a716-446655440003', 'active'),
('650e8400-e29b-41d4-a716-446655440003', 'Bus Route C - High School', '550e8400-e29b-41d4-a716-446655440004', 'inactive'),
('650e8400-e29b-41d4-a716-446655440004', 'Bus Route D - Special Needs', null, 'maintenance')
ON CONFLICT (id) DO NOTHING;

-- Insert sample routes
INSERT INTO public.routes (id, name, bus_id, description) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'Downtown Elementary Route', '650e8400-e29b-41d4-a716-446655440001', 'Covers downtown area for elementary students'),
('750e8400-e29b-41d4-a716-446655440002', 'Suburb Middle School Route', '650e8400-e29b-41d4-a716-446655440002', 'Suburban neighborhoods for middle school'),
('750e8400-e29b-41d4-a716-446655440003', 'Hill Area High School Route', '650e8400-e29b-41d4-a716-446655440003', 'Hill area and outskirts for high school students'),
('750e8400-e29b-41d4-a716-446655440004', 'Special Needs Route', null, 'Specialized route for students with special needs')
ON CONFLICT (id) DO NOTHING;

-- Insert sample route stops
INSERT INTO public.route_stops (id, route_id, name, latitude, longitude, stop_order, estimated_time) VALUES
-- Downtown Elementary Route stops
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'Main Street & 1st Ave', 40.7128, -74.0060, 1, '07:30:00'),
('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', 'City Park Entrance', 40.7138, -74.0070, 2, '07:35:00'),
('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', 'Downtown Elementary School', 40.7148, -74.0080, 3, '07:45:00'),

-- Suburb Middle School Route stops  
('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440002', 'Maple Street Corner', 34.0522, -118.2437, 1, '07:45:00'),
('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440002', 'Oak Grove Shopping Center', 34.0532, -118.2447, 2, '07:50:00'),
('850e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440002', 'Westside Middle School', 34.0542, -118.2457, 3, '08:00:00'),

-- Hill Area High School Route stops
('850e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440003', 'Hilltop Community Center', 41.8781, -87.6298, 1, '07:15:00'),
('850e8400-e29b-41d4-a716-446655440008', '750e8400-e29b-41d4-a716-446655440003', 'Pine Ridge Apartments', 41.8791, -87.6308, 2, '07:25:00'),
('850e8400-e29b-41d4-a716-446655440009', '750e8400-e29b-41d4-a716-446655440003', 'Mountain View High School', 41.8801, -87.6318, 3, '07:40:00')
ON CONFLICT (id) DO NOTHING;

-- Insert sample student assignments
INSERT INTO public.student_assignments (id, parent_id, bus_id, route_id, pickup_stop_id, dropoff_stop_id, student_name, active) VALUES
('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440003', 'Emma Johnson', true),
('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440006', 'Michael Smith', true),
('950e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440007', '850e8400-e29b-41d4-a716-446655440009', 'Sophia Williams', true),
('950e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440003', 'James Brown', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample bus locations (recent positions)
INSERT INTO public.bus_locations (bus_id, latitude, longitude, timestamp, speed, heading) VALUES
-- Bus Route A current location
('650e8400-e29b-41d4-a716-446655440001', 40.7128, -74.0060, NOW() - INTERVAL '30 seconds', 25.5, 90),
('650e8400-e29b-41d4-a716-446655440001', 40.7130, -74.0062, NOW() - INTERVAL '20 seconds', 28.0, 85),
('650e8400-e29b-41d4-a716-446655440001', 40.7132, -74.0064, NOW() - INTERVAL '10 seconds', 30.2, 80),
('650e8400-e29b-41d4-a716-446655440001', 40.7135, -74.0067, NOW(), 32.1, 78),

-- Bus Route B current location
('650e8400-e29b-41d4-a716-446655440002', 34.0522, -118.2437, NOW() - INTERVAL '25 seconds', 20.0, 180),
('650e8400-e29b-41d4-a716-446655440002', 34.0525, -118.2440, NOW() - INTERVAL '15 seconds', 22.5, 175),
('650e8400-e29b-41d4-a716-446655440002', 34.0528, -118.2443, NOW() - INTERVAL '5 seconds', 25.8, 170),
('650e8400-e29b-41d4-a716-446655440002', 34.0530, -118.2445, NOW(), 28.3, 165);

-- Insert sample notifications
INSERT INTO public.notifications (user_id, title, message, type) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'Bus Arriving Soon', 'Bus Route A will arrive at Main Street & 1st Ave in 5 minutes', 'info'),
('550e8400-e29b-41d4-a716-446655440006', 'Route Delay', 'Bus Route B is running 10 minutes late due to traffic', 'warning'),
('550e8400-e29b-41d4-a716-446655440007', 'School Closed', 'Mountain View High School is closed today due to weather conditions', 'alert'),
('550e8400-e29b-41d4-a716-446655440001', 'System Update', 'New features have been added to the admin dashboard', 'success');