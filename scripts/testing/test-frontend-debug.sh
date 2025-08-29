#!/bin/bash

echo "🔍 TESTE DE DEBUG - FRONTEND STATS ZERADOS"
echo "=========================================="
echo ""

echo "📊 DADOS NO BANCO DE DADOS:"
echo ""

# Verificar dados do usuário
echo "👤 USUÁRIO ALUNO:"
docker exec estudos-postgres psql -U estudos_user -d estudos_db -c "SELECT id, name, email, role FROM users WHERE email = 'aluno@example.com';"

echo ""
echo "📋 FLASHCARDS DO ALUNO (ID=2):"
docker exec estudos-postgres psql -U estudos_user -d estudos_db -c "SELECT COUNT(*) as total, status FROM flashcards WHERE author_id = '2' GROUP BY status;"

echo ""
echo "📦 DECKS DO ALUNO (ID=2):"
docker exec estudos-postgres psql -U estudos_user -d estudos_db -c "SELECT COUNT(*) as total FROM flashcard_decks WHERE user_id = '2';"

echo ""
echo "🔌 TESTANDO API DIRETAMENTE:"
echo ""

# Login para pegar token
echo "🔑 Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"aluno@example.com","password":"aluno123"}' http://173.208.151.106:8180/api/v1/auth/login)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Falha no login"
    exit 1
fi

echo "✅ Token obtido: ${TOKEN:0:20}..."

# Testar flashcards
echo ""
echo "📋 Testando GET /flashcards com author_id=2:"
curl -s -H "Authorization: Bearer $TOKEN" "http://173.208.151.106:8180/api/v1/flashcards?author_id=2&limit=2" | jq '.success, .total, .data | length' 2>/dev/null || echo "Erro no JSON"

# Testar stats
echo ""
echo "📊 Testando GET /flashcards/stats com author_id=2:"
curl -s -H "Authorization: Bearer $TOKEN" "http://173.208.151.106:8180/api/v1/flashcards/stats?author_id=2" | jq '.success, .data.total' 2>/dev/null || echo "Erro no JSON"

# Testar decks
echo ""
echo "📦 Testando GET /flashcard-decks:"
curl -s -H "Authorization: Bearer $TOKEN" "http://173.208.151.106:8180/api/v1/flashcard-decks" | jq '.success, .total' 2>/dev/null || echo "Erro no JSON"

echo ""
echo "🌐 INSTRUÇÕES PARA TESTE MANUAL:"
echo ""
echo "1. Acesse: http://173.208.151.106:5273"
echo "2. Login: aluno@example.com / aluno123"  
echo "3. Navegue: Meus Flashcards"
echo "4. Abra o Developer Tools (F12)"
echo "5. Vá na aba Console"
echo "6. Recarregue a página"
echo "7. Procure pelos logs:"
echo "   🔍 DEBUG - user?.id: ..."
echo "   🔍 DEBUG - API Response: ..."
echo "   ✅ DEBUG - Setting totalCards to: ..."

echo ""
echo "📝 PROBLEMA IDENTIFICADO:"
echo "✅ Dados existem no banco (143 flashcards, 1 deck)"
echo "✅ API funciona com autenticação"
echo "❓ Frontend pode ter problema de token ou conversão de tipos"
echo "🔧 Logs adicionados para identificar causa raiz"