/**
 * routes/newsRoutes.js
 * ---------------------------------------------------------------------------
 * Rotas públicas de leitura consumidas pelo frontend (além do listener
 * em tempo real do Firebase, essas rotas servem para buscas, SEO, e
 * qualquer consumidor externo da API).
 * ---------------------------------------------------------------------------
 */

const express = require('express');
const newsController = require('../controllers/newsController');

const router = express.Router();

router.get('/news', newsController.listNews);
router.get('/news/search', newsController.searchNews);
router.get('/news/category/:category', newsController.getByCategory);
router.get('/news/:slug', newsController.getBySlug);

module.exports = router;
