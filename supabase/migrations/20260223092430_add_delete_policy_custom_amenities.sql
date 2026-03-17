/*
  # Add Delete Policy for Custom Amenities

  1. Purpose
    - Allow authenticated users to delete custom amenities from the database
    - Enables cleanup of unwanted or duplicate custom amenities

  2. Changes
    - Adds DELETE policy for authenticated users on custom_amenities table

  3. Security
    - Only authenticated users can delete amenities
    - RLS remains enabled to protect data
*/

CREATE POLICY "Authenticated users can delete custom amenities"
  ON custom_amenities FOR DELETE
  TO authenticated
  USING (true);
