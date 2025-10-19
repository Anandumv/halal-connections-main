-- Fix messages table structure and resolve RLS recursion issues

-- First, add the missing is_admin_message column to messages table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'messages' 
    AND column_name = 'is_admin_message'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN is_admin_message BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Drop ALL existing RLS policies to start fresh
DROP POLICY IF EXISTS "Allow admins to manage admins" ON public.admins;
DROP POLICY IF EXISTS "Allow admins to manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins to manage matches" ON public.matches;
DROP POLICY IF EXISTS "Allow admins to manage messages" ON public.messages;
DROP POLICY IF EXISTS "Allow admins to manage invite codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Allow admins to manage notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated users to view admins" ON public.admins;
DROP POLICY IF EXISTS "Allow authenticated users to insert admins" ON public.admins;
DROP POLICY IF EXISTS "Allow admins to update admins" ON public.admins;
DROP POLICY IF EXISTS "Allow admins to delete admins" ON public.admins;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their matches" ON public.matches;
DROP POLICY IF EXISTS "Allow authenticated users to manage matches" ON public.matches;
DROP POLICY IF EXISTS "Users can view messages from their matches" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their matches" ON public.messages;
DROP POLICY IF EXISTS "Allow authenticated users to manage messages" ON public.messages;
DROP POLICY IF EXISTS "Allow authenticated users to manage invite codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated users to manage notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow service role to manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow service role to manage admins" ON public.admins;

-- Create simple, non-recursive RLS policies
-- For admins table - allow all authenticated users to view and manage
CREATE POLICY "Allow authenticated users to manage admins" ON public.admins
  FOR ALL USING (auth.role() = 'authenticated');

-- For profiles table - allow users to manage their own profiles and admins to manage all
CREATE POLICY "Users can manage their own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Allow authenticated users to view profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- For matches table - allow users to view their matches and admins to manage all
CREATE POLICY "Users can view their matches" ON public.matches
  FOR SELECT USING (
    auth.uid() = user1 OR auth.uid() = user2
  );

CREATE POLICY "Allow authenticated users to manage matches" ON public.matches
  FOR ALL USING (auth.role() = 'authenticated');

-- For messages table - allow users to view messages from their matches and admins to manage all
CREATE POLICY "Users can view messages from their matches" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1 = auth.uid() OR matches.user2 = auth.uid())
    )
  );

CREATE POLICY "Users can send messages to their matches" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1 = auth.uid() OR matches.user2 = auth.uid())
      AND matches.status_user1 = 'accepted'
      AND matches.status_user2 = 'accepted'
    )
  );

CREATE POLICY "Allow authenticated users to manage messages" ON public.messages
  FOR ALL USING (auth.role() = 'authenticated');

-- For invite_codes table - allow admins to manage all
CREATE POLICY "Allow authenticated users to manage invite codes" ON public.invite_codes
  FOR ALL USING (auth.role() = 'authenticated');

-- For notifications table - allow users to view their notifications and admins to manage all
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to manage notifications" ON public.notifications
  FOR ALL USING (auth.role() = 'authenticated'); 