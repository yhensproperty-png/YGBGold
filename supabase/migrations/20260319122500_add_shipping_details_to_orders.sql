-- Add shipping details columns to the orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_country_group TEXT,
ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC;
