# PARTIC Flow — CRM

## Deploy no Vercel (passo a passo)

### 1. Criar conta no GitHub (se não tiver)
- Acesse github.com e crie uma conta gratuita

### 2. Criar repositório no GitHub
- Clique em "New repository"
- Nome: `partic-flow`
- Deixe como **Public** (necessário no plano gratuito)
- Clique em "Create repository"

### 3. Subir os arquivos
- Na página do repositório, clique em "uploading an existing file"
- Arraste a pasta `partic-flow` inteira (ou os arquivos individualmente)
- Clique em "Commit changes"

### 4. Deploy no Vercel
- Acesse vercel.com e crie conta com o GitHub
- Clique em "Add New Project"
- Selecione o repositório `partic-flow`
- Clique em "Deploy"
- Aguarde ~2 minutos

### 5. Pronto!
- Vercel gera uma URL como: `partic-flow.vercel.app`
- Essa URL funciona em qualquer dispositivo
- Para atualizar: basta subir novos arquivos no GitHub

## Estrutura do projeto
```
partic-flow/
├── public/
│   └── index.html
├── src/
│   ├── index.js
│   └── App.js        ← Todo o sistema aqui
├── package.json
└── vercel.json
```

## Acesso
- Email: karine@partic.com.br
- Senha: partic2025
