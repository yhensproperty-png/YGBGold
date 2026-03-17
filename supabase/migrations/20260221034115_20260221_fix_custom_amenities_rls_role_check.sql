/*
  # Fix custom_amenities RLS to check for admin/team role

  1. Changes
    - Update INSERT policy to check for 'admin' or 'team' role in auth.jwt() metadata
    - Removes the "Always True" warning by validating user role before allowing inserts
  
  2. Security
    - Only users with admin or team role in their JWT can insert custom amenities
    - Prevents unauthorized users from creating amenities even if authenticated
    - Public read remains unchanged for viewing amenities
*/

DROP POLICY IF EXISTS "Authenticated users can add custom amenities" ON custom_amenities;

CREATE POLICY "Admin and team users can add custom amenities"
  ON custom_amenities FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' IN ('admin', 'team')
  );