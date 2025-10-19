-- Fix RLS policies to allow admin approval operations
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow service role to manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow service role to manage admins" ON public.admins;
DROP POLICY IF EXISTS "Allow admins to manage admins" ON public.admins;
DROP POLICY IF EXISTS "Allow admins to manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins to manage matches" ON public.matches;
DROP POLICY IF EXISTS "Allow admins to manage messages" ON public.messages;
DROP POLICY IF EXISTS "Allow admins to manage invite codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Allow admins to manage notifications" ON public.notifications;

-- Create admin-specific policies that allow admin operations
CREATE POLICY "Allow admins to manage profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Allow admins to manage admins" ON public.admins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid()
    )
  );

-- Allow admins to manage matches
CREATE POLICY "Allow admins to manage matches" ON public.matches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid()
    )
  );

-- Allow admins to manage messages
CREATE POLICY "Allow admins to manage messages" ON public.messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid()
    )
  );

-- Allow admins to manage invite codes
CREATE POLICY "Allow admins to manage invite codes" ON public.invite_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid()
    )
  );

-- Allow admins to manage notifications
CREATE POLICY "Allow admins to manage notifications" ON public.notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid()
    )
  ); 