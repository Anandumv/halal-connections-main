-- Check if you are an admin
SELECT 
  id,
  email,
  created_at
FROM public.admins 
WHERE id = 'your-user-id-here'; -- Replace with your actual user ID

-- If no results, add yourself as admin:
-- INSERT INTO public.admins (id, email, created_at)
-- VALUES (
--   'your-user-id-here', -- Replace with your actual user ID
--   'your-email@example.com', -- Replace with your email
--   NOW()
-- );

-- To find your user ID:
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Authentication > Users
-- 3. Find your user and copy the ID
-- 4. Replace 'your-user-id-here' with that ID
-- 5. Run this script in the SQL Editor

-- After adding yourself as admin:
-- 1. Sign out of the app
-- 2. Sign back in
-- 3. You should be redirected to /admin 