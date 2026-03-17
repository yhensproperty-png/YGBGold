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