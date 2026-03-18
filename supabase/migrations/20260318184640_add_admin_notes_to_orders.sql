-- Add admin_notes column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;
