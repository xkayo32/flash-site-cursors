#!/bin/bash

# Script para popular mais dados de teste no backend
echo "====================================="
echo "🎯 POPULANDO DADOS ADICIONAIS"
echo "====================================="
echo ""

# Configurações
API_URL="http://localhost:8181/api/v1"

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
        return 0
    else
        echo -e "   ${YELLOW}⚠️ Erro ao criar (Status: $HTTP_STATUS)${NC}"
        return 1
    fi
}

# ============================================
# POPULAR DADOS ADICIONAIS
# ============================================

echo "=== 📚 CRIANDO MAIS CURSOS TÁTICOS ==="
CATEGORIES=("POLÍCIA FEDERAL" "POLÍCIA CIVIL" "POLÍCIA MILITAR" "BOMBEIROS" "GUARDA MUNICIPAL")
LEVELS=("beginner" "intermediate" "advanced")

for i in {6..15}; do
    CAT_INDEX=$((i % 5))
    LEVEL_INDEX=$((i % 3))
    CATEGORY="${CATEGORIES[$CAT_INDEX]}"
    LEVEL="${LEVELS[$LEVEL_INDEX]}"
    
    create_data "/courses" '{
        "title": "Operação Tática '${i}' - '${CATEGORY}'",
        "description": "Treinamento especializado em operações de '${CATEGORY}' nível '${LEVEL}'",
        "category": "'${CATEGORY}'",
        "price": '$((500 + i * 50))',
        "difficulty_level": "'${LEVEL}'",
        "duration_hours": '$((20 + i * 5))',
        "duration_months": '$((i % 6 + 1))',
        "requirements": ["Ensino médio", "Aptidão física", "Idade mínima 18 anos"],
        "objectives": ["Dominar procedimentos", "Liderança tática", "Gestão de crises"],
        "target_audience": "Profissionais de segurança pública",
        "certification_available": true,
        "instructor_name": "Instrutor Tático '${i}'",
        "thumbnail": "/images/tactical-'${i}'.jpg",
        "status": "published"
    }' "Curso ${CATEGORY} ${i}"
done

echo ""
echo "=== ❓ CRIANDO BANCO DE QUESTÕES TÁTICAS ==="
SUBJECTS=("Direito Constitucional" "Direito Penal" "Direito Administrativo" "Português" "Matemática" "Informática" "Atualidades")
DIFFICULTIES=("easy" "medium" "hard" "expert")

for i in {21..50}; do
    SUBJ_INDEX=$((i % 7))
    DIFF_INDEX=$((i % 4))
    SUBJECT="${SUBJECTS[$SUBJ_INDEX]}"
    DIFFICULTY="${DIFFICULTIES[$DIFF_INDEX]}"
    
    create_data "/questions" '{
        "question": "Questão '${i}' de '${SUBJECT}': Qual alternativa está correta sobre os princípios fundamentais?",
        "type": "multiple_choice",
        "difficulty": "'${DIFFICULTY}'",
        "category": "Segurança Pública",
        "subcategory": "'${SUBJECT}'",
        "topic": "Princípios e Normas",
        "options": [
            "Alternativa A - Resposta técnica detalhada",
            "Alternativa B - Resposta parcialmente correta",
            "Alternativa C - Resposta incorreta mas plausível",
            "Alternativa D - Resposta completamente incorreta"
        ],
        "correct_answer": '$((i % 4))',
        "explanation": "A alternativa correta é baseada nos princípios fundamentais de '${SUBJECT}' conforme estabelecido na legislação vigente.",
        "points": '$((10 + (i % 4) * 5))',
        "tags": ["'${SUBJECT}'", "concurso", "tática"],
        "exam_board": "CESPE",
        "year": '$((2020 + (i % 5)))'
    }' "Questão ${SUBJECT} ${i}"
done

echo ""
echo "=== 🎴 CRIANDO ARSENAL DE FLASHCARDS ==="
CARD_TYPES=("basic" "basic_inverted" "cloze" "multiple_choice" "true_false" "type_answer" "image_occlusion")

for i in {21..60}; do
    TYPE_INDEX=$((i % 7))
    TYPE="${CARD_TYPES[$TYPE_INDEX]}"
    SUBJ_INDEX=$((i % 7))
    SUBJECT="${SUBJECTS[$SUBJ_INDEX]}"
    
    FRONT_TEXT="Conceito '${i}' de '${SUBJECT}': O que significa este princípio?"
    BACK_TEXT="Definição: Este é o conceito fundamental que estabelece as bases para '${SUBJECT}' no contexto de segurança pública."
    
    if [ "$TYPE" = "cloze" ]; then
        FRONT_TEXT="O princípio da {{c1::legalidade}} estabelece que a administração pública só pode fazer o que a {{c2::lei}} autoriza."
    elif [ "$TYPE" = "multiple_choice" ]; then
        FRONT_TEXT="Qual princípio rege a administração pública?"
    elif [ "$TYPE" = "true_false" ]; then
        FRONT_TEXT="Verdadeiro ou Falso: Todo ato administrativo deve ser motivado."
    fi
    
    create_data "/flashcards" '{
        "type": "'${TYPE}'",
        "front": "'${FRONT_TEXT}'",
        "back": "'${BACK_TEXT}'",
        "category": "'${SUBJECT}'",
        "subcategory": "Conceitos Fundamentais",
        "difficulty": "medium",
        "tags": ["'${SUBJECT}'", "conceitos", "revisão"],
        "course_id": null,
        "deck_id": null,
        "ease_factor": 2.5,
        "interval": 1,
        "reviews": 0,
        "correct_count": 0,
        "incorrect_count": 0
    }' "Flashcard ${TYPE} ${SUBJECT} ${i}"
done

echo ""
echo "=== 📝 CRIANDO SIMULADOS COMPLETOS ==="
EXAM_TYPES=("Polícia Federal" "Polícia Civil" "Polícia Militar" "Bombeiros" "Guarda Municipal")

for i in {6..15}; do
    TYPE_INDEX=$((i % 5))
    EXAM_TYPE="${EXAM_TYPES[$TYPE_INDEX]}"
    
    create_data "/mockexams" '{
        "title": "Simulado '${EXAM_TYPE}' - Edição '${i}'",
        "description": "Simulado completo baseado em provas anteriores de '${EXAM_TYPE}'",
        "category": "'${EXAM_TYPE}'",
        "difficulty": "medium",
        "duration_minutes": '$((90 + (i % 4) * 30))',
        "passing_score": '$((60 + (i % 4) * 5))',
        "question_count": '$((40 + (i % 6) * 10))',
        "instructions": "Leia atentamente cada questão. Não é permitido consulta a materiais externos.",
        "is_active": true,
        "tags": ["simulado", "'${EXAM_TYPE}'", "completo"],
        "exam_board": "CESPE",
        "year": '$((2024 - (i % 3)))',
        "attempts_allowed": 3,
        "show_answers_after": true,
        "randomize_questions": true
    }' "Simulado ${EXAM_TYPE} ${i}"
done

echo ""
echo "=== 📋 POPULANDO PROVAS ANTERIORES ==="
BANCAS=("CESPE" "FCC" "VUNESP" "FGV" "IDECAN" "CONSULPLAN" "QUADRIX")
POSITIONS=("Agente" "Escrivão" "Delegado" "Investigador" "Perito" "Oficial")

for i in {21..50}; do
    BANCA_INDEX=$((i % 7))
    POS_INDEX=$((i % 6))
    TYPE_INDEX=$((i % 5))
    
    BANCA="${BANCAS[$BANCA_INDEX]}"
    POSITION="${POSITIONS[$POS_INDEX]}"
    ORGANIZATION="${EXAM_TYPES[$TYPE_INDEX]}"
    YEAR=$((2015 + (i % 10)))
    
    create_data "/previousexams" '{
        "title": "Concurso '${ORGANIZATION}' - '${POSITION}' '${YEAR}'",
        "organization": "'${ORGANIZATION}'",
        "banca": "'${BANCA}'",
        "year": '${YEAR}',
        "position": "'${POSITION}'",
        "description": "Prova aplicada no concurso para '${POSITION}' da '${ORGANIZATION}' em '${YEAR}'",
        "question_count": '$((60 + (i % 5) * 20))',
        "difficulty": "'$( [ $((i % 3)) -eq 0 ] && echo "hard" || echo "medium" )'",
        "tags": ["concurso", "'${ORGANIZATION}'", "'${BANCA}'", "'${YEAR}'"],
        "pdf_url": "/exams/'${YEAR}'/'${ORGANIZATION}'.pdf",
        "gabarito_url": "/exams/'${YEAR}'/'${ORGANIZATION}'_gabarito.pdf",
        "subjects": ["Português", "Matemática", "Direito", "Informática"],
        "passing_score": '$((50 + (i % 3) * 10))',
        "total_candidates": '$((5000 + i * 100))',
        "approved_candidates": '$((100 + i * 5))'
    }' "Prova ${ORGANIZATION} ${POSITION} ${YEAR}"
done

echo ""
echo "=== 📖 CRIANDO BIBLIOTECA DE RESUMOS ==="
TOPICS=("Direito Constitucional" "Direito Penal" "Direito Administrativo" "Português" "Raciocínio Lógico" "Informática" "Legislação")

for i in {11..30}; do
    TOPIC_INDEX=$((i % 7))
    TOPIC="${TOPICS[$TOPIC_INDEX]}"
    
    create_data "/summaries" '{
        "title": "Resumo Completo - '${TOPIC}' Parte '${i}'",
        "description": "Material condensado com os principais tópicos de '${TOPIC}' para concursos",
        "content": "# '${TOPIC}' - Parte '${i}'\n\n## Introdução\nEste resumo aborda os conceitos fundamentais...\n\n## Tópico 1: Princípios\n- Princípio da Legalidade\n- Princípio da Impessoalidade\n- Princípio da Moralidade\n\n## Tópico 2: Aplicações\nNa prática, estes conceitos são aplicados...\n\n## Exercícios Resolvidos\n1. Questão exemplo com resolução\n2. Caso prático comentado\n\n## Mapas Mentais\n[Diagrama conceitual]\n\n## Revisão Rápida\n- Ponto chave 1\n- Ponto chave 2\n- Ponto chave 3",
        "category": "'${TOPIC}'",
        "subcategory": "Material de Estudo",
        "difficulty": "'$( [ $((i % 3)) -eq 0 ] && echo "advanced" || [ $((i % 3)) -eq 1 ] && echo "intermediate" || echo "beginner" )'",
        "author": "Equipe StudyPro",
        "tags": ["'${TOPIC}'", "resumo", "concurso", "estudo"],
        "is_premium": '$( [ $((i % 2)) -eq 0 ] && echo "true" || echo "false" )',
        "status": "published",
        "views": '$((100 + i * 50))',
        "likes": '$((10 + i * 2))',
        "downloads": '$((5 + i))',
        "estimated_reading_time": '$((15 + (i % 4) * 5))',
        "last_updated": "'$(date -d "-$((i % 30)) days" +%Y-%m-%d)'"
    }' "Resumo ${TOPIC} ${i}"
done

echo ""
echo "=== ⚖️ POPULANDO LEGISLAÇÃO ATUALIZADA ==="
LEG_TYPES=("lei" "decreto" "portaria" "resolução" "instrução normativa" "súmula" "orientação")

for i in {16..40}; do
    TYPE_INDEX=$((i % 7))
    LEG_TYPE="${LEG_TYPES[$TYPE_INDEX]}"
    YEAR=$((2020 + (i % 5)))
    
    create_data "/legislation" '{
        "title": "'${LEG_TYPE^}' nº '${i}'.000/'${YEAR}' - Segurança Pública",
        "type": "'${LEG_TYPE}'",
        "number": "'${i}'.000/'${YEAR}'",
        "date": "'${YEAR}'-'$(printf "%02d" $((i % 12 + 1)))'-'$(printf "%02d" $((i % 28 + 1)))'",
        "summary": "Dispõe sobre normas e procedimentos de segurança pública, estabelecendo diretrizes para atuação das forças policiais.",
        "content": "CAPÍTULO I - DISPOSIÇÕES PRELIMINARES\n\nArt. 1º Esta '${LEG_TYPE}' estabelece as diretrizes gerais para...\n\nArt. 2º São objetivos fundamentais:\nI - Garantir a segurança pública;\nII - Proteger os direitos fundamentais;\nIII - Promover a ordem social.\n\nCAPÍTULO II - DAS COMPETÊNCIAS\n\nArt. 3º Compete aos órgãos de segurança pública...\n\nCAPÍTULO III - DOS PROCEDIMENTOS\n\nArt. 4º Os procedimentos operacionais devem observar...",
        "category": "Segurança Pública",
        "subcategory": "Normas Gerais",
        "tags": ["legislação", "segurança", "'${LEG_TYPE}'"],
        "is_active": true,
        "related_legislation": [],
        "amendments": [],
        "revoked_by": null,
        "revokes": null,
        "source_url": "http://www.planalto.gov.br/legislacao/'${YEAR}'/'${i}'",
        "importance": "'$( [ $((i % 3)) -eq 0 ] && echo "high" || echo "medium" )'"
    }' "Legislação ${LEG_TYPE} ${i}/${YEAR}"
done

echo ""
echo "=== 💬 CRIANDO COMENTÁRIOS E AVALIAÇÕES ==="
ENTITIES=("course" "question" "flashcard" "summary" "mockexam")
RATINGS=(5 4 4 5 3 5 4 5)

for i in {11..30}; do
    ENTITY_INDEX=$((i % 5))
    RATING_INDEX=$((i % 8))
    ENTITY="${ENTITIES[$ENTITY_INDEX]}"
    RATING="${RATINGS[$RATING_INDEX]}"
    
    create_data "/comments" '{
        "entity_type": "'${ENTITY}'",
        "entity_id": "'${ENTITY}_'${i}'",
        "content": "Material excelente! Muito bem explicado e direto ao ponto. '$( [ ${RATING} -eq 5 ] && echo "Recomendo fortemente!" || [ ${RATING} -eq 4 ] && echo "Bom conteúdo, alguns pontos podem melhorar." || echo "Útil mas precisa de mais detalhes." )'",
        "rating": '${RATING}'
    }' "Comentário ${ENTITY} ${i}"
done

echo ""
echo "=== 📅 CRIANDO AGENDA DE ESTUDOS ==="
TASK_TYPES=("Revisar flashcards" "Resolver questões" "Assistir aula" "Fazer simulado" "Ler legislação" "Revisar resumo")
PRIORITIES=("high" "medium" "low")

for i in {11..25}; do
    TASK_INDEX=$((i % 6))
    PRIORITY_INDEX=$((i % 3))
    TASK="${TASK_TYPES[$TASK_INDEX]}"
    PRIORITY="${PRIORITIES[$PRIORITY_INDEX]}"
    DAYS_AHEAD=$((i % 30))
    
    create_data "/schedule/tasks" '{
        "title": "'${TASK}' - Dia '${i}'",
        "description": "Tarefa agendada: '${TASK}' com foco em preparação para concurso",
        "priority": "'${PRIORITY}'",
        "due_date": "'$(date -d "+${DAYS_AHEAD} days" +%Y-%m-%d)'",
        "category": "Estudo",
        "status": "pending",
        "estimated_duration": '$((30 + (i % 4) * 15))',
        "reminder": true,
        "recurring": '$( [ $((i % 3)) -eq 0 ] && echo "true" || echo "false" )',
        "tags": ["estudo", "concurso", "'${TASK}'"]
    }' "Tarefa ${TASK} ${i}"
done

echo ""
echo "====================================="
echo "📊 RESUMO DOS DADOS ADICIONAIS"
echo "====================================="
echo ""
echo -e "${GREEN}✅ Processo concluído!${NC}"
echo ""
echo "Dados criados:"
echo "- 10 Cursos Táticos Adicionais"
echo "- 30 Questões Táticas"
echo "- 40 Flashcards Variados"
echo "- 10 Simulados Completos"
echo "- 30 Provas Anteriores"
echo "- 20 Resumos Detalhados"
echo "- 25 Legislações Atualizadas"
echo "- 20 Comentários e Avaliações"
echo "- 15 Tarefas Agendadas"
echo ""
echo "Total de novos registros: ~200 items"
echo ""
echo "====================================="

exit 0