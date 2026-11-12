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
  let selectedWeekDayIso = null; // null = toute la semaine

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
    { name: 'ChatGPT', url: 'https://chatgpt.com/', icon: 'fa-solid fa-bolt', visitedAt: Date.now() - 1000 * 60 * 360 },
    { name: 'GitHub', url: 'https://github.com/', icon: 'fa-brands fa-github', visitedAt: Date.now() - 1000 * 60 * 720 }
  ];

  function getCleanDomain(rawUrl) {
    try {
      const u = new URL(rawUrl);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return rawUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || rawUrl;
    }
  }

  function getVisitedSites() {
    try {
      const raw = localStorage.getItem('startpage_visited_sites');
      if (!raw) {
        localStorage.setItem('startpage_visited_sites', JSON.stringify(SEED_VISITED_SITES));
        return SEED_VISITED_SITES;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : SEED_VISITED_SITES;
    } catch {
      return SEED_VISITED_SITES;
    }
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
    // Conserver les 15 derniers
    if (history.length > 15) history.pop();
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
    if (diffMin < 60) return `Il y a ${diffMin} min`;
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

    const list = getVisitedSites().slice(0, 5);
    if (list.length === 0) {
      container.innerHTML = '<div class="dash-tasks-empty">Aucun site dans l\'historique récent.</div>';
      return;
    }

    container.innerHTML = list
      .map(
        (site) => `
      <a href="${site.url}" target="_blank" rel="noopener noreferrer" class="dash-history-item" data-url="${site.url}" data-name="${site.name}">
        <div class="dash-history-left">
          <div class="dash-history-icon">
            <i class="${site.icon || 'fa-solid fa-globe'}"></i>
          </div>
          <div class="dash-history-info">
            <span class="dash-history-name">${site.name}</span>
            <span class="dash-history-domain">${getCleanDomain(site.url)}</span>
          </div>
        </div>
        <div class="dash-history-right">
          <span class="dash-history-time">${formatRelativeTime(site.visitedAt)}</span>
          <i class="fa-solid fa-arrow-up-right-from-square dash-history-arrow"></i>
        </div>
      </a>
    `
      )
      .join('');

    // Mise à jour de la carte KPI
    const kpiHistoryVal = document.getElementById('kpi-history-val');
    if (kpiHistoryVal) kpiHistoryVal.textContent = `${list.length} récents`;
  }

  /* ========================================================
     2. MODULE MARCHÉS & ETF FAVORIS (S&P500, STOXX 600, EM, NVIDIA)
     ======================================================== */
  function getDashboardMarketAssets() {
    let source = DEFAULT_DASHBOARD_ASSETS;
    if (typeof marketAssets !== 'undefined' && Array.isArray(marketAssets) && marketAssets.length) {
      source = [
        marketAssets.find((a) => a.id === 'sp500' || a.id === '10ap') || DEFAULT_DASHBOARD_ASSETS[0],
        marketAssets.find((a) => a.id === 'lyp6') || DEFAULT_DASHBOARD_ASSETS[1],
        marketAssets.find((a) => a.id === 'xmme') || DEFAULT_DASHBOARD_ASSETS[2],
        marketAssets.find((a) => a.id === 'nvda') || DEFAULT_DASHBOARD_ASSETS[3]
      ];
    }
    return source.map((item, idx) => ({
      ...DEFAULT_DASHBOARD_ASSETS[idx],
      ...item
    }));
  }

  function generateDashboardSparklineSvg(basePrice, changePct, isUp, width = 84, height = 28) {
    const pointsCount = 9;
    const startPrice = basePrice / (1 + changePct / 100);
    const minVal = Math.min(startPrice, basePrice) * 0.996;
    const maxVal = Math.max(startPrice, basePrice) * 1.004;
    const range = Math.max(0.01, maxVal - minVal);

    const pts = [];
    for (let i = 0; i < pointsCount; i++) {
      const progress = i / (pointsCount - 1);
      const wave = Math.sin(progress * Math.PI * 2.2) * 0.28 * (1 - progress);
      const val = startPrice + (basePrice - startPrice) * progress + (basePrice - startPrice) * wave;
      const x = (i / (pointsCount - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 6) - 3;
      pts.push({ x: Number(x.toFixed(1)), y: Math.max(2, Math.min(height - 2, Number(y.toFixed(1)))) });
    }

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const mx = (curr.x + next.x) / 2;
      d += ` C ${mx} ${curr.y}, ${mx} ${next.y}, ${next.x} ${next.y}`;
    }

    const strokeColor = isUp ? '#34d399' : '#f87171';
    const gradientId = `spark-grad-${Math.abs(Math.round(basePrice * 10))}-${isUp ? 'up' : 'down'}`;

    return `
      <svg viewBox="0 0 ${width} ${height}" class="dash-asset-sparkline" preserveAspectRatio="none">
        <defs>
          <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.32" />
            <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <path d="${d} L ${width} ${height} L 0 ${height} Z" fill="url(#${gradientId})" />
        <path d="${d}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" />
      </svg>
    `;
  }

  function renderDashboardMarkets() {
    const grid = document.getElementById('dash-market-cards-grid');
    if (!grid) return;

    const assets = getDashboardMarketAssets();

    grid.innerHTML = assets
      .map((asset) => {
        const isUp = (asset.baseChange ?? 0) >= 0;
        const sign = isUp ? '+' : '';
        const unit = asset.unit || '$';
        const formattedPrice = asset.basePrice.toLocaleString('fr-FR', {
          minimumFractionDigits: asset.basePrice < 100 ? 2 : 1,
          maximumFractionDigits: 2
        });
        const isSelected = asset.id === selectedAssetId;

        return `
        <div class="dash-market-asset-item ${isSelected ? 'is-selected' : ''}" data-asset-id="${asset.id}" title="${asset.name} - Cliquer pour afficher le détail">
          <div class="dash-asset-item-top">
            <div class="dash-asset-identity">
              <div class="dash-asset-icon">
                <i class="${asset.icon || 'fa-solid fa-chart-line'}"></i>
              </div>
              <div class="dash-asset-title-block">
                <strong>${asset.name.split('(')[0].trim()}</strong>
                <span>${asset.sub || asset.symbol}</span>
              </div>
            </div>
            <span class="dash-asset-chg-pill ${isUp ? 'up' : 'down'}">
              ${sign}${Number(asset.baseChange).toFixed(2)}%
            </span>
          </div>

          <div class="dash-asset-chart-row">
            <span class="dash-asset-price-val">${formattedPrice} ${unit}</span>
            ${generateDashboardSparklineSvg(asset.basePrice, asset.baseChange, isUp)}
          </div>
        </div>
      `;
      })
      .join('');

    renderSelectedAssetPreview();

    // Mise à jour de la carte KPI Bourse
    const topAsset = assets.find((a) => a.id === 'nvda') || assets[0];
    const kpiMarketVal = document.getElementById('kpi-market-val');
    const kpiMarketBadge = document.getElementById('kpi-market-badge');
    const kpiMarketSub = document.getElementById('kpi-market-sub');

    if (kpiMarketVal && topAsset) {
      kpiMarketVal.textContent = `${topAsset.name.split(' ')[0]} ${topAsset.basePrice.toFixed(1)}${topAsset.unit}`;
    }
    if (kpiMarketBadge && topAsset) {
      const isUp = topAsset.baseChange >= 0;
      kpiMarketBadge.className = `dash-kpi-badge ${isUp ? 'up' : 'down'}`;
      kpiMarketBadge.textContent = `${isUp ? '+' : ''}${topAsset.baseChange.toFixed(2)}%`;
    }
    if (kpiMarketSub && topAsset) {
      kpiMarketSub.textContent = topAsset.sub || 'Mouvement fort';
    }
  }

  function renderSelectedAssetPreview() {
    const previewContainer = document.getElementById('dash-asset-preview-bar');
    if (!previewContainer) return;

    const assets = getDashboardMarketAssets();
    const current = assets.find((a) => a.id === selectedAssetId) || assets[0];
    if (!current) return;

    const dayL = current.dayLow || current.basePrice * 0.985;
    const dayH = current.dayHigh || current.basePrice * 1.015;
    const isUp = current.baseChange >= 0;

    previewContainer.innerHTML = `
      <div class="dash-preview-stats">
        <div class="dash-stat-item">
          <label>Actif Sélectionné</label>
          <strong>${current.name}</strong>
        </div>
        <div class="dash-stat-item">
          <label>Plus Bas (24h)</label>
          <strong>${dayL.toFixed(2)} ${current.unit}</strong>
        </div>
        <div class="dash-stat-item">
          <label>Plus Haut (24h)</label>
          <strong>${dayH.toFixed(2)} ${current.unit}</strong>
        </div>
        <div class="dash-stat-item">
          <label>Tendance</label>
          <strong style="color: ${isUp ? '#34d399' : '#f87171'}">${isUp ? 'Haussier 🟢' : 'Consolidation 🔴'}</strong>
        </div>
      </div>

      <div class="dash-timeframe-toggles">
        <button type="button" class="dash-tf-btn active">24H</button>
        <button type="button" class="dash-tf-btn">7J</button>
        <button type="button" class="dash-tf-btn">1M</button>
        <button type="button" class="dash-tf-btn">1A</button>
      </div>
    `;
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
    const height = 145;
    const padding = { top: 24, right: 28, bottom: 28, left: 28 };
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
    if (typeof todos !== 'undefined' && Array.isArray(todos)) {
      return todos;
    }
    try {
      const raw = localStorage.getItem('startpage_todos_v2');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
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

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = toIso(d);
      week.push({
        iso,
        name: dayNames[i],
        num: d.getDate(),
        isToday: iso === toIso(now)
      });
    }
    return week;
  }

  function renderDashboardAgenda() {
    const strip = document.getElementById('dash-week-strip');
    const listContainer = document.getElementById('dash-upcoming-list');
    if (!strip || !listContainer) return;

    const allTodos = getDashboardTodos();
    const weekDays = getCurrentWeekDays();
    const todayIso = toIso(new Date());

    // Vérifier les jours contenant des tâches
    const tasksPerDay = {};
    allTodos.forEach((t) => {
      if (t.date && !t.done) {
        tasksPerDay[t.date] = (tasksPerDay[t.date] || 0) + 1;
      }
    });

    // 1. Bandeau de la semaine
    strip.innerHTML = weekDays
      .map((day) => {
        const hasTask = (tasksPerDay[day.iso] || 0) > 0;
        const isSelected = selectedWeekDayIso ? day.iso === selectedWeekDayIso : day.isToday;

        return `
        <div
          class="dash-week-day-pill ${day.isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasTask ? 'has-task' : ''}"
          data-date="${day.iso}"
          title="${day.name} ${day.num} - Cliquer pour filtrer"
        >
          <span class="dash-day-short">${day.name}</span>
          <span class="dash-day-num">${day.num}</span>
          <span class="dash-day-dot"></span>
        </div>
      `;
      })
      .join('');

    // 2. Filtrage des tâches selon le jour sélectionné
    let displayTasks = [];
    if (selectedWeekDayIso) {
      displayTasks = allTodos.filter((t) => t.date === selectedWeekDayIso);
    } else {
      // Toutes les tâches non terminées, triées par date (prochaines en premier)
      displayTasks = allTodos
        .filter((t) => !t.done)
        .sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return a.date.localeCompare(b.date);
        })
        .slice(0, 5);

      // Si moins de 5 tâches non terminées, ajouter les plus récentes terminées
      if (displayTasks.length < 5) {
        const doneTasks = allTodos.filter((t) => t.done).slice(0, 5 - displayTasks.length);
        displayTasks = displayTasks.concat(doneTasks);
      }
    }

    if (displayTasks.length === 0) {
      listContainer.innerHTML = `
        <div class="dash-tasks-empty">
          <i class="fa-solid fa-circle-check" style="color: #34d399; font-size: 1.4rem; margin-bottom: 6px; display: block;"></i>
          Aucune tâche prévue ${selectedWeekDayIso ? 'pour ce jour' : 'cette semaine'} — Tout est à jour !
        </div>
      `;
    } else {
      listContainer.innerHTML = displayTasks
        .map((task) => {
          const originalIdx = allTodos.indexOf(task);
          const prio = task.priority || 'normal';
          const prioLabel = prio === 'urgent' ? '🔴 Urgent' : prio === 'low' ? '🟢 Faible' : '🟡 Normal';

          let dateBadge = '';
          if (task.date) {
            if (task.date === todayIso) dateBadge = 'Aujourd’hui';
            else {
              const dt = new Date(task.date + 'T00:00:00');
              dateBadge = dt.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
            }
          }

          return `
          <div class="dash-task-item ${task.done ? 'is-done' : ''}" data-idx="${originalIdx}">
            <div class="dash-task-left">
              <input
                type="checkbox"
                class="dash-task-checkbox"
                data-idx="${originalIdx}"
                ${task.done ? 'checked' : ''}
                title="${task.done ? 'Marquer comme à faire' : 'Marquer comme fait'}"
              />
              <span class="dash-task-title">${escapeDashHtml(task.text)}</span>
            </div>
            <div class="dash-task-meta">
              <span class="dash-task-badge-prio ${prio}">${prioLabel}</span>
              ${dateBadge ? `<span class="dash-task-badge-date">${dateBadge}</span>` : ''}
            </div>
          </div>
        `;
        })
        .join('');
    }

    // Mise à jour de la carte KPI Agenda
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

  function addQuickDashboardTodo(text) {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();
    const date = selectedWeekDayIso || toIso(new Date());

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
      showToast(`Tâche ajoutée : "${cleanText}"`, 'success');
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
  function attachDashboardEvents() {
    // 1. Clic sur un actif boursier pour le sélectionner
    document.addEventListener('click', (e) => {
      const assetItem = e.target.closest('.dash-market-asset-item');
      if (assetItem) {
        selectedAssetId = assetItem.dataset.assetId || 'nvda';
        renderDashboardMarkets();
        return;
      }

      // 2. Clic sur un jour de la semaine dans le mini agenda
      const dayPill = e.target.closest('.dash-week-day-pill');
      if (dayPill) {
        const dateIso = dayPill.dataset.date;
        selectedWeekDayIso = selectedWeekDayIso === dateIso ? null : dateIso;
        renderDashboardAgenda();
        return;
      }

      // 3. Clic sur la case à cocher d'une tâche
      if (e.target.matches('.dash-task-checkbox')) {
        const idx = Number(e.target.dataset.idx);
        toggleDashboardTodo(idx);
        return;
      }

      // 4. Vider l'historique des sites
      if (e.target.closest('#dash-clear-history-btn')) {
        if (confirm('Voulez-vous réinitialiser l’historique des sites récents ?')) {
          localStorage.setItem('startpage_visited_sites', '[]');
          renderVisitedSites();
          if (typeof showToast === 'function') showToast('Historique des sites récents effacé.', 'info');
        }
        return;
      }

      // 5. Enregistrement automatique des clics sur les signets web
      const bookmarkLink = e.target.closest('a.link-item') || e.target.closest('.dash-history-item');
      if (bookmarkLink) {
        const url = bookmarkLink.getAttribute('href');
        const name = bookmarkLink.dataset.name || bookmarkLink.querySelector('.link-name-text')?.textContent || bookmarkLink.textContent.trim();
        const icon = bookmarkLink.querySelector('i')?.className || 'fa-solid fa-globe';
        if (url && !url.startsWith('#')) {
          recordVisitedSite({ name, url, icon });
        }
        return;
      }

      // 6. Navigation par boutons "data-deck-view" dans les cartes du dashboard
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
