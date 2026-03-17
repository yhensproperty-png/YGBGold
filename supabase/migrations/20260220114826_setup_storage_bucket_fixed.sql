/*
  # Set up Supabase Storage for property images

  1. Storage Bucket
    - Create 'property-images' bucket for storing property photos
    - Enable public access for viewing images
  
  2. Security Policies
    - Public can view all images (SELECT)
    - Authenticated users can upload images (INSERT)
    - Authenticated users can update their own images (UPDATE)
    - Authenticated users can delete their own images (DELETE)
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public to view images
CREATE POLICY "Public can view property images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- Allow users to update their own uploaded images
CREATE POLICY "Users can update own property images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-images' AND owner::text = auth.uid()::text)
WITH CHECK (bucket_id = 'property-images');

-- Allow users to delete their own uploaded images
CREATE POLICY "Users can delete own property images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images' AND owner::text = auth.uid()::text);
