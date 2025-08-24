#!/bin/bash

echo "🧪 TESTE DE CARREGAMENTO JSZip"
echo "=============================="
echo ""

if ! curl -s http://localhost:5173 > /dev/null; then
    echo "❌ ERRO: Frontend não está rodando em localhost:5173"
    exit 1
fi

echo "✅ Frontend rodando em http://localhost:5173"
echo ""

echo "🔍 Testando carregamento dos arquivos JSZip:"
echo ""

# Teste 1: Verificar se ankiApkgImporter.ts carrega
echo "📁 Testando ankiApkgImporter.ts..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173/src/utils/ankiApkgImporter.ts")
if [ "$RESPONSE" = "200" ]; then
    echo "✅ ankiApkgImporter.ts: OK (HTTP $RESPONSE)"
else
    echo "❌ ankiApkgImporter.ts: ERRO (HTTP $RESPONSE)"
fi

# Teste 2: Verificar se ankiApkgExporter.ts carrega
echo "📁 Testando ankiApkgExporter.ts..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173/src/utils/ankiApkgExporter.ts")
if [ "$RESPONSE" = "200" ]; then
    echo "✅ ankiApkgExporter.ts: OK (HTTP $RESPONSE)"
else
    echo "❌ ankiApkgExporter.ts: ERRO (HTTP $RESPONSE)"
fi

echo ""
echo "🔧 Testando acesso às páginas principais:"
echo ""

# Teste 3: Página de login
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173/login")
echo "🔐 Login: HTTP $RESPONSE"

# Teste 4: Página principal
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173/")
echo "🏠 Homepage: HTTP $RESPONSE"

echo ""
echo "📋 Se todos os testes retornaram HTTP 200, o sistema está funcionando!"
echo "📋 Se há erros HTTP 500, verifique o console do navegador para mais detalhes"
echo ""
echo "🎯 Para testar completamente, acesse:"
echo "   http://localhost:5173/login"
echo "   Faça login e vá para as páginas de flashcards"