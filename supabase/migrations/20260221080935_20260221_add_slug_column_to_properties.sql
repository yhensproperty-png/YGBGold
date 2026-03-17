/*
  # Add slug column to properties table for SEO-friendly URLs

  1. Changes
    - Add `slug` column to properties table (TEXT, unique, nullable initially)
    - Add index on slug column for fast lookups
    - Backfill slugs for existing properties using title and listing_id
    - Add constraint to make slug NOT NULL after backfill
  
  2. Security
    - No RLS changes needed (inherits existing policies)
  
  3. Notes
    - Slug format: `{title-kebab-case}-{listing_id}`
    - Example: "Luxury Villa in Manila" with ID "PROP001" → "luxury-villa-manila-PROP001"
    - Existing properties will have slugs auto-generated from their current titles
*/

-- Add slug column (nullable initially for backfill)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'slug'
  ) THEN
    ALTER TABLE properties ADD COLUMN slug TEXT;
  END IF;
END $$;

-- Create function to generate slug from title and listing_id
CREATE OR REPLACE FUNCTION generate_slug(title TEXT, listing_id TEXT)
RETURNS TEXT AS $$
DECLARE
  slug_base TEXT;
BEGIN
  -- Convert title to lowercase, replace spaces and special chars with hyphens
  slug_base := lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));
  -- Remove leading/trailing hyphens
  slug_base := trim(both '-' from slug_base);
  -- Combine with listing_id
  RETURN slug_base || '-' || lower(listing_id);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Backfill slugs for existing properties
UPDATE properties
SET slug = generate_slug(title, listing_id)
WHERE slug IS NULL;

-- Make slug NOT NULL and add unique constraint
ALTER TABLE properties ALTER COLUMN slug SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'properties_slug_key'
  ) THEN
    ALTER TABLE properties ADD CONSTRAINT properties_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);

-- Add trigger to auto-generate slug on insert/update if not provided
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title, NEW.listing_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON properties;
CREATE TRIGGER trigger_auto_generate_slug
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();
