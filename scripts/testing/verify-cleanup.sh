#!/bin/bash

echo "🔍 VERIFICAÇÃO DA LIMPEZA - DECKS E FLASHCARDS"
echo "=============================================="
echo ""

# URLs para verificação
ADMIN_URL="http://173.208.151.106:5273/admin/flashcards"
CARDS_URL="http://173.208.151.106:5273/admin/flashcards/cards"
STUDENT_URL="http://173.208.151.106:5273/my-flashcards"

echo "🌐 TESTANDO ACESSO ÀS PÁGINAS:"
echo ""

# Testar página admin de flashcards
echo "📋 Testando página admin de decks..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$ADMIN_URL")
if [ "$RESPONSE" = "200" ]; then
    echo "✅ Admin Decks: OK (HTTP $RESPONSE)"
else
    echo "❌ Admin Decks: ERRO (HTTP $RESPONSE)"
fi

# Testar página admin de flashcards individuais
echo "📋 Testando página admin de flashcards..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$CARDS_URL")
if [ "$RESPONSE" = "200" ]; then
    echo "✅ Admin Cards: OK (HTTP $RESPONSE)"
else
    echo "❌ Admin Cards: ERRO (HTTP $RESPONSE)"
fi

# Testar página do estudante
echo "📋 Testando página do estudante..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$STUDENT_URL")
if [ "$RESPONSE" = "200" ]; then
    echo "✅ Student Cards: OK (HTTP $RESPONSE)"
else
    echo "❌ Student Cards: ERRO (HTTP $RESPONSE)"
fi

echo ""

# Verificar arquivos de dados
echo "📊 VERIFICANDO ARQUIVOS DE DADOS:"
echo ""

FLASHCARDS_FILE="/home/administrator/flash-site-cursors/backend-node/data/flashcards.json"
FLASHCARD_DECKS_FILE="/home/administrator/flash-site-cursors/backend-node/data/flashcard-decks.json"

if [ -f "$FLASHCARDS_FILE" ]; then
    FLASHCARDS_COUNT=$(jq 'length' "$FLASHCARDS_FILE" 2>/dev/null || echo "erro")
    echo "📚 Flashcards: $FLASHCARDS_COUNT"
else
    echo "❌ Arquivo flashcards.json não encontrado"
fi

if [ -f "$FLASHCARD_DECKS_FILE" ]; then
    DECKS_COUNT=$(jq 'length' "$FLASHCARD_DECKS_FILE" 2>/dev/null || echo "erro")
    echo "📦 Decks: $DECKS_COUNT"
else
    echo "❌ Arquivo flashcard-decks.json não encontrado"
fi

echo ""

# Status do backend
echo "🔧 VERIFICANDO BACKEND:"
echo ""

HEALTH_RESPONSE=$(curl -s "http://localhost:8180/api/v1/health" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Backend: Funcionando"
    echo "📡 Status: $(echo "$HEALTH_RESPONSE" | jq -r '.status' 2>/dev/null || echo 'ok')"
else
    echo "❌ Backend: Indisponível"
fi

echo ""
echo "🎯 INSTRUÇÕES PARA VERIFICAÇÃO MANUAL:"
echo "======================================"
echo ""
echo "1. 🔐 FAÇA LOGIN COMO ADMIN:"
echo "   URL: http://173.208.151.106:5273/login"
echo "   Email: admin@studypro.com"
echo "   Senha: Admin@123"
echo ""
echo "2. 📋 VERIFIQUE PÁGINAS VAZIAS:"
echo "   • Decks: $ADMIN_URL"
echo "   • Cards: $CARDS_URL"
echo ""
echo "3. 👤 TESTE COMO ESTUDANTE:"
echo "   Email: aluno@example.com"
echo "   Senha: aluno123"
echo "   URL: $STUDENT_URL"
echo ""
echo "4. ✅ RESULTADO ESPERADO:"
echo "   • Todas as páginas devem estar vazias (0 itens)"
echo "   • Mensagens como \"Nenhum flashcard encontrado\""
echo "   • Botões de criação disponíveis"
echo ""

if [ "$FLASHCARDS_COUNT" = "0" ] && [ "$DECKS_COUNT" = "0" ]; then
    echo "🎉 LIMPEZA CONFIRMADA - SISTEMA ESTÁ VAZIO!"
else
    echo "⚠️  ATENÇÃO - AINDA HÁ DADOS NO SISTEMA"
fi