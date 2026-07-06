/**
 * services/storageService.js
 * ---------------------------------------------------------------------------
 * Camada de serviço para tornar PERMANENTE qualquer mídia (imagem ou vídeo)
 * recebida do Telegram, subindo-a para o Firebase Storage.
 *
 * POR QUE ISSO EXISTE:
 *   Os links retornados por `bot.getFileLink()` (telegramService.js) apontam
 *   para os servidores do Telegram e EXPIRAM/rotacionam depois de um tempo.
 *   Se salvarmos esse link direto no Realtime Database, a notícia acaba
 *   ficando com imagem quebrada no site depois de algumas horas/dias.
 *
 *   Este serviço baixa o arquivo do link temporário do Telegram e o
 *   re-hospeda no Firebase Storage, retornando uma URL pública permanente
 *   para ser essa sim a URL salva no banco (campo "image"/"gallery"/"video").
 *
 * ESTRUTURA NO STORAGE:
 *   news-media/{ano}/{mes}/{timestamp}-{nomeAleatorio}.{extensao}
 * ---------------------------------------------------------------------------
 */

const fetch = require('node-fetch');
const crypto = require('crypto');
const { getBucket } = require('../config/firebase');
const logger = require('../utils/logger');

// Mapeia content-type -> extensão, para o caso de a URL não trazer extensão.
const EXTENSION_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
};

/**
 * Baixa o conteúdo de uma URL (ex: link temporário do Telegram) e retorna
 * o buffer junto com o content-type detectado.
 * @param {string} url
 */
async function downloadFile(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Falha ao baixar mídia (status ${response.status}) de: ${url}`
    );
  }
  const contentType =
    response.headers.get('content-type') || 'application/octet-stream';
  const buffer = await response.buffer();
  return { buffer, contentType };
}

/**
 * Monta um nome de arquivo único e "seguro" para o Storage.
 * @param {string} contentType
 * @param {string} [prefix] Ex: "img" ou "video"
 */
function buildFileName(contentType, prefix = 'file') {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const extension = EXTENSION_BY_MIME[contentType] || 'bin';
  const uniqueId = crypto.randomBytes(8).toString('hex');

  return `news-media/${year}/${month}/${prefix}-${now.getTime()}-${uniqueId}.${extension}`;
}

/**
 * Faz upload de um Buffer para o Firebase Storage e retorna a URL pública
 * permanente (via token de download, no formato usado pelo Firebase).
 * @param {Buffer} buffer
 * @param {string} contentType
 * @param {string} destination Caminho dentro do bucket (ex: gerado por buildFileName).
 */
async function uploadBuffer(buffer, contentType, destination) {
  const bucket = getBucket();
  if (!bucket) {
    throw new Error(
      'Firebase Storage não configurado. Preencha FIREBASE_STORAGE_BUCKET no .env.'
    );
  }

  const file = bucket.file(destination);
  const downloadToken = crypto.randomUUID();

  await file.save(buffer, {
    contentType,
    resumable: false,
    metadata: {
      cacheControl: 'public, max-age=31536000, immutable',
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  });

  const encodedPath = encodeURIComponent(destination);
  // URL pública no mesmo formato gerado pelo Console/SDK do Firebase.
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`;
}

/**
 * Baixa uma mídia a partir de uma URL temporária (ex: Telegram) e a
 * re-hospeda permanentemente no Firebase Storage.
 *
 * @param {string} sourceUrl URL de origem (temporária).
 * @param {'image'|'video'} [kind] Usado apenas para nomear o arquivo.
 * @returns {Promise<string|null>} URL pública permanente, ou null se sourceUrl for vazio.
 */
async function persistMediaFromUrl(sourceUrl, kind = 'file') {
  if (!sourceUrl) return null;

  try {
    const { buffer, contentType } = await downloadFile(sourceUrl);
    const destination = buildFileName(contentType, kind === 'video' ? 'video' : 'img');
    const publicUrl = await uploadBuffer(buffer, contentType, destination);

    logger.info(
      `[storageService] Mídia (${kind}) persistida permanentemente em: ${destination}`
    );
    return publicUrl;
  } catch (err) {
    logger.error(
      `[storageService] Falha ao persistir mídia (${kind}) no Storage:`,
      err.message
    );
    // Propaga o erro para quem chamou decidir o que fazer (ex: newsProcessor
    // pode optar por publicar mesmo assim sem imagem, ou abortar).
    throw err;
  }
}

/**
 * Conveniência para persistir várias mídias de uma vez (ex: galeria de
 * imagens), preservando a ordem e ignorando entradas vazias.
 * @param {string[]} urls
 * @param {'image'|'video'} [kind]
 */
async function persistManyFromUrls(urls = [], kind = 'image') {
  const results = [];
  for (const url of urls) {
    if (!url) continue;
    // eslint-disable-next-line no-await-in-loop
    const persisted = await persistMediaFromUrl(url, kind);
    if (persisted) results.push(persisted);
  }
  return results;
}

module.exports = {
  persistMediaFromUrl,
  persistManyFromUrls,
};
