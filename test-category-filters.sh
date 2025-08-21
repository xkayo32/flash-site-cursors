#!/bin/bash

echo "===== Testing Category and Subcategory Filters ====="

# Get fresh token
echo "Getting auth token..."
TOKEN=$(curl -s -X POST http://localhost:8180/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@studypro.com","password":"Admin@123"}' | \
  python3 -c "import json, sys; print(json.load(sys.stdin)['token'])")

echo "Token obtained successfully"
echo ""

# Test 1: All flashcards
echo "Test 1: All flashcards (no filter):"
curl -s "http://localhost:8180/api/v1/flashcards?limit=100" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import json, sys; d=json.load(sys.stdin); print(f'  Total: {len(d.get(\"data\", []))} flashcards')"

# Test 2: Filter by main category
echo -e "\nTest 2: Filter by main category (category=Direito):"
curl -s "http://localhost:8180/api/v1/flashcards?category=Direito&limit=100" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import json, sys; d=json.load(sys.stdin); print(f'  Total: {len(d.get(\"data\", []))} flashcards')"

# Test 3: Filter by subcategory only
echo -e "\nTest 3: Filter by subcategory only (subcategory=Direito Constitucional):"
curl -s "http://localhost:8180/api/v1/flashcards?subcategory=Direito%20Constitucional&limit=100" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import json, sys; d=json.load(sys.stdin); print(f'  Total: {len(d.get(\"data\", []))} flashcards')"

# Test 4: Filter by both category and subcategory
echo -e "\nTest 4: Filter by both (category=Direito&subcategory=Direito Constitucional):"
curl -s "http://localhost:8180/api/v1/flashcards?category=Direito&subcategory=Direito%20Constitucional&limit=100" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import json, sys; d=json.load(sys.stdin); print(f'  Total: {len(d.get(\"data\", []))} flashcards')"

# Test 5: Show what categories and subcategories exist
echo -e "\nTest 5: Distribution of flashcards by category/subcategory:"
curl -s "http://localhost:8180/api/v1/flashcards?limit=100" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "
import json, sys
from collections import defaultdict
d = json.load(sys.stdin)
dist = defaultdict(lambda: defaultdict(int))
for f in d.get('data', []):
    cat = f.get('category', 'None')
    subcat = f.get('subcategory', 'None')
    dist[cat][subcat] += 1

for cat, subcats in sorted(dist.items()):
    print(f'  {cat}:')
    for subcat, count in sorted(subcats.items()):
        print(f'    - {subcat}: {count} flashcards')
"

echo -e "\n===== Test Complete ====="