/**
 * utils/slugify.js
 * ---------------------------------------------------------------------------
 * Gera slugs amigáveis para URLs (ex: "Novo single da Billie" ->
 * "novo-single-da-billie"), com suporte a sufixo de desambiguação.
 * ---------------------------------------------------------------------------
 */

const baseSlugify = require('slugify');

/**
 * @param {string} text Texto de origem (normalmente o título da notícia).
 * @param {string} [uniqueSuffix] Sufixo opcional (ex: timestamp curto ou id).
 * @returns {string} slug em kebab-case, minúsculo, sem acentos.
 */
function slugify(text, uniqueSuffix) {
  const slug = baseSlugify(text || '', {
    lower: true,
    strict: true, // remove caracteres especiais
    locale: 'pt',
    trim: true,
  });

  return uniqueSuffix ? `${slug}-${uniqueSuffix}` : slug;
}

module.exports = slugify;
