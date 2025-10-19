-- Add more invite codes for THE BEE HIVE platform
INSERT INTO invite_codes (code, created_by, expires_at, is_active) VALUES
  ('BEEHIVE2', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('BEEHIVE3', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('BEEHIVE4', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('BEEHIVE5', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('MATCH2', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('MATCH3', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('MATCH4', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('MATCH5', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('WELCOME2', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('WELCOME3', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('WELCOME4', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('WELCOME5', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('FAMILY1', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('FAMILY2', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('FAMILY3', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('HALAL1', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('HALAL2', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('HALAL3', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('ISLAM1', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('ISLAM2', NULL, NOW() + INTERVAL '1 year', TRUE),
  ('ISLAM3', NULL, NOW() + INTERVAL '1 year', TRUE)
ON CONFLICT (code) DO NOTHING; 