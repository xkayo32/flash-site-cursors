# StudyPro Makefile

# Get server IP
SERVER_IP := $(shell ip route get 1 | awk '{print $$7; exit}' 2>/dev/null || hostname -I | awk '{print $$1}' 2>/dev/null || echo "localhost")

# Colors
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

.PHONY: up down restart build logs shell-backend shell-frontend migrate clean help

help:
	@echo "$(GREEN)StudyPro - Available commands:$(NC)"
	@echo "  make up        - Start all services"
	@echo "  make down      - Stop all services"
	@echo "  make restart   - Restart all services"
	@echo "  make build     - Rebuild all containers"
	@echo "  make logs      - View logs for all services"
	@echo "  make clean     - Remove all containers and volumes"

up:
	@echo "$(GREEN)Starting StudyPro services...$(NC)"
	@docker compose up -d
	@echo ""
	@echo "$(GREEN)✅ Services started successfully!$(NC)"
	@echo ""
	@echo "$(YELLOW)🌐 Access points:$(NC)"
	@echo "   Frontend:    http://$(SERVER_IP):5273"
	@echo "   Backend API: http://$(SERVER_IP):8180"
	@echo "   phpMyAdmin:  http://$(SERVER_IP):8280"

down:
	@echo "$(YELLOW)Stopping StudyPro services...$(NC)"
	@docker compose down
	@echo "$(GREEN)✅ Services stopped$(NC)"

restart:
	@echo "$(YELLOW)Restarting StudyPro services...$(NC)"
	@docker compose restart
	@echo "$(GREEN)✅ Services restarted$(NC)"

build:
	@echo "$(GREEN)Building StudyPro containers...$(NC)"
	@docker compose build
	@echo "$(GREEN)✅ Build complete$(NC)"

logs:
	@docker compose logs -f

shell-backend:
	@docker compose exec backend sh

shell-frontend:
	@docker compose exec frontend sh

migrate:
	@echo "$(GREEN)Running database migrations...$(NC)"
	@docker compose exec backend php artisan migrate
	@echo "$(GREEN)✅ Migrations complete$(NC)"

clean:
	@echo "$(YELLOW)⚠️  This will remove all containers and volumes!$(NC)"
	@echo "Press Ctrl+C to cancel or Enter to continue..."
	@read confirm
	@docker compose down -v
	@echo "$(GREEN)✅ Cleanup complete$(NC)"
