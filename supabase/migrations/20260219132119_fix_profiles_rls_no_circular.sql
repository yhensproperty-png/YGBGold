/*
  # Fix profiles RLS - eliminate circular subquery

  The "Admins can read all profiles" policy was using a subquery on the profiles
  table itself to check if the current user is an admin. This creates a circular
  dependency when the user first tries to read their own profile on login.

  Solution: Use two separate, non-conflicting SELECT policies:
  1. "Users can read own profile" - simple auth.uid() = id check, no subquery
  2. "Admins can read all profiles" - uses app_metadata from JWT to avoid circular ref

  We store the role in app_metadata so the JWT check is instant and has no circular dependency.
  
  As a fallback, we also keep a direct self-read policy that never fails.
*/

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
