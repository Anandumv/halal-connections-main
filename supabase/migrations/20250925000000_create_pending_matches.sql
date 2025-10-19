-- Create pending_matches table for AI-suggested matches requiring admin approval
CREATE TABLE IF NOT EXISTS public.pending_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  compatibility_score DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  ai_reasoning TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure user1 < user2 to prevent duplicates
  CONSTRAINT pending_matches_user_order CHECK (user1 < user2),
  
  -- Prevent duplicate pending matches
  CONSTRAINT unique_pending_match UNIQUE (user1, user2)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pending_matches_status ON public.pending_matches(status);
CREATE INDEX IF NOT EXISTS idx_pending_matches_created_at ON public.pending_matches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pending_matches_compatibility ON public.pending_matches(compatibility_score DESC);

-- Add RLS policies
ALTER TABLE public.pending_matches ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all pending matches
CREATE POLICY "Allow admins to view pending matches" ON public.pending_matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

-- Allow admins to insert pending matches
CREATE POLICY "Allow admins to insert pending matches" ON public.pending_matches
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

-- Allow admins to update pending matches (approve/reject)
CREATE POLICY "Allow admins to update pending matches" ON public.pending_matches
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

-- Allow admins to delete pending matches
CREATE POLICY "Allow admins to delete pending matches" ON public.pending_matches
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
    )
  );

-- Add comments for documentation
COMMENT ON TABLE public.pending_matches IS 'AI-suggested matches awaiting admin approval';
COMMENT ON COLUMN public.pending_matches.compatibility_score IS 'AI-calculated compatibility score (0.00 to 1.00)';
COMMENT ON COLUMN public.pending_matches.ai_reasoning IS 'AI-generated reasoning for the match suggestion';
COMMENT ON COLUMN public.pending_matches.status IS 'Approval status: pending, approved, rejected';
COMMENT ON COLUMN public.pending_matches.admin_notes IS 'Admin notes when approving or rejecting the match';
