-- Script para inserir flashcards de teste diretamente no banco
-- Todos criados pelo admin (ID: 1 ou similar)

-- Limpar flashcards existentes
DELETE FROM flashcards;

-- 1. BÁSICO - Direito Constitucional
INSERT INTO flashcards (
    id, type, difficulty, category, subcategory, tags, status,
    front, back, author_id, author_name
) VALUES (
    'flash_test_001',
    'basic',
    'medium',
    'Direito',
    'Direito Constitucional',
    '["constituição", "princípios", "fundamentos"]'::jsonb,
    'published',
    'Qual é o princípio fundamental da República Federativa do Brasil que estabelece a dignidade da pessoa humana?',
    'A dignidade da pessoa humana é um dos fundamentos da República Federativa do Brasil, previsto no artigo 1º, III da Constituição Federal de 1988.',
    '1',
    'Admin'
);

-- 2. BÁSICO INVERTIDO - Segurança da Informação
INSERT INTO flashcards (
    id, type, difficulty, category, subcategory, tags, status,
    front, back, text, author_id, author_name
) VALUES (
    'flash_test_002',
    'basic_reversed',
    'medium',
    'Informática',
    'Segurança da Informação',
    '["segurança", "criptografia", "confidencialidade"]'::jsonb,
    'published',
    'O que é Criptografia?',
    'Técnica de codificação de dados que visa garantir a confidencialidade das informações',
    'A criptografia pode ser simétrica (mesma chave para cifrar e decifrar) ou assimétrica (chaves públicas e privadas diferentes)',
    '1',
    'Admin'
);

-- 3. CLOZE (variação 1) - Gramática
INSERT INTO flashcards (
    id, type, difficulty, category, subcategory, tags, status,
    text, author_id, author_name
) VALUES (
    'flash_test_003',
    'cloze',
    'easy',
    'Português',
    'Gramática',
    '["gramática", "concordância", "sintaxe"]'::jsonb,
    'published',
    'A {{c1::concordância verbal}} ocorre quando o {{c2::verbo}} se flexiona para concordar com o {{c3::sujeito}} da oração.',
    '1',
    'Admin'
);

-- 4. CLOZE (variação 2) - Gramática
INSERT INTO flashcards (
    id, type, difficulty, category, subcategory, tags, status,
    text, author_id, author_name
) VALUES (
    'flash_test_004',
    'cloze',
    'easy',
    'Português',
    'Gramática',
    '["gramática", "classes gramaticais", "morfologia"]'::jsonb,
    'published',
    'O {{c1::substantivo}} é a classe de palavras que nomeia seres, objetos, fenômenos, lugares, qualidades, ações, dentre outros.',
    '1',
    'Admin'
);

-- 5. CLOZE (variação 3) - Gramática
INSERT INTO flashcards (
    id, type, difficulty, category, subcategory, tags, status,
    text, author_id, author_name
) VALUES (
    'flash_test_005',
    'cloze',
    'medium',
    'Português',
    'Gramática',
    '["gramática", "pronomes", "morfologia"]'::jsonb,
    'published',
    'Os {{c1::pronomes pessoais}} do caso reto são: {{c2::eu, tu, ele/ela, nós, vós, eles/elas}} e funcionam como {{c3::sujeito}} da oração.',
    '1',
    'Admin'
);

-- 6. MÚLTIPLA ESCOLHA - Direito Penal
INSERT INTO flashcards (
    id, type, difficulty, category, subcategory, tags, status,
    question, options, correct, explanation, author_id, author_name
) VALUES (
    'flash_test_006',
    'multiple_choice',
    'hard',
    'Direito',
    'Direito Penal',
    '["direito penal", "prescrição", "prazos"]'::jsonb,
    'published',
    'Qual é o prazo prescricional para crimes cuja pena máxima é superior a 8 anos e não excede 12 anos?',
    '["8 anos", "12 anos", "16 anos", "20 anos"]'::jsonb,
    2,
    'Conforme o artigo 109, II do Código Penal, prescreve em 16 anos se o máximo da pena é superior a 8 anos e não excede 12 anos.',
    '1',
    'Admin'
);

-- 7. VERDADEIRO/FALSO - Redes de Computadores
INSERT INTO flashcards (
    id, type, difficulty, category, subcategory, tags, status,
    statement, answer, explanation, author_id, author_name
) VALUES (
    'flash_test_007',
    'true_false',
    'medium',
    'Informática',
    'Redes de Computadores',
    '["redes", "TCP/IP", "protocolos"]'::jsonb,
    'published',
    'O protocolo TCP garante a entrega ordenada e confiável dos pacotes de dados.',
    'true',
    'O TCP (Transmission Control Protocol) é um protocolo orientado à conexão que garante a entrega confiável, ordenada e sem erros dos dados.',
    '1',
    'Admin'
);

-- 8. DIGITE A RESPOSTA - Interpretação de Texto
INSERT INTO flashcards (
    id, type, difficulty, category, subcategory, tags, status,
    question, answer, hint, author_id, author_name
) VALUES (
    'flash_test_008',
    'type_answer',
    'medium',
    'Português',
    'Interpretação de Texto',
    '["figuras de linguagem", "interpretação", "literatura"]'::jsonb,
    'published',
    'Qual é a figura de linguagem que consiste em atribuir características humanas a seres inanimados?',
    'prosopopeia',
    'Também conhecida como personificação',
    '1',
    'Admin'
);

-- 9. OCLUSÃO DE IMAGEM - Segurança da Informação
INSERT INTO flashcards (
    id, type, difficulty, category, subcategory, tags, status,
    image, occlusion_areas, author_id, author_name
) VALUES (
    'flash_test_009',
    'image_occlusion',
    'easy',
    'Informática',
    'Segurança da Informação',
    '["segurança", "CIA", "conceitos básicos"]'::jsonb,
    'published',
    'https://via.placeholder.com/600x400/1a1a2e/ffffff?text=Pilares+da+Seguranca',
    '[
        {
            "id": "area1",
            "type": "rect",
            "x": 10,
            "y": 50,
            "width": 180,
            "height": 80,
            "answer": "Confidencialidade"
        },
        {
            "id": "area2",
            "type": "rect",
            "x": 210,
            "y": 50,
            "width": 180,
            "height": 80,
            "answer": "Integridade"
        },
        {
            "id": "area3",
            "type": "rect",
            "x": 410,
            "y": 50,
            "width": 180,
            "height": 80,
            "answer": "Disponibilidade"
        }
    ]'::jsonb,
    '1',
    'Admin'
);

-- 10. MÚLTIPLA ESCOLHA - Direito Constitucional
INSERT INTO flashcards (
    id, type, difficulty, category, subcategory, tags, status,
    question, options, correct, explanation, author_id, author_name
) VALUES (
    'flash_test_010',
    'multiple_choice',
    'easy',
    'Direito',
    'Direito Constitucional',
    '["constituição", "fundamentos", "art. 1º"]'::jsonb,
    'published',
    'Quantos são os fundamentos da República Federativa do Brasil previstos no Art. 1º da CF/88?',
    '["3", "4", "5", "6"]'::jsonb,
    2,
    'São 5 fundamentos: soberania, cidadania, dignidade da pessoa humana, valores sociais do trabalho e da livre iniciativa, e pluralismo político.',
    '1',
    'Admin'
);

-- Atualizar os decks com os IDs corretos dos flashcards
UPDATE flashcard_decks SET flashcard_ids = '["flash_test_001", "flash_test_006", "flash_test_010"]'::jsonb 
WHERE name = 'Direito para Concursos';

UPDATE flashcard_decks SET flashcard_ids = '["flash_test_002", "flash_test_007", "flash_test_009"]'::jsonb 
WHERE name = 'Informática - Fundamentos';

UPDATE flashcard_decks SET flashcard_ids = '["flash_test_003", "flash_test_004", "flash_test_005", "flash_test_008"]'::jsonb 
WHERE name = 'Português Completo';

-- Verificar resultados
SELECT 'Flashcards criados:' as info;
SELECT id, type, category, subcategory FROM flashcards ORDER BY id;

SELECT 'Decks atualizados:' as info;
SELECT name, flashcard_ids FROM flashcard_decks ORDER BY name;