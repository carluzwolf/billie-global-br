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
    botToken: process.env.TELEGRAM_BOT_TOKEN || '7990367104:AAF8Jen9H42zcmh6dfvFizXm6OoyiAfjYYI',
    channelUsername: process.env.TELEGRAM_CHANNEL_USERNAME || '@billieglobalbr',
  },

  ai: {
    provider: (process.env.AI_PROVIDER || 'openai').toLowerCase(), // 'openai' | 'gemini'
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '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',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || 'AQ.Ab8RN6L-IxansAR6A-m-Y_5-j2PRU1sSlZbQeiMV5Tap6o6H2Q',
      model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
    },
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'billie-global-br-feed',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@billie-global-br-feed.iam.gserviceaccount.com',
    // Chaves privadas costumam vir com "\n" escapado no .env — normalizamos aqui.
    privateKey: (process.env.FIREBASE_PRIVATE_KEY |-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDbCJbHAAGOXyUj\nP1H9P01Za3i4KoG0F0hTRMRfwwC+JTuK59vSnnQlLJ/pjQqKLPCWZDcncumI7f0J\n8mDq8C+JTpGsJkFm2+B48LMCL7OhjLXVMS0JPWzrkhFLX1sz6QCCpEwhm/zXXOqk\nuoqwqSNJm38RtL+Bo8uRWj8x8Jjy1OrTzrtK4e+mtN1pRz3MPF6LUaSP/mN9kuqS\nTJ4iQGkCom1LOQmhH2vF0HIKoMmpRuwcjCh4z8j0YbYA8HtDseF8GPTLf+RFROLn\nhDaK4HkBPx6DGCqgPVP1SQD7xoQ5D16sz/jnKmWhrarBZUmLDAmA54Xuy/B7cX/W\nnYSGJeiPAgMBAAECgf9QUux/JWj/P2oEQ41D9yTHRV7rczPwoY9maWMlSchqXEjS\nl0RTQEPDH7DJit0THT7e+bhhdd0TbKx9VDO/ZAlua429+ogLRQpvfomKv85vZ1LG\nd2pQEZN7ZMxkLLY6z0Z3G5C8OcVZSNRC6rp0qSDwwxCcwLbthq+Q90oAzrzW++Yl\n25eb2xNxfIsRAgY5ANuMV/NFjSiza9vxuqGX/TcFgHR948d9wUsc07EmAcPIFpQn\no6x4IjAJyyS6ilqhi6bAvU9lLA1R1/kDJzUnFrfhMSLgEZVGRplY654QaJRXbYG8\nEioGn+sUbCSR/Y2KRQMwbHjyhd534nilrwvNAjECgYEA+KhlAliIqUtnsQzBeB6Q\n2jXhM5U3LQ8MBjiTC91yrFGnFeFzlumVbt5kNhSMQdmSxMaP5/WZiHP4Q9CjX7jp\nf6GfYYPiEaR46TQJrmrVrtvBtG4/CGCdiA7120pvZTExKNv4ptm3stSPce9PwhyX\nG2F9W+h3tDMZFXrsVQWzbbECgYEA4YBDvtW737N47DLoe1oqdc9BPwUxF7T/XWUp\ndQ8Kv7Y9dAKzFrbPgX7hssqdwRRJNaZiTKSq7qzyL/nwgK+D3jF1dXqxvc3DB10g\nJ497WQGmpfYgr6483JH9YQ8zH/D7gWbViSMUKSm2lp1T8Q9VxYp0rCabEmpNFwz+\nEkxFCj8CgYEAuM5O5ENwroJAerIESIZPGh7ZVUEdVPvN8AG0KClZxQCasgRxqEPK\nsC/RQvBancZa8qyw37EFfwjSB3TVN5tyz00L66ndJ0eaJZhraZo1XlQtzy/w4QUN\nj8WurGDSEd9RrhBu6XL+uIaKZh96o8Yj+FGondpUvTUM+430f+xQwsECgYEAkzHh\nhsEHWLdTGIMGg/ZQPwRhZ5yg9gOcqT8ud42xC4EOzhoxAoOkIbhL5SQjI3R1cULB\naZwXQ6K6mByDI8ztu+z26g+D1Axq4PSl14zuDCRqvmxR27tVWPkmtuNwEMqBsW8J\ntfGi6FelKt1ZfMHwz/hXvkOY98VRutktQ45rhosCgYBEbNNR3a700fVIIKyc2OxU\nqzv4J/1lwWDlj4XOC2HjnPFbEHsJJOlWc937LIIIEQ6RrpXY6MR4Gw/p/eKVqI49\nSY1p1P1aVqa3oYmdTAorImyDsmHFr6VZMpPjKLlt4bl/7Acax20LYmpiGXB4jv3r\nenaq9v3p2V4UgIsmT5nUag==\n-----END PRIVATE KEY-----\n| '').replace(/\\n/g, '\n'),
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://billie-global-br-feed-default-rtdb.firebaseio.com/',
    // Bucket do Firebase Storage, usado para hospedar permanentemente as
    // imagens/vídeos recebidos do Telegram (cujos links expiram).
    // Ex: "billie-global-br-feed.firebasestorage.app" (mesmo valor usado
    // em frontend/js/firebase-config.js, campo "storageBucket").
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'billie-global-br-feed.firebasestorage.app',
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
