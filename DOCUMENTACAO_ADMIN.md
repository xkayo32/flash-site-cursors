# DOCUMENTAÇÃO COMPLETA DO SISTEMA ADMINISTRATIVO - STUDY PRO

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Dashboard Administrativo](#dashboard-administrativo)
3. [Central de Conteúdo](#central-de-conteúdo)
4. [Gestão de Usuários](#gestão-de-usuários)
5. [Editor de Cursos](#editor-de-cursos)
6. [Editor de Questões](#editor-de-questões)
7. [Editor de Resumos](#editor-de-resumos)
8. [Gerenciador de Legislação](#gerenciador-de-legislação)
9. [Configurações do Sistema](#configurações-do-sistema)
10. [Analytics](#analytics)
11. [Importador de Dados](#importador-de-dados)
12. [Gerenciador de Categorias](#gerenciador-de-categorias)

---

## 🔍 Visão Geral

O sistema administrativo do Study Pro foi desenvolvido com foco em **gestão tática e operacional**, utilizando uma interface militar/policial com design monocromático. Todas as páginas seguem os seguintes padrões:

### 🎨 Design System
- **Tema Militar/Policial**: Interface monocromática com cores preto, branco e tons de cinza
- **Cores de Destaque**: Amarelo tático (accent-500: #facc15) para ações principais
- **Tipografia**: 
  - Títulos: Orbitron (font-police-title)
  - Subtítulos: Rajdhani (font-police-subtitle)
  - Corpo: Rajdhani (font-police-body)
  - Números: Exo 2 (font-police-numbers)
- **Linguagem**: Termos militares/táticos (TROPAS, MISSÕES, ARSENAL, etc.)

### 🔐 Níveis de Acesso
- **Admin**: Acesso total a todas as funcionalidades
- **Instrutor**: Acesso limitado a conteúdo e alunos
- **Estudante**: Sem acesso ao painel administrativo

---

## 1. 📊 Dashboard Administrativo (`/admin/dashboard`)

### 📝 Descrição
Central de comando principal que apresenta métricas e informações gerais do sistema em tempo real.

### 🛠️ Funcionalidades

#### 📈 Cards de Métricas (KPIs)
- **TROPAS ATIVAS**: Total de usuários ativos na plataforma
- **MISSÕES OPERACIONAIS**: Quantidade de cursos disponíveis
- **ARSENAL TÁTICO**: Total de questões no banco de dados
- **RECEITA OPERACIONAL**: Faturamento total da plataforma

#### ⚡ Ações Rápidas
- **NOVO RECRUTA**: Adicionar novo usuário rapidamente
- **NOVA MISSÃO**: Criar novo curso
- **NOVO ARSENAL**: Adicionar questões
- **RELATÓRIO TÁTICO**: Gerar relatórios

#### 👥 Recrutas Recentes
Lista dos últimos usuários cadastrados com:
- Avatar e nome do usuário
- Email de contato
- Plano de assinatura (RECRUTA/ELITE/COMANDO)
- Status (ATIVO/INATIVO)
- Último acesso
- Ações rápidas (visualizar/editar)

#### 🚨 Alertas Táticos
Sistema de notificações com três tipos:
- **Warning**: Alertas importantes (cor cinza)
- **Info**: Informações gerais (cor cinza)
- **Success**: Operações bem-sucedidas (cor cinza)

#### 📚 Arsenal de Conteúdo
Tabela com conteúdos recentes:
- Título e tipo (curso/questões/flashcards)
- Autor responsável
- Status de publicação
- Métricas de visualização
- Ações (visualizar/editar/excluir)

---

## 2. 📂 Central de Conteúdo (`/admin/content`)

### 📝 Descrição
Sistema completo para gerenciamento de todo conteúdo educacional da plataforma.

### 🛠️ Funcionalidades

#### 🔍 Sistema de Filtros Hierárquico
1. **Busca Global**: Pesquisa por título ou autor
2. **Filtro por Matéria**: DIREITO, SEGURANÇA PÚBLICA, CONHECIMENTOS GERAIS
3. **Filtro Cascata**: Matéria → Submatéria → Tópico
4. **Filtros Adicionais**: Tipo, Status, Visibilidade

#### 📥 Importação/Exportação
- **IMPORTAR**: Aceita arquivos JSON, CSV, XLSX
- **EXPORTAR**: Exporta dados filtrados em JSON
- Feedback visual com loading e notificações

#### ➕ Criação de Conteúdo
Modal com seleção de tipo:
- **CURSO COMPLETO**: Redireciona para editor de cursos
- **FLASHCARDS TÁTICOS**: Criação rápida
- **BANCO DE QUESTÕES**: Editor de questões
- **RESUMO OPERACIONAL**: Editor de resumos

#### 📋 Tabela de Conteúdo
Exibe todos os conteúdos com:
- **Ícone e Título**: Identificação visual por tipo
- **Hierarquia**: Matéria > Submatéria > Tópico
- **Autor**: Responsável pelo conteúdo
- **Status**: PUBLICADO/RASCUNHO/EM REVISÃO/ARQUIVADO
- **Métricas**: Visualizações, inscrições, avaliação
- **Ações**: Visualizar, Editar, Duplicar, Alterar Status

#### 🔧 Ações em Lote
- Seleção múltipla de itens
- **PUBLICAR**: Publicar vários itens
- **ARQUIVAR**: Arquivar selecionados
- **EXCLUIR**: Exclusão em massa

#### 🎯 Funcionalidades Especiais
- **Duplicação**: Cria cópia com "(Cópia)" no título
- **Alteração de Status**: Toggle rápido publicado/rascunho
- **Modais Profissionais**: Visualização e edição detalhada
- **Notificações Toast**: Feedback visual de ações
- **Loading States**: Animações durante operações

---

## 3. 👥 Gestão de Usuários (`/admin/users`)

### 📝 Descrição
Sistema completo para gerenciamento de usuários, assinaturas e permissões.

### 🛠️ Funcionalidades

#### 📊 Cards de Estatísticas
- **Total de Usuários**: Quantidade total cadastrada
- **Assinaturas Ativas**: Usuários com plano ativo
- **Novos este Mês**: Cadastros recentes
- **Taxa de Churn**: Percentual de cancelamentos

#### 🔍 Sistema de Filtros
- **Busca**: Por nome ou email
- **Função**: Todos, student, instructor, admin
- **Status**: Todos, active, suspended, pending, inactive
- **Checkbox**: Incluir usuários inativos

#### 📋 Tabela de Usuários
Informações exibidas:
- **Avatar e Dados**: Foto, nome e email
- **Função**: Badge colorido (Admin/Instrutor/Aluno)
- **Status**: Badge de status do usuário
- **Assinatura**: Status e plano atual
- **Último Acesso**: Data/hora do último login
- **Ações**: Visualizar, Editar, Suspender

#### ➕ Criação de Usuário
Modal com campos:
- Nome completo
- Email (validado)
- Senha inicial
- Função (student/instructor/admin)
- Status inicial
- Telefone (opcional)
- Plano de assinatura

#### 🔐 Regras de Segurança
- Admin não pode modificar próprio status
- Admin não pode excluir outros admins
- Validação de permissões em tempo real

#### 📥 Importação/Exportação
- Importar usuários via CSV
- Exportar lista filtrada

---

## 4. 📚 Editor de Cursos (`/admin/courses`)

### 📝 Descrição
Interface para criação e gerenciamento de cursos completos.

### 🛠️ Funcionalidades

#### 🔍 Filtros e Busca
- Busca por título ou instrutor
- Filtro por categoria (Polícia, Receita, Tribunais, etc.)
- Filtro por status (Publicado, Rascunho, Arquivado)

#### ➕ Criação de Curso
Formulário completo com:
- **Informações Básicas**: Título, categoria, instrutor
- **Detalhes**: Descrição, objetivos, público-alvo
- **Configurações**: Preço, duração, carga horária
- **Upload de Imagem**: Thumbnail do curso (até 5MB)

#### 🖼️ Sistema de Imagens
- Formatos aceitos: JPEG, PNG, GIF, WebP, SVG
- Tamanho máximo: 5MB
- Preview em tempo real
- Validação frontend e backend

#### 📋 Visualização de Cursos
Cards com informações:
- Thumbnail ou imagem padrão
- Título e categoria
- Instrutor responsável
- Status de publicação
- Métricas (alunos, avaliação)
- Preço e duração

#### ✏️ Edição de Curso
Abas organizadas:
- **Detalhes**: Informações gerais
- **Módulos**: Estrutura do curso
- **Configurações**: Preço, visibilidade
- **Alunos**: Gerenciar inscritos

---

## 5. 📝 Editor de Questões (`/admin/questions`)

### 📝 Descrição
Sistema para gerenciamento do banco de questões de simulados e exercícios.

### 🛠️ Funcionalidades

#### 📊 Cards de Estatísticas
- **Total de Questões**: Quantidade no banco
- **Publicadas**: Questões ativas
- **Taxa de Acerto**: Média geral
- **Respondidas Hoje**: Atividade diária

#### 🔍 Sistema de Filtros
- Busca por título, matéria ou tópico
- Filtro por matéria/disciplina
- Filtro por dificuldade (Fácil/Médio/Difícil)
- Filtro por status
- Filtro por banca examinadora

#### ➕ Criação de Questão
Editor com campos:
- **Enunciado**: Editor rich text
- **Alternativas**: Múltipla escolha (A-E)
- **Resposta Correta**: Seleção da alternativa
- **Explicação**: Justificativa detalhada
- **Metadados**: Matéria, tópico, dificuldade
- **Tags**: Palavras-chave para busca

#### 📋 Tabela de Questões
Informações exibidas:
- Título/enunciado resumido
- Matéria e tópico
- Dificuldade (badge colorido)
- Banca e ano
- Status de publicação
- Estatísticas (vezes respondida, taxa de acerto)
- Ações (visualizar, editar, duplicar, excluir)

#### 📊 Funcionalidades Especiais
- **Duplicação**: Criar variações de questões
- **Estatísticas**: Análise de desempenho
- **Revisão**: Sistema de aprovação
- **Histórico**: Versões anteriores

---

## 6. 📄 Editor de Resumos (`/admin/summaries`)

### 📝 Descrição
Sistema para criação e edição de resumos interativos para estudo.

### 🛠️ Funcionalidades

#### 🔍 Filtros
- Busca por título ou autor
- Filtro por matéria
- Filtro por status

#### ➕ Criação de Resumo
- Editor de texto rico (rich text)
- Inserção de imagens e diagramas
- Elementos interativos (acordeões, tabs)
- Destaque de conceitos importantes

#### 📋 Lista de Resumos
- Título e matéria
- Autor responsável
- Data de criação/atualização
- Status de publicação
- Número de visualizações

---

## 7. ⚖️ Gerenciador de Legislação (`/admin/legislation`)

### 📝 Descrição
Sistema especializado para organização de leis, decretos e normas.

### 🛠️ Funcionalidades

#### 📚 Organização Hierárquica
- Constituição Federal
- Leis Complementares
- Leis Ordinárias
- Decretos
- Portarias e Resoluções

#### 🔍 Busca Avançada
- Por número da lei
- Por palavra-chave
- Por data de publicação
- Por órgão emissor

#### ➕ Cadastro de Legislação
- Tipo e número
- Ementa
- Texto integral
- Data de publicação
- Vigência
- Alterações e revogações

---

## 8. ⚙️ Configurações do Sistema (`/admin/settings`)

### 📝 Descrição
Central de configurações gerais da plataforma com múltiplas seções.

### 🛠️ Seções Disponíveis

#### 🏢 Geral
- Nome do sistema
- Modo de manutenção
- Permitir registros
- Verificação de email

#### 🏭 Empresa
- Razão social
- CNPJ
- Endereço completo
- Telefones de contato
- Email corporativo

#### 🎨 Marca e Logo
- Upload de logo (claro/escuro)
- Cores do tema
- Fontes personalizadas

#### 💳 Pagamentos
- Configuração Stripe
- Métodos aceitos (PIX, Cartão, Boleto)
- Taxas e impostos
- Moeda padrão

#### 📧 Servidor de Email (SMTP)
- Host e porta
- Credenciais
- Remetente padrão
- Templates de email

#### 📜 Termos e Políticas
- Termos de Uso
- Política de Privacidade
- Política de Cookies
- Política de Reembolso

#### 🔐 Segurança
- Autenticação 2FA
- Tempo de sessão
- Políticas de senha
- Logs de auditoria

#### 🔔 Notificações
- Canais (Email, SMS, Push)
- Tipos de notificação
- Frequência
- Templates

#### 💾 Backup
- Frequência automática
- Destino do backup
- Retenção de dados
- Restauração

#### 📊 Analytics
- Google Analytics
- Hotjar
- Pixel Facebook
- Tags personalizadas

---

## 9. 📈 Analytics (`/admin/analytics`)

### 📝 Descrição
Dashboard com métricas e análises detalhadas da plataforma.

### 🛠️ Funcionalidades

#### 📊 Métricas Principais
- Usuários ativos (DAU/MAU)
- Taxa de conversão
- Receita recorrente (MRR)
- Lifetime Value (LTV)

#### 📈 Gráficos
- Evolução de usuários
- Receita por período
- Engajamento por curso
- Taxa de conclusão

#### 📋 Relatórios
- Exportação em PDF/Excel
- Agendamento automático
- Comparativos períodos

---

## 10. 📥 Importador de Dados (`/admin/import`)

### 📝 Descrição
Sistema para importação em massa de dados.

### 🛠️ Funcionalidades

#### 📁 Tipos de Importação
- Usuários (CSV)
- Questões (JSON/Excel)
- Cursos (ZIP com estrutura)
- Legislação (PDF/TXT)

#### ✅ Validação
- Preview antes de importar
- Detecção de duplicatas
- Correção de erros
- Log de importação

---

## 11. 🏷️ Gerenciador de Categorias (`/admin/categories`)

### 📝 Descrição
Organização hierárquica de categorias e tags.

### 🛠️ Funcionalidades

#### 🌳 Estrutura em Árvore
- Categorias principais
- Subcategorias (até 3 níveis)
- Tags associadas
- Ícones personalizados

#### 🔧 Gerenciamento
- Criar/editar/excluir
- Reorganizar hierarquia
- Mesclar categorias
- Estatísticas de uso

---

## 🔒 Segurança e Permissões

### Níveis de Acesso por Página
- **Dashboard**: Todos os admins
- **Conteúdo**: Admin e Instrutor
- **Usuários**: Apenas Admin
- **Cursos**: Admin e Instrutor
- **Questões**: Admin e Instrutor  
- **Configurações**: Apenas Admin
- **Analytics**: Admin (visão completa), Instrutor (limitada)

### Logs de Auditoria
Todas as ações são registradas com:
- Usuário responsável
- Ação realizada
- Timestamp
- IP de origem
- Dados alterados

---

## 🚀 Boas Práticas

### Performance
- Lazy loading de dados
- Paginação em tabelas grandes
- Cache de consultas frequentes
- Otimização de imagens

### UX/UI
- Feedback visual imediato
- Loading states claros
- Confirmação para ações destrutivas
- Auto-save em formulários longos

### Manutenção
- Código modular e reutilizável
- Documentação inline
- Testes automatizados
- Versionamento semântico

---

## 📞 Suporte

Para dúvidas ou problemas:
- **Email**: suporte@studypro.com.br
- **WhatsApp**: (11) 99999-9999
- **Documentação**: docs.studypro.com.br
- **Status**: status.studypro.com.br

---

*Última atualização: Janeiro 2025*
*Versão: 1.0.0*