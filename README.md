<div align="center">

# 🎯 StudyPro - Plataforma de Preparação para Concursos Públicos

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Sistema educacional completo para preparação de concursos públicos, especializado em carreiras policiais e militares. A plataforma oferece cursos estruturados, simulados adaptativos, sistema de flashcards com repetição espaçada e conteúdo especializado para maximizar o desempenho dos candidatos.

[Demonstração](#) | [Documentação](docs/) | [Reportar Bug](#) | [Solicitar Feature](#)

</div>

## 🚀 Tecnologias

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **Zustand** para gerenciamento de estado
- **React Router v6** para navegação
- **Framer Motion** para animações

### Backend
- **Node.js** com Express e TypeScript
- **PostgreSQL** como banco de dados principal
- **JWT** para autenticação
- **Docker** para containerização
- **Sistema híbrido**: PostgreSQL para dados principais, JSON para configurações

## 📁 Estrutura do Projeto

```
flash-site-cursors/
├── backend-node/        # API Node.js/Express com TypeScript
│   ├── src/            # Código fonte
│   ├── data/           # Arquivos de dados JSON
│   ├── database/       # Scripts SQL
│   └── migrations/     # Scripts de migração
├── frontend/           # Aplicação React 18 + Vite
│   ├── src/            # Código fonte
│   └── public/         # Assets públicos
├── docs/              # Documentação completa
│   ├── architecture/   # Documentação de arquitetura
│   ├── implementation/ # Guias de implementação
│   └── *.md           # Documentação geral
├── scripts/           # Scripts de automação
│   ├── setup/         # Scripts de configuração inicial
│   ├── testing/       # Scripts e arquivos de teste
│   └── utils/         # Utilitários e ferramentas
├── docker-compose.yml  # Configuração Docker multi-serviço
├── Makefile           # Comandos de desenvolvimento
└── README.md          # Este arquivo
```

## 📊 Status do Projeto

### ✅ Implementado
- Sistema completo de autenticação JWT
- CRUD completo de cursos, módulos e lições
- Sistema de flashcards com 7 tipos diferentes
- Importação/exportação de decks Anki
- Simulados e provas anteriores
- Dashboard administrativo completo
- Tema militar/tático para área do aluno
- Sistema de comentários em lições
- Upload de imagens para cursos
- Gestão de legislação
- Sistema de pagamentos (Stripe)

### 🚧 Em Desenvolvimento
- Sistema de notificações push
- App mobile React Native
- Integração com IA para geração de questões
- Sistema de gamificação completo

## 🔧 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- PostgreSQL (via Docker)

### Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/xkayo32/flash-site-cursors.git
cd flash-site-cursors

# Inicie todos os serviços com Docker
make up-postgres

# Ou manualmente
docker-compose -f docker-compose.postgres.yml up -d
```

### Configuração Manual

#### Frontend
```bash
cd frontend
npm install
npm run dev  # Desenvolvimento em http://localhost:5173
```

#### Backend
```bash
cd backend-node
npm install
npm run dev  # API em http://localhost:8180
```

## 🌟 Funcionalidades Principais

### 👨‍🎓 Para Estudantes
- **Cursos Estruturados**: Videoaulas, materiais didáticos e exercícios práticos
- **Sistema de Flashcards Avançado**: 
  - 7 tipos diferentes de cards (Básico, Invertido, Cloze, Múltipla Escolha, V/F, Digite Resposta, Oclusão de Imagem)
  - Importação de decks do Anki (.apkg) com suporte para versões 2.0 e 2.1
  - Algoritmo SM-2 de repetição espaçada
  - Criação e gerenciamento de decks personalizados
  - Algoritmo SuperMemo 2 (SM-2) para repetição espaçada
  - Importação/Exportação de decks
- **Simulados Adaptativos**: Questões de concursos anteriores com cronômetro
- **Resumos Interativos**: Material de estudo com questões integradas
- **Dashboard Tático**: Acompanhamento de progresso em tempo real
- **Cronograma Personalizado**: Planejamento de estudos até a data da prova

### 👔 Para Administradores
- **Gestão Completa de Conteúdo**: CRUD para cursos, questões, flashcards e resumos
- **Sistema de Categorias Hierárquicas**: Organização multinível com filtros avançados
- **Analytics Detalhado**: Métricas de engajamento e desempenho
- **Gestão de Usuários**: Controle granular de acesso e permissões
- **Editor WYSIWYG**: Para criação de conteúdo rico
- **Sistema de Pagamentos**: Integração com gateways de pagamento

## 🎨 Design System

O projeto utiliza um tema militar/tático com:
- Cores principais: Black, White, Military Base (#14242f)
- Accent: Tactical Yellow (#facc15)
- Tipografia: Orbitron, Rajdhani, Exo 2
- Componentes customizados com Tailwind CSS

## 📝 Scripts Úteis

```bash
# Desenvolvimento
make up-postgres    # Inicia todos os serviços
make down          # Para todos os serviços
make logs          # Visualiza logs
make restart       # Reinicia serviços

# Banco de Dados
make db-reset      # Reset completo do banco
make db-seed       # Popula com dados de teste

# Testes
npm run test       # Executa testes
npm run lint       # Verifica código
npm run build      # Build de produção
```

## 🔐 Variáveis de Ambiente

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8180
```

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5532
DB_NAME=estudos_db
DB_USER=estudos_user
DB_PASSWORD=estudos_pass
JWT_SECRET=your-secret-key
```

## 📚 Documentação

Documentação completa disponível em `/docs`:
- [Arquitetura](docs/architecture/)
- [Implementação](docs/implementation/)
- [Testes](docs/testing/)
- [Setup](docs/setup/)

## 🏗️ Arquitetura

### Frontend
- **Arquitetura Component-Based** com React 18
- **State Management**: Zustand com persist middleware
- **API Client**: Axios com interceptors configurados
- **Routing**: React Router v6 com proteção de rotas
- **UI Components**: Tailwind CSS + componentes customizados
- **Build Tool**: Vite para desenvolvimento rápido com HMR

### Backend
- **RESTful API** com Express e TypeScript
- **Autenticação**: JWT com refresh tokens
- **Database**: PostgreSQL com queries otimizadas
- **File Storage**: Sistema local com suporte a uploads
- **Validation**: Middleware de validação em todas as rotas
- **Error Handling**: Sistema centralizado de tratamento de erros

## 🧪 Testes

```bash
# Executar todos os testes
make test-all

# Testes específicos
./scripts/testing/test-api.sh        # Testes da API
./scripts/testing/test-frontend.sh   # Testes do frontend
```

## 📊 Performance

- **Lazy Loading**: Carregamento sob demanda de componentes
- **Code Splitting**: Divisão automática de código
- **Image Optimization**: Compressão e lazy loading de imagens
- **Caching Strategy**: Cache de API com React Query
- **Database Indexes**: Índices otimizados para queries frequentes

## 🔒 Segurança

- Autenticação JWT com tokens seguros
- Rate limiting em todas as APIs
- Validação e sanitização de inputs
- CORS configurado adequadamente
- Proteção contra SQL Injection
- XSS Prevention

## 🚀 Deploy

### Produção
```bash
# Build completo
make build-production

# Deploy com Docker
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Documentação

Documentação completa disponível em `/docs`:
- [Arquitetura do Sistema](docs/architecture/)
- [Guias de Implementação](docs/implementation/)  
- [APIs e Endpoints](docs/PLANO_APIS_FALTANTES.md)
- [Sistema de Flashcards](docs/FLASHCARD_SYSTEM_DOCS.md)

## 🤝 Contribuindo

Este é um projeto privado. Para contribuir, entre em contato com a equipe de desenvolvimento.

## 📄 Licença

Projeto proprietário. Todos os direitos reservados © 2025 StudyPro

## 👥 Equipe de Desenvolvimento

Desenvolvido com dedicação para revolucionar a preparação para concursos públicos no Brasil.

---

<div align="center">

**🌐 Endpoints Padrão**

| Serviço | URL | Porta |
|---------|-----|-------|
| Frontend | http://localhost:5173 | 5173 |
| Backend API | http://localhost:8180 | 8180 |
| PostgreSQL | localhost:5532 | 5532 |

</div>