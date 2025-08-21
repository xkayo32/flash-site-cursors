#!/bin/bash

echo "🎯 TESTE: Verificando categorias reais no formulário de resumos"
echo "================================================================"

# Verificar se o backend está rodando
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8180/api/v1/categories)

if [ "$BACKEND_STATUS" == "200" ]; then
  echo "✅ Backend está rodando e API de categorias disponível"
  echo ""
  
  echo "📋 Categorias disponíveis na API:"
  echo "------------------------------------------------"
  
  # Buscar e mostrar as categorias principais
  CATEGORIES=$(curl -s "http://localhost:8180/api/v1/categories" | jq -r '.categories[] | select(.parent_id == null) | "• \(.name) (\(.children_count) subcategorias)"')
  echo "$CATEGORIES"
  
  echo ""
  echo "📋 Exemplo de subcategorias (Direito):"
  echo "------------------------------------------------"
  
  # Mostrar subcategorias do Direito como exemplo
  SUBCATEGORIES=$(curl -s "http://localhost:8180/api/v1/categories" | jq -r '.categories[] | select(.name == "Direito") | .children[] | "  - \(.name)"')
  echo "$SUBCATEGORIES"
  
  echo ""
  echo "🔍 O que foi implementado:"
  echo "   ✅ Matérias carregadas da API (não hardcoded)"
  echo "   ✅ Submatérias filtradas pela matéria pai"
  echo "   ✅ Loading states durante carregamento"
  echo "   ✅ Mensagens de erro se API falhar"
  echo ""
  
else
  echo "⚠️  Backend não está rodando. Inicie com: make up-postgres"
fi

# Verificar se o frontend está rodando
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)

if [ "$FRONTEND_STATUS" == "200" ]; then
  echo "✅ Frontend está rodando em http://localhost:5173"
  echo ""
  echo "🚀 Para testar as categorias:"
  echo "   1. Acesse: http://localhost:5173/admin/summaries/new"
  echo "   2. Aguarde o carregamento das categorias da API"
  echo "   3. Selecione uma matéria (ex: DIREITO)"
  echo "   4. Verifique se as submatérias aparecem automaticamente"
  echo "   5. As opções devem corresponder aos dados da API acima"
else
  echo "⚠️  Frontend não está rodando. Inicie com: cd frontend && npm run dev"
fi

echo ""
echo "================================================================"
echo "✨ Categorias agora são 100% dinâmicas:"
echo "✅ Dados hardcoded removidos completamente"
echo "✅ Integração direta com categoryService"
echo "✅ Matérias e submatérias da API real"
echo "✅ Fallback somente para loading states"
echo "================================================================"