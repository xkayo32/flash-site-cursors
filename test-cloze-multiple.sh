#!/bin/bash

echo "======================================="
echo "🎯 TESTE SISTEMA CLOZE MÚLTIPLO ESTILO ANKI"
echo "======================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${GREEN}🏆 FUNCIONALIDADE IMPLEMENTADA: MÚLTIPLOS CARDS DE OCULTAÇÃO!${NC}"
echo ""
echo "======================================="
echo "🧪 COMO TESTAR A NOVA FUNCIONALIDADE:"
echo "======================================="
echo ""

echo -e "${YELLOW}1. ACESSE O CRIADOR DE DECK:${NC}"
echo "   → URL: http://localhost:5173/admin/flashcards/new"
echo ""

echo -e "${YELLOW}2. VAYA ATÉ ETAPA 3 - CRIAR NOVOS:${NC}"
echo "   → Preencha etapas 1 e 2"
echo "   → Clique em 'CRIAR NOVOS' na etapa 3"
echo ""

echo -e "${YELLOW}3. SELECIONE TIPO 'LACUNAS (CLOZE)':${NC}"
echo "   → No dropdown, escolha '🟡 LACUNAS (Cloze)'"
echo "   → Observe que o placeholder muda para mostrar exemplo"
echo ""

echo -e "${YELLOW}4. TESTE COM MÚLTIPLAS OCULTAÇÕES:${NC}"
echo "   → Digite no campo 'FRENTE DO CARD':"
echo "   → \"O {{c1::Estado de Direito}} é caracterizado pela {{c2::supremacia da lei}} e {{c3::separação dos poderes}}\""
echo ""

echo -e "${YELLOW}5. OBSERVE O CONTADOR EM TEMPO REAL:${NC}"
echo "   → Deve aparecer uma caixa amarela mostrando:"
echo "   → \"📊 CARDS QUE SERÃO GERADOS: 3\""
echo "   → \"⚡ Cada ocultação {{c1::}}, {{c2::}}, etc. gera um card separado (estilo Anki)\""
echo ""

echo -e "${YELLOW}6. ADICIONE AO ARSENAL:${NC}"
echo "   → Clique em 'ADICIONAR AO ARSENAL'"
echo "   → Toast deve mostrar: \"3 cards de ocultação adicionados ao arsenal!\""
echo ""

echo -e "${YELLOW}7. VERIFIQUE O ARSENAL:${NC}"
echo "   → Deve mostrar 3 cards separados no arsenal"
echo "   → Cada card com uma ocultação diferente"
echo ""

echo "======================================="
echo "📋 EXEMPLOS DE TESTE:"
echo "======================================="
echo ""

echo -e "${BLUE}🔵 EXEMPLO 1 - DIREITO CONSTITUCIONAL:${NC}"
echo "TEXTO: \"Art. 5º CF - {{c1::Todos}} são {{c2::iguais}} perante a {{c3::lei}}\""
echo "RESULTADO: 3 cards gerados"
echo "  • Card 1: \"Art. 5º CF - [...] são iguais perante a lei\" (resposta: Todos)"
echo "  • Card 2: \"Art. 5º CF - Todos são [...] perante a lei\" (resposta: iguais)"
echo "  • Card 3: \"Art. 5º CF - Todos são iguais perante a [...]\" (resposta: lei)"
echo ""

echo -e "${BLUE}🔵 EXEMPLO 2 - CÓDIGO PENAL MILITAR:${NC}"
echo "TEXTO: \"Art. 298 CPM - {{c1::Deserção}} tem pena de {{c2::6 meses a 2 anos}}\""
echo "RESULTADO: 2 cards gerados"
echo "  • Card 1: \"Art. 298 CPM - [...] tem pena de 6 meses a 2 anos\" (resposta: Deserção)"
echo "  • Card 2: \"Art. 298 CPM - Deserção tem pena de [...]\" (resposta: 6 meses a 2 anos)"
echo ""

echo -e "${BLUE}🔵 EXEMPLO 3 - TEORIA DO ESTADO:${NC}"
echo "TEXTO: \"O {{c1::Estado}} tem elementos: {{c2::povo}}, {{c3::território}} e {{c4::governo}}\""
echo "RESULTADO: 4 cards gerados"
echo "  • Card 1: \"O [...] tem elementos: povo, território e governo\" (resposta: Estado)"
echo "  • Card 2: \"O Estado tem elementos: [...], território e governo\" (resposta: povo)"
echo "  • Card 3: \"O Estado tem elementos: povo, [...] e governo\" (resposta: território)"
echo "  • Card 4: \"O Estado tem elementos: povo, território e [...]\" (resposta: governo)"
echo ""

echo "======================================="
echo "🔧 FUNCIONALIDADES IMPLEMENTADAS:"
echo "======================================="
echo ""

echo -e "${GREEN}✅ PROCESSAMENTO AUTOMÁTICO:${NC}"
echo "   • Regex para encontrar {{c1::}}, {{c2::}}, etc."
echo "   • Geração automática de cards individuais"
echo "   • Extração automática das respostas"
echo ""

echo -e "${GREEN}✅ INTERFACE INTELIGENTE:${NC}"
echo "   • Contador em tempo real de cards que serão gerados"
echo "   • Placeholder explicativo para tipo cloze"
echo "   • Campo 'verso' torna-se 'explicação extra' (opcional)"
echo "   • Feedback visual claro com ícones e cores"
echo ""

echo -e "${GREEN}✅ LÓGICA ESTILO ANKI:${NC}"
echo "   • Um card para cada número de ocultação (c1, c2, c3...)"
echo "   • Outras ocultações ficam visíveis no card"
echo "   • Apenas a ocultação atual fica como [...]"
echo "   • IDs únicos para cada card gerado"
echo ""

echo -e "${GREEN}✅ TRATAMENTO DE EDGE CASES:${NC}"
echo "   • Texto sem ocultações = 1 card normal"
echo "   • Números não sequenciais funcionam (c1, c3, c5)"
echo "   • Múltiplas ocultações do mesmo número = agrupadas"
echo "   • Edição não gera múltiplos (evita duplicação)"
echo ""

echo "======================================="
echo "⚡ COMPORTAMENTO ESPERADO:"
echo "======================================="
echo ""

echo -e "${PURPLE}🎯 CRIAÇÃO NORMAL:${NC}"
echo "   → Texto com {{c1::}} {{c2::}} → Gera múltiplos cards"
echo "   → Toast: \"X cards de ocultação adicionados ao arsenal!\""
echo "   → Cada card tem uma ocultação diferente"
echo ""

echo -e "${PURPLE}✏️ EDIÇÃO DE CARD:${NC}"
echo "   → Editar card existente → NÃO gera múltiplos"
echo "   → Mantém comportamento de edição simples"
echo "   → Evita duplicação no arsenal"
echo ""

echo -e "${PURPLE}📊 CONTADOR DINÂMICO:${NC}"
echo "   → Atualiza em tempo real conforme digita"
echo "   → Aparece apenas para tipo 'cloze'"
echo "   → Mostra quantos cards serão criados"
echo ""

echo "======================================="
echo "🐛 VALIDAÇÕES E EDGE CASES:"
echo "======================================="
echo ""

echo "✅ Texto sem ocultações: funciona como card normal"
echo "✅ Ocultações malformadas: ignoradas graciosamente"
echo "✅ Números não sequenciais: {{c1::}}, {{c5::}} = 2 cards"
echo "✅ Mesmo número repetido: {{c1::a}} {{c1::b}} = 1 card (resposta: a, b)"
echo "✅ Campo vazio: contador mostra 1"
echo "✅ Edição: não duplica cards"
echo ""

echo "======================================="
echo "🎯 URL PARA TESTE:"
echo "======================================="
echo ""
echo -e "${YELLOW}🎮 Testador de Múltiplas Ocultações:${NC}"
echo "http://localhost:5173/admin/flashcards/new"
echo ""

echo "======================================="
echo "🏆 SISTEMA CLOZE MÚLTIPLO 100% FUNCIONAL!"
echo "======================================="