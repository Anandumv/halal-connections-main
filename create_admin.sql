-- Add admin user to the admins table
-- Replace 'your-user-id-here' with the actual user ID from Supabase Auth
INSERT INTO public.admins (id, email, created_at)
VALUES (
  'your-user-id-here', -- Replace with your actual user ID
  'your-email@example.com', -- Replace with your email
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- To find your user ID:
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Authentication > Users
-- 3. Find your user and copy the ID
-- 4. Replace 'your-user-id-here' with that ID
-- 5. Replace 'your-email@example.com' with your email
-- 6. Run this script in the SQL Editor 