#!/bin/bash

echo "🔍 VERIFICANDO DADOS HARDCODED NO ADMIN"
echo "========================================"
echo ""

# Diretório do admin
ADMIN_DIR="/home/administrator/flash-site-cursors/frontend/src/pages/admin"

echo "📋 VERIFICANDO FLASHCARDS/DECKS HARDCODED:"
echo ""

# Buscar por mock data
echo "1. Arquivos com 'mock' data:"
grep -l "mock[A-Z]\|mockData\|mockCards\|mockDeck" $ADMIN_DIR/*.tsx 2>/dev/null | while read file; do
    filename=$(basename "$file")
    echo "   ❌ $filename"
    grep -n "const.*mock" "$file" | head -3 | sed 's/^/      Linha /'
done

echo ""
echo "2. Arquivos com arrays hardcoded de flashcards/decks:"
grep -l "const.*\(flashcards\|decks\|cards\).*=.*\[" $ADMIN_DIR/*.tsx 2>/dev/null | while read file; do
    filename=$(basename "$file")
    # Verificar se é realmente hardcoded (tem objetos dentro)
    if grep -q "const.*\(flashcards\|decks\|cards\).*=.*\[\s*{" "$file"; then
        echo "   ❌ $filename"
        grep -n "const.*\(flashcards\|decks\|cards\).*=.*\[" "$file" | head -1 | sed 's/^/      Linha /'
    fi
done

echo ""
echo "3. Arquivos com dados de exemplo/sample:"
grep -l "sample\|example\|dummy\|fake" $ADMIN_DIR/*.tsx 2>/dev/null | while read file; do
    filename=$(basename "$file")
    if grep -q "const.*\(sample\|example\|dummy\|fake\)" "$file"; then
        echo "   ⚠️  $filename"
        grep -n "const.*\(sample\|example\|dummy\|fake\)" "$file" | head -1 | sed 's/^/      Linha /'
    fi
done

echo ""
echo "📊 RESUMO DOS ARQUIVOS PROBLEMÁTICOS:"
echo ""

# FlashcardEditor.tsx tem mock data confirmado
if [ -f "$ADMIN_DIR/FlashcardEditor.tsx" ]; then
    if grep -q "mockDeck\|mockCards" "$ADMIN_DIR/FlashcardEditor.tsx"; then
        echo "❌ FlashcardEditor.tsx - CONTÉM mockDeck e mockCards"
    fi
fi

echo ""
echo "✅ ARQUIVOS LIMPOS (usando APIs):"
echo ""

# Listar arquivos que usam a API corretamente
for file in $ADMIN_DIR/*Flashcard*.tsx $ADMIN_DIR/*Deck*.tsx; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        if grep -q "flashcardService\|deckService" "$file" 2>/dev/null; then
            if ! grep -q "const.*mock\|const.*\(flashcards\|decks\|cards\).*=.*\[\s*{" "$file"; then
                echo "   ✅ $filename - Usa flashcardService/API"
            fi
        fi
    fi
done

echo ""
echo "🎯 AÇÃO NECESSÁRIA:"
echo ""

if grep -q "mockDeck\|mockCards" "$ADMIN_DIR/FlashcardEditor.tsx" 2>/dev/null; then
    echo "⚠️  Os seguintes arquivos precisam ser corrigidos:"
    echo "   - FlashcardEditor.tsx (mockDeck e mockCards)"
    echo ""
    echo "📝 Recomendação: Remover dados mockados e usar flashcardService"
else
    echo "✅ Nenhum arquivo com dados hardcoded encontrado!"
fi
