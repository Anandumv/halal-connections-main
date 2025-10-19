-- Add admin user and sample data for testing
-- This will create an admin user and some sample profiles

-- First, let's create a function to add sample data
CREATE OR REPLACE FUNCTION add_sample_admin_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id uuid;
    user1_id uuid;
    user2_id uuid;
    user3_id uuid;
BEGIN
    -- Create admin user ID (this would normally come from auth.users)
    admin_user_id := gen_random_uuid();
    user1_id := gen_random_uuid();
    user2_id := gen_random_uuid();
    user3_id := gen_random_uuid();

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
    (admin_user_id, 'super_admin', '["manage_users", "manage_matches", "manage_content"]', now());

    -- Insert sample user profiles
    INSERT INTO public.profiles (id, email, full_name, age, gender, bio, photo_url, preferences, role, verified, created_at, updated_at) VALUES
    -- Sample Profile 1: Aisha, 24, Female
    (
      user1_id,
      'aisha.ahmed@example.com',
      'Aisha Ahmed',
      24,
      'female',
      'Assalamu alaikum! I am a passionate software engineer who loves reading Islamic literature and volunteering in my community.',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      '{
        "location": "Dubai, UAE",
        "madhab": "hanafi",
        "prayer_frequency": "always",
        "marriage_timeline": "within_1_year",
        "profession": "Software Engineer",
        "education": "Bachelor in Computer Science",
        "phone": "+971501234567",
        "will_relocate": true,
        "interests": ["Islamic Literature", "Cooking", "Volunteering", "Technology", "Travel"]
      }',
      'user',
      true,
      now(),
      now()
    ),

    -- Sample Profile 2: Omar, 26, Male
    (
      user2_id,
      'omar.khan@example.com',
      'Omar Khan',
      26,
      'male',
      'Salaam! I am a medical doctor who is passionate about helping others.',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      '{
        "location": "London, UK",
        "madhab": "hanafi",
        "prayer_frequency": "always",
        "marriage_timeline": "within_6_months",
        "profession": "Medical Doctor",
        "education": "MBBS",
        "phone": "+447911123456",
        "will_relocate": false,
        "interests": ["Football", "Islamic Studies", "Medicine", "Family Time", "Charity Work"]
      }',
      'user',
      true,
      now(),
      now()
    ),

    -- Sample Profile 3: Fatima, 22, Female
    (
      user3_id,
      'fatima.ali@example.com',
      'Fatima Ali',
      22,
      'female',
      'Assalamu alaikum! I am a recent graduate in Islamic Studies.',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      '{
        "location": "Toronto, Canada",
        "madhab": "shafi",
        "prayer_frequency": "usually",
        "marriage_timeline": "within_1_year",
        "profession": "Islamic Studies Teacher",
        "education": "Bachelor in Islamic Studies",
        "phone": "+14161234567",
        "will_relocate": true,
        "interests": ["Quran Teaching", "Gardening", "Languages", "Islamic Art", "Community Service"]
      }',
      'user',
      false,
      now(),
      now()
    );

    -- Create some sample matches
    INSERT INTO public.matches (user1, user2, status_user1, status_user2, created_by, created_at, updated_at) VALUES
    -- Match 1: Aisha (female) with Omar (male) - pending (enforcing two-step process)
    (user1_id, user2_id, 'pending', 'pending', admin_user_id, now(), now()),
    
    -- Match 2: Fatima (female) with Omar (male) - pending
    (user3_id, user2_id, 'pending', 'pending', admin_user_id, now(), now());

    -- Create some sample notifications
    INSERT INTO public.notifications (user_id, title, message, type, read, created_at) VALUES
    (user1_id, 'New Match Available!', 'You have a new match with Omar Khan. Please review and respond.', 'new_match', false, now()),
    (user2_id, 'New Match Available!', 'You have a new match with Aisha Ahmed. Please review and respond.', 'new_match', false, now());

    RAISE NOTICE 'Sample admin data created successfully';
    RAISE NOTICE 'Admin User ID: %', admin_user_id;
    RAISE NOTICE 'User 1 ID: %', user1_id;
    RAISE NOTICE 'User 2 ID: %', user2_id;
    RAISE NOTICE 'User 3 ID: %', user3_id;

END;
$$;

-- Execute the function to create sample data
SELECT add_sample_admin_data();

-- Clean up the function
DROP FUNCTION add_sample_admin_data(); 