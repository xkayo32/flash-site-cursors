# StudyPro - Sistema de Preparação para Concursos Públicos

Sistema completo de estudos para concursos públicos com foco em carreiras policiais e militares, oferecendo cursos, simulados, flashcards e conteúdo especializado.

## 🚀 Tecnologias

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **Zustand** para gerenciamento de estado
- **React Router v6** para navegação
- **Framer Motion** para animações

### Backend
- **Node.js** com Express e TypeScript
- **PostgreSQL** como banco de dados principal
- **JWT** para autenticação
- **Docker** para containerização

## 📁 Estrutura do Projeto

```
├── backend-node/        # API Node.js/Express
├── frontend/           # Aplicação React/Vite
├── docs/              # Documentação completa
├── scripts/           # Scripts de automação
│   ├── setup/        # Scripts de configuração
│   ├── testing/      # Scripts de teste
│   └── utils/        # Utilitários
├── docker-compose.yml  # Configuração Docker
└── Makefile           # Comandos de desenvolvimento
```

## 🔧 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- PostgreSQL (via Docker)

### Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/xkayo32/flash-site-cursors.git
cd flash-site-cursors

# Inicie todos os serviços com Docker
make up-postgres

# Ou manualmente
docker-compose -f docker-compose.postgres.yml up -d
```

### Configuração Manual

#### Frontend
```bash
cd frontend
npm install
npm run dev  # Desenvolvimento em http://localhost:5173
```

#### Backend
```bash
cd backend-node
npm install
npm run dev  # API em http://localhost:8180
```

## 🌟 Funcionalidades Principais

### Para Estudantes
- **Cursos Completos**: Videoaulas, materiais e exercícios
- **Sistema de Flashcards**: 7 tipos diferentes com algoritmo SM-2
- **Simulados**: Questões de concursos anteriores
- **Resumos Interativos**: Material de estudo organizado
- **Dashboard Personalizado**: Acompanhamento de progresso

### Para Administradores
- **Gestão de Conteúdo**: CRUD completo para todos os recursos
- **Sistema de Categorias Hierárquicas**: Organização avançada
- **Análise de Desempenho**: Estatísticas detalhadas
- **Gestão de Usuários**: Controle de acesso e permissões

## 🎨 Design System

O projeto utiliza um tema militar/tático com:
- Cores principais: Black, White, Military Base (#14242f)
- Accent: Tactical Yellow (#facc15)
- Tipografia: Orbitron, Rajdhani, Exo 2
- Componentes customizados com Tailwind CSS

## 📝 Scripts Úteis

```bash
# Desenvolvimento
make up-postgres    # Inicia todos os serviços
make down          # Para todos os serviços
make logs          # Visualiza logs
make restart       # Reinicia serviços

# Banco de Dados
make db-reset      # Reset completo do banco
make db-seed       # Popula com dados de teste

# Testes
npm run test       # Executa testes
npm run lint       # Verifica código
npm run build      # Build de produção
```

## 🔐 Variáveis de Ambiente

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8180
```

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5532
DB_NAME=estudos_db
DB_USER=estudos_user
DB_PASSWORD=estudos_pass
JWT_SECRET=your-secret-key
```

## 📚 Documentação

Documentação completa disponível em `/docs`:
- [Arquitetura](docs/architecture/)
- [Implementação](docs/implementation/)
- [Testes](docs/testing/)
- [Setup](docs/setup/)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário. Todos os direitos reservados.

## 👥 Equipe

Desenvolvido com dedicação para revolucionar a preparação para concursos públicos.

---

**Portas Padrão:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8180
- PostgreSQL: localhost:5532