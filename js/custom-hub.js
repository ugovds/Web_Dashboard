/**
 * custom-hub.js - Grand Cadre de Personnalisation & Menu glissant de la colonne droite
 */

function initDeckViewSlider() {
  const navBtns = document.querySelectorAll('.deck-nav-btn');
  const viewAgenda = document.getElementById('deck-view-agenda');
  const viewFeeds = document.getElementById('deck-view-feeds');
  const indicator = document.querySelector('.deck-nav-indicator');

  navBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      navBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.dataset.deckView;
      if (target === 'agenda') {
        if (viewAgenda) {
          viewAgenda.hidden = false;
          viewAgenda.classList.add('active');
        }
        if (viewFeeds) {
          viewFeeds.hidden = true;
          viewFeeds.classList.remove('active');
        }
      } else {
        if (viewAgenda) {
          viewAgenda.hidden = true;
          viewAgenda.classList.remove('active');
        }
        if (viewFeeds) {
          viewFeeds.hidden = false;
          viewFeeds.classList.add('active');
        }
      }

      if (indicator) {
        indicator.style.transform = `translateX(${idx * 100}%)`;
      }
    });
  });
}

function openCustomHub(tabName = 'shortcuts') {
  const modal = document.getElementById('custom-hub-modal');
  if (!modal) return;

  switchHubTab(tabName);
  renderHubShortcuts();
  modal.hidden = false;
}

function closeCustomHub() {
  const modal = document.getElementById('custom-hub-modal');
  if (modal) modal.hidden = true;
}

function switchHubTab(tabName) {
  const tabBtns = document.querySelectorAll('.hub-tab-btn');
  const panels = document.querySelectorAll('.hub-tab-panel');

  tabBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.hubTab === tabName);
  });

  panels.forEach((p) => {
    const isTarget = p.id === `hub-tab-${tabName}`;
    p.hidden = !isTarget;
    p.classList.toggle('active', isTarget);
  });

  if (tabName === 'shortcuts') {
    renderHubShortcuts();
  } else if (tabName === 'feeds') {
    if (typeof renderCustomFeedsModalList === 'function') renderCustomFeedsModalList();
  }
}

function initPromptPath() {
  const promptEl = document.getElementById('prompt-path');
  if (!promptEl) return;
  const saved = localStorage.getItem('startpage_prompt_path');
  if (saved) promptEl.textContent = saved;

  promptEl.style.cursor = 'pointer';
  promptEl.title = 'Cliquer pour personnaliser l\'invite de commande';
  promptEl.addEventListener('click', () => {
    const current = promptEl.textContent;
    const newVal = prompt('Modifier l\'invite de commande (terminal prompt) :', current);
    if (newVal !== null && newVal.trim() !== '') {
      promptEl.textContent = newVal.trim();
      localStorage.setItem('startpage_prompt_path', newVal.trim());
      if (typeof showToast === 'function') showToast('Prompt mis à jour !', 'success');
    }
  });
}

function renderHubShortcuts() {
  const container = document.getElementById('hub-categories-list');
  if (!container || typeof categories === 'undefined') return;

  if (categories.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <i class="fa-solid fa-folder-open"></i>
        <span>Aucune catégorie. Cliquez sur "+ Nouvelle Catégorie" pour commencer.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = categories
    .map((cat, catIdx) => {
      const linkCount = cat.links.length;
      let densityBadge = 'Normale';
      if (linkCount > 12) densityBadge = 'Scroll automatique';
      else if (linkCount >= 9) densityBadge = 'Dense';
      else if (linkCount >= 7) densityBadge = 'Compacte';

      return `
      <div class="hub-cat-card" data-cat="${catIdx}">
        <div class="hub-cat-header">
          <div class="hub-cat-title-group">
            <i class="${cat.icon}"></i>
            <h4>${cat.title}</h4>
            <span class="hub-count-tag">${linkCount} lien(s) • Densité ${densityBadge}</span>
          </div>
          <div class="hub-cat-actions">
            <button type="button" class="hub-action-btn primary hub-add-link-btn" data-cat="${catIdx}">
              <i class="fa-solid fa-plus"></i> Ajouter un lien
            </button>
            <button type="button" class="hub-action-btn hub-edit-cat-btn" data-cat="${catIdx}" title="Renommer la catégorie">
              <i class="fa-solid fa-pen"></i>
            </button>
            ${
              categories.length > 1
                ? `
              <button type="button" class="hub-action-btn danger hub-del-cat-btn" data-cat="${catIdx}" title="Supprimer la catégorie">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            `
                : ''
            }
          </div>
        </div>

        <div class="hub-links-list">
          ${
            cat.links.length === 0
              ? '<span class="hub-no-links">Aucun raccourci dans cette catégorie.</span>'
              : cat.links
                  .map(
                    (link, linkIdx) => `
              <div class="hub-link-row">
                <div class="hub-link-info">
                  <div class="hub-link-icon-box"><i class="${link.icon}"></i></div>
                  <div class="hub-link-texts">
                    <span class="hub-link-name">${link.name}</span>
                    <span class="hub-link-url" title="${link.url}">${link.url}</span>
                  </div>
                </div>
                <div class="hub-link-row-actions">
                  <button type="button" class="hub-link-edit-btn" data-cat="${catIdx}" data-link="${linkIdx}" title="Modifier">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button type="button" class="hub-link-del-btn" data-cat="${catIdx}" data-link="${linkIdx}" title="Supprimer">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            `
                  )
                  .join('')
          }
        </div>
      </div>
    `;
    })
    .join('');

  // Attacher les écouteurs sur les boutons générés
  container.querySelectorAll('.hub-add-link-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const catIdx = Number(btn.dataset.cat);
      if (typeof openEditModal === 'function') openEditModal(catIdx, null);
    });
  });

  container.querySelectorAll('.hub-edit-cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const catIdx = Number(btn.dataset.cat);
      if (typeof openCategoryModal === 'function') openCategoryModal(catIdx);
    });
  });

  container.querySelectorAll('.hub-del-cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const catIdx = Number(btn.dataset.cat);
      const catName = categories[catIdx]?.title || 'cette catégorie';
      if (confirm(`Voulez-vous vraiment supprimer la catégorie "${catName}" et tous ses liens ?`)) {
        categories.splice(catIdx, 1);
        localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
        if (typeof renderCategories === 'function') renderCategories();
        renderHubShortcuts();
        if (typeof showToast === 'function') showToast(`Catégorie "${catName}" supprimée`, 'info');
      }
    });
  });

  container.querySelectorAll('.hub-link-edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const catIdx = Number(btn.dataset.cat);
      const linkIdx = Number(btn.dataset.link);
      if (typeof openEditModal === 'function') openEditModal(catIdx, linkIdx);
    });
  });

  container.querySelectorAll('.hub-link-del-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const catIdx = Number(btn.dataset.cat);
      const linkIdx = Number(btn.dataset.link);
      const linkName = categories[catIdx]?.links[linkIdx]?.name || 'le raccourci';
      categories[catIdx].links.splice(linkIdx, 1);
      localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
      if (typeof renderCategories === 'function') renderCategories();
      renderHubShortcuts();
      if (typeof showToast === 'function') showToast(`Raccourci "${linkName}" supprimé`, 'info');
    });
  });
}

function initCustomHub() {
  initDeckViewSlider();
  initPromptPath();

  const openBtn = document.getElementById('open-custom-hub-btn');
  const closeBtn = document.getElementById('hub-modal-close');
  const modal = document.getElementById('custom-hub-modal');
  const addCategoryBtn = document.getElementById('hub-add-category-btn');

  if (openBtn) {
    openBtn.addEventListener('click', () => openCustomHub('shortcuts'));
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeCustomHub);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCustomHub();
    });
  }

  document.querySelectorAll('.hub-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      switchHubTab(btn.dataset.hubTab);
    });
  });

  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => {
      if (typeof openCategoryModal === 'function') openCategoryModal(null);
    });
  }

  // Thèmes dans l'onglet Apparence du Hub
  document.querySelectorAll('.hub-theme-card-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const themeId = btn.dataset.hubTheme;
      if (typeof applyTheme === 'function') applyTheme(themeId);
      document.querySelectorAll('.hub-theme-card-btn').forEach((b) => {
        b.classList.toggle('active', b.dataset.hubTheme === themeId);
      });
      if (typeof showToast === 'function') showToast(`Thème appliqué : ${btn.title}`, 'success');
    });
  });

  // Boutons Export et Import dans l'onglet Backup
  const exportBtn = document.getElementById('hub-export-btn');
  const importBtn = document.getElementById('hub-import-btn');
  const resetBtn = document.getElementById('hub-reset-btn');
  const fileInput = document.getElementById('hub-file-input');

  if (exportBtn && typeof exportFullConfig === 'function') {
    exportBtn.addEventListener('click', exportFullConfig);
  }

  if (importBtn && fileInput && typeof importFullConfig === 'function') {
    importBtn.addEventListener('click', () => {
      fileInput.value = '';
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        importFullConfig(file);
        renderHubShortcuts();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Voulez-vous vraiment restaurer tous les raccourcis d\'origine ?')) {
        if (typeof defaultCategories !== 'undefined') {
          categories = structuredClone(defaultCategories);
          localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
          if (typeof renderCategories === 'function') renderCategories();
          renderHubShortcuts();
          if (typeof showToast === 'function') showToast('Raccourcis par défaut restaurés', 'info');
        }
      }
    });
  }
}
