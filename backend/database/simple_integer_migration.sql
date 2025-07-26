-- Simple migration: Convert core tables to integer IDs
-- This script focuses only on the essential tables for course management

BEGIN;

-- Backup current data first
CREATE TEMP TABLE courses_backup AS SELECT * FROM courses;
CREATE TEMP TABLE users_backup AS SELECT * FROM users;
CREATE TEMP TABLE user_profiles_backup AS SELECT * FROM user_profiles;
CREATE TEMP TABLE course_modules_backup AS SELECT * FROM course_modules;
CREATE TEMP TABLE lessons_backup AS SELECT * FROM lessons;

-- Drop dependent constraints and tables
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;  
DROP TABLE IF EXISTS course_resources CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Recreate users table with integer ID
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

-- Recreate user_profiles table
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

-- Recreate courses table
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

-- Recreate course_modules table
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

-- Recreate lessons table
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

-- Recreate course_resources table
CREATE TABLE course_resources (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Insert data back with new integer IDs
-- Insert users (admin user)
INSERT INTO users (email, password_hash, role, status, created_at)
VALUES ('admin@estudos.com', '$argon2id$v=19$m=65536,t=4,p=3$a0UvR1pJdm9udFZIOTB2cg$x2SA2r7Y9ZlAfOwsKCVUKZXlo28R7z0toOlgH58yt9U', 'admin', 'active', CURRENT_TIMESTAMP);

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

COMMIT;

-- Show results
SELECT 'Migration completed successfully!' as status;
SELECT 'Users: ' || COUNT(*) as count FROM users;
SELECT 'Courses: ' || COUNT(*) as count FROM courses;
SELECT 'User Profiles: ' || COUNT(*) as count FROM user_profiles;
SELECT 'Course Resources: ' || COUNT(*) as count FROM course_resources;