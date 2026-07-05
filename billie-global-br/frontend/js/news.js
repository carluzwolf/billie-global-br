/**
 * news.js
 * -----------------------------------------------------------------------
 * Módulo central de dados e renderização.
 *
 *   - Escuta o Realtime Database em tempo real (onValue): assim que o
 *     backend salva uma notícia nova vinda do Telegram, esta função
 *     dispara de novo sozinha e o site atualiza sem reload e sem
 *     nenhuma ação manual.
 *   - Renderiza as seções da Home e a página de notícia individual.
 * -----------------------------------------------------------------------
 */

import { db, ref, onValue, runTransaction } from './firebase-config.js';

/** Cache em memória de todas as notícias publicadas (mais recentes primeiro). */
let allNews = [];
const listeners = [];

/**
 * Formata timestamp em data legível: "3 de julho de 2026".
 */
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Inicia o listener em tempo real do nó "news". Qualquer parte do site
 * pode se inscrever via onNewsUpdate(callback) para reagir a mudanças.
 */
function startRealtimeSync() {
  const newsRef = ref(db, 'news');
  onValue(
    newsRef,
    (snapshot) => {
      const data = snapshot.val() || {};
      allNews = Object.entries(data)
        .map(([id, item]) => ({ id, ...item }))
        .filter((item) => item.published)
        .sort((a, b) => b.createdAt - a.createdAt);

      listeners.forEach((cb) => cb(allNews));
    },
    (error) => {
      // eslint-disable-next-line no-console
      console.error('[news.js] Erro ao sincronizar com o Firebase:', error);
    }
  );
}

function onNewsUpdate(callback) {
  listeners.push(callback);
  if (allNews.length) callback(allNews); // dispara imediatamente se já houver cache
}

/** Incrementa o contador de visualizações de uma notícia. */
function registerView(newsId) {
  if (!newsId) return;
  runTransaction(ref(db, `news/${newsId}/views`), (current) => (current || 0) + 1);
}

/* =========================== TEMPLATES =========================== */

function cardTemplate(item) {
  const img = item.image || 'assets/images/placeholder.svg';
  return `
    <a class="card" href="noticia.html?slug=${item.slug}">
      <div class="card-image"><img src="${img}" alt="${item.title}" loading="lazy" /></div>
      <span class="card-category">${item.category}</span>
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
      <div class="meta-row">
        <span>${formatDate(item.createdAt)}</span>
        <span class="dot"></span>
        <span>${item.readingTime} min de leitura</span>
      </div>
    </a>`;
}

function rankedItemTemplate(item, index) {
  const img = item.image || 'assets/images/placeholder.svg';
  return `
    <a class="ranked-item" href="noticia.html?slug=${item.slug}">
      <span class="rank">${String(index + 1).padStart(2, '0')}</span>
      <img src="${img}" alt="${item.title}" loading="lazy" />
      <div>
        <span class="card-category">${item.category}</span>
        <h3>${item.title}</h3>
      </div>
    </a>`;
}

function heroSideItemTemplate(item) {
  const img = item.image || 'assets/images/placeholder.svg';
  return `
    <a class="hero-side-item" href="noticia.html?slug=${item.slug}">
      <img src="${img}" alt="${item.title}" loading="lazy" />
      <div>
        <span class="card-category">${item.category}</span>
        <h3>${item.title}</h3>
      </div>
    </a>`;
}

/* =========================== RENDER: HOME =========================== */

function renderHome(news) {
  if (!news.length) return;

  const [featured, ...rest] = news;
  const heroFeatured = document.getElementById('hero-featured');
  const heroSide = document.getElementById('hero-side');
  const latestGrid = document.getElementById('latest-grid');
  const mostReadList = document.getElementById('most-read-list');

  if (heroFeatured) {
    heroFeatured.innerHTML = `
      <a href="noticia.html?slug=${featured.slug}">
        <img src="${featured.image || 'assets/images/placeholder.svg'}" alt="${featured.title}" />
      </a>
      <span class="eyebrow"><span class="equalizer"><span></span><span></span><span></span></span> ${featured.breaking ? 'Ao vivo' : featured.category}</span>
      <a href="noticia.html?slug=${featured.slug}"><h1>${featured.title}</h1></a>
      <p>${featured.summary}</p>
      <div class="meta-row">
        <span>${formatDate(featured.createdAt)}</span>
        <span class="dot"></span>
        <span>${featured.readingTime} min de leitura</span>
      </div>`;
  }

  if (heroSide) {
    heroSide.innerHTML = rest.slice(0, 3).map(heroSideItemTemplate).join('');
  }

  if (latestGrid) {
    latestGrid.innerHTML = news.slice(0, 9).map(cardTemplate).join('');
  }

  if (mostReadList) {
    const byViews = [...news].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    mostReadList.innerHTML = byViews.map(rankedItemTemplate).join('');
  }
}

/* =========================== RENDER: NOTÍCIA =========================== */

function renderArticle(news) {
  document.title = `${news.title} | Billie Global BR`;

  const setMeta = (name, content, attr = 'name') => {
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('description', news.summary);
  setMeta('og:title', news.title, 'property');
  setMeta('og:description', news.summary, 'property');
  setMeta('og:image', news.image || '', 'property');
  setMeta('twitter:card', 'summary_large_image');

  const jsonLd = document.createElement('script');
  jsonLd.type = 'application/ld+json';
  jsonLd.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    description: news.summary,
    image: news.image ? [news.image] : [],
    datePublished: new Date(news.createdAt).toISOString(),
    dateModified: new Date(news.updatedAt).toISOString(),
    author: { '@type': 'Person', name: news.author },
    publisher: { '@type': 'Organization', name: 'Billie Global BR' },
  });
  document.head.appendChild(jsonLd);

  const root = document.getElementById('article-root');
  if (!root) return;

  root.innerHTML = `
    <header class="article-header container">
      <span class="eyebrow">${news.category}</span>
      <h1>${news.title}</h1>
      <p class="subtitle">${news.subtitle || ''}</p>
      <div class="meta-row">
        <span>${formatDate(news.createdAt)} às ${formatTime(news.createdAt)}</span>
        <span class="dot"></span>
        <span>${news.readingTime} min de leitura</span>
      </div>
      ${news.image ? `<img class="article-image" src="${news.image}" alt="${news.title}" />` : ''}
      <div class="share-row">
        <span>Compartilhar</span>
        <a class="icon-btn" target="_blank" rel="noopener noreferrer"
           href="https://api.whatsapp.com/send?text=${encodeURIComponent(news.title + ' ' + location.href)}"
           aria-label="Compartilhar no WhatsApp">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </a>
        <a class="icon-btn" target="_blank" rel="noopener noreferrer"
           href="https://twitter.com/intent/tweet?text=${encodeURIComponent(news.title)}&url=${encodeURIComponent(location.href)}"
           aria-label="Compartilhar no X">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l16 16M20 4L4 20"/></svg>
        </a>
      </div>
    </header>

    <div class="article-body container">${news.content}</div>

    ${
      news.gallery && news.gallery.length > 1
        ? `<div class="gallery container">${news.gallery
            .map((src) => `<img src="${src}" alt="${news.title}" loading="lazy" />`)
            .join('')}</div>`
        : ''
    }

    ${
      news.video
        ? `<div class="video-embed container"><iframe src="${toEmbedUrl(news.video)}" title="${news.title}" allowfullscreen></iframe></div>`
        : ''
    }

    <div class="tag-list container">
      ${(news.tags || []).map((tag) => `<span class="tag">#${tag}</span>`).join('')}
    </div>

    <section class="section container" id="related-section">
      <div class="section-header"><h2>Notícias relacionadas</h2></div>
      <div class="news-grid" id="related-grid"></div>
    </section>

    <section class="container" style="padding-block: var(--space-7);">
      <div class="comments-placeholder">
        Estrutura de comentários preparada para ativação futura.
      </div>
    </section>`;

  registerView(news.id);
  renderRelated(news);
}

function toEmbedUrl(url) {
  const idMatch = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return idMatch ? `https://www.youtube.com/embed/${idMatch[1]}` : url;
}

function renderRelated(current) {
  const relatedGrid = document.getElementById('related-grid');
  if (!relatedGrid) return;

  const related = allNews
    .filter((item) => item.id !== current.id && item.category === current.category)
    .slice(0, 3);

  relatedGrid.innerHTML = related.length
    ? related.map(cardTemplate).join('')
    : '<p style="color:var(--color-text-muted)">Nenhuma notícia relacionada ainda.</p>';
}

export { startRealtimeSync, onNewsUpdate, renderHome, renderArticle, formatDate, cardTemplate };
export function getAllNewsCache() {
  return allNews;
}
