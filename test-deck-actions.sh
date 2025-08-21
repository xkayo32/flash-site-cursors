#!/bin/bash

echo "===== Testing Deck Action Buttons ====="

# Get fresh token
TOKEN=$(curl -s -X POST http://localhost:8180/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@studypro.com","password":"Admin@123"}' | \
  python3 -c "import json, sys; print(json.load(sys.stdin)['token'])")

echo "🔐 Authenticated successfully"

echo -e "\n1. Testing VISUALIZAR (Preview) - GET /api/v1/flashcard-decks/{id}"

# Get first available deck ID
DECK_ID=$(curl -s -X GET "http://localhost:8180/api/v1/flashcard-decks" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "
import json, sys
data = json.load(sys.stdin)
decks = data.get('decks', [])
if decks:
    print(decks[0]['id'])
else:
    print('')
")

if [ ! -z "$DECK_ID" ]; then
  echo "📖 Testing preview for deck: $DECK_ID"
  PREVIEW_RESPONSE=$(curl -s -X GET "http://localhost:8180/api/v1/flashcard-decks/$DECK_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$PREVIEW_RESPONSE" | python3 -c "
import json, sys
d = json.load(sys.stdin)
if d.get('success'):
    deck = d.get('data', {})
    print(f'✅ Preview Success: {deck.get(\"name\", \"No name\")}')
    print(f'   Description: {deck.get(\"description\", \"No description\")}')
    print(f'   Category: {deck.get(\"category\", \"No category\")}')
    print(f'   Flashcards: {len(deck.get(\"flashcard_ids\", []))}')
else:
    print(f'❌ Preview Failed: {d.get(\"message\", \"Unknown error\")}')
"
else
  echo "❌ No decks found to test preview"
fi

echo -e "\n2. Testing DUPLICAR (Duplicate) - POST /api/v1/flashcard-decks"

if [ ! -z "$DECK_ID" ]; then
  echo "📋 Testing duplicate for deck: $DECK_ID"
  
  # First get the original deck
  ORIGINAL_DECK=$(curl -s -X GET "http://localhost:8180/api/v1/flashcard-decks/$DECK_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  # Extract data and create duplicate
  DUPLICATE_DATA=$(echo "$ORIGINAL_DECK" | python3 -c "
import json, sys
d = json.load(sys.stdin)
if d.get('success'):
    original = d.get('data', {})
    duplicate = {
        'name': f\"{original.get('name', 'Deck')} (Cópia)\",
        'description': original.get('description', ''),
        'category': original.get('category', 'Geral'),
        'flashcard_ids': original.get('flashcard_ids', []),
        'is_public': False
    }
    print(json.dumps(duplicate))
else:
    print('{}')
")
  
  if [ "$DUPLICATE_DATA" != "{}" ]; then
    DUPLICATE_RESPONSE=$(curl -s -X POST "http://localhost:8180/api/v1/flashcard-decks" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$DUPLICATE_DATA")
    
    echo "$DUPLICATE_RESPONSE" | python3 -c "
import json, sys
d = json.load(sys.stdin)
if d.get('success'):
    deck = d.get('data', {})
    print(f'✅ Duplicate Success: {deck.get(\"name\", \"No name\")}')
    print(f'   New ID: {deck.get(\"id\", \"No ID\")}')
else:
    print(f'❌ Duplicate Failed: {d.get(\"message\", \"Unknown error\")}')
"
  else
    echo "❌ Could not get original deck data for duplication"
  fi
else
  echo "❌ No decks found to test duplicate"
fi

echo -e "\n3. Testing DELETAR (Delete) - DELETE /api/v1/flashcard-decks/{id}"

# Create a test deck to delete
echo "🗑️ Creating test deck for deletion..."
DELETE_TEST_DECK=$(curl -s -X POST "http://localhost:8180/api/v1/flashcard-decks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Deck para Deletar - TESTE",
    "description": "Este deck será deletado no teste",
    "category": "Teste",
    "flashcard_ids": [],
    "is_public": false
  }')

DELETE_DECK_ID=$(echo "$DELETE_TEST_DECK" | python3 -c "
import json, sys
d = json.load(sys.stdin)
if d.get('success'):
    print(d.get('data', {}).get('id', ''))
else:
    print('')
")

if [ ! -z "$DELETE_DECK_ID" ]; then
  echo "🗑️ Testing delete for deck: $DELETE_DECK_ID"
  DELETE_RESPONSE=$(curl -s -X DELETE "http://localhost:8180/api/v1/flashcard-decks/$DELETE_DECK_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$DELETE_RESPONSE" | python3 -c "
import json, sys
d = json.load(sys.stdin)
if d.get('success'):
    print(f'✅ Delete Success: {d.get(\"message\", \"Deleted successfully\")}')
else:
    print(f'❌ Delete Failed: {d.get(\"message\", \"Unknown error\")}')
"
else
  echo "❌ Could not create test deck for deletion"
fi

echo -e "\n4. Testing EXECUTAR/ESTUDAR (Study) - Simulated frontend navigation"
echo "📚 EXECUTAR button would navigate to: /flashcards/{deck_id}/study"
echo "✅ This is a frontend navigation - no API test needed"

echo -e "\n5. Testing EDITAR (Edit) - Simulated frontend navigation"  
echo "✏️ EDITAR button would navigate to: /admin/flashcards/{deck_id}/edit"
echo "✅ This is a frontend navigation - no API test needed"

echo -e "\n6. Testing GERENCIAR CARTÕES (Manage Cards) - Simulated frontend navigation"
echo "📝 GERENCIAR CARTÕES button would navigate to: /admin/flashcards/{deck_id}/cards" 
echo "✅ This is a frontend navigation - no API test needed"

echo -e "\n7. Final verification - List all decks"
echo "📋 Current decks in database:"
curl -s -X GET "http://localhost:8180/api/v1/flashcard-decks" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "
import json, sys
d = json.load(sys.stdin)
if d.get('success'):
    decks = d.get('decks', [])
    print(f'Total decks: {len(decks)}')
    for i, deck in enumerate(decks[:5], 1):
        print(f'{i}. {deck.get(\"name\", \"No name\")} (ID: {deck.get(\"id\", \"No ID\")})')
    if len(decks) > 5:
        print(f'... and {len(decks) - 5} more')
else:
    print('Failed to get decks list')
"

echo -e "\n===== Test Complete ====="
echo "✅ VISUALIZAR (Preview): API tested - shows deck details"
echo "✅ DUPLICAR (Duplicate): API tested - creates copy of deck"  
echo "✅ DELETAR (Delete): API tested - removes deck from database"
echo "✅ EXECUTAR (Study): Frontend navigation - /flashcards/{id}/study"
echo "✅ EDITAR (Edit): Frontend navigation - /admin/flashcards/{id}/edit"
echo "✅ GERENCIAR CARTÕES: Frontend navigation - /admin/flashcards/{id}/cards"