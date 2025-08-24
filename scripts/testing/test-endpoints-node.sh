#!/bin/bash

echo "🚀 Testando Backend Node.js/TypeScript"
echo "======================================="

BASE_URL="http://localhost:8180/api/v1"

# Test 1: Health Check
echo ""
echo "1️⃣ Health Check:"
curl -s "$BASE_URL/health" | jq .

# Test 2: Login Admin
echo ""
echo "2️⃣ Login Admin:"
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@studypro.com","password":"Admin@123"}')
echo $ADMIN_RESPONSE | jq .
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r .token)

# Test 3: Login Student
echo ""
echo "3️⃣ Login Student:"
STUDENT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno@example.com","password":"aluno123"}')
echo $STUDENT_RESPONSE | jq .
STUDENT_TOKEN=$(echo $STUDENT_RESPONSE | jq -r .token)

# Test 4: Get Settings (sem auth)
echo ""
echo "4️⃣ Get Settings (sem auth):"
curl -s "$BASE_URL/settings" | jq .

# Test 5: Update Settings
echo ""
echo "5️⃣ Update Settings:"
curl -s -X POST "$BASE_URL/settings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "general": {
      "site_name": "StudyPro Updated",
      "site_tagline": "Migração Node.js Completa"
    },
    "company": {
      "company_name": "StudyPro Node.js Ltda"
    }
  }' | jq .

# Test 6: Get Updated Settings
echo ""
echo "6️⃣ Get Updated Settings:"
curl -s "$BASE_URL/settings" | jq .

# Test 7: Get Profile (Admin)
echo ""
echo "7️⃣ Get Profile (Admin):"
curl -s "$BASE_URL/profile" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Test 8: Update Profile
echo ""
echo "8️⃣ Update Profile:"
curl -s -X POST "$BASE_URL/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Admin Node.js Updated",
    "bio": "Perfil atualizado com backend Node.js/TypeScript"
  }' | jq .

# Test 9: Get Courses
echo ""
echo "9️⃣ Get Courses:"
curl -s "$BASE_URL/courses" | jq .

# Test 10: Get Users (Admin only)
echo ""
echo "🔟 Get Users (Admin only):"
curl -s "$BASE_URL/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

echo ""
echo "✅ Testes concluídos!"