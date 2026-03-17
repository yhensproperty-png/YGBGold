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
