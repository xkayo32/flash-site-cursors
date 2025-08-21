#!/bin/bash

echo "🎯 TESTE: Sistema de categorias recolhíveis na aba CONFIG. OPERACIONAIS"
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
  
  # Fazer login
  TOKEN=$(curl -s -X POST "http://localhost:8180/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@studypro.com", "password": "Admin@123"}' | jq -r '.token')
  
  if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
    echo "✅ Autenticado com sucesso"
    
    echo ""
    echo "📁 CATEGORIAS DISPONÍVEIS PARA TESTE:"
    echo "----------------------------------------------------------------"
    
    CATEGORIES_RESPONSE=$(curl -s "http://localhost:8180/api/v1/categories" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
    
    echo "$CATEGORIES_RESPONSE" | jq -r '.categories[] | select(.parent_id == null) | "\(.name) (\(.children_count) subcategorias)"' | while read line; do
      echo "📂 $line"
    done
    
    echo ""
    echo "🎯 COMO TESTAR O NOVO SISTEMA:"
    echo "----------------------------------------------------------------"
    echo "1. Acesse: http://localhost:5174/admin/summaries/new"
    echo "2. Clique na aba 'CONFIG. OPERACIONAIS' (segunda aba)"
    echo "3. Encontre a seção '📁 CATEGORIAS TÁTICAS'"
    echo "4. Observe que todas as categorias estão RECOLHIDAS por padrão"
    echo "5. Para expandir uma categoria com subcategorias:"
    echo "   👉 Clique no botão com seta (ChevronRight)"
    echo "   📂 Ícone muda de Folder para FolderOpen"
    echo "   📋 Subcategorias aparecem indentadas"
    echo "6. Para recolher novamente:"
    echo "   👉 Clique no botão com seta para baixo (ChevronDown)"
    echo "   📁 Volta para Folder fechado"
    echo "   🫥 Subcategorias desaparecem"
    echo ""
    echo "🔧 FUNCIONALIDADES IMPLEMENTADAS:"
    echo "----------------------------------------------------------------"
    echo "   ✅ Expansão/recolhimento individual por categoria"
    echo "   ✅ Estado persistente durante uso (expandedCategories)"
    echo "   ✅ Ícones dinâmicos (Folder ↔ FolderOpen)"
    echo "   ✅ Botões chevron com hover effect"
    echo "   ✅ Contador de subcategorias visível"
    echo "   ✅ Prevenção de cliques acidentais (stopPropagation)"
    echo "   ✅ Interface limpa e organizada"
    echo "   ✅ Economiza espaço na tela"
    echo ""
    echo "💡 TESTE ESPECÍFICO COM DIREITO:"
    echo "----------------------------------------------------------------"
    echo "1. Procure a categoria 'Direito (5 subcategorias)'"
    echo "2. Clique na seta ▶️ para expandir"
    echo "3. Deve aparecer: 'Subcategorias de Direito'"
    echo "4. Deve listar: Administrativo, Civil, Constitucional, Penal, Processual"
    echo "5. Clique na seta 🔽 para recolher"
    echo "6. Subcategorias devem desaparecer"
    echo ""
    echo "☑️ TESTE DE SELEÇÃO:"
    echo "----------------------------------------------------------------"
    echo "1. Marque checkbox de uma categoria principal"
    echo "2. Marque checkbox de algumas subcategorias"
    echo "3. Observe badges aparecendo em 'CATEGORIAS SELECIONADAS'"
    echo "4. Teste se validação funciona (pelo menos 1 categoria obrigatória)"
    
  else
    echo "❌ Falha na autenticação"
  fi
else
  echo "❌ Serviços não funcionando"
fi

echo ""
echo "================================================================"
echo "✨ MELHORIAS IMPLEMENTADAS:"
echo "📁 Categorias recolhidas por padrão (economiza espaço)"
echo "🔄 Expansão/recolhimento controlado individualmente"
echo "📍 Movido para aba 'CONFIG. OPERACIONAIS'"
echo "🎨 Interface mais limpa e organizada"
echo "⚡ Cliques precisos (sem interferência)"
echo "🏷️ Badges dinâmicos das categorias selecionadas"
echo "================================================================"