#!/bin/bash

echo "🔍 Verificando flashcards criados separadamente..."

# 1. Login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8180/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@studypro.com",
    "password": "Admin@123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Buscar últimos flashcards criados
echo -e "\n📋 Últimos flashcards criados:"
curl -s -X GET "http://localhost:8180/api/v1/flashcards?limit=10" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | grep -E '"type"|"front"|"text"|"question"|"statement"|"image"' | head -20

# 3. Criar deck e depois adicionar flashcards separadamente
echo -e "\n\n🔧 Testando criação de deck e adição de flashcards..."

# Criar deck vazio primeiro
DECK_ID=$(curl -s -X POST http://localhost:8180/api/v1/flashcard-decks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Deck Teste Separado",
    "description": "Testando adição de flashcards"
  }' | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

echo "Deck criado: $DECK_ID"

# Criar flashcard individual e adicionar ao deck
FC_RESPONSE=$(curl -s -X POST http://localhost:8180/api/v1/flashcards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "image_occlusion",
    "image": "https://example.com/test.jpg",
    "occlusionAreas": [
      {
        "id": "area1",
        "x": 10,
        "y": 10,
        "width": 100,
        "height": 50,
        "answer": "Resposta 1"
      }
    ],
    "difficulty": "medium",
    "deck_id": "'$DECK_ID'"
  }')

echo -e "\n📦 Resposta da criação do flashcard image_occlusion:"
echo "$FC_RESPONSE" | python3 -m json.tool | head -30

# Verificar deck atualizado
echo -e "\n📋 Deck após adicionar flashcard:"
curl -s -X GET "http://localhost:8180/api/v1/flashcard-decks/$DECK_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -20
