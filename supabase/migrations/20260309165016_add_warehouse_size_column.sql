/*
  # Add Warehouse Size Column

  1. Changes
    - Add `warehouse_size` column to `properties` table
      - Type: numeric (for square meters)
      - Nullable: true (optional field)
      - Used specifically for warehouse property type to separate warehouse area from office space

  2. Notes
    - This allows warehouses to specify both warehouse size and office space separately
    - Existing properties will have NULL for this field by default
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'warehouse_size'
  ) THEN
    ALTER TABLE properties ADD COLUMN warehouse_size numeric;
  END IF;
END $$;