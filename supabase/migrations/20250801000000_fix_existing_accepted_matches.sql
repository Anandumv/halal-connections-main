-- Fix any existing matches that were created with both statuses as 'accepted'
-- This ensures the two-step matching process is enforced for all matches

-- First, let's see what matches exist with both statuses as 'accepted'
-- This will help us understand if there are any problematic matches

-- Update any matches where both users are marked as 'accepted' to reset them to 'pending'
-- This ensures users must go through the proper accept/reject process
UPDATE public.matches 
SET 
  status_user1 = 'pending',
  status_user2 = 'pending'
WHERE 
  status_user1 = 'accepted' 
  AND status_user2 = 'accepted'
  AND created_at > NOW() - INTERVAL '7 days'; -- Only fix recent matches to avoid affecting old data

-- Add a comment to track this migration
COMMENT ON TABLE public.matches IS 'Matches table with enforced two-step acceptance process. Both users must explicitly accept before chat is enabled.'; 