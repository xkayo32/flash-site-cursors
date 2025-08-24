# Guia para Atualizar Node.js

## Opção 1: Usando NVM (Recomendado) 🎯

### Instalar NVM
```bash
# Baixar e instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# OU usando wget
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

### Ativar NVM no terminal atual
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

### Instalar Node.js 20 LTS
```bash
# Listar versões disponíveis
nvm list-remote --lts

# Instalar a versão 20 LTS mais recente
nvm install 20

# Usar a versão 20
nvm use 20

# Definir como padrão
nvm alias default 20

# Verificar versão
node --version
npm --version
```

## Opção 2: Usando NodeSource (Ubuntu/Debian)

```bash
# Remover versões antigas
sudo apt-get remove nodejs npm

# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

## Opção 3: Download Direto

1. Acesse https://nodejs.org/
2. Baixe a versão LTS (20.x ou 22.x)
3. Siga as instruções de instalação para seu sistema

## Após atualizar o Node.js

### 1. Voltar ao projeto
```bash
cd /home/kayo/flash-site-cursors/frontend
```

### 2. Limpar cache e reinstalar
```bash
# Limpar cache npm
npm cache clean --force

# Remover node_modules e package-lock
rm -rf node_modules package-lock.json

# Reinstalar dependências
npm install
```

### 3. Atualizar dependências para versões mais recentes
```bash
# Atualizar Vite para versão 5+
npm uninstall vite && npm install vite@latest -D

# Atualizar React Router para versão 6.22+
npm uninstall react-router-dom && npm install react-router-dom@latest

# Verificar se há outras atualizações
npm outdated
```

### 4. Testar o projeto
```bash
npm run dev
```

## Benefícios de atualizar para Node 20+

1. **Performance**: Melhorias significativas de velocidade
2. **Segurança**: Correções de vulnerabilidades
3. **Features**: Suporte a recursos modernos do JavaScript
4. **Compatibilidade**: Funciona com as versões mais recentes dos pacotes
5. **LTS**: Suporte de longo prazo até 2026

## Troubleshooting

Se encontrar problemas após atualizar:

1. **Limpar cache global**
   ```bash
   npm cache clean --force
   ```

2. **Verificar versão do npm**
   ```bash
   npm install -g npm@latest
   ```

3. **Recriar projeto se necessário**
   ```bash
   # Fazer backup do código
   cp -r src ../src-backup
   
   # Recriar com Vite mais recente
   npm create vite@latest . -- --template react-ts
   ```

Após atualizar, o projeto funcionará com as versões mais recentes e terá melhor performance!