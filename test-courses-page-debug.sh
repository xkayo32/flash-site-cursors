#!/bin/bash

echo "🔍 Debug da Página de Operações Disponíveis"
echo "============================================="

BACKEND_URL="http://localhost:8180"
EMAIL="aluno@example.com"
PASSWORD="aluno123"

# Get token
echo "🔑 Obtendo token de autenticação..."
login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\"}" \
    "$BACKEND_URL/api/v1/auth/login")

TOKEN=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "✅ Token obtido: ${TOKEN:0:30}..."

echo -e "\n📚 Testando API de cursos..."
courses_response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    "$BACKEND_URL/api/v1/courses?status=published")

echo "📊 Cursos disponíveis:"
echo "$courses_response" | jq -r '.data[] | "ID: \(.id) | Título: \(.title) | Categoria: \(.category) | Status: \(.status)"'

echo -e "\n🎯 Testando cursos matriculados..."
enrolled_response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    "$BACKEND_URL/api/v1/courses/enrollments/my-courses")

echo "📈 Matrículas ativas:"
echo "$enrolled_response" | jq -r '.data[] | "Course ID: \(.course_id) | Status: \(.status) | Progress: \(.progress.percentage)% | Course Title: \(.course.title)"'

echo -e "\n🔗 Verificando mapeamento de IDs..."
echo "=== Cursos disponíveis ==="
echo "$courses_response" | jq -r '.data[] | "✓ Course ID: \(.id)"'

echo -e "\n=== Cursos matriculados ==="  
echo "$enrolled_response" | jq -r '.data[] | "✓ Enrollment Course ID: \(.course_id)"'

echo -e "\n🎭 Simulando transformação de dados..."
echo "=== Dados brutos da API ==="
echo "$courses_response" | jq '.data[0] | {
  id: .id,
  title: .title,
  duration_hours: .duration_hours,
  difficulty_level: .difficulty_level,
  updated_at: .updated_at,
  stats: .stats
}'

echo -e "\n✨ Teste completo!"
echo "🌐 Agora acesse http://localhost:5273 e vá para Operações Disponíveis"
echo "👤 Use login: $EMAIL / $PASSWORD"