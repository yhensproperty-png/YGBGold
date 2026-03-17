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