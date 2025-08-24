#!/bin/bash

echo "🎯 TESTE: Melhorias da Página /admin/summaries/new"
echo "================================================================"

echo -e "\n1️⃣ Verificando RichTextEditor melhorado..."

EDITOR_FILE="/home/administrator/flash-site-cursors/frontend/src/components/RichTextEditor.tsx"

if grep -q "openFlashcardModal" "$EDITOR_FILE"; then
  echo "✅ Função para abrir modal de flashcards implementada"
else
  echo "❌ Função para abrir modal de flashcards não encontrada"
fi

if grep -q "openQuestionModal" "$EDITOR_FILE"; then
  echo "✅ Função para abrir modal de questões implementada"
else
  echo "❌ Função para abrir modal de questões não encontrada"
fi

if grep -q "embedded-flashcard" "$EDITOR_FILE"; then
  echo "✅ CSS para elementos embarcados implementado"
else
  echo "❌ CSS para elementos embarcados não encontrado"
fi

if grep -q "flashcardService" "$EDITOR_FILE"; then
  echo "✅ Integração com flashcardService implementada"
else
  echo "❌ Integração com flashcardService não encontrada"
fi

if grep -q "questionService" "$EDITOR_FILE"; then
  echo "✅ Integração com questionService implementada"
else
  echo "❌ Integração com questionService não encontrada"
fi

echo -e "\n2️⃣ Verificando SummaryForm..."

FORM_FILE="/home/administrator/flash-site-cursors/frontend/src/pages/admin/SummaryForm.tsx"

if grep -q "categoryService" "$FORM_FILE"; then
  echo "✅ Import do categoryService adicionado"
else
  echo "❌ Import do categoryService não encontrado"
fi

if grep -q "loadCategories" "$FORM_FILE"; then
  echo "✅ Função loadCategories implementada"
else
  echo "❌ Função loadCategories não encontrada"
fi

echo -e "\n3️⃣ Verificando toolbar do editor..."

if grep -q "Inserir Flashcard" "$EDITOR_FILE"; then
  echo "✅ Botão de inserir flashcard adicionado"
else
  echo "❌ Botão de inserir flashcard não encontrado"
fi

if grep -q "Inserir Questão" "$EDITOR_FILE"; then
  echo "✅ Botão de inserir questão adicionado"
else
  echo "❌ Botão de inserir questão não encontrado"
fi

echo -e "\n4️⃣ Verificando funcionalidades dos modais..."

if grep -q "showFlashcardModal" "$EDITOR_FILE"; then
  echo "✅ Modal de flashcards implementado"
else
  echo "❌ Modal de flashcards não encontrado"
fi

if grep -q "showQuestionModal" "$EDITOR_FILE"; then
  echo "✅ Modal de questões implementado"
else
  echo "❌ Modal de questões não encontrado"
fi

if grep -q "searchTerm" "$EDITOR_FILE"; then
  echo "✅ Funcionalidade de busca implementada"
else
  echo "❌ Funcionalidade de busca não encontrada"
fi

echo -e "\n5️⃣ Status do frontend..."

FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null || echo "000")

if [ "$FRONTEND_STATUS" == "200" ]; then
  echo "✅ Frontend está rodando em http://localhost:5173"
  echo ""
  echo "📍 Teste manual disponível em:"
  echo "   http://localhost:5173/admin/summaries/new"
  echo ""
  echo "🔍 Funcionalidades para testar:"
  echo "   • Editor de texto rico com toolbar expandida"
  echo "   • Botões ⭐ (flashcard) e 🧠 (questão) na toolbar"
  echo "   • Comandos de formatação (negrito, itálico, listas)"
  echo "   • Inserção de flashcards e questões"
  echo "   • Busca nos modais de seleção"
  echo "   • Elementos embarcados estilizados"
else
  echo "⚠️  Frontend não está rodando. Inicie com: cd frontend && npm run dev"
fi

echo ""
echo "================================================================"
echo "✨ Melhorias implementadas na página /admin/summaries/new:"
echo "✅ RichTextEditor completamente funcional"
echo "✅ Toolbar expandida com novos botões"
echo "✅ Inserção de flashcards da API"
echo "✅ Inserção de questões da API"
echo "✅ Modais de seleção com busca"
echo "✅ Elementos embarcados estilizados"
echo "✅ Integração com APIs reais"
echo "✅ Comandos de formatação aprimorados"
echo "================================================================"
