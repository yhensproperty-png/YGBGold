/*
  # Increase storage limit and add listing_id to properties

  1. Storage Updates
    - Increase file size limit to 50MB per image
    - Allows higher quality property photos
  
  2. Properties Table Updates
    - Add listing_id column with format "001", "002", etc.
    - Auto-generate sequential IDs starting from 001
    - Display this ID on listings instead of UUID
*/

-- Update storage bucket file size limit to 50MB
UPDATE storage.buckets
SET file_size_limit = 52428800  -- 50MB in bytes
WHERE id = 'property-images';

-- Add listing_id column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS listing_id TEXT;

-- Create a function to generate the next listing ID
CREATE OR REPLACE FUNCTION generate_listing_id()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  new_id TEXT;
BEGIN
  -- Get the highest existing listing number
  SELECT COALESCE(MAX(CAST(listing_id AS INTEGER)), 0) + 1
  INTO next_number
  FROM properties
  WHERE listing_id ~ '^\d+$';  -- Only numeric listing_ids
  
  -- Format as zero-padded 3-digit number
  new_id := LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Update existing properties without listing_id
DO $$
DECLARE
  prop RECORD;
  counter INTEGER := 1;
BEGIN
  FOR prop IN SELECT id FROM properties WHERE listing_id IS NULL ORDER BY created_at
  LOOP
    UPDATE properties 
    SET listing_id = LPAD(counter::TEXT, 3, '0')
    WHERE id = prop.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Create trigger to auto-assign listing_id for new properties
CREATE OR REPLACE FUNCTION assign_listing_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.listing_id IS NULL THEN
    NEW.listing_id := generate_listing_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_listing_id ON properties;
CREATE TRIGGER set_listing_id
  BEFORE INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION assign_listing_id();
