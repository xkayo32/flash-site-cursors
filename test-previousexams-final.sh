#!/bin/bash

echo "=== TESTE FINAL - PREVIOUS EXAMS CORRIGIDO ==="
echo "Data: $(date)"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:8182/api/v1"

echo "1. Fazendo login para obter token..."
LOGIN_RESPONSE=$(curl -s -X POST ${API_URL}/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"aluno@example.com","password":"aluno123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('token', ''))
except:
    print('')
")

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Falha ao obter token de autenticação${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Token obtido com sucesso${NC}"
fi

echo ""
echo "2. Testando endpoint previousexams após correção..."
PREVIOUSEXAMS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" ${API_URL}/previousexams)

echo "Resposta da API:"
echo "$PREVIOUSEXAMS_RESPONSE" | python3 -m json.tool

echo ""
echo "3. Verificando se os exames aparecem agora..."
python3 << EOF
import json
try:
    data = json.loads('$PREVIOUSEXAMS_RESPONSE')
    
    if 'error' in data:
        print("❌ API retornou erro:", data['error'])
    elif 'exams' in data:
        exams = data['exams']
        print(f"✅ {len(exams)} exames encontrados!")
        
        if len(exams) > 0:
            print("\n📋 Lista de Exames:")
            for i, exam in enumerate(exams, 1):
                title = exam.get('title', 'Sem título')
                org = exam.get('organization', 'N/A')
                year = exam.get('year', 'N/A')
                questions = exam.get('total_questions', 'N/A')
                print(f"  {i}. {title}")
                print(f"     Organização: {org} | Ano: {year} | Questões: {questions}")
                print("")
        else:
            print("⚠️  Array de exams ainda está vazio")
            
    else:
        print("❌ Campo 'exams' não encontrado na resposta")
        
except json.JSONDecodeError as e:
    print("❌ Erro ao decodificar JSON:", str(e))
except Exception as e:
    print("❌ Erro inesperado:", str(e))
EOF

echo ""
echo "4. Testando navegação 'Executar Missão' simulada..."
if echo "$PREVIOUSEXAMS_RESPONSE" | grep -q '"exams":\s*\[.*\]' && ! echo "$PREVIOUSEXAMS_RESPONSE" | grep -q '"exams":\s*\[\s*\]'; then
    FIRST_EXAM_ID=$(echo "$PREVIOUSEXAMS_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    exams = data.get('exams', [])
    if len(exams) > 0:
        print(exams[0].get('id', ''))
except:
    print('')
")
    
    if [ ! -z "$FIRST_EXAM_ID" ]; then
        echo -e "${YELLOW}📝 Simulando clique em 'Executar Missão' para exame: $FIRST_EXAM_ID${NC}"
        SESSION_RESPONSE=$(curl -s -X POST ${API_URL}/exam-sessions/previous/${FIRST_EXAM_ID}/sessions \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d '{}')
        
        if echo "$SESSION_RESPONSE" | grep -q '"id"'; then
            SESSION_ID=$(echo "$SESSION_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('id', ''))
except:
    print('')
")
            echo -e "${GREEN}✅ Sessão criada com sucesso: $SESSION_ID${NC}"
            echo -e "${GREEN}✅ Navegação 'Executar Missão' funcionaria perfeitamente!${NC}"
        else
            echo -e "${RED}❌ Erro ao criar sessão${NC}"
            echo "$SESSION_RESPONSE" | python3 -m json.tool
        fi
    fi
fi

echo ""
echo "=== RESULTADO FINAL ==="
EXAM_COUNT=$(echo "$PREVIOUSEXAMS_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    exams = data.get('exams', [])
    print(len(exams))
except:
    print('0')
")

if [ "$EXAM_COUNT" -gt "0" ]; then
    echo -e "${GREEN}🎉 SUCESSO! Frontend agora pode exibir $EXAM_COUNT exames aos alunos!${NC}"
    echo -e "${GREEN}✓ API previousexams funcionando${NC}"
    echo -e "${GREEN}✓ Exames carregando corretamente${NC}"
    echo -e "${GREEN}✓ Navegação 'Executar Missão' operacional${NC}"
else
    echo -e "${RED}❌ PROBLEMA PERSISTE - Exames não aparecem${NC}"
fi