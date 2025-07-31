-- Adiciona um usuário aluno de teste
-- Senha: aluno123

-- Insere o usuário aluno
INSERT INTO users (email, password, role, status, name, email_verified_at, created_at, updated_at)
VALUES 
('aluno@example.com', '$2y$10$W8.1yEuQZKGsYGpLzXDVgONsGZJH1MbHG4sG/nZHOhRJBqVvO0KL.', 'student', 'active', 'Aluno Teste', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Cria o perfil do aluno
DO $$
DECLARE
    aluno_id INTEGER;
BEGIN
    SELECT id INTO aluno_id FROM users WHERE email = 'aluno@example.com';
    
    IF aluno_id IS NOT NULL THEN
        -- Insere o perfil
        INSERT INTO user_profiles (user_id, name, avatar_url, created_at, updated_at)
        VALUES (aluno_id, 'Aluno Teste', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO NOTHING;
        
        -- Insere uma assinatura básica
        INSERT INTO subscription_plans (name, price, features, max_questions, max_flashcards, max_simulations, created_at, updated_at)
        VALUES ('Básico', 29.90, '{"Acesso a 10.000 questões", "Flashcards básicos", "5 simulados por mês", "Relatórios simples"}', 10000, 500, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (name) DO NOTHING;
        
        -- Adiciona assinatura para o aluno
        INSERT INTO user_subscriptions (user_id, subscription_plan_id, started_at, expires_at, status, created_at, updated_at)
        SELECT 
            aluno_id,
            sp.id,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP + INTERVAL '30 days',
            'active',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        FROM subscription_plans sp
        WHERE sp.name = 'Básico'
        ON CONFLICT DO NOTHING;
    END IF;
END $$;