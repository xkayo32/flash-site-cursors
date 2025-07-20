# Makefile para facilitar comandos Docker

.PHONY: help up down build logs shell clean

help: ## Mostra esta mensagem de ajuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Inicia todos os containers
	docker-compose up -d
	@echo "\n✅ Serviços iniciados:"
	@echo "   Frontend: http://localhost:5273"
	@echo "   Backend: http://localhost:8180"
	@echo "   phpMyAdmin: http://localhost:8280"

down: ## Para todos os containers
	docker-compose down

build: ## Reconstrói os containers
	docker-compose build --no-cache

logs: ## Mostra logs de todos os serviços
	docker-compose logs -f

logs-frontend: ## Mostra logs do frontend
	docker-compose logs -f frontend

logs-backend: ## Mostra logs do backend
	docker-compose logs -f backend

shell-frontend: ## Acessa shell do container frontend
	docker-compose exec frontend sh

shell-backend: ## Acessa shell do container backend
	docker-compose exec backend bash

shell-db: ## Acessa MySQL
	docker-compose exec db mysql -u estudos_user -pestudos_pass estudos_db

install: ## Instala dependências nos containers
	docker-compose exec frontend npm install
	docker-compose exec backend composer install

migrate: ## Roda migrations do Laravel
	docker-compose exec backend php artisan migrate

fresh: ## Limpa banco e roda migrations
	docker-compose exec backend php artisan migrate:fresh --seed

clean: ## Remove containers, volumes e imagens
	docker-compose down -v --rmi all

restart: down up ## Reinicia todos os serviços

status: ## Mostra status dos containers
	docker-compose ps