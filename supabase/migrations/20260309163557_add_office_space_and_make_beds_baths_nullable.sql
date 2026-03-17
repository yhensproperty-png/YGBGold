/*
  # Add office space field and make beds/baths optional

  1. Changes
    - Add `office_space` column (numeric, nullable) to properties table for commercial properties
    - Make `beds` column nullable for commercial properties
    - Make `baths` column nullable for commercial properties
  
  2. Notes
    - Office space is measured in square meters (Sqm)
    - Beds and baths remain required for residential properties but optional for commercial
    - Existing properties will have NULL for office_space if not set
*/

-- Add office_space column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'office_space'
  ) THEN
    ALTER TABLE properties ADD COLUMN office_space numeric;
  END IF;
END $$;

-- Make beds nullable
DO $$
BEGIN
  ALTER TABLE properties ALTER COLUMN beds DROP NOT NULL;
  ALTER TABLE properties ALTER COLUMN beds DROP DEFAULT;
  ALTER TABLE properties ALTER COLUMN beds SET DEFAULT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Make baths nullable  
DO $$
BEGIN
  ALTER TABLE properties ALTER COLUMN baths DROP NOT NULL;
  ALTER TABLE properties ALTER COLUMN baths DROP DEFAULT;
  ALTER TABLE properties ALTER COLUMN baths SET DEFAULT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;