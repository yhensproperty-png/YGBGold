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
