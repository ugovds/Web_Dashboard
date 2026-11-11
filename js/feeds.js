/**
 * feeds.js - Hub d'Actualités Moderne en Grille & Flux Visuels
 * Intégration de Le Soir, The Athletic, Financial Times, F1, Foot, Tech & Flux Personnalisés
 */

const builtinFeeds = {
  all: {
    id: 'all',
    name: 'À la une',
    icon: 'fa-solid fa-bolt',
    tag: 'À LA UNE',
    color: 'var(--accent-primary, #a78bfa)',
    brandGradient: 'linear-gradient(135deg, #241442 0%, #4c1d95 100%)',
    domain: 'actualites'
  },
  lesoir: {
    id: 'lesoir',
    name: 'Le Soir',
    url: 'https://www.lesoir.be/rss2/2/cible_principale',
    icon: 'fa-solid fa-newspaper',
    tag: 'LE SOIR',
    color: '#3b82f6',
    brandGradient: 'linear-gradient(135deg, #0d2347 0%, #173b75 100%)',
    domain: 'lesoir.be'
  },
  athletic: {
    id: 'athletic',
    name: 'The Athletic',
    url: 'https://theathletic.com/rss-feed/',
    icon: 'fa-solid fa-futbol',
    tag: 'THE ATHLETIC',
    color: '#ef4444',
    brandGradient: 'linear-gradient(135deg, #3b0d14 0%, #6b1424 100%)',
    domain: 'theathletic.com'
  },
  ft: {
    id: 'ft',
    name: 'Financial Times',
    url: 'https://www.ft.com/world?format=rss',
    icon: 'fa-solid fa-chart-line',
    tag: 'FINANCIAL TIMES',
    color: '#f69888',
    brandGradient: 'linear-gradient(135deg, #2b1d24 0%, #4a2835 100%)',
    domain: 'ft.com'
  },
  f1: {
    id: 'f1',
    name: 'Formule 1',
    url: 'https://dwh.lequipe.fr/api/edito/rss?path=/Formule-1/',
    icon: 'fa-solid fa-flag-checkered',
    tag: 'F1',
    color: '#e11d48',
    brandGradient: 'linear-gradient(135deg, #3d0c18 0%, #701126 100%)',
    domain: 'lequipe.fr'
  },
  foot: {
    id: 'foot',
    name: 'Football',
    url: 'https://dwh.lequipe.fr/api/edito/rss?path=/Football/',
    icon: 'fa-solid fa-futbol',
    tag: 'FOOTBALL',
    color: '#10b981',
    brandGradient: 'linear-gradient(135deg, #083325 0%, #0d543e 100%)',
    domain: 'lequipe.fr'
  },
  tech: {
    id: 'tech',
    name: 'Tech & IA',
    url: 'https://hacker-news.firebaseio.com/v0/topstories.json',
    icon: 'fa-solid fa-microchip',
    tag: 'TECH',
    color: '#06b6d4',
    brandGradient: 'linear-gradient(135deg, #08283b 0%, #0e4363 100%)',
    domain: 'ycombinator.com'
  }
};

let customFeeds = [];
let currentActiveFeedId = 'all';

function escapeFeedHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}

function sanitizeFeedUrl(url) {
  if (!url) return '#';
  const clean = String(url).trim();
  if (/^(https?:\/\/|\/)/i.test(clean)) {
    return clean.replace(/"/g, '&quot;');
  }
  return '#';
}

function cleanExcerpt(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "À l'instant";
  if (diffSec < 3600) return `Il y a ${Math.floor(diffSec / 60)} min`;
  if (diffSec < 86400) return `Il y a ${Math.floor(diffSec / 3600)} h`;
  const diffDays = Math.floor(diffSec / 86400);
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function estimateReadingTime(text) {
  if (!text) return 2;
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, Math.min(8, Math.round(wordCount / 40)));
}

function extractImage(item) {
  if (item.thumbnail && typeof item.thumbnail === 'string' && item.thumbnail.startsWith('http')) {
    return item.thumbnail;
  }
  if (item.enclosure && item.enclosure.link && item.enclosure.link.startsWith('http')) {
    return item.enclosure.link;
  }
  const desc = item.description || item.content || '';
  const match = desc.match(/src=["'](https?:\/\/[^"']+)["']/i);
  if (match && match[1]) return match[1];
  return null;
}

function loadCustomFeedsFromStorage() {
  try {
    const saved = localStorage.getItem('startpage_custom_feeds');
    customFeeds = saved ? JSON.parse(saved) : [];
  } catch {
    customFeeds = [];
  }
}

function saveCustomFeedsToStorage() {
  localStorage.setItem('startpage_custom_feeds', JSON.stringify(customFeeds));
}

function getStoredFeedCache(feedId) {
  try {
    const raw = localStorage.getItem(`startpage_feed_cache_${feedId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredFeedCache(feedId, html) {
  try {
    localStorage.setItem(`startpage_feed_cache_${feedId}`, JSON.stringify({ html, time: Date.now() }));
  } catch {}
}

/**
 * Récupère un flux RSS avec double fallback (rss2json puis allorigins XML)
 */
async function fetchRssFeed(rssUrl, limit = 15) {
  // 1. Tentative principale via rss2json
  try {
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && data.items && data.items.length) {
        return data.items.slice(0, limit).map((i) => ({
          title: i.title || 'Actualité',
          link: i.link || '#',
          pubDate: i.pubDate || '',
          description: cleanExcerpt(i.description || ''),
          imageUrl: extractImage(i),
          category: Array.isArray(i.categories) ? i.categories[0] : (i.category || '')
        }));
      }
    }
  } catch {}

  // 2. Fallback via allorigins proxy XML brut
  try {
    const rawRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`);
    if (rawRes.ok) {
      const xmlText = await rawRes.text();
      const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
      const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, limit);
      if (items.length) {
        return items.map((el) => {
          const media = el.getElementsByTagNameNS('*', 'content')[0] || el.querySelector('enclosure');
          const imgUrl = media?.getAttribute('url') || null;
          const desc = el.querySelector('description')?.textContent || '';
          return {
            title: el.querySelector('title')?.textContent?.trim() || 'Actualité',
            link: el.querySelector('link')?.textContent?.trim() || '#',
            pubDate: el.querySelector('pubDate')?.textContent?.trim() || '',
            description: cleanExcerpt(desc),
            imageUrl: imgUrl,
            category: el.querySelector('category')?.textContent?.trim() || ''
          };
        });
      }
    }
  } catch {}

  return [];
}

/**
 * Construit le HTML d'une carte d'actualité
 */
function renderArticleCard(article, source) {
  const safeTitle = escapeFeedHtml(article.title);
  const safeLink = sanitizeFeedUrl(article.link);
  const safeExcerpt = escapeFeedHtml(article.description);
  const timeStr = formatRelativeTime(article.pubDate);
  const readingTime = estimateReadingTime(article.description);
  const hasImg = Boolean(article.imageUrl);

  const brandBg = !hasImg && source.brandGradient ? `background: ${source.brandGradient};` : '';

  return `
    <article class="news-card" data-title="${safeTitle.toLowerCase()}" data-source="${escapeFeedHtml(source.id)}">
      <a href="${safeLink}" target="_blank" rel="noopener" class="news-card-link-wrapper" title="${safeTitle}">
        <div class="news-card-media ${hasImg ? 'has-img' : 'no-img'}" style="${brandBg}">
          ${hasImg ? `<img src="${article.imageUrl}" alt="${safeTitle}" class="news-card-img" loading="lazy" onerror="this.parentElement.classList.add('no-img'); this.remove();" />` : ''}
          <div class="news-media-overlay"></div>
          <div class="news-media-top">
            <span class="news-source-badge" style="--source-color: ${source.color}">
              <i class="${source.icon}"></i> ${escapeFeedHtml(source.tag || source.name)}
            </span>
            ${timeStr ? `
              <span class="news-time-badge" title="${escapeFeedHtml(article.pubDate)}">
                <i class="fa-regular fa-clock"></i> ${timeStr}
              </span>
            ` : ''}
          </div>
          ${!hasImg ? `
            <div class="news-brand-watermark">
              <i class="${source.icon}"></i>
              <span class="news-brand-text">${escapeFeedHtml(source.name)}</span>
            </div>
          ` : ''}
        </div>
        <div class="news-card-content">
          ${article.category ? `<span class="news-category-label">${escapeFeedHtml(article.category)}</span>` : ''}
          <h3 class="news-card-title">${safeTitle}</h3>
          <p class="news-card-snippet">${safeExcerpt || 'Consultez la dépêche complète sur la source officielle.'}</p>
        </div>
      </a>
      <div class="news-card-footer">
        <span class="news-reading-time"><i class="fa-solid fa-book-open"></i> ${readingTime} min</span>
        <div class="news-card-btns">
          <button type="button" class="news-card-btn copy-btn" data-share-url="${safeLink}" title="Copier le lien de l'article">
            <i class="fa-regular fa-copy"></i>
          </button>
          <a href="${safeLink}" target="_blank" rel="noopener" class="news-card-btn open-btn" title="Ouvrir sur ${source.domain}">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
    </article>
  `;
}

/**
 * Charge un flux ou la sélection "À la une" (Mix Le Soir, The Athletic, FT)
 */
async function loadFeed(feedId) {
  currentActiveFeedId = feedId;
  const feedList = document.getElementById('feed-list');
  const refreshBtn = document.getElementById('news-refresh-btn');
  if (refreshBtn) refreshBtn.querySelector('i')?.classList.add('fa-spin');

  // Mise à jour de la classe active des onglets
  document.querySelectorAll('.news-tab-btn, .tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.feed === feedId);
  });

  // Affichage immédiat du cache pour 0 ms de latence
  const cached = getStoredFeedCache(feedId);
  if (cached && cached.html) {
    if (feedList) feedList.innerHTML = cached.html;
  } else if (feedList) {
    feedList.innerHTML = `
      <div class="news-skeleton-card"></div>
      <div class="news-skeleton-card"></div>
      <div class="news-skeleton-card"></div>
      <div class="news-skeleton-card"></div>
    `;
  }

  try {
    let articlesWithSource = [];

    if (feedId === 'all') {
      // Vue "À la une" : Agrégation parallèle de Le Soir, The Athletic et Financial Times
      const [soirRes, athleticRes, ftRes] = await Promise.allSettled([
        fetchRssFeed(builtinFeeds.lesoir.url, 6),
        fetchRssFeed(builtinFeeds.athletic.url, 6),
        fetchRssFeed(builtinFeeds.ft.url, 6)
      ]);

      const soirItems = soirRes.status === 'fulfilled' ? soirRes.value.map(a => ({ article: a, source: builtinFeeds.lesoir })) : [];
      const athleticItems = athleticRes.status === 'fulfilled' ? athleticRes.value.map(a => ({ article: a, source: builtinFeeds.athletic })) : [];
      const ftItems = ftRes.status === 'fulfilled' ? ftRes.value.map(a => ({ article: a, source: builtinFeeds.ft })) : [];

      // Fusion et tri chronologique descendant
      articlesWithSource = [...soirItems, ...athleticItems, ...ftItems].sort((a, b) => {
        const timeA = new Date(a.article.pubDate || 0).getTime();
        const timeB = new Date(b.article.pubDate || 0).getTime();
        return timeB - timeA;
      });
    } else if (feedId === 'tech') {
      // Hacker News Top Stories
      const hnRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const ids = (await hnRes.json()).slice(0, 12);
      const items = await Promise.all(
        ids.map((id) => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((r) => r.json()))
      );

      articlesWithSource = items.map((item) => ({
        article: {
          title: item.title || 'Actualité Tech',
          link: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
          pubDate: item.time ? new Date(item.time * 1000).toISOString() : '',
          description: `Score : ${item.score || 0} points • ${item.descendants || 0} commentaires par ${item.by || 'auteur'}.`,
          imageUrl: null,
          category: 'TECH'
        },
        source: builtinFeeds.tech
      }));
    } else if (builtinFeeds[feedId]) {
      const source = builtinFeeds[feedId];
      const articles = await fetchRssFeed(source.url, 15);
      articlesWithSource = articles.map((a) => ({ article: a, source }));
    } else {
      // Flux personnalisé
      const custom = customFeeds.find((f) => f.id === feedId);
      if (!custom) throw new Error('Flux introuvable');
      const source = {
        id: custom.id,
        name: custom.name,
        icon: 'fa-solid fa-satellite-dish',
        tag: (custom.name || 'RSS').toUpperCase().slice(0, 8),
        color: 'var(--accent-primary)',
        brandGradient: 'linear-gradient(135deg, #182038 0%, #101525 100%)',
        domain: (custom.url || '').split('/')[2] || 'rss'
      };
      const articles = await fetchRssFeed(custom.url, 15);
      articlesWithSource = articles.map((a) => ({ article: a, source }));
    }

    if (articlesWithSource.length && feedList) {
      const renderedHtml = articlesWithSource.map(({ article, source }) => renderArticleCard(article, source)).join('');
      feedList.innerHTML = renderedHtml;
      setStoredFeedCache(feedId, renderedHtml);
    } else if (!cached && feedList) {
      feedList.innerHTML = `
        <div class="news-empty-state">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>Aucune actualité disponible pour le moment ou flux protégé.</span>
        </div>
      `;
    }
  } catch (err) {
    console.warn('Erreur chargement flux météo/actualités:', err);
    if (!cached && feedList) {
      feedList.innerHTML = `
        <div class="news-empty-state">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>Impossible de charger le flux en direct. Vérifiez votre connexion.</span>
        </div>
      `;
    }
  } finally {
    if (refreshBtn) {
      setTimeout(() => refreshBtn.querySelector('i')?.classList.remove('fa-spin'), 600);
    }
  }
}

/**
 * Rendu des onglets de sources
 */
function renderFeedTabs() {
  const tabGroup = document.getElementById('news-tab-group') || document.querySelector('.feeds-tab-bar .tab-group') || document.querySelector('.tab-group');
  if (!tabGroup) return;

  const defaultKeys = ['all', 'lesoir', 'athletic', 'ft', 'f1', 'foot', 'tech'];
  const allFeeds = [
    ...defaultKeys.map((k) => builtinFeeds[k]),
    ...customFeeds.map((f) => ({
      id: f.id,
      name: f.name,
      icon: 'fa-solid fa-satellite-dish',
      color: 'var(--accent-primary)',
      isCustom: true
    }))
  ];

  tabGroup.innerHTML = allFeeds
    .map(
      (f) => `
      <button type="button" class="news-tab-btn tab-btn ${f.id === currentActiveFeedId ? 'active' : ''}" data-feed="${f.id}" title="${escapeFeedHtml(f.name)}" style="--tab-color: ${f.color || 'var(--accent-primary)'}">
        <i class="${f.icon || 'fa-solid fa-rss'}"></i>
        <span>${escapeFeedHtml(f.name)}</span>
      </button>
    `
    )
    .join('');

  tabGroup.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      loadFeed(btn.dataset.feed);
    });
  });
}

function renderCustomFeedsModalList() {
  const listEl = document.getElementById('custom-feeds-list');
  if (!listEl) return;

  if (customFeeds.length === 0) {
    listEl.innerHTML = `
      <div class="empty-feeds-msg">
        <i class="fa-solid fa-rss"></i>
        <span>Aucun flux personnalisé. Les flux Le Soir, The Athletic, Financial Times, F1, Foot et Tech sont actifs par défaut.</span>
      </div>
    `;
    return;
  }

  listEl.innerHTML = customFeeds
    .map(
      (f, index) => `
      <div class="custom-feed-item">
        <div class="custom-feed-info">
          <span class="custom-feed-name"><i class="fa-solid fa-satellite-dish"></i> ${escapeFeedHtml(f.name)}</span>
          <span class="custom-feed-url" title="${escapeFeedHtml(f.url)}">${escapeFeedHtml(f.url)}</span>
        </div>
        <button type="button" class="custom-feed-del-btn" data-del-feed="${index}" title="Supprimer ce flux">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `
    )
    .join('');

  listEl.querySelectorAll('.custom-feed-del-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.delFeed);
      const deletedName = customFeeds[idx]?.name || 'Flux';
      customFeeds.splice(idx, 1);
      saveCustomFeedsToStorage();
      renderFeedTabs();
      renderCustomFeedsModalList();
      if (currentActiveFeedId === `custom_${idx}`) {
        loadFeed('all');
      }
      if (typeof showToast === 'function') {
        showToast(`Flux "${deletedName}" supprimé`, 'info');
      }
    });
  });
}

function openFeedsModal() {
  // Ouvre l'onglet Flux RSS des Paramètres ou la modale dédiée
  const configBtn = document.querySelector('[data-deck-view="customize"]');
  const feedsSubTab = document.querySelector('[data-hub-tab="feeds"]');
  if (configBtn && feedsSubTab) {
    configBtn.click();
    feedsSubTab.click();
    return;
  }

  const modal = document.getElementById('feeds-modal');
  if (modal) {
    renderCustomFeedsModalList();
    modal.hidden = false;
  }
}

function closeFeedsModal() {
  const modal = document.getElementById('feeds-modal');
  if (modal) modal.hidden = true;
}

/**
 * Initialisation des événements et contrôles du Hub d'Actualités
 */
function initFeeds() {
  loadCustomFeedsFromStorage();
  renderFeedTabs();

  const feedList = document.getElementById('feed-list');
  const searchInput = document.getElementById('news-search-input');
  const clearSearchBtn = document.getElementById('news-search-clear');
  const refreshBtn = document.getElementById('news-refresh-btn');
  const gridViewBtn = document.getElementById('news-view-grid-btn');
  const listViewBtn = document.getElementById('news-view-list-btn');
  const manageFeedsBtn = document.getElementById('btn-manage-feeds');

  // 1. Filtrage instantané des cartes d'actualité
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (clearSearchBtn) clearSearchBtn.hidden = !q;

      const cards = document.querySelectorAll('.news-card');
      let visibleCount = 0;
      cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        const matches = !q || text.includes(q);
        card.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
      });

      const existingEmpty = document.querySelector('.news-search-empty');
      if (existingEmpty) existingEmpty.remove();

      if (visibleCount === 0 && q && feedList) {
        const emptyEl = document.createElement('div');
        emptyEl.className = 'news-empty-state news-search-empty';
        emptyEl.innerHTML = `
          <i class="fa-solid fa-magnifying-glass"></i>
          <span>Aucun article ne correspond à « <strong>${escapeFeedHtml(q)}</strong> »</span>
        `;
        feedList.appendChild(emptyEl);
      }
    });
  }

  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.hidden = true;
      searchInput.dispatchEvent(new Event('input'));
      searchInput.focus();
    });
  }

  // 2. Bascule Vue Grille / Vue Compacte
  const savedViewMode = localStorage.getItem('startpage_news_view_mode') || 'grid';
  if (savedViewMode === 'compact') {
    feedList?.classList.add('news-grid-compact');
    listViewBtn?.classList.add('active');
    gridViewBtn?.classList.remove('active');
  }

  if (gridViewBtn && listViewBtn) {
    gridViewBtn.addEventListener('click', () => {
      feedList?.classList.remove('news-grid-compact');
      gridViewBtn.classList.add('active');
      listViewBtn.classList.remove('active');
      localStorage.setItem('startpage_news_view_mode', 'grid');
    });

    listViewBtn.addEventListener('click', () => {
      feedList?.classList.add('news-grid-compact');
      listViewBtn.classList.add('active');
      gridViewBtn.classList.remove('active');
      localStorage.setItem('startpage_news_view_mode', 'compact');
    });
  }

  // 3. Bouton d'actualisation manuelle
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadFeed(currentActiveFeedId);
      if (typeof showToast === 'function') {
        showToast('Actualisation des dépêches en direct...', 'info');
      }
    });
  }

  // 4. Copie du lien d'un article
  if (feedList) {
    feedList.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('.copy-btn');
      if (copyBtn) {
        e.preventDefault();
        e.stopPropagation();
        const url = copyBtn.dataset.shareUrl;
        if (url && url !== '#') {
          navigator.clipboard.writeText(url).then(() => {
            if (typeof showToast === 'function') {
              showToast('Lien de l\'article copié dans le presse-papier !', 'success');
            }
          }).catch(() => {
            if (typeof showToast === 'function') {
              showToast('Impossible de copier le lien', 'error');
            }
          });
        }
      }
    });
  }

  // 5. Gestion des flux personnalisés
  if (manageFeedsBtn) {
    manageFeedsBtn.addEventListener('click', openFeedsModal);
  }

  const feedsModalClose = document.getElementById('feeds-modal-close');
  if (feedsModalClose) feedsModalClose.addEventListener('click', closeFeedsModal);

  const feedsModal = document.getElementById('feeds-modal');
  if (feedsModal) {
    feedsModal.addEventListener('click', (e) => {
      if (e.target === feedsModal) closeFeedsModal();
    });
  }

  // Formulaire d'ajout de flux dans les paramètres
  const addFeedForm = document.getElementById('add-feed-form');
  const feedNameInput = document.getElementById('feed-name-input') || document.getElementById('new-feed-name');
  const feedUrlInput = document.getElementById('feed-url-input') || document.getElementById('new-feed-url');

  if (addFeedForm) {
    addFeedForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (feedNameInput?.value || '').trim();
      const url = (feedUrlInput?.value || '').trim();

      if (!name || !url) return;

      const newId = `feed_${Date.now()}`;
      customFeeds.push({ id: newId, name, url });
      saveCustomFeedsToStorage();
      renderFeedTabs();
      renderCustomFeedsModalList();

      if (feedNameInput) feedNameInput.value = '';
      if (feedUrlInput) feedUrlInput.value = '';

      if (typeof showToast === 'function') {
        showToast(`Flux "${name}" ajouté avec succès !`, 'success');
      }

      loadFeed(newId);
    });
  }

  // Chargement initial du flux "À la une"
  loadFeed(currentActiveFeedId || 'all');
}
