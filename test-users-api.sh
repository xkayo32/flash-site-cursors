#!/bin/bash

echo "🧪 Testando API de Usuários"
echo "============================"

BASE_URL="http://173.208.151.106:8180/api/v1"

# Login como admin
echo -e "\n1️⃣ Login como Admin:"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@studypro.com","password":"Admin@123"}')
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
echo "✅ Token obtido"

# Listar usuários
echo -e "\n2️⃣ Listar todos os usuários:"
curl -s "$BASE_URL/users" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {id, name, email, role, status}'

# Buscar usuário específico
echo -e "\n3️⃣ Buscar usuário ID 2:"
curl -s "$BASE_URL/users/2" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | {id, name, email, subscription}'

# Listar com filtros
echo -e "\n4️⃣ Filtrar por role=student:"
curl -s "$BASE_URL/users?role=student" \
  -H "Authorization: Bearer $TOKEN" | jq '.pagination, (.data[] | {name, role})'

# Criar novo usuário
echo -e "\n5️⃣ Criar novo usuário:"
curl -s -X POST "$BASE_URL/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo Teste",
    "email": "novo@teste.com",
    "password": "senha123",
    "role": "student",
    "phone": "(11) 95555-4444"
  }' | jq '.success, .message, (.data | {id, name, email})'

# Atualizar usuário
echo -e "\n6️⃣ Atualizar usuário ID 3:"
curl -s -X PUT "$BASE_URL/users/3" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva Atualizado",
    "status": "suspended"
  }' | jq '.success, .message, (.data | {name, status})'

echo -e "\n✅ Testes concluídos!"