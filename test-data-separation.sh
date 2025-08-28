#!/bin/bash

echo "🔒 TESTE - SEPARAÇÃO DE DADOS ADMIN vs ALUNO"
echo "============================================"
echo ""

echo "📊 SITUAÇÃO ATUAL NO BANCO:"
echo ""

# Dados dos usuários
echo "👥 USUÁRIOS:"
docker exec estudos-postgres psql -U estudos_user -d estudos_db -c "SELECT id, name, email, role FROM users WHERE id IN (1,2);"

echo ""
echo "📋 FLASHCARDS POR AUTOR:"
docker exec estudos-postgres psql -U estudos_user -d estudos_db -c "SELECT author_id, COUNT(*) as total, array_agg(DISTINCT category) as categorias FROM flashcards WHERE author_id IN ('1','2') GROUP BY author_id;"

echo ""
echo "📦 DECKS POR USUÁRIO:"
docker exec estudos-postgres psql -U estudos_user -d estudos_db -c "SELECT user_id, COUNT(*) as total, array_agg(name) as deck_names FROM flashcard_decks WHERE user_id IN ('1','2') GROUP BY user_id;"

echo ""
echo "🔌 TESTANDO APIs:"
echo ""

# Login admin
ADMIN_TOKEN=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"admin@studypro.com","password":"Admin@123"}' http://173.208.151.106:8180/api/v1/auth/login | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Login aluno
ALUNO_TOKEN=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"aluno@example.com","password":"aluno123"}' http://173.208.151.106:8180/api/v1/auth/login | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "🔑 Tokens obtidos (primeiros 20 caracteres):"
echo "   Admin: ${ADMIN_TOKEN:0:20}..."
echo "   Aluno: ${ALUNO_TOKEN:0:20}..."

echo ""
echo "📋 TESTE 1: Admin vendo flashcards COM filtro created_by_admin=true:"
ADMIN_CARDS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "http://173.208.151.106:8180/api/v1/flashcards?created_by_admin=true&limit=200" | grep -o '"id":"fc_' | wc -l)
echo "   Flashcards visíveis ao admin (só de admins): $ADMIN_CARDS"

echo ""
echo "📋 TESTE 2: Admin vendo flashcards SEM filtro:"
ADMIN_ALL=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "http://173.208.151.106:8180/api/v1/flashcards?limit=200" | grep -o '"id":"fc_' | wc -l)
echo "   Flashcards visíveis ao admin (todos): $ADMIN_ALL"

echo ""
echo "📋 TESTE 3: Aluno vendo seus próprios flashcards:"
ALUNO_OWN=$(curl -s -H "Authorization: Bearer $ALUNO_TOKEN" "http://173.208.151.106:8180/api/v1/flashcards?author_id=2&limit=200" | grep -o '"id":"fc_' | wc -l)
echo "   Flashcards do aluno (próprios): $ALUNO_OWN"

echo ""
echo "📋 TESTE 4: Aluno vendo TODOS os flashcards:"
ALUNO_ALL=$(curl -s -H "Authorization: Bearer $ALUNO_TOKEN" "http://173.208.151.106:8180/api/v1/flashcards?limit=200" | grep -o '"id":"fc_' | wc -l)
echo "   Flashcards visíveis ao aluno (todos): $ALUNO_ALL"

echo ""
echo "📦 TESTE 5: Decks - Admin vendo todos:"
ADMIN_DECKS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "http://173.208.151.106:8180/api/v1/flashcard-decks" | grep -o '"id":"deck_' | wc -l)
echo "   Decks visíveis ao admin: $ADMIN_DECKS"

echo ""
echo "📦 TESTE 6: Decks - Aluno vendo todos:"
ALUNO_DECKS=$(curl -s -H "Authorization: Bearer $ALUNO_TOKEN" "http://173.208.151.106:8180/api/v1/flashcard-decks" | grep -o '"id":"deck_' | wc -l)
echo "   Decks visíveis ao aluno: $ALUNO_DECKS"

echo ""
echo "🔍 ANÁLISE DO COMPORTAMENTO ATUAL:"
echo "===================================="
echo ""

echo "📋 FLASHCARDS:"
echo "   • Admin no frontend usa: created_by_admin=true (vê só de admins)"
echo "   • Aluno no frontend usa: SEM filtro (vê TODOS os flashcards)"
echo "   • Aluno em MyFlashcards: author_id=user.id (vê só seus próprios)"
echo ""

echo "📦 DECKS:"
echo "   • API retorna TODOS os decks para ambos"
echo "   • Frontend filtra no cliente por user_id"
echo "   • getUserDecks() filtra decks.filter(d => d.user_id === userId)"
echo ""

echo "⚠️  SITUAÇÃO ATUAL:"
echo "   ✅ Admin vê apenas flashcards de admins (filtro created_by_admin=true)"
echo "   ❌ Aluno vê TODOS os flashcards (sem filtro de autor)"
echo "   ✅ Em 'Meus Flashcards' aluno vê só os próprios (author_id=user.id)"
echo "   ✅ Decks são filtrados corretamente no frontend"
echo ""

echo "🔧 RECOMENDAÇÃO:"
echo "   • Aluno deveria ver apenas:"
echo "     - Seus próprios flashcards"
echo "     - Flashcards públicos/publicados de admins (para estudo)"
echo "   • Admin deveria ter opção de ver:"
echo "     - Todos os flashcards (para moderação)"
echo "     - Apenas flashcards de admins (padrão atual)"