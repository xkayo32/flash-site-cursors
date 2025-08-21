#!/bin/bash

echo "🎯 TESTE: Verificando posição do botão de salvar"
echo "================================================================"

# Verificar se o frontend está rodando
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)

if [ "$FRONTEND_STATUS" == "200" ]; then
  echo "✅ Frontend está rodando em http://localhost:5173"
  echo ""
  echo "📍 Páginas para verificar o botão no final do formulário:"
  echo "   1. Individual: http://localhost:5173/admin/flashcards/cards/new"
  echo "   2. Deck: http://localhost:5173/admin/flashcards/decks/new"
  echo ""
  echo "🔍 O que verificar:"
  echo "   - O botão 'SALVAR FLASHCARD' deve estar no FINAL do formulário"
  echo "   - Deve aparecer após todos os campos"
  echo "   - Deve estar após a seção 'CAMPOS EXTRAS (OPCIONAL)'"
  echo "   - Deve ter destaque visual (cor amarela, tamanho grande)"
else
  echo "⚠️  Frontend não está rodando. Inicie com: cd frontend && npm run dev"
fi

echo ""
echo "================================================================"
echo "✨ Mudanças implementadas:"
echo "✅ Botão movido do header para o final do formulário"
echo "✅ Tamanho aumentado (size='lg' e padding extra)"
echo "✅ Texto mais claro: 'SALVAR FLASHCARD'"
echo "✅ Ícone de loading ao salvar"
echo "================================================================"
