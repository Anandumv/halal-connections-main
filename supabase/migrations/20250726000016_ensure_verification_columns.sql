-- Ensure profiles table has all necessary verification columns
-- Add verification_status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN verification_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- Add verified column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'verified'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN verified BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Update existing profiles to have proper verification status
UPDATE public.profiles 
SET verification_status = 'pending', verified = FALSE 
WHERE verification_status IS NULL;

-- Create index for verification status for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON public.profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON public.profiles(verified); 