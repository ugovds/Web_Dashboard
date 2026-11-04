/**
 * clock.js - Horloge numérique cyberdeck dans la colonne gauche & personnalisation avancée
 * - Polices néon : JetBrains Mono, Orbitron, Share Tech Mono, VT323, Inter
 * - Styles de cadre : Pilule Verre, Crochets Cyber [ ], Lueur Intense, Digital LCD, Minimaliste, HUD Cyberdeck
 * - Options : 24h/12h, secondes, date, progression du jour (%), numéro de semaine, fuseaux horaires, formats & tailles
 * - Synchronisation en temps réel avec le panneau gauche et l'onglet de configuration
 */

const defaultClockSettings = {
  font: 'jetbrains', // 'jetbrains', 'orbitron', 'share-tech', 'vt323', 'inter'
  style: 'pill', // 'pill', 'brackets', 'glow', 'digital', 'minimal', 'hud'
  format24h: true,
  showSeconds: true,
  showDate: true,
  showProgress: true,
  showWeek: true,
  dateFormat: 'text', // 'text', 'numeric', 'iso'
  timezone: 'local', // 'local', 'tokyo', 'ny', 'london', 'utc'
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
    document.getElementById('left-clock-card'),
    document.getElementById('clock-preview-wrap')
  ];

  clockWraps.forEach((wrap) => {
    if (!wrap) return;

    // Réinitialiser les classes dynamiques
    wrap.classList.remove(
      'font-jetbrains', 'font-orbitron', 'font-share-tech', 'font-vt323', 'font-inter',
      'clock-style-pill', 'clock-style-brackets', 'clock-style-glow', 'clock-style-digital', 'clock-style-minimal', 'clock-style-hud',
      'clock-size-small', 'clock-size-medium', 'clock-size-large'
    );

    wrap.classList.add(`font-${currentClockSettings.font || 'jetbrains'}`);
    wrap.classList.add(`clock-style-${currentClockSettings.style || 'pill'}`);
    wrap.classList.add(`clock-size-${currentClockSettings.size || 'medium'}`);
  });

  // Mettre à jour l'interface des réglages
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

  // Toggles & Sélecteurs
  const opt24h = document.getElementById('clock-opt-24h');
  const optSeconds = document.getElementById('clock-opt-seconds');
  const optDate = document.getElementById('clock-opt-date');
  const optProgress = document.getElementById('clock-opt-progress');
  const optWeek = document.getElementById('clock-opt-week');
  const selectDateFormat = document.getElementById('clock-date-format-select');
  const selectTimezone = document.getElementById('clock-timezone-select');
  const selectSize = document.getElementById('clock-size-select');

  if (opt24h) opt24h.checked = currentClockSettings.format24h !== false;
  if (optSeconds) optSeconds.checked = currentClockSettings.showSeconds !== false;
  if (optDate) optDate.checked = currentClockSettings.showDate !== false;
  if (optProgress) optProgress.checked = currentClockSettings.showProgress !== false;
  if (optWeek) optWeek.checked = currentClockSettings.showWeek !== false;
  if (selectDateFormat) selectDateFormat.value = currentClockSettings.dateFormat || 'text';
  if (selectTimezone) selectTimezone.value = currentClockSettings.timezone || 'local';
  if (selectSize) selectSize.value = currentClockSettings.size || 'medium';
}

function getZonedDate(settings) {
  const now = new Date();
  const tz = settings.timezone || 'local';

  if (tz === 'tokyo') {
    return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  }
  if (tz === 'ny') {
    return new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  }
  if (tz === 'london') {
    return new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
  }
  if (tz === 'utc') {
    return new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  }
  return now;
}

function getTimezoneLabel(tz) {
  switch (tz) {
    case 'tokyo': return 'TOKYO • JST';
    case 'ny': return 'NEW YORK • EST';
    case 'london': return 'LONDRES • GMT';
    case 'utc': return 'UTC';
    default: return 'LOCAL • PARIS';
  }
}

function formatTimeString(zonedDate, settings) {
  let hours = zonedDate.getHours();
  let ampm = '';

  if (!settings.format24h) {
    ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  }

  const h = String(hours).padStart(2, '0');
  const m = String(zonedDate.getMinutes()).padStart(2, '0');

  if (settings.showSeconds !== false) {
    const s = String(zonedDate.getSeconds()).padStart(2, '0');
    return { time: `${h}:${m}:${s}`, ampm: ampm };
  }

  return { time: `${h}:${m}`, ampm: ampm };
}

function formatDateString(zonedDate, settings) {
  if (settings.showDate === false) return '';

  const format = settings.dateFormat || 'text';

  if (format === 'numeric') {
    const d = String(zonedDate.getDate()).padStart(2, '0');
    const m = String(zonedDate.getMonth() + 1).padStart(2, '0');
    const y = zonedDate.getFullYear();
    return `${d}/${m}/${y}`;
  }

  if (format === 'iso') {
    const d = String(zonedDate.getDate()).padStart(2, '0');
    const m = String(zonedDate.getMonth() + 1).padStart(2, '0');
    const y = zonedDate.getFullYear();
    return `${y}-${m}-${d}`;
  }

  // Format texte complet en français
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return zonedDate.toLocaleDateString('fr-FR', options);
}

function getWeekNumber(d) {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000);
}

function getDayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function updateClock() {
  const zonedDate = getZonedDate(currentClockSettings);
  const timeData = formatTimeString(zonedDate, currentClockSettings);
  const dateStr = formatDateString(zonedDate, currentClockSettings);

  // 1. Horloge Principale de la Colonne Gauche
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  const ampmEl = document.getElementById('clock-ampm-pill');
  const extraInfoEl = document.getElementById('clock-extra-info');
  const tzBadgeEl = document.getElementById('clock-tz-badge');
  const progressWrap = document.getElementById('day-progress-wrap');
  const progressPct = document.getElementById('day-progress-pct');
  const progressFill = document.getElementById('day-progress-fill');

  if (timeEl) timeEl.textContent = timeData.time;

  if (ampmEl) {
    if (!currentClockSettings.format24h && timeData.ampm) {
      ampmEl.textContent = timeData.ampm;
      ampmEl.hidden = false;
    } else {
      ampmEl.hidden = true;
    }
  }

  if (dateEl) {
    if (currentClockSettings.showDate !== false && dateStr) {
      dateEl.textContent = dateStr;
      dateEl.style.display = '';
    } else {
      dateEl.style.display = 'none';
    }
  }

  if (tzBadgeEl) {
    tzBadgeEl.textContent = getTimezoneLabel(currentClockSettings.timezone);
  }

  if (extraInfoEl) {
    if (currentClockSettings.showWeek !== false) {
      const week = getWeekNumber(zonedDate);
      const day = getDayOfYear(zonedDate);
      extraInfoEl.textContent = `Semaine ${week} • Jour ${day}/365`;
      extraInfoEl.style.display = '';
    } else {
      extraInfoEl.style.display = 'none';
    }
  }

  // Barre de progression du jour (%)
  if (progressWrap) {
    if (currentClockSettings.showProgress !== false) {
      progressWrap.style.display = '';
      const secs = zonedDate.getHours() * 3600 + zonedDate.getMinutes() * 60 + zonedDate.getSeconds();
      const pct = Math.min(100, Math.max(0, (secs / 86400) * 100)).toFixed(1);
      if (progressPct) progressPct.textContent = `${pct}%`;
      if (progressFill) progressFill.style.width = `${pct}%`;
    } else {
      progressWrap.style.display = 'none';
    }
  }

  // 2. Synchronisation de l'aperçu dans l'onglet Horloge
  const previewTimeEl = document.getElementById('clock-preview-time');
  const previewDateEl = document.getElementById('clock-preview-date');
  if (previewTimeEl) previewTimeEl.textContent = `${timeData.time} ${timeData.ampm || ''}`.trim();
  if (previewDateEl) previewDateEl.textContent = dateStr || '';

  // 3. Mockup d'aperçu d'apparence
  const mockTimeEl = document.getElementById('preview-mock-time');
  const mockDateEl = document.getElementById('preview-mock-date');
  if (mockTimeEl) mockTimeEl.textContent = timeData.time;
  if (mockDateEl) mockDateEl.textContent = dateStr || '';
}

function initClock() {
  loadClockSettings();
  applyClockSettings();
  updateClock();
  setInterval(updateClock, 1000);

  // Polices
  document.querySelectorAll('.clock-font-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentClockSettings.font = btn.dataset.clockFont;
      saveClockSettings();
      if (typeof showToast === 'function') {
        showToast(`Police : ${btn.querySelector('.font-name')?.textContent || btn.dataset.clockFont}`, 'info');
      }
    });
  });

  // Styles de cadre
  document.querySelectorAll('.clock-style-card-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentClockSettings.style = btn.dataset.clockStyle;
      saveClockSettings();
      if (typeof showToast === 'function') {
        showToast(`Style : ${btn.querySelector('.style-title')?.textContent || btn.dataset.clockStyle}`, 'info');
      }
    });
  });

  // Toggles & Options
  const opt24h = document.getElementById('clock-opt-24h');
  const optSeconds = document.getElementById('clock-opt-seconds');
  const optDate = document.getElementById('clock-opt-date');
  const optProgress = document.getElementById('clock-opt-progress');
  const optWeek = document.getElementById('clock-opt-week');
  const selectDateFormat = document.getElementById('clock-date-format-select');
  const selectTimezone = document.getElementById('clock-timezone-select');
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

  if (optProgress) {
    optProgress.addEventListener('change', () => {
      currentClockSettings.showProgress = optProgress.checked;
      saveClockSettings();
    });
  }

  if (optWeek) {
    optWeek.addEventListener('change', () => {
      currentClockSettings.showWeek = optWeek.checked;
      saveClockSettings();
    });
  }

  if (selectDateFormat) {
    selectDateFormat.addEventListener('change', () => {
      currentClockSettings.dateFormat = selectDateFormat.value;
      saveClockSettings();
    });
  }

  if (selectTimezone) {
    selectTimezone.addEventListener('change', () => {
      currentClockSettings.timezone = selectTimezone.value;
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
        showToast('Horloge réinitialisée par défaut', 'info');
      }
    });
  }
}
