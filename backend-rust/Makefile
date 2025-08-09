# Estudos Backend Rust - Development Makefile

.PHONY: help dev build test clean docker-build docker-run docker-up docker-down check fmt clippy health

# Default target
help:
	@echo "Available commands:"
	@echo "  dev          - Run development server with cargo watch"
	@echo "  build        - Build the project"
	@echo "  test         - Run tests"
	@echo "  check        - Run cargo check"
	@echo "  fmt          - Format code"
	@echo "  clippy       - Run clippy linter"
	@echo "  clean        - Clean build artifacts"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run   - Run Docker container"
	@echo "  docker-up    - Start with docker-compose"
	@echo "  docker-down  - Stop docker-compose"
	@echo "  health       - Test health endpoints"

# Development
dev:
	@echo "Starting development server..."
	cargo run

dev-watch:
	@echo "Starting development server with auto-reload..."
	cargo install cargo-watch
	cargo watch -x run

# Build
build:
	@echo "Building project..."
	cargo build

build-release:
	@echo "Building release version..."
	cargo build --release

# Testing and Quality
test:
	@echo "Running tests..."
	cargo test

check:
	@echo "Checking code..."
	cargo check

fmt:
	@echo "Formatting code..."
	cargo fmt

clippy:
	@echo "Running clippy..."
	cargo clippy -- -D warnings

# Cleaning
clean:
	@echo "Cleaning build artifacts..."
	cargo clean

# Docker commands
docker-build:
	@echo "Building Docker image..."
	docker build -t estudos-backend-rust .

docker-run:
	@echo "Running Docker container..."
	docker run -p 8180:8180 --env-file .env estudos-backend-rust

docker-up:
	@echo "Starting services with docker-compose..."
	docker-compose up --build

docker-down:
	@echo "Stopping docker-compose services..."
	docker-compose down

docker-logs:
	@echo "Showing docker logs..."
	docker-compose logs -f backend-rust

# Health checks
health:
	@echo "Testing health endpoints..."
	@echo "1. Simple health check:"
	curl -s http://localhost:8180/api/v1/health/simple | jq '.' || echo "Failed - is server running?"
	@echo "\n2. Full health check:"
	curl -s http://localhost:8180/api/v1/health | jq '.' || echo "Failed - is server running?"
	@echo "\n3. Detailed health check:"
	curl -s http://localhost:8180/api/v1/health/detailed | jq '.' || echo "Failed - is server running?"

# Setup commands
setup:
	@echo "Setting up development environment..."
	@echo "1. Copying .env.example to .env"
	cp .env.example .env
	@echo "2. Please edit .env file with your configuration"
	@echo "3. Install cargo-watch for development"
	cargo install cargo-watch

# Database commands (using existing PHP backend database)
db-test:
	@echo "Testing database connection..."
	PGPASSWORD=estudos_pass psql -h localhost -p 5532 -U estudos_user -d estudos_db -c "SELECT 1;"

# All-in-one quality check
ci: fmt clippy test check
	@echo "All quality checks passed!"

# Development workflow
start: setup dev

# Full development environment
full-start:
	@echo "Starting full development environment..."
	@echo "1. Starting PHP backend database (from parent directory)"
	cd .. && make up-postgres
	@echo "2. Starting Rust backend"
	$(MAKE) dev