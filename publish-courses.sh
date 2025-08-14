#!/bin/bash

echo "📢 Publicando todos os cursos em rascunho"
echo "=========================================="

BACKEND_URL="http://localhost:8180"
ADMIN_EMAIL="admin@studypro.com"
ADMIN_PASSWORD="Admin@123"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Login
echo -e "${YELLOW}🔑 Fazendo login como admin...${NC}"
login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\", \"password\":\"$ADMIN_PASSWORD\"}" \
    "$BACKEND_URL/api/v1/auth/login")

TOKEN=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Falha no login"
    exit 1
fi

echo -e "${GREEN}✅ Autenticado${NC}"

# Buscar todos os cursos
echo -e "\n${YELLOW}📚 Buscando cursos...${NC}"
courses_response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BACKEND_URL/api/v1/courses?limit=100")

# Extrair IDs dos cursos
course_ids=$(echo "$courses_response" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

# Contador
total=0
published=0

echo -e "\n${YELLOW}🚀 Publicando cursos...${NC}"
for course_id in $course_ids; do
    total=$((total + 1))
    
    # Buscar detalhes do curso
    course_detail=$(curl -s -X GET \
        -H "Authorization: Bearer $TOKEN" \
        "$BACKEND_URL/api/v1/courses/$course_id")
    
    title=$(echo "$course_detail" | grep -o '"title":"[^"]*' | head -1 | cut -d'"' -f4)
    status=$(echo "$course_detail" | grep -o '"status":"[^"]*' | head -1 | cut -d'"' -f4)
    
    echo -e "\n${YELLOW}Curso: $title${NC}"
    echo "Status atual: $status"
    
    if [ "$status" != "published" ]; then
        # Publicar o curso
        publish_response=$(curl -s -X PUT \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "status=published&visibility=public" \
            "$BACKEND_URL/api/v1/courses/$course_id")
        
        success=$(echo "$publish_response" | grep -o '"success":true')
        if [ -n "$success" ]; then
            echo -e "${GREEN}✅ Curso publicado!${NC}"
            published=$((published + 1))
        else
            echo "⚠️ Erro ao publicar"
        fi
    else
        echo -e "${GREEN}✓ Já está publicado${NC}"
    fi
done

echo -e "\n${GREEN}📊 Resumo:${NC}"
echo "Total de cursos: $total"
echo "Cursos publicados nesta sessão: $published"

# Verificar cursos publicados
echo -e "\n${YELLOW}🔍 Verificando cursos publicados...${NC}"
published_response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BACKEND_URL/api/v1/courses?status=published&limit=100")

published_count=$(echo "$published_response" | grep -o '"id"' | wc -l)
echo -e "${GREEN}✅ Total de cursos publicados no sistema: $published_count${NC}"

echo -e "\n${GREEN}🎉 Processo concluído!${NC}"
echo "Acesse http://localhost:5273 e vá para 'Operações Disponíveis'"
echo "Todos os cursos publicados devem aparecer na lista!"