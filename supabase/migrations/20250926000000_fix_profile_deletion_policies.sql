-- Fix profile deletion policies for admins
-- Ensure admins can delete profiles properly

-- Drop existing delete policies
DROP POLICY IF EXISTS "Allow admins to delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to delete their own profiles" ON public.profiles;

-- Create comprehensive delete policies
CREATE POLICY "Allow admins to delete profiles" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

-- Allow users to delete their own profiles (optional)
CREATE POLICY "Allow users to delete their own profiles" ON public.profiles
  FOR DELETE USING (
    auth.uid() = id
  );

-- Ensure the profiles table has RLS enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add comment for documentation
COMMENT ON POLICY "Allow admins to delete profiles" ON public.profiles IS 'Allows admins to delete any profile';
COMMENT ON POLICY "Allow users to delete their own profiles" ON public.profiles IS 'Allows users to delete their own profile';
