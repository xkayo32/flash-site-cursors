# Atualizar Node.js no Ubuntu 24.04

## Método 1: Usando 'n' (Node Version Manager Simples)

```bash
# 1. Instalar 'n' globalmente
sudo npm install -g n

# 2. Instalar a versão LTS mais recente do Node
sudo n lts

# 3. Reiniciar o terminal ou executar
hash -r

# 4. Verificar a versão
node --version
```

## Método 2: Usando Snap (Ubuntu)

```bash
# 1. Remover versão atual
sudo apt remove nodejs npm

# 2. Instalar via snap
sudo snap install node --classic --channel=20

# 3. Verificar instalação
node --version
npm --version
```

## Método 3: Compilar do fonte (mais controle)

```bash
# 1. Instalar dependências
sudo apt update
sudo apt install build-essential curl

# 2. Baixar Node.js 20
cd /tmp
curl -sL https://nodejs.org/dist/v20.11.0/node-v20.11.0.tar.gz | tar xz

# 3. Compilar e instalar
cd node-v20.11.0
./configure
make -j$(nproc)
sudo make install

# 4. Verificar
node --version
```

## Método 4: Usando APT com NodeSource (mais direto)

```bash
# 1. Remover versões antigas completamente
sudo apt purge nodejs npm
sudo apt autoremove

# 2. Limpar configurações antigas
sudo rm -rf /etc/apt/sources.list.d/nodesource.list
sudo rm -rf /usr/share/keyrings/nodesource.gpg

# 3. Adicionar novo repositório
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 4. Instalar
sudo apt-get install -y nodejs

# 5. Verificar
node --version
npm --version
```

## Se nenhum método funcionar

### Opção: Usar Docker para desenvolvimento

```bash
# Criar Dockerfile no projeto
cat > Dockerfile.dev << EOF
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
EOF

# Executar com Docker
docker build -f Dockerfile.dev -t meu-app .
docker run -p 5173:5173 -v $(pwd):/app meu-app
```

### Opção: Usar Volta (alternativa ao NVM)

```bash
# Instalar Volta
curl https://get.volta.sh | bash

# Reiniciar terminal
exec $SHELL

# Instalar Node 20
volta install node@20

# Verificar
node --version
```

## Troubleshooting

Se receber erro de permissão:
```bash
# Configurar npm para não precisar sudo
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

Se o NVM não funcionou:
```bash
# Verificar se está no PATH
echo $NVM_DIR
ls -la ~/.nvm/

# Tentar carregar manualmente
source ~/.nvm/nvm.sh
```

## Verificar após instalação

```bash
# Versões
node --version  # Deve mostrar v20.x.x
npm --version   # Deve mostrar 10.x.x

# Testar
node -e "console.log('Node ' + process.version + ' instalado com sucesso!')"
```