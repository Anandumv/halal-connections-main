-- Create matches table for admin-controlled matching
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1 uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2 uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status_user1 text DEFAULT 'pending' CHECK (status_user1 IN ('pending', 'accepted', 'rejected')),
  status_user2 text DEFAULT 'pending' CHECK (status_user2 IN ('pending', 'accepted', 'rejected')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Ensure unique matches between users
  UNIQUE(user1, user2),
  -- Ensure user1 is always the smaller ID to prevent duplicate matches
  CHECK (user1 < user2)
);

-- Update matches table structure if needed
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS status_user1 text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS status_user2 text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add constraints if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'matches_status_user1_check') THEN
    ALTER TABLE public.matches ADD CONSTRAINT matches_status_user1_check 
    CHECK (status_user1 IN ('pending', 'accepted', 'rejected'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'matches_status_user2_check') THEN
    ALTER TABLE public.matches ADD CONSTRAINT matches_status_user2_check 
    CHECK (status_user2 IN ('pending', 'accepted', 'rejected'));
  END IF;
END $$;

-- Enable RLS on matches if not already enabled
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;
DROP POLICY IF EXISTS "Admins can manage all matches" ON public.matches;

-- Create policies for matches
CREATE POLICY "Users can view their own matches" 
ON public.matches 
FOR SELECT 
USING (auth.uid() = user1 OR auth.uid() = user2);

CREATE POLICY "Admins can manage all matches" 
ON public.matches 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid()
  )
);

-- Create trigger for updated_at if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_matches_updated_at') THEN
    CREATE TRIGGER update_matches_updated_at
      BEFORE UPDATE ON public.matches
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$; 