/*
  # Fix Function Search Path Security Issues

  1. Security Changes
    - Set secure search_path for `generate_listing_id` function
    - Set secure search_path for `assign_listing_id` trigger function
    - Set secure search_path for `generate_slug` function
    - Set secure search_path for `auto_generate_slug` trigger function

  2. Notes
    - Functions with mutable search_path can be exploited for privilege escalation
    - Setting `search_path` to empty string or specific schemas prevents this vulnerability
    - These functions only need access to pg_catalog for built-in functions
*/

-- Fix generate_listing_id function
CREATE OR REPLACE FUNCTION public.generate_listing_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  new_id text;
  exists_check boolean;
BEGIN
  LOOP
    new_id := 'LISTING-' || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
    SELECT EXISTS(SELECT 1 FROM properties WHERE listing_id = new_id) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN new_id;
END;
$$;

-- Fix assign_listing_id trigger function
CREATE OR REPLACE FUNCTION public.assign_listing_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NEW.listing_id IS NULL THEN
    NEW.listing_id := generate_listing_id();
  END IF;
  RETURN NEW;
END;
$$;

-- Fix generate_slug function
CREATE OR REPLACE FUNCTION public.generate_slug(title_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(title_text, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$;

-- Fix auto_generate_slug trigger function
CREATE OR REPLACE FUNCTION public.auto_generate_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.title);
    final_slug := base_slug;
    
    WHILE EXISTS (SELECT 1 FROM properties WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$;