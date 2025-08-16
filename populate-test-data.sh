#!/bin/bash

# Script para popular dados de teste no backend
echo "====================================="
echo "🎯 POPULANDO DADOS DE TESTE"
echo "====================================="
echo ""

# Configurações
API_URL="http://173.208.151.106:8180/api/v1"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Login como admin
echo -e "${BLUE}🔐 Autenticando como admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@studypro.com","password":"Admin@123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Falha na autenticação${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Autenticado com sucesso${NC}"
echo ""

# Função para criar dados
create_data() {
    local ENDPOINT=$1
    local DATA=$2
    local DESCRIPTION=$3
    
    echo -e "${BLUE}📡 Criando:${NC} $DESCRIPTION"
    
    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$DATA" \
        "$API_URL$ENDPOINT")
    
    HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
    
    if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
        echo -e "   ${GREEN}✅ Criado com sucesso${NC}"
    else
        echo -e "   ${YELLOW}⚠️ Erro ao criar (Status: $HTTP_STATUS)${NC}"
    fi
    echo ""
}

# ============================================
# POPULAR DADOS DE TESTE
# ============================================

echo "=== 📚 CRIANDO CURSOS ==="
for i in {1..5}; do
    create_data "/courses" '{
        "title": "Curso Tático '$i' - Operações Especiais",
        "description": "Treinamento avançado em operações táticas nível '$i'",
        "category": "POLÍCIA FEDERAL",
        "price": '$((1000 + i * 100))',
        "difficulty_level": "intermediate",
        "duration_hours": '$((40 + i * 10))',
        "duration_months": '$i',
        "requirements": ["Ensino médio completo", "Aptidão física"],
        "objectives": ["Dominar técnicas táticas", "Liderança operacional"],
        "target_audience": "Agentes de segurança pública",
        "certification_available": true,
        "instructor_name": "Comandante Silva",
        "thumbnail": "/images/course-'$i'.jpg",
        "status": "published"
    }' "Curso Tático $i"
done

echo "=== 📖 CRIANDO RESUMOS ==="
for i in {1..10}; do
    create_data "/summaries" '{
        "title": "Resumo Tático '$i' - Manual de Operações",
        "description": "Resumo completo sobre procedimentos operacionais padrão",
        "content": "## Introdução\nEste resumo aborda os principais conceitos táticos...\n\n## Seção 1\nProcedimentos básicos de abordagem...\n\n## Seção 2\nTécnicas avançadas de infiltração...",
        "category": "Táticas Policiais",
        "subcategory": "Operações Especiais",
        "difficulty": "intermediate",
        "author": "Major Santos",
        "tags": ["tática", "operações", "segurança"],
        "is_premium": '$([ $((i % 2)) -eq 0 ] && echo "true" || echo "false")',
        "status": "published"
    }' "Resumo Tático $i"
done

echo "=== ⚖️ CRIANDO LEGISLAÇÕES ==="
LEGISLATION_TYPES=("lei" "decreto" "portaria" "resolucao" "instrucao_normativa")
for i in {1..15}; do
    TYPE_INDEX=$((i % 5))
    TYPE=${LEGISLATION_TYPES[$TYPE_INDEX]}
    create_data "/legislation" '{
        "title": "Legislação '$i'/2024 - Normas de Segurança Pública",
        "type": "'$TYPE'",
        "number": "'$i'/2024",
        "date": "2024-'$(printf "%02d" $((i % 12 + 1)))'-15",
        "summary": "Dispõe sobre as normas e procedimentos de segurança pública aplicáveis às forças policiais",
        "content": "CAPÍTULO I - DAS DISPOSIÇÕES GERAIS\n\nArt. 1º Esta '$TYPE' estabelece as diretrizes...\n\nArt. 2º São princípios fundamentais...",
        "category": "Segurança Pública",
        "tags": ["segurança", "polícia", "normas"],
        "is_active": true,
        "related_legislation": []
    }' "Legislação $TYPE $i"
done

echo "=== ❓ CRIANDO QUESTÕES ==="
DIFFICULTIES=("easy" "medium" "hard")
for i in {1..20}; do
    DIFF_INDEX=$((i % 3))
    DIFFICULTY=${DIFFICULTIES[$DIFF_INDEX]}
    create_data "/questions" '{
        "question": "Questão Tática '$i': Qual é o procedimento correto em uma operação de alto risco?",
        "type": "multiple_choice",
        "difficulty": "'$DIFFICULTY'",
        "category": "Táticas Policiais",
        "subcategory": "Operações Especiais",
        "topic": "Procedimentos de Segurança",
        "options": [
            "Avaliar a situação e solicitar reforços",
            "Agir imediatamente sem análise prévia",
            "Aguardar ordens superiores sempre",
            "Recuar e abandonar a operação"
        ],
        "correct_answer": 0,
        "explanation": "A avaliação da situação é fundamental antes de qualquer ação em operações de alto risco.",
        "points": '$((i * 10))',
        "tags": ["tática", "segurança", "operações"]
    }' "Questão $DIFFICULTY $i"
done

echo "=== 🎴 CRIANDO FLASHCARDS ==="
FLASHCARD_TYPES=("basic" "cloze" "multiple_choice" "true_false" "type_answer")
for i in {1..20}; do
    TYPE_INDEX=$((i % 5))
    TYPE=${FLASHCARD_TYPES[$TYPE_INDEX]}
    create_data "/flashcards" '{
        "type": "'$TYPE'",
        "front": "Flashcard Tático '$i': Conceito de Segurança Operacional",
        "back": "Conjunto de medidas preventivas para garantir a integridade da operação",
        "category": "Segurança",
        "subcategory": "Operações",
        "difficulty": "medium",
        "tags": ["segurança", "tática", "operações"],
        "course_id": null,
        "deck_id": null
    }' "Flashcard $TYPE $i"
done

echo "=== 📝 CRIANDO SIMULADOS ==="
for i in {1..5}; do
    create_data "/mockexams" '{
        "title": "Simulado Tático '$i' - Avaliação Operacional",
        "description": "Teste seus conhecimentos em procedimentos táticos e operacionais",
        "category": "Táticas Policiais",
        "difficulty": "medium",
        "duration_minutes": '$((60 + i * 15))',
        "passing_score": 70,
        "question_count": '$((20 + i * 5))',
        "instructions": "Leia atentamente cada questão antes de responder",
        "is_active": true,
        "tags": ["simulado", "tática", "avaliação"]
    }' "Simulado $i"
done

echo "=== 📋 CRIANDO PROVAS ANTERIORES ==="
ORGANIZATIONS=("Polícia Federal" "Polícia Civil SP" "Polícia Militar RJ" "Bombeiros DF" "Guarda Municipal SP")
BANCAS=("CESPE" "FCC" "VUNESP" "FGV" "IDECAN")
for i in {1..20}; do
    ORG_INDEX=$((i % 5))
    BANCA_INDEX=$((i % 5))
    create_data "/previousexams" '{
        "title": "Concurso '${ORGANIZATIONS[$ORG_INDEX]}' - 202'$((i % 5))'",
        "organization": "'${ORGANIZATIONS[$ORG_INDEX]}'",
        "banca": "'${BANCAS[$BANCA_INDEX]}'",
        "year": 202'$((i % 5))',
        "position": "Agente",
        "description": "Prova aplicada no concurso para agente",
        "question_count": '$((50 + i * 5))',
        "difficulty": "medium",
        "tags": ["concurso", "prova", "'${ORGANIZATIONS[$ORG_INDEX]}'"]
    }' "Prova ${ORGANIZATIONS[$ORG_INDEX]} 202$((i % 5))"
done

echo "=== 💬 CRIANDO COMENTÁRIOS ==="
for i in {1..10}; do
    create_data "/comments" '{
        "entity_type": "course",
        "entity_id": "course_'$i'",
        "content": "Excelente material de estudo! Recomendo fortemente este conteúdo.",
        "rating": '$((3 + (i % 3)))'
    }' "Comentário $i"
done

echo "=== 📅 CRIANDO TAREFAS ==="
for i in {1..10}; do
    create_data "/schedule/tasks" '{
        "title": "Tarefa Operacional '$i'",
        "description": "Completar módulo de treinamento tático",
        "priority": "high",
        "due_date": "2024-12-'$(printf "%02d" $((i + 20)))'",
        "category": "Treinamento",
        "status": "pending"
    }' "Tarefa $i"
done

echo "=== 📊 CRIANDO DADOS DE ANALYTICS ==="
# Analytics geralmente são gerados automaticamente, mas vamos criar alguns dados base
create_data "/analytics/track" '{
    "event": "course_view",
    "data": {
        "course_id": "1",
        "duration": 300,
        "completion": 25
    }
}' "Analytics - Visualização de Curso"

create_data "/analytics/track" '{
    "event": "quiz_completed",
    "data": {
        "quiz_id": "1",
        "score": 85,
        "time_spent": 1200
    }
}' "Analytics - Quiz Completado"

echo ""
echo "====================================="
echo "📊 RESUMO DA POPULAÇÃO DE DADOS"
echo "====================================="
echo ""
echo -e "${GREEN}✅ Processo concluído!${NC}"
echo ""
echo "Dados criados:"
echo "- 5 Cursos"
echo "- 10 Resumos"
echo "- 15 Legislações"
echo "- 20 Questões"
echo "- 20 Flashcards"
echo "- 5 Simulados"
echo "- 20 Provas Anteriores"
echo "- 10 Comentários"
echo "- 10 Tarefas"
echo "- Dados de Analytics"
echo ""
echo "Execute o teste de integração novamente para verificar:"
echo "./test-admin-final.sh"
echo ""
echo "====================================="

exit 0