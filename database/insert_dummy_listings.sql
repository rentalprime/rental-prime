-- Insert dummy data into listings table
-- First, let's create some categories if they don't exist
INSERT INTO categories (id, name, description, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Electronics', 'Electronic devices and gadgets', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Furniture', 'Home and office furniture', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Sports', 'Sports equipment and gear', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'Tools', 'Power tools and equipment', NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', 'Vehicles', 'Cars, bikes, and other vehicles', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create some users if they don't exist
INSERT INTO users (id, name, email, password, user_type, status, created_at, updated_at)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Rajesh Kumar', 'rajesh@example.com', '$2a$10$xVqYLGUuJ9Qh0JMn1VIbUeUFJUqGYjXvJ.hJ1ew8Qm0YR9.6smJwC', 'regular', 'active', NOW(), NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Priya Sharma', 'priya@example.com', '$2a$10$xVqYLGUuJ9Qh0JMn1VIbUeUFJUqGYjXvJ.hJ1ew8Qm0YR9.6smJwC', 'regular', 'active', NOW(), NOW()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Amit Patel', 'amit@example.com', '$2a$10$xVqYLGUuJ9Qh0JMn1VIbUeUFJUqGYjXvJ.hJ1ew8Qm0YR9.6smJwC', 'regular', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert dummy listings with all the new fields
INSERT INTO listings (
  id, 
  title, 
  description, 
  price, 
  category_id, 
  location, 
  status, 
  featured, 
  user_id, 
  created_at, 
  updated_at,
  brand,
  condition,
  specifications,
  price_period,
  deposit,
  min_duration,
  available_from,
  available_to,
  delivery,
  shipping,
  video,
  rental_terms,
  accept_deposit,
  cancellation,
  notes,
  images
) VALUES 
-- Listing 1: Professional DSLR Camera
(
  'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1',
  'Professional DSLR Camera',
  'High-quality camera for professional photography. Perfect for events, portraits, and landscape photography.',
  3500.00,
  '11111111-1111-1111-1111-111111111111', -- Electronics category
  'Mumbai, Maharashtra',
  'active',
  true,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Rajesh Kumar
  NOW() - INTERVAL '10 days',
  NOW(),
  'Canon',
  'Like New',
  '[{"key": "Model", "value": "EOS 5D Mark IV"}, {"key": "Resolution", "value": "30.4 MP"}, {"key": "Lens", "value": "24-70mm f/2.8L"}]',
  'day',
  15000.00,
  2,
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '6 months',
  true,
  500.00,
  'https://www.youtube.com/watch?v=example1',
  'Aadhar card required, security deposit required. No international shipping.',
  true,
  'moderate',
  'Comes with extra battery and carrying case. Perfect for professional shoots.',
  '["https://example.com/images/camera1.jpg", "https://example.com/images/camera2.jpg"]'
),

-- Listing 2: Mountain Bike
(
  'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2',
  'Premium Mountain Bike',
  'High-performance mountain bike for trail riding and off-road adventures.',
  2500.00,
  '33333333-3333-3333-3333-333333333333', -- Sports category
  'Pune, Maharashtra',
  'active',
  false,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', -- Priya Sharma
  NOW() - INTERVAL '5 days',
  NOW(),
  'Hero',
  'Good',
  '[{"key": "Frame", "value": "Aluminum"}, {"key": "Gears", "value": "21-speed"}, {"key": "Suspension", "value": "Front suspension fork"}]',
  'day',
  10000.00,
  1,
  NOW(),
  NOW() + INTERVAL '3 months',
  true,
  800.00,
  'https://www.youtube.com/watch?v=example2',
  'Helmet included. Renter responsible for any damage.',
  true,
  'strict',
  'Local pickup preferred. Delivery available for additional fee.',
  '["https://example.com/images/bike1.jpg", "https://example.com/images/bike2.jpg"]'
),

-- Listing 3: Power Drill Set
(
  'e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3',
  'Professional Power Drill Set',
  'Complete power drill set with multiple bits and attachments for any home project.',
  1500.00,
  '44444444-4444-4444-4444-444444444444', -- Tools category
  'Bangalore, Karnataka',
  'active',
  false,
  'cccccccc-cccc-cccc-cccc-cccccccccccc', -- Amit Patel
  NOW() - INTERVAL '15 days',
  NOW(),
  'Bosch',
  'Good',
  '[{"key": "Type", "value": "Cordless"}, {"key": "Voltage", "value": "20V"}, {"key": "Includes", "value": "Drill, charger, case, 30 bits"}]',
  'day',
  5000.00,
  1,
  NOW(),
  NOW() + INTERVAL '2 months',
  false,
  0.00,
  NULL,
  'Return in same condition. Battery must be charged before return.',
  true,
  'flexible',
  'Great for home improvement projects. Local pickup only.',
  '["https://example.com/images/drill1.jpg", "https://example.com/images/drill2.jpg"]'
),

-- Listing 4: Modern Sofa
(
  'e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4',
  'Modern Sectional Sofa',
  'Stylish modern sectional sofa, perfect for staging or temporary home furnishing.',
  5000.00,
  '22222222-2222-2222-2222-222222222222', -- Furniture category
  'Delhi, NCR',
  'active',
  true,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Rajesh Kumar
  NOW() - INTERVAL '20 days',
  NOW(),
  'Godrej Interio',
  'Like New',
  '[{"key": "Material", "value": "Fabric"}, {"key": "Color", "value": "Gray"}, {"key": "Seats", "value": "5 people"}, {"key": "Dimensions", "value": "3m x 2m"}]',
  'week',
  20000.00,
  1,
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '4 months',
  true,
  3000.00,
  'https://www.youtube.com/watch?v=example4',
  'Professional delivery and pickup included in shipping fee.',
  true,
  'moderate',
  'Perfect for home staging or temporary furnishing needs.',
  '["https://example.com/images/sofa1.jpg", "https://example.com/images/sofa2.jpg"]'
),

-- Listing 5: Electric Scooter
(
  'e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5',
  'Electric Scooter',
  'Eco-friendly electric scooter for urban commuting and short trips.',
  1800.00,
  '55555555-5555-5555-5555-555555555555', -- Vehicles category
  'Chennai, Tamil Nadu',
  'active',
  true,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', -- Priya Sharma
  NOW() - INTERVAL '7 days',
  NOW(),
  'Ather',
  'Good',
  '[{"key": "Range", "value": "30 km"}, {"key": "Max Speed", "value": "25 kmph"}, {"key": "Weight", "value": "12 kg"}, {"key": "Battery", "value": "36V lithium-ion"}]',
  'day',
  8000.00,
  1,
  NOW(),
  NOW() + INTERVAL '2 months',
  true,
  500.00,
  'https://www.youtube.com/watch?v=example5',
  'Helmet included. Return with full battery charge.',
  true,
  'flexible',
  'Charger included. Great for city commuting.',
  '["https://example.com/images/scooter1.jpg", "https://example.com/images/scooter2.jpg"]'
),

-- Listing 6: Projector
(
  'e6e6e6e6-e6e6-e6e6-e6e6-e6e6e6e6e6e6',
  'HD Projector for Home Theater',
  'High-definition projector for movie nights, presentations, or gaming.',
  2800.00,
  '11111111-1111-1111-1111-111111111111', -- Electronics category
  'Hyderabad, Telangana',
  'active',
  false,
  'cccccccc-cccc-cccc-cccc-cccccccccccc', -- Amit Patel
  NOW() - INTERVAL '12 days',
  NOW(),
  'BenQ',
  'Like New',
  '[{"key": "Resolution", "value": "1080p"}, {"key": "Brightness", "value": "3000 lumens"}, {"key": "Connectivity", "value": "HDMI, USB, Bluetooth"}]',
  'day',
  10000.00,
  2,
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '3 months',
  true,
  700.00,
  'https://www.youtube.com/watch?v=example6',
  'Screen not included. Handle with care.',
  true,
  'moderate',
  'Perfect for outdoor movie nights or business presentations.',
  '["https://example.com/images/projector1.jpg", "https://example.com/images/projector2.jpg"]'
);

-- Add a comment to confirm completion
COMMENT ON TABLE listings IS 'Dummy data added for testing purposes';
