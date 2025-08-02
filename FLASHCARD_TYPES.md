# 📚 Tipos de Flashcards - Sistema Tático

O sistema de flashcards implementado oferece **7 tipos diferentes** de cartões, inspirados no Anki, adaptados para o contexto militar/policial.

## 🎯 Tipos Disponíveis

### 1. **BÁSICO (FRENTE/VERSO)**
- **Tipo**: `basic`
- **Descrição**: Cartão tradicional com pergunta e resposta
- **Exemplo**:
  - **Frente**: "Art. 9º CPM - Crime militar em tempo de paz"
  - **Verso**: "Consideram-se crimes militares, em tempo de paz: I - os crimes previstos neste Código..."

### 2. **BÁSICO INVERTIDO**
- **Tipo**: `basic_reversed`
- **Descrição**: Gera automaticamente cartão inverso (frente ↔ verso)
- **Exemplo**:
  - **Frente**: "Deserção"
  - **Verso**: "Art. 298 CPM"
  - **Extra**: "Ausentar-se o militar, sem licença, da unidade..."

### 3. **LACUNAS (CLOZE)**
- **Tipo**: `cloze`
- **Descrição**: Texto com lacunas para preencher usando sintaxe `{{c1::palavra}}`
- **Exemplo**:
  - **Texto**: "Art. 301 CPM - {{c1::Abandonar}}, sem ordem superior, o {{c2::posto}} ou lugar de serviço que lhe tenha sido {{c3::designado}}.\nPena - detenção, de {{c4::três meses a um ano}}"
  - **Visualização**: Mostra lacunas como `___` e revela as palavras quando solicitado

### 4. **MÚLTIPLA ESCOLHA**
- **Tipo**: `multiple_choice`
- **Descrição**: Questão com 4 alternativas (A, B, C, D)
- **Exemplo**:
  - **Pergunta**: "Qual a pena para deserção no CPM?"
  - **Alternativas**: 
    - A) Detenção de 1 a 3 anos
    - B) Detenção de 6 meses a 2 anos ✓
    - C) Reclusão de 2 a 8 anos
    - D) Prisão de 15 dias a 6 meses
  - **Explicação**: "Art. 298 CPM - Pena: detenção, de seis meses a dois anos"

### 5. **VERDADEIRO/FALSO**
- **Tipo**: `true_false`
- **Descrição**: Afirmação para avaliar como verdadeira ou falsa
- **Exemplo**:
  - **Afirmação**: "O abandono de posto no CPM tem pena de detenção de 3 meses a 1 ano."
  - **Resposta**: VERDADEIRO ✓
  - **Explicação**: "Correto. Art. 301 CPM estabelece pena de detenção, de três meses a um ano."

### 6. **DIGITE A RESPOSTA**
- **Tipo**: `type_answer`
- **Descrição**: Requer digitação exata da resposta
- **Exemplo**:
  - **Pergunta**: "Complete o artigo: 'Art. 9º CPM - Consideram-se crimes militares, em tempo de...'"
  - **Resposta**: "paz"
  - **Dica**: "Oposto de guerra"

### 7. **OCLUSÃO DE IMAGEM** ✅ (IMPLEMENTADO!)
- **Tipo**: `image_occlusion`
- **Descrição**: Imagem com áreas ocultas para identificar progressivamente
- **Exemplo**: Hierarquia militar com postos e distintivos ocultos
- **Status**: ✅ Totalmente funcional

**Funcionalidades:**
- 🎨 Editor visual drag & drop intuitivo
- 📐 Desenho de retângulos e círculos
- 🔄 Movimentação e redimensionamento de áreas
- 📍 Navegação sequencial entre áreas ocultas
- 👁️ Opção de revelar todas as respostas
- 📤 Upload de imagens ou uso de exemplos
- 💾 Suporte para múltiplas áreas por imagem

**Como funciona:**
1. **Criação**: Use o editor para marcar áreas na imagem e adicionar respostas
2. **Estudo**: Navegue por cada área oculta tentando lembrar o conteúdo
3. **Revisão**: Veja o progresso e repita áreas difíceis

## 🛠️ Recursos Técnicos

### **Criação de Cartões**
- Formulário dinâmico que adapta campos conforme o tipo selecionado
- Validação específica para cada tipo
- Preview em tempo real

### **Visualização**
- Modo preview interativo com navegação entre cartões
- Renderização específica para cada tipo
- Botão "Mostrar/Ocultar Resposta"

### **Funcionalidades Avançadas**
- **Busca inteligente**: Pesquisa em todos os campos do cartão
- **Filtros**: Por dificuldade e tipo
- **Edição inline**: Editar cartões diretamente na lista
- **Ações em lote**: Selecionar múltiplos cartões
- **Tags**: Sistema de etiquetas para organização
- **Estatísticas**: Taxa de acerto, revisões, progresso

## 🎨 Tema Militar/Policial

### **Terminologia Adaptada**
- "CARTÃO TÁTICO" ao invés de "Flashcard"
- "BARALHO OPERACIONAL" ao invés de "Deck"
- "CENTRAL TÁTICA" para área de gerenciamento
- Fontes especializadas: police-title, police-subtitle, police-body

### **Exemplos de Conteúdo**
- **Direito**: Código Penal Militar, Legislação Policial
- **Segurança Pública**: Procedimentos Operacionais, Táticas
- **Conhecimentos Gerais**: História Militar, Geografia Estratégica

### **Dificuldades**
- **FÁCIL**: Conceitos básicos
- **MÉDIO**: Aplicação prática
- **DIFÍCIL**: Situações complexas e análise crítica

## 📊 Análise Comparativa com Anki

| Recurso | Anki | Sistema Tático |
|---------|------|----------------|
| Basic | ✅ | ✅ |
| Basic Reversed | ✅ | ✅ |
| Cloze | ✅ | ✅ |
| Multiple Choice | 🔌 (Add-on) | ✅ Nativo |
| True/False | 🔌 (Add-on) | ✅ Nativo |
| Type Answer | ✅ | ✅ |
| Image Occlusion | 🔌 (Add-on) | ✅ Nativo |
| Tema Militar | ❌ | ✅ |
| Interface PT-BR | ✅ | ✅ |

## 🚀 Exemplos de Uso

### **Para Concursos Policiais**
```javascript
// Cloze - Artigos da CF/88
"Art. 5º da CF/88 - Todos são {{c1::iguais}} perante a {{c2::lei}}, sem distinção de qualquer natureza..."

// Multiple Choice - Procedimentos
"Pergunta": "Em uma abordagem policial, o primeiro procedimento é:",
"Alternativas": ["Identificar-se", "Pedir documentos", "Revistar", "Algemar"]
```

### **Para Treinamento Operacional**
```javascript
// True/False - Protocolos
"Afirmação": "É obrigatório o uso de algemas em todos os tipos de prisão."
"Resposta": false
"Explicação": "Algemas devem ser usadas apenas quando necessário para segurança."
```

### **Para Estudos Jurídicos**
```javascript
// Type Answer - Prazos
"Pergunta": "Prazo para oferecimento de denúncia com réu preso:"
"Resposta": "5 dias"
"Dica": "Réu preso tem prazo menor"
```

## 🔄 Algoritmo de Repetição Espaçada

Embora implementado como demonstração, o sistema está preparado para:
- **Intervalos adaptativos** baseados na dificuldade
- **Taxa de acerto** individual por cartão
- **Agenda de revisões** otimizada
- **Análise de performance** detalhada

## 📱 Interface Responsiva

- **Desktop**: Layout completo com todas as funcionalidades
- **Tablet**: Interface adaptada mantendo usabilidade
- **Mobile**: Versão otimizada para estudo móvel
- **PWA Ready**: Preparado para aplicativo offline