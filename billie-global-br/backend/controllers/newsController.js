/**
 * controllers/newsController.js
 * ---------------------------------------------------------------------------
 * Controladores HTTP: recebem a requisição, chamam os serviços, devolvem
 * a resposta. Não contêm regra de negócio — só orquestração leve.
 * ---------------------------------------------------------------------------
 */

const firebaseService = require('../services/firebaseService');
const seoService = require('../services/seoService');

async function listNews(req, res, next) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const news = await firebaseService.getAllNews(limit);
    res.json(news);
  } catch (err) {
    next(err);
  }
}

async function getBySlug(req, res, next) {
  try {
    const news = await firebaseService.getNewsBySlug(req.params.slug);
    if (!news) {
      return res.status(404).json({ error: 'not_found', message: 'Notícia não encontrada.' });
    }
    await firebaseService.incrementViews(news.id);
    res.json(news);
  } catch (err) {
    next(err);
  }
}

async function getByCategory(req, res, next) {
  try {
    const news = await firebaseService.getNewsByCategory(req.params.category);
    res.json(news);
  } catch (err) {
    next(err);
  }
}

async function searchNews(req, res, next) {
  try {
    const query = (req.query.q || '').toLowerCase().trim();
    if (!query) return res.json([]);

    const all = await firebaseService.getAllNews();
    const results = all.filter((item) => {
      const haystack = [
        item.title,
        item.summary,
        item.category,
        item.author,
        ...(item.tags || []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });

    res.json(results);
  } catch (err) {
    next(err);
  }
}

async function getSitemap(req, res, next) {
  try {
    const news = await firebaseService.getAllNews();
    res.type('application/xml').send(seoService.generateSitemap(news));
  } catch (err) {
    next(err);
  }
}

function getRobots(req, res) {
  res.type('text/plain').send(seoService.generateRobotsTxt());
}

module.exports = {
  listNews,
  getBySlug,
  getByCategory,
  searchNews,
  getSitemap,
  getRobots,
};
