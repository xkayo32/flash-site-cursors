#!/bin/bash

echo "🧹 LIMPEZA COMPLETA - DECKS E FLASHCARDS"
echo "======================================="
echo ""

# Definir caminhos dos arquivos
BACKEND_DATA="/home/administrator/flash-site-cursors/backend-node/data"
FLASHCARDS_FILE="$BACKEND_DATA/flashcards.json"
FLASHCARD_DECKS_FILE="$BACKEND_DATA/flashcard-decks.json"

echo "📂 Verificando arquivos de dados..."

# Verificar se os arquivos existem
if [ ! -f "$FLASHCARDS_FILE" ]; then
    echo "❌ Arquivo flashcards.json não encontrado em: $FLASHCARDS_FILE"
    exit 1
fi

if [ ! -f "$FLASHCARD_DECKS_FILE" ]; then
    echo "❌ Arquivo flashcard-decks.json não encontrado em: $FLASHCARD_DECKS_FILE"
    exit 1
fi

echo "✅ Arquivos encontrados!"
echo ""

# Mostrar contagem atual
echo "📊 CONTAGEM ATUAL:"
CURRENT_FLASHCARDS=$(jq 'length' "$FLASHCARDS_FILE" 2>/dev/null || echo "0")
CURRENT_DECKS=$(jq 'length' "$FLASHCARD_DECKS_FILE" 2>/dev/null || echo "0")
echo "   📚 Flashcards: $CURRENT_FLASHCARDS"
echo "   📦 Decks: $CURRENT_DECKS"
echo ""

# Fazer backup dos arquivos antes de limpar
echo "💾 Criando backup dos arquivos..."
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/home/administrator/flash-site-cursors/backup_$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

cp "$FLASHCARDS_FILE" "$BACKUP_DIR/flashcards_backup.json"
cp "$FLASHCARD_DECKS_FILE" "$BACKUP_DIR/flashcard-decks_backup.json"

echo "✅ Backup criado em: $BACKUP_DIR"
echo ""

# Limpar os arquivos (deixar como array vazio)
echo "🧹 Limpando flashcards..."
echo "[]" > "$FLASHCARDS_FILE"

echo "🧹 Limpando decks..."
echo "[]" > "$FLASHCARD_DECKS_FILE"

echo ""
echo "✅ LIMPEZA CONCLUÍDA!"
echo ""

# Verificar se foram limpos
FINAL_FLASHCARDS=$(jq 'length' "$FLASHCARDS_FILE" 2>/dev/null || echo "0")
FINAL_DECKS=$(jq 'length' "$FLASHCARD_DECKS_FILE" 2>/dev/null || echo "0")

echo "📊 CONTAGEM FINAL:"
echo "   📚 Flashcards: $FINAL_FLASHCARDS"
echo "   📦 Decks: $FINAL_DECKS"
echo ""

if [ "$FINAL_FLASHCARDS" -eq 0 ] && [ "$FINAL_DECKS" -eq 0 ]; then
    echo "🎉 SUCESSO! Todos os flashcards e decks foram removidos."
else
    echo "⚠️  ATENÇÃO! Algo pode ter dado errado na limpeza."
fi

echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "   1. Acesse http://173.208.151.106:5273/admin/flashcards"
echo "   2. Verifique se a página está vazia"
echo "   3. Teste criar novos flashcards/decks"
echo ""
echo "🔄 Para restaurar os dados (se necessário):"
echo "   cp $BACKUP_DIR/flashcards_backup.json $FLASHCARDS_FILE"
echo "   cp $BACKUP_DIR/flashcard-decks_backup.json $FLASHCARD_DECKS_FILE"