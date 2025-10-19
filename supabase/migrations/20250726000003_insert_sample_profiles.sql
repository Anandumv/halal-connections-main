-- Insert demo invite codes
INSERT INTO public.invite_codes (id, code, created_by, is_used, is_active, expires_at, created_at) VALUES
(gen_random_uuid(), 'DEMO001', null, false, true, '2025-12-31', now()),
(gen_random_uuid(), 'DEMO002', null, false, true, '2025-12-31', now()),
(gen_random_uuid(), 'DEMO003', null, false, true, '2025-12-31', now()),
(gen_random_uuid(), 'DEMO004', null, false, true, '2025-12-31', now()),
(gen_random_uuid(), 'DEMO005', null, false, true, '2025-12-31', now());

-- Insert sample profiles (these will be created when users sign up with the demo codes)
-- For now, let's create some sample data that can be used for testing the matching system 