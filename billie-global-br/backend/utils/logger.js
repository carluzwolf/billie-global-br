/**
 * utils/logger.js
 * ---------------------------------------------------------------------------
 * Logger simples e centralizado. Trocar por Winston/Pino no futuro é
 * possível sem tocar no resto do código, já que tudo passa por aqui.
 * ---------------------------------------------------------------------------
 */

function timestamp() {
  return new Date().toISOString();
}

const logger = {
  info: (...args) => console.log(`[${timestamp()}] [INFO]`, ...args),
  warn: (...args) => console.warn(`[${timestamp()}] [WARN]`, ...args),
  error: (...args) => console.error(`[${timestamp()}] [ERROR]`, ...args),
};

module.exports = logger;
