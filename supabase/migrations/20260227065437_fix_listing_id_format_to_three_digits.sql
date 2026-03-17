/*
  # Fix listing_id format to use simple 3-digit sequential numbers

  ## Problem
  The auto_generate_listing_id function was generating IDs in the format
  PROP-YYYYMM-00008 instead of the expected 001, 002, 003 format used by all
  existing listings.

  ## Changes
  - Replaces auto_generate_listing_id() function with one that generates
    simple zero-padded 3-digit numbers (001, 002, 003, etc.)
  - Resets the listing_id_seq sequence to start after the highest existing numeric listing_id
*/

CREATE OR REPLACE FUNCTION public.auto_generate_listing_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.listing_id IS NULL THEN
    NEW.listing_id := LPAD(nextval('listing_id_seq')::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  max_numeric_id bigint;
BEGIN
  SELECT COALESCE(MAX(listing_id::bigint), 0)
  INTO max_numeric_id
  FROM properties
  WHERE listing_id ~ '^\d+$';

  IF max_numeric_id >= nextval('listing_id_seq') - 1 THEN
    PERFORM setval('listing_id_seq', max_numeric_id + 1, false);
  END IF;
END $$;
