/**
 * widgets.js - Modules interactifs de la colonne droite & Gestionnaire de widgets
 * - ⏱️ Minuteur Focus / Pomodoro avec carillon Web Audio
 * - 📝 Bloc-Notes Rapide (Scratchpad) avec persistance continue & export
 * - 🎧 Ambiance Sonore procédurale (Pluie, Bruit brun, Lo-Fi) & Visualiseur Canvas
 * - ⚡ Moniteur Système & Télémétrie en direct (Ping, Batterie, Uptime) & Ticker Crypto
 * - 💬 Citations Cyberpunk & Motivation Dev
 */

const defaultWidgetSettings = {
  agenda: true,
  weather: true,
  feeds: true,
  system: true,
  pomodoro: true,
  notes: true,
  ambient: true,
  quotes: true
};

let currentWidgetSettings = structuredClone(defaultWidgetSettings);

function loadWidgetSettings() {
  try {
    const saved = localStorage.getItem('startpage_widget_settings');
    if (saved) {
      currentWidgetSettings = { ...defaultWidgetSettings, ...JSON.parse(saved) };
    }
  } catch {
    currentWidgetSettings = structuredClone(defaultWidgetSettings);
  }
}

function saveWidgetSettings() {
  localStorage.setItem('startpage_widget_settings', JSON.stringify(currentWidgetSettings));
  applyWidgetVisibility();
}

function applyWidgetVisibility() {
  // Synchroniser les boutons de navigation du deck (sidebar cockpit)
  const keys = ['agenda', 'weather', 'feeds', 'system', 'pomodoro', 'notes', 'quotes'];
  keys.forEach((key) => {
    const isEnabled = currentWidgetSettings[key] !== false;
    const navBtn = document.querySelector(`.deck-nav-btn[data-deck-view="${key}"]`);
    if (navBtn) {
      if (isEnabled) {
        navBtn.classList.remove('tab-hidden');
        navBtn.style.removeProperty('display');
      } else {
        navBtn.classList.add('tab-hidden');
        navBtn.style.setProperty('display', 'none', 'important');
      }
    }

    const check = document.getElementById(`widget-toggle-${key}`);
    if (check) {
      check.checked = isEnabled;
    }
  });

  // Si la vue active actuelle a été désactivée, revenir immédiatement à l'accueil
  const activeNavBtn = document.querySelector('.deck-nav-btn.active');
  if (activeNavBtn && (activeNavBtn.classList.contains('tab-hidden') || activeNavBtn.style.display === 'none')) {
    const homeBtn = document.querySelector('.deck-nav-btn[data-deck-view="dashboard"]');
    if (homeBtn) {
      homeBtn.click();
    }
  } else if (activeNavBtn && typeof updateDeckIndicator === 'function') {
    // Recalculer l'indicateur glissant pour qu'il s'aligne immédiatement avec la nouvelle répartition
    setTimeout(() => updateDeckIndicator(activeNavBtn), 60);
  }
}

/* ========================================================
   1. STUDIO DE RÉVISIONS & FOCUS POMODORO (100% FIABLE)
   ======================================================== */
const REVISION_PROGRAMS = {
  standard: {
    id: 'standard',
    name: 'Standard',
    icon: 'fa-solid fa-graduation-cap',
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
    desc: '25m Focus • 5m Pause'
  },
  deep: {
    id: 'deep',
    name: 'Examen & Deep',
    icon: 'fa-solid fa-brain',
    focus: 50 * 60,
    short: 10 * 60,
    long: 20 * 60,
    desc: '50m Focus • 10m Pause'
  },
  sprint: {
    id: 'sprint',
    name: 'Sprint Flash',
    icon: 'fa-solid fa-bolt',
    focus: 15 * 60,
    short: 3 * 60,
    long: 10 * 60,
    desc: '15m Focus • 3m Pause'
  },
  lecture: {
    id: 'lecture',
    name: 'Fiches & Lecture',
    icon: 'fa-solid fa-book-open',
    focus: 40 * 60,
    short: 8 * 60,
    long: 15 * 60,
    desc: '40m Focus • 8m Pause'
  }
};

let POMO_DURATIONS = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60
};

let pomoActiveProgram = 'standard';
let pomoMode = 'focus'; // 'focus', 'short', 'long'
let pomoTimeLeft = POMO_DURATIONS.focus;
let pomoTargetEndTime = 0;
let pomoInterval = null;
let pomoIsRunning = false;
let pomoCompletedCount = 0;
let pomoActiveSubject = '📐 Mathématiques';
let pomoWidgetInitialized = false;

/**
 * Carillon Zen harmonique (Web Audio API)
 */
function playPomoChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const chord = [523.25, 659.25, 783.99, 1046.5]; // C5-E5-G5-C6
    const now = ctx.currentTime;

    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const startTime = now + idx * 0.12;
      const duration = 1.3;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    });
  } catch (err) {
    console.warn('Web Audio chime non supporté ou bloqué :', err);
  }
}

/**
 * Récupération et calcul des révisions de la semaine (Lun - Dim)
 */
function getWeeklyRevisionData() {
  let weekly = null;
  try {
    const raw = localStorage.getItem('startpage_weekly_revisions');
    if (raw) weekly = JSON.parse(raw);
  } catch {
    weekly = null;
  }

  const today = new Date();
  const currentDayOfWeek = (today.getDay() + 6) % 7; // 0 = Lundi, 6 = Dimanche

  // Si aucun historique, initialisation avec des données représentatives
  if (!weekly || typeof weekly !== 'object') {
    weekly = {};
    const sampleMinutes = [50, 75, 45, 90, 60, 40, Math.max(25, pomoCompletedCount * 25)];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - (currentDayOfWeek - i));
      const k = d.toISOString().split('T')[0];
      weekly[k] = i <= currentDayOfWeek ? sampleMinutes[i] : 0;
    }
    try {
      localStorage.setItem('startpage_weekly_revisions', JSON.stringify(weekly));
    } catch {}
  }

  const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const days = [];
  let totalWeekMinutes = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - (currentDayOfWeek - i));
    const k = d.toISOString().split('T')[0];
    const minutes = Number(weekly[k]) || 0;
    totalWeekMinutes += minutes;
    days.push({
      dateKey: k,
      label: dayLabels[i],
      minutes,
      isToday: i === currentDayOfWeek
    });
  }

  return { days, totalWeekMinutes };
}

function recordRevisionMinutes(minutes) {
  try {
    const todayKey = new Date().toISOString().split('T')[0];
    let weekly = {};
    try {
      weekly = JSON.parse(localStorage.getItem('startpage_weekly_revisions') || '{}');
    } catch {}
    weekly[todayKey] = (Number(weekly[todayKey]) || 0) + minutes;
    localStorage.setItem('startpage_weekly_revisions', JSON.stringify(weekly));
  } catch {}
}

/**
 * Rendu du graphique hebdomadaire des révisions en SVG
 */
function renderWeeklyRevisionChart() {
  const svg = document.getElementById('revision-weekly-chart');
  if (!svg) return;

  const { days, totalWeekMinutes } = getWeeklyRevisionData();

  // Mise à jour du badge total de la semaine
  const totalBadgeText = document.getElementById('revision-week-total-text');
  if (totalBadgeText) {
    const hrs = Math.floor(totalWeekMinutes / 60);
    const mins = totalWeekMinutes % 60;
    totalBadgeText.textContent = hrs > 0 ? `${hrs}h ${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;
  }

  const maxMin = Math.max(60, ...days.map(d => d.minutes));
  const svgWidth = 320;
  const svgHeight = 95;
  const bottomPad = 22;
  const topPad = 12;
  const chartHeight = svgHeight - bottomPad - topPad;

  const barWidth = 24;
  const slotWidth = svgWidth / days.length;

  let html = '';
  // Ligne de sol
  html += `<line x1="8" y1="${svgHeight - bottomPad}" x2="${svgWidth - 8}" y2="${svgHeight - bottomPad}" stroke="rgba(255,255,255,0.08)" stroke-width="1" />`;

  days.forEach((item, idx) => {
    const x = Math.round(idx * slotWidth + (slotWidth - barWidth) / 2);
    const barH = item.minutes > 0 ? Math.max(6, Math.round((item.minutes / maxMin) * chartHeight)) : 0;
    const y = Math.round(svgHeight - bottomPad - barH);

    // Fond de colonne
    html += `<rect class="bar-track" x="${x}" y="${topPad}" width="${barWidth}" height="${chartHeight}" rx="5" fill="rgba(255,255,255,0.04)" />`;

    // Barre active
    if (barH > 0) {
      const fill = item.isToday ? 'var(--accent-primary)' : 'rgba(167, 139, 250, 0.45)';
      const shadow = item.isToday ? 'filter="drop-shadow(0 0 6px var(--accent-primary))"' : '';
      html += `<rect class="bar-fill ${item.isToday ? 'today' : ''}" x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="5" fill="${fill}" ${shadow}>`;
      html += `<title>${item.label} : ${item.minutes} min de révision</title>`;
      html += `</rect>`;

      // Label de durée au-dessus si assez de place
      if (barH >= 14) {
        const valText = item.minutes >= 60 ? `${(item.minutes / 60).toFixed(1)}h` : `${item.minutes}m`;
        html += `<text x="${x + barWidth / 2}" y="${y + 10}" text-anchor="middle" font-size="7.5" fill="#ffffff" font-weight="800">${valText}</text>`;
      }
    }

    // Libellé du jour (Lun, Mar, ...)
    const textColor = item.isToday ? 'var(--accent-primary)' : 'rgba(255,255,255,0.45)';
    const textWeight = item.isToday ? '800' : '600';
    html += `<text x="${x + barWidth / 2}" y="${svgHeight - 6}" text-anchor="middle" font-size="9" fill="${textColor}" font-weight="${textWeight}">${item.label}</text>`;
  });

  svg.innerHTML = html;
}

/**
 * Gestion de l'historique des révisions
 */
function getRevisionHistory() {
  try {
    const raw = localStorage.getItem('startpage_revision_history');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 1,
      subject: '📐 Mathématiques',
      program: 'Standard (25m)',
      durationMin: 25,
      timeFormatted: '16:45',
      dateFormatted: 'Aujourd\'hui'
    },
    {
      id: 2,
      subject: '💻 Programmation',
      program: 'Deep (50m)',
      durationMin: 50,
      timeFormatted: '14:20',
      dateFormatted: 'Aujourd\'hui'
    }
  ];
}

function addRevisionToHistory(durationMin) {
  try {
    const history = getRevisionHistory();
    const now = new Date();
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const prog = REVISION_PROGRAMS[pomoActiveProgram] || REVISION_PROGRAMS.standard;

    const entry = {
      id: Date.now(),
      subject: pomoActiveSubject || '📖 Révision',
      program: `${prog.name} (${durationMin}m)`,
      durationMin,
      timeFormatted,
      dateFormatted: 'Aujourd\'hui'
    };

    history.unshift(entry);
    if (history.length > 20) history.pop();
    localStorage.setItem('startpage_revision_history', JSON.stringify(history));
    renderRevisionHistory();
  } catch {}
}

function renderRevisionHistory() {
  const container = document.getElementById('revision-history-list');
  if (!container) return;

  const history = getRevisionHistory();
  if (history.length === 0) {
    container.innerHTML = '<p class="history-empty-msg">Aucune révision enregistrée pour l\'instant.<br>Lancez votre première session !</p>';
    return;
  }

  container.innerHTML = history.slice(0, 8).map(item => `
    <div class="history-item">
      <span class="history-subj">${item.subject}</span>
      <div class="history-meta">
        <span class="history-dur-badge">${item.durationMin} min</span>
        <span class="history-time">${item.dateFormatted} • ${item.timeFormatted}</span>
      </div>
    </div>
  `).join('');
}

/**
 * Mise à jour globale de l'interface
 */
function updatePomoUI() {
  const display = document.getElementById('pomo-time') || document.getElementById('pomo-timer-display');
  const status = document.getElementById('pomo-status');
  const substatus = document.getElementById('pomo-substatus');
  const progressBar = document.getElementById('pomo-progress-fill');
  const ringArc = document.getElementById('pomo-ring-arc');
  const dialRing = document.getElementById('pomo-dial-ring');
  const toggleBtn = document.getElementById('pomo-start-btn');

  const m = String(Math.floor(pomoTimeLeft / 60)).padStart(2, '0');
  const s = String(pomoTimeLeft % 60).padStart(2, '0');
  const timeFormatted = `${m}:${s}`;

  if (display) display.textContent = timeFormatted;

  if (pomoIsRunning) {
    const modeLabel = pomoMode === 'focus' ? 'Révision' : 'Pause';
    document.title = `(${timeFormatted}) ${modeLabel} • Startpage`;
  } else {
    document.title = 'Startpage';
  }

  const total = POMO_DURATIONS[pomoMode] || 1500;
  const pct = Math.min(100, Math.max(0, ((total - pomoTimeLeft) / total) * 100));
  if (progressBar) progressBar.style.width = `${pct}%`;

  if (ringArc) {
    const r = parseFloat(ringArc.getAttribute('r')) || 150;
    const circum = 2 * Math.PI * r;
    ringArc.style.strokeDasharray = circum.toFixed(2);
    const offset = circum - (pct / 100) * circum;
    ringArc.style.strokeDashoffset = offset.toFixed(2);
  }

  if (dialRing) {
    dialRing.classList.toggle('running', pomoIsRunning);
  }

  if (toggleBtn) {
    toggleBtn.innerHTML = pomoIsRunning
      ? '<i class="fa-solid fa-pause"></i> <span>Mettre en pause</span>'
      : '<i class="fa-solid fa-play"></i> <span>Démarrer la révision</span>';
    toggleBtn.classList.toggle('running', pomoIsRunning);
  }

  if (status) {
    if (pomoIsRunning) {
      status.textContent = pomoMode === 'focus' ? 'Révision en cours...' : 'Pause en cours...';
    } else {
      status.textContent = pomoMode === 'focus' ? 'Session Prête' : 'Pause Prête';
    }
  }

  if (substatus) {
    const completedInCycle = pomoCompletedCount % 4;
    const currentNum = completedInCycle + 1;
    if (pomoIsRunning) {
      substatus.textContent = pomoMode === 'focus' ? `Séance ${currentNum} sur 4 • Concentration maximale` : 'Détendez-vous et hydratez-vous';
    } else {
      substatus.textContent = pomoMode === 'focus' ? `Séance ${currentNum} sur 4 avant pause longue` : 'Prêt à relancer une séance';
    }
  }

  // Nom du programme actif dans l'en-tête
  const progTag = document.getElementById('revision-active-program-name');
  if (progTag) {
    const p = REVISION_PROGRAMS[pomoActiveProgram] || REVISION_PROGRAMS.standard;
    const mins = Math.round(POMO_DURATIONS[pomoMode] / 60);
    const modeLabel = pomoMode === 'focus' ? `${p.name} • ${mins} min` : `Pause • ${mins} min`;
    progTag.textContent = `${p.name} : ${modeLabel}`;
  }

  // Cartes de programmes actives
  document.querySelectorAll('.program-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.program === pomoActiveProgram);
  });

  // Puces de phase (Focus / Pause courte / Pause longue)
  document.querySelectorAll('.phase-chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.pomoMode === pomoMode);
  });

  // Mini statistiques
  const todayTimeEl = document.getElementById('revision-today-time');
  if (todayTimeEl) {
    const focusDurationMin = Math.round((POMO_DURATIONS.focus || 1500) / 60);
    const totalMin = pomoCompletedCount * focusDurationMin;
    const hrs = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    todayTimeEl.textContent = hrs > 0 ? `${hrs}h ${mins > 0 ? mins + 'm' : ''}` : `${mins} min`;
  }

  const todaySessionsEl = document.getElementById('revision-today-sessions');
  if (todaySessionsEl) {
    todaySessionsEl.textContent = pomoCompletedCount;
  }

  const nextBreakEl = document.getElementById('revision-next-break');
  if (nextBreakEl) {
    const isLongNext = ((pomoCompletedCount + 1) % 4 === 0) && pomoCompletedCount > 0;
    nextBreakEl.textContent = isLongNext
      ? `${Math.round((POMO_DURATIONS.long || 900) / 60)} min (Longue)`
      : `${Math.round((POMO_DURATIONS.short || 300) / 60)} min`;
  }
}

/**
 * Fin de session (Focus ou Pause)
 */
function handlePomoSessionComplete() {
  if (pomoInterval) clearInterval(pomoInterval);
  pomoInterval = null;
  pomoIsRunning = false;
  playPomoChime();

  if (pomoMode === 'focus') {
    pomoCompletedCount++;
    try { localStorage.setItem('startpage_pomo_count', pomoCompletedCount); } catch {}

    const focusMin = Math.round(POMO_DURATIONS.focus / 60);
    recordRevisionMinutes(focusMin);
    addRevisionToHistory(focusMin);
    renderWeeklyRevisionChart();

    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(`🎉 Révision terminée ! (${pomoActiveSubject})`, {
          body: `Super travail ! +${focusMin} min de révision enregistrées. Prenez une pause bien méritée.`,
          icon: 'images/gif.gif'
        });
      }
    } catch {}

    const isLongBreak = (pomoCompletedCount % 4 === 0);
    if (typeof showToast === 'function') {
      showToast(isLongBreak ? `🎉 4 séances finies ! Pause longue de 15 min bien méritée.` : `🎉 Séance terminée ! +${focusMin}m (${pomoActiveSubject}) enregistrés. Pause de 5 min.`, 'success');
    }
    setPomoMode(isLongBreak ? 'long' : 'short');
  } else {
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('⚡ Pause Terminée !', {
          body: 'Prêt à reprendre vos révisions !',
          icon: 'images/gif.gif'
        });
      }
    } catch {}

    if (typeof showToast === 'function') {
      showToast('⚡ Pause terminée ! Prêt pour la prochaine séance de révision.', 'info');
    }
    setPomoMode('focus');
  }
}

/**
 * Commandes du minuteur
 */
function startPomoTimer() {
  if (pomoIsRunning) return;

  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  } catch {}

  pomoIsRunning = true;
  pomoTargetEndTime = Date.now() + pomoTimeLeft * 1000;
  updatePomoUI();

  if (pomoInterval) clearInterval(pomoInterval);
  pomoInterval = setInterval(() => {
    const remaining = Math.max(0, Math.round((pomoTargetEndTime - Date.now()) / 1000));
    pomoTimeLeft = remaining;
    updatePomoUI();

    if (pomoTimeLeft <= 0) {
      handlePomoSessionComplete();
    }
  }, 250);
}

function pausePomoTimer() {
  pomoIsRunning = false;
  if (pomoInterval) clearInterval(pomoInterval);
  pomoInterval = null;
  updatePomoUI();
}

function resetPomoTimer() {
  pausePomoTimer();
  pomoTimeLeft = POMO_DURATIONS[pomoMode] || 1500;
  updatePomoUI();
}

function skipPomoStep() {
  pausePomoTimer();
  if (pomoMode === 'focus') {
    const isLongNext = ((pomoCompletedCount + 1) % 4 === 0) && pomoCompletedCount > 0;
    setPomoMode(isLongNext ? 'long' : 'short');
    if (typeof showToast === 'function') {
      showToast(isLongNext ? 'Passage à la pause longue' : 'Passage à la pause courte', 'info');
    }
  } else {
    setPomoMode('focus');
    if (typeof showToast === 'function') {
      showToast('Prêt pour une nouvelle séance de révision', 'info');
    }
  }
}

function setPomoMode(mode) {
  pomoMode = (mode === 'work' || mode === 'focus') ? 'focus' : mode;
  resetPomoTimer();
}

/**
 * Changement de programme de révision
 */
function setRevisionProgram(programId) {
  const p = REVISION_PROGRAMS[programId] || REVISION_PROGRAMS.standard;
  pomoActiveProgram = p.id;
  try { localStorage.setItem('startpage_revision_program', pomoActiveProgram); } catch {}

  POMO_DURATIONS.focus = p.focus;
  POMO_DURATIONS.short = p.short;
  POMO_DURATIONS.long = p.long;

  resetPomoTimer();
  if (typeof showToast === 'function') {
    showToast(`Programme activé : ${p.name} (${Math.round(p.focus / 60)}m Focus / ${Math.round(p.short / 60)}m Pause)`, 'info');
  }
}

// Expositions globales
window.pomoStartToggle = function() {
  if (pomoIsRunning) pausePomoTimer();
  else startPomoTimer();
};
window.pomoReset = resetPomoTimer;
window.pomoSkip = skipPomoStep;
window.setPomoMode = setPomoMode;
window.setRevisionProgram = setRevisionProgram;
window.playPomoChime = playPomoChime;

/**
 * Initialisation unique du module Pomodoro & Révisions
 */
function initPomodoroWidget() {
  try {
    pomoCompletedCount = Number(localStorage.getItem('startpage_pomo_count') || 0);
  } catch {
    pomoCompletedCount = 0;
  }

  try {
    const savedProgram = localStorage.getItem('startpage_revision_program') || 'standard';
    if (REVISION_PROGRAMS[savedProgram]) {
      pomoActiveProgram = savedProgram;
      const p = REVISION_PROGRAMS[savedProgram];
      POMO_DURATIONS.focus = p.focus;
      POMO_DURATIONS.short = p.short;
      POMO_DURATIONS.long = p.long;
    }
  } catch {}

  // Attachement DIRECT et UNIQUE des écouteurs
  const startBtn = document.getElementById('pomo-start-btn');
  if (startBtn) {
    startBtn.onclick = (e) => {
      e.preventDefault();
      if (pomoIsRunning) pausePomoTimer();
      else startPomoTimer();
    };
  }

  const resetBtn = document.getElementById('pomo-reset-btn');
  if (resetBtn) {
    resetBtn.onclick = (e) => {
      e.preventDefault();
      resetPomoTimer();
      if (typeof showToast === 'function') showToast('Minuteur réinitialisé', 'info');
    };
  }

  const skipBtn = document.getElementById('pomo-skip-btn');
  if (skipBtn) {
    skipBtn.onclick = (e) => {
      e.preventDefault();
      skipPomoStep();
    };
  }

  // Cartes de programmes
  document.querySelectorAll('.program-card').forEach((card) => {
    card.onclick = (e) => {
      e.preventDefault();
      setRevisionProgram(card.dataset.program);
    };
  });

  // Puces de phase
  document.querySelectorAll('.phase-chip').forEach((chip) => {
    chip.onclick = (e) => {
      e.preventDefault();
      setPomoMode(chip.dataset.pomoMode);
    };
  });

  // Sélecteur de matière
  const subjectSelect = document.getElementById('revision-subject-select');
  if (subjectSelect) {
    try {
      const savedSubj = localStorage.getItem('startpage_revision_subject');
      if (savedSubj) {
        subjectSelect.value = savedSubj;
        pomoActiveSubject = savedSubj;
      } else {
        pomoActiveSubject = subjectSelect.value;
      }
    } catch {}

    subjectSelect.onchange = () => {
      pomoActiveSubject = subjectSelect.value;
      try { localStorage.setItem('startpage_revision_subject', pomoActiveSubject); } catch {}
      if (typeof showToast === 'function') {
        showToast(`Matière active : ${pomoActiveSubject}`, 'info');
      }
    };
  }

  // Bouton vider l'historique
  const clearHistoryBtn = document.getElementById('revision-clear-history-btn');
  if (clearHistoryBtn) {
    clearHistoryBtn.onclick = (e) => {
      e.preventDefault();
      if (confirm('Voulez-vous effacer l\'historique de vos révisions ?')) {
        try { localStorage.setItem('startpage_revision_history', '[]'); } catch {}
        renderRevisionHistory();
        if (typeof showToast === 'function') showToast('Historique effacé', 'info');
      }
    };
  }

  // Bouton test carillon
  const chimeBtn = document.getElementById('pomo-test-chime-btn');
  if (chimeBtn) {
    chimeBtn.onclick = (e) => {
      e.preventDefault();
      playPomoChime();
      if (typeof showToast === 'function') showToast('Carillon zen joué 🔔', 'info');
    };
  }

  // Champ d'objectif de session
  const taskInput = document.getElementById('pomo-task-input');
  const taskClearBtn = document.getElementById('pomo-task-clear-btn');
  if (taskInput) {
    try {
      const savedTask = localStorage.getItem('startpage_pomo_task') || '';
      taskInput.value = savedTask;
      if (taskClearBtn) taskClearBtn.classList.toggle('visible', savedTask.length > 0);
    } catch {}

    taskInput.oninput = () => {
      try {
        localStorage.setItem('startpage_pomo_task', taskInput.value.trim());
      } catch {}
      if (taskClearBtn) taskClearBtn.classList.toggle('visible', taskInput.value.trim().length > 0);
    };
  }

  if (taskClearBtn && taskInput) {
    taskClearBtn.onclick = (e) => {
      e.preventDefault();
      taskInput.value = '';
      try { localStorage.removeItem('startpage_pomo_task'); } catch {}
      taskClearBtn.classList.remove('visible');
      taskInput.focus();
    };
  }

  // Écouteur clavier unique
  if (!pomoWidgetInitialized) {
    pomoWidgetInitialized = true;
    document.addEventListener('keydown', (e) => {
      const pomoView = document.getElementById('deck-view-pomodoro');
      if (!pomoView || pomoView.hidden || !pomoView.classList.contains('active')) return;

      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (pomoIsRunning) pausePomoTimer();
        else startPomoTimer();
      } else if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        resetPomoTimer();
        if (typeof showToast === 'function') showToast('Minuteur réinitialisé', 'info');
      } else if (e.code === 'KeyS' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        skipPomoStep();
      }
    });
  }

  updatePomoUI();
  renderWeeklyRevisionChart();
  renderRevisionHistory();
}

/* ========================================================
   2. BLOC-NOTES RAPIDE (SCRATCHPAD) & APERÇU MARKDOWN
   ======================================================== */
function renderMarkdownToHtml(md) {
  if (!md || !md.trim()) {
    return '<p class="notes-preview-empty"><em>Aucune note à afficher. Désactivez l\'aperçu pour rédiger.</em></p>';
  }

  // 1. Échappement HTML initial pour prévenir tout XSS
  let text = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Blocs de code ```lang ... ```
  text = text.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="md-code-block"><div class="md-code-header">${lang || 'code'}</div><code>${code.trim()}</code></pre>`;
  });

  // 3. Titres (# h1, ## h2, ### h3, #### h4)
  text = text.replace(/^#### (.*$)/gim, '<h4 class="md-h4">$1</h4>');
  text = text.replace(/^### (.*$)/gim, '<h3 class="md-h3">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="md-h2">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="md-h1">$1</h1>');

  // 4. Lignes horizontales
  text = text.replace(/^---$/gim, '<hr class="md-hr" />');

  // 5. Citations / Blockquotes
  text = text.replace(/^\> (.*$)/gim, '<blockquote class="md-quote">$1</blockquote>');

  // 6. Checkboxes: - [ ] et - [x]
  text = text.replace(/^- \[x\] (.*$)/gim, '<div class="md-task-item done"><i class="fa-solid fa-square-check"></i> <span>$1</span></div>');
  text = text.replace(/^- \[ \] (.*$)/gim, '<div class="md-task-item"><i class="fa-regular fa-square"></i> <span>$1</span></div>');

  // 7. Listes à puces
  text = text.replace(/^\- (.*$)/gim, '<li class="md-li">$1</li>');
  text = text.replace(/^\* (.*$)/gim, '<li class="md-li">$1</li>');

  // 8. Code en ligne `code`
  text = text.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

  // 9. Gras **text** et Italique *text*
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

  // 10. Liens [label](url) avec validation http/https
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1 <i class="fa-solid fa-arrow-up-right-from-square fa-2xs"></i></a>');

  // 11. Sauts de ligne simples dans les paragraphes
  text = text.replace(/\n\n+/g, '</p><p class="md-p">');
  text = text.replace(/\n/g, '<br />');

  return `<div class="md-content"><p class="md-p">${text}</p></div>`;
}
window.renderMarkdownToHtml = renderMarkdownToHtml;

function updateNotesStats(text) {
  const statsInfoEl = document.getElementById('notes-stats-info');
  const wordCountEl = document.getElementById('notes-word-count');
  const charCountEl = document.getElementById('notes-char-count');

  const safeText = typeof text === 'string' ? text : '';
  const chars = safeText.length;
  const words = safeText.trim() ? safeText.trim().split(/\s+/).length : 0;

  if (statsInfoEl) {
    statsInfoEl.textContent = `${words} ${words > 1 ? 'mots' : 'mot'} • ${chars} car.`;
  }
  if (wordCountEl) wordCountEl.textContent = words;
  if (charCountEl) charCountEl.textContent = chars;
}

function initNotesWidget() {
  if (document.querySelector('.studio-container') || window.initStudio) {
    return;
  }
  const textarea = document.getElementById('notes-editor') || document.getElementById('notes-textarea');
  const preview = document.getElementById('notes-preview');
  const markdownToggleBtn = document.getElementById('notes-markdown-toggle');
  const copyBtn = document.getElementById('notes-copy-btn') || document.getElementById('notes-btn-copy');
  const downloadBtn = document.getElementById('notes-download-btn') || document.getElementById('notes-btn-download');
  const clearBtn = document.getElementById('notes-clear-btn') || document.getElementById('notes-btn-clear');
  const statusText = document.getElementById('notes-status-text');

  if (!textarea) return;

  let isPreviewMode = false;
  const saved = localStorage.getItem('startpage_scratchpad_v2') || localStorage.getItem('startpage_scratchpad') || '';
  textarea.value = saved;
  updateNotesStats(saved);

  let saveTimer = null;
  textarea.addEventListener('input', () => {
    updateNotesStats(textarea.value);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      localStorage.setItem('startpage_scratchpad_v2', textarea.value);
      localStorage.setItem('startpage_scratchpad', textarea.value);
    }, 300);
  });

  // Bascule du mode aperçu Markdown
  if (markdownToggleBtn && preview) {
    markdownToggleBtn.addEventListener('click', () => {
      isPreviewMode = !isPreviewMode;
      if (isPreviewMode) {
        preview.innerHTML = renderMarkdownToHtml(textarea.value);
        textarea.hidden = true;
        preview.hidden = false;
        markdownToggleBtn.classList.add('active');
        markdownToggleBtn.title = 'Revenir au mode Édition';
        if (statusText) statusText.textContent = 'Mode Aperçu Markdown';
      } else {
        textarea.hidden = false;
        preview.hidden = true;
        markdownToggleBtn.classList.remove('active');
        markdownToggleBtn.title = 'Basculer aperçu Markdown';
        if (statusText) statusText.textContent = 'Sauvegarde locale active';
        textarea.focus();
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      if (!textarea.value.trim()) return;
      try {
        await navigator.clipboard.writeText(textarea.value);
        if (typeof showToast === 'function') showToast('Notes copiées dans le presse-papier !', 'success');
      } catch {
        textarea.select();
        document.execCommand('copy');
        if (typeof showToast === 'function') showToast('Notes copiées !', 'success');
      }
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (!textarea.value.trim()) {
        if (typeof showToast === 'function') showToast('Le bloc-notes est vide.', 'info');
        return;
      }
      const blob = new Blob([textarea.value], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notes_startpage_${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!textarea.value.trim()) return;
      if (confirm('Voulez-vous vraiment effacer l\'ensemble de vos notes ?')) {
        textarea.value = '';
        if (preview) preview.innerHTML = renderMarkdownToHtml('');
        localStorage.removeItem('startpage_scratchpad_v2');
        localStorage.removeItem('startpage_scratchpad');
        updateNotesStats('');
        if (typeof showToast === 'function') showToast('Notes effacées', 'info');
      }
    });
  }
}

/* ========================================================
   3. AMBIANCE SONORE & VISUALISEUR
   ======================================================== */
let ambientAudioCtx = null;
let ambientGainNode = null;
let ambientSourceNode = null;
let ambientCurrentMode = 'rain';
let ambientIsPlaying = false;
let ambientVisualizerReq = null;
let ambientRadioAudio = null;

function createRainAudioNode(ctx) {
  // Générateur procédural de pluie avec bruits blancs & filtrage
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.45;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1200;

  noise.connect(filter);
  return { source: noise, output: filter };
}

function createBrownNoiseNode(ctx) {
  // Générateur procédural de bruit brun
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 650;

  noise.connect(filter);
  return { source: noise, output: filter };
}

function drawAmbientVisualizer() {
  const canvas = document.getElementById('ambient-waves-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  const bars = 22;
  const barWidth = w / bars - 4;
  const accent = getComputedStyle(document.body).getPropertyValue('--accent-primary').trim() || '#a78bfa';

  for (let i = 0; i < bars; i++) {
    const heightRatio = ambientIsPlaying ? Math.sin(Date.now() * 0.006 + i * 0.45) * 0.38 + 0.52 : 0.08;
    const barHeight = Math.max(3, heightRatio * (h - 10));
    const x = i * (barWidth + 4) + 2;
    const y = h - barHeight;

    ctx.fillStyle = accent;
    ctx.globalAlpha = ambientIsPlaying ? 0.75 + Math.random() * 0.2 : 0.25;
    ctx.fillRect(x, y, barWidth, barHeight);
  }

  if (ambientVisualizerReq) cancelAnimationFrame(ambientVisualizerReq);
  if (ambientIsPlaying) {
    ambientVisualizerReq = requestAnimationFrame(drawAmbientVisualizer);
  }
}

function startAmbientSound() {
  stopAmbientSound();

  const volSlider = document.getElementById('ambient-vol-slider');
  const volume = volSlider ? Number(volSlider.value) : 0.5;

  if (ambientCurrentMode === 'lofi') {
    if (!ambientRadioAudio) {
      ambientRadioAudio = new Audio('https://stream.zeno.fm/f3wvbbqmdg8uv');
      ambientRadioAudio.crossOrigin = 'anonymous';
    }
    ambientRadioAudio.volume = volume;
    ambientRadioAudio.play().catch((err) => {
      console.warn('Lecture flux radio restreinte :', err);
    });
    ambientIsPlaying = true;
    updateAmbientUI();
    drawAmbientVisualizer();
    return;
  }

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ambientAudioCtx = new AudioCtx();
    if (ambientAudioCtx.state === 'suspended') {
      ambientAudioCtx.resume().catch(() => {});
    }
    ambientGainNode = ambientAudioCtx.createGain();
    ambientGainNode.gain.setValueAtTime(volume * 0.35, ambientAudioCtx.currentTime);

    let generator = null;
    if (ambientCurrentMode === 'rain') {
      generator = createRainAudioNode(ambientAudioCtx);
    } else if (ambientCurrentMode === 'storm') {
      generator = createRainAudioNode(ambientAudioCtx);
      const biquad = ambientAudioCtx.createBiquadFilter();
      biquad.type = 'lowshelf';
      biquad.frequency.value = 180;
      biquad.gain.value = 12;
      generator.output.connect(biquad);
      generator.output = biquad;
    } else if (ambientCurrentMode === 'space') {
      generator = createBrownNoiseNode(ambientAudioCtx);
      const biquad = ambientAudioCtx.createBiquadFilter();
      biquad.type = 'lowpass';
      biquad.frequency.value = 220;
      generator.output.connect(biquad);
      generator.output = biquad;
    } else if (ambientCurrentMode === 'night') {
      generator = createRainAudioNode(ambientAudioCtx);
      const biquad = ambientAudioCtx.createBiquadFilter();
      biquad.type = 'bandpass';
      biquad.frequency.value = 1600;
      biquad.Q.value = 2.5;
      generator.output.connect(biquad);
      generator.output = biquad;
    } else {
      generator = createBrownNoiseNode(ambientAudioCtx);
    }

    ambientSourceNode = generator.source;
    generator.output.connect(ambientGainNode);
    ambientGainNode.connect(ambientAudioCtx.destination);
    ambientSourceNode.start(0);

    ambientIsPlaying = true;
    updateAmbientUI();
    drawAmbientVisualizer();
  } catch (err) {
    console.warn('Erreur Web Audio :', err);
  }
}

function stopAmbientSound() {
  ambientIsPlaying = false;
  if (ambientVisualizerReq) cancelAnimationFrame(ambientVisualizerReq);

  if (ambientSourceNode) {
    try { ambientSourceNode.stop(); } catch {}
    ambientSourceNode = null;
  }
  if (ambientAudioCtx) {
    try { ambientAudioCtx.close(); } catch {}
    ambientAudioCtx = null;
  }
  if (ambientRadioAudio) {
    ambientRadioAudio.pause();
  }

  updateAmbientUI();
  drawAmbientVisualizer();
}

function updateAmbientUI() {
  const masterBtn = document.getElementById('ambient-master-toggle');
  const masterIcon = document.getElementById('ambient-master-icon');
  const masterLabel = document.getElementById('ambient-master-label');
  const nowPlaying = document.getElementById('ambient-now-playing');

  if (masterBtn) masterBtn.classList.toggle('playing', ambientIsPlaying);
  if (masterIcon) {
    masterIcon.className = ambientIsPlaying ? 'fa-solid fa-stop' : 'fa-solid fa-play';
  }
  if (masterLabel) {
    masterLabel.textContent = ambientIsPlaying ? 'Arrêter' : 'Écouter';
  }

  if (nowPlaying) {
    let modeLabel = 'Pluie Cyber';
    if (ambientCurrentMode === 'brown') modeLabel = 'Bruit Brun (Focus)';
    if (ambientCurrentMode === 'lofi') modeLabel = 'Radio Lo-Fi Chill';
    if (ambientCurrentMode === 'storm') modeLabel = 'Orage Néon';
    if (ambientCurrentMode === 'space') modeLabel = 'Deep Space';
    if (ambientCurrentMode === 'night') modeLabel = 'Nuit Synthé';
    nowPlaying.textContent = ambientIsPlaying ? `En lecture : ${modeLabel}` : 'Générateur Procédural Audio';
  }

  const topbarAmbientText = document.getElementById('topbar-ambient-text');
  if (topbarAmbientText) {
    topbarAmbientText.textContent = ambientIsPlaying ? 'En lecture ♪' : 'Audio';
  }

  // Synchronisation du badge et des boutons rapides d'ambiance dans la vue Pomodoro
  const pomoLiveTag = document.getElementById('pomo-ambient-live-tag');
  if (pomoLiveTag) {
    let modeLabel = 'Pluie';
    if (ambientCurrentMode === 'brown') modeLabel = 'Bruit Brun';
    if (ambientCurrentMode === 'lofi') modeLabel = 'Café Lo-Fi';
    if (ambientCurrentMode === 'space') modeLabel = 'Espace';
    pomoLiveTag.textContent = ambientIsPlaying ? `En écoute : ${modeLabel} ♪` : 'Audio Inactif';
    pomoLiveTag.classList.toggle('playing', ambientIsPlaying);
  }
  document.querySelectorAll('.pomo-quick-ambient-btn').forEach((b) => {
    b.classList.toggle('active', ambientIsPlaying && b.dataset.ambientMode === ambientCurrentMode);
  });
}

function initAmbientWidget() {
  const masterBtn = document.getElementById('ambient-master-toggle');
  const volSlider = document.getElementById('ambient-vol-slider');

  const savedMode = localStorage.getItem('startpage_ambient_mode');
  if (savedMode) {
    ambientCurrentMode = savedMode;
  }
  document.querySelectorAll('.ambient-mode-card').forEach((c) => {
    c.classList.toggle('active', c.dataset.ambientMode === ambientCurrentMode);
  });

  const savedVol = localStorage.getItem('startpage_ambient_vol');
  if (savedVol !== null && volSlider) {
    volSlider.value = savedVol;
  }

  if (masterBtn) {
    masterBtn.onclick = (e) => {
      e.preventDefault();
      if (ambientIsPlaying) stopAmbientSound();
      else startAmbientSound();
    };
  }

  if (volSlider) {
    volSlider.oninput = () => {
      const vol = Number(volSlider.value);
      localStorage.setItem('startpage_ambient_vol', volSlider.value);
      if (ambientGainNode && ambientAudioCtx) {
        ambientGainNode.gain.setValueAtTime(vol * 0.35, ambientAudioCtx.currentTime);
      }
      if (ambientRadioAudio) {
        ambientRadioAudio.volume = vol;
      }
    };
  }

  document.querySelectorAll('.ambient-mode-card').forEach((card) => {
    card.onclick = (e) => {
      e.preventDefault();
      ambientCurrentMode = card.dataset.ambientMode;
      localStorage.setItem('startpage_ambient_mode', ambientCurrentMode);
      document.querySelectorAll('.ambient-mode-card').forEach((c) => {
        c.classList.toggle('active', c.dataset.ambientMode === ambientCurrentMode);
      });
      if (ambientIsPlaying) startAmbientSound();
      else updateAmbientUI();
    };
  });

  updateAmbientUI();
  drawAmbientVisualizer();
}

/* ========================================================
   4. MONITEUR SYSTÈME & MARCHÉS BOURSIERS
   ======================================================== */
const sessionStartTime = Date.now();
const pingHistory = [];
const MAX_PING_HISTORY = 12;

function renderPingSparkline() {
  const svg = document.getElementById('sys-ping-sparkline');
  if (!svg || pingHistory.length < 2) return;

  const w = 100;
  const h = 24;
  const pad = 2;

  const min = Math.min(...pingHistory);
  const max = Math.max(...pingHistory);
  const range = max === min ? 1 : (max - min);

  const points = pingHistory.map((val, idx) => {
    const x = pad + (idx / (pingHistory.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((val - min) / range) * (h - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const firstX = pad;
  const lastX = (w - pad);
  const areaPath = `M ${points.join(' L ')} L ${lastX},${h} L ${firstX},${h} Z`;

  const lineEl = svg.querySelector('.ping-spark-line');
  const areaEl = svg.querySelector('.ping-spark-area');

  if (lineEl) lineEl.setAttribute('d', linePath);
  if (areaEl) areaEl.setAttribute('d', areaPath);
}

async function checkNetworkPing() {
  const valEl = document.getElementById('sys-ping-val');
  const dotEl = document.getElementById('sys-ping-dot');
  const stateEl = document.getElementById('sys-ping-state');
  if (!valEl) return;

  const start = performance.now();
  let latency = 0;
  let isOnline = navigator.onLine !== false;
  let measurementSuccess = false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    await fetch('https://1.1.1.1/cdn-cgi/trace', {
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    latency = Math.max(8, Math.round(performance.now() - start));
    measurementSuccess = true;
  } catch {
    measurementSuccess = false;
  }

  if (measurementSuccess) {
    pingHistory.push(latency);
    if (pingHistory.length > MAX_PING_HISTORY) pingHistory.shift();
    renderPingSparkline();

    valEl.textContent = `${latency} ms`;
    if (dotEl) {
      dotEl.className = 'telemetry-indicator ' + (latency < 80 ? 'good' : latency < 160 ? 'fair' : 'poor');
    }
    if (stateEl) {
      stateEl.textContent = latency < 80 ? 'Connexion excellente' : latency < 160 ? 'Connexion fluide' : 'Latence moyenne';
    }
  } else if (isOnline) {
    pingHistory.push(28);
    if (pingHistory.length > MAX_PING_HISTORY) pingHistory.shift();
    renderPingSparkline();

    valEl.textContent = 'En ligne';
    if (dotEl) dotEl.className = 'telemetry-indicator good';
    if (stateEl) stateEl.textContent = 'Connecté (Ping non mesurable)';
  } else {
    valEl.textContent = 'Hors-ligne';
    if (dotEl) dotEl.className = 'telemetry-indicator poor';
    if (stateEl) stateEl.textContent = 'Vérifiez le réseau';
  }
}

async function initBatteryMonitor() {
  const valEl = document.getElementById('sys-bat-val');
  const iconEl = document.getElementById('sys-bat-icon');
  const stateEl = document.getElementById('sys-bat-state');
  const labelEl = document.getElementById('sys-power-label');
  if (!valEl) return;

  let hasRealBattery = false;

  if (typeof navigator.getBattery === 'function') {
    try {
      const bat = await navigator.getBattery();
      if (bat && typeof bat.level === 'number' && !isNaN(bat.level)) {
        hasRealBattery = true;
        const updateBat = () => {
          const pct = Math.round(bat.level * 100);
          valEl.textContent = `${pct}%`;
          if (labelEl) labelEl.innerHTML = '<i class="fa-solid fa-battery-half"></i> Batterie';
          if (stateEl) {
            stateEl.textContent = bat.charging ? 'En charge (Secteur)' : 'Sur batterie';
          }
          if (iconEl) {
            if (bat.charging) {
              iconEl.className = 'fa-solid fa-bolt telemetry-bat-icon charging';
            } else if (pct > 75) {
              iconEl.className = 'fa-solid fa-battery-full telemetry-bat-icon';
            } else if (pct > 40) {
              iconEl.className = 'fa-solid fa-battery-half telemetry-bat-icon';
            } else {
              iconEl.className = 'fa-solid fa-battery-quarter telemetry-bat-icon low';
            }
          }
        };
        updateBat();
        bat.addEventListener('levelchange', updateBat);
        bat.addEventListener('chargingchange', updateBat);
        return;
      }
    } catch {
      hasRealBattery = false;
    }
  }

  // Si pas de batterie disponible (PC Tour Fixe, Linux, Firefox sans API batterie) :
  // On adapte élégamment pour afficher l'alimentation secteur fiable et propre
  if (labelEl) labelEl.innerHTML = '<i class="fa-solid fa-plug"></i> Alimentation';
  if (iconEl) iconEl.className = 'fa-solid fa-plug telemetry-bat-icon ac-power';
  valEl.textContent = 'Secteur AC';
  const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : 'Station PC';
  if (stateEl) stateEl.textContent = `PC Fixe • ${cores} • 100% Stable`;
}

function updateHardwareInfo() {
  const hwVal = document.getElementById('sys-hardware-val');
  const hwSub = document.getElementById('sys-hardware-sub');
  if (!hwVal) return;

  const cores = navigator.hardwareConcurrency || 8;
  hwVal.textContent = `${cores} Cores CPU`;
  const ram = navigator.deviceMemory ? `${navigator.deviceMemory} Go RAM` : 'Système 64-bit';
  if (hwSub) hwSub.textContent = `${ram} • Multitâche fluide`;
}

function updateSessionUptime() {
  const uptimeEl = document.getElementById('sys-uptime-val');
  if (!uptimeEl) return;

  const diffSec = Math.floor((Date.now() - sessionStartTime) / 1000);
  const h = String(Math.floor(diffSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
  const s = String(diffSec % 60).padStart(2, '0');

  uptimeEl.textContent = diffSec >= 3600 ? `${h}h ${m}m` : `${m}m ${s}s`;
}

function initSystemWidget() {
  if (typeof initMarkets === 'function') {
    initMarkets();
  }
}

/* ========================================================
   5. CITATIONS CYBERPUNK & MOTIVATION DEV
   ======================================================== */
const CYBER_QUOTES = [
  { text: "The sky above the port was the color of television, tuned to a dead channel.", author: "William Gibson", source: "Neuromancer" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds", source: "Linux Kernel" },
  { text: "Information wants to be free. Information also wants to be expensive.", author: "Stewart Brand", source: "Hackers Conference" },
  { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke", source: "Third Law" },
  { text: "The Analytical Engine weaves algebraic patterns just as the Jacquard loom weaves flowers.", author: "Ada Lovelace", source: "Notes" },
  { text: "We can only see a short distance ahead, but we can see plenty there that needs to be done.", author: "Alan Turing", source: "Computing Machinery" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson", source: "Programming Lore" },
  { text: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra", source: "EWD498" },
  { text: "It's hardware that makes a machine fast. It's software that makes a fast machine slow.", author: "Craig Bruce", source: "Software Aphorisms" },
  { text: "Cyberspace. A consensual hallucination experienced daily by billions of legitimate operators.", author: "William Gibson", source: "Neuromancer" },
  { text: "There are only two hard things in Computer Science: cache invalidation and naming things.", author: "Phil Karlton", source: "Classic" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck", source: "Extreme Programming" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay", source: "Xerox PARC" }
];

let currentQuoteIndex = 0;
let allQuotes = [];

function loadAllQuotes() {
  let custom = [];
  try {
    const saved = localStorage.getItem('startpage_custom_quotes');
    if (saved) custom = JSON.parse(saved);
  } catch {
    custom = [];
  }
  allQuotes = [...CYBER_QUOTES, ...custom];
}

function renderQuote(index) {
  if (allQuotes.length === 0) loadAllQuotes();
  const quote = allQuotes[index % allQuotes.length];
  const textEl = document.getElementById('quote-text');
  const authorEl = document.getElementById('quote-author');
  const sourceEl = document.getElementById('quote-source');
  const deleteBtn = document.getElementById('quote-btn-delete');

  if (textEl) textEl.textContent = `"${quote.text}"`;
  if (authorEl) authorEl.textContent = quote.author;
  if (sourceEl) sourceEl.textContent = quote.source || (quote.isCustom ? 'Personnel' : '');

  if (deleteBtn) {
    deleteBtn.hidden = !quote.isCustom;
  }
}

function initQuotesWidget() {
  loadAllQuotes();
  currentQuoteIndex = Math.floor(Math.random() * allQuotes.length);
  renderQuote(currentQuoteIndex);

  const nextBtn = document.getElementById('quote-btn-next');
  const copyBtn = document.getElementById('quote-btn-copy');
  const addBtn = document.getElementById('quote-btn-add');
  const deleteBtn = document.getElementById('quote-btn-delete');
  const addModal = document.getElementById('quote-add-modal');
  const addForm = document.getElementById('quote-add-form');
  const addCloseBtn = document.getElementById('quote-add-close');
  const addCancelBtn = document.getElementById('quote-add-cancel');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentQuoteIndex = (currentQuoteIndex + 1) % allQuotes.length;
      renderQuote(currentQuoteIndex);
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const q = allQuotes[currentQuoteIndex];
      const str = `"${q.text}" — ${q.author}${q.source ? ` (${q.source})` : ''}`;
      try {
        await navigator.clipboard.writeText(str);
        if (typeof showToast === 'function') showToast('Citation copiée !', 'success');
      } catch {
        if (typeof showToast === 'function') showToast('Copié !', 'info');
      }
    });
  }

  if (addBtn && addModal) {
    addBtn.addEventListener('click', () => {
      addModal.hidden = !addModal.hidden;
      if (!addModal.hidden) {
        document.getElementById('quote-new-text')?.focus();
      }
    });
  }

  if (addCloseBtn && addModal) {
    addCloseBtn.addEventListener('click', () => { addModal.hidden = true; });
  }

  if (addCancelBtn && addModal) {
    addCancelBtn.addEventListener('click', () => { addModal.hidden = true; });
  }

  if (addForm && addModal) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const textInput = document.getElementById('quote-new-text');
      const authorInput = document.getElementById('quote-new-author');
      const sourceInput = document.getElementById('quote-new-source');

      const text = textInput ? textInput.value.trim() : '';
      const author = authorInput ? authorInput.value.trim() : '';
      const source = sourceInput ? sourceInput.value.trim() : '';

      if (!text || !author) return;

      let custom = [];
      try {
        custom = JSON.parse(localStorage.getItem('startpage_custom_quotes') || '[]');
      } catch {
        custom = [];
      }

      const newQuote = {
        id: Date.now(),
        text,
        author,
        source: source || 'Personnalisée',
        isCustom: true
      };

      custom.push(newQuote);
      localStorage.setItem('startpage_custom_quotes', JSON.stringify(custom));
      loadAllQuotes();

      currentQuoteIndex = allQuotes.length - 1;
      renderQuote(currentQuoteIndex);

      addForm.reset();
      addModal.hidden = true;
      if (typeof showToast === 'function') showToast('Citation personnalisée ajoutée !', 'success');
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const q = allQuotes[currentQuoteIndex];
      if (!q || !q.isCustom) return;

      if (confirm('Supprimer cette citation personnalisée ?')) {
        let custom = [];
        try {
          custom = JSON.parse(localStorage.getItem('startpage_custom_quotes') || '[]');
        } catch {
          custom = [];
        }

        custom = custom.filter((item) => item.id !== q.id && item.text !== q.text);
        localStorage.setItem('startpage_custom_quotes', JSON.stringify(custom));
        loadAllQuotes();

        currentQuoteIndex = 0;
        renderQuote(currentQuoteIndex);
        if (typeof showToast === 'function') showToast('Citation supprimée', 'info');
      }
    });
  }
}

/* ========================================================
   INITIALISATION GLOBALE DU MODULE WIDGETS
   ======================================================== */
function initWidgets() {
  loadWidgetSettings();
  applyWidgetVisibility();

  initPomodoroWidget();
  initNotesWidget();
  initAmbientWidget();
  initSystemWidget();
  initQuotesWidget();

  // Écouteurs dans le centre de personnalisation (onglet Widgets)
  const allWidgetKeys = ['agenda', 'weather', 'feeds', 'system', 'pomodoro', 'notes', 'quotes'];
  const widgetLabels = {
    agenda: 'Agenda & Tâches',
    weather: 'Météo & Radar',
    feeds: 'Actualités',
    system: 'Système & Bourse',
    pomodoro: 'Focus & Ambiance Lo-Fi',
    notes: 'Bloc-Notes',
    quotes: 'Citations'
  };

  allWidgetKeys.forEach((key) => {
    const toggle = document.getElementById(`widget-toggle-${key}`);
    if (toggle) {
      toggle.addEventListener('change', () => {
        const isChecked = toggle.checked;
        currentWidgetSettings[key] = isChecked;
        localStorage.setItem('startpage_widget_settings', JSON.stringify(currentWidgetSettings));
        setTabVisibilityWithAnimation(key, isChecked, () => {
          if (typeof showToast === 'function') {
            const name = widgetLabels[key] || key;
            showToast(`Onglet "${name}" ${isChecked ? 'affiché dans la barre latérale' : 'masqué de la barre latérale'}`, isChecked ? 'success' : 'info');
          }
        });
      });
    }
  });
}

function setTabVisibilityWithAnimation(key, isEnabled, callback) {
  const navBtn = document.querySelector(`.deck-nav-btn[data-deck-view="${key}"]`);
  if (!navBtn) {
    if (callback) callback();
    return;
  }

  const animSettings = typeof getAnimationSettings === 'function' ? getAnimationSettings() : {};
  const tabAnim = animSettings.tabAnim || 'scale-pop';

  if (tabAnim === 'instant' || tabAnim === 'none') {
    if (isEnabled) {
      navBtn.classList.remove('tab-hidden');
      navBtn.style.removeProperty('display');
    } else {
      navBtn.classList.add('tab-hidden');
      navBtn.style.setProperty('display', 'none', 'important');
    }
    const activeNavBtn = document.querySelector('.deck-nav-btn.active');
    if (!isEnabled && activeNavBtn && activeNavBtn === navBtn) {
      const homeBtn = document.querySelector('.deck-nav-btn[data-deck-view="dashboard"]');
      if (homeBtn) homeBtn.click();
    } else if (activeNavBtn && typeof updateDeckIndicator === 'function') {
      updateDeckIndicator(activeNavBtn);
    }
    if (callback) callback();
    return;
  }

  const enterClass = `tab-anim-enter-${tabAnim}`;
  const exitClass = `tab-anim-exit-${tabAnim}`;

  if (isEnabled) {
    navBtn.classList.remove('tab-hidden', exitClass);
    navBtn.style.removeProperty('display');
    navBtn.classList.add(enterClass);

    setTimeout(() => {
      navBtn.classList.remove(enterClass);
      const activeNavBtn = document.querySelector('.deck-nav-btn.active');
      if (activeNavBtn && typeof updateDeckIndicator === 'function') {
        updateDeckIndicator(activeNavBtn);
      }
      if (callback) callback();
    }, 320);
  } else {
    navBtn.classList.remove(enterClass);
    navBtn.classList.add(exitClass);

    setTimeout(() => {
      navBtn.classList.remove(exitClass);
      navBtn.classList.add('tab-hidden');
      navBtn.style.setProperty('display', 'none', 'important');

      const activeNavBtn = document.querySelector('.deck-nav-btn.active');
      if (activeNavBtn && activeNavBtn === navBtn) {
        const homeBtn = document.querySelector('.deck-nav-btn[data-deck-view="dashboard"]');
        if (homeBtn) homeBtn.click();
      } else if (activeNavBtn && typeof updateDeckIndicator === 'function') {
        updateDeckIndicator(activeNavBtn);
      }
      if (callback) callback();
    }, 260);
  }
}



// Auto-initialisation immédiate et indépendante de widgets.js
(function autoInitWidgets() {
  function run() {
    try { initPomodoroWidget(); } catch (e) {}
    try { initAmbientWidget(); } catch (e) {}
    try { renderWeeklyRevisionChart(); } catch (e) {}
    try { renderRevisionHistory(); } catch (e) {}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
