-- Criar tabela de questões no PostgreSQL
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('multiple_choice', 'true_false', 'fill_blank', 'essay')),
    subject VARCHAR(255) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    category_id VARCHAR(50),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    
    -- Para questões de múltipla escolha
    options JSONB,
    correct_answer INTEGER,
    
    -- Para questões verdadeiro/falso
    correct_boolean BOOLEAN,
    
    -- Para questões dissertativas/lacunas
    expected_answer TEXT,
    
    -- Informações adicionais
    explanation TEXT,
    exam_board VARCHAR(100),
    exam_year INTEGER,
    exam_name VARCHAR(255),
    reference TEXT,
    tags JSONB DEFAULT '[]',
    
    -- Metadados
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_exam_board ON questions(exam_board);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_questions_updated_at();

-- Comentários nas colunas
COMMENT ON TABLE questions IS 'Banco de questões para simulados e provas';
COMMENT ON COLUMN questions.type IS 'Tipo da questão: multiple_choice, true_false, fill_blank, essay';
COMMENT ON COLUMN questions.options IS 'Array JSON com as opções para questões de múltipla escolha';
COMMENT ON COLUMN questions.correct_answer IS 'Índice (0-based) da resposta correta para múltipla escolha';
COMMENT ON COLUMN questions.correct_boolean IS 'Resposta verdadeiro/falso para questões booleanas';
COMMENT ON COLUMN questions.expected_answer IS 'Resposta esperada para questões dissertativas ou de lacunas';
COMMENT ON COLUMN questions.tags IS 'Array JSON com tags relacionadas à questão';