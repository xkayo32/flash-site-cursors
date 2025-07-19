# Guia Docker - Plataforma de Estudos

## 🚀 Início Rápido

### 1. Pré-requisitos
- Docker instalado (versão 20+)
- Docker Compose instalado
- Make (opcional, mas recomendado)

### 2. Portas Utilizadas
Para evitar conflitos com outros projetos, usamos portas customizadas:

| Serviço     | Porta Interna | Porta Externa | URL                        |
|-------------|---------------|---------------|----------------------------|
| Frontend    | 5173          | **5273**      | http://localhost:5273      |
| Backend     | 8000          | **8180**      | http://localhost:8180      |
| MySQL       | 3306          | **3406**      | localhost:3406             |
| Redis       | 6379          | **6479**      | localhost:6479             |
| phpMyAdmin  | 80            | **8280**      | http://localhost:8280      |

### 3. Comandos Básicos

#### Usando Make (Recomendado)
```bash
# Ver todos os comandos disponíveis
make help

# Iniciar todos os serviços
make up

# Parar todos os serviços
make down

# Ver logs
make logs

# Acessar shell do frontend
make shell-frontend

# Acessar shell do backend
make shell-backend
```

#### Usando Docker Compose diretamente
```bash
# Iniciar serviços
docker-compose up -d

# Parar serviços
docker-compose down

# Reconstruir containers
docker-compose build

# Ver logs
docker-compose logs -f

# Executar comandos no container
docker-compose exec frontend npm install
docker-compose exec backend php artisan migrate
```

## 📁 Estrutura Docker

```
.
├── docker-compose.yml      # Configuração dos serviços
├── .env.docker            # Variáveis de ambiente Docker
├── frontend/
│   └── Dockerfile.dev     # Dockerfile do frontend (Node 20)
├── backend/
│   └── Dockerfile.dev     # Dockerfile do backend (PHP 8.2)
└── Makefile              # Atalhos para comandos
```

## 🛠️ Desenvolvimento

### Frontend (React + Vite)
O frontend roda com Node.js 20 no container, resolvendo problemas de compatibilidade:

```bash
# Instalar nova dependência
docker-compose exec frontend npm install [pacote]

# Executar comandos npm
docker-compose exec frontend npm run build
```

### Backend (Laravel)
O backend roda com PHP 8.2 e tem Composer instalado:

```bash
# Instalar dependência
docker-compose exec backend composer require [pacote]

# Executar comandos artisan
docker-compose exec backend php artisan make:controller UserController
```

### Banco de Dados
Acesse o MySQL via phpMyAdmin ou linha de comando:

```bash
# Via phpMyAdmin
http://localhost:8280
Usuário: estudos_user
Senha: estudos_pass

# Via CLI
make shell-db
# ou
docker-compose exec db mysql -u estudos_user -pestudos_pass estudos_db
```

## 🔧 Troubleshooting

### Erro de porta em uso
Se alguma porta estiver em uso, edite o `docker-compose.yml` e mude a porta externa:
```yaml
ports:
  - "5273:5173"  # Mude 5273 para outra porta livre
```

### Erro de permissão
Se houver erro de permissão nos volumes:
```bash
# Linux/Mac
sudo chown -R $USER:$USER .

# Ou reconstruir sem cache
docker-compose build --no-cache
```

### Container não inicia
Verifique os logs:
```bash
docker-compose logs frontend
docker-compose logs backend
```

### Limpar tudo e recomeçar
```bash
make clean
# ou
docker-compose down -v --rmi all
```

## 🔄 Workflow de Desenvolvimento

1. **Iniciar ambiente**
   ```bash
   make up
   ```

2. **Desenvolver**
   - Frontend: http://localhost:5273
   - Backend API: http://localhost:8180/api
   - phpMyAdmin: http://localhost:8280

3. **Ver logs em tempo real**
   ```bash
   make logs
   ```

4. **Parar quando terminar**
   ```bash
   make down
   ```

## 📝 Notas Importantes

- Os volumes Docker preservam dados entre reinicializações
- O hot-reload do Vite funciona normalmente
- As alterações no código são refletidas imediatamente
- Node modules são instalados dentro do container
- Composer packages são instalados dentro do container

## 🎯 Próximos Passos

1. Criar o projeto Laravel no diretório `backend/`
2. Configurar as variáveis de ambiente
3. Executar migrations
4. Começar o desenvolvimento!