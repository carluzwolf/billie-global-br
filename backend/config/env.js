/**
 * config/env.js
 * ---------------------------------------------------------------------------
 * Ponto único de leitura das variáveis de ambiente.
 * Nenhuma credencial deve ser escrita diretamente em nenhum outro arquivo
 * do projeto — tudo passa por aqui, e tudo vem do processo (.env).
 * ---------------------------------------------------------------------------
 */

require('dotenv').config();

const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  siteUrl: process.env.SITE_URL || 'http://localhost:3000',

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    channelUsername: process.env.TELEGRAM_CHANNEL_USERNAME || '',
  },

  ai: {
    provider: (process.env.AI_PROVIDER || 'openai').toLowerCase(), // 'openai' | 'gemini'
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
    },
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    // Chaves privadas costumam vir com "\n" escapado no .env — normalizamos aqui.
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    databaseURL: process.env.FIREBASE_DATABASE_URL || '',
    // Bucket do Firebase Storage, usado para hospedar permanentemente as
    // imagens/vídeos recebidos do Telegram (cujos links expiram).
    // Ex: "billie-global-br-feed.firebasestorage.app" (mesmo valor usado
    // em frontend/js/firebase-config.js, campo "storageBucket").
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  },

  allowedOrigins: (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

/**
 * Avisa no console (sem nunca imprimir valores) quais variáveis obrigatórias
 * ainda não foram configuradas. Isso ajuda no primeiro setup sem expor segredos.
 */
function validateEnv() {
  const missing = [];

  if (!env.telegram.botToken) missing.push('TELEGRAM_BOT_TOKEN');
  if (!env.telegram.channelUsername) missing.push('TELEGRAM_CHANNEL_USERNAME');

  if (env.ai.provider === 'openai' && !env.ai.openai.apiKey) missing.push('OPENAI_API_KEY');
  if (env.ai.provider === 'gemini' && !env.ai.gemini.apiKey) missing.push('GEMINI_API_KEY');

  if (!env.firebase.projectId) missing.push('FIREBASE_PROJECT_ID');
  if (!env.firebase.clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
  if (!env.firebase.privateKey) missing.push('FIREBASE_PRIVATE_KEY');
  if (!env.firebase.databaseURL) missing.push('FIREBASE_DATABASE_URL');
  if (!env.firebase.storageBucket) missing.push('FIREBASE_STORAGE_BUCKET');

  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `[env] Atenção: as seguintes variáveis não foram configuradas: ${missing.join(', ')}.\n` +
        '       Preencha o arquivo .env antes de usar os recursos correspondentes.'
    );
  }
}

module.exports = { env, validateEnv };
