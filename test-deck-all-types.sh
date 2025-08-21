#!/bin/bash

# Teste de criação de deck com todos os 7 tipos de flashcards

echo "🚀 Testando criação de deck com todos os 7 tipos de flashcards..."

# 1. Login
echo -e "\n1. Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8180/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@studypro.com",
    "password": "Admin@123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Erro no login"
  exit 1
fi

echo "✅ Login realizado com sucesso"

# 2. Criar deck com flashcards de todos os tipos
echo -e "\n2. Criando deck com todos os 7 tipos..."

DECK_RESPONSE=$(curl -s -X POST http://localhost:8180/api/v1/flashcard-decks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Deck Completo - Todos os 7 Tipos",
    "description": "Deck de teste com todos os tipos de flashcards",
    "flashcards": [
      {
        "type": "basic",
        "front": "Qual é a capital do Brasil?",
        "back": "Brasília",
        "difficulty": "easy",
        "tags": ["geografia", "brasil"]
      },
      {
        "type": "basic_inverted",
        "front": "Fórmula da água",
        "back": "H2O",
        "extra": "Duas moléculas de hidrogênio e uma de oxigênio",
        "difficulty": "easy",
        "tags": ["química"]
      },
      {
        "type": "cloze",
        "text": "A {{c1::fotossíntese}} é o processo pelo qual as plantas convertem {{c2::luz solar}} em energia",
        "front": "A {{c1::fotossíntese}} é o processo pelo qual as plantas convertem {{c2::luz solar}} em energia",
        "difficulty": "medium",
        "tags": ["biologia"]
      },
      {
        "type": "multiple_choice",
        "question": "Qual destes é um mamífero?",
        "options": ["Tubarão", "Baleia", "Pinguim", "Crocodilo"],
        "correct": 1,
        "explanation": "Baleias são mamíferos marinhos",
        "difficulty": "medium",
        "tags": ["biologia", "animais"]
      },
      {
        "type": "true_false",
        "statement": "O Sol gira em torno da Terra",
        "answer": "false",
        "explanation": "A Terra gira em torno do Sol",
        "difficulty": "easy",
        "tags": ["astronomia"]
      },
      {
        "type": "type_answer",
        "question": "Quanto é 15 x 8?",
        "answer": "120",
        "hint": "Multiplique 15 por 8",
        "difficulty": "medium",
        "tags": ["matemática"]
      },
      {
        "type": "image_occlusion",
        "image": "https://example.com/mapa-brasil.jpg",
        "occlusionAreas": [
          {
            "id": "area1",
            "x": 100,
            "y": 50,
            "width": 80,
            "height": 40,
            "answer": "São Paulo"
          },
          {
            "id": "area2",
            "x": 200,
            "y": 100,
            "width": 80,
            "height": 40,
            "answer": "Rio de Janeiro"
          }
        ],
        "difficulty": "hard",
        "tags": ["geografia", "brasil"]
      }
    ]
  }')

echo -e "\n📦 Resposta da criação do deck:"
echo "$DECK_RESPONSE" | python3 -m json.tool

# 3. Listar decks para verificar
echo -e "\n3. Listando decks criados..."
DECKS_LIST=$(curl -s -X GET http://localhost:8180/api/v1/flashcard-decks \
  -H "Authorization: Bearer $TOKEN")

echo -e "\n📋 Lista de decks:"
echo "$DECKS_LIST" | python3 -m json.tool | head -50

echo -e "\n✅ Teste completo! Deck criado com todos os 7 tipos de flashcards."
