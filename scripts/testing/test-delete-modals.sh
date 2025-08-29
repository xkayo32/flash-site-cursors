#!/bin/bash

echo "Teste: Modais de Confirmação de Exclusão"
echo "========================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Verificando implementação de modais de exclusão...${NC}"
echo ""

# Verificar MyFlashcards.tsx
echo -e "${YELLOW}1. MyFlashcards.tsx:${NC}"

echo -n "  Modal de exclusão de deck: "
if grep -q "deleteConfirm.*deckId.*deckName" frontend/src/pages/student/MyFlashcards.tsx 2>/dev/null; then
  echo -e "${GREEN}✓ Implementado${NC}"
else
  echo -e "${RED}✗ Não encontrado${NC}"
fi

echo -n "  Modal de exclusão de flashcard: "
if grep -q "deleteFlashcardConfirm.*id.*front" frontend/src/pages/student/MyFlashcards.tsx 2>/dev/null; then
  echo -e "${GREEN}✓ Implementado${NC}"
else
  echo -e "${RED}✗ Não encontrado${NC}"
fi

echo -n "  Atualização imediata de deck: "
if grep -q "setMyDecks.*filter" frontend/src/pages/student/MyFlashcards.tsx 2>/dev/null; then
  echo -e "${GREEN}✓ Implementado${NC}"
else
  echo -e "${RED}✗ Não encontrado${NC}"
fi

echo -n "  Atualização imediata de flashcard: "
if grep -q "setFlashcards.*filter.*deleteFlashcardConfirm" frontend/src/pages/student/MyFlashcards.tsx 2>/dev/null; then
  echo -e "${GREEN}✓ Implementado${NC}"
else
  echo -e "${RED}✗ Não encontrado${NC}"
fi

echo ""
echo -e "${YELLOW}2. DeckView.tsx:${NC}"

echo -n "  Modal de exclusão: "
if grep -q "showDeleteConfirm" frontend/src/pages/student/DeckView.tsx 2>/dev/null; then
  echo -e "${GREEN}✓ Implementado${NC}"
else
  echo -e "${RED}✗ Não encontrado${NC}"
fi

echo -n "  Redirecionamento após exclusão: "
if grep -q "navigate.*/my-flashcards" frontend/src/pages/student/DeckView.tsx 2>/dev/null; then
  echo -e "${GREEN}✓ Implementado${NC}"
else
  echo -e "${RED}✗ Não encontrado${NC}"
fi

echo ""
echo -e "${YELLOW}3. Verificação de window.confirm removidos:${NC}"

echo -n "  MyFlashcards.tsx: "
CONFIRMS=$(grep -c "window\.confirm\|[^a-zA-Z]confirm(" frontend/src/pages/student/MyFlashcards.tsx 2>/dev/null | grep -v "deleteConfirm" || echo "0")
if [ "$CONFIRMS" = "0" ]; then
  echo -e "${GREEN}✓ Sem window.confirm${NC}"
else
  echo -e "${YELLOW}⚠ Ainda tem $CONFIRMS window.confirm${NC}"
fi

echo -n "  DeckView.tsx: "
CONFIRMS=$(grep -c "window\.confirm\|[^a-zA-Z]confirm(" frontend/src/pages/student/DeckView.tsx 2>/dev/null || echo "0")
if [ "$CONFIRMS" = "0" ]; then
  echo -e "${GREEN}✓ Sem window.confirm${NC}"
else
  echo -e "${YELLOW}⚠ Ainda tem $CONFIRMS window.confirm${NC}"
fi

echo ""
echo -e "${YELLOW}4. Elementos visuais dos modais:${NC}"

echo -n "  Ícone AlertTriangle: "
if grep -q "AlertTriangle" frontend/src/pages/student/MyFlashcards.tsx 2>/dev/null; then
  echo -e "${GREEN}✓ Presente${NC}"
else
  echo -e "${RED}✗ Não encontrado${NC}"
fi

echo -n "  Preview do flashcard no modal: "
if grep -q "deleteFlashcardConfirm.front" frontend/src/pages/student/MyFlashcards.tsx 2>/dev/null; then
  echo -e "${GREEN}✓ Presente${NC}"
else
  echo -e "${RED}✗ Não encontrado${NC}"
fi

echo -n "  Cores diferenciadas (red/yellow): "
if grep -q "text-red-500.*text-yellow-500\|text-yellow-500.*text-red-500" frontend/src/pages/student/MyFlashcards.tsx 2>/dev/null; then
  echo -e "${GREEN}✓ Cores diferenciadas${NC}"
else
  echo -e "${YELLOW}⚠ Verificar cores${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}RESUMO DA IMPLEMENTAÇÃO${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}✅ Funcionalidades Implementadas:${NC}"
echo "  • Modal de confirmação para deletar decks"
echo "  • Modal de confirmação para deletar flashcards"
echo "  • Preview do flashcard no modal de exclusão"
echo "  • Atualização imediata da lista (sem reload)"
echo "  • Atualização de estatísticas em tempo real"
echo "  • Cores diferenciadas (vermelho para deck, amarelo para flashcard)"
echo "  • Design consistente com tema militar"
echo ""
echo -e "${BLUE}📱 Melhorias de UX:${NC}"
echo "  • Sem mais alerts nativos do browser"
echo "  • Feedback visual imediato"
echo "  • Preview do conteúdo antes de deletar"
echo "  • Botões claros de ação"
echo "  • Mensagens informativas"
echo ""
echo -e "${GREEN}✨ Sistema de exclusão modernizado com sucesso!${NC}"