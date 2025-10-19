-- Fix profile-photos storage bucket and policies
-- Run this in the Supabase SQL Editor

-- Create profile-photos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies for profile-photos to avoid conflicts
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload multiple profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all profile photos" ON storage.objects;

-- Create comprehensive policies for profile-photos storage
CREATE POLICY "Users can upload their own photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all profile photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can update their own photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create a more permissive policy for authenticated users to upload photos
CREATE POLICY "Authenticated users can upload profile photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-photos' AND 
  auth.role() = 'authenticated'
);

-- Create a policy for admins to manage all photos
CREATE POLICY "Admins can manage all profile photos" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'profile-photos' AND 
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid()
  )
);

-- Ensure the bucket is public and accessible
UPDATE storage.buckets 
SET public = true 
WHERE id = 'profile-photos';

-- Verify the bucket exists and is public
SELECT id, name, public FROM storage.buckets WHERE id = 'profile-photos'; 