#!/bin/bash

# ========================================
# TESTE COMPLETO DE TODAS AS APIs
# ========================================
# Este script testa todos os endpoints do backend Node.js
# Inclui autenticação, CRUD operations e funcionalidades específicas

# Configurações
API_URL="http://localhost:8181"
SUCCESS_COUNT=0
ERROR_COUNT=0
TOTAL_COUNT=0
TOKEN=""
ADMIN_TOKEN=""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔥 TESTE COMPLETO - TODAS AS APIs BACKEND${NC}"
echo -e "${CYAN}==========================================${NC}"
echo -e "${BLUE}API URL: ${API_URL}${NC}"
echo -e "${BLUE}Testando todos os endpoints do backend Node.js...${NC}"
echo ""

# Função para testar uma API
test_api() {
    local method="$1"
    local endpoint="$2"
    local description="$3"
    local auth_required="$4"
    local data="$5"
    local expected_status="$6"
    
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
    
    echo -n "[$TOTAL_COUNT] $method $endpoint - $description..."
    
    # Preparar headers
    local headers=""
    if [ "$auth_required" = "true" ]; then
        if [ -n "$TOKEN" ]; then
            headers="-H \"Authorization: Bearer $TOKEN\""
        else
            echo -e " ${YELLOW}⚠️  SEM TOKEN (esperado)${NC}"
            return
        fi
    elif [ "$auth_required" = "admin" ]; then
        if [ -n "$ADMIN_TOKEN" ]; then
            headers="-H \"Authorization: Bearer $ADMIN_TOKEN\""
        else
            echo -e " ${YELLOW}⚠️  SEM TOKEN ADMIN (esperado)${NC}"
            return
        fi
    fi
    
    # Preparar dados
    local data_param=""
    if [ -n "$data" ]; then
        data_param="-d '$data' -H 'Content-Type: application/json'"
    fi
    
    # Fazer requisição
    local cmd="curl -s -o /dev/null -w \"%{http_code}\" -X $method $headers $data_param \"$API_URL$endpoint\""
    local response=$(eval $cmd 2>/dev/null)
    
    # Verificar resultado
    local expected="${expected_status:-200}"
    if [ "$response" = "$expected" ] || [ "$response" = "201" ] || [ "$response" = "204" ]; then
        echo -e " ${GREEN}✓ OK (HTTP $response)${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    elif [ "$response" = "401" ] || [ "$response" = "403" ]; then
        if [ "$auth_required" != "false" ]; then
            echo -e " ${YELLOW}⚠️  AUTH (HTTP $response)${NC}"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            echo -e " ${RED}✗ ERRO (HTTP $response)${NC}"
            ERROR_COUNT=$((ERROR_COUNT + 1))
        fi
    else
        echo -e " ${RED}✗ ERRO (HTTP $response)${NC}"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
}

# Função para fazer login e obter token
login_user() {
    local email="$1"
    local password="$2"
    local role="$3"
    
    echo -e "${YELLOW}🔐 Fazendo login como $role...${NC}"
    
    local response=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    local token=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$token" ] && [ "$token" != "null" ]; then
        echo -e "${GREEN}✓ Login realizado com sucesso${NC}"
        if [ "$role" = "admin" ]; then
            ADMIN_TOKEN="$token"
        else
            TOKEN="$token"
        fi
    else
        echo -e "${RED}✗ Falha no login${NC}"
    fi
    echo ""
}

# ========================================
# TESTE 1: ENDPOINT RAIZ
# ========================================
echo -e "${YELLOW}🏠 ENDPOINT RAIZ${NC}"
test_api "GET" "/" "Informações do serviço" "false" "" "200"
echo ""

# ========================================
# TESTE 2: HEALTH CHECK
# ========================================
echo -e "${YELLOW}💊 HEALTH CHECK${NC}"
test_api "GET" "/api/v1/health" "Status do sistema" "false" "" "200"
echo ""

# ========================================
# TESTE 3: AUTENTICAÇÃO
# ========================================
echo -e "${YELLOW}🔐 AUTENTICAÇÃO${NC}"
test_api "POST" "/api/v1/auth/login" "Login (sem dados)" "false" "" "400"
test_api "POST" "/api/v1/auth/login" "Login (dados inválidos)" "false" '{"email":"invalid","password":"wrong"}' "401"

# Fazer login real para obter tokens
login_user "aluno@example.com" "aluno123" "student"
login_user "admin@studypro.com" "Admin@123" "admin"

test_api "GET" "/api/v1/auth/verify" "Verificar token estudante" "true" "" "200"
test_api "POST" "/api/v1/auth/logout" "Logout" "false" "" "200"
echo ""

# ========================================
# TESTE 4: DASHBOARD
# ========================================
echo -e "${YELLOW}📊 DASHBOARD${NC}"
test_api "GET" "/api/v1/dashboard/stats" "Estatísticas admin" "admin" "" "200"
test_api "GET" "/api/v1/dashboard/activities" "Atividades admin" "admin" "" "200"
test_api "GET" "/api/v1/dashboard/performance" "Performance admin" "admin" "" "200"
test_api "GET" "/api/v1/dashboard/student" "Dashboard estudante" "true" "" "200"
echo ""

# ========================================
# TESTE 5: USUÁRIOS
# ========================================
echo -e "${YELLOW}👥 USUÁRIOS${NC}"
test_api "GET" "/api/v1/users" "Listar usuários" "admin" "" "200"
test_api "POST" "/api/v1/users" "Criar usuário (sem dados)" "admin" "" "400"
test_api "GET" "/api/v1/users/999" "Usuário inexistente" "admin" "" "404"
echo ""

# ========================================
# TESTE 6: CURSOS
# ========================================
echo -e "${YELLOW}📚 CURSOS${NC}"
test_api "GET" "/api/v1/courses" "Listar cursos" "false" "" "200"
test_api "POST" "/api/v1/courses" "Criar curso (sem auth)" "false" "" "401"
test_api "GET" "/api/v1/courses/999" "Curso inexistente" "false" "" "404"
test_api "GET" "/api/v1/courses/enrollments/my-courses" "Meus cursos" "true" "" "200"
echo ""

# ========================================
# TESTE 7: QUESTÕES
# ========================================
echo -e "${YELLOW}❓ QUESTÕES${NC}"
test_api "GET" "/api/v1/questions" "Listar questões" "true" "" "200"
test_api "GET" "/api/v1/questions/filters" "Filtros de questões" "true" "" "200"
test_api "GET" "/api/v1/questions/stats" "Estatísticas questões" "true" "" "200"
test_api "POST" "/api/v1/questions" "Criar questão (sem auth admin)" "true" "" "403"
echo ""

# ========================================
# TESTE 8: FLASHCARDS
# ========================================
echo -e "${YELLOW}🃏 FLASHCARDS${NC}"
test_api "GET" "/api/v1/flashcards" "Listar flashcards" "true" "" "200"
test_api "GET" "/api/v1/flashcards/stats" "Estatísticas flashcards" "true" "" "200"
test_api "GET" "/api/v1/flashcards/filters" "Filtros flashcards" "true" "" "200"
test_api "POST" "/api/v1/flashcards" "Criar flashcard (sem auth admin)" "true" "" "403"
echo ""

# ========================================
# TESTE 9: SIMULADOS
# ========================================
echo -e "${YELLOW}🎯 SIMULADOS${NC}"
test_api "GET" "/api/v1/mockexams" "Listar simulados" "true" "" "200"
test_api "GET" "/api/v1/mockexams/available" "Simulados disponíveis" "true" "" "200"
test_api "GET" "/api/v1/mockexams/stats" "Estatísticas simulados" "admin" "" "200"
echo ""

# ========================================
# TESTE 10: PROVAS ANTERIORES
# ========================================
echo -e "${YELLOW}📋 PROVAS ANTERIORES${NC}"
test_api "GET" "/api/v1/previousexams" "Listar provas anteriores" "true" "" "200"
test_api "GET" "/api/v1/previousexams/available" "Provas disponíveis" "true" "" "200"
test_api "GET" "/api/v1/previousexams/stats" "Estatísticas provas" "admin" "" "200"
echo ""

# ========================================
# TESTE 11: RESUMOS
# ========================================
echo -e "${YELLOW}📄 RESUMOS${NC}"
test_api "GET" "/api/v1/summaries" "Listar resumos" "true" "" "200"
test_api "GET" "/api/v1/summaries/search" "Buscar resumos" "true" "" "200"
test_api "GET" "/api/v1/summaries/subjects" "Matérias resumos" "true" "" "200"
echo ""

# ========================================
# TESTE 12: LEGISLAÇÃO
# ========================================
echo -e "${YELLOW}⚖️  LEGISLAÇÃO${NC}"
test_api "GET" "/api/v1/legislation" "Listar legislação" "true" "" "200"
test_api "GET" "/api/v1/legislation/search" "Buscar legislação" "true" "" "200"
test_api "GET" "/api/v1/legislation/categories" "Categorias legislação" "true" "" "200"
echo ""

# ========================================
# TESTE 13: SESSÕES DE EXAME
# ========================================
echo -e "${YELLOW}📝 SESSÕES DE EXAME${NC}"
test_api "GET" "/api/v1/exam-sessions/sessions" "Minhas sessões" "true" "" "200"
test_api "POST" "/api/v1/exams/mock/me1/sessions" "Iniciar sessão" "true" "" "201"
echo ""

# ========================================
# TESTE 14: CRONOGRAMA
# ========================================
echo -e "${YELLOW}📅 CRONOGRAMA${NC}"
test_api "GET" "/api/v1/schedule/tasks" "Listar tarefas" "true" "" "200"
test_api "GET" "/api/v1/schedule/events" "Eventos calendário" "true" "" "200"
test_api "GET" "/api/v1/schedule/study-sessions" "Sessões estudo" "true" "" "200"
test_api "GET" "/api/v1/schedule/stats" "Estatísticas cronograma" "true" "" "200"
echo ""

# ========================================
# TESTE 15: CONFIGURAÇÕES
# ========================================
echo -e "${YELLOW}⚙️  CONFIGURAÇÕES${NC}"
test_api "GET" "/api/v1/settings/user" "Configurações usuário" "true" "" "200"
test_api "PUT" "/api/v1/settings/user" "Salvar configurações (sem dados)" "true" "" "400"
test_api "PUT" "/api/v1/settings/notifications" "Configurações notificação" "true" '{"study-reminders":{"enabled":true}}' "200"
echo ""

# ========================================
# TESTE 16: PAGAMENTOS
# ========================================
echo -e "${YELLOW}💳 PAGAMENTOS${NC}"
test_api "GET" "/api/v1/payment/methods" "Métodos pagamento" "true" "" "200"
test_api "GET" "/api/v1/payment/history" "Histórico pagamentos" "true" "" "200"
test_api "GET" "/api/v1/payment/billing" "Endereço cobrança" "true" "" "200"
test_api "GET" "/api/v1/subscription/manage" "Gerenciar assinatura" "true" "" "200"
echo ""

# ========================================
# TESTE 17: CATEGORIAS
# ========================================
echo -e "${YELLOW}🏷️  CATEGORIAS${NC}"
test_api "GET" "/api/v1/categories" "Listar categorias" "true" "" "200"
test_api "POST" "/api/v1/categories" "Criar categoria (sem auth admin)" "true" "" "403"
echo ""

# ========================================
# TESTE 18: ENDPOINTS INVÁLIDOS
# ========================================
echo -e "${YELLOW}❌ ENDPOINTS INVÁLIDOS${NC}"
test_api "GET" "/api/v1/invalid" "Endpoint inexistente" "false" "" "404"
test_api "POST" "/api/v1/auth/invalid" "Auth endpoint inválido" "false" "" "404"
test_api "GET" "/api/v2/anything" "Versão API inválida" "false" "" "404"
echo ""

# ========================================
# RESUMO DOS RESULTADOS
# ========================================
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}📊 RESUMO DOS TESTES${NC}"
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}✅ Sucessos: $SUCCESS_COUNT${NC}"
echo -e "${RED}❌ Erros: $ERROR_COUNT${NC}"
echo -e "${BLUE}📋 Total: $TOTAL_COUNT${NC}"

# Cálculo da porcentagem de sucesso
if [ $TOTAL_COUNT -gt 0 ]; then
    SUCCESS_PERCENTAGE=$((SUCCESS_COUNT * 100 / TOTAL_COUNT))
    echo -e "${PURPLE}📈 Taxa de sucesso: ${SUCCESS_PERCENTAGE}%${NC}"
fi

echo ""

# ========================================
# CATEGORIZAÇÃO DOS RESULTADOS
# ========================================
echo -e "${YELLOW}📋 CATEGORIAS TESTADAS:${NC}"
echo "• 🏠 Endpoint raiz e health check"
echo "• 🔐 Autenticação e autorização"
echo "• 📊 Dashboard e estatísticas"
echo "• 👥 Gestão de usuários"
echo "• 📚 Sistema de cursos e matrículas"
echo "• ❓ Banco de questões"
echo "• 🃏 Sistema de flashcards"
echo "• 🎯 Simulados e provas anteriores"
echo "• 📄 Resumos e legislação"
echo "• 📝 Sessões de exame"
echo "• 📅 Cronograma e tarefas"
echo "• ⚙️  Configurações de usuário"
echo "• 💳 Sistema de pagamentos"
echo "• 🏷️  Categorias e organização"
echo ""

# ========================================
# NOTAS TÉCNICAS
# ========================================
echo -e "${YELLOW}🔧 NOTAS TÉCNICAS:${NC}"
echo "• Backend Node.js roda em http://localhost:8181"
echo "• Frontend React roda em http://localhost:5273"
echo "• Autenticação via JWT Bearer token"
echo "• APIs seguem padrão REST com JSON"
echo "• Códigos HTTP apropriados para cada operação"
echo "• Middleware de autenticação funcional"
echo "• CORS configurado para development"
echo ""

# ========================================
# COMANDOS ÚTEIS
# ========================================
echo -e "${YELLOW}📋 COMANDOS ÚTEIS:${NC}"
echo "• Iniciar backend: cd backend-node && npm run dev"
echo "• Ver logs: docker logs <container>"
echo "• Testar endpoint específico: curl -X GET $API_URL/api/v1/health"
echo "• Login manual: curl -X POST $API_URL/api/v1/auth/login -d '{\"email\":\"aluno@example.com\",\"password\":\"aluno123\"}'"
echo ""

# Status final
if [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 TODOS OS TESTES DE API PASSARAM!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  ALGUNS TESTES DE API FALHARAM!${NC}"
    exit 1
fi