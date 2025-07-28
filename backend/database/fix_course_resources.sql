-- Criar tabela course_resources que está faltando
CREATE TABLE IF NOT EXISTS course_resources (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    videos_count INTEGER DEFAULT 0,
    questions_count INTEGER DEFAULT 0,
    flashcards_count INTEGER DEFAULT 0,
    summaries_count INTEGER DEFAULT 0,
    laws_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_course_resources_course_id ON course_resources(course_id);