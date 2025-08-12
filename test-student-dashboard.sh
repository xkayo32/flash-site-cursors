#!/bin/bash

# Test Student Dashboard API

API_BASE_URL="http://localhost:8180"

echo "=== Testando Student Dashboard API ==="

# Test login to get token
echo "1. Login para obter token..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aluno@example.com",
    "password": "aluno123"
  }')

echo "Login Response: $LOGIN_RESPONSE"

# Extract token from response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Falha no login. Não foi possível obter token."
    exit 1
fi

echo "✅ Token obtido: ${TOKEN:0:20}..."

# Test student dashboard endpoint
echo -e "\n2. Testando endpoint de dashboard do estudante..."
DASHBOARD_RESPONSE=$(curl -s -X GET "${API_BASE_URL}/api/v1/dashboard/student" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Dashboard Response:"
echo $DASHBOARD_RESPONSE | python3 -m json.tool 2>/dev/null || echo $DASHBOARD_RESPONSE

# Check if response is valid
if echo $DASHBOARD_RESPONSE | grep -q '"success":true'; then
    echo -e "\n✅ Dashboard endpoint funcionando corretamente!"
else
    echo -e "\n❌ Problema com endpoint de dashboard."
fi

echo -e "\n=== Teste Concluído ==="