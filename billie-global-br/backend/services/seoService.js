/**
 * services/seoService.js
 * ---------------------------------------------------------------------------
 * Gera os artefatos de SEO: sitemap.xml, robots.txt, JSON-LD e o objeto
 * de meta tags (Open Graph / Twitter Card) usado pelo frontend para
 * montar o <head> de cada página de notícia.
 * ---------------------------------------------------------------------------
 */

const { env } = require('../config/env');

/**
 * Gera o XML do sitemap a partir da lista de notícias publicadas.
 * @param {Array<object>} newsList
 * @returns {string} XML pronto para ser servido em /sitemap.xml
 */
function generateSitemap(newsList) {
  const staticUrls = ['', '/frontend/pages/sobre.html', '/frontend/pages/contato.html', '/frontend/pages/categorias.html'];

  const staticEntries = staticUrls
    .map(
      (path) => `  <url>
    <loc>${env.siteUrl}${path}</loc>
    <changefreq>daily</changefreq>
  </url>`
    )
    .join('\n');

  const newsEntries = newsList
    .map(
      (news) => `  <url>
    <loc>${env.siteUrl}/frontend/noticia.html?slug=${news.slug}</loc>
    <lastmod>${new Date(news.updatedAt).toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${newsEntries}
</urlset>`;
}

/**
 * Gera o conteúdo do robots.txt.
 */
function generateRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${env.siteUrl}/sitemap.xml`;
}

/**
 * Monta o objeto de meta tags (title, description, Open Graph, Twitter
 * Card) para uma notícia específica. O frontend injeta isso no <head>.
 * @param {object} news
 */
function buildMetaTags(news) {
  const url = `${env.siteUrl}/frontend/noticia.html?slug=${news.slug}`;

  return {
    title: `${news.title} | Billie Global BR`,
    description: news.summary,
    canonical: url,
    og: {
      title: news.title,
      description: news.summary,
      image: news.image,
      url,
      type: 'article',
      siteName: 'Billie Global BR',
    },
    twitter: {
      card: 'summary_large_image',
      title: news.title,
      description: news.summary,
      image: news.image,
    },
  };
}

/**
 * Monta o JSON-LD (schema.org NewsArticle) para SEO estruturado.
 * @param {object} news
 */
function buildJsonLd(news) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    description: news.summary,
    image: news.image ? [news.image] : [],
    datePublished: new Date(news.createdAt).toISOString(),
    dateModified: new Date(news.updatedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: news.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Billie Global BR',
    },
    mainEntityOfPage: `${env.siteUrl}/frontend/noticia.html?slug=${news.slug}`,
  };
}

module.exports = { generateSitemap, generateRobotsTxt, buildMetaTags, buildJsonLd };
