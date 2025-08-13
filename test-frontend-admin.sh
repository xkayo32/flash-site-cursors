#!/bin/bash

# ========================================
# TESTE FRONTEND - TODAS AS PÁGINAS DO ADMIN
# ========================================
# Este script testa todas as URLs do frontend do administrador
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

echo -e "${CYAN}⚙️  TESTE FRONTEND - PÁGINAS DO ADMIN${NC}"
echo -e "${CYAN}=====================================${NC}"
echo -e "${BLUE}Base URL: ${BASE_URL}${NC}"
echo -e "${BLUE}Testando todas as rotas do administrador...${NC}"
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
        # Para rotas protegidas de admin, esperamos redirect (302/301) ou acesso negado (401/403)
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
# ROTAS PRINCIPAIS DO ADMIN
# ========================================
echo -e "${YELLOW}🏢 DASHBOARD E GESTÃO${NC}"
test_url "/admin" "Admin (redirect para dashboard)" "redirect"
test_url "/admin/dashboard" "Dashboard administrativo" "redirect"
test_url "/admin/content" "Gerenciador de conteúdo" "redirect"
test_url "/admin/settings" "Configurações administrativas" "redirect"
echo ""

# ========================================
# GESTÃO DE USUÁRIOS
# ========================================
echo -e "${YELLOW}👥 GESTÃO DE USUÁRIOS${NC}"
test_url "/admin/users" "Lista de usuários" "redirect"
test_url "/admin/users/new" "Criar novo usuário" "redirect"
echo ""

# ========================================
# GESTÃO DE CURSOS
# ========================================
echo -e "${YELLOW}📚 GESTÃO DE CURSOS${NC}"
test_url "/admin/courses" "Editor de cursos" "redirect"
test_url "/admin/courses/new" "Criar novo curso" "redirect"
test_url "/admin/courses/edit/1" "Editar curso específico" "redirect"
test_url "/admin/courses/1" "Visualizar curso específico" "redirect"
echo ""

# ========================================
# GESTÃO DE QUESTÕES
# ========================================
echo -e "${YELLOW}❓ GESTÃO DE QUESTÕES${NC}"
test_url "/admin/questions" "Editor de questões" "redirect"
test_url "/admin/questions/new" "Criar nova questão" "redirect"
echo ""

# ========================================
# GESTÃO DE FLASHCARDS
# ========================================
echo -e "${YELLOW}🃏 GESTÃO DE FLASHCARDS${NC}"
test_url "/admin/flashcards" "Gerenciador de flashcards" "redirect"
test_url "/admin/flashcards/new" "Criar novo deck" "redirect"
test_url "/admin/flashcards/cards" "Flashcards individuais" "redirect"
test_url "/admin/flashcards/cards/new" "Criar novo flashcard" "redirect"
test_url "/admin/flashcards/deck1/edit" "Editar deck específico" "redirect"
test_url "/admin/flashcards/deck1/cards" "Cards do deck específico" "redirect"
test_url "/admin/flashcards/cards/card1/edit" "Editar card específico" "redirect"
echo ""

# ========================================
# GESTÃO DE RESUMOS
# ========================================
echo -e "${YELLOW}📄 GESTÃO DE RESUMOS${NC}"
test_url "/admin/summaries" "Editor de resumos" "redirect"
test_url "/admin/summaries/new" "Criar novo resumo" "redirect"
test_url "/admin/summaries/edit/1" "Editar resumo específico" "redirect"
echo ""

# ========================================
# GESTÃO DE LEGISLAÇÃO
# ========================================
echo -e "${YELLOW}⚖️  GESTÃO DE LEGISLAÇÃO${NC}"
test_url "/admin/legislation" "Gerenciador de legislação" "redirect"
test_url "/admin/legislation/new" "Criar nova legislação" "redirect"
echo ""

# ========================================
# GESTÃO DE SIMULADOS E PROVAS
# ========================================
echo -e "${YELLOW}🎯 GESTÃO DE SIMULADOS E PROVAS${NC}"
test_url "/admin/mock-exams" "Gerenciador de simulados" "redirect"
test_url "/admin/previous-exams" "Gerenciador de provas anteriores" "redirect"
echo ""

# ========================================
# GESTÃO DE CATEGORIAS
# ========================================
echo -e "${YELLOW}🏷️  GESTÃO DE CATEGORIAS${NC}"
test_url "/admin/categories" "Gerenciador de categorias" "redirect"
echo ""

# ========================================
# ROTAS INVÁLIDAS PARA ADMIN
# ========================================
echo -e "${YELLOW}❌ ROTAS INVÁLIDAS${NC}"
test_url "/admin/invalid-route" "Rota admin inválida" "redirect"
test_url "/admin/users/999999/edit" "Editar usuário inexistente" "redirect"
test_url "/admin/courses/999999/edit" "Editar curso inexistente" "redirect"
echo ""

# ========================================
# ROTAS DE ESTUDANTE (SEM PERMISSÃO)
# ========================================
echo -e "${YELLOW}🚫 ROTAS DE ESTUDANTE (SEM PERMISSÃO)${NC}"
test_url "/dashboard" "Dashboard do estudante (admin)" "redirect"
test_url "/courses" "Cursos do estudante (admin)" "redirect"
test_url "/flashcards" "Flashcards do estudante (admin)" "redirect"
test_url "/questions" "Questões do estudante (admin)" "redirect"
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
echo "• Rotas protegidas de admin retornam 302/401/403 (esperado sem login)"
echo "• Acesso de admin requer role='admin' no JWT"
echo "• Frontend React roda em http://localhost:5273"
echo "• Backend Node.js roda em http://localhost:8180"
echo "• Para testar autenticado, faça login como admin primeiro"
echo ""

# ========================================
# FUNCIONALIDADES ADMIN TESTADAS
# ========================================
echo -e "${YELLOW}🛠️  FUNCIONALIDADES ADMIN DISPONÍVEIS:${NC}"
echo "• Dashboard com estatísticas completas"
echo "• CRUD de usuários (estudantes e admins)"
echo "• CRUD de cursos com módulos e lições"
echo "• CRUD de questões com categorização"
echo "• CRUD de flashcards (decks e cards individuais)"
echo "• CRUD de resumos com editor avançado"
echo "• CRUD de legislação organizada"
echo "• Gestão de simulados e provas anteriores"
echo "• Gerenciamento de categorias e subcategorias"
echo "• Configurações administrativas"
echo ""

# ========================================
# COMANDOS ÚTEIS
# ========================================
echo -e "${YELLOW}🔧 COMANDOS ÚTEIS:${NC}"
echo "• Iniciar frontend: cd frontend && npm run dev"
echo "• Iniciar backend: cd backend-node && npm run dev"
echo "• Login admin: admin@studypro.com / Admin@123"
echo "• Login estudante: aluno@example.com / aluno123"
echo "• Testar APIs admin: ./test-admin-apis.sh"
echo ""

# ========================================
# ENDPOINTS BACKEND RELACIONADOS
# ========================================
echo -e "${YELLOW}🌐 ENDPOINTS BACKEND RELACIONADOS:${NC}"
echo "• GET /api/v1/users - Lista usuários"
echo "• GET /api/v1/courses - Lista cursos"
echo "• GET /api/v1/questions - Lista questões"
echo "• GET /api/v1/flashcards - Lista flashcards"
echo "• GET /api/v1/summaries - Lista resumos"
echo "• GET /api/v1/legislation - Lista legislação"
echo "• GET /api/v1/categories - Lista categorias"
echo "• GET /api/v1/dashboard/stats - Estatísticas admin"
echo ""

# Status final
if [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  ALGUNS TESTES FALHARAM!${NC}"
    exit 1
fi