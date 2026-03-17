/*
  # Set up Supabase Storage for property images

  1. Purpose
    - Images are now stored in Supabase Storage instead of base64 in database
    - This prevents database row size errors
    - Allows unlimited photo uploads (up to Supabase plan limits)
    - Faster loading with proper image URLs

  2. Storage Configuration
    - Create 'property-images' bucket if not exists
    - Enable public read access for property listings
    - Restrict uploads to authenticated users
*/

-- Create storage bucket for property images (handled via Supabase API)
-- The bucket creation is done through the client code, not SQL
-- See updated AddListing.tsx for image upload implementation
