#!/bin/bash

# Teste de Settings API
# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:8180/api/v1/settings"

echo -e "${YELLOW}=== TESTE DE SETTINGS API ===${NC}\n"

# 1. GET inicial - verificar dados atuais
echo -e "${YELLOW}1. Buscando configurações atuais...${NC}"
CURRENT_SETTINGS=$(curl -s -X GET "$API_URL" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ GET funcionando${NC}"
    echo "Dados atuais:"
    echo "$CURRENT_SETTINGS" | python3 -m json.tool 2>/dev/null | head -20
else
    echo -e "${RED}✗ Erro no GET${NC}"
fi

echo -e "\n${YELLOW}2. Atualizando configurações GERAIS...${NC}"
UPDATE_GENERAL=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "general": {
      "site_name": "StudyPro ATUALIZADO",
      "site_tagline": "Nova tagline teste",
      "site_description": "Descrição atualizada via teste",
      "maintenance_mode": false
    },
    "company": {
      "company_name": "StudyPro Educação Ltda",
      "company_cnpj": "00.000.000/0001-00",
      "company_address": "Rua Principal, 123 - Centro",
      "company_city": "São Paulo",
      "company_state": "SP",
      "company_zip": "01000-000",
      "company_phone": "(11) 1234-5678",
      "company_email": "contato@studypro.com",
      "company_whatsapp": "(11) 91234-5678"
    },
    "brand": {
      "brand_primary_color": "rgb(250, 204, 21)",
      "brand_secondary_color": "rgb(20, 36, 47)",
      "brand_logo_light": "/logo.png",
      "brand_logo_dark": "/logo.png",
      "brand_favicon": "/logo.png"
    },
    "social": {
      "facebook": "https://facebook.com/studypro",
      "instagram": "https://instagram.com/studypro",
      "twitter": "https://twitter.com/studypro",
      "linkedin": "https://linkedin.com/company/studypro",
      "youtube": "https://youtube.com/studypro"
    }
  }' 2>/dev/null)

echo "Resposta: $UPDATE_GENERAL"

echo -e "\n${YELLOW}3. Verificando se as alterações foram salvas...${NC}"
sleep 1
UPDATED_SETTINGS=$(curl -s -X GET "$API_URL" 2>/dev/null)
if echo "$UPDATED_SETTINGS" | grep -q "StudyPro ATUALIZADO"; then
    echo -e "${GREEN}✓ Configurações GERAIS atualizadas com sucesso!${NC}"
else
    echo -e "${RED}✗ Configurações GERAIS não foram atualizadas${NC}"
    echo "Recebido:"
    echo "$UPDATED_SETTINGS" | python3 -m json.tool 2>/dev/null | grep -A2 "general"
fi

echo -e "\n${YELLOW}4. Atualizando configurações da EMPRESA...${NC}"
UPDATE_COMPANY=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "general": {
      "site_name": "StudyPro ATUALIZADO",
      "site_tagline": "Nova tagline teste",
      "site_description": "Descrição atualizada via teste",
      "maintenance_mode": false
    },
    "company": {
      "company_name": "NOVA EMPRESA TESTE",
      "company_cnpj": "11.111.111/0001-11",
      "company_address": "Nova Rua, 999",
      "company_city": "Rio de Janeiro",
      "company_state": "RJ",
      "company_zip": "20000-000",
      "company_phone": "(21) 9999-9999",
      "company_email": "novo@teste.com",
      "company_whatsapp": "(21) 99999-9999"
    },
    "brand": {
      "brand_primary_color": "rgb(250, 204, 21)",
      "brand_secondary_color": "rgb(20, 36, 47)",
      "brand_logo_light": "/logo.png",
      "brand_logo_dark": "/logo.png",
      "brand_favicon": "/logo.png"
    },
    "social": {
      "facebook": "https://facebook.com/studypro",
      "instagram": "https://instagram.com/studypro",
      "twitter": "https://twitter.com/studypro",
      "linkedin": "https://linkedin.com/company/studypro",
      "youtube": "https://youtube.com/studypro"
    }
  }' 2>/dev/null)

echo "Resposta: $UPDATE_COMPANY"

echo -e "\n${YELLOW}5. Verificando se a EMPRESA foi atualizada...${NC}"
sleep 1
FINAL_SETTINGS=$(curl -s -X GET "$API_URL" 2>/dev/null)
if echo "$FINAL_SETTINGS" | grep -q "NOVA EMPRESA TESTE"; then
    echo -e "${GREEN}✓ Configurações da EMPRESA atualizadas com sucesso!${NC}"
else
    echo -e "${RED}✗ Configurações da EMPRESA não foram atualizadas${NC}"
    echo "Recebido:"
    echo "$FINAL_SETTINGS" | python3 -m json.tool 2>/dev/null | grep -A9 "company"
fi

echo -e "\n${YELLOW}=== RESUMO DO TESTE ===${NC}"
echo -e "Configurações finais:"
echo "$FINAL_SETTINGS" | python3 -m json.tool 2>/dev/null

echo -e "\n${YELLOW}Teste concluído!${NC}"