-- Simplify storage policies for easier debugging
-- Drop all existing policies for avatars bucket
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload any avatar" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update any avatar" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete any avatar" ON storage.objects;

-- Create simple, permissive policies for testing
CREATE POLICY "Allow all operations on avatars" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Also ensure the avatars bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  name = 'avatars'; 