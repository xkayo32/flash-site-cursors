#!/bin/bash

echo "🚀 Testando criação de flashcard tipo image_occlusion..."

# 1. Login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8180/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@studypro.com",
    "password": "Admin@123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "✅ Login realizado"

# 2. Criar flashcard image_occlusion
echo -e "\n📦 Criando flashcard image_occlusion..."

FC_RESPONSE=$(curl -s -X POST http://localhost:8180/api/v1/flashcards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "image_occlusion",
    "image": "https://example.com/anatomia.jpg",
    "occlusionAreas": [
      {
        "id": "area1",
        "x": 100,
        "y": 50,
        "width": 80,
        "height": 40,
        "answer": "Coração"
      },
      {
        "id": "area2",
        "x": 200,
        "y": 150,
        "width": 60,
        "height": 30,
        "answer": "Pulmão"
      }
    ],
    "difficulty": "hard",
    "category": "Medicina",
    "subcategory": "Anatomia",
    "tags": ["anatomia", "corpo_humano"],
    "front": "Identifique os órgãos na imagem",
    "back": "Coração e Pulmão"
  }')

echo "$FC_RESPONSE" | python3 -m json.tool

# 3. Verificar flashcard criado
FC_ID=$(echo "$FC_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$FC_ID" ]; then
  echo -e "\n✅ Flashcard criado com sucesso! ID: $FC_ID"
  
  echo -e "\n📋 Verificando flashcard criado:"
  curl -s -X GET "http://localhost:8180/api/v1/flashcards/$FC_ID" \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -30
else
  echo "❌ Erro ao criar flashcard"
fi
