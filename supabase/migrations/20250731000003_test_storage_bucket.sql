-- Test and verify storage bucket configuration
-- This will help debug the photo upload issue

-- First, let's check if the profile-photos bucket exists
SELECT id, name, public, created_at FROM storage.buckets WHERE id = 'profile-photos';

-- Check all storage buckets
SELECT id, name, public FROM storage.buckets;

-- Check existing policies for profile-photos
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%profile-photos%';

-- Create a simple test policy that allows all authenticated users to upload
DROP POLICY IF EXISTS "Test upload policy" ON storage.objects;
CREATE POLICY "Test upload policy" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-photos' AND 
  auth.role() = 'authenticated'
);

-- Create a simple test policy that allows public read access
DROP POLICY IF EXISTS "Test read policy" ON storage.objects;
CREATE POLICY "Test read policy" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-photos');

-- Ensure the bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'profile-photos';

-- Verify the bucket is public
SELECT id, name, public FROM storage.buckets WHERE id = 'profile-photos'; 