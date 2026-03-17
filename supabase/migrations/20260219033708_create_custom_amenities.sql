/*
  # Create custom_amenities table

  ## Summary
  Stores user-created amenity options so they are shared across all users and sessions.

  ## New Tables
  - `custom_amenities`
    - `id` (text, primary key) — unique identifier for the amenity
    - `label` (text, unique) — display name of the amenity
    - `icon` (text) — Material Icon name inferred from the label
    - `created_at` (timestamptz) — when the amenity was created

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
