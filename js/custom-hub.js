/**
 * custom-hub.js - Personnalisation intégrée dans le Deck (colonne droite) & Slider de navigation
 */

function initDeckViewSlider() {
  const navBtns = document.querySelectorAll('.deck-nav-btn');
  const allViews = document.querySelectorAll('.deck-slide-view');
  const indicator = document.querySelector('.deck-nav-indicator');

  function updateIndicator(activeBtn) {
    if (!indicator || !activeBtn) return;
    indicator.style.width = `${activeBtn.offsetWidth}px`;
    indicator.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
    try {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    } catch {}
  }

  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      navBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.dataset.deckView;
      allViews.forEach((view) => {
        const isTarget = view.id === `deck-view-${target}`;
        view.hidden = !isTarget;
        view.classList.toggle('active', isTarget);
      });

      if (target === 'customize') {
        const activeSubtab = document.querySelector('.hub-tab-btn.active')?.dataset.hubTab || 'appearance';
        switchHubTab(activeSubtab);
      }

      updateIndicator(btn);
    });
  });

  const initialActive = document.querySelector('.deck-nav-btn.active');
  if (initialActive) {
    setTimeout(() => updateIndicator(initialActive), 60);
  }
  window.addEventListener('resize', () => {
    const curr = document.querySelector('.deck-nav-btn.active');
    if (curr) updateIndicator(curr);
  });
}

function openCustomHub(tabName = 'appearance') {
  const configBtn = document.querySelector('.deck-nav-btn[data-deck-view="customize"]');
  if (configBtn) configBtn.click();
  switchHubTab(tabName);
}

function closeCustomHub() {
  const agendaBtn = document.querySelector('.deck-nav-btn[data-deck-view="agenda"]');
  if (agendaBtn) agendaBtn.click();
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
  } else if (tabName === 'appearance') {
    if (typeof updateAppearanceInputs === 'function') updateAppearanceInputs();
    if (typeof updateAppearanceLivePreview === 'function') updateAppearanceLivePreview();
  } else if (tabName === 'clock') {
    if (typeof updateClockControlsUI === 'function') updateClockControlsUI();
    if (typeof updateClock === 'function') updateClock();
  } else if (tabName === 'widgets') {
    if (typeof applyWidgetVisibility === 'function') applyWidgetVisibility();
  } else if (tabName === 'feeds') {
    if (typeof renderCustomFeedsModalList === 'function') renderCustomFeedsModalList();
  }
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
      if (linkCount > 12) densityBadge = 'Scroll auto';
      else if (linkCount >= 9) densityBadge = 'Dense';
      else if (linkCount >= 7) densityBadge = 'Compacte';

      return `
      <div class="hub-cat-card" data-cat="${catIdx}">
        <div class="hub-cat-header">
          <div class="hub-cat-title-group">
            <i class="${cat.icon}"></i>
            <h4>${cat.title}</h4>
            <span class="hub-count-tag">${linkCount} lien(s) • ${densityBadge}</span>
          </div>
          <div class="hub-cat-actions">
            <button type="button" class="hub-action-btn primary hub-add-link-btn" data-cat="${catIdx}">
              <i class="fa-solid fa-plus"></i> Lien
            </button>
            <button type="button" class="hub-action-btn hub-edit-cat-btn" data-cat="${catIdx}" title="Renommer la catégorie">
              <i class="fa-solid fa-pen"></i>
            </button>
            ${
              categories.length > 1
                ? `<button type="button" class="hub-action-btn danger hub-del-cat-btn" data-cat="${catIdx}" title="Supprimer la catégorie">
                     <i class="fa-solid fa-trash-can"></i>
                   </button>`
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
                <div class="hub-link-row" data-cat="${catIdx}" data-link="${linkIdx}">
                  <div class="hub-link-info">
                    <span class="hub-link-icon-box"><i class="${link.icon || 'fa-solid fa-bookmark'}"></i></span>
                    <div class="hub-link-texts">
                      <span class="hub-link-name">${link.title}</span>
                      <span class="hub-link-url">${link.url}</span>
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

  // Écouteurs pour ajouter un lien
  container.querySelectorAll('.hub-add-link-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const catIdx = parseInt(btn.dataset.cat, 10);
      if (typeof openAddModal === 'function') openAddModal(catIdx);
    });
  });

  // Écouteurs pour éditer une catégorie
  container.querySelectorAll('.hub-edit-cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const catIdx = parseInt(btn.dataset.cat, 10);
      if (typeof openCategoryModal === 'function') openCategoryModal(catIdx);
    });
  });

  // Écouteurs pour supprimer une catégorie
  container.querySelectorAll('.hub-del-cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const catIdx = parseInt(btn.dataset.cat, 10);
      const cat = categories[catIdx];
      if (confirm(`Voulez-vous supprimer la catégorie "${cat.title}" et tous ses liens ?`)) {
        categories.splice(catIdx, 1);
        localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
        if (typeof renderCategories === 'function') renderCategories();
        renderHubShortcuts();
        if (typeof showToast === 'function') showToast(`Catégorie "${cat.title}" supprimée`, 'info');
      }
    });
  });

  // Écouteurs pour éditer un lien individuel
  container.querySelectorAll('.hub-link-edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const catIdx = parseInt(btn.dataset.cat, 10);
      const linkIdx = parseInt(btn.dataset.link, 10);
      if (typeof openEditModal === 'function') openEditModal(catIdx, linkIdx);
    });
  });

  // Écouteurs pour supprimer un lien individuel
  container.querySelectorAll('.hub-link-del-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const catIdx = parseInt(btn.dataset.cat, 10);
      const linkIdx = parseInt(btn.dataset.link, 10);
      const linkName = categories[catIdx].links[linkIdx]?.title || 'Lien';
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

  const addCategoryBtn = document.getElementById('hub-add-category-btn');

  // Sous-onglets de personnalisation
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

  // Thèmes dans l'onglet Apparence
  document.querySelectorAll('.hub-theme-card-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const themeId = btn.dataset.hubTheme;
      if (typeof applyTheme === 'function') applyTheme(themeId);
      document.querySelectorAll('.hub-theme-card-btn').forEach((b) => {
        b.classList.toggle('active', b.dataset.hubTheme === themeId);
      });
      if (typeof showToast === 'function') showToast(`Thème appliqué : ${btn.title || themeId}`, 'success');
    });
  });

  // Boutons Export et Import dans l'onglet Backup
  const exportBtn = document.getElementById('hub-export-btn');
  const importBtn = document.getElementById('hub-import-btn');
  const resetBtn = document.getElementById('hub-reset-btn');
  const fileInput = document.getElementById('hub-import-file-input') || document.getElementById('hub-file-input');

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
      if (confirm('Voulez-vous vraiment restaurer tous les raccourcis et réglages par défaut ?')) {
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
