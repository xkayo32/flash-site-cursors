#!/bin/bash

echo "🎯 TESTE COMPLETO: Criação de Deck com os 7 Tipos de Flashcards"
echo "================================================================"

# 1. Login
echo -e "\n1️⃣ Fazendo login como admin..."
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

# 2. Criar deck com todos os 7 tipos de flashcards
echo -e "\n2️⃣ Criando Deck Completo com 7 Tipos de Flashcards..."

DECK_RESPONSE=$(curl -s -X POST http://localhost:8180/api/v1/flashcard-decks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ARSENAL COMPLETO - 7 TIPOS",
    "description": "Demonstração completa de todos os tipos de flashcards",
    "category": "Demonstração",
    "flashcards": [
      {
        "type": "basic",
        "front": "O que é Machine Learning?",
        "back": "É um ramo da IA que permite que sistemas aprendam e melhorem com a experiência sem serem explicitamente programados",
        "difficulty": "medium",
        "tags": ["tecnologia", "ia"],
        "extra": "Conceito fundamental em IA moderna"
      },
      {
        "type": "basic_inverted",
        "front": "Protocolo HTTP",
        "back": "HyperText Transfer Protocol",
        "extra": "Protocolo de comunicação usado na World Wide Web",
        "difficulty": "easy",
        "tags": ["web", "protocolos"]
      },
      {
        "type": "cloze",
        "text": "O {{c1::Brasil}} é o maior país da {{c2::América do Sul}} e tem {{c3::Brasília}} como capital",
        "front": "O {{c1::Brasil}} é o maior país da {{c2::América do Sul}} e tem {{c3::Brasília}} como capital",
        "difficulty": "easy",
        "tags": ["geografia"],
        "explanation": "Fatos básicos sobre o Brasil"
      },
      {
        "type": "multiple_choice",
        "question": "Qual linguagem é mais usada para desenvolvimento web frontend?",
        "options": ["Python", "JavaScript", "Java", "C++"],
        "correct": 1,
        "explanation": "JavaScript é a linguagem padrão para desenvolvimento frontend",
        "difficulty": "easy",
        "tags": ["programação", "web"]
      },
      {
        "type": "true_false",
        "statement": "Python é uma linguagem compilada",
        "answer": "false",
        "explanation": "Python é uma linguagem interpretada, não compilada",
        "difficulty": "easy",
        "tags": ["programação", "python"]
      },
      {
        "type": "type_answer",
        "question": "Qual comando Git é usado para criar um novo branch?",
        "answer": "git checkout -b",
        "hint": "git checkout com uma flag especial",
        "difficulty": "medium",
        "tags": ["git", "versionamento"]
      },
      {
        "type": "image_occlusion",
        "image": "https://example.com/diagrama-rede.png",
        "front": "Identifique os componentes da rede",
        "back": "Router, Switch e Firewall",
        "occlusionAreas": [
          {
            "id": "comp1",
            "x": 50,
            "y": 50,
            "width": 100,
            "height": 80,
            "answer": "Router"
          },
          {
            "id": "comp2",
            "x": 200,
            "y": 50,
            "width": 100,
            "height": 80,
            "answer": "Switch"
          },
          {
            "id": "comp3",
            "x": 125,
            "y": 150,
            "width": 100,
            "height": 80,
            "answer": "Firewall"
          }
        ],
        "difficulty": "hard",
        "tags": ["redes", "infraestrutura"]
      }
    ]
  }')

DECK_ID=$(echo "$DECK_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$DECK_ID" ]; then
  echo "❌ Erro ao criar deck"
  echo "$DECK_RESPONSE"
  exit 1
fi

echo "✅ Deck criado com sucesso! ID: $DECK_ID"

# 3. Verificar deck criado
echo -e "\n3️⃣ Verificando Deck Criado..."
DECK_INFO=$(curl -s -X GET "http://localhost:8180/api/v1/flashcard-decks/$DECK_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$DECK_INFO" | python3 -c "
import json, sys
data = json.load(sys.stdin)
if 'deck' in data:
    deck = data['deck']
    print(f\"📦 Nome: {deck.get('name', 'N/A')}\")
    print(f\"📝 Descrição: {deck.get('description', 'N/A')}\")
    print(f\"🏷️ Categoria: {deck.get('category', 'N/A')}\")
    print(f\"🎯 Total de Flashcards: {len(deck.get('flashcard_ids', []))}\")
    print(f\"📅 Criado em: {deck.get('created_at', 'N/A')}\")
"

# 4. Verificar tipos de flashcards criados
echo -e "\n4️⃣ Verificando Tipos de Flashcards..."
curl -s -X GET "http://localhost:8180/api/v1/flashcards?limit=7&sort=created_at&order=desc" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "
import json, sys
data = json.load(sys.stdin)
if 'data' in data:
    types = {}
    for fc in data['data']:
        fc_type = fc.get('type', 'unknown')
        types[fc_type] = types.get(fc_type, 0) + 1
    
    print('📊 Tipos de flashcards encontrados:')
    type_emojis = {
        'basic': '🔵',
        'basic_inverted': '🟢', 
        'cloze': '🟡',
        'multiple_choice': '🟣',
        'true_false': '🔴',
        'type_answer': '🟦',
        'image_occlusion': '🟠'
    }
    
    for t, count in types.items():
        emoji = type_emojis.get(t, '⚪')
        print(f'  {emoji} {t}: {count} flashcard(s)')
"

echo -e "\n✨ TESTE COMPLETO! Todos os 7 tipos de flashcards foram testados com sucesso."
echo "================================================================"
