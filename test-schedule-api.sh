#!/bin/bash

echo "🗓️ Testando API de Cronograma"
echo "=============================="

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

# Testar GET de tarefas
echo -e "\n${YELLOW}📋 Buscando tarefas...${NC}"
tasks_response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BACKEND_URL/api/v1/schedule/tasks")

success=$(echo "$tasks_response" | grep -o '"success":true')
if [ -n "$success" ]; then
    echo -e "${GREEN}✅ Tarefas encontradas${NC}"
    echo "$tasks_response" | jq -r '.data[] | "  - \(.title) (\(.status)) - \(.date) às \(.time)"' 2>/dev/null || echo "$tasks_response"
else
    echo -e "${RED}❌ Erro ao buscar tarefas${NC}"
    echo "$tasks_response"
fi

# Testar GET de eventos
echo -e "\n${YELLOW}📅 Buscando eventos...${NC}"
events_response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BACKEND_URL/api/v1/schedule/events")

success=$(echo "$events_response" | grep -o '"success":true')
if [ -n "$success" ]; then
    echo -e "${GREEN}✅ Eventos encontrados${NC}"
    echo "$events_response" | jq -r '.data[] | "  - \(.title) - \(.date) das \(.start_time) às \(.end_time)"' 2>/dev/null || echo "$events_response"
else
    echo -e "${RED}❌ Erro ao buscar eventos${NC}"
    echo "$events_response"
fi

# Testar GET de sessões de estudo
echo -e "\n${YELLOW}📚 Buscando sessões de estudo...${NC}"
sessions_response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BACKEND_URL/api/v1/schedule/study-sessions")

success=$(echo "$sessions_response" | grep -o '"success":true')
if [ -n "$success" ]; then
    echo -e "${GREEN}✅ Sessões encontradas${NC}"
    echo "$sessions_response" | jq -r '.data[] | "  - \(.title) (\(.status)) - \(.duration) min"' 2>/dev/null || echo "$sessions_response"
else
    echo -e "${RED}❌ Erro ao buscar sessões${NC}"
    echo "$sessions_response"
fi

# Testar GET de metas diárias
echo -e "\n${YELLOW}🎯 Buscando metas diárias...${NC}"
goals_response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BACKEND_URL/api/v1/schedule/daily-goals")

success=$(echo "$goals_response" | grep -o '"success":true')
if [ -n "$success" ]; then
    echo -e "${GREEN}✅ Metas encontradas${NC}"
    echo "$goals_response" | jq -r '.data[] | "  - \(.date): \(.study_hours_completed)/\(.study_hours_target)h estudadas"' 2>/dev/null || echo "$goals_response"
else
    echo -e "${RED}❌ Erro ao buscar metas${NC}"
    echo "$goals_response"
fi

# Testar GET de estatísticas
echo -e "\n${YELLOW}📊 Buscando estatísticas...${NC}"
stats_response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BACKEND_URL/api/v1/schedule/stats")

success=$(echo "$stats_response" | grep -o '"success":true')
if [ -n "$success" ]; then
    echo -e "${GREEN}✅ Estatísticas encontradas${NC}"
    echo "$stats_response" | jq '.' 2>/dev/null || echo "$stats_response"
else
    echo -e "${RED}❌ Erro ao buscar estatísticas${NC}"
    echo "$stats_response"
fi

# Criar nova tarefa
echo -e "\n${YELLOW}➕ Criando nova tarefa...${NC}"
today=$(date +%Y-%m-%d)
task_response=$(curl -s -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"title\": \"REVISAR DIREITO ADMINISTRATIVO\",
        \"description\": \"Revisar módulo 5\",
        \"type\": \"review\",
        \"priority\": \"high\",
        \"date\": \"$today\",
        \"time\": \"18:00\",
        \"duration\": 90,
        \"subject\": \"DIREITO ADMINISTRATIVO\"
    }" \
    "$BACKEND_URL/api/v1/schedule/tasks")

success=$(echo "$task_response" | grep -o '"success":true')
if [ -n "$success" ]; then
    echo -e "${GREEN}✅ Tarefa criada com sucesso${NC}"
    task_id=$(echo "$task_response" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    
    # Marcar tarefa como completa
    echo -e "\n${YELLOW}✔️ Marcando tarefa como completa...${NC}"
    complete_response=$(curl -s -X PATCH \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"completed\": true, \"notes\": \"Revisão concluída\"}" \
        "$BACKEND_URL/api/v1/schedule/tasks/$task_id/complete")
    
    success=$(echo "$complete_response" | grep -o '"success":true')
    if [ -n "$success" ]; then
        echo -e "${GREEN}✅ Tarefa marcada como completa${NC}"
    else
        echo -e "${RED}❌ Erro ao marcar tarefa${NC}"
        echo "$complete_response"
    fi
else
    echo -e "${RED}❌ Erro ao criar tarefa${NC}"
    echo "$task_response"
fi

echo -e "\n${GREEN}✨ Teste concluído!${NC}"