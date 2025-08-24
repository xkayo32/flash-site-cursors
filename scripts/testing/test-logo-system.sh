#!/bin/bash

echo "========================================="
echo "TESTE DO SISTEMA DE LOGOS"
echo "========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://173.208.151.106:8180"

echo -e "\n${YELLOW}1. Verificando configurações atuais...${NC}"
echo "-----------------------------------"

# Get current settings
SETTINGS=$(curl -s "$API_URL/api/v1/settings")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Configurações obtidas com sucesso${NC}"
    
    # Extract logo paths
    LOGO_LIGHT=$(echo "$SETTINGS" | jq -r '.brand.brand_logo_light // "não configurado"')
    LOGO_DARK=$(echo "$SETTINGS" | jq -r '.brand.brand_logo_dark // "não configurado"')
    SITE_NAME=$(echo "$SETTINGS" | jq -r '.general.site_name // "não configurado"')
    
    echo "Nome do site: $SITE_NAME"
    echo "Logo Light: $LOGO_LIGHT"
    echo "Logo Dark: $LOGO_DARK"
    
    # Test if logos are accessible
    if [[ "$LOGO_LIGHT" == /uploads/* ]]; then
        echo -e "\n${YELLOW}Testando acesso à Logo Light...${NC}"
        LOGO_URL="$API_URL$LOGO_LIGHT"
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$LOGO_URL")
        
        if [ "$HTTP_STATUS" -eq 200 ]; then
            echo -e "${GREEN}✓ Logo Light acessível em: $LOGO_URL${NC}"
        else
            echo -e "${RED}✗ Logo Light não acessível (HTTP $HTTP_STATUS)${NC}"
        fi
    fi
    
    if [[ "$LOGO_DARK" == /uploads/* ]]; then
        echo -e "\n${YELLOW}Testando acesso à Logo Dark...${NC}"
        LOGO_URL="$API_URL$LOGO_DARK"
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$LOGO_URL")
        
        if [ "$HTTP_STATUS" -eq 200 ]; then
            echo -e "${GREEN}✓ Logo Dark acessível em: $LOGO_URL${NC}"
        else
            echo -e "${RED}✗ Logo Dark não acessível (HTTP $HTTP_STATUS)${NC}"
        fi
    fi
else
    echo -e "${RED}✗ Erro ao obter configurações${NC}"
fi

echo -e "\n${YELLOW}2. Verificando arquivos de upload...${NC}"
echo "-----------------------------------"

UPLOAD_DIR="/home/administrator/flash-site-cursors/backend-node/uploads"
if [ -d "$UPLOAD_DIR" ]; then
    LOGO_COUNT=$(ls -1 "$UPLOAD_DIR"/logo-* 2>/dev/null | wc -l)
    echo "Logos no diretório de upload: $LOGO_COUNT"
    
    if [ $LOGO_COUNT -gt 0 ]; then
        echo "Arquivos encontrados:"
        ls -lh "$UPLOAD_DIR"/logo-* 2>/dev/null | awk '{print "  - " $9 " (" $5 ")"}'
    fi
else
    echo -e "${RED}✗ Diretório de upload não encontrado${NC}"
fi

echo -e "\n${YELLOW}3. Verificando componentes do frontend...${NC}"
echo "-----------------------------------"

# Check if StudyProLogo is using the hook
STUDY_PRO_LOGO="/home/administrator/flash-site-cursors/frontend/src/components/ui/StudyProLogo.tsx"
if grep -q "useThemedLogo\|useLogoSettings" "$STUDY_PRO_LOGO"; then
    echo -e "${GREEN}✓ StudyProLogo está usando o hook de configurações${NC}"
else
    echo -e "${RED}✗ StudyProLogo não está usando o hook de configurações${NC}"
fi

# Count pages using StudyProLogo
PAGES_WITH_LOGO=$(cd /home/administrator/flash-site-cursors/frontend && find src -name "*.tsx" -exec grep -l "StudyProLogo" {} \; | wc -l)
echo "Páginas usando StudyProLogo: $PAGES_WITH_LOGO"

echo -e "\n${YELLOW}4. Status do sistema...${NC}"
echo "-----------------------------------"

# Check if backend is running
if curl -s "$API_URL" > /dev/null; then
    echo -e "${GREEN}✓ Backend Node.js está rodando${NC}"
else
    echo -e "${RED}✗ Backend Node.js não está acessível${NC}"
fi

# Check if frontend build works
cd /home/administrator/flash-site-cursors/frontend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend compila sem erros${NC}"
else
    echo -e "${RED}✗ Frontend tem erros de compilação${NC}"
fi

echo -e "\n========================================="
echo -e "${GREEN}TESTE COMPLETO${NC}"
echo "========================================="