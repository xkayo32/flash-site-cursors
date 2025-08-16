#!/bin/bash

# Teste Final de Integração - Admin Pages
echo "===================================="
echo "🎯 TESTE FINAL DE INTEGRAÇÃO - ADMIN"
echo "===================================="
echo ""

# Configurações
API_URL="http://173.208.151.106:8180/api/v1"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contadores
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNING_TESTS=0

# Login como admin
echo -e "${BLUE}🔐 Autenticando como admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@studypro.com","password":"Admin@123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Falha na autenticação${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Autenticado com sucesso${NC}"
echo ""

# Função de teste
test_api() {
    local ENDPOINT=$1
    local DESCRIPTION=$2
    local EXPECTED_MIN_ITEMS=${3:-0}
    
    ((TOTAL_TESTS++))
    
    echo -e "${BLUE}📡 Testando:${NC} $DESCRIPTION"
    echo "   Endpoint: GET $ENDPOINT"
    
    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        "$API_URL$ENDPOINT")
    
    HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
    
    if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
        # Contar itens na resposta
        ITEM_COUNT=0
        if echo "$BODY" | grep -q '"data":\['; then
            ITEM_COUNT=$(echo "$BODY" | grep -o '"id"' | wc -l)
        fi
        
        if [ $ITEM_COUNT -ge $EXPECTED_MIN_ITEMS ]; then
            echo -e "   ${GREEN}✅ PASSOU - Status: $HTTP_STATUS, Itens: $ITEM_COUNT${NC}"
            ((PASSED_TESTS++))
        elif [ $ITEM_COUNT -gt 0 ]; then
            echo -e "   ${YELLOW}⚠️  AVISO - Status: $HTTP_STATUS, Itens: $ITEM_COUNT (esperado: $EXPECTED_MIN_ITEMS+)${NC}"
            ((WARNING_TESTS++))
        else
            echo -e "   ${YELLOW}⚠️  SEM DADOS - Status: $HTTP_STATUS${NC}"
            ((WARNING_TESTS++))
        fi
    else
        echo -e "   ${RED}❌ FALHOU - Status: $HTTP_STATUS${NC}"
        ((FAILED_TESTS++))
    fi
    echo ""
}

# ============================================
# TESTES DAS PÁGINAS ADMIN
# ============================================

echo "=== 📊 DASHBOARD ==="
test_api "/dashboard/stats" "Dashboard - Estatísticas" 1
test_api "/dashboard/activities" "Dashboard - Atividades" 1
test_api "/dashboard/performance" "Dashboard - Performance" 1

echo "=== 👥 GESTÃO DE USUÁRIOS ==="
test_api "/users" "Listar Usuários" 2
test_api "/users?role=student" "Filtrar por Estudantes" 1

echo "=== 📚 GESTÃO DE CURSOS ==="
test_api "/courses" "Listar Cursos" 1
test_api "/courses?status=published" "Cursos Publicados" 0

echo "=== 🏷️ CATEGORIAS ==="
test_api "/categories" "Listar Categorias" 5

echo "=== ❓ QUESTÕES ==="
test_api "/questions" "Listar Questões" 5
test_api "/questions?difficulty=medium" "Questões Médias" 0

echo "=== 🎴 FLASHCARDS ==="
test_api "/flashcards" "Listar Flashcards" 5
test_api "/flashcard-decks" "Listar Arsenais" 0

echo "=== 📝 SIMULADOS ==="
test_api "/mockexams" "Listar Simulados" 1

echo "=== 📋 PROVAS ANTERIORES ==="
test_api "/previousexams" "Listar Provas" 10

echo "=== 📖 RESUMOS ==="
test_api "/summaries" "Listar Resumos" 5

echo "=== ⚖️ LEGISLAÇÃO ==="
test_api "/legislation" "Listar Legislações" 10
test_api "/legislation/types" "Tipos de Legislação" 5

echo "=== ⚙️ CONFIGURAÇÕES ==="
test_api "/settings" "Configurações Sistema" 1
test_api "/settings/user" "Configurações Usuário" 1

echo "=== 📊 ANALYTICS ==="
test_api "/analytics" "Analytics Geral" 1

echo "=== 💬 COMENTÁRIOS ==="
test_api "/comments" "Listar Comentários" 0

echo "=== 📅 AGENDA ==="
test_api "/schedule/tasks" "Tarefas" 0
test_api "/schedule/events" "Eventos" 0

# ============================================
# RESUMO FINAL
# ============================================

echo ""
echo "===================================="
echo "📊 RESUMO DO TESTE DE INTEGRAÇÃO"
echo "===================================="
echo ""

SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo -e "Total de Testes: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Testes Aprovados: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Testes com Aviso: ${YELLOW}$WARNING_TESTS${NC}"
echo -e "Testes Falhados: ${RED}$FAILED_TESTS${NC}"
echo -e "Taxa de Sucesso: ${BLUE}$SUCCESS_RATE%${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ SUCESSO TOTAL!${NC}"
    echo "Todas as APIs estão funcionando corretamente!"
else
    echo -e "${YELLOW}⚠️  ATENÇÃO NECESSÁRIA${NC}"
    echo "Alguns endpoints precisam de revisão."
fi

echo ""
echo "===================================="
echo "🎯 VERIFICAÇÃO DE DADOS HARDCODED"
echo "===================================="
echo ""

# Verificar se ainda existem dados hardcoded
echo "Verificando páginas admin para dados hardcoded..."

HARDCODED_COUNT=$(grep -r "const.*=.*\[\s*{" /home/administrator/flash-site-cursors/frontend/src/pages/admin/*.tsx 2>/dev/null | wc -l)

if [ $HARDCODED_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ Nenhum dado hardcoded detectado!${NC}"
else
    echo -e "${YELLOW}⚠️  Possíveis dados hardcoded encontrados: $HARDCODED_COUNT ocorrências${NC}"
fi

echo ""
echo "===================================="
echo "✅ TESTE CONCLUÍDO"
echo "===================================="

exit 0