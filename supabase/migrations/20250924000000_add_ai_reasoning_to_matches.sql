-- Add AI reasoning column to matches table
ALTER TABLE public.matches
ADD COLUMN ai_reasoning TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.matches.ai_reasoning IS 'AI-generated reasoning for match compatibility';
