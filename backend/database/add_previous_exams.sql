-- =====================================================
-- PROVAS ANTERIORES (Previous Exams)
-- =====================================================

-- Tabela de concursos/exames anteriores
CREATE TABLE IF NOT EXISTS previous_exams (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL, -- Ex: "Polícia Federal", "Polícia Rodoviária Federal"
    exam_board VARCHAR(100) NOT NULL, -- Ex: "CESPE", "FCC", "VUNESP"
    year INTEGER NOT NULL,
    exam_date DATE,
    position VARCHAR(255), -- Ex: "Agente", "Escrivão", "Delegado"
    description TEXT,
    total_questions INTEGER,
    exam_duration_minutes INTEGER,
    passing_score DECIMAL(5, 2),
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'expert')),
    exam_file_url TEXT, -- PDF original da prova
    answer_sheet_url TEXT, -- Gabarito oficial
    is_active BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de disciplinas/matérias da prova
CREATE TABLE IF NOT EXISTS previous_exam_subjects (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER NOT NULL REFERENCES previous_exams(id) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL, -- Ex: "Direito Constitucional", "Português"
    questions_count INTEGER NOT NULL,
    weight DECIMAL(3, 2) DEFAULT 1.0, -- Peso da disciplina na prova
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de questões das provas anteriores
CREATE TABLE IF NOT EXISTS previous_exam_questions (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER NOT NULL REFERENCES previous_exams(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES previous_exam_subjects(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL, -- Número original da questão na prova
    type VARCHAR(20) NOT NULL CHECK (type IN ('multiple_choice', 'true_false', 'essay', 'discursive')),
    statement TEXT NOT NULL,
    image_url TEXT,
    correct_answer TEXT NOT NULL, -- Pode ser letra (A, B, C...) ou "CERTO/ERRADO"
    official_explanation TEXT,
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    topic_tags TEXT[], -- Tags de assunto específico
    is_annulled BOOLEAN DEFAULT FALSE, -- Se a questão foi anulada
    annulment_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, question_number)
);

-- Tabela de alternativas para questões de múltipla escolha
CREATE TABLE IF NOT EXISTS previous_exam_alternatives (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES previous_exam_questions(id) ON DELETE CASCADE,
    letter CHAR(1) NOT NULL, -- A, B, C, D, E
    text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_id, letter)
);

-- Tabela de resultados dos usuários nas provas anteriores
CREATE TABLE IF NOT EXISTS previous_exam_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exam_id INTEGER NOT NULL REFERENCES previous_exams(id) ON DELETE CASCADE,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    time_spent_seconds INTEGER,
    total_questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    score DECIMAL(5, 2),
    percentage_score DECIMAL(5, 2),
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de respostas dos usuários
CREATE TABLE IF NOT EXISTS previous_exam_user_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL REFERENCES previous_exam_attempts(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES previous_exam_questions(id) ON DELETE CASCADE,
    selected_answer TEXT, -- Letra selecionada ou "CERTO/ERRADO"
    is_correct BOOLEAN,
    time_spent_seconds INTEGER,
    marked_for_review BOOLEAN DEFAULT FALSE,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(attempt_id, question_id)
);

-- Tabela de comentários e discussões sobre questões
CREATE TABLE IF NOT EXISTS previous_exam_comments (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES previous_exam_questions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id INTEGER REFERENCES previous_exam_comments(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de estatísticas por questão
CREATE TABLE IF NOT EXISTS previous_exam_question_stats (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES previous_exam_questions(id) ON DELETE CASCADE,
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    avg_time_seconds INTEGER,
    difficulty_rating DECIMAL(3, 2), -- Calculado com base nas respostas
    last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_id)
);

-- =====================================================
-- SIMULADOS APRIMORADOS (Enhanced Mock Exams)
-- =====================================================

-- Adicionar novos campos à tabela mock_exams existente
ALTER TABLE mock_exams 
ADD COLUMN IF NOT EXISTS exam_category VARCHAR(100), -- "Concurso Público", "Vestibular", "Certificação"
ADD COLUMN IF NOT EXISTS organization VARCHAR(255), -- "Polícia Federal", "ENEM"
ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('basic', 'intermediate', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS is_timed BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS allow_review BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS show_answers_after BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Tabela de configurações de simulados personalizados
CREATE TABLE IF NOT EXISTS custom_mock_exams (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subjects TEXT[], -- Array de matérias selecionadas
    difficulty_levels TEXT[], -- Array de níveis selecionados
    question_types TEXT[], -- Array de tipos de questão
    organizations TEXT[], -- Array de bancas/organizações
    years_range INTEGER[], -- [ano_inicial, ano_final]
    total_questions INTEGER NOT NULL,
    time_limit_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para agrupar simulados em séries/pacotes
CREATE TABLE IF NOT EXISTS mock_exam_series (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    total_exams INTEGER DEFAULT 0,
    price DECIMAL(10, 2),
    is_free BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relacionamento entre séries e simulados
CREATE TABLE IF NOT EXISTS mock_exam_series_items (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES mock_exam_series(id) ON DELETE CASCADE,
    exam_id INTEGER NOT NULL REFERENCES mock_exams(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    unlock_after_days INTEGER DEFAULT 0, -- Dias após inscrição para liberar
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(series_id, exam_id),
    UNIQUE(series_id, order_index)
);

-- Tabela de inscrições em séries de simulados
CREATE TABLE IF NOT EXISTS mock_exam_series_enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    series_id INTEGER NOT NULL REFERENCES mock_exam_series(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    progress DECIMAL(5, 2) DEFAULT 0, -- Percentual de conclusão
    UNIQUE(user_id, series_id)
);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_previous_exams_updated_at BEFORE UPDATE ON previous_exams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_previous_exam_questions_updated_at BEFORE UPDATE ON previous_exam_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_previous_exam_comments_updated_at BEFORE UPDATE ON previous_exam_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_mock_exams_updated_at BEFORE UPDATE ON custom_mock_exams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mock_exam_series_updated_at BEFORE UPDATE ON mock_exam_series
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX idx_previous_exams_year ON previous_exams(year);
CREATE INDEX idx_previous_exams_organization ON previous_exams(organization);
CREATE INDEX idx_previous_exams_exam_board ON previous_exams(exam_board);
CREATE INDEX idx_previous_exam_questions_exam_id ON previous_exam_questions(exam_id);
CREATE INDEX idx_previous_exam_questions_subject_id ON previous_exam_questions(subject_id);
CREATE INDEX idx_previous_exam_attempts_user_id ON previous_exam_attempts(user_id);
CREATE INDEX idx_previous_exam_attempts_exam_id ON previous_exam_attempts(exam_id);
CREATE INDEX idx_previous_exam_comments_question_id ON previous_exam_comments(question_id);
CREATE INDEX idx_mock_exam_series_items_series_id ON mock_exam_series_items(series_id);
CREATE INDEX idx_mock_exam_series_enrollments_user_id ON mock_exam_series_enrollments(user_id);

-- Adicionar alguns dados de exemplo
INSERT INTO previous_exams (
    title, organization, exam_board, year, position, 
    description, total_questions, exam_duration_minutes, 
    passing_score, difficulty_level, created_by
) VALUES 
(
    'Concurso Polícia Federal - Agente', 
    'Polícia Federal', 
    'CESPE', 
    2021, 
    'Agente de Polícia Federal',
    'Prova aplicada em 2021 para o cargo de Agente da Polícia Federal',
    120,
    240,
    60.0,
    'hard',
    1
),
(
    'Concurso PRF - Policial Rodoviário Federal', 
    'Polícia Rodoviária Federal', 
    'CESPE', 
    2021, 
    'Policial Rodoviário Federal',
    'Prova aplicada em 2021 para o cargo de Policial Rodoviário Federal',
    120,
    240,
    50.0,
    'hard',
    1
);