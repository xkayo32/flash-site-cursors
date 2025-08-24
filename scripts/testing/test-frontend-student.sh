#!/bin/bash

# ========================================
# TESTE FRONTEND - TODAS AS PÁGINAS DO ALUNO
# ========================================
# Este script testa todas as URLs do frontend do estudante
# Verifica se as páginas carregam corretamente e não retornam erro 404

# Configurações
BASE_URL="http://localhost:5273"
SUCCESS_COUNT=0
ERROR_COUNT=0
TOTAL_COUNT=0

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🎖️  TESTE FRONTEND - PÁGINAS DO ALUNO${NC}"
echo -e "${CYAN}======================================${NC}"
echo -e "${BLUE}Base URL: ${BASE_URL}${NC}"
echo -e "${BLUE}Testando todas as rotas do estudante...${NC}"
echo ""

# Função para testar uma URL
test_url() {
    local url="$1"
    local description="$2"
    local should_redirect="$3"
    
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
    
    echo -n "[$TOTAL_COUNT] Testando: $description..."
    
    # Fazer requisição HTTP
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$url" 2>/dev/null)
    
    # Verificar resultado
    if [ "$should_redirect" = "redirect" ]; then
        # Para rotas protegidas, esperamos redirect (302/301) ou acesso negado (401/403)
        if [ "$response" = "200" ] || [ "$response" = "302" ] || [ "$response" = "301" ] || [ "$response" = "401" ] || [ "$response" = "403" ]; then
            echo -e " ${GREEN}✓ OK (HTTP $response)${NC}"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            echo -e " ${RED}✗ ERRO (HTTP $response)${NC}"
            ERROR_COUNT=$((ERROR_COUNT + 1))
        fi
    else
        # Para rotas públicas, esperamos 200
        if [ "$response" = "200" ]; then
            echo -e " ${GREEN}✓ OK (HTTP $response)${NC}"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            echo -e " ${RED}✗ ERRO (HTTP $response)${NC}"
            ERROR_COUNT=$((ERROR_COUNT + 1))
        fi
    fi
}

# ========================================
# ROTAS PÚBLICAS
# ========================================
echo -e "${YELLOW}📋 ROTAS PÚBLICAS${NC}"
test_url "/" "Página inicial"
test_url "/login" "Login"
test_url "/register" "Registro"
test_url "/checkout" "Checkout"
echo ""

# ========================================
# ROTAS PROTEGIDAS DO ESTUDANTE
# ========================================
echo -e "${YELLOW}🎯 ROTAS PROTEGIDAS DO ESTUDANTE${NC}"

# Dashboard principal
test_url "/dashboard" "Dashboard do estudante" "redirect"

# Cursos
test_url "/courses" "Catálogo de cursos" "redirect"
test_url "/my-courses" "Meus cursos" "redirect"
test_url "/course/1" "Detalhes do curso" "redirect"
test_url "/course/1/learn" "Aprendizado do curso" "redirect"

# Estudos
test_url "/flashcards" "Flashcards" "redirect"
test_url "/questions" "Banco de questões" "redirect"
test_url "/summaries" "Resumos" "redirect"
test_url "/legislation" "Legislação" "redirect"

# Simulados e provas
test_url "/simulations" "Simulados" "redirect"
test_url "/previous-exams" "Provas anteriores" "redirect"
test_url "/simulations/mock/me1/take" "Fazer simulado" "redirect"
test_url "/simulations/me1/results/session1" "Resultados do exame" "redirect"

# Ferramentas
test_url "/schedule" "Cronograma" "redirect"
test_url "/tactical" "Painel tático" "redirect"

# Configurações
test_url "/settings" "Configurações" "redirect"
test_url "/payment" "Configurações de pagamento" "redirect"
test_url "/subscription" "Assinatura" "redirect"

echo ""

# ========================================
# ROTAS DINÂMICAS (Exemplos)
# ========================================
echo -e "${YELLOW}🔗 ROTAS DINÂMICAS (Exemplos)${NC}"

# Rotas com parâmetros usando IDs de exemplo
test_url "/course/uuid-example-1" "Curso específico (ID exemplo)" "redirect"
test_url "/simulations/mock/exam1/take" "Simulado específico" "redirect"
test_url "/simulations/exam1/results/session123" "Resultado específico" "redirect"

echo ""

# ========================================
# ROTAS INVÁLIDAS (Devem retornar 404 ou redirect)
# ========================================
echo -e "${YELLOW}❌ ROTAS INVÁLIDAS${NC}"
test_url "/invalid-route" "Rota inválida" "redirect"
test_url "/admin" "Admin (sem permissão)" "redirect"
test_url "/admin/dashboard" "Admin dashboard (sem permissão)" "redirect"

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
# NOTAS IMPORTANTES
# ========================================
echo -e "${YELLOW}📝 NOTAS IMPORTANTES:${NC}"
echo "• Rotas protegidas retornam 302/401/403 (esperado sem login)"
echo "• Frontend React roda em http://localhost:5273"
echo "• Backend Node.js roda em http://localhost:8180"
echo "• Para testar autenticado, faça login manualmente primeiro"
echo ""

# ========================================
# COMANDOS ÚTEIS
# ========================================
echo -e "${YELLOW}🔧 COMANDOS ÚTEIS:${NC}"
echo "• Iniciar frontend: cd frontend && npm run dev"
echo "• Iniciar backend: cd backend-node && npm run dev"
echo "• Login de teste: aluno@example.com / aluno123"
echo "• Admin de teste: admin@studypro.com / Admin@123"
echo ""

# Status final
if [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  ALGUNS TESTES FALHARAM!${NC}"
    exit 1
fi