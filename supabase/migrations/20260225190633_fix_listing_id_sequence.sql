/*
  # Fix listing_id sequence to ensure proper 3-digit format

  1. Changes
    - Reset the sequence to use the correct next value
    - Ensures all new listings get proper 001, 002, 003, etc. format
  
  2. Notes
    - Finds the highest numeric listing_id and sets sequence to next value
    - This prevents gaps and ensures consistent formatting
*/

DO $$
DECLARE
  max_id INTEGER;
BEGIN
  -- Find the highest numeric listing_id
  SELECT COALESCE(MAX(CAST(listing_id AS INTEGER)), 0) INTO max_id
  FROM properties
  WHERE listing_id ~ '^\d+$';
  
  -- Reset the sequence to start from max_id + 1
  PERFORM setval('listing_id_seq', max_id, true);
END $$;