-- Enhance photos column with constraints and indexes
-- Add constraint to limit number of photos (max 6 photos per profile)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_photos_limit' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_photos_limit 
    CHECK (array_length(photos, 1) IS NULL OR array_length(photos, 1) <= 6);
  END IF;
END $$;

-- Add index for better performance when querying profiles with photos
CREATE INDEX IF NOT EXISTS idx_profiles_photos_not_empty 
ON profiles USING GIN (photos) 
WHERE photos IS NOT NULL AND array_length(photos, 1) > 0;

-- Add trigger to validate photo URLs
CREATE OR REPLACE FUNCTION validate_photo_urls()
RETURNS TRIGGER AS $$
DECLARE
  photo_url TEXT;
BEGIN
  -- Validate each photo URL in the array
  IF NEW.photos IS NOT NULL THEN
    FOREACH photo_url IN ARRAY NEW.photos
    LOOP
      -- Check if URL is from allowed storage bucket or external URL
      IF NOT (
        photo_url ~ '^https://.*\.supabase\.co/storage/v1/object/public/profile-photos/.*' OR
        photo_url ~ '^https://images\.unsplash\.com/.*' OR
        photo_url ~ '^https://.*\.(jpg|jpeg|png|webp|gif)(\?.*)?$'
      ) THEN
        RAISE EXCEPTION 'Invalid photo URL format: %', photo_url;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for photo URL validation
DROP TRIGGER IF EXISTS validate_photos_trigger ON profiles;
CREATE TRIGGER validate_photos_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_photo_urls();

-- Create function to get profile photos count
CREATE OR REPLACE FUNCTION get_photos_count(profile_photos TEXT[])
RETURNS INTEGER AS $$
BEGIN
  IF profile_photos IS NULL THEN
    RETURN 0;
  END IF;
  RETURN array_length(profile_photos, 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update storage policies for multiple photos
DO $$
BEGIN
  -- Allow users to upload multiple photos to their folder
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload multiple profile photos'
  ) THEN
    CREATE POLICY "Users can upload multiple profile photos" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (
      bucket_id = 'profile-photos' AND 
      auth.uid()::text = (storage.foldername(name))[1] AND
      -- Limit file size to 5MB
      octet_length(storage.get_object(bucket_id, name)) <= 5242880
    );
  END IF;
END $$;