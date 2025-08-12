#!/bin/bash

# Test Mock Exams API Endpoints
# Este script testa todos os endpoints da API de simulados

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

# Função para imprimir cabeçalhos
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Função para imprimir sucesso
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Função para imprimir erro
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Função para imprimir warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Função para fazer login e obter token
get_token() {
    local email=$1
    local password=$2
    local role=$3
    
    echo -e "\n${BLUE}Fazendo login como $role...${NC}"
    
    local response=$(curl -s -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    local success=$(echo $response | jq -r '.success // false')
    
    if [ "$success" = "true" ]; then
        local token=$(echo $response | jq -r '.data.token // ""')
        print_success "Login realizado com sucesso para $role"
        echo $token
    else
        local message=$(echo $response | jq -r '.message // "Erro desconhecido"')
        print_error "Falha no login para $role: $message"
        echo ""
    fi
}

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local token=$3
    local data=$4
    local expected_status=${5:-200}
    local description=$6
    
    local curl_opts=("-s" "-w" "%{http_code}")
    
    if [ ! -z "$token" ]; then
        curl_opts+=("-H" "Authorization: Bearer $token")
    fi
    
    curl_opts+=("-H" "Content-Type: application/json")
    
    if [ "$method" != "GET" ] && [ "$method" != "DELETE" ] && [ ! -z "$data" ]; then
        curl_opts+=("-d" "$data")
    fi
    
    curl_opts+=("-X" "$method" "$API_BASE$endpoint")
    
    local response=$(curl "${curl_opts[@]}")
    local status_code="${response: -3}"
    local body="${response%???}"
    
    echo -e "\n${YELLOW}$method $endpoint${NC}"
    if [ ! -z "$description" ]; then
        echo "Descrição: $description"
    fi
    
    if [ "$status_code" = "$expected_status" ]; then
        print_success "Status: $status_code (esperado: $expected_status)"
        
        # Verifica se é JSON válido
        if echo "$body" | jq empty 2>/dev/null; then
            local success=$(echo "$body" | jq -r '.success // "n/a"')
            if [ "$success" = "true" ] || [ "$success" = "n/a" ]; then
                print_success "Resposta: JSON válido"
                echo "$body" | jq .
            else
                local message=$(echo "$body" | jq -r '.message // "Sem mensagem"')
                print_warning "Resposta indica falha: $message"
                echo "$body" | jq .
            fi
        else
            print_warning "Resposta não é JSON válido"
            echo "Body: $body"
        fi
    else
        print_error "Status: $status_code (esperado: $expected_status)"
        echo "Body: $body"
    fi
}

# Inicialização
echo -e "${BLUE}🧪 TESTE COMPLETO DA API DE SIMULADOS${NC}"
echo -e "${BLUE}Base URL: $API_BASE${NC}"
echo -e "${BLUE}Testando todas as funcionalidades de Mock Exams...${NC}\n"

# 1. Fazer login como admin
print_header "1. AUTENTICAÇÃO"
ADMIN_TOKEN=$(get_token "$ADMIN_EMAIL" "$ADMIN_PASSWORD" "Admin")
if [ -z "$ADMIN_TOKEN" ]; then
    print_error "Não foi possível obter token de admin. Abortando testes."
    exit 1
fi

# 2. Fazer login como estudante
STUDENT_TOKEN=$(get_token "$STUDENT_EMAIL" "$STUDENT_PASSWORD" "Estudante")
if [ -z "$STUDENT_TOKEN" ]; then
    print_error "Não foi possível obter token de estudante. Continuando sem testes de estudante."
fi

# 3. Testes de Mock Exams Management (Admin)
print_header "2. GERENCIAMENTO DE SIMULADOS (ADMIN)"

# 3.1. Listar todos os simulados
test_endpoint "GET" "/mockexams" "$ADMIN_TOKEN" "" 200 "Listar todos os simulados"

# 3.2. Listar simulados com filtros
test_endpoint "GET" "/mockexams?difficulty=SARGENTO&status=published&page=1&limit=5" "$ADMIN_TOKEN" "" 200 "Listar simulados filtrados"

# 3.3. Obter simulado específico
test_endpoint "GET" "/mockexams/me1" "$ADMIN_TOKEN" "" 200 "Obter simulado específico"

# 3.4. Criar novo simulado
NEW_EXAM_DATA='{
  "title": "Simulado Teste API",
  "description": "Simulado criado via API para testes",
  "type": "RANDOM",
  "difficulty": "CABO",
  "duration": 120,
  "total_questions": 50,
  "passing_score": 60,
  "max_attempts": 3,
  "status": "draft"
}'
test_endpoint "POST" "/mockexams" "$ADMIN_TOKEN" "$NEW_EXAM_DATA" 200 "Criar novo simulado"

# Capturar ID do simulado criado para testes posteriores
CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/mockexams" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$NEW_EXAM_DATA")
NEW_EXAM_ID=$(echo $CREATE_RESPONSE | jq -r '.data.id // ""')

if [ ! -z "$NEW_EXAM_ID" ]; then
    print_success "Simulado criado com ID: $NEW_EXAM_ID"
    
    # 3.5. Atualizar simulado
    UPDATE_DATA='{"title": "Simulado Teste API - Atualizado", "duration": 150}'
    test_endpoint "PUT" "/mockexams/$NEW_EXAM_ID" "$ADMIN_TOKEN" "$UPDATE_DATA" 200 "Atualizar simulado"
    
    # 3.6. Publicar simulado
    test_endpoint "POST" "/mockexams/$NEW_EXAM_ID/publish" "$ADMIN_TOKEN" "" 200 "Publicar simulado"
    
    # 3.7. Preview do simulado
    test_endpoint "GET" "/mockexams/$NEW_EXAM_ID/preview" "$ADMIN_TOKEN" "" 200 "Preview do simulado"
    
    # 3.8. Duplicar simulado
    test_endpoint "POST" "/mockexams/$NEW_EXAM_ID/duplicate" "$ADMIN_TOKEN" "" 200 "Duplicar simulado"
    
    # 3.9. Arquivar simulado
    test_endpoint "POST" "/mockexams/$NEW_EXAM_ID/archive" "$ADMIN_TOKEN" "" 200 "Arquivar simulado"
    
else
    print_warning "Não foi possível obter ID do simulado criado. Pulando testes dependentes."
fi

# 4. Testes de funcionalidades do estudante
if [ ! -z "$STUDENT_TOKEN" ]; then
    print_header "3. FUNCIONALIDADES DO ESTUDANTE"
    
    # 4.1. Listar simulados disponíveis
    test_endpoint "GET" "/mockexams/available" "$STUDENT_TOKEN" "" 200 "Listar simulados disponíveis para estudante"
    
    # 4.2. Tentar iniciar um simulado existente (me1)
    test_endpoint "POST" "/mockexams/me1/start" "$STUDENT_TOKEN" "" 200 "Iniciar simulado"
    
    # Capturar ID da tentativa para testes posteriores
    START_RESPONSE=$(curl -s -X POST "$API_BASE/mockexams/me1/start" \
        -H "Authorization: Bearer $STUDENT_TOKEN" \
        -H "Content-Type: application/json")
    ATTEMPT_ID=$(echo $START_RESPONSE | jq -r '.data.attempt_id // ""')
    
    if [ ! -z "$ATTEMPT_ID" ]; then
        print_success "Simulado iniciado com Attempt ID: $ATTEMPT_ID"
        
        # 4.3. Obter detalhes da tentativa
        test_endpoint "GET" "/mockexams/attempts/$ATTEMPT_ID" "$STUDENT_TOKEN" "" 200 "Obter detalhes da tentativa"
        
        # 4.4. Salvar uma resposta
        ANSWER_DATA='{"question_id": "q1", "answer": 1}'
        test_endpoint "POST" "/mockexams/attempts/$ATTEMPT_ID/answer" "$STUDENT_TOKEN" "$ANSWER_DATA" 200 "Salvar resposta"
        
        # 4.5. Submeter simulado
        SUBMIT_DATA='{"time_spent": 3600}'
        test_endpoint "POST" "/mockexams/attempts/$ATTEMPT_ID/submit" "$STUDENT_TOKEN" "$SUBMIT_DATA" 200 "Submeter simulado"
        
        # 4.6. Obter resultados
        test_endpoint "GET" "/mockexams/attempts/$ATTEMPT_ID/results" "$STUDENT_TOKEN" "" 200 "Obter resultados do simulado"
        
    else
        print_warning "Não foi possível iniciar simulado ou obter Attempt ID. Pode ser que já existe uma tentativa em andamento."
        
        # Tentar listar tentativas existentes
        test_endpoint "GET" "/mockexams/my-attempts" "$STUDENT_TOKEN" "" 200 "Listar minhas tentativas"
    fi
    
    # 4.7. Listar tentativas do usuário
    test_endpoint "GET" "/mockexams/my-attempts?page=1&limit=10" "$STUDENT_TOKEN" "" 200 "Listar tentativas com paginação"
    
else
    print_warning "Pulando testes de estudante - token não disponível"
fi

# 5. Testes de estatísticas (Admin)
print_header "4. ESTATÍSTICAS E RELATÓRIOS (ADMIN)"

# 5.1. Estatísticas de um simulado específico
test_endpoint "GET" "/mockexams/me1/statistics" "$ADMIN_TOKEN" "" 200 "Obter estatísticas do simulado me1"

# 5.2. Relatório de performance geral
test_endpoint "GET" "/mockexams/reports/performance" "$ADMIN_TOKEN" "" 200 "Relatório de performance geral"

# 6. Testes de autorização (verificar se estudantes não podem acessar endpoints de admin)
if [ ! -z "$STUDENT_TOKEN" ]; then
    print_header "5. TESTES DE AUTORIZAÇÃO"
    
    # 6.1. Estudante tentando criar simulado (deve falhar)
    test_endpoint "POST" "/mockexams" "$STUDENT_TOKEN" "$NEW_EXAM_DATA" 403 "Estudante tentando criar simulado (deve falhar)"
    
    # 6.2. Estudante tentando obter estatísticas (deve falhar)
    test_endpoint "GET" "/mockexams/me1/statistics" "$STUDENT_TOKEN" "" 403 "Estudante tentando obter estatísticas (deve falhar)"
    
    # 6.3. Estudante tentando acessar relatórios (deve falhar)
    test_endpoint "GET" "/mockexams/reports/performance" "$STUDENT_TOKEN" "" 403 "Estudante tentando acessar relatórios (deve falhar)"
fi

# 7. Testes sem autenticação (devem falhar)
print_header "6. TESTES SEM AUTENTICAÇÃO"

test_endpoint "GET" "/mockexams" "" "" 401 "Listar simulados sem token (deve falhar)"
test_endpoint "GET" "/mockexams/available" "" "" 401 "Listar simulados disponíveis sem token (deve falhar)"

# 8. Limpeza (deletar simulado criado para teste, se existir)
if [ ! -z "$NEW_EXAM_ID" ]; then
    print_header "7. LIMPEZA"
    
    # Primeiro, vamos tentar arquivar se ainda não foi arquivado
    curl -s -X POST "$API_BASE/mockexams/$NEW_EXAM_ID/archive" \
        -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null
    
    # Tentar deletar (pode falhar se houver tentativas)
    test_endpoint "DELETE" "/mockexams/$NEW_EXAM_ID" "$ADMIN_TOKEN" "" 200 "Deletar simulado de teste"
fi

# Resumo final
print_header "8. RESUMO DOS TESTES"
echo -e "${GREEN}✅ Testes de API de Mock Exams concluídos!${NC}"
echo -e "${BLUE}📝 Funcionalidades testadas:${NC}"
echo "   • Autenticação (Admin e Estudante)"
echo "   • CRUD de simulados (Admin)"
echo "   • Publicação e arquivamento"
echo "   • Duplicação de simulados"
echo "   • Preview de questões"
echo "   • Início de tentativas (Estudante)"
echo "   • Salvamento de respostas"
echo "   • Submissão de simulados"
echo "   • Visualização de resultados"
echo "   • Listagem de tentativas"
echo "   • Estatísticas e relatórios"
echo "   • Controle de autorização"
echo "   • Validação de acesso sem autenticação"

echo -e "\n${BLUE}🎯 Para usar este script:${NC}"
echo "   chmod +x test-mockexams-api.sh"
echo "   ./test-mockexams-api.sh"

echo -e "\n${YELLOW}📊 Verifique os logs acima para identificar eventuais falhas.${NC}"
echo -e "${GREEN}🚀 Se todos os testes passaram, a API está funcionando corretamente!${NC}\n"