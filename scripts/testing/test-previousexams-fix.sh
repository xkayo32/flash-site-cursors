#!/bin/bash

echo "=== TESTE DE CORREÇÃO - PREVIOUS EXAMS API ==="
echo "Data: $(date)"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:8182/api/v1"

echo "1. Testando saúde do backend..."
HEALTH=$(curl -s ${API_URL}/health)
if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✓ Backend está rodando${NC}"
else
    echo -e "${RED}✗ Backend não está respondendo${NC}"
    exit 1
fi

echo ""
echo "2. Fazendo login para obter token..."
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
    echo "Resposta do login: $LOGIN_RESPONSE"
    exit 1
else
    echo -e "${GREEN}✓ Token obtido com sucesso${NC}"
fi

echo ""
echo "3. Testando endpoint previousexams..."
PREVIOUSEXAMS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" ${API_URL}/previousexams)

echo "Resposta completa da API:"
echo "$PREVIOUSEXAMS_RESPONSE" | python3 -m json.tool

echo ""
echo "4. Verificando estrutura da resposta..."
python3 << EOF
import json
try:
    data = json.loads('$PREVIOUSEXAMS_RESPONSE')
    
    if 'error' in data:
        print("❌ API retornou erro:", data['error'])
    elif 'exams' in data:
        exams = data['exams']
        print(f"✅ Campo 'exams' encontrado com {len(exams)} items")
        
        if len(exams) > 0:
            print("\nPrimeiro exame:")
            first_exam = exams[0]
            for key, value in first_exam.items():
                print(f"  {key}: {value}")
        else:
            print("⚠️  Array de exams está vazio")
            
        if 'pagination' in data:
            pagination = data['pagination']
            print(f"\nPaginação: página {pagination.get('current_page', 'N/A')}, total {pagination.get('total', 'N/A')}")
            
    else:
        print("❌ Campo 'exams' não encontrado na resposta")
        print("Campos disponíveis:", list(data.keys()))
        
except json.JSONDecodeError as e:
    print("❌ Erro ao decodificar JSON:", str(e))
except Exception as e:
    print("❌ Erro inesperado:", str(e))
EOF

echo ""
echo "5. Verificando dados no arquivo backend..."
BACKEND_DATA="/home/administrator/flash-site-cursors/backend-node/data/previousexams.json"
if [ -f "$BACKEND_DATA" ]; then
    echo -e "${GREEN}✓ Arquivo de dados encontrado${NC}"
    echo "Conteúdo do arquivo:"
    cat "$BACKEND_DATA" | python3 -m json.tool | head -20
    
    EXAM_COUNT=$(cat "$BACKEND_DATA" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(len(data) if isinstance(data, list) else 'Formato inválido')
except:
    print('Erro ao ler')
")
    echo "Total de exames no arquivo: $EXAM_COUNT"
else
    echo -e "${RED}✗ Arquivo de dados não encontrado${NC}"
fi

echo ""
echo "6. Testando criação de sessão de exame..."
if [ "$EXAM_COUNT" != "0" ] && [ "$EXAM_COUNT" != "Erro ao ler" ]; then
    FIRST_EXAM_ID=$(cat "$BACKEND_DATA" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data[0]['id'] if len(data) > 0 else '')
except:
    print('')
")
    
    if [ ! -z "$FIRST_EXAM_ID" ]; then
        echo "Testando criação de sessão para exame ID: $FIRST_EXAM_ID"
        SESSION_RESPONSE=$(curl -s -X POST ${API_URL}/exam-sessions/previous/${FIRST_EXAM_ID}/sessions \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d '{}')
        
        echo "Resposta da criação de sessão:"
        echo "$SESSION_RESPONSE" | python3 -m json.tool
    fi
fi

echo ""
echo "=== RESUMO ==="
echo "- Backend: $(echo "$HEALTH" | grep -q "healthy" && echo "✓ OK" || echo "✗ ERRO")"
echo "- Autenticação: $([ ! -z "$TOKEN" ] && echo "✓ OK" || echo "✗ ERRO")"
echo "- API previousexams: $(echo "$PREVIOUSEXAMS_RESPONSE" | grep -q "exams" && echo "✓ OK" || echo "✗ ERRO")"
echo "- Dados no backend: $([ "$EXAM_COUNT" != "0" ] && echo "✓ $EXAM_COUNT exames" || echo "✗ VAZIO")"

echo ""
echo "=== FIM DO TESTE ==="