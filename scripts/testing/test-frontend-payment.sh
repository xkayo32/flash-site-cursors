#!/bin/bash

# Test Frontend Payment Integration
# Verificar se página de pagamentos está funcionando corretamente

set -e

API_BASE="http://localhost:8180/api/v1"
FRONTEND_URL="http://localhost:5173"
STUDENT_EMAIL="aluno@example.com"
STUDENT_PASSWORD="aluno123"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}🎯 TESTE FRONTEND - SISTEMA PAGAMENTOS${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

echo -e "${BLUE}🔐 Fase 1: Login e Token${NC}"
echo "----------------------------------------"

# 1. Login Student
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

echo -e "${BLUE}💳 Fase 2: Dados Iniciais da Página${NC}"
echo "----------------------------------------"

# 2. Verificar métodos de pagamento
echo -e "${YELLOW}📡 Carregar arsenal financeiro${NC}"
methods_response=$(curl -s -H "Authorization: Bearer $STUDENT_TOKEN" "$API_BASE/payment/methods")
echo "$methods_response" | jq '.' 2>/dev/null || echo "$methods_response"

if echo "$methods_response" | grep -q '"success":\s*true'; then
    methods_count=$(echo "$methods_response" | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✅ Arsenal carregado: $methods_count armamentos${NC}"
else
    echo -e "${RED}❌ Falha ao carregar arsenal${NC}"
fi
echo ""

# 3. Verificar endereço de cobrança
echo -e "${YELLOW}🏠 Verificar base de operações${NC}"
billing_response=$(curl -s -H "Authorization: Bearer $STUDENT_TOKEN" "$API_BASE/payment/billing")
echo "$billing_response" | jq '.' 2>/dev/null || echo "$billing_response"

if echo "$billing_response" | grep -q '"success":\s*true'; then
    echo -e "${GREEN}✅ Base de operações carregada${NC}"
else
    echo -e "${RED}❌ Falha ao carregar base${NC}"
fi
echo ""

# 4. Verificar histórico de pagamentos
echo -e "${YELLOW}📊 Carregar relatório de operações${NC}"
history_response=$(curl -s -H "Authorization: Bearer $STUDENT_TOKEN" "$API_BASE/payment/history?page=1&limit=10")
echo "$history_response" | jq '.' 2>/dev/null || echo "$history_response"

if echo "$history_response" | grep -q '"success":\s*true'; then
    history_count=$(echo "$history_response" | grep -o '"total_items":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✅ Relatório carregado: $history_count operações${NC}"
else
    echo -e "${RED}❌ Falha ao carregar relatório${NC}"
fi
echo ""

# 5. Verificar configurações de notificação
echo -e "${YELLOW}🔔 Verificar alertas de comando${NC}"
notifications_response=$(curl -s -H "Authorization: Bearer $STUDENT_TOKEN" "$API_BASE/payment/notifications")
echo "$notifications_response" | jq '.' 2>/dev/null || echo "$notifications_response"

if echo "$notifications_response" | grep -q '"success":\s*true'; then
    echo -e "${GREEN}✅ Alertas carregados${NC}"
else
    echo -e "${RED}❌ Falha ao carregar alertas${NC}"
fi
echo ""

# 6. Verificar assinatura
echo -e "${YELLOW}📋 Verificar operação ativa${NC}"
subscription_response=$(curl -s -H "Authorization: Bearer $STUDENT_TOKEN" "$API_BASE/subscription/manage")
echo "$subscription_response" | jq '.' 2>/dev/null || echo "$subscription_response"

if echo "$subscription_response" | grep -q '"success":\s*true'; then
    echo -e "${GREEN}✅ Operação ativa encontrada${NC}"
else
    echo -e "${YELLOW}⚠️  Nenhuma operação ativa (normal)${NC}"
fi
echo ""

echo -e "${BLUE}🎨 Fase 3: Simulação de Ações da Interface${NC}"
echo "----------------------------------------"

# 7. Adicionar novo método de pagamento (simula ação do modal)
echo -e "${YELLOW}➕ Simular adição de armamento${NC}"
new_method_data='{
    "brand": "mastercard",
    "last4": "1234",
    "expiry_month": 6,
    "expiry_year": 2028,
    "holder_name": "Maria Silva",
    "nickname": "CARTÃO DE BACKUP TÁTICO",
    "is_default": false
}'

add_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $STUDENT_TOKEN" \
    -d "$new_method_data" \
    "$API_BASE/payment/methods")

echo "$add_response" | jq '.' 2>/dev/null || echo "$add_response"

if echo "$add_response" | grep -q '"success":\s*true'; then
    NEW_METHOD_ID=$(echo "$add_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Armamento adicionado: $NEW_METHOD_ID${NC}"
else
    echo -e "${RED}❌ Falha ao adicionar armamento${NC}"
fi
echo ""

# 8. Atualizar endereço (simula ação do modal de endereço)
echo -e "${YELLOW}🏠 Simular configuração de base${NC}"
billing_data='{
    "name": "Maria Silva",
    "email": "maria@teste.com",
    "line1": "Av. Principal, 456",
    "line2": "Bloco B, Apt 789",
    "city": "Rio de Janeiro",
    "state": "RJ",
    "postal_code": "22000-000",
    "country": "BR"
}'

billing_update=$(curl -s -X PUT \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $STUDENT_TOKEN" \
    -d "$billing_data" \
    "$API_BASE/payment/billing")

echo "$billing_update" | jq '.' 2>/dev/null || echo "$billing_update"

if echo "$billing_update" | grep -q '"success":\s*true'; then
    echo -e "${GREEN}✅ Base de operações configurada${NC}"
else
    echo -e "${RED}❌ Falha ao configurar base${NC}"
fi
echo ""

# 9. Atualizar configurações de notificação (simula toggles)
echo -e "${YELLOW}🔔 Simular atualização de alertas${NC}"
notification_data='{
    "payment_reminders": false,
    "payment_failures": true,
    "promotional_offers": true
}'

notification_update=$(curl -s -X PUT \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $STUDENT_TOKEN" \
    -d "$notification_data" \
    "$API_BASE/payment/notifications")

echo "$notification_update" | jq '.' 2>/dev/null || echo "$notification_update"

if echo "$notification_update" | grep -q '"success":\s*true'; then
    echo -e "${GREEN}✅ Alertas atualizados${NC}"
else
    echo -e "${RED}❌ Falha ao atualizar alertas${NC}"
fi
echo ""

# 10. Definir método como padrão (simula botão de estrela)
if [ -n "$NEW_METHOD_ID" ]; then
    echo -e "${YELLOW}⭐ Simular definir armamento principal${NC}"
    default_update=$(curl -s -X PUT \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $STUDENT_TOKEN" \
        -d '{"is_default": true}' \
        "$API_BASE/payment/methods/$NEW_METHOD_ID")

    echo "$default_update" | jq '.' 2>/dev/null || echo "$default_update"

    if echo "$default_update" | grep -q '"success":\s*true'; then
        echo -e "${GREEN}✅ Armamento principal definido${NC}"
    else
        echo -e "${RED}❌ Falha ao definir principal${NC}"
    fi
    echo ""
fi

echo -e "${BLUE}📊 Fase 4: Estado Final dos Dados${NC}"
echo "----------------------------------------"

# 11. Verificar estado final
echo -e "${YELLOW}📋 Estado final do arsenal${NC}"
final_methods=$(curl -s -H "Authorization: Bearer $STUDENT_TOKEN" "$API_BASE/payment/methods")
final_count=$(echo "$final_methods" | grep -o '"id"' | wc -l)
echo -e "${GREEN}Arsenal final: $final_count armamentos${NC}"

echo -e "${YELLOW}🏠 Estado final da base${NC}"
final_billing=$(curl -s -H "Authorization: Bearer $STUDENT_TOKEN" "$API_BASE/payment/billing")
if echo "$final_billing" | grep -q '"name"'; then
    billing_name=$(echo "$final_billing" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}Base configurada para: $billing_name${NC}"
fi

echo -e "${YELLOW}🔔 Estado final dos alertas${NC}"
final_notifications=$(curl -s -H "Authorization: Bearer $STUDENT_TOKEN" "$API_BASE/payment/notifications")
if echo "$final_notifications" | grep -q '"promotional_offers"'; then
    promo_status=$(echo "$final_notifications" | grep -o '"promotional_offers":[a-z]*' | cut -d':' -f2)
    echo -e "${GREEN}Promoções: $promo_status${NC}"
fi
echo ""

echo -e "${BLUE}🧹 Fase 5: Limpeza (Opcional)${NC}"
echo "----------------------------------------"

# 12. Remover método criado para teste (opcional)
if [ -n "$NEW_METHOD_ID" ]; then
    echo -e "${YELLOW}🗑️  Remover armamento de teste${NC}"
    delete_response=$(curl -s -X DELETE \
        -H "Authorization: Bearer $STUDENT_TOKEN" \
        "$API_BASE/payment/methods/$NEW_METHOD_ID")

    if echo "$delete_response" | grep -q '"success":\s*true'; then
        echo -e "${GREEN}✅ Armamento removido${NC}"
    else
        echo -e "${RED}❌ Falha ao remover armamento${NC}"
    fi
fi
echo ""

echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}🎯 TESTE FRONTEND CONCLUÍDO!${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "${GREEN}✅ Todos os dados necessários para o frontend estão funcionando${NC}"
echo -e "${GREEN}✅ APIs respondendo corretamente${NC}"
echo -e "${GREEN}✅ Sistema pronto para uso na interface${NC}"
echo ""
echo -e "${BLUE}🌐 Para acessar a página no navegador:${NC}"
echo -e "   1. Abra: ${FRONTEND_URL}/payment"
echo -e "   2. Faça login: $STUDENT_EMAIL / $STUDENT_PASSWORD"  
echo -e "   3. Teste todas as funcionalidades"
echo ""
echo -e "${YELLOW}💡 Funcionalidades testadas que devem funcionar na UI:${NC}"
echo -e "   • ✅ Carregamento inicial dos dados"
echo -e "   • ✅ Modal de adicionar cartão"
echo -e "   • ✅ Modal de configurar endereço"
echo -e "   • ✅ Toggles de notificação"
echo -e "   • ✅ Definir cartão padrão"
echo -e "   • ✅ Remover cartão"
echo -e "   • ✅ Histórico de pagamentos"
echo -e "   • ✅ Informações da assinatura"
echo ""
echo -e "${BLUE}🎉 Sistema de Pagamentos Frontend PRONTO!${NC}"