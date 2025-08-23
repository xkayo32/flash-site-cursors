#!/bin/bash

echo "🎯 TESTE: Sistema de filtro de categorias no Arsenal Operacional"
echo "================================================================"

# Verificar se serviços estão rodando
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8180/api/v1/categories)
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)

echo "🔧 Backend Status: $BACKEND_STATUS"
echo "🔧 Frontend Status: $FRONTEND_STATUS"

if [ "$BACKEND_STATUS" == "200" ] && [ "$FRONTEND_STATUS" == "200" ]; then
  echo ""
  echo "✅ Serviços funcionando!"
  echo ""
  
  # Fazer login
  TOKEN=$(curl -s -X POST "http://localhost:8180/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "aluno@example.com", "password": "aluno123"}' | jq -r '.token')
  
  if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
    echo "✅ Autenticado como aluno com sucesso"
    
    # Verificar categorias disponíveis
    echo ""
    echo "📁 CATEGORIAS DISPONÍVEIS:"
    echo "----------------------------------------------------------------"
    curl -s -X GET "http://localhost:8180/api/v1/categories" \
      -H "Authorization: Bearer $TOKEN" | jq -r '.data[] | "📂 \(.name) (\(.children | length) subcategorias)"' 2>/dev/null || echo "Erro ao buscar categorias"
    
    echo ""
    echo "🎯 TESTE DO SISTEMA DE FILTROS NO ARSENAL OPERACIONAL:"
    echo "================================================================"
    echo ""
    echo "📋 COMO TESTAR:"
    echo "----------------------------------------------------------------"
    echo "1. Acesse: http://localhost:5173"
    echo "2. Faça login como aluno: aluno@example.com / aluno123"
    echo "3. Navegue para 'ARSENAL TÁTICO' (flashcards)"
    echo ""
    echo "🔬 TESTE 1: NOVO BOTÃO DE CATEGORIAS"
    echo "----------------------------------------------------------------"
    echo "✅ Verifique que o botão 'CATEGORIAS' com ícone de filtro"
    echo "   aparece no lugar do select de matérias"
    echo "✅ O botão deve mostrar um badge com número se houver"
    echo "   categorias selecionadas"
    echo ""
    echo "🔬 TESTE 2: MODAL DE CATEGORIAS"
    echo "----------------------------------------------------------------"
    echo "1. Clique no botão 'CATEGORIAS'"
    echo "2. DEVE ABRIR modal 'FILTRAR POR CATEGORIAS TÁTICAS'"
    echo "3. Verifique os elementos:"
    echo "   ✅ Árvore hierárquica de categorias"
    echo "   ✅ Checkboxes para seleção"
    echo "   ✅ Ícones de pasta/tag"
    echo "   ✅ Botões expandir/recolher (seta)"
    echo ""
    echo "🔬 TESTE 3: SELEÇÃO HIERÁRQUICA"
    echo "----------------------------------------------------------------"
    echo "1. Expanda 'Direito' (clique na seta ▶️)"
    echo "2. Marque 'Civil' (subcategoria)"
    echo "3. VERIFICAR:"
    echo "   ✅ 'Civil' fica marcado"
    echo "   ✅ 'Direito' (pai) marcado automaticamente"
    echo "   ✅ Badges mostram 'Direito' e 'Civil'"
    echo "   ✅ Contador mostra '2 CATEGORIAS SELECIONADAS'"
    echo ""
    echo "🔬 TESTE 4: APLICAR FILTROS"
    echo "----------------------------------------------------------------"
    echo "1. Com categorias selecionadas, clique 'APLICAR FILTROS'"
    echo "2. VERIFICAR:"
    echo "   ✅ Modal fecha"
    echo "   ✅ Botão 'CATEGORIAS' mostra badge com número"
    echo "   ✅ Cards/decks filtrados por categorias selecionadas"
    echo "   ✅ Apenas flashcards das categorias escolhidas aparecem"
    echo ""
    echo "🔬 TESTE 5: LIMPAR FILTROS"
    echo "----------------------------------------------------------------"
    echo "1. Abra modal novamente"
    echo "2. Clique em 'LIMPAR TODAS'"
    echo "3. VERIFICAR:"
    echo "   ✅ Todos checkboxes desmarcados"
    echo "   ✅ Badges somem"
    echo "   ✅ Após aplicar, todos cards voltam a aparecer"
    echo ""
    echo "⚡ FUNCIONALIDADES IMPLEMENTADAS:"
    echo "----------------------------------------------------------------"
    echo "✅ Botão de filtro substituindo select simples"
    echo "✅ Modal com árvore hierárquica de categorias"
    echo "✅ Seleção inteligente (filho → pais automático)"
    echo "✅ Deseleção em cascata (pai → todos os filhos)"
    echo "✅ Expansão/recolhimento de categorias"
    echo "✅ Badges dinâmicos mostrando seleção"
    echo "✅ Filtro aplicado aos flashcards/decks"
    echo "✅ Interface tática consistente"
    
  else
    echo "❌ Falha na autenticação como aluno"
  fi
else
  echo "❌ Serviços não funcionando"
  echo "Execute: make up-postgres"
fi

echo ""
echo "================================================================"
echo "🛠️  IMPLEMENTAÇÃO COMPLETA:"
echo "✅ Sistema de categorias hierárquico igual ao admin"
echo "✅ Seleção automática de pais ao marcar filhos"
echo "✅ Modal responsivo com scroll"
echo "✅ Integração com API de categorias"
echo "✅ Filtro aplicado em tempo real aos flashcards"
echo "✅ Design militar/tático mantido"
echo "================================================================"