# 🎯 Sistema de Configurações - Guia Completo

## ✅ **Status: 100% Funcional**

O sistema de configurações do admin está pronto e permite gerenciar todos os dados que refletem em todo o sistema.

## 🚀 **Como Acessar**

1. **URL**: http://173.208.151.106:5273/admin/settings
2. **Login**: 
   - Email: `admin@studypro.com`
   - Senha: `Admin@123`

## 📋 **Seções Disponíveis**

### **1. Configurações Gerais** ⚙️
- **Nome do Site**: Define o nome exibido em todo o sistema
- **Slogan**: Tagline que aparece junto ao nome
- **Descrição**: Texto descritivo para SEO
- **Palavras-chave**: Keywords para otimização de busca
- **Modo de Manutenção**: Liga/desliga acesso ao site

### **2. Informações da Empresa** 🏢
- **Nome da Empresa**: Razão social completa
- **CNPJ**: Documento da empresa
- **Endereço Completo**: Rua, cidade, estado, CEP
- **Contatos**: Telefone, email, WhatsApp

### **3. Identidade Visual** 🎨
- **Logos**:
  - Logo para tema claro
  - Logo para tema escuro
  - Favicon do navegador
- **Cores**:
  - Cor primária (accent)
  - Cor secundária (base militar)
- **Fontes**:
  - Fonte principal (títulos)
  - Fonte secundária (corpo)

### **4. Redes Sociais** 📱
- Facebook
- Instagram
- Twitter/X
- LinkedIn
- YouTube

## 🔧 **Funcionalidades**

### **Upload de Logos**
1. Clique em "Enviar Logo" na seção desejada
2. Selecione uma imagem do seu computador
3. A logo será automaticamente atualizada

### **Seleção de Cores**
1. Digite o código RGB ou hexadecimal
2. Veja o preview da cor ao lado
3. A cor será aplicada em todo o sistema

### **Salvamento**
- Cada seção tem seu próprio botão "Salvar Alterações"
- Indicador amarelo aparece quando há mudanças não salvas
- Toast de confirmação após salvar com sucesso

## 💾 **Dados de Exemplo**

### **Geral**
```
Nome: StudyPro
Slogan: Sua aprovação começa aqui
Descrição: A plataforma mais completa para concursos públicos
Keywords: concursos, questões, flashcards, simulados
```

### **Empresa**
```
Nome: StudyPro Educação Ltda
CNPJ: 00.000.000/0001-00
Endereço: Rua Principal, 123 - Centro
Cidade: São Paulo - SP
CEP: 01000-000
Telefone: (11) 1234-5678
Email: contato@studypro.com
WhatsApp: (11) 91234-5678
```

### **Marca**
```
Cor Primária: rgb(250, 204, 21) - Amarelo tático
Cor Secundária: rgb(20, 36, 47) - Azul militar
Fonte Títulos: Orbitron
Fonte Corpo: Rajdhani
```

### **Redes Sociais**
```
Facebook: https://facebook.com/studypro
Instagram: https://instagram.com/studypro
Twitter: https://twitter.com/studypro
LinkedIn: https://linkedin.com/company/studypro
YouTube: https://youtube.com/studypro
```

## 🎯 **Onde as Configurações Refletem**

### **Nome e Logo**
- Header de todas as páginas
- Página de login
- Emails enviados
- Documentos PDF gerados

### **Cores**
- Botões e links
- Destaques e badges
- Gráficos e charts
- Tema geral do sistema

### **Informações da Empresa**
- Rodapé do site
- Página de contato
- Termos de uso
- Notas fiscais

### **Redes Sociais**
- Links no rodapé
- Página de contato
- Compartilhamento social

## 🧪 **Teste Rápido**

1. **Altere o nome do site** para "MeuConcurso"
2. **Salve** e veja o nome mudar no header
3. **Mude a cor primária** para rgb(255, 0, 0) (vermelho)
4. **Salve** e veja os botões mudarem de cor
5. **Faça upload de uma logo** personalizada
6. **Salve** e veja a logo aparecer no sistema

## 📊 **Arquitetura Técnica**

### **Backend**
- Tabela `system_settings` no PostgreSQL
- Endpoints REST no Rust
- Upload de arquivos com multipart/form-data

### **Frontend**
- Store Zustand para estado global
- Persistência com localStorage
- Toast notifications para feedback
- Upload assíncrono de imagens

### **Segurança**
- Apenas admins podem acessar
- Token JWT obrigatório
- Validação de tipos de arquivo
- Sanitização de inputs

## ✨ **Resultado**

O sistema de configurações está **100% funcional** e permite personalização completa da plataforma sem necessidade de código!

---

**🎉 Teste agora:** http://173.208.151.106:5273/admin/settings