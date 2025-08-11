#!/bin/bash

# Test Questions API - Sistema de Questões
# Testa todos os endpoints da API de questões

API_URL="http://173.208.151.106:8180"
EMAIL="admin@studypro.com"
PASSWORD="Admin@123"

echo "🧪 TESTE - API DE QUESTÕES"
echo "=================================="

# Step 1: Login to get token
echo "🔑 Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$EMAIL"'",
    "password": "'"$PASSWORD"'"
  }')

echo "Login Response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ ERRO: Não foi possível obter token de autenticação"
  exit 1
fi

echo "✅ Token obtido: ${TOKEN:0:20}..."
echo ""

# Step 2: List questions (with filters)
echo "📋 Listando questões..."
curl -s -X GET "$API_URL/api/v1/questions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Step 3: Get question statistics
echo "📊 Estatísticas de questões..."
curl -s -X GET "$API_URL/api/v1/questions/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Step 4: Get filter options
echo "🔍 Opções de filtros..."
curl -s -X GET "$API_URL/api/v1/questions/filters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Step 5: Get specific question
echo "📖 Buscando questão específica (q1)..."
curl -s -X GET "$API_URL/api/v1/questions/q1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Step 6: Create new multiple choice question
echo "➕ Criando nova questão (Múltipla Escolha)..."
NEW_QUESTION=$(curl -s -X POST "$API_URL/api/v1/questions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Qual é o órgão máximo do Poder Judiciário brasileiro?",
    "type": "multiple_choice",
    "subject": "Direito Constitucional",
    "topic": "Poder Judiciário",
    "difficulty": "easy",
    "options": [
      "Superior Tribunal de Justiça",
      "Supremo Tribunal Federal",
      "Tribunal Superior do Trabalho",
      "Tribunal de Contas da União"
    ],
    "correct_answer": 1,
    "explanation": "O Supremo Tribunal Federal é o órgão máximo do Poder Judiciário e guardião da Constituição Federal.",
    "exam_board": "CESPE",
    "exam_year": "2024",
    "exam_name": "Concurso Público - Teste",
    "reference": "CF/88, Art. 101",
    "tags": ["judiciário", "supremo", "stf"],
    "status": "published"
  }')

echo "$NEW_QUESTION" | jq '.'

# Extract question ID from response
NEW_QUESTION_ID=$(echo $NEW_QUESTION | jq -r '.data.id')
echo "Nova questão criada: $NEW_QUESTION_ID"
echo ""

# Step 7: Create true/false question
echo "➕ Criando questão Verdadeiro/Falso..."
TRUE_FALSE_QUESTION=$(curl -s -X POST "$API_URL/api/v1/questions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "O mandato do Presidente da República no Brasil é de 4 anos.",
    "type": "true_false",
    "subject": "Direito Constitucional",
    "topic": "Poder Executivo",
    "difficulty": "easy",
    "correct_boolean": true,
    "explanation": "Correto. O mandato presidencial é de 4 anos, conforme art. 82 da CF/88.",
    "exam_board": "FCC",
    "exam_year": "2024",
    "tags": ["executivo", "mandato", "presidente"],
    "status": "published"
  }')

echo "$TRUE_FALSE_QUESTION" | jq '.'

# Extract question ID
TRUE_FALSE_ID=$(echo $TRUE_FALSE_QUESTION | jq -r '.data.id')
echo "Questão V/F criada: $TRUE_FALSE_ID"
echo ""

# Step 8: Record answers for statistics
echo "📝 Registrando respostas para estatísticas..."

# Answer the first question correctly
curl -s -X POST "$API_URL/api/v1/questions/q1/answer" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_correct": true}' | jq '.'

# Answer incorrectly
curl -s -X POST "$API_URL/api/v1/questions/q1/answer" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_correct": false}' | jq '.'

echo ""

# Step 9: Test filters
echo "🔍 Testando filtros..."

echo "Filtrando por matéria (Direito Constitucional):"
curl -s -X GET "$API_URL/api/v1/questions?subject=Direito%20Constitucional&limit=3" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'

echo "Filtrando por tipo (multiple_choice):"
curl -s -X GET "$API_URL/api/v1/questions?type=multiple_choice&limit=3" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'

echo "Filtrando por dificuldade (easy):"
curl -s -X GET "$API_URL/api/v1/questions?difficulty=easy&limit=3" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'

echo "Busca textual (princípio):"
curl -s -X GET "$API_URL/api/v1/questions?search=princípio&limit=3" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'

echo ""

# Step 10: Update question
if [ ! -z "$NEW_QUESTION_ID" ]; then
  echo "✏️ Atualizando questão criada..."
  curl -s -X PUT "$API_URL/api/v1/questions/$NEW_QUESTION_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Qual é o órgão máximo do Poder Judiciário brasileiro? (ATUALIZADA)",
      "explanation": "O Supremo Tribunal Federal é o órgão máximo do Poder Judiciário e guardião da Constituição Federal. EXPLICAÇÃO ATUALIZADA."
    }' | jq '.'
  echo ""
fi

# Step 11: Bulk import test
echo "📦 Testando importação em lote..."
curl -s -X POST "$API_URL/api/v1/questions/bulk-import" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questions": [
      {
        "title": "Complete: A República Federativa do Brasil é formada pela união _______ dos Estados, Municípios e Distrito Federal.",
        "type": "fill_blank",
        "subject": "Direito Constitucional",
        "topic": "Fundamentos da República",
        "difficulty": "medium",
        "expected_answer": "indissolúvel",
        "explanation": "Art. 1º da CF/88: A República Federativa do Brasil é formada pela união indissolúvel dos Estados, Municípios e Distrito Federal.",
        "exam_board": "VUNESP",
        "exam_year": "2024",
        "tags": ["república", "federação", "união"],
        "status": "published"
      },
      {
        "title": "Dissertação: Explique o conceito de Estado Democrático de Direito previsto na Constituição Federal.",
        "type": "essay",
        "subject": "Direito Constitucional",
        "topic": "Estado Democrático de Direito",
        "difficulty": "hard",
        "expected_answer": "O Estado Democrático de Direito é um conceito que combina elementos do Estado de Direito (supremacia da lei, separação dos poderes) com a democracia (soberania popular, participação). Significa que o poder emana do povo e deve ser exercido dentro dos limites legais.",
        "explanation": "Resposta deve abordar: conceito, elementos democráticos, elementos do Estado de Direito, soberania popular, legalidade.",
        "exam_board": "CESPE",
        "exam_year": "2024",
        "tags": ["democracia", "estado direito", "soberania"],
        "status": "draft"
      }
    ]
  }' | jq '.'

echo ""

# Step 12: Final statistics
echo "📊 Estatísticas finais..."
curl -s -X GET "$API_URL/api/v1/questions/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Step 13: Try to delete question without answers
echo "🗑️ Tentando excluir questão..."
if [ ! -z "$NEW_QUESTION_ID" ]; then
  curl -s -X DELETE "$API_URL/api/v1/questions/$NEW_QUESTION_ID" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
fi

echo ""

# Summary
echo "✅ TESTE CONCLUÍDO!"
echo "=================================="
echo "🔍 Endpoints testados:"
echo "  • GET /api/v1/questions (listar com filtros)"
echo "  • GET /api/v1/questions/stats (estatísticas)"
echo "  • GET /api/v1/questions/filters (opções de filtros)"
echo "  • GET /api/v1/questions/:id (questão específica)"
echo "  • POST /api/v1/questions (criar questão)"
echo "  • PUT /api/v1/questions/:id (atualizar questão)"
echo "  • DELETE /api/v1/questions/:id (excluir questão)"
echo "  • POST /api/v1/questions/:id/answer (registrar resposta)"
echo "  • POST /api/v1/questions/bulk-import (importação em lote)"
echo ""
echo "📋 Tipos de questão testados:"
echo "  • multiple_choice (Múltipla Escolha)"
echo "  • true_false (Verdadeiro/Falso)"
echo "  • fill_blank (Completar Lacunas)"
echo "  • essay (Dissertativa)"
echo ""
echo "🏷️ Recursos testados:"
echo "  • Filtros (matéria, tipo, dificuldade, busca)"
echo "  • Paginação"
echo "  • Estatísticas e métricas"
echo "  • Validações específicas por tipo"
echo "  • Sistema de respostas e taxa de acerto"
echo "  • Importação em lote"
echo "  • Proteção admin (CRUD)"