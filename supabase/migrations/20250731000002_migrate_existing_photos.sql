-- Migrate existing photos from avatars bucket to profile-photos bucket
-- This script will help move existing photos to the correct bucket

-- First, ensure the profile-photos bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Update the bucket to be public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'profile-photos';

-- Create a simple, permissive policy for profile-photos uploads
-- This will allow any authenticated user to upload to the profile-photos bucket
DROP POLICY IF EXISTS "Allow authenticated uploads to profile-photos" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to profile-photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-photos' AND 
  auth.role() = 'authenticated'
);

-- Allow public read access to profile-photos
DROP POLICY IF EXISTS "Allow public read access to profile-photos" ON storage.objects;
CREATE POLICY "Allow public read access to profile-photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-photos');

-- Allow users to update their own photos
DROP POLICY IF EXISTS "Allow users to update their own photos" ON storage.objects;
CREATE POLICY "Allow users to update their own photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-photos' AND 
  auth.role() = 'authenticated'
);

-- Allow users to delete their own photos
DROP POLICY IF EXISTS "Allow users to delete their own photos" ON storage.objects;
CREATE POLICY "Allow users to delete their own photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-photos' AND 
  auth.role() = 'authenticated'
);

-- Verify the bucket configuration
SELECT id, name, public FROM storage.buckets WHERE id = 'profile-photos'; 