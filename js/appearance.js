/**
 * appearance.js - Personnalisation esthétique & visuelle
 * - Sélecteur de couleur d'accentuation principale & secondaire avec palettes cyberpunk
 * - Contrôle de l'intensité et du flou de l'éclairage ambiant (Ambilight)
 * - Activation / Désactivation des scanlines rétro
 * - Aperçu en direct (Live Preview) interactif
 * - Persistance localStorage & synchronisation instantanée
 */

const defaultAppearance = {
  customAccent: null, // null = couleur par défaut du thème
  customAccentSecondary: null,
  wallpaperBlur: 55, // px
  wallpaperOpacity: 56, // %
  scanlines: true
};

let currentAppearance = structuredClone(defaultAppearance);

const CYBER_PALETTES = [
  { name: 'Kanagawa Cyan', primary: '#a8e6f0', secondary: '#7aa89f' },
  { name: 'Sakura Rose', primary: '#ff85c0', secondary: '#ffa39e' },
  { name: 'Cyberdeck Violet', primary: '#31e1f7', secondary: '#b55fe6' },
  { name: 'Matrix Emerald', primary: '#00ff66', secondary: '#00cc88' },
  { name: 'Tokyo Neon', primary: '#ff007f', secondary: '#00f0ff' },
  { name: 'Synthwave Amber', primary: '#ffb86c', secondary: '#ff79c6' },
  { name: 'Neon Glace', primary: '#80d0ff', secondary: '#bd93f9' },
  { name: 'Dracula Purple', primary: '#bd93f9', secondary: '#ff79c6' },
  { name: 'Solar Flare', primary: '#ff9100', secondary: '#ff1744' },
  { name: 'Deep Ocean', primary: '#00e5ff', secondary: '#2979ff' }
];

function hexToRgba(hex, alpha = 1) {
  if (!hex || !hex.startsWith('#')) return `rgba(49, 225, 247, ${alpha})`;
  let c = hex.substring(1);
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(49, 225, 247, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function loadAppearanceSettings() {
  try {
    const saved = localStorage.getItem('startpage_appearance');
    if (saved) {
      currentAppearance = { ...defaultAppearance, ...JSON.parse(saved) };
    }
  } catch {
    currentAppearance = structuredClone(defaultAppearance);
  }
}

function saveAppearanceSettings() {
  localStorage.setItem('startpage_appearance', JSON.stringify(currentAppearance));
  applyAppearance();
}

function applyAppearance() {
  const root = document.documentElement;
  const body = document.body;
  const scanlinesEl = document.querySelector('.bg-scanlines');
  const wallpaperEl = document.getElementById('bg-wallpaper');

  // Application directe sur body pour écraser les sélecteurs body[data-theme="X"]
  if (currentAppearance.customAccent) {
    body.style.setProperty('--accent-primary', currentAppearance.customAccent);
    root.style.setProperty('--accent-primary', currentAppearance.customAccent);
    body.style.setProperty('--border-highlight', hexToRgba(currentAppearance.customAccent, 0.48));
    body.style.setProperty('--orb-1', hexToRgba(currentAppearance.customAccent, 0.32));
  } else {
    body.style.removeProperty('--accent-primary');
    root.style.removeProperty('--accent-primary');
    body.style.removeProperty('--border-highlight');
    body.style.removeProperty('--orb-1');
  }

  if (currentAppearance.customAccentSecondary) {
    body.style.setProperty('--accent-secondary', currentAppearance.customAccentSecondary);
    root.style.setProperty('--accent-secondary', currentAppearance.customAccentSecondary);
    body.style.setProperty('--orb-2', hexToRgba(currentAppearance.customAccentSecondary, 0.28));
  } else {
    body.style.removeProperty('--accent-secondary');
    root.style.removeProperty('--accent-secondary');
    body.style.removeProperty('--orb-2');
  }

  // Scanlines
  if (scanlinesEl) {
    scanlinesEl.style.display = currentAppearance.scanlines !== false ? '' : 'none';
  }

  // Fond d'écran Ambilight
  if (wallpaperEl) {
    const blurVal = currentAppearance.wallpaperBlur ?? 55;
    const opacityVal = (currentAppearance.wallpaperOpacity ?? 56) / 100;
    wallpaperEl.style.filter = `blur(${blurVal}px) saturate(2.2) brightness(1.15)`;
    wallpaperEl.style.opacity = opacityVal;
  }

  updateAppearanceInputs();
  updateAppearanceLivePreview();
}

function updateAppearanceInputs() {
  const colorPrimaryInput = document.getElementById('appearance-primary-color');
  const colorSecondaryInput = document.getElementById('appearance-secondary-color');
  const blurSlider = document.getElementById('appearance-blur-slider');
  const blurValDisplay = document.getElementById('appearance-blur-val');
  const opacitySlider = document.getElementById('appearance-opacity-slider');
  const opacityValDisplay = document.getElementById('appearance-opacity-val');
  const scanlinesCheck = document.getElementById('appearance-scanlines-check');

  const computedPrimary = getComputedStyle(document.body).getPropertyValue('--accent-primary').trim() || '#31e1f7';
  const computedSecondary = getComputedStyle(document.body).getPropertyValue('--accent-secondary').trim() || '#b55fe6';

  if (colorPrimaryInput) colorPrimaryInput.value = currentAppearance.customAccent || computedPrimary;
  if (colorSecondaryInput) colorSecondaryInput.value = currentAppearance.customAccentSecondary || computedSecondary;

  if (blurSlider) {
    blurSlider.value = currentAppearance.wallpaperBlur ?? 55;
    if (blurValDisplay) blurValDisplay.textContent = `${blurSlider.value}px`;
  }

  if (opacitySlider) {
    opacitySlider.value = currentAppearance.wallpaperOpacity ?? 56;
    if (opacityValDisplay) opacityValDisplay.textContent = `${opacitySlider.value}%`;
  }

  if (scanlinesCheck) {
    scanlinesCheck.checked = currentAppearance.scanlines !== false;
  }

  // Mettre à jour l'état actif sur les boutons de palettes
  document.querySelectorAll('.palette-swatch-btn').forEach((btn) => {
    const isMatch =
      btn.dataset.primary.toLowerCase() === (currentAppearance.customAccent || '').toLowerCase() &&
      btn.dataset.secondary.toLowerCase() === (currentAppearance.customAccentSecondary || '').toLowerCase();
    btn.classList.toggle('active', isMatch);
  });
}

function updateAppearanceLivePreview() {
  const preview = document.getElementById('appearance-live-preview');
  if (!preview) return;

  const computedPrimary = getComputedStyle(document.body).getPropertyValue('--accent-primary').trim() || '#31e1f7';
  const computedSecondary = getComputedStyle(document.body).getPropertyValue('--accent-secondary').trim() || '#b55fe6';

  const primary = currentAppearance.customAccent || computedPrimary;
  const secondary = currentAppearance.customAccentSecondary || computedSecondary;

  preview.style.setProperty('--preview-accent-primary', primary);
  preview.style.setProperty('--preview-accent-secondary', secondary);
  preview.style.setProperty('--preview-border-highlight', hexToRgba(primary, 0.5));

  // Tag du thème actif
  const themeTag = document.getElementById('preview-active-theme-tag');
  const activeThemeId = document.body.getAttribute('data-theme') || '1';
  let themeName = 'Kanagawa';
  if (activeThemeId === '2') themeName = 'Sakura';
  if (activeThemeId === '3') themeName = 'Cyberdeck';

  if (themeTag) {
    if (currentAppearance.customAccent) {
      themeTag.textContent = `${themeName} • Accent personnalisé (${primary})`;
    } else {
      themeTag.textContent = `${themeName} • Couleurs d'origine`;
    }
  }

  // Image et badge du mockup
  const bannerArt = document.getElementById('preview-banner-art');
  const badgeName = document.getElementById('preview-badge-name');
  if (bannerArt) {
    let gifImg = 'images/gif.gif';
    let badgeText = '修理 // KANAGAWA';
    if (activeThemeId === '2') {
      gifImg = 'images/gif2.gif';
      badgeText = '桜 // SAKURA';
    } else if (activeThemeId === '3') {
      gifImg = 'images/gif3.gif';
      badgeText = '電脳 // CYBERDECK';
    }
    bannerArt.style.backgroundImage = `url("${gifImg}")`;
    if (badgeName) badgeName.textContent = badgeText;
  }
}

function renderPalettesList() {
  const paletteContainer = document.getElementById('appearance-palettes-list');
  if (!paletteContainer) return;

  paletteContainer.innerHTML = CYBER_PALETTES.map((p) => `
    <button type="button" class="palette-swatch-btn" data-primary="${p.primary}" data-secondary="${p.secondary}" title="${p.name}">
      <span class="swatch-half" style="background: ${p.primary};"></span>
      <span class="swatch-half" style="background: ${p.secondary};"></span>
      <span class="swatch-name-label">${p.name}</span>
    </button>
  `).join('');

  paletteContainer.querySelectorAll('.palette-swatch-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const prim = btn.dataset.primary;
      const sec = btn.dataset.secondary;
      currentAppearance.customAccent = prim;
      currentAppearance.customAccentSecondary = sec;
      saveAppearanceSettings();
      if (typeof showToast === 'function') {
        showToast(`Palette "${btn.title}" appliquée en direct !`, 'success');
      }
    });
  });
}

function initAppearance() {
  loadAppearanceSettings();
  renderPalettesList();
  applyAppearance();

  const resetBtn = document.getElementById('appearance-reset-btn');
  const colorPrimaryInput = document.getElementById('appearance-primary-color');
  const colorSecondaryInput = document.getElementById('appearance-secondary-color');
  const blurSlider = document.getElementById('appearance-blur-slider');
  const blurValDisplay = document.getElementById('appearance-blur-val');
  const opacitySlider = document.getElementById('appearance-opacity-slider');
  const opacityValDisplay = document.getElementById('appearance-opacity-val');
  const scanlinesCheck = document.getElementById('appearance-scanlines-check');

  if (colorPrimaryInput) {
    colorPrimaryInput.addEventListener('input', () => {
      currentAppearance.customAccent = colorPrimaryInput.value;
      saveAppearanceSettings();
    });
  }

  if (colorSecondaryInput) {
    colorSecondaryInput.addEventListener('input', () => {
      currentAppearance.customAccentSecondary = colorSecondaryInput.value;
      saveAppearanceSettings();
    });
  }

  if (blurSlider) {
    blurSlider.addEventListener('input', () => {
      currentAppearance.wallpaperBlur = Number(blurSlider.value);
      if (blurValDisplay) blurValDisplay.textContent = `${blurSlider.value}px`;
      saveAppearanceSettings();
    });
  }

  if (opacitySlider) {
    opacitySlider.addEventListener('input', () => {
      currentAppearance.wallpaperOpacity = Number(opacitySlider.value);
      if (opacityValDisplay) opacityValDisplay.textContent = `${opacitySlider.value}%`;
      saveAppearanceSettings();
    });
  }

  if (scanlinesCheck) {
    scanlinesCheck.addEventListener('change', () => {
      currentAppearance.scanlines = scanlinesCheck.checked;
      saveAppearanceSettings();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentAppearance = structuredClone(defaultAppearance);
      saveAppearanceSettings();
      if (typeof showToast === 'function') {
        showToast('Apparence restaurée par défaut', 'info');
      }
    });
  }
}
