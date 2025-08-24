#!/bin/bash

echo "🎯 Criando Cursos Táticos no Sistema"
echo "======================================"

BACKEND_URL="http://localhost:8180"
ADMIN_EMAIL="admin@studypro.com"
ADMIN_PASSWORD="Admin@123"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "\n${YELLOW}🔑 Step 1: Fazendo login como admin${NC}"
login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\", \"password\":\"$ADMIN_PASSWORD\"}" \
    "$BACKEND_URL/api/v1/auth/login")

TOKEN=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Falha no login de admin"
    exit 1
fi

echo -e "${GREEN}✅ Admin autenticado${NC}"

echo -e "\n${YELLOW}📚 Step 2: Criando cursos táticos${NC}"

# Função para criar curso
create_course() {
    local title="$1"
    local description="$2"
    local category="$3"
    local price="$4"
    local difficulty="$5"
    local hours="$6"
    
    echo -e "\n${YELLOW}Criando curso: $title${NC}"
    
    response=$(curl -s -X POST \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "title=$title" \
        -d "description=$description" \
        -d "category=$category" \
        -d "price=$price" \
        -d "difficulty_level=$difficulty" \
        -d "duration_hours=$hours" \
        -d "duration_months=3" \
        -d "certification_available=true" \
        -d "instructor_name=Comandante Tático" \
        -d "instructor_rank=Coronel" \
        -d "requirements=[\"Ensino médio completo\",\"Dedicação mínima de 2h por dia\"]" \
        -d "objectives=[\"Dominar técnicas avançadas\",\"Preparação completa para concursos\",\"Aprovação garantida\"]" \
        -d "tags=[\"CONCURSO\",\"TÁTICO\",\"MILITAR\"]" \
        "$BACKEND_URL/api/v1/courses")
    
    success=$(echo "$response" | grep -o '"success":true')
    if [ -n "$success" ]; then
        echo -e "${GREEN}✅ Curso criado com sucesso!${NC}"
        course_id=$(echo "$response" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        
        # Publicar o curso
        echo "Publicando curso..."
        publish_response=$(curl -s -X PUT \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "status=published" \
            -d "visibility=public" \
            "$BACKEND_URL/api/v1/courses/$course_id")
        
        publish_success=$(echo "$publish_response" | grep -o '"success":true')
        if [ -n "$publish_success" ]; then
            echo -e "${GREEN}✅ Curso publicado!${NC}"
        else
            echo "⚠️ Erro ao publicar curso"
        fi
    else
        echo "❌ Erro ao criar curso: $response"
    fi
}

# Criar Curso 1 - POLÍCIA FEDERAL
create_course \
    "POLÍCIA FEDERAL - Agente e Escrivão" \
    "Preparação completa para o concurso da Polícia Federal. Material atualizado com questões comentadas e simulados exclusivos." \
    "POLÍCIA" \
    "497" \
    "advanced" \
    "120"

# Criar Curso 2 - RECEITA FEDERAL
create_course \
    "RECEITA FEDERAL - Auditor Fiscal" \
    "Curso intensivo para Auditor Fiscal da Receita Federal. Conteúdo direcionado com foco nas disciplinas mais cobradas." \
    "FISCAL" \
    "597" \
    "advanced" \
    "150"

# Criar Curso 3 - TRIBUNAIS
create_course \
    "TJ/TRF - Analista Judiciário" \
    "Preparação focada para tribunais federais e estaduais. Inclui direito processual, constitucional e administrativo." \
    "TRIBUNAIS" \
    "397" \
    "intermediate" \
    "80"

# Criar Curso 4 - BANCO CENTRAL
create_course \
    "BANCO CENTRAL - Analista" \
    "Curso completo para o concurso do Banco Central do Brasil. Economia, finanças públicas e legislação específica." \
    "BANCÁRIOS" \
    "447" \
    "advanced" \
    "100"

# Criar Curso 5 - TCU
create_course \
    "TCU - Auditor Federal de Controle" \
    "Preparação de elite para o Tribunal de Contas da União. Material exclusivo com questões de provas anteriores." \
    "CONTROLE" \
    "697" \
    "advanced" \
    "180"

# Criar Curso 6 - INSS
create_course \
    "INSS - Técnico do Seguro Social" \
    "Curso completo para técnico do INSS. Direito previdenciário, informática e raciocínio lógico." \
    "PREVIDÊNCIA" \
    "297" \
    "beginner" \
    "60"

# Criar Curso 7 - PRF
create_course \
    "PRF - Policial Rodoviário Federal" \
    "Treinamento intensivo para PRF. Legislação de trânsito, direitos humanos e preparação física." \
    "POLÍCIA" \
    "447" \
    "intermediate" \
    "90"

# Criar Curso 8 - AGEPEN
create_course \
    "AGEPEN - Agente Penitenciário Federal" \
    "Preparação completa para agente penitenciário. Direito penal, execução penal e direitos humanos." \
    "POLÍCIA" \
    "347" \
    "beginner" \
    "70"

# Criar Curso 9 - CGU
create_course \
    "CGU - Analista de Finanças e Controle" \
    "Curso avançado para a Controladoria Geral da União. Auditoria governamental e controle interno." \
    "CONTROLE" \
    "547" \
    "advanced" \
    "130"

# Criar Curso 10 - SEFAZ
create_course \
    "SEFAZ - Auditor Fiscal Estadual" \
    "Preparação para auditor fiscal estadual. Legislação tributária, contabilidade e auditoria." \
    "FISCAL" \
    "497" \
    "intermediate" \
    "110"

echo -e "\n${GREEN}🎉 Processo de criação de cursos concluído!${NC}"
echo "================================================"

# Verificar cursos criados
echo -e "\n${YELLOW}📊 Verificando cursos no sistema...${NC}"
courses_response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BACKEND_URL/api/v1/courses")

total_courses=$(echo "$courses_response" | grep -o '"id"' | wc -l)
echo -e "${GREEN}✅ Total de cursos no sistema: $total_courses${NC}"

echo -e "\n${GREEN}🌐 Acesse http://localhost:5273 e vá para 'Operações Disponíveis'${NC}"
echo "Os novos cursos devem aparecer na lista!"