-- Migration: Convert all UUID primary keys to auto-increment integers
-- This script converts the database from UUID-based IDs to integer auto-increment IDs

BEGIN;

-- Drop all foreign key constraints first
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_instructor_id_fkey;
ALTER TABLE course_modules DROP CONSTRAINT IF EXISTS course_modules_course_id_fkey;
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_module_id_fkey;
ALTER TABLE course_resources DROP CONSTRAINT IF EXISTS course_resources_course_id_fkey;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE user_activities DROP CONSTRAINT IF EXISTS user_activities_user_id_fkey;

-- Create mapping tables to store old UUID to new integer mappings
CREATE TEMP TABLE user_id_mapping (
    old_uuid UUID,
    new_id INTEGER
);

CREATE TEMP TABLE course_id_mapping (
    old_uuid UUID,
    new_id INTEGER
);

CREATE TEMP TABLE module_id_mapping (
    old_uuid UUID,
    new_id INTEGER
);

CREATE TEMP TABLE lesson_id_mapping (
    old_uuid UUID,
    new_id INTEGER
);

-- 1. USERS TABLE
-- Create new users table with integer IDs
CREATE TABLE users_new (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data and populate mapping
INSERT INTO users_new (email, password_hash, role, is_active, created_at, updated_at)
SELECT email, password_hash, role, is_active, created_at, updated_at
FROM users
ORDER BY created_at;

-- Store the mapping
INSERT INTO user_id_mapping (old_uuid, new_id)
SELECT u.id, un.id
FROM users u
JOIN users_new un ON u.email = un.email;

-- 2. USER_PROFILES TABLE
CREATE TABLE user_profiles_new (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data with new user IDs
INSERT INTO user_profiles_new (user_id, name, bio, avatar_url, phone, birth_date, address, city, state, country, created_at, updated_at)
SELECT m.new_id, up.name, up.bio, up.avatar_url, up.phone, up.birth_date, up.address, up.city, up.state, up.country, up.created_at, up.updated_at
FROM user_profiles up
JOIN user_id_mapping m ON up.user_id = m.old_uuid;

-- 3. COURSES TABLE
CREATE TABLE courses_new (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- Copy data with new instructor IDs
INSERT INTO courses_new (title, slug, description, category, instructor_id, thumbnail_url, thumbnail_file_path, preview_video_url, price, status, visibility, difficulty_level, duration_hours, duration_months, language, requirements, objectives, target_audience, certification_available, total_enrollments, average_rating, created_at, updated_at, published_at)
SELECT c.title, c.slug, c.description, c.category, m.new_id, c.thumbnail_url, c.thumbnail_file_path, c.preview_video_url, c.price, c.status, c.visibility, c.difficulty_level, c.duration_hours, c.duration_months, c.language, c.requirements, c.objectives, c.target_audience, c.certification_available, c.total_enrollments, c.average_rating, c.created_at, c.updated_at, c.published_at
FROM courses c
JOIN user_id_mapping m ON c.instructor_id = m.old_uuid
ORDER BY c.created_at;

-- Store course mapping
INSERT INTO course_id_mapping (old_uuid, new_id)
SELECT c.id, cn.id
FROM courses c
JOIN courses_new cn ON c.slug = cn.slug;

-- 4. COURSE_MODULES TABLE
CREATE TABLE course_modules_new (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data with new course IDs
INSERT INTO course_modules_new (course_id, title, description, order_index, is_published, created_at, updated_at)
SELECT cm_map.new_id, cm.title, cm.description, cm.order_index, cm.is_published, cm.created_at, cm.updated_at
FROM course_modules cm
JOIN course_id_mapping cm_map ON cm.course_id = cm_map.old_uuid
ORDER BY cm.created_at;

-- Store module mapping
INSERT INTO module_id_mapping (old_uuid, new_id)
SELECT cm.id, cmn.id
FROM course_modules cm
JOIN course_modules_new cmn ON cmn.course_id = (SELECT new_id FROM course_id_mapping WHERE old_uuid = cm.course_id)
    AND cmn.title = cm.title AND cmn.order_index = cm.order_index;

-- 5. LESSONS TABLE
CREATE TABLE lessons_new (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data with new module IDs
INSERT INTO lessons_new (module_id, title, description, type, order_index, duration_minutes, video_url, content, is_published, is_free, created_at, updated_at)
SELECT m_map.new_id, l.title, l.description, l.type, l.order_index, l.duration_minutes, l.video_url, l.content, l.is_published, l.is_free, l.created_at, l.updated_at
FROM lessons l
JOIN module_id_mapping m_map ON l.module_id = m_map.old_uuid
ORDER BY l.created_at;

-- Store lesson mapping
INSERT INTO lesson_id_mapping (old_uuid, new_id)
SELECT l.id, ln.id
FROM lessons l
JOIN lessons_new ln ON ln.module_id = (SELECT new_id FROM module_id_mapping WHERE old_uuid = l.module_id)
    AND ln.title = l.title AND ln.order_index = l.order_index;

-- 6. COURSE_RESOURCES TABLE
CREATE TABLE course_resources_new (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data with new course IDs
INSERT INTO course_resources_new (course_id, created_at, updated_at)
SELECT c_map.new_id, cr.created_at, cr.updated_at
FROM course_resources cr
JOIN course_id_mapping c_map ON cr.course_id = c_map.old_uuid;

-- 7. SUBSCRIPTIONS TABLE
CREATE TABLE subscriptions_new (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data with new user IDs
INSERT INTO subscriptions_new (user_id, plan, status, starts_at, ends_at, created_at, updated_at)
SELECT u_map.new_id, s.plan, s.status, s.starts_at, s.ends_at, s.created_at, s.updated_at
FROM subscriptions s
JOIN user_id_mapping u_map ON s.user_id = u_map.old_uuid;

-- 8. USER_ACTIVITIES TABLE
CREATE TABLE user_activities_new (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data with new user IDs
INSERT INTO user_activities_new (user_id, activity_type, activity_data, created_at)
SELECT u_map.new_id, ua.activity_type, ua.activity_data, ua.created_at
FROM user_activities ua
JOIN user_id_mapping u_map ON ua.user_id = u_map.old_uuid;

-- 9. SYSTEM_SETTINGS TABLE (no foreign keys, just change primary key)
CREATE TABLE system_settings_new (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data
INSERT INTO system_settings_new (setting_key, setting_value, description, created_at, updated_at)
SELECT setting_key, setting_value, description, created_at, updated_at
FROM system_settings;

-- Drop old tables and rename new ones
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS course_resources CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

ALTER TABLE users_new RENAME TO users;
ALTER TABLE user_profiles_new RENAME TO user_profiles;
ALTER TABLE courses_new RENAME TO courses;
ALTER TABLE course_modules_new RENAME TO course_modules;
ALTER TABLE lessons_new RENAME TO lessons;
ALTER TABLE course_resources_new RENAME TO course_resources;
ALTER TABLE subscriptions_new RENAME TO subscriptions;
ALTER TABLE user_activities_new RENAME TO user_activities;
ALTER TABLE system_settings_new RENAME TO system_settings;

-- Recreate foreign key constraints
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE courses ADD CONSTRAINT courses_instructor_id_fkey 
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE course_modules ADD CONSTRAINT course_modules_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

ALTER TABLE lessons ADD CONSTRAINT lessons_module_id_fkey 
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE;

ALTER TABLE course_resources ADD CONSTRAINT course_resources_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_activities ADD CONSTRAINT user_activities_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);

COMMIT;

-- Display final results
SELECT 'Migration completed successfully' as status;
SELECT 'Users count: ' || COUNT(*) as result FROM users;
SELECT 'Courses count: ' || COUNT(*) as result FROM courses;
SELECT 'Course modules count: ' || COUNT(*) as result FROM course_modules;
SELECT 'Lessons count: ' || COUNT(*) as result FROM lessons;