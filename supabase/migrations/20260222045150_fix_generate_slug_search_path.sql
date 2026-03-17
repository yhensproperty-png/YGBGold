/*
  # Fix generate_slug Function Search Path Security

  1. Security Changes
    - Drop all versions of generate_slug function
    - Recreate with secure search_path setting

  2. Notes
    - Multiple function signatures existed, causing one to remain with mutable search_path
    - This ensures only one secure version exists
*/

-- Drop all versions of the function
DROP FUNCTION IF EXISTS public.generate_slug(text);
DROP FUNCTION IF EXISTS public.generate_slug CASCADE;

-- Recreate with secure search_path
CREATE FUNCTION public.generate_slug(title_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_catalog
AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(title_text, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$;

-- Recreate the trigger that depends on it
DROP TRIGGER IF EXISTS auto_generate_slug_trigger ON properties;

CREATE TRIGGER auto_generate_slug_trigger
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();