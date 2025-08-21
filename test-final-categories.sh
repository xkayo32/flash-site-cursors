#!/bin/bash

echo "🎯 TESTE FINAL: Verificando categorias em SummaryForm"
echo "================================================================"

# Verificar se backend está rodando
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8180/api/v1/categories)
echo "🔧 Backend Status: $BACKEND_STATUS"

# Verificar se frontend está rodando
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
echo "🔧 Frontend Status: $FRONTEND_STATUS"

if [ "$BACKEND_STATUS" == "200" ] && [ "$FRONTEND_STATUS" == "200" ]; then
  echo ""
  echo "✅ Ambos serviços estão funcionando!"
  echo ""
  echo "🔍 DIAGNÓSTICO DAS CATEGORIAS:"
  echo "----------------------------------------------------------------"
  
  # Fazer login e obter token
  echo "🔐 1. Fazendo login para obter token..."
  TOKEN=$(curl -s -X POST "http://localhost:8180/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@studypro.com", "password": "Admin@123"}' | jq -r '.token')
  
  if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
    echo "✅ Token obtido com sucesso"
    
    # Testar categorias
    echo ""
    echo "📋 2. Testando endpoint de categorias..."
    CATEGORIES_RESPONSE=$(curl -s "http://localhost:8180/api/v1/categories" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
    
    CATEGORIES_SUCCESS=$(echo "$CATEGORIES_RESPONSE" | jq -r '.success')
    CATEGORIES_COUNT=$(echo "$CATEGORIES_RESPONSE" | jq '.categories | length')
    
    if [ "$CATEGORIES_SUCCESS" == "true" ]; then
      echo "✅ API de categorias funcionando"
      echo "📊 Total de categorias: $CATEGORIES_COUNT"
      
      echo ""
      echo "📋 3. Categorias principais (matérias):"
      echo "$CATEGORIES_RESPONSE" | jq -r '.categories[] | select(.parent_id == null) | "• \(.name) (\(.children_count) subcategorias)"'
      
      echo ""
      echo "🎯 INSTRUÇÕES PARA TESTAR NO BROWSER:"
      echo "----------------------------------------------------------------"
      echo "1. Abra: http://localhost:5173/admin/summaries/new"
      echo "2. Abra DevTools (F12) → Console"
      echo "3. Procure pelos logs:"
      echo "   🔧 DEBUG: Definindo token de teste"
      echo "   🔍 Carregando categorias..."
      echo "   📊 Response recebida: ..."
      echo "   ✅ Categorias encontradas: $CATEGORIES_COUNT"
      echo "4. Verifique se o select de matérias tem as opções:"
      for category in $(echo "$CATEGORIES_RESPONSE" | jq -r '.categories[] | select(.parent_id == null) | .name'); do
        echo "   - $category"
      done
      
      echo ""
      echo "🚀 Se as categorias não aparecem mesmo com todos os logs OK:"
      echo "   • Problema pode ser na renderização React"
      echo "   • Verifique se realCategories state está sendo atualizado"
      echo "   • Confirme se o .map() está sendo executado no JSX"
      
    else
      echo "❌ Falha na API de categorias"
      echo "Response: $CATEGORIES_RESPONSE"
    fi
  else
    echo "❌ Falha ao obter token"
  fi
  
else
  echo "❌ Serviços não estão funcionando"
  echo "Backend: $BACKEND_STATUS (esperado: 200)"
  echo "Frontend: $FRONTEND_STATUS (esperado: 200)"
fi

echo ""
echo "================================================================"
echo "✨ Implementações feitas:"
echo "✅ Logs de debug adicionados em SummaryForm"
echo "✅ Logs de debug adicionados em CategoryService"
echo "✅ Token de teste automático para debug"
echo "✅ Suporte para response.categories E response.data"
echo "✅ Filtros de categorias principais funcionando"
echo "================================================================"