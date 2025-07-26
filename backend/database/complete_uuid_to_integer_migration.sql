-- COMPLETE MIGRATION: Convert ALL tables from UUID to auto-increment integers
-- This script converts every table in the database from UUID-based IDs to integer auto-increment IDs

BEGIN;

-- First, let's list all tables and create the complete migration
-- Drop the entire database and recreate with integer IDs

-- Drop all existing tables (CASCADE will handle dependencies)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Grant usage on schema
GRANT ALL ON SCHEMA public TO estudos_user;

-- Create the complete schema with integer IDs

-- 1. USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (role::text = ANY (ARRAY['student'::character varying, 'instructor'::character varying, 'admin'::character varying]::text[])),
    CONSTRAINT users_status_check CHECK (status::text = ANY (ARRAY['active'::character varying, 'suspended'::character varying, 'pending'::character varying, 'inactive'::character varying]::text[]))
);

-- 2. USER_PROFILES TABLE
CREATE TABLE user_profiles (
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. COURSES TABLE
CREATE TABLE courses (
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

-- 4. COURSE_MODULES TABLE
CREATE TABLE course_modules (
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

-- 5. LESSONS TABLE
CREATE TABLE lessons (
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

-- 6. LESSON_RESOURCES TABLE
CREATE TABLE lesson_resources (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    url VARCHAR(500) NOT NULL,
    size_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- 7. COURSE_RESOURCES TABLE
CREATE TABLE course_resources (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 8. SUBSCRIPTIONS TABLE
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. SUBSCRIPTION_PLANS TABLE
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_months INTEGER NOT NULL,
    features JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. USER_ACTIVITIES TABLE
CREATE TABLE user_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. SYSTEM_SETTINGS TABLE
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. COURSE_ENROLLMENTS TABLE
CREATE TABLE course_enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_percentage DECIMAL(3,1) DEFAULT 0.0,
    UNIQUE(user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 13. LESSON_PROGRESS TABLE
CREATE TABLE lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    watch_time_seconds INTEGER DEFAULT 0,
    UNIQUE(user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- 14. QUESTIONS TABLE
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    course_id INTEGER,
    lesson_id INTEGER,
    created_by INTEGER,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'multiple_choice',
    difficulty VARCHAR(50) DEFAULT 'medium',
    points INTEGER DEFAULT 1,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 15. QUESTION_ALTERNATIVES TABLE
CREATE TABLE question_alternatives (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 16. QUESTION_ATTEMPTS TABLE
CREATE TABLE question_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    selected_alternative_id INTEGER,
    is_correct BOOLEAN DEFAULT false,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (selected_alternative_id) REFERENCES question_alternatives(id) ON DELETE CASCADE
);

-- 17. PAYMENTS TABLE
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 18. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert initial data
-- Insert admin user
INSERT INTO users (email, password_hash, role, status, created_at)
VALUES ('admin@estudos.com', '$argon2id$v=19$m=65536,t=4,p=1$VVB5aUtnVGFLOEJ6dmRjMA$36bheeeem5KAm+OuIjCtyOHfvW5CCHeR8t7vktmp3b4', 'admin', 'active', CURRENT_TIMESTAMP);

-- Insert user profile for admin
INSERT INTO user_profiles (user_id, name, created_at)
VALUES (1, 'Administrador', CURRENT_TIMESTAMP);

-- Insert sample courses with integer IDs
INSERT INTO courses (title, slug, description, category, instructor_id, price, status, visibility, difficulty_level, duration_hours, duration_months, target_audience, certification_available, created_at) VALUES
('Polícia Federal - Agente', 'policia-federal-agente', 'Preparação completa para o concurso de Agente da Polícia Federal', 'Polícia', 1, 199.90, 'published', 'public', 'intermediate', 120, 6, 'Candidatos ao cargo de Agente da Polícia Federal', true, CURRENT_TIMESTAMP),
('Receita Federal - Auditor Fiscal', 'receita-federal-auditor-fiscal', 'Curso completo para Auditor Fiscal da Receita Federal', 'Receita', 1, 299.90, 'published', 'public', 'advanced', 180, 8, 'Candidatos ao cargo de Auditor Fiscal', true, CURRENT_TIMESTAMP),
('TRT/TRF - Analista Judiciário', 'trt-trf-analista-judiciario', 'Preparação para concursos de Analista Judiciário', 'Judiciário', 1, 149.90, 'published', 'public', 'intermediate', 100, 5, 'Candidatos aos cargos de Analista Judiciário', true, CURRENT_TIMESTAMP),
('Banco do Brasil - Escriturário', 'banco-do-brasil-escriturario', 'Curso preparatório para Escriturário do Banco do Brasil', 'Bancário', 1, 99.90, 'published', 'public', 'beginner', 80, 4, 'Candidatos ao cargo de Escriturário', false, CURRENT_TIMESTAMP),
('Professor SEDUC - Matemática', 'professor-seduc-matematica', 'Preparação para Professor de Matemática da SEDUC', 'Educação', 1, 179.90, 'published', 'public', 'intermediate', 140, 6, 'Candidatos ao cargo de Professor de Matemática', true, CURRENT_TIMESTAMP);

-- Create course_resources entries for each course
INSERT INTO course_resources (course_id, created_at)
SELECT id, CURRENT_TIMESTAMP FROM courses;

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX idx_questions_course_id ON questions(course_id);
CREATE INDEX idx_questions_lesson_id ON questions(lesson_id);
CREATE INDEX idx_question_attempts_user_id ON question_attempts(user_id);
CREATE INDEX idx_question_attempts_question_id ON question_attempts(question_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON course_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- Show results
SELECT 'Complete migration successful!' as status;
SELECT 'Users: ' || COUNT(*) as count FROM users;
SELECT 'Courses: ' || COUNT(*) as count FROM courses;
SELECT 'User Profiles: ' || COUNT(*) as count FROM user_profiles;
SELECT 'Course Resources: ' || COUNT(*) as count FROM course_resources;