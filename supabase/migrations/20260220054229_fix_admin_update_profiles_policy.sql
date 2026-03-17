/*
  # Fix admin update profiles RLS policy

  ## Problem
  The existing "Admins can update profiles" policy uses a subquery that
  re-queries the profiles table to check the caller's role. This causes
  a recursive RLS evaluation which fails.

  ## Fix
  Replace the subquery-based check with auth.jwt() app_metadata role check,
  consistent with the working "Admins can read all profiles" policy.

  ## Changes
  - Drop old UPDATE policy that uses recursive subquery
  - Create new UPDATE policy using auth.jwt() -> 'app_metadata' ->> 'role'
*/

DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;

CREATE POLICY "Admins can update profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin')
  WITH CHECK (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');
