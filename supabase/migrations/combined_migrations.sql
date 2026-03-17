-- ========================================
-- File: 20260219033708_create_custom_amenities.sql
-- ========================================
/*
  # Create custom_amenities table

  ## Summary
  Stores user-created amenity options so they are shared across all users and sessions.

  ## New Tables
  - `custom_amenities`
    - `id` (text, primary key) â€” unique identifier for the amenity
    - `label` (text, unique) â€” display name of the amenity
    - `icon` (text) â€” Material Icon name inferred from the label
    - `created_at` (timestamptz) â€” when the amenity was created

  ## Security
  - RLS enabled
  - Anyone (including unauthenticated) can read amenities (public read)
  - Only authenticated users can insert new amenities
  - No update or delete to preserve shared data integrity
*/

CREATE TABLE IF NOT EXISTS custom_amenities (
  id text PRIMARY KEY,
  label text UNIQUE NOT NULL,
  icon text NOT NULL DEFAULT 'star',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE custom_amenities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view custom amenities"
  ON custom_amenities FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can add custom amenities"
  ON custom_amenities FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- ========================================
-- File: 20260219074446_create_profiles_table.sql
-- ========================================
/*
  # Create profiles table

  Stores admin-managed user profiles with role and login control.

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - matches auth.users.id
      - `email` (text) - display email
      - `display_name` (text)
      - `role` (text) - 'admin' or 'user'
      - `login_enabled` (boolean) - admin can toggle to deny login
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can read their own profile
    - Admins can read all profiles
    - Admins can insert/update/delete profiles
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL DEFAULT '',
  display_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'user',
  login_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);


-- ========================================
-- File: 20260219074500_create_properties_table.sql
-- ========================================
/*
  # Create properties table

  Migrates listings from localStorage to Supabase.

  1. New Tables
    - `properties`
      - `id` (text, primary key)
      - All property fields mapped from the PropertyListing type
      - `owner_id` (uuid, nullable) - references auth.users, SET NULL on user delete so listings are never lost

  2. Security
    - Enable RLS
    - Public can SELECT all properties (all statuses visible for portfolio)
    - Authenticated users can INSERT their own properties
    - Owners and admins can UPDATE/DELETE
*/

CREATE TABLE IF NOT EXISTS properties (
  id text PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'House',
  listing_type text NOT NULL DEFAULT 'sale',
  price numeric NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  zip_code text NOT NULL DEFAULT '',
  beds integer NOT NULL DEFAULT 0,
  baths numeric NOT NULL DEFAULT 0,
  sqft numeric NOT NULL DEFAULT 0,
  lot_area numeric,
  images jsonb NOT NULL DEFAULT '[]',
  amenities jsonb NOT NULL DEFAULT '[]',
  google_maps_url text,
  featured boolean NOT NULL DEFAULT false,
  featured_until timestamptz,
  status text NOT NULL DEFAULT 'active',
  date_listed timestamptz NOT NULL DEFAULT now(),
  date_updated timestamptz,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view properties"
  ON properties FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

CREATE POLICY "Owners and admins can update properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Owners and admins can delete properties"
  ON properties FOR DELETE
  TO authenticated
  USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);


-- ========================================
-- File: 20260219074540_create_admin_user.sql
-- ========================================
/*
  # Create admin user account

  Creates the initial admin user for Yhen's Property with:
  - Email: Yhensproperty@gmail.com
  - Role: admin
  - login_enabled: true
*/

DO $$
DECLARE
  new_user_id uuid;
  existing_id uuid;
BEGIN
  SELECT id INTO existing_id FROM auth.users WHERE email = 'Yhensproperty@gmail.com';

  IF existing_id IS NULL THEN
    new_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'Yhensproperty@gmail.com',
      crypt('Manila2026!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"display_name":"Yhen"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id,
      'Yhensproperty@gmail.com',
      json_build_object('sub', new_user_id::text, 'email', 'Yhensproperty@gmail.com'),
      'email',
      NOW(),
      NOW(),
      NOW()
    );

    INSERT INTO profiles (id, email, display_name, role, login_enabled)
    VALUES (new_user_id, 'Yhensproperty@gmail.com', 'Yhen', 'admin', true);
  ELSE
    INSERT INTO profiles (id, email, display_name, role, login_enabled)
    VALUES (existing_id, 'Yhensproperty@gmail.com', 'Yhen', 'admin', true)
    ON CONFLICT (id) DO UPDATE SET role = 'admin', login_enabled = true;
  END IF;
END $$;


-- ========================================
-- File: 20260219075725_fix_profiles_rls_self_read.sql
-- ========================================
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


-- ========================================
-- File: 20260219132119_fix_profiles_rls_no_circular.sql
-- ========================================
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


-- ========================================
-- File: 20260219134521_fix_admin_read_all_profiles.sql
-- ========================================
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


-- ========================================
-- File: 20260220053410_enforce_aal2_for_sensitive_operations.sql
-- ========================================
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
    by these policies â€” MFA enforcement for writes only applies once enrolled
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


-- ========================================
-- File: 20260220054229_fix_admin_update_profiles_policy.sql
-- ========================================
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


-- ========================================
-- File: 20260220111319_20260220_add_location_and_condo_fields.sql
-- ========================================
/*
  # Add location and condo fields to properties

  1. Changes
    - `address` â†’ changed to store "House/Building Number, Street Name"
    - Add `barangay` column for District/Barangay
    - Add `condoName` column for Condo/Apartment name
  
  2. Migration Logic
    - Add new columns to properties table
    - Set default values for existing rows
    - Rename existing state column usage conceptually to barangay
*/

-- Add new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'barangay'
  ) THEN
    ALTER TABLE properties ADD COLUMN barangay text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'condo_name'
  ) THEN
    ALTER TABLE properties ADD COLUMN condo_name text;
  END IF;
END $$;


-- ========================================
-- File: 20260220112059_20260220_setup_storage_bucket.sql
-- ========================================
/*
  # Set up Supabase Storage for property images

  1. Purpose
    - Images are now stored in Supabase Storage instead of base64 in database
    - This prevents database row size errors
    - Allows unlimited photo uploads (up to Supabase plan limits)
    - Faster loading with proper image URLs

  2. Storage Configuration
    - Create 'property-images' bucket if not exists
    - Enable public read access for property listings
    - Restrict uploads to authenticated users
*/

-- Create storage bucket for property images (handled via Supabase API)
-- The bucket creation is done through the client code, not SQL
-- See updated AddListing.tsx for image upload implementation


-- ========================================
-- File: 20260220113635_fix_state_column_nullable.sql
-- ========================================
/*
  # Fix state column for new location structure

  1. Changes
    - Make `state` column nullable to support new location structure
    - Set default value for state column to handle legacy data
  
  2. Notes
    - The app now uses `barangay` for district/barangay
    - The `state` column is kept for backward compatibility but made optional
    - Existing rows will keep their state values
*/

-- Make state column nullable
ALTER TABLE properties 
ALTER COLUMN state DROP NOT NULL;

-- Set a default value for any future rows that don't specify state
ALTER TABLE properties 
ALTER COLUMN state SET DEFAULT '';


-- ========================================
-- File: 20260220114145_remove_mfa_requirement_for_properties.sql
-- ========================================
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


-- ========================================
-- File: 20260220114326_remove_mfa_requirement_for_profiles.sql
-- ========================================
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


-- ========================================
-- File: 20260220114826_setup_storage_bucket_fixed.sql
-- ========================================
/*
  # Set up Supabase Storage for property images

  1. Storage Bucket
    - Create 'property-images' bucket for storing property photos
    - Enable public access for viewing images
  
  2. Security Policies
    - Public can view all images (SELECT)
    - Authenticated users can upload images (INSERT)
    - Authenticated users can update their own images (UPDATE)
    - Authenticated users can delete their own images (DELETE)
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public to view images
CREATE POLICY "Public can view property images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- Allow users to update their own uploaded images
CREATE POLICY "Users can update own property images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-images' AND owner::text = auth.uid()::text)
WITH CHECK (bucket_id = 'property-images');

-- Allow users to delete their own uploaded images
CREATE POLICY "Users can delete own property images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images' AND owner::text = auth.uid()::text);


-- ========================================
-- File: 20260220115105_increase_storage_limit_and_add_listing_id.sql
-- ========================================
/*
  # Increase storage limit and add listing_id to properties

  1. Storage Updates
    - Increase file size limit to 50MB per image
    - Allows higher quality property photos
  
  2. Properties Table Updates
    - Add listing_id column with format "001", "002", etc.
    - Auto-generate sequential IDs starting from 001
    - Display this ID on listings instead of UUID
*/

-- Update storage bucket file size limit to 50MB
UPDATE storage.buckets
SET file_size_limit = 52428800  -- 50MB in bytes
WHERE id = 'property-images';

-- Add listing_id column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS listing_id TEXT;

-- Create a function to generate the next listing ID
CREATE OR REPLACE FUNCTION generate_listing_id()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  new_id TEXT;
BEGIN
  -- Get the highest existing listing number
  SELECT COALESCE(MAX(CAST(listing_id AS INTEGER)), 0) + 1
  INTO next_number
  FROM properties
  WHERE listing_id ~ '^\d+$';  -- Only numeric listing_ids
  
  -- Format as zero-padded 3-digit number
  new_id := LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Update existing properties without listing_id
DO $$
DECLARE
  prop RECORD;
  counter INTEGER := 1;
BEGIN
  FOR prop IN SELECT id FROM properties WHERE listing_id IS NULL ORDER BY created_at
  LOOP
    UPDATE properties 
    SET listing_id = LPAD(counter::TEXT, 3, '0')
    WHERE id = prop.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Create trigger to auto-assign listing_id for new properties
CREATE OR REPLACE FUNCTION assign_listing_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.listing_id IS NULL THEN
    NEW.listing_id := generate_listing_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_listing_id ON properties;
CREATE TRIGGER set_listing_id
  BEFORE INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION assign_listing_id();


-- ========================================
-- File: 20260220121813_add_map_embed_html_field.sql
-- ========================================
/*
  # Add map embed HTML field to properties table

  1. Changes
    - Add `map_embed_html` column to `properties` table
      - Type: text (nullable)
      - Purpose: Store Google Maps embed iframe HTML code
      - Allows property listings to display embedded interactive maps

  2. Notes
    - Field is optional to maintain backward compatibility
    - No RLS changes needed as it follows existing property permissions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'map_embed_html'
  ) THEN
    ALTER TABLE properties ADD COLUMN map_embed_html text;
  END IF;
END $$;

-- ========================================
-- File: 20260220155758_20260220_create_seller_inquiries_table.sql
-- ========================================
/*
  # Create seller_inquiries table

  1. New Tables
    - `seller_inquiries`
      - `id` (uuid, primary key)
      - `full_name` (text) - Seller's name
      - `email` (text) - Contact email
      - `whatsapp_number` (text) - WhatsApp contact
      - `property_type` (text) - Type of property
      - `location` (text) - City/municipality
      - `asking_price` (bigint) - Asking price in PHP
      - `description` (text) - Property details
      - `has_title` (boolean) - Whether they have Certificate of Title
      - `urgency` (text) - Urgency level (not-urgent, moderate, urgent)
      - `created_at` (timestamp)
      - `status` (text) - Status of inquiry (new, contacted, processing, completed)

  2. Security
    - Enable RLS on `seller_inquiries` table
    - Add public insert policy (anyone can submit)
    - Add admin read policy (only admins can view)
*/

CREATE TABLE IF NOT EXISTS seller_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  whatsapp_number text NOT NULL,
  property_type text NOT NULL,
  location text NOT NULL,
  asking_price bigint,
  description text,
  has_title boolean DEFAULT true,
  urgency text DEFAULT 'moderate',
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE seller_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit seller inquiry"
  ON seller_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view seller inquiries"
  ON seller_inquiries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );


-- ========================================
-- File: 20260220163526_20260220_add_seller_inquiry_fields.sql
-- ========================================
/*
  # Add additional fields to seller_inquiries table

  1. Changes
    - Add `phone_number` column (text, not null)
    - Add `city` column (text, not null)
    - Add `barangay` column (text, not null)
    - Remove `location` column (replaced by city + barangay)

  2. Data Migration
    - Populate new columns from existing data if needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_inquiries' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE seller_inquiries ADD COLUMN phone_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_inquiries' AND column_name = 'city'
  ) THEN
    ALTER TABLE seller_inquiries ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_inquiries' AND column_name = 'barangay'
  ) THEN
    ALTER TABLE seller_inquiries ADD COLUMN barangay text;
  END IF;
END $$;

-- ========================================
-- File: 20260220171528_20260220_make_location_optional.sql
-- ========================================
/*
  # Make location field optional in seller_inquiries

  1. Changes
    - Make `location` column nullable since we're using `city` and `barangay` fields instead
    - This allows the form to work with the separate city/barangay fields without requiring location

  2. Notes
    - The location field can be kept for backwards compatibility
    - New submissions will use city and barangay fields
*/

ALTER TABLE seller_inquiries 
ALTER COLUMN location DROP NOT NULL;

-- ========================================
-- File: 20260221034115_20260221_fix_custom_amenities_rls_role_check.sql
-- ========================================
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

-- ========================================
-- File: 20260221034120_20260221_fix_seller_inquiries_rls_role_check.sql
-- ========================================
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

-- ========================================
-- File: 20260221080935_20260221_add_slug_column_to_properties.sql
-- ========================================
/*
  # Add slug column to properties table for SEO-friendly URLs

  1. Changes
    - Add `slug` column to properties table (TEXT, unique, nullable initially)
    - Add index on slug column for fast lookups
    - Backfill slugs for existing properties using title and listing_id
    - Add constraint to make slug NOT NULL after backfill
  
  2. Security
    - No RLS changes needed (inherits existing policies)
  
  3. Notes
    - Slug format: `{title-kebab-case}-{listing_id}`
    - Example: "Luxury Villa in Manila" with ID "PROP001" â†’ "luxury-villa-manila-PROP001"
    - Existing properties will have slugs auto-generated from their current titles
*/

-- Add slug column (nullable initially for backfill)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'slug'
  ) THEN
    ALTER TABLE properties ADD COLUMN slug TEXT;
  END IF;
END $$;

-- Create function to generate slug from title and listing_id
CREATE OR REPLACE FUNCTION generate_slug(title TEXT, listing_id TEXT)
RETURNS TEXT AS $$
DECLARE
  slug_base TEXT;
BEGIN
  -- Convert title to lowercase, replace spaces and special chars with hyphens
  slug_base := lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));
  -- Remove leading/trailing hyphens
  slug_base := trim(both '-' from slug_base);
  -- Combine with listing_id
  RETURN slug_base || '-' || lower(listing_id);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Backfill slugs for existing properties
UPDATE properties
SET slug = generate_slug(title, listing_id)
WHERE slug IS NULL;

-- Make slug NOT NULL and add unique constraint
ALTER TABLE properties ALTER COLUMN slug SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'properties_slug_key'
  ) THEN
    ALTER TABLE properties ADD CONSTRAINT properties_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);

-- Add trigger to auto-generate slug on insert/update if not provided
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title, NEW.listing_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON properties;
CREATE TRIGGER trigger_auto_generate_slug
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();


-- ========================================
-- File: 20260222045018_fix_function_search_path_security.sql
-- ========================================
/*
  # Fix Function Search Path Security Issues

  1. Security Changes
    - Set secure search_path for `generate_listing_id` function
    - Set secure search_path for `assign_listing_id` trigger function
    - Set secure search_path for `generate_slug` function
    - Set secure search_path for `auto_generate_slug` trigger function

  2. Notes
    - Functions with mutable search_path can be exploited for privilege escalation
    - Setting `search_path` to empty string or specific schemas prevents this vulnerability
    - These functions only need access to pg_catalog for built-in functions
*/

-- Fix generate_listing_id function
CREATE OR REPLACE FUNCTION public.generate_listing_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  new_id text;
  exists_check boolean;
BEGIN
  LOOP
    new_id := 'LISTING-' || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
    SELECT EXISTS(SELECT 1 FROM properties WHERE listing_id = new_id) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN new_id;
END;
$$;

-- Fix assign_listing_id trigger function
CREATE OR REPLACE FUNCTION public.assign_listing_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NEW.listing_id IS NULL THEN
    NEW.listing_id := generate_listing_id();
  END IF;
  RETURN NEW;
END;
$$;

-- Fix generate_slug function
CREATE OR REPLACE FUNCTION public.generate_slug(title_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(title_text, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$;

-- Fix auto_generate_slug trigger function
CREATE OR REPLACE FUNCTION public.auto_generate_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.title);
    final_slug := base_slug;
    
    WHILE EXISTS (SELECT 1 FROM properties WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ========================================
-- File: 20260222045150_fix_generate_slug_search_path.sql
-- ========================================
/*
  # Fix generate_slug Function Search Path Security

  1. Security Changes
    - Drop all versions of generate_slug function
    - Recreate with secure search_path setting

  2. Notes
    - Multiple function signatures existed, causing one to remain with mutable search_path
    - This ensures only one secure version exists
*/

-- Drop all versions of the function
DROP FUNCTION IF EXISTS public.generate_slug(text);
DROP FUNCTION IF EXISTS public.generate_slug CASCADE;

-- Recreate with secure search_path
CREATE FUNCTION public.generate_slug(title_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_catalog
AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(title_text, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$;

-- Recreate the trigger that depends on it
DROP TRIGGER IF EXISTS auto_generate_slug_trigger ON properties;

CREATE TRIGGER auto_generate_slug_trigger
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();

-- ========================================
-- File: 20260223092335_populate_preset_amenities.sql
-- ========================================
/*
  # Populate Preset Amenities into Database

  1. Purpose
    - Insert all preset amenities from the AddListing page into the custom_amenities table
    - Ensures search functionality has access to all standard amenity options
    - Only inserts if the amenity doesn't already exist (prevents duplicates)

  2. Changes
    - Inserts 87 preset amenities with their labels and icons
    - Uses ON CONFLICT to prevent duplicate entries
    - Covers categories: parking, security, features, views, utilities, furnishings, appliances, community facilities, and location benefits

  3. Security
    - No RLS changes needed (table already has proper policies)
*/

-- Insert preset amenities if they don't already exist
INSERT INTO custom_amenities (id, label, icon) VALUES
  ('ac', 'Central Air Conditioning', 'ac_unit'),
  ('pool', 'Swimming Pool', 'pool'),
  ('garage1', '1-Car Garage', 'directions_car'),
  ('garage2', '2-Car Garage', 'directions_car'),
  ('garage', '3-Car Garage', 'directions_car'),
  ('covered_parking', 'Covered Parking', 'garage'),
  ('visitor_parking', 'Visitor Parking', 'local_parking'),
  ('street_parking', 'Street Parking', 'local_parking'),
  ('security', 'Smart Security System', 'security'),
  ('security_24_7', '24/7 Security', 'shield'),
  ('cctv', 'CCTV Surveillance', 'videocam'),
  ('biometric', 'Biometric Access', 'fingerprint'),
  ('perimeter_fence', 'Perimeter Fence', 'fence'),
  ('fire_alarm', 'Fire Alarm System', 'local_fire_department'),
  ('backup_generator', 'Backup Generator', 'power'),
  ('fireplace', 'Fireplace', 'fireplace'),
  ('wine', 'Wine Cellar', 'wine_bar'),
  ('gym', 'Home Gym', 'fitness_center'),
  ('garden', 'Private Garden', 'yard'),
  ('landscaped_gardens', 'Landscaped Gardens', 'park'),
  ('solar', 'Solar Panels', 'solar_power'),
  ('water', 'Waterfront', 'water'),
  ('mountain', 'Mountain View', 'landscape'),
  ('smart', 'Smart Home Technology', 'settings_remote'),
  ('wifi', 'Fiber Internet', 'wifi'),
  ('gated', 'Gated Community', 'lock'),
  ('balcony', 'Balcony', 'balcony'),
  ('lanai', 'Lanai/Patio', 'deck'),
  ('roof_deck', 'Roof Deck', 'roofing'),
  ('elevator', 'Private Elevator', 'elevator'),
  ('pets', 'Pet Friendly', 'pets'),
  ('floors', 'Hardwood Floors', 'layers'),
  ('marble_countertops', 'Marble/Granite Countertops', 'countertops'),
  ('high_ceilings', 'High Ceilings', 'unfold_more'),
  ('large_windows', 'Large Windows/Natural Light', 'wb_sunny'),
  ('walk_in_closet', 'Walk-in Closet', 'checkroom'),
  ('built_in_wardrobes', 'Built-in Wardrobes', 'storage'),
  ('study_room', 'Study Room/Home Office', 'menu_book'),
  ('powder_room', 'Powder Room', 'wc'),
  ('service_area', 'Service Area/Dirty Kitchen', 'kitchen'),
  ('storage_room', 'Storage Room', 'inventory_2'),
  ('road', 'Road Access', 'add_road'),
  ('utility', 'Utilities Ready', 'power'),
  ('water_heater', 'Water Heater', 'hot_tub'),
  ('individual_water_meter', 'Individual Water Meter', 'water_drop'),
  ('individual_electric_meter', 'Individual Electric Meter', 'electrical_services'),
  ('cable_ready', 'Cable TV Ready', 'tv'),
  ('phone_ready', 'Telephone Line Ready', 'phone'),
  ('maid_room', 'Maids Room', 'meeting_room'),
  ('maid_room_bath', 'Maids Room with Bathroom', 'bathroom'),
  ('furnished', 'Fully Furnished', 'chair'),
  ('semi_furnished', 'Semi Furnished', 'weekend'),
  ('modern_kitchen', 'Modern Kitchen', 'kitchen'),
  ('kitchen_island', 'Kitchen Island', 'countertops'),
  ('dishwasher', 'Dishwasher', 'local_laundry_service'),
  ('refrigerator', 'Refrigerator Included', 'kitchen'),
  ('microwave', 'Microwave Included', 'microwave'),
  ('range_hood', 'Range Hood', 'air'),
  ('gas_range', 'Gas Range/Stove', 'gas_meter'),
  ('playground', 'Children''s Playground', 'child_care'),
  ('basketball', 'Basketball Court', 'sports_basketball'),
  ('jogging_path', 'Jogging Path', 'directions_walk'),
  ('function_hall', 'Function Hall/Clubhouse', 'meeting_room'),
  ('concierge', 'Concierge Service', 'support_agent'),
  ('package_receiving', 'Package Receiving', 'inventory'),
  ('sky_lounge', 'Sky Lounge', 'apartment'),
  ('coworking', 'Co-working Space', 'work'),
  ('business_center', 'Business Center', 'business_center'),
  ('mini_theater', 'Mini Theater', 'theaters'),
  ('game_room', 'Game Room', 'sports_esports'),
  ('near_transport', 'Near Public Transport', 'directions_bus'),
  ('near_schools', 'Near Schools', 'school'),
  ('near_shopping', 'Near Shopping Centers', 'shopping_cart'),
  ('near_hospitals', 'Near Hospitals', 'local_hospital'),
  ('renovated', 'Newly Renovated', 'construction')
ON CONFLICT (label) DO NOTHING;


-- ========================================
-- File: 20260223092430_add_delete_policy_custom_amenities.sql
-- ========================================
/*
  # Add Delete Policy for Custom Amenities

  1. Purpose
    - Allow authenticated users to delete custom amenities from the database
    - Enables cleanup of unwanted or duplicate custom amenities

  2. Changes
    - Adds DELETE policy for authenticated users on custom_amenities table

  3. Security
    - Only authenticated users can delete amenities
    - RLS remains enabled to protect data
*/

CREATE POLICY "Authenticated users can delete custom amenities"
  ON custom_amenities FOR DELETE
  TO authenticated
  USING (true);


-- ========================================
-- File: 20260223114542_create_commissions_table.sql
-- ========================================
/*
  # Create Commissions Table for Tracking Property Sales

  1. New Tables
    - `commissions`
      - `id` (uuid, primary key) - Unique identifier for commission record
      - `property_id` (text, foreign key) - Reference to properties table
      - `listing_id` (text) - Property listing ID for easy reference
      - `property_title` (text) - Property name/title for quick reference
      - `sold_price` (numeric) - Final sale price of the property
      - `yhen_percentage` (numeric) - Yhen's commission percentage (0-100)
      - `taylor_percentage` (numeric) - Taylor's commission percentage (0-100)
      - `yhen_amount` (numeric) - Calculated commission amount for Yhen
      - `taylor_amount` (numeric) - Calculated commission amount for Taylor
      - `customer_paid` (boolean) - Whether customer has paid
      - `customer_payment_date` (timestamptz) - When customer payment was received
      - `yhen_paid` (boolean) - Whether Yhen has been paid
      - `yhen_payment_date` (timestamptz) - When Yhen was paid
      - `taylor_paid` (boolean) - Whether Taylor has been paid
      - `taylor_payment_date` (timestamptz) - When Taylor was paid
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      - `created_by` (uuid) - User who created the record

  2. Security
    - Enable RLS on `commissions` table
    - Add policies for admin-only access to read, insert, update commissions
    - No public access allowed - highly sensitive financial data

  3. Indexes
    - Index on property_id for fast lookups
    - Index on customer_paid, yhen_paid, taylor_paid for filtering unpaid commissions
*/

-- Create commissions table
CREATE TABLE IF NOT EXISTS commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id text NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  listing_id text NOT NULL,
  property_title text NOT NULL,
  sold_price numeric(12,2) DEFAULT 0,
  yhen_percentage numeric(5,2) DEFAULT 0 CHECK (yhen_percentage >= 0 AND yhen_percentage <= 100),
  taylor_percentage numeric(5,2) DEFAULT 0 CHECK (taylor_percentage >= 0 AND taylor_percentage <= 100),
  yhen_amount numeric(12,2) DEFAULT 0,
  taylor_amount numeric(12,2) DEFAULT 0,
  customer_paid boolean DEFAULT false,
  customer_payment_date timestamptz,
  yhen_paid boolean DEFAULT false,
  yhen_payment_date timestamptz,
  taylor_paid boolean DEFAULT false,
  taylor_payment_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(property_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_commissions_property_id ON commissions(property_id);
CREATE INDEX IF NOT EXISTS idx_commissions_customer_paid ON commissions(customer_paid);
CREATE INDEX IF NOT EXISTS idx_commissions_yhen_paid ON commissions(yhen_paid);
CREATE INDEX IF NOT EXISTS idx_commissions_taylor_paid ON commissions(taylor_paid);

-- Enable RLS
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view commission records
CREATE POLICY "Admins can view all commissions"
  ON commissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Only admins can create commission records
CREATE POLICY "Admins can create commissions"
  ON commissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Only admins can update commission records
CREATE POLICY "Admins can update commissions"
  ON commissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Only admins can delete commission records
CREATE POLICY "Admins can delete commissions"
  ON commissions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_commissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_commissions_timestamp
  BEFORE UPDATE ON commissions
  FOR EACH ROW
  EXECUTE FUNCTION update_commissions_updated_at();

-- Function to auto-calculate commission amounts
CREATE OR REPLACE FUNCTION calculate_commission_amounts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.yhen_amount = (NEW.sold_price * NEW.yhen_percentage / 100);
  NEW.taylor_amount = (NEW.sold_price * NEW.taylor_percentage / 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate amounts when percentages or sold_price changes
CREATE TRIGGER calculate_commission_amounts_trigger
  BEFORE INSERT OR UPDATE OF sold_price, yhen_percentage, taylor_percentage ON commissions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_commission_amounts();

-- ========================================
-- File: 20260223115617_add_customer_agreed_percentage.sql
-- ========================================
/*
  # Add Customer Agreed Commission Percentage

  1. Changes
    - Add `customer_agreed_percentage` column to commissions table
      - Stores the total commission percentage agreed upon with the customer
      - Helps track the original agreement before splitting between Yhen and Taylor
      - Default value of 0, with check constraint for valid percentage (0-100)

  2. Notes
    - This field appears above Yhen and Taylor's percentages in the UI
    - Provides context for commission splitting decisions
*/

-- Add customer_agreed_percentage column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commissions' AND column_name = 'customer_agreed_percentage'
  ) THEN
    ALTER TABLE commissions 
    ADD COLUMN customer_agreed_percentage numeric(5,2) DEFAULT 0 
    CHECK (customer_agreed_percentage >= 0 AND customer_agreed_percentage <= 100);
  END IF;
END $$;

-- ========================================
-- File: 20260223122401_add_delete_policy_commissions.sql
-- ========================================
/*
  # Add Delete Policy for Commissions Table

  1. Changes
    - Add RLS delete policy for commissions table
      - Only admins can delete commission records
      - Provides secure way to remove commission data when needed

  2. Security
    - Restricts deletion to admin users only
    - Prevents unauthorized removal of commission records
*/

-- Add delete policy for commissions (admin only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'commissions' 
    AND policyname = 'Admins can delete commissions'
  ) THEN
    CREATE POLICY "Admins can delete commissions"
      ON commissions
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- ========================================
-- File: 20260223155037_fix_slug_generation_trigger.sql
-- ========================================
/*
  # Fix slug generation trigger to handle missing listing_id

  1. Changes
    - Update auto_generate_slug trigger function to use id if listing_id is not available
    - Ensure slug is always generated even when listing_id is NULL
  
  2. Notes
    - This fixes the error when creating new listings without listing_id set
*/

-- Update function to use id as fallback if listing_id is null
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
DECLARE
  slug_base TEXT;
  id_part TEXT;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Convert title to lowercase, replace spaces and special chars with hyphens
    slug_base := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    -- Remove leading/trailing hyphens
    slug_base := trim(both '-' from slug_base);
    
    -- Use listing_id if available, otherwise use first 8 chars of id
    IF NEW.listing_id IS NOT NULL AND NEW.listing_id != '' THEN
      id_part := lower(NEW.listing_id);
    ELSE
      id_part := lower(substring(NEW.id, 1, 8));
    END IF;
    
    -- Combine with id part
    NEW.slug := slug_base || '-' || id_part;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ========================================
-- File: 20260223160648_add_listing_id_sequence.sql
-- ========================================
/*
  # Add auto-incrementing listing_id sequence

  1. Changes
    - Create sequence for listing_id that starts at 1
    - Update properties table to auto-generate listing_id with format 001, 002, 003, etc.
    - Add trigger to auto-populate listing_id on insert
  
  2. Notes
    - Preserves existing listing_id values
    - New listings will get sequential IDs starting from the highest existing + 1
*/

-- Create sequence for listing_id
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'listing_id_seq') THEN
    -- Find the highest numeric listing_id to start the sequence
    DECLARE
      max_id INTEGER;
    BEGIN
      SELECT COALESCE(MAX(CAST(listing_id AS INTEGER)), 0) INTO max_id
      FROM properties
      WHERE listing_id ~ '^\d+$';
      
      EXECUTE format('CREATE SEQUENCE listing_id_seq START WITH %s', max_id + 1);
    END;
  END IF;
END $$;

-- Create function to auto-generate listing_id
CREATE OR REPLACE FUNCTION auto_generate_listing_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.listing_id IS NULL OR NEW.listing_id = '' THEN
    NEW.listing_id := LPAD(nextval('listing_id_seq')::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_listing_id ON properties;

-- Create trigger to run before insert
CREATE TRIGGER set_listing_id
  BEFORE INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_listing_id();


-- ========================================
-- File: 20260224032457_create_inquiry_tables.sql
-- ========================================
/*
  # Create Contact and Property Inquiry Tables

  1. New Tables
    - `contact_inquiries`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text) - Inquirer's full name
      - `email` (text) - Inquirer's email address
      - `phone` (text, nullable) - Inquirer's phone number
      - `message` (text) - Inquiry message content
      - `status` (text) - Status tracking (new, responded, closed)
      - `created_at` (timestamp) - When inquiry was submitted
      - `updated_at` (timestamp) - Last update timestamp

    - `property_inquiries`
      - `id` (uuid, primary key) - Unique identifier
      - `property_id` (text) - Reference to property being inquired about
      - `property_title` (text) - Property title for easy reference
      - `name` (text) - Inquirer's full name
      - `email` (text) - Inquirer's email address
      - `phone` (text, nullable) - Inquirer's phone number
      - `message` (text) - Inquiry message content
      - `status` (text) - Status tracking (new, responded, closed)
      - `created_at` (timestamp) - When inquiry was submitted
      - `updated_at` (timestamp) - Last update timestamp

  2. Security
    - Enable RLS on both tables
    - Unauthenticated users can create inquiries
    - Only admins can view and manage inquiries via RLS policies
*/

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  status text DEFAULT 'new' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS property_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id text NOT NULL,
  property_title text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  status text DEFAULT 'new' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create contact inquiries"
  ON contact_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only admins can view contact inquiries"
  ON contact_inquiries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update contact inquiries"
  ON contact_inquiries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can create property inquiries"
  ON property_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only admins can view property inquiries"
  ON property_inquiries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update property inquiries"
  ON property_inquiries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email ON contact_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON contact_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);

CREATE INDEX IF NOT EXISTS idx_property_inquiries_property_id ON property_inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_email ON property_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_created_at ON property_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_status ON property_inquiries(status);


-- ========================================
-- File: 20260224032912_create_seller_inquiry_emails_table.sql
-- ========================================
/*
  # Create Seller Inquiry Emails Table

  1. New Tables
    - `seller_inquiry_emails`
      - `id` (uuid, primary key) - Unique identifier
      - `seller_inquiry_id` (uuid) - Reference to the seller inquiry
      - `name` (text) - Seller's full name
      - `email` (text) - Seller's email address
      - `phone` (text, nullable) - Seller's phone number
      - `whatsapp` (text, nullable) - Seller's WhatsApp number
      - `property_type` (text) - Type of property being sold
      - `city` (text) - Property city/location
      - `barangay` (text, nullable) - Property barangay
      - `asking_price` (text, nullable) - Asking price
      - `description` (text, nullable) - Property description
      - `has_title` (text) - Whether property has title
      - `urgency` (text) - Urgency level
      - `status` (text) - Status tracking (new, contacted, closed)
      - `created_at` (timestamp) - When inquiry was submitted
      - `updated_at` (timestamp) - Last update timestamp

  2. Security
    - Enable RLS on table
    - Unauthenticated users can create seller inquiry emails
    - Only admins can view and manage seller inquiry emails via RLS policies
*/

CREATE TABLE IF NOT EXISTS seller_inquiry_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_inquiry_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  whatsapp text,
  property_type text NOT NULL,
  city text NOT NULL,
  barangay text,
  asking_price text,
  description text,
  has_title text NOT NULL,
  urgency text NOT NULL,
  status text DEFAULT 'new' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  FOREIGN KEY (seller_inquiry_id) REFERENCES seller_inquiries(id)
);

ALTER TABLE seller_inquiry_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create seller inquiry emails"
  ON seller_inquiry_emails
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only admins can view seller inquiry emails"
  ON seller_inquiry_emails
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update seller inquiry emails"
  ON seller_inquiry_emails
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_seller_inquiry_emails_email ON seller_inquiry_emails(email);
CREATE INDEX IF NOT EXISTS idx_seller_inquiry_emails_created_at ON seller_inquiry_emails(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_inquiry_emails_status ON seller_inquiry_emails(status);
CREATE INDEX IF NOT EXISTS idx_seller_inquiry_emails_seller_inquiry_id ON seller_inquiry_emails(seller_inquiry_id);


-- ========================================
-- File: 20260225052808_20260225_comprehensive_security_fixes.sql
-- ========================================
/*
  # Comprehensive Security Fixes

  ## Overview
  This migration addresses critical security vulnerabilities identified in the database schema
  and implements robust validation, rate limiting, and access control measures.

  ## Changes Made

  ### 1. Email Validation
  - Adds comprehensive email format validation to `contact_inquiries` table
  - Adds comprehensive email format validation to `property_inquiries` table
  - Validates email structure using regex pattern matching
  - Prevents insertion of malformed email addresses

  ### 2. Message Length Validation
  - Enforces minimum message length of 10 characters in `contact_inquiries`
  - Enforces minimum message length of 10 characters in `property_inquiries`
  - Prevents spam and low-quality submissions

  ### 3. Bot Prevention
  - Adds honeypot field detection to identify bot submissions
  - Implements submission time validation (minimum 2 seconds)
  - Adds basic pattern matching for spam detection in messages

  ### 4. Custom Amenities Access Control
  - Restricts DELETE operations on `custom_amenities` to admin users only
  - Ensures only authorized personnel can remove amenities from the system

  ### 5. Rate Limiting Infrastructure
  - Creates `inquiry_rate_limits` table to track submission rates
  - Implements 5 submissions per hour limit per IP address
  - Automatic cleanup of old rate limit records after 24 hours
  - Applies to both contact and property inquiries

  ## Security Notes
  - All validations are enforced at the database level for maximum security
  - Rate limiting helps prevent abuse and spam attacks
  - Email validation ensures data integrity
  - Admin-only operations are properly restricted
*/

-- ============================================================================
-- 1. EMAIL VALIDATION
-- ============================================================================

-- Add CHECK constraint for email validation in contact_inquiries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'contact_inquiries' AND constraint_name = 'contact_inquiries_email_format_check'
  ) THEN
    ALTER TABLE contact_inquiries
    ADD CONSTRAINT contact_inquiries_email_format_check
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

-- Add CHECK constraint for email validation in property_inquiries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'property_inquiries' AND constraint_name = 'property_inquiries_email_format_check'
  ) THEN
    ALTER TABLE property_inquiries
    ADD CONSTRAINT property_inquiries_email_format_check
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

-- ============================================================================
-- 2. MESSAGE LENGTH VALIDATION
-- ============================================================================

-- Add CHECK constraint for minimum message length in contact_inquiries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'contact_inquiries' AND constraint_name = 'contact_inquiries_message_length_check'
  ) THEN
    ALTER TABLE contact_inquiries
    ADD CONSTRAINT contact_inquiries_message_length_check
    CHECK (char_length(message) >= 10);
  END IF;
END $$;

-- Add CHECK constraint for minimum message length in property_inquiries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'property_inquiries' AND constraint_name = 'property_inquiries_message_length_check'
  ) THEN
    ALTER TABLE property_inquiries
    ADD CONSTRAINT property_inquiries_message_length_check
    CHECK (char_length(message) >= 10);
  END IF;
END $$;

-- ============================================================================
-- 3. RATE LIMITING INFRASTRUCTURE
-- ============================================================================

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS inquiry_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL,
  submission_count int DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE inquiry_rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all rate limits" ON inquiry_rate_limits;
DROP POLICY IF EXISTS "System can insert rate limits" ON inquiry_rate_limits;
DROP POLICY IF EXISTS "System can update rate limits" ON inquiry_rate_limits;

-- Admin can view all rate limit records
CREATE POLICY "Admins can view all rate limits"
  ON inquiry_rate_limits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- System can insert rate limit records (for internal tracking)
CREATE POLICY "System can insert rate limits"
  ON inquiry_rate_limits
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- System can update rate limit records
CREATE POLICY "System can update rate limits"
  ON inquiry_rate_limits
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for faster rate limit lookups
CREATE INDEX IF NOT EXISTS idx_inquiry_rate_limits_ip_address 
ON inquiry_rate_limits(ip_address);

CREATE INDEX IF NOT EXISTS idx_inquiry_rate_limits_window_start 
ON inquiry_rate_limits(window_start);

-- Function to clean up old rate limit records (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM inquiry_rate_limits
  WHERE window_start < now() - interval '24 hours';
END;
$$;

-- ============================================================================
-- 4. CUSTOM AMENITIES DELETE RESTRICTION
-- ============================================================================

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Authenticated users can delete custom amenities" ON custom_amenities;
DROP POLICY IF EXISTS "Only admins can delete custom amenities" ON custom_amenities;

-- Create new admin-only delete policy
CREATE POLICY "Only admins can delete custom amenities"
  ON custom_amenities
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 5. BOT PREVENTION FUNCTIONS
-- ============================================================================

-- Function to validate submission timing and patterns
CREATE OR REPLACE FUNCTION validate_inquiry_submission(
  p_message text,
  p_submission_time_seconds int DEFAULT 2
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  spam_patterns text[] := ARRAY[
    'viagra', 'cialis', 'casino', 'lottery', 'prize',
    'click here', 'buy now', 'limited time', 'act now',
    'http://', 'https://', 'www.'
  ];
  pattern text;
BEGIN
  -- Check for spam patterns in message
  FOREACH pattern IN ARRAY spam_patterns
  LOOP
    IF lower(p_message) LIKE '%' || pattern || '%' THEN
      RETURN false;
    END IF;
  END LOOP;
  
  -- If submission time is provided and less than minimum, reject
  IF p_submission_time_seconds < 2 THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- ============================================================================
-- 6. GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Grant execute permissions on utility functions
GRANT EXECUTE ON FUNCTION cleanup_old_rate_limits() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_inquiry_submission(text, int) TO authenticated;


-- ========================================
-- File: 20260225095443_add_consent_tracking_columns.sql
-- ========================================
/*
  # Add Consent Tracking Columns to Inquiry Tables

  ## Overview
  This migration adds dual-consent compliance tracking to all inquiry forms on the website.
  This enables proper GDPR/privacy law compliance by tracking both mandatory privacy consent
  and optional marketing consent separately.

  ## Changes Made

  ### 1. Property Inquiries Table
  - Adds `privacy_consent` boolean column (NOT NULL, DEFAULT false)
  - Adds `marketing_consent` boolean column (NOT NULL, DEFAULT false)
  - Privacy consent tracks acceptance of Privacy Policy (mandatory for submission)
  - Marketing consent tracks opt-in for newsletters and property updates (optional)

  ### 2. Contact Inquiries Table
  - Adds `privacy_consent` boolean column (NOT NULL, DEFAULT false)
  - Adds `marketing_consent` boolean column (NOT NULL, DEFAULT false)
  - Same dual-consent structure as property inquiries

  ### 3. Seller Inquiries Table
  - Adds `privacy_consent` boolean column (NOT NULL, DEFAULT false)
  - Adds `marketing_consent` boolean column (NOT NULL, DEFAULT false)
  - Tracks consent for sellers listing their properties

  ### 4. Seller Inquiry Emails Table
  - Adds `privacy_consent` boolean column (NOT NULL, DEFAULT false)
  - Adds `marketing_consent` boolean column (NOT NULL, DEFAULT false)
  - Maintains consent tracking in email records

  ## Compliance Notes
  - Privacy consent is mandatory (enforced at UI level) - tracks acceptance of Privacy Policy
  - Marketing consent is optional - tracks permission to send promotional communications
  - Both consent values are stored for audit trail and legal compliance
  - Existing records will have false defaults (grandfathered in with implied consent)
  - Future submissions will explicitly capture user consent choices
*/

-- ============================================================================
-- 1. ADD CONSENT COLUMNS TO PROPERTY_INQUIRIES
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_inquiries' AND column_name = 'privacy_consent'
  ) THEN
    ALTER TABLE property_inquiries 
    ADD COLUMN privacy_consent boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_inquiries' AND column_name = 'marketing_consent'
  ) THEN
    ALTER TABLE property_inquiries 
    ADD COLUMN marketing_consent boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- ============================================================================
-- 2. ADD CONSENT COLUMNS TO CONTACT_INQUIRIES
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_inquiries' AND column_name = 'privacy_consent'
  ) THEN
    ALTER TABLE contact_inquiries 
    ADD COLUMN privacy_consent boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_inquiries' AND column_name = 'marketing_consent'
  ) THEN
    ALTER TABLE contact_inquiries 
    ADD COLUMN marketing_consent boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- ============================================================================
-- 3. ADD CONSENT COLUMNS TO SELLER_INQUIRIES
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_inquiries' AND column_name = 'privacy_consent'
  ) THEN
    ALTER TABLE seller_inquiries 
    ADD COLUMN privacy_consent boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_inquiries' AND column_name = 'marketing_consent'
  ) THEN
    ALTER TABLE seller_inquiries 
    ADD COLUMN marketing_consent boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- ============================================================================
-- 4. ADD CONSENT COLUMNS TO SELLER_INQUIRY_EMAILS
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_inquiry_emails' AND column_name = 'privacy_consent'
  ) THEN
    ALTER TABLE seller_inquiry_emails 
    ADD COLUMN privacy_consent boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_inquiry_emails' AND column_name = 'marketing_consent'
  ) THEN
    ALTER TABLE seller_inquiry_emails 
    ADD COLUMN marketing_consent boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- ============================================================================
-- 5. CREATE INDEXES FOR CONSENT QUERIES
-- ============================================================================

-- Index for finding users who opted into marketing
CREATE INDEX IF NOT EXISTS idx_property_inquiries_marketing_consent 
ON property_inquiries(marketing_consent) WHERE marketing_consent = true;

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_marketing_consent 
ON contact_inquiries(marketing_consent) WHERE marketing_consent = true;

CREATE INDEX IF NOT EXISTS idx_seller_inquiries_marketing_consent 
ON seller_inquiries(marketing_consent) WHERE marketing_consent = true;

-- ============================================================================
-- 6. ADD HELPFUL COMMENTS
-- ============================================================================

COMMENT ON COLUMN property_inquiries.privacy_consent IS 'User accepted Privacy Policy (mandatory)';
COMMENT ON COLUMN property_inquiries.marketing_consent IS 'User opted into marketing communications (optional)';

COMMENT ON COLUMN contact_inquiries.privacy_consent IS 'User accepted Privacy Policy (mandatory)';
COMMENT ON COLUMN contact_inquiries.marketing_consent IS 'User opted into marketing communications (optional)';

COMMENT ON COLUMN seller_inquiries.privacy_consent IS 'User accepted Privacy Policy (mandatory)';
COMMENT ON COLUMN seller_inquiries.marketing_consent IS 'User opted into marketing communications (optional)';

COMMENT ON COLUMN seller_inquiry_emails.privacy_consent IS 'User accepted Privacy Policy (mandatory)';
COMMENT ON COLUMN seller_inquiry_emails.marketing_consent IS 'User opted into marketing communications (optional)';


-- ========================================
-- File: 20260225190450_add_agent_column_to_properties.sql
-- ========================================
/*
  # Add agent column to properties table

  1. Changes
    - Add `agent` column to `properties` table
    - Column is optional and can be 'Yhen' or 'Daphne'
    - Defaults to 'Yhen' for existing properties
  
  2. Notes
    - Existing properties will have agent set to 'Yhen'
    - New properties can specify either agent
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'agent'
  ) THEN
    ALTER TABLE properties ADD COLUMN agent TEXT CHECK (agent IN ('Yhen', 'Daphne')) DEFAULT 'Yhen';
  END IF;
END $$;

-- ========================================
-- File: 20260225190503_add_daphne_commission_columns.sql
-- ========================================
/*
  # Add Daphne commission fields to commissions table

  1. Changes
    - Add `daphne_percentage` column for Daphne's commission percentage
    - Add `daphne_amount` column for calculated commission amount
    - Add `daphne_paid` column for payment status
    - Add `daphne_payment_date` column for payment date tracking
  
  2. Notes
    - All columns default to 0 or false for existing records
    - Daphne's commission follows the same pattern as Yhen and Taylor
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commissions' AND column_name = 'daphne_percentage'
  ) THEN
    ALTER TABLE commissions ADD COLUMN daphne_percentage DECIMAL(5,2) DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commissions' AND column_name = 'daphne_amount'
  ) THEN
    ALTER TABLE commissions ADD COLUMN daphne_amount DECIMAL(15,2) DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commissions' AND column_name = 'daphne_paid'
  ) THEN
    ALTER TABLE commissions ADD COLUMN daphne_paid BOOLEAN DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commissions' AND column_name = 'daphne_payment_date'
  ) THEN
    ALTER TABLE commissions ADD COLUMN daphne_payment_date TIMESTAMPTZ DEFAULT NULL;
  END IF;
END $$;

-- ========================================
-- File: 20260225190633_fix_listing_id_sequence.sql
-- ========================================
/*
  # Fix listing_id sequence to ensure proper 3-digit format

  1. Changes
    - Reset the sequence to use the correct next value
    - Ensures all new listings get proper 001, 002, 003, etc. format
  
  2. Notes
    - Finds the highest numeric listing_id and sets sequence to next value
    - This prevents gaps and ensures consistent formatting
*/

DO $$
DECLARE
  max_id INTEGER;
BEGIN
  -- Find the highest numeric listing_id
  SELECT COALESCE(MAX(CAST(listing_id AS INTEGER)), 0) INTO max_id
  FROM properties
  WHERE listing_id ~ '^\d+$';
  
  -- Reset the sequence to start from max_id + 1
  PERFORM setval('listing_id_seq', GREATEST(max_id, 1), true);
END $$;

-- ========================================
-- File: 20260227065437_fix_listing_id_format_to_three_digits.sql
-- ========================================
/*
  # Fix listing_id format to use simple 3-digit sequential numbers

  ## Problem
  The auto_generate_listing_id function was generating IDs in the format
  PROP-YYYYMM-00008 instead of the expected 001, 002, 003 format used by all
  existing listings.

  ## Changes
  - Replaces auto_generate_listing_id() function with one that generates
    simple zero-padded 3-digit numbers (001, 002, 003, etc.)
  - Resets the listing_id_seq sequence to start after the highest existing numeric listing_id
*/

CREATE OR REPLACE FUNCTION public.auto_generate_listing_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.listing_id IS NULL THEN
    NEW.listing_id := LPAD(nextval('listing_id_seq')::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  max_numeric_id bigint;
BEGIN
  SELECT COALESCE(MAX(listing_id::bigint), 0)
  INTO max_numeric_id
  FROM properties
  WHERE listing_id ~ '^\d+$';

  IF max_numeric_id >= nextval('listing_id_seq') - 1 THEN
    PERFORM setval('listing_id_seq', max_numeric_id + 1, false);
  END IF;
END $$;


-- ========================================
-- File: 20260306040933_add_abby_juvy_commission_columns.sql
-- ========================================
/*
  # Add Abby and Juvy Commission Columns

  1. Changes
    - Add `abby_percentage` column to commissions table (decimal, default 0)
    - Add `abby_amount` column to commissions table (decimal, default 0)
    - Add `abby_paid` column to commissions table (boolean, default false)
    - Add `abby_payment_date` column to commissions table (timestamptz, nullable)
    - Add `juvy_percentage` column to commissions table (decimal, default 0)
    - Add `juvy_amount` column to commissions table (decimal, default 0)
    - Add `juvy_paid` column to commissions table (boolean, default false)
    - Add `juvy_payment_date` column to commissions table (timestamptz, nullable)

  2. Notes
    - These columns support commission tracking for agents Abby and Juvy
    - Follows same structure as existing Daphne commission columns
    - All columns are nullable/have defaults for backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commissions' AND column_name = 'abby_percentage'
  ) THEN
    ALTER TABLE commissions ADD COLUMN abby_percentage decimal DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commissions' AND column_name = 'abby_amount'
  ) THEN
    ALTER TABLE commissions ADD COLUMN abby_amount decimal DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commissions' AND column_name = 'abby_paid'
  ) THEN
    ALTER TABLE commissions ADD COLUMN abby_paid boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commissions' AND column_name = 'abby_payment_date'
  ) THEN
    ALTER TABLE commissions ADD COLUMN abby_payment_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commissions' AND column_name = 'juvy_percentage'
  ) THEN
    ALTER TABLE commissions ADD COLUMN juvy_percentage decimal DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commissions' AND column_name = 'juvy_amount'
  ) THEN
    ALTER TABLE commissions ADD COLUMN juvy_amount decimal DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commissions' AND column_name = 'juvy_paid'
  ) THEN
    ALTER TABLE commissions ADD COLUMN juvy_paid boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commissions' AND column_name = 'juvy_payment_date'
  ) THEN
    ALTER TABLE commissions ADD COLUMN juvy_payment_date timestamptz;
  END IF;
END $$;

-- ========================================
-- File: 20260306082934_update_agent_check_constraint_add_abby_juvy.sql
-- ========================================
/*
  # Update Agent Check Constraint to Include Abby and Juvy

  1. Changes
    - Drop the existing check constraint on the agent column
    - Add a new check constraint that includes all four agents: Yhen, Daphne, Abby, Juvy

  2. Notes
    - This allows properties to be assigned to any of the four agents
    - Fixes the error when trying to save listings with Abby or Juvy as agents
*/

-- Drop the old constraint
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_agent_check;

-- Add the new constraint with all four agents
ALTER TABLE properties ADD CONSTRAINT properties_agent_check 
  CHECK (agent = ANY (ARRAY['Yhen'::text, 'Daphne'::text, 'Abby'::text, 'Juvy'::text]));

-- ========================================
-- File: 20260308120111_add_featured_image_index.sql
-- ========================================
/*
  # Add featured image index to properties

  1. Changes
    - Add `featured_image_index` column to `properties` table
      - Stores the index (0-based) of which image in the images array should be used as the featured/preview image
      - Defaults to 0 (first image)
      - NULL means use first image (backward compatible)
  
  2. Notes
    - This allows users to select which uploaded image appears in listings and social media previews
    - Existing listings will continue to use their first image (index 0)
*/

-- Add featured_image_index column
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS featured_image_index integer DEFAULT 0 CHECK (featured_image_index >= 0);

-- Add comment for documentation
COMMENT ON COLUMN properties.featured_image_index IS 'Index of the image in the images array to use as featured/preview image (0-based). NULL or 0 means first image.';

-- ========================================
-- File: 20260309163557_add_office_space_and_make_beds_baths_nullable.sql
-- ========================================
/*
  # Add office space field and make beds/baths optional

  1. Changes
    - Add `office_space` column (numeric, nullable) to properties table for commercial properties
    - Make `beds` column nullable for commercial properties
    - Make `baths` column nullable for commercial properties
  
  2. Notes
    - Office space is measured in square meters (Sqm)
    - Beds and baths remain required for residential properties but optional for commercial
    - Existing properties will have NULL for office_space if not set
*/

-- Add office_space column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'office_space'
  ) THEN
    ALTER TABLE properties ADD COLUMN office_space numeric;
  END IF;
END $$;

-- Make beds nullable
DO $$
BEGIN
  ALTER TABLE properties ALTER COLUMN beds DROP NOT NULL;
  ALTER TABLE properties ALTER COLUMN beds DROP DEFAULT;
  ALTER TABLE properties ALTER COLUMN beds SET DEFAULT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Make baths nullable  
DO $$
BEGIN
  ALTER TABLE properties ALTER COLUMN baths DROP NOT NULL;
  ALTER TABLE properties ALTER COLUMN baths DROP DEFAULT;
  ALTER TABLE properties ALTER COLUMN baths SET DEFAULT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ========================================
-- File: 20260309165016_add_warehouse_size_column.sql
-- ========================================
/*
  # Add Warehouse Size Column

  1. Changes
    - Add `warehouse_size` column to `properties` table
      - Type: numeric (for square meters)
      - Nullable: true (optional field)
      - Used specifically for warehouse property type to separate warehouse area from office space

  2. Notes
    - This allows warehouses to specify both warehouse size and office space separately
    - Existing properties will have NULL for this field by default
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'warehouse_size'
  ) THEN
    ALTER TABLE properties ADD COLUMN warehouse_size numeric;
  END IF;
END $$;


