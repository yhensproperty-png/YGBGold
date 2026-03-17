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