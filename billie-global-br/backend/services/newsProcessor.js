/**
 * services/newsProcessor.js
 * ---------------------------------------------------------------------------
 * Orquestra o fluxo completo e automático:
 *
 *   Post no Telegram -> extração de mídia/texto -> IA organiza -> sanitiza
 *   -> salva no Firebase -> site atualiza sozinho via listener em tempo real
 *
 * Nenhuma etapa aqui exige intervenção manual.
 * ---------------------------------------------------------------------------
 */

const aiService = require('./aiService');
const firebaseService = require('./firebaseService');
const logger = require('../utils/logger');

const FOUNDER_NAME = 'Carlos Henrique';
const FOUNDER_INSTAGRAM = '@carluzsnt';

/**
 * Processa um post normalizado do Telegram e publica a notícia resultante.
 * @param {object} normalizedPost Vem de telegramService.normalizeMessage().
 */
async function processIncomingPost(normalizedPost) {
  const { text, imageUrl, videoUrl, links } = normalizedPost;

  if (!text || text.trim().length < 10) {
    logger.warn('[newsProcessor] Post ignorado: sem texto suficiente para gerar notícia.');
    return null;
  }

  logger.info('[newsProcessor] IA desativada. Publicando texto original.');

const generated = {
  title: text.split('\n')[0].slice(0, 120),
  subtitle: '',
  summary: text.slice(0, 180),
  content: text.replace(/\n/g, '<br>'),
  category: 'Billie Global BR',
  tags: [],
  slug: `news-${Date.now()}`,
  readingTime: Math.max(1, Math.ceil(text.split(/\s+/).length / 200))
};

  const now = new Date();

  const newsData = {
    title: generated.title,
    subtitle: generated.subtitle,
    summary: generated.summary,
    content: generated.content,
    image: imageUrl || null,
    gallery: imageUrl ? [imageUrl] : [],
    video: videoUrl || (links.find(isYouTubeLink) ?? null),
    author: FOUNDER_NAME,
    authorInstagram: FOUNDER_INSTAGRAM,
    category: generated.category,
    tags: generated.tags,
    slug: generated.slug,
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().slice(0, 5),
    featured: false,
    breaking: true, // toda notícia recém-publicada entra como "breaking" por padrão
    readingTime: generated.readingTime,
    published: true,
  };

  const id = await firebaseService.createNews(newsData);
  logger.info(`[newsProcessor] Notícia publicada com sucesso (id: ${id}).`);
  return id;
}

function isYouTubeLink(url = '') {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

module.exports = { processIncomingPost };
