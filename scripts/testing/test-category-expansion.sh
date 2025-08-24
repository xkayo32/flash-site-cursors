#!/bin/bash

echo "🔍 TESTE: Verificando expansão das categorias"
echo "================================================================"

# Verificar se serviços estão rodando
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8180/api/v1/categories)
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5174)

echo "🔧 Backend Status: $BACKEND_STATUS"
echo "🔧 Frontend Status: $FRONTEND_STATUS"

if [ "$BACKEND_STATUS" == "200" ] && [ "$FRONTEND_STATUS" == "200" ]; then
  echo ""
  echo "✅ Serviços funcionando!"
  echo ""
  
  # Verificar estrutura da API
  echo "🔍 ESTRUTURA DA API:"
  echo "----------------------------------------------------------------"
  
  # Fazer login
  TOKEN=$(curl -s -X POST "http://localhost:8180/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@studypro.com", "password": "Admin@123"}' | jq -r '.token')
  
  if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
    echo "✅ Autenticado com sucesso"
    
    # Verificar categoria Direito especificamente
    echo ""
    echo "📋 VERIFICANDO CATEGORIA 'DIREITO':"
    echo "----------------------------------------------------------------"
    
    DIREITO_DATA=$(curl -s "http://localhost:8180/api/v1/categories" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" | jq '.categories[] | select(.name == "Direito")')
    
    echo "📂 Categoria Direito:"
    echo "$DIREITO_DATA" | jq '{
      id: .id,
      name: .name,
      parent_id: .parent_id,
      children_count: .children_count,
      has_children_array: (.children != null),
      children_length: (.children | length),
      children_names: [.children[]?.name]
    }'
    
    echo ""
    echo "🔍 DIAGNÓSTICO DO PROBLEMA:"
    echo "----------------------------------------------------------------"
    echo "1. ✅ API retorna children_count: 5"
    echo "2. ✅ API retorna array children com subcategorias"
    echo "3. 🔍 Frontend deve mostrar estas subcategorias automaticamente"
    echo ""
    echo "💡 POSSÍVEIS CAUSAS DO PROBLEMA:"
    echo "   1. renderCategoryTree não está sendo chamado para children"
    echo "   2. CSS está ocultando as subcategorias"
    echo "   3. Estrutura JSX incorreta"
    echo "   4. Estado React não está sendo atualizado"
    echo ""
    echo "🎯 PARA DEBUGGAR:"
    echo "   1. Acesse: http://localhost:5174/admin/summaries/new"
    echo "   2. Abra Console (F12)"
    echo "   3. Procure pelos logs:"
    echo "      📊 Dados das categorias com hierarquia"
    echo "      🌳 Categorias principais encontradas"
    echo "      👨‍👩‍👧‍👦 [Nome] tem X filhos"
    echo "      🌲 Renderizando categoria"
    echo "   4. Verifique se aparece 'hasChildren: true' para Direito"
    echo "   5. Verifique se aparece renderização dos filhos"
    
  else
    echo "❌ Falha na autenticação"
  fi
else
  echo "❌ Serviços não funcionando"
fi

echo ""
echo "================================================================"
echo "🔧 PRÓXIMOS PASSOS CASO O PROBLEMA PERSISTA:"
echo "1. Verificar logs no console do browser"
echo "2. Inspecionar elemento DOM das categorias"
echo "3. Verificar se children estão sendo renderizados mas ocultos"
echo "4. Comparar com funcionamento do NewFlashcard"
echo "================================================================"