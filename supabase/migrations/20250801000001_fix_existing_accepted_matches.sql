-- Fix any existing matches that were created with both statuses as 'accepted'
-- This ensures the two-step matching process is enforced for all matches

-- Update any matches where both users are marked as 'accepted' to reset them to 'pending'
-- This ensures users must go through the proper accept/reject process
UPDATE public.matches 
SET 
  status_user1 = 'pending',
  status_user2 = 'pending'
WHERE 
  status_user1 = 'accepted' 
  AND status_user2 = 'accepted';

-- Add a comment to track this migration
COMMENT ON TABLE public.matches IS 'Matches table with enforced two-step acceptance process. Both users must explicitly accept before chat is enabled.'; 