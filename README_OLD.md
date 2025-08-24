# Plataforma de Estudos - Questões e Flashcards

## 📚 Sobre o Projeto

Plataforma educacional completa para preparação de concursos, com sistema de questões, flashcards com repetição espaçada, simulados e recursos interativos.

## 🚀 Funcionalidades Principais

### Para Alunos
- **Sistema de Questões**: Banco com filtros avançados por disciplina, assunto e banca
- **Flashcards Inteligentes**: Algoritmo de repetição espaçada (SM-2) para memorização eficiente
- **Dashboard Personalizado**: Acompanhamento de progresso e métricas de desempenho
- **Simulados**: Provas cronometradas com questões selecionadas
- **Resumos Interativos**: Material de estudo com questões e cards integrados
- **Vídeo-aulas**: Player com controle de velocidade e salvamento de progresso
- **Cronograma Personalizado**: Planejamento de estudos até a data da prova
- **Modo Offline**: Acesso a flashcards mesmo sem internet (PWA)

### Para Administradores
- **Gestão de Conteúdo**: CRUD completo de questões, cards e resumos
- **Gestão de Cursos**: Criação e organização de cursos e disciplinas
- **Gestão de Usuários**: Controle de assinaturas e acessos
- **Analytics**: Métricas de uso e engajamento da plataforma

## 🛠️ Tecnologias

### Backend
- **PHP 8.2+** com **Laravel 10**
- **MySQL/PostgreSQL** como banco de dados
- **Redis** para cache e filas
- **Laravel Sanctum** para autenticação API
- **Laravel Queues** para processamento assíncrono

### Frontend
- **React 18** com **Vite**
- **TypeScript** para type safety
- **Tailwind CSS** + **shadcn/ui** para estilização
- **Zustand** + **React Query** para gerenciamento de estado
- **Video.js** para player de vídeo
- **Framer Motion** para animações
- **PWA** com Workbox para funcionamento offline

## 📋 Pré-requisitos

- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL >= 8.0 ou PostgreSQL >= 14
- Redis (opcional, mas recomendado)

## 🔧 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/flash-site-cursors.git
cd flash-site-cursors

# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed

# Frontend
cd ../frontend
npm install
cp .env.example .env.local
```

## 🚀 Executando o Projeto

```bash
# Backend (Laravel)
cd backend
php artisan serve

# Queue Worker (em outro terminal)
php artisan queue:work

# Frontend (React)
cd frontend
npm run dev
```

## 📁 Estrutura do Projeto

```
flash-site-cursors/
├── backend/            # API Laravel
│   ├── app/           # Lógica da aplicação
│   ├── database/      # Migrations e seeders
│   ├── routes/        # Rotas da API
│   └── tests/         # Testes automatizados
├── frontend/          # Aplicação React
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/      # Páginas da aplicação
│   │   ├── hooks/      # Custom hooks
│   │   ├── services/   # Integração com API
│   │   └── store/      # Estado global
│   └── public/         # Assets públicos
└── docs/              # Documentação adicional
```

## 🔑 Variáveis de Ambiente

### Backend (.env)
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=estudos_platform
DB_USERNAME=root
DB_PASSWORD=

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

QUEUE_CONNECTION=redis
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME="Plataforma de Estudos"
```

## 📝 Principais Endpoints da API

- `POST /api/login` - Autenticação
- `GET /api/questions` - Listar questões
- `GET /api/flashcards` - Listar flashcards
- `POST /api/flashcards/{id}/review` - Registrar revisão de card
- `GET /api/dashboard` - Dados do dashboard
- `GET /api/courses` - Listar cursos

## 🧪 Testes

```bash
# Backend
cd backend
php artisan test

# Frontend
cd frontend
npm run test
```

## 📱 Progressive Web App

A aplicação funciona como PWA, permitindo:
- Instalação no dispositivo
- Funcionamento offline (flashcards)
- Notificações push
- Sincronização em background

## 🔐 Segurança

- Autenticação via tokens (Sanctum)
- Rate limiting nas APIs
- Validação de dados no backend
- Sanitização de inputs
- CORS configurado adequadamente

## 📈 Performance

- Cache com Redis
- Lazy loading de componentes
- Code splitting automático
- Otimização de imagens
- CDN para assets estáticos

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença proprietária. Todos os direitos reservados.

## 👥 Equipe

- Desenvolvimento: [Seu Nome]
- Design: [Nome do Designer]
- Product Owner: [Nome do PO]

## 📞 Suporte

Para suporte, envie um email para suporte@plataforma.com.br