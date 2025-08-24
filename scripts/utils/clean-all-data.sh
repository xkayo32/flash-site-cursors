#!/bin/bash

echo "🧹 LIMPEZA COMPLETA DE DADOS"
echo "============================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠️  ATENÇÃO: Esta operação irá APAGAR TODOS os dados!${NC}"
echo "- Categorias"
echo "- Cursos"
echo "- Flashcards"
echo "- Decks"
echo ""
read -p "Tem certeza que deseja continuar? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}Operação cancelada.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Fazendo backup dos dados atuais...${NC}"

# Criar diretório de backup
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup dos arquivos JSON do backend Node
echo "Backup dos dados do backend Node.js..."
cp backend-node/data/categories.json "$BACKUP_DIR/" 2>/dev/null || echo "[]" > "$BACKUP_DIR/categories.json"
cp backend-node/data/courses.json "$BACKUP_DIR/" 2>/dev/null || echo "[]" > "$BACKUP_DIR/courses.json"
cp backend-node/data/flashcards.json "$BACKUP_DIR/" 2>/dev/null || echo "[]" > "$BACKUP_DIR/flashcards.json"
cp backend-node/data/flashcard-decks.json "$BACKUP_DIR/" 2>/dev/null || echo "[]" > "$BACKUP_DIR/flashcard-decks.json"

echo -e "${GREEN}✅ Backup criado em: $BACKUP_DIR${NC}"
echo ""

echo -e "${RED}Limpando todos os dados...${NC}"

# Limpar categorias
echo "Limpando categorias..."
echo "[]" > backend-node/data/categories.json

# Limpar cursos
echo "Limpando cursos..."
echo "[]" > backend-node/data/courses.json

# Limpar flashcards
echo "Limpando flashcards..."
echo "[]" > backend-node/data/flashcards.json

# Limpar decks
echo "Limpando decks..."
echo "[]" > backend-node/data/flashcard-decks.json

echo ""
echo -e "${GREEN}✅ Limpeza completa realizada!${NC}"
echo ""
echo "Para restaurar os dados, use:"
echo "cp $BACKUP_DIR/*.json backend-node/data/"
echo ""