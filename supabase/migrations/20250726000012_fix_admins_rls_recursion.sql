-- Fix infinite recursion in admins table RLS policies
-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can insert new admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can update admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can delete admins" ON public.admins;

-- Create simpler policies that don't cause recursion
-- Allow authenticated users to view admins table (for checking admin status)
CREATE POLICY "Allow authenticated users to view admins" ON public.admins
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to manage admins (for initial admin creation)
CREATE POLICY "Allow service role to manage admins" ON public.admins
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to insert into admins (for admin creation)
CREATE POLICY "Allow authenticated users to insert admins" ON public.admins
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow admins to update and delete other admins
CREATE POLICY "Allow admins to manage admins" ON public.admins
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Allow admins to delete admins" ON public.admins
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid()
    )
  ); 