/**
 * clock.js - Horloge numérique dynamique & personnalisation avancée
 * - Polices néon : JetBrains Mono, Orbitron, Share Tech Mono, VT323, Inter
 * - Styles de cadre : Pilule Verre, Crochets Cyber [ ], Lueur Intense, Digital LCD, Minimaliste
 * - Options : 24h/12h, secondes, date, formats de date (texte, numérique, iso), tailles
 * - Aperçu en direct dans le Centre de Personnalisation
 */

const defaultClockSettings = {
  font: 'jetbrains', // 'jetbrains', 'orbitron', 'share-tech', 'vt323', 'inter'
  style: 'pill', // 'pill', 'brackets', 'glow', 'digital', 'minimal'
  format24h: true,
  showSeconds: true,
  showDate: true,
  dateFormat: 'text', // 'text', 'numeric', 'iso'
  size: 'medium' // 'small', 'medium', 'large'
};

let currentClockSettings = structuredClone(defaultClockSettings);

function loadClockSettings() {
  try {
    const saved = localStorage.getItem('startpage_clock_settings');
    if (saved) {
      currentClockSettings = { ...defaultClockSettings, ...JSON.parse(saved) };
    }
  } catch {
    currentClockSettings = structuredClone(defaultClockSettings);
  }
}

function saveClockSettings() {
  localStorage.setItem('startpage_clock_settings', JSON.stringify(currentClockSettings));
  applyClockSettings();
  updateClock();
}

function applyClockSettings() {
  const clockWraps = [
    document.querySelector('.topbar-center .clock-display-wrap'),
    document.getElementById('clock-preview-wrap')
  ];

  clockWraps.forEach((wrap) => {
    if (!wrap) return;

    // Réinitialiser les classes dynamiques
    wrap.classList.remove(
      'font-jetbrains', 'font-orbitron', 'font-share-tech', 'font-vt323', 'font-inter',
      'clock-style-pill', 'clock-style-brackets', 'clock-style-glow', 'clock-style-digital', 'clock-style-minimal',
      'clock-size-small', 'clock-size-medium', 'clock-size-large'
    );

    wrap.classList.add(`font-${currentClockSettings.font || 'jetbrains'}`);
    wrap.classList.add(`clock-style-${currentClockSettings.style || 'pill'}`);
    wrap.classList.add(`clock-size-${currentClockSettings.size || 'medium'}`);
  });

  // Mettre à jour les contrôles de l'onglet Horloge
  updateClockControlsUI();
}

function updateClockControlsUI() {
  // Polices actives
  document.querySelectorAll('.clock-font-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.clockFont === currentClockSettings.font);
  });

  // Styles actifs
  document.querySelectorAll('.clock-style-card-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.clockStyle === currentClockSettings.style);
  });

  // Toggles & Selects
  const opt24h = document.getElementById('clock-opt-24h');
  const optSeconds = document.getElementById('clock-opt-seconds');
  const optDate = document.getElementById('clock-opt-date');
  const selectDateFormat = document.getElementById('clock-date-format-select');
  const selectSize = document.getElementById('clock-size-select');

  if (opt24h) opt24h.checked = currentClockSettings.format24h !== false;
  if (optSeconds) optSeconds.checked = currentClockSettings.showSeconds !== false;
  if (optDate) optDate.checked = currentClockSettings.showDate !== false;
  if (selectDateFormat) selectDateFormat.value = currentClockSettings.dateFormat || 'text';
  if (selectSize) selectSize.value = currentClockSettings.size || 'medium';
}

function formatTimeString(now, settings) {
  let hours = now.getHours();
  let ampm = '';

  if (!settings.format24h) {
    ampm = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12 || 12;
  }

  const h = String(hours).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');

  if (settings.showSeconds !== false) {
    const s = String(now.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}${ampm}`;
  }

  return `${h}:${m}${ampm}`;
}

function formatDateString(now, settings) {
  if (settings.showDate === false) return '';

  const format = settings.dateFormat || 'text';

  if (format === 'numeric') {
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return `${d}/${m}/${y}`;
  }

  if (format === 'iso') {
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return `${y}-${m}-${d}`;
  }

  // Format texte français
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  return now.toLocaleDateString('fr-FR', options);
}

function updateClock() {
  const now = new Date();
  const timeStr = formatTimeString(now, currentClockSettings);
  const dateStr = formatDateString(now, currentClockSettings);

  // Éléments réels dans la topbar
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  const sepEl = document.querySelector('.topbar-center .clock-sep');

  if (timeEl) timeEl.textContent = timeStr;

  if (dateEl) {
    if (currentClockSettings.showDate !== false && dateStr) {
      dateEl.textContent = dateStr;
      dateEl.style.display = '';
      if (sepEl) sepEl.style.display = '';
    } else {
      dateEl.style.display = 'none';
      if (sepEl) sepEl.style.display = 'none';
    }
  }

  // Éléments de l'aperçu dans le Centre de Personnalisation
  const previewTimeEl = document.getElementById('clock-preview-time');
  const previewDateEl = document.getElementById('clock-preview-date');
  const previewSepEl = document.querySelector('#clock-preview-wrap .clock-sep');

  if (previewTimeEl) previewTimeEl.textContent = timeStr;
  if (previewDateEl) {
    if (currentClockSettings.showDate !== false && dateStr) {
      previewDateEl.textContent = dateStr;
      previewDateEl.style.display = '';
      if (previewSepEl) previewSepEl.style.display = '';
    } else {
      previewDateEl.style.display = 'none';
      if (previewSepEl) previewSepEl.style.display = 'none';
    }
  }

  // Mockup dans l'aperçu du thème
  const mockTimeEl = document.getElementById('preview-mock-time');
  const mockDateEl = document.getElementById('preview-mock-date');
  if (mockTimeEl) mockTimeEl.textContent = timeStr;
  if (mockDateEl) mockDateEl.textContent = dateStr || '';
}

function initClock() {
  loadClockSettings();
  applyClockSettings();
  updateClock();
  setInterval(updateClock, 1000);

  // Écouteurs pour les polices
  document.querySelectorAll('.clock-font-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentClockSettings.font = btn.dataset.clockFont;
      saveClockSettings();
      if (typeof showToast === 'function') {
        showToast(`Police d'horloge : ${btn.querySelector('.font-name')?.textContent || btn.dataset.clockFont}`, 'info');
      }
    });
  });

  // Écouteurs pour les styles de cadre
  document.querySelectorAll('.clock-style-card-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentClockSettings.style = btn.dataset.clockStyle;
      saveClockSettings();
      if (typeof showToast === 'function') {
        showToast(`Style d'horloge : ${btn.querySelector('.style-title')?.textContent || btn.dataset.clockStyle}`, 'info');
      }
    });
  });

  // Options d'affichage
  const opt24h = document.getElementById('clock-opt-24h');
  const optSeconds = document.getElementById('clock-opt-seconds');
  const optDate = document.getElementById('clock-opt-date');
  const selectDateFormat = document.getElementById('clock-date-format-select');
  const selectSize = document.getElementById('clock-size-select');
  const resetBtn = document.getElementById('clock-reset-btn');

  if (opt24h) {
    opt24h.addEventListener('change', () => {
      currentClockSettings.format24h = opt24h.checked;
      saveClockSettings();
    });
  }

  if (optSeconds) {
    optSeconds.addEventListener('change', () => {
      currentClockSettings.showSeconds = optSeconds.checked;
      saveClockSettings();
    });
  }

  if (optDate) {
    optDate.addEventListener('change', () => {
      currentClockSettings.showDate = optDate.checked;
      saveClockSettings();
    });
  }

  if (selectDateFormat) {
    selectDateFormat.addEventListener('change', () => {
      currentClockSettings.dateFormat = selectDateFormat.value;
      saveClockSettings();
    });
  }

  if (selectSize) {
    selectSize.addEventListener('change', () => {
      currentClockSettings.size = selectSize.value;
      saveClockSettings();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentClockSettings = structuredClone(defaultClockSettings);
      saveClockSettings();
      if (typeof showToast === 'function') {
        showToast('Horloge restaurée par défaut', 'info');
      }
    });
  }
}
