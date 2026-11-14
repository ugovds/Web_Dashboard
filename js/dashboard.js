/**
 * js/dashboard.js - Tableau de bord exécutif "Accueil"
 * Vue cockpit résumée, marchés ciblés (S&P 500, Stoxx 600, EM, NVIDIA),
 * météo avec graphique de températures/précipitations, mini-agenda de la semaine
 * et historique des 5 derniers sites consultés.
 */

(function () {
  'use strict';

  // --- ÉTAT GLOBAL DU DASHBOARD ---
  let selectedAssetId = 'nvda';
  let selectedWeekDayIso = 'TODAY'; // 'TODAY' par défaut = affiche directement les événements du jour

  // Données de secours fiables si hors-ligne ou avant chargement réseau
  const DEFAULT_DASHBOARD_ASSETS = [
    {
      id: 'sp500',
      name: 'S&P 500 Index',
      symbol: 'FOREXCOM:SPXUSD',
      type: 'index',
      icon: 'fa-solid fa-chart-line',
      basePrice: 5864.67,
      baseChange: 0.41,
      dayLow: 5835.2,
      dayHigh: 5880.1,
      unit: 'pts',
      sub: 'Indice US Large-Cap'
    },
    {
      id: 'lyp6',
      name: 'Amundi Stoxx 600',
      symbol: 'XETR:LYP6',
      type: 'etf',
      icon: 'fa-solid fa-landmark',
      basePrice: 327.65,
      baseChange: 0.38,
      dayLow: 325.8,
      dayHigh: 329.1,
      unit: '€',
      sub: 'ETF Europe Large & Mid'
    },
    {
      id: 'xmme',
      name: 'MSCI Emerging Markets',
      symbol: 'XETR:XMME',
      type: 'etf',
      icon: 'fa-solid fa-earth-americas',
      basePrice: 76.85,
      baseChange: -0.42,
      dayLow: 76.1,
      dayHigh: 77.2,
      unit: '€',
      sub: 'ETF Marchés Émergents'
    },
    {
      id: 'nvda',
      name: 'NVIDIA Corporation',
      symbol: 'NASDAQ:NVDA',
      type: 'stock',
      icon: 'fa-solid fa-microchip',
      basePrice: 175.76,
      baseChange: 2.84,
      dayLow: 173.1,
      dayHigh: 178.45,
      unit: '$',
      sub: 'Action Mega-Cap IA'
    }
  ];

  /* ========================================================
     1. GESTION DE L'HISTORIQUE DES SITES CONSULTÉS
     ======================================================== */
  const SEED_VISITED_SITES = [
    { name: 'Gemini', url: 'https://gemini.google.com/app?hl=fr', icon: 'fa-solid fa-wand-magic-sparkles', visitedAt: Date.now() - 1000 * 60 * 12 },
    { name: 'YouTube', url: 'https://www.youtube.com/', icon: 'fa-brands fa-youtube', visitedAt: Date.now() - 1000 * 60 * 45 },
    { name: 'Moodle UCLouvain', url: 'https://moodle.uclouvain.be/my/', icon: 'fa-solid fa-graduation-cap', visitedAt: Date.now() - 1000 * 60 * 130 },
    { name: 'ChatGPT', url: 'https://chatgpt.com/', icon: 'fa-solid fa-bolt', visitedAt: Date.now() - 1000 * 60 * 240 },
    { name: 'GitHub', url: 'https://github.com/', icon: 'fa-brands fa-github', visitedAt: Date.now() - 1000 * 60 * 420 },
    { name: 'TradingView', url: 'https://fr.tradingview.com/', icon: 'fa-solid fa-chart-line', visitedAt: Date.now() - 1000 * 60 * 780 }
  ];

  function getCleanDomain(rawUrl) {
    try {
      const u = new URL(rawUrl);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return String(rawUrl).replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || rawUrl;
    }
  }

  function getSiteVisualTheme(site) {
    const url = (site.url || '').toLowerCase();
    const name = (site.name || '').toLowerCase();

    if (url.includes('youtube') || name.includes('youtube')) {
      return {
        accent: '#ff334b',
        bg: 'linear-gradient(135deg, rgba(255, 51, 75, 0.22), rgba(185, 28, 28, 0.08))',
        border: 'rgba(255, 51, 75, 0.38)',
        glow: 'rgba(255, 51, 75, 0.35)',
        icon: 'fa-brands fa-youtube'
      };
    }
    if (url.includes('gemini') || name.includes('gemini')) {
      return {
        accent: '#38bdf8',
        bg: 'linear-gradient(135deg, rgba(56, 189, 248, 0.24), rgba(14, 165, 233, 0.08))',
        border: 'rgba(56, 189, 248, 0.38)',
        glow: 'rgba(56, 189, 248, 0.35)',
        icon: 'fa-solid fa-wand-magic-sparkles'
      };
    }
    if (url.includes('chatgpt') || url.includes('openai') || name.includes('chatgpt')) {
      return {
        accent: '#10b981',
        bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(5, 150, 105, 0.08))',
        border: 'rgba(16, 185, 129, 0.38)',
        glow: 'rgba(16, 185, 129, 0.35)',
        icon: 'fa-solid fa-bolt'
      };
    }
    if (url.includes('github') || name.includes('github')) {
      return {
        accent: '#a78bfa',
        bg: 'linear-gradient(135deg, rgba(167, 139, 250, 0.22), rgba(124, 58, 237, 0.08))',
        border: 'rgba(167, 139, 250, 0.38)',
        glow: 'rgba(167, 139, 250, 0.35)',
        icon: 'fa-brands fa-github'
      };
    }
    if (url.includes('moodle') || name.includes('moodle') || url.includes('uclouvain')) {
      return {
        accent: '#f59e0b',
        bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.24), rgba(217, 119, 6, 0.08))',
        border: 'rgba(245, 158, 11, 0.38)',
        glow: 'rgba(245, 158, 11, 0.35)',
        icon: 'fa-solid fa-graduation-cap'
      };
    }
    if (url.includes('tradingview') || name.includes('trading')) {
      return {
        accent: '#22c55e',
        bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.22), rgba(22, 163, 74, 0.08))',
        border: 'rgba(34, 197, 94, 0.38)',
        glow: 'rgba(34, 197, 94, 0.35)',
        icon: 'fa-solid fa-chart-line'
      };
    }
    return {
      accent: '#31e1f7',
      bg: 'linear-gradient(135deg, rgba(49, 225, 247, 0.18), rgba(181, 95, 230, 0.1))',
      border: 'rgba(49, 225, 247, 0.32)',
      glow: 'rgba(49, 225, 247, 0.3)',
      icon: site.icon || 'fa-solid fa-globe'
    };
  }

  function getVisitedSites() {
    let list = [];
    try {
      const raw = localStorage.getItem('startpage_visited_sites');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed;
      }
    } catch {}

    // Compléter avec SEED_VISITED_SITES pour toujours garantir 6 applications utiles (2 lignes de 3)
    const existingUrls = new Set(list.map((s) => s.url));
    for (const seed of SEED_VISITED_SITES) {
      if (list.length >= 6) break;
      if (!existingUrls.has(seed.url)) {
        list.push(seed);
        existingUrls.add(seed.url);
      }
    }
    return list.slice(0, 6);
  }

  function recordVisitedSite({ name, url, icon }) {
    if (!url || url.startsWith('javascript:')) return;
    let history = getVisitedSites();
    // Supprimer les occurrences existantes de la même URL
    history = history.filter((item) => item.url !== url);
    // Insérer en première position avec le timestamp actuel
    history.unshift({
      name: name || getCleanDomain(url),
      url,
      icon: icon || 'fa-solid fa-globe',
      visitedAt: Date.now()
    });
    // Conserver les 16 derniers
    if (history.length > 16) history.pop();
    try {
      localStorage.setItem('startpage_visited_sites', JSON.stringify(history));
    } catch {}
    renderVisitedSites();
  }

  function formatRelativeTime(ts) {
    if (!ts) return '';
    const diffSec = Math.max(1, Math.floor((Date.now() - ts) / 1000));
    if (diffSec < 60) return "À l'instant";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) {
      const d = new Date(ts);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `Auj. ${hh}:${mm}`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Hier';
    return `J-${diffDays}`;
  }

  function renderVisitedSites() {
    const container = document.getElementById('dash-history-list');
    if (!container) return;

    const list = getVisitedSites().slice(0, 6);
    if (list.length === 0) {
      container.innerHTML = '<div class="dash-tasks-empty" style="grid-column: 1 / -1;">Aucun site dans l\'historique récent.</div>';
      return;
    }

    container.innerHTML = list
      .map((site) => {
        const theme = getSiteVisualTheme(site);
        const domain = getCleanDomain(site.url);
        const relTime = formatRelativeTime(site.visitedAt);

        return `
        <a
          href="${site.url}"
          target="_blank"
          rel="noopener noreferrer"
          class="dash-history-card-tile"
          data-url="${site.url}"
          data-name="${site.name}"
          style="--tile-accent: ${theme.accent}; --tile-bg: ${theme.bg}; --tile-border: ${theme.border}; --tile-glow: ${theme.glow};"
          title="Ouvrir ${site.name} (${domain})"
        >
          <div class="dash-history-tile-icon-box">
            <i class="${theme.icon}"></i>
          </div>
          <div class="dash-history-tile-content">
            <div class="dash-history-tile-top">
              <span class="dash-history-tile-name">${site.name}</span>
              <i class="fa-solid fa-arrow-up-right-from-square dash-history-tile-arrow"></i>
            </div>
            <div class="dash-history-tile-bottom">
              <span class="dash-history-tile-domain">${domain}</span>
              <span class="dash-history-tile-time">${relTime}</span>
            </div>
          </div>
        </a>
      `;
      })
      .join('');

    // Mise à jour de la carte KPI et sous-titre
    const kpiHistoryVal = document.getElementById('kpi-history-val');
    if (kpiHistoryVal) kpiHistoryVal.textContent = `${list.length} récents`;

    const label = document.getElementById('dash-history-count-label');
    if (label) label.textContent = `${list.length} sites récents • Accès direct`;
  }

  /* ========================================================
     2. MODULE MARCHÉ : ÉVOLUTION DU PORTEFEUILLE (PETIT GRAPHIQUE)
     ======================================================== */
  let currentPortfolioTf = '24h';

  function renderDashboardPortfolio(timeframe = currentPortfolioTf) {
    currentPortfolioTf = timeframe;

    // Mise à jour de l'état actif des boutons d'horizon
    const tfButtons = document.querySelectorAll('#dash-portfolio-timeframe-toggles .dash-tf-btn');
    tfButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.timeframe === timeframe);
    });

    let summary = null;
    if (typeof window.calculatePortfolioSummary === 'function') {
      summary = window.calculatePortfolioSummary();
    }
    if (!summary || typeof summary.totalValue !== 'number') {
      summary = {
        totalValue: 1650.42,
        totalChange24hEur: 12.50,
        totalChange24hPct: 0.76,
        totalInvested: 1513.24,
        gainLatentEur: 137.18,
        gainLatentPct: 9.07
      };
    }

    let chartData = null;
    if (typeof window.getPortfolioChartData === 'function') {
      chartData = window.getPortfolioChartData(timeframe);
    }
    if (!chartData || !chartData.points || !chartData.points.length) {
      const pts = [];
      const count = 16;
      const baseVal = summary.totalValue / (1 + (summary.totalChange24hPct || 0.76) / 100);
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const wave = Math.sin(t * Math.PI * 2.2) * (summary.totalValue * 0.0035);
        const v = baseVal + (summary.totalValue - baseVal) * t + wave;
        pts.push({
          value: Number(v.toFixed(2)),
          label: i === 0 ? 'Début' : i === count - 1 ? 'Direct' : `T-${count - 1 - i}`,
          date: `Horizon ${timeframe}`
        });
      }
      chartData = {
        timeframe,
        points: pts,
        periodChangePct: summary.totalChange24hPct,
        periodChangeEur: summary.totalChange24hEur,
        startVal: baseVal,
        endVal: summary.totalValue,
        minVal: Math.min(...pts.map((p) => p.value)),
        maxVal: Math.max(...pts.map((p) => p.value))
      };
    }

    // 1. Valeur globale
    const valEl = document.getElementById('dash-portfolio-total-val');
    if (valEl) {
      valEl.textContent = `${summary.totalValue.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })} €`;
    }

    // 2. Badge de variation
    const chgEl = document.getElementById('dash-portfolio-chg-badge');
    if (chgEl) {
      const pctVal = chartData.periodChangePct ?? summary.totalChange24hPct ?? 0;
      const eurVal = chartData.periodChangeEur ?? summary.totalChange24hEur ?? 0;
      const isUp = pctVal >= 0;
      chgEl.className = `dash-portfolio-chg ${isUp ? 'up' : 'down'}`;
      chgEl.textContent = `${isUp ? '+' : ''}${pctVal.toFixed(2)}% (${isUp ? '+' : ''}${eurVal.toFixed(2)} €)`;
    }

    // 3. Plus-value latente globale
    const gainEl = document.getElementById('dash-portfolio-gain-text');
    if (gainEl) {
      const isGain = (summary.gainLatentEur ?? 0) >= 0;
      gainEl.textContent = `Plus-value : ${isGain ? '+' : ''}${summary.gainLatentEur.toFixed(2)} € (${isGain ? '+' : ''}${summary.gainLatentPct.toFixed(2)}%)`;
      gainEl.style.color = isGain ? '#34d399' : '#f87171';
    }

    // 4. Tracé du petit graphique interactif SVG
    drawDashboardPortfolioChart(chartData);

    // 5. Barre de pied de carte (Capital, DCA, Rendement)
    renderDashboardPortfolioFooter(summary);
  }

  function drawDashboardPortfolioChart(chartData) {
    const container = document.getElementById('dash-portfolio-svg-container');
    if (!container) return;

    const points = chartData.points;
    if (!points || points.length === 0) return;

    const width = container.clientWidth || 460;
    const height = Math.min(65, Math.max(45, container.clientHeight || 52));
    const padding = { top: 8, right: 14, bottom: 14, left: 14 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const prices = points.map((p) => p.value);
    const minVal = Math.min(...prices) * 0.998;
    const maxVal = Math.max(...prices) * 1.002;
    const range = Math.max(0.01, maxVal - minVal);

    const isPositive = (chartData.periodChangePct ?? 0) >= 0;
    const strokeColor = isPositive ? '#34d399' : '#f87171';

    const coords = points.map((p, i) => {
      const x = padding.left + (i / (points.length - 1)) * chartW;
      const y = padding.top + chartH - ((p.value - minVal) / range) * chartH;
      return { ...p, x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
    });

    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const mx = (curr.x + next.x) / 2;
      pathD += ` C ${mx} ${curr.y}, ${mx} ${next.y}, ${next.x} ${next.y}`;
    }

    const last = coords[coords.length - 1];
    const first = coords[0];
    const areaD = `${pathD} L ${last.x} ${height - padding.bottom} L ${first.x} ${height - padding.bottom} Z`;

    const baselineY = padding.top + chartH - (((chartData.startVal || first.value) - minVal) / range) * chartH;
    const gradId = `dashPortGrad-${isPositive ? 'up' : 'down'}`;

    container.innerHTML = `
      <svg class="dash-portfolio-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.28" />
            <stop offset="85%" stop-color="${strokeColor}" stop-opacity="0.02" />
            <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <line x1="${padding.left}" y1="${baselineY.toFixed(1)}" x2="${(width - padding.right).toFixed(1)}" y2="${baselineY.toFixed(1)}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3 3" />
        <path d="${areaD}" fill="url(#${gradId})" />
        <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />

        <circle cx="${first.x}" cy="${first.y}" r="3" fill="${strokeColor}" opacity="0.6" />
        <circle cx="${last.x}" cy="${last.y}" r="4" fill="${strokeColor}" stroke="#0b101b" stroke-width="2" />

        <text x="${padding.left}" y="${height - 4}" fill="#7c859e" font-size="9" font-weight="600">${first.label || 'Début'}</text>
        <text x="${(width - padding.right)}" y="${height - 4}" text-anchor="end" fill="#7c859e" font-size="9" font-weight="600">${last.label || 'Direct'}</text>
      </svg>
      <div id="dash-portfolio-tooltip" class="dash-port-tooltip"></div>
    `;

    attachPortfolioTooltipEvents(container, coords);
  }

  function attachPortfolioTooltipEvents(container, coords) {
    const tooltip = container.querySelector('#dash-portfolio-tooltip');
    if (!tooltip) return;

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      let closest = coords[0];
      let minDiff = Infinity;
      coords.forEach((p) => {
        const diff = Math.abs(p.x - mouseX);
        if (diff < minDiff) {
          minDiff = diff;
          closest = p;
        }
      });

      if (closest && minDiff < 45) {
        tooltip.style.display = 'block';
        const leftX = Math.min(rect.width - 80, Math.max(80, closest.x));
        tooltip.style.left = `${leftX}px`;
        const valStr = closest.value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        tooltip.innerHTML = `<strong>${valStr} €</strong> • <span>${closest.label || closest.date || ''}</span>`;
      } else {
        tooltip.style.display = 'none';
      }
    });

    container.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.style.display = 'none';
    });
  }

  function renderDashboardPortfolioFooter(summary) {
    const footer = document.getElementById('dash-portfolio-footer-bar');
    if (!footer) return;

    const investedStr = (summary.totalInvested || 1513.24).toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    let nextDcaStr = '19 du mois (+60 €)';
    if (typeof window.getNextDcaDateInfo === 'function') {
      const dcaInfo = window.getNextDcaDateInfo();
      nextDcaStr = `${dcaInfo.dateStr} (J-${dcaInfo.daysRemaining}) • +${dcaInfo.monthlyTotal} €`;
    }

    footer.innerHTML = `
      <div class="dash-port-foot-stat">
        <span class="dash-port-foot-lbl">Capital Investi</span>
        <strong>${investedStr} €</strong>
      </div>
      <div class="dash-port-foot-stat">
        <span class="dash-port-foot-lbl">Prochain DCA</span>
        <strong><i class="fa-solid fa-arrows-rotate" style="color: #31e1f7;"></i> ${nextDcaStr}</strong>
      </div>
      <div class="dash-port-foot-stat">
        <span class="dash-port-foot-lbl">Rendement Global</span>
        <strong style="color: ${(summary.gainLatentPct ?? 0) >= 0 ? '#34d399' : '#f87171'}">
          ${(summary.gainLatentPct ?? 0) >= 0 ? '+' : ''}${(summary.gainLatentPct ?? 0).toFixed(2)}%
        </strong>
      </div>
    `;
  }

  function renderDashboardMarkets() {
    renderDashboardPortfolio(currentPortfolioTf);
  }

  /* ========================================================
     3. MODULE MÉTÉO & GRAPHIQUE DES TEMPÉRATURES / PRÉCIPITATIONS
     ======================================================== */
  // Échantillon par défaut si Open-Meteo n'a pas encore répondu
  const DEFAULT_HOURLY_SAMPLE = [
    { time: '08:00', tempC: '11', chanceofrain: '10', precipMM: '0.0', desc: 'Éclaircies', icon: 'fa-solid fa-cloud-sun' },
    { time: '11:00', tempC: '14', chanceofrain: '25', precipMM: '0.1', desc: 'Nuageux', icon: 'fa-solid fa-cloud' },
    { time: '14:00', tempC: '17', chanceofrain: '60', precipMM: '1.2', desc: 'Averses éparses', icon: 'fa-solid fa-cloud-rain' },
    { time: '17:00', tempC: '16', chanceofrain: '40', precipMM: '0.4', desc: 'Pluie faible', icon: 'fa-solid fa-cloud-rain' },
    { time: '20:00', tempC: '13', chanceofrain: '15', precipMM: '0.0', desc: 'Éclaircies', icon: 'fa-solid fa-cloud-sun' },
    { time: '23:00', tempC: '10', chanceofrain: '5', precipMM: '0.0', desc: 'Ciel dégagé', icon: 'fa-solid fa-moon' },
    { time: '02:00', tempC: '8', chanceofrain: '5', precipMM: '0.0', desc: 'Ciel dégagé', icon: 'fa-solid fa-moon' },
    { time: '05:00', tempC: '9', chanceofrain: '10', precipMM: '0.0', desc: 'Brume matinale', icon: 'fa-solid fa-smog' }
  ];

  function getStoredWeatherData() {
    try {
      const raw = localStorage.getItem('startpage_weather_cache');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.data) return parsed.data;
      }
    } catch {}
    return null;
  }

  function renderDashboardWeather(weatherData) {
    const data = weatherData || getStoredWeatherData();
    const tempHero = document.getElementById('dash-weather-big-temp');
    const descHero = document.getElementById('dash-weather-desc');
    const iconHero = document.getElementById('dash-weather-big-icon');
    const locBadge = document.getElementById('dash-weather-loc-badge');
    const chipsContainer = document.getElementById('dash-weather-details-chips');

    let currentTemp = 14;
    let feelsLike = 13;
    let conditionDesc = 'Éclaircies';
    let iconClass = 'fa-solid fa-cloud-sun';
    let humidity = 65;
    let windKmh = 18;
    let uvIndex = 3;
    let rainTodayMm = '0.0';
    let cityName = 'Paris, France';
    let hourlyList = DEFAULT_HOURLY_SAMPLE;

    if (data && data.current_condition && data.current_condition[0]) {
      const cur = data.current_condition[0];
      currentTemp = parseInt(cur.temp_C, 10) || currentTemp;
      feelsLike = parseInt(cur.FeelsLikeC, 10) || feelsLike;
      humidity = parseInt(cur.humidity, 10) || humidity;
      windKmh = parseInt(cur.windspeedKmph, 10) || windKmh;
      uvIndex = parseInt(cur.uvIndex, 10) || uvIndex;
      conditionDesc = cur.weatherDesc?.[0]?.value || conditionDesc;

      const area = data.nearest_area?.[0];
      const areaName = area?.areaName?.[0]?.value;
      const country = area?.country?.[0]?.value;
      if (areaName) cityName = country ? `${areaName}, ${country}` : areaName;

      // Traduction française basique si présente
      if (typeof translateWeatherDesc === 'function') {
        conditionDesc = translateWeatherDesc(conditionDesc);
      }
      if (typeof getWeatherIconClass === 'function') {
        iconClass = getWeatherIconClass(cur.weatherDesc?.[0]?.value);
      }

      // Extraction des 8 créneaux horaires
      const today = data.weather?.[0];
      if (today && Array.isArray(today.hourly) && today.hourly.length) {
        hourlyList = today.hourly.map((h, i) => {
          let timeLabel = h.time || '';
          if (timeLabel.includes('T')) {
            timeLabel = timeLabel.split('T')[1].slice(0, 5);
          } else if (timeLabel.length === 4) {
            timeLabel = `${timeLabel.slice(0, 2)}:00`;
          } else if (!timeLabel) {
            timeLabel = `${String((i * 3) % 24).padStart(2, '0')}:00`;
          }

          return {
            time: timeLabel,
            tempC: String(h.tempC ?? currentTemp),
            chanceofrain: String(h.chanceofrain ?? '0'),
            precipMM: String(h.precipMM ?? '0.0'),
            desc: h.weatherDesc?.[0]?.value || conditionDesc,
            icon: h.weatherIcon || iconClass
          };
        });
      }
    }

    if (tempHero) tempHero.textContent = `${currentTemp}°C`;
    if (descHero) descHero.textContent = conditionDesc;
    if (iconHero) iconHero.className = `${iconClass} dash-weather-big-icon`;
    if (locBadge) locBadge.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${cityName}`;

    if (chipsContainer) {
      chipsContainer.innerHTML = `
        <span class="dash-weather-chip"><i class="fa-solid fa-temperature-half"></i> Ressenti ${feelsLike}°C</span>
        <span class="dash-weather-chip"><i class="fa-solid fa-droplet"></i> Humidité ${humidity}%</span>
        <span class="dash-weather-chip"><i class="fa-solid fa-wind"></i> Vent ${windKmh} km/h</span>
        <span class="dash-weather-chip"><i class="fa-solid fa-sun"></i> Indice UV ${uvIndex}</span>
      `;
    }

    // Mise à jour de la carte KPI Météo en haut
    const kpiWeatherVal = document.getElementById('kpi-weather-val');
    const kpiWeatherSub = document.getElementById('kpi-weather-sub');
    if (kpiWeatherVal) kpiWeatherVal.textContent = `${currentTemp}°C • ${conditionDesc}`;
    if (kpiWeatherSub) kpiWeatherSub.textContent = `${cityName.split(',')[0]} • Ressenti ${feelsLike}°C`;

    // Dessin du graphique dual SVG (Températures + Barres de précipitations)
    drawDualWeatherChart(hourlyList);

    // Dessin du mini-bandeau 3 jours
    renderWeather3DaysForecast(data);
  }

  function drawDualWeatherChart(hourlyList) {
    const svgContainer = document.getElementById('dash-weather-svg-container');
    if (!svgContainer) return;

    const width = svgContainer.clientWidth || 540;
    const height = Math.min(115, Math.max(70, svgContainer.clientHeight || 100));
    const padding = { top: 14, right: 18, bottom: 20, left: 18 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const temps = hourlyList.map((h) => parseInt(h.tempC, 10));
    const rains = hourlyList.map((h) => parseInt(h.chanceofrain, 10));

    const minT = Math.min(...temps) - 2;
    const maxT = Math.max(...temps) + 2;
    const rangeT = Math.max(1, maxT - minT);

    const stepX = chartW / (hourlyList.length - 1);

    // Calcul des coordonnées
    const points = hourlyList.map((h, i) => {
      const x = padding.left + i * stepX;
      const t = parseInt(h.tempC, 10);
      const y = padding.top + chartH - ((t - minT) / rangeT) * chartH;
      const rainPct = Math.min(100, Math.max(0, parseInt(h.chanceofrain, 10)));
      return { x, y, temp: t, rain: rainPct, time: h.time, desc: h.desc, precipMM: h.precipMM };
    });

    // Tracé de la spline lissée de température
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const mx = (curr.x + next.x) / 2;
      pathD += ` C ${mx} ${curr.y}, ${mx} ${next.y}, ${next.x} ${next.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;

    // Barres de probabilité de précipitations en bas du graphique
    const barWidth = 14;
    const maxBarH = 34; // Hauteur max de la barre de pluie
    const rainBarsSvg = points
      .map((p) => {
        const barH = (p.rain / 100) * maxBarH;
        const barY = height - padding.bottom - barH;
        const opacity = Math.max(0.15, p.rain / 100);
        return `
        <rect
          x="${p.x - barWidth / 2}"
          y="${barY}"
          width="${barWidth}"
          height="${barH}"
          rx="3"
          fill="rgba(56, 189, 248, ${opacity})"
          stroke="rgba(56, 189, 248, 0.4)"
          stroke-width="1"
          class="dash-rain-bar"
          data-time="${p.time}"
          data-temp="${p.temp}°C"
          data-rain="${p.rain}%"
          data-desc="${p.desc}"
        />
        ${p.rain > 15 ? `<text x="${p.x}" y="${barY - 4}" text-anchor="middle" fill="#38bdf8" font-size="9" font-weight="700">${p.rain}%</text>` : ''}
      `;
      })
      .join('');

    // Points et étiquettes de température
    const dotsSvg = points
      .map(
        (p) => `
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="#38bdf8" stroke="#0e121c" stroke-width="2" class="dash-temp-dot" />
      <text x="${p.x}" y="${p.y - 8}" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700">${p.temp}°</text>
      <text x="${p.x}" y="${height - 8}" text-anchor="middle" fill="#7c859e" font-size="10" font-weight="600">${p.time}</text>
    `
      )
      .join('');

    svgContainer.innerHTML = `
      <svg class="dash-weather-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="weatherTempGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.28" />
            <stop offset="85%" stop-color="#38bdf8" stop-opacity="0.02" />
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- Ligne de sol / repère temporel -->
        <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3 3" />

        <!-- Barres de précipitations -->
        ${rainBarsSvg}

        <!-- Remplissage dégradé de température -->
        <path d="${areaD}" fill="url(#weatherTempGrad)" />

        <!-- Courbe de température principale -->
        <path d="${pathD}" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Points et labels -->
        ${dotsSvg}
      </svg>
      <div id="dash-weather-tooltip" class="dash-weather-tooltip"></div>
    `;

    // Interaction tooltip sur les points
    attachChartTooltipEvents(svgContainer, points);
  }

  function attachChartTooltipEvents(container, points) {
    const tooltip = container.querySelector('#dash-weather-tooltip');
    if (!tooltip) return;

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      let closest = points[0];
      let minDiff = Infinity;
      points.forEach((p) => {
        const diff = Math.abs(p.x - mouseX);
        if (diff < minDiff) {
          minDiff = diff;
          closest = p;
        }
      });

      if (closest && minDiff < 40) {
        tooltip.style.display = 'block';
        tooltip.style.left = `${closest.x}px`;
        tooltip.innerHTML = `<strong>${closest.time}</strong> • ${closest.temp}°C • 🌧️ ${closest.rain}% • <em>${closest.desc}</em>`;
      } else {
        tooltip.style.display = 'none';
      }
    });

    container.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  }

  function renderWeather3DaysForecast(data) {
    const row = document.getElementById('dash-weather-3days-row');
    if (!row) return;

    let days = [];
    if (data && data.weather && data.weather.length > 1) {
      days = data.weather.slice(1, 4).map((d) => {
        const dt = new Date(d.date);
        const dayName = dt.toLocaleDateString('fr-FR', { weekday: 'short' });
        const icon = d.hourly?.[0]?.weatherIcon || 'fa-solid fa-cloud-sun';
        return {
          name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
          icon,
          max: d.maxtempC || '--',
          min: d.mintempC || '--'
        };
      });
    } else {
      // Données de secours
      const today = new Date();
      for (let i = 1; i <= 3; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const dayName = d.toLocaleDateString('fr-FR', { weekday: 'short' });
        days.push({
          name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
          icon: i === 1 ? 'fa-solid fa-sun' : i === 2 ? 'fa-solid fa-cloud-sun' : 'fa-solid fa-cloud-rain',
          max: 15 + i,
          min: 9 + i
        });
      }
    }

    row.innerHTML = days
      .map(
        (day) => `
      <div class="dash-day-forecast-card">
        <span class="dash-day-name">${day.name}</span>
        <i class="${day.icon} dash-day-icon"></i>
        <span class="dash-day-temps">↑${day.max}° / ↓${day.min}°</span>
      </div>
    `
      )
      .join('');
  }

  /* ========================================================
     4. MINI AGENDA DE LA SEMAINE & PROCHAINS ÉVÉNEMENTS
     ======================================================== */
  function getDashboardTodos() {
    if (typeof todos !== 'undefined' && Array.isArray(todos) && todos.length > 0) {
      return todos;
    }
    try {
      const raw = localStorage.getItem('startpage_todos_v2');
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}

    // Si aucune donnée n'a jamais été enregistrée (première visite) :
    const rawCheck = localStorage.getItem('startpage_todos_v2');
    if (rawCheck === null) {
      const now = new Date();
      const d0 = toIso(now);
      const d1 = new Date(now); d1.setDate(now.getDate() + 1);
      const d2 = new Date(now); d2.setDate(now.getDate() + 2);

      const seed = [
        { text: 'Revue de projet & déploiement version 2.0', date: d0, priority: 'urgent', done: false },
        { text: 'Préparation réunion d’architecture logicielle', date: toIso(d1), priority: 'normal', done: false },
        { text: 'Exercices et révision sur Moodle UCLouvain', date: toIso(d2), priority: 'normal', done: false }
      ];
      try {
        localStorage.setItem('startpage_todos_v2', JSON.stringify(seed));
        if (typeof todos !== 'undefined') {
          todos = seed.slice();
        }
      } catch {}
      return seed;
    }

    return typeof todos !== 'undefined' && Array.isArray(todos) ? todos : [];
  }

  function toIso(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function getCurrentWeekDays() {
    const now = new Date();
    const currentDayOfWeek = (now.getDay() + 6) % 7; // Lundi = 0, Dimanche = 6
    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDayOfWeek);

    const week = [];
    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const fullNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = toIso(d);
      week.push({
        iso,
        name: dayNames[i],
        fullName: fullNames[i],
        num: d.getDate(),
        isToday: iso === toIso(now)
      });
    }
    return week;
  }

  function getTaskDayBadgeInfo(taskDate, todayIso) {
    if (!taskDate) {
      return { label: 'À PLANIFIER', cls: 'badge-no-date', shortName: 'Libre' };
    }
    if (taskDate < todayIso) {
      return { label: 'EN RETARD', cls: 'badge-overdue', shortName: 'Retard' };
    }
    if (taskDate === todayIso) {
      return { label: "AUJOURD'HUI", cls: 'badge-today', shortName: "Aujourd'hui" };
    }

    // Calculer si c'est demain
    const today = new Date(todayIso + 'T00:00:00');
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowIso = toIso(tomorrow);
    if (taskDate === tomorrowIso) {
      return { label: 'DEMAIN', cls: 'badge-tomorrow', shortName: 'Demain' };
    }

    try {
      const dt = new Date(taskDate + 'T00:00:00');
      const dayStr = dt
        .toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
        .toUpperCase()
        .replace('.', '');
      return { label: dayStr, cls: 'badge-future', shortName: dayStr };
    } catch {
      return { label: taskDate, cls: 'badge-future', shortName: taskDate };
    }
  }

  function renderDashboardAgenda() {
    const strip = document.getElementById('dash-week-strip');
    const filterBar = document.getElementById('dash-agenda-filter-bar');
    const listContainer = document.getElementById('dash-upcoming-list');
    const fastInput = document.getElementById('dash-task-fast-input');
    if (!strip || !listContainer) return;

    const allTodos = getDashboardTodos();
    const weekDays = getCurrentWeekDays();
    const todayIso = toIso(new Date());

    // Détermination de la date effective
    const isShowingAll = selectedWeekDayIso === 'ALL';
    const effectiveDayIso = (!selectedWeekDayIso || selectedWeekDayIso === 'TODAY') ? todayIso : (isShowingAll ? null : selectedWeekDayIso);
    const isTodayMode = !isShowingAll && effectiveDayIso === todayIso;

    // Compter les tâches par date (non terminées)
    const pendingTasksPerDay = {};
    allTodos.forEach((t) => {
      if (t.date && !t.done) {
        pendingTasksPerDay[t.date] = (pendingTasksPerDay[t.date] || 0) + 1;
      }
    });

    // 1. Bandeau des 7 jours de la semaine
    strip.innerHTML = weekDays
      .map((day) => {
        const taskCount = pendingTasksPerDay[day.iso] || 0;
        const isSelected = effectiveDayIso ? effectiveDayIso === day.iso : false;
        const isToday = day.isToday;

        return `
        <div
          class="dash-week-day-pill ${isToday ? 'is-today' : ''} ${isSelected ? 'selected' : ''} ${taskCount > 0 ? 'has-task' : ''}"
          data-date="${day.iso}"
          title="${day.fullName} ${day.num} — Cliquer pour afficher uniquement ce jour"
        >
          <span class="dash-day-short">${day.name}</span>
          <span class="dash-day-num">${day.num}</span>
          <div class="dash-day-indicator">
            ${taskCount > 0 ? `<span class="dash-day-task-count">${taskCount}</span>` : `<span class="dash-day-dot"></span>`}
          </div>
        </div>
      `;
      })
      .join('');

    // Fonction de rendu unitaire d'une tâche
    const renderTaskHtml = (task) => {
      const originalIdx = allTodos.indexOf(task);
      const prio = task.priority || 'normal';
      const dayBadge = getTaskDayBadgeInfo(task.date, todayIso);
      const prioLabel = prio === 'urgent' ? '🔴 Urgent' : prio === 'low' ? '🟢 Faible' : '🟡 Normal';

      return `
        <div class="dash-task-item priority-${prio} ${task.done ? 'is-done' : ''}" data-idx="${originalIdx}">
          <div class="dash-task-left">
            <input
              type="checkbox"
              class="dash-task-checkbox"
              data-idx="${originalIdx}"
              ${task.done ? 'checked' : ''}
              title="${task.done ? 'Marquer comme à faire' : 'Marquer comme fait'}"
            />
            <div class="dash-task-details">
              <span class="dash-task-title">${escapeDashHtml(task.text)}</span>
              <div class="dash-task-sub-info">
                <span class="dash-task-day-tag ${dayBadge.cls}">
                  <i class="fa-regular fa-calendar"></i> ${dayBadge.label}
                </span>
                <span class="dash-task-badge-prio ${prio}">
                  ${prioLabel}
                </span>
              </div>
            </div>
          </div>
          <button type="button" class="dash-task-delete-btn" data-idx="${originalIdx}" title="Supprimer la tâche">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;
    };

    // 2. Rendu des tâches avec affichage prioritaire des événements du jour
    let htmlOutput = '';

    if (isTodayMode) {
      // Par défaut : Tous les événements du jour
      const todayTasks = allTodos.filter((t) => t.date === todayIso);
      const upcomingTasks = allTodos
        .filter((t) => !t.done && t.date && t.date > todayIso)
        .sort((a, b) => a.date.localeCompare(b.date));

      if (todayTasks.length > 0) {
        htmlOutput += todayTasks.map(renderTaskHtml).join('');
        if (upcomingTasks.length > 0) {
          htmlOutput += `
            <div class="dash-agenda-subhead">
              <i class="fa-solid fa-arrow-right"></i> Prochaines échéances (${upcomingTasks.length})
            </div>
          `;
          htmlOutput += upcomingTasks.map(renderTaskHtml).join('');
        }
      } else {
        htmlOutput += `
          <div class="dash-today-empty-card">
            <i class="fa-solid fa-circle-check" style="color: #34d399; font-size: 0.95rem;"></i>
            <span>Aucune tâche restante pour aujourd'hui</span>
          </div>
        `;
        if (upcomingTasks.length > 0) {
          htmlOutput += `
            <div class="dash-agenda-subhead">
              <i class="fa-solid fa-arrow-right"></i> Prochaines échéances (${upcomingTasks.length}) :
            </div>
          `;
          htmlOutput += upcomingTasks.map(renderTaskHtml).join('');
        } else {
          htmlOutput += `
            <div class="dash-tasks-empty">
              <div class="dash-empty-icon-wrap"><i class="fa-solid fa-circle-check"></i></div>
              <p class="dash-empty-title">Toutes vos tâches sont à jour !</p>
              <span class="dash-empty-sub">Aucune échéance en attente cette semaine.</span>
            </div>
          `;
        }
      }

      if (filterBar) {
        filterBar.innerHTML = `
          <div class="dash-agenda-filter-active">
            <div class="dash-agenda-filter-info">
              <span class="dash-filter-active-dot"></span>
              <span>Événements : <strong>Aujourd'hui</strong></span>
              <span class="dash-filter-today-tag">AUJOURD’HUI</span>
              <span class="dash-filter-count-chip">${todayTasks.length} aujourd'hui</span>
            </div>
            <button type="button" id="dash-clear-day-filter-btn" class="dash-filter-reset-pill" title="Afficher toutes les tâches de la semaine">
              <i class="fa-solid fa-list-ul"></i> Toute la semaine
            </button>
          </div>
        `;
      }
    } else if (effectiveDayIso) {
      // Filtrage strict par un autre jour sélectionné
      const selectedDayObj = weekDays.find((d) => d.iso === effectiveDayIso);
      const dayTasks = allTodos.filter((t) => t.date === effectiveDayIso);

      const formattedDate = new Date(effectiveDayIso + 'T00:00:00').toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
      const capitalized = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

      if (dayTasks.length > 0) {
        htmlOutput = dayTasks.map(renderTaskHtml).join('');
      } else {
        htmlOutput = `
          <div class="dash-tasks-empty">
            <div class="dash-empty-icon-wrap">
              <i class="fa-regular fa-calendar-check"></i>
            </div>
            <p class="dash-empty-title">Aucune tâche prévue pour ce ${capitalized}</p>
            <span class="dash-empty-sub">Ajoutez une tâche pour cette journée via le champ ci-dessous.</span>
          </div>
        `;
      }

      if (filterBar) {
        filterBar.innerHTML = `
          <div class="dash-agenda-filter-active">
            <div class="dash-agenda-filter-info">
              <span class="dash-filter-active-dot"></span>
              <span>Jour filtré : <strong>${capitalized}</strong></span>
              <span class="dash-filter-count-chip">${dayTasks.length} tâche${dayTasks.length > 1 ? 's' : ''}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <button type="button" id="dash-focus-today-btn" class="dash-filter-reset-pill" style="border-color: rgba(49, 225, 247, 0.4); color: #31e1f7;" title="Revenir à aujourd'hui">
                <i class="fa-regular fa-calendar-check"></i> Aujourd'hui
              </button>
              <button type="button" id="dash-clear-day-filter-btn" class="dash-filter-reset-pill" title="Afficher toutes les tâches de la semaine">
                <i class="fa-solid fa-list-ul"></i> Toute la semaine
              </button>
            </div>
          </div>
        `;
      }
    } else {
      // Mode Toute la semaine
      const pendingTasks = allTodos
        .filter((t) => !t.done)
        .sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return a.date.localeCompare(b.date);
        });

      if (pendingTasks.length > 0) {
        htmlOutput = pendingTasks.map(renderTaskHtml).join('');
      } else {
        htmlOutput = `
          <div class="dash-tasks-empty">
            <div class="dash-empty-icon-wrap">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <p class="dash-empty-title">Toutes vos tâches sont à jour !</p>
            <span class="dash-empty-sub">Aucune échéance en attente cette semaine.</span>
          </div>
        `;
      }

      if (filterBar) {
        filterBar.innerHTML = `
          <div class="dash-agenda-filter-all">
            <div class="dash-agenda-filter-all-left">
              <i class="fa-regular fa-calendar-days"></i>
              <span>Vue générale : Toute la semaine (${pendingTasks.length} à faire)</span>
            </div>
            <button type="button" id="dash-focus-today-btn" class="dash-filter-reset-pill" style="border-color: rgba(49, 225, 247, 0.4); color: #31e1f7;" title="Revenir aux événements d'aujourd'hui">
              <i class="fa-regular fa-calendar-check"></i> Aujourd'hui
            </button>
          </div>
        `;
      }
    }

    listContainer.innerHTML = htmlOutput;

    // 3. Placeholder dynamique de l'input rapide
    if (fastInput) {
      if (isTodayMode) {
        fastInput.placeholder = "+ Ajouter une tâche pour aujourd'hui... (Entrée)";
      } else if (effectiveDayIso) {
        const shortName = weekDays.find((d) => d.iso === effectiveDayIso)?.name || 'ce jour';
        fastInput.placeholder = `+ Ajouter une tâche pour ce ${shortName}... (Entrée)`;
      } else {
        fastInput.placeholder = "+ Ajouter une tâche rapide... (Entrée)";
      }
    }

    // 6. Mise à jour de la carte KPI Agenda
    const pendingCount = allTodos.filter((t) => !t.done).length;
    const urgentCount = allTodos.filter((t) => !t.done && t.priority === 'urgent').length;
    const kpiAgendaVal = document.getElementById('kpi-agenda-val');
    const kpiAgendaBadge = document.getElementById('kpi-agenda-badge');
    const kpiAgendaSub = document.getElementById('kpi-agenda-sub');

    if (kpiAgendaVal) kpiAgendaVal.textContent = `${pendingCount} à faire`;
    if (kpiAgendaBadge) {
      kpiAgendaBadge.className = `dash-kpi-badge ${urgentCount > 0 ? 'down' : 'neutral'}`;
      kpiAgendaBadge.textContent = urgentCount > 0 ? `${urgentCount} urgente${urgentCount > 1 ? 's' : ''}` : 'À jour';
    }
    if (kpiAgendaSub) {
      kpiAgendaSub.textContent = pendingCount === 0 ? 'Toutes tâches faites' : `Prochaine échéance cette semaine`;
    }
  }

  function toggleDashboardTodo(idx) {
    if (typeof todos !== 'undefined' && todos[idx]) {
      todos[idx].done = !todos[idx].done;
      if (typeof saveAndRenderTodos === 'function') {
        saveAndRenderTodos();
      }
    } else {
      const stored = getDashboardTodos();
      if (stored[idx]) {
        stored[idx].done = !stored[idx].done;
        localStorage.setItem('startpage_todos_v2', JSON.stringify(stored));
      }
    }
    renderDashboardAgenda();
  }

  function deleteDashboardTodo(idx) {
    if (typeof todos !== 'undefined' && todos[idx] !== undefined) {
      todos.splice(idx, 1);
      if (typeof saveAndRenderTodos === 'function') {
        saveAndRenderTodos();
      }
    } else {
      const stored = getDashboardTodos();
      if (stored[idx] !== undefined) {
        stored.splice(idx, 1);
        localStorage.setItem('startpage_todos_v2', JSON.stringify(stored));
      }
    }
    renderDashboardAgenda();
    if (typeof showToast === 'function') showToast('Tâche supprimée', 'info');
  }

  function addQuickDashboardTodo(text) {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();
    const todayIso = toIso(new Date());
    const isShowingAll = selectedWeekDayIso === 'ALL';
    const effectiveDayIso = (!selectedWeekDayIso || selectedWeekDayIso === 'TODAY') ? todayIso : (isShowingAll ? null : selectedWeekDayIso);
    const date = effectiveDayIso || todayIso;

    if (typeof todos !== 'undefined') {
      todos.unshift({
        text: cleanText,
        date,
        priority: 'normal',
        done: false
      });
      if (typeof saveAndRenderTodos === 'function') {
        saveAndRenderTodos();
      }
    } else {
      const stored = getDashboardTodos();
      stored.unshift({
        text: cleanText,
        date,
        priority: 'normal',
        done: false
      });
      localStorage.setItem('startpage_todos_v2', JSON.stringify(stored));
    }

    renderDashboardAgenda();
    if (typeof showToast === 'function') {
      showToast(`Tâche ajoutée pour le ${date} : "${cleanText}"`, 'success');
    }
  }

  function escapeDashHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (m) => {
      switch (m) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#039;';
        default: return m;
      }
    });
  }

  /* ========================================================
     5. HERO & HORLOGE DU DASHBOARD
     ======================================================== */
  function updateDashboardGreeting() {
    const greetingEl = document.getElementById('dash-greeting-label');
    const timeEl = document.getElementById('dash-tele-time');
    const dateEl = document.getElementById('dash-tele-date');

    const now = new Date();
    const hours = now.getHours();

    let greeting = 'Bonjour';
    if (hours >= 12 && hours < 18) greeting = 'Bon après-midi';
    else if (hours >= 18 || hours < 5) greeting = 'Bonsoir';

    if (greetingEl) greetingEl.textContent = `${greeting}, Commandant 👋`;

    if (timeEl) {
      const hh = String(hours).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      timeEl.textContent = `${hh}:${mm}`;
    }

    if (dateEl) {
      const formatted = now.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
      dateEl.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
  }

  /* ========================================================
     6. ATTACHEMENT DES ÉVÉNEMENTS UTILISATEURS
     ======================================================== */
  let dashboardEventsAttached = false;

  function attachDashboardEvents() {
    if (dashboardEventsAttached) return;
    dashboardEventsAttached = true;

    // 1. Clic général délégué
    document.addEventListener('click', (e) => {
      // 1a. Clic sur l'horizon temporel du portefeuille (24H, 7J, 1M, 1A)
      const portTfBtn = e.target.closest('#dash-portfolio-timeframe-toggles .dash-tf-btn');
      if (portTfBtn) {
        e.preventDefault();
        const tf = portTfBtn.dataset.timeframe || '24h';
        renderDashboardPortfolio(tf);
        return;
      }

      const assetItem = e.target.closest('.dash-market-asset-item');
      if (assetItem) {
        selectedAssetId = assetItem.dataset.assetId || 'nvda';
        renderDashboardMarkets();
        return;
      }

      // 2. Clic sur un jour de la semaine dans le mini agenda
      const dayPill = e.target.closest('.dash-week-day-pill');
      if (dayPill) {
        e.preventDefault();
        const dateIso = dayPill.dataset.date;
        const todayIso = toIso(new Date());
        if (dateIso === todayIso) {
          selectedWeekDayIso = (selectedWeekDayIso === 'TODAY' || selectedWeekDayIso === todayIso) ? 'ALL' : 'TODAY';
        } else {
          selectedWeekDayIso = selectedWeekDayIso === dateIso ? 'TODAY' : dateIso;
        }
        renderDashboardAgenda();
        return;
      }

      // 3. Réinitialisation du filtre (Toute la semaine)
      if (e.target.closest('#dash-clear-day-filter-btn')) {
        e.preventDefault();
        selectedWeekDayIso = 'ALL';
        renderDashboardAgenda();
        return;
      }

      // 3bis. Bouton Revenir à Aujourd'hui
      if (e.target.closest('#dash-focus-today-btn')) {
        e.preventDefault();
        selectedWeekDayIso = 'TODAY';
        renderDashboardAgenda();
        return;
      }

      // 4. Clic sur la case à cocher d'une tâche
      if (e.target.matches('.dash-task-checkbox')) {
        const idx = Number(e.target.dataset.idx);
        toggleDashboardTodo(idx);
        return;
      }

      // 5. Clic sur le bouton de suppression d'une tâche
      const delTaskBtn = e.target.closest('.dash-task-delete-btn');
      if (delTaskBtn) {
        e.preventDefault();
        const idx = Number(delTaskBtn.dataset.idx);
        deleteDashboardTodo(idx);
        return;
      }

      // 6. Vider l'historique des sites
      if (e.target.closest('#dash-clear-history-btn')) {
        if (confirm('Voulez-vous réinitialiser l’historique des sites récents ?')) {
          localStorage.setItem('startpage_visited_sites', '[]');
          renderVisitedSites();
          if (typeof showToast === 'function') showToast('Historique des sites récents effacé.', 'info');
        }
        return;
      }

      // 7. Enregistrement automatique des clics sur les signets web & cartes de l'historique
      const bookmarkLink = e.target.closest('a.link-item') || e.target.closest('.dash-history-item') || e.target.closest('.dash-history-card-tile');
      if (bookmarkLink) {
        const url = bookmarkLink.getAttribute('href');
        const name = bookmarkLink.dataset.name || bookmarkLink.querySelector('.dash-history-tile-name')?.textContent || bookmarkLink.querySelector('.link-name-text')?.textContent || bookmarkLink.textContent.trim();
        const icon = bookmarkLink.querySelector('i')?.className || 'fa-solid fa-globe';
        if (url && !url.startsWith('#')) {
          recordVisitedSite({ name, url, icon });
        }
        return;
      }

      // 8. Navigation par boutons "data-deck-view" dans les cartes du dashboard
      const navTargetBtn = e.target.closest('[data-deck-view]');
      if (navTargetBtn && !navTargetBtn.classList.contains('deck-nav-btn')) {
        const targetView = navTargetBtn.dataset.deckView;
        const realNavBtn = document.querySelector(`.deck-nav-btn[data-deck-view="${targetView}"]`);
        if (realNavBtn) {
          realNavBtn.click();
        }
      }
    });

    // 7. Formulaire d'ajout rapide de tâche dans le dashboard
    const fastForm = document.getElementById('dash-task-fast-form');
    const fastInput = document.getElementById('dash-task-fast-input');
    if (fastForm && fastInput) {
      fastForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = fastInput.value.trim();
        if (val) {
          addQuickDashboardTodo(val);
          fastInput.value = '';
        }
      });
    }

    // 8. Bouton "+ Nouveau Raccourci" dans le nouvel onglet Raccourcis
    const addBookmarkBtn = document.getElementById('bookmarks-add-link-btn');
    if (addBookmarkBtn) {
      addBookmarkBtn.addEventListener('click', () => {
        if (typeof openEditModal === 'function') {
          openEditModal(0, null);
        }
      });
    }

    // 9. Horloge en direct toutes les 30s
    setInterval(updateDashboardGreeting, 30000);
  }

  /* ========================================================
     7. INITIALISATION DU MODULE DASHBOARD
     ======================================================== */
  function initOverviewDashboard() {
    updateDashboardGreeting();
    renderVisitedSites();
    renderDashboardMarkets();
    renderDashboardWeather();
    renderDashboardAgenda();
    attachDashboardEvents();
  }

  // Exposition des fonctions pour les hooks d'autres modules (météo, tâches, marchés)
  window.initOverviewDashboard = initOverviewDashboard;
  window.renderDashboardMarkets = renderDashboardMarkets;
  window.renderDashboardPortfolio = renderDashboardPortfolio;
  window.renderDashboardWeather = renderDashboardWeather;
  window.renderDashboardAgenda = renderDashboardAgenda;
  window.renderVisitedSites = renderVisitedSites;
  window.recordVisitedSite = recordVisitedSite;

  // Auto-lancement si le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOverviewDashboard);
  } else {
    initOverviewDashboard();
  }
})();
