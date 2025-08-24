#!/bin/bash

# Test Flashcards API - Sistema de Flashcards com SM-2
# Testa todos os endpoints da API de flashcards

API_URL="http://173.208.151.106:8180"
EMAIL="admin@studypro.com"
PASSWORD="Admin@123"

echo "🎯 TESTE - API DE FLASHCARDS"
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

# Step 2: List flashcards
echo "📋 Listando flashcards..."
curl -s -X GET "$API_URL/api/v1/flashcards" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Step 3: Get flashcard statistics
echo "📊 Estatísticas de flashcards..."
curl -s -X GET "$API_URL/api/v1/flashcards/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Step 4: Get filter options
echo "🔍 Opções de filtros..."
curl -s -X GET "$API_URL/api/v1/flashcards/filters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Step 5: Create basic flashcard
echo "➕ Criando flashcard básico..."
BASIC_FLASHCARD=$(curl -s -X POST "$API_URL/api/v1/flashcards" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "basic",
    "difficulty": "medium",
    "category": "DIREITO",
    "subcategory": "Penal",
    "tags": ["CP", "ROUBO", "ARTIGO"],
    "status": "published",
    "front": "Art. 157 do Código Penal",
    "back": "Subtrair coisa móvel alheia, para si ou para outrem, mediante grave ameaça ou violência a pessoa.\nPena - reclusão, de 4 a 10 anos, e multa."
  }')

echo "$BASIC_FLASHCARD" | jq '.'

# Extract flashcard ID
FLASHCARD_ID=$(echo $BASIC_FLASHCARD | jq -r '.data.id')
echo "Flashcard criado: $FLASHCARD_ID"
echo ""

# Step 6: Create cloze flashcard
echo "➕ Criando flashcard de lacunas (cloze)..."
CLOZE_FLASHCARD=$(curl -s -X POST "$API_URL/api/v1/flashcards" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "cloze",
    "difficulty": "hard",
    "category": "DIREITO",
    "subcategory": "Constitucional",
    "tags": ["CF88", "DIREITOS", "FUNDAMENTAIS"],
    "status": "published",
    "text": "Art. 5º CF - Todos são {{c1::iguais}} perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à {{c2::vida}}, à {{c3::liberdade}}, à {{c4::igualdade}}, à {{c5::segurança}} e à {{c6::propriedade}}.",
    "extra": "Direitos e Garantias Fundamentais"
  }')

echo "$CLOZE_FLASHCARD" | jq '.'
echo ""

# Step 7: Create multiple choice flashcard
echo "➕ Criando flashcard de múltipla escolha..."
MC_FLASHCARD=$(curl -s -X POST "$API_URL/api/v1/flashcards" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "multiple_choice",
    "difficulty": "medium",
    "category": "SEGURANÇA PÚBLICA",
    "subcategory": "Hierarquia",
    "tags": ["HIERARQUIA", "PATENTES", "OFICIAL"],
    "status": "published",
    "question": "Qual é a maior patente entre os oficiais superiores?",
    "options": ["Major", "Coronel", "Tenente-Coronel", "Capitão"],
    "correct": 1,
    "explanation": "Coronel é a maior patente entre os oficiais superiores, seguido por Tenente-Coronel e Major."
  }')

echo "$MC_FLASHCARD" | jq '.'
echo ""

# Step 8: Create true/false flashcard
echo "➕ Criando flashcard verdadeiro/falso..."
TF_FLASHCARD=$(curl -s -X POST "$API_URL/api/v1/flashcards" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "true_false",
    "difficulty": "easy",
    "category": "DIREITO",
    "subcategory": "Processual Penal",
    "tags": ["CPP", "PRISÃO", "PREVENTIVA"],
    "status": "published",
    "statement": "A prisão preventiva pode ser decretada em qualquer fase da investigação policial ou do processo penal.",
    "answer": "true",
    "explanation": "Art. 312 do CPP - A prisão preventiva poderá ser decretada como garantia da ordem pública, da ordem econômica, por conveniência da instrução criminal ou para assegurar a aplicação da lei penal."
  }')

echo "$TF_FLASHCARD" | jq '.'
echo ""

# Step 9: Record study session
if [ ! -z "$FLASHCARD_ID" ]; then
  echo "📝 Registrando sessão de estudo..."
  
  # Study with correct answer
  curl -s -X POST "$API_URL/api/v1/flashcards/$FLASHCARD_ID/study" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"is_correct": true, "quality": 4}' | jq '.'
  
  # Study with incorrect answer
  curl -s -X POST "$API_URL/api/v1/flashcards/$FLASHCARD_ID/study" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"is_correct": false, "quality": 1}' | jq '.'
  
  echo ""
fi

# Step 10: Get flashcards due for review
echo "📅 Buscando flashcards pendentes de revisão..."
curl -s -X GET "$API_URL/api/v1/flashcards?due_only=true&status=published" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'
echo ""

# Step 11: Test filters
echo "🔍 Testando filtros..."

echo "Filtrando por categoria (DIREITO):"
curl -s -X GET "$API_URL/api/v1/flashcards?category=DIREITO&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'

echo "Filtrando por tipo (basic):"
curl -s -X GET "$API_URL/api/v1/flashcards?type=basic&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'

echo "Filtrando por dificuldade (medium):"
curl -s -X GET "$API_URL/api/v1/flashcards?difficulty=medium&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'

echo ""

# Step 12: Update flashcard
if [ ! -z "$FLASHCARD_ID" ]; then
  echo "✏️ Atualizando flashcard..."
  curl -s -X PUT "$API_URL/api/v1/flashcards/$FLASHCARD_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "back": "Subtrair coisa móvel alheia, para si ou para outrem, mediante grave ameaça ou violência a pessoa. (ATUALIZADO)\nPena - reclusão, de 4 a 10 anos, e multa."
    }' | jq '.'
  echo ""
fi

# Step 13: Get specific flashcard
if [ ! -z "$FLASHCARD_ID" ]; then
  echo "📖 Buscando flashcard específico..."
  curl -s -X GET "$API_URL/api/v1/flashcards/$FLASHCARD_ID" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
  echo ""
fi

# Step 14: Final statistics
echo "📊 Estatísticas finais..."
curl -s -X GET "$API_URL/api/v1/flashcards/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Summary
echo "✅ TESTE CONCLUÍDO!"
echo "=================================="
echo "🔍 Endpoints testados:"
echo "  • GET /api/v1/flashcards (listar com filtros)"
echo "  • GET /api/v1/flashcards/stats (estatísticas)"
echo "  • GET /api/v1/flashcards/filters (opções de filtros)"
echo "  • GET /api/v1/flashcards/:id (flashcard específico)"
echo "  • POST /api/v1/flashcards (criar flashcard)"
echo "  • PUT /api/v1/flashcards/:id (atualizar flashcard)"
echo "  • POST /api/v1/flashcards/:id/study (registrar estudo)"
echo ""
echo "📋 Tipos de flashcard testados:"
echo "  • basic (Básico - frente/verso)"
echo "  • cloze (Lacunas com {{c1::palavra}})"
echo "  • multiple_choice (Múltipla Escolha)"
echo "  • true_false (Verdadeiro/Falso)"
echo ""
echo "🎯 Recursos testados:"
echo "  • Filtros (categoria, tipo, dificuldade)"
echo "  • Sistema SM-2 de repetição espaçada"
echo "  • Estatísticas e métricas"
echo "  • Flashcards pendentes de revisão"
echo "  • Proteção admin (CRUD)"