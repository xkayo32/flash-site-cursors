#!/bin/bash

echo "🧪 Testando API do Dashboard"
echo "============================="

BASE_URL="http://173.208.151.106:8180/api/v1"

# Login como admin
echo -e "\n1️⃣ Login como Admin:"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@studypro.com","password":"Admin@123"}')
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
echo "✅ Token obtido"

# Buscar estatísticas do dashboard
echo -e "\n2️⃣ Estatísticas do Dashboard:"
curl -s "$BASE_URL/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | {
    users: .users.total,
    active: .users.active,
    growth: .users.growth,
    questions: .content.questions,
    flashcards: .content.flashcards,
    revenue: .revenue.monthly,
    categories: .categories.total
  }'

# Buscar atividades recentes
echo -e "\n3️⃣ Atividades Recentes:"
curl -s "$BASE_URL/dashboard/activities" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | {
    recentUsers: (.recentUsers | length),
    recentContent: (.recentContent | length),
    systemAlerts: (.systemAlerts | length)
  }'

# Buscar métricas de performance
echo -e "\n4️⃣ Métricas de Performance:"
curl -s "$BASE_URL/dashboard/performance" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | {
    dailyRegistrations: (.dailyRegistrations | length),
    questionsAttempts: .contentEngagement.questions.attempts,
    flashcardsReviews: .contentEngagement.flashcards.reviews,
    coursesCompletions: .contentEngagement.courses.completions
  }'

echo -e "\n✅ Testes concluídos!"