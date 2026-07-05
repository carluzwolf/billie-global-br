/**
 * routes/seoRoutes.js
 * ---------------------------------------------------------------------------
 * Rotas de SEO técnico, servidas na raiz do domínio (não sob /api).
 * ---------------------------------------------------------------------------
 */

const express = require('express');
const newsController = require('../controllers/newsController');

const router = express.Router();

router.get('/sitemap.xml', newsController.getSitemap);
router.get('/robots.txt', newsController.getRobots);

module.exports = router;
