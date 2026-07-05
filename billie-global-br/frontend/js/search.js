/**
 * search.js
 * -----------------------------------------------------------------------
 * Pesquisa instantânea no conteúdo já sincronizado em tempo real
 * (allNews em news.js). Filtra por título, resumo, categoria, tags e
 * autor, com debounce leve para não re-renderizar a cada tecla.
 * -----------------------------------------------------------------------
 */

import { getAllNewsCache, cardTemplate } from './news.js';

function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function matches(item, query) {
  const haystack = [item.title, item.summary, item.category, item.author, ...(item.tags || [])]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function initSearch() {
  const trigger = document.getElementById('search-trigger');
  const panel = document.getElementById('search-panel');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');

  if (!trigger || !panel || !input || !results) return;

  const runSearch = debounce((query) => {
    if (!query.trim()) {
      results.innerHTML = '';
      return;
    }
    const matched = getAllNewsCache().filter((item) => matches(item, query));
    results.innerHTML = matched.length
      ? matched.map(cardTemplate).join('')
      : '<p class="search-empty">Nenhuma notícia encontrada para essa busca.</p>';
  });

  trigger.addEventListener('click', () => {
    panel.classList.toggle('is-open');
    if (panel.classList.contains('is-open')) input.focus();
  });

  input.addEventListener('input', (e) => runSearch(e.target.value));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') panel.classList.remove('is-open');
  });
}

export { initSearch };
