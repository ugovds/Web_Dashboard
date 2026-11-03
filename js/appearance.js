/**
 * appearance.js - Personnalisation esthétique & visuelle
 * - Sélecteur de couleur d'accentuation principale & secondaire avec palettes cyberpunk
 * - Contrôle de l'intensité et du flou de l'éclairage ambiant (Ambilight)
 * - Activation / Désactivation des scanlines rétro
 * - Persistance localStorage & Export/Import JSON
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
  { name: 'Synthwave Amber', primary: '#ffb86c', secondary: '#ff79c6' },
  { name: 'Neon Glace', primary: '#80d0ff', secondary: '#bd93f9' }
];

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
  const scanlinesEl = document.querySelector('.bg-scanlines');
  const wallpaperEl = document.getElementById('bg-wallpaper');

  // Couleur d'accentuation
  if (currentAppearance.customAccent) {
    root.style.setProperty('--accent-primary', currentAppearance.customAccent);
  } else {
    root.style.removeProperty('--accent-primary');
  }

  if (currentAppearance.customAccentSecondary) {
    root.style.setProperty('--accent-secondary', currentAppearance.customAccentSecondary);
  } else {
    root.style.removeProperty('--accent-secondary');
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
}

function openAppearanceModal() {
  const modal = document.getElementById('appearance-modal');
  if (!modal) return;

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

  modal.hidden = false;
}

function closeAppearanceModal() {
  const modal = document.getElementById('appearance-modal');
  if (modal) modal.hidden = true;
}

function initAppearance() {
  loadAppearanceSettings();
  applyAppearance();

  const openBtn = document.getElementById('btn-manage-appearance');
  const closeBtn = document.getElementById('appearance-modal-close');
  const modal = document.getElementById('appearance-modal');
  const resetBtn = document.getElementById('appearance-reset-btn');

  const colorPrimaryInput = document.getElementById('appearance-primary-color');
  const colorSecondaryInput = document.getElementById('appearance-secondary-color');
  const blurSlider = document.getElementById('appearance-blur-slider');
  const blurValDisplay = document.getElementById('appearance-blur-val');
  const opacitySlider = document.getElementById('appearance-opacity-slider');
  const opacityValDisplay = document.getElementById('appearance-opacity-val');
  const scanlinesCheck = document.getElementById('appearance-scanlines-check');

  if (openBtn) openBtn.addEventListener('click', openAppearanceModal);
  if (closeBtn) closeBtn.addEventListener('click', closeAppearanceModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAppearanceModal();
    });
  }

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

  // Palettes rapides
  const paletteContainer = document.getElementById('appearance-palettes-list');
  if (paletteContainer) {
    paletteContainer.innerHTML = CYBER_PALETTES.map((p) => `
      <button type="button" class="palette-swatch-btn" data-primary="${p.primary}" data-secondary="${p.secondary}" title="${p.name}">
        <span class="swatch-half" style="background: ${p.primary};"></span>
        <span class="swatch-half" style="background: ${p.secondary};"></span>
      </button>
    `).join('');

    paletteContainer.querySelectorAll('.palette-swatch-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const prim = btn.dataset.primary;
        const sec = btn.dataset.secondary;
        currentAppearance.customAccent = prim;
        currentAppearance.customAccentSecondary = sec;
        if (colorPrimaryInput) colorPrimaryInput.value = prim;
        if (colorSecondaryInput) colorSecondaryInput.value = sec;
        saveAppearanceSettings();
        if (typeof showToast === 'function') {
          showToast(`Palette "${btn.title}" appliquée !`, 'info');
        }
      });
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentAppearance = structuredClone(defaultAppearance);
      saveAppearanceSettings();
      openAppearanceModal(); // Rafraîchit les inputs
      if (typeof showToast === 'function') {
        showToast('Apparence restaurée par défaut', 'info');
      }
    });
  }
}

