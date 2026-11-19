/**
 * command-palette.js - Palette de commande flottante & recherche de signets (Ctrl+K / B)
 * - Recherche instantanée multi-critères : nom du lien, catégorie, URL
 * - Raccourcis directs vers les vues et thèmes
 * - Navigation complète au clavier (Haut, Bas, Entrée, Échap)
 * - Style cyberpunk translucide avec badges de catégorie et icônes
 */

let paletteActiveIndex = 0;
let paletteResults = [];

function getPaletteItems() {
  const items = [];

  // 1. Tous les signets et catégories
  if (typeof categories !== 'undefined' && Array.isArray(categories)) {
    categories.forEach((cat, catIdx) => {
      // Ajout de la catégorie comme action
      items.push({
        type: 'category',
        title: `Catégorie : ${cat.title}`,
        category: 'Organisation',
        url: '',
        icon: cat.icon || 'fa-solid fa-folder',
        action: () => {
          const catEl = document.querySelector(`.category-card[data-cat="${catIdx}"]`);
          if (catEl) {
            catEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            catEl.style.boxShadow = '0 0 24px var(--accent-primary)';
            setTimeout(() => { catEl.style.boxShadow = ''; }, 1200);
          }
        }
      });

      // Ajout des liens de la catégorie
      if (Array.isArray(cat.links)) {
        cat.links.forEach((link) => {
          items.push({
            type: 'bookmark',
            title: link.name || 'Sans titre',
            category: cat.title,
            url: link.url || '#',
            icon: link.icon || 'fa-solid fa-arrow-up-right-from-square',
            action: () => {
              if (link.url) window.open(link.url, '_blank', 'noopener,noreferrer');
            }
          });
        });
      }
    });
  }

  // 2. Actions de Navigation rapide
  const deckViews = [
    {
      title: 'Afficher les Raccourcis Web',
      category: 'Navigation',
      icon: 'fa-solid fa-compass',
      url: 'Alt+1',
      action: () => {
        if (typeof closeCustomHub === 'function') closeCustomHub();
      }
    },
    {
      title: 'Ouvrir Paramètres & Personnalisation',
      category: 'Navigation',
      icon: 'fa-solid fa-sliders',
      url: 'Alt+2',
      action: () => {
        if (typeof openCustomHub === 'function') openCustomHub('appearance');
      }
    }
  ];

  deckViews.forEach((dv) => {
    items.push({
      type: 'action',
      title: dv.title,
      category: dv.category,
      url: dv.url,
      icon: dv.icon,
      action: dv.action
    });
  });

  // 3. Actions Thèmes
  if (typeof themesConfig !== 'undefined') {
    Object.entries(themesConfig).forEach(([tId, tCfg]) => {
      items.push({
        type: 'action',
        title: `Thème : ${tCfg.name}`,
        category: 'Thèmes Visuels',
        url: `Touche ${tId}`,
        icon: 'fa-solid fa-palette',
        action: () => {
          if (typeof applyTheme === 'function') {
            applyTheme(tId);
            if (typeof showToast === 'function') showToast(`Thème appliqué : ${tCfg.name}`, 'success');
          }
        }
      });
    });
  }

  return items;
}

function openCommandPalette() {
  const modal = document.getElementById('command-palette-modal');
  const input = document.getElementById('command-palette-input');
  if (!modal || !input) return;

  modal.hidden = false;
  modal.classList.add('visible');
  input.value = '';
  paletteActiveIndex = 0;
  renderPaletteResults('');
  setTimeout(() => input.focus(), 30);
}

function closeCommandPalette() {
  const modal = document.getElementById('command-palette-modal');
  if (!modal) return;
  modal.hidden = true;
  modal.classList.remove('visible');
}

function isCommandPaletteOpen() {
  const modal = document.getElementById('command-palette-modal');
  return !!(modal && !modal.hidden);
}

function renderPaletteResults(query) {
  const listEl = document.getElementById('command-palette-list');
  const countBadge = document.getElementById('palette-count-badge');
  if (!listEl) return;

  const allItems = getPaletteItems();
  const q = (query || '').trim().toLowerCase();

  if (!q) {
    paletteResults = allItems.slice(0, 15);
  } else {
    paletteResults = allItems.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchUrl = item.url.toLowerCase().includes(q);
      return matchTitle || matchCat || matchUrl;
    }).slice(0, 20);
  }

  if (countBadge) {
    countBadge.textContent = `${paletteResults.length} résultat${paletteResults.length > 1 ? 's' : ''}`;
  }

  if (paletteResults.length === 0) {
    listEl.innerHTML = `
      <li class="palette-empty-state">
        <i class="fa-solid fa-magnifying-glass"></i>
        <span>Aucun résultat trouvé pour "${escapeHtml(query)}"</span>
      </li>
    `;
    return;
  }

  if (paletteActiveIndex >= paletteResults.length) {
    paletteActiveIndex = 0;
  }

  listEl.innerHTML = paletteResults
    .map((item, index) => {
      const isActive = index === paletteActiveIndex;
      const isBookmark = item.type === 'bookmark';
      const cleanUrl = isBookmark
        ? item.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
        : item.url;

      return `
        <li class="palette-result-item ${isActive ? 'active' : ''}" data-idx="${index}">
          <div class="palette-item-icon"><i class="${item.icon}"></i></div>
          <div class="palette-item-details">
            <div class="palette-item-title-row">
              <span class="palette-item-title">${escapeHtml(item.title)}</span>
              <span class="palette-item-badge ${item.type}">${escapeHtml(item.category)}</span>
            </div>
            ${cleanUrl ? `<span class="palette-item-sub">${escapeHtml(cleanUrl)}</span>` : ''}
          </div>
          <i class="fa-solid fa-turn-down-left palette-enter-icon" title="Ouvrir"></i>
        </li>
      `;
    })
    .join('');

  const activeEl = listEl.children[paletteActiveIndex];
  if (activeEl && typeof activeEl.scrollIntoView === 'function') {
    activeEl.scrollIntoView({ block: 'nearest' });
  }
}

function initCommandPalette() {
  const modal = document.getElementById('command-palette-modal');
  const input = document.getElementById('command-palette-input');
  const listEl = document.getElementById('command-palette-list');

  if (!modal || !input) return;

  input.addEventListener('input', () => {
    paletteActiveIndex = 0;
    renderPaletteResults(input.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (paletteResults.length > 0) {
        paletteActiveIndex = (paletteActiveIndex + 1) % paletteResults.length;
        renderPaletteResults(input.value);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (paletteResults.length > 0) {
        paletteActiveIndex = (paletteActiveIndex - 1 + paletteResults.length) % paletteResults.length;
        renderPaletteResults(input.value);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (paletteResults[paletteActiveIndex]) {
        paletteResults[paletteActiveIndex].action();
        closeCommandPalette();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeCommandPalette();
    }
  });

  if (listEl) {
    listEl.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.palette-result-item');
      if (!itemEl) return;
      const idx = Number(itemEl.dataset.idx);
      if (paletteResults[idx]) {
        paletteResults[idx].action();
        closeCommandPalette();
      }
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeCommandPalette();
    }
  });
}
