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
    END IF;
END $$;