#!/bin/bash

echo "🌳 TESTE DE CATEGORIAS ANINHADAS (HIERÁRQUICAS)"
echo "==============================================="
echo ""

# URLs para teste
MANAGER_URL="http://173.208.151.106:5273/admin/flashcards"
INDIVIDUAL_URL="http://173.208.151.106:5273/admin/flashcards/cards"

echo "📋 SISTEMA DE CATEGORIAS HIERÁRQUICAS:"
echo ""
echo "✅ 1. Hook useDynamicCategories implementado"
echo "✅ 2. categoryService.getCategoryHierarchy() corrigido"
echo "✅ 3. Prioriza children da hierarquia"
echo "✅ 4. Fallback para API se children não existir"
echo "✅ 5. Fallback final para categorias padrão"
echo ""

echo "🔧 LÓGICA DE CARREGAMENTO:"
echo ""
echo "📊 CATEGORIAS PRINCIPAIS:"
echo "   1. Tenta buscar categorias tipo 'subject'"
echo "   2. Se não encontrar, usa todas as categorias sem parent_id"
echo "   3. Fallback para categorias padrão"
echo ""
echo "📂 SUBCATEGORIAS:"
echo "   1. Prioriza 'children' da categoria selecionada"
echo "   2. Se não houver children, busca da API"
echo "   3. Fallback para subcategorias padrão por categoria"
echo ""

echo "🎯 CATEGORIAS ESPERADAS DA API:"
echo ""
echo "📁 Direito (com children):"
echo "   ├── Direito Constitucional"
echo "   ├── Direito Administrativo"
echo "   └── Direito Penal"
echo ""
echo "📁 Matemática (com children):"
echo "   ├── Matemática Financeira"
echo "   ├── Raciocínio Lógico"
echo "   └── Estatística"
echo ""
echo "📁 Português (com children):"
echo "   ├── Gramática"
echo "   ├── Interpretação de Texto"
echo "   └── Redação"
echo ""

echo "🧪 INSTRUÇÕES PARA TESTE:"
echo "========================="
echo ""
echo "1. 🔐 Faça login:"
echo "   Email: admin@studypro.com"
echo "   Senha: Admin@123"
echo ""
echo "2. 🌐 Acesse uma das páginas:"
echo "   • FlashcardManager: $MANAGER_URL"
echo "   • IndividualFlashcards: $INDIVIDUAL_URL"
echo ""
echo "3. 🔍 Abra o Console do Navegador (F12)"
echo ""
echo "4. 📊 Verifique os dropdowns:"
echo "   • Dropdown 1: Deve mostrar categorias principais"
echo "   • Dropdown 2: Inicialmente mostra 'SELECIONE CATEGORIA PRIMEIRO'"
echo ""
echo "5. 🎯 Teste a funcionalidade:"
echo "   • Selecione uma categoria (ex: 'Direito')"
echo "   • Verifique se subcategorias aparecem no segundo dropdown"
echo "   • Observe os logs no console para debug"
echo ""
echo "6. 📝 Logs esperados no console:"
echo "   • 'Category hierarchy received: [...]'"
echo "   • 'Subject categories filtered: [...]'"
echo "   • 'Selected category: {...}'"
echo "   • 'Using children from hierarchy: [...]' (se children existir)"
echo "   • 'No children found, trying API endpoint' (se não existir)"
echo ""

echo "✅ SISTEMA ATUALIZADO:"
echo "====================="
echo ""
echo "🔄 Melhorias implementadas:"
echo "   • Logs detalhados para debug"
echo "   • Prioridade para children da hierarquia"
echo "   • Fallbacks robustos"
echo "   • Mapeamento expandido de categorias padrão"
echo ""
echo "🎯 Agora teste e veja se as subcategorias aparecem!"
echo ""

if command -v curl >/dev/null 2>&1; then
    echo "🌐 VERIFICANDO CONECTIVIDADE:"
    echo ""
    
    # Testar acesso às páginas
    for url in "$MANAGER_URL" "$INDIVIDUAL_URL"; do
        page_name=$(basename "$url")
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
        
        if [ "$response" = "200" ]; then
            echo "✅ $page_name: OK (HTTP $response)"
        else
            echo "❌ $page_name: ERRO (HTTP $response)"
        fi
    done
fi
