-- Create admin user with Argon2id hashed password
-- Password: admin123

-- First, delete existing admin if exists
DELETE FROM user_profiles WHERE user_id = '123e4567-e89b-12d3-a456-426614174000';
DELETE FROM user_preferences WHERE user_id = '123e4567-e89b-12d3-a456-426614174000';
DELETE FROM users WHERE id = '123e4567-e89b-12d3-a456-426614174000';

-- Insert admin user
-- The password hash below is for 'admin123' using Argon2id
INSERT INTO users (id, email, password_hash, role, status, email_verified) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'admin@estudos.com', '$argon2id$v=19$m=65536,t=4,p=1$eGlqZU9iUVlPeWJCa1JQWQ$q1zfn8Oq6kW1xrPnvcJQrKQtE/aPRJpXjPR5OXkrYvI', 'admin', 'active', true);

INSERT INTO user_profiles (user_id, name) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'Administrador');

INSERT INTO user_preferences (user_id) VALUES
('123e4567-e89b-12d3-a456-426614174000');

-- Create VIP subscription for admin
INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
SELECT '123e4567-e89b-12d3-a456-426614174000', id, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days'
FROM subscription_plans
WHERE slug = 'vip'
LIMIT 1;