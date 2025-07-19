# StudyPro - Plataforma de Estudos para Concursos Públicos

## 📋 Visão Geral do Projeto

A **StudyPro** é uma plataforma completa de estudos voltada para candidatos de concursos públicos, oferecendo ferramentas avançadas de aprendizado com foco em aprovação e otimização do tempo de estudo.

## 🎯 Objetivos Principais

- **Personalização**: Sistema adaptativo que se ajusta ao perfil e necessidades de cada estudante
- **Eficiência**: Otimizar o tempo de estudo através de algoritmos inteligentes
- **Gamificação**: Manter a motivação através de metas, conquistas e progressão
- **Analytics**: Fornecer insights detalhados sobre desempenho e áreas de melhoria
- **Acessibilidade**: Funcionar offline e em diversos dispositivos

## 🏗️ Arquitetura do Sistema

### Frontend (React + TypeScript)
- **Framework**: React 18 com TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **PWA**: Service Workers para funcionalidade offline

### Backend (Laravel + PHP)
- **Framework**: Laravel 10+
- **Database**: MySQL 8.0
- **Cache**: Redis
- **Authentication**: Laravel Sanctum
- **API**: RESTful APIs
- **File Storage**: Local/S3
- **Queue System**: Redis/Database
- **Search**: Laravel Scout + Elasticsearch (futuro)

### DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose
- **Development**: Hot reload e sync de volumes
- **Database Management**: phpMyAdmin
- **Ports**: Custom ports para evitar conflitos
- **Environment**: Ambiente isolado e reproduzível

## 🔧 Funcionalidades Principais

### 1. Sistema de Questões
- **Banco de dados**: 50.000+ questões organizadas por:
  - Disciplina/Matéria
  - Banca organizadora
  - Ano da prova
  - Nível de dificuldade
  - Cargo/Concurso
- **Filtros avançados**: Múltiplos critérios de busca
- **Resolução**: Interface intuitiva com explicações detalhadas
- **Histórico**: Tracking completo de questões resolvidas
- **Favoritos**: Sistema de bookmarks para questões importantes

### 2. Flashcards Inteligentes
- **Algoritmo SM-2**: Sistema de repetição espaçada científico
- **Criação automática**: Geração de cards a partir de questões erradas
- **Criação manual**: Ferramenta para criar cards personalizados
- **Categorização**: Organização por matéria e tema
- **Sincronização**: Dados salvos na nuvem
- **Modo offline**: Estudo sem conexão

### 3. Simulados Realistas
- **Condições reais**: Timer, questões por prova, formato idêntico
- **Personalização**: Escolha de matérias, quantidade e dificuldade
- **Análise detalhada**: Relatórios de desempenho pós-simulado
- **Ranking**: Comparação com outros usuários
- **Histórico**: Evolução temporal dos resultados

### 4. Cronograma Personalizado com IA
- **Análise de perfil**: Tempo disponível, dificuldades, metas
- **Distribuição otimizada**: Alocação inteligente de tempo por matéria
- **Adaptação dinâmica**: Ajustes baseados no desempenho
- **Lembretes**: Notificações de estudo e revisão
- **Flexibilidade**: Possibilidade de ajustes manuais

### 5. Resumos Interativos
- **Conteúdo didático**: Material teórico por disciplina
- **Mapas mentais**: Visualização hierárquica de conceitos
- **Links inteligentes**: Conexão entre teoria e questões
- **Marcadores**: Sistema de anotações pessoais
- **Busca avançada**: Localização rápida de conteúdo

### 6. Analytics e Relatórios
- **Dashboard executivo**: Visão geral do progresso
- **Métricas detalhadas**: 
  - Taxa de acerto por matéria
  - Tempo médio por questão
  - Evolução temporal
  - Pontos fracos identificados
- **Gráficos interativos**: Visualizações dinâmicas
- **Relatórios exportáveis**: PDF com análises personalizadas
- **Comparações**: Benchmarking com outros usuários

### 7. Sistema de Assinaturas
- **Plano Básico**: Acesso limitado a questões e flashcards
- **Plano Premium**: Acesso completo + simulados + cronograma IA
- **Plano VIP**: Tudo do Premium + mentoria + materiais exclusivos
- **Pagamentos**: Integração com PagSeguro/Stripe
- **Gestão de renovação**: Automática com notificações

### 8. Painel Administrativo
- **Gestão de conteúdo**: Upload e organização de questões
- **Analytics do sistema**: Métricas de uso e performance
- **Gestão de usuários**: Suporte e administração
- **Moderação**: Aprovação de conteúdo enviado por usuários
- **Relatórios financeiros**: Controle de assinaturas e receitas

## 🎮 Elementos de Gamificação

### Sistema de Conquistas
- **Sequências de estudo**: Dias consecutivos estudando
- **Marcos de questões**: 100, 500, 1000+ questões resolvidas
- **Perfectionist**: 100% de acerto em simulados
- **Early Bird**: Estudar antes das 8h
- **Night Owl**: Estudar após 22h

### Progressão e Níveis
- **XP System**: Pontos por atividades (questões, flashcards, simulados)
- **Níveis**: Desbloqueio de recursos baseado na progressão
- **Badges**: Distintivos visuais para conquistas especiais
- **Leaderboards**: Rankings semanais/mensais

### Metas e Desafios
- **Metas diárias**: Questões, tempo de estudo, flashcards
- **Desafios semanais**: Objetivos especiais com recompensas
- **Competições**: Eventos sazonais entre usuários

## 📱 Funcionalidades PWA

### Capacidades Offline
- **Cache inteligente**: Armazenamento local de questões e flashcards
- **Sincronização**: Upload automático quando online
- **Indicadores**: Status de conexão e dados offline

### Instalação e Notificações
- **App-like**: Instalação no dispositivo
- **Push notifications**: Lembretes e atualizações
- **Background sync**: Sincronização em segundo plano

## 🔒 Segurança e Privacidade

### Autenticação
- **Multi-factor**: Email + SMS (opcional)
- **OAuth**: Login social (Google, Microsoft)
- **Session management**: Controle de sessões ativas
- **Password policies**: Senhas seguras obrigatórias

### Proteção de Dados
- **LGPD compliance**: Conformidade com lei brasileira
- **Criptografia**: Dados sensíveis criptografados
- **Backup**: Redundância e recuperação de dados
- **Auditoria**: Logs de acesso e modificações

## 📊 Métricas e KPIs

### Métricas de Usuário
- **Engajamento**: Tempo médio de uso, sessões por dia
- **Retenção**: D1, D7, D30 retention rates
- **Progressão**: Média de questões por dia, evolução de acertos
- **Conversão**: Free to paid, trial to premium

### Métricas de Negócio
- **LTV**: Lifetime Value por tipo de plano
- **Churn**: Taxa de cancelamento e suas causas
- **MRR**: Monthly Recurring Revenue
- **CAC**: Customer Acquisition Cost

## 🗄️ Estrutura de Dados

### Principais Entidades

#### Users
- id, name, email, password
- subscription_plan, subscription_expires_at
- study_preferences, notifications_settings
- created_at, updated_at

#### Questions
- id, content, answer_a, answer_b, answer_c, answer_d, answer_e
- correct_answer, explanation, difficulty_level
- subject_id, exam_board_id, year, position
- created_at, updated_at

#### User_Question_Attempts
- user_id, question_id, selected_answer, is_correct
- time_spent, attempt_date
- created_at

#### Flashcards
- id, front_content, back_content, user_id
- subject_id, difficulty, next_review_date
- review_count, ease_factor (SM-2)
- created_at, updated_at

#### Study_Sessions
- id, user_id, activity_type, duration
- questions_answered, correct_answers
- start_time, end_time
- created_at

#### Simulations
- id, user_id, name, total_questions
- correct_answers, total_time, score_percentage
- subject_filters, completed_at
- created_at

## 🚀 Roadmap de Desenvolvimento

### Fase 1 - MVP (2 meses)
- [x] Autenticação e cadastro
- [x] Dashboard básico
- [ ] Sistema de questões básico
- [ ] Flashcards simples
- [ ] Perfil do usuário

### Fase 2 - Core Features (2 meses)
- [ ] Simulados básicos
- [ ] Sistema de assinaturas
- [ ] Analytics básico
- [ ] PWA básico

### Fase 3 - Advanced Features (3 meses)
- [ ] IA para cronograma
- [ ] Resumos interativos
- [ ] Gamificação completa
- [ ] Painel administrativo

### Fase 4 - Scale & Optimize (2 meses)
- [ ] Performance optimization
- [ ] Advanced analytics
- [ ] Mobile apps nativo
- [ ] Integrações avançadas

## 🛠️ Configuração de Desenvolvimento

### Pré-requisitos
- Docker & Docker Compose
- Node.js 20+ (para desenvolvimento local)
- PHP 8.2+ (para desenvolvimento local)
- MySQL 8.0
- Redis

### Estrutura do Projeto
```
flash-site-cursors/
├── frontend/                 # React + TypeScript
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile.dev
├── backend/                  # Laravel + PHP
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── Dockerfile.dev
├── docker-compose.yml        # Orquestração dos serviços
├── PLANO_PROJETO.md         # Plano detalhado
├── CLAUDE.md                # Documentação técnica
└── DescricaoProjeto.md      # Este arquivo
```

### Comandos Principais
```bash
# Iniciar ambiente completo
docker-compose up -d

# Apenas frontend (desenvolvimento atual)
docker-compose up frontend -d

# Logs do frontend
docker-compose logs -f frontend

# Parar serviços
docker-compose down
```

### Portas Customizadas
- **Frontend**: http://localhost:5273
- **Backend**: http://localhost:8180
- **MySQL**: localhost:3406
- **Redis**: localhost:6479
- **phpMyAdmin**: http://localhost:8280

## 🎯 Próximos Passos

1. **Finalizar autenticação**: Credenciais de teste implementadas
2. **Desenvolver sistema de questões**: Banco, filtros, resolução
3. **Implementar flashcards**: Algoritmo SM-2, interface
4. **Criar simulados**: Motor de simulação, timer, resultados
5. **Desenvolver analytics**: Métricas, gráficos, relatórios

## 📝 Notas Importantes

- **Foco no MVP**: Priorizar funcionalidades core antes de features avançadas
- **UX/UI**: Manter consistência visual e experiência fluida
- **Performance**: Otimizar desde o início, especialmente mobile
- **Testes**: Implementar testes automatizados em paralelo
- **Documentação**: Manter docs atualizadas durante desenvolvimento
- **Feedback**: Incorporar feedback de usuários beta desde cedo

---

**Última atualização**: 18/07/2025  
**Status atual**: Fase 1 - MVP em desenvolvimento  
**Próximo milestone**: Sistema de questões funcional