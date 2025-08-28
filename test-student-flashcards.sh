#!/bin/bash

echo "🎯 TESTE - NOVA SEPARAÇÃO DE DADOS ALUNO"
echo "========================================="
echo ""

echo "📊 IMPLEMENTAÇÃO REALIZADA:"
echo "✅ Filtro padrão: MEUS cards/decks (apenas do aluno)"
echo "✅ Toggle adicionado: alternar entre MEUS e TODOS"
echo "✅ Aluno vê por padrão apenas seus próprios dados"
echo "✅ Pode alternar para ver todos os públicos do admin"
echo ""

echo "🔍 VERIFICANDO DADOS NO BANCO:"
echo ""

# Contar dados
ADMIN_CARDS=$(docker exec estudos-postgres psql -U estudos_user -d estudos_db -c "SELECT COUNT(*) FROM flashcards WHERE author_id = '1';" | grep -v "count\|--" | grep -v "^$" | head -1)
ALUNO_CARDS=$(docker exec estudos-postgres psql -U estudos_user -d estudos_db -c "SELECT COUNT(*) FROM flashcards WHERE author_id = '2';" | grep -v "count\|--" | grep -v "^$" | head -1)
ADMIN_DECKS=$(docker exec estudos-postgres psql -U estudos_user -d estudos_db -c "SELECT COUNT(*) FROM flashcard_decks WHERE user_id = '1';" | grep -v "count\|--" | grep -v "^$" | head -1)
ALUNO_DECKS=$(docker exec estudos-postgres psql -U estudos_user -d estudos_db -c "SELECT COUNT(*) FROM flashcard_decks WHERE user_id = '2';" | grep -v "count\|--" | grep -v "^$" | head -1)

echo "📋 Flashcards:"
echo "   Admin (ID=1): $ADMIN_CARDS cards"
echo "   Aluno (ID=2): $ALUNO_CARDS cards"
echo ""
echo "📦 Decks:"
echo "   Admin (ID=1): $ADMIN_DECKS decks"
echo "   Aluno (ID=2): $ALUNO_DECKS decks"

echo ""
echo "🔌 TESTANDO COMPORTAMENTO DAS APIs:"
echo ""

# Login aluno
ALUNO_TOKEN=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"aluno@example.com","password":"aluno123"}' http://173.208.151.106:8180/api/v1/auth/login | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ALUNO_TOKEN" ]; then
    echo "❌ Falha no login"
    exit 1
fi

echo "✅ Login realizado com sucesso"

# Teste com filtro author_id (MEUS cards)
echo ""
echo "📋 API Flashcards com author_id=2 (filtro MEUS):"
MY_CARDS=$(curl -s -H "Authorization: Bearer $ALUNO_TOKEN" "http://173.208.151.106:8180/api/v1/flashcards?author_id=2&limit=200" | grep -o '"id":"fc_' | wc -l)
echo "   Flashcards retornados: $MY_CARDS (esperado: ~$ALUNO_CARDS)"

# Teste sem filtro (TODOS os cards)
echo ""
echo "📋 API Flashcards SEM filtro (TODOS):"
ALL_CARDS=$(curl -s -H "Authorization: Bearer $ALUNO_TOKEN" "http://173.208.151.106:8180/api/v1/flashcards?limit=200" | grep -o '"id":"fc_' | wc -l)
TOTAL_CARDS=$((ADMIN_CARDS + ALUNO_CARDS))
echo "   Flashcards retornados: $ALL_CARDS (esperado: ~$TOTAL_CARDS)"

# Teste de decks
echo ""
echo "📦 API Decks (todos retornados, filtro no frontend):"
ALL_DECKS=$(curl -s -H "Authorization: Bearer $ALUNO_TOKEN" "http://173.208.151.106:8180/api/v1/flashcard-decks" | grep -o '"id":"deck_' | wc -l)
TOTAL_DECKS=$((ADMIN_DECKS + ALUNO_DECKS))
echo "   Decks retornados: $ALL_DECKS (esperado: ~$TOTAL_DECKS)"

echo ""
echo "🌐 INSTRUÇÕES PARA TESTE MANUAL NO FRONTEND:"
echo "=============================================="
echo ""
echo "1. Acesse: http://173.208.151.106:5273"
echo "2. Login: aluno@example.com / aluno123"
echo "3. Navegue para: /student/flashcards"
echo ""
echo "4. VERIFICAR TOGGLE DE FLASHCARDS:"
echo "   📍 Procure o toggle: [MEUS CARDS] [TODOS]"
echo "   ✅ Por padrão: 'MEUS CARDS' selecionado (botão amarelo)"
echo "   ✅ Deve mostrar: ~$ALUNO_CARDS flashcards (apenas do aluno)"
echo ""
echo "5. CLICAR EM 'TODOS':"
echo "   ✅ Toggle muda para 'TODOS' (botão amarelo)"
echo "   ✅ Deve mostrar: ~$TOTAL_CARDS flashcards (aluno + admin)"
echo ""
echo "6. VERIFICAR DECKS:"
echo "   📍 Com 'MEUS' selecionado: $ALUNO_DECKS deck(s)"
echo "   📍 Com 'TODOS' selecionado: $TOTAL_DECKS decks"
echo ""
echo "🎯 COMPORTAMENTO ESPERADO:"
echo "• PADRÃO: Aluno vê apenas seus próprios cards e decks"
echo "• TOGGLE MEUS: Filtra apenas dados do aluno"
echo "• TOGGLE TODOS: Mostra dados de todos os usuários"
echo "• Cards do admin ficam disponíveis para estudo quando em 'TODOS'"
echo ""
echo "📝 NOTAS IMPORTANTES:"
echo "• Filtro aplicado via author_id no backend para flashcards"
echo "• Filtro aplicado no frontend para decks (user_id)"
echo "• Interface mostra toggle visível próximo aos filtros"
echo "• Estado persiste durante a sessão"