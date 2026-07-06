/**
 * services/firebaseService.js
 * ---------------------------------------------------------------------------
 * Camada de serviço para leitura e escrita de notícias no Firebase
 * Realtime Database. Nenhum outro módulo deve falar com o Firebase
 * diretamente — tudo passa por aqui, o que facilita trocar de banco
 * no futuro sem reescrever o resto da aplicação.
 *
 * ESTRUTURA DO BANCO (Realtime Database):
 *
 *   news/
 *     {newsId}/
 *       id, title, subtitle, summary, content, image, gallery, video,
 *       author, authorInstagram, category, tags, slug, date, time,
 *       createdAt, updatedAt, featured, breaking, views, readingTime,
 *       published
 * ---------------------------------------------------------------------------
 */

const { getDb } = require('../config/firebase');
const logger = require('../utils/logger');

const NEWS_PATH = 'news';

/**
 * Cria uma nova notícia no banco.
 * @param {object} newsData Objeto completo da notícia (ver estrutura acima).
 * @returns {Promise<string>} O id gerado para a notícia.
 */
async function createNews(newsData) {
  const db = getDb();
  if (!db) throw new Error('Firebase não configurado. Preencha o .env.');

  const ref = db.ref(NEWS_PATH).push();
  const id = ref.key;

  const now = Date.now();
  await ref.set({
    ...newsData,
    id,
    createdAt: now,
    updatedAt: now,
    views: newsData.views || 0,
    published: newsData.published !== undefined ? newsData.published : true,
  });

  logger.info(`[firebaseService] Notícia criada: ${id} — "${newsData.title}"`);
  return id;
}

/**
 * Atualiza uma notícia existente.
 * @param {string} id
 * @param {object} updates
 */
async function updateNews(id, updates) {
  const db = getDb();
  if (!db) throw new Error('Firebase não configurado. Preencha o .env.');

  await db.ref(`${NEWS_PATH}/${id}`).update({
    ...updates,
    updatedAt: Date.now(),
  });
}

/**
 * Busca uma notícia pelo id.
 * @param {string} id
 */
async function getNewsById(id) {
  const db = getDb();
  if (!db) throw new Error('Firebase não configurado. Preencha o .env.');

  const snapshot = await db.ref(`${NEWS_PATH}/${id}`).once('value');
  return snapshot.val();
}

/**
 * Busca uma notícia pelo slug (usado na URL pública /noticia.html?slug=...).
 * @param {string} slug
 */
async function getNewsBySlug(slug) {
  const db = getDb();
  if (!db) throw new Error('Firebase não configurado. Preencha o .env.');

  const snapshot = await db
    .ref(NEWS_PATH)
    .orderByChild('slug')
    .equalTo(slug)
    .once('value');

  const data = snapshot.val();
  if (!data) return null;

  const [id] = Object.keys(data);
  return { id, ...data[id] };
}

/**
 * Retorna todas as notícias publicadas, mais recentes primeiro.
 * @param {number} [limit] Limite opcional de resultados.
 */
async function getAllNews(limit) {
  const db = getDb();
  if (!db) throw new Error('Firebase não configurado. Preencha o .env.');

  let query = db.ref(NEWS_PATH).orderByChild('createdAt');
  if (limit) query = query.limitToLast(limit);

  const snapshot = await query.once('value');
  const data = snapshot.val() || {};

  return Object.values(data)
    .filter((item) => item.published)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Retorna notícias de uma categoria específica.
 * @param {string} category
 */
async function getNewsByCategory(category) {
  const all = await getAllNews();
  return all.filter(
    (item) => item.category?.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Incrementa o contador de visualizações de uma notícia (usado para
 * alimentar a seção "Mais lidas").
 * @param {string} id
 */
async function incrementViews(id) {
  const db = getDb();
  if (!db) throw new Error('Firebase não configurado. Preencha o .env.');

  const ref = db.ref(`${NEWS_PATH}/${id}/views`);
  await ref.transaction((current) => (current || 0) + 1);
}

module.exports = {
  createNews,
  updateNews,
  getNewsById,
  getNewsBySlug,
  getAllNews,
  getNewsByCategory,
  incrementViews,
};
