-- Add current user as admin
-- Replace 'your-email@example.com' with your actual email

INSERT INTO public.admins (id, email, created_at)
VALUES (
    '603e9447-de1f-4dfb-892e-58997ff9e86c',
    'your-email@example.com',  -- Replace with your actual email
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

-- Verify the insertion
SELECT * FROM public.admins WHERE id = '603e9447-de1f-4dfb-892e-58997ff9e86c'; 