/**
 * middleware/sanitize.js
 * ---------------------------------------------------------------------------
 * Sanitiza HTML gerado pela IA antes de salvar no banco, prevenindo XSS.
 * Mesmo confiando na IA, o conteúdo é tratado como não-confiável — é a
 * mesma lógica de tratar input de usuário: nunca gravar HTML "cru".
 * ---------------------------------------------------------------------------
 */

const sanitizeHtml = require('sanitize-html');

const SANITIZE_OPTIONS = {
  allowedTags: [
    'p', 'br', 'strong', 'em', 'b', 'i', 'u',
    'h2', 'h3', 'h4',
    'ul', 'ol', 'li',
    'blockquote', 'a', 'span',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    span: ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  // Força links externos a abrirem em nova aba com segurança
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
  },
};

/**
 * Sanitiza uma string de conteúdo HTML.
 * @param {string} dirtyHtml
 * @returns {string} HTML seguro para renderização.
 */
function sanitizeContent(dirtyHtml = '') {
  return sanitizeHtml(dirtyHtml, SANITIZE_OPTIONS);
}

/**
 * Sanitiza strings simples (títulos, resumos) removendo qualquer tag.
 * @param {string} text
 * @returns {string}
 */
function sanitizePlainText(text = '') {
  return sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} }).trim();
}

/**
 * Middleware Express: sanitiza campos de texto do body em rotas que
 * recebem entrada externa (ex: formulário de contato futuro).
 */
function sanitizeBodyMiddleware(fields = []) {
  return (req, res, next) => {
    if (req.body) {
      fields.forEach((field) => {
        if (typeof req.body[field] === 'string') {
          req.body[field] = sanitizePlainText(req.body[field]);
        }
      });
    }
    next();
  };
}

module.exports = { sanitizeContent, sanitizePlainText, sanitizeBodyMiddleware };
