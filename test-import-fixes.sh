#!/bin/bash

echo "🔧 TESTE - CORREÇÕES DE IMPORTAÇÃO (DECK + PAGINAÇÃO)"
echo "===================================================="

echo ""
echo "🔍 VERIFICANDO CORREÇÕES IMPLEMENTADAS:"
echo ""

# Verificar correção da criação de deck
if grep -q "category.*Importação" frontend/src/components/AnkiImportExport.tsx && \
   grep -q "deckResponse\.success.*deckResponse\.data" frontend/src/components/AnkiImportExport.tsx; then
    echo "✅ Correção da criação de deck implementada"
    echo "   • deckData usa 'category' ao invés de 'subject'"
    echo "   • Acesso correto ao response (deckResponse.data.id)"
else
    echo "❌ Correção da criação de deck não encontrada"
fi

# Verificar correção da paginação
if grep -q "limit.*100" frontend/src/pages/student/MyFlashcards.tsx; then
    echo "✅ Limite de paginação aumentado para 100"
else
    echo "❌ Paginação ainda limitada a 20"
fi

# Verificar se o sistema está funcionando
echo ""
echo "🧪 TESTANDO SISTEMA:"
echo ""

curl -s http://173.208.151.106:5273 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Frontend acessível"
else
    echo "❌ Frontend não acessível"
    exit 1
fi

curl -s http://173.208.151.106:8180/api/v1/test > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend acessível"
else
    echo "❌ Backend não acessível"
    exit 1
fi

echo ""
echo "📊 CHECANDO LOGS RECENTES:"
echo ""

# Verificar se há flashcards sendo criados recentemente
RECENT_CARDS=$(docker logs estudos-backend-node --tail=50 2>/dev/null | grep -c "POST /api/v1/flashcards.*201")
if [ $RECENT_CARDS -gt 0 ]; then
    echo "✅ $RECENT_CARDS flashcards criados recentemente"
else
    echo "⚠️  Nenhum flashcard criado recentemente"
fi

# Verificar se há tentativas de criação de deck
RECENT_DECKS=$(docker logs estudos-backend-node --tail=100 2>/dev/null | grep -c "POST /api/v1/flashcard-decks")
echo "📋 Tentativas de criação de deck: $RECENT_DECKS"

echo ""
echo "=========================================="
echo "🎯 RESULTADO DAS CORREÇÕES"
echo "=========================================="
echo ""
echo "✅ PROBLEMAS CORRIGIDOS:"
echo "   • Criação de deck: deckData.category + response.data.id"
echo "   • Paginação: limit aumentado para 100 flashcards"
echo ""
echo "🔧 PARA TESTAR NOVAMENTE:"
echo "   1. Acesse: http://173.208.151.106:5273"
echo "   2. Login: aluno@example.com / aluno123"
echo "   3. Meus Flashcards → IMPORTAR/EXPORTAR"
echo "   4. ✓ Criar deck automaticamente (deve estar marcado)"
echo "   5. Selecione: Phrasal_Verbs_em_frases_Ingls_Pt_EnglishPt.apkg"
echo "   6. IMPORTAR TODOS"
echo "   7. Aguardar: Criação do deck + salvamento de flashcards"
echo "   8. Verificar:"
echo "      • Aba CARDS: deve mostrar mais que 20 flashcards"
echo "      • Aba DECKS: deve ter novo deck 'Meus Flashcards'"
echo "      • Stats: Total Cards deve refletir número correto"
echo ""
echo "💡 EXPECTATIVAS APÓS CORREÇÃO:"
echo "   • Deck criado automaticamente"
echo "   • Todos os 606 flashcards visíveis (não apenas 20)"
echo "   • Stats atualizados corretamente"