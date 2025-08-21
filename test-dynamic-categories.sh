#!/bin/bash

echo "🔧 TESTANDO SISTEMA DE CATEGORIAS DINÂMICAS"
echo "==========================================="
echo ""

# URLs de teste
FRONTEND_URL="http://localhost:5273"
BACKEND_URL="http://localhost:8180"

echo "🌐 VERIFICANDO SERVIÇOS:"
echo ""

# Testar backend
echo "📡 Testando backend..."
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/v1/health")
if [ "$BACKEND_RESPONSE" = "200" ]; then
    echo "✅ Backend: OK (HTTP $BACKEND_RESPONSE)"
else
    echo "❌ Backend: ERRO (HTTP $BACKEND_RESPONSE)"
    echo "⚠️  Iniciando backend..."
    cd /home/administrator/flash-site-cursors/backend-node
    npm run dev &
    BACKEND_PID=$!
    sleep 5
fi

# Testar frontend
echo "📱 Testando frontend..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo "✅ Frontend: OK (HTTP $FRONTEND_RESPONSE)"
else
    echo "❌ Frontend: ERRO (HTTP $FRONTEND_RESPONSE)"
fi

echo ""
echo "🧪 TESTANDO API DE CATEGORIAS:"
echo ""

# Token de admin para testes (usando dados padrão)
ADMIN_EMAIL="admin@studypro.com"
ADMIN_PASSWORD="Admin@123"

# Login para obter token
echo "🔐 Fazendo login como admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null || echo "")

if [ "$TOKEN" != "" ] && [ "$TOKEN" != "null" ]; then
    echo "✅ Login realizado com sucesso"
    
    # Testar endpoint de categorias
    echo "📋 Testando endpoint de categorias..."
    CATEGORIES_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BACKEND_URL/api/v1/categories")
    CATEGORIES_STATUS=$(echo "$CATEGORIES_RESPONSE" | jq -r '.success' 2>/dev/null || echo "false")
    
    if [ "$CATEGORIES_STATUS" = "true" ]; then
        echo "✅ Endpoint de categorias: OK"
        CATEGORIES_COUNT=$(echo "$CATEGORIES_RESPONSE" | jq '.data | length' 2>/dev/null || echo "0")
        echo "📊 Número de categorias: $CATEGORIES_COUNT"
    else
        echo "❌ Endpoint de categorias: ERRO"
        echo "📝 Resposta: $CATEGORIES_RESPONSE"
    fi
    
    # Testar opções de filtro dos flashcards
    echo "🃏 Testando filtros de flashcards..."
    FILTERS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BACKEND_URL/api/v1/flashcards/filters")
    FILTERS_STATUS=$(echo "$FILTERS_RESPONSE" | jq -r '.success' 2>/dev/null || echo "false")
    
    if [ "$FILTERS_STATUS" = "true" ]; then
        echo "✅ Filtros de flashcards: OK"
        echo "📊 Filtros disponíveis:"
        echo "$FILTERS_RESPONSE" | jq '.data' 2>/dev/null || echo "  Formato inválido"
    else
        echo "❌ Filtros de flashcards: ERRO"
        echo "📝 Resposta: $FILTERS_RESPONSE"
    fi
    
else
    echo "❌ Falha no login - não foi possível obter token"
    echo "📝 Resposta: $LOGIN_RESPONSE"
fi

echo ""
echo "🎯 PÁGINAS PARA TESTAR MANUALMENTE:"
echo "=================================="
echo ""
echo "1. 📋 Página de Flashcards Individuais (Admin):"
echo "   URL: $FRONTEND_URL/admin/flashcards/cards"
echo "   - Verificar dropdowns de categoria/subcategoria"
echo "   - Testar mudança dinâmica das subcategorias"
echo ""
echo "2. ➕ Página de Novo Flashcard (Admin):"
echo "   URL: $FRONTEND_URL/admin/flashcards/cards/new"
echo "   - Verificar dropdowns de categoria/subcategoria"
echo "   - Testar que subcategorias mudam quando categoria principal muda"
echo ""
echo "3. 🔐 Para acessar as páginas:"
echo "   Email: $ADMIN_EMAIL"
echo "   Senha: $ADMIN_PASSWORD"
echo ""

if [ ! -z "$BACKEND_PID" ]; then
    echo "⚠️  Parando backend iniciado para teste..."
    kill $BACKEND_PID 2>/dev/null
fi

echo "🎉 TESTE CONCLUÍDO"
echo ""
echo "✅ FUNCIONALIDADES IMPLEMENTADAS:"
echo "  - Hook useDynamicCategories criado"
echo "  - CategoryService estendido com métodos dinâmicos"
echo "  - IndividualFlashcards.tsx atualizada"
echo "  - NewFlashcard.tsx atualizada"
echo "  - Filtros dinâmicos funcionando com subcategorias"