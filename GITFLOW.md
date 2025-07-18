# GitFlow - Estratégia de Branches

## Estrutura de Branches

### Branches Principais
- **main**: Branch de produção, código estável e testado
- **develop**: Branch de desenvolvimento, integração de features

### Branches de Suporte
- **feature/***: Novas funcionalidades
- **release/***: Preparação para nova versão
- **hotfix/***: Correções urgentes em produção

## Fluxo de Trabalho

### 1. Nova Feature
```bash
# Criar branch a partir de develop
git checkout develop
git pull origin develop
git checkout -b feature/nome-da-feature

# Após desenvolver
git add .
git commit -m "feat: descrição da feature"

# Push para remote
git push origin feature/nome-da-feature
```

### 2. Release
```bash
# Criar branch de release
git checkout develop
git checkout -b release/1.0.0

# Após testes e ajustes
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0 -m "Versão 1.0.0"

git checkout develop
git merge --no-ff release/1.0.0
```

### 3. Hotfix
```bash
# Criar a partir de main
git checkout main
git checkout -b hotfix/nome-do-fix

# Após correção
git checkout main
git merge --no-ff hotfix/nome-do-fix
git tag -a v1.0.1 -m "Hotfix: descrição"

git checkout develop
git merge --no-ff hotfix/nome-do-fix
```

## Convenção de Commits

### Formato
```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos
- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **style**: Formatação (sem mudança de código)
- **refactor**: Refatoração
- **perf**: Melhoria de performance
- **test**: Adição de testes
- **chore**: Tarefas de build, configs, etc

### Exemplos
```bash
feat(auth): adicionar autenticação two-factor
fix(flashcards): corrigir cálculo de intervalo SM-2
docs(api): atualizar documentação de endpoints
refactor(questions): melhorar estrutura de filtros
```

## Branches Planejadas

### Features Iniciais
- feature/backend-setup
- feature/frontend-setup
- feature/auth-system
- feature/question-module
- feature/flashcard-module
- feature/video-player
- feature/payment-integration

### Nomenclatura
- Usar kebab-case
- Ser descritivo mas conciso
- Prefixar com tipo (feature/, hotfix/, etc)

## Comandos Úteis

```bash
# Ver todas as branches
git branch -a

# Deletar branch local
git branch -d nome-da-branch

# Deletar branch remota
git push origin --delete nome-da-branch

# Ver log com gráfico
git log --oneline --graph --all

# Sincronizar com remote
git fetch --all --prune
```

## Proteção de Branches

### main
- Requer pull request
- Requer aprovação
- Requer testes passando
- Não permite force push

### develop
- Requer pull request
- Não permite force push

## Versionamento

Seguimos Semantic Versioning (SemVer):
- **MAJOR.MINOR.PATCH**
- **1.0.0**: Primeira versão estável
- **1.1.0**: Nova funcionalidade compatível
- **1.1.1**: Correção de bug

## Pull Request Template

```markdown
## Descrição
Breve descrição do que foi feito

## Tipo de mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Código segue style guide
- [ ] Testes foram adicionados
- [ ] Documentação foi atualizada
- [ ] Sem conflitos com develop
```