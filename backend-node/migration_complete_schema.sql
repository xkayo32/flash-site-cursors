-- =============================================================================
-- MIGRAÇÃO COMPLETA DE DADOS JSON PARA POSTGRESQL
-- Sistema StudyPro - Backend Node.js
-- Data: 2025-08-18
-- =============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- 1. TABELA CATEGORIES (categories.json)
-- =============================================================================
DROP TABLE IF EXISTS categories CASCADE;
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY, -- Preservar IDs originais como "1", "1.1", etc.
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- subject, topic, exam_board, year
    description TEXT,
    parent_id VARCHAR(50) REFERENCES categories(id) ON DELETE CASCADE,
    content_count JSONB DEFAULT '{"questions": 0, "flashcards": 0, "summaries": 0, "courses": 0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 2. TABELA FLASHCARDS (flashcards.json) - TODOS OS 7 TIPOS
-- =============================================================================
DROP TABLE IF EXISTS flashcards CASCADE;
CREATE TABLE flashcards (
    id VARCHAR(100) PRIMARY KEY, -- Preservar IDs originais como "fc1", "fc_123456789_xxx"
    type VARCHAR(50) NOT NULL CHECK (type IN ('basic', 'basic_reversed', 'cloze', 'multiple_choice', 'true_false', 'type_answer', 'image_occlusion')),
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    tags JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    
    -- Campos básicos (type: basic)
    front TEXT,
    back TEXT,
    
    -- Campos básicos invertidos (type: basic_reversed)
    extra TEXT,
    
    -- Campos cloze (type: cloze)
    text TEXT,
    
    -- Campos múltipla escolha (type: multiple_choice)
    question TEXT,
    options JSONB, -- Array de opções
    correct INTEGER, -- Índice da resposta correta
    explanation TEXT,
    
    -- Campos verdadeiro/falso (type: true_false)
    statement TEXT,
    answer VARCHAR(10), -- 'true' ou 'false'
    
    -- Campos digite resposta (type: type_answer)
    hint TEXT,
    
    -- Campos oclusão de imagem (type: image_occlusion)
    image VARCHAR(500),
    occlusion_areas JSONB DEFAULT '[]',
    
    -- Algoritmo SM-2 para repetição espaçada
    times_studied INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    correct_rate DECIMAL(5,2) DEFAULT 0.0,
    ease_factor DECIMAL(3,2) DEFAULT 2.5,
    interval INTEGER DEFAULT 0,
    next_review TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadados
    author_id VARCHAR(50) NOT NULL,
    author_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 3. ATUALIZAR TABELA USERS (users.json) - Preservar dados existentes
-- =============================================================================
-- Nota: A tabela users já existe, vamos apenas adicionar campos faltantes
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- =============================================================================
-- 4. ATUALIZAR TABELA COURSES (courses.json) - Adicionar campos faltantes
-- =============================================================================
-- Nota: A tabela courses já existe, vamos adicionar campos para manter compatibilidade
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS instructor JSONB, -- Objeto com id, name, rank, avatar
ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS objectives JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{"enrollments": 0, "rating": 0, "modules": 0, "lessons": 0}',
ADD COLUMN IF NOT EXISTS visibility VARCHAR(50) DEFAULT 'public',
ADD COLUMN IF NOT EXISTS certification_available BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS duration_months INTEGER DEFAULT 1;

-- =============================================================================
-- 5. TABELA MODULES (modules.json)
-- =============================================================================
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 6. ATUALIZAR TABELA LESSONS (lessons.json)
-- =============================================================================
-- Nota: A tabela lessons já existe, vamos adicionar campos necessários
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'video',
ADD COLUMN IF NOT EXISTS video_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT FALSE;

-- =============================================================================
-- 7. TABELA SUMMARIES (summaries.json)
-- =============================================================================
DROP TABLE IF EXISTS summaries CASCADE;
CREATE TABLE summaries (
    id VARCHAR(100) PRIMARY KEY, -- Preservar IDs como "sm_1754975225142_468"
    title VARCHAR(500) NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    summary_type VARCHAR(50) DEFAULT 'text',
    difficulty VARCHAR(50) DEFAULT 'basic',
    estimated_reading_time INTEGER DEFAULT 5,
    tags JSONB DEFAULT '[]',
    sections JSONB DEFAULT '[]',
    ref_sources JSONB DEFAULT '[]',
    visibility VARCHAR(50) DEFAULT 'public',
    shared_with JSONB DEFAULT '[]',
    statistics JSONB DEFAULT '{"views": 0, "likes": 0, "shares": 0, "study_sessions": 0, "average_rating": 0, "total_ratings": 0}',
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- 8. TABELA PREVIOUS_EXAMS (previousexams.json)
-- =============================================================================
DROP TABLE IF EXISTS previous_exams CASCADE;
CREATE TABLE previous_exams (
    id VARCHAR(50) PRIMARY KEY, -- Preservar IDs como "pe1", "pe2"
    title VARCHAR(500) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    exam_board VARCHAR(100) NOT NULL,
    position VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    total_questions INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 9. TABELA LEGISLATION (legislation.json) - Estrutura Complexa
-- =============================================================================
DROP TABLE IF EXISTS legislation CASCADE;
CREATE TABLE legislation (
    id VARCHAR(50) PRIMARY KEY, -- Como "cf88", "cp1940"
    title VARCHAR(500) NOT NULL,
    type VARCHAR(100) NOT NULL, -- Constitution, Law, Decree, etc.
    category VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'vigente', -- vigente, revogado, alterado
    authority VARCHAR(255), -- Órgão que promulgou
    description TEXT,
    chapters JSONB DEFAULT '[]', -- Estrutura hierárquica completa
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 10. TABELA ENROLLMENTS (enrollments.json)
-- =============================================================================
CREATE TABLE IF NOT EXISTS enrollments_json (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, completed, cancelled
    progress JSONB DEFAULT '{"percentage": 0, "completed_modules": [], "completed_lessons": [], "last_accessed": null}',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP WITH TIME ZONE,
    certificate_issued BOOLEAN DEFAULT FALSE,
    tactical_notes JSONB DEFAULT '[]',
    UNIQUE(user_id, course_id)
);

-- =============================================================================
-- 11. TABELA PROFILES (profiles.json)
-- =============================================================================
DROP TABLE IF EXISTS user_profiles_json CASCADE;
CREATE TABLE user_profiles_json (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    bio TEXT,
    avatar VARCHAR(500),
    role VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 12. TABELA SETTINGS (settings.json)
-- =============================================================================
DROP TABLE IF EXISTS system_settings_json CASCADE;
CREATE TABLE system_settings_json (
    id SERIAL PRIMARY KEY,
    section VARCHAR(100) NOT NULL, -- general, company, brand, social
    key VARCHAR(100) NOT NULL,
    value TEXT,
    data_type VARCHAR(50) DEFAULT 'string', -- string, boolean, number, json
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(section, key)
);

-- =============================================================================
-- 13. TABELA SCHEDULE (schedule.json) - Estrutura Complexa
-- =============================================================================
DROP TABLE IF EXISTS schedule_tasks CASCADE;
CREATE TABLE schedule_tasks (
    id VARCHAR(100) PRIMARY KEY, -- Como "task_1755049875236_810"
    user_id VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- review, practice, study, exam
    priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, cancelled
    date DATE NOT NULL,
    time TIME,
    duration INTEGER DEFAULT 60, -- em minutos
    subject VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

DROP TABLE IF EXISTS schedule_events CASCADE;
CREATE TABLE schedule_events (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type VARCHAR(50), -- lesson, exam, meeting
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    all_day BOOLEAN DEFAULT FALSE,
    color VARCHAR(20),
    course_id VARCHAR(100),
    exam_id VARCHAR(100),
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS schedule_study_sessions CASCADE;
CREATE TABLE schedule_study_sessions (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration INTEGER, -- em minutos
    subject VARCHAR(255),
    type VARCHAR(50), -- module, simulation, review
    course_id VARCHAR(100),
    module_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    score DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

DROP TABLE IF EXISTS schedule_daily_goals CASCADE;
CREATE TABLE schedule_daily_goals (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    study_hours_target DECIMAL(4,2) DEFAULT 0,
    study_hours_completed DECIMAL(4,2) DEFAULT 0,
    tasks_target INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    questions_target INTEGER DEFAULT 0,
    questions_completed INTEGER DEFAULT 0,
    flashcards_target INTEGER DEFAULT 0,
    flashcards_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- =============================================================================
-- 14. TABELAS AUXILIARES COMPLEMENTARES
-- =============================================================================

-- Tabela de flashcard decks (flashcard-decks.json)
DROP TABLE IF EXISTS flashcard_decks CASCADE;
CREATE TABLE flashcard_decks (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    user_id VARCHAR(50) NOT NULL,
    flashcard_ids JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tentativas de exame (exam-attempts.json)
DROP TABLE IF EXISTS exam_attempts_json CASCADE;
CREATE TABLE exam_attempts_json (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    exam_id VARCHAR(100) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    score DECIMAL(5,2),
    total_questions INTEGER,
    correct_answers INTEGER,
    answers JSONB DEFAULT '[]',
    time_taken INTEGER, -- em segundos
    status VARCHAR(50) DEFAULT 'in_progress',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de sessões de exame (exam_sessions.json)
DROP TABLE IF EXISTS exam_sessions_json CASCADE;
CREATE TABLE exam_sessions_json (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    exam_id VARCHAR(100) NOT NULL,
    session_data JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 15. ÍNDICES PARA PERFORMANCE
-- =============================================================================

-- Índices da tabela categories
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Índices da tabela flashcards
CREATE INDEX IF NOT EXISTS idx_flashcards_type ON flashcards(type);
CREATE INDEX IF NOT EXISTS idx_flashcards_category ON flashcards(category);
CREATE INDEX IF NOT EXISTS idx_flashcards_subcategory ON flashcards(subcategory);
CREATE INDEX IF NOT EXISTS idx_flashcards_difficulty ON flashcards(difficulty);
CREATE INDEX IF NOT EXISTS idx_flashcards_status ON flashcards(status);
CREATE INDEX IF NOT EXISTS idx_flashcards_author_id ON flashcards(author_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(next_review);

-- Índices da tabela summaries
CREATE INDEX IF NOT EXISTS idx_summaries_subject ON summaries(subject);
CREATE INDEX IF NOT EXISTS idx_summaries_difficulty ON summaries(difficulty);
CREATE INDEX IF NOT EXISTS idx_summaries_status ON summaries(status);
CREATE INDEX IF NOT EXISTS idx_summaries_created_by ON summaries(created_by);

-- Índices da tabela previous_exams
CREATE INDEX IF NOT EXISTS idx_previous_exams_organization ON previous_exams(organization);
CREATE INDEX IF NOT EXISTS idx_previous_exams_exam_board ON previous_exams(exam_board);
CREATE INDEX IF NOT EXISTS idx_previous_exams_year ON previous_exams(year);
CREATE INDEX IF NOT EXISTS idx_previous_exams_status ON previous_exams(status);

-- Índices da tabela legislation
CREATE INDEX IF NOT EXISTS idx_legislation_type ON legislation(type);
CREATE INDEX IF NOT EXISTS idx_legislation_category ON legislation(category);
CREATE INDEX IF NOT EXISTS idx_legislation_year ON legislation(year);
CREATE INDEX IF NOT EXISTS idx_legislation_status ON legislation(status);

-- Índices da tabela enrollments_json
CREATE INDEX IF NOT EXISTS idx_enrollments_json_user_id ON enrollments_json(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_json_course_id ON enrollments_json(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_json_status ON enrollments_json(status);

-- Índices do sistema de schedule
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_user_id ON schedule_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_date ON schedule_tasks(date);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_status ON schedule_tasks(status);

CREATE INDEX IF NOT EXISTS idx_schedule_events_user_id ON schedule_events(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_events_date ON schedule_events(date);

CREATE INDEX IF NOT EXISTS idx_schedule_study_sessions_user_id ON schedule_study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_study_sessions_date ON schedule_study_sessions(date);

CREATE INDEX IF NOT EXISTS idx_schedule_daily_goals_user_id ON schedule_daily_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_daily_goals_date ON schedule_daily_goals(date);

-- =============================================================================
-- 16. TRIGGERS PARA UPDATED_AT AUTOMÁTICO
-- =============================================================================

-- Função genérica para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas relevantes
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_flashcards_updated_at ON flashcards;
CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON flashcards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_summaries_updated_at ON summaries;
CREATE TRIGGER update_summaries_updated_at BEFORE UPDATE ON summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_previous_exams_updated_at ON previous_exams;
CREATE TRIGGER update_previous_exams_updated_at BEFORE UPDATE ON previous_exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_legislation_updated_at ON legislation;
CREATE TRIGGER update_legislation_updated_at BEFORE UPDATE ON legislation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enrollments_json_updated_at ON enrollments_json;
CREATE TRIGGER update_enrollments_json_updated_at BEFORE UPDATE ON enrollments_json FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_json_updated_at ON user_profiles_json;
CREATE TRIGGER update_user_profiles_json_updated_at BEFORE UPDATE ON user_profiles_json FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_json_updated_at ON system_settings_json;
CREATE TRIGGER update_system_settings_json_updated_at BEFORE UPDATE ON system_settings_json FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedule_tasks_updated_at ON schedule_tasks;
CREATE TRIGGER update_schedule_tasks_updated_at BEFORE UPDATE ON schedule_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedule_events_updated_at ON schedule_events;
CREATE TRIGGER update_schedule_events_updated_at BEFORE UPDATE ON schedule_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedule_study_sessions_updated_at ON schedule_study_sessions;
CREATE TRIGGER update_schedule_study_sessions_updated_at BEFORE UPDATE ON schedule_study_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedule_daily_goals_updated_at ON schedule_daily_goals;
CREATE TRIGGER update_schedule_daily_goals_updated_at BEFORE UPDATE ON schedule_daily_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 17. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =============================================================================

COMMENT ON TABLE categories IS 'Categorias hierárquicas do sistema (matérias, tópicos, bancas, anos)';
COMMENT ON TABLE flashcards IS 'Sistema completo de flashcards com 7 tipos diferentes e algoritmo SM-2';
COMMENT ON TABLE summaries IS 'Resumos de estudo dos usuários';
COMMENT ON TABLE previous_exams IS 'Provas anteriores de concursos';
COMMENT ON TABLE legislation IS 'Legislação com estrutura hierárquica completa';
COMMENT ON TABLE enrollments_json IS 'Matrículas dos usuários nos cursos (migradas do JSON)';
COMMENT ON TABLE user_profiles_json IS 'Perfis detalhados dos usuários (migrados do JSON)';
COMMENT ON TABLE system_settings_json IS 'Configurações do sistema (migradas do JSON)';
COMMENT ON TABLE schedule_tasks IS 'Tarefas do cronograma de estudos';
COMMENT ON TABLE schedule_events IS 'Eventos do calendário';
COMMENT ON TABLE schedule_study_sessions IS 'Sessões de estudo planejadas';
COMMENT ON TABLE schedule_daily_goals IS 'Metas diárias dos usuários';

-- =============================================================================
-- SCHEMA COMPLETO CRIADO COM SUCESSO
-- =============================================================================

SELECT 'Schema completo criado! Pronto para migração dos dados JSON.' as status;