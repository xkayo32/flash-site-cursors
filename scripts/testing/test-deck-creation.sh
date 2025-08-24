#!/bin/bash

echo "===== Testing Deck Creation and Management ====="

# Get fresh token
echo "1. Getting auth token..."
TOKEN=$(curl -s -X POST http://localhost:8180/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@studypro.com","password":"Admin@123"}' | \
  python3 -c "import json, sys; print(json.load(sys.stdin)['token'])")

echo "Token obtained successfully"
echo ""

# Test 1: List existing decks
echo "2. Listing existing decks:"
curl -s "http://localhost:8180/api/v1/flashcard-decks" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import json, sys; d=json.load(sys.stdin); print(f'  Total decks: {d.get(\"total\", 0)}')"

# Test 2: Create a new deck
echo -e "\n3. Creating a new test deck:"
DECK_RESPONSE=$(curl -s -X POST "http://localhost:8180/api/v1/flashcard-decks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Deck de Teste - Direito Constitucional",
    "description": "Deck de teste para verificar salvamento",
    "category": "Direito",
    "flashcard_ids": []
  }')

echo "$DECK_RESPONSE" | python3 -c "
import json, sys
d = json.load(sys.stdin)
if d.get('success'):
    print(f'  ✓ Deck created: {d[\"deck\"][\"name\"]}')
    print(f'  ID: {d[\"deck\"][\"id\"]}')
else:
    print(f'  ✗ Error: {d.get(\"message\", \"Unknown error\")}')
"

DECK_ID=$(echo "$DECK_RESPONSE" | python3 -c "import json, sys; print(json.load(sys.stdin).get('deck', {}).get('id', ''))")

# Test 3: Create a flashcard for the deck
echo -e "\n4. Creating a flashcard:"
FLASHCARD_RESPONSE=$(curl -s -X POST "http://localhost:8180/api/v1/flashcards" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "basic",
    "category": "Direito",
    "subcategory": "Direito Constitucional",
    "difficulty": "easy",
    "status": "published",
    "front": "O que é a Constituição Federal?",
    "back": "É a lei fundamental e suprema do Brasil",
    "tags": ["constituição", "teste"]
  }')

FLASHCARD_ID=$(echo "$FLASHCARD_RESPONSE" | python3 -c "import json, sys; d=json.load(sys.stdin); print(d.get('data', {}).get('id', '') if d.get('success') else '')")

echo "$FLASHCARD_RESPONSE" | python3 -c "
import json, sys
d = json.load(sys.stdin)
if d.get('success'):
    print(f'  ✓ Flashcard created: {d[\"data\"][\"front\"][:30]}...')
    print(f'  ID: {d[\"data\"][\"id\"]}')
else:
    print(f'  ✗ Error: {d.get(\"message\", \"Unknown error\")}')
"

# Test 4: Add flashcard to deck
if [ ! -z "$DECK_ID" ] && [ ! -z "$FLASHCARD_ID" ]; then
  echo -e "\n5. Adding flashcard to deck:"
  curl -s -X POST "http://localhost:8180/api/v1/flashcard-decks/$DECK_ID/flashcards" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"flashcard_ids\": [\"$FLASHCARD_ID\"]}" | \
    python3 -c "
import json, sys
d = json.load(sys.stdin)
if d.get('success'):
    print(f'  ✓ Flashcard added to deck')
    print(f'  Total flashcards in deck: {len(d[\"deck\"][\"flashcard_ids\"])}')
else:
    print(f'  ✗ Error: {d.get(\"message\", \"Unknown error\")}')
"
fi

# Test 5: Verify data in database
echo -e "\n6. Verifying data in PostgreSQL:"
docker exec estudos-postgres psql -U estudos_user -d estudos_db -c "SELECT COUNT(*) as deck_count FROM flashcard_decks;" 2>/dev/null | grep -E "[0-9]+" | head -1

docker exec estudos-postgres psql -U estudos_user -d estudos_db -c "SELECT COUNT(*) as flashcard_count FROM flashcards;" 2>/dev/null | grep -E "[0-9]+" | head -1

echo -e "\n===== Test Complete ====="
