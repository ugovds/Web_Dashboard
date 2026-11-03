/**
 * feeds.js - Flux d'actualités en direct (F1, Football, Tech & Flux personnalisés)
 */

const builtinFeeds = {
  f1: {
    id: 'f1',
    name: 'F1',
    url: 'https://dwh.lequipe.fr/api/edito/rss?path=/Formule-1/'
  },
  foot: {
    id: 'foot',
    name: 'Foot',
    url: 'https://dwh.lequipe.fr/api/edito/rss?path=/Football/'
  },
  tech: {
    id: 'tech',
    name: 'Tech',
    url: 'https://hacker-news.firebaseio.com/v0/topstories.json'
  }
};

let customFeeds = [];
let currentActiveFeedId = 'f1';

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

async function fetchRssWithFallback(rssUrl) {
  try {
    const res = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length) {
        return data.items.slice(0, 5).map((i) => ({
          title: i.title,
          link: i.link
        }));
      }
    }
  } catch {}

  const rawRes = await fetch(
    `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`
  );
  const xmlText = await rawRes.text();
  const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
  const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, 5);
  if (!items.length) throw new Error('Empty RSS');
  return items.map((el) => ({
    title: el.querySelector('title')?.textContent?.trim() || 'Actualité',
    link: el.querySelector('link')?.textContent?.trim() || '#'
  }));
}

async function loadFeed(feedId) {
  currentActiveFeedId = feedId;
  const feedList = document.getElementById('feed-list');
  if (!feedList) return;

  // Mise à jour de l'état actif des onglets
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.feed === feedId);
  });

  feedList.innerHTML = '<li class="feed-skeleton">Récupération des dépêches...</li>';

  try {
    if (feedId === 'tech') {
      const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const ids = (await res.json()).slice(0, 5);
      const items = await Promise.all(
        ids.map((id) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((r) => r.json())
        )
      );
      feedList.innerHTML = items
        .map(
          (item) => `
          <li>
            <a href="${item.url || `https://news.ycombinator.com/item?id=${item.id}`}" target="_blank" rel="noopener">
              <span class="feed-score">TECH</span>
              <span class="feed-title">${item.title}</span>
            </a>
          </li>`
        )
        .join('');
    } else if (builtinFeeds[feedId]) {
      const articles = await fetchRssWithFallback(builtinFeeds[feedId].url);
      const tag = feedId.toUpperCase();
      feedList.innerHTML = articles
        .map(
          (item) => `
          <li>
            <a href="${item.link}" target="_blank" rel="noopener">
              <span class="feed-score">${tag}</span>
              <span class="feed-title">${item.title}</span>
            </a>
          </li>`
        )
        .join('');
    } else {
      // Flux personnalisé
      const customFeed = customFeeds.find((f) => f.id === feedId);
      if (!customFeed) throw new Error('Flux introuvable');

      const articles = await fetchRssWithFallback(customFeed.url);
      const tag = (customFeed.name || 'RSS').toUpperCase().slice(0, 5);
      feedList.innerHTML = articles
        .map(
          (item) => `
          <li>
            <a href="${item.link}" target="_blank" rel="noopener">
              <span class="feed-score">${tag}</span>
              <span class="feed-title">${item.title}</span>
            </a>
          </li>`
        )
        .join('');
    }
  } catch (err) {
    feedList.innerHTML = '<li class="feed-skeleton">Flux temporairement indisponible ou protégé.</li>';
  }
}

function renderFeedTabs() {
  const tabGroup = document.querySelector('.feeds-tab-bar .tab-group') || document.querySelector('.tab-group');
  if (!tabGroup) return;

  const defaultKeys = ['f1', 'foot', 'tech'];
  const allFeeds = [
    ...defaultKeys.map((k) => ({ id: k, name: builtinFeeds[k].name, isCustom: false })),
    ...customFeeds.map((f) => ({ id: f.id, name: f.name, isCustom: true }))
  ];

  tabGroup.innerHTML = allFeeds
    .map(
      (f) => `
      <button class="tab-btn ${f.id === currentActiveFeedId ? 'active' : ''}" data-feed="${f.id}" title="${f.name}">
        ${f.name}
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
        <span>Aucun flux personnalisé. Les flux par défaut (F1, Foot, Tech) sont actifs.</span>
      </div>
    `;
    return;
  }

  listEl.innerHTML = customFeeds
    .map(
      (f, index) => `
      <div class="custom-feed-item">
        <div class="custom-feed-info">
          <span class="custom-feed-name"><i class="fa-solid fa-satellite-dish"></i> ${f.name}</span>
          <span class="custom-feed-url" title="${f.url}">${f.url}</span>
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
        loadFeed('f1');
      }
      if (typeof showToast === 'function') {
        showToast(`Flux "${deletedName}" supprimé`, 'info');
      }
    });
  });
}

function openFeedsModal() {
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

function initFeeds() {
  loadCustomFeedsFromStorage();
  renderFeedTabs();

  // Événements pour la modale des flux
  const feedsModalClose = document.getElementById('feeds-modal-close');
  if (feedsModalClose) feedsModalClose.addEventListener('click', closeFeedsModal);

  const feedsModal = document.getElementById('feeds-modal');
  if (feedsModal) {
    feedsModal.addEventListener('click', (e) => {
      if (e.target === feedsModal) closeFeedsModal();
    });
  }

  // Bouton d'accès dans la barre de personnalisation
  const manageFeedsBtn = document.getElementById('btn-manage-feeds');
  if (manageFeedsBtn) {
    manageFeedsBtn.addEventListener('click', openFeedsModal);
  }

  // Formulaire d'ajout de flux
  const addFeedForm = document.getElementById('add-feed-form');
  const feedNameInput = document.getElementById('new-feed-name');
  const feedUrlInput = document.getElementById('new-feed-url');

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

  loadFeed(currentActiveFeedId || 'f1');
}
