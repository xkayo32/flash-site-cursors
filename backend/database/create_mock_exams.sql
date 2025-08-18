-- Criar tabelas para sistema de Mock Exams (Simulados)
-- Migração de dados JSON para PostgreSQL

-- Enum types para mock exams
CREATE TYPE mock_exam_type AS ENUM ('AUTOMATIC', 'MANUAL', 'RANDOM');
CREATE TYPE difficulty_level AS ENUM ('RECRUTA', 'CABO', 'SARGENTO', 'MIXED');
CREATE TYPE exam_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE attempt_status AS ENUM ('in_progress', 'completed', 'abandoned');

-- Tabela principal de simulados
CREATE TABLE IF NOT EXISTS mock_exams (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(50) UNIQUE NOT NULL, -- Para manter compatibilidade com IDs existentes
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type mock_exam_type NOT NULL DEFAULT 'AUTOMATIC',
    difficulty difficulty_level NOT NULL DEFAULT 'MIXED',
    duration INTEGER NOT NULL DEFAULT 180, -- em minutos
    total_questions INTEGER NOT NULL DEFAULT 50,
    questions JSONB, -- Array de IDs de questões para tipo MANUAL
    filters JSONB, -- Filtros para tipo AUTOMATIC (subjects, topics, exam_boards, years)
    passing_score INTEGER NOT NULL DEFAULT 60, -- porcentagem
    max_attempts INTEGER NOT NULL DEFAULT 3,
    available_from TIMESTAMP,
    available_until TIMESTAMP,
    status exam_status NOT NULL DEFAULT 'draft',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Estatísticas agregadas
    total_attempts INTEGER DEFAULT 0,
    completed_attempts INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    pass_rate DECIMAL(5,2) DEFAULT 0
);

-- Tabela de tentativas de exame
CREATE TABLE IF NOT EXISTS exam_attempts (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(50) UNIQUE NOT NULL,
    exam_id INTEGER REFERENCES mock_exams(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    questions JSONB NOT NULL, -- Array de IDs das questões selecionadas
    answers JSONB, -- Objeto com respostas do usuário {question_id: answer}
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    time_spent INTEGER DEFAULT 0, -- em segundos
    score DECIMAL(5,2) DEFAULT 0, -- porcentagem
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    blank_answers INTEGER DEFAULT 0,
    status attempt_status NOT NULL DEFAULT 'in_progress',
    review JSONB, -- Revisão detalhada de cada questão
    
    CONSTRAINT unique_user_exam_in_progress UNIQUE (exam_id, user_id, status) 
        DEFERRABLE INITIALLY DEFERRED
);

-- Tabela de estatísticas por questão em simulados
CREATE TABLE IF NOT EXISTS mock_exam_question_stats (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES mock_exams(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    avg_time_seconds INTEGER DEFAULT 0,
    difficulty_rating DECIMAL(3,2) DEFAULT 0, -- 0 a 5
    UNIQUE(exam_id, question_id)
);

-- Índices para melhor performance
CREATE INDEX idx_mock_exams_status ON mock_exams(status);
CREATE INDEX idx_mock_exams_created_by ON mock_exams(created_by);
CREATE INDEX idx_mock_exams_difficulty ON mock_exams(difficulty);
CREATE INDEX idx_mock_exams_type ON mock_exams(type);
CREATE INDEX idx_mock_exams_available ON mock_exams(available_from, available_until);

CREATE INDEX idx_exam_attempts_exam_id ON exam_attempts(exam_id);
CREATE INDEX idx_exam_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_status ON exam_attempts(status);
CREATE INDEX idx_exam_attempts_submitted_at ON exam_attempts(submitted_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_mock_exam_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mock_exam_updated_at
BEFORE UPDATE ON mock_exams
FOR EACH ROW
EXECUTE FUNCTION update_mock_exam_updated_at();

-- Função para atualizar estatísticas do simulado
CREATE OR REPLACE FUNCTION update_mock_exam_stats(p_exam_id INTEGER)
RETURNS VOID AS $$
DECLARE
    v_total_attempts INTEGER;
    v_completed_attempts INTEGER;
    v_avg_score DECIMAL(5,2);
    v_pass_rate DECIMAL(5,2);
    v_passing_score INTEGER;
BEGIN
    -- Obter passing_score do exame
    SELECT passing_score INTO v_passing_score
    FROM mock_exams
    WHERE id = p_exam_id;
    
    -- Calcular estatísticas
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN status = 'completed' THEN 1 END),
        AVG(CASE WHEN status = 'completed' THEN score ELSE NULL END),
        COUNT(CASE WHEN status = 'completed' AND score >= v_passing_score THEN 1 END) * 100.0 / 
            NULLIF(COUNT(CASE WHEN status = 'completed' THEN 1 END), 0)
    INTO v_total_attempts, v_completed_attempts, v_avg_score, v_pass_rate
    FROM exam_attempts
    WHERE exam_id = p_exam_id;
    
    -- Atualizar mock_exams
    UPDATE mock_exams
    SET 
        total_attempts = COALESCE(v_total_attempts, 0),
        completed_attempts = COALESCE(v_completed_attempts, 0),
        average_score = COALESCE(v_avg_score, 0),
        pass_rate = COALESCE(v_pass_rate, 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_exam_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estatísticas após mudanças em exam_attempts
CREATE OR REPLACE FUNCTION trigger_update_exam_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_mock_exam_stats(NEW.exam_id);
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_mock_exam_stats(OLD.exam_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_exam_attempts_stats
AFTER INSERT OR UPDATE OR DELETE ON exam_attempts
FOR EACH ROW
EXECUTE FUNCTION trigger_update_exam_stats();

-- Inserir dados de exemplo dos mock exams existentes
INSERT INTO mock_exams (
    external_id, title, description, type, difficulty, duration, 
    total_questions, filters, passing_score, max_attempts,
    available_from, available_until, status, created_by,
    created_at, updated_at, total_attempts, completed_attempts,
    average_score, pass_rate
) VALUES 
(
    'me1',
    'Simulado Polícia Federal - Agente 2024',
    'Simulado completo baseado no último edital da Polícia Federal para o cargo de Agente. Abrange todas as disciplinas cobradas no concurso com questões atualizadas.',
    'AUTOMATIC',
    'SARGENTO',
    240,
    5,
    '{"subjects": ["Direito Constitucional", "Direito Administrativo", "Direito Penal"], "exam_boards": ["CESPE", "FCC"], "years": [2023, 2024], "difficulty": ["medium", "hard"]}'::jsonb,
    60,
    3,
    '2024-01-01T00:00:00Z',
    '2025-12-31T23:59:59Z',
    'published',
    1,
    '2024-01-15T00:00:00Z',
    '2025-08-15T00:00:00Z',
    1250,
    1180,
    58.5,
    42.3
),
(
    'me2',
    'Simulado PRF - Policial Rodoviário 2024',
    'Preparatório completo para concurso da Polícia Rodoviária Federal com questões atualizadas e foco nas disciplinas mais cobradas.',
    'AUTOMATIC',
    'MIXED',
    180,
    4,
    '{"subjects": ["Direito Constitucional", "Direito Administrativo", "Direito Penal", "Direito Processual Penal"], "exam_boards": ["CESPE"], "years": [2023, 2024]}'::jsonb,
    60,
    5,
    '2024-01-01T00:00:00Z',
    '2025-12-31T23:59:59Z',
    'published',
    1,
    '2024-02-01T00:00:00Z',
    '2025-08-15T00:00:00Z',
    980,
    920,
    62.3,
    48.5
),
(
    'me3',
    'Simulado Agente Penitenciário Federal',
    'Questões específicas para o concurso de Agente Penitenciário Federal com foco nas matérias mais importantes.',
    'AUTOMATIC',
    'CABO',
    120,
    3,
    '{"subjects": ["Direito Constitucional", "Direito Penal", "Direitos Humanos"], "exam_boards": ["CESPE", "FCC"], "years": [2024]}'::jsonb,
    50,
    5,
    '2024-01-01T00:00:00Z',
    '2025-12-31T23:59:59Z',
    'published',
    1,
    '2024-03-01T00:00:00Z',
    '2025-08-15T00:00:00Z',
    750,
    700,
    65.8,
    55.2
),
(
    'me4',
    'Simulado Polícia Civil - Investigador',
    'Preparação completa para concursos de Investigador de Polícia Civil com questões de diversas bancas.',
    'MANUAL',
    'SARGENTO',
    180,
    6,
    '["1", "2", "3", "4", "5", "6"]'::jsonb,
    60,
    3,
    '2024-01-01T00:00:00Z',
    '2025-12-31T23:59:59Z',
    'published',
    1,
    '2024-04-01T00:00:00Z',
    '2025-08-15T00:00:00Z',
    1100,
    1050,
    61.2,
    45.8
),
(
    'me5',
    'Simulado Guarda Municipal - Básico',
    'Questões fundamentais para concursos de Guarda Municipal em todo o país.',
    'AUTOMATIC',
    'RECRUTA',
    90,
    2,
    '{"subjects": ["Direito Constitucional", "Direito Administrativo"], "exam_boards": ["FCC", "VUNESP"], "years": [2023, 2024]}'::jsonb,
    50,
    10,
    '2024-01-01T00:00:00Z',
    '2025-12-31T23:59:59Z',
    'published',
    1,
    '2024-05-01T00:00:00Z',
    '2025-08-15T00:00:00Z',
    2100,
    2000,
    68.5,
    62.3
),
(
    'me6',
    'Simulado Escrivão de Polícia Federal',
    'Simulado direcionado para o cargo de Escrivão da PF com questões atualizadas.',
    'RANDOM',
    'SARGENTO',
    240,
    7,
    null,
    70,
    2,
    '2024-06-01T00:00:00Z',
    '2025-06-30T23:59:59Z',
    'published',
    1,
    '2024-06-01T00:00:00Z',
    '2025-08-15T00:00:00Z',
    450,
    400,
    52.3,
    35.8
),
(
    'me7',
    'Simulado Papiloscopista PF 2024',
    'Preparação específica para o cargo de Papiloscopista da Polícia Federal.',
    'AUTOMATIC',
    'CABO',
    150,
    3,
    '{"subjects": ["Direito Constitucional", "Direito Administrativo", "Informática"], "exam_boards": ["CESPE"], "years": [2024]}'::jsonb,
    60,
    3,
    '2024-07-01T00:00:00Z',
    '2025-07-31T23:59:59Z',
    'draft',
    1,
    '2024-07-01T00:00:00Z',
    '2025-08-15T00:00:00Z',
    0,
    0,
    0,
    0
),
(
    'me8',
    'Simulado PCDF - Agente',
    'Questões para o concurso de Agente da Polícia Civil do Distrito Federal.',
    'AUTOMATIC',
    'MIXED',
    180,
    5,
    '{"subjects": ["Direito Constitucional", "Direito Administrativo", "Direito Penal", "Legislação Especial"], "exam_boards": ["CESPE"], "years": [2023, 2024]}'::jsonb,
    60,
    5,
    '2024-01-01T00:00:00Z',
    '2025-12-31T23:59:59Z',
    'published',
    1,
    '2024-08-01T00:00:00Z',
    '2025-08-15T00:00:00Z',
    650,
    600,
    59.8,
    44.2
);

-- Função helper para converter external_id para id interno
CREATE OR REPLACE FUNCTION get_mock_exam_id(p_external_id VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    v_id INTEGER;
BEGIN
    SELECT id INTO v_id FROM mock_exams WHERE external_id = p_external_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Adicionar algumas tentativas de exemplo
INSERT INTO exam_attempts (
    external_id, exam_id, user_id, questions, answers,
    started_at, submitted_at, time_spent, score,
    correct_answers, wrong_answers, blank_answers, status
) VALUES
(
    'attempt_1',
    get_mock_exam_id('me1'),
    2, -- Assumindo user_id 2 como estudante
    '["1", "2", "3", "4", "5"]'::jsonb,
    '{"1": 0, "2": 1, "3": 2, "4": 0, "5": 1}'::jsonb,
    '2025-08-17T14:00:00Z',
    '2025-08-17T15:30:00Z',
    5400,
    60.0,
    3,
    2,
    0,
    'completed'
),
(
    'attempt_2',
    get_mock_exam_id('me2'),
    2,
    '["6", "7", "8", "9"]'::jsonb,
    '{"6": 1, "7": 2, "8": 0, "9": 3}'::jsonb,
    '2025-08-16T10:00:00Z',
    '2025-08-16T11:00:00Z',
    3600,
    75.0,
    3,
    1,
    0,
    'completed'
);

-- Comentários sobre a migração
COMMENT ON TABLE mock_exams IS 'Tabela principal de simulados/mock exams do sistema';
COMMENT ON TABLE exam_attempts IS 'Registro de tentativas dos usuários nos simulados';
COMMENT ON TABLE mock_exam_question_stats IS 'Estatísticas agregadas por questão em cada simulado';
COMMENT ON COLUMN mock_exams.external_id IS 'ID externo para manter compatibilidade com sistema anterior em JSON';
COMMENT ON COLUMN mock_exams.filters IS 'Filtros JSON para seleção automática de questões';
COMMENT ON COLUMN exam_attempts.review IS 'Revisão detalhada de cada questão respondida';