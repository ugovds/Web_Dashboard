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

  // Si la vue active actuelle a été désactivée, revenir à l'accueil
  const activeNavBtn = document.querySelector('.deck-nav-btn.active');
  if (activeNavBtn && activeNavBtn.style.display === 'none') {
    const homeBtn = document.querySelector('.deck-nav-btn[data-deck-view="dashboard"]') || document.querySelector('.deck-nav-btn[data-deck-view="agenda"]');
    if (homeBtn) homeBtn.click();
  }
}

/* ========================================================
   1. MINUTEUR FOCUS / POMODORO
   ======================================================== */
let POMO_DURATIONS = {
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
  const display = document.getElementById('pomo-time') || document.getElementById('pomo-timer-display');
  const status = document.getElementById('pomo-status') || document.getElementById('pomo-status-label');
  const progressBar = document.getElementById('pomo-progress-fill') || document.getElementById('pomo-progress-bar');
  const ringArc = document.getElementById('pomo-ring-arc');
  const toggleBtn = document.getElementById('pomo-start-btn') || document.getElementById('pomo-btn-toggle');
  const countBadge = document.getElementById('pomo-cycles-count') || document.getElementById('pomo-sessions-count');

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

  // Arc SVG circulaire (circonférence = 2 * PI * 88 ≈ 552.92)
  if (ringArc) {
    const circum = 552.92;
    const offset = circum - (pct / 100) * circum;
    ringArc.style.strokeDashoffset = offset.toFixed(1);
  }

  if (toggleBtn) {
    toggleBtn.innerHTML = pomoIsRunning
      ? '<i class="fa-solid fa-pause"></i> Pause'
      : '<i class="fa-solid fa-play"></i> Démarrer';
  }

  if (status) {
    if (pomoIsRunning) {
      status.textContent = pomoMode === 'focus' ? 'Session en cours...' : 'Pause en cours...';
    } else {
      status.textContent = pomoMode === 'focus' ? 'Prêt pour le focus' : 'Prêt pour la pause';
    }
  }

  if (countBadge) countBadge.textContent = pomoCompletedCount;

  // Mise à jour des points d'objectif journalier (sur 4)
  const dots = document.querySelectorAll('#pomo-dots-wrap .pomo-dot');
  const completedMod = pomoCompletedCount % 4;
  dots.forEach((dot, idx) => {
    dot.classList.toggle('done', idx < completedMod || pomoCompletedCount >= 4);
  });
}

function startPomoTimer() {
  if (pomoIsRunning) return;

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }

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

      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(pomoMode === 'focus' ? '🎉 Focus Terminé !' : '⚡ Pause Terminée !', {
            body: pomoMode === 'focus' ? 'Prenez une pause bien méritée.' : 'Prêt à reprendre une session de focus !',
            icon: 'images/gif.gif'
          });
        } catch {}
      }

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
  pomoMode = (mode === 'work') ? 'focus' : mode;
  document.querySelectorAll('.pomo-mode-chip').forEach((chip) => {
    const chipMode = chip.dataset.pomoMode === 'work' ? 'focus' : chip.dataset.pomoMode;
    chip.classList.toggle('active', chipMode === pomoMode);
  });
  resetPomoTimer();
}

function initPomodoroWidget() {
  try {
    pomoCompletedCount = Number(localStorage.getItem('startpage_pomo_count') || 0);
  } catch {
    pomoCompletedCount = 0;
  }

  const toggleBtn = document.getElementById('pomo-start-btn') || document.getElementById('pomo-btn-toggle');
  const resetBtn = document.getElementById('pomo-reset-btn') || document.getElementById('pomo-btn-reset');

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

  // Presets d'intervalles rapides (25/5, 50/10, 15/3)
  document.querySelectorAll('.pomo-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pomo-preset-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = Number(btn.dataset.pomoPreset) || 25;
      if (preset === 50) {
        POMO_DURATIONS.focus = 50 * 60;
        POMO_DURATIONS.short = 10 * 60;
        POMO_DURATIONS.long = 20 * 60;
      } else if (preset === 15) {
        POMO_DURATIONS.focus = 15 * 60;
        POMO_DURATIONS.short = 3 * 60;
        POMO_DURATIONS.long = 10 * 60;
      } else {
        POMO_DURATIONS.focus = 25 * 60;
        POMO_DURATIONS.short = 5 * 60;
        POMO_DURATIONS.long = 15 * 60;
      }

      // Mettre à jour les labels des modes
      document.querySelectorAll('.pomo-mode-chip').forEach((chip) => {
        const m = chip.dataset.pomoMode;
        if (m === 'work' || m === 'focus') {
          chip.textContent = `Focus (${Math.round(POMO_DURATIONS.focus / 60)}m)`;
        } else if (m === 'short') {
          chip.textContent = `Pause (${Math.round(POMO_DURATIONS.short / 60)}m)`;
        } else if (m === 'long') {
          chip.textContent = `Longue (${Math.round(POMO_DURATIONS.long / 60)}m)`;
        }
      });

      resetPomoTimer();
      if (typeof showToast === 'function') {
        showToast(`Intervalles Pomodoro : ${Math.round(POMO_DURATIONS.focus / 60)}m / ${Math.round(POMO_DURATIONS.short / 60)}m`, 'info');
      }
    });
  });

  updatePomoUI();
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
  renderMarketCards();
  renderMarketChecklist();

  // Bouton de filtrage par forte volatilité du jour
  const volatileFilterBtn = document.getElementById('market-filter-volatile-btn');
  if (volatileFilterBtn) {
    volatileFilterBtn.addEventListener('click', () => {
      isMarketVolatileFilterActive = !isMarketVolatileFilterActive;
      volatileFilterBtn.classList.toggle('active', isMarketVolatileFilterActive);
      renderMarketCards();
      if (typeof showToast === 'function') {
        showToast(isMarketVolatileFilterActive ? 'Affichage des actifs les plus volatiles du jour' : 'Affichage de tous les actifs', 'info');
      }
    });
  }

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
      if (preset === 'portfolio') {
        marketAssets.forEach((a) => {
          a.enabled = ['10ap', 'lyp6', 'xmme', 'nvda'].includes(a.id);
        });
      } else if (preset === 'volatile') {
        marketAssets.forEach((a) => {
          a.enabled = ['btc', 'sol', 'tsla', 'mstr', 'nvda'].includes(a.id);
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

