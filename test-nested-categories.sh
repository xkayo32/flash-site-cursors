#!/bin/bash

# Test script for nested category creation in flashcard deck

echo "======================================="
echo "🧪 TESTE DE CRIAÇÃO ANINHADA DE CATEGORIAS"
echo "======================================="
echo ""

# URL base
BASE_URL="http://localhost:5273"
API_URL="http://localhost:8180/api/v1"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se o frontend está rodando
echo "🔍 Verificando frontend..."
if curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}" | grep -q "200"; then
    echo -e "${GREEN}✅ Frontend rodando em ${BASE_URL}${NC}"
else
    echo -e "${RED}❌ Frontend não está acessível${NC}"
    exit 1
fi

# Verificar se o backend está rodando
echo "🔍 Verificando backend..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/categories")
if [ "$BACKEND_STATUS" -eq "200" ] || [ "$BACKEND_STATUS" -eq "401" ]; then
    echo -e "${GREEN}✅ Backend rodando em ${API_URL}${NC}"
else
    echo -e "${RED}❌ Backend não está acessível (Status: $BACKEND_STATUS)${NC}"
    exit 1
fi

echo ""
echo "======================================="
echo "📝 INSTRUÇÕES PARA TESTE MANUAL:"
echo "======================================="
echo ""
echo -e "${YELLOW}1. Acesse:${NC} ${BASE_URL}/admin/flashcards/new"
echo ""
echo -e "${YELLOW}2. Clique no botão:${NC} 'Abrir Criador de Categorias'"
echo ""
echo -e "${YELLOW}3. No modal que abrir, teste:${NC}"
echo "   a) Criar uma categoria principal (ex: 'Direito')"
echo "   b) Clicar no ícone 📁+ ao lado da categoria"
echo "   c) Criar uma subcategoria (ex: 'Direito Constitucional')"
echo "   d) Criar sub-subcategorias (ex: 'Direitos Fundamentais')"
echo "   e) Visualizar a árvore no lado direito"
echo "   f) Testar expand/collapse com as setas"
echo "   g) Clicar em 'Salvar Tudo no Banco'"
echo ""
echo -e "${YELLOW}4. Funcionalidades esperadas:${NC}"
echo "   ✓ Criar categorias em múltiplos níveis"
echo "   ✓ Visualizar estrutura em árvore"
echo "   ✓ Adicionar/remover categorias"
echo "   ✓ Expandir/colapsar nós da árvore"
echo "   ✓ Salvar tudo de uma vez"
echo ""
echo "======================================="
echo "🎯 URL DIRETA: ${BASE_URL}/admin/flashcards/new"
echo "======================================="

# Abrir no navegador se possível
if command -v xdg-open &> /dev/null; then
    echo ""
    echo "🌐 Abrindo no navegador..."
    xdg-open "${BASE_URL}/admin/flashcards/new" 2>/dev/null
fi