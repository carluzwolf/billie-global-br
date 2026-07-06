# Billie Global BR

Portal de notícias da comunidade brasileira de fãs de Billie Eilish, com publicação
100% automatizada: um post novo no canal do Telegram vira notícia no site sozinho,
sem nenhuma ação manual.

> Billie Global BR é uma comunidade independente de fãs e não possui ligação oficial
> com Billie Eilish ou sua equipe.

---

## ⚠️ Aviso de segurança importante

Durante a criação deste projeto, um token de bot do Telegram e uma chave de API da
OpenAI foram compartilhados em texto simples na conversa. **Trate as duas como
comprometidas:**

1. **Revogue e gere novas agora:**
   - Telegram: fale com [@BotFather](https://t.me/BotFather) → `/revoke` no bot afetado
     (ou `/token` para gerar um novo).
   - OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys) →
     delete a chave exposta e crie outra.
2. **Nunca cole credenciais reais em chats, tickets ou documentos** — mesmo com IA,
   mesmo "só para organizar o projeto". Use sempre um arquivo `.env` local, que nunca
   é commitado (já está no `.gitignore`).
3. Nenhum arquivo deste projeto contém as chaves compartilhadas — todos os lugares que
   precisam de credenciais usam apenas variáveis de ambiente com placeholders.

---

## Sumário

- [Visão geral](#visão-geral)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Configurar o Firebase](#configurar-o-firebase)
- [Configurar o Telegram](#configurar-o-telegram)
- [Configurar a IA (OpenAI ou Gemini)](#configurar-a-ia-openai-ou-gemini)
- [Rodando localmente](#rodando-localmente)
- [Publicando o site](#publicando-o-site)
- [Fluxo de automação](#fluxo-de-automação)
- [SEO, performance e segurança](#seo-performance-e-segurança)
- [Como adicionar novas funcionalidades](#como-adicionar-novas-funcionalidades)

---

## Visão geral

- **Frontend:** HTML5 + CSS3 + JavaScript ES6+ puro (sem framework), lendo o Firebase
  Realtime Database diretamente para atualizar a página em tempo real.
- **Backend:** Node.js + Express, responsável por (a) escutar o canal do Telegram,
  (b) mandar o conteúdo para a IA organizar, (c) salvar no Firebase, e (d) expor uma
  API de leitura/SEO (busca, sitemap, robots.txt).
- **Banco:** Firebase Realtime Database.
- **IA:** OpenAI ou Gemini, intercambiáveis por variável de ambiente.

## Estrutura de pastas

```
/
├── backend/
│   ├── config/         # env.js, firebase.js
│   ├── controllers/     # newsController.js
│   ├── routes/           # newsRoutes.js, seoRoutes.js
│   ├── services/         # firebaseService, aiService, telegramService, newsProcessor, seoService
│   │   └── aiProviders/  # openaiProvider.js, geminiProvider.js, prompt.js
│   ├── middleware/       # sanitize.js, errorHandler.js
│   ├── utils/             # slugify.js, readingTime.js, logger.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── assets/{icons,images,fonts}
│   ├── css/ (variables.css, style.css)
│   ├── js/ (firebase-config.js, news.js, search.js, main.js)
│   ├── pages/ (sobre.html, contato.html, categorias.html)
│   ├── index.html
│   └── noticia.html
├── README.md
└── .env.example
```

## Pré-requisitos

- Node.js 18 ou superior
- Uma conta no [Firebase](https://console.firebase.google.com/)
- Um bot do Telegram (via [@BotFather](https://t.me/BotFather))
- Uma chave de API da [OpenAI](https://platform.openai.com/) ou do
  [Google AI Studio](https://aistudio.google.com/) (Gemini)

## Instalação

```bash
# 1. Entre na pasta do backend
cd backend

# 2. Instale as dependências
npm install

# 3. Copie o arquivo de exemplo de variáveis de ambiente
cp ../.env.example .env

# 4. Preencha o .env com suas credenciais reais (veja as seções abaixo)
```

O frontend não precisa de instalação — é HTML/CSS/JS puro. Basta abrir com um
servidor estático (Live Server, `npx serve`, ou publicar direto no Vercel/Netlify/
Firebase Hosting).

## Variáveis de ambiente

Todas as variáveis estão documentadas em [`.env.example`](./.env.example). Nunca
edite os arquivos de código com valores reais — sempre passe pelo `.env`.

## Configurar o Firebase

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com/).
2. Ative o **Realtime Database** (não o Firestore).
3. Em **Configurações do projeto > Contas de serviço**, clique em "Gerar nova chave
   privada" — isso baixa um JSON com `project_id`, `client_email` e `private_key`.
   Copie esses três valores para `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` e
   `FIREBASE_PRIVATE_KEY` no `.env` do backend.
4. Em **Configurações do projeto > Seus apps > Web**, copie o objeto de configuração
   para `frontend/js/firebase-config.js` (há comentários indicando exatamente onde).
5. Configure as **regras do Realtime Database** para permitir leitura pública de
   notícias, mas restringir escrita ao backend (Admin SDK ignora as regras) e a um
   campo específico de visualizações:

```json
{
  "rules": {
    "news": {
      ".read": true,
      ".write": false,
      "$newsId": {
        "views": {
          ".write": true
        }
      }
    }
  }
}
```

6. Ative o **Firebase Storage** (Console Firebase > Storage > Vamos começar).
   É para lá que as imagens/vídeos das notícias são copiados permanentemente —
   o backend nunca mais salva o link direto do Telegram no banco, porque ele
   expira. Copie o nome do bucket (Console Firebase > Storage > topo da página,
   algo como `seu-projeto.firebasestorage.app`) para `FIREBASE_STORAGE_BUCKET`
   no `.env` do backend.
7. Configure as **regras do Storage** para permitir leitura pública apenas da
   pasta usada pelas notícias, e escrita só pelo backend (Admin SDK também
   ignora essas regras):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /news-media/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

Depois disso, o fluxo passa a ser: post no Telegram → `telegramService.js` pega
o link temporário da mídia → `storageService.js` baixa esse arquivo e faz
upload para `news-media/AAAA/MM/...` no Storage → a URL pública permanente
retornada é que vai para o campo `image`/`gallery`/`video` da notícia no
Realtime Database. O link do Telegram nunca chega a ser salvo.

## Configurar o Telegram

1. Fale com [@BotFather](https://t.me/BotFather) e crie um bot com `/newbot`.
2. Copie o token gerado para `TELEGRAM_BOT_TOKEN` no `.env`.
3. Adicione o bot como **administrador** do canal `@billieglobalbr` (obrigatório —
   sem isso o bot não recebe os posts do canal).
4. Preencha `TELEGRAM_CHANNEL_USERNAME=@billieglobalbr` no `.env`.

O backend usa *polling* por padrão (mais simples de rodar em qualquer hospedagem).
Para alto volume, é possível migrar para *webhook* trocando a inicialização em
`backend/services/telegramService.js`.

## Configurar a IA (OpenAI ou Gemini)

Defina `AI_PROVIDER=openai` ou `AI_PROVIDER=gemini` no `.env` e preencha a chave
correspondente (`OPENAI_API_KEY` ou `GEMINI_API_KEY`). Trocar de provedor não exige
mudança em nenhum outro arquivo — a lógica de troca vive inteiramente em
`backend/services/aiService.js`.

## Rodando localmente

```bash
cd backend
npm run dev     # com reinício automático (nodemon)
# ou
npm start       # produção
```

O servidor sobe em `http://localhost:3000` (ou na porta definida em `PORT`). A rota
`/health` confirma que a API está no ar.

Para o frontend, abra `frontend/index.html` com qualquer servidor estático local.

## Publicando o site

- **Frontend:** compatível com Vercel, Netlify ou Firebase Hosting — é um site
  estático. Aponte a hospedagem para a pasta `frontend/`.
- **Backend:** como o listener do Telegram precisa ficar sempre ativo (processo
  persistente), prefira uma hospedagem com processo contínuo (Railway, Render, um
  VPS, ou Cloud Run) em vez de funções serverless de execução única. Configure as
  mesmas variáveis de ambiente do `.env` no painel da hospedagem escolhida.

## Fluxo de automação

```
Canal do Telegram (@billieglobalbr)
        ↓ (bot é admin do canal)
telegramService.js detecta o novo post
        ↓ extrai texto, imagem, vídeo, links
aiService.js envia o texto para a IA (OpenAI ou Gemini)
        ↓ IA devolve título, subtítulo, resumo, conteúdo, categoria, tags, slug
newsProcessor.js monta o objeto final e sanitiza o HTML
        ↓
firebaseService.js salva em news/{id} no Realtime Database
        ↓
frontend (news.js) está com onValue() ouvindo o nó "news"
        ↓
A notícia aparece no site automaticamente, sem reload e sem ação manual
```

## SEO, performance e segurança

**SEO:** meta title/description, Open Graph, Twitter Card e JSON-LD (schema.org
`NewsArticle`) são gerados dinamicamente por notícia (`js/news.js` no frontend e
`services/seoService.js` no backend, que também expõe `/sitemap.xml` e `/robots.txt`).

**Performance:** lazy loading de imagens (`loading="lazy"`), CSS/JS modular e sem
dependências pesadas, `compression` e `helmet` no backend, imagens com `aspect-ratio`
para evitar layout shift.

**Segurança:** todo HTML vindo da IA passa por `sanitize-html` antes de ser salvo
(proteção contra XSS), credenciais somente via variáveis de ambiente, regras de
acesso do Firebase restringindo escrita, tratamento centralizado de erros no backend.

## Como adicionar novas funcionalidades

A arquitetura foi pensada para crescer sem reestruturação:

- **Nova categoria de conteúdo:** adicione a categoria em
  `backend/services/aiProviders/prompt.js` (`ALLOWED_CATEGORIES`) e nos pills de
  `frontend/index.html` / `frontend/pages/categorias.html`.
- **Novo provedor de IA:** crie um arquivo em `backend/services/aiProviders/`
  seguindo o mesmo contrato (`generateNews(rawContent)`) e registre-o em
  `aiService.js`.
- **Comentários:** a página de notícia já tem o espaço reservado
  (`.comments-placeholder` em `noticia.html`) — basta plugar o serviço escolhido
  (Firebase, Disqus, etc.) ali.
- **Modo escuro:** o CSS já tem as variáveis prontas em `[data-theme='dark']`
  (`variables.css`) e o botão já alterna `document.documentElement.dataset.theme`
  em `main.js` — é só refinar o contraste conforme o gosto visual.
