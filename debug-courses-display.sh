#!/bin/bash

echo "🔍 DEBUG: Exibição de Cursos na Área do Aluno"
echo "=============================================="

BACKEND_URL="http://localhost:8180"
EMAIL="aluno@example.com"
PASSWORD="aluno123"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Get token
echo -e "\n${YELLOW}1️⃣ Obtendo token de autenticação...${NC}"
login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\"}" \
    "$BACKEND_URL/api/v1/auth/login")

TOKEN=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Falha na autenticação${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Token obtido${NC}"

# 2. Test course API without auth header (optional auth)
echo -e "\n${YELLOW}2️⃣ Testando API de cursos SEM autenticação...${NC}"
no_auth_response=$(curl -s "http://localhost:8180/api/v1/courses?status=published&limit=20")
no_auth_count=$(echo "$no_auth_response" | grep -o '"id"' | wc -l)
echo "Cursos retornados sem auth: $no_auth_count"

# 3. Test course API with auth header
echo -e "\n${YELLOW}3️⃣ Testando API de cursos COM autenticação...${NC}"
auth_response=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "$BACKEND_URL/api/v1/courses?status=published&limit=20")

echo "Response status:"
echo "$auth_response" | jq -r '.success'

echo "Total de cursos na resposta:"
echo "$auth_response" | jq -r '.data | length'

echo "Paginação:"
echo "$auth_response" | jq '.pagination'

# 4. List course titles
echo -e "\n${YELLOW}4️⃣ Cursos disponíveis:${NC}"
echo "$auth_response" | jq -r '.data[] | "• \(.title) - \(.category) - R$\(.price)"'

# 5. Check for errors
echo -e "\n${YELLOW}5️⃣ Verificando erros na resposta...${NC}"
error_msg=$(echo "$auth_response" | jq -r '.message // "Sem erros"')
echo "Mensagem: $error_msg"

# 6. Check frontend URL
echo -e "\n${YELLOW}6️⃣ Verificando frontend...${NC}"
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5273")
if [ "$frontend_status" = "200" ]; then
    echo -e "${GREEN}✅ Frontend está online${NC}"
else
    echo -e "${RED}❌ Frontend offline (status: $frontend_status)${NC}"
fi

# 7. Check if courses have all required fields
echo -e "\n${YELLOW}7️⃣ Verificando estrutura dos dados...${NC}"
echo "$auth_response" | jq -r '.data[0] | {
    id: .id,
    title: .title,
    category: .category,
    price: .price,
    status: .status,
    instructor: .instructor,
    duration_hours: .duration_hours,
    difficulty_level: .difficulty_level,
    stats: .stats
}'

# 8. Test enrolled courses endpoint
echo -e "\n${YELLOW}8️⃣ Testando cursos matriculados...${NC}"
enrolled_response=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "$BACKEND_URL/api/v1/courses/enrollments/my-courses")
enrolled_count=$(echo "$enrolled_response" | grep -o '"course_id"' | wc -l)
echo "Cursos matriculados: $enrolled_count"

echo -e "\n${GREEN}🎯 RESUMO DO DEBUG:${NC}"
echo "===================="
echo "✅ Autenticação: OK"
echo "✅ API de cursos: Retornando $no_auth_count cursos"
echo "✅ Frontend: Status $frontend_status"
echo ""
echo "🌐 Para testar visualmente:"
echo "1. Acesse: http://localhost:5273"
echo "2. Login: $EMAIL / $PASSWORD"
echo "3. Vá para: Menu > Operações Disponíveis"
echo ""
echo "Se os cursos não aparecerem, verifique o console do navegador (F12)"