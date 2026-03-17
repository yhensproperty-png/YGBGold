/*
  # Add featured image index to properties

  1. Changes
    - Add `featured_image_index` column to `properties` table
      - Stores the index (0-based) of which image in the images array should be used as the featured/preview image
      - Defaults to 0 (first image)
      - NULL means use first image (backward compatible)
  
  2. Notes
    - This allows users to select which uploaded image appears in listings and social media previews
    - Existing listings will continue to use their first image (index 0)
*/

-- Add featured_image_index column
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS featured_image_index integer DEFAULT 0 CHECK (featured_image_index >= 0);

-- Add comment for documentation
COMMENT ON COLUMN properties.featured_image_index IS 'Index of the image in the images array to use as featured/preview image (0-based). NULL or 0 means first image.';