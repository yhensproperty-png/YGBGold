/*
  # Enforce AAL2 (MFA) for sensitive write operations

  ## Summary
  Adds restrictive RLS policies requiring Authenticator Assurance Level 2 (AAL2)
  for INSERT, UPDATE, and DELETE operations on the profiles and properties tables.
  Users who have enrolled MFA must complete their TOTP challenge before any
  write operations are permitted by the database.

  ## Changes

  ### profiles table
  - New restrictive UPDATE policy: requires auth.jwt()->>'aal' = 'aal2'
  - Existing SELECT policies are not affected (reading does not require MFA)

  ### properties table
  - New restrictive INSERT policy: requires aal2
  - New restrictive UPDATE policy: requires aal2
  - New restrictive DELETE policy: requires aal2

  ## Security Notes
  - These policies use `AS RESTRICTIVE` so they apply on top of existing permissive policies
  - A user who has NOT enrolled MFA will have aal = 'aal1', which will NOT be blocked
    by these policies — MFA enforcement for writes only applies once enrolled
  - This matches Supabase's recommended pattern for MFA enforcement
*/

CREATE POLICY "Require MFA for profile updates"
  ON profiles
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt()->>'aal') = 'aal2'
    OR (
      SELECT count(*) FROM auth.mfa_factors
      WHERE auth.mfa_factors.user_id = auth.uid()
      AND auth.mfa_factors.status = 'verified'
    ) = 0
  )
  WITH CHECK (
    (auth.jwt()->>'aal') = 'aal2'
    OR (
      SELECT count(*) FROM auth.mfa_factors
      WHERE auth.mfa_factors.user_id = auth.uid()
      AND auth.mfa_factors.status = 'verified'
    ) = 0
  );

CREATE POLICY "Require MFA for property inserts"
  ON properties
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt()->>'aal') = 'aal2'
    OR (
      SELECT count(*) FROM auth.mfa_factors
      WHERE auth.mfa_factors.user_id = auth.uid()
      AND auth.mfa_factors.status = 'verified'
    ) = 0
  );

CREATE POLICY "Require MFA for property updates"
  ON properties
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt()->>'aal') = 'aal2'
    OR (
      SELECT count(*) FROM auth.mfa_factors
      WHERE auth.mfa_factors.user_id = auth.uid()
      AND auth.mfa_factors.status = 'verified'
    ) = 0
  )
  WITH CHECK (
    (auth.jwt()->>'aal') = 'aal2'
    OR (
      SELECT count(*) FROM auth.mfa_factors
      WHERE auth.mfa_factors.user_id = auth.uid()
      AND auth.mfa_factors.status = 'verified'
    ) = 0
  );

CREATE POLICY "Require MFA for property deletes"
  ON properties
  AS RESTRICTIVE
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt()->>'aal') = 'aal2'
    OR (
      SELECT count(*) FROM auth.mfa_factors
      WHERE auth.mfa_factors.user_id = auth.uid()
      AND auth.mfa_factors.status = 'verified'
    ) = 0
  );
