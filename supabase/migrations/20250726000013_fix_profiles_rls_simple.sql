-- Simplify profiles RLS policies to avoid recursion
-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Create simple policies that don't cause recursion
-- Allow users to manage their own profile
CREATE POLICY "Users can manage their own profile" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow authenticated users to view all profiles (for browsing)
CREATE POLICY "Allow authenticated users to view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow service role to manage all profiles (for admin operations)
CREATE POLICY "Allow service role to manage profiles" 
ON public.profiles 
FOR ALL 
USING (auth.role() = 'service_role'); 