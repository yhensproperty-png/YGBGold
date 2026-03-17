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
