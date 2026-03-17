-- ============================================================
-- Update password for: ygbgoldbuysell@gmail.com
-- New password: March2015@_
-- ============================================================

UPDATE auth.users
SET 
  encrypted_password = crypt('March2015@_', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'ygbgoldbuysell@gmail.com';
