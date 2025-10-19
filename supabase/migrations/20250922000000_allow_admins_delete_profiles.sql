-- Ensure admins can delete profiles
-- Safe to run multiple times

-- Enable RLS if not already
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing admin delete policy to avoid duplicates
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Create explicit DELETE policy for admins
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

