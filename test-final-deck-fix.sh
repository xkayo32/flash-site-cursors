#!/bin/bash

echo "===== Final Test - Deck Creation Fix ====="

# Get fresh token
TOKEN=$(curl -s -X POST http://localhost:8180/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@studypro.com","password":"Admin@123"}' | \
  python3 -c "import json, sys; print(json.load(sys.stdin)['token'])")

echo "Testing with the exact data structure frontend sends:"

# Test with the exact structure the frontend now sends
RESPONSE=$(curl -s -X POST "http://localhost:8180/api/v1/flashcard-decks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arsenal Final Test",
    "description": "Teste final de criação de arsenal",
    "category": "Direito,Informática",
    "is_public": false,
    "flashcard_ids": []
  }')

echo "$RESPONSE" | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(f'✓ Success: {d.get(\"success\")}')
print(f'✓ Has data: {\"data\" in d and d[\"data\"] is not None}')
print(f'✓ Message: {d.get(\"message\")}')

if d.get('success') and d.get('data'):
    print('🎯 Frontend will receive:')
    print(f'  - response.success = {d[\"success\"]}')
    print(f'  - response.data = {d[\"data\"][\"name\"]}')
    print('✅ OPERAÇÃO FALHADA should be fixed!')
else:
    print('❌ Still has issues')
"

echo -e "\nTotal decks in database:"
docker exec estudos-postgres psql -U estudos_user -d estudos_db -c "SELECT COUNT(*) FROM flashcard_decks;" 2>/dev/null | grep -E "[0-9]+" | head -1

echo -e "\n===== Test Complete ====="