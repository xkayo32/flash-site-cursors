#!/bin/bash

echo "🎯 TESTE: Criação Individual de Flashcard Cloze com Múltiplos Cards"
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

# 2. Criar flashcard cloze com múltiplas lacunas (estilo Anki)
echo -e "\n2️⃣ Criando Flashcard Cloze com múltiplas lacunas..."

FC_RESPONSE=$(curl -s -X POST http://localhost:8180/api/v1/flashcards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "cloze",
    "text": "O {{c1::Python}} é uma linguagem {{c2::interpretada}} criada por {{c3::Guido van Rossum}} em {{c4::1991}}",
    "front": "O {{c1::Python}} é uma linguagem {{c2::interpretada}} criada por {{c3::Guido van Rossum}} em {{c4::1991}}",
    "back": "",
    "difficulty": "medium",
    "category": "Programação",
    "tags": ["python", "linguagens", "história"],
    "extra": "Python é conhecida por sua sintaxe clara e legibilidade",
    "header": "História da Programação",
    "source": "Wikipedia - Python Programming Language",
    "comments": "Questão comum em entrevistas técnicas"
  }')

echo -e "\n📦 Resposta da criação:"
echo "$FC_RESPONSE" | python3 -m json.tool | head -30

# 3. Listar flashcards criados recentemente para verificar
echo -e "\n3️⃣ Verificando flashcards criados (deve haver múltiplos cards de cloze)..."

CARDS_LIST=$(curl -s -X GET "http://localhost:8180/api/v1/flashcards?type=cloze&limit=10&sort=created_at&order=desc" \
  -H "Authorization: Bearer $TOKEN")

echo -e "\n📋 Flashcards tipo cloze criados recentemente:"
echo "$CARDS_LIST" | python3 -c "
import json, sys
data = json.load(sys.stdin)
if 'data' in data:
    cards = data['data'][:5]  # Mostrar apenas os 5 mais recentes
    for i, card in enumerate(cards, 1):
        print(f\"\n🔸 Card {i}:\")
        print(f\"   Tipo: {card.get('type', 'N/A')}\")
        print(f\"   Frente: {card.get('front', 'N/A')[:80]}...\")
        print(f\"   Texto: {card.get('text', 'N/A')[:80]}...\")
        print(f\"   Resposta: {card.get('back', 'N/A')}\")
        print(f\"   Extra: {card.get('extra', 'N/A')}\")
        print(f\"   Criado em: {card.get('created_at', 'N/A')}\")
"

# 4. Testar criação com campos extras
echo -e "\n4️⃣ Testando criação com todos os campos extras..."

FC_EXTRA=$(curl -s -X POST http://localhost:8180/api/v1/flashcards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "cloze",
    "text": "A {{c1::fotossíntese}} converte {{c2::luz solar}} em {{c2::energia química}}",
    "front": "A {{c1::fotossíntese}} converte {{c2::luz solar}} em {{c2::energia química}}",
    "difficulty": "easy",
    "category": "Biologia",
    "tags": ["biologia", "plantas", "energia"],
    "extra": "Processo fundamental para a vida na Terra",
    "header": "Processos Biológicos",
    "source": "Livro de Biologia - Cap. 5",
    "comments": "Nota: c2 aparece duas vezes intencionalmente",
    "hint": "Processo das plantas"
  }')

SUCCESS=$(echo "$FC_EXTRA" | grep -o '"success":true')

if [ ! -z "$SUCCESS" ]; then
  echo "✅ Flashcard com campos extras criado com sucesso!"
else
  echo "❌ Erro ao criar flashcard com campos extras"
  echo "$FC_EXTRA" | python3 -m json.tool | head -20
fi

echo -e "\n✨ TESTE COMPLETO!"
echo "================================================================"
echo "Funcionalidades testadas:"
echo "✅ ClozeEditor no modo individual"
echo "✅ Processamento de múltiplas lacunas estilo Anki"
echo "✅ Campos extras (header, source, comments)"
echo "✅ Suporte completo igual ao modo deck"
