#!/bin/bash

# Script de teste para páginas admin
# Testa funcionalidades e integração com APIs

echo "=== 🎯 TESTE DE PÁGINAS ADMIN ==="
echo ""

# Configurações
API_URL="http://173.208.151.106:8180/api/v1"
FRONTEND_URL="http://173.208.151.106:5273"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Login e obter token
echo "🔐 Fazendo login como admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@studypro.com","password":"Admin@123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Erro ao fazer login${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Login realizado com sucesso${NC}"
echo ""

# Função para testar endpoint
test_endpoint() {
    local METHOD=$1
    local ENDPOINT=$2
    local DESCRIPTION=$3
    local DATA=$4
    
    echo "📡 Testando: $DESCRIPTION"
    echo "   Endpoint: $METHOD $ENDPOINT"
    
    if [ "$METHOD" = "GET" ]; then
        RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$API_URL$ENDPOINT" \
          -H "Authorization: Bearer $TOKEN")
    else
        RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X $METHOD "$API_URL$ENDPOINT" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d "$DATA")
    fi
    
    HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
    
    if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
        echo -e "   ${GREEN}✅ Status: $HTTP_STATUS${NC}"
        
        # Verificar se tem dados
        if echo "$BODY" | grep -q '"data":\[\]' || echo "$BODY" | grep -q '"data":null'; then
            echo -e "   ${YELLOW}⚠️  Sem dados retornados${NC}"
        else
            echo -e "   ${GREEN}✅ Dados recebidos${NC}"
        fi
    else
        echo -e "   ${RED}❌ Status: $HTTP_STATUS${NC}"
        echo "   Response: $(echo $BODY | head -c 200)"
    fi
    
    echo ""
    return $HTTP_STATUS
}

# ==========================================
# TESTES POR PÁGINA
# ==========================================

echo "=== 📊 1. DASHBOARD ==="
test_endpoint "GET" "/dashboard/stats" "Estatísticas do Dashboard"
test_endpoint "GET" "/dashboard/activities" "Atividades Recentes"
test_endpoint "GET" "/dashboard/performance" "Métricas de Performance"

echo "=== 👥 2. USUÁRIOS ==="
test_endpoint "GET" "/users" "Listar Usuários"
test_endpoint "GET" "/users?page=1&limit=10" "Listar Usuários com Paginação"

echo "=== 📚 3. CURSOS ==="
test_endpoint "GET" "/courses" "Listar Cursos"
test_endpoint "GET" "/courses?status=published" "Cursos Publicados"

echo "=== 🏷️ 4. CATEGORIAS ==="
test_endpoint "GET" "/categories" "Listar Categorias"

echo "=== ❓ 5. QUESTÕES ==="
test_endpoint "GET" "/questions" "Listar Questões"
test_endpoint "GET" "/questions?page=1&limit=10" "Questões com Paginação"

echo "=== 🎴 6. FLASHCARDS ==="
test_endpoint "GET" "/flashcards" "Listar Flashcards"
test_endpoint "GET" "/flashcard-decks" "Listar Arsenais"

echo "=== 📝 7. SIMULADOS ==="
test_endpoint "GET" "/mockexams" "Listar Simulados"
test_endpoint "GET" "/mockexams/available" "Simulados Disponíveis"

echo "=== 📋 8. PROVAS ANTERIORES ==="
test_endpoint "GET" "/previousexams" "Listar Provas Anteriores"

echo "=== 📖 9. RESUMOS ==="
test_endpoint "GET" "/summaries" "Listar Resumos"

echo "=== ⚖️ 10. LEGISLAÇÃO ==="
test_endpoint "GET" "/legislation" "Listar Legislações"
test_endpoint "GET" "/legislation/types" "Tipos de Legislação"

echo "=== ⚙️ 11. CONFIGURAÇÕES ==="
test_endpoint "GET" "/settings" "Configurações do Sistema"
test_endpoint "GET" "/settings/user" "Configurações do Usuário"

echo "=== 📊 12. ANALYTICS ==="
test_endpoint "GET" "/analytics" "Analytics Geral"

echo "=== 💬 13. COMENTÁRIOS ==="
test_endpoint "GET" "/comments" "Listar Comentários"

echo "=== 📅 14. AGENDA ==="
test_endpoint "GET" "/schedule/tasks" "Tarefas Agendadas"
test_endpoint "GET" "/schedule/events" "Eventos"

echo ""
echo "=== 📈 RESUMO DOS TESTES ==="
echo ""
echo "✅ Testes concluídos!"
echo ""
echo "Recomendações:"
echo "1. Verificar endpoints que retornaram erro ou sem dados"
echo "2. Popular banco de dados com dados de teste se necessário"
echo "3. Implementar endpoints faltantes no backend"
echo "4. Substituir dados hardcoded nas páginas do frontend"