/*
  # Add location and condo fields to properties

  1. Changes
    - `address` → changed to store "House/Building Number, Street Name"
    - Add `barangay` column for District/Barangay
    - Add `condoName` column for Condo/Apartment name
  
  2. Migration Logic
    - Add new columns to properties table
    - Set default values for existing rows
    - Rename existing state column usage conceptually to barangay
*/

-- Add new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'barangay'
  ) THEN
    ALTER TABLE properties ADD COLUMN barangay text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'condo_name'
  ) THEN
    ALTER TABLE properties ADD COLUMN condo_name text;
  END IF;
END $$;
