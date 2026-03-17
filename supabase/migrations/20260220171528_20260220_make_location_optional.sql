/*
  # Make location field optional in seller_inquiries

  1. Changes
    - Make `location` column nullable since we're using `city` and `barangay` fields instead
    - This allows the form to work with the separate city/barangay fields without requiring location

  2. Notes
    - The location field can be kept for backwards compatibility
    - New submissions will use city and barangay fields
*/

ALTER TABLE seller_inquiries 
ALTER COLUMN location DROP NOT NULL;