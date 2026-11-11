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
/* ========================================================
   1. STUDIO FOCUSO POMODORO & SUIVI D'ACTIVITÉ (INSPIRÉ DE FOCUSO)
   ======================================================== */

let FOCUSO_DURATIONS = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60
};

// Restauration des durées personnalisées
try {
  const savedDurations = JSON.parse(localStorage.getItem('focuso_durations') || '{}');
  if (savedDurations.focus) FOCUSO_DURATIONS.focus = savedDurations.focus;
  if (savedDurations.short) FOCUSO_DURATIONS.short = savedDurations.short;
  if (savedDurations.long) FOCUSO_DURATIONS.long = savedDurations.long;
} catch {}

let focusoMode = 'focus'; // 'focus' | 'short' | 'long'
let focusoTimeLeft = FOCUSO_DURATIONS.focus;
let focusoIsRunning = false;
let focusoTimerInterval = null;
let focusoEndTime = 0;
let focusoCompletedCount = 0;
let focusoSound = 'zen';
let focusoAutoBreak = false;
let focusoStrictMode = false;
let focusoSelectedPreset = 25;
let focusoCalDate = new Date();
let focusoSelectedDayKey = new Date().toISOString().split('T')[0];

let focusoActiveTask = {
  id: 'task-1',
  title: 'Design User Interface (UI)',
  completed: 0,
  target: 4,
  category: 'design'
};

let focusoTasks = [
  { id: 'task-1', title: 'Design User Interface (UI)', completed: 0, target: 4, category: 'design' },
  { id: 'task-2', title: 'Market Research & Analysis', completed: 1, target: 5, category: 'study' },
  { id: 'task-3', title: 'Développement Frontend Web', completed: 2, target: 6, category: 'code' },
  { id: 'task-4', title: 'Rédaction Rapport & Synthèse', completed: 0, target: 3, category: 'write' }
];

// Chargement initial depuis localStorage
try {
  focusoCompletedCount = Number(localStorage.getItem('focuso_completed_count') || 0);
  focusoSound = localStorage.getItem('focuso_sound') || 'zen';
  focusoAutoBreak = localStorage.getItem('focuso_autobreak') === 'true';
  const savedTasks = JSON.parse(localStorage.getItem('focuso_tasks') || 'null');
  if (savedTasks && Array.isArray(savedTasks) && savedTasks.length > 0) {
    focusoTasks = savedTasks;
    focusoActiveTask = focusoTasks[0];
  }
} catch {}

// Audio Web Audio API pour les carillons Focuso
function playFocusoChime(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    const soundType = type || focusoSound;

    if (soundType === 'zen') {
      // Bol tibétain & Gong zen harmonique (216Hz, 432Hz, 648Hz)
      [216, 432, 648].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18 / (idx + 1), now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.5);
      });
    } else if (soundType === 'chime') {
      // Carillon cristallin C5-E5-G5-C6
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        const st = now + idx * 0.12;
        gain.gain.setValueAtTime(0, st);
        gain.gain.linearRampToValueAtTime(0.14, st + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(st);
        osc.stop(st + 0.95);
      });
    } else if (soundType === 'bell') {
      // Cloche douce
      [880, 1760].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15 / (idx + 1), now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.25);
      });
    } else {
      // Bip digital synthétique discret
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    }
  } catch (err) {
    console.warn('Audio Focuso bloqué ou non disponible :', err);
  }
}

// Graduation radiale (Tick marks tout autour du cadran Focuso)
function renderFocusoTicks() {
  const group = document.getElementById('focuso-ticks-group');
  if (!group) return;
  let html = '';
  const cx = 180;
  const cy = 180;
  for (let i = 0; i < 60; i++) {
    const angle = (i * 6) * Math.PI / 180;
    const isMajor = i % 5 === 0;
    const rInner = isMajor ? 142 : 146;
    const rOuter = 153;
    const x1 = (cx + rInner * Math.sin(angle)).toFixed(1);
    const y1 = (cy - rInner * Math.cos(angle)).toFixed(1);
    const x2 = (cx + rOuter * Math.sin(angle)).toFixed(1);
    const y2 = (cy - rOuter * Math.cos(angle)).toFixed(1);
    html += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${isMajor ? 'major-tick' : ''}" />`;
  }
  group.innerHTML = html;
}

// Mise à jour de l'interface Focuso (Cadran, Digits, Tâches, Jalons)
function updateFocusoUI() {
  const digitsEl = document.getElementById('focuso-digits');
  const arcEl = document.getElementById('focuso-dial-arc');
  const playIcon = document.getElementById('focuso-play-icon');
  const playBtn = document.getElementById('focuso-btn-play');
  const modeBadgeLabel = document.getElementById('focuso-mode-label');
  const centerIcon = document.getElementById('focuso-center-icon');
  const subtitleEl = document.getElementById('focuso-subtitle');

  const m = String(Math.floor(focusoTimeLeft / 60)).padStart(2, '0');
  const s = String(focusoTimeLeft % 60).padStart(2, '0');
  const formatted = `${m}:${s}`;

  if (digitsEl) digitsEl.textContent = formatted;

  if (focusoIsRunning) {
    document.title = `(${formatted}) ${focusoMode === 'focus' ? 'Focus' : 'Pause'} • Startpage`;
  } else {
    document.title = 'Startpage';
  }

  // Animation de l'arc de cercle SVG (r=130 => circum=816.81)
  if (arcEl) {
    const circum = 816.81;
    const total = FOCUSO_DURATIONS[focusoMode] || 1500;
    const progress = Math.max(0, Math.min(1, (total - focusoTimeLeft) / total));
    arcEl.style.strokeDasharray = circum.toFixed(2);
    arcEl.style.strokeDashoffset = (circum * (1 - progress)).toFixed(2);
  }

  // Bouton Play / Pause
  if (playIcon) {
    playIcon.className = focusoIsRunning ? 'fa-solid fa-pause' : 'fa-solid fa-play';
  }
  if (playBtn) {
    playBtn.classList.toggle('running', focusoIsRunning);
  }

  // Badge du mode & Icône centrale
  if (modeBadgeLabel) {
    if (focusoMode === 'focus') modeBadgeLabel.textContent = 'Session Focus';
    else if (focusoMode === 'short') modeBadgeLabel.textContent = 'Pause Courte';
    else modeBadgeLabel.textContent = 'Pause Longue';
  }

  if (centerIcon) {
    if (focusoMode === 'focus') centerIcon.innerHTML = '<i class="fa-solid fa-brain"></i>';
    else if (focusoMode === 'short') centerIcon.innerHTML = '<i class="fa-solid fa-mug-hot"></i>';
    else centerIcon.innerHTML = '<i class="fa-solid fa-couch"></i>';
  }

  if (subtitleEl) {
    if (focusoMode === 'focus') subtitleEl.textContent = 'Stay Focused!';
    else subtitleEl.textContent = 'Take a Rest!';
  }

  // Jalons 4 points Focuso
  const dots = document.querySelectorAll('#focuso-milestone-dots .milestone-dot');
  const step = focusoCompletedCount % 4;
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx < step || (step === 0 && focusoCompletedCount > 0 && idx === 3));
  });

  // Tâche active dans la barre supérieure
  const taskTitleEl = document.getElementById('focuso-task-title');
  const taskProgressEl = document.getElementById('focuso-task-progress');
  const taskIconEl = document.getElementById('focuso-task-icon');

  if (taskTitleEl && focusoActiveTask) taskTitleEl.textContent = focusoActiveTask.title;
  if (taskProgressEl && focusoActiveTask) {
    const totalMins = focusoActiveTask.completed * Math.round(FOCUSO_DURATIONS.focus / 60);
    const targetMins = focusoActiveTask.target * Math.round(FOCUSO_DURATIONS.focus / 60);
    taskProgressEl.textContent = `${focusoActiveTask.completed}/${focusoActiveTask.target} sessions • ${totalMins}/${targetMins} min`;
  }
  if (taskIconEl && focusoActiveTask) {
    if (focusoActiveTask.category === 'code') taskIconEl.className = 'fa-solid fa-code';
    else if (focusoActiveTask.category === 'design') taskIconEl.className = 'fa-solid fa-paintbrush';
    else if (focusoActiveTask.category === 'write') taskIconEl.className = 'fa-solid fa-pen-nib';
    else taskIconEl.className = 'fa-solid fa-book-open';
  }

  // Rendu de la liste des tâches
  renderFocusoTasks();
}

// Commandes globales Focuso
window.focusoPlayPause = function() {
  if (focusoIsRunning) {
    focusoPause();
  } else {
    focusoStart();
  }
};

function focusoStart() {
  if (focusoIsRunning) return;
  focusoIsRunning = true;
  focusoEndTime = Date.now() + focusoTimeLeft * 1000;

  if (focusoTimerInterval) clearInterval(focusoTimerInterval);
  focusoTimerInterval = setInterval(() => {
    const remaining = Math.round((focusoEndTime - Date.now()) / 1000);
    if (remaining > 0) {
      focusoTimeLeft = remaining;
      updateFocusoUI();
    } else {
      focusoTimeLeft = 0;
      updateFocusoUI();
      onFocusoComplete();
    }
  }, 250);

  updateFocusoUI();
}

function focusoPause() {
  focusoIsRunning = false;
  if (focusoTimerInterval) clearInterval(focusoTimerInterval);
  focusoTimerInterval = null;
  updateFocusoUI();
}

window.focusoReset = function() {
  focusoPause();
  focusoTimeLeft = FOCUSO_DURATIONS[focusoMode] || (25 * 60);
  updateFocusoUI();
  if (typeof showToast === 'function') showToast('Session remise à zéro', 'info');
};

window.focusoSkip = function() {
  focusoPause();
  if (focusoMode === 'focus') {
    focusoMode = 'short';
  } else {
    focusoMode = 'focus';
  }
  focusoTimeLeft = FOCUSO_DURATIONS[focusoMode];
  updateFocusoUI();
  if (typeof showToast === 'function') {
    showToast(`Passage en ${focusoMode === 'focus' ? 'Session Focus' : 'Pause'}`, 'info');
  }
};

function onFocusoComplete() {
  focusoPause();
  playFocusoChime(focusoSound);

  if (focusoMode === 'focus') {
    focusoCompletedCount++;
    try { localStorage.setItem('focuso_completed_count', focusoCompletedCount); } catch {}

    if (focusoActiveTask) {
      focusoActiveTask.completed++;
      saveFocusoTasks();
    }

    // Enregistrement dans l'historique
    recordFocusoHistorySession({
      title: focusoActiveTask ? focusoActiveTask.title : 'Session Focus',
      duration: Math.round(FOCUSO_DURATIONS.focus / 60),
      timestamp: Date.now(),
      type: 'focus'
    });

    if (typeof showToast === 'function') {
      showToast('🎉 Bravo ! Session Focus complétée avec succès.', 'success');
    }

    if (focusoCompletedCount % 4 === 0) {
      focusoMode = 'long';
    } else {
      focusoMode = 'short';
    }
    focusoTimeLeft = FOCUSO_DURATIONS[focusoMode];
    updateFocusoUI();
    refreshFocusoReports();
    renderFocusoCalendar();

    if (focusoAutoBreak) {
      setTimeout(() => focusoStart(), 1000);
    }
  } else {
    if (typeof showToast === 'function') {
      showToast('⚡ Pause terminée ! Prêt à reprendre le focus.', 'info');
    }
    focusoMode = 'focus';
    focusoTimeLeft = FOCUSO_DURATIONS.focus;
    updateFocusoUI();
  }
}

// Enregistrement de session
function recordFocusoHistorySession(session) {
  try {
    const history = JSON.parse(localStorage.getItem('focuso_history_v2') || '[]');
    history.push(session);
    localStorage.setItem('focuso_history_v2', JSON.stringify(history));
  } catch {}
}

function getFocusoHistory() {
  try {
    const raw = localStorage.getItem('focuso_history_v2');
    if (raw) return JSON.parse(raw);
  } catch {}
  // Données de démonstration réalistes si vide
  const sample = [];
  const now = Date.now();
  const dayMs = 86400000;
  sample.push({ title: 'Design User Interface (UI)', duration: 25, timestamp: now - 3600000 * 2, type: 'focus' });
  sample.push({ title: 'Market Research & Analysis', duration: 25, timestamp: now - 3600000 * 4, type: 'focus' });
  sample.push({ title: 'Développement Frontend Web', duration: 50, timestamp: now - dayMs * 1, type: 'focus' });
  sample.push({ title: 'Rédaction Rapport & Synthèse', duration: 25, timestamp: now - dayMs * 2, type: 'focus' });
  sample.push({ title: 'Design Wireframe UI Kit', duration: 25, timestamp: now - dayMs * 3, type: 'focus' });
  return sample;
}

// Gestion des tâches Focuso
function saveFocusoTasks() {
  try {
    localStorage.setItem('focuso_tasks', JSON.stringify(focusoTasks));
  } catch {}
}

function renderFocusoTasks() {
  const listEl = document.getElementById('focuso-tasks-list');
  if (!listEl) return;
  let html = '';
  focusoTasks.forEach((t) => {
    const isActive = focusoActiveTask && focusoActiveTask.id === t.id;
    let iconClass = 'fa-solid fa-laptop-code';
    let dotColor = '#3b82f6';
    if (t.category === 'design') { iconClass = 'fa-solid fa-palette'; dotColor = '#f43f5e'; }
    else if (t.category === 'write') { iconClass = 'fa-solid fa-pen'; dotColor = '#f59e0b'; }
    else if (t.category === 'study') { iconClass = 'fa-solid fa-book'; dotColor = '#10b981'; }

    html += `
      <div class="focuso-task-item ${isActive ? 'active' : ''}" onclick="window.focusoSelectTask('${t.id}')">
        <div class="task-item-left">
          <div class="task-item-dot" style="background:${dotColor};">
            <i class="${iconClass}"></i>
          </div>
          <div class="task-item-text">
            <span class="task-item-title">${t.title}</span>
            <span class="task-item-sub">${t.completed}/${t.target} sessions • ${t.completed * 25}/${t.target * 25}m</span>
          </div>
        </div>
        <button type="button" class="task-item-play-btn" title="Sélectionner cette tâche">
          <i class="fa-solid fa-play"></i>
        </button>
      </div>`;
  });
  listEl.innerHTML = html;
}

window.focusoSelectTask = function(taskId) {
  const found = focusoTasks.find(t => t.id === taskId);
  if (found) {
    focusoActiveTask = found;
    updateFocusoUI();
    if (typeof showToast === 'function') showToast(`Tâche active : ${found.title}`, 'info');
  }
};

window.focusoOpenNewTaskModal = function() {
  const modal = document.getElementById('focuso-task-modal');
  if (modal) modal.hidden = false;
};

window.focusoCloseTaskModal = function() {
  const modal = document.getElementById('focuso-task-modal');
  if (modal) modal.hidden = true;
};

window.focusoSaveNewTask = function(e) {
  if (e) e.preventDefault();
  const nameInput = document.getElementById('focuso-new-task-name');
  const targetInput = document.getElementById('focuso-new-task-target');
  const catInput = document.getElementById('focuso-new-task-category');

  if (!nameInput || !nameInput.value.trim()) return;

  const newTask = {
    id: 'task-' + Date.now(),
    title: nameInput.value.trim(),
    completed: 0,
    target: Number(targetInput ? targetInput.value : 4) || 4,
    category: catInput ? catInput.value : 'code'
  };

  focusoTasks.unshift(newTask);
  focusoActiveTask = newTask;
  saveFocusoTasks();
  updateFocusoUI();
  window.focusoCloseTaskModal();
  if (typeof showToast === 'function') showToast(`Nouvelle tâche créée : ${newTask.title}`, 'success');
};

// Cycle des presets rapides (25/5 Standard, 50/10 Deep, 15/3 Sprint)
window.focusoCyclePreset = function() {
  if (focusoSelectedPreset === 25) {
    focusoSelectedPreset = 50;
    FOCUSO_DURATIONS.focus = 50 * 60;
    FOCUSO_DURATIONS.short = 10 * 60;
    FOCUSO_DURATIONS.long = 20 * 60;
  } else if (focusoSelectedPreset === 50) {
    focusoSelectedPreset = 15;
    FOCUSO_DURATIONS.focus = 15 * 60;
    FOCUSO_DURATIONS.short = 3 * 60;
    FOCUSO_DURATIONS.long = 10 * 60;
  } else {
    focusoSelectedPreset = 25;
    FOCUSO_DURATIONS.focus = 25 * 60;
    FOCUSO_DURATIONS.short = 5 * 60;
    FOCUSO_DURATIONS.long = 15 * 60;
  }

  const presetLabel = document.getElementById('focuso-preset-label');
  if (presetLabel) {
    if (focusoSelectedPreset === 50) presetLabel.textContent = 'Deep Work (50/10m)';
    else if (focusoSelectedPreset === 15) presetLabel.textContent = 'Sprint (15/3m)';
    else presetLabel.textContent = 'Standard (25/5m)';
  }

  focusoReset();
};

window.focusoToggleStrictMode = function() {
  focusoStrictMode = !focusoStrictMode;
  const strictPill = document.getElementById('focuso-tool-strict');
  if (strictPill) strictPill.classList.toggle('active', focusoStrictMode);
  if (typeof showToast === 'function') {
    showToast(focusoStrictMode ? 'Mode Strict Activé' : 'Mode Normal', 'info');
  }
};

window.focusoToggleZen = function() {
  const root = document.getElementById('deck-view-pomodoro');
  if (root) {
    if (!document.fullscreenElement) {
      root.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }
};

window.focusoTestChime = function() {
  playFocusoChime(focusoSound);
  if (typeof showToast === 'function') showToast('Carillon joué 🔔', 'info');
};

window.focusoToggleNoise = function() {
  if (typeof startAmbientSound === 'function' && typeof stopAmbientSound === 'function') {
    if (ambientIsPlaying) {
      stopAmbientSound();
      const noisePill = document.getElementById('focuso-tool-noise');
      if (noisePill) noisePill.classList.remove('active');
    } else {
      startAmbientSound();
      const noisePill = document.getElementById('focuso-tool-noise');
      if (noisePill) noisePill.classList.add('active');
    }
  }
};

window.focusoSelectAmbient = function(mode) {
  if (typeof startAmbientSound === 'function') {
    ambientCurrentMode = mode;
    try { localStorage.setItem('startpage_ambient_mode', mode); } catch {}
    document.querySelectorAll('.amb-card').forEach((c) => {
      c.classList.toggle('active', c.dataset.amb === mode);
    });
    if (ambientIsPlaying) startAmbientSound();
  }
};

window.focusoSetAmbVolume = function(val) {
  const vol = Number(val) || 0.5;
  try { localStorage.setItem('startpage_ambient_vol', vol); } catch {}
  if (ambientGainNode && ambientAudioCtx) {
    ambientGainNode.gain.setValueAtTime(vol * 0.35, ambientAudioCtx.currentTime);
  }
  if (ambientRadioAudio) ambientRadioAudio.volume = vol;
};

// Navigation sous-onglets Cockpit (Rapports, Calendrier, Personnalisation)
window.focusoSwitchCockpitTab = function(tabName) {
  document.querySelectorAll('.cockpit-tab-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.tab === tabName);
  });
  document.querySelectorAll('.focuso-tab-panel').forEach((panel) => {
    panel.hidden = panel.id !== `focuso-panel-${tabName}`;
  });

  if (tabName === 'reports') refreshFocusoReports();
  if (tabName === 'calendar') renderFocusoCalendar();
};

// Réglages & Personnalisation
window.focusoStepDuration = function(type, delta) {
  const current = Math.round(FOCUSO_DURATIONS[type] / 60);
  const next = Math.max(type === 'short' ? 1 : 5, current + delta);
  FOCUSO_DURATIONS[type] = next * 60;
  try {
    localStorage.setItem('focuso_durations', JSON.stringify(FOCUSO_DURATIONS));
  } catch {}

  const input = document.getElementById(`focuso-cfg-${type}`);
  if (input) input.value = next;

  if (focusoMode === type) {
    focusoTimeLeft = FOCUSO_DURATIONS[type];
    updateFocusoUI();
  }
};

window.focusoChangeSound = function(val) {
  focusoSound = val;
  try { localStorage.setItem('focuso_sound', val); } catch {}
};

window.focusoToggleAutoBreak = function(val) {
  focusoAutoBreak = !!val;
  try { localStorage.setItem('focuso_autobreak', focusoAutoBreak); } catch {}
};

// Graphiques d'activité & Rapports (Bar Chart & Heatmap Focuso)
function refreshFocusoReports() {
  const history = getFocusoHistory();
  const totalMins = history.reduce((acc, s) => acc + (s.duration || 25), 0);
  const totalHrs = (totalMins / 60).toFixed(1);
  const avgHrs = (totalMins / 60 / 7).toFixed(1);

  const kpiTotal = document.getElementById('focuso-kpi-total');
  const kpiAvg = document.getElementById('focuso-kpi-avg');
  const kpiSessions = document.getElementById('focuso-kpi-sessions');

  if (kpiTotal) kpiTotal.textContent = `${totalHrs} h`;
  if (kpiAvg) kpiAvg.textContent = `${avgHrs} h`;
  if (kpiSessions) kpiSessions.textContent = Math.max(history.length, focusoCompletedCount);

  renderFocusoBarChart();
  renderFocusoHeatmap();
}

function renderFocusoBarChart() {
  const svg = document.getElementById('focuso-bar-chart');
  if (!svg) return;

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const today = new Date();
  const daysData = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const label = dayNames[d.getDay()];
    // Heures simulées réalistes avec accent sur le jour 15 / aujourd'hui
    let hrs = (i === 1) ? 5.8 : (i === 0 ? Math.max(1.5, (focusoCompletedCount * 0.45)) : [3.2, 4.5, 6.0, 4.2, 5.0][i % 5]);
    daysData.push({ key, label, hrs, isSelected: (i === 1 || (i === 0 && focusoCompletedCount >= 4)) });
  }

  const maxHrs = 8;
  const svgW = 460;
  const svgH = 150;
  const botPad = 26;
  const topPad = 32;
  const chartH = svgH - botPad - topPad;
  const slotW = svgW / 7;
  const barW = 28;

  let html = '';

  // Ligne de repère moyenne 6h (comme sur le template Focuso)
  const avgY = Math.round(topPad + chartH * (1 - 6 / maxHrs));
  html += `<line x1="10" y1="${avgY}" x2="${svgW - 10}" y2="${avgY}" stroke="rgba(255,77,79,0.3)" stroke-dasharray="4,4" stroke-width="1.5" />`;
  html += `<text x="${svgW - 14}" y="${avgY - 4}" text-anchor="end" fill="rgba(255,77,79,0.7)" font-size="9" font-family="'JetBrains Mono', monospace">Objectif 6h</text>`;

  daysData.forEach((d, idx) => {
    const x = Math.round(idx * slotW + (slotW - barW) / 2);
    const barH = Math.max(8, Math.round((d.hrs / maxHrs) * chartH));
    const y = Math.round(svgH - botPad - barH);

    // Fond de piste
    html += `<rect x="${x}" y="${topPad}" width="${barW}" height="${chartH}" rx="8" fill="rgba(255,255,255,0.03)" />`;

    // Barre active corail
    const fill = d.isSelected ? 'url(#coralGrad)' : 'rgba(255, 77, 79, 0.45)';
    html += `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="8" fill="${fill}">
      <title>${d.label} (${d.key}) : ${d.hrs}h</title>
    </rect>`;

    // Bulle avec pointeur sur la barre sélectionnée (comme dans Focuso "5.8h")
    if (d.isSelected) {
      const bubbleW = 38;
      const bubbleH = 20;
      const bubbleX = Math.round(x + barW / 2 - bubbleW / 2);
      const bubbleY = Math.round(y - bubbleH - 7);
      html += `
        <g class="focuso-chart-bubble">
          <rect x="${bubbleX}" y="${bubbleY}" width="${bubbleW}" height="${bubbleH}" rx="6" fill="#ff4d4f" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.4))" />
          <polygon points="${x + barW / 2 - 4},${bubbleY + bubbleH} ${x + barW / 2 + 4},${bubbleY + bubbleH} ${x + barW / 2},${bubbleY + bubbleH + 5}" fill="#ff4d4f" />
          <text x="${x + barW / 2}" y="${bubbleY + 13}" text-anchor="middle" font-size="9" font-weight="800" fill="#ffffff" font-family="'JetBrains Mono', monospace">${d.hrs}h</text>
        </g>`;
    }

    // Nom du jour
    const textColor = d.isSelected ? '#ff4d4f' : 'rgba(255,255,255,0.5)';
    const textWeight = d.isSelected ? '800' : '600';
    html += `<text x="${x + barW / 2}" y="${svgH - 8}" text-anchor="middle" font-size="10" fill="${textColor}" font-weight="${textWeight}">${d.label}</text>`;
  });

  // Définition du gradient corail
  const defs = `
    <defs>
      <linearGradient id="coralGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ff4d4f" />
        <stop offset="100%" stop-color="#f43f5e" />
      </linearGradient>
    </defs>`;

  svg.innerHTML = defs + html;
}

function renderFocusoHeatmap() {
  const grid = document.getElementById('focuso-heatmap-grid');
  if (!grid) return;

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const slots = ['6h', '10h', '14h', '18h'];
  let html = '';

  // En-têtes des jours
  html += '<div></div>';
  days.forEach(d => {
    html += `<div class="heatmap-label" style="justify-content:center;font-weight:700;">${d}</div>`;
  });

  // Matrice créneaux x jours avec intensités variées (0 à 4)
  const pattern = [
    [1, 2, 3, 2, 4, 1, 0],
    [2, 4, 4, 3, 4, 2, 1],
    [3, 3, 2, 4, 3, 3, 2],
    [1, 2, 4, 2, 1, 0, 0]
  ];

  slots.forEach((slot, rowIdx) => {
    html += `<div class="heatmap-label">${slot}</div>`;
    for (let col = 0; col < 7; col++) {
      const lv = pattern[rowIdx][col];
      html += `<div class="heatmap-cell lv${lv}" title="${days[col]} à ${slot} : intensité ${lv}/4"></div>`;
    }
  });

  grid.innerHTML = html;
}

// Calendrier mensuel & Timeline quotidienne (Focuso Calendar)
window.focusoCalPrev = function() {
  focusoCalDate.setMonth(focusoCalDate.getMonth() - 1);
  renderFocusoCalendar();
};

window.focusoCalNext = function() {
  focusoCalDate.setMonth(focusoCalDate.getMonth() + 1);
  renderFocusoCalendar();
};

function renderFocusoCalendar() {
  const titleEl = document.getElementById('focuso-cal-month-title');
  const cellsEl = document.getElementById('focuso-calendar-days');
  if (!titleEl || !cellsEl) return;

  const year = focusoCalDate.getFullYear();
  const month = focusoCalDate.getMonth();
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  titleEl.textContent = `${monthNames[month]} ${year}`;

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  let html = '';
  // Jours vides début
  for (let i = 0; i < firstDayIndex; i++) {
    html += '<div class="cal-day-cell empty"></div>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    const isSelected = dStr === focusoSelectedDayKey;
    // Jours avec sessions (jours pairs ou aujourd'hui)
    const hasSessions = (day % 3 === 0) || (day === 15) || (day === 20) || isToday;

    let classes = 'cal-day-cell';
    if (isToday) classes += ' today';
    if (isSelected) classes += ' selected';
    if (hasSessions) classes += ' has-sessions';

    html += `<button type="button" class="${classes}" onclick="window.focusoSelectCalendarDay('${dStr}')">${day}</button>`;
  }

  cellsEl.innerHTML = html;
  renderFocusoTimeline(focusoSelectedDayKey);
}

window.focusoSelectCalendarDay = function(dateStr) {
  focusoSelectedDayKey = dateStr;
  renderFocusoCalendar();
};

function renderFocusoTimeline(dateStr) {
  const timelineEl = document.getElementById('focuso-history-timeline');
  const dateBadgeEl = document.getElementById('focuso-selected-date-label');
  const progVal = document.getElementById('focuso-cal-progress-val');
  const workedVal = document.getElementById('focuso-cal-worked-val');
  const sessionsVal = document.getElementById('focuso-cal-sessions-val');

  if (dateBadgeEl) {
    const todayStr = new Date().toISOString().split('T')[0];
    dateBadgeEl.textContent = (dateStr === todayStr) ? "Aujourd'hui" : dateStr;
  }

  if (progVal) progVal.textContent = '71.4%';
  if (workedVal) workedVal.textContent = '300 min';
  if (sessionsVal) sessionsVal.textContent = '12 sessions';

  if (!timelineEl) return;

  const items = [
    { title: 'Design User Interface (UI)', time: '14:00 - 14:25', duration: '25 min', type: 'focus' },
    { title: 'Pause Café & Étirements', time: '14:25 - 14:30', duration: '5 min', type: 'break' },
    { title: 'Market Research & Analysis', time: '14:30 - 14:55', duration: '25 min', type: 'focus' },
    { title: 'Développement Frontend Web', time: '15:00 - 15:50', duration: '50 min', type: 'focus' }
  ];

  let html = '';
  items.forEach(it => {
    html += `
      <div class="timeline-item ${it.type}">
        <div>
          <span class="timeline-item-title">${it.title}</span>
          <span style="font-size:0.65rem;color:var(--text-muted);display:block;">${it.duration}</span>
        </div>
        <span class="timeline-item-time">${it.time}</span>
      </div>`;
  });

  timelineEl.innerHTML = html;
}

// Initialisation principale du module Focuso
function initPomodoroWidget() {
  renderFocusoTicks();
  updateFocusoUI();
  refreshFocusoReports();
  renderFocusoCalendar();

  // Écouteur de raccourcis clavier
  document.addEventListener('keydown', (e) => {
    const pomoView = document.getElementById('deck-view-pomodoro');
    if (!pomoView || pomoView.hidden || pomoView.style.display === 'none') return;

    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) return;

    if (e.code === 'Space') {
      e.preventDefault();
      window.focusoPlayPause();
    } else if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      window.focusoReset();
    } else if (e.code === 'KeyS' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      window.focusoSkip();
    }
  });
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

  // Restauration du mode et du volume sauvegardés
  const savedMode = localStorage.getItem('startpage_ambient_mode');
  if (savedMode) {
    ambientCurrentMode = savedMode;
    document.querySelectorAll('.ambient-mode-card').forEach((c) => {
      c.classList.toggle('active', c.dataset.ambientMode === ambientCurrentMode);
    });
  }

  const savedVol = localStorage.getItem('startpage_ambient_vol');
  if (savedVol !== null && volSlider) {
    volSlider.value = savedVol;
  }

  if (masterBtn) {
    masterBtn.addEventListener('click', () => {
      if (ambientIsPlaying) stopAmbientSound();
      else startAmbientSound();
    });
  }

  if (volSlider) {
    volSlider.addEventListener('input', () => {
      const vol = Number(volSlider.value);
      localStorage.setItem('startpage_ambient_vol', volSlider.value);
      if (ambientGainNode && ambientAudioCtx) {
        ambientGainNode.gain.setValueAtTime(vol * 0.35, ambientAudioCtx.currentTime);
      }
      if (ambientRadioAudio) {
        ambientRadioAudio.volume = vol;
      }
    });
  }

  document.querySelectorAll('.ambient-mode-card').forEach((card) => {
    card.addEventListener('click', () => {
      ambientCurrentMode = card.dataset.ambientMode;
      localStorage.setItem('startpage_ambient_mode', ambientCurrentMode);
      document.querySelectorAll('.ambient-mode-card').forEach((c) => {
        c.classList.toggle('active', c.dataset.ambientMode === ambientCurrentMode);
      });
      if (ambientIsPlaying) startAmbientSound();
      else updateAmbientUI();
    });
  });

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

/* ========================================================
   GESTIONNAIRE DES MARCHÉS & INDICES BOURSIERS
   ======================================================== */
const DEFAULT_MARKET_ASSETS = [
  { id: '10ap', name: 'Amundi S&P 500 (10AP)', symbol: '10AP.DU', icon: 'fa-solid fa-chart-line', basePrice: 136.76, baseChange: 0.52, unit: '€', enabled: true },
  { id: 'lyp6', name: 'Amundi Stoxx 600 (LYP6)', symbol: 'LYP6.DE', icon: 'fa-solid fa-landmark', basePrice: 324.95, baseChange: 0.38, unit: '€', enabled: true },
  { id: 'xmme', name: 'Xtrackers MSCI EM (XMME)', symbol: 'XMME.DE', icon: 'fa-solid fa-earth-americas', basePrice: 76.65, baseChange: -0.42, unit: '€', enabled: true },
  { id: 'nvda', name: 'NVIDIA Corp. (NVDA)', symbol: 'NVDA', icon: 'fa-solid fa-microchip', basePrice: 200.13, baseChange: 1.84, unit: '$', enabled: true },
  { id: 'btc', name: 'Bitcoin USD (BTC)', symbol: 'BTC-USD', icon: 'fa-brands fa-bitcoin', basePrice: 80360, baseChange: 3.45, unit: '$', enabled: true, isVolatile: true },
  { id: 'sol', name: 'Solana (SOL)', symbol: 'SOL-USD', icon: 'fa-solid fa-bolt', basePrice: 95.66, baseChange: -4.82, unit: '$', enabled: true, isVolatile: true },
  { id: 'tsla', name: 'Tesla Inc. (TSLA)', symbol: 'TSLA', icon: 'fa-solid fa-car', basePrice: 248.50, baseChange: 3.12, unit: '$', enabled: true, isVolatile: true },
  { id: 'mstr', name: 'MicroStrategy (MSTR)', symbol: 'MSTR', icon: 'fa-solid fa-fire', basePrice: 215.30, baseChange: 8.65, unit: '$', enabled: true, isVolatile: true },
  { id: 'sp500', name: 'S&P 500 Index', symbol: '^GSPC', icon: 'fa-solid fa-chart-line', basePrice: 5864.67, baseChange: 0.41, unit: 'pts', enabled: false },
  { id: 'eurusd', name: 'EUR / USD Forex', symbol: 'EUR/USD', icon: 'fa-solid fa-euro-sign', basePrice: 1.085, baseChange: 0.12, unit: '$', enabled: false }
];

let isMarketVolatileFilterActive = false;
let marketAssets = loadMarketAssets();

function loadMarketAssets() {
  try {
    const raw = localStorage.getItem('violet_market_assets_v3');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return JSON.parse(JSON.stringify(DEFAULT_MARKET_ASSETS));
}

function saveMarketAssets() {
  try {
    localStorage.setItem('violet_market_assets_v3', JSON.stringify(marketAssets));
  } catch {}
}

function renderMarketCards() {
  const container = document.getElementById('crypto-ticker-cards');
  if (!container) return;

  let enabledAssets = marketAssets.filter((a) => a.enabled);

  if (isMarketVolatileFilterActive) {
    // Filtrage et tri par forte volatilité du jour
    enabledAssets = enabledAssets
      .filter((a) => a.isVolatile || Math.abs(a.baseChange) >= 1.5)
      .sort((a, b) => Math.abs(b.baseChange) - Math.abs(a.baseChange));
  }

  if (enabledAssets.length === 0) {
    container.innerHTML = `
      <div class="market-empty-hint">
        <span>${isMarketVolatileFilterActive ? 'Aucun actif fortement volatile actif.' : 'Aucun actif sélectionné.'}</span>
        <button type="button" class="hub-action-btn primary" id="market-open-empty-btn"><i class="fa-solid fa-sliders"></i> Personnaliser</button>
      </div>
    `;
    document.getElementById('market-open-empty-btn')?.addEventListener('click', toggleMarketConfigDrawer);
    return;
  }

  container.innerHTML = enabledAssets.map((asset) => {
    const isLive = asset.id === 'eurusd' || asset.id === 'btc' || asset.isReal;
    const isPositive = asset.baseChange >= 0;
    const sign = isPositive ? '+' : '';
    let formattedPrice = '';
    if (asset.unit === 'pts') {
      formattedPrice = `${asset.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pts`;
    } else if (asset.unit === '$') {
      formattedPrice = `${asset.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
    } else if (asset.unit === '€') {
      formattedPrice = `${asset.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
    } else {
      formattedPrice = `${asset.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${asset.unit}`;
    }

    const cardTitle = isLive ? `${asset.name} • Cours en direct via API (${asset.isReal ? 'Yahoo Finance' : 'Live'})` : `${asset.name} • Cotation indicative de marché`;
    const pillText = asset.isReal ? 'Yahoo' : (isLive ? 'Live' : 'Marché');
    const isHighVolatile = Math.abs(asset.baseChange) >= 2.5 || asset.isVolatile;
    const volatileHtml = isHighVolatile ? `<span class="volatile-tag"><i class="fa-solid fa-fire"></i> Volatile</span>` : '';

    return `
      <div class="crypto-card market-card" data-asset-id="${asset.id}" title="${cardTitle}">
        <span class="crypto-coin">
          <i class="${asset.icon || 'fa-solid fa-chart-line'}"></i>
          <span class="market-asset-name">${asset.name}</span>
          <span class="market-type-pill ${isLive ? 'live' : 'sim'}">${pillText}</span>
          ${volatileHtml}
        </span>
        <span class="crypto-price" id="price-${asset.id}">${formattedPrice}</span>
        <span class="crypto-change ${isPositive ? 'up' : 'down'}" id="change-${asset.id}">${sign}${asset.baseChange.toFixed(2)}%</span>
      </div>
    `;
  }).join('');
}

function renderMarketChecklist() {
  const listEl = document.getElementById('market-assets-checklist');
  if (!listEl) return;

  listEl.innerHTML = marketAssets.map((asset) => `
    <label class="market-check-item">
      <input type="checkbox" data-asset-id="${asset.id}" ${asset.enabled ? 'checked' : ''} />
      <i class="${asset.icon || 'fa-solid fa-chart-line'}"></i>
      <div class="market-check-info">
        <span class="market-check-name">${asset.name}</span>
        <span class="market-check-sym">${asset.symbol}</span>
      </div>
      ${asset.isCustom ? `<button type="button" class="market-del-custom" data-del-id="${asset.id}" title="Supprimer cet actif"><i class="fa-solid fa-trash-can"></i></button>` : ''}
    </label>
  `).join('');

  listEl.querySelectorAll('input[type="checkbox"]').forEach((chk) => {
    chk.addEventListener('change', () => {
      const id = chk.dataset.assetId;
      const target = marketAssets.find((a) => a.id === id);
      if (target) {
        target.enabled = chk.checked;
        saveMarketAssets();
        renderMarketCards();
      }
    });
  });

  listEl.querySelectorAll('.market-del-custom').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.dataset.delId;
      marketAssets = marketAssets.filter((a) => a.id !== id);
      saveMarketAssets();
      renderMarketChecklist();
      renderMarketCards();
      if (typeof showToast === 'function') showToast('Actif personnalisé supprimé', 'info');
    });
  });
}

function toggleMarketConfigDrawer() {
  const drawer = document.getElementById('market-config-drawer');
  if (!drawer) return;
  const isHidden = drawer.hasAttribute('hidden');
  if (isHidden) {
    drawer.removeAttribute('hidden');
    renderMarketChecklist();
  } else {
    drawer.setAttribute('hidden', '');
  }
}

/**
 * Récupère la cotation réelle d'un actif via l'API Yahoo Finance
 * avec bascule automatique entre proxys CORS sécurisés
 */
async function fetchYahooQuote(symbol) {
  if (!symbol) return null;
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;

  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(yahooUrl)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(yahooUrl)}`,
    yahooUrl
  ];

  for (const url of proxies) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (meta && typeof meta.regularMarketPrice === 'number') {
          const price = meta.regularMarketPrice;
          const prevClose = meta.chartPreviousClose || meta.previousClose || price;
          const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
          return { price, change };
        }
      }
    } catch {}
  }
  return null;
}

async function fetchMarketRates() {
  const refreshBtn = document.getElementById('crypto-refresh-btn');
  if (refreshBtn) refreshBtn.querySelector('i')?.classList.add('fa-spin');

  // 1. Taux réel EUR/USD via api.frankfurter.dev
  const eurUsdAsset = marketAssets.find((a) => a.id === 'eurusd');
  if (eurUsdAsset && eurUsdAsset.enabled) {
    try {
      const res = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD');
      if (res.ok) {
        const data = await res.json();
        if (data.rates && data.rates.USD) {
          eurUsdAsset.basePrice = Number(data.rates.USD.toFixed(4));
          eurUsdAsset.isReal = true;
        }
      }
    } catch {}
  }

  // 2. Bitcoin réel via CoinGecko
  const btcAsset = marketAssets.find((a) => a.id === 'btc');
  if (btcAsset && btcAsset.enabled) {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
      if (res.ok) {
        const data = await res.json();
        if (data.bitcoin) {
          btcAsset.basePrice = Math.round(data.bitcoin.usd);
          if (data.bitcoin.usd_24h_change) {
            btcAsset.baseChange = Number(data.bitcoin.usd_24h_change.toFixed(2));
          }
          btcAsset.isReal = true;
        }
      }
    } catch {}
  }

  // 3. Récupération des vraies cotations boursières via Yahoo Finance API (10AP, LYP6, XMME, Nvidia...)
  const yahooTasks = marketAssets
    .filter((a) => a.enabled && a.id !== 'eurusd' && a.id !== 'btc' && a.symbol)
    .map(async (asset) => {
      const quote = await fetchYahooQuote(asset.symbol);
      if (quote) {
        asset.basePrice = Number(quote.price.toFixed(2));
        asset.baseChange = Number(quote.change.toFixed(2));
        asset.isReal = true;
      }
    });

  await Promise.allSettled(yahooTasks);

  saveMarketAssets();
  renderMarketCards();

  // Animation de flash subtile sur les cartes
  document.querySelectorAll('.market-card').forEach((card) => {
    card.classList.remove('flash-update');
    void card.offsetWidth; // Reflow
    card.classList.add('flash-update');
  });

  if (refreshBtn) {
    setTimeout(() => {
      refreshBtn.querySelector('i')?.classList.remove('fa-spin');
    }, 600);
  }
}

function initMarketWidget() {
  if (typeof initMarkets === 'function') {
    initMarkets();
  }
}

function initSystemWidget() {
  initMarketWidget();
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
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
