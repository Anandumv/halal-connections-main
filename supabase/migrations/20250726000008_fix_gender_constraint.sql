-- Fix gender constraint issue by ensuring all gender values are lowercase
-- First, update any existing uppercase gender values to lowercase
UPDATE public.profiles 
SET gender = LOWER(gender) 
WHERE gender IS NOT NULL AND gender != LOWER(gender);

-- Add a check constraint to ensure future gender values are lowercase
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_gender_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_gender_check 
CHECK (gender IS NULL OR gender IN ('male', 'female'));

-- Create a trigger to automatically convert gender to lowercase on insert/update
CREATE OR REPLACE FUNCTION public.normalize_gender()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.gender IS NOT NULL THEN
    NEW.gender := LOWER(NEW.gender);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS normalize_gender_trigger ON public.profiles;

-- Create trigger to normalize gender before insert/update
CREATE TRIGGER normalize_gender_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_gender(); 