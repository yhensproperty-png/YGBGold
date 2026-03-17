/*
  # Fix state column for new location structure

  1. Changes
    - Make `state` column nullable to support new location structure
    - Set default value for state column to handle legacy data
  
  2. Notes
    - The app now uses `barangay` for district/barangay
    - The `state` column is kept for backward compatibility but made optional
    - Existing rows will keep their state values
*/

-- Make state column nullable
ALTER TABLE properties 
ALTER COLUMN state DROP NOT NULL;

-- Set a default value for any future rows that don't specify state
ALTER TABLE properties 
ALTER COLUMN state SET DEFAULT '';
