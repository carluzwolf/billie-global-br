/**
 * services/aiService.js
 * ---------------------------------------------------------------------------
 * Fachada intercambiável de IA. O resto da aplicação chama apenas
 * `aiService.generateNews(rawContent)` sem saber (nem precisar saber)
 * se por trás está OpenAI ou Gemini. Trocar de provedor é só mudar
 * AI_PROVIDER no .env — nenhum outro código muda.
 * ---------------------------------------------------------------------------
 */

const { env } = require('../config/env');
const openaiProvider = require('./aiProviders/openaiProvider');
const geminiProvider = require('./aiProviders/geminiProvider');
const slugify = require('../utils/slugify');
const calculateReadingTime = require('../utils/readingTime');
const { sanitizeContent, sanitizePlainText } = require('../middleware/sanitize');

const PROVIDERS = {
  openai: openaiProvider,
  gemini: geminiProvider,
};

/**
 * Gera a notícia organizada a partir do conteúdo bruto do Telegram,
 * já sanitizada e com metadados calculados (slug, tempo de leitura).
 * @param {string} rawContent
 * @returns {Promise<object>} Notícia pronta para ser combinada com mídia e salva.
 */
async function generateNews(rawContent) {
  const provider = PROVIDERS[env.ai.provider];

  if (!provider) {
    throw new Error(
      `Provedor de IA inválido: "${env.ai.provider}". Use "openai" ou "gemini" em AI_PROVIDER.`
    );
  }

  const raw = await provider.generateNews(rawContent);

  const title = sanitizePlainText(raw.title || '');
  const content = sanitizeContent(raw.content || '');

  return {
    title,
    subtitle: sanitizePlainText(raw.subtitle || ''),
    summary: sanitizePlainText(raw.summary || ''),
    content,
    category: sanitizePlainText(raw.category || 'Billie Global BR'),
    tags: Array.isArray(raw.tags) ? raw.tags.map(sanitizePlainText).slice(0, 6) : [],
    slug: slugify(raw.slugBase || title, Date.now().toString(36)),
    readingTime: calculateReadingTime(content),
  };
}

module.exports = { generateNews };
