#!/bin/bash

TOKEN=$(curl -s -X POST http://localhost:8180/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@studypro.com","password":"Admin@123"}' | \
  python3 -c "import json, sys; print(json.load(sys.stdin)['token'])")

echo "API Response:"
curl -s "http://localhost:8180/api/v1/flashcard-decks" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(f'Success: {d.get(\"success\")}')
print(f'Total: {d.get(\"total\")}')
print(f'Keys in response: {list(d.keys())}')
if d.get('decks'):
    print(f'Decks found: {len(d[\"decks\"])}')
    for deck in d['decks'][:2]:
        print(f'  - {deck[\"name\"]}')
"