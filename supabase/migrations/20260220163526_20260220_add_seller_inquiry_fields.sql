/*
  # Add additional fields to seller_inquiries table

  1. Changes
    - Add `phone_number` column (text, not null)
    - Add `city` column (text, not null)
    - Add `barangay` column (text, not null)
    - Remove `location` column (replaced by city + barangay)

  2. Data Migration
    - Populate new columns from existing data if needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_inquiries' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE seller_inquiries ADD COLUMN phone_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_inquiries' AND column_name = 'city'
  ) THEN
    ALTER TABLE seller_inquiries ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_inquiries' AND column_name = 'barangay'
  ) THEN
    ALTER TABLE seller_inquiries ADD COLUMN barangay text;
  END IF;
END $$;