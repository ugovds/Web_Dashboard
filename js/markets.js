/**
 * markets.js - Hub Marchés Boursiers, Actions, ETF & Cryptos
 * Graphiques interactifs TradingView, cotations en temps réel, watchlist & sparklines
 */

const DEFAULT_MARKET_ASSETS = [
  // ETF & Fonds Européens / Mondiaux
  {
    id: '10ap',
    name: 'Amundi S&P 500 (10AP)',
    symbol: 'EURONEXT:10AP',
    type: 'etf',
    icon: 'fa-solid fa-chart-line',
    basePrice: 137.30,
    baseChange: 0.52,
    dayLow: 136.20,
    dayHigh: 137.95,
    unit: '€',
    exchange: 'Euronext Paris',
    enabled: true
  },
  {
    id: 'lyp6',
    name: 'Amundi Stoxx 600 (LYP6)',
    symbol: 'XETR:LYP6',
    type: 'etf',
    icon: 'fa-solid fa-landmark',
    basePrice: 327.65,
    baseChange: 0.38,
    dayLow: 325.10,
    dayHigh: 328.40,
    unit: '€',
    exchange: 'Xetra',
    enabled: true
  },
  {
    id: 'xmme',
    name: 'Xtrackers MSCI EM (XMME)',
    symbol: 'XETR:XMME',
    type: 'etf',
    icon: 'fa-solid fa-earth-americas',
    basePrice: 76.85,
    baseChange: -0.42,
    dayLow: 76.10,
    dayHigh: 77.20,
    unit: '€',
    exchange: 'Xetra',
    enabled: true
  },
  {
    id: 'vwce',
    name: 'Vanguard All-World (VWCE)',
    symbol: 'XETR:VWCE',
    type: 'etf',
    icon: 'fa-solid fa-globe',
    basePrice: 128.40,
    baseChange: 0.45,
    dayLow: 127.80,
    dayHigh: 128.95,
    unit: '€',
    exchange: 'Xetra',
    enabled: true
  },

  // Actions Internationales
  {
    id: 'nvda',
    name: 'NVIDIA Corporation (NVDA)',
    symbol: 'NASDAQ:NVDA',
    type: 'stock',
    icon: 'fa-solid fa-microchip',
    basePrice: 175.76,
    baseChange: 2.84,
    dayLow: 173.10,
    dayHigh: 178.45,
    unit: '$',
    exchange: 'Nasdaq',
    enabled: true,
    isVolatile: true
  },
  {
    id: 'tsla',
    name: 'Tesla Inc. (TSLA)',
    symbol: 'NASDAQ:TSLA',
    type: 'stock',
    icon: 'fa-solid fa-car',
    basePrice: 248.50,
    baseChange: 3.12,
    dayLow: 242.00,
    dayHigh: 251.80,
    unit: '$',
    exchange: 'Nasdaq',
    enabled: true,
    isVolatile: true
  },
  {
    id: 'aapl',
    name: 'Apple Inc. (AAPL)',
    symbol: 'NASDAQ:AAPL',
    type: 'stock',
    icon: 'fa-brands fa-apple',
    basePrice: 227.40,
    baseChange: 0.85,
    dayLow: 225.60,
    dayHigh: 228.90,
    unit: '$',
    exchange: 'Nasdaq',
    enabled: true
  },
  {
    id: 'msft',
    name: 'Microsoft Corp. (MSFT)',
    symbol: 'NASDAQ:MSFT',
    type: 'stock',
    icon: 'fa-brands fa-microsoft',
    basePrice: 425.10,
    baseChange: 1.15,
    dayLow: 422.30,
    dayHigh: 427.50,
    unit: '$',
    exchange: 'Nasdaq',
    enabled: true
  },
  {
    id: 'mstr',
    name: 'MicroStrategy (MSTR)',
    symbol: 'NASDAQ:MSTR',
    type: 'stock',
    icon: 'fa-solid fa-fire',
    basePrice: 215.30,
    baseChange: 8.65,
    dayLow: 204.00,
    dayHigh: 222.00,
    unit: '$',
    exchange: 'Nasdaq',
    enabled: true,
    isVolatile: true
  },

  // Cryptomonnaies
  {
    id: 'btc',
    name: 'Bitcoin (BTC)',
    symbol: 'BINANCE:BTCUSDT',
    type: 'crypto',
    icon: 'fa-brands fa-bitcoin',
    basePrice: 74117.00,
    baseChange: 3.45,
    dayLow: 71800.00,
    dayHigh: 74900.00,
    unit: '$',
    exchange: 'Binance',
    enabled: true,
    isVolatile: true
  },
  {
    id: 'eth',
    name: 'Ethereum (ETH)',
    symbol: 'BINANCE:ETHUSDT',
    type: 'crypto',
    icon: 'fa-brands fa-ethereum',
    basePrice: 2640.50,
    baseChange: 2.15,
    dayLow: 2580.00,
    dayHigh: 2690.00,
    unit: '$',
    exchange: 'Binance',
    enabled: true
  },
  {
    id: 'sol',
    name: 'Solana (SOL)',
    symbol: 'BINANCE:SOLUSDT',
    type: 'crypto',
    icon: 'fa-solid fa-bolt',
    basePrice: 95.66,
    baseChange: -4.82,
    dayLow: 93.20,
    dayHigh: 101.50,
    unit: '$',
    exchange: 'Binance',
    enabled: true,
    isVolatile: true
  },

  // Indices & Forex
  {
    id: 'sp500',
    name: 'S&P 500 Index',
    symbol: 'FOREXCOM:SPXUSD',
    type: 'index',
    icon: 'fa-solid fa-chart-line',
    basePrice: 5864.67,
    baseChange: 0.41,
    dayLow: 5840.00,
    dayHigh: 5880.00,
    unit: 'pts',
    exchange: 'US Indices',
    enabled: true
  },
  {
    id: 'cac40',
    name: 'CAC 40 Index',
    symbol: 'EURONEXT:PX1',
    type: 'index',
    icon: 'fa-solid fa-building-columns',
    basePrice: 7480.25,
    baseChange: 0.65,
    dayLow: 7440.00,
    dayHigh: 7510.00,
    unit: 'pts',
    exchange: 'Euronext Paris',
    enabled: true
  },
  {
    id: 'eurusd',
    name: 'EUR / USD Forex',
    symbol: 'FX:EURUSD',
    type: 'forex',
    icon: 'fa-solid fa-euro-sign',
    basePrice: 1.0852,
    baseChange: 0.12,
    dayLow: 1.0820,
    dayHigh: 1.0875,
    unit: '$',
    exchange: 'Forex',
    enabled: true
  }
];

const GLOBAL_INDICES = [
  { name: 'S&P 500', symbol: 'FOREXCOM:SPXUSD', val: '5 864,67', change: '+0.41%', up: true },
  { name: 'Nasdaq 100', symbol: 'FOREXCOM:NSXUSD', val: '20 450,12', change: '+0.85%', up: true },
  { name: 'Dow Jones', symbol: 'TVC:DJI', val: '42 210,50', change: '+0.18%', up: true },
  { name: 'CAC 40', symbol: 'EURONEXT:PX1', val: '7 480,25', change: '+0.65%', up: true },
  { name: 'Euro Stoxx 50', symbol: 'INDEX:SX5E', val: '4 982,10', change: '+0.32%', up: true },
  { name: 'Bitcoin', symbol: 'BINANCE:BTCUSDT', val: '74 117 $', change: '+3.45%', up: true },
  { name: 'Or / Gold', symbol: 'TVC:GOLD', val: '2 735,80 $', change: '+0.42%', up: true },
  { name: 'Pétrole Brent', symbol: 'TVC:UKOIL', val: '74,20 $', change: '-0.75%', up: false },
  { name: 'EUR / USD', symbol: 'FX:EURUSD', val: '1.0852 $', change: '+0.12%', up: true }
];

let marketAssets = loadMarketAssets();
let currentMarketCategory = 'all';
let currentMarketSearch = '';
let isMarketVolatileFilterActive = false;
let currentChartTimeframe = 'D';
let currentlyInspectedAsset = null;

function loadMarketAssets() {
  try {
    const raw = localStorage.getItem('violet_market_assets_v4');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return JSON.parse(JSON.stringify(DEFAULT_MARKET_ASSETS));
}

function saveMarketAssets() {
  try {
    localStorage.setItem('violet_market_assets_v4', JSON.stringify(marketAssets));
  } catch {}
}

/**
 * Génère un tracé SVG spline lissé pour la sparkline
 */
function generateSparklinePaths(basePrice, changePct, isUp) {
  const points = [];
  const startPrice = basePrice / (1 + changePct / 100);
  const totalSteps = 10;
  const minVal = Math.min(startPrice, basePrice) * 0.995;
  const maxVal = Math.max(startPrice, basePrice) * 1.005;
  const span = Math.max(0.01, maxVal - minVal);

  for (let i = 0; i <= totalSteps; i++) {
    const x = i * (100 / totalSteps);
    let val = startPrice + (basePrice - startPrice) * (i / totalSteps);
    // Micro-fluctuations réalistes
    if (i > 0 && i < totalSteps) {
      const wiggle = (Math.sin(i * 1.4) * (basePrice * 0.003)) * (isUp ? 1 : -1);
      val += wiggle;
    }
    const y = 32 - Math.max(4, Math.min(28, ((val - minVal) / span) * 28));
    points.push({ x, y });
  }

  let linePath = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cX = (prev.x + curr.x) / 2;
    linePath += ` C ${cX.toFixed(1)} ${prev.y.toFixed(1)}, ${cX.toFixed(1)} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }

  const areaPath = `${linePath} L 100 36 L 0 36 Z`;
  return { linePath, areaPath };
}

/**
 * Rendu du bandeau des indices boursiers mondiaux
 */
function renderIndicesMarquee() {
  const marqueeTrack = document.getElementById('markets-indices-marquee');
  if (!marqueeTrack) return;

  marqueeTrack.innerHTML = GLOBAL_INDICES.map((idx) => `
    <div class="market-index-pill" data-index-sym="${idx.symbol}" title="Cliquer pour afficher le graphique ${idx.name}">
      <span class="index-pill-name">${idx.name}</span>
      <span class="index-pill-val">${idx.val}</span>
      <span class="index-pill-change ${idx.up ? 'up' : 'down'}">${idx.change}</span>
    </div>
  `).join('');

  marqueeTrack.querySelectorAll('.market-index-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const sym = pill.dataset.indexSym;
      const foundAsset = marketAssets.find((a) => a.symbol === sym) || {
        name: pill.querySelector('.index-pill-name')?.textContent || 'Indice',
        symbol: sym,
        type: 'index',
        basePrice: parseFloat(pill.querySelector('.index-pill-val')?.textContent?.replace(/\s/g, '').replace(',', '.')) || 0,
        baseChange: parseFloat(pill.querySelector('.index-pill-change')?.textContent?.replace('%', '')) || 0,
        unit: 'pts',
        exchange: 'Marché Mondial'
      };
      openChartModal(foundAsset);
    });
  });
}

/**
 * Calcule l'état d'ouverture des bourses (Paris & New York)
 */
function updateMarketGlobalStatus() {
  const statusEl = document.getElementById('market-status-text');
  if (!statusEl) return;

  const now = new Date();
  const utcHour = now.getUTCHours();
  const day = now.getUTCDay();

  // Samedi (6) ou Dimanche (0) : Bourses fermées
  if (day === 0 || day === 6) {
    statusEl.textContent = 'Bourses fermées (Week-end) • Crypto 24/7 active';
    return;
  }

  // Euronext Paris : 07:00 UTC - 15:30 UTC (09:00 - 17:30 CET)
  const isEuronextOpen = utcHour >= 7 && utcHour < 15.5;
  // Wall Street NYSE/Nasdaq : 13:30 UTC - 20:00 UTC (15:30 - 22:00 CET)
  const isNyseOpen = utcHour >= 13.5 && utcHour < 20;

  if (isNyseOpen && isEuronextOpen) {
    statusEl.textContent = 'Wall Street & Euronext Ouverts en simultané 🟢';
  } else if (isNyseOpen) {
    statusEl.textContent = 'Wall Street Ouvert (Séance US) 🟢';
  } else if (isEuronextOpen) {
    statusEl.textContent = 'Euronext & Xetra Ouverts (Séance Europe) 🟢';
  } else {
    statusEl.textContent = 'Marchés fermés pour la nuit • Crypto active 🟢';
  }
}

/**
 * Rendu des cartes d'actifs dans la grille
 */
function renderMarketCards() {
  const container = document.getElementById('crypto-ticker-cards');
  if (!container) return;

  let list = marketAssets.filter((a) => a.enabled);

  // Filtre par catégorie (all, etf, stock, crypto, index)
  if (currentMarketCategory !== 'all') {
    list = list.filter((a) => a.type === currentMarketCategory || (currentMarketCategory === 'index' && a.type === 'forex'));
  }

  // Filtre de volatilité
  if (isMarketVolatileFilterActive) {
    list = list
      .filter((a) => a.isVolatile || Math.abs(a.baseChange) >= 2.0)
      .sort((a, b) => Math.abs(b.baseChange) - Math.abs(a.baseChange));
  }

  // Recherche textuelle
  if (currentMarketSearch) {
    const q = currentMarketSearch.toLowerCase();
    list = list.filter((a) => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q));
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="market-empty-hint" style="grid-column: 1 / -1; padding: 4rem 2rem; text-align: center; color: var(--text-muted); background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 20px;">
        <i class="fa-solid fa-chart-line" style="font-size: 2.5rem; color: var(--accent-primary); margin-bottom: 1rem; display: block;"></i>
        <span style="font-size: 1rem; display: block; margin-bottom: 1rem;">Aucun actif ne correspond à votre filtre.</span>
        <button type="button" class="market-btn-primary" id="market-open-empty-btn"><i class="fa-solid fa-sliders"></i> Personnaliser la Watchlist</button>
      </div>
    `;
    document.getElementById('market-open-empty-btn')?.addEventListener('click', toggleMarketConfigDrawer);
    return;
  }

  container.innerHTML = list.map((asset) => {
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
      formattedPrice = `${asset.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${asset.unit || ''}`;
    }

    const { linePath, areaPath } = generateSparklinePaths(asset.basePrice, asset.baseChange, isPositive);

    const dayL = asset.dayLow || asset.basePrice * 0.985;
    const dayH = asset.dayHigh || asset.basePrice * 1.015;
    const rangeSpan = Math.max(0.01, dayH - dayL);
    const rangePct = Math.max(5, Math.min(95, ((asset.basePrice - dayL) / rangeSpan) * 100));

    let typeColor = 'var(--accent-primary)';
    let typeLabel = (asset.type || 'actif').toUpperCase();
    if (asset.type === 'etf') {
      typeColor = '#60a5fa';
      typeLabel = 'ETF';
    } else if (asset.type === 'stock') {
      typeColor = '#c084fc';
      typeLabel = 'ACTION';
    } else if (asset.type === 'crypto') {
      typeColor = '#fbbf24';
      typeLabel = 'CRYPTO';
    } else if (asset.type === 'index' || asset.type === 'forex') {
      typeColor = '#34d399';
      typeLabel = asset.type === 'forex' ? 'FOREX' : 'INDICE';
    }

    const cleanSym = asset.symbol.includes(':') ? asset.symbol.split(':')[1] : asset.symbol;

    return `
      <div class="market-asset-card" data-asset-id="${asset.id}" title="Cliquer pour afficher le graphique interactif ${asset.name}">
        <div class="market-card-top">
          <div class="market-card-title-info">
            <div class="market-icon-bubble" style="--asset-color: ${typeColor}">
              <i class="${asset.icon || 'fa-solid fa-chart-line'}"></i>
            </div>
            <div class="market-name-wrap">
              <span class="market-name">${asset.name}</span>
              <div class="market-meta-row">
                <span class="market-sym">${cleanSym}</span>
                <span class="market-type-pill ${asset.type}">${typeLabel}</span>
                <span class="market-exchange-pill">${asset.exchange || ''}</span>
              </div>
            </div>
          </div>
          <button type="button" class="market-quick-chart-btn" title="Ouvrir le studio graphique" data-chart-id="${asset.id}">
            <i class="fa-solid fa-chart-line"></i>
          </button>
        </div>

        <div class="market-card-middle">
          <div class="market-price-col">
            <span class="market-price-val">${formattedPrice}</span>
            <span class="market-change-badge ${isPositive ? 'up' : 'down'}">
              <i class="fa-solid fa-arrow-${isPositive ? 'trend-up' : 'trend-down'}"></i>
              ${sign}${asset.baseChange.toFixed(2)}%
            </span>
          </div>
          <div class="market-sparkline-box">
            <svg viewBox="0 0 100 36" preserveAspectRatio="none" class="market-sparkline-svg">
              <defs>
                <linearGradient id="sparkGrad-${asset.id}" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="${isPositive ? '#10b981' : '#ef4444'}" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="${isPositive ? '#10b981' : '#ef4444'}" stop-opacity="0.0" />
                </linearGradient>
              </defs>
              <path d="${areaPath}" fill="url(#sparkGrad-${asset.id})" />
              <path d="${linePath}" fill="none" stroke="${isPositive ? '#10b981' : '#ef4444'}" stroke-width="2" />
            </svg>
          </div>
        </div>

        <div class="market-card-bottom">
          <div class="market-range-info">
            <span class="range-bound">${dayL.toFixed(2)}${asset.unit}</span>
            <div class="range-track">
              <div class="range-point" style="left: ${rangePct.toFixed(1)}%;"></div>
            </div>
            <span class="range-bound">${dayH.toFixed(2)}${asset.unit}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Clic sur une carte pour ouvrir le studio TradingView
  container.querySelectorAll('.market-asset-card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.assetId;
      const asset = marketAssets.find((a) => a.id === id);
      if (asset) openChartModal(asset);
    });
  });
}

/**
 * Ouvre le studio de graphique interactif TradingView pour un actif donné
 */
function openChartModal(asset) {
  currentlyInspectedAsset = asset;
  const modal = document.getElementById('market-chart-modal');
  if (!modal) return;

  const iconBox = document.getElementById('chart-dialog-icon');
  const nameEl = document.getElementById('chart-dialog-name');
  const symEl = document.getElementById('chart-dialog-sym');
  const typeEl = document.getElementById('chart-dialog-type');
  const priceEl = document.getElementById('chart-dialog-price');
  const changeEl = document.getElementById('chart-dialog-change');
  const exchangeEl = document.getElementById('chart-dialog-exchange');
  const highEl = document.getElementById('chart-stat-high');
  const lowEl = document.getElementById('chart-stat-low');
  const rangeFill = document.getElementById('chart-stat-range-fill');
  const currEl = document.getElementById('chart-stat-curr');
  const marketEl = document.getElementById('chart-stat-market');
  const iframe = document.getElementById('tradingview-chart-iframe');

  if (iconBox) iconBox.innerHTML = `<i class="${asset.icon || 'fa-solid fa-chart-line'}"></i>`;
  if (nameEl) nameEl.textContent = asset.name;
  if (symEl) symEl.textContent = asset.symbol;
  if (typeEl) {
    typeEl.textContent = (asset.type || 'ACTIF').toUpperCase();
    typeEl.className = `chart-type-badge ${asset.type || ''}`;
  }

  const isPositive = asset.baseChange >= 0;
  const sign = isPositive ? '+' : '';
  let formattedPrice = `${asset.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${asset.unit || '$'}`;
  if (priceEl) priceEl.textContent = formattedPrice;

  if (changeEl) {
    changeEl.textContent = `${sign}${asset.baseChange.toFixed(2)}%`;
    changeEl.className = `chart-change-badge ${isPositive ? 'up' : 'down'}`;
  }

  if (exchangeEl) exchangeEl.textContent = asset.exchange || 'Cotation Marché';

  const dayL = asset.dayLow || asset.basePrice * 0.985;
  const dayH = asset.dayHigh || asset.basePrice * 1.015;
  if (lowEl) lowEl.textContent = `${dayL.toFixed(2)} ${asset.unit || '$'}`;
  if (highEl) highEl.textContent = `${dayH.toFixed(2)} ${asset.unit || '$'}`;

  const rangeSpan = Math.max(0.01, dayH - dayL);
  const rangePct = Math.max(5, Math.min(95, ((asset.basePrice - dayL) / rangeSpan) * 100));
  if (rangeFill) rangeFill.style.width = `${rangePct.toFixed(1)}%`;

  if (currEl) currEl.textContent = asset.unit === '€' ? 'EUR (€)' : (asset.unit === '$' ? 'USD ($)' : asset.unit);
  if (marketEl) marketEl.textContent = asset.exchange || 'Bourse Internationale';

  // Chargement du graphique TradingView interactif haute résolution
  loadTradingViewIframe(asset.symbol, currentChartTimeframe);

  modal.removeAttribute('hidden');
  modal.hidden = false;
  modal.classList.remove('is-hidden');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function loadTradingViewIframe(symbol, interval = 'D') {
  const iframe = document.getElementById('tradingview-chart-iframe');
  if (!iframe) return;

  const tvUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${encodeURIComponent(symbol)}&interval=${interval}&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=rgba(11,15,25,1)&theme=dark&style=1&timezone=Europe%2FParis&studies=%5B%5D&hideideas=1`;

  if (iframe.src !== tvUrl) {
    iframe.src = tvUrl;
  }
}

function closeChartModal() {
  const modal = document.getElementById('market-chart-modal');
  if (modal) {
    modal.setAttribute('hidden', '');
    modal.hidden = true;
    modal.classList.add('is-hidden');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    const iframe = document.getElementById('tradingview-chart-iframe');
    if (iframe) {
      iframe.src = 'about:blank';
    }
  }
}

/**
 * Checklist de sélection et d'activation des actifs dans le tiroir
 */
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
  const isHidden = drawer.hasAttribute('hidden') || drawer.classList.contains('is-hidden') || drawer.style.display === 'none';
  if (isHidden) {
    drawer.removeAttribute('hidden');
    drawer.hidden = false;
    drawer.classList.remove('is-hidden');
    drawer.style.display = 'flex';
    renderMarketChecklist();
  } else {
    drawer.setAttribute('hidden', '');
    drawer.hidden = true;
    drawer.classList.add('is-hidden');
    drawer.style.display = 'none';
  }
}

/**
 * Actualisation des cours réels (Crypto & Forex en direct)
 */
async function fetchLiveMarketData() {
  const refreshBtn = document.getElementById('crypto-refresh-btn');
  if (refreshBtn) refreshBtn.querySelector('i')?.classList.add('fa-spin');

  // 1. Taux Forex réel EUR/USD
  const eurusd = marketAssets.find((a) => a.id === 'eurusd');
  if (eurusd) {
    try {
      const res = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD');
      if (res.ok) {
        const data = await res.json();
        if (data.rates && data.rates.USD) {
          eurusd.basePrice = Number(data.rates.USD.toFixed(4));
        }
      }
    } catch {}
  }

  // 2. Cours Crypto réels (Bitcoin, Ethereum, Solana) via CoinGecko
  try {
    const cgRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
    if (cgRes.ok) {
      const cgData = await cgRes.json();
      const btc = marketAssets.find((a) => a.id === 'btc');
      if (btc && cgData.bitcoin) {
        btc.basePrice = cgData.bitcoin.usd;
        btc.baseChange = cgData.bitcoin.usd_24h_change || btc.baseChange;
      }
      const eth = marketAssets.find((a) => a.id === 'eth');
      if (eth && cgData.ethereum) {
        eth.basePrice = cgData.ethereum.usd;
        eth.baseChange = cgData.ethereum.usd_24h_change || eth.baseChange;
      }
      const sol = marketAssets.find((a) => a.id === 'sol');
      if (sol && cgData.solana) {
        sol.basePrice = cgData.solana.usd;
        sol.baseChange = cgData.solana.usd_24h_change || sol.baseChange;
      }
    }
  } catch {}

  saveMarketAssets();
  renderMarketCards();
  updateMarketGlobalStatus();

  if (refreshBtn) {
    setTimeout(() => refreshBtn.querySelector('i')?.classList.remove('fa-spin'), 600);
  }
}

/**
 * Initialisation du module Marchés
 */
function initMarkets() {
  if (initMarkets._initialized) return;
  initMarkets._initialized = true;

  renderIndicesMarquee();
  updateMarketGlobalStatus();
  renderMarketCards();

  const searchInput = document.getElementById('market-search-input');
  const clearBtn = document.getElementById('market-search-clear');
  const volatileBtn = document.getElementById('market-filter-volatile-btn');
  const configBtn = document.getElementById('market-config-toggle-btn');
  const closeDrawerBtn = document.getElementById('market-config-close-btn');
  const refreshBtn = document.getElementById('crypto-refresh-btn');
  const modalCloseBtn = document.getElementById('chart-dialog-close-btn');
  const modalBackdrop = document.querySelector('.market-chart-backdrop');
  const fullscreenBtn = document.getElementById('chart-fullscreen-btn');
  const addCustomBtn = document.getElementById('market-add-custom-btn');

  // Filtrage par recherche
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentMarketSearch = e.target.value.trim();
      if (clearBtn) clearBtn.hidden = !currentMarketSearch;
      renderMarketCards();
    });
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentMarketSearch = '';
      clearBtn.hidden = true;
      renderMarketCards();
      searchInput.focus();
    });
  }

  // Filtrage par catégorie (onglets)
  document.querySelectorAll('#markets-tab-group .tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#markets-tab-group .tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentMarketCategory = btn.dataset.marketCategory || 'all';
      renderMarketCards();
    });
  });

  // Filtre volatilité
  if (volatileBtn) {
    volatileBtn.addEventListener('click', () => {
      isMarketVolatileFilterActive = !isMarketVolatileFilterActive;
      volatileBtn.classList.toggle('active', isMarketVolatileFilterActive);
      renderMarketCards();
    });
  }

  // Tiroir de personnalisation
  if (configBtn) configBtn.addEventListener('click', toggleMarketConfigDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', toggleMarketConfigDrawer);

  // Préréglages du tiroir
  document.querySelectorAll('.market-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      if (preset === 'portfolio') {
        marketAssets.forEach((a) => {
          a.enabled = ['10ap', 'lyp6', 'xmme', 'nvda', 'btc'].includes(a.id);
        });
      } else if (preset === 'volatile') {
        marketAssets.forEach((a) => {
          a.enabled = a.isVolatile || Math.abs(a.baseChange) >= 2.0;
        });
      } else if (preset === 'all') {
        marketAssets.forEach((a) => {
          a.enabled = true;
        });
      }
      saveMarketAssets();
      renderMarketChecklist();
      renderMarketCards();
      if (typeof showToast === 'function') showToast(`Préréglage appliqué : ${btn.textContent}`, 'info');
    });
  });

  // Ajout d'actif personnalisé
  if (addCustomBtn) {
    addCustomBtn.addEventListener('click', () => {
      const nameIn = document.getElementById('market-new-name');
      const symIn = document.getElementById('market-new-sym');
      const typeIn = document.getElementById('market-new-type');
      const priceIn = document.getElementById('market-new-price');

      const name = (nameIn?.value || '').trim();
      let sym = (symIn?.value || '').trim().toUpperCase();
      const type = typeIn?.value || 'stock';
      const price = parseFloat(priceIn?.value) || 100;

      if (!name || !sym) {
        if (typeof showToast === 'function') showToast('Veuillez renseigner au moins le nom et le symbole', 'error');
        return;
      }

      if (!sym.includes(':')) {
        sym = type === 'crypto' ? `BINANCE:${sym}USDT` : (type === 'etf' ? `XETR:${sym}` : `NASDAQ:${sym}`);
      }

      const newAsset = {
        id: `custom_${Date.now()}`,
        name,
        symbol: sym,
        type,
        icon: type === 'crypto' ? 'fa-brands fa-bitcoin' : (type === 'etf' ? 'fa-solid fa-landmark' : 'fa-solid fa-chart-line'),
        basePrice: price,
        baseChange: 0.85,
        dayLow: price * 0.98,
        dayHigh: price * 1.02,
        unit: '$',
        exchange: 'Ajout Personnalisé',
        enabled: true,
        isCustom: true
      };

      marketAssets.unshift(newAsset);
      saveMarketAssets();
      renderMarketChecklist();
      renderMarketCards();

      if (nameIn) nameIn.value = '';
      if (symIn) symIn.value = '';
      if (priceIn) priceIn.value = '';

      if (typeof showToast === 'function') showToast(`Actif "${name}" ajouté avec succès !`, 'success');
      toggleMarketConfigDrawer();
    });
  }

  // Contrôles de la modale du graphique interactif
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeChartModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeChartModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeChartModal();
  });

  // Sélecteur de timeframe (1m, 5m, 1h, 1J, 1S, 1M)
  document.querySelectorAll('.chart-timeframe-picker .tf-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chart-timeframe-picker .tf-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentChartTimeframe = btn.dataset.tf || 'D';
      if (currentlyInspectedAsset) {
        loadTradingViewIframe(currentlyInspectedAsset.symbol, currentChartTimeframe);
      }
    });
  });

  // Bascule plein écran
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      const dialog = document.querySelector('.market-chart-dialog');
      if (dialog) {
        if (!document.fullscreenElement) {
          dialog.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    });
  }

  // Bouton d'actualisation manuelle
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      fetchLiveMarketData();
      if (typeof showToast === 'function') showToast('Actualisation des cours en direct...', 'info');
    });
  }

  // Actualisation réseau initiale et intervalle (60s)
  fetchLiveMarketData();
  setInterval(fetchLiveMarketData, 60000);
}
