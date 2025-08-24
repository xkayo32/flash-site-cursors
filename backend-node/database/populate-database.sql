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

-- Criar cursos
INSERT INTO courses (id, title, description, category, price, duration_hours, instructor_name, level, is_published, created_at, updated_at) VALUES
(1, 'Direito Constitucional Completo', 'Curso completo de Direito Constitucional', 'Direito', 299.90, 120, 'Dr. João Silva', 'intermediate', true, NOW(), NOW()),
(2, 'Direito Administrativo para Concursos', 'Preparação completa para concursos públicos', 'Direito', 249.90, 80, 'Dra. Maria Santos', 'intermediate', true, NOW(), NOW()),
(3, 'Português para Concursos', 'Gramática e interpretação de texto', 'Português', 199.90, 60, 'Prof. Carlos Lima', 'beginner', true, NOW(), NOW()),
(4, 'Matemática Financeira Aplicada', 'Conceitos e aplicações práticas', 'Matemática', 179.90, 40, 'Prof. Ana Costa', 'intermediate', true, NOW(), NOW()),
(5, 'Raciocínio Lógico Descomplicado', 'Lógica para concursos públicos', 'Matemática', 159.90, 50, 'Prof. Pedro Oliveira', 'beginner', true, NOW(), NOW()),
(6, 'Informática Básica', 'Conceitos fundamentais de informática', 'Informática', 129.90, 30, 'Prof. Lucas Ferreira', 'beginner', true, NOW(), NOW()),
(7, 'Administração Pública', 'Princípios e práticas da administração pública', 'Administração', 219.90, 70, 'Prof. Roberto Alves', 'intermediate', true, NOW(), NOW());

-- Criar flashcards (tags como JSONB)
INSERT INTO flashcards (id, type, front, back, category, subcategory, difficulty, tags, status, created_at, updated_at) VALUES
(1, 'basic', 'O que são direitos fundamentais?', 'São direitos básicos individuais, sociais, políticos e jurídicos previstos na Constituição Federal', 'Direito', 'Direito Constitucional', 'easy', '["constituição", "direitos"]'::jsonb, 'published', NOW(), NOW()),
(2, 'basic', 'Quais são os poderes da União?', 'Executivo, Legislativo e Judiciário - independentes e harmônicos entre si', 'Direito', 'Direito Constitucional', 'easy', '["poderes", "união"]'::jsonb, 'published', NOW(), NOW()),
(3, 'basic', 'O que é cláusula pétrea?', 'São dispositivos constitucionais que não podem ser alterados nem por emenda constitucional', 'Direito', 'Direito Constitucional', 'medium', '["constituição", "cláusula pétrea"]'::jsonb, 'published', NOW(), NOW()),
(4, 'basic', 'O que é licitação?', 'Procedimento administrativo para contratação de serviços ou aquisição de produtos pelo poder público', 'Direito', 'Direito Administrativo', 'easy', '["licitação", "administração"]'::jsonb, 'published', NOW(), NOW()),
(5, 'basic', 'Quais são os princípios da administração pública?', 'Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência (LIMPE)', 'Direito', 'Direito Administrativo', 'easy', '["princípios", "administração"]'::jsonb, 'published', NOW(), NOW()),
(6, 'basic', 'O que é sujeito?', 'É o termo da oração que indica quem pratica ou sofre a ação expressa pelo verbo', 'Português', 'Gramática', 'easy', '["gramática", "sujeito"]'::jsonb, 'published', NOW(), NOW()),
(7, 'basic', 'Diferença entre mas e mais?', 'MAS = conjunção adversativa (porém). MAIS = advérbio de intensidade (quantidade)', 'Português', 'Ortografia', 'easy', '["ortografia", "gramática"]'::jsonb, 'published', NOW(), NOW()),
(8, 'basic', 'Fórmula dos juros simples?', 'J = C × i × t (Juros = Capital × taxa × tempo)', 'Matemática', 'Matemática Financeira', 'easy', '["juros", "matemática"]'::jsonb, 'published', NOW(), NOW()),
(9, 'basic', 'O que é proposição?', 'É uma sentença declarativa que pode ser classificada como verdadeira ou falsa', 'Matemática', 'Raciocínio Lógico', 'easy', '["lógica", "proposição"]'::jsonb, 'published', NOW(), NOW()),
(10, 'basic', 'O que é CPU?', 'Central Processing Unit - Unidade Central de Processamento, o cérebro do computador', 'Informática', NULL, 'easy', '["hardware", "cpu"]'::jsonb, 'published', NOW(), NOW()),
(11, 'basic', 'Diferença entre RAM e ROM?', 'RAM: memória volátil de acesso aleatório. ROM: memória somente leitura, não volátil', 'Informática', NULL, 'medium', '["memória", "hardware"]'::jsonb, 'published', NOW(), NOW()),
(12, 'basic', 'O que é ato administrativo?', 'Manifestação unilateral de vontade da Administração Pública', 'Direito', 'Direito Administrativo', 'medium', '["ato", "administrativo"]'::jsonb, 'published', NOW(), NOW()),
(13, 'basic', 'O que é habeas corpus?', 'Remédio constitucional para proteger o direito de ir e vir', 'Direito', 'Direito Constitucional', 'medium', '["habeas corpus", "remédios"]'::jsonb, 'published', NOW(), NOW()),
(14, 'basic', 'O que é predicado?', 'Termo da oração que contém o verbo e indica o que se diz do sujeito', 'Português', 'Gramática', 'easy', '["gramática", "predicado"]'::jsonb, 'published', NOW(), NOW()),
(15, 'basic', 'Área do círculo?', 'A = π × r² (pi vezes raio ao quadrado)', 'Matemática', 'Geometria', 'easy', '["geometria", "área"]'::jsonb, 'published', NOW(), NOW());