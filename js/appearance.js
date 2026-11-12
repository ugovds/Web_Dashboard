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
  scanlines: true,
  dimMode: false
};

let currentAppearance = structuredClone(defaultAppearance);

const CYBER_PALETTES = [
  { name: 'Kanagawa Cyan', primary: '#a8e6f0', secondary: '#7aa89f' },
  { name: 'Sakura Rose', primary: '#ff85c0', secondary: '#ffa39e' },
  { name: 'Cyberdeck Violet', primary: '#31e1f7', secondary: '#b55fe6' },
  { name: 'Retro Wave Monochrome', primary: '#e2ebf5', secondary: '#8295a8' },
  { name: 'Liquid Glass Violet', primary: '#b55fe6', secondary: '#8b5cf6' },
  { name: 'Liquid Glass Saphir', primary: '#38bdf8', secondary: '#2563eb' },
  { name: 'Liquid Glass Émeraude', primary: '#34d399', secondary: '#059669' },
  { name: 'Liquid Glass Crystal', primary: '#ffffff', secondary: '#94a3b8' },
  { name: 'Liquid Glass Rubis', primary: '#f43f5e', secondary: '#e11d48' },
  { name: 'Liquid Glass Ambre', primary: '#fbbf24', secondary: '#d97706' },
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

let appearanceSaveDebounceTimer = null;

function saveAppearanceSettings() {
  clearTimeout(appearanceSaveDebounceTimer);
  localStorage.setItem('startpage_appearance', JSON.stringify(currentAppearance));
  applyAppearance();
}

function debouncedSaveAppearanceSettings() {
  applyAppearance();
  clearTimeout(appearanceSaveDebounceTimer);
  appearanceSaveDebounceTimer = setTimeout(() => {
    localStorage.setItem('startpage_appearance', JSON.stringify(currentAppearance));
  }, 120);
}

function applyAppearance() {
  const root = document.documentElement;
  const body = document.body;
  const scanlinesEl = document.querySelector('.bg-scanlines');
  const wallpaperEl = document.getElementById('bg-wallpaper');

  // Application directe sur body pour écraser les sélecteurs body[data-theme="X"]
  // En Thème 5 (Liquid Glass Pur Transparent), préserver la neutralité cristalline pure
  const isLiquidGlass = (typeof currentTheme !== 'undefined' && currentTheme === '5') || body.getAttribute('data-theme') === '5';

  if (!isLiquidGlass && currentAppearance.customAccent) {
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

  if (!isLiquidGlass && currentAppearance.customAccentSecondary) {
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

  // Mode Nuit / Atténuation HUD
  if (currentAppearance.dimMode) {
    body.classList.add('dim-mode');
  } else {
    body.classList.remove('dim-mode');
  }

  // Fond d'écran Ambilight
  if (wallpaperEl) {
    if (isLiquidGlass) {
      wallpaperEl.style.filter = 'blur(24px) grayscale(0.7) brightness(1.04)';
      wallpaperEl.style.opacity = '0.35';
    } else {
      const blurVal = currentAppearance.wallpaperBlur ?? 55;
      const opacityVal = (currentAppearance.wallpaperOpacity ?? 56) / 100;
      wallpaperEl.style.filter = `blur(${blurVal}px) saturate(2.2) brightness(1.15)`;
      wallpaperEl.style.opacity = opacityVal;
    }
  }

  // Mettre à jour l'aperçu et les inputs uniquement si l'onglet configuration est affiché
  const appearanceTab = document.getElementById('hub-tab-appearance');
  if (appearanceTab && !appearanceTab.hidden) {
    updateAppearanceInputs();
    updateAppearanceLivePreview();
  }
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

  const dimCheck = document.getElementById('appearance-dim-check');
  if (dimCheck) {
    dimCheck.checked = currentAppearance.dimMode === true;
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
  const cfg = (typeof themesConfig !== 'undefined' && themesConfig[activeThemeId]) ? themesConfig[activeThemeId] : null;
  const themeName = cfg ? cfg.name : (activeThemeId === '2' ? 'Sakura' : (activeThemeId === '3' ? 'Cyberdeck' : (activeThemeId === '4' ? 'Retro Wave' : (activeThemeId === '5' ? 'Liquid Glass' : 'Kanagawa'))));

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
    const gifImg = cfg ? cfg.img : 'images/gif.gif';
    const badgeText = cfg ? cfg.badge : '修理 // KANAGAWA';
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

function toggleDimMode() {
  currentAppearance.dimMode = !currentAppearance.dimMode;
  saveAppearanceSettings();
  if (typeof showToast === 'function') {
    showToast(currentAppearance.dimMode ? 'Mode Nuit / Atténuation HUD activé' : 'Mode Nuit désactivé', 'info');
  }
}

function getUserCustomThemes() {
  try {
    const raw = localStorage.getItem('startpage_user_custom_themes');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveUserCustomThemes(themes) {
  localStorage.setItem('startpage_user_custom_themes', JSON.stringify(themes));
  renderUserCustomThemes();
}

function renderUserCustomThemes() {
  const container = document.getElementById('appearance-custom-themes-list');
  if (!container) return;

  const themes = getUserCustomThemes();
  if (themes.length === 0) {
    container.innerHTML = '<span class="fav-empty-hint">Aucun thème personnalisé créé pour le moment.</span>';
    return;
  }

  container.innerHTML = themes
    .map((t, idx) => `
      <div class="custom-theme-chip" data-theme-idx="${idx}" title="Appliquer ${escapeHtml(t.name)}">
        <span class="custom-theme-dot" style="background:${t.primary};"></span>
        <span class="custom-theme-dot" style="background:${t.secondary};"></span>
        <span>${escapeHtml(t.name)}</span>
        <button type="button" class="custom-theme-chip-delete" data-del-theme="${idx}" title="Supprimer ce thème">&times;</button>
      </div>
    `)
    .join('');
}

function initAppearance() {
  loadAppearanceSettings();
  applyAppearance();

  const resetBtn = document.getElementById('appearance-reset-btn');
  const colorPrimaryInput = document.getElementById('appearance-primary-color');
  const colorSecondaryInput = document.getElementById('appearance-secondary-color');
  const blurSlider = document.getElementById('appearance-blur-slider');
  const blurValDisplay = document.getElementById('appearance-blur-val');
  const opacitySlider = document.getElementById('appearance-opacity-slider');
  const opacityValDisplay = document.getElementById('appearance-opacity-val');
  const scanlinesCheck = document.getElementById('appearance-scanlines-check');
  const dimCheck = document.getElementById('appearance-dim-check');
  const customThemeForm = document.getElementById('custom-theme-create-form');
  const customThemeNameInput = document.getElementById('custom-theme-name-input');
  const customThemesContainer = document.getElementById('appearance-custom-themes-list');

  if (dimCheck) {
    dimCheck.addEventListener('change', () => {
      currentAppearance.dimMode = dimCheck.checked;
      saveAppearanceSettings();
      if (typeof showToast === 'function') {
        showToast(currentAppearance.dimMode ? 'Mode Nuit activé' : 'Mode Nuit désactivé', 'info');
      }
    });
  }

  // Utilisation du debounce de sauvegarde pour optimiser les performances de saisie
  if (colorPrimaryInput) {
    colorPrimaryInput.addEventListener('input', () => {
      currentAppearance.customAccent = colorPrimaryInput.value;
      debouncedSaveAppearanceSettings();
    });
  }

  if (colorSecondaryInput) {
    colorSecondaryInput.addEventListener('input', () => {
      currentAppearance.customAccentSecondary = colorSecondaryInput.value;
      debouncedSaveAppearanceSettings();
    });
  }

  if (blurSlider) {
    blurSlider.addEventListener('input', () => {
      currentAppearance.wallpaperBlur = Number(blurSlider.value);
      if (blurValDisplay) blurValDisplay.textContent = `${blurSlider.value}px`;
      debouncedSaveAppearanceSettings();
    });
  }

  if (opacitySlider) {
    opacitySlider.addEventListener('input', () => {
      currentAppearance.wallpaperOpacity = Number(opacitySlider.value);
      if (opacityValDisplay) opacityValDisplay.textContent = `${opacitySlider.value}%`;
      debouncedSaveAppearanceSettings();
    });
  }

  if (scanlinesCheck) {
    scanlinesCheck.addEventListener('change', () => {
      currentAppearance.scanlines = scanlinesCheck.checked;
      saveAppearanceSettings();
    });
  }

  // Enregistrement d'un thème utilisateur complet
  if (customThemeForm && customThemeNameInput) {
    customThemeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = customThemeNameInput.value.trim();
      if (!name) return;

      const computedPrimary = getComputedStyle(document.body).getPropertyValue('--accent-primary').trim() || '#31e1f7';
      const computedSecondary = getComputedStyle(document.body).getPropertyValue('--accent-secondary').trim() || '#b55fe6';

      const themes = getUserCustomThemes();
      themes.push({
        name,
        primary: currentAppearance.customAccent || computedPrimary,
        secondary: currentAppearance.customAccentSecondary || computedSecondary,
        blur: currentAppearance.wallpaperBlur,
        opacity: currentAppearance.wallpaperOpacity
      });

      saveUserCustomThemes(themes);
      customThemeNameInput.value = '';
      if (typeof showToast === 'function') {
        showToast(`Thème personnalisé "${name}" enregistré !`, 'success');
      }
    });
  }

  // Application / suppression d'un thème personnalisé
  if (customThemesContainer) {
    customThemesContainer.addEventListener('click', (e) => {
      const delBtn = e.target.closest('[data-del-theme]');
      if (delBtn) {
        e.stopPropagation();
        const idx = Number(delBtn.dataset.delTheme);
        const themes = getUserCustomThemes();
        const removed = themes.splice(idx, 1)[0];
        saveUserCustomThemes(themes);
        if (typeof showToast === 'function') {
          showToast(`Thème "${removed?.name}" supprimé`, 'info');
        }
        return;
      }

      const chip = e.target.closest('[data-theme-idx]');
      if (chip) {
        const idx = Number(chip.dataset.themeIdx);
        const themes = getUserCustomThemes();
        const t = themes[idx];
        if (t) {
          currentAppearance.customAccent = t.primary;
          currentAppearance.customAccentSecondary = t.secondary;
          if (typeof t.blur === 'number') currentAppearance.wallpaperBlur = t.blur;
          if (typeof t.opacity === 'number') currentAppearance.wallpaperOpacity = t.opacity;
          saveAppearanceSettings();
          if (typeof showToast === 'function') {
            showToast(`Thème personnalisé "${t.name}" appliqué !`, 'success');
          }
        }
      }
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
