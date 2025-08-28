#!/bin/bash

# Script para limpar todos os dados de teste (flashcards, decks, categorias)

echo "======================================="
echo "🧹 LIMPANDO DADOS DE TESTE"
echo "======================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações do banco
DB_HOST="localhost"
DB_PORT="5532"
DB_NAME="estudos_db"
DB_USER="estudos_user"
DB_PASS="estudos_pass"

echo -e "${YELLOW}Conectando ao banco de dados...${NC}"

# Limpar flashcards
echo -e "${YELLOW}Limpando flashcards...${NC}"
docker exec -i estudos-postgres psql -U $DB_USER -d $DB_NAME -c "DELETE FROM flashcards;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Flashcards limpos${NC}"
else
    echo -e "${RED}✗ Erro ao limpar flashcards${NC}"
fi

# Limpar flashcard_decks
echo -e "${YELLOW}Limpando decks...${NC}"
docker exec -i estudos-postgres psql -U $DB_USER -d $DB_NAME -c "DELETE FROM flashcard_decks;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Decks limpos${NC}"
else
    echo -e "${RED}✗ Erro ao limpar decks${NC}"
fi

# Limpar categorias (exceto as básicas do sistema)
echo -e "${YELLOW}Limpando categorias customizadas...${NC}"
docker exec -i estudos-postgres psql -U $DB_USER -d $DB_NAME -c "DELETE FROM categories WHERE type NOT IN ('subject', 'exam_board');" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Categorias customizadas limpas${NC}"
else
    echo -e "${RED}✗ Erro ao limpar categorias${NC}"
fi

# Resetar sequências
echo -e "${YELLOW}Resetando sequências...${NC}"
docker exec -i estudos-postgres psql -U $DB_USER -d $DB_NAME <<EOF
ALTER SEQUENCE flashcards_id_seq RESTART WITH 1;
ALTER SEQUENCE flashcard_decks_id_seq RESTART WITH 1;
EOF

echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}✅ LIMPEZA CONCLUÍDA COM SUCESSO${NC}"
echo -e "${GREEN}=======================================${NC}"

# Mostrar contagem atual
echo -e "\n${YELLOW}Contagem atual de dados:${NC}"
docker exec -i estudos-postgres psql -U $DB_USER -d $DB_NAME -t <<EOF
SELECT 'Flashcards: ' || COUNT(*) FROM flashcards
UNION ALL
SELECT 'Decks: ' || COUNT(*) FROM flashcard_decks
UNION ALL
SELECT 'Categorias: ' || COUNT(*) FROM categories;
EOF