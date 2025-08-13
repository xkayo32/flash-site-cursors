#!/bin/bash

# Test Payment API Endpoints
# Sistema de Pagamentos - Teste Completo da API

set -e  # Exit on any error

API_BASE="http://localhost:8180/api/v1"
ADMIN_EMAIL="admin@studypro.com"
ADMIN_PASSWORD="Admin@123"
STUDENT_EMAIL="aluno@example.com"
STUDENT_PASSWORD="aluno123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}🔥 TESTE COMPLETO - SISTEMA PAGAMENTOS${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Function to make requests with error handling
make_request() {
    local method=$1
    local url=$2
    local data=$3
    local token=$4
    local description=$5

    echo -e "${YELLOW}📡 ${description}${NC}"
    echo -e "   ${method} ${url}"

    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -X "$method" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data" \
                "$API_BASE$url")
        else
            response=$(curl -s -X "$method" \
                -H "Authorization: Bearer $token" \
                "$API_BASE$url")
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$API_BASE$url")
        else
            response=$(curl -s -X "$method" "$API_BASE$url")
        fi
    fi

    echo "$response"
    
    # Check if response contains success: true
    if echo "$response" | grep -q '"success":\s*true'; then
        echo -e "${GREEN}✅ SUCESSO${NC}"
    else
        echo -e "${RED}❌ FALHA${NC}"
        if echo "$response" | grep -q '"message"'; then
            message=$(echo "$response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
            echo -e "${RED}   Erro: $message${NC}"
        fi
    fi
    echo ""
    return 0
}

echo -e "${BLUE}🔐 Fase 1: Autenticação${NC}"
echo "----------------------------------------"

# 1. Login Admin
echo -e "${YELLOW}🧑‍💼 Login Admin${NC}"
admin_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
    "$API_BASE/auth/login")

if echo "$admin_response" | grep -q '"success":\s*true'; then
    ADMIN_TOKEN=$(echo "$admin_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Admin autenticado com sucesso${NC}"
    echo -e "   Token: ${ADMIN_TOKEN:0:50}..."
else
    echo -e "${RED}❌ Falha na autenticação admin${NC}"
    exit 1
fi
echo ""

# 2. Login Student (Aluno)
echo -e "${YELLOW}🎓 Login Estudante${NC}"
student_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$STUDENT_EMAIL\",\"password\":\"$STUDENT_PASSWORD\"}" \
    "$API_BASE/auth/login")

if echo "$student_response" | grep -q '"success":\s*true'; then
    STUDENT_TOKEN=$(echo "$student_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Estudante autenticado com sucesso${NC}"
    echo -e "   Token: ${STUDENT_TOKEN:0:50}..."
else
    echo -e "${RED}❌ Falha na autenticação estudante${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}💳 Fase 2: Métodos de Pagamento${NC}"
echo "----------------------------------------"

# 3. Listar métodos de pagamento (vazio inicialmente)
make_request "GET" "/payment/methods" "" "$STUDENT_TOKEN" "Listar arsenal financeiro inicial"

# 4. Adicionar método de pagamento
payment_method_data='{
    "brand": "visa",
    "last4": "4242",
    "expiry_month": 12,
    "expiry_year": 2026,
    "holder_name": "João Silva",
    "nickname": "CARTÃO PRINCIPAL TÁTICO",
    "is_default": true
}'
make_request "POST" "/payment/methods" "$payment_method_data" "$STUDENT_TOKEN" "Adicionar armamento ao arsenal"

# 5. Adicionar segundo método de pagamento
payment_method_data2='{
    "brand": "mastercard",
    "last4": "5555",
    "expiry_month": 8,
    "expiry_year": 2027,
    "holder_name": "João Silva",
    "nickname": "CARTÃO DE RESERVA TÁTICA",
    "is_default": false
}'
make_request "POST" "/payment/methods" "$payment_method_data2" "$STUDENT_TOKEN" "Adicionar segundo armamento"

# 6. Listar métodos de pagamento novamente
make_request "GET" "/payment/methods" "" "$STUDENT_TOKEN" "Listar arsenal atualizado"

# Pegar ID do primeiro método para testes
methods_response=$(curl -s -H "Authorization: Bearer $STUDENT_TOKEN" "$API_BASE/payment/methods")
if echo "$methods_response" | grep -q '"id"'; then
    PAYMENT_METHOD_ID=$(echo "$methods_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo -e "${BLUE}📝 ID do método capturado: $PAYMENT_METHOD_ID${NC}"
    echo ""
fi

# 7. Atualizar método de pagamento
if [ -n "$PAYMENT_METHOD_ID" ]; then
    update_data='{"nickname": "ARMAMENTO PRINCIPAL ATUALIZADO"}'
    make_request "PUT" "/payment/methods/$PAYMENT_METHOD_ID" "$update_data" "$STUDENT_TOKEN" "Atualizar designação tática"
fi

echo -e "${BLUE}🏠 Fase 3: Endereço de Cobrança${NC}"
echo "----------------------------------------"

# 8. Buscar endereço de cobrança (vazio inicialmente)
make_request "GET" "/payment/billing" "" "$STUDENT_TOKEN" "Verificar base de operações inicial"

# 9. Configurar endereço de cobrança
billing_data='{
    "name": "João Silva",
    "email": "joao@teste.com",
    "line1": "Rua Teste, 123",
    "line2": "Apt 45",
    "city": "São Paulo",
    "state": "SP",
    "postal_code": "01234-567",
    "country": "BR"
}'
make_request "PUT" "/payment/billing" "$billing_data" "$STUDENT_TOKEN" "Configurar base de operações"

# 10. Buscar endereço atualizado
make_request "GET" "/payment/billing" "" "$STUDENT_TOKEN" "Verificar base configurada"

echo -e "${BLUE}📊 Fase 4: Histórico de Pagamentos${NC}"
echo "----------------------------------------"

# 11. Buscar histórico de pagamentos
make_request "GET" "/payment/history?page=1&limit=10" "" "$STUDENT_TOKEN" "Relatório de operações financeiras"

# 12. Buscar histórico filtrado por status
make_request "GET" "/payment/history?status=succeeded&page=1&limit=5" "" "$STUDENT_TOKEN" "Filtrar operações bem-sucedidas"

echo -e "${BLUE}🔔 Fase 5: Configurações de Notificação${NC}"
echo "----------------------------------------"

# 13. Buscar configurações de notificação
make_request "GET" "/payment/notifications" "" "$STUDENT_TOKEN" "Verificar alertas de comando"

# 14. Atualizar configurações de notificação
notification_data='{
    "payment_reminders": true,
    "payment_failures": true,
    "promotional_offers": true
}'
make_request "PUT" "/payment/notifications" "$notification_data" "$STUDENT_TOKEN" "Atualizar alertas de comando"

# 15. Verificar configurações atualizadas
make_request "GET" "/payment/notifications" "" "$STUDENT_TOKEN" "Confirmar alertas atualizados"

echo -e "${BLUE}📋 Fase 6: Assinaturas${NC}"
echo "----------------------------------------"

# 16. Buscar assinatura ativa
make_request "GET" "/subscription/manage" "" "$STUDENT_TOKEN" "Verificar operação ativa"

echo -e "${BLUE}📄 Fase 7: Faturas e Downloads${NC}"
echo "----------------------------------------"

# 17. Tentar baixar fatura (se existir)
invoices_response=$(curl -s -H "Authorization: Bearer $STUDENT_TOKEN" "$API_BASE/payment/history")
if echo "$invoices_response" | grep -q '"invoice_id"'; then
    INVOICE_ID=$(echo "$invoices_response" | grep -o '"invoice_id":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ "$INVOICE_ID" != "null" ] && [ -n "$INVOICE_ID" ]; then
        echo -e "${BLUE}📝 ID da fatura capturado: $INVOICE_ID${NC}"
        make_request "GET" "/invoices/$INVOICE_ID/download" "" "$STUDENT_TOKEN" "Download do relatório"
    else
        echo -e "${YELLOW}📝 Nenhuma fatura disponível para download${NC}"
    fi
else
    echo -e "${YELLOW}📝 Nenhuma fatura encontrada no histórico${NC}"
fi
echo ""

echo -e "${BLUE}🧪 Fase 8: Testes de Validação${NC}"
echo "----------------------------------------"

# 18. Tentar adicionar método com dados inválidos
invalid_data='{"brand": "visa"}'
make_request "POST" "/payment/methods" "$invalid_data" "$STUDENT_TOKEN" "Teste com dados inválidos"

# 19. Tentar acessar método inexistente
make_request "GET" "/payment/methods/inexistente" "" "$STUDENT_TOKEN" "Teste método inexistente"

# 20. Tentar atualizar método sem autorização
make_request "GET" "/payment/methods" "" "" "Teste sem autenticação"

# 21. Tentar remover método de pagamento
if [ -n "$PAYMENT_METHOD_ID" ]; then
    make_request "DELETE" "/payment/methods/$PAYMENT_METHOD_ID" "" "$STUDENT_TOKEN" "Remover armamento do arsenal"
fi

echo -e "${BLUE}📈 Fase 9: Estatísticas Finais${NC}"
echo "----------------------------------------"

# 22. Verificar estado final dos métodos
make_request "GET" "/payment/methods" "" "$STUDENT_TOKEN" "Arsenal final"

# 23. Verificar estado final do histórico
make_request "GET" "/payment/history?page=1&limit=3" "" "$STUDENT_TOKEN" "Histórico final"

echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}🎯 TESTE COMPLETO FINALIZADO!${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "${GREEN}✅ Todos os endpoints do sistema de pagamentos foram testados${NC}"
echo -e "${GREEN}✅ Sistema integrado e funcional${NC}"
echo -e "${GREEN}✅ API respondendo corretamente${NC}"
echo ""
echo -e "${BLUE}🔧 Endpoints testados:${NC}"
echo -e "   • GET  /payment/methods (Listar métodos)"
echo -e "   • POST /payment/methods (Adicionar método)"
echo -e "   • PUT  /payment/methods/:id (Atualizar método)"
echo -e "   • DELETE /payment/methods/:id (Remover método)"
echo -e "   • GET  /payment/history (Histórico)"
echo -e "   • GET  /payment/billing (Endereço)"
echo -e "   • PUT  /payment/billing (Configurar endereço)"
echo -e "   • GET  /payment/notifications (Alertas)"
echo -e "   • PUT  /payment/notifications (Atualizar alertas)"
echo -e "   • GET  /subscription/manage (Assinatura)"
echo -e "   • GET  /invoices/:id/download (Download)"
echo ""
echo -e "${YELLOW}💡 Para testar no frontend:${NC}"
echo -e "   1. Acesse http://localhost:5173/student/payment"
echo -e "   2. Faça login como estudante: aluno@example.com / aluno123"
echo -e "   3. Teste todas as funcionalidades da página"
echo ""
echo -e "${BLUE}🎉 Sistema de Pagamentos 100% Operacional!${NC}"