#!/bin/bash

echo "===== Testing Flashcards Frontend Integration ====="

# 1. Login and get token
echo -e "\n1. Getting auth token..."
TOKEN=$(curl -s -X POST http://localhost:8180/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@studypro.com","password":"Admin@123"}' | \
  python3 -c "import json, sys; print(json.load(sys.stdin)['token'])")

echo "Token obtained: ${TOKEN:0:20}..."

# 2. Test flashcards API directly
echo -e "\n2. Testing flashcards API..."
echo "All flashcards:"
curl -s "http://localhost:8180/api/v1/flashcards" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import json, sys; d=json.load(sys.stdin); print(f'  Total: {d.get(\"total\", 0)}')"

echo -e "\nFiltered by Direito category:"
curl -s "http://localhost:8180/api/v1/flashcards?category=Direito" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import json, sys; d=json.load(sys.stdin); print(f'  Total: {d.get(\"total\", 0)}')"

echo -e "\nFiltered by Matemática category:"
curl -s "http://localhost:8180/api/v1/flashcards?category=Matemática" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import json, sys; d=json.load(sys.stdin); print(f'  Total: {d.get(\"total\", 0)}')"

# 3. Check categories API
echo -e "\n3. Testing categories API..."
curl -s "http://localhost:8180/api/v1/categories" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import json, sys; d=json.load(sys.stdin); cats=d.get('categories', []); print(f'  Total categories: {len(cats)}'); print(f'  Main categories: {[c[\"name\"] for c in cats if not c.get(\"parent_id\")]}')"

# 4. Check flashcard filters
echo -e "\n4. Testing flashcard filters API..."
curl -s "http://localhost:8180/api/v1/flashcards/filters" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import json, sys; d=json.load(sys.stdin); f=d.get('filters', {}); print(f'  Categories: {f.get(\"categories\", [])}'); print(f'  Difficulties: {f.get(\"difficulties\", [])}')"

echo -e "\n===== Test Complete ====="