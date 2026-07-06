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
const storageService = require('./storageService');
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

  logger.info('[newsProcessor] Enviando conteúdo para a IA...');
  const generated = await aiService.generateNews(text);

  // -------------------------------------------------------------------
  // IMPORTANTE: os links de mídia que vêm do Telegram (imageUrl/videoUrl)
  // são TEMPORÁRIOS e expiram. Antes de salvar a notícia, baixamos a
  // mídia e a re-hospedamos permanentemente no Firebase Storage — é essa
  // URL permanente (e não a do Telegram) que vai para o Realtime Database.
  // -------------------------------------------------------------------
  let permanentImageUrl = null;
  let permanentVideoUrl = null;

  try {
    permanentImageUrl = await storageService.persistMediaFromUrl(imageUrl, 'image');
  } catch (err) {
    logger.error(
      '[newsProcessor] Não foi possível persistir a imagem no Firebase Storage. ' +
        'A notícia será publicada sem imagem.',
      err.message
    );
  }

  // Vídeos enviados como arquivo pelo Telegram (não links do YouTube) têm o
  // mesmo problema de expiração e passam pelo mesmo tratamento.
  if (videoUrl) {
    try {
      permanentVideoUrl = await storageService.persistMediaFromUrl(videoUrl, 'video');
    } catch (err) {
      logger.error(
        '[newsProcessor] Não foi possível persistir o vídeo no Firebase Storage. ' +
          'A notícia será publicada sem vídeo próprio.',
        err.message
      );
    }
  }

  const now = new Date();

  const newsData = {
    title: generated.title,
    subtitle: generated.subtitle,
    summary: generated.summary,
    content: generated.content,
    image: permanentImageUrl || null,
    gallery: permanentImageUrl ? [permanentImageUrl] : [],
    // Vídeo próprio (já permanente) tem prioridade; senão, cai para um
    // eventual link de YouTube citado no texto (esse já é permanente).
    video: permanentVideoUrl || (links.find(isYouTubeLink) ?? null),
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
