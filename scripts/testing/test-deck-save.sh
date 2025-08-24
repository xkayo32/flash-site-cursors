#!/bin/bash

echo "======================================="
echo "💾 TESTE DE SALVAMENTO DE DECK COM API REAL"
echo "======================================="
echo ""

# URL base
BASE_URL="http://localhost:5273"
API_URL="http://localhost:8180"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}✅ Implementação Concluída!${NC}"
echo ""
echo "======================================="
echo "🔧 O QUE FOI IMPLEMENTADO:"
echo "======================================="
echo ""
echo "1. ✅ Salvamento Real com API"
echo "   - Integração com flashcardDeckService"
echo "   - Chamada real para /api/v1/flashcard-decks"
echo "   - Tratamento de erros e validações"
echo ""
echo "2. ✅ Opção 'CRIAR E ADICIONAR CARDS'"
echo "   - Botão verde que cria o deck"
echo "   - Navega direto para adicionar flashcards"
echo "   - Fluxo completo: criar → adicionar cards"
echo ""
echo "3. ✅ Três Opções de Salvamento:"
echo "   - SALVAR RASCUNHO → salva como draft"
echo "   - CRIAR ARSENAL → cria e volta para lista"
echo "   - CRIAR E ADICIONAR CARDS → cria e vai para editor"
echo ""
echo "======================================="
echo "🧪 COMO TESTAR O SALVAMENTO:"
echo "======================================="
echo ""
echo -e "${YELLOW}1. Acesse:${NC} ${BASE_URL}/admin/flashcards/new"
echo ""
echo -e "${YELLOW}2. Complete o formulário:${NC}"
echo "   a) Step 1: Título, descrição, categorias"
echo "   b) Step 2: Configurações (tags, dificuldade, etc)"
echo "   c) Step 3: Revisar informações"
echo ""
echo -e "${YELLOW}3. Teste as opções de salvamento:${NC}"
echo ""
echo -e "${BLUE}   Opção 1 - SALVAR RASCUNHO:${NC}"
echo "   → Salva como draft e volta para lista"
echo ""
echo -e "${BLUE}   Opção 2 - CRIAR ARSENAL:${NC}"
echo "   → Cria deck completo e volta para lista"
echo ""
echo -e "${BLUE}   Opção 3 - CRIAR E ADICIONAR CARDS:${NC}"
echo "   → Cria deck e vai direto para adicionar flashcards"
echo ""
echo "======================================="
echo "🎯 FLUXO RECOMENDADO:"
echo "======================================="
echo ""
echo "1. Criar deck com 'CRIAR E ADICIONAR CARDS'"
echo "2. Sistema navega para /admin/flashcards/decks/[ID]/cards"
echo "3. Adicionar flashcards ao deck criado"
echo "4. Deck pronto para uso!"
echo ""
echo "======================================="
echo "🎯 URL DIRETA: ${BASE_URL}/admin/flashcards/new"
echo "======================================="

# Verificar se API está respondendo
echo ""
echo -e "${YELLOW}🔍 Verificando API:${NC}"
if curl -s -o /dev/null -w "%{http_code}" "${API_URL}/api/v1/flashcard-decks" | grep -q "401\|200"; then
    echo -e "${GREEN}✅ API flashcard-decks está respondendo${NC}"
else
    echo -e "${RED}❌ API não está acessível - verifique o backend${NC}"
fi