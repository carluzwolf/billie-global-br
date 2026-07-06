/**
 * config/firebase.js
 * ---------------------------------------------------------------------------
 * Inicializa o Firebase Admin SDK para o backend (Node.js).
 * Usado para ler e escrever no Realtime Database com privilégios de servidor.
 *
 * ONDE CONFIGURAR:
 *   Preencha as variáveis no arquivo ".env" (veja ".env.example"):
 *     FIREBASE_PROJECT_ID
 *     FIREBASE_CLIENT_EMAIL
 *     FIREBASE_PRIVATE_KEY
 *     FIREBASE_DATABASE_URL
 *
 *   Esses valores vêm de: Console Firebase > Configurações do projeto >
 *   Contas de serviço > Gerar nova chave privada (arquivo JSON).
 * ---------------------------------------------------------------------------
 */

const admin = require('firebase-admin');
const { env } = require('./env');

let db = null;
let bucket = null;

function ensureApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const { projectId, clientEmail, privateKey, databaseURL, storageBucket } = env.firebase;

  if (!projectId || !clientEmail || !privateKey || !databaseURL) {
    // eslint-disable-next-line no-console
    console.warn(
      '[firebase] Credenciais incompletas. O backend vai subir, mas as ' +
        'chamadas ao Firebase falharão até que o .env seja preenchido.'
    );
    return null;
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    databaseURL,
    storageBucket: storageBucket || undefined,
  });
}

/**
 * Retorna a instância do Realtime Database, inicializando sob demanda.
 */
function getDb() {
  if (!db) {
    const app = ensureApp();
    db = app ? admin.database() : null;
  }
  return db;
}

/**
 * Retorna o bucket padrão do Firebase Storage, inicializando sob demanda.
 * Usado para armazenar permanentemente imagens/vídeos recebidos do
 * Telegram, já que os links de arquivo do Telegram expiram/rotacionam.
 */
function getBucket() {
  if (!bucket) {
    const app = ensureApp();
    if (!app) return null;

    if (!env.firebase.storageBucket) {
      // eslint-disable-next-line no-console
      console.warn(
        '[firebase] FIREBASE_STORAGE_BUCKET não configurado. Upload de ' +
          'mídia para o Storage vai falhar até que o .env seja preenchido.'
      );
      return null;
    }

    bucket = admin.storage().bucket();
  }
  return bucket;
}

module.exports = { getDb, getBucket };
