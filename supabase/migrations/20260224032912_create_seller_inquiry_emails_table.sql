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
