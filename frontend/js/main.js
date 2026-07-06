/**
 * main.js
 * -----------------------------------------------------------------------
 * Ponto de entrada do frontend. Liga o menu mobile, o botão de modo
 * escuro (estrutura pronta, ver variables.css) e inicializa a
 * sincronização em tempo real com o Firebase.
 * -----------------------------------------------------------------------
 */

import { startRealtimeSync, onNewsUpdate, renderHome, renderArticle, cardTemplate } from './news.js';
import { initSearch } from './search.js';

/* ---------- Página de categorias ---------- */
function renderCategoriesPage(allNews) {
  const grid = document.getElementById('category-grid');
  const pills = document.querySelectorAll('.category-pill');
  if (!grid) return;

  const params = new URLSearchParams(location.search);
  const activeCategory = params.get('categoria');

  pills.forEach((pill) => {
    pill.classList.toggle('is-active', pill.dataset.category === activeCategory);
  });

  const filtered = activeCategory
    ? allNews.filter((item) => item.category === activeCategory)
    : allNews;

  grid.innerHTML = filtered.length
    ? filtered.map(cardTemplate).join('')
    : '<p style="color:var(--color-text-muted)">Nenhuma notícia publicada nesta categoria ainda.</p>';
}

/* ---------- Menu mobile ---------- */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');

  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => mobileMenu.classList.add('is-open'));
  closeBtn?.addEventListener('click', () => mobileMenu.classList.remove('is-open'));
}

/* ---------- Modo escuro (estrutura pronta para ativação futura) ---------- */
function initDarkModeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('billie-theme', theme);
  };

  const saved = localStorage.getItem('billie-theme');
  if (saved) applyTheme(saved);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(current);
  });
}

/* ---------- Boot ---------- */
function boot() {
  initMobileMenu();
  initDarkModeToggle();
  initSearch();
  startRealtimeSync();

  const page = document.body.dataset.page;

  if (page === 'home') {
    onNewsUpdate(renderHome);
  }

  if (page === 'article') {
    const slug = new URLSearchParams(location.search).get('slug');
    onNewsUpdate((allNews) => {
      const news = allNews.find((item) => item.slug === slug);
      if (news) renderArticle(news);
    });
  }

  if (page === 'categorias') {
    onNewsUpdate(renderCategoriesPage);
  }
}

document.addEventListener('DOMContentLoaded', boot);
