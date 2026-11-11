/**
 * custom-hub.js - Personnalisation intégrée, navigation Dashboard & Menu Latéral
 */

const VIEW_TITLES = {
  dashboard: { title: 'Accueil', sub: 'Tableau de bord & Signets', icon: 'fa-solid fa-house' },
  agenda: { title: 'Agenda & Tâches', sub: 'Calendrier mensuel & To-Do list', icon: 'fa-regular fa-calendar-check' },
  weather: { title: 'Météo & Radar', sub: 'Prévisions 24h & Satellite direct', icon: 'fa-solid fa-cloud-sun' },
  feeds: { title: 'Actualités en Direct', sub: 'F1, Football, Tech & Flux RSS', icon: 'fa-solid fa-newspaper' },
  system: { title: 'Marchés & Portefeuille', sub: 'Cotations réelles, indices mondiaux & ETF', icon: 'fa-solid fa-chart-line' },
  pomodoro: { title: 'Studio Focus & Ambiance', sub: 'Minuteur Pomodoro, Intervalles & Sons Lo-Fi', icon: 'fa-solid fa-stopwatch' },
  notes: { title: 'Bloc-Notes', sub: 'Scratchpad Markdown & Sauvegarde locale', icon: 'fa-solid fa-note-sticky' },
  quotes: { title: 'Citations & Motivation', sub: 'Philosophie hacker & science-fiction', icon: 'fa-solid fa-quote-left' },
  customize: { title: 'Paramètres & Hub', sub: 'Thèmes, Couleurs, Horloge & Sauvegarde', icon: 'fa-solid fa-sliders' }
};

const VIEW_KEYS = [
  'dashboard',
  'agenda',
  'weather',
  'feeds',
  'system',
  'pomodoro',
  'notes',
  'quotes',
  'customize'
];

let currentDeckTarget = 'dashboard';
let updateDeckIndicator = null;

function initDeckViewSlider() {
  const navBtns = document.querySelectorAll('.deck-nav-btn');
  const allViews = document.querySelectorAll('.deck-slide-view');
  const indicator = document.querySelector('.sidebar-indicator') || document.querySelector('.deck-nav-indicator');

  function updateIndicator(activeBtn) {
    if (!indicator || !activeBtn) return;
    const isVertical = activeBtn.classList.contains('sidebar-nav-item') || activeBtn.closest('.sidebar-nav');
    if (isVertical) {
      indicator.style.height = `${activeBtn.offsetHeight}px`;
      indicator.style.transform = `translateY(${activeBtn.offsetTop}px)`;
      indicator.style.opacity = '1';
    } else {
      indicator.style.width = `${activeBtn.offsetWidth}px`;
      indicator.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
      indicator.style.height = '';
      indicator.style.opacity = '1';
    }
    try {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    } catch {}
  }

  updateDeckIndicator = updateIndicator;

  function updateTopbarInfo(targetKey) {
    const meta = VIEW_TITLES[targetKey] || { title: targetKey, sub: '', icon: 'fa-solid fa-layer-group' };
    const titleEl = document.getElementById('topbar-view-title');
    const subEl = document.getElementById('topbar-view-subtitle');
    const iconEl = document.getElementById('topbar-view-icon');
    if (titleEl) titleEl.textContent = meta.title;
    if (subEl) subEl.textContent = meta.sub;
    if (iconEl) iconEl.innerHTML = `<i class="${meta.icon}"></i>`;
  }

  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.deckView;
      const prevIdx = VIEW_KEYS.indexOf(currentDeckTarget);
      const nextIdx = VIEW_KEYS.indexOf(target);
      const direction = (nextIdx !== -1 && prevIdx !== -1 && nextIdx >= prevIdx) ? 'down' : 'up';
      currentDeckTarget = target;

      navBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const animSettings = getAnimationSettings();
      const animStyle = animSettings.style || 'deck-slide';

      allViews.forEach((view) => {
        const isTarget = view.id === `deck-view-${target}`;
        if (isTarget) {
          view.hidden = false;
          view.classList.add('active');

          view.classList.remove('slide-enter-down', 'slide-enter-up', 'zoom-enter', 'glitch-enter', 'crossfade-enter');
          void view.offsetWidth; // Force reflow pour relancer l'animation de défilement

          if (animStyle === 'deck-slide') {
            view.classList.add(direction === 'down' ? 'slide-enter-down' : 'slide-enter-up');
          } else if (animStyle === 'page-zoom') {
            view.classList.add('zoom-enter');
          } else if (animStyle === 'cyber-glitch') {
            view.classList.add('glitch-enter');
          } else if (animStyle === 'crossfade') {
            view.classList.add('crossfade-enter');
          }
        } else {
          view.hidden = true;
          view.classList.remove('active', 'slide-enter-down', 'slide-enter-up', 'zoom-enter', 'glitch-enter', 'crossfade-enter');
        }
      });

      updateTopbarInfo(target);

      if (target === 'customize') {
        const activeSubtab = document.querySelector('.hub-tab-btn.active')?.dataset.hubTab || 'appearance';
        switchHubTab(activeSubtab);
      } else if (target === 'pomodoro') {
        if (typeof renderPomoHistoryChart === 'function') renderPomoHistoryChart();
        if (typeof updatePomoUI === 'function') updatePomoUI();
        if (typeof drawAmbientVisualizer === 'function') drawAmbientVisualizer();
      }

      updateIndicator(btn);
    });
  });

  const initialActive = document.querySelector('.deck-nav-btn.active');
  if (initialActive) {
    const initialTarget = initialActive.dataset.deckView || 'dashboard';
    currentDeckTarget = initialTarget;
    updateTopbarInfo(initialTarget);
    setTimeout(() => updateIndicator(initialActive), 80);
  }

  window.addEventListener('resize', () => {
    const curr = document.querySelector('.deck-nav-btn.active');
    if (curr) updateIndicator(curr);
  });
}

function initSidebarControls() {
  const sidebar = document.getElementById('dashboard-sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const isLocked = localStorage.getItem('startpage_sidebar_expanded') === 'true';

  if (sidebar && isLocked) {
    sidebar.classList.add('locked-expanded');
    if (toggleBtn) toggleBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  }

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('locked-expanded');
      const expanded = sidebar.classList.contains('locked-expanded');
      localStorage.setItem('startpage_sidebar_expanded', expanded ? 'true' : 'false');
      toggleBtn.innerHTML = expanded ? '<i class="fa-solid fa-chevron-left"></i>' : '<i class="fa-solid fa-chevron-right"></i>';

      const curr = document.querySelector('.deck-nav-btn.active');
      if (curr && typeof updateDeckIndicator === 'function') {
        setTimeout(() => updateDeckIndicator(curr), 80);
      }
    });
  }

  // Expansion fluide au survol si non verrouillée
  if (sidebar) {
    sidebar.addEventListener('mouseenter', () => {
      if (!sidebar.classList.contains('locked-expanded')) {
        sidebar.classList.add('expanded');
        const curr = document.querySelector('.deck-nav-btn.active');
        if (curr && typeof updateDeckIndicator === 'function') {
          setTimeout(() => updateDeckIndicator(curr), 80);
        }
      }
    });

    sidebar.addEventListener('mouseleave', () => {
      sidebar.classList.remove('expanded');
      const curr = document.querySelector('.deck-nav-btn.active');
      if (curr && typeof updateDeckIndicator === 'function') {
        setTimeout(() => updateDeckIndicator(curr), 80);
      }
    });
  }

  // Clic sur l'avatar du thème dans la sidebar pour cycler le thème
  const brandAvatar = document.getElementById('sidebar-brand-avatar');
  if (brandAvatar) {
    brandAvatar.addEventListener('click', () => {
      const themes = ['1', '2', '3', '4'];
      const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
      if (typeof applyTheme === 'function') applyTheme(nextTheme);
    });
  }

  // Topbar : Déclencheur recherche
  const topbarSearchBtn = document.getElementById('topbar-search-btn');
  if (topbarSearchBtn) {
    topbarSearchBtn.addEventListener('click', () => {
      const homeBtn = document.querySelector('.deck-nav-btn[data-deck-view="dashboard"]');
      if (homeBtn && !homeBtn.classList.contains('active')) {
        homeBtn.click();
      }
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        setTimeout(() => {
          searchInput.focus();
          searchInput.select();
        }, 60);
      }
    });
  }

  // Topbar : Pilule météo
  const topbarWeatherPill = document.getElementById('topbar-weather-pill');
  if (topbarWeatherPill) {
    topbarWeatherPill.addEventListener('click', () => {
      const weatherBtn = document.querySelector('.deck-nav-btn[data-deck-view="weather"]');
      if (weatherBtn) weatherBtn.click();
    });
  }

  // Topbar : Pilule ambiance
  const topbarAmbientPill = document.getElementById('topbar-ambient-pill');
  if (topbarAmbientPill) {
    topbarAmbientPill.addEventListener('click', () => {
      const toggle = document.getElementById('ambient-master-toggle');
      if (toggle) {
        toggle.click();
      } else {
        const ambientBtn = document.querySelector('.deck-nav-btn[data-deck-view="ambient"]');
        if (ambientBtn) ambientBtn.click();
      }
    });
  }

  // Topbar : Pilule thème
  const topbarThemePill = document.getElementById('topbar-theme-pill');
  if (topbarThemePill) {
    topbarThemePill.addEventListener('click', () => {
      const themes = ['1', '2', '3', '4'];
      const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
      if (typeof applyTheme === 'function') applyTheme(nextTheme);
    });
  }
}

function openCustomHub(tabName = 'appearance') {
  const configBtn = document.querySelector('.deck-nav-btn[data-deck-view="customize"]');
  if (configBtn) configBtn.click();
  switchHubTab(tabName);
}

function closeCustomHub() {
  const homeBtn = document.querySelector('.deck-nav-btn[data-deck-view="dashboard"]');
  if (homeBtn) homeBtn.click();
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
    if (typeof renderPalettesList === 'function') renderPalettesList();
    if (typeof renderUserCustomThemes === 'function') renderUserCustomThemes();
    if (typeof updateAppearanceInputs === 'function') updateAppearanceInputs();
    if (typeof updateAppearanceLivePreview === 'function') updateAppearanceLivePreview();
  } else if (tabName === 'clock') {
    if (typeof updateClockControlsUI === 'function') updateClockControlsUI();
    if (typeof updateClock === 'function') updateClock();
  } else if (tabName === 'widgets') {
    if (typeof applyWidgetVisibility === 'function') applyWidgetVisibility();
  } else if (tabName === 'feeds') {
    if (typeof renderCustomFeedsModalList === 'function') renderCustomFeedsModalList();
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
                      <span class="hub-link-name">${link.name || link.title || ''}</span>
                      <span class="hub-link-url">${link.url || ''}</span>
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
      } else if (typeof openAddModal === 'function') {
        openAddModal(catIdx);
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
      const linkName = categories[catIdx]?.links[linkIdx]?.name || categories[catIdx]?.links[linkIdx]?.title || 'Lien';
      categories[catIdx].links.splice(linkIdx, 1);
      localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
      if (typeof renderCategories === 'function') renderCategories();
      renderHubShortcuts();
      if (typeof showToast === 'function') showToast(`Raccourci "${linkName}" supprimé`, 'info');
    });
  });
}

// ========================================================
// GESTIONNAIRE D'ANIMATIONS & DÉFILEMENT (BIBLIOTHÈQUE DU HUB)
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
      const activeView = document.querySelector('.deck-slide-view.active');
      const curSettings = getAnimationSettings();
      if (activeView) {
        activeView.classList.remove('slide-enter-down', 'slide-enter-up', 'zoom-enter', 'glitch-enter', 'crossfade-enter');
        void activeView.offsetWidth;
        if (curSettings.style === 'deck-slide') {
          activeView.classList.add('slide-enter-down');
        } else if (curSettings.style === 'page-zoom') {
          activeView.classList.add('zoom-enter');
        } else if (curSettings.style === 'cyber-glitch') {
          activeView.classList.add('glitch-enter');
        } else if (curSettings.style === 'crossfade') {
          activeView.classList.add('crossfade-enter');
        }
      }
      const currBtn = document.querySelector('.deck-nav-btn.active');
      if (currBtn && typeof updateDeckIndicator === 'function') {
        updateDeckIndicator(currBtn);
      }
    });
  }
}

/* ========================================================
   PERSONNALISATION DE LA BARRE LATÉRALE (DENSITÉ, COURBURE, FINITION)
   ======================================================== */
const defaultSidebarSettings = {
  density: 'normal',
  radius: 'normal',
  glass: 'deep'
};

function getSidebarSettings() {
  try {
    const raw = localStorage.getItem('startpage_sidebar_custom_settings');
    if (raw) return { ...defaultSidebarSettings, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultSidebarSettings };
}

function saveSidebarSettings(settings) {
  localStorage.setItem('startpage_sidebar_custom_settings', JSON.stringify(settings));
  applySidebarSettings(settings);
}

function applySidebarSettings(settings = getSidebarSettings()) {
  const sidebar = document.getElementById('dashboard-sidebar');
  if (!sidebar) return;

  const density = settings.density || 'normal';
  const radius = settings.radius || 'normal';
  const glass = settings.glass || 'deep';

  sidebar.classList.remove('sidebar-density-compact', 'sidebar-density-normal', 'sidebar-density-spacious');
  sidebar.classList.add(`sidebar-density-${density}`);

  sidebar.classList.remove('sidebar-radius-subtle', 'sidebar-radius-normal', 'sidebar-radius-pill');
  sidebar.classList.add(`sidebar-radius-${radius}`);

  sidebar.classList.remove('sidebar-glass-deep', 'sidebar-glass-crystal', 'sidebar-glass-opaque');
  sidebar.classList.add(`sidebar-glass-${glass}`);

  const densityBadge = document.getElementById('sidebar-density-badge');
  const radiusBadge = document.getElementById('sidebar-radius-badge');
  const glassBadge = document.getElementById('sidebar-glass-badge');

  const densityLabels = {
    compact: 'Compact (56px)',
    normal: 'Standard (68px)',
    spacious: 'Spacieux (82px)'
  };
  const radiusLabels = {
    subtle: 'Discret (12px)',
    normal: 'Moderne (20px)',
    pill: 'Pilule (28px)'
  };
  const glassLabels = {
    deep: 'Verre Teinté Sombre',
    crystal: 'Crystal Neo-Frost',
    opaque: 'Noir Mat Pur'
  };

  if (densityBadge) densityBadge.textContent = densityLabels[density] || density;
  if (radiusBadge) radiusBadge.textContent = radiusLabels[radius] || radius;
  if (glassBadge) glassBadge.textContent = glassLabels[glass] || glass;

  document.querySelectorAll('.sidebar-density-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.density === density);
  });
  document.querySelectorAll('.sidebar-radius-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.radius === radius);
  });
  document.querySelectorAll('.sidebar-glass-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.glass === glass);
  });

  const curr = document.querySelector('.deck-nav-btn.active');
  if (curr && typeof updateDeckIndicator === 'function') {
    setTimeout(() => updateDeckIndicator(curr), 60);
  }
}

function initSidebarCustomizationControls() {
  applySidebarSettings();

  document.querySelectorAll('.sidebar-density-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cur = getSidebarSettings();
      cur.density = btn.dataset.density;
      saveSidebarSettings(cur);
      if (typeof showToast === 'function') {
        const name = btn.querySelector('span')?.textContent || cur.density;
        showToast(`Taille Sidebar : ${name}`, 'info');
      }
    });
  });

  document.querySelectorAll('.sidebar-radius-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cur = getSidebarSettings();
      cur.radius = btn.dataset.radius;
      saveSidebarSettings(cur);
      if (typeof showToast === 'function') {
        const name = btn.querySelector('span')?.textContent || cur.radius;
        showToast(`Courbure : ${name}`, 'info');
      }
    });
  });

  document.querySelectorAll('.sidebar-glass-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cur = getSidebarSettings();
      cur.glass = btn.dataset.glass;
      saveSidebarSettings(cur);
      if (typeof showToast === 'function') {
        const name = btn.querySelector('span')?.textContent || cur.glass;
        showToast(`Finition Verre : ${name}`, 'info');
      }
    });
  });
}

function initCustomHub() {
  initAnimationHubControls();
  initSidebarCustomizationControls();
  initDeckViewSlider();
  initSidebarControls();

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
