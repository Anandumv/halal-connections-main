-- Fix foreign key constraint issues for invite_codes table
-- Handle the type mismatch between used_by (text) and profiles.id (uuid)

-- Drop existing foreign key constraints for invite_codes
ALTER TABLE public.invite_codes 
DROP CONSTRAINT IF EXISTS invite_codes_created_by_fkey,
DROP CONSTRAINT IF EXISTS invite_codes_used_by_fkey;

-- Add foreign key for created_by only (assuming it's uuid type)
-- Skip used_by foreign key since it's text type and can't reference uuid
ALTER TABLE public.invite_codes 
ADD CONSTRAINT invite_codes_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- For used_by, since it's text type and profiles.id is uuid,
-- we can't create a foreign key constraint
-- Instead, we'll rely on application-level validation
-- and add a comment explaining this limitation

COMMENT ON COLUMN public.invite_codes.used_by IS 'User ID who used the invite code (text type, no foreign key constraint due to type mismatch)';
COMMENT ON COLUMN public.invite_codes.created_by IS 'User ID who created the invite code (uuid type, has foreign key constraint)';
