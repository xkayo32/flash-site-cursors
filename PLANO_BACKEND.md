# Plano de Desenvolvimento - Backend (Laravel)

## 1. Estrutura Inicial do Projeto

### 1.1 Configuração Base
- [ ] Criar projeto Laravel 10
- [ ] Configurar .env com banco de dados MySQL/PostgreSQL
- [ ] Configurar Redis para cache e filas
- [ ] Instalar Laravel Sanctum para autenticação
- [ ] Configurar CORS para aceitar requisições do frontend
- [ ] Instalar Laravel Telescope (desenvolvimento)

### 1.2 Pacotes Necessários
```bash
composer require laravel/sanctum
composer require predis/predis
composer require spatie/laravel-permission
composer require barryvdh/laravel-cors
composer require intervention/image
composer require maatwebsite/excel
composer require stripe/stripe-php
```

## 2. Modelagem do Banco de Dados

### 2.1 Migrations Principais
```
- users
- roles_and_permissions (Spatie)
- subscriptions
- subscription_plans
- courses
- course_categories
- disciplines
- topics
- questions
- question_alternatives
- question_comments
- flashcards
- decks
- user_flashcard_reviews
- study_summaries
- videos
- video_progress
- simulations
- simulation_questions
- user_simulation_attempts
- user_statistics
- payments
- notifications
```

### 2.2 Relacionamentos Principais
- User hasMany Subscriptions
- User belongsToMany Courses
- Course hasMany Disciplines
- Discipline hasMany Topics
- Topic hasMany Questions/Flashcards
- Flashcard belongsToMany Decks
- User hasMany FlashcardReviews

## 3. Implementação por Módulos

### 3.1 Módulo de Autenticação (Semana 1)
- [ ] AuthController (login, register, logout, refresh)
- [ ] Email verification
- [ ] Password reset
- [ ] Two-factor authentication (opcional)
- [ ] Middleware de autenticação
- [ ] Rate limiting

### 3.2 Módulo de Usuários e Permissões (Semana 1)
- [ ] UserController (CRUD)
- [ ] RoleController
- [ ] Implementar roles: admin, instructor, student
- [ ] Policies para autorização
- [ ] Perfil do usuário

### 3.3 Módulo de Cursos (Semana 2)
- [ ] CourseController
- [ ] DisciplineController
- [ ] TopicController
- [ ] Relacionamento com usuários (matrículas)
- [ ] Progresso do curso

### 3.4 Módulo de Questões (Semana 2-3)
- [ ] QuestionController (CRUD)
- [ ] QuestionFilterService
- [ ] ImportQuestionService (Excel/CSV)
- [ ] QuestionCommentController
- [ ] QuestionStatisticsService
- [ ] Filtros: disciplina, assunto, banca, ano, dificuldade

### 3.5 Módulo de Flashcards (Semana 3-4)
- [ ] FlashcardController
- [ ] DeckController
- [ ] SpacedRepetitionService (SM-2)
- [ ] FlashcardReviewController
- [ ] ImportAnkiService
- [ ] FlashcardStatisticsService

### 3.6 Módulo de Algoritmo SM-2
```php
class SpacedRepetitionService {
    // Cálculo de intervalo
    // Fator de facilidade
    // Próxima data de revisão
    // Atualização após resposta
}
```

### 3.7 Módulo de Simulados (Semana 4)
- [ ] SimulationController
- [ ] SimulationGeneratorService
- [ ] SimulationAttemptController
- [ ] Correção automática
- [ ] Ranking e estatísticas

### 3.8 Módulo de Resumos Interativos (Semana 5)
- [ ] StudySummaryController
- [ ] Integração com questões/flashcards
- [ ] Rich text editor backend
- [ ] Versionamento de resumos

### 3.9 Módulo de Vídeos (Semana 5)
- [ ] VideoController
- [ ] VideoProgressController
- [ ] VideoUploadService
- [ ] Processamento de vídeo (HLS)
- [ ] Integração com CDN

### 3.10 Módulo de Assinaturas e Pagamentos (Semana 6)
- [ ] SubscriptionController
- [ ] PaymentController
- [ ] StripeService/PagSeguroService
- [ ] WebhookController (pagamentos)
- [ ] Invoice generation
- [ ] Controle de acesso por plano

### 3.11 Módulo de Dashboard e Estatísticas (Semana 6)
- [ ] DashboardController
- [ ] StatisticsService
- [ ] Métricas: questões resolvidas, cards revisados, tempo de estudo
- [ ] Gráficos e relatórios
- [ ] Exportação de dados

### 3.12 Módulo Administrativo (Semana 7)
- [ ] AdminDashboardController
- [ ] Gestão de conteúdo
- [ ] Gestão de usuários
- [ ] Relatórios gerenciais
- [ ] Logs e auditoria

## 4. Jobs e Filas

### 4.1 Jobs Assíncronos
- [ ] ProcessVideoUpload
- [ ] ImportQuestionsFromExcel
- [ ] ImportAnkiDeck
- [ ] SendStudyReminder
- [ ] GenerateMonthlyReport
- [ ] ProcessPaymentWebhook

## 5. APIs e Documentação

### 5.1 Estrutura de Rotas
```php
// api.php
Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    
    // Protected routes
    Route::middleware(['auth:sanctum'])->group(function () {
        // User routes
        // Question routes
        // Flashcard routes
        // etc...
    });
    
    // Admin routes
    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
        // Admin specific routes
    });
});
```

### 5.2 Padrão de Resposta
```json
{
    "success": true,
    "data": {},
    "message": "Success message",
    "errors": []
}
```

## 6. Testes

### 6.1 Feature Tests
- [ ] Autenticação
- [ ] CRUD de questões
- [ ] Sistema de flashcards
- [ ] Algoritmo de repetição
- [ ] Pagamentos

### 6.2 Unit Tests
- [ ] SpacedRepetitionService
- [ ] QuestionFilterService
- [ ] StatisticsService

## 7. Segurança

### 7.1 Implementações
- [ ] Rate limiting por IP
- [ ] Validação de inputs (FormRequests)
- [ ] Sanitização de dados
- [ ] Proteção CSRF
- [ ] Políticas de CORS
- [ ] Logs de auditoria

## 8. Performance

### 8.1 Otimizações
- [ ] Cache de queries frequentes
- [ ] Eager loading de relacionamentos
- [ ] Paginação de resultados
- [ ] Índices no banco de dados
- [ ] Queue para tarefas pesadas
- [ ] CDN para assets

## 9. Cronograma de Desenvolvimento

### Fase 1: Base (Semanas 1-2)
- Autenticação e usuários
- Estrutura de cursos
- Setup inicial

### Fase 2: Core Features (Semanas 3-5)
- Sistema de questões
- Sistema de flashcards
- Algoritmo SM-2
- Simulados

### Fase 3: Features Avançadas (Semanas 5-6)
- Vídeos e progresso
- Resumos interativos
- Dashboard

### Fase 4: Monetização (Semana 6-7)
- Pagamentos
- Assinaturas
- Controle de acesso

### Fase 5: Admin e Polish (Semana 7-8)
- Painel administrativo
- Testes
- Documentação
- Deploy

## 10. Considerações Finais

### Deploy
- Configurar supervisor para queues
- Configurar cron para scheduled tasks
- Otimizar autoloader e configs
- Configurar logs e monitoramento

### Manutenção
- Backup automático do banco
- Monitoramento de erros (Sentry)
- Métricas de performance
- Atualizações de segurança