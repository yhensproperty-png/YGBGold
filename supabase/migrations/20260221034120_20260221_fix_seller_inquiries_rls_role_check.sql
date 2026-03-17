/*
  # Fix seller_inquiries RLS to check for admin/team role

  1. Changes
    - Update INSERT policy to check for 'admin' or 'team' role in auth.jwt() metadata
    - Removes the "Always True" warning by validating user role before allowing inserts
    - SELECT policy remains unchanged for admin access
  
  2. Security
    - Only users with admin or team role in their JWT can insert seller inquiries
    - Prevents unauthorized users from creating inquiries even if authenticated
    - Maintains admin-only read access for viewing inquiries
*/

DROP POLICY IF EXISTS "Anyone can submit seller inquiry" ON seller_inquiries;

CREATE POLICY "Admin and team users can submit seller inquiry"
  ON seller_inquiries FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' IN ('admin', 'team')
  );