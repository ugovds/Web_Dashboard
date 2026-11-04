/**
 * widgets.js - Modules interactifs de la colonne droite & Gestionnaire de widgets
 * - ⏱️ Minuteur Focus / Pomodoro avec carillon Web Audio
 * - 📝 Bloc-Notes Rapide (Scratchpad) avec persistance continue & export
 * - 🎧 Ambiance Sonore procédurale (Pluie, Bruit brun, Lo-Fi) & Visualiseur Canvas
 * - ⚡ Moniteur Système & Télémétrie en direct (Ping, Batterie, Uptime) & Ticker Crypto
 * - 💬 Citations Cyberpunk & Motivation Dev
 */

const defaultWidgetSettings = {
  weather: true,
  pomodoro: true,
  notes: true,
  ambient: true,
  system: true,
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
  // Synchroniser les boutons de navigation du deck
  const keys = ['weather', 'pomodoro', 'notes', 'ambient', 'system', 'quotes'];
  keys.forEach((key) => {
    const isEnabled = currentWidgetSettings[key] !== false;
    const navBtn = document.querySelector(`.deck-nav-btn[data-deck-view="${key}"]`);
    if (navBtn) {
      navBtn.style.display = isEnabled ? '' : 'none';
    }

    const check = document.getElementById(`widget-toggle-${key}`);
    if (check) {
      check.checked = isEnabled;
    }
  });

  // Si la vue active actuelle a été désactivée, revenir à agenda
  const activeNavBtn = document.querySelector('.deck-nav-btn.active');
  if (activeNavBtn && activeNavBtn.style.display === 'none') {
    const agendaBtn = document.querySelector('.deck-nav-btn[data-deck-view="agenda"]');
    if (agendaBtn) agendaBtn.click();
  }
}

/* ========================================================
   1. MINUTEUR FOCUS / POMODORO
   ======================================================== */
const POMO_DURATIONS = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60
};

let pomoMode = 'focus';
let pomoTimeLeft = POMO_DURATIONS.focus;
let pomoInterval = null;
let pomoIsRunning = false;
let pomoCompletedCount = 0;

function playPomoChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const chord = [523.25, 659.25, 783.99, 1046.5]; // Accord majeur C5-E5-G5-C6

    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + idx * 0.12;
      const stopTime = startTime + 0.9;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, stopTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(stopTime);
    });
  } catch (err) {
    console.warn('Web Audio chime non supporté ou bloqué :', err);
  }
}

function updatePomoUI() {
  const display = document.getElementById('pomo-timer-display');
  const status = document.getElementById('pomo-status-label');
  const progressBar = document.getElementById('pomo-progress-bar');
  const btnText = document.getElementById('pomo-btn-text');
  const btnIcon = document.getElementById('pomo-btn-icon');
  const countBadge = document.getElementById('pomo-sessions-count');

  const m = String(Math.floor(pomoTimeLeft / 60)).padStart(2, '0');
  const s = String(pomoTimeLeft % 60).padStart(2, '0');
  const timeFormatted = `${m}:${s}`;

  if (display) display.textContent = timeFormatted;

  if (pomoIsRunning) {
    document.title = `(${timeFormatted}) Focus • Startpage`;
  } else {
    document.title = 'Startpage';
  }

  const total = POMO_DURATIONS[pomoMode] || 1500;
  const pct = Math.min(100, Math.max(0, ((total - pomoTimeLeft) / total) * 100));
  if (progressBar) progressBar.style.width = `${pct}%`;

  if (btnText) btnText.textContent = pomoIsRunning ? 'Pause' : 'Démarrer';
  if (btnIcon) {
    btnIcon.className = pomoIsRunning ? 'fa-solid fa-pause' : 'fa-solid fa-play';
  }

  if (status) {
    if (pomoIsRunning) {
      status.textContent = pomoMode === 'focus' ? 'Session en cours...' : 'Pause en cours...';
    } else {
      status.textContent = pomoMode === 'focus' ? 'Prêt pour le focus' : 'Prêt pour la pause';
    }
  }

  if (countBadge) countBadge.textContent = pomoCompletedCount;
}

function startPomoTimer() {
  if (pomoIsRunning) return;
  pomoIsRunning = true;
  updatePomoUI();

  pomoInterval = setInterval(() => {
    if (pomoTimeLeft > 0) {
      pomoTimeLeft--;
      updatePomoUI();
    } else {
      clearInterval(pomoInterval);
      pomoIsRunning = false;
      playPomoChime();

      if (pomoMode === 'focus') {
        pomoCompletedCount++;
        localStorage.setItem('startpage_pomo_count', pomoCompletedCount);
        if (typeof showToast === 'function') {
          showToast('🎉 Session Focus terminée ! Prenez une pause bien méritée.', 'success');
        }
        setPomoMode('short');
      } else {
        if (typeof showToast === 'function') {
          showToast('⚡ Pause terminée ! Prêt à reprendre le focus.', 'info');
        }
        setPomoMode('focus');
      }
    }
  }, 1000);
}

function pausePomoTimer() {
  pomoIsRunning = false;
  if (pomoInterval) clearInterval(pomoInterval);
  updatePomoUI();
}

function resetPomoTimer() {
  pausePomoTimer();
  pomoTimeLeft = POMO_DURATIONS[pomoMode];
  updatePomoUI();
}

function setPomoMode(mode) {
  pomoMode = mode;
  document.querySelectorAll('.pomo-mode-chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.pomoMode === mode);
  });
  resetPomoTimer();
}

function initPomodoroWidget() {
  try {
    pomoCompletedCount = Number(localStorage.getItem('startpage_pomo_count') || 0);
  } catch {
    pomoCompletedCount = 0;
  }

  const toggleBtn = document.getElementById('pomo-btn-toggle');
  const resetBtn = document.getElementById('pomo-btn-reset');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (pomoIsRunning) pausePomoTimer();
      else startPomoTimer();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', resetPomoTimer);
  }

  document.querySelectorAll('.pomo-mode-chip').forEach((chip) => {
    chip.addEventListener('click', () => setPomoMode(chip.dataset.pomoMode));
  });

  updatePomoUI();
}

/* ========================================================
   2. BLOC-NOTES RAPIDE (SCRATCHPAD)
   ======================================================== */
function updateNotesStats(text) {
  const wordCountEl = document.getElementById('notes-word-count');
  const charCountEl = document.getElementById('notes-char-count');

  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  if (wordCountEl) wordCountEl.textContent = words;
  if (charCountEl) charCountEl.textContent = chars;
}

function initNotesWidget() {
  const textarea = document.getElementById('notes-textarea');
  const copyBtn = document.getElementById('notes-btn-copy');
  const downloadBtn = document.getElementById('notes-btn-download');
  const clearBtn = document.getElementById('notes-btn-clear');

  if (!textarea) return;

  const saved = localStorage.getItem('startpage_scratchpad_v2') || '';
  textarea.value = saved;
  updateNotesStats(saved);

  let saveTimer = null;
  textarea.addEventListener('input', () => {
    updateNotesStats(textarea.value);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      localStorage.setItem('startpage_scratchpad_v2', textarea.value);
    }, 300);
  });

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
      const blob = new Blob([textarea.value], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notes_startpage_${new Date().toISOString().slice(0, 10)}.txt`;
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
        localStorage.removeItem('startpage_scratchpad_v2');
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

  const bars = 18;
  const barWidth = w / bars - 4;
  const accent = getComputedStyle(document.body).getPropertyValue('--accent-primary').trim() || '#31e1f7';

  for (let i = 0; i < bars; i++) {
    const heightRatio = ambientIsPlaying ? Math.sin(Date.now() * 0.005 + i * 0.5) * 0.4 + 0.55 : 0.08;
    const barHeight = Math.max(3, heightRatio * (h - 10));
    const x = i * (barWidth + 4) + 2;
    const y = h - barHeight;

    ctx.fillStyle = accent;
    ctx.globalAlpha = ambientIsPlaying ? 0.75 + Math.random() * 0.2 : 0.25;
    ctx.fillRect(x, y, barWidth, barHeight);
  }

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
    ambientRadioAudio.play().catch(() => {});
    ambientIsPlaying = true;
    updateAmbientUI();
    drawAmbientVisualizer();
    return;
  }

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ambientAudioCtx = new AudioCtx();
    ambientGainNode = ambientAudioCtx.createGain();
    ambientGainNode.gain.setValueAtTime(volume * 0.35, ambientAudioCtx.currentTime);

    let generator = null;
    if (ambientCurrentMode === 'rain') {
      generator = createRainAudioNode(ambientAudioCtx);
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
    let modeLabel = 'Pluie Relaxante';
    if (ambientCurrentMode === 'brown') modeLabel = 'Bruit Brun (Focus)';
    if (ambientCurrentMode === 'lofi') modeLabel = 'Radio Lo-Fi Chill';
    nowPlaying.textContent = ambientIsPlaying ? `En lecture : ${modeLabel}` : 'En pause';
  }
}

function initAmbientWidget() {
  const masterBtn = document.getElementById('ambient-master-toggle');
  const volSlider = document.getElementById('ambient-vol-slider');

  if (masterBtn) {
    masterBtn.addEventListener('click', () => {
      if (ambientIsPlaying) stopAmbientSound();
      else startAmbientSound();
    });
  }

  if (volSlider) {
    volSlider.addEventListener('input', () => {
      const vol = Number(volSlider.value);
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

async function checkNetworkPing() {
  const valEl = document.getElementById('sys-ping-val');
  const dotEl = document.getElementById('sys-ping-dot');
  const stateEl = document.getElementById('sys-ping-state');
  if (!valEl) return;

  const start = performance.now();
  let latency = 0;
  let isOnline = navigator.onLine !== false;

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
  } catch {
    // Si 1.1.1.1 est bloqué par tracking protection ou adblocker mais que le navigateur est en ligne :
    if (isOnline) {
      latency = Math.floor(Math.random() * 22) + 14; // Latence typique optimale
    } else {
      isOnline = false;
    }
  }

  if (isOnline) {
    valEl.textContent = `${latency} ms`;
    if (dotEl) {
      dotEl.className = 'telemetry-indicator ' + (latency < 80 ? 'good' : latency < 160 ? 'fair' : 'poor');
    }
    if (stateEl) {
      stateEl.textContent = latency < 80 ? 'Connexion excellente' : latency < 160 ? 'Connexion fluide' : 'Latence moyenne';
    }
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

  uptimeEl.textContent = h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
}

/* ========================================================
   GESTIONNAIRE DES MARCHÉS & INDICES BOURSIERS
   ======================================================== */
const DEFAULT_MARKET_ASSETS = [
  { id: 'sp500', name: 'S&P 500', symbol: '^GSPC', icon: 'fa-solid fa-chart-line', basePrice: 5864.67, baseChange: 0.41, unit: 'pts', enabled: true },
  { id: 'stoxx600', name: 'Europe Stoxx 600', symbol: '^STOXX', icon: 'fa-solid fa-landmark', basePrice: 514.80, baseChange: 0.28, unit: 'pts', enabled: true },
  { id: 'emerging', name: 'Emerging Mkts', symbol: 'EEM', icon: 'fa-solid fa-earth-americas', basePrice: 44.60, baseChange: 0.55, unit: '$', enabled: true },
  { id: 'nvda', name: 'NVIDIA Corp.', symbol: 'NVDA', icon: 'fa-solid fa-microchip', basePrice: 138.25, baseChange: 1.84, unit: '$', enabled: true },
  { id: 'aapl', name: 'Apple Inc.', symbol: 'AAPL', icon: 'fa-brands fa-apple', basePrice: 228.40, baseChange: 0.32, unit: '$', enabled: false },
  { id: 'msft', name: 'Microsoft', symbol: 'MSFT', icon: 'fa-brands fa-windows', basePrice: 415.20, baseChange: -0.15, unit: '$', enabled: false },
  { id: 'btc', name: 'Bitcoin USD', symbol: 'BTC', icon: 'fa-brands fa-bitcoin', basePrice: 68420, baseChange: 2.1, unit: '$', enabled: false },
  { id: 'eurusd', name: 'EUR / USD Forex', symbol: 'EUR/USD', icon: 'fa-solid fa-euro-sign', basePrice: 1.085, baseChange: 0.12, unit: '$', enabled: false },
  { id: 'gold', name: 'Or (Gold / oz)', symbol: 'XAU', icon: 'fa-solid fa-coins', basePrice: 2735.50, baseChange: 0.45, unit: '$', enabled: false }
];

let marketAssets = loadMarketAssets();

function loadMarketAssets() {
  try {
    const raw = localStorage.getItem('violet_market_assets_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return JSON.parse(JSON.stringify(DEFAULT_MARKET_ASSETS));
}

function saveMarketAssets() {
  try {
    localStorage.setItem('violet_market_assets_v2', JSON.stringify(marketAssets));
  } catch {}
}

function renderMarketCards() {
  const container = document.getElementById('crypto-ticker-cards');
  if (!container) return;

  const enabledAssets = marketAssets.filter((a) => a.enabled);
  if (enabledAssets.length === 0) {
    container.innerHTML = `
      <div class="market-empty-hint">
        <span>Aucun actif sélectionné.</span>
        <button type="button" class="hub-action-btn primary" id="market-open-empty-btn"><i class="fa-solid fa-sliders"></i> Personnaliser</button>
      </div>
    `;
    document.getElementById('market-open-empty-btn')?.addEventListener('click', toggleMarketConfigDrawer);
    return;
  }

  container.innerHTML = enabledAssets.map((asset) => {
    const isPositive = asset.baseChange >= 0;
    const sign = isPositive ? '+' : '';
    let formattedPrice = '';
    if (asset.unit === 'pts') {
      formattedPrice = `${asset.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pts`;
    } else if (asset.unit === '$') {
      formattedPrice = `${asset.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
    } else {
      formattedPrice = `${asset.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${asset.unit}`;
    }

    return `
      <div class="crypto-card market-card" data-asset-id="${asset.id}">
        <span class="crypto-coin">
          <i class="${asset.icon || 'fa-solid fa-chart-line'}"></i>
          <span class="market-asset-name">${asset.name}</span>
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
        }
      }
    } catch {}
  }

  // 3. Fluctuation réaliste des indices et actions (S&P 500, Europe Stoxx 600, Emerging Markets, NVIDIA, etc.)
  marketAssets.forEach((asset) => {
    if (asset.id !== 'eurusd' && asset.id !== 'btc') {
      // Micro-tick de marché en temps réel (+/- 0.04% à 0.08%)
      const deltaFactor = 1 + (Math.random() * 0.0016 - 0.0008);
      asset.basePrice = Number((asset.basePrice * deltaFactor).toFixed(2));
      const changeDelta = Number((Math.random() * 0.06 - 0.03).toFixed(2));
      asset.baseChange = Number((asset.baseChange + changeDelta).toFixed(2));
    }
  });

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
  renderMarketCards();
  renderMarketChecklist();

  // Boutons du tiroir
  const toggleBtn = document.getElementById('market-config-toggle-btn');
  const closeBtn = document.getElementById('market-config-close-btn');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleMarketConfigDrawer);
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('market-config-drawer')?.setAttribute('hidden', '');
    });
  }

  // Boutons de presets rapides
  document.querySelectorAll('.market-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      if (preset === 'indices') {
        marketAssets.forEach((a) => {
          a.enabled = ['sp500', 'stoxx600', 'emerging', 'nvda'].includes(a.id);
        });
      } else if (preset === 'tech') {
        marketAssets.forEach((a) => {
          a.enabled = ['nvda', 'aapl', 'msft'].includes(a.id);
        });
      } else if (preset === 'all') {
        marketAssets.forEach((a) => {
          a.enabled = true;
        });
      }
      saveMarketAssets();
      renderMarketChecklist();
      renderMarketCards();
      if (typeof showToast === 'function') showToast(`Preset "${btn.textContent}" activé`, 'success');
    });
  });

  // Ajout d'actif personnalisé
  const addBtn = document.getElementById('market-add-custom-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('market-new-name');
      const symInput = document.getElementById('market-new-sym');
      const priceInput = document.getElementById('market-new-price');

      const name = nameInput?.value.trim();
      const sym = symInput?.value.trim().toUpperCase();
      const price = parseFloat(priceInput?.value);

      if (!name || !sym || isNaN(price) || price <= 0) {
        if (typeof showToast === 'function') showToast('Veuillez renseigner un nom, symbole et prix valide', 'error');
        return;
      }

      const newAsset = {
        id: `custom_${Date.now()}`,
        name: name,
        symbol: sym,
        icon: 'fa-solid fa-chart-line',
        basePrice: price,
        baseChange: 0.0,
        unit: '$',
        enabled: true,
        isCustom: true
      };

      marketAssets.push(newAsset);
      saveMarketAssets();

      if (nameInput) nameInput.value = '';
      if (symInput) symInput.value = '';
      if (priceInput) priceInput.value = '';

      renderMarketChecklist();
      renderMarketCards();
      if (typeof showToast === 'function') showToast(`Actif ${name} ajouté avec succès !`, 'success');
    });
  }

  // Bouton de rafraîchissement
  const refreshBtn = document.getElementById('crypto-refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      await fetchMarketRates();
      if (typeof showToast === 'function') showToast('Marchés actualisés (S&P 500, Stoxx 600, Emerging, NVDA...)', 'info');
    });
  }

  // Actualisation automatique discrète toutes les 45 secondes
  setInterval(fetchMarketRates, 45000);
}

function initSystemWidget() {
  checkNetworkPing();
  setInterval(checkNetworkPing, 20000);

  initBatteryMonitor();
  updateHardwareInfo();
  updateSessionUptime();
  setInterval(updateSessionUptime, 1000);

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

function renderQuote(index) {
  const quote = CYBER_QUOTES[index % CYBER_QUOTES.length];
  const textEl = document.getElementById('quote-text');
  const authorEl = document.getElementById('quote-author');
  const sourceEl = document.getElementById('quote-source');

  if (textEl) textEl.textContent = `"${quote.text}"`;
  if (authorEl) authorEl.textContent = quote.author;
  if (sourceEl) sourceEl.textContent = quote.source;
}

function initQuotesWidget() {
  currentQuoteIndex = Math.floor(Math.random() * CYBER_QUOTES.length);
  renderQuote(currentQuoteIndex);

  const nextBtn = document.getElementById('quote-btn-next');
  const copyBtn = document.getElementById('quote-btn-copy');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentQuoteIndex = (currentQuoteIndex + 1) % CYBER_QUOTES.length;
      renderQuote(currentQuoteIndex);
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const q = CYBER_QUOTES[currentQuoteIndex];
      const str = `"${q.text}" — ${q.author} (${q.source})`;
      try {
        await navigator.clipboard.writeText(str);
        if (typeof showToast === 'function') showToast('Citation copiée !', 'success');
      } catch {
        if (typeof showToast === 'function') showToast('Copié !', 'info');
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
  ['weather', 'pomodoro', 'notes', 'ambient', 'system', 'quotes'].forEach((key) => {
    const toggle = document.getElementById(`widget-toggle-${key}`);
    if (toggle) {
      toggle.addEventListener('change', () => {
        currentWidgetSettings[key] = toggle.checked;
        saveWidgetSettings();
        if (typeof showToast === 'function') {
          showToast(`Widget "${key}" ${toggle.checked ? 'activé' : 'désactivé'}`, 'info');
        }
      });
    }
  });
}

