/*
  # Add auto-incrementing listing_id sequence

  1. Changes
    - Create sequence for listing_id that starts at 1
    - Update properties table to auto-generate listing_id with format 001, 002, 003, etc.
    - Add trigger to auto-populate listing_id on insert
  
  2. Notes
    - Preserves existing listing_id values
    - New listings will get sequential IDs starting from the highest existing + 1
*/

-- Create sequence for listing_id
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'listing_id_seq') THEN
    -- Find the highest numeric listing_id to start the sequence
    DECLARE
      max_id INTEGER;
    BEGIN
      SELECT COALESCE(MAX(CAST(listing_id AS INTEGER)), 0) INTO max_id
      FROM properties
      WHERE listing_id ~ '^\d+$';
      
      EXECUTE format('CREATE SEQUENCE listing_id_seq START WITH %s', max_id + 1);
    END;
  END IF;
END $$;

-- Create function to auto-generate listing_id
CREATE OR REPLACE FUNCTION auto_generate_listing_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.listing_id IS NULL OR NEW.listing_id = '' THEN
    NEW.listing_id := LPAD(nextval('listing_id_seq')::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_listing_id ON properties;

-- Create trigger to run before insert
CREATE TRIGGER set_listing_id
  BEFORE INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_listing_id();
