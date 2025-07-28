# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Frontend (React + Vite)
```bash
# Development
cd frontend
npm run dev          # Start development server on port 5173

# Build & Lint
npm run build        # Build for production (includes TypeScript check via tsc -b)
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend (PHP)
```bash
# Development
cd backend/public
php -S localhost:8000   # Start PHP development server

# Dependencies
cd backend
composer install        # Install PHP dependencies
```

### Docker Development
```bash
# Start all services
make up              # Start with MySQL
make up-postgres     # Start with PostgreSQL (recommended)

# Service management
make down            # Stop all services
make restart         # Restart services
make logs            # View logs
make build           # Rebuild containers

# Shell access
make shell-backend   # Access backend container
make shell-frontend  # Access frontend container
```

### Database
```bash
# PostgreSQL is the primary database
# Connection: postgres://estudos_user:estudos_pass@localhost:5532/estudos_db

# Run migrations (inside backend/database/)
psql -h localhost -p 5532 -U estudos_user -d estudos_db -f schema_postgres.sql
psql -h localhost -p 5532 -U estudos_user -d estudos_db -f sample_data.sql
```

## Architecture Overview

### Frontend Architecture
The frontend is a React SPA with the following structure:

- **State Management**: Zustand with persist middleware for auth state
- **API Integration**: Axios with centralized configuration in `src/config/api.ts`
- **Routing**: React Router v6 with role-based access control
- **UI Components**: Custom components built on Tailwind CSS + shadcn/ui patterns
- **Authentication**: JWT tokens stored in localStorage, managed by authStore

Key architectural decisions:
- All API endpoints are defined in `src/config/api.ts`
- Authentication state persists across sessions using Zustand persist
- Components are organized by feature (admin/, student/, auth/, public/)
- Services layer (`src/services/`) handles API communication

### Backend Architecture
The backend is a custom PHP framework with MVC pattern:

- **Routing**: Custom router in `app/Http/Router.php` with middleware support
- **Controllers**: Located in `app/Controller/Api/` with versioned endpoints
- **Authentication**: JWT-based using Firebase JWT library
- **Database**: Direct PDO connections managed by `includes/Database.php`
- **API Versioning**: All routes prefixed with `/api/v1/`

Key architectural decisions:
- No Laravel/Symfony - custom lightweight PHP framework
- JWT tokens for stateless authentication
- RESTful API design with consistent endpoint patterns
- Middleware system for request processing

### Database Schema
PostgreSQL database with these core tables:
- `users`: User accounts with roles (student, admin, instructor)
- `courses`: Course catalog with metadata
- `course_modules`: Course structure organization
- `lessons`: Individual lessons within modules
- `questions`: Question bank for quizzes
- `flashcards`: Spaced repetition cards

### API Authentication Flow
1. POST `/api/v1/auth/login` with credentials
2. Receive JWT token in response
3. Include token in `Authorization: Bearer <token>` header
4. Token verified by middleware on protected routes

### Development Workflow
1. Frontend runs on port 5173 (Vite dev server)
2. Backend API runs on port 8180 (via Docker)
3. PostgreSQL database on port 5532
4. CORS configured to allow frontend-backend communication
5. Hot reload enabled for both frontend and backend in Docker

### Important Notes
- Always run `npm run build` (includes TypeScript check) before committing frontend changes
- API base URL is configured via `VITE_API_URL` environment variable
- Authentication tokens expire after 24 hours
- File uploads for course images use multipart/form-data to `/api/v1/courses/{id}/image`
- The project uses integer IDs, not UUIDs (migration completed)

### Known Issues & Solutions
- If encountering database errors, ensure all tables are created by running:
  ```bash
  docker exec -i estudos-postgres psql -U estudos_user -d estudos_db < backend/database/complete_fix.sql
  ```
- Default admin credentials: `admin@studypro.com` / `Admin@123`
- The backend uses custom Environment loader that skips empty lines and comments in .env files