/*
  # Update Agent Check Constraint to Include Abby and Juvy

  1. Changes
    - Drop the existing check constraint on the agent column
    - Add a new check constraint that includes all four agents: Yhen, Daphne, Abby, Juvy

  2. Notes
    - This allows properties to be assigned to any of the four agents
    - Fixes the error when trying to save listings with Abby or Juvy as agents
*/

-- Drop the old constraint
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_agent_check;

-- Add the new constraint with all four agents
ALTER TABLE properties ADD CONSTRAINT properties_agent_check 
  CHECK (agent = ANY (ARRAY['Yhen'::text, 'Daphne'::text, 'Abby'::text, 'Juvy'::text]));