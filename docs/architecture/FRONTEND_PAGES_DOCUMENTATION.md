# Documentação das Páginas Frontend - StudyPro

## Visão Geral

O sistema StudyPro é uma plataforma de estudos para concursos policiais e militares com tema tático/militar completo. Utiliza React + TypeScript + Vite com design system militar, estado gerenciado via Zustand, animações Framer Motion e terminologia militar ("OPERAÇÕES", "ARSENAIS", "COMANDO TÁTICO", etc.).

### Tecnologias
- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui components
- **Estado**: Zustand com persist middleware
- **Animações**: Framer Motion
- **Roteamento**: React Router v6
- **Design**: Tema militar/tático monocromático

### Cores e Design System
- **Primárias**: Black (#000000), White (#FFFFFF)
- **Base Militar**: #14242f (tactical blue-gray)
- **Accent**: #facc15 (tactical yellow)
- **Fontes**: Orbitron (títulos), Rajdhani (subtítulos/corpo), Exo 2 (números)

---

## Páginas de Administrador

### AdminDashboard.tsx - `/admin/dashboard`
**Propósito**: Painel central de comando para administradores com visão geral completa do sistema.

**Funcionalidades**:
- Dashboard com estatísticas táticas em tempo real
- Cards de métricas: "TROPAS ATIVAS", "MISSÕES OPERACIONAIS", "ARSENAL TÁTICO", "RECEITA OPERACIONAL"
- Lista de usuários recentes com status e planos
- Central de alertas táticos do sistema
- Tabela de conteúdo recente (cursos, questões, flashcards)

**Botões e Ações**:
- **Selector de período**: 7 dias, 30 dias, 90 dias
- **Ações rápidas**: NOVO RECRUTA, NOVA MISSÃO, NOVO ARSENAL, RELATÓRIO TÁTICO
- **Ver Todos**: Para usuários e alertas
- **Filtrar/Buscar**: Para conteúdo
- **Botões de linha**: Visualizar, Editar, Excluir conteúdo

**Recursos Especiais**:
- Background pattern tático com listras diagonais
- Animações Framer Motion com delay progressivo
- Tactical stripes e corner accents
- Ícones táticos personalizados
- Cards com hover effects e gradientes

---

### CategoryManager.tsx - `/admin/categories`
**Propósito**: Gerenciamento hierárquico de categorias do sistema (Matérias, Assuntos, Bancas, Anos).

**Funcionalidades**:
- Sistema de abas para 4 tipos: Matérias, Assuntos, Bancas, Anos
- Árvore hierárquica expansível para matérias/assuntos
- Contadores de conteúdo por categoria (questões, flashcards, resumos, cursos)
- Busca em tempo real
- Cards de estatísticas por tipo

**Botões e Ações**:
- **Nova Categoria**: Modal de criação
- **Editar/Excluir**: Para cada categoria
- **Expandir/Recolher**: Árvore hierárquica
- **Abas de filtro**: Subject, Topic, Exam Board, Year
- **Busca**: Campo de texto com filtro

**Filtros e Controles**:
- Busca por nome e descrição
- Filtro por tipo de categoria
- Seletor de categoria pai (para assuntos)

**Modal de Edição**:
- Nome da categoria
- Tipo (matéria, assunto, banca, ano)
- Categoria pai (quando aplicável)
- Descrição opcional

---

### ContentManager.tsx - `/admin/content`
**Propósito**: Central de gerenciamento de todo conteúdo didático com funcionalidades completas de CRUD.

**Funcionalidades**:
- Gestão unificada de cursos, flashcards, questões e resumos
- Filtros avançados por matéria, submatéria, tópico, tipo, status
- Ações em lote (publicar, arquivar, excluir múltiplos itens)
- Sistema de importação/exportação de conteúdo
- Visualização em tabela com métricas detalhadas

**Botões e Ações**:
- **Importar**: Upload de arquivos (.json, .csv, .xlsx)
- **Exportar**: Download dos dados filtrados
- **Novo Conteúdo**: Modal de criação com tipos específicos
- **Ações individuais**: Visualizar, Editar, Duplicar, Opções
- **Ações em lote**: Publicar, Arquivar, Excluir selecionados
- **Selecionar Todos**: Checkbox para seleção múltipla

**Filtros e Controles**:
- Busca por título e autor
- Filtros hierárquicos: Matéria → Submatéria → Tópico
- Filtro por tipo de conteúdo
- Filtro por status (publicado, rascunho, revisão, arquivado)
- Limpar filtros avançados

**Recursos Especiais**:
- Sistema de notificações toast em tempo real
- Loading states para operações
- Modais de visualização e edição completos
- Status badges com cores específicas
- Progress bars para carregamento

---

### IndividualFlashcards.tsx - `/admin/flashcards/cards`
**Propósito**: Gestão completa de flashcards individuais (avulsos, sem necessidade de deck).

**Funcionalidades**:
- Suporte completo aos 7 tipos de flashcard
- Filtros avançados por categoria, subcategoria, tipo, dificuldade, status
- Visualizações em grid e lista com alternância dinâmica
- Ações em lote: estudar, duplicar, arquivar múltiplos cartões
- Estatísticas dinâmicas em tempo real
- Sistema de seleção múltipla

**Botões e Ações**:
- **Novo Flashcard**: Navega para criação
- **Alternância de visualização**: Grid/Lista
- **Filtros**: Dropdowns para cada categoria
- **Ações por cartão**: Preview, Estudar, Editar, Duplicar, Arquivar
- **Ações em lote**: Estudar Selecionados, Duplicar, Arquivar
- **Seleção**: Checkboxes para múltiplos cartões

**7 Tipos Suportados**:
1. **Básico**: Pergunta/resposta tradicional
2. **Básico Invertido**: Com cartão reverso automático  
3. **Lacunas (Cloze)**: Texto com {{c1::palavras}} ocultadas
4. **Múltipla Escolha**: 4 alternativas com explicação
5. **Verdadeiro/Falso**: Afirmação com explicação
6. **Digite Resposta**: Campo de texto com dica
7. **Oclusão Imagem**: Áreas ocultas em imagens

**Recursos Especiais**:
- Preview modal para todos os tipos
- Estudo modal interativo com navegação
- Estado dinâmico com atualizações em tempo real
- Sistema de tags e metadados
- Contadores automáticos por filtro

---

### NewFlashcard.tsx - `/admin/flashcards/cards/new`
**Propósito**: Interface completa para criação de novos flashcards com suporte aos 7 tipos.

**Funcionalidades**:
- Formulário dinâmico que se adapta ao tipo selecionado
- Preview em tempo real das alterações
- Templates pré-configurados para demonstração
- Editor de oclusão de imagem integrado
- Validação específica por tipo de flashcard

**Botões e Ações**:
- **Seletor de tipo**: Dropdown com 7 opções
- **Carregar Exemplo**: Preenche com template
- **Preview**: Modal de visualização
- **Editor de Oclusão**: Para imagens (modal específico)
- **Salvar**: Com validações específicas
- **Cancelar**: Volta à lista

**Configurações Disponíveis**:
- Categoria, subcategoria, tópico
- Nível de dificuldade
- Tags personalizadas
- Status inicial
- Configurações específicas por tipo

**Validações**:
- Campos obrigatórios por tipo
- Formatos específicos (ex: {{c1::texto}} para cloze)
- Validação de imagens para oclusão
- Verificação de alternativas para múltipla escolha

---

### FlashcardManager.tsx - `/admin/flashcards`
**Propósito**: Visão geral do sistema de flashcards com navegação para diferentes seções.

**Funcionalidades**:
- Dashboard de estatísticas gerais
- Links para diferentes seções de flashcards
- Visão resumida de decks e cartões individuais
- Métricas de uso e performance

**Botões e Ações**:
- **Gerenciar Cartões Individuais**: Link para IndividualFlashcards
- **Gerenciar Decks**: Link para gestão de decks
- **Criar Novo**: Opções de criação rápida
- **Relatórios**: Acesso a analytics

---

### UserManager.tsx - `/admin/users`
**Propósito**: Gerenciamento completo de usuários do sistema.

**Funcionalidades**:
- Lista paginada de usuários
- Filtros por papel, status, plano
- Criação e edição de usuários
- Gestão de permissões e assinaturas

**Botões e Ações**:
- **Novo Usuário**: Modal/página de criação
- **Editar**: Modificar dados do usuário
- **Ativar/Desativar**: Toggle de status
- **Ver Detalhes**: Modal com informações completas
- **Filtros**: Por papel, status, data de cadastro

---

### MockExamManager.tsx - `/admin/mock-exams`
**Propósito**: Gestão de simulados e provas simuladas.

**Funcionalidades**:
- Criação de simulados personalizados
- Configuração de tempo, questões, dificuldade
- Análise de resultados e estatísticas
- Gestão de agendamentos

**Botões e Ações**:
- **Novo Simulado**: Formulário de criação
- **Editar**: Modificar configurações
- **Visualizar Resultados**: Analytics detalhados
- **Ativar/Desativar**: Controle de disponibilidade

---

### PreviousExamsManager.tsx - `/admin/previous-exams`
**Propósito**: Gestão de provas anteriores de concursos.

**Funcionalidades**:
- Upload e organização de provas anteriores
- Classificação por órgão, banca, ano
- Extração e importação de questões
- Metadados e categorização

**Botões e Ações**:
- **Nova Prova**: Upload e configuração
- **Importar Questões**: Extração automática
- **Editar Metadados**: Informações da prova
- **Publicar/Despublicar**: Controle de visibilidade

---

## Páginas do Aluno (Estudante)

### DashboardPage.tsx - `/dashboard`
**Propósito**: Central de comando tático para estudantes com visão completa do progresso.

**Funcionalidades**:
- Saudação personalizada com status operacional
- Cards de estatísticas: exercícios completados, taxa de precisão, cartões revisados, sequência operacional
- Objetivos operacionais diários com progress tracking
- Progresso no edital por matéria
- Calendário operacional com eventos
- Esquadrões (grupos de estudo) com rankings
- Ações rápidas para acesso ao arsenal tático

**Botões e Ações**:
- **Botão de refresh**: Atualização manual dos dados
- **Ações rápidas**: ARSENAL TÁTICO, INTEL CARDS, OPERAÇÃO SIMULADA, PLANEJAMENTO TÁTICO
- **Navegação calendário**: Mês anterior/próximo
- **Acessar esquadrão**: Botões para grupos de estudo
- **Ver relatórios**: Links para páginas específicas
- **Avatar do usuário**: Link para configurações

**Recursos Especiais**:
- Background patterns táticos
- Animações com delay progressivo
- Calendário interativo com eventos
- Progress bars animadas
- Status de conexão (online/offline)
- Esquema de cores militar adaptativo (claro/escuro)

---

### FlashcardsPage.tsx - `/student/flashcards`
**Propósito**: Sistema completo de flashcards para estudantes com algoritmo de repetição espaçada.

**Funcionalidades**:
- Dashboard mostrando todos os 7 tipos de flashcard visíveis
- Algoritmo SuperMemo 2 (SM-2) para repetição espaçada
- Criação de arsenais (decks) personalizados
- Sistema de estudo interativo
- Estatísticas detalhadas de performance

**Visualização dos 7 Tipos**:
1. **🔵 BÁSICO** - Pergunta e resposta tradicional (2 exemplos)
2. **🟢 BÁSICO INVERTIDO** - Com cartão reverso automático (1 exemplo)  
3. **🟡 LACUNAS (CLOZE)** - Texto com {{c1::palavras}} ocultadas (2 exemplos)
4. **🟣 MÚLTIPLA ESCOLHA** - 4 alternativas com explicação (2 exemplos)
5. **🔴 VERDADEIRO/FALSO** - Avaliação de afirmações (1 exemplo)
6. **🟦 DIGITE RESPOSTA** - Campo de texto com dica (1 exemplo)
7. **🟠 OCLUSÃO IMAGEM** - Áreas ocultas em imagens (1 exemplo)

**Botões e Ações**:
- **Estudar tipo**: Para cada categoria de flashcard
- **Criar Arsenal**: Novo deck personalizado
- **Configurações SRS**: Ajustes do algoritmo
- **Ver Estatísticas**: Dashboard de performance
- **Iniciar Sessão**: Estudo focado

**Sistema SRS**:
- Intervalos adaptativos baseados na dificuldade
- Tracking de acertos/erros por cartão
- Otimização automática dos intervalos
- Relatórios de retenção de conhecimento

---

### MockExamsPageSimple.tsx - `/student/mock-exams`
**Propósito**: Arsenal de simulações táticas para treino operacional.

**Funcionalidades**:
- Lista de simulados disponíveis com tema tático
- Filtros por dificuldade (RECRUTA, CABO, SARGENTO)
- Busca por nome e organizações
- Cards de estatísticas operacionais
- Interface militar com terminologia específica

**Botões e Ações**:
- **Iniciar Operação**: Começar simulado
- **Detalhes Táticos**: Ver informações completas
- **Filtros**: Por nível de dificuldade
- **Busca**: Campo de pesquisa táticas
- **Limpar Filtros**: Reset de filtros aplicados

**Filtros e Controles**:
- Busca por título e organização
- Seletor de dificuldade tática
- Contador de simulações disponíveis

**Recursos Especiais**:
- Background pattern com listras táticas
- Cards com hover effects e elevação
- Badges de dificuldade com cores específicas
- Empty state personalizado
- Animações Framer Motion

---

### QuestionsPage.tsx - `/student/questions`
**Propósito**: Arsenal de questões para treino tático com sistema de filtros avançados.

**Funcionalidades**:
- Banco extenso de questões categorizadas
- Filtros por matéria, banca, ano, dificuldade
- Sistema de marcação e comentários
- Histórico de respostas e performance
- Modo de estudo focado

**Botões e Ações**:
- **Iniciar Treino**: Sessão de questões
- **Filtrar**: Sistema de filtros múltiplos
- **Marcar**: Adicionar questão aos favoritos
- **Ver Resposta**: Mostrar gabarito e comentários
- **Próxima**: Navegação entre questões

---

### PreviousExamsStudentPage.tsx - `/student/previous-exams`
**Propósito**: Acesso a provas anteriores organizadas por concursos.

**Funcionalidades**:
- Navegação por provas históricas
- Filtros por órgão, banca, ano
- Resolução de provas completas
- Análise de performance por prova
- Comparação com outros candidatos

**Botões e Ações**:
- **Resolver Prova**: Iniciar prova completa
- **Ver Gabarito**: Gabarito oficial
- **Filtros**: Por múltiplos critérios
- **Análise**: Relatórios de performance
- **Comparar**: Ranking com outros usuários

---

### CoursesPage.tsx - `/student/courses`
**Propósito**: Catálogo de cursos disponíveis com sistema de inscrição.

**Funcionalidades**:
- Lista de cursos categorizados
- Sistema de inscrição e progresso
- Filtros por área, nível, instrutor
- Avaliações e comentários
- Certificados de conclusão

**Botões e Ações**:
- **Inscrever-se**: Matrícula no curso
- **Ver Detalhes**: Informações completas
- **Filtrar**: Por categorias diversas
- **Avaliar**: Sistema de notas
- **Continuar**: Retomar progresso

---

### SchedulePage.tsx - `/student/schedule`
**Propósito**: Planejamento tático de estudos e organização de rotina.

**Funcionalidades**:
- Calendário de estudos personalizável
- Agendamento de sessões
- Metas e objetivos diários
- Lembretes e notificações
- Análise de produtividade

**Botões e Ações**:
- **Novo Agendamento**: Criar sessão de estudo
- **Editar**: Modificar eventos existentes
- **Ver Agenda**: Visualização por dia/semana/mês
- **Configurar Metas**: Objetivos de estudo
- **Relatórios**: Analytics de tempo

---

### SettingsPage.tsx - `/student/settings`
**Propósito**: Configurações pessoais e preferências do sistema.

**Funcionalidades**:
- Perfil do usuário
- Configurações de notificações
- Preferências de tema e idioma
- Configurações de privacidade
- Integração com redes sociais

**Botões e Ações**:
- **Salvar Perfil**: Atualizar informações
- **Alterar Senha**: Segurança da conta
- **Configurar Notificações**: Preferências
- **Tema**: Alternar claro/escuro
- **Excluir Conta**: Remoção definitiva

---

### TacticalPanelPage.tsx - `/student/tactical-panel`
**Propósito**: Painel tático avançado com métricas detalhadas de performance.

**Funcionalidades**:
- Dashboard completo de estatísticas
- Gráficos de progresso temporal
- Análise por matéria e tema
- Comparações e rankings
- Relatórios exportáveis

**Botões e Ações**:
- **Filtrar Dados**: Por período e categoria
- **Exportar**: Relatórios em PDF/Excel
- **Comparar**: Com outros usuários
- **Ver Detalhes**: Drill-down nos dados
- **Configurar**: Personalizar métricas

---

### ExamTakingPage.tsx - `/student/exam/taking`
**Propósito**: Interface para realização de provas e simulados em tempo real.

**Funcionalidades**:
- Timer operacional com contagem regressiva
- Navegação entre questões
- Sistema de marcação e revisão
- Auto-save de respostas
- Interface focada sem distrações

**Botões e Ações**:
- **Próxima/Anterior**: Navegação entre questões
- **Marcar para Revisão**: Flag de questões
- **Finalizar**: Submeter prova
- **Pausar**: Pausa do timer (se permitido)
- **Ver Resumo**: Visão geral das respostas

**Recursos Especiais**:
- Tema militar durante a prova
- Terminologia tática ("ALVOS ELIMINADOS", "OPERAÇÃO")
- Interface de comando limpa
- Indicadores de progresso
- Confirmações de segurança

---

### ExamResultsPage.tsx - `/student/exam/results`
**Propósito**: Análise completa de resultados com tema militar/tático.

**Funcionalidades**:
- Relatório detalhado de performance
- Análise por matéria e questão
- Comparação com outros candidatos
- Identificação de pontos fracos
- Recomendações de estudo

**Botões e Ações**:
- **Ver Gabarito**: Respostas corretas
- **Refazer**: Nova tentativa
- **Compartilhar**: Resultado nas redes
- **Baixar Relatório**: PDF detalhado
- **Estudar Erros**: Foco nos erros

**Recursos Especiais**:
- Terminologia militar ("ALVOS ELIMINADOS/PERDIDOS")
- Interface de comando operacional
- Badges e conquistas táticas
- Gráficos militarizados
- Cores e design militar

---

## Páginas Públicas/Autenticação

### LoginPage.tsx - `/login`
**Propósito**: Página de autenticação com design militar elegante e funcionalidades completas.

**Funcionalidades**:
- Formulário de login responsivo
- Validação em tempo real
- Login social (Facebook, Google, LinkedIn)
- Opção "Lembrar-me"
- Recuperação de senha
- Toggle de tema claro/escuro

**Botões e Ações**:
- **Acessar Sistema**: Login principal
- **Login social**: 3 provedores disponíveis
- **Recuperar Acesso**: Link para reset de senha
- **Criar Conta**: Link para registro
- **Toggle Tema**: Alternar claro/escuro
- **Voltar ao Início**: Link para homepage

**Recursos Especiais**:
- Split layout com hero section
- Animações Framer Motion
- Background patterns táticos
- Estadísticas em tempo real do lado direito
- Auto-preenchimento para desenvolvimento
- Design militar profissional

**Validações**:
- Email obrigatório e formato válido
- Senha mínima de 6 caracteres
- Feedback visual de erros
- Loading states durante autenticação

---

### RegisterPage.tsx - `/register`
**Propósito**: Página de cadastro para novos usuários.

**Funcionalidades**:
- Formulário de registro completo
- Validação de campos em tempo real
- Termos de uso e privacidade
- Confirmação de email
- Verificação de força da senha

**Botões e Ações**:
- **Criar Conta**: Registro principal
- **Já tem conta**: Link para login
- **Aceitar Termos**: Checkbox obrigatório
- **Verificar Email**: Pós-cadastro
- **Login Social**: Alternativas de registro

---

### HomePage.tsx - `/`
**Propósito**: Landing page institucional com apresentação da plataforma.

**Funcionalidades**:
- Apresentação dos recursos
- Testemunhos de aprovados
- Planos e preços
- Call-to-action para cadastro
- Informações institucionais

**Botões e Ações**:
- **Começar Agora**: CTA principal
- **Ver Planos**: Seção de preços
- **Login**: Acesso rápido
- **Saiba Mais**: Informações detalhadas
- **Contato**: Formulário ou links

---

### CheckoutPage.tsx - `/checkout`
**Propósito**: Página de finalização de compra e assinatura.

**Funcionalidades**:
- Formulário de pagamento
- Resumo do pedido
- Múltiplas formas de pagamento
- Aplicação de cupons
- Confirmação de compra

**Botões e Ações**:
- **Finalizar Compra**: Processar pagamento
- **Aplicar Cupom**: Desconto promocional
- **Alterar Plano**: Modificar seleção
- **Voltar**: Retornar aos planos
- **Segurança**: Informações de proteção

---

## Recursos Globais e Padrões

### Design System Militar/Tático
- **Tipografia Militar**: Orbitron, Rajdhani, Exo 2
- **Terminologia**: "OPERAÇÕES", "ARSENAL", "COMANDO", "ALVOS"
- **Cores Táticas**: Accent yellow (#facc15), Military base (#14242f)
- **Patterns**: Listras diagonais, tactical stripes, corner accents
- **Elementos**: Badges operacionais, progress bars militares

### Componentes Reutilizáveis
- **FlashcardPreviewModal**: Preview de cartões
- **FlashcardStudyModal**: Sessões de estudo
- **ImageOcclusionEditor**: Editor de oclusão
- **TacticalIcon**: Ícones temáticos
- **StudyCard**: Card de estudo genérico

### Funcionalidades Técnicas
- **Estado Global**: Zustand com persist
- **Autenticação**: JWT com refresh automático
- **Tema**: Context com suporte a sistema/claro/escuro
- **API**: Endpoints centralizados em `/config/api.ts`
- **Validação**: Schemas TypeScript para type safety
- **Loading**: Estados de carregamento padronizados
- **Notificações**: Toast system com react-hot-toast

### Rotas e Navegação
- **Proteção**: Role-based access control
- **Layout**: Diferentes layouts para admin/student/public
- **Lazy Loading**: Code splitting por rota
- **404**: Página de erro personalizada
- **Redirects**: Baseados em papel e autenticação

### Responsividade
- **Mobile First**: Design responsivo completo
- **Breakpoints**: sm, md, lg, xl padrões do Tailwind
- **Touch**: Interfaces otimizadas para touch
- **Performance**: Lazy loading e otimizações

Este sistema representa uma plataforma completa de estudos com identidade visual militar forte, funcionalidades avançadas e experiência de usuário profissional voltada para concursos de segurança pública.