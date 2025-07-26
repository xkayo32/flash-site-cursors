-- Adicionar coluna thumbnail_file_path à tabela courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS thumbnail_file_path VARCHAR(500);

-- Adicionar comentário explicativo para a coluna
COMMENT ON COLUMN courses.thumbnail_file_path IS 'Caminho do arquivo da imagem do thumbnail armazenada localmente no servidor';

-- Criar índice para melhorar performance em queries que filtram por existência de arquivo
CREATE INDEX IF NOT EXISTS idx_courses_thumbnail_file_path 
ON courses(thumbnail_file_path) 
WHERE thumbnail_file_path IS NOT NULL;