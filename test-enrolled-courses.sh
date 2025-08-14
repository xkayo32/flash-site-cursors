#!/bin/bash

echo "🎓 Testando API de Cursos Matriculados"
echo "====================================="

BACKEND_URL="http://localhost:8180"
STUDENT_EMAIL="aluno@example.com"
STUDENT_PASSWORD="aluno123"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Login como estudante
echo -e "\n${YELLOW}🔑 Fazendo login como estudante...${NC}"
login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$STUDENT_EMAIL\", \"password\":\"$STUDENT_PASSWORD\"}" \
    "$BACKEND_URL/api/v1/auth/login")

TOKEN=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Falha no login${NC}"
    echo "$login_response"
    exit 1
fi

echo -e "${GREEN}✅ Autenticado${NC}"

# Testar endpoint de cursos matriculados
echo -e "\n${YELLOW}📚 Testando endpoint de cursos matriculados...${NC}"
enrolled_response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BACKEND_URL/api/v1/courses/enrollments/my-courses")

echo "Resposta do endpoint /api/v1/courses/enrollments/my-courses:"
echo "$enrolled_response" | jq '.' 2>/dev/null || echo "$enrolled_response"

# Testar endpoint alternativo do dashboard
echo -e "\n${YELLOW}📊 Testando endpoint alternativo do dashboard...${NC}"
dashboard_response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BACKEND_URL/api/v1/dashboard/student")

echo "Resposta do endpoint /api/v1/dashboard/student:"
echo "$dashboard_response" | jq '.' 2>/dev/null || echo "$dashboard_response"

# Verificar se precisa matricular em algum curso primeiro
echo -e "\n${YELLOW}📋 Listando todos os cursos disponíveis...${NC}"
all_courses_response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BACKEND_URL/api/v1/courses")

echo "Cursos disponíveis:"
echo "$all_courses_response" | jq '.data[:3] | .[] | {id, title, status}' 2>/dev/null || echo "Erro no JSON"

# Se houver cursos, tentar matricular no primeiro
course_id=$(echo "$all_courses_response" | jq -r '.data[0].id' 2>/dev/null)

if [ "$course_id" != "null" ] && [ -n "$course_id" ]; then
    echo -e "\n${YELLOW}📝 Tentando matricular no primeiro curso (ID: $course_id)...${NC}"
    enroll_response=$(curl -s -X POST \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        "$BACKEND_URL/api/v1/courses/$course_id/enroll")
    
    echo "Resultado da matrícula:"
    echo "$enroll_response" | jq '.' 2>/dev/null || echo "$enroll_response"
    
    # Tentar buscar cursos matriculados novamente
    echo -e "\n${YELLOW}🔄 Buscando cursos matriculados após matrícula...${NC}"
    enrolled_after_response=$(curl -s -X GET \
        -H "Authorization: Bearer $TOKEN" \
        "$BACKEND_URL/api/v1/courses/enrollments/my-courses")
    
    echo "Cursos matriculados após matrícula:"
    echo "$enrolled_after_response" | jq '.' 2>/dev/null || echo "$enrolled_after_response"
fi

echo -e "\n${GREEN}✨ Teste concluído!${NC}"