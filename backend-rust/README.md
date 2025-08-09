# Estudos Backend - Rust Implementation

Backend Rust implementation for the Estudos platform using Axum web framework.

## 🚀 Quick Start

### Prerequisites
- Rust 1.75+ 
- PostgreSQL 15+
- Docker (optional)

### Local Development

1. **Clone and setup**:
```bash
cd backend-rust
cp .env.example .env
# Edit .env with your configuration
```

2. **Run with Cargo**:
```bash
cargo run
```

3. **Run with Docker**:
```bash
docker-compose up --build
```

### Available Endpoints

- **Health Check**: `GET /api/v1/health`
- **Simple Health**: `GET /api/v1/health/simple`
- **Detailed Health**: `GET /api/v1/health/detailed`
- **Root Info**: `GET /`

## 📊 Health Check Response

```json
{
  "api": {
    "status": "healthy",
    "service": "estudos-backend-rust",
    "version": "0.1.0",
    "timestamp": "2025-01-XX...",
    "response_time_ms": 15
  },
  "database": {
    "status": "healthy",
    "database": "estudos_db",
    "version": "PostgreSQL 15...",
    "response_time_ms": 5,
    "pool": {
      "total_connections": 10,
      "idle_connections": 9
    }
  }
}
```

## 🏗️ Architecture

### Technology Stack
- **Framework**: Axum 0.7
- **Database**: SQLx + PostgreSQL
- **Config**: Figment (env/toml support)
- **Logging**: Tracing + tracing-subscriber
- **Error Handling**: Custom ApiError with JSON responses
- **Security**: JWT support, CORS middleware

### Project Structure
```
src/
├── config/          # Configuration management
├── database/        # Database connection & health checks
├── error/           # Error handling & API responses
├── handlers/        # HTTP request handlers
├── middleware/      # Custom middleware (CORS, etc.)
├── models/          # Data models & DTOs
├── services/        # Business logic services
└── utils/           # Utility functions
```

### Key Features
- **Performance**: Async Rust with Tokio
- **Database**: Connection pooling with health monitoring
- **Errors**: Structured error handling with proper HTTP codes
- **CORS**: Configurable CORS for frontend integration
- **Logging**: Structured logging with tracing
- **Config**: Environment-based configuration
- **Docker**: Multi-stage build for production

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | postgres://... | PostgreSQL connection string |
| `PORT` | 8180 | Server port |
| `RUST_LOG` | info | Log level (error, warn, info, debug, trace) |
| `RUST_ENV` | development | Environment (development, production) |
| `JWT_SECRET` | required | JWT signing secret |
| `CORS_ORIGINS` | localhost:5173,... | Allowed CORS origins |

### Database Pool Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_MAX_CONNECTIONS` | 10 | Maximum pool connections |
| `DB_MIN_CONNECTIONS` | 1 | Minimum pool connections |
| `DB_ACQUIRE_TIMEOUT` | 30 | Connection acquire timeout (seconds) |
| `DB_IDLE_TIMEOUT` | 600 | Connection idle timeout (seconds) |

## 🐳 Docker

### Development
```bash
docker-compose up --build
```

### Production
```bash
docker build -t estudos-backend-rust .
docker run -p 8180:8180 --env-file .env estudos-backend-rust
```

### Ports
- **Rust API**: 8181 (mapped from 8180)
- **PostgreSQL**: 5533 (mapped from 5432)

## 🧪 Testing

### Health Checks
```bash
# Basic health
curl http://localhost:8180/api/v1/health/simple

# Full health with database
curl http://localhost:8180/api/v1/health

# Detailed health with extra tests  
curl http://localhost:8180/api/v1/health/detailed
```

### Database Compatibility
The Rust backend is fully compatible with the existing PostgreSQL schema from the PHP backend. It uses the same:
- Database schema
- Connection parameters
- Table structures
- Data types

## 🔄 Migration Status

### ✅ Phase 1 - Complete
- [x] Project structure and dependencies
- [x] Configuration management (env/toml)
- [x] Database connection with SQLx
- [x] Error handling system
- [x] CORS middleware
- [x] Health check endpoints
- [x] Logging with tracing
- [x] Docker configuration

### 🔄 Phase 2 - Authentication & Users (Next)
- [ ] JWT authentication middleware
- [ ] User models and database operations
- [ ] Login/register endpoints
- [ ] Password hashing with bcrypt
- [ ] Role-based access control

### 🔄 Phase 3 - Core API (Future)
- [ ] Course management endpoints
- [ ] User management
- [ ] File upload handling
- [ ] Comprehensive API routes

## 🚨 Compatibility Notes

### Database
- Uses same PostgreSQL database as PHP backend
- Compatible with existing schema
- Same connection parameters (port 5532)
- No data migration required

### Frontend
- CORS configured for React frontend
- Same API patterns as PHP backend
- Compatible authentication flow
- JSON response format maintained

## 📝 Development Notes

### Error Handling
- All errors return structured JSON responses
- HTTP status codes follow REST conventions
- Server errors are logged, client errors are not
- Database errors are automatically converted

### Performance
- Connection pooling for database efficiency
- Structured logging for production monitoring
- Health checks include response time metrics
- Multi-stage Docker builds for smaller images

### Security
- CORS protection
- JWT token validation (Phase 2)
- Non-root Docker container
- Environment-based secrets