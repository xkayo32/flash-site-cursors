#!/bin/bash

# Script to automatically detect server IP and configure the application

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up server with actual IP address${NC}"

# Function to get the server's IP address
get_server_ip() {
    # Try to get the primary network interface IP (excluding localhost)
    # This works on most Linux systems
    ip route get 1 | awk '{print $7; exit}' 2>/dev/null || \
    hostname -I | awk '{print $1}' 2>/dev/null || \
    ip addr show | grep -E "inet " | grep -v "127.0.0.1" | head -1 | awk '{print $2}' | cut -d'/' -f1
}

# Detect server IP
SERVER_IP=$(get_server_ip)

if [ -z "$SERVER_IP" ]; then
    echo -e "${RED}❌ Could not detect server IP address${NC}"
    echo "Please enter your server IP manually:"
    read SERVER_IP
fi

echo -e "${YELLOW}📍 Detected Server IP: ${SERVER_IP}${NC}"

# Create frontend .env file
FRONTEND_ENV="/home/administrator/flash-site-cursos/frontend/.env"
echo -e "${GREEN}📝 Creating frontend .env file...${NC}"

cat > "$FRONTEND_ENV" <<EOF
# API Configuration
VITE_API_URL=http://${SERVER_IP}:8180/api
VITE_APP_URL=http://${SERVER_IP}:5273

# Application Settings
VITE_APP_NAME=StudyPro
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
EOF

echo -e "${GREEN}✅ Frontend .env created${NC}"

# Create or update docker-compose override for production
DOCKER_OVERRIDE="/home/administrator/flash-site-cursos/docker-compose.override.yml"
echo -e "${GREEN}📝 Creating docker-compose override file...${NC}"

cat > "$DOCKER_OVERRIDE" <<EOF
version: '3.8'

services:
  frontend:
    environment:
      - VITE_API_URL=http://${SERVER_IP}:8180/api
      - VITE_APP_URL=http://${SERVER_IP}:5273
EOF

echo -e "${GREEN}✅ Docker compose override created${NC}"

# Create a startup script with the server IP
STARTUP_SCRIPT="/home/administrator/flash-site-cursos/start-server.sh"
echo -e "${GREEN}📝 Creating startup script...${NC}"

cat > "$STARTUP_SCRIPT" <<EOF
#!/bin/bash

# StudyPro Server Startup Script
# Server IP: ${SERVER_IP}

echo "🚀 Starting StudyPro Server"
echo "📍 Server IP: ${SERVER_IP}"
echo ""

# Change to project directory
cd /home/administrator/flash-site-cursos

# Start services with docker compose
docker compose up -d

echo ""
echo "✅ Services started successfully!"
echo ""
echo "🌐 Access points:"
echo "   Frontend:    http://${SERVER_IP}:5273"
echo "   Backend API: http://${SERVER_IP}:8180"
echo "   phpMyAdmin:  http://${SERVER_IP}:8280"
echo ""
echo "📊 View logs:"
echo "   docker compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker compose down"
EOF

chmod +x "$STARTUP_SCRIPT"
echo -e "${GREEN}✅ Startup script created${NC}"

# Update Makefile to show actual server IP
echo -e "${GREEN}📝 Creating updated Makefile...${NC}"

MAKEFILE_NEW="/home/administrator/flash-site-cursos/Makefile.new"
cat > "$MAKEFILE_NEW" <<'EOF'
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
EOF

# Backup original Makefile and replace
cp /home/administrator/flash-site-cursos/Makefile /home/administrator/flash-site-cursos/Makefile.backup
mv "$MAKEFILE_NEW" /home/administrator/flash-site-cursos/Makefile

echo -e "${GREEN}✅ Makefile updated${NC}"

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Summary:${NC}"
echo "   - Server IP: ${SERVER_IP}"
echo "   - Frontend .env created"
echo "   - Docker compose override created"
echo "   - Startup script created: ${STARTUP_SCRIPT}"
echo "   - Makefile updated to show actual IP"
echo ""
echo -e "${YELLOW}🚀 To start the server:${NC}"
echo "   1. Run: ${STARTUP_SCRIPT}"
echo "   2. Or use: make up"
echo ""
echo -e "${YELLOW}🌐 Services will be available at:${NC}"
echo "   - Frontend:    http://${SERVER_IP}:5273"
echo "   - Backend API: http://${SERVER_IP}:8180"
echo "   - phpMyAdmin:  http://${SERVER_IP}:8280"