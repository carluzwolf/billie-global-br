/**
 * server.js
 * ---------------------------------------------------------------------------
 * Ponto de entrada do backend do Billie Global BR.
 *
 *   1. Sobe a API Express (rotas de leitura consumidas pelo frontend).
 *   2. Inicia o listener do Telegram, que dispara o pipeline de IA +
 *      Firebase automaticamente a cada novo post no canal.
 *
 * Rodar em desenvolvimento:  npm run dev
 * Rodar em produção:         npm start
 * ---------------------------------------------------------------------------
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const { env, validateEnv } = require('./config/env');
const logger = require('./utils/logger');

const newsRoutes = require('./routes/newsRoutes');
const seoRoutes = require('./routes/seoRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const { startTelegramListener } = require('./services/telegramService');
const { processIncomingPost } = require('./services/newsProcessor');

validateEnv();

const app = express();

// --- Segurança e performance ---
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: env.allowedOrigins.length > 0 ? env.allowedOrigins : '*',
  })
);
app.use(express.json({ limit: '1mb' }));

// --- Rotas ---
app.use('/api', newsRoutes);
app.use('/', seoRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: Date.now() }));

// --- 404 e tratamento de erros (sempre por último) ---
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  logger.info(`[server] Billie Global BR API rodando na porta ${env.port} (${env.nodeEnv}).`);

  // Inicia a automação: novo post no Telegram -> IA -> Firebase -> site atualiza sozinho.
  startTelegramListener(processIncomingPost);
});
