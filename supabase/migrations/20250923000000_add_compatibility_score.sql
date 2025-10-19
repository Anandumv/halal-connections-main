-- Add compatibility_score column to matches table
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS compatibility_score DECIMAL(3,2) DEFAULT 0.00;

-- Add index for better performance when sorting by compatibility
CREATE INDEX IF NOT EXISTS idx_matches_compatibility_score ON public.matches(compatibility_score DESC);

-- Add comment for documentation
COMMENT ON COLUMN public.matches.compatibility_score IS 'Compatibility score between 0.00 and 1.00 based on preferences matching';
