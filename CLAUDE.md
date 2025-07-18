# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Plataforma educacional para preparação de concursos com sistema de questões, flashcards com repetição espaçada, simulados e recursos interativos.

## Technology Stack

### Backend (PHP/Laravel)
- **Framework**: Laravel 10+ com PHP 8.2+
- **Database**: MySQL/PostgreSQL com migrations Eloquent
- **Auth**: Laravel Sanctum para API authentication
- **Queue**: Laravel Queues com Redis
- **Cache**: Redis
- **Testing**: PHPUnit

### Frontend (React/TypeScript)
- **Build**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand + React Query (TanStack Query)
- **Video**: Video.js para streaming HLS
- **Animations**: Framer Motion
- **PWA**: Workbox para offline functionality

## Common Commands

### Backend Development
```bash
# Start Laravel development server
cd backend && php artisan serve

# Run database migrations
php artisan migrate

# Run queue worker for async jobs
php artisan queue:work

# Run tests
php artisan test

# Clear all caches
php artisan optimize:clear

# Generate API documentation
php artisan l5-swagger:generate
```

### Frontend Development
```bash
# Start development server
cd frontend && npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint and format code
npm run lint
npm run format

# Type checking
npm run type-check
```

## Architecture Overview

### Backend Structure
```
backend/
├── app/
│   ├── Http/Controllers/   # API controllers
│   ├── Models/             # Eloquent models
│   ├── Services/           # Business logic
│   ├── Jobs/               # Async jobs (import Anki, etc)
│   └── Policies/           # Authorization policies
├── database/
│   ├── migrations/         # Database structure
│   └── seeders/           # Test data
└── routes/
    └── api.php            # API endpoints
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Route pages
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API integration
│   ├── store/            # Zustand stores
│   └── utils/            # Helper functions
```

## Key Features Implementation

### Spaced Repetition Algorithm (SM-2)
- Located in: `backend/app/Services/SpacedRepetitionService.php`
- Frontend logic: `frontend/src/utils/spacedRepetition.ts`
- Uses factors: ease (2.5 default), interval, repetitions

### Video Progress Tracking
- Backend: `VideoProgressController` saves timestamps every 10 seconds
- Frontend: `VideoPlayer` component with Video.js integration
- Supports multiple quality levels and playback speeds

### Offline Functionality
- Service Worker: `frontend/src/service-worker.js`
- IndexedDB for flashcards: `frontend/src/utils/offline.ts`
- Background sync when connection restored

### Authentication Flow
1. Login via `POST /api/login` returns Sanctum token
2. Token stored in localStorage and axios headers
3. Protected routes check auth status via React Router
4. Backend validates token on each request

## Testing Guidelines

### Backend Testing
- Feature tests for API endpoints
- Unit tests for services and algorithms
- Use factories for test data generation
- Run specific test: `php artisan test --filter=TestName`

### Frontend Testing
- Component tests with React Testing Library
- Integration tests for API calls
- E2E tests with Cypress (optional)
- Mock API responses for isolated testing

## Performance Considerations

1. **Database Queries**: Use eager loading to prevent N+1 problems
2. **API Responses**: Paginate large datasets (questions, flashcards)
3. **Frontend Bundle**: Code split by route with React.lazy()
4. **Images/Videos**: Use CDN and lazy loading
5. **Cache Strategy**: Cache question banks and static content in Redis

## Security Best Practices

1. **API Security**: Rate limiting, CORS configuration
2. **Input Validation**: Laravel Form Requests for all inputs
3. **SQL Injection**: Use Eloquent ORM, avoid raw queries
4. **XSS Prevention**: Sanitize user content, escape output
5. **Authentication**: Sanctum tokens expire, refresh mechanism

## Deployment Notes

- Use environment variables for all sensitive configs
- Run `php artisan optimize` before deploying
- Configure queue workers with Supervisor
- Set up SSL certificates for HTTPS
- Configure proper CORS headers for production domain