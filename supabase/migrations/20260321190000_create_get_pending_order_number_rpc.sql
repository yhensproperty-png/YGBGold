-- Returns the order_number of the most recent pending order for a given email, or NULL if none exists.
-- Used by the combine-shipping "Check Availability" flow on the buy form.
CREATE OR REPLACE FUNCTION public.get_pending_order_number(target_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_order_number integer;
BEGIN
  SELECT order_number INTO found_order_number
  FROM public.orders
  WHERE customer_email = target_email
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN found_order_number;
END;
$$;

-- Grant execution to anon and authenticated (required for guest checkout flow)
GRANT EXECUTE ON FUNCTION public.get_pending_order_number(text) TO anon, authenticated;
