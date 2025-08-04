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

### UI/UX Design System
The project uses a **monochromatic military/police themed design system**:

- **Color Palette**:
  - Primary: Black (#000000), White (#FFFFFF)
  - Military Base: #14242f (tactical blue-gray)
  - Gray Scale: gray-50 to gray-950
  - Accent Colors:
    - accent-500: #facc15 (tactical yellow)
    - accent-600: #e5b91e (yellow hover - light theme)  
    - accent-650: #d06e0f (orange hover - dark theme)
- **Button Color System**:
  - Light Theme: `bg-accent-500 hover:bg-accent-600 text-black`
  - Dark Theme: `dark:bg-gray-100 dark:hover:bg-accent-650 dark:text-black dark:hover:text-white`
- **Typography**: 
  - Headings: Orbitron (font-police-title)
  - Subtitles: Rajdhani (font-police-subtitle) 
  - Body: Rajdhani (font-police-body)
  - Numbers: Exo 2 (font-police-numbers)
- **Visual Effects**:
  - Cards: bg-white/90 dark:bg-gray-800/90 with backdrop-blur-sm
  - Image Overlays: bg-white/60 dark:bg-black/70
  - Borders: border-gray-200 dark:border-gray-700
  - Text: text-gray-900 dark:text-white (primary), text-gray-600 dark:text-gray-400 (secondary)
  - Inputs: bg-gray-50 dark:bg-gray-800 with border-gray-300 dark:border-gray-600

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

## Recent Updates

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