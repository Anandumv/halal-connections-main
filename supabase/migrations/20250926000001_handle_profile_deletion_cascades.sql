-- Handle cascading deletes when profiles are deleted
-- This ensures related data is properly cleaned up

-- Update matches table to cascade delete when profiles are deleted
ALTER TABLE public.matches 
DROP CONSTRAINT IF EXISTS matches_user1_fkey,
DROP CONSTRAINT IF EXISTS matches_user2_fkey;

ALTER TABLE public.matches 
ADD CONSTRAINT matches_user1_fkey 
FOREIGN KEY (user1) REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT matches_user2_fkey 
FOREIGN KEY (user2) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update pending_matches table to cascade delete when profiles are deleted
ALTER TABLE public.pending_matches 
DROP CONSTRAINT IF EXISTS pending_matches_user1_fkey,
DROP CONSTRAINT IF EXISTS pending_matches_user2_fkey;

ALTER TABLE public.pending_matches 
ADD CONSTRAINT pending_matches_user1_fkey 
FOREIGN KEY (user1) REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT pending_matches_user2_fkey 
FOREIGN KEY (user2) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update messages table to cascade delete when profiles are deleted
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update notifications table to cascade delete when profiles are deleted
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update invite_codes table to cascade delete when profiles are deleted
-- Note: Only created_by can have foreign key constraint since used_by is text type
ALTER TABLE public.invite_codes 
DROP CONSTRAINT IF EXISTS invite_codes_created_by_fkey;

ALTER TABLE public.invite_codes 
ADD CONSTRAINT invite_codes_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- used_by is text type and cannot have foreign key constraint to uuid
-- This will be handled in a separate migration
