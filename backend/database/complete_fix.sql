-- Complete fix for StudyPro database
-- This creates all missing tables with integer IDs

-- Create missing tables
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    birth_date DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Brasil',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    billing_period VARCHAR(20) NOT NULL,
    features JSONB NOT NULL,
    max_courses INTEGER,
    max_questions_per_day INTEGER,
    max_flashcards_per_day INTEGER,
    has_offline_access BOOLEAN DEFAULT FALSE,
    has_priority_support BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    instructor_id INTEGER NOT NULL,
    thumbnail_url VARCHAR(500),
    thumbnail_file_path VARCHAR(500),
    preview_video_url VARCHAR(500),
    price DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'draft',
    visibility VARCHAR(50) DEFAULT 'public',
    difficulty_level VARCHAR(50) DEFAULT 'beginner',
    duration_hours INTEGER,
    duration_months INTEGER,
    language VARCHAR(10) DEFAULT 'pt-BR',
    requirements TEXT,
    objectives TEXT,
    target_audience TEXT,
    certification_available BOOLEAN DEFAULT false,
    total_enrollments INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'video',
    order_index INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER,
    video_url VARCHAR(500),
    content TEXT,
    is_published BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_resources (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    videos_count INTEGER DEFAULT 0,
    questions_count INTEGER DEFAULT 0,
    flashcards_count INTEGER DEFAULT 0,
    summaries_count INTEGER DEFAULT 0,
    laws_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'pt-BR',
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    study_reminder_time TIME,
    daily_goal_minutes INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id)
);

-- Fix subscriptions table foreign key
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_id_fkey;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_id INTEGER;

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS remember_token VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, description, price, billing_period, features, max_courses, max_questions_per_day, max_flashcards_per_day, has_offline_access, has_priority_support) VALUES
('Básico', 'basico', 'Plano básico com recursos essenciais', 0.00, 'monthly', '{"basic_features": true}', 1, 50, 20, false, false),
('Premium', 'premium', 'Plano premium com recursos avançados', 49.90, 'monthly', '{"all_features": true}', 10, 500, 100, true, false),
('VIP', 'vip', 'Plano VIP com todos os recursos', 99.90, 'monthly', '{"all_features": true, "priority_support": true}', -1, -1, -1, true, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert admin user with correct password hash
-- Password: Admin@123
INSERT INTO users (email, password, role, status, name, created_at, updated_at) VALUES
('admin@studypro.com', '$2y$10$vYcOXi0RFWY72EvHH7aLNuJXqT5lEFn3eiXn6zQFLGEXfOSxvTGhq', 'admin', 'active', 'Administrador', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO UPDATE SET 
    password = '$2y$10$vYcOXi0RFWY72EvHH7aLNuJXqT5lEFn3eiXn6zQFLGEXfOSxvTGhq',
    role = 'admin',
    status = 'active';

-- Get admin user id
DO $$
DECLARE
    admin_id INTEGER;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@studypro.com';
    
    -- Insert user profile for admin
    INSERT INTO user_profiles (user_id, name) VALUES (admin_id, 'Administrador')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Insert user preferences for admin
    INSERT INTO user_preferences (user_id) VALUES (admin_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Insert basic subscription for admin
    INSERT INTO subscriptions (user_id, plan_id, status, started_at, expires_at)
    SELECT admin_id, sp.id, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 year'
    FROM subscription_plans sp WHERE sp.slug = 'vip'
    ON CONFLICT DO NOTHING;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_slug ON subscription_plans(slug);