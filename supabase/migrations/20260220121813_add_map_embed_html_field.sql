/*
  # Add map embed HTML field to properties table

  1. Changes
    - Add `map_embed_html` column to `properties` table
      - Type: text (nullable)
      - Purpose: Store Google Maps embed iframe HTML code
      - Allows property listings to display embedded interactive maps

  2. Notes
    - Field is optional to maintain backward compatibility
    - No RLS changes needed as it follows existing property permissions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'map_embed_html'
  ) THEN
    ALTER TABLE properties ADD COLUMN map_embed_html text;
  END IF;
END $$;