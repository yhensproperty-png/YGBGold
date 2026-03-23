-- RPC that returns all pending orders for an email so the customer can
-- pick which one to combine their new order with.
CREATE OR REPLACE FUNCTION public.get_pending_orders_for_combine(target_email text)
RETURNS TABLE(order_number integer, property_title text, shipping_address text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT
      o.order_number,
      p.title::text AS property_title,
      o.shipping_address::text
    FROM public.orders o
    LEFT JOIN public.properties p ON p.id = o.property_id
    WHERE o.customer_email = target_email
      AND o.status = 'pending'
    ORDER BY o.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_pending_orders_for_combine(text) TO anon, authenticated;
