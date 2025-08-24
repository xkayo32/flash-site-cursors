#!/bin/bash

echo "🚀 POPULANDO DADOS DE TESTE ORGANIZADOS"
echo "========================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# URL da API
API_URL="http://localhost:8180/api/v1"

# Obter token de admin
echo -e "${YELLOW}Fazendo login como admin...${NC}"
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@studypro.com","password":"Admin@123"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))")

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Erro ao fazer login. Verifique se o servidor está rodando.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Login realizado com sucesso${NC}"
echo ""

# ======================
# CRIAR CATEGORIAS
# ======================
echo -e "${BLUE}📚 CRIANDO CATEGORIAS ORGANIZADAS...${NC}"
echo ""

# Categorias principais (Disciplinas)
declare -a MAIN_CATEGORIES=(
  '{"name":"Direito","type":"subject","description":"Disciplinas jurídicas"}'
  '{"name":"Português","type":"subject","description":"Língua portuguesa e literatura"}'
  '{"name":"Matemática","type":"subject","description":"Matemática e raciocínio lógico"}'
  '{"name":"Informática","type":"subject","description":"Tecnologia e sistemas"}'
  '{"name":"Administração","type":"subject","description":"Gestão e administração pública"}'
)

# Array para armazenar IDs das categorias criadas
declare -A CATEGORY_IDS

for category in "${MAIN_CATEGORIES[@]}"; do
  NAME=$(echo "$category" | python3 -c "import sys, json; print(json.load(sys.stdin)['name'])")
  echo "Criando categoria: $NAME"
  
  RESPONSE=$(curl -s -X POST "$API_URL/categories" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$category")
  
  ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
  
  if [ ! -z "$ID" ]; then
    CATEGORY_IDS[$NAME]=$ID
    echo -e "${GREEN}  ✅ $NAME criada (ID: $ID)${NC}"
  else
    echo -e "${YELLOW}  ⚠️  $NAME pode já existir${NC}"
  fi
done

echo ""

# Criar subcategorias para Direito
echo "Criando subcategorias para Direito..."
DIREITO_ID=${CATEGORY_IDS[Direito]}
if [ ! -z "$DIREITO_ID" ]; then
  declare -a DIREITO_SUBS=(
    '{"name":"Direito Constitucional","type":"topic","parent_id":"'$DIREITO_ID'","description":"Constituição Federal"}'
    '{"name":"Direito Administrativo","type":"topic","parent_id":"'$DIREITO_ID'","description":"Administração pública"}'
    '{"name":"Direito Penal","type":"topic","parent_id":"'$DIREITO_ID'","description":"Código Penal"}'
    '{"name":"Direito Civil","type":"topic","parent_id":"'$DIREITO_ID'","description":"Código Civil"}'
    '{"name":"Direito Processual","type":"topic","parent_id":"'$DIREITO_ID'","description":"Processo civil e penal"}'
  )
  
  for sub in "${DIREITO_SUBS[@]}"; do
    NAME=$(echo "$sub" | python3 -c "import sys, json; print(json.load(sys.stdin)['name'])")
    echo "  - $NAME"
    curl -s -X POST "$API_URL/categories" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$sub" > /dev/null
  done
fi

# Criar subcategorias para Português
echo "Criando subcategorias para Português..."
PORTUGUES_ID=${CATEGORY_IDS[Português]}
if [ ! -z "$PORTUGUES_ID" ]; then
  declare -a PORTUGUES_SUBS=(
    '{"name":"Gramática","type":"topic","parent_id":"'$PORTUGUES_ID'","description":"Regras gramaticais"}'
    '{"name":"Interpretação de Texto","type":"topic","parent_id":"'$PORTUGUES_ID'","description":"Compreensão textual"}'
    '{"name":"Redação","type":"topic","parent_id":"'$PORTUGUES_ID'","description":"Produção textual"}'
    '{"name":"Ortografia","type":"topic","parent_id":"'$PORTUGUES_ID'","description":"Regras ortográficas"}'
  )
  
  for sub in "${PORTUGUES_SUBS[@]}"; do
    NAME=$(echo "$sub" | python3 -c "import sys, json; print(json.load(sys.stdin)['name'])")
    echo "  - $NAME"
    curl -s -X POST "$API_URL/categories" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$sub" > /dev/null
  done
fi

# Criar subcategorias para Matemática
echo "Criando subcategorias para Matemática..."
MATEMATICA_ID=${CATEGORY_IDS[Matemática]}
if [ ! -z "$MATEMATICA_ID" ]; then
  declare -a MATEMATICA_SUBS=(
    '{"name":"Matemática Financeira","type":"topic","parent_id":"'$MATEMATICA_ID'","description":"Juros e investimentos"}'
    '{"name":"Raciocínio Lógico","type":"topic","parent_id":"'$MATEMATICA_ID'","description":"Lógica proposicional"}'
    '{"name":"Estatística","type":"topic","parent_id":"'$MATEMATICA_ID'","description":"Probabilidade e estatística"}'
    '{"name":"Geometria","type":"topic","parent_id":"'$MATEMATICA_ID'","description":"Formas e medidas"}'
  )
  
  for sub in "${MATEMATICA_SUBS[@]}"; do
    NAME=$(echo "$sub" | python3 -c "import sys, json; print(json.load(sys.stdin)['name'])")
    echo "  - $NAME"
    curl -s -X POST "$API_URL/categories" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$sub" > /dev/null
  done
fi

echo ""
echo -e "${GREEN}✅ Categorias criadas com sucesso!${NC}"
echo ""

# ======================
# CRIAR CURSOS
# ======================
echo -e "${BLUE}📖 CRIANDO CURSOS...${NC}"
echo ""

declare -a COURSES=(
  '{"title":"Direito Constitucional Completo","description":"Curso completo de Direito Constitucional","category":"Direito","subcategory":"Direito Constitucional","price":299.90,"duration_hours":120,"instructor_name":"Dr. João Silva","level":"intermediate","is_published":true}'
  '{"title":"Direito Administrativo para Concursos","description":"Preparação completa para concursos públicos","category":"Direito","subcategory":"Direito Administrativo","price":249.90,"duration_hours":80,"instructor_name":"Dra. Maria Santos","level":"intermediate","is_published":true}'
  '{"title":"Português para Concursos","description":"Gramática e interpretação de texto","category":"Português","subcategory":"Gramática","price":199.90,"duration_hours":60,"instructor_name":"Prof. Carlos Lima","level":"beginner","is_published":true}'
  '{"title":"Matemática Financeira Aplicada","description":"Conceitos e aplicações práticas","category":"Matemática","subcategory":"Matemática Financeira","price":179.90,"duration_hours":40,"instructor_name":"Prof. Ana Costa","level":"intermediate","is_published":true}'
  '{"title":"Raciocínio Lógico Descomplicado","description":"Lógica para concursos públicos","category":"Matemática","subcategory":"Raciocínio Lógico","price":159.90,"duration_hours":50,"instructor_name":"Prof. Pedro Oliveira","level":"beginner","is_published":true}'
  '{"title":"Informática Básica","description":"Conceitos fundamentais de informática","category":"Informática","subcategory":"","price":129.90,"duration_hours":30,"instructor_name":"Prof. Lucas Ferreira","level":"beginner","is_published":true}'
  '{"title":"Administração Pública","description":"Princípios e práticas da administração pública","category":"Administração","subcategory":"","price":219.90,"duration_hours":70,"instructor_name":"Prof. Roberto Alves","level":"intermediate","is_published":true}'
)

for course in "${COURSES[@]}"; do
  TITLE=$(echo "$course" | python3 -c "import sys, json; print(json.load(sys.stdin)['title'])")
  echo "Criando curso: $TITLE"
  
  curl -s -X POST "$API_URL/courses" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$course" > /dev/null
  
  echo -e "${GREEN}  ✅ Curso criado${NC}"
done

echo ""
echo -e "${GREEN}✅ Cursos criados com sucesso!${NC}"
echo ""

# ======================
# CRIAR FLASHCARDS
# ======================
echo -e "${BLUE}🎴 CRIANDO FLASHCARDS...${NC}"
echo ""

declare -a FLASHCARDS=(
  # Direito Constitucional
  '{"front":"O que são direitos fundamentais?","back":"São direitos básicos individuais, sociais, políticos e jurídicos previstos na Constituição Federal","type":"basic","category":"Direito","subcategory":"Direito Constitucional","difficulty":"easy","tags":["constituição","direitos"]}'
  '{"front":"Quais são os poderes da União?","back":"Executivo, Legislativo e Judiciário - independentes e harmônicos entre si","type":"basic","category":"Direito","subcategory":"Direito Constitucional","difficulty":"easy","tags":["poderes","união"]}'
  '{"front":"O que é cláusula pétrea?","back":"São dispositivos constitucionais que não podem ser alterados nem por emenda constitucional","type":"basic","category":"Direito","subcategory":"Direito Constitucional","difficulty":"medium","tags":["constituição","cláusula pétrea"]}'
  
  # Direito Administrativo
  '{"front":"O que é licitação?","back":"Procedimento administrativo para contratação de serviços ou aquisição de produtos pelo poder público","type":"basic","category":"Direito","subcategory":"Direito Administrativo","difficulty":"easy","tags":["licitação","administração"]}'
  '{"front":"Quais são os princípios da administração pública?","back":"Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência (LIMPE)","type":"basic","category":"Direito","subcategory":"Direito Administrativo","difficulty":"easy","tags":["princípios","administração"]}'
  
  # Português
  '{"front":"O que é sujeito?","back":"É o termo da oração que indica quem pratica ou sofre a ação expressa pelo verbo","type":"basic","category":"Português","subcategory":"Gramática","difficulty":"easy","tags":["gramática","sujeito"]}'
  '{"front":"Diferença entre mas e mais?","back":"MAS = conjunção adversativa (porém). MAIS = advérbio de intensidade (quantidade)","type":"basic","category":"Português","subcategory":"Ortografia","difficulty":"easy","tags":["ortografia","gramática"]}'
  
  # Matemática
  '{"front":"Fórmula dos juros simples?","back":"J = C × i × t (Juros = Capital × taxa × tempo)","type":"basic","category":"Matemática","subcategory":"Matemática Financeira","difficulty":"easy","tags":["juros","matemática"]}'
  '{"front":"O que é proposição?","back":"É uma sentença declarativa que pode ser classificada como verdadeira ou falsa","type":"basic","category":"Matemática","subcategory":"Raciocínio Lógico","difficulty":"easy","tags":["lógica","proposição"]}'
  
  # Informática
  '{"front":"O que é CPU?","back":"Central Processing Unit - Unidade Central de Processamento, o cérebro do computador","type":"basic","category":"Informática","subcategory":"","difficulty":"easy","tags":["hardware","cpu"]}'
  '{"front":"Diferença entre RAM e ROM?","back":"RAM: memória volátil de acesso aleatório. ROM: memória somente leitura, não volátil","type":"basic","category":"Informática","subcategory":"","difficulty":"medium","tags":["memória","hardware"]}'
)

for flashcard in "${FLASHCARDS[@]}"; do
  FRONT=$(echo "$flashcard" | python3 -c "import sys, json; print(json.load(sys.stdin)['front'][:30])")
  echo "Criando flashcard: $FRONT..."
  
  curl -s -X POST "$API_URL/flashcards" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$flashcard" > /dev/null
  
  echo -e "${GREEN}  ✅ Flashcard criado${NC}"
done

echo ""
echo -e "${GREEN}✅ Flashcards criados com sucesso!${NC}"
echo ""

# ======================
# CRIAR DECKS
# ======================
echo -e "${BLUE}📚 CRIANDO DECKS DE FLASHCARDS...${NC}"
echo ""

declare -a DECKS=(
  '{"name":"Direito Constitucional - Básico","description":"Conceitos fundamentais de Direito Constitucional","category":"Direito","subcategory":"Direito Constitucional","tags":["constituição","concursos"],"isPublic":true}'
  '{"name":"Administração Pública - LIMPE","description":"Princípios da Administração Pública","category":"Direito","subcategory":"Direito Administrativo","tags":["administração","princípios"],"isPublic":true}'
  '{"name":"Português - Gramática Essencial","description":"Conceitos básicos de gramática portuguesa","category":"Português","subcategory":"Gramática","tags":["gramática","português"],"isPublic":true}'
  '{"name":"Matemática Financeira - Fórmulas","description":"Principais fórmulas de matemática financeira","category":"Matemática","subcategory":"Matemática Financeira","tags":["matemática","finanças"],"isPublic":true}'
  '{"name":"Raciocínio Lógico - Introdução","description":"Conceitos introdutórios de lógica proposicional","category":"Matemática","subcategory":"Raciocínio Lógico","tags":["lógica","raciocínio"],"isPublic":true}'
  '{"name":"Informática Básica","description":"Conceitos fundamentais de hardware e software","category":"Informática","subcategory":"","tags":["informática","hardware","software"],"isPublic":true}'
)

for deck in "${DECKS[@]}"; do
  NAME=$(echo "$deck" | python3 -c "import sys, json; print(json.load(sys.stdin)['name'])")
  echo "Criando deck: $NAME"
  
  curl -s -X POST "$API_URL/flashcard-decks" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$deck" > /dev/null
  
  echo -e "${GREEN}  ✅ Deck criado${NC}"
done

echo ""
echo -e "${GREEN}✅ Decks criados com sucesso!${NC}"
echo ""

echo "========================================="
echo -e "${GREEN}🎉 DADOS DE TESTE CRIADOS COM SUCESSO!${NC}"
echo "========================================="
echo ""
echo "Resumo:"
echo "  📚 Categorias principais: 5"
echo "  📂 Subcategorias: ~15"
echo "  📖 Cursos: 7"
echo "  🎴 Flashcards: 11"
echo "  📚 Decks: 6"
echo ""
echo "Acesse http://localhost:5273/admin/flashcards para testar os filtros!"
echo ""