ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_carrier TEXT;
