/**
 * middleware/errorHandler.js
 * ---------------------------------------------------------------------------
 * Middleware central de tratamento de erros. Qualquer rota que chame
 * next(err) — ou qualquer erro síncrono lançado dentro de uma rota —
 * termina aqui, garantindo respostas consistentes e sem vazar detalhes
 * internos em produção.
 * ---------------------------------------------------------------------------
 */

const logger = require('../utils/logger');
const { env } = require('../config/env');

// 404 — precisa vir depois de todas as rotas registradas
function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'not_found',
    message: 'Recurso não encontrado.',
  });
}

// Handler de erro genérico — precisa ser o último middleware registrado
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error(err.stack || err.message || err);

  const status = err.status || 500;
  const isDev = env.nodeEnv === 'development';

  res.status(status).json({
    error: err.code || 'internal_error',
    message: status === 500 && !isDev ? 'Erro interno do servidor.' : err.message,
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = { notFoundHandler, errorHandler };
