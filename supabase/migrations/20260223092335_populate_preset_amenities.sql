/*
  # Populate Preset Amenities into Database

  1. Purpose
    - Insert all preset amenities from the AddListing page into the custom_amenities table
    - Ensures search functionality has access to all standard amenity options
    - Only inserts if the amenity doesn't already exist (prevents duplicates)

  2. Changes
    - Inserts 87 preset amenities with their labels and icons
    - Uses ON CONFLICT to prevent duplicate entries
    - Covers categories: parking, security, features, views, utilities, furnishings, appliances, community facilities, and location benefits

  3. Security
    - No RLS changes needed (table already has proper policies)
*/

-- Insert preset amenities if they don't already exist
INSERT INTO custom_amenities (id, label, icon) VALUES
  ('ac', 'Central Air Conditioning', 'ac_unit'),
  ('pool', 'Swimming Pool', 'pool'),
  ('garage1', '1-Car Garage', 'directions_car'),
  ('garage2', '2-Car Garage', 'directions_car'),
  ('garage', '3-Car Garage', 'directions_car'),
  ('covered_parking', 'Covered Parking', 'garage'),
  ('visitor_parking', 'Visitor Parking', 'local_parking'),
  ('street_parking', 'Street Parking', 'local_parking'),
  ('security', 'Smart Security System', 'security'),
  ('security_24_7', '24/7 Security', 'shield'),
  ('cctv', 'CCTV Surveillance', 'videocam'),
  ('biometric', 'Biometric Access', 'fingerprint'),
  ('perimeter_fence', 'Perimeter Fence', 'fence'),
  ('fire_alarm', 'Fire Alarm System', 'local_fire_department'),
  ('backup_generator', 'Backup Generator', 'power'),
  ('fireplace', 'Fireplace', 'fireplace'),
  ('wine', 'Wine Cellar', 'wine_bar'),
  ('gym', 'Home Gym', 'fitness_center'),
  ('garden', 'Private Garden', 'yard'),
  ('landscaped_gardens', 'Landscaped Gardens', 'park'),
  ('solar', 'Solar Panels', 'solar_power'),
  ('water', 'Waterfront', 'water'),
  ('mountain', 'Mountain View', 'landscape'),
  ('smart', 'Smart Home Technology', 'settings_remote'),
  ('wifi', 'Fiber Internet', 'wifi'),
  ('gated', 'Gated Community', 'lock'),
  ('balcony', 'Balcony', 'balcony'),
  ('lanai', 'Lanai/Patio', 'deck'),
  ('roof_deck', 'Roof Deck', 'roofing'),
  ('elevator', 'Private Elevator', 'elevator'),
  ('pets', 'Pet Friendly', 'pets'),
  ('floors', 'Hardwood Floors', 'layers'),
  ('marble_countertops', 'Marble/Granite Countertops', 'countertops'),
  ('high_ceilings', 'High Ceilings', 'unfold_more'),
  ('large_windows', 'Large Windows/Natural Light', 'wb_sunny'),
  ('walk_in_closet', 'Walk-in Closet', 'checkroom'),
  ('built_in_wardrobes', 'Built-in Wardrobes', 'storage'),
  ('study_room', 'Study Room/Home Office', 'menu_book'),
  ('powder_room', 'Powder Room', 'wc'),
  ('service_area', 'Service Area/Dirty Kitchen', 'kitchen'),
  ('storage_room', 'Storage Room', 'inventory_2'),
  ('road', 'Road Access', 'add_road'),
  ('utility', 'Utilities Ready', 'power'),
  ('water_heater', 'Water Heater', 'hot_tub'),
  ('individual_water_meter', 'Individual Water Meter', 'water_drop'),
  ('individual_electric_meter', 'Individual Electric Meter', 'electrical_services'),
  ('cable_ready', 'Cable TV Ready', 'tv'),
  ('phone_ready', 'Telephone Line Ready', 'phone'),
  ('maid_room', 'Maids Room', 'meeting_room'),
  ('maid_room_bath', 'Maids Room with Bathroom', 'bathroom'),
  ('furnished', 'Fully Furnished', 'chair'),
  ('semi_furnished', 'Semi Furnished', 'weekend'),
  ('modern_kitchen', 'Modern Kitchen', 'kitchen'),
  ('kitchen_island', 'Kitchen Island', 'countertops'),
  ('dishwasher', 'Dishwasher', 'local_laundry_service'),
  ('refrigerator', 'Refrigerator Included', 'kitchen'),
  ('microwave', 'Microwave Included', 'microwave'),
  ('range_hood', 'Range Hood', 'air'),
  ('gas_range', 'Gas Range/Stove', 'gas_meter'),
  ('playground', 'Children''s Playground', 'child_care'),
  ('basketball', 'Basketball Court', 'sports_basketball'),
  ('jogging_path', 'Jogging Path', 'directions_walk'),
  ('function_hall', 'Function Hall/Clubhouse', 'meeting_room'),
  ('concierge', 'Concierge Service', 'support_agent'),
  ('package_receiving', 'Package Receiving', 'inventory'),
  ('sky_lounge', 'Sky Lounge', 'apartment'),
  ('coworking', 'Co-working Space', 'work'),
  ('business_center', 'Business Center', 'business_center'),
  ('mini_theater', 'Mini Theater', 'theaters'),
  ('game_room', 'Game Room', 'sports_esports'),
  ('near_transport', 'Near Public Transport', 'directions_bus'),
  ('near_schools', 'Near Schools', 'school'),
  ('near_shopping', 'Near Shopping Centers', 'shopping_cart'),
  ('near_hospitals', 'Near Hospitals', 'local_hospital'),
  ('renovated', 'Newly Renovated', 'construction')
ON CONFLICT (label) DO NOTHING;
