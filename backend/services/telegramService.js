/**
 * services/telegramService.js
 * ---------------------------------------------------------------------------
 * Escuta novas postagens no canal do Telegram da comunidade e extrai
 * texto, imagens, vídeos e links, repassando tudo para o newsProcessor.
 *
 * IMPORTANTE:
 *   - O bot precisa ser ADICIONADO COMO ADMINISTRADOR do canal
 *     @billieglobalbr para conseguir receber os posts (channel_post).
 *   - Usa "polling" por padrão (mais simples de rodar em qualquer host).
 *     Para produção de alto volume, considere migrar para webhook
 *     (bot.setWebHook) apontando para uma rota HTTPS pública.
 * ---------------------------------------------------------------------------
 */

const TelegramBot = require('node-telegram-bot-api');
const { env } = require('../config/env');
const logger = require('../utils/logger');

let bot = null;

/**
 * Extrai o maior tamanho de foto disponível de uma mensagem do Telegram.
 */
function extractLargestPhotoFileId(message) {
  if (!message.photo || message.photo.length === 0) return null;
  return message.photo[message.photo.length - 1].file_id;
}

/**
 * Extrai links de entidades de texto (message entities), cobrindo tanto
 * URLs digitadas quanto links em formato "texto âncora".
 */
function extractLinks(message) {
  const entities = message.entities || message.caption_entities || [];
  const text = message.text || message.caption || '';

  return entities
    .filter((e) => e.type === 'url' || e.type === 'text_link')
    .map((e) => e.url || text.substr(e.offset, e.length));
}

/**
 * Normaliza uma mensagem crua do Telegram em um objeto simples e
 * previsível para o restante do pipeline.
 */
async function normalizeMessage(message) {
  const photoFileId = extractLargestPhotoFileId(message);
  const videoFileId = message.video?.file_id || null;

  const [imageUrl, videoUrl] = await Promise.all([
    photoFileId ? bot.getFileLink(photoFileId) : Promise.resolve(null),
    videoFileId ? bot.getFileLink(videoFileId) : Promise.resolve(null),
  ]);

  return {
    text: message.text || message.caption || '',
    imageUrl, // NOTA: links de arquivo do Telegram podem expirar/rotacionar —
    // para produção, recomenda-se rebaixar essa imagem para um storage
    // permanente (ex: Firebase Storage) logo após o recebimento.
    videoUrl,
    links: extractLinks(message),
    telegramMessageId: message.message_id,
    telegramDate: message.date,
  };
}

/**
 * Inicia o listener do canal do Telegram.
 * @param {(normalizedPost: object) => Promise<void>} onNewPost Callback executado a cada novo post.
 */
function startTelegramListener(onNewPost) {
  if (!env.telegram.botToken) {
    logger.warn('[telegramService] TELEGRAM_BOT_TOKEN não configurado — listener não iniciado.');
    return;
  }

  bot = new TelegramBot(env.telegram.botToken, { polling: true });

  bot.on('channel_post', async (message) => {
    try {
      logger.info(`[telegramService] Novo post recebido do canal (id ${message.message_id}).`);
      const normalized = await normalizeMessage(message);
      await onNewPost(normalized);
    } catch (err) {
      logger.error('[telegramService] Falha ao processar post do canal:', err.message);
    }
  });

  bot.on('polling_error', (err) => {
    logger.error('[telegramService] Erro de polling:', err.message);
  });

  logger.info(
    `[telegramService] Escutando novas postagens de ${env.telegram.channelUsername}...`
  );
}

module.exports = { startTelegramListener };
