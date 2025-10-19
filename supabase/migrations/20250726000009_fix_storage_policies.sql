-- Fix storage policies for avatars bucket to handle different path structures
-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload any avatar" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update any avatar" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete any avatar" ON storage.objects;

-- Create more flexible policies that handle different path structures
CREATE POLICY "Users can upload their own avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND (
    -- Path structure: {userId}/{filename}
    auth.uid()::text = (storage.foldername(name))[1] OR
    -- Path structure: profile-photos/{userId}-{timestamp}.{ext}
    (storage.foldername(name))[1] = 'profile-photos' AND 
    auth.uid()::text = split_part((storage.foldername(name))[2], '-', 1)
  )
);

CREATE POLICY "Users can view all avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' AND (
    -- Path structure: {userId}/{filename}
    auth.uid()::text = (storage.foldername(name))[1] OR
    -- Path structure: profile-photos/{userId}-{timestamp}.{ext}
    (storage.foldername(name))[1] = 'profile-photos' AND 
    auth.uid()::text = split_part((storage.foldername(name))[2], '-', 1)
  )
);

CREATE POLICY "Users can delete their own avatars" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' AND (
    -- Path structure: {userId}/{filename}
    auth.uid()::text = (storage.foldername(name))[1] OR
    -- Path structure: profile-photos/{userId}-{timestamp}.{ext}
    (storage.foldername(name))[1] = 'profile-photos' AND 
    auth.uid()::text = split_part((storage.foldername(name))[2], '-', 1)
  )
);

-- Add admin policies for avatars storage
CREATE POLICY "Admins can upload any avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid()
  )
);

CREATE POLICY "Admins can update any avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' AND 
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid()
  )
);

CREATE POLICY "Admins can delete any avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' AND 
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid()
  )
); 