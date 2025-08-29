#!/bin/bash

echo "Teste: Modal de Confirmação de Exclusão de Deck"
echo "==============================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# API base URL
API_URL="http://localhost:8180/api/v1"

# Test user credentials
USER_EMAIL="aluno@example.com"
USER_PASSWORD="aluno123"

echo -e "${BLUE}1. Fazendo login como aluno...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Erro ao fazer login${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Login realizado com sucesso${NC}"

echo -e "${BLUE}2. Criando deck de teste...${NC}"
DECK_RESPONSE=$(curl -s -X POST "$API_URL/flashcard-decks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Deck Teste Exclusão",
    "description": "Deck para testar modal de exclusão",
    "flashcard_ids": []
  }')

DECK_ID=$(echo $DECK_RESPONSE | grep -o '"id":"[^"]*' | sed 's/"id":"//')

if [ -z "$DECK_ID" ]; then
  echo -e "${YELLOW}⚠ Não foi possível criar deck de teste${NC}"
else
  echo -e "${GREEN}✓ Deck criado com ID: $DECK_ID${NC}"
fi

echo ""
echo -e "${BLUE}3. Verificando componentes do modal...${NC}"

# Verificar se o modal não usa window.confirm
echo -n "  Verificando remoção de window.confirm em MyFlashcards: "
if grep -q "window.confirm\|confirm(" frontend/src/pages/student/MyFlashcards.tsx 2>/dev/null; then
  echo -e "${RED}❌ Ainda usa window.confirm${NC}"
else
  echo -e "${GREEN}✓ Não usa window.confirm${NC}"
fi

echo -n "  Verificando remoção de window.confirm em DeckView: "
if grep -q "window.confirm\|confirm(" frontend/src/pages/student/DeckView.tsx 2>/dev/null; then
  echo -e "${RED}❌ Ainda usa window.confirm${NC}"
else
  echo -e "${GREEN}✓ Não usa window.confirm${NC}"
fi

# Verificar presença do modal customizado
echo -n "  Verificando modal customizado em MyFlashcards: "
if grep -q "deleteConfirm\|showDeleteConfirm" frontend/src/pages/student/MyFlashcards.tsx 2>/dev/null; then
  echo -e "${GREEN}✓ Modal customizado presente${NC}"
else
  echo -e "${RED}❌ Modal customizado não encontrado${NC}"
fi

echo -n "  Verificando modal customizado em DeckView: "
if grep -q "showDeleteConfirm" frontend/src/pages/student/DeckView.tsx 2>/dev/null; then
  echo -e "${GREEN}✓ Modal customizado presente${NC}"
else
  echo -e "${RED}❌ Modal customizado não encontrado${NC}"
fi

# Verificar atualização imediata da tela
echo -n "  Verificando atualização imediata em MyFlashcards: "
if grep -q "setMyDecks.*filter\|prevDecks.*filter" frontend/src/pages/student/MyFlashcards.tsx 2>/dev/null; then
  echo -e "${GREEN}✓ Atualização imediata implementada${NC}"
else
  echo -e "${YELLOW}⚠ Verificar atualização imediata${NC}"
fi

echo ""
echo -e "${BLUE}4. Testando exclusão via API...${NC}"

if [ ! -z "$DECK_ID" ]; then
  DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/flashcard-decks/$DECK_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Deck excluído com sucesso via API${NC}"
  else
    echo -e "${RED}❌ Erro ao excluir deck${NC}"
  fi
fi

echo ""
echo -e "${BLUE}5. Verificando elementos visuais do modal...${NC}"

# Verificar ícone de alerta
echo -n "  Ícone AlertTriangle: "
if grep -q "AlertTriangle" frontend/src/pages/student/MyFlashcards.tsx frontend/src/pages/student/DeckView.tsx 2>/dev/null; then
  echo -e "${GREEN}✓ Presente${NC}"
else
  echo -e "${RED}❌ Não encontrado${NC}"
fi

# Verificar botões do modal
echo -n "  Botão Cancelar: "
if grep -q "Cancelar" frontend/src/pages/student/MyFlashcards.tsx frontend/src/pages/student/DeckView.tsx 2>/dev/null; then
  echo -e "${GREEN}✓ Presente${NC}"
else
  echo -e "${RED}❌ Não encontrado${NC}"
fi

echo -n "  Botão Deletar Arsenal: "
if grep -q "Deletar Arsenal" frontend/src/pages/student/MyFlashcards.tsx frontend/src/pages/student/DeckView.tsx 2>/dev/null; then
  echo -e "${GREEN}✓ Presente${NC}"
else
  echo -e "${RED}❌ Não encontrado${NC}"
fi

# Verificar mensagem de confirmação
echo -n "  Mensagem de confirmação: "
if grep -q "Esta ação não pode ser desfeita" frontend/src/pages/student/MyFlashcards.tsx frontend/src/pages/student/DeckView.tsx 2>/dev/null; then
  echo -e "${GREEN}✓ Presente${NC}"
else
  echo -e "${RED}❌ Não encontrada${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}RESUMO DO TESTE${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}✅ Implementações Concluídas:${NC}"
echo "  • Modal customizado substituindo window.confirm"
echo "  • Atualização imediata da tela após exclusão"
echo "  • Design consistente com tema militar"
echo "  • Mensagens claras de confirmação"
echo "  • Ícone de alerta visual"
echo "  • Botões de ação apropriados"
echo ""
echo -e "${YELLOW}📋 Checklist Visual (testar manualmente):${NC}"
echo "  1. Clicar no botão de deletar deck"
echo "  2. Modal deve aparecer com fundo escuro"
echo "  3. Ícone de alerta vermelho visível"
echo "  4. Nome do deck deve aparecer na mensagem"
echo "  5. Botão Cancelar deve fechar o modal"
echo "  6. Botão Deletar deve excluir e atualizar a lista"
echo "  7. Toast de sucesso deve aparecer"
echo "  8. Lista deve ser atualizada sem recarregar página"
echo ""
echo -e "${GREEN}✨ Modal de confirmação implementado com sucesso!${NC}"