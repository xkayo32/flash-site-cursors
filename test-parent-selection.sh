#!/bin/bash

echo "🎯 TESTE: Seleção automática de pais ao marcar filhos"
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
    echo "🧪 TESTE ESPECÍFICO: SELEÇÃO AUTOMÁTICA DE PAIS"
    echo "================================================================"
    echo ""
    echo "📋 COMO TESTAR A CORREÇÃO:"
    echo "----------------------------------------------------------------"
    echo "1. Acesse: http://localhost:5174/admin/summaries/new"
    echo "2. Vá para aba 'CONFIG. OPERACIONAIS'"
    echo "3. Abra o Console do Browser (F12 → Console)"
    echo "4. Procure os logs de debug que começam com 🎯"
    echo ""
    echo "🔬 CENÁRIO DE TESTE 1: MARCAR FILHO"
    echo "----------------------------------------------------------------"
    echo "1. Expanda 'Direito (5 subcategorias)' clicando na seta ▶️"
    echo "2. Marque o checkbox de 'Civil' (subcategoria)"
    echo "3. DEVE ACONTECER AUTOMATICAMENTE:"
    echo "   ✅ 'Civil' fica marcado"
    echo "   ✅ 'Direito' (pai) fica marcado automaticamente"
    echo "   ✅ Badges aparecem: 'Direito' e 'Civil'"
    echo ""
    echo "📊 LOGS ESPERADOS NO CONSOLE:"
    echo "🎯 Toggle categoria: [ID da Civil]"
    echo "✅ Marcando categoria: [ID da Civil]"
    echo "👨‍👩‍👧‍👦 Pais encontrados: [ID do Direito]"
    echo "📝 Total a adicionar: [ID Civil, ID Direito]"
    echo ""
    echo "🔬 CENÁRIO DE TESTE 2: MARCAR OUTRO FILHO"
    echo "----------------------------------------------------------------"
    echo "1. Marque o checkbox de 'Penal' (outra subcategoria)"
    echo "2. DEVE ACONTECER:"
    echo "   ✅ 'Penal' fica marcado"
    echo "   ✅ 'Direito' continua marcado (não duplica)"
    echo "   ✅ Badges mostram: 'Direito', 'Civil', 'Penal'"
    echo ""
    echo "🔬 CENÁRIO DE TESTE 3: DESMARCAR PAI"
    echo "----------------------------------------------------------------"
    echo "1. Desmarque o checkbox de 'Direito' (categoria pai)"
    echo "2. DEVE ACONTECER:"
    echo "   ❌ 'Direito' fica desmarcado"
    echo "   ❌ 'Civil' fica desmarcado automaticamente"
    echo "   ❌ 'Penal' fica desmarcado automaticamente"
    echo "   🔄 Badges desaparecem"
    echo ""
    echo "📊 LOGS ESPERADOS NO CONSOLE:"
    echo "🎯 Toggle categoria: [ID do Direito]"
    echo "❌ Desmarcando categoria: [ID do Direito]"
    echo "👶 Filhos encontrados: [IDs dos filhos]"
    echo ""
    echo "🔍 VERIFICAÇÃO VISUAL:"
    echo "----------------------------------------------------------------"
    echo "✅ Checkboxes marcados/desmarcados corretamente"
    echo "✅ Badges aparecem e desaparecem dinamicamente"
    echo "✅ Seção 'CATEGORIAS SELECIONADAS' atualiza em tempo real"
    echo "✅ Contador mostra número correto: (X categorias)"
    echo ""
    echo "⚠️  SE NÃO FUNCIONAR:"
    echo "----------------------------------------------------------------"
    echo "1. Verifique logs de erro no Console (F12)"
    echo "2. Confirme que logs de debug aparecem ao clicar"
    echo "3. Teste com outras categorias (Matemática, Português)"
    echo "4. Recarregue a página e tente novamente"
    
  else
    echo "❌ Falha na autenticação"
  fi
else
  echo "❌ Serviços não funcionando"
fi

echo ""
echo "================================================================"
echo "🛠️  CORREÇÃO IMPLEMENTADA:"
echo "✅ Copiada implementação exata do NewFlashcard.tsx"
echo "✅ Função findParentChain corrigida"
echo "✅ Função findAllChildren corrigida"
echo "✅ Logs de debug adicionados para troubleshooting"
echo "✅ Seleção automática de pais ao marcar filhos"
echo "✅ Deseleção automática de filhos ao desmarcar pais"
echo "================================================================"