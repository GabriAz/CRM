# Guia de Instalação - Studio Que CRM (V1)

Este guia contém o passo a passo para colocar o sistema no ar.

## ⚠️ REQUISITO CRÍTICO: Backend (API) requer Node.js

O Backend deste sistema foi desenvolvido em **Node.js**.
Se a sua hospedagem na Hostinger é do tipo "Compartilhada Simples" e **NÃO tem suporte a Node.js**, o backend (pasta `api`) **NÃO FUNCIONARÁ** lá.

**Opções se você NÃO tiver Node.js na Hostinger:**
1.  **Upgrade**: Migrar para um plano VPS ou Cloud da Hostinger que permita instalar Node.js.
2.  **Hospedagem Externa (Recomendado se quiser manter custo baixo)**: Hospedar apenas a API (pasta `backend`) em serviços gratuitos/baratos como **Render.com**, **Railway.app** ou **Fly.io**, e manter o Frontend (pasta `frontend`) na Hostinger.

---

## Estrutura da Pasta "CRM V1"

-   `backend/`: Código fonte do servidor (API). Requer Node.js.
-   `frontend/`: Arquivos do site (HTML/JS). Funciona em qualquer hospedagem (inclusive a sua atual).
-   `database/`: Script SQL para o banco de dados.

---

## Passo 1: Configurar o Banco de Dados (MySQL)

*(Passo inalterado - Importar `database/FINAL_SCHEMA.sql`)*

---

## Passo 2: Configurar o Backend (API)

**Se sua hospedagem TIVER Node.js:**
1.  Siga os passos abaixo na pasta `api`.
2.  Instale as dependências (`npm install`).
3.  Inicie com `node server.js`.

**Se sua hospedagem NÃO TIVER Node.js:**
Você precisará hospedar a pasta `backend` em outro lugar.
*   Exemplo no **Render.com** (Grátis):
    1.  Crie uma conta.
    2.  Crie um "Web Service".
    3.  Conecte seu repositório do GitHub (Recomendado) ou escolha "Public Git Repository" se tiver o link.
    *   **Quais arquivos subir?**
        Você deve subir **TODO O CONTEÚDO** da pasta `CRM V1/backend`.
        
        Isso inclui:
        -   `package.json` e `package-lock.json` (Essenciais para instalar dependências)
        -   `server.js` (O arquivo que inicia tudo)
        -   `scheduler.js`
        -   Pastas: `controllers`, `routes`, `services`, `middleware`, `utils`, `database`, `migrations`.
        
        *Não suba a pasta `node_modules` (ela é criada automaticamente lá).*

    4.  **Configuração no Render (Environment Variables):**
        No painel do Render, vá em "Environment" e adicione as variáveis que estão no seu `.env` (DB_HOST, DB_USER, etc).
    5.  O Render te dará uma URL (ex: `https://studio-que-api.onrender.com`).
    6.  **Importante**: Se fizer isso, avise o desenvolvedor para gerar um novo build do Frontend apontando para essa nova URL.

---

## Passo 3: Configurar o Frontend (Site) - Pasta "crm"

1.  Acesse o **Gerenciador de Arquivos** da Hostinger.
2.  Crie uma pasta chamada `crm` dentro de `public_html` (ficando `public_html/crm`).
3.  Abra a pasta `CRM V1/frontend` deste pacote.
4.  Faça upload de **todo o conteúdo** para dentro de `public_html/crm`.
5.  O site ficará acessível em `studioque.cafe/crm`.

**Atenção:** O Frontend já foi configurado para buscar a API em `https://studioque.cafe/api`. Se a API não estiver lá (por falta de Node), o site abrirá mas não trará dados.

---


### Criando o Primeiro Usuário Admin (Importante!)

Como o banco de dados começa vazio, você precisa criar o primeiro acesso manualmente.

1.  Acesse o **phpMyAdmin** no painel da Hostinger.
2.  Clique no banco de dados do projeto (`u902969383_crmstudio`).
3.  Vá na aba **SQL** (no topo).
4.  Cole o comando abaixo e clique em **Executar** (ou Go):

```sql
INSERT INTO users (name, email, password_hash, role, can_manage_users, created_at)
VALUES ('Admin Studio Que', 'admin@studioque.cafe', '$2b$10$L3kh7nCeg/hXrfwyXfVvUuTo1DxRAHEqL6dhB75ff4E4VJFZ.i0pu', 'admin', TRUE, NOW());
```

5.  Pronto! Agora você pode logar com:
    *   **Email:** `admin@studioque.cafe`
    *   **Senha:** `admin123`

