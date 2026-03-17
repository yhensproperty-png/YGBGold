/*
  # Fix admin read-all profiles policy

  The previous migration dropped the "Admins can read all profiles" policy
  and never re-added it, leaving admins unable to see other users in the dashboard.

  This migration adds it back using JWT app_metadata to avoid circular RLS dependency.
*/

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
