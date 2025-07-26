-- Sample Data for StudyPro Platform
-- Creating realistic data for development and demonstration

-- Insert sample courses with UUID IDs
INSERT INTO courses (
    id, title, slug, description, category, instructor_id, 
    thumbnail_url, price, difficulty_level, duration_hours, duration_months,
    status, visibility, created_at, updated_at
) VALUES 
(
    '11111111-2222-3333-4444-555555555551'::uuid, 'Polícia Federal - Agente', 'pol-cia-federal-agente',
    'Preparação completa para o concurso de Agente da Polícia Federal',
    'Polícia', '123e4567-e89b-12d3-a456-426614174000',
    'http://localhost:8180/uploads/img/123e4567e89b12d3a456426614174000/courses/pol-cia-federal-agente/thumbnail_1753341706_6881df0aaaf78.png',
    199.90, 'intermediate', 120, 6,
    'published', 'public', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    '11111111-2222-3333-4444-555555555552'::uuid, 'Receita Federal - Auditor Fiscal', 'receita-federal-auditor-fiscal',
    'Curso completo para Auditor Fiscal da Receita Federal',
    'Receita', '123e4567-e89b-12d3-a456-426614174000',
    'http://localhost:8180/uploads/img/123e4567e89b12d3a456426614174000/courses/receita-federal-auditor-fiscal/thumbnail_1753339683_6881d723bf447.png',
    299.90, 'advanced', 180, 8,
    'published', 'public', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    '11111111-2222-3333-4444-555555555553'::uuid, 'TRT/TRF - Analista Judiciário', 'trt-trf-analista-judici-rio',
    'Preparação para concursos de Analista Judiciário',
    'Polícia', '123e4567-e89b-12d3-a456-426614174000',
    'http://localhost:8180/uploads/img/123e4567e89b12d3a456426614174000/courses/trt-trf-analista-judiciario/thumbnail_1753339975_6881d847c45cf.png',
    149.90, 'intermediate', 100, 5,
    'published', 'public', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    '11111111-2222-3333-4444-555555555554'::uuid, 'Banco do Brasil - Escriturário', 'banco-do-brasil-escritur-rio',
    'Curso preparatório para Escriturário do Banco do Brasil',
    'Polícia', '123e4567-e89b-12d3-a456-426614174000',
    'http://localhost:8180/uploads/img/123e4567e89b12d3a456426614174000/courses/banco-do-brasil-escriturario/thumbnail_1753340844_6881dbac4aa4c.png',
    99.90, 'beginner', 80, 4,
    'published', 'public', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    '11111111-2222-3333-4444-555555555555'::uuid, 'Professor SEDUC - Matemática', 'professor-seduc-matem-tica',
    'Preparação para Professor de Matemática da SEDUC',
    'Educação', '123e4567-e89b-12d3-a456-426614174000',
    'http://localhost:8180/uploads/img/123e4567e89b12d3a456426614174000/courses/professor-seduc-matem-tica/thumbnail_1753341465_6881de1944ff6.png',
    179.90, 'intermediate', 140, 6,
    'published', 'public', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- Insert course resources
INSERT INTO course_resources (course_id, videos_count, questions_count, flashcards_count, summaries_count, laws_count) VALUES
('11111111-2222-3333-4444-555555555551'::uuid, 0, 0, 0, 0, 0),
('11111111-2222-3333-4444-555555555552'::uuid, 0, 0, 0, 0, 0),
('11111111-2222-3333-4444-555555555553'::uuid, 0, 0, 0, 0, 0),
('11111111-2222-3333-4444-555555555554'::uuid, 0, 0, 0, 0, 0),
('11111111-2222-3333-4444-555555555555'::uuid, 0, 0, 0, 0, 0);