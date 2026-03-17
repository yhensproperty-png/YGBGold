/*
  # Add agent column to properties table

  1. Changes
    - Add `agent` column to `properties` table
    - Column is optional and can be 'Yhen' or 'Daphne'
    - Defaults to 'Yhen' for existing properties
  
  2. Notes
    - Existing properties will have agent set to 'Yhen'
    - New properties can specify either agent
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'agent'
  ) THEN
    ALTER TABLE properties ADD COLUMN agent TEXT CHECK (agent IN ('Yhen', 'Daphne')) DEFAULT 'Yhen';
  END IF;
END $$;