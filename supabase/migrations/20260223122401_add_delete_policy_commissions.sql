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