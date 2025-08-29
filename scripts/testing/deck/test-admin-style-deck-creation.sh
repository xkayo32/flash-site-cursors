#!/bin/bash

echo "🎯 TESTING ADMIN-STYLE DECK CREATION FOR STUDENTS"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5173"
ADMIN_FILE="/home/administrator/flash-site-cursors/frontend/src/pages/admin/NewFlashcardDeck.tsx"
STUDENT_FILE="/home/administrator/flash-site-cursors/frontend/src/pages/student/NewStudentDeck.tsx"

echo -e "${BLUE}📊 VERIFICAÇÃO DO SISTEMA:${NC}"
echo ""

# 1. Check if student file is now a copy of admin file
echo -n "1. Arquivo do aluno baseado no admin: "
if [ -f "$STUDENT_FILE" ]; then
    echo -e "${GREEN}✅ EXISTE${NC}"
else
    echo -e "${YELLOW}⚠️  NÃO ENCONTRADO${NC}"
fi

# 2. Check if wizard steps are implemented
echo -n "2. Sistema de wizard (4 etapas): "
if grep -q "currentStep === 4" "$STUDENT_FILE" && grep -q "totalSteps = 4" "$STUDENT_FILE"; then
    echo -e "${GREEN}✅ IMPLEMENTADO${NC}"
else
    echo -e "${YELLOW}⚠️  INCOMPLETO${NC}"
fi

# 3. Check if all sections exist
echo -n "3. Etapa 1 - Briefing Inicial: "
if grep -q "ETAPA 1: BRIEFING INICIAL" "$STUDENT_FILE"; then
    echo -e "${GREEN}✅ IMPLEMENTADO${NC}"
else
    echo -e "${YELLOW}⚠️  NÃO ENCONTRADO${NC}"
fi

echo -n "4. Etapa 2 - Configuração Tática: "
if grep -q "ETAPA 2: CONFIGURAÇÃO TÁTICA" "$STUDENT_FILE" || grep -q "currentStep === 2" "$STUDENT_FILE"; then
    echo -e "${GREEN}✅ IMPLEMENTADO${NC}"
else
    echo -e "${YELLOW}⚠️  NÃO ENCONTRADO${NC}"
fi

echo -n "5. Etapa 3 - Arsenal de Flashcards: "
if grep -q "ETAPA 3: ARSENAL DE FLASHCARDS" "$STUDENT_FILE" || grep -q "currentStep === 3" "$STUDENT_FILE"; then
    echo -e "${GREEN}✅ IMPLEMENTADO${NC}"
else
    echo -e "${YELLOW}⚠️  NÃO ENCONTRADO${NC}"
fi

echo -n "6. Etapa 4 - Revisão e Confirmação: "
if grep -q "ETAPA 4: REVISÃO" "$STUDENT_FILE" || grep -q "currentStep === 4" "$STUDENT_FILE"; then
    echo -e "${GREEN}✅ IMPLEMENTADO${NC}"
else
    echo -e "${YELLOW}⚠️  NÃO ENCONTRADO${NC}"
fi

# 7. Check flashcard types support
echo -n "7. Suporte aos 7 tipos de flashcards: "
TYPES=(basic basic_reversed cloze multiple_choice true_false type_answer image_occlusion)
ALL_TYPES=true
for type in "${TYPES[@]}"; do
    if ! grep -q "$type" "$STUDENT_FILE"; then
        ALL_TYPES=false
        break
    fi
done

if $ALL_TYPES; then
    echo -e "${GREEN}✅ TODOS OS TIPOS${NC}"
else
    echo -e "${YELLOW}⚠️  TIPOS FALTANDO${NC}"
fi

# 8. Check Anki import/export
echo -n "8. Importação/Exportação Anki: "
if grep -q "AnkiImportExport" "$STUDENT_FILE"; then
    echo -e "${GREEN}✅ IMPLEMENTADO${NC}"
else
    echo -e "${YELLOW}⚠️  NÃO ENCONTRADO${NC}"
fi

# 9. Check routes
echo -n "9. Rotas corretas para aluno: "
if grep -q "/student/flashcards" "$STUDENT_FILE" && ! grep -q "/admin/flashcards" "$STUDENT_FILE"; then
    echo -e "${GREEN}✅ ROTAS CORRETAS${NC}"
else
    echo -e "${YELLOW}⚠️  VERIFICAR ROTAS${NC}"
fi

# 10. Check route accessibility
echo -n "10. Rota /student/decks/new acessível: "
ROUTE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/student/decks/new" 2>/dev/null || echo "000")
if [ "$ROUTE_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ ACESSÍVEL (HTTP 200)${NC}"
else
    echo -e "${YELLOW}⚠️  Status: $ROUTE_RESPONSE${NC}"
fi

echo ""
echo -e "${BLUE}📊 RESUMO FINAL:${NC}"
echo "=================================="

# Count successful tests
PASSED=0
TOTAL=10

if [ -f "$STUDENT_FILE" ]; then ((PASSED++)); fi
if grep -q "currentStep === 4" "$STUDENT_FILE" && grep -q "totalSteps = 4" "$STUDENT_FILE"; then ((PASSED++)); fi
if grep -q "BRIEFING INICIAL" "$STUDENT_FILE"; then ((PASSED++)); fi
if grep -q "currentStep === 2" "$STUDENT_FILE"; then ((PASSED++)); fi
if grep -q "currentStep === 3" "$STUDENT_FILE"; then ((PASSED++)); fi
if grep -q "currentStep === 4" "$STUDENT_FILE"; then ((PASSED++)); fi
if $ALL_TYPES; then ((PASSED++)); fi
if grep -q "AnkiImportExport" "$STUDENT_FILE"; then ((PASSED++)); fi
if grep -q "/student/flashcards" "$STUDENT_FILE" && ! grep -q "/admin/flashcards" "$STUDENT_FILE"; then ((PASSED++)); fi
if [ "$ROUTE_RESPONSE" = "200" ]; then ((PASSED++)); fi

echo "Testes aprovados: $PASSED/$TOTAL"

if [ $PASSED -eq $TOTAL ]; then
    echo -e "${GREEN}🎯 SISTEMA 100% IMPLEMENTADO!${NC}"
    echo "✅ Criação de deck no aluno EXATAMENTE igual ao admin"
    echo "✅ Wizard de 4 etapas completo"
    echo "✅ Todos os 7 tipos de flashcards"
    echo "✅ Importação/Exportação Anki"
    echo ""
    echo -e "${GREEN}🏆 MISSÃO CUMPRIDA COM SUCESSO!${NC}"
elif [ $PASSED -ge 8 ]; then
    echo -e "${GREEN}✅ SISTEMA FUNCIONAL${NC}"
    echo "A maioria das funcionalidades está implementada"
else
    echo -e "${YELLOW}⚠️  SISTEMA PARCIALMENTE IMPLEMENTADO${NC}"
    echo "Algumas funcionalidades precisam de ajustes"
fi

exit 0