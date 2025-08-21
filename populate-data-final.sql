-- Limpar dados existentes
TRUNCATE TABLE flashcards CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE courses CASCADE;

-- Criar categorias principais
INSERT INTO categories (id, name, type, description, parent_id, created_at, updated_at) VALUES
('cat_direito', 'Direito', 'subject', 'Disciplinas jurídicas', NULL, NOW(), NOW()),
('cat_portugues', 'Português', 'subject', 'Língua portuguesa e literatura', NULL, NOW(), NOW()),
('cat_matematica', 'Matemática', 'subject', 'Matemática e raciocínio lógico', NULL, NOW(), NOW()),
('cat_informatica', 'Informática', 'subject', 'Tecnologia e sistemas', NULL, NOW(), NOW()),
('cat_administracao', 'Administração', 'subject', 'Gestão e administração pública', NULL, NOW(), NOW());

-- Criar subcategorias para Direito
INSERT INTO categories (id, name, type, description, parent_id, created_at, updated_at) VALUES
('cat_dir_const', 'Direito Constitucional', 'topic', 'Constituição Federal', 'cat_direito', NOW(), NOW()),
('cat_dir_admin', 'Direito Administrativo', 'topic', 'Administração pública', 'cat_direito', NOW(), NOW()),
('cat_dir_penal', 'Direito Penal', 'topic', 'Código Penal', 'cat_direito', NOW(), NOW()),
('cat_dir_civil', 'Direito Civil', 'topic', 'Código Civil', 'cat_direito', NOW(), NOW()),
('cat_dir_proc', 'Direito Processual', 'topic', 'Processo civil e penal', 'cat_direito', NOW(), NOW());

-- Criar subcategorias para Português
INSERT INTO categories (id, name, type, description, parent_id, created_at, updated_at) VALUES
('cat_port_gram', 'Gramática', 'topic', 'Regras gramaticais', 'cat_portugues', NOW(), NOW()),
('cat_port_inter', 'Interpretação de Texto', 'topic', 'Compreensão textual', 'cat_portugues', NOW(), NOW()),
('cat_port_red', 'Redação', 'topic', 'Produção textual', 'cat_portugues', NOW(), NOW()),
('cat_port_orto', 'Ortografia', 'topic', 'Regras ortográficas', 'cat_portugues', NOW(), NOW());

-- Criar subcategorias para Matemática
INSERT INTO categories (id, name, type, description, parent_id, created_at, updated_at) VALUES
('cat_mat_fin', 'Matemática Financeira', 'topic', 'Juros e investimentos', 'cat_matematica', NOW(), NOW()),
('cat_mat_rac', 'Raciocínio Lógico', 'topic', 'Lógica proposicional', 'cat_matematica', NOW(), NOW()),
('cat_mat_est', 'Estatística', 'topic', 'Probabilidade e estatística', 'cat_matematica', NOW(), NOW()),
('cat_mat_geo', 'Geometria', 'topic', 'Formas e medidas', 'cat_matematica', NOW(), NOW());

-- Criar cursos (usando instructor_id=1 que já existe)
INSERT INTO courses (title, slug, description, category, instructor_id, price, duration_hours, difficulty_level, status, created_at, updated_at) VALUES
('Direito Constitucional Completo', 'direito-constitucional-completo', 'Curso completo de Direito Constitucional', 'Direito', 1, 299.90, 120, 'intermediate', 'published', NOW(), NOW()),
('Direito Administrativo para Concursos', 'direito-administrativo-concursos', 'Preparação completa para concursos públicos', 'Direito', 1, 249.90, 80, 'intermediate', 'published', NOW(), NOW()),
('Português para Concursos', 'portugues-concursos', 'Gramática e interpretação de texto', 'Português', 1, 199.90, 60, 'beginner', 'published', NOW(), NOW()),
('Matemática Financeira Aplicada', 'matematica-financeira-aplicada', 'Conceitos e aplicações práticas', 'Matemática', 1, 179.90, 40, 'intermediate', 'published', NOW(), NOW()),
('Raciocínio Lógico Descomplicado', 'raciocinio-logico-descomplicado', 'Lógica para concursos públicos', 'Matemática', 1, 159.90, 50, 'beginner', 'published', NOW(), NOW()),
('Informática Básica', 'informatica-basica', 'Conceitos fundamentais de informática', 'Informática', 1, 129.90, 30, 'beginner', 'published', NOW(), NOW()),
('Administração Pública', 'administracao-publica', 'Princípios e práticas da administração pública', 'Administração', 1, 219.90, 70, 'intermediate', 'published', NOW(), NOW());

-- Criar flashcards
INSERT INTO flashcards (id, type, front, back, category, subcategory, difficulty, tags, status, author_id, created_at, updated_at) VALUES
('fc_dir_const_1', 'basic', 'O que são direitos fundamentais?', 'São direitos básicos individuais, sociais, políticos e jurídicos previstos na Constituição Federal', 'Direito', 'Direito Constitucional', 'easy', '["constituição", "direitos"]'::jsonb, 'published', 1, NOW(), NOW()),
('fc_dir_const_2', 'basic', 'Quais são os poderes da União?', 'Executivo, Legislativo e Judiciário - independentes e harmônicos entre si', 'Direito', 'Direito Constitucional', 'easy', '["poderes", "união"]'::jsonb, 'published', 1, NOW(), NOW()),
('fc_dir_const_3', 'basic', 'O que é cláusula pétrea?', 'São dispositivos constitucionais que não podem ser alterados nem por emenda constitucional', 'Direito', 'Direito Constitucional', 'medium', '["constituição", "cláusula pétrea"]'::jsonb, 'published', 1, NOW(), NOW()),
('fc_dir_admin_1', 'basic', 'O que é licitação?', 'Procedimento administrativo para contratação de serviços ou aquisição de produtos pelo poder público', 'Direito', 'Direito Administrativo', 'easy', '["licitação", "administração"]'::jsonb, 'published', 1, NOW(), NOW()),
('fc_dir_admin_2', 'basic', 'Quais são os princípios da administração pública?', 'Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência (LIMPE)', 'Direito', 'Direito Administrativo', 'easy', '["princípios", "administração"]'::jsonb, 'published', 1, NOW(), NOW()),
('fc_port_gram_1', 'basic', 'O que é sujeito?', 'É o termo da oração que indica quem pratica ou sofre a ação expressa pelo verbo', 'Português', 'Gramática', 'easy', '["gramática", "sujeito"]'::jsonb, 'published', 1, NOW(), NOW()),
('fc_port_orto_1', 'basic', 'Diferença entre mas e mais?', 'MAS = conjunção adversativa (porém). MAIS = advérbio de intensidade (quantidade)', 'Português', 'Ortografia', 'easy', '["ortografia", "gramática"]'::jsonb, 'published', 1, NOW(), NOW()),
('fc_mat_fin_1', 'basic', 'Fórmula dos juros simples?', 'J = C × i × t (Juros = Capital × taxa × tempo)', 'Matemática', 'Matemática Financeira', 'easy', '["juros", "matemática"]'::jsonb, 'published', 1, NOW(), NOW()),
('fc_mat_rac_1', 'basic', 'O que é proposição?', 'É uma sentença declarativa que pode ser classificada como verdadeira ou falsa', 'Matemática', 'Raciocínio Lógico', 'easy', '["lógica", "proposição"]'::jsonb, 'published', 1, NOW(), NOW()),
('fc_info_1', 'basic', 'O que é CPU?', 'Central Processing Unit - Unidade Central de Processamento, o cérebro do computador', 'Informática', NULL, 'easy', '["hardware", "cpu"]'::jsonb, 'published', 1, NOW(), NOW()),
('fc_info_2', 'basic', 'Diferença entre RAM e ROM?', 'RAM: memória volátil de acesso aleatório. ROM: memória somente leitura, não volátil', 'Informática', NULL, 'medium', '["memória", "hardware"]'::jsonb, 'published', 1, NOW(), NOW()),
('fc_dir_admin_3', 'basic', 'O que é ato administrativo?', 'Manifestação unilateral de vontade da Administração Pública', 'Direito', 'Direito Administrativo', 'medium', '["ato", "administrativo"]'::jsonb, 'published', 1, NOW(), NOW()),
('fc_dir_const_4', 'basic', 'O que é habeas corpus?', 'Remédio constitucional para proteger o direito de ir e vir', 'Direito', 'Direito Constitucional', 'medium', '["habeas corpus", "remédios"]'::jsonb, 'published', 1, NOW(), NOW()),
('fc_port_gram_2', 'basic', 'O que é predicado?', 'Termo da oração que contém o verbo e indica o que se diz do sujeito', 'Português', 'Gramática', 'easy', '["gramática", "predicado"]'::jsonb, 'published', 1, NOW(), NOW()),
('fc_mat_geo_1', 'basic', 'Área do círculo?', 'A = π × r² (pi vezes raio ao quadrado)', 'Matemática', 'Geometria', 'easy', '["geometria", "área"]'::jsonb, 'published', 1, NOW(), NOW());