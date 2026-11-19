/**
 * custom-hub.js - Centre de configuration & modale des paramètres
 * Cyberdeck - Startpage
 */

function openCustomHub(tabName = 'appearance') {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.hidden = false;
    modal.classList.add('visible');
    document.body.classList.add('modal-open');
  }
  switchHubTab(tabName);
}

function closeCustomHub() {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.hidden = true;
    modal.classList.remove('visible');
    document.body.classList.remove('modal-open');
  }
}

function toggleCustomHub(tabName = 'appearance') {
  const modal = document.getElementById('settings-modal');
  if (modal && !modal.hidden && modal.classList.contains('visible')) {
    closeCustomHub();
  } else {
    openCustomHub(tabName);
  }
}

window.openCustomHub = openCustomHub;
window.closeCustomHub = closeCustomHub;
window.toggleCustomHub = toggleCustomHub;

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
    if (typeof renderPalettesList === 'function') renderPalettesList();
    if (typeof renderUserCustomThemes === 'function') renderUserCustomThemes();
    if (typeof updateAppearanceInputs === 'function') updateAppearanceInputs();
    if (typeof updateAppearanceLivePreview === 'function') updateAppearanceLivePreview();
  } else if (tabName === 'animations') {
    if (typeof applyAnimationSettings === 'function' && typeof getAnimationSettings === 'function') {
      applyAnimationSettings(getAnimationSettings());
    }
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
            <h4>${escapeHtml(cat.title)}</h4>
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
                      <span class="hub-link-name">${escapeHtml(link.name || link.title || '')}</span>
                      <span class="hub-link-url">${escapeHtml(link.url || '')}</span>
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
      if (typeof openEditModal === 'function') {
        openEditModal(catIdx, null);
      }
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
      const linkName = categories[catIdx]?.links[linkIdx]?.name || 'Lien';
      categories[catIdx].links.splice(linkIdx, 1);
      localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
      if (typeof renderCategories === 'function') renderCategories();
      renderHubShortcuts();
      if (typeof showToast === 'function') showToast(`Raccourci "${linkName}" supprimé`, 'info');
    });
  });
}

// ========================================================
// GESTIONNAIRE D'ANIMATIONS & DÉFILEMENT
// ========================================================
const ANIM_STORAGE_KEY = 'startpage_anim_settings';
const ANIM_DEFAULTS = {
  style: 'deck-slide',
  speed: 'normal',
  blur: 'medium',
  indicatorStyle: 'glass',
  tabAnim: 'scale-pop'
};

const TAB_ANIM_LABELS = {
  'scale-pop': 'Éclosion & Rebond',
  'slide-fade': 'Glissement Latéral',
  'cyber-glow': 'Cyber Glow',
  'instant': 'Instantané'
};

const SPEED_DURATIONS = {
  slow: { duration: '0.55s', label: '550ms (Lente / Cinématique)' },
  normal: { duration: '0.42s', label: '420ms (Normale / Fluide)' },
  fast: { duration: '0.24s', label: '240ms (Rapide / Snappy)' }
};

const BLUR_VALUES = {
  high: '6px',
  medium: '3.5px',
  subtle: '1.5px',
  none: '0px'
};

function getAnimationSettings() {
  try {
    const raw = localStorage.getItem(ANIM_STORAGE_KEY);
    return raw ? { ...ANIM_DEFAULTS, ...JSON.parse(raw) } : { ...ANIM_DEFAULTS };
  } catch {
    return { ...ANIM_DEFAULTS };
  }
}

function saveAnimationSettings(settings) {
  try {
    localStorage.setItem(ANIM_STORAGE_KEY, JSON.stringify(settings));
  } catch {}
  applyAnimationSettings(settings);
}

function applyAnimationSettings(settings) {
  const root = document.documentElement;
  const speedInfo = SPEED_DURATIONS[settings.speed] || SPEED_DURATIONS.normal;
  const blurValue = BLUR_VALUES[settings.blur] || BLUR_VALUES.medium;

  root.style.setProperty('--page-anim-duration', speedInfo.duration);
  root.style.setProperty('--anim-sidebar-duration', speedInfo.duration);
  root.style.setProperty('--motion-blur-amount', blurValue);

  document.body.classList.remove('indicator-style-glass', 'indicator-style-neon', 'indicator-style-clean');
  document.body.classList.add(`indicator-style-${settings.indicatorStyle || 'glass'}`);

  const badge = document.getElementById('anim-speed-val-badge');
  if (badge) badge.textContent = speedInfo.label;

  const tabBadge = document.getElementById('tab-anim-val-badge');
  if (tabBadge) tabBadge.textContent = TAB_ANIM_LABELS[settings.tabAnim] || 'Éclosion & Rebond';

  document.querySelectorAll('.hub-anim-card-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.animStyle === settings.style);
  });
  document.querySelectorAll('.speed-preset-pill').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.speed === settings.speed);
  });
  document.querySelectorAll('.blur-preset-pill').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.blur === settings.blur);
  });
  document.querySelectorAll('.indicator-style-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.indicatorStyle === settings.indicatorStyle);
  });
  document.querySelectorAll('.tab-anim-preset-pill').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tabAnim === (settings.tabAnim || 'scale-pop'));
  });
}

function initAnimationHubControls() {
  const settings = getAnimationSettings();
  applyAnimationSettings(settings);

  document.querySelectorAll('.hub-anim-card-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cur = getAnimationSettings();
      cur.style = btn.dataset.animStyle;
      saveAnimationSettings(cur);
      if (typeof showToast === 'function') {
        const title = btn.querySelector('.anim-card-title')?.textContent || cur.style;
        showToast(`Animation : ${title}`, 'success');
      }
    });
  });

  document.querySelectorAll('.speed-preset-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cur = getAnimationSettings();
      cur.speed = btn.dataset.speed;
      saveAnimationSettings(cur);
      if (typeof showToast === 'function') showToast(`Vitesse : ${btn.textContent.trim()}`, 'info');
    });
  });

  document.querySelectorAll('.blur-preset-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cur = getAnimationSettings();
      cur.blur = btn.dataset.blur;
      saveAnimationSettings(cur);
      if (typeof showToast === 'function') showToast(`Flou cinétique : ${btn.textContent.trim()}`, 'info');
    });
  });

  document.querySelectorAll('.indicator-style-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cur = getAnimationSettings();
      cur.indicatorStyle = btn.dataset.indicatorStyle;
      saveAnimationSettings(cur);
      if (typeof showToast === 'function') {
        const name = btn.querySelector('span:last-child')?.textContent || cur.indicatorStyle;
        showToast(`Surbrillance : ${name}`, 'info');
      }
    });
  });

  document.querySelectorAll('.tab-anim-preset-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cur = getAnimationSettings();
      cur.tabAnim = btn.dataset.tabAnim;
      saveAnimationSettings(cur);
      if (typeof showToast === 'function') {
        const name = btn.querySelector('span')?.textContent || cur.tabAnim;
        showToast(`Animation onglet : ${name}`, 'info');
      }
    });
  });

  const testBtn = document.getElementById('anim-test-preview-btn');
  if (testBtn) {
    testBtn.addEventListener('click', () => {
      const targetEl = document.getElementById('categories-container') || document.querySelector('.startpage-main');
      const curSettings = getAnimationSettings();
      if (targetEl) {
        targetEl.classList.remove('slide-enter-down', 'slide-enter-up', 'zoom-enter', 'glitch-enter', 'crossfade-enter');
        void targetEl.offsetWidth;
        if (curSettings.style === 'deck-slide') {
          targetEl.classList.add('slide-enter-down');
        } else if (curSettings.style === 'page-zoom') {
          targetEl.classList.add('zoom-enter');
        } else if (curSettings.style === 'cyber-glitch') {
          targetEl.classList.add('glitch-enter');
        } else if (curSettings.style === 'crossfade') {
          targetEl.classList.add('crossfade-enter');
        }
      }
    });
  }
}

// Compatibilité avec les fichiers de sauvegarde existants
const defaultSidebarSettings = { density: 'normal', radius: 'normal', glass: 'deep' };
function getSidebarSettings() {
  try {
    const raw = localStorage.getItem('startpage_sidebar_custom_settings');
    if (raw) return { ...defaultSidebarSettings, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultSidebarSettings };
}
function saveSidebarSettings(settings) {
  try {
    localStorage.setItem('startpage_sidebar_custom_settings', JSON.stringify(settings));
  } catch {}
}

function initCustomHub() {
  initAnimationHubControls();

  // Bouton d'ouverture des paramètres (header)
  const openSettingsBtn = document.getElementById('open-settings-btn');
  if (openSettingsBtn) {
    openSettingsBtn.addEventListener('click', () => openCustomHub('appearance'));
  }

  // Bouton de fermeture de la modale de paramètres
  const closeSettingsBtn = document.getElementById('settings-modal-close-btn');
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', closeCustomHub);
  }

  // Clic sur le fond obscurci pour fermer
  const settingsModal = document.getElementById('settings-modal');
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) closeCustomHub();
    });
  }

  // Clic sur l'avatar / logo en haut à gauche pour faire défiler les thèmes (1 à 5)
  const brandCycler = document.getElementById('brand-theme-cycler');
  if (brandCycler) {
    brandCycler.addEventListener('click', () => {
      const themes = (typeof themesConfig !== 'undefined') ? Object.keys(themesConfig) : ['1', '2', '3', '4', '5'];
      const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
      if (typeof applyTheme === 'function') applyTheme(nextTheme);
    });
  }

  const addCategoryBtn = document.getElementById('hub-add-category-btn');

  // Navigation dans les sous-onglets de personnalisation
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

  // Boutons Export et Import dans l'onglet Sauvegarde
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
