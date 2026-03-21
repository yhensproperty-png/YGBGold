-- Create a secure RPC to retrieve the order number of a pending order for an email
-- This allows the front-end to display which order is being combined
CREATE OR REPLACE FUNCTION public.get_pending_order_number(target_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT order_number FROM public.orders
    WHERE customer_email = target_email
      AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1
  );
END;
$$;

-- Grant execution to anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_pending_order_number(text) TO anon, authenticated;
