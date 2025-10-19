-- Add a default admin user for testing
-- This creates an admin profile and admin record

DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Generate a unique admin user ID
    admin_user_id := gen_random_uuid();

    -- Insert admin profile
    INSERT INTO public.profiles (id, email, full_name, age, gender, bio, photo_url, preferences, role, verified, created_at, updated_at) VALUES
    (
      admin_user_id,
      'admin@halalconnections.com',
      'Admin User',
      30,
      'male',
      'System Administrator for Halal Connections',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      '{
        "location": "Global",
        "madhab": "hanafi",
        "prayer_frequency": "always",
        "marriage_timeline": "not_applicable",
        "profession": "System Administrator",
        "education": "Master in Information Technology",
        "phone": "+1234567890",
        "will_relocate": false,
        "interests": ["Technology", "Islamic Studies", "Community Service"]
      }',
      'admin',
      true,
      now(),
      now()
    );

    -- Insert admin record
    INSERT INTO public.admins (id, role, permissions, created_at) VALUES
    (admin_user_id, 'super_admin', '["manage_users", "manage_matches", "manage_content"]', now())
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Admin user created successfully with ID: %', admin_user_id;
END $$; 