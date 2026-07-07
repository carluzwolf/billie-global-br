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

function initFirebase() {
  if (admin.apps.length > 0) {
    return admin.database();
  }

  const { projectId, clientEmail, privateKey, databaseURL } = env.firebase;

  if (!projectId || !clientEmail || !privateKey || !databaseURL) {
    // eslint-disable-next-line no-console
    console.warn(
      '[firebase] Credenciais incompletas. O backend vai subir, mas as ' +
        'chamadas ao Firebase falharão até que o .env seja preenchido.'
    );
    return null;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    databaseURL,
  });

  return admin.database();
}

/**
 * Retorna a instância do Realtime Database, inicializando sob demanda.
 */
function getDb() {
  if (!db) {
    db = initFirebase();
  }
  return db;
}

module.exports = { getDb };
