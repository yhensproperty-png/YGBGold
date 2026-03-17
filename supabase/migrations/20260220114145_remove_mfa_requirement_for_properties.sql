/*
  # Remove MFA requirement for property operations

  1. Changes
    - Drop restrictive MFA policies for properties INSERT, UPDATE, DELETE
    - Keep MFA requirement only for profile updates
  
  2. Rationale
    - MFA for every property listing creation is too restrictive
    - Users should be able to create listings without MFA
    - Profile updates remain protected with MFA requirement
*/

-- Drop MFA requirement policies for properties
DROP POLICY IF EXISTS "Require MFA for property inserts" ON properties;
DROP POLICY IF EXISTS "Require MFA for property updates" ON properties;
DROP POLICY IF EXISTS "Require MFA for property deletes" ON properties;
