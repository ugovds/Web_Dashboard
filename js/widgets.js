/**
 * widgets.js - Widgets de la barre supérieure (Topbar) & Gestionnaire de personnalisation
 * - Minuteur Pomodoro (Focus / Pauses avec carillon Web Audio)
 * - Bloc-notes rapide (Scratchpad avec auto-sauvegarde, copie, téléchargement)
 * - Générateur sonore d'ambiance (Pluie procédurale, Bruit brun de focus, Radio Lofi)
 * - Statut Système (Ping de latence réseau & niveau de batterie)
 * - Invite de terminal personnalisable (~/startpage)
 * - Gestionnaire d'affichage des widgets topbar
 */

// ========================================================
// 1. GESTION DE LA VISIBILITÉ DES WIDGETS DE LA TOPBAR
// ========================================================
const defaultTopbarWidgets = {
  themes: true,
  prompt: true,
  pomodoro: true,
  notes: true,
  ambient: true,
  sysinfo: true,
  weather: true,
  weatherFx: true,
  datetime: true
};

let topbarWidgets = structuredClone(defaultTopbarWidgets);

function loadTopbarWidgetsSettings() {
  try {
    const saved = localStorage.getItem('startpage_topbar_widgets');
    if (saved) {
      topbarWidgets = { ...defaultTopbarWidgets, ...JSON.parse(saved) };
    }
  } catch {
    topbarWidgets = structuredClone(defaultTopbarWidgets);
  }
}

function saveTopbarWidgetsSettings() {
  localStorage.setItem('startpage_topbar_widgets', JSON.stringify(topbarWidgets));
  applyTopbarWidgetsVisibility();
}

function applyTopbarWidgetsVisibility() {
  const widgetElements = {
    themes: document.querySelector('.theme-switcher'),
    prompt: document.getElementById('prompt-path'),
    pomodoro: document.getElementById('topbar-pomodoro'),
    notes: document.getElementById('topbar-notes-btn'),
    ambient: document.getElementById('topbar-ambient'),
    sysinfo: document.getElementById('topbar-sysinfo'),
    weather: document.getElementById('weather'),
    weatherFx: document.getElementById('weather-fx-toggle'),
    datetime: document.querySelector('.datetime')
  };

  for (const [key, el] of Object.entries(widgetElements)) {
    if (el) {
      const isVisible = topbarWidgets[key] !== false;
      el.style.display = isVisible ? '' : 'none';
    }
  }
}

// ========================================================
// 2. INVITE DE COMMANDE PERSONNALISABLE (PROMPT PATH)
// ========================================================
function initPromptPath() {
  const promptEl = document.getElementById('prompt-path');
  if (!promptEl) return;

  const savedPrompt = localStorage.getItem('startpage_prompt_path') || '~/startpage';
  promptEl.textContent = savedPrompt;

  promptEl.addEventListener('click', () => {
    // Si on est en mode édition, permettre de renommer en un clic
    if (document.body.classList.contains('edit-mode-active')) {
      const current = promptEl.textContent;
      const newPrompt = prompt('Modifier l\'invite de commande (ex: user@deck:~, ~/matrix) :', current);
      if (newPrompt !== null && newPrompt.trim() !== '') {
        setPromptPath(newPrompt.trim());
      }
    }
  });
}

function setPromptPath(val) {
  const promptEl = document.getElementById('prompt-path');
  const clean = val.trim() || '~/startpage';
  if (promptEl) promptEl.textContent = clean;
  localStorage.setItem('startpage_prompt_path', clean);
  if (typeof showToast === 'function') {
    showToast(`Invite mise à jour : ${clean}`, 'success');
  }
}

// ========================================================
// 3. MINUTEUR FOCUS / POMODORO
// ========================================================
const POMO_MODES = {
  focus: { label: 'Focus', time: 25 * 60 },
  short: { label: 'Pause courte', time: 5 * 60 },
  long: { label: 'Pause longue', time: 15 * 60 }
};

let pomoCurrentMode = 'focus';
let pomoTimeLeft = POMO_MODES.focus.time;
let pomoInterval = null;
let pomoIsRunning = false;
const originalDocTitle = document.title;

function formatPomoTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updatePomodoroUI() {
  const display = document.getElementById('pomo-display');
  const toggleBtn = document.getElementById('pomo-toggle-btn');
  const playIcon = document.getElementById('pomo-play-icon');

  if (display) {
    display.textContent = formatPomoTime(pomoTimeLeft);
  }

  if (toggleBtn) {
    toggleBtn.classList.toggle('active', pomoIsRunning);
  }

  if (playIcon) {
    playIcon.className = pomoIsRunning ? 'fa-solid fa-pause' : 'fa-solid fa-play';
  }

  if (pomoIsRunning) {
    document.title = `(${formatPomoTime(pomoTimeLeft)}) Startpage`;
  } else {
    document.title = originalDocTitle;
  }
}

function playCyberChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.11);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.11 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.11);
      osc.stop(ctx.currentTime + idx * 0.11 + 0.38);
    });
  } catch {}
}

function startPomodoro() {
  if (pomoIsRunning) return;
  pomoIsRunning = true;
  updatePomodoroUI();

  pomoInterval = setInterval(() => {
    if (pomoTimeLeft > 0) {
      pomoTimeLeft--;
      updatePomodoroUI();
    } else {
      pausePomodoro();
      playCyberChime();
      if (typeof showToast === 'function') {
        const msg = pomoCurrentMode === 'focus'
          ? 'Session Focus terminée ! Prenez une pause bien méritée.'
          : 'Pause terminée ! Prêt pour une nouvelle session ?';
        showToast(msg, 'success');
      }
      // Basculer automatiquement en pause si on était en focus
      if (pomoCurrentMode === 'focus') {
        setPomodoroMode('short');
      } else {
        setPomodoroMode('focus');
      }
    }
  }, 1000);
}

function pausePomodoro() {
  pomoIsRunning = false;
  if (pomoInterval) {
    clearInterval(pomoInterval);
    pomoInterval = null;
  }
  updatePomodoroUI();
}

function togglePomodoro() {
  if (pomoIsRunning) {
    pausePomodoro();
  } else {
    startPomodoro();
  }
}

function resetPomodoro() {
  pausePomodoro();
  pomoTimeLeft = POMO_MODES[pomoCurrentMode].time;
  updatePomodoroUI();
}

function setPomodoroMode(mode) {
  if (!POMO_MODES[mode]) return;
  pomoCurrentMode = mode;
  pomoTimeLeft = POMO_MODES[mode].time;
  pausePomodoro();

  document.querySelectorAll('.pomo-mode-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.pomoMode === mode);
  });

  updatePomodoroUI();
}

function initPomodoro() {
  const toggleBtn = document.getElementById('pomo-toggle-btn');
  const gearBtn = document.getElementById('pomo-gear-btn');
  const popover = document.getElementById('pomo-popover');
  const resetBtn = document.getElementById('pomo-reset-btn');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      // Si on clique sur le gear ou si le popover est ouvert, ne pas toggle
      if (e.target.closest('#pomo-gear-btn')) return;
      togglePomodoro();
    });
  }

  if (gearBtn && popover) {
    gearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      popover.hidden = !popover.hidden;
    });

    document.addEventListener('click', (e) => {
      if (!popover.contains(e.target) && !gearBtn.contains(e.target)) {
        popover.hidden = true;
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetPomodoro();
      if (typeof showToast === 'function') {
        showToast('Minuteur réinitialisé', 'info');
      }
    });
  }

  document.querySelectorAll('.pomo-mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setPomodoroMode(btn.dataset.pomoMode);
      if (popover) popover.hidden = true;
    });
  });

  updatePomodoroUI();
}

// ========================================================
// 4. BLOC-NOTES RAPIDE (SCRATCHPAD)
// ========================================================
function initScratchpad() {
  const notesBtn = document.getElementById('topbar-notes-btn');
  const panel = document.getElementById('scratchpad-panel');
  const closeBtn = document.getElementById('scratchpad-close-btn');
  const textarea = document.getElementById('scratchpad-textarea');
  const wordCountEl = document.getElementById('scratchpad-words');
  const charCountEl = document.getElementById('scratchpad-chars');
  const copyBtn = document.getElementById('scratchpad-copy-btn');
  const clearBtn = document.getElementById('scratchpad-clear-btn');
  const downloadBtn = document.getElementById('scratchpad-download-btn');

  // Charger le texte sauvegardé
  const savedNotes = localStorage.getItem('startpage_scratchpad') || '';
  if (textarea) {
    textarea.value = savedNotes;
    updateScratchpadStats(savedNotes);

    textarea.addEventListener('input', () => {
      const val = textarea.value;
      localStorage.setItem('startpage_scratchpad', val);
      updateScratchpadStats(val);
    });
  }

  function updateScratchpadStats(text) {
    if (charCountEl) charCountEl.textContent = `${text.length} car.`;
    if (wordCountEl) {
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      wordCountEl.textContent = `${words} mots`;
    }
  }

  if (notesBtn && panel) {
    notesBtn.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      notesBtn.classList.toggle('active', !panel.hidden);
      if (!panel.hidden && textarea) {
        textarea.focus();
      }
    });
  }

  if (closeBtn && panel && notesBtn) {
    closeBtn.addEventListener('click', () => {
      panel.hidden = true;
      notesBtn.classList.remove('active');
    });
  }

  if (copyBtn && textarea) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(textarea.value).then(() => {
        if (typeof showToast === 'function') {
          showToast('Notes copiées dans le presse-papiers !', 'success');
        }
      });
    });
  }

  if (clearBtn && textarea) {
    clearBtn.addEventListener('click', () => {
      if (textarea.value.trim() === '') return;
      if (confirm('Voulez-vous vraiment effacer l\'intégralité du bloc-notes ?')) {
        textarea.value = '';
        localStorage.setItem('startpage_scratchpad', '');
        updateScratchpadStats('');
        if (typeof showToast === 'function') {
          showToast('Bloc-notes vidé', 'info');
        }
      }
    });
  }

  if (downloadBtn && textarea) {
    downloadBtn.addEventListener('click', () => {
      const blob = new Blob([textarea.value], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `notes-${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
      if (typeof showToast === 'function') {
        showToast('Fichier notes.txt téléchargé', 'info');
      }
    });
  }
}

// ========================================================
// 5. GÉNÉRATEUR SONORE D'AMBIANCE & LOFI
// ========================================================
let ambientAudioCtx = null;
let ambientGainNode = null;
let ambientSourceNode = null;
let ambientStreamAudio = null;
let ambientIsPlaying = false;
let ambientCurrentType = 'rain'; // 'rain' | 'brown' | 'lofi'
let ambientVolume = 0.5;

function createRainBuffer(ctx) {
  const sampleRate = ctx.sampleRate;
  const bufferSize = sampleRate * 3; // 3 sec loop
  const buffer = ctx.createBuffer(2, bufferSize, sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      // Filtre rose doux
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      // Gouttes aléatoires
      const drop = Math.random() < 0.0007 ? (Math.random() - 0.5) * 0.7 : 0;
      data[i] = lastOut * 0.65 + drop;
    }
  }
  return buffer;
}

function createBrownBuffer(ctx) {
  const sampleRate = ctx.sampleRate;
  const bufferSize = sampleRate * 3;
  const buffer = ctx.createBuffer(2, bufferSize, sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.025 * white) / 1.025;
      data[i] = lastOut * 1.8;
    }
  }
  return buffer;
}

function startAmbientSound() {
  stopAmbientSound();

  if (ambientCurrentType === 'lofi') {
    if (!ambientStreamAudio) {
      ambientStreamAudio = new Audio('https://stream.zeno.fm/f3wvbbqmdg8uv'); // Lofi Radio chill stream
      ambientStreamAudio.crossOrigin = 'anonymous';
    }
    ambientStreamAudio.volume = ambientVolume;
    ambientStreamAudio.play().then(() => {
      ambientIsPlaying = true;
      updateAmbientUI();
    }).catch(() => {
      // Fallback sur bruit de pluie si le stream est indisponible
      ambientCurrentType = 'rain';
      startAmbientSound();
    });
    return;
  }

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!ambientAudioCtx) {
      ambientAudioCtx = new AudioCtx();
    }
    if (ambientAudioCtx.state === 'suspended') {
      ambientAudioCtx.resume();
    }

    ambientGainNode = ambientAudioCtx.createGain();
    ambientGainNode.gain.setValueAtTime(ambientVolume * 0.35, ambientAudioCtx.currentTime);

    const filter = ambientAudioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(ambientCurrentType === 'rain' ? 1200 : 450, ambientAudioCtx.currentTime);

    const buffer = ambientCurrentType === 'rain'
      ? createRainBuffer(ambientAudioCtx)
      : createBrownBuffer(ambientAudioCtx);

    ambientSourceNode = ambientAudioCtx.createBufferSource();
    ambientSourceNode.buffer = buffer;
    ambientSourceNode.loop = true;

    ambientSourceNode.connect(filter);
    filter.connect(ambientGainNode);
    ambientGainNode.connect(ambientAudioCtx.destination);

    ambientSourceNode.start(0);
    ambientIsPlaying = true;
    updateAmbientUI();
  } catch {}
}

function stopAmbientSound() {
  ambientIsPlaying = false;
  if (ambientSourceNode) {
    try { ambientSourceNode.stop(); ambientSourceNode.disconnect(); } catch {}
    ambientSourceNode = null;
  }
  if (ambientStreamAudio) {
    ambientStreamAudio.pause();
  }
  updateAmbientUI();
}

function updateAmbientUI() {
  const btn = document.getElementById('ambient-toggle-btn');
  const label = document.getElementById('ambient-btn-label');
  const playBtn = document.getElementById('ambient-pop-play');
  const icon = document.getElementById('ambient-icon');

  if (btn) {
    btn.classList.toggle('active', ambientIsPlaying);
  }

  const typeLabels = {
    rain: 'Pluie douce',
    brown: 'Bruit Brun',
    lofi: 'Radio Lofi'
  };

  if (label) {
    label.textContent = ambientIsPlaying ? typeLabels[ambientCurrentType] : 'Ambiance';
  }

  if (playBtn) {
    playBtn.innerHTML = ambientIsPlaying
      ? '<i class="fa-solid fa-pause"></i> Pause'
      : '<i class="fa-solid fa-play"></i> Écouter';
  }

  if (icon) {
    icon.className = ambientIsPlaying ? 'fa-solid fa-volume-high pulse-sound' : 'fa-solid fa-headphones';
  }

  document.querySelectorAll('.ambient-type-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.soundType === ambientCurrentType);
  });
}

function initAmbientSound() {
  const btn = document.getElementById('ambient-toggle-btn');
  const popover = document.getElementById('ambient-popover');
  const playBtn = document.getElementById('ambient-pop-play');
  const volSlider = document.getElementById('ambient-volume');

  if (btn && popover) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      popover.hidden = !popover.hidden;
    });

    document.addEventListener('click', (e) => {
      if (!popover.contains(e.target) && !btn.contains(e.target)) {
        popover.hidden = true;
      }
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (ambientIsPlaying) {
        stopAmbientSound();
      } else {
        startAmbientSound();
      }
    });
  }

  if (volSlider) {
    volSlider.value = ambientVolume;
    volSlider.addEventListener('input', () => {
      ambientVolume = parseFloat(volSlider.value);
      if (ambientGainNode && ambientAudioCtx) {
        ambientGainNode.gain.setValueAtTime(ambientVolume * 0.35, ambientAudioCtx.currentTime);
      }
      if (ambientStreamAudio) {
        ambientStreamAudio.volume = ambientVolume;
      }
    });
  }

  document.querySelectorAll('.ambient-type-btn').forEach((b) => {
    b.addEventListener('click', () => {
      ambientCurrentType = b.dataset.soundType;
      document.querySelectorAll('.ambient-type-btn').forEach((btnEl) => btnEl.classList.remove('active'));
      b.classList.add('active');
      if (ambientIsPlaying) {
        startAmbientSound();
      } else {
        updateAmbientUI();
      }
    });
  });

  updateAmbientUI();
}

// ========================================================
// 6. STATUT SYSTÈME : LATENCE RÉSEAU (PING) & BATTERIE
// ========================================================
async function checkNetworkPing() {
  const pingValEl = document.getElementById('sys-ping-val');
  const pingDotEl = document.getElementById('sys-ping-dot');
  if (!pingValEl) return;

  const t0 = performance.now();
  try {
    // Ping ultra-rapide vers Cloudflare trace (sans cache)
    const res = await fetch('https://1.1.1.1/cdn-cgi/trace', {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store'
    });
    if (!res.ok) throw new Error();
    const t1 = performance.now();
    const ms = Math.round(t1 - t0);
    pingValEl.textContent = `${ms} ms`;
    if (pingDotEl) {
      pingDotEl.className = 'sys-ping-dot ping-good';
    }
  } catch {
    // Fallback : test de connectivité navigator.onLine
    if (navigator.onLine) {
      pingValEl.textContent = 'En ligne';
      if (pingDotEl) pingDotEl.className = 'sys-ping-dot ping-good';
    } else {
      pingValEl.textContent = 'Hors ligne';
      if (pingDotEl) pingDotEl.className = 'sys-ping-dot ping-bad';
    }
  }
}

function initBatteryMonitoring() {
  const wrap = document.getElementById('sys-battery-wrap');
  const icon = document.getElementById('sys-battery-icon');
  const val = document.getElementById('sys-battery-val');
  if (!wrap || !icon || !val) return;

  if ('getBattery' in navigator) {
    navigator.getBattery().then((battery) => {
      wrap.hidden = false;

      function updateBattery() {
        const level = Math.round(battery.level * 100);
        val.textContent = `${level}%`;

        if (battery.charging) {
          icon.className = 'fa-solid fa-bolt-lightning sys-bat-charging';
        } else if (level > 80) {
          icon.className = 'fa-solid fa-battery-full';
        } else if (level > 50) {
          icon.className = 'fa-solid fa-battery-three-quarters';
        } else if (level > 20) {
          icon.className = 'fa-solid fa-battery-half';
        } else {
          icon.className = 'fa-solid fa-battery-quarter sys-bat-low';
        }
      }

      updateBattery();
      battery.addEventListener('levelchange', updateBattery);
      battery.addEventListener('chargingchange', updateBattery);
    }).catch(() => {
      wrap.hidden = true;
    });
  } else {
    wrap.hidden = true;
  }
}

function initSystemInfo() {
  checkNetworkPing();
  setInterval(checkNetworkPing, 20000); // Test de latence toutes les 20s
  initBatteryMonitoring();
}

// ========================================================
// 7. MODALE DE GESTION DES WIDGETS DE LA TOPBAR
// ========================================================
function openWidgetsModal() {
  const modal = document.getElementById('widgets-modal');
  if (!modal) return;

  // Initialiser les checkboxes avec l'état actuel
  const checkThemes = document.getElementById('widget-check-themes');
  const checkPrompt = document.getElementById('widget-check-prompt');
  const checkPomodoro = document.getElementById('widget-check-pomodoro');
  const checkNotes = document.getElementById('widget-check-notes');
  const checkAmbient = document.getElementById('widget-check-ambient');
  const checkSysinfo = document.getElementById('widget-check-sysinfo');
  const checkWeather = document.getElementById('widget-check-weather');
  const checkWeatherFx = document.getElementById('widget-check-weatherfx');
  const checkDatetime = document.getElementById('widget-check-datetime');
  const promptInput = document.getElementById('widget-prompt-input');

  if (checkThemes) checkThemes.checked = topbarWidgets.themes !== false;
  if (checkPrompt) checkPrompt.checked = topbarWidgets.prompt !== false;
  if (checkPomodoro) checkPomodoro.checked = topbarWidgets.pomodoro !== false;
  if (checkNotes) checkNotes.checked = topbarWidgets.notes !== false;
  if (checkAmbient) checkAmbient.checked = topbarWidgets.ambient !== false;
  if (checkSysinfo) checkSysinfo.checked = topbarWidgets.sysinfo !== false;
  if (checkWeather) checkWeather.checked = topbarWidgets.weather !== false;
  if (checkWeatherFx) checkWeatherFx.checked = topbarWidgets.weatherFx !== false;
  if (checkDatetime) checkDatetime.checked = topbarWidgets.datetime !== false;

  if (promptInput) {
    promptInput.value = localStorage.getItem('startpage_prompt_path') || '~/startpage';
  }

  modal.hidden = false;
}

function closeWidgetsModal() {
  const modal = document.getElementById('widgets-modal');
  if (modal) modal.hidden = true;
}

function initWidgetsModal() {
  const openBtn = document.getElementById('btn-manage-widgets');
  const closeBtn = document.getElementById('widgets-modal-close');
  const modal = document.getElementById('widgets-modal');
  const saveBtn = document.getElementById('widgets-modal-save');
  const promptInput = document.getElementById('widget-prompt-input');

  if (openBtn) openBtn.addEventListener('click', openWidgetsModal);
  if (closeBtn) closeBtn.addEventListener('click', closeWidgetsModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeWidgetsModal();
    });
  }

  // Écouteurs de changement immédiat sur les checkboxes
  const widgetKeyMap = {
    'widget-check-themes': 'themes',
    'widget-check-prompt': 'prompt',
    'widget-check-pomodoro': 'pomodoro',
    'widget-check-notes': 'notes',
    'widget-check-ambient': 'ambient',
    'widget-check-sysinfo': 'sysinfo',
    'widget-check-weather': 'weather',
    'widget-check-weatherfx': 'weatherFx',
    'widget-check-datetime': 'datetime'
  };

  for (const [id, key] of Object.entries(widgetKeyMap)) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        topbarWidgets[key] = el.checked;
        saveTopbarWidgetsSettings();
      });
    }
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (promptInput) {
        setPromptPath(promptInput.value.trim() || '~/startpage');
      }
      closeWidgetsModal();
      if (typeof showToast === 'function') {
        showToast('Widgets de la topbar configurés avec succès !', 'success');
      }
    });
  }

  // Raccourcis rapides d'invites
  document.querySelectorAll('.q-prompt-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.prompt;
      if (promptInput) promptInput.value = val;
      setPromptPath(val);
    });
  });
}

// ========================================================
// 8. BOOTSTRAP DU MODULE WIDGETS
// ========================================================
function initWidgets() {
  loadTopbarWidgetsSettings();
  applyTopbarWidgetsVisibility();
  initPromptPath();
  initPomodoro();
  initScratchpad();
  initAmbientSound();
  initSystemInfo();
  initWidgetsModal();
}

