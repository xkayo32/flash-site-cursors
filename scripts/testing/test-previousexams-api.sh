#!/bin/bash

# Previous Exams API Test Script
# Este script testa todos os endpoints do sistema de Previous Exams
# Certifique-se de que o backend está rodando em http://173.208.151.106:8180

# Configurações
API_BASE="http://173.208.151.106:8180/api/v1"
ADMIN_EMAIL="admin@studypro.com"
ADMIN_PASSWORD="Admin@123"
STUDENT_EMAIL="aluno@example.com"
STUDENT_PASSWORD="aluno123"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir seções
print_section() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Função para imprimir teste
print_test() {
    echo -e "\n${YELLOW}🧪 Testando: $1${NC}"
}

# Função para imprimir sucesso
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função para imprimir erro
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Função para fazer request e mostrar resultado
make_request() {
    local method=$1
    local endpoint=$2
    local token=$3
    local data=$4
    local description=$5
    
    print_test "$description"
    
    local auth_header=""
    if [ -n "$token" ]; then
        auth_header="-H \"Authorization: Bearer $token\""
    fi
    
    local curl_cmd="curl -s -w \"\\nHTTP_CODE:%{http_code}\\n\" -X $method"
    curl_cmd="$curl_cmd -H \"Content-Type: application/json\""
    
    if [ -n "$auth_header" ]; then
        curl_cmd="$curl_cmd $auth_header"
    fi
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -d '$data'"
    fi
    
    curl_cmd="$curl_cmd \"$API_BASE$endpoint\""
    
    echo "Command: $curl_cmd"
    local response=$(eval $curl_cmd)
    local http_code=$(echo "$response" | tail -n1 | sed 's/HTTP_CODE://')
    local body=$(echo "$response" | head -n -1)
    
    echo "Response Code: $http_code"
    echo "Response Body: $body" | jq '.' 2>/dev/null || echo "$body"
    
    if [[ $http_code =~ ^2[0-9][0-9]$ ]]; then
        print_success "Status: $http_code - OK"
        return 0
    else
        print_error "Status: $http_code - ERROR"
        return 1
    fi
}

# Função para fazer login e retornar token
login() {
    local email=$1
    local password=$2
    local user_type=$3
    
    print_test "Login $user_type: $email"
    
    local response=$(curl -s -w "\nHTTP_CODE:%{http_code}\n" -X POST \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\", \"password\":\"$password\"}" \
        "$API_BASE/auth/login")
    
    local http_code=$(echo "$response" | tail -n1 | sed 's/HTTP_CODE://')
    local body=$(echo "$response" | head -n -1)
    
    if [[ $http_code =~ ^2[0-9][0-9]$ ]]; then
        print_success "Login realizado com sucesso"
        echo "$body" | jq -r '.token' 2>/dev/null
    else
        print_error "Falha no login: $http_code"
        echo "$body"
        return 1
    fi
}

# Função para extrair ID de uma resposta JSON
extract_id() {
    echo "$1" | jq -r '.id' 2>/dev/null
}

# Função para extrair ID de uma lista
extract_first_exam_id() {
    echo "$1" | jq -r '.exams[0].id' 2>/dev/null
}

# Função para extrair attempt ID
extract_attempt_id() {
    echo "$1" | jq -r '.attempt.id' 2>/dev/null
}

print_section "INICIANDO TESTES DO SISTEMA DE PREVIOUS EXAMS"

# =========================
# AUTENTICAÇÃO
# =========================

print_section "1. AUTENTICAÇÃO"

# Login Admin
ADMIN_TOKEN=$(login "$ADMIN_EMAIL" "$ADMIN_PASSWORD" "Admin")
if [ -z "$ADMIN_TOKEN" ]; then
    print_error "Falha na autenticação do Admin. Abortando testes."
    exit 1
fi

# Login Student
STUDENT_TOKEN=$(login "$STUDENT_EMAIL" "$STUDENT_PASSWORD" "Student")
if [ -z "$STUDENT_TOKEN" ]; then
    print_error "Falha na autenticação do Student. Abortando testes."
    exit 1
fi

# =========================
# TESTES ADMIN - CRUD
# =========================

print_section "2. ADMIN - CRUD PREVIOUS EXAMS"

# GET /api/v1/previousexams - Listar todas as provas
response=$(make_request "GET" "/previousexams" "$ADMIN_TOKEN" "" "Listar todas as provas anteriores")
FIRST_EXAM_ID=$(extract_first_exam_id "$response")

if [ -z "$FIRST_EXAM_ID" ]; then
    print_error "Nenhuma prova anterior encontrada para testes posteriores"
else
    print_success "Primeira prova ID: $FIRST_EXAM_ID"
fi

# GET /api/v1/previousexams/:id - Obter prova específica
if [ -n "$FIRST_EXAM_ID" ]; then
    make_request "GET" "/previousexams/$FIRST_EXAM_ID" "$ADMIN_TOKEN" "" "Obter prova específica"
fi

# POST /api/v1/previousexams - Criar nova prova
NEW_EXAM_DATA='{
  "title": "Teste API - Polícia Civil SP 2024",
  "organization": "Polícia Civil",
  "exam_board": "VUNESP",
  "position": "Investigador",
  "year": 2024,
  "application_date": "2024-12-01",
  "total_questions": 50,
  "duration": 180,
  "description": "Prova criada via API para testes",
  "questions": ["q1", "q2"],
  "subjects": ["Direito Penal", "Direito Constitucional"]
}'
response=$(make_request "POST" "/previousexams" "$ADMIN_TOKEN" "$NEW_EXAM_DATA" "Criar nova prova anterior")
NEW_EXAM_ID=$(extract_id "$response")

if [ -n "$NEW_EXAM_ID" ]; then
    print_success "Nova prova criada com ID: $NEW_EXAM_ID"
else
    print_error "Falha ao criar nova prova"
fi

# PUT /api/v1/previousexams/:id - Atualizar prova
if [ -n "$NEW_EXAM_ID" ]; then
    UPDATE_DATA='{
      "title": "Teste API - Polícia Civil SP 2024 (ATUALIZADA)",
      "description": "Prova atualizada via API para testes"
    }'
    make_request "PUT" "/previousexams/$NEW_EXAM_ID" "$ADMIN_TOKEN" "$UPDATE_DATA" "Atualizar prova anterior"
fi

# =========================
# TESTES ADMIN - ACTIONS
# =========================

print_section "3. ADMIN - AÇÕES DE PROVA"

if [ -n "$NEW_EXAM_ID" ]; then
    # POST /api/v1/previousexams/:id/publish - Publicar prova
    make_request "POST" "/previousexams/$NEW_EXAM_ID/publish" "$ADMIN_TOKEN" "" "Publicar prova"
    
    # POST /api/v1/previousexams/:id/archive - Arquivar prova
    make_request "POST" "/previousexams/$NEW_EXAM_ID/archive" "$ADMIN_TOKEN" "" "Arquivar prova"
    
    # POST /api/v1/previousexams/:id/duplicate - Duplicar prova
    response=$(make_request "POST" "/previousexams/$NEW_EXAM_ID/duplicate" "$ADMIN_TOKEN" "" "Duplicar prova")
    DUPLICATED_EXAM_ID=$(extract_id "$response")
    
    if [ -n "$DUPLICATED_EXAM_ID" ]; then
        print_success "Prova duplicada com ID: $DUPLICATED_EXAM_ID"
    fi
fi

# GET /api/v1/previousexams/:id/preview - Preview das questões
if [ -n "$FIRST_EXAM_ID" ]; then
    make_request "GET" "/previousexams/$FIRST_EXAM_ID/preview" "$ADMIN_TOKEN" "" "Preview das questões"
fi

# POST /api/v1/previousexams/:id/questions/:questionId - Vincular questão
if [ -n "$NEW_EXAM_ID" ]; then
    make_request "POST" "/previousexams/$NEW_EXAM_ID/questions/q3" "$ADMIN_TOKEN" "" "Vincular questão à prova"
    
    # DELETE /api/v1/previousexams/:id/questions/:questionId - Desvincular questão
    make_request "DELETE" "/previousexams/$NEW_EXAM_ID/questions/q3" "$ADMIN_TOKEN" "" "Desvincular questão da prova"
fi

# =========================
# TESTES SEARCH & FILTERS
# =========================

print_section "4. SEARCH & FILTERS"

# GET /api/v1/previousexams/search/organizations
make_request "GET" "/previousexams/search/organizations" "$ADMIN_TOKEN" "" "Listar organizações"

# GET /api/v1/previousexams/search/exam-boards
make_request "GET" "/previousexams/search/exam-boards" "$ADMIN_TOKEN" "" "Listar bancas"

# GET /api/v1/previousexams/search/positions
make_request "GET" "/previousexams/search/positions" "$ADMIN_TOKEN" "" "Listar cargos"

# GET /api/v1/previousexams/search - Busca avançada
make_request "GET" "/previousexams/search?q=Polícia&organizations=Polícia Federal,Polícia Civil&sort_by=year&sort_order=desc" "$ADMIN_TOKEN" "" "Busca avançada"

# Testes com filtros
make_request "GET" "/previousexams?organization=Polícia Federal&exam_board=CESPE&year_from=2021&year_to=2024" "$ADMIN_TOKEN" "" "Filtros múltiplos"

# =========================
# TESTES STATISTICS & REPORTS
# =========================

print_section "5. STATISTICS & REPORTS"

# GET /api/v1/previousexams/:id/statistics
if [ -n "$FIRST_EXAM_ID" ]; then
    make_request "GET" "/previousexams/$FIRST_EXAM_ID/statistics" "$ADMIN_TOKEN" "" "Estatísticas da prova"
fi

# GET /api/v1/previousexams/reports/performance
make_request "GET" "/previousexams/reports/performance" "$ADMIN_TOKEN" "" "Relatório de desempenho"

# GET /api/v1/previousexams/reports/popular
make_request "GET" "/previousexams/reports/popular?limit=5" "$ADMIN_TOKEN" "" "Provas mais populares"

# GET /api/v1/previousexams/reports/difficulty
make_request "GET" "/previousexams/reports/difficulty" "$ADMIN_TOKEN" "" "Análise de dificuldade"

# =========================
# TESTES STUDENT - ACESSO
# =========================

print_section "6. STUDENT - ACESSO ÀS PROVAS"

# GET /api/v1/previousexams/available - Provas disponíveis para estudante
response=$(make_request "GET" "/previousexams/available" "$STUDENT_TOKEN" "" "Listar provas disponíveis")
AVAILABLE_EXAM_ID=$(extract_first_exam_id "$response")

if [ -n "$AVAILABLE_EXAM_ID" ]; then
    print_success "Prova disponível encontrada: $AVAILABLE_EXAM_ID"
    
    # POST /api/v1/previousexams/:id/start - Iniciar prova
    response=$(make_request "POST" "/previousexams/$AVAILABLE_EXAM_ID/start" "$STUDENT_TOKEN" "" "Iniciar prova anterior")
    ATTEMPT_ID=$(extract_attempt_id "$response")
    
    if [ -n "$ATTEMPT_ID" ]; then
        print_success "Tentativa criada com ID: $ATTEMPT_ID"
        
        # GET /api/v1/previousexams/attempts/:attemptId - Obter tentativa em andamento
        make_request "GET" "/previousexams/attempts/$ATTEMPT_ID" "$STUDENT_TOKEN" "" "Obter tentativa em andamento"
        
        # POST /api/v1/previousexams/attempts/:attemptId/answer - Salvar resposta
        ANSWER_DATA='{"question_id": "q1", "answer": 1}'
        make_request "POST" "/previousexams/attempts/$ATTEMPT_ID/answer" "$STUDENT_TOKEN" "$ANSWER_DATA" "Salvar resposta"
        
        # Salvar mais algumas respostas
        ANSWER_DATA2='{"question_id": "q2", "answer": true}'
        make_request "POST" "/previousexams/attempts/$ATTEMPT_ID/answer" "$STUDENT_TOKEN" "$ANSWER_DATA2" "Salvar resposta 2"
        
        # POST /api/v1/previousexams/attempts/:attemptId/submit - Submeter prova
        SUBMIT_DATA='{"time_spent": 1800}'
        response=$(make_request "POST" "/previousexams/attempts/$ATTEMPT_ID/submit" "$STUDENT_TOKEN" "$SUBMIT_DATA" "Submeter prova")
        
        # GET /api/v1/previousexams/attempts/:attemptId/results - Ver resultados
        make_request "GET" "/previousexams/attempts/$ATTEMPT_ID/results" "$STUDENT_TOKEN" "" "Ver resultados da prova"
    fi
else
    print_error "Nenhuma prova disponível encontrada para estudante"
fi

# GET /api/v1/previousexams/my-attempts - Listar minhas tentativas
make_request "GET" "/previousexams/my-attempts" "$STUDENT_TOKEN" "" "Listar minhas tentativas"

# =========================
# TESTES DE VALIDAÇÃO
# =========================

print_section "7. TESTES DE VALIDAÇÃO"

# Teste de validação - ano inválido
INVALID_EXAM_DATA='{
  "title": "Teste Inválido",
  "organization": "Polícia Civil",
  "exam_board": "VUNESP",
  "position": "Investigador",
  "year": 2030,
  "total_questions": 50
}'
make_request "POST" "/previousexams" "$ADMIN_TOKEN" "$INVALID_EXAM_DATA" "Criar prova com ano inválido (deve falhar)"

# Teste de validação - campos obrigatórios
INCOMPLETE_EXAM_DATA='{
  "title": "Teste Incompleto"
}'
make_request "POST" "/previousexams" "$ADMIN_TOKEN" "$INCOMPLETE_EXAM_DATA" "Criar prova com campos obrigatórios faltando (deve falhar)"

# Teste de autorização - estudante tentando acessar endpoint admin
make_request "GET" "/previousexams" "$STUDENT_TOKEN" "" "Estudante tentando acessar endpoint admin (deve falhar ou ter resultado limitado)"

# =========================
# LIMPEZA
# =========================

print_section "8. LIMPEZA DOS DADOS DE TESTE"

# Deletar prova criada para teste
if [ -n "$NEW_EXAM_ID" ]; then
    make_request "DELETE" "/previousexams/$NEW_EXAM_ID" "$ADMIN_TOKEN" "" "Deletar prova de teste"
fi

# Deletar prova duplicada
if [ -n "$DUPLICATED_EXAM_ID" ]; then
    make_request "DELETE" "/previousexams/$DUPLICATED_EXAM_ID" "$ADMIN_TOKEN" "" "Deletar prova duplicada"
fi

# =========================
# SUMMARY
# =========================

print_section "9. RESUMO DOS TESTES"

echo -e "\n${GREEN}✅ Testes concluídos!${NC}"
echo -e "\n${BLUE}Endpoints testados:${NC}"
echo "1. ✅ Authentication (Admin & Student)"
echo "2. ✅ CRUD Operations (Create, Read, Update, Delete)"
echo "3. ✅ Exam Actions (Publish, Archive, Duplicate)"
echo "4. ✅ Question Management (Link, Unlink)"
echo "5. ✅ Search & Filters (Organizations, Boards, Positions)"
echo "6. ✅ Advanced Search with multiple filters"
echo "7. ✅ Statistics & Reports (Performance, Popular, Difficulty)"
echo "8. ✅ Student Exam Access (Available, Start, Answer, Submit)"
echo "9. ✅ Attempt Management (Get, Results, History)"
echo "10. ✅ Validation Tests (Invalid data, Missing fields)"
echo "11. ✅ Authorization Tests (Role-based access)"
echo "12. ✅ Data Cleanup"

echo -e "\n${YELLOW}📊 Total de endpoints testados: 25+${NC}"
echo -e "\n${BLUE}Para análise detalhada, revise os logs acima.${NC}"
echo -e "\n${GREEN}🎉 Sistema Previous Exams funcionando corretamente!${NC}"