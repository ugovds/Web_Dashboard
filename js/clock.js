/**
 * clock.js - Horloge numérique cyberdeck dans la colonne gauche & personnalisation avancée
 * - Polices néon : JetBrains Mono, Orbitron, Share Tech Mono, VT323, Inter
 * - Styles de cadre : HUD Cyberdeck, Lueur Intense, Digital LCD, Pilule Verre, Crochets Cyber, Minimaliste
 * - Options : 24h/12h, secondes, date, progression du jour (%), numéro de semaine, fuseaux horaires, formats & tailles
 * - Animation fluide 60 FPS : Arc radial des secondes SVG & micro-ticker millisecondes
 * - Cycle solaire automatique (Diurne / Nocturne) & temps restant dans la journée
 * - Synchronisation en temps réel avec le panneau gauche et l'onglet de configuration
 */

const defaultClockSettings = {
  font: 'inter', // 'inter', 'jetbrains', 'orbitron', 'share-tech', 'vt323'
  style: 'editorial', // 'editorial', 'flip', 'analog', 'glass', 'minimal', 'card', 'accent', 'hud'
  format24h: true,
  showSeconds: false,
  showDate: true,
  showProgress: false,
  showWeek: false,
  dateFormat: 'text', // 'text', 'numeric', 'iso'
  timezone: 'local', // 'local', 'tokyo', 'ny', 'london', 'utc'
  size: 'medium', // 'small', 'medium', 'large'
  countdownMode: false,
  countdownTarget: '',
  countdownLabel: 'Fin de journée'
};

let currentClockSettings = structuredClone(defaultClockSettings);
const TIMEZONES_CYCLE = ['local', 'tokyo', 'ny', 'london', 'utc'];
let clockRafId = null;

function loadClockSettings() {
  try {
    const saved = localStorage.getItem('startpage_clock_settings');
    if (saved) {
      currentClockSettings = { ...defaultClockSettings, ...JSON.parse(saved) };
      // Normalisation des styles rétro vers les nouveaux styles modernes
      if (['pill', 'glow'].includes(currentClockSettings.style)) currentClockSettings.style = 'glass';
      if (['brackets', 'digital'].includes(currentClockSettings.style)) currentClockSettings.style = 'card';
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

  const currentStyle = currentClockSettings.style || 'editorial';

  clockWraps.forEach((wrap) => {
    if (!wrap) return;

    // Réinitialiser les classes dynamiques
    wrap.classList.remove(
      'font-inter', 'font-jetbrains', 'font-orbitron', 'font-share-tech', 'font-vt323',
      'clock-style-editorial', 'clock-style-flip', 'clock-style-analog',
      'clock-style-glass', 'clock-style-minimal', 'clock-style-card', 'clock-style-accent', 'clock-style-hud',
      'clock-style-glow', 'clock-style-digital', 'clock-style-pill', 'clock-style-brackets',
      'clock-size-small', 'clock-size-medium', 'clock-size-large'
    );

    wrap.classList.add(`font-${currentClockSettings.font || 'inter'}`);
    wrap.classList.add(`clock-style-${currentStyle}`);
    wrap.classList.add(`clock-size-${currentClockSettings.size || 'medium'}`);
  });

  // Affichage dynamique des modules d'horloge (Normal, Flip Clock ou Analogique Suisse)
  const displayStandard = document.getElementById('left-clock-display');
  const displayFlip = document.getElementById('clock-flip-wrap');
  const displayAnalog = document.getElementById('clock-analog-wrap');

  if (displayStandard && displayFlip && displayAnalog) {
    if (currentStyle === 'flip') {
      displayStandard.style.display = 'none';
      displayFlip.style.display = 'flex';
      displayAnalog.style.display = 'none';
    } else if (currentStyle === 'analog') {
      displayStandard.style.display = 'none';
      displayFlip.style.display = 'none';
      displayAnalog.style.display = 'flex';
    } else {
      displayStandard.style.display = 'flex';
      displayFlip.style.display = 'none';
      displayAnalog.style.display = 'none';
    }
  }

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
  const optCountdown = document.getElementById('clock-opt-countdown');
  const countdownTargetInput = document.getElementById('clock-countdown-target');
  const countdownLabelInput = document.getElementById('clock-countdown-label');
  const selectDateFormat = document.getElementById('clock-date-format-select');
  const selectTimezone = document.getElementById('clock-timezone-select');
  const selectSize = document.getElementById('clock-size-select');

  if (opt24h) opt24h.checked = currentClockSettings.format24h !== false;
  if (optSeconds) optSeconds.checked = currentClockSettings.showSeconds !== false;
  if (optDate) optDate.checked = currentClockSettings.showDate !== false;
  if (optProgress) optProgress.checked = currentClockSettings.showProgress !== false;
  if (optWeek) optWeek.checked = currentClockSettings.showWeek !== false;
  if (optCountdown) optCountdown.checked = currentClockSettings.countdownMode === true;
  if (countdownTargetInput) countdownTargetInput.value = currentClockSettings.countdownTarget || '';
  if (countdownLabelInput) countdownLabelInput.value = currentClockSettings.countdownLabel || 'Fin de journée';
  if (selectDateFormat) selectDateFormat.value = currentClockSettings.dateFormat || 'text';
  if (selectTimezone) selectTimezone.value = currentClockSettings.timezone || 'local';
  if (selectSize) selectSize.value = currentClockSettings.size || 'medium';

  // Badge du mode sur la carte de l'horloge
  const modeBadgeText = document.getElementById('clock-mode-label');
  const modeBadgeIcon = document.getElementById('clock-mode-icon');
  if (modeBadgeText) {
    modeBadgeText.textContent = currentClockSettings.countdownMode ? 'Rebours' : 'Horloge';
  }
  if (modeBadgeIcon) {
    modeBadgeIcon.className = currentClockSettings.countdownMode ? 'fa-solid fa-hourglass-half' : 'fa-solid fa-clock';
  }
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
    return { time: `${h}:${m}:${s}`, ampm: ampm, h, m, s };
  }

  return { time: `${h}:${m}`, ampm: ampm, h, m, s: '00' };
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
  const greetingEl = document.getElementById('clock-greeting');
  const ampmEl = document.getElementById('clock-ampm-pill');
  const tzBadgeEl = document.getElementById('clock-tz-badge');
  const weekChipEl = document.getElementById('clock-week-chip');
  const weekTextEl = document.getElementById('clock-week-text');
  const dayChipEl = document.getElementById('clock-day-chip');
  const dayTextEl = document.getElementById('clock-day-text');
  const solarChipEl = document.getElementById('clock-solar-chip');
  const solarIconEl = document.getElementById('clock-solar-icon');
  const solarTextEl = document.getElementById('clock-solar-text');
  const progressWrap = document.getElementById('day-progress-wrap');
  const progressPct = document.getElementById('day-progress-pct');
  const progressRemaining = document.getElementById('day-progress-remaining');
  const progressFill = document.getElementById('day-progress-fill');
  const secArc = document.getElementById('clock-sec-arc');
  const msTickEl = document.getElementById('clock-ms-tick');

  // Mise à jour de la salutation moderne
  if (greetingEl) {
    const hours = zonedDate.getHours();
    let greet = 'Bonjour';
    if (hours >= 5 && hours < 12) greet = 'Bonjour';
    else if (hours >= 12 && hours < 18) greet = 'Bon après-midi';
    else if (hours >= 18 && hours < 23) greet = 'Bonne soirée';
    else greet = 'Bonne nuit';
    greetingEl.textContent = greet;
  }

  // Mise à jour des modules alternatifs (Flip Clock)
  const flipH = document.getElementById('flip-h');
  const flipM = document.getElementById('flip-m');
  const flipS = document.getElementById('flip-s');
  const flipSecSep = document.getElementById('flip-sec-sep');
  const flipSecUnit = document.getElementById('flip-sec-unit');
  if (flipH) flipH.textContent = timeData.h;
  if (flipM) flipM.textContent = timeData.m;
  if (flipS) flipS.textContent = timeData.s;
  if (flipSecSep && flipSecUnit) {
    const showSec = currentClockSettings.showSeconds !== false;
    flipSecSep.style.display = showSec ? '' : 'none';
    flipSecUnit.style.display = showSec ? '' : 'none';
  }

  // Mise à jour des aiguilles analogiques suisses
  const hourHand = document.getElementById('analog-hour-hand');
  const minHand = document.getElementById('analog-min-hand');
  const secHand = document.getElementById('analog-sec-hand');
  if (hourHand && minHand) {
    const h12 = zonedDate.getHours() % 12;
    const m = zonedDate.getMinutes();
    const s = zonedDate.getSeconds();
    const hourDeg = (h12 + m / 60) * 30;
    const minDeg = (m + s / 60) * 6;
    hourHand.setAttribute('transform', `rotate(${hourDeg} 100 100)`);
    minHand.setAttribute('transform', `rotate(${minDeg} 100 100)`);
  }

  // Mode Compte à rebours vs Horloge standard
  if (currentClockSettings.countdownMode) {
    let targetTime = null;
    const rawTarget = (currentClockSettings.countdownTarget || '').trim();
    if (rawTarget) {
      if (rawTarget.includes('T')) {
        targetTime = new Date(rawTarget).getTime();
      } else if (rawTarget.includes(':')) {
        const [h, m] = rawTarget.split(':').map(Number);
        const tDate = new Date(zonedDate);
        tDate.setHours(h, m, 0, 0);
        if (tDate.getTime() < zonedDate.getTime()) {
          tDate.setDate(tDate.getDate() + 1);
        }
        targetTime = tDate.getTime();
      }
    } else {
      const tDate = new Date(zonedDate);
      tDate.setHours(18, 0, 0, 0);
      if (tDate.getTime() < zonedDate.getTime()) {
        tDate.setDate(tDate.getDate() + 1);
      }
      targetTime = tDate.getTime();
    }

    const diffMs = (targetTime || 0) - zonedDate.getTime();
    const lbl = currentClockSettings.countdownLabel || 'Objectif';

    if (diffMs > 0) {
      const totSec = Math.floor(diffMs / 1000);
      const days = Math.floor(totSec / 86400);
      const hours = Math.floor((totSec % 86400) / 3600);
      const mins = Math.floor((totSec % 3600) / 60);
      const secs = totSec % 60;
      let displayStr = '';
      if (days > 0) {
        displayStr = `${days}j ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      } else {
        displayStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
      if (timeEl) timeEl.textContent = `-${displayStr}`;
      if (dateEl) {
        dateEl.textContent = `🎯 ${lbl}`;
        dateEl.style.display = '';
      }
    } else {
      if (timeEl) timeEl.textContent = '00:00:00';
      if (dateEl) {
        dateEl.textContent = `🎉 ${lbl} TERMINÉ !`;
        dateEl.style.display = '';
      }
    }
  } else {
    if (timeEl) timeEl.textContent = timeData.time;

    if (dateEl) {
      if (currentClockSettings.showDate !== false && dateStr) {
        dateEl.textContent = dateStr;
        dateEl.style.display = '';
      } else {
        dateEl.style.display = 'none';
      }
    }
  }

  if (tzBadgeEl) {
    tzBadgeEl.innerHTML = `<i class="fa-solid fa-globe"></i> ${getTimezoneLabel(currentClockSettings.timezone)}`;
  }

  // Numéro de semaine & jour annuel
  if (weekChipEl && weekTextEl && dayChipEl && dayTextEl) {
    if (currentClockSettings.showWeek) {
      const week = getWeekNumber(zonedDate);
      const day = getDayOfYear(zonedDate);
      weekTextEl.textContent = `Sem. ${week}`;
      dayTextEl.textContent = `Jour ${day}/365`;
      weekChipEl.style.display = '';
      dayChipEl.style.display = '';
    } else {
      weekChipEl.style.display = 'none';
      dayChipEl.style.display = 'none';
    }
  }

  // Cycle Solaire (Diurne / Nocturne)
  if (solarChipEl && solarIconEl && solarTextEl) {
    if (currentClockSettings.showWeek) {
      const hours = zonedDate.getHours();
      const isDay = hours >= 7 && hours < 19;
      solarChipEl.className = `chrono-chip solar-chip ${isDay ? 'day' : 'night'}`;
      solarIconEl.className = isDay ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      solarTextEl.textContent = isDay ? 'Diurne' : 'Nocturne';
      solarChipEl.style.display = '';
    } else {
      solarChipEl.style.display = 'none';
    }
  }

  // Barre de progression du jour (%) & temps restant
  if (progressWrap) {
    if (currentClockSettings.showProgress) {
      progressWrap.style.display = '';
      const totalSecs = zonedDate.getHours() * 3600 + zonedDate.getMinutes() * 60 + zonedDate.getSeconds();
      const pct = Math.min(100, Math.max(0, (totalSecs / 86400) * 100)).toFixed(1);

      const remSecs = 86400 - totalSecs;
      const remH = Math.floor(remSecs / 3600);
      const remM = Math.floor((remSecs % 3600) / 60);

      if (progressPct) progressPct.textContent = `${pct}%`;
      if (progressRemaining) progressRemaining.textContent = `(${remH}h ${String(remM).padStart(2, '0')}m restants)`;
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

/**
 * Boucle d'animation fluide 60 FPS pour l'arc radial des secondes et trotteuse analogique
 */
function runClockAnimationLoop() {
  const zonedDate = getZonedDate(currentClockSettings);
  const secArc = document.getElementById('clock-sec-arc');
  const msTickEl = document.getElementById('clock-ms-tick');
  const secHand = document.getElementById('analog-sec-hand');

  const s = zonedDate.getSeconds();
  const ms = zonedDate.getMilliseconds();
  const frac = s + ms / 1000;

  // Trotteuse fluide 60 FPS pour l'horloge analogique suisse
  if (secHand) {
    const secDeg = frac * 6;
    secHand.setAttribute('transform', `rotate(${secDeg} 100 100)`);
  }

  if (currentClockSettings.showSeconds) {
    // Arc des secondes SVG (circonférence = 2 * PI * 96 ≈ 603.18)
    if (secArc) {
      const circum = 603.18;
      const offset = circum - (frac / 60) * circum;
      secArc.style.strokeDashoffset = offset.toFixed(2);
      secArc.style.display = '';
    }

    if (msTickEl) {
      const msHundreds = Math.floor(ms / 10);
      msTickEl.textContent = `.${String(msHundreds).padStart(2, '0')}`;
      msTickEl.style.display = '';
    }
  } else {
    if (secArc) secArc.style.display = 'none';
    if (msTickEl) msTickEl.style.display = 'none';
  }

  clockRafId = requestAnimationFrame(runClockAnimationLoop);
}

function initClock() {
  loadClockSettings();
  applyClockSettings();
  updateClock();

  // Économie d'énergie : pause de l'animation 60 FPS quand l'onglet est en arrière-plan
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (clockRafId) {
        cancelAnimationFrame(clockRafId);
        clockRafId = null;
      }
    } else {
      updateClock();
      if (!clockRafId) {
        clockRafId = requestAnimationFrame(runClockAnimationLoop);
      }
    }
  });

  // Actualisation continue de l'horloge
  setInterval(updateClock, 1000);
  if (!clockRafId) {
    clockRafId = requestAnimationFrame(runClockAnimationLoop);
  }

  // Raccourci interactif : cliquer sur le badge de fuseau horaire fait défiler les fuseaux
  const tzBadgeEl = document.getElementById('clock-tz-badge');
  if (tzBadgeEl) {
    tzBadgeEl.addEventListener('click', () => {
      const curIndex = TIMEZONES_CYCLE.indexOf(currentClockSettings.timezone || 'local');
      const nextIndex = (curIndex + 1) % TIMEZONES_CYCLE.length;
      currentClockSettings.timezone = TIMEZONES_CYCLE[nextIndex];
      saveClockSettings();
      if (typeof showToast === 'function') {
        showToast(`Fuseau : ${getTimezoneLabel(currentClockSettings.timezone)}`, 'info');
      }
    });
  }

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

  // Mode Compte à Rebours & Target
  const optCountdown = document.getElementById('clock-opt-countdown');
  const countdownTargetInput = document.getElementById('clock-countdown-target');
  const countdownLabelInput = document.getElementById('clock-countdown-label');
  const clockModeToggleBtn = document.getElementById('clock-mode-toggle');

  if (optCountdown) {
    optCountdown.addEventListener('change', () => {
      currentClockSettings.countdownMode = optCountdown.checked;
      saveClockSettings();
      if (typeof showToast === 'function') {
        showToast(currentClockSettings.countdownMode ? 'Mode Compte à rebours activé' : 'Mode Horloge activé', 'info');
      }
    });
  }

  if (countdownTargetInput) {
    countdownTargetInput.addEventListener('change', () => {
      currentClockSettings.countdownTarget = countdownTargetInput.value;
      saveClockSettings();
    });
  }

  if (countdownLabelInput) {
    countdownLabelInput.addEventListener('input', () => {
      currentClockSettings.countdownLabel = countdownLabelInput.value;
      saveClockSettings();
    });
  }

  if (clockModeToggleBtn) {
    clockModeToggleBtn.addEventListener('click', () => {
      currentClockSettings.countdownMode = !currentClockSettings.countdownMode;
      saveClockSettings();
      if (typeof showToast === 'function') {
        showToast(currentClockSettings.countdownMode ? 'Affichage Compte à rebours' : 'Affichage Horloge', 'info');
      }
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
