/**
 * themes.js - Gestion des 5 thèmes visuels (Kanagawa, Sakura, Cyberdeck, Retro Wave, Liquid Glass)
 * et du système Ambilight avec variantes de contraste Liquid Glass Apple.
 */

const GLASS_VARIANTS = {
  violet: {
    id: 'violet',
    name: 'Glass Violet',
    title: 'Violet Améthyste',
    primary: '#b55fe6',
    secondary: '#8b5cf6',
    badge: '紫 // AMÉTHYSTE',
    desc: 'Améthyste & Mauve Liquide'
  },
  bleu: {
    id: 'bleu',
    name: 'Glass Bleu',
    title: 'Bleu Saphir Apple',
    primary: '#38bdf8',
    secondary: '#2563eb',
    badge: '蒼 // SAPHIR AZURE',
    desc: 'Saphir Apple & Azure'
  },
  vert: {
    id: 'vert',
    name: 'Glass Vert',
    title: 'Vert Émeraude',
    primary: '#34d399',
    secondary: '#059669',
    badge: '翠 // ÉMERAUDE MINT',
    desc: 'Émeraude & Mint Liquide'
  },
  transparent: {
    id: 'transparent',
    name: 'Glass Transparent',
    title: 'Crystal Pur VisionOS',
    primary: '#f8fafc',
    secondary: '#94a3b8',
    badge: '透 // PURE CRYSTAL',
    desc: 'Pur Crystal VisionOS'
  },
  rouge: {
    id: 'rouge',
    name: 'Glass Rouge',
    title: 'Rouge Rubis',
    primary: '#f43f5e',
    secondary: '#e11d48',
    badge: '紅 // RUBIS SUNSET',
    desc: 'Rubis Liquide & Sunset'
  },
  ambre: {
    id: 'ambre',
    name: 'Glass Ambre',
    title: 'Ambre Doré',
    primary: '#fbbf24',
    secondary: '#d97706',
    badge: '琥 // AMBRE CHAMPAGNE',
    desc: 'Or & Miel Champagne'
  },
  cyan: {
    id: 'cyan',
    name: 'Glass Cyan',
    title: 'Cyan Lagon',
    primary: '#22d3ee',
    secondary: '#0891b2',
    badge: '碧 // LAGON GLACÉ',
    desc: 'Lagon Glacé & Cyan'
  },
  rose: {
    id: 'rose',
    name: 'Glass Rose',
    title: 'Rose Quartz Néon',
    primary: '#f472b6',
    secondary: '#c026d3',
    badge: '桃 // QUARTZ NÉON',
    desc: 'Quartz Néon Liquide'
  }
};

const themesConfig = {
  '1': {
    name: 'Kanagawa',
    img: 'images/gif.gif',
    badge: '修理 // KANAGAWA',
    accent: '#a8e6f0'
  },
  '2': {
    name: 'Sakura',
    img: 'images/gif2.gif',
    badge: '桜 // SAKURA',
    accent: '#ff85c0'
  },
  '3': {
    name: 'Cyberdeck',
    img: 'images/gif3.gif',
    badge: '電脳 // CYBERDECK',
    accent: '#31e1f7'
  },
  '4': {
    name: 'Retro Wave',
    img: 'images/gif4.gif',
    badge: '浪裏 // RETRO WAVE',
    accent: '#e2ebf5'
  },
  '5': {
    name: 'Liquid Glass',
    img: 'images/glass.svg',
    badge: '水晶 // LIQUID GLASS',
    accent: '#b55fe6'
  }
};

let currentTheme = '4';

function getCurrentGlassTint() {
  const saved = localStorage.getItem('startpage_glass_tint');
  return (saved && GLASS_VARIANTS[saved]) ? saved : 'violet';
}

function applyGlassTint(tintKey, notify = false) {
  if (!GLASS_VARIANTS[tintKey]) tintKey = 'violet';

  const variant = GLASS_VARIANTS[tintKey];
  document.body.setAttribute('data-glass-tint', tintKey);
  localStorage.setItem('startpage_glass_tint', tintKey);

  // Mettre à jour l'accent dans themesConfig['5']
  if (themesConfig['5']) {
    themesConfig['5'].accent = variant.primary;
  }

  // Mettre à jour le badge de variante dans la topbar
  const quickTintLabel = document.getElementById('glass-quick-tint-label');
  if (quickTintLabel) {
    quickTintLabel.textContent = variant.name;
  }

  // Mettre à jour le badge dans la section du Hub
  const activeBadge = document.getElementById('active-glass-variant-badge');
  if (activeBadge) {
    activeBadge.textContent = variant.name;
    activeBadge.style.borderColor = variant.primary;
    activeBadge.style.color = variant.primary;
  }

  // Mettre à jour les boutons actifs de variante dans le Hub
  document.querySelectorAll('.glass-variant-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.glassVariant === tintKey);
  });

  // Mettre à jour le sous-titre de l'art-badge quand Liquid Glass est actif
  if (currentTheme === '5') {
    const artBadgeText = document.getElementById('art-badge-text');
    if (artBadgeText) {
      artBadgeText.textContent = `LIQUID GLASS // ${variant.name.toUpperCase()}`;
    }
  }

  if (notify && typeof showToast === 'function') {
    showToast(`Nuance Liquid Glass : ${variant.name} (${variant.desc}) activée !`, 'success');
  }

  if (typeof applyAppearance === 'function') {
    applyAppearance();
  }
}

function cycleGlassTint() {
  if (currentTheme !== '5') {
    applyTheme('5');
    return;
  }
  const keys = Object.keys(GLASS_VARIANTS);
  const current = getCurrentGlassTint();
  const next = keys[(keys.indexOf(current) + 1) % keys.length];
  applyGlassTint(next, true);
}

function updateGlassUIState(themeId) {
  const isGlass = themeId === '5';
  const variantsSection = document.getElementById('glass-variants-section');
  if (variantsSection) {
    variantsSection.classList.toggle('is-hidden', !isGlass);
  }

  const quickTintBtn = document.getElementById('glass-quick-tint-btn');
  if (quickTintBtn) {
    quickTintBtn.style.display = isGlass ? 'inline-flex' : 'none';
  }
}

function applyTheme(themeId) {
  const cfg = themesConfig[themeId];
  if (!cfg) return;

  currentTheme = themeId;
  document.body.setAttribute('data-theme', themeId);

  const mainArtImg = document.getElementById('main-art');
  const bgWallpaperEl = document.getElementById('bg-wallpaper');
  const artBadgeText = document.getElementById('art-badge-text');

  if (mainArtImg) mainArtImg.src = cfg.img;
  if (bgWallpaperEl) bgWallpaperEl.style.backgroundImage = `url("${cfg.img}")`;
  if (artBadgeText) {
    if (themeId === '5') {
      const tint = getCurrentGlassTint();
      const variant = GLASS_VARIANTS[tint] || GLASS_VARIANTS.violet;
      artBadgeText.textContent = `LIQUID GLASS // ${variant.name.toUpperCase()}`;
    } else {
      artBadgeText.textContent = cfg.badge;
    }
  }

  const topbarThemeText = document.getElementById('topbar-theme-text');
  if (topbarThemeText) topbarThemeText.textContent = cfg.name || cfg.badge.replace(/^.*?\/\/\s*/, '');

  const themeBtns = document.querySelectorAll('.theme-btn');
  themeBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.themeBtn === themeId);
  });

  const hubThemeBtns = document.querySelectorAll('.hub-theme-card-btn');
  hubThemeBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.hubTheme === themeId);
  });

  // Gestion spécifique de Liquid Glass
  if (themeId === '5') {
    const tint = getCurrentGlassTint();
    applyGlassTint(tint, false);
  }

  updateGlassUIState(themeId);
  localStorage.setItem('startpage_theme', themeId);

  if (typeof applyAppearance === 'function') {
    applyAppearance();
  }
}

function initGlassInteractions() {
  // Clic sur le bouton de changement rapide de variante dans la topbar
  const quickTintBtn = document.getElementById('glass-quick-tint-btn');
  if (quickTintBtn) {
    quickTintBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      cycleGlassTint();
    });
  }

  // Écouteurs sur les boutons de variantes dans le modal Hub
  document.querySelectorAll('.glass-variant-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const variantKey = btn.dataset.glassVariant;
      if (currentTheme !== '5') {
        applyTheme('5');
      }
      applyGlassTint(variantKey, true);
    });
  });

  // Effet d'ondulation liquide interactive au clic sur les éléments en verre (Liquid Glass)
  document.addEventListener('pointerdown', (e) => {
    if (currentTheme !== '5') return;

    const glassEl = e.target.closest(
      '.dash-card, .dash-hero-card, .dash-kpi-card, .unified-deck-card, .category-card, .deck-nav-btn'
    );
    if (!glassEl) return;

    const rect = glassEl.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'glass-click-ripple';
    const size = Math.max(rect.width, rect.height) * 1.5;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    glassEl.appendChild(ripple);
    setTimeout(() => {
      ripple.remove();
    }, 650);
  });
}

function initThemes() {
  const urlParam = new URLSearchParams(window.location.search).get('theme');
  const saved = (urlParam && themesConfig[urlParam]) ? urlParam : (localStorage.getItem('startpage_theme') || '4');
  currentTheme = themesConfig[saved] ? saved : '1';

  const themeBtns = document.querySelectorAll('.theme-btn');
  themeBtns.forEach((btn) => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.themeBtn));
  });

  applyTheme(currentTheme);
  initGlassInteractions();
}
