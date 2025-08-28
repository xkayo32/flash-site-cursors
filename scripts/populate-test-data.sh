#!/bin/bash

# Script para popular dados de teste organizados

echo "======================================="
echo "📦 POPULANDO DADOS DE TESTE"
echo "======================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações do banco
DB_HOST="localhost"
DB_PORT="5532"
DB_NAME="estudos_db"
DB_USER="estudos_user"
DB_PASS="estudos_pass"

# Backend API URL
API_URL="http://localhost:8180/api/v1"

# Obter token do admin
echo -e "${YELLOW}Fazendo login como admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@studypro.com", "password": "Admin@123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Erro ao obter token de autenticação${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Login realizado com sucesso${NC}"

# Função para criar categoria
create_category() {
    local name="$1"
    local type="$2"
    local parent_id="$3"
    
    echo -e "${BLUE}  Criando categoria: $name${NC}"
    
    RESPONSE=$(curl -s -X POST "$API_URL/categories" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"name\": \"$name\",
        \"type\": \"$type\",
        \"parent_id\": $parent_id
      }")
    
    # Extrair ID da resposta
    ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
    echo $ID
}

# Função para criar flashcard
create_flashcard() {
    local type="$1"
    local category="$2"
    local subcategory="$3"
    local data="$4"
    
    echo -e "${BLUE}  Criando flashcard tipo: $type${NC}"
    
    RESPONSE=$(curl -s -X POST "$API_URL/flashcards" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "$data")
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}    ✓ Flashcard criado com sucesso${NC}"
    else
        echo -e "${RED}    ✗ Erro ao criar flashcard: $RESPONSE${NC}"
    fi
}

echo -e "\n${YELLOW}1. Criando Categorias...${NC}"
echo "======================================="

# Criar categorias principais
echo -e "${BLUE}Criando categorias principais...${NC}"
CAT_DIREITO=$(create_category "Direito" "subject" "null")
CAT_INFORMATICA=$(create_category "Informática" "subject" "null")
CAT_PORTUGUES=$(create_category "Português" "subject" "null")

# Criar subcategorias
echo -e "${BLUE}Criando subcategorias...${NC}"
SUBCAT_CONSTITUCIONAL=$(create_category "Direito Constitucional" "topic" "$CAT_DIREITO")
SUBCAT_PENAL=$(create_category "Direito Penal" "topic" "$CAT_DIREITO")
SUBCAT_REDES=$(create_category "Redes de Computadores" "topic" "$CAT_INFORMATICA")
SUBCAT_SEGURANCA=$(create_category "Segurança da Informação" "topic" "$CAT_INFORMATICA")
SUBCAT_GRAMATICA=$(create_category "Gramática" "topic" "$CAT_PORTUGUES")
SUBCAT_INTERPRETACAO=$(create_category "Interpretação de Texto" "topic" "$CAT_PORTUGUES")

echo -e "${GREEN}✓ Categorias criadas${NC}"

echo -e "\n${YELLOW}2. Criando Flashcards...${NC}"
echo "======================================="

# 1. BÁSICO - Direito Constitucional
create_flashcard "basic" "Direito" "Direito Constitucional" '{
  "type": "basic",
  "category": "Direito",
  "subcategory": "Direito Constitucional",
  "front": "Qual é o princípio fundamental da República Federativa do Brasil que estabelece a dignidade da pessoa humana?",
  "back": "A dignidade da pessoa humana é um dos fundamentos da República Federativa do Brasil, previsto no artigo 1º, III da Constituição Federal de 1988.",
  "difficulty": "medium",
  "tags": ["constituição", "princípios", "fundamentos"],
  "status": "active"
}'

# 2. BÁSICO INVERTIDO - Segurança da Informação
create_flashcard "basic_reversed" "Informática" "Segurança da Informação" '{
  "type": "basic_reversed",
  "category": "Informática",
  "subcategory": "Segurança da Informação",
  "front": "O que é Criptografia?",
  "back": "Técnica de codificação de dados que visa garantir a confidencialidade das informações",
  "text": "A criptografia pode ser simétrica (mesma chave para cifrar e decifrar) ou assimétrica (chaves públicas e privadas diferentes)",
  "difficulty": "medium",
  "tags": ["segurança", "criptografia", "confidencialidade"],
  "status": "active"
}'

# 3, 4, 5. CLOZE (3 variações) - Gramática
create_flashcard "cloze" "Português" "Gramática" '{
  "type": "cloze",
  "category": "Português",
  "subcategory": "Gramática",
  "text": "A {{c1::concordância verbal}} ocorre quando o {{c2::verbo}} se flexiona para concordar com o {{c3::sujeito}} da oração.",
  "difficulty": "easy",
  "tags": ["gramática", "concordância", "sintaxe"],
  "status": "active"
}'

create_flashcard "cloze" "Português" "Gramática" '{
  "type": "cloze",
  "category": "Português",
  "subcategory": "Gramática",
  "text": "O {{c1::substantivo}} é a classe de palavras que nomeia seres, objetos, fenômenos, lugares, qualidades, ações, dentre outros.",
  "difficulty": "easy",
  "tags": ["gramática", "classes gramaticais", "morfologia"],
  "status": "active"
}'

create_flashcard "cloze" "Português" "Gramática" '{
  "type": "cloze",
  "category": "Português",
  "subcategory": "Gramática",
  "text": "Os {{c1::pronomes pessoais}} do caso reto são: {{c2::eu, tu, ele/ela, nós, vós, eles/elas}} e funcionam como {{c3::sujeito}} da oração.",
  "difficulty": "medium",
  "tags": ["gramática", "pronomes", "morfologia"],
  "status": "active"
}'

# 6. MÚLTIPLA ESCOLHA - Direito Penal
create_flashcard "multiple_choice" "Direito" "Direito Penal" '{
  "type": "multiple_choice",
  "category": "Direito",
  "subcategory": "Direito Penal",
  "question": "Qual é o prazo prescricional para crimes cuja pena máxima é superior a 8 anos e não excede 12 anos?",
  "options": ["8 anos", "12 anos", "16 anos", "20 anos"],
  "correct": 2,
  "explanation": "Conforme o artigo 109, II do Código Penal, prescreve em 16 anos se o máximo da pena é superior a 8 anos e não excede 12 anos.",
  "difficulty": "hard",
  "tags": ["direito penal", "prescrição", "prazos"],
  "status": "active"
}'

# 7. VERDADEIRO/FALSO - Redes de Computadores
create_flashcard "true_false" "Informática" "Redes de Computadores" '{
  "type": "true_false",
  "category": "Informática",
  "subcategory": "Redes de Computadores",
  "statement": "O protocolo TCP garante a entrega ordenada e confiável dos pacotes de dados.",
  "answer": true,
  "explanation": "O TCP (Transmission Control Protocol) é um protocolo orientado à conexão que garante a entrega confiável, ordenada e sem erros dos dados.",
  "difficulty": "medium",
  "tags": ["redes", "TCP/IP", "protocolos"],
  "status": "active"
}'

# 8. DIGITE A RESPOSTA - Interpretação de Texto
create_flashcard "type_answer" "Português" "Interpretação de Texto" '{
  "type": "type_answer",
  "category": "Português",
  "subcategory": "Interpretação de Texto",
  "question": "Qual é a figura de linguagem que consiste em atribuir características humanas a seres inanimados?",
  "answer": "prosopopeia",
  "hint": "Também conhecida como personificação",
  "difficulty": "medium",
  "tags": ["figuras de linguagem", "interpretação", "literatura"],
  "status": "active"
}'

# 9. OCLUSÃO DE IMAGEM - Segurança da Informação
create_flashcard "image_occlusion" "Informática" "Segurança da Informação" '{
  "type": "image_occlusion",
  "category": "Informática",
  "subcategory": "Segurança da Informação",
  "image": "https://via.placeholder.com/600x400/1a1a2e/ffffff?text=Pilares+da+Seguranca",
  "occlusionAreas": [
    {
      "id": "area1",
      "type": "rect",
      "x": 10,
      "y": 50,
      "width": 180,
      "height": 80,
      "answer": "Confidencialidade"
    },
    {
      "id": "area2",
      "type": "rect",
      "x": 210,
      "y": 50,
      "width": 180,
      "height": 80,
      "answer": "Integridade"
    },
    {
      "id": "area3",
      "type": "rect",
      "x": 410,
      "y": 50,
      "width": 180,
      "height": 80,
      "answer": "Disponibilidade"
    }
  ],
  "difficulty": "easy",
  "tags": ["segurança", "CIA", "conceitos básicos"],
  "status": "active"
}'

# 10. MÚLTIPLA ESCOLHA - Direito Constitucional
create_flashcard "multiple_choice" "Direito" "Direito Constitucional" '{
  "type": "multiple_choice",
  "category": "Direito",
  "subcategory": "Direito Constitucional",
  "question": "Quantos são os fundamentos da República Federativa do Brasil previstos no Art. 1º da CF/88?",
  "options": ["3", "4", "5", "6"],
  "correct": 2,
  "explanation": "São 5 fundamentos: soberania, cidadania, dignidade da pessoa humana, valores sociais do trabalho e da livre iniciativa, e pluralismo político.",
  "difficulty": "easy",
  "tags": ["constituição", "fundamentos", "art. 1º"],
  "status": "active"
}'

echo -e "${GREEN}✓ 10 Flashcards criados (1 de cada tipo + 3 cloze)${NC}"

echo -e "\n${YELLOW}3. Aguardando flashcards serem criados...${NC}"
sleep 2

echo -e "\n${YELLOW}4. Criando Decks...${NC}"
echo "======================================="

# Obter IDs dos flashcards criados
echo -e "${BLUE}Obtendo IDs dos flashcards...${NC}"
FLASHCARD_IDS=$(docker exec -i estudos-postgres psql -U $DB_USER -d $DB_NAME -t -c "SELECT array_to_json(array_agg(id::text)) FROM flashcards ORDER BY id LIMIT 10;" | tr -d '[:space:]')

echo "IDs dos flashcards: $FLASHCARD_IDS"

# Criar Deck 1: Direito para Concursos
echo -e "${BLUE}  Criando deck: Direito para Concursos${NC}"
DECK1_RESPONSE=$(curl -s -X POST "$API_URL/flashcard-decks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Direito para Concursos",
    "description": "Flashcards essenciais de Direito Constitucional e Penal para concursos públicos",
    "subject": "Direito",
    "category": "Direito",
    "flashcard_ids": ["1", "6", "10"],
    "is_public": true
  }')

if echo "$DECK1_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}    ✓ Deck criado com sucesso${NC}"
else
    echo -e "${RED}    ✗ Erro ao criar deck: $DECK1_RESPONSE${NC}"
fi

# Criar Deck 2: Informática - Fundamentos
echo -e "${BLUE}  Criando deck: Informática - Fundamentos${NC}"
DECK2_RESPONSE=$(curl -s -X POST "$API_URL/flashcard-decks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Informática - Fundamentos",
    "description": "Conceitos básicos de Redes e Segurança da Informação",
    "subject": "Informática",
    "category": "Informática",
    "flashcard_ids": ["2", "7", "9"],
    "is_public": true
  }')

if echo "$DECK2_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}    ✓ Deck criado com sucesso${NC}"
else
    echo -e "${RED}    ✗ Erro ao criar deck: $DECK2_RESPONSE${NC}"
fi

# Criar Deck 3: Português Completo
echo -e "${BLUE}  Criando deck: Português Completo${NC}"
DECK3_RESPONSE=$(curl -s -X POST "$API_URL/flashcard-decks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Português Completo",
    "description": "Gramática e Interpretação de Texto para estudos",
    "subject": "Português",
    "category": "Português",
    "flashcard_ids": ["3", "4", "5", "8"],
    "is_public": true
  }')

if echo "$DECK3_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}    ✓ Deck criado com sucesso${NC}"
else
    echo -e "${RED}    ✗ Erro ao criar deck: $DECK3_RESPONSE${NC}"
fi

echo -e "${GREEN}✓ 3 Decks criados${NC}"

echo -e "\n${GREEN}=======================================${NC}"
echo -e "${GREEN}✅ POPULAÇÃO DE DADOS CONCLUÍDA${NC}"
echo -e "${GREEN}=======================================${NC}"

# Mostrar resumo
echo -e "\n${YELLOW}📊 RESUMO DOS DADOS CRIADOS:${NC}"
echo "======================================="

echo -e "${BLUE}Categorias Principais:${NC}"
echo "  • Direito"
echo "  • Informática"
echo "  • Português"

echo -e "\n${BLUE}Flashcards (10 total):${NC}"
echo "  • 1x Básico (Direito Constitucional)"
echo "  • 1x Básico Invertido (Segurança)"
echo "  • 3x Cloze (Gramática - diferentes oclusões)"
echo "  • 2x Múltipla Escolha (Direito Penal e Constitucional)"
echo "  • 1x Verdadeiro/Falso (Redes)"
echo "  • 1x Digite a Resposta (Interpretação)"
echo "  • 1x Oclusão de Imagem (Segurança)"

echo -e "\n${BLUE}Decks (3 total):${NC}"
echo "  • Direito para Concursos (3 cards)"
echo "  • Informática - Fundamentos (3 cards)"
echo "  • Português Completo (4 cards)"

# Verificar contagens no banco
echo -e "\n${YELLOW}Verificando no banco de dados:${NC}"
docker exec -i estudos-postgres psql -U $DB_USER -d $DB_NAME -t <<EOF
SELECT 'Total de Flashcards: ' || COUNT(*) FROM flashcards
UNION ALL
SELECT 'Total de Decks: ' || COUNT(*) FROM flashcard_decks
UNION ALL
SELECT 'Total de Categorias: ' || COUNT(*) FROM categories;
EOF

echo -e "\n${YELLOW}Listando flashcards criados:${NC}"
docker exec -i estudos-postgres psql -U $DB_USER -d $DB_NAME <<EOF
SELECT id, type, category, subcategory FROM flashcards ORDER BY id;
EOF

echo -e "\n${YELLOW}Listando decks criados:${NC}"
docker exec -i estudos-postgres psql -U $DB_USER -d $DB_NAME <<EOF
SELECT id, name, flashcard_ids FROM flashcard_decks ORDER BY id;
EOF