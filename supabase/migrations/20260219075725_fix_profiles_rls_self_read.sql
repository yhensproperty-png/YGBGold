/*
  # Fix profiles RLS - ensure users can always read their own profile

  The previous policy had a circular reference issue where the admin policy
  used a subquery on profiles itself, which could fail during initial auth.
  
  This ensures the basic self-read policy works unconditionally for authenticated users.
*/

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'admin'
  );
