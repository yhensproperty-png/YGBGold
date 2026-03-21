-- Add 'ordered' to the orders status check constraint
-- New flow: pending → confirmed → ordered → shipped → cancelled
ALTER TABLE public.orders
  DROP CONSTRAINT orders_status_check,
  ADD CONSTRAINT orders_status_check
    CHECK (status IN ('pending', 'confirmed', 'ordered', 'shipped', 'cancelled'));
