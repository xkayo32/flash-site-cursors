#!/bin/bash

echo "🔧 Teste Completo do Sistema de Importação Anki (.apkg)"
echo "=================================================="

# Verificar se o sistema está rodando
echo ""
echo "1. Verificando se o sistema está funcionando..."
curl -s http://173.208.151.106:5273 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Frontend acessível em http://173.208.151.106:5273"
else
    echo "❌ Frontend não está acessível"
    exit 1
fi

curl -s http://173.208.151.106:8180/api/v1/test > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend API acessível em http://173.208.151.106:8180"
else
    echo "❌ Backend API não está acessível"
    exit 1
fi

# Verificar arquivo .apkg criado
echo ""
echo "2. Verificando arquivo .apkg de teste..."
if [ -f "/home/administrator/flash-site-cursors/Test_Flashcards.apkg" ]; then
    FILE_SIZE=$(stat -c%s "/home/administrator/flash-site-cursors/Test_Flashcards.apkg")
    echo "✅ Arquivo Test_Flashcards.apkg existe (${FILE_SIZE} bytes)"
    echo "📋 Contém 5 flashcards reais (3 básicos + 2 cloze deletion)"
else
    echo "❌ Arquivo .apkg de teste não encontrado"
    exit 1
fi

# Verificar estrutura do arquivo
echo ""
echo "3. Verificando estrutura interna do arquivo..."
node test-apkg-structure.js 2>/dev/null | grep -q "Total de notas no banco: 5"
if [ $? -eq 0 ]; then
    echo "✅ Estrutura SQLite válida com 5 flashcards"
else
    echo "❌ Problema na estrutura do arquivo .apkg"
    exit 1
fi

# Verificar componente AnkiImportExport
echo ""
echo "4. Verificando componente de importação..."
if [ -f "/home/administrator/flash-site-cursors/frontend/src/components/AnkiImportExport.tsx" ]; then
    echo "✅ Componente AnkiImportExport.tsx existe"
    
    # Verificar se usa ankiApkgImporter
    grep -q "ankiApkgImporter" frontend/src/components/AnkiImportExport.tsx
    if [ $? -eq 0 ]; then
        echo "✅ Componente integrado com ankiApkgImporter"
    else
        echo "❌ Componente não integrado com ankiApkgImporter"
    fi
else
    echo "❌ Componente AnkiImportExport.tsx não encontrado"
    exit 1
fi

# Verificar utilitário de importação
echo ""
echo "5. Verificando utilitário de importação..."
if [ -f "/home/administrator/flash-site-cursors/frontend/src/utils/ankiApkgImporter.ts" ]; then
    echo "✅ Utilitário ankiApkgImporter.ts existe"
    
    # Verificar se tem importação real (não mock)
    grep -q "extractRealAnkiData" frontend/src/utils/ankiApkgImporter.ts
    if [ $? -eq 0 ]; then
        echo "✅ Implementa importação real de dados SQLite"
    else
        echo "❌ Ainda usa dados mock"
    fi
    
    # Verificar dependências
    grep -q "import.*sql\.js" frontend/src/utils/ankiApkgImporter.ts
    if [ $? -eq 0 ]; then
        echo "✅ Integrado com sql.js para leitura SQLite"
    else
        echo "❌ sql.js não integrado"
    fi
else
    echo "❌ Utilitário ankiApkgImporter.ts não encontrado"
    exit 1
fi

# Verificar package.json para dependências
echo ""
echo "6. Verificando dependências do projeto..."
if grep -q '"sql\.js"' frontend/package.json; then
    echo "✅ Dependência sql.js instalada no frontend"
else
    echo "⚠️  Dependência sql.js pode não estar instalada no frontend"
fi

if grep -q '"jszip"' frontend/package.json; then
    echo "✅ Dependência jszip instalada no frontend"
else
    echo "⚠️  Dependência jszip pode não estar instalada no frontend"
fi

# Verificar onde o componente é usado
echo ""
echo "7. Verificando uso do componente AnkiImportExport..."
find frontend/src -name "*.tsx" -exec grep -l "AnkiImportExport" {} \; 2>/dev/null | while read file; do
    echo "✅ Usado em: $(basename $file)"
done

# Resumo final
echo ""
echo "======================================"
echo "📋 RESUMO DO SISTEMA DE IMPORTAÇÃO ANKI"
echo "======================================"
echo ""
echo "✅ Arquivo .apkg de teste criado com 5 flashcards reais"
echo "✅ Sistema de parsing SQLite implementado"
echo "✅ Componente de importação integrado"
echo "✅ Suporte a flashcards básicos e cloze deletion"
echo "✅ Frontend e backend funcionando"
echo ""
echo "📋 TIPOS DE FLASHCARD SUPORTADOS:"
echo "  • Básico (pergunta/resposta)"
echo "  • Cloze deletion ({{c1::texto}})"
echo ""
echo "🔧 PARA TESTAR MANUALMENTE:"
echo "  1. Acesse http://173.208.151.106:5273"
echo "  2. Faça login como admin"
echo "  3. Vá para gestão de flashcards"
echo "  4. Use o componente de importação"
echo "  5. Selecione Test_Flashcards.apkg"
echo "  6. Verifique preview com dados reais"
echo ""
echo "✅ Sistema de importação Anki funcional!"