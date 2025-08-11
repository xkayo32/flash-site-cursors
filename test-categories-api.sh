#!/bin/bash

echo "🧪 Testando API de Categorias"
echo "============================="

BASE_URL="http://173.208.151.106:8180/api/v1"

# Login como admin
echo -e "\n1️⃣ Login como Admin:"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@studypro.com","password":"Admin@123"}')
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
echo "✅ Token obtido"

# Listar todas as categorias
echo -e "\n2️⃣ Listar todas as categorias:"
curl -s "$BASE_URL/categories" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {id, name, type, contentCount}'

# Buscar categorias por tipo
echo -e "\n3️⃣ Buscar categorias tipo 'exam_board':"
curl -s "$BASE_URL/categories/type/exam_board" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {id, name, description}'

# Buscar categoria específica
echo -e "\n4️⃣ Buscar categoria ID '1' (Direito):"
curl -s "$BASE_URL/categories/1" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | {id, name, children: .children[] | {name}}'

# Criar nova categoria
echo -e "\n5️⃣ Criar nova categoria:"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Nova Categoria",
    "type": "subject",
    "description": "Categoria criada via teste"
  }')
echo "$CREATE_RESPONSE" | jq '.success, .message, (.data | {id, name})'
NEW_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.id')

# Atualizar categoria criada
echo -e "\n6️⃣ Atualizar categoria criada:"
curl -s -X PUT "$BASE_URL/categories/$NEW_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Categoria Atualizada",
    "description": "Descrição atualizada via teste"
  }' | jq '.success, .message, (.data | {name, description})'

# Deletar categoria criada
echo -e "\n7️⃣ Deletar categoria criada:"
curl -s -X DELETE "$BASE_URL/categories/$NEW_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.success, .message'

echo -e "\n✅ Testes concluídos!"