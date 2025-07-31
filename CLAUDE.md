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

# Testing (when implemented)
npm test                   # Run tests (not currently configured)
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
make up                    # Start with MySQL
make up-postgres           # Start with PostgreSQL (recommended)

# Service management
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
# phpMyAdmin:  http://localhost:8280 (MySQL only)
```

### Database
```bash
# PostgreSQL is the primary database
# Connection: postgres://estudos_user:estudos_pass@localhost:5532/estudos_db

# Run migrations (inside backend/database/)
psql -h localhost -p 5532 -U estudos_user -d estudos_db -f schema_postgres.sql
psql -h localhost -p 5532 -U estudos_user -d estudos_db -f sample_data.sql

# Common fixes
psql -h localhost -p 5532 -U estudos_user -d estudos_db -f complete_fix.sql

# Database schema includes comprehensive tables for:
# - Users, profiles, preferences
# - Courses, modules, lessons
# - Questions, flashcards, mock exams
# - Subscriptions, payments
# - Study tracking and analytics
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
- UUID primary keys for security
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

### Code Quality Standards
- **Frontend**: TypeScript strict mode, ESLint with typescript-eslint
- **Backend**: PSR-4 autoloading, namespaced classes
- **Git**: Feature branch workflow (`feature/`, `fix/`, `docs/`)
- **Commits**: Conventional commits recommended

### Development with AI Agents
When working with Claude Code agents for better code quality:
- **Frontend Development**: Use `frontend-specialist` agent for UI/UX implementations
- **Code Review**: Always use `production-code-reviewer` agent after significant changes
- **Best Practice**: Agent builds → Agent reviews → Fix issues → Commit
- **Docker Environment**: Always test frontend changes using Docker (`make up-postgres`)

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

### UI/UX Design System
The project uses a **monochromatic military/police themed design system** consistently across all screens (Dashboard, Login, Landing Page, and Admin):

- **Color Palette (Monochromatic)**:
  - **Primary Colors**: Black (#000000), White (#FFFFFF)
  - **Military Base**: #14242f (tactical blue-gray for specific elements)
  - **Gray Scale**: Complete range from gray-50 to gray-950
  - **Accent Colors** (Limited use):
    - accent-500: #facc15 (tactical yellow) - Primary action buttons
    - accent-600: #e5b91e (yellow hover - light theme)  
    - accent-650: #d06e0f (orange hover - dark theme)
- **Button Color System**:
  - **Login Page**: Yellow buttons (bg-accent-500) with adaptive text
  - **Landing Page**: Gray/black buttons (bg-gray-900/bg-gray-100) with orange hover in dark theme
  - **Hover Behavior**: 
    - Light theme: text always black
    - Dark theme: text white normally, white on hover (login uses black on hover)
- **Typography**: 
  - Headings: Orbitron (font-police-title)
  - Subtitles: Rajdhani (font-police-subtitle) 
  - Body: Rajdhani (font-police-body)
  - Numbers: Exo 2 (font-police-numbers)
- **Theme System**:
  - Dark theme as default
  - Light theme support with proper contrast
  - Theme toggle with Sun/Moon icons positioned near navigation
  - Smooth transitions between themes
  - Theme preference saved in localStorage
- **Visual Effects**:
  - **Transparency Effects**: All cards use bg-white/90 dark:bg-gray-800/90 with backdrop-blur-sm
  - **Image Overlays**: bg-white/60 dark:bg-black/70 with lateral gradients
  - **Scan Lines**: Subtle repeating linear gradients for tactical feel
- **Design Patterns**:
  - **Strictly Monochromatic**: No colorful elements (removed red, green, blue, etc.)
  - All caps text with expanded letter spacing for headings
  - Tactical/military language ("RECRUTA", "ELITE", "COMANDO")
  - Dark backgrounds with subtle patterns
  - Consistent spacing and shadow systems
  - **Card Styles**: bg-white/90 dark:bg-gray-800/90 with backdrop-blur-sm
  - **Borders**: border-gray-200 dark:border-gray-700
  - **Text Colors**: text-gray-900 dark:text-white (primary), text-gray-600 dark:text-gray-400 (secondary)
  - **Input Fields**: bg-gray-50 dark:bg-gray-800 with border-gray-300 dark:border-gray-600
- **Key Pages Styled**:
  - Landing page: Monochromatic with gray buttons, orange hover effects
  - Login/Register: Yellow accent buttons with tactical theme
  - Admin Dashboard: "CENTRAL DE COMANDO" with monochromatic cards
  - Content Manager: Hierarchical filter system with cascading dropdowns
- **Content Management Features**:
  - **Hierarchical Filtering**: Matéria → Submatéria → Tópico cascade system
  - **Subject Tree Navigation**: Police/military course structure organization
  - **Filter Categories**: DIREITO, SEGURANÇA PÚBLICA, CONHECIMENTOS GERAIS
- **Components**:
  - Custom tactical logo (crosshair/target design)
  - WhatsApp floating button with monochromatic styling
  - Social media integration
  - Theme toggle button (useTheme hook from ThemeContext)
  - Animated card transitions with backdrop blur effects

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

### Payment Integration
- Stripe integration prepared but currently in mock mode
- Checkout page at `/checkout` with 3 subscription plans:
  - RECRUTA (Basic): R$ 97/month
  - ELITE (Premium): R$ 197/month - highlighted as most popular
  - COMANDO (Annual): R$ 1,497/year with 37% discount
- Payment form styled with military theme
- Ready for Stripe activation with environment variables

### Project Structure Notes
- Frontend dependencies: React 19, Vite 4, TypeScript 5.8, Tailwind CSS 3.4
- Backend: PHP 8.2+ with custom framework, Firebase JWT 6.11
- State management: Zustand 5 with persist, React Query 5 (TanStack Query)
- UI Components: Custom components with CVA (class-variance-authority)
- Icons: Lucide React with custom tactical SVG icons
- Form validation: Built-in HTML5 validation (no external library)
- HTTP client: Axios 1.10 with centralized configuration

### Recent Updates
- **2025-07-31**: 
  - **Admin Settings Page**: Applied military/police theme with monochromatic design
    - Created `useSystemSettings` hook for global configuration management
    - Implemented logo upload functionality that reflects across the entire system
    - StudyProLogo now supports custom logos from settings
    - Added functional General, Company, and Branding settings sections
  - **Logo Standardization**: 
    - StudyProLogo component now uses colorful logo (Logo_colorida_2.png) in both themes
    - Replaced Logo component with StudyProLogo in AdminLayout
    - Changed favicon to use the colorful logo (logo.png)
- **2025-07-30**: Standardized button colors across platform
  - All yellow buttons now use accent color palette (accent-500/600/650)
  - Dark theme hover color: #d06e0f (accent-650)
  - Pattern: bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650

## Testing Commands
```bash
# Frontend testing (when implemented)
cd frontend
npm test                   # Run tests (not currently configured)

# Backend testing
cd backend
# No automated tests currently configured
# Manual API testing: Use Postman collection at StudyPro_API_Postman_Collection.json
```

## Git Workflow
```bash
# Feature development
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# After changes
git add .
git commit -m "feat: your feature description"
git push -u origin feature/your-feature-name

# Create PR to develop branch (not main)
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