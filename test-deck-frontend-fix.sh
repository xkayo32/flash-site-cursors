#!/bin/bash

echo "===== Testing Deck Creation API Fix ====="

# Get fresh token
echo "1. Getting auth token..."
TOKEN=$(curl -s -X POST http://localhost:8180/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@studypro.com","password":"Admin@123"}' | \
  python3 -c "import json, sys; print(json.load(sys.stdin)['token'])")

echo "Token obtained successfully"
echo ""

# Test deck creation with the data structure the frontend expects
echo "2. Testing deck creation with frontend-compatible response:"
RESPONSE=$(curl -s -X POST "http://localhost:8180/api/v1/flashcard-decks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arsenal Teste Frontend",
    "description": "Testando estrutura de resposta da API",
    "category": "Direito",
    "flashcard_ids": []
  }')

echo "$RESPONSE" | python3 -c "
import json, sys
d = json.load(sys.stdin)
print('Response structure:')
print(f'  success: {d.get(\"success\")}')
print(f'  has data field: {\"data\" in d}')
print(f'  has deck field: {\"deck\" in d}')
print(f'  message: {d.get(\"message\", \"None\")}')

if d.get('success') and d.get('data'):
    deck = d['data']
    print(f'Deck details:')
    print(f'  ID: {deck.get(\"id\")}')
    print(f'  Name: {deck.get(\"name\")}')
    print(f'  Category: {deck.get(\"category\")}')
else:
    print('❌ API response structure incompatible with frontend')
"

echo -e "\n3. Checking database:"
docker exec estudos-postgres psql -U estudos_user -d estudos_db -c "SELECT COUNT(*) as total_decks FROM flashcard_decks;" 2>/dev/null | grep -E "[0-9]+" | head -1 | xargs echo "Total decks in database:"

echo -e "\n===== Test Complete ====="