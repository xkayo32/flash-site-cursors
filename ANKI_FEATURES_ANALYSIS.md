# Análise das Funcionalidades do Anki para Implementação

## 📋 Funcionalidades Principais do Anki

### 1. **Editor de Cloze Deletion**
- **Interface Visual**: Selecionar texto e clicar botão `[...]` para criar ocultação
- **Atalhos de Teclado**: Ctrl+Shift+C para criar cloze
- **Sintaxe**: `{{c1::texto}}` ou `{{c1::texto::dica}}`
- **Múltiplas Ocultações**: c1, c2, c3... geram cards separados
- **Nested Clozes**: Suporte a ocultações aninhadas (3-8 níveis)
- **Dicas**: `{{c1::resposta::dica}}` mostra dica no lugar de [...]

### 2. **Campos Extras**
- **Campo Extra**: Informações adicionais mostradas na resposta
- **Campo Header**: Cabeçalho opcional (para contexto)
- **Campo Comments**: Notas privadas (não aparecem no estudo)
- **Campos Customizáveis**: Adicionar/remover campos conforme necessário
- **Sticky Fields**: Campos que mantêm conteúdo ao criar novo card

### 3. **Suporte a Imagens**
- **Upload Direto**: Arrastar e soltar ou colar imagens
- **Image Occlusion**: Ocultar partes de imagens com formas
- **Formatos**: JPG, PNG, GIF, SVG
- **Redimensionamento**: Ajustar tamanho das imagens
- **Múltiplas Imagens**: Suporte a várias imagens por card

### 4. **Editor Rich Text**
- **Formatação**: Negrito, itálico, sublinhado, cores
- **Listas**: Ordenadas e não ordenadas
- **Alinhamento**: Esquerda, centro, direita, justificado
- **HTML**: Edição direta do HTML
- **MathJax/LaTeX**: Fórmulas matemáticas
- **Áudio**: Gravação e anexo de áudio

### 5. **Tipos de Flashcards no Anki**
1. **Basic**: Frente e verso simples
2. **Basic (reversed)**: Cria automaticamente card reverso
3. **Cloze**: Ocultação de texto
4. **Image Occlusion**: Ocultação em imagens
5. **Type in the answer**: Digite a resposta

## 🎯 Funcionalidades para Implementar

### Fase 1: Editor Visual de Cloze
- [ ] Botão para selecionar texto e marcar como cloze
- [ ] Preview em tempo real das ocultações
- [ ] Contador de cards que serão gerados
- [ ] Suporte a dicas opcionais
- [ ] Atalhos de teclado

### Fase 2: Campos Extras
- [ ] Campo "Extra" para informações adicionais
- [ ] Campo "Header" para contexto
- [ ] Campo "Tags" melhorado
- [ ] Campo "Source" para fonte/referência
- [ ] Sticky fields (manter conteúdo)

### Fase 3: Suporte a Imagens
- [ ] Upload de imagens drag & drop
- [ ] Colar imagens da área de transferência
- [ ] Preview de imagens
- [ ] Redimensionamento básico
- [ ] Suporte a múltiplas imagens

### Fase 4: Editor Rich Text
- [ ] Toolbar de formatação
- [ ] Negrito, itálico, sublinhado
- [ ] Cores de texto
- [ ] Listas
- [ ] Links

## 🔧 Implementação Proposta

### 1. **ClozeEditor Component**
```typescript
interface ClozeEditorProps {
  value: string;
  onChange: (value: string, cardCount: number) => void;
  placeholder?: string;
}

// Features:
- Seleção visual de texto
- Botão "Marcar como Cloze"
- Auto-numeração (c1, c2, c3...)
- Preview lado a lado
- Desfazer/Refazer
```

### 2. **Estrutura de Dados Expandida**
```typescript
interface EnhancedFlashcard {
  // Campos básicos
  id: string;
  type: FlashcardType;
  front: string;
  back: string;
  
  // Campos extras
  extra?: string;      // Informações adicionais
  header?: string;     // Contexto/cabeçalho
  source?: string;     // Fonte/referência
  comments?: string;   // Notas privadas
  
  // Mídia
  images?: string[];   // URLs das imagens
  audio?: string;      // URL do áudio
  
  // Metadados
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  category: string;
  
  // Cloze específico
  clozeNumber?: number;
  originalText?: string;
}
```

### 3. **UI/UX Melhorias**
- Editor visual intuitivo
- Drag & drop para imagens
- Preview em tempo real
- Atalhos de teclado
- Tooltips explicativos

## 📊 Comparação: Sistema Atual vs Anki

| Funcionalidade | Sistema Atual | Anki | A Implementar |
|---------------|--------------|------|---------------|
| Cloze básico | ✅ {{c1::texto}} | ✅ | - |
| Múltiplos cards | ✅ Implementado | ✅ | - |
| Editor visual | ❌ Texto puro | ✅ Botões | ✅ Próximo |
| Dicas em cloze | ❌ | ✅ ::dica | ✅ Próximo |
| Campo Extra | ❌ | ✅ | ✅ Próximo |
| Imagens | ❌ | ✅ | ✅ Fase 3 |
| Image Occlusion | ❌ | ✅ | 🔄 Futuro |
| Rich Text | ❌ | ✅ | ✅ Fase 4 |
| Áudio | ❌ | ✅ | 🔄 Futuro |
| LaTeX/MathJax | ❌ | ✅ | 🔄 Futuro |

## 🚀 Próximos Passos

1. **Implementar ClozeEditor component** com seleção visual
2. **Adicionar campos extras** (Extra, Header, Source)
3. **Implementar upload de imagens**
4. **Adicionar formatação rich text básica**
5. **Integrar em ambos**: NewFlashcardDeck e NewFlashcard

## 📝 Notas de Implementação

- Manter compatibilidade com sistema atual
- Interface militar/tática do tema
- Performance com muitos flashcards
- Responsividade mobile
- Acessibilidade (ARIA labels)