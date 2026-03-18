-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id TEXT REFERENCES public.properties(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'PHP',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'cancelled')),
    tracking_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Set up RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Admins can do anything
CREATE POLICY "Admins have full access to orders" 
ON public.orders 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Users can insert their own orders
CREATE POLICY "Users can insert own orders" 
ON public.orders 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Anonymous users can also insert orders (since user_id is nullable)
CREATE POLICY "Anon can insert orders" 
ON public.orders 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Users can read their own orders
CREATE POLICY "Users can view own orders" 
ON public.orders 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Set up trigger for updated_at
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
