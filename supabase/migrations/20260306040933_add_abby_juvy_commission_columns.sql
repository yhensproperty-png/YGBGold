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