/*
  # Fix slug generation trigger to handle missing listing_id

  1. Changes
    - Update auto_generate_slug trigger function to use id if listing_id is not available
    - Ensure slug is always generated even when listing_id is NULL
  
  2. Notes
    - This fixes the error when creating new listings without listing_id set
*/

-- Update function to use id as fallback if listing_id is null
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
DECLARE
  slug_base TEXT;
  id_part TEXT;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Convert title to lowercase, replace spaces and special chars with hyphens
    slug_base := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    -- Remove leading/trailing hyphens
    slug_base := trim(both '-' from slug_base);
    
    -- Use listing_id if available, otherwise use first 8 chars of id
    IF NEW.listing_id IS NOT NULL AND NEW.listing_id != '' THEN
      id_part := lower(NEW.listing_id);
    ELSE
      id_part := lower(substring(NEW.id, 1, 8));
    END IF;
    
    -- Combine with id part
    NEW.slug := slug_base || '-' || id_part;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
