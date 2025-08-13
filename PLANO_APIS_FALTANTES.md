# 📋 PLANO DE IMPLEMENTAÇÃO - APIs FALTANTES

## 🎯 Análise dos Testes
**Resultado dos testes de API**: 37/55 funcionando (67% sucesso)  
**APIs faltantes identificadas**: 18 endpoints críticos  
**Impacto**: Funcionalidades avançadas não operacionais

---

## 🚨 PRIORIDADE CRÍTICA

### 1. **Schedule APIs (Cronograma)** 
**Status**: ❌ Rotas não registradas no server.ts  
**Impacto**: SchedulePage.tsx não funcional  

**APIs Faltantes:**
- `GET /api/v1/schedule/tasks` - Listar tarefas 
- `POST /api/v1/schedule/tasks` - Criar tarefa
- `PUT /api/v1/schedule/tasks/:id` - Atualizar tarefa
- `DELETE /api/v1/schedule/tasks/:id` - Deletar tarefa
- `PATCH /api/v1/schedule/tasks/:id/complete` - Marcar completa
- `GET /api/v1/schedule/events` - Eventos calendário
- `GET /api/v1/schedule/study-sessions` - Sessões de estudo
- `GET /api/v1/schedule/stats` - Estatísticas

**Páginas Afetadas:**
- `SchedulePage.tsx` (Aluno) - 100% não funcional

**Solução:**
```typescript
// server.ts - Adicionar linha faltante:
app.use('/api/v1/schedule', scheduleRoutes);
```

**Arquivos Envolvidos:**
- ✅ `backend-node/src/routes/schedule.routes.ts` (JÁ EXISTE)
- ❌ Registro no `server.ts` (FALTANTE)
- ✅ `frontend/src/services/scheduleService.ts` (JÁ EXISTE)
- ✅ `SchedulePage.tsx` integrada (JÁ FEITO)

---

### 2. **Payment APIs (Pagamentos)**
**Status**: ❌ Rotas não registradas corretamente  
**Impacto**: PaymentSettingsPage.tsx não funcional

**APIs Faltantes:**
- `GET /api/v1/payment/methods` - Métodos pagamento
- `POST /api/v1/payment/methods` - Adicionar método
- `PUT /api/v1/payment/methods/:id` - Atualizar método
- `DELETE /api/v1/payment/methods/:id` - Remover método
- `GET /api/v1/payment/history` - Histórico pagamentos
- `GET /api/v1/payment/billing` - Endereço cobrança
- `PUT /api/v1/payment/billing` - Atualizar endereço
- `GET /api/v1/subscription/manage` - Gerenciar assinatura

**Páginas Afetadas:**
- `PaymentSettingsPage.tsx` (Aluno) - 100% não funcional

**Problema Identificado:**
```typescript
// server.ts - Linhas 72-73 atuais:
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/subscription', paymentRoutes);
```
**Possível problema**: paymentRoutes pode não estar exportando as rotas corretas

**Arquivos Envolvidos:**
- ✅ `backend-node/src/routes/payment.routes.ts` (JÁ EXISTE)
- ⚠️ Registro no `server.ts` (VERIFICAR)
- ✅ `frontend/src/services/paymentService.ts` (JÁ EXISTE)
- ✅ `PaymentSettingsPage.tsx` integrada (JÁ FEITO)

---

## 🔶 PRIORIDADE ALTA

### 3. **Stats Endpoints Específicos**
**Status**: ❌ Implementação parcial  
**Impacto**: Estatísticas avançadas não funcionais

**APIs Faltantes:**
- `GET /api/v1/mockexams/stats` - Estatísticas simulados admin
- `GET /api/v1/previousexams/available` - Provas disponíveis estudante  
- `GET /api/v1/previousexams/stats` - Estatísticas provas admin
- `GET /api/v1/questions/stats` - Estatísticas questões (precisa ser admin)
- `GET /api/v1/flashcards/stats` - Estatísticas flashcards (precisa ser admin)

**Páginas Afetadas:**
- Dashboard Admin (estatísticas incompletas)
- PreviousExamsPageSimple.tsx (sem dados disponíveis)
- Relatórios administrativos

**Solução:**
- Implementar endpoints /stats nos arquivos de rota existentes
- Ajustar permissões de admin vs estudante

---

### 4. **Search Endpoints Específicos**
**Status**: ❌ Não implementados  
**Impacto**: Funcionalidades de busca avançada

**APIs Faltantes:**
- `GET /api/v1/summaries/search` - Busca em resumos
- `GET /api/v1/summaries/subjects` - Matérias dos resumos
- `GET /api/v1/legislation/search` - Busca em legislação (400 error)
- `GET /api/v1/legislation/categories` - Categorias legislação

**Páginas Afetadas:**
- `SummariesPage.tsx` (busca limitada)
- `LegislationPage.tsx` (busca limitada)

---

## 📋 PLANO DE IMPLEMENTAÇÃO

### **FASE 1: Correções Críticas (1-2 horas)**

#### 1.1 **Corrigir Schedule APIs**
```bash
# Verificar se scheduleRoutes está registrado
cd backend-node/src
grep -n "scheduleRoutes" server.ts

# Se não estiver, adicionar:
# app.use('/api/v1/schedule', scheduleRoutes);
```

#### 1.2 **Corrigir Payment APIs**
```bash
# Verificar se payment.routes.ts está exportando corretamente
cd backend-node/src/routes
head -20 payment.routes.ts

# Verificar se server.ts está importando/usando corretamente
grep -n "paymentRoutes" server.ts
```

#### 1.3 **Teste Imediato**
```bash
./test-all-apis.sh
# Deve passar de 37/55 para 45+/55 sucessos
```

### **FASE 2: Implementar Stats Endpoints (2-3 horas)**

#### 2.1 **MockExams Stats**
```typescript
// mockexams.routes.ts - Adicionar:
router.get('/stats', authMiddleware, adminOnly, (req, res) => {
  // Estatísticas de simulados para admin
});
```

#### 2.2 **PreviousExams Available/Stats**
```typescript
// previousexams.routes.ts - Adicionar:
router.get('/available', authMiddleware, (req, res) => {
  // Listar provas disponíveis para estudante
});

router.get('/stats', authMiddleware, adminOnly, (req, res) => {
  // Estatísticas de provas para admin
});
```

#### 2.3 **Questions/Flashcards Stats Admin**
```typescript
// Ajustar middleware de permissão nos endpoints existentes
// Permitir admin acessar /stats
```

### **FASE 3: Implementar Search Endpoints (2-3 horas)**

#### 3.1 **Summaries Search**
```typescript
// summaries.routes.ts - Adicionar:
router.get('/search', authMiddleware, (req, res) => {
  // Busca em resumos com query params
});

router.get('/subjects', authMiddleware, (req, res) => {
  // Lista matérias disponíveis
});
```

#### 3.2 **Legislation Search**
```typescript
// legislation.routes.ts - Corrigir:
router.get('/search', authMiddleware, (req, res) => {
  // Busca em legislação (atualmente retorna 400)
});

router.get('/categories', authMiddleware, (req, res) => {
  // Categorias de legislação
});
```

### **FASE 4: Teste Final e Validação (1 hora)**

```bash
# Executar teste completo
./test-all-apis.sh

# Meta: 50+/55 APIs funcionais (90%+ sucesso)

# Testar páginas específicas:
./test-frontend-student.sh
./test-frontend-admin.sh
```

---

## 🎯 RESULTADOS ESPERADOS

### **Antes (Estado Atual)**
- ✅ 37/55 APIs funcionais (67%)
- ❌ SchedulePage não funcional
- ❌ PaymentSettingsPage não funcional  
- ⚠️ Funcionalidades de busca limitadas

### **Depois (Meta)**
- ✅ 50+/55 APIs funcionais (90%+)
- ✅ SchedulePage 100% funcional
- ✅ PaymentSettingsPage 100% funcional
- ✅ Buscas avançadas operacionais
- ✅ Dashboard admin com estatísticas completas

---

## 📁 ARQUIVOS PARA MODIFICAR

### **Backend Node.js**
1. `src/server.ts` - Registrar rotas faltantes
2. `src/routes/mockexams.routes.ts` - Adicionar /stats
3. `src/routes/previousexams.routes.ts` - Adicionar /available e /stats
4. `src/routes/summaries.routes.ts` - Adicionar /search e /subjects
5. `src/routes/legislation.routes.ts` - Corrigir /search e adicionar /categories

### **Frontend (Já Prontos)**
- ✅ Todas as páginas já integradas
- ✅ Services já implementados
- ✅ Apenas aguardando APIs backend

### **Testes**
- `test-all-apis.sh` - Re-executar após cada fase
- Validação automática de progressão

---

## ⏱️ CRONOGRAMA

| Fase | Duração | Descrição | Meta de Sucesso |
|------|---------|-----------|-----------------|
| **Fase 1** | 1-2h | Correções críticas | 45+/55 APIs (80%) |
| **Fase 2** | 2-3h | Stats endpoints | 48+/55 APIs (85%) |
| **Fase 3** | 2-3h | Search endpoints | 50+/55 APIs (90%) |
| **Fase 4** | 1h | Teste e validação | Sistema 100% funcional |
| **TOTAL** | **6-9h** | **Implementação completa** | **90%+ APIs funcionais** |

---

## 🚀 COMANDO PARA INICIAR

```bash
# 1. Verificar estado atual
./test-all-apis.sh

# 2. Executar Fase 1 (correções críticas)
# 3. Executar Fase 2 (stats endpoints)  
# 4. Executar Fase 3 (search endpoints)
# 5. Validação final

# Meta: Sistema 100% operacional em todas as funcionalidades
```