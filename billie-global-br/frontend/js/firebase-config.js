/**
 * firebase-config.js
 * -----------------------------------------------------------------------
 * Inicialização do Firebase no FRONTEND (SDK client-side), usada para
 * ler o Realtime Database em tempo real — é isso que faz o site
 * atualizar sozinho assim que uma notícia nova é salva pelo backend.
 *
 * ONDE CONFIGURAR:
 *   1. Vá em Console Firebase > Configurações do projeto > Seus apps
 *      > Web > Config.
 *   2. Copie o objeto de configuração e cole abaixo, substituindo os
 *      valores de exemplo.
 *
 *   OBSERVAÇÃO DE SEGURANÇA:
 *   As chaves do Firebase Web (apiKey, appId etc.) NÃO são secretas da
 *   mesma forma que uma chave de API de servidor — elas identificam o
 *   projeto, mas quem protege os dados são as REGRAS do Realtime
 *   Database (Console Firebase > Realtime Database > Regras). Configure
 *   leitura pública apenas para "news" e escrita restrita ao backend
 *   (Admin SDK) + ao campo "views" via regra granular. Veja o README.
 * -----------------------------------------------------------------------
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getDatabase,
  ref,
  onValue,
  query,
  orderByChild,
  equalTo,
  runTransaction,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

// -------------------------------------------------------------------
// SUBSTITUA pelos dados do SEU projeto Firebase:
// -------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAdqAR-3gmsVw-_q6Df54f4uMDtICp7bVE",
  authDomain: "billie-global-br-feed.firebaseapp.com",
  databaseURL: "https://billie-global-br-feed-default-rtdb.firebaseio.com",
  projectId: "billie-global-br-feed",
  storageBucket: "billie-global-br-feed.firebasestorage.app",
  messagingSenderId: "574955886081",
  appId: "1:574955886081:web:8fe8b64bf77c437ff7d200"
};
// -------------------------------------------------------------------

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue, query, orderByChild, equalTo, runTransaction };
