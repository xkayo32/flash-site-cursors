# Banco de Dados StudyPro

Este diretório contém os schemas do banco de dados para MySQL e PostgreSQL.

## Arquivos

- `schema_mysql.sql` - Schema completo para MySQL
- `schema_postgres.sql` - Schema completo para PostgreSQL

## Tabelas

### 1. **users** - Usuários do sistema
- Armazena todos os usuários (admin, instructor, student)
- Campos principais: id, name, email, password, role, status
- Senha padrão do admin: admin123 (bcrypt)

### 2. **subscriptions** - Assinaturas dos usuários
- Controla os planos: Básico, Premium, VIP, Unlimited
- Status: active, expired, cancelled, trial

### 3. **user_activities** - Atividades e métricas
- Rastreia: cursos, questões, flashcards, sequência de estudos
- Total gasto pelo usuário

### 4. **system_settings** - Configurações do sistema
- Configurações chave-valor
- Manutenção, verificação de email, notificações, etc.

### 5. **company_info** - Informações da empresa
- Dados cadastrais: CNPJ, razão social, endereço

### 6. **activity_logs** - Logs de auditoria
- Registra todas as ações importantes
- IP, user agent, descrição

### 7. **sessions** - Sessões ativas
- Controle de login e sessões

### 8. **password_resets** - Tokens de redefinição
- Tokens temporários para reset de senha

## Como executar

### PostgreSQL
```bash
# Conectar ao banco
psql -h localhost -p 5532 -U estudos_user -d estudos_db

# Executar o schema
\i /path/to/schema_postgres.sql
```

### MySQL
```bash
# Conectar ao banco
mysql -h localhost -P 3406 -u estudos_user -p estudos_db

# Executar o schema
source /path/to/schema_mysql.sql;
```

## Usuário Admin Padrão

- **Email**: admin@studypro.com
- **Senha**: admin123
- **Role**: admin
- **Status**: active

⚠️ **IMPORTANTE**: Altere a senha do admin no primeiro login!

## Tipos de Usuários

1. **student** - Aluno comum
2. **instructor** - Instrutor/Professor
3. **admin** - Administrador total

## Status de Usuário

- **active** - Pode acessar o sistema
- **suspended** - Acesso bloqueado
- **pending** - Aguardando aprovação/verificação

## Planos de Assinatura

- **Básico** - Plano inicial
- **Premium** - Plano intermediário
- **VIP** - Plano avançado
- **Unlimited** - Acesso total