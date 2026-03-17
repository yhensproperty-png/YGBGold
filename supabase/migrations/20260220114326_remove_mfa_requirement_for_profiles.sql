/*
  # Remove MFA requirement for profile updates

  1. Changes
    - Drop restrictive MFA policy for profile updates
  
  2. Rationale
    - MFA should only be required at login, not for every profile update
    - Users can manage their profiles without re-verifying MFA
*/

-- Drop MFA requirement policy for profile updates
DROP POLICY IF EXISTS "Require MFA for profile updates" ON profiles;
