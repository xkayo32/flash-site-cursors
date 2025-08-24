#!/bin/bash

echo "===== Testing Deck Creation with Flashcards ====="

# Get fresh token
TOKEN=$(curl -s -X POST http://localhost:8180/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@studypro.com","password":"Admin@123"}' | \
  python3 -c "import json, sys; print(json.load(sys.stdin)['token'])")

echo "1. Creating deck with flashcards..."

# First create the deck
DECK_RESPONSE=$(curl -s -X POST "http://localhost:8180/api/v1/flashcard-decks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Deck com Flashcards",
    "description": "Testando criação de deck com flashcards integrados",
    "category": "Direito",
    "flashcard_ids": []
  }')

DECK_ID=$(echo "$DECK_RESPONSE" | python3 -c "import json, sys; print(json.load(sys.stdin).get('data', {}).get('id', ''))")
echo "Deck created with ID: $DECK_ID"

# Create a test flashcard
FLASHCARD_RESPONSE=$(curl -s -X POST "http://localhost:8180/api/v1/flashcards" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "basic",
    "category": "Direito",
    "subcategory": "Direito Constitucional", 
    "difficulty": "easy",
    "status": "published",
    "front": "Teste: O que é um deck?",
    "back": "Um deck é uma coleção de flashcards organizadas por tema",
    "tags": ["teste", "deck"]
  }')

FLASHCARD_ID=$(echo "$FLASHCARD_RESPONSE" | python3 -c "import json, sys; print(json.load(sys.stdin).get('data', {}).get('id', ''))")
echo "Flashcard created with ID: $FLASHCARD_ID"

# Add flashcard to deck
if [ ! -z "$DECK_ID" ] && [ ! -z "$FLASHCARD_ID" ]; then
  ADD_RESPONSE=$(curl -s -X POST "http://localhost:8180/api/v1/flashcard-decks/$DECK_ID/flashcards" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"flashcard_ids\": [\"$FLASHCARD_ID\"]}")
    
  echo "Add to deck response:"
  echo "$ADD_RESPONSE" | python3 -c "
import json, sys
d = json.load(sys.stdin)
if d.get('success'):
    deck = d.get('data', {})
    flashcard_ids = deck.get('flashcard_ids', [])
    print(f'✅ Success! Deck now has {len(flashcard_ids)} flashcards')
    print(f'Flashcard IDs in deck: {flashcard_ids}')
else:
    print(f'❌ Failed: {d.get(\"message\", \"Unknown error\")}')
"
fi

echo -e "\n2. Verifying in database..."
echo "Decks with flashcards:"
docker exec estudos-postgres psql -U estudos_user -d estudos_db -c "
SELECT 
  name, 
  jsonb_array_length(flashcard_ids) as flashcard_count,
  flashcard_ids
FROM flashcard_decks 
WHERE jsonb_array_length(flashcard_ids) > 0 
ORDER BY created_at DESC LIMIT 3;" 2>/dev/null

echo -e "\nTotal flashcards in database:"
docker exec estudos-postgres psql -U estudos_user -d estudos_db -c "SELECT COUNT(*) FROM flashcards;" 2>/dev/null | grep -E "[0-9]+" | head -1

echo -e "\n===== Test Complete ====="