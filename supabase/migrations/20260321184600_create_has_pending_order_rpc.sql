-- Create a secure RPC to check if a pending order exists for an email
-- This bypasses RLS so anonymous users can verify combine-shipping
CREATE OR REPLACE FUNCTION public.has_pending_order(target_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.orders
    WHERE customer_email = target_email
      AND status = 'pending'
  );
END;
$$;

-- Grant execution to anon and authenticated
GRANT EXECUTE ON FUNCTION public.has_pending_order(text) TO anon, authenticated;
