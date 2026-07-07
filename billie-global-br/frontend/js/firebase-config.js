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
  apiKey: 'COLOQUE_AQUI_SUA_API_KEY',
  authDomain: 'seu-projeto.firebaseapp.com',
  databaseURL: 'https://seu-projeto-default-rtdb.firebaseio.com',
  projectId: 'seu-projeto',
  storageBucket: 'seu-projeto.appspot.com',
  messagingSenderId: 'COLOQUE_AQUI',
  appId: 'COLOQUE_AQUI',
};
// -------------------------------------------------------------------

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue, query, orderByChild, equalTo, runTransaction };
