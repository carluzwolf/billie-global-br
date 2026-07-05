/**
 * utils/readingTime.js
 * ---------------------------------------------------------------------------
 * Calcula o tempo estimado de leitura de um texto, em minutos.
 * Usa 200 palavras por minuto como média de leitura em português.
 * ---------------------------------------------------------------------------
 */

const WORDS_PER_MINUTE = 200;

/**
 * @param {string} htmlOrText Conteúdo em HTML ou texto puro.
 * @returns {number} Tempo estimado de leitura, em minutos (mínimo 1).
 */
function calculateReadingTime(htmlOrText = '') {
  const plainText = htmlOrText.replace(/<[^>]*>/g, ' '); // remove tags HTML
  const wordCount = plainText
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
  return Math.max(minutes, 1);
}

module.exports = calculateReadingTime;
