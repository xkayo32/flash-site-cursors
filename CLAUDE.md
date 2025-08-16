# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start
```bash
# Start all services with PostgreSQL (recommended)
make up-postgres

# Access points:
# Frontend:    http://localhost:5273
# Backend API: http://localhost:8180
# PostgreSQL:  localhost:5532
```

## Common Development Commands

### Frontend (React + Vite)
```bash
# Development
cd frontend
npm install                # Install dependencies
npm run dev                # Start development server on port 5173

# Build & Quality Checks
npm run build              # Build for production (includes TypeScript check via tsc -b)
npm run lint               # Run ESLint with typescript-eslint
npm run preview            # Preview production build
```

### Backend (PHP)
```bash
# Development
cd backend/public
php -S localhost:8000      # Start PHP development server

# Dependencies
cd backend
composer install           # Install PHP dependencies
composer dump-autoload     # Regenerate autoloader

# Database setup
cd backend/database
psql -h localhost -p 5532 -U estudos_user -d estudos_db -f schema_postgres.sql
psql -h localhost -p 5532 -U estudos_user -d estudos_db -f sample_data.sql
```

### Docker Development
```bash
# Start all services
make up-postgres           # Start with PostgreSQL (recommended)
make down                  # Stop all services
make restart               # Restart services
make logs                  # View logs
make build                 # Rebuild containers
make clean                 # Remove all containers and volumes

# Shell access
make shell-backend         # Access backend container
make shell-frontend        # Access frontend container

# Port mappings (custom to avoid conflicts)
# Frontend:    http://localhost:5273
# Backend API: http://localhost:8180
# PostgreSQL:  localhost:5532
```

### Database Commands
```bash
# PostgreSQL is the primary database
# Connection: postgres://estudos_user:estudos_pass@localhost:5532/estudos_db

# Run migrations (inside backend/database/)
psql -h localhost -p 5532 -U estudos_user -d estudos_db -f schema_postgres.sql
psql -h localhost -p 5532 -U estudos_user -d estudos_db -f sample_data.sql

# Common fixes
psql -h localhost -p 5532 -U estudos_user -d estudos_db -f complete_fix.sql

# Add previous exams system
psql -h localhost -p 5532 -U estudos_user -d estudos_db -f add_previous_exams.sql
```

## Architecture Overview

### Frontend Architecture
The frontend is a React SPA with TypeScript:

- **State Management**: Zustand with persist middleware for auth state (`src/store/authStore.ts`)
- **API Integration**: Axios with centralized configuration in `src/config/api.ts`
- **Routing**: React Router v6 with role-based access control (`src/Router.tsx`)
- **UI Components**: Custom components built on Tailwind CSS + shadcn/ui patterns
- **Authentication**: JWT tokens stored in localStorage, managed by authStore
- **Build System**: Vite with React plugin, TypeScript support, and path aliases

Key architectural decisions:
- All API endpoints are defined in `src/config/api.ts`
- Authentication state persists across sessions using Zustand persist
- Components are organized by feature (admin/, student/, auth/, public/)
- Services layer (`src/services/`) handles API communication
- TypeScript for type safety throughout the application
- Tailwind CSS with custom military/police theme configuration

### Backend Architecture
The backend is a custom PHP framework (not Laravel/Symfony):

- **Routing**: Custom router in `app/Http/Router.php` with middleware support
- **Controllers**: Located in `app/Controller/Api/` with versioned endpoints
- **Authentication**: JWT-based using Firebase JWT library
- **Database**: Direct PDO connections managed by `includes/Database.php`
- **API Versioning**: All routes prefixed with `/api/v1/`
- **Environment**: Custom Environment loader in `app/Utils/Environment.php`

Key architectural decisions:
- Custom lightweight PHP framework for performance
- JWT tokens for stateless authentication (Firebase JWT library)
- RESTful API design with consistent endpoint patterns
- Middleware system for request processing (CORS, Auth)
- Manual routing configuration in `routes/api/v1/`
- No ORM - direct PDO for database operations

### Database Schema
PostgreSQL database with comprehensive schema:

Core tables:
- `users`: User accounts with roles (student, admin, instructor)
- `courses`: Course catalog with metadata
- `course_modules`: Course structure organization
- `lessons`: Individual lessons within modules
- `questions`: Question bank for quizzes
- `flashcards`: Spaced repetition cards
- `subscriptions`: User subscription management
- `payments`: Payment history tracking

Advanced features:
- Integer primary keys (migrated from UUIDs)
- Trigger-based updated_at timestamps
- Comprehensive indexes for performance
- Foreign key constraints for data integrity

### API Authentication Flow
1. POST `/api/v1/auth/login` with credentials
2. Receive JWT token in response
3. Include token in `Authorization: Bearer <token>` header
4. Token verified by middleware on protected routes
5. Token expiration: 24 hours

### API Endpoints Structure
```
/api/v1/
├── auth/
│   ├── login        POST
│   ├── register     POST
│   ├── verify       GET (protected)
│   └── logout       POST
├── users/           GET, POST, PUT, DELETE (admin only)
├── courses/         
│   ├── /            GET, POST
│   ├── /{id}        GET, PUT, DELETE
│   ├── /{id}/image  POST (multipart/form-data)
│   └── /{id}/modules GET, POST
└── test/            GET (health check)
```

### Development Workflow
1. Frontend runs on port 5173 (Vite dev server with HMR)
2. Backend API runs on port 8180 (via Docker)
3. PostgreSQL database on port 5532
4. CORS configured to allow frontend-backend communication
5. Hot reload enabled for both frontend and backend in Docker
6. Environment variables:
   - Frontend: `VITE_API_URL` (default: http://localhost:8180)
   - Backend: DB credentials in `.env` file

### Important Notes
- Always run `npm run build` (includes TypeScript check) before committing frontend changes
- API base URL is configured via `VITE_API_URL` environment variable
- Authentication tokens expire after 24 hours
- File uploads for course images use multipart/form-data to `/api/v1/courses/{id}/image`
- The project uses integer IDs (migration from UUIDs completed)
- Backend routes must be manually registered in `routes/api/v1/`
- Frontend uses Zustand with persist middleware - auth state key: `auth-storage`
- Backend uses Firebase JWT library (not Laravel Sanctum as mentioned in README)
- Custom PHP framework with PDO - not Laravel/Symfony
- PostgreSQL port 5532 is custom to avoid conflicts with default 5432

### Critical Architecture Clarifications
- **IMPORTANT**: The README.md is outdated - this is NOT a Laravel project
- The backend is a **custom PHP framework** with its own routing and middleware system
- Authentication uses **Firebase JWT**, not Laravel Sanctum
- Database operations use **direct PDO**, not Eloquent ORM
- No Artisan commands - all database operations use direct SQL files
- No Composer autoloading for controllers - custom autoloader in `includes/autoload.php`

### UI/UX Design System - Tema Militar/Tático Definitivo
The project uses a **monochromatic military/police themed design system**:

#### **Core Color Palette**:
- **Primary**: Black (#000000), White (#FFFFFF)
- **Military Base**: #14242f (tactical blue-gray - cor principal do tema)
- **Gray Scale**: gray-50 to gray-950 (tons de cinza para hierarquia)
- **Accent Colors**:
  - accent-500: #facc15 (tactical yellow - destaque principal)
  - accent-600: #e5b91e (yellow hover - light theme)  
  - accent-650: #d06e0f (orange hover - dark theme)

#### **Button Color System**:
- **Light Theme**: `bg-accent-500 hover:bg-accent-600 text-black`
- **Dark Theme**: `dark:bg-gray-100 dark:hover:bg-accent-650 dark:text-black dark:hover:text-white`
- **Ghost Buttons**: `hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30`

#### **Typography System**: 
- **Headings**: Orbitron (font-police-title) - uppercase, tracking-wider
- **Subtitles**: Rajdhani (font-police-subtitle) - uppercase, tracking-wider
- **Body**: Rajdhani (font-police-body) - normal case
- **Numbers**: Exo 2 (font-police-numbers) - para estatísticas

#### **Visual Effects & Patterns**:
- **Cards**: 
  - Base: `bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm`
  - Military: `border-l-4 border-l-accent-500` (tactical stripe)
  - Hover: `hover:shadow-xl transition-all duration-300`
- **Backgrounds**:
  - Headers: `bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-900`
  - Tactical Pattern: `backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,204,21,0.3) 1px, transparent 0)'`
- **Borders**: 
  - Standard: `border-gray-200 dark:border-gray-700`
  - Tactical: `border-accent-500` ou `border-accent-500/30`
- **Text Colors**: 
  - Primary: `text-gray-900 dark:text-white`
  - Secondary: `text-gray-600 dark:text-gray-400`
  - Tactical: `text-accent-500`
- **Inputs**: `bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600`

#### **Terminologia Militar (Páginas do Aluno)**:
- **Dashboard**: "COMANDO TÁTICO", "OPERADOR", "ARSENAL TÁTICO"
- **Flashcards**: "ARSENAL", "INTEL CARDS", "BRIEFINGS"
- **Simulados**: "OPERAÇÕES", "ALVOS", "MISSÕES"
- **Estatísticas**: "ALVOS ELIMINADOS", "PRECISÃO TÁTICA", "TAXA DE SUCESSO"
- **Usuário**: "OPERADOR", "AGENTE", "RECRUTA"
- **Planos**: "CLEARANCE", "AUTORIZAÇÃO"
- **Progresso**: "STATUS OPERACIONAL", "MISSÃO COMPLETA"

#### **Componentes Táticos Especiais**:
- **Tactical Stripes**: Linhas verticais/horizontais em accent-500
- **Corner Accents**: `<div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />`
- **Badge System**: Cores específicas por tipo (blue, green, yellow, purple, red, indigo, orange)
- **Animações**: Framer Motion com `whileHover`, `initial`, `animate`
- **Gradientes**: Sempre incluindo #14242f (military base) nos gradientes

### Troubleshooting

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker compose ps

# Test database connection
docker exec -it estudos-postgres psql -U estudos_user -d estudos_db -c "SELECT 1"

# Reset database
docker exec -i estudos-postgres psql -U estudos_user -d estudos_db < backend/database/complete_fix.sql
```

#### Frontend Build Errors
```bash
# Clear node modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

#### Backend API Issues
```bash
# Check PHP syntax
cd backend/public
php -l index.php

# Verify composer autoload
cd backend
composer dump-autoload

# Check file permissions
chmod -R 755 backend/public
```

#### Authentication Problems
- Default admin: `admin@studypro.com` / `Admin@123`
- Test student: `aluno@example.com` / `aluno123`
- JWT tokens stored in localStorage key: `token`
- Auth state persisted in localStorage key: `auth-storage`

#### Docker Issues
```bash
# Full reset
make clean
make build
make up-postgres

# View logs for specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8180  # Backend API URL
```

### Backend (.env)
```env
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5532
DB_DATABASE=estudos_db
DB_USERNAME=estudos_user
DB_PASSWORD=estudos_pass

JWT_SECRET=your-jwt-secret-here
```

## Testing Commands

### Frontend Testing
```bash
# Currently no test framework is configured
# Frontend uses ESLint for code quality
cd frontend
npm run lint               # Run ESLint with TypeScript rules
npm run build              # Build and TypeScript check (recommended before commits)
```

### Backend Testing
```bash
# No unit test framework configured
# Manual testing via endpoints
curl http://localhost:8180/api/v1/test  # Health check endpoint

# Test specific endpoints with authentication
TOKEN="your-jwt-token"
curl -H "Authorization: Bearer $TOKEN" http://localhost:8180/api/v1/users

# Test file uploads
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/image.jpg" \
  http://localhost:8180/api/v1/courses/1/image
```

### Running Single Tests
Since no test framework is configured, testing is done manually:
- Frontend: Use browser developer tools and React Developer Tools
- Backend: Use curl commands or tools like Postman/Insomnia
- Database: Test queries directly in psql

## Code Quality Commands

### Before Committing Changes
```bash
# Frontend - always run these commands
cd frontend
npm run lint               # Check for linting errors
npm run build              # TypeScript compilation and build check

# Backend - syntax check
cd backend/public
php -l index.php           # Check PHP syntax
```

## Git Commit Convention
The project follows conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance

## Recent Updates

### **2025-08-11**: Backend Node.js com Sistema de Flashcards
- **Migração completa do backend de Rust para Node.js + TypeScript + Express**
- **Sistema de Flashcards com algoritmo SM-2 de repetição espaçada implementado**
- **API RESTful completa com autenticação JWT funcional**
- **Integração do NewFlashcard.tsx com backend (100% funcional)**

#### **Backend Node.js Implementado:**
- **Arquitetura**: Express + TypeScript com modularização por rotas
- **Autenticação**: JWT com middleware de proteção de rotas
- **Persistência**: JSON files para consistência com outros sistemas
- **Endpoints Flashcards**:
  - `GET /api/v1/flashcards` - Listar com filtros e paginação
  - `GET /api/v1/flashcards/stats` - Estatísticas agregadas
  - `GET /api/v1/flashcards/filters` - Opções de filtros
  - `GET /api/v1/flashcards/:id` - Buscar flashcard específico
  - `POST /api/v1/flashcards` - Criar novo flashcard (admin)
  - `PUT /api/v1/flashcards/:id` - Atualizar flashcard (admin)
  - `DELETE /api/v1/flashcards/:id` - Excluir flashcard (admin)
  - `POST /api/v1/flashcards/:id/study` - Registrar sessão de estudo
  - `POST /api/v1/flashcards/bulk-import` - Importação em lote (admin)

#### **Algoritmo SM-2 Implementado:**
- **Ease Factor**: Ajustado baseado na qualidade da resposta (0-5)
- **Interval**: Calculado dinamicamente (1, 6, n*ease_factor dias)
- **Next Review**: Data calculada automaticamente
- **Correct Rate**: Taxa de acerto atualizada a cada estudo

#### **Integração Frontend Concluída:**
- ✅ `flashcardService.ts` - Serviço completo com 406 linhas
- ✅ `NewFlashcard.tsx` - Integrado com API (criação funcional)
- ✅ Validações tipo-específicas implementadas
- ✅ Teste completo da API executado com sucesso

### **2025-08-05**: Sistema de Provas Anteriores Militares
- Nova página: `PreviousExamsMilitary.tsx` com tema militar/tático completo
- Interface com terminologia militar: "OPERAÇÕES", "ARSENAIS", "COMANDO"
- Filtros avançados e estatísticas de desempenho tático

### **2025-08-02**: Sistema Completo de Flashcards Individuais
Implementação total dos 7 tipos de flashcard com interface profissional para apresentação:

#### **Páginas Implementadas:**

**📄 IndividualFlashcards.tsx** (`/admin/flashcards/cards`)
- **Gestão Completa**: Interface para gerenciar flashcards avulsos (sem necessidade de deck)
- **Filtros Avançados**: Categoria, subcategoria, tipo, dificuldade, status
- **Visualizações**: Grid e lista com alternância dinâmica
- **Ações em Lote**: Seleção múltipla para estudar, duplicar, arquivar
- **Estatísticas Dinâmicas**: Contadores em tempo real (total, ativos, revisões, taxa de acerto)
- **Estado Funcional**: CRUD operations completas com React state
- **Modais Integrados**: Preview e estudo totalmente funcionais

**📄 NewFlashcard.tsx** (`/admin/flashcards/cards/new`)
- **7 Tipos Suportados**: Básico, Invertido, Lacunas, Múltipla Escolha, V/F, Digite Resposta, Oclusão de Imagem
- **Templates Automáticos**: Botão "CARREGAR EXEMPLO" com dados de demonstração
- **Preview em Tempo Real**: Visualização instantânea das alterações
- **Validação Específica**: Para cada tipo de flashcard
- **Configurações Avançadas**: Categoria, subcategoria, dificuldade, tags
- **Editor de Oclusão**: Modal integrado para imagens com áreas

**📄 FlashcardPreviewModal.tsx**
- **Visualização Completa**: Suporte para todos os 7 tipos
- **Toggle Resposta**: Mostrar/ocultar com animações
- **Metadados**: Estatísticas, tags, autor, datas
- **Ações Integradas**: Estudar, editar, duplicar, arquivar

**📄 FlashcardStudyModal.tsx**
- **Sessões Interativas**: Navegação entre cartões com progress bar
- **Auto-avaliação**: Botões "Acertei/Errei" para tracking
- **Suporte Completo**: Individual ou em lote
- **Relatório Final**: Estatísticas da sessão (acertos, tempo, precisão)

**📄 ImageOcclusionEditor.tsx**
- **Editor Visual**: Interface para criar áreas de oclusão
- **Formas Múltiplas**: Retângulos e círculos
- **Preview Integrado**: Visualização das áreas configuradas
- **Respostas Personalizadas**: Para cada área de oclusão

#### **Tipos de Flashcard Implementados:**

1. **Básico (Frente/Verso)**: Pergunta e resposta tradicional
2. **Básico Invertido**: Com informação extra e cartão reverso automático
3. **Lacunas (Cloze)**: Texto com {{c1::palavras}} ocultadas
4. **Múltipla Escolha**: 4 alternativas com explicação
5. **Verdadeiro/Falso**: Afirmação com explicação
6. **Digite a Resposta**: Campo de texto com dica opcional
7. **Oclusão de Imagem**: Imagem com áreas ocultas interativas

#### **Features de Apresentação:**
- **Interface Profissional**: Design militar/tático consistente
- **Funcionalidade Real**: Todos os botões executam ações reais
- **Templates Prontos**: Exemplos pré-configurados para demonstração
- **Estado Dinâmico**: Atualizações em tempo real sem recarregamento
- **Validação Completa**: Prevenção de erros específica por tipo
- **Navegação Fluida**: Rotas configuradas e funcionais

#### **Rotas Implementadas:**
- `/admin/flashcards/cards` - Lista de flashcards individuais
- `/admin/flashcards/cards/new` - Criar novo flashcard
- `/admin/flashcards/cards/:id/edit` - Editar flashcard existente

#### **Arquivos Criados/Modificados:**
- ✅ `frontend/src/pages/admin/IndividualFlashcards.tsx` (NOVO)
- ✅ `frontend/src/pages/admin/NewFlashcard.tsx` (NOVO)
- ✅ `frontend/src/components/FlashcardPreviewModal.tsx` (NOVO)
- ✅ `frontend/src/components/FlashcardStudyModal.tsx` (NOVO)
- ✅ `frontend/src/components/ImageOcclusionEditor.tsx` (NOVO)
- ✅ `frontend/src/components/ImageOcclusionPreview.tsx` (NOVO)
- ✅ `frontend/src/Router.tsx` (ATUALIZADO)
- ✅ `frontend/src/pages/admin/FlashcardManager.tsx` (ATUALIZADO)

**Sistema 100% funcional e pronto para apresentação profissional.**

### **2025-08-15**: Padronização StatCard + Correção API Mockexams
Padronização de todos os status cards das páginas do aluno com StatCard component:

#### **StatCard Component Padronizado:**
- **Tamanho**: `size="sm"` para adaptação a monitores menores
- **Variant**: `variant="tactical"` com tactical stripes
- **Design**: Tema militar/policial consistente com fonts
- **Props**: `title`, `value`, `icon`, `color`, `variant`, `size`

#### **Páginas Atualizadas:**
- ✅ `SummariesPage.tsx` - Cards de briefings e estatísticas 
- ✅ `FlashcardsPage.tsx` - Cards de arsenal e progresso
- ✅ `CoursesPage.tsx` - Cards de operações e modalidade
- ✅ `MyCoursesPage.tsx` - Cards de horas, sequência, missões, eficiência

#### **Benefícios:**
- **Responsivo**: Melhor adaptação para monitores menores
- **Consistente**: Design tático uniforme em todas as páginas
- **Compacto**: Tamanho otimizado baseado nos cards de provas
- **Acessível**: Tactical stripes e cores para hierarquia visual

#### **Correções da API e Frontend:**
- ✅ **Porta Corrigida**: Atualização de 8182 → 8180 em todas as configurações
- ✅ **BaseURL Ajustado**: mockExamService.ts `/api/v1/mockexams` → `/mockexams`
- ✅ **Erro 404 Resolvido**: Endpoint `/api/v1/mockexams/available` agora retorna 200
- ✅ **Arquivos Atualizados**: 9 arquivos de configuração da API corrigidos
- ✅ **SummariesPage Corrigida**: Erro 'exampleContent is not defined' resolvido
- ✅ **Type Safety**: Adicionado type assertions para propriedades opcionais
- ✅ **Layout Resumo Interativo**: Barra de progresso não sobrepõe mais o conteúdo
- ✅ **Comentários Collapsible**: Botão ocultar/mostrar com animação suave
- ✅ **Responsividade**: Barra de progresso adaptada para telas menores
- ✅ **Funcionalidade "PRÓXIMA SEÇÃO"**: Navegação automática com scroll suave
- ✅ **Funcionalidade "MARCAR CONCLUÍDO"**: Estados visuais e feedback completo
- ✅ **Progresso Dinâmico**: Calculado baseado nas seções expandidas
- ✅ **Visual Feedback**: Toast notifications e mudança de cores

### **2025-08-05**: Logo do Sistema Integrada aos Flashcards + Documentação Completa
Integração da logo oficial do sistema nos flashcards de estudo e criação de documentação completa das páginas:

#### **Logo Integrada ao Sistema de Flashcards:**

**📄 FlashcardsPage.tsx**
- **Logo Oficial**: Integrada `StudyProLogo` component (`Logo_colorida_2.png`) 
- **Posicionamento**: Logo posicionada acima do flashcard como header integrado
- **Design Tático**: Header com gradiente militar e separador visual
- **Informações**: Logo + separador + nome do curso em estilo tático
- **Consistência**: Mesma logo usada em admin e login

#### **Documentação Completa das Páginas:**

**📄 FRONTEND_PAGES_DOCUMENTATION.md** (NOVO)
- **29 Páginas Documentadas**: 13 Admin + 12 Student + 4 Public/Auth
- **Análise Detalhada**: Funcionalidades, botões, filtros, recursos
- **Organização**: Por tipo de usuário (admin/student/public)
- **Recursos Especiais**: 7 tipos de flashcards, tema militar, animações
- **Referência Completa**: Para desenvolvimento e manutenção

#### **Arquivos Atualizados:**
- ✅ `frontend/src/pages/student/FlashcardsPage.tsx` (LOGO INTEGRADA)
- ✅ `FRONTEND_PAGES_DOCUMENTATION.md` (NOVA DOCUMENTAÇÃO COMPLETA)

**Sistema com logo padronizada e documentação completa de todas as funcionalidades.**

### **2025-08-05**: Finalização Sistema Flashcards Aluno + Tema Militar/Tático Completo
Implementação final do sistema de flashcards para estudantes e padronização do tema militar/tático:

#### **Sistema de Flashcards para Estudantes:**

**📄 FlashcardsPage.tsx** (Estudante)
- **Todos os 7 Tipos Visíveis**: Dashboard mostrando cada tipo com contadores
- **Interface de Estudo**: StudyCard component suportando todos os tipos
- **Algoritmo SRS**: SuperMemo 2 (SM-2) implementado para repetição espaçada
- **Criação de Arsenais**: Permitir estudantes criarem decks personalizados
- **Visualização Clara**: Badges coloridos por tipo, informações específicas
- **Estatísticas**: Dashboard completo de progresso e performance

**Visualização dos 7 Tipos:**
1. **🔵 BÁSICO** - Pergunta e resposta tradicional (2 exemplos)
2. **🟢 BÁSICO INVERTIDO** - Com cartão reverso automático (1 exemplo)  
3. **🟡 LACUNAS (CLOZE)** - Texto com {{c1::palavras}} ocultadas (2 exemplos)
4. **🟣 MÚLTIPLA ESCOLHA** - 4 alternativas com explicação (2 exemplos)
5. **🔴 VERDADEIRO/FALSO** - Avaliação de afirmações (1 exemplo)
6. **🟦 DIGITE RESPOSTA** - Campo de texto com dica (1 exemplo)
7. **🟠 OCLUSÃO IMAGEM** - Áreas ocultas em imagens (1 exemplo)

#### **Tema Militar/Tático Padronizado:**

**📄 MockExamsPageSimple.tsx**
- **Design System Completo**: Animações Framer Motion, tactical stripes
- **Filtros Avançados**: Busca, dificuldade, organização
- **Stats Dashboard**: Cards com métricas táticas
- **Terminologia Militar**: "ARSENAIS", "OPERAÇÕES", "ALVOS", "COMANDO"

**📄 ExamResultsPage.tsx**
- **Interface Tática**: Cores militares, badges operacionais
- **Análise Completa**: Revisão de questões com tema militar
- **Estatísticas**: "ALVOS ELIMINADOS/PERDIDOS", "OPERAÇÃO CONCLUÍDA"

**📄 ExamTakingPage.tsx**
- **Correções de Sintaxe**: Função handleSubmitExam corrigida
- **Tema Consistente**: Terminologia e design militar aplicados

#### **Features Implementadas:**
- **Visualização Clara**: Dashboard destacando todos os 7 tipos
- **Sistema SRS Funcional**: Algoritmo SuperMemo 2 para otimização
- **Interface Tática**: Design militar/policial consistente
- **Exemplos Reais**: 10 flashcards demonstrando todos os tipos
- **Funcionalidade Completa**: Estudo, criação, estatísticas

#### **Arquivos Atualizados:**
- ✅ `frontend/src/pages/student/FlashcardsPage.tsx` (GRANDE ATUALIZAÇÃO)
- ✅ `frontend/src/pages/student/MockExamsPageSimple.tsx` (TEMA MILITAR)
- ✅ `frontend/src/pages/student/ExamResultsPage.tsx` (TEMA MILITAR)
- ✅ `frontend/src/pages/student/ExamTakingPage.tsx` (CORREÇÕES + TEMA)

**Sistema de flashcards 100% visível para estudantes com tema militar/tático completo.**

### **2025-08-12**: Frontend Admin 100% Livre de Dados Hardcoded
Eliminação completa de dados hardcoded/fake do frontend admin com integração total às APIs:

#### **Arquivos Corrigidos:**
- **`PreviousExamsManagerSimple.tsx`**: Removido array hardcoded (62 linhas), integrado com `previousExamService`
- **`MockExamManagerSimple.tsx`**: Removido array hardcoded (35 linhas), integrado com `mockExamService`  
- **`FlashcardManager.tsx`**: Removido array hardcoded (75 linhas) + corrigidas refs `flashcardDecks`, integrado com `flashcardService`
- **`test-courses-api.sh`**: Corrigidos caminhos dos endpoints de lessons (adicionado prefixo `/courses`)

#### **Funcionalidades Implementadas:**
- **Loading States**: Spinners e mensagens durante carregamento da API
- **Error Handling**: Tratamento de erros com retry automático
- **Debounced Search**: Busca com delay de 500ms para otimização
- **Real-time Stats**: Estatísticas calculadas dinamicamente dos dados da API
- **API Integration**: Todos os CRUD operations funcionais

#### **Verificação Completa:**
- ✅ 25 arquivos admin verificados para hardcoded data
- ✅ Zero arrays hardcoded encontrados no frontend
- ✅ 100% dos dados admin vêm das APIs backend
- ✅ Sistema de testes corrigido (18/18 courses tests passing)

**Admin frontend agora totalmente livre de dados mock/hardcoded - apenas dados reais das APIs.**

### **2025-08-03**: Sistema de Provas Anteriores e Simulados
Implementação dos sistemas de gestão de provas anteriores e simulados:

#### **Database Schema Extensions:**
- **`previous_exams`**: Concursos/exames anteriores com metadados completos (organização, banca, ano, posição)
- **`previous_exam_questions`**: Questões das provas anteriores linkadas aos exames
- **`mock_exams`**: Simulados personalizados criados pelos administradores
- **`mock_exam_attempts`**: Tentativas dos usuários nos simulados

#### **SQL Migration:**
```bash
# Adicionar sistema de provas anteriores
PGPASSWORD=estudos_pass psql -h localhost -p 5532 -U estudos_user -d estudos_db -f backend/database/add_previous_exams.sql
```

#### **Páginas Implementadas:**
- **Admin**: `MockExamManager.tsx`, `PreviousExamsManager.tsx` - Gestão completa
- **Student**: `PreviousExamsStudentPage.tsx`, `MockExamsPage.tsx` - Interface de estudo
- **Variações**: Multiple implementations (Simple, Improved) para diferentes UX approaches

## Common Development Patterns

### Adding a New API Endpoint
1. Create controller in `backend/public/app/Controller/Api/`
2. Register route in `backend/public/routes/api/v1/`
3. Add endpoint to `frontend/src/config/api.ts`
4. Create service function in `frontend/src/services/`

### Adding a New Frontend Page
1. Create component in appropriate directory (`admin/`, `student/`, etc.)
2. Add route in `frontend/src/Router.tsx` with proper role protection
3. Follow existing component patterns for consistency
4. Use existing UI components and design system

### Database Changes
1. Create SQL migration file in `backend/database/`
2. Apply with: `psql -h localhost -p 5532 -U estudos_user -d estudos_db -f your_migration.sql`
3. Update sample data if needed
4. No ORM migrations - use direct SQL files

### Working with Flashcards
The system supports 7 flashcard types with full implementation:
1. Basic (front/back)
2. Basic Inverted (with reverse card)
3. Cloze (fill-in-the-blank with {{c1::text}})
4. Multiple Choice (4 options)
5. True/False (with explanation)
6. Type Answer (text input)
7. Image Occlusion (interactive areas)

### File Upload Handling
- Course images: POST to `/api/v1/courses/{id}/image`
- Use multipart/form-data
- Backend handles file storage in `uploads/` directory
- Frontend uses FormData API

## Performance Considerations
- Frontend uses lazy loading and code splitting
- Vite configured for optimal build output
- Database has proper indexes (check `backend/database/schema_postgres.sql`)
- Use React Query for API caching
- Zustand for lightweight state management