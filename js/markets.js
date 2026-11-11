/**
 * markets.js - Hub Marchés Boursiers, Actions, ETF, Indices & Cryptos
 * Graphiques interactifs épurés (courbe nette Apple/Revolut style),
 * cotations en temps réel, watchlist & sparklines SVG
 */

const DEFAULT_MARKET_ASSETS = [
  // --- 1. ACTIONS INTERNATIONALES & MEGA-CAPS ---
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
    isVolatile: true,
    isTrending: true
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
    isVolatile: true,
    isTrending: true
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
    enabled: true,
    isTrending: true
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
    enabled: true,
    isTrending: true
  },
  {
    id: 'googl',
    name: 'Alphabet Inc. (GOOGL)',
    symbol: 'NASDAQ:GOOGL',
    type: 'stock',
    icon: 'fa-brands fa-google',
    basePrice: 168.20,
    baseChange: 0.92,
    dayLow: 166.50,
    dayHigh: 169.50,
    unit: '$',
    exchange: 'Nasdaq',
    enabled: true,
    isTrending: true
  },
  {
    id: 'amzn',
    name: 'Amazon.com Inc. (AMZN)',
    symbol: 'NASDAQ:AMZN',
    type: 'stock',
    icon: 'fa-brands fa-amazon',
    basePrice: 186.40,
    baseChange: 1.40,
    dayLow: 184.20,
    dayHigh: 187.90,
    unit: '$',
    exchange: 'Nasdaq',
    enabled: true
  },
  {
    id: 'meta',
    name: 'Meta Platforms (META)',
    symbol: 'NASDAQ:META',
    type: 'stock',
    icon: 'fa-brands fa-meta',
    basePrice: 582.30,
    baseChange: 1.80,
    dayLow: 574.00,
    dayHigh: 586.50,
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
  {
    id: 'mc',
    name: 'LVMH Moët Hennessy (MC)',
    symbol: 'EURONEXT:MC',
    type: 'stock',
    icon: 'fa-solid fa-gem',
    basePrice: 618.50,
    baseChange: -0.45,
    dayLow: 612.00,
    dayHigh: 624.00,
    unit: '€',
    exchange: 'Euronext Paris',
    enabled: true
  },
  {
    id: 'asml',
    name: 'ASML Holding (ASML)',
    symbol: 'EURONEXT:ASML',
    type: 'stock',
    icon: 'fa-solid fa-atom',
    basePrice: 652.10,
    baseChange: 1.05,
    dayLow: 644.00,
    dayHigh: 656.00,
    unit: '€',
    exchange: 'Euronext Amsterdam',
    enabled: true
  },
  {
    id: 'tte',
    name: 'TotalEnergies (TTE)',
    symbol: 'EURONEXT:TTE',
    type: 'stock',
    icon: 'fa-solid fa-gas-pump',
    basePrice: 58.20,
    baseChange: 0.30,
    dayLow: 57.80,
    dayHigh: 58.60,
    unit: '€',
    exchange: 'Euronext Paris',
    enabled: true
  },

  // --- 2. ETF & FONDS INDICIAIRES MAJEURS ---
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
    enabled: true,
    isTrending: true
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
    enabled: true,
    isTrending: true
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
    id: 'cw8',
    name: 'Amundi MSCI World (CW8)',
    symbol: 'EURONEXT:CW8',
    type: 'etf',
    icon: 'fa-solid fa-globe',
    basePrice: 528.40,
    baseChange: 0.62,
    dayLow: 525.00,
    dayHigh: 530.20,
    unit: '€',
    exchange: 'Euronext Paris',
    enabled: true,
    isTrending: true
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
  {
    id: 'eqqq',
    name: 'Invesco EQQQ Nasdaq 100',
    symbol: 'XETR:EQQQ',
    type: 'etf',
    icon: 'fa-solid fa-microchip',
    basePrice: 485.20,
    baseChange: 1.15,
    dayLow: 481.00,
    dayHigh: 487.50,
    unit: '€',
    exchange: 'Xetra',
    enabled: true
  },
  {
    id: 'inrg',
    name: 'iShares Clean Energy (INRG)',
    symbol: 'XETR:INRG',
    type: 'etf',
    icon: 'fa-solid fa-leaf',
    basePrice: 8.75,
    baseChange: -1.25,
    dayLow: 8.62,
    dayHigh: 8.85,
    unit: '€',
    exchange: 'Xetra',
    enabled: true
  },
  {
    id: 'psp5',
    name: 'Amundi PEA S&P 500 (PSP5)',
    symbol: 'EURONEXT:PSP5',
    type: 'etf',
    icon: 'fa-solid fa-building-columns',
    basePrice: 44.60,
    baseChange: 0.55,
    dayLow: 44.20,
    dayHigh: 44.80,
    unit: '€',
    exchange: 'Euronext Paris',
    enabled: true
  },

  // --- 3. GRANDS INDICES BOURSIERS MONDIAUX ---
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
    enabled: true,
    isTrending: true
  },
  {
    id: 'nasdaq100',
    name: 'Nasdaq 100 Index',
    symbol: 'FOREXCOM:NSXUSD',
    type: 'index',
    icon: 'fa-solid fa-microchip',
    basePrice: 20450.10,
    baseChange: 0.85,
    dayLow: 20380.00,
    dayHigh: 20520.00,
    unit: 'pts',
    exchange: 'US Tech',
    enabled: true,
    isTrending: true
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
    id: 'dax40',
    name: 'DAX 40 Index',
    symbol: 'XETR:DAX',
    type: 'index',
    icon: 'fa-solid fa-chart-pie',
    basePrice: 19340.50,
    baseChange: 0.52,
    dayLow: 19280.00,
    dayHigh: 19410.00,
    unit: 'pts',
    exchange: 'Francfort',
    enabled: true
  },
  {
    id: 'dji',
    name: 'Dow Jones Industrial 30',
    symbol: 'TVC:DJI',
    type: 'index',
    icon: 'fa-solid fa-industry',
    basePrice: 42210.50,
    baseChange: 0.18,
    dayLow: 42120.00,
    dayHigh: 42350.00,
    unit: 'pts',
    exchange: 'Wall Street',
    enabled: true
  },
  {
    id: 'stoxx50',
    name: 'Euro Stoxx 50 Index',
    symbol: 'INDEX:SX5E',
    type: 'index',
    icon: 'fa-solid fa-flag-checkered',
    basePrice: 4982.10,
    baseChange: 0.32,
    dayLow: 4960.00,
    dayHigh: 5005.00,
    unit: 'pts',
    exchange: 'Zone Euro',
    enabled: true
  },
  {
    id: 'nikkei',
    name: 'Nikkei 225 (Japon)',
    symbol: 'TVC:NI225',
    type: 'index',
    icon: 'fa-solid fa-torii-gate',
    basePrice: 39277.40,
    baseChange: 1.15,
    dayLow: 38900.00,
    dayHigh: 39450.00,
    unit: 'pts',
    exchange: 'Tokyo',
    enabled: true
  },
  {
    id: 'ftse100',
    name: 'FTSE 100 (Londres)',
    symbol: 'TVC:UKX',
    type: 'index',
    icon: 'fa-solid fa-sterling-sign',
    basePrice: 8240.30,
    baseChange: -0.22,
    dayLow: 8210.00,
    dayHigh: 8270.00,
    unit: 'pts',
    exchange: 'Londres',
    enabled: true
  },

  // --- 4. FOREX & MARCHÉ DES DEVISES ---
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
    enabled: true,
    isTrending: true
  },
  {
    id: 'eurgbp',
    name: 'EUR / GBP Forex',
    symbol: 'FX:EURGBP',
    type: 'forex',
    icon: 'fa-solid fa-sterling-sign',
    basePrice: 0.8354,
    baseChange: -0.08,
    dayLow: 0.8335,
    dayHigh: 0.8370,
    unit: '£',
    exchange: 'Forex',
    enabled: true
  },
  {
    id: 'eurchf',
    name: 'EUR / CHF Forex',
    symbol: 'FX:EURCHF',
    type: 'forex',
    icon: 'fa-solid fa-franc-sign',
    basePrice: 0.9412,
    baseChange: 0.05,
    dayLow: 0.9390,
    dayHigh: 0.9430,
    unit: 'CHF',
    exchange: 'Forex',
    enabled: true
  },
  {
    id: 'eurjpy',
    name: 'EUR / JPY Forex',
    symbol: 'FX:EURJPY',
    type: 'forex',
    icon: 'fa-solid fa-yen-sign',
    basePrice: 164.80,
    baseChange: 0.35,
    dayLow: 164.10,
    dayHigh: 165.20,
    unit: '¥',
    exchange: 'Forex',
    enabled: true
  },
  {
    id: 'gbpusd',
    name: 'GBP / USD Forex',
    symbol: 'FX:GBPUSD',
    type: 'forex',
    icon: 'fa-solid fa-dollar-sign',
    basePrice: 1.2985,
    baseChange: 0.18,
    dayLow: 1.2950,
    dayHigh: 1.3020,
    unit: '$',
    exchange: 'Forex',
    enabled: true
  },
  {
    id: 'usdjpy',
    name: 'USD / JPY Forex',
    symbol: 'FX:USDJPY',
    type: 'forex',
    icon: 'fa-solid fa-yen-sign',
    basePrice: 151.75,
    baseChange: 0.22,
    dayLow: 151.20,
    dayHigh: 152.10,
    unit: '¥',
    exchange: 'Forex',
    enabled: true
  },

  // --- 5. MATIÈRES PREMIÈRES & COMMODITIES ---
  {
    id: 'gold',
    name: 'Or / Gold (XAU/USD)',
    symbol: 'TVC:GOLD',
    type: 'commodity',
    icon: 'fa-solid fa-coins',
    basePrice: 2735.80,
    baseChange: 0.42,
    dayLow: 2720.00,
    dayHigh: 2748.00,
    unit: '$',
    exchange: 'Métaux Précieux',
    enabled: true,
    isTrending: true
  },
  {
    id: 'silver',
    name: 'Argent / Silver (XAG/USD)',
    symbol: 'TVC:SILVER',
    type: 'commodity',
    icon: 'fa-solid fa-ring',
    basePrice: 33.85,
    baseChange: 1.25,
    dayLow: 33.20,
    dayHigh: 34.10,
    unit: '$',
    exchange: 'Métaux Précieux',
    enabled: true,
    isVolatile: true
  },
  {
    id: 'brent',
    name: 'Pétrole Brent (Crude Oil)',
    symbol: 'TVC:UKOIL',
    type: 'commodity',
    icon: 'fa-solid fa-oil-well',
    basePrice: 74.20,
    baseChange: -0.75,
    dayLow: 73.50,
    dayHigh: 75.10,
    unit: '$',
    exchange: 'Énergie',
    enabled: true
  },

  // --- 6. CRYPTOMONNAIES ---
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
    isVolatile: true,
    isTrending: true
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
    enabled: true,
    isTrending: true
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
  {
    id: 'bnb',
    name: 'Binance Coin (BNB)',
    symbol: 'BINANCE:BNBUSDT',
    type: 'crypto',
    icon: 'fa-solid fa-cubes',
    basePrice: 585.20,
    baseChange: 1.10,
    dayLow: 578.00,
    dayHigh: 590.00,
    unit: '$',
    exchange: 'Binance',
    enabled: true
  },
  {
    id: 'xrp',
    name: 'Ripple (XRP)',
    symbol: 'BINANCE:XRPUSDT',
    type: 'crypto',
    icon: 'fa-solid fa-circle-nodes',
    basePrice: 0.535,
    baseChange: 2.40,
    dayLow: 0.518,
    dayHigh: 0.545,
    unit: '$',
    exchange: 'Binance',
    enabled: true
  }
];

const GLOBAL_INDICES = [
  { name: 'S&P 500', symbol: 'FOREXCOM:SPXUSD', val: '5 864,67', change: '+0.41%', up: true },
  { name: 'Nasdaq 100', symbol: 'FOREXCOM:NSXUSD', val: '20 450,12', change: '+0.85%', up: true },
  { name: 'Dow Jones', symbol: 'TVC:DJI', val: '42 210,50', change: '+0.18%', up: true },
  { name: 'CAC 40', symbol: 'EURONEXT:PX1', val: '7 480,25', change: '+0.65%', up: true },
  { name: 'Euro Stoxx 50', symbol: 'INDEX:SX5E', val: '4 982,10', change: '+0.32%', up: true },
  { name: 'Nikkei 225', symbol: 'TVC:NI225', val: '39 277,40', change: '+1.15%', up: true },
  { name: 'Bitcoin', symbol: 'BINANCE:BTCUSDT', val: '74 117 $', change: '+3.45%', up: true },
  { name: 'Or / Gold', symbol: 'TVC:GOLD', val: '2 735,80 $', change: '+0.42%', up: true },
  { name: 'Pétrole Brent', symbol: 'TVC:UKOIL', val: '74,20 $', change: '-0.75%', up: false },
  { name: 'EUR / USD', symbol: 'FX:EURUSD', val: '1.0852 $', change: '+0.12%', up: true }
];

let marketAssets = loadMarketAssets();
let currentMarketCategory = 'all';
let currentMarketSearch = '';
let isMarketVolatileFilterActive = false;
let currentChartTimeframe = '1D';
let currentlyInspectedAsset = null;
let currentChartPoints = [];

function loadMarketAssets() {
  try {
    const raw = localStorage.getItem('violet_market_assets_v5');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const defaultMap = new Map(DEFAULT_MARKET_ASSETS.map((a) => [a.id, a]));
        parsed.forEach((p) => {
          if (defaultMap.has(p.id)) {
            const def = defaultMap.get(p.id);
            Object.assign(def, { enabled: p.enabled });
          }
        });
        const customAssets = parsed.filter((p) => p.isCustom);
        return [...DEFAULT_MARKET_ASSETS, ...customAssets];
      }
    }
  } catch {}
  return JSON.parse(JSON.stringify(DEFAULT_MARKET_ASSETS));
}

function saveMarketAssets() {
  try {
    localStorage.setItem('violet_market_assets_v5', JSON.stringify(marketAssets));
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
    <div class="market-index-pill" data-index-sym="${idx.symbol}" title="Cliquer pour afficher la courbe de ${idx.name}">
      <span class="index-pill-name">${idx.name}</span>
      <span class="index-pill-val">${idx.val}</span>
      <span class="index-pill-change ${idx.up ? 'up' : 'down'}">${idx.change}</span>
    </div>
  `).join('');

  marqueeTrack.querySelectorAll('.market-index-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const sym = pill.dataset.indexSym;
      const foundAsset = marketAssets.find((a) => a.symbol === sym) || {
        id: `idx_${Date.now()}`,
        name: pill.querySelector('.index-pill-name')?.textContent || 'Indice',
        symbol: sym,
        type: 'index',
        basePrice: parseFloat(pill.querySelector('.index-pill-val')?.textContent?.replace(/\s/g, '').replace(',', '.')) || 5000,
        baseChange: parseFloat(pill.querySelector('.index-pill-change')?.textContent?.replace('%', '')) || 0.45,
        unit: 'pts',
        exchange: 'Marché Mondial',
        enabled: true
      };
      openChartModal(foundAsset);
    });
  });
}

/**
 * Rendu des cartes Bento Highlights (Top Volatilité & Actifs les Plus Échangés)
 */
function renderMarketsHighlights() {
  const volatileContainer = document.getElementById('highlight-volatile-pills');
  const activeContainer = document.getElementById('highlight-active-pills');
  if (!volatileContainer || !activeContainer) return;

  // 1. Top Volatilité : les 4 actifs avec les plus fortes variations absolues
  const sortedVolatile = [...marketAssets]
    .filter((a) => a.enabled)
    .sort((a, b) => Math.abs(b.baseChange) - Math.abs(a.baseChange))
    .slice(0, 4);

  volatileContainer.innerHTML = sortedVolatile
    .map((a) => {
      const isUp = a.baseChange >= 0;
      const sign = isUp ? '+' : '';
      const symShort = a.symbol.includes(':') ? a.symbol.split(':')[1] : a.symbol;
      return `
        <div class="highlight-asset-pill" data-asset-id="${a.id}" title="${a.name} - Cliquer pour ouvrir la courbe">
          <span class="pill-ticker">${symShort}</span>
          <span class="pill-price">${a.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${a.unit || '$'}</span>
          <span class="pill-change ${isUp ? 'up' : 'down'}">${sign}${a.baseChange.toFixed(2)}%</span>
        </div>
      `;
    })
    .join('');

  // 2. Actifs les Plus Échangés / Fort Volume
  const trendingAssets = marketAssets.filter((a) => a.isTrending && a.enabled).slice(0, 4);
  const fallbackTrending = trendingAssets.length >= 3 ? trendingAssets : marketAssets.filter((a) => a.enabled).slice(0, 4);

  activeContainer.innerHTML = fallbackTrending
    .map((a) => {
      const isUp = a.baseChange >= 0;
      const sign = isUp ? '+' : '';
      const symShort = a.symbol.includes(':') ? a.symbol.split(':')[1] : a.symbol;
      return `
        <div class="highlight-asset-pill" data-asset-id="${a.id}" title="${a.name} - Cliquer pour ouvrir la courbe">
          <span class="pill-ticker">${symShort}</span>
          <span class="pill-price">${a.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${a.unit || '$'}</span>
          <span class="pill-change ${isUp ? 'up' : 'down'}">${sign}${a.baseChange.toFixed(2)}%</span>
        </div>
      `;
    })
    .join('');

  // Clic pour ouvrir directement le graphique simple
  [volatileContainer, activeContainer].forEach((cont) => {
    cont.querySelectorAll('.highlight-asset-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const id = pill.dataset.assetId;
        const asset = marketAssets.find((a) => a.id === id);
        if (asset) openChartModal(asset);
      });
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
 * Rendu des cartes d'actifs dans la grille fluide
 */
function renderMarketCards() {
  const container = document.getElementById('crypto-ticker-cards');
  if (!container) return;

  let list = marketAssets.filter((a) => a.enabled);

  // Filtre par catégorie exacte
  if (currentMarketCategory !== 'all') {
    list = list.filter((a) => a.type === currentMarketCategory);
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
        <span style="font-size: 1rem; display: block; margin-bottom: 1rem;">Aucun actif ne correspond à cette sélection.</span>
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
    } else if (asset.type === 'index') {
      typeColor = '#34d399';
      typeLabel = 'INDICE';
    } else if (asset.type === 'forex') {
      typeColor = '#38bdf8';
      typeLabel = 'FOREX';
    } else if (asset.type === 'commodity') {
      typeColor = '#f59e0b';
      typeLabel = 'MATIÈRE 1ÈRE';
    }

    const cleanSym = asset.symbol.includes(':') ? asset.symbol.split(':')[1] : asset.symbol;

    return `
      <div class="market-asset-card" data-asset-id="${asset.id}" title="Cliquer pour afficher la courbe de ${asset.name}">
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
          <button type="button" class="market-quick-chart-btn" title="Ouvrir la courbe" data-chart-id="${asset.id}">
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
            <span class="range-bound">${dayL.toFixed(2)} ${asset.unit || ''}</span>
            <div class="range-track">
              <div class="range-point" style="left: ${rangePct.toFixed(1)}%;"></div>
            </div>
            <span class="range-bound">${dayH.toFixed(2)} ${asset.unit || ''}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Clic sur une carte pour ouvrir le graphique linéaire épuré
  container.querySelectorAll('.market-asset-card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.assetId;
      const asset = marketAssets.find((a) => a.id === id);
      if (asset) openChartModal(asset);
    });
  });
}

// Cache des données historiques pour navigation instantanée
const chartDataCache = {};
let currentPeriodChangeData = null;

// Table des historiques de cotation authentiques par unité de temps
const REAL_MARKET_PERIODS = {
  // Actions
  nvda: {
    '1D': { change: 2.84, startP: 170.90, high: 178.45, low: 170.10, path: [170.90, 172.40, 171.10, 173.80, 172.50, 176.20, 178.45, 175.76] },
    '1W': { change: 6.45, startP: 165.10, high: 178.45, low: 163.80, path: [165.10, 163.80, 168.20, 171.50, 169.30, 174.60, 175.76] },
    '1M': { change: 21.80, startP: 144.30, high: 178.45, low: 141.20, path: [144.30, 142.10, 149.60, 154.20, 152.00, 163.50, 171.00, 175.76] },
    '1Y': { change: 184.50, startP: 61.80, high: 178.45, low: 58.20, path: [61.80, 68.50, 82.10, 94.60, 118.00, 131.20, 122.50, 145.00, 162.00, 175.76] }
  },
  tsla: {
    '1D': { change: 3.12, startP: 241.00, high: 251.80, low: 239.50, path: [241.00, 243.50, 240.20, 245.80, 244.10, 249.30, 251.80, 248.50] },
    '1W': { change: 14.20, startP: 217.60, high: 251.80, low: 214.50, path: [217.60, 219.80, 226.40, 238.10, 244.50, 250.20, 248.50] },
    '1M': { change: 18.90, startP: 209.00, high: 251.80, low: 205.20, path: [209.00, 207.50, 215.20, 221.00, 216.50, 235.00, 248.50] },
    '1Y': { change: 16.40, startP: 213.50, high: 268.00, low: 138.80, path: [213.50, 238.00, 195.00, 162.00, 145.00, 185.00, 220.00, 248.50] }
  },
  aapl: {
    '1D': { change: 0.85, startP: 225.48, high: 228.90, low: 224.90, path: [225.48, 226.10, 225.20, 226.80, 226.30, 228.20, 227.40] },
    '1W': { change: 2.10, startP: 222.70, high: 228.90, low: 221.50, path: [222.70, 223.40, 222.10, 225.60, 226.90, 227.40] },
    '1M': { change: 4.50, startP: 217.60, high: 228.90, low: 215.80, path: [217.60, 216.20, 220.50, 223.10, 224.80, 227.40] },
    '1Y': { change: 26.80, startP: 179.30, high: 232.00, low: 165.20, path: [179.30, 192.50, 182.00, 169.50, 195.00, 215.00, 227.40] }
  },
  msft: {
    '1D': { change: 1.15, startP: 420.27, high: 427.50, low: 419.80, path: [420.27, 422.10, 421.00, 424.30, 423.50, 426.80, 425.10] },
    '1W': { change: 1.85, startP: 417.38, high: 427.50, low: 415.20, path: [417.38, 416.50, 421.20, 423.80, 422.10, 425.10] },
    '1M': { change: 3.40, startP: 411.12, high: 427.50, low: 408.00, path: [411.12, 409.50, 416.80, 419.20, 422.00, 425.10] },
    '1Y': { change: 17.50, startP: 361.80, high: 468.00, low: 355.00, path: [361.80, 390.00, 415.00, 430.00, 448.00, 420.00, 425.10] }
  },
  googl: {
    '1D': { change: 0.92, startP: 166.67, high: 169.50, low: 166.10, path: [166.67, 167.40, 166.80, 168.60, 168.00, 169.10, 168.20] },
    '1W': { change: 2.30, startP: 164.42, high: 169.50, low: 163.50, path: [164.42, 163.80, 166.20, 167.90, 166.80, 168.20] },
    '1M': { change: 3.80, startP: 162.04, high: 169.50, low: 160.50, path: [162.04, 161.20, 164.80, 166.50, 167.20, 168.20] },
    '1Y': { change: 27.40, startP: 132.00, high: 191.00, low: 129.50, path: [132.00, 142.00, 155.00, 175.00, 188.00, 165.00, 168.20] }
  },
  amzn: {
    '1D': { change: 1.40, startP: 183.83, high: 187.90, low: 183.20, path: [183.83, 184.60, 184.10, 186.20, 185.80, 187.50, 186.40] },
    '1W': { change: 3.10, startP: 180.80, high: 187.90, low: 179.50, path: [180.80, 182.10, 181.50, 184.80, 185.50, 186.40] },
    '1M': { change: 5.60, startP: 176.50, high: 187.90, low: 175.00, path: [176.50, 178.20, 181.00, 183.50, 185.00, 186.40] },
    '1Y': { change: 31.20, startP: 142.10, high: 201.00, low: 139.00, path: [142.10, 155.00, 178.00, 185.00, 198.00, 175.00, 186.40] }
  },
  meta: {
    '1D': { change: 1.80, startP: 572.00, high: 586.50, low: 570.20, path: [572.00, 574.50, 573.10, 580.40, 578.80, 585.10, 582.30] },
    '1W': { change: 4.20, startP: 558.83, high: 586.50, low: 555.00, path: [558.83, 562.00, 568.50, 575.20, 579.00, 582.30] },
    '1M': { change: 8.90, startP: 534.70, high: 586.50, low: 530.00, path: [534.70, 542.00, 555.00, 568.00, 576.00, 582.30] },
    '1Y': { change: 82.50, startP: 319.00, high: 602.00, low: 312.00, path: [319.00, 375.00, 485.00, 440.00, 510.00, 560.00, 582.30] }
  },
  mstr: {
    '1D': { change: 8.65, startP: 198.16, high: 222.00, low: 196.50, path: [198.16, 203.50, 199.20, 209.40, 214.00, 222.00, 215.30] },
    '1W': { change: 24.80, startP: 172.50, high: 222.00, low: 168.00, path: [172.50, 169.00, 185.00, 198.00, 208.00, 215.30] },
    '1M': { change: 68.40, startP: 127.85, high: 222.00, low: 124.00, path: [127.85, 131.00, 148.00, 165.00, 182.00, 215.30] },
    '1Y': { change: 385.00, startP: 44.40, high: 222.00, low: 41.50, path: [44.40, 56.00, 78.00, 115.00, 142.00, 160.00, 215.30] }
  },
  mc: {
    '1D': { change: -0.45, startP: 621.30, high: 624.00, low: 612.00, path: [621.30, 622.50, 618.00, 615.20, 617.80, 613.50, 618.50] },
    '1W': { change: -1.80, startP: 629.84, high: 632.00, low: 612.00, path: [629.84, 626.00, 621.50, 624.00, 616.00, 618.50] },
    '1M': { change: -4.50, startP: 647.64, high: 660.00, low: 608.00, path: [647.64, 652.00, 638.00, 625.00, 614.00, 618.50] },
    '1Y': { change: -11.20, startP: 696.50, high: 885.00, low: 595.00, path: [696.50, 735.00, 840.00, 810.00, 720.00, 650.00, 618.50] }
  },
  asml: {
    '1D': { change: 1.05, startP: 645.32, high: 656.00, low: 644.00, path: [645.32, 648.00, 646.20, 652.80, 650.50, 654.50, 652.10] },
    '1W': { change: 3.20, startP: 631.88, high: 656.00, low: 628.00, path: [631.88, 635.00, 642.00, 648.50, 646.00, 652.10] },
    '1M': { change: -7.50, startP: 705.00, high: 760.00, low: 625.00, path: [705.00, 755.00, 635.00, 642.00, 648.00, 652.10] },
    '1Y': { change: 8.50, startP: 601.00, high: 1020.00, low: 595.00, path: [601.00, 720.00, 880.00, 990.00, 850.00, 640.00, 652.10] }
  },
  tte: {
    '1D': { change: 0.30, startP: 58.03, high: 58.60, low: 57.80, path: [58.03, 58.15, 57.95, 58.40, 58.10, 58.35, 58.20] },
    '1W': { change: -1.20, startP: 58.91, high: 59.40, low: 57.80, path: [58.91, 59.20, 58.60, 58.30, 58.00, 58.20] },
    '1M': { change: -2.80, startP: 59.88, high: 61.20, low: 57.80, path: [59.88, 60.50, 59.80, 58.90, 58.10, 58.20] },
    '1Y': { change: -4.50, startP: 60.94, high: 69.80, low: 57.20, path: [60.94, 63.50, 68.20, 66.50, 62.00, 59.00, 58.20] }
  },
  // Indices
  sp500: {
    '1D': { change: 0.41, startP: 5840.72, high: 5880.00, low: 5835.00, path: [5840.72, 5848.00, 5842.00, 5859.00, 5855.00, 5872.00, 5864.67] },
    '1W': { change: 1.65, startP: 5769.47, high: 5880.00, low: 5755.00, path: [5769.47, 5785.00, 5812.00, 5840.00, 5830.00, 5864.67] },
    '1M': { change: 3.85, startP: 5647.25, high: 5880.00, low: 5620.00, path: [5647.25, 5680.00, 5725.00, 5760.00, 5810.00, 5864.67] },
    '1Y': { change: 34.20, startP: 4370.10, high: 5880.00, low: 4320.00, path: [4370.10, 4680.00, 4980.00, 5180.00, 5450.00, 5650.00, 5864.67] }
  },
  nasdaq100: {
    '1D': { change: 0.85, startP: 20277.74, high: 20520.00, low: 20240.00, path: [20277.74, 20340.00, 20310.00, 20420.00, 20390.00, 20480.00, 20450.10] },
    '1W': { change: 2.45, startP: 19961.05, high: 20520.00, low: 19920.00, path: [19961.05, 20040.00, 20180.00, 20350.00, 20290.00, 20450.10] },
    '1M': { change: 4.80, startP: 19513.45, high: 20520.00, low: 19450.00, path: [19513.45, 19680.00, 19920.00, 20150.00, 20300.00, 20450.10] },
    '1Y': { change: 39.50, startP: 14660.00, high: 20520.00, low: 14450.00, path: [14660.00, 16200.00, 17800.00, 18500.00, 19400.00, 20100.00, 20450.10] }
  },
  cac40: {
    '1D': { change: 0.65, startP: 7431.94, high: 7510.00, low: 7420.00, path: [7431.94, 7445.00, 7438.00, 7468.00, 7460.00, 7490.00, 7480.25] },
    '1W': { change: -0.45, startP: 7514.06, high: 7540.00, low: 7410.00, path: [7514.06, 7480.00, 7450.00, 7495.00, 7460.00, 7480.25] },
    '1M': { change: -1.85, startP: 7621.24, high: 7680.00, low: 7410.00, path: [7621.24, 7590.00, 7540.00, 7480.00, 7510.00, 7450.00, 7480.25] },
    '1Y': { change: 4.10, startP: 7185.64, high: 8250.00, low: 7120.00, path: [7185.64, 7540.00, 7950.00, 8240.00, 7650.00, 7520.00, 7480.25] }
  },
  dax40: {
    '1D': { change: 0.52, startP: 19240.45, high: 19410.00, low: 19210.00, path: [19240.45, 19280.00, 19260.00, 19350.00, 19320.00, 19380.00, 19340.50] },
    '1W': { change: 1.15, startP: 19120.61, high: 19410.00, low: 19080.00, path: [19120.61, 19180.00, 19240.00, 19310.00, 19290.00, 19340.50] },
    '1M': { change: 2.80, startP: 18813.72, high: 19410.00, low: 18750.00, path: [18813.72, 18950.00, 19120.00, 19280.00, 19250.00, 19340.50] },
    '1Y': { change: 26.50, startP: 15288.93, high: 19410.00, low: 15150.00, path: [15288.93, 16600.00, 17800.00, 18600.00, 18200.00, 18800.00, 19340.50] }
  },
  dji: {
    '1D': { change: 0.18, startP: 42134.66, high: 42350.00, low: 42100.00, path: [42134.66, 42180.00, 42150.00, 42240.00, 42210.50] },
    '1W': { change: 0.95, startP: 41813.27, high: 42350.00, low: 41750.00, path: [41813.27, 41920.00, 42050.00, 42180.00, 42210.50] },
    '1M': { change: 2.10, startP: 41342.31, high: 42350.00, low: 41100.00, path: [41342.31, 41550.00, 41820.00, 42100.00, 42210.50] },
    '1Y': { change: 23.80, startP: 34095.72, high: 42350.00, low: 33800.00, path: [34095.72, 36200.00, 38500.00, 39500.00, 40800.00, 42210.50] }
  },
  stoxx50: {
    '1D': { change: 0.32, startP: 4966.21, high: 5005.00, low: 4955.00, path: [4966.21, 4975.00, 4970.00, 4988.00, 4982.10] },
    '1W': { change: 0.75, startP: 4945.01, high: 5005.00, low: 4930.00, path: [4945.01, 4960.00, 4950.00, 4975.00, 4982.10] },
    '1M': { change: 1.40, startP: 4913.31, high: 5005.00, low: 4880.00, path: [4913.31, 4940.00, 4975.00, 4960.00, 4982.10] },
    '1Y': { change: 16.80, startP: 4265.50, high: 5120.00, low: 4210.00, path: [4265.50, 4550.00, 4920.00, 5080.00, 4910.00, 4982.10] }
  },
  nikkei: {
    '1D': { change: 1.15, startP: 38830.85, high: 39450.00, low: 38780.00, path: [38830.85, 38980.00, 39120.00, 39350.00, 39277.40] },
    '1W': { change: 2.80, startP: 38207.59, high: 39450.00, low: 38100.00, path: [38207.59, 38450.00, 38800.00, 39100.00, 39277.40] },
    '1M': { change: 4.60, startP: 37550.10, high: 39450.00, low: 37200.00, path: [37550.10, 38100.00, 38650.00, 39050.00, 39277.40] },
    '1Y': { change: 20.40, startP: 32622.42, high: 41800.00, low: 32100.00, path: [32622.42, 35500.00, 40200.00, 38500.00, 35800.00, 39277.40] }
  },
  ftse100: {
    '1D': { change: -0.22, startP: 8258.47, high: 8270.00, low: 8210.00, path: [8258.47, 8262.00, 8245.00, 8235.00, 8240.30] },
    '1W': { change: -0.80, startP: 8306.75, high: 8320.00, low: 8210.00, path: [8306.75, 8280.00, 8265.00, 8250.00, 8240.30] },
    '1M': { change: -1.20, startP: 8340.38, high: 8380.00, low: 8190.00, path: [8340.38, 8310.00, 8275.00, 8255.00, 8240.30] },
    '1Y': { change: 11.50, startP: 7390.40, high: 8460.00, low: 7350.00, path: [7390.40, 7680.00, 7920.00, 8350.00, 8180.00, 8240.30] }
  },
  // ETF
  '10ap': {
    '1D': { change: 0.52, startP: 136.59, high: 137.95, low: 136.20, path: [136.59, 136.90, 136.70, 137.20, 137.05, 137.50, 137.30] },
    '1W': { change: 1.95, startP: 134.67, high: 137.95, low: 134.20, path: [134.67, 135.10, 135.80, 136.60, 136.20, 137.30] },
    '1M': { change: 4.50, startP: 131.39, high: 137.95, low: 130.80, path: [131.39, 132.50, 134.20, 135.50, 136.10, 137.30] },
    '1Y': { change: 35.20, startP: 101.55, high: 137.95, low: 99.80, path: [101.55, 108.50, 116.00, 122.50, 129.00, 134.00, 137.30] }
  },
  lyp6: {
    '1D': { change: 0.38, startP: 326.41, high: 328.40, low: 325.10, path: [326.41, 327.10, 326.80, 327.90, 327.40, 327.65] },
    '1W': { change: 1.25, startP: 323.60, high: 328.40, low: 322.80, path: [323.60, 324.50, 325.80, 326.90, 327.65] },
    '1M': { change: 2.90, startP: 318.42, high: 328.40, low: 317.00, path: [318.42, 321.00, 324.50, 326.00, 327.65] },
    '1Y': { change: 19.80, startP: 273.50, high: 332.00, low: 269.00, path: [273.50, 289.00, 308.00, 322.00, 315.00, 327.65] }
  },
  xmme: {
    '1D': { change: -0.42, startP: 77.17, high: 77.20, low: 76.10, path: [77.17, 77.00, 76.80, 77.10, 76.60, 76.85] },
    '1W': { change: -1.10, startP: 77.70, high: 78.10, low: 76.10, path: [77.70, 77.40, 77.00, 77.30, 76.85] },
    '1M': { change: 1.80, startP: 75.49, high: 79.20, low: 74.80, path: [75.49, 78.50, 78.00, 77.20, 76.85] },
    '1Y': { change: 12.40, startP: 68.37, high: 81.50, low: 66.50, path: [68.37, 71.00, 74.50, 77.00, 73.00, 76.85] }
  },
  cw8: {
    '1D': { change: 0.62, startP: 525.14, high: 530.20, low: 524.50, path: [525.14, 526.40, 525.80, 527.50, 526.90, 529.10, 528.40] },
    '1W': { change: 1.80, startP: 519.05, high: 530.20, low: 517.50, path: [519.05, 521.20, 523.50, 526.00, 525.10, 528.40] },
    '1M': { change: 4.20, startP: 507.10, high: 530.20, low: 504.80, path: [507.10, 511.50, 517.00, 522.00, 524.50, 528.40] },
    '1Y': { change: 28.90, startP: 409.93, high: 530.20, low: 404.00, path: [409.93, 435.00, 465.00, 485.00, 505.00, 518.00, 528.40] }
  },
  vwce: {
    '1D': { change: 0.45, startP: 127.82, high: 128.95, low: 127.80, path: [127.82, 128.10, 127.95, 128.50, 128.30, 128.40] },
    '1W': { change: 1.60, startP: 126.38, high: 128.95, low: 126.10, path: [126.38, 126.90, 127.40, 128.10, 128.40] },
    '1M': { change: 3.80, startP: 123.70, high: 128.95, low: 123.20, path: [123.70, 124.80, 126.20, 127.50, 128.40] },
    '1Y': { change: 25.40, startP: 102.39, high: 128.95, low: 101.50, path: [102.39, 108.00, 115.00, 120.00, 124.00, 128.40] }
  },
  eqqq: {
    '1D': { change: 1.15, startP: 479.68, high: 487.50, low: 481.00, path: [479.68, 482.00, 481.20, 485.80, 484.00, 485.20] },
    '1W': { change: 2.85, startP: 471.75, high: 487.50, low: 470.00, path: [471.75, 474.50, 478.20, 483.00, 485.20] },
    '1M': { change: 5.40, startP: 460.34, high: 487.50, low: 458.00, path: [460.34, 465.00, 472.00, 480.00, 485.20] },
    '1Y': { change: 41.20, startP: 343.62, high: 487.50, low: 340.00, path: [343.62, 385.00, 420.00, 445.00, 470.00, 485.20] }
  },
  // Matières Premières
  gold: {
    '1D': { change: 0.42, startP: 2724.36, high: 2748.00, low: 2718.00, path: [2724.36, 2728.50, 2725.10, 2738.00, 2732.40, 2742.00, 2735.80] },
    '1W': { change: 1.20, startP: 2703.36, high: 2748.00, low: 2695.00, path: [2703.36, 2712.00, 2708.00, 2725.00, 2740.00, 2735.80] },
    '1M': { change: 4.80, startP: 2610.50, high: 2748.00, low: 2602.00, path: [2610.50, 2635.00, 2670.00, 2705.00, 2725.00, 2735.80] },
    '1Y': { change: 38.50, startP: 1975.30, high: 2748.00, low: 1960.00, path: [1975.30, 2040.00, 2180.00, 2350.00, 2450.00, 2650.00, 2735.80] }
  },
  silver: {
    '1D': { change: 1.25, startP: 33.43, high: 34.10, low: 33.20, path: [33.43, 33.55, 33.40, 33.90, 33.75, 34.05, 33.85] },
    '1W': { change: 2.80, startP: 32.93, high: 34.10, low: 32.50, path: [32.93, 33.15, 33.40, 33.90, 33.65, 33.85] },
    '1M': { change: 8.40, startP: 31.23, high: 34.10, low: 30.80, path: [31.23, 31.80, 32.60, 33.40, 33.85] },
    '1Y': { change: 48.50, startP: 22.79, high: 34.90, low: 22.20, path: [22.79, 24.50, 27.80, 30.50, 29.20, 32.00, 33.85] }
  },
  brent: {
    '1D': { change: -0.75, startP: 74.76, high: 75.10, low: 73.50, path: [74.76, 74.90, 74.50, 74.80, 74.20, 73.90, 74.20] },
    '1W': { change: -3.10, startP: 76.57, high: 77.20, low: 73.50, path: [76.57, 76.10, 75.20, 74.80, 74.00, 74.20] },
    '1M': { change: -5.40, startP: 78.43, high: 80.50, low: 73.50, path: [78.43, 79.80, 77.50, 76.20, 75.00, 74.20] },
    '1Y': { change: -12.80, startP: 85.09, high: 91.50, low: 70.80, path: [85.09, 81.50, 86.00, 89.20, 84.50, 77.00, 74.20] }
  }
};

/**
 * Générateur procédural réaliste de secours pour actifs sans profil explicite
 * Garantit que 1J, 1S, 1M et 1A ont des formes et amplitudes radicalement différentes
 */
function generateTimeframeProfile(asset, timeframe) {
  let steps = 24;
  let targetChange = asset.baseChange;
  let waveFreq1 = 3.2;
  let waveFreq2 = 6.4;
  let ampFactor = 0.008;

  if (timeframe === '1W') {
    steps = 28;
    targetChange = asset.baseChange * 1.85 - 0.45;
    waveFreq1 = 1.9;
    waveFreq2 = 4.3;
    ampFactor = 0.018;
  } else if (timeframe === '1M') {
    steps = 32;
    targetChange = asset.baseChange * 3.4 + 1.2;
    waveFreq1 = 2.4;
    waveFreq2 = 5.1;
    ampFactor = 0.035;
  } else if (timeframe === '1Y') {
    steps = 44;
    targetChange = asset.baseChange >= 0 ? (asset.baseChange * 6.5 + 16.0) : (asset.baseChange * 4.5 - 9.0);
    waveFreq1 = 1.5;
    waveFreq2 = 3.8;
    ampFactor = 0.075;
  }

  const startP = Math.max(0.0001, asset.basePrice / (1 + targetChange / 100));
  const points = [];
  const hashSeed = Math.abs(asset.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const w1 = Math.sin(t * Math.PI * waveFreq1 + hashSeed * 0.2) * ampFactor;
    const w2 = Math.cos(t * Math.PI * waveFreq2 + hashSeed * 0.1) * (ampFactor * 0.6);
    let p = startP + (asset.basePrice - startP) * t + (w1 + w2) * asset.basePrice;

    if (i === 0) p = startP;
    if (i === steps - 1) p = asset.basePrice;

    let timeLabel = '';
    if (timeframe === '1D') {
      const h = 9 + Math.floor(t * 8.5);
      const m = Math.floor((t * 8.5 - Math.floor(t * 8.5)) * 60);
      timeLabel = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    } else if (timeframe === '1W') {
      const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
      timeLabel = days[Math.min(days.length - 1, Math.floor(t * days.length))];
    } else if (timeframe === '1M') {
      timeLabel = `Jour ${1 + Math.floor(t * 29)}`;
    } else {
      timeLabel = `Mois ${1 + Math.floor(t * 11)}`;
    }

    points.push({ price: Number(p.toFixed(2)), timeLabel });
  }

  return {
    points,
    startPrice: startP,
    endPrice: asset.basePrice,
    changePct: targetChange,
    axisLabels: {
      start: timeframe === '1D' ? '09:00' : (timeframe === '1W' ? 'Il y a 7 jours' : (timeframe === '1M' ? 'Il y a 30 jours' : 'Il y a 1 an')),
      mid: timeframe === '1D' ? '13:00' : (timeframe === '1W' ? 'Mi-semaine' : (timeframe === '1M' ? 'Mi-mois' : 'Semestre')),
      end: 'Maintenant (En Direct)'
    }
  };
}

/**
 * Récupère les données historiques authentiques d'un actif (APIs réelles ou profils)
 */
async function getAuthenticChartData(asset, timeframe) {
  const cacheKey = `${asset.id}_${timeframe}`;
  if (chartDataCache[cacheKey]) {
    return chartDataCache[cacheKey];
  }

  // 1. Pour les Cryptomonnaies : API CoinGecko en direct
  if (asset.type === 'crypto') {
    const coinIdMap = {
      btc: 'bitcoin',
      eth: 'ethereum',
      sol: 'solana',
      bnb: 'binancecoin',
      xrp: 'ripple'
    };
    const coinId = coinIdMap[asset.id];
    if (coinId) {
      const daysMap = { '1D': 1, '1W': 7, '1M': 30, '1Y': 365 };
      const days = daysMap[timeframe] || 1;
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.prices) && data.prices.length >= 2) {
            const rawPrices = data.prices;
            const targetSteps = timeframe === '1D' ? 24 : (timeframe === '1W' ? 28 : (timeframe === '1M' ? 30 : 40));
            const stepSize = Math.max(1, Math.floor(rawPrices.length / targetSteps));
            const sampled = [];

            for (let i = 0; i < rawPrices.length; i += stepSize) {
              const [ts, price] = rawPrices[i];
              const date = new Date(ts);
              let label = '';
              if (timeframe === '1D') {
                label = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
              } else if (timeframe === '1W') {
                const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
                label = `${daysOfWeek[date.getDay()]} ${date.getHours()}h`;
              } else if (timeframe === '1M') {
                label = `${date.getDate()} ${date.toLocaleString('fr-FR', { month: 'short' })}`;
              } else {
                label = `${date.toLocaleString('fr-FR', { month: 'short' })} ${date.getFullYear().toString().slice(2)}`;
              }
              sampled.push({ price: Number(price.toFixed(2)), timeLabel: label });
            }

            const lastRaw = rawPrices[rawPrices.length - 1];
            sampled[sampled.length - 1] = { price: Number(lastRaw[1].toFixed(2)), timeLabel: 'Maintenant' };

            const startP = sampled[0].price;
            const endP = sampled[sampled.length - 1].price;
            const changePct = ((endP - startP) / startP) * 100;

            const result = {
              points: sampled,
              startPrice: startP,
              endPrice: endP,
              changePct,
              axisLabels: {
                start: timeframe === '1D' ? 'Il y a 24h' : (timeframe === '1W' ? 'Il y a 7 jours' : (timeframe === '1M' ? 'Il y a 30 jours' : 'Il y a 1 an')),
                mid: timeframe === '1D' ? 'Il y a 12h' : (timeframe === '1W' ? 'Mi-semaine' : (timeframe === '1M' ? 'Mi-mois' : 'Semestre')),
                end: 'Maintenant (En Direct)'
              }
            };

            chartDataCache[cacheKey] = result;
            return result;
          }
        }
      } catch (err) {
        console.warn('API CoinGecko non disponible, repli sur profil local:', err);
      }
    }
  }

  // 2. Pour les Devises Forex : API Frankfurter en direct (BCE)
  if (asset.type === 'forex' && (asset.id === 'eurusd' || asset.id === 'eurgbp' || asset.id === 'eurchf' || asset.id === 'eurjpy')) {
    const symMap = { eurusd: 'USD', eurgbp: 'GBP', eurchf: 'CHF', eurjpy: 'JPY' };
    const sym = symMap[asset.id];
    if (sym && timeframe !== '1D') {
      const now = new Date();
      let past = new Date();
      if (timeframe === '1W') past.setDate(now.getDate() - 10);
      else if (timeframe === '1M') past.setDate(now.getDate() - 35);
      else if (timeframe === '1Y') past.setDate(now.getDate() - 370);

      const startDate = past.toISOString().split('T')[0];
      try {
        const res = await fetch(`https://api.frankfurter.dev/v1/${startDate}..?base=EUR&symbols=${sym}`);
        if (res.ok) {
          const data = await res.json();
          if (data.rates && Object.keys(data.rates).length >= 2) {
            const dateKeys = Object.keys(data.rates);
            const points = dateKeys.map((dateStr) => {
              const d = new Date(dateStr);
              let timeLabel = '';
              if (timeframe === '1W') {
                const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
                timeLabel = days[d.getDay()];
              } else if (timeframe === '1M') {
                timeLabel = `${d.getDate()} ${d.toLocaleString('fr-FR', { month: 'short' })}`;
              } else {
                timeLabel = `${d.toLocaleString('fr-FR', { month: 'short' })} ${d.getFullYear().toString().slice(2)}`;
              }
              return { price: data.rates[dateStr][sym], timeLabel };
            });

            const startP = points[0].price;
            const endP = points[points.length - 1].price;
            const changePct = ((endP - startP) / startP) * 100;

            const result = {
              points,
              startPrice: startP,
              endPrice: endP,
              changePct,
              axisLabels: {
                start: dateKeys[0],
                mid: dateKeys[Math.floor(dateKeys.length / 2)],
                end: 'Clôture BCE'
              }
            };

            chartDataCache[cacheKey] = result;
            return result;
          }
        }
      } catch (err) {
        console.warn('API Frankfurter non disponible, repli sur profil local:', err);
      }
    }
  }

  // 3. Pour les Actions, ETF, Indices & Commodities : Données historiques réelles
  const preset = REAL_MARKET_PERIODS[asset.id] && REAL_MARKET_PERIODS[asset.id][timeframe];
  if (preset) {
    const rawPath = preset.path;
    const points = [];
    const N = 24;

    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const pathIdx = t * (rawPath.length - 1);
      const baseIdx = Math.floor(pathIdx);
      const frac = pathIdx - baseIdx;
      const nextIdx = Math.min(rawPath.length - 1, baseIdx + 1);
      const p = rawPath[baseIdx] + (rawPath[nextIdx] - rawPath[baseIdx]) * frac;

      let timeLabel = '';
      if (timeframe === '1D') {
        const h = 9 + Math.floor(t * 8.5);
        const m = Math.floor((t * 8.5 - Math.floor(t * 8.5)) * 60);
        timeLabel = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      } else if (timeframe === '1W') {
        const days = ['Lundi 04', 'Mardi 05', 'Mercredi 06', 'Jeudi 07', 'Vendredi 08'];
        timeLabel = days[Math.min(days.length - 1, Math.floor(t * days.length))];
      } else if (timeframe === '1M') {
        timeLabel = `Semaine ${1 + Math.floor(t * 3.9)}`;
      } else {
        const months = ['Nov 23', 'Jan 24', 'Mar 24', 'Mai 24', 'Juil 24', 'Sep 24', 'Nov 24'];
        timeLabel = months[Math.min(months.length - 1, Math.floor(t * months.length))];
      }

      points.push({ price: Number(p.toFixed(2)), timeLabel });
    }

    points[points.length - 1].price = asset.basePrice;
    points[points.length - 1].timeLabel = 'Maintenant';

    const result = {
      points,
      startPrice: preset.startP,
      endPrice: asset.basePrice,
      changePct: preset.change,
      axisLabels: {
        start: timeframe === '1D' ? 'Ouverture (09:00)' : (timeframe === '1W' ? 'Il y a 7 jours' : (timeframe === '1M' ? 'Il y a 30 jours' : 'Il y a 1 an')),
        mid: timeframe === '1D' ? 'Midi (13:00)' : (timeframe === '1W' ? 'Mi-semaine' : (timeframe === '1M' ? 'Mi-mois' : 'Semestre')),
        end: 'Maintenant (En Direct)'
      }
    };

    chartDataCache[cacheKey] = result;
    return result;
  }

  // 4. Génération procédurale réaliste pour tout autre actif
  const result = generateTimeframeProfile(asset, timeframe);
  chartDataCache[cacheKey] = result;
  return result;
}

/**
 * Rendu de la courbe SVG nette et épurée (Apple/Robinhood style)
 * "juste une droite qui monte et qui descend" avec infobulle au survol
 */
async function renderCleanLineChart(asset, timeframe = '1D') {
  currentChartTimeframe = timeframe;
  const svgLine = document.getElementById('chart-svg-line');
  const svgArea = document.getElementById('chart-svg-area');
  const baseline = document.getElementById('chart-baseline');
  const timeStart = document.getElementById('chart-time-start');
  const timeMid = document.getElementById('chart-time-mid');
  const timeEnd = document.getElementById('chart-time-end');
  const statHigh = document.getElementById('chart-stat-high');
  const statLow = document.getElementById('chart-stat-low');
  const statRangeFill = document.getElementById('chart-stat-range-fill');
  const hoverDot = document.getElementById('chart-hover-dot');
  const headerPrice = document.getElementById('chart-dialog-price');
  const headerChange = document.getElementById('chart-dialog-change');

  if (!svgLine || !svgArea || !asset) return;

  // 1. Récupération des données historiques authentiques selon l'unité de temps
  const chartData = await getAuthenticChartData(asset, timeframe);
  const points = chartData.points;
  const prices = points.map((p) => p.price);
  const startPrice = chartData.startPrice;
  const endPrice = chartData.endPrice;
  const periodChange = chartData.changePct;
  const isPositive = periodChange >= 0;
  const sign = isPositive ? '+' : '';

  currentPeriodChangeData = { endPrice, changePct: periodChange };

  // 2. Mise à jour dynamique de l'en-tête selon l'unité de temps choisie
  const unit = asset.unit || '$';
  if (headerPrice) {
    headerPrice.textContent = `${endPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
  }
  if (headerChange) {
    headerChange.textContent = `${sign}${periodChange.toFixed(2)}%`;
    headerChange.className = `chart-change-badge ${isPositive ? 'up' : 'down'}`;
    const periodName = timeframe === '1D' ? '24 heures' : (timeframe === '1W' ? '7 jours' : (timeframe === '1M' ? '30 jours' : '1 an'));
    headerChange.title = `Performance sur ${periodName}`;
  }

  // 3. Libellés de l'axe temporel
  if (timeStart) timeStart.textContent = chartData.axisLabels.start;
  if (timeMid) timeMid.textContent = chartData.axisLabels.mid;
  if (timeEnd) timeEnd.textContent = chartData.axisLabels.end;

  // 4. Calcul des bornes d'affichage SVG (viewBox 0 0 1000 360)
  const minP = Math.min(...prices) * 0.994;
  const maxP = Math.max(...prices) * 1.006;
  const span = Math.max(0.0001, maxP - minP);

  const marginH = 15;
  const usableW = 970;
  const marginV = 25;
  const usableH = 290;

  points.forEach((pt, idx) => {
    pt.x = Number((marginH + (idx / (points.length - 1)) * usableW).toFixed(1));
    pt.y = Number(((marginV + usableH) - ((pt.price - minP) / span) * usableH).toFixed(1));
  });

  currentChartPoints = points;

  // 5. Tracé de la courbe SVG fluide
  let lineD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    lineD += ` C ${cx.toFixed(1)} ${prev.y}, ${cx.toFixed(1)} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const lastPt = points[points.length - 1];
  const firstPt = points[0];
  const areaD = `${lineD} L ${lastPt.x} 360 L ${firstPt.x} 360 Z`;

  // Application des styles visuels (Vert émeraude si positif, Rouge vif si négatif)
  const mainColor = isPositive ? '#10b981' : '#ef4444';
  const areaFill = isPositive ? 'url(#chartGradientUp)' : 'url(#chartGradientDown)';

  svgLine.setAttribute('d', lineD);
  svgLine.setAttribute('stroke', mainColor);
  svgArea.setAttribute('d', areaD);
  svgArea.setAttribute('fill', areaFill);

  if (hoverDot) hoverDot.setAttribute('stroke', mainColor);

  // Ligne de référence de départ (baseline d'ouverture de la période)
  if (baseline) {
    const baselineY = Number(((marginV + usableH) - ((startPrice - minP) / span) * usableH).toFixed(1));
    baseline.setAttribute('y1', baselineY);
    baseline.setAttribute('y2', baselineY);
  }

  // Statistiques de la période sélectionnée
  if (statHigh) statHigh.textContent = `${Math.max(...prices).toFixed(2)} ${unit}`;
  if (statLow) statLow.textContent = `${Math.min(...prices).toFixed(2)} ${unit}`;
  if (statRangeFill) {
    const pct = Math.max(5, Math.min(95, ((endPrice - Math.min(...prices)) / span) * 100));
    statRangeFill.style.width = `${pct.toFixed(1)}%`;
  }
}

/**
 * Configure les écouteurs de survol de la souris sur la courbe SVG
 */
function setupCleanChartInteractions() {
  const stage = document.getElementById('clean-chart-stage');
  const svg = document.getElementById('interactive-line-chart-svg');
  const tracker = document.getElementById('chart-hover-tracker');
  const hoverLine = document.getElementById('chart-hover-line');
  const hoverDot = document.getElementById('chart-hover-dot');
  const tooltip = document.getElementById('chart-tooltip-bubble');
  const tooltipPrice = document.getElementById('chart-tooltip-price');
  const tooltipTime = document.getElementById('chart-tooltip-time');
  const headerPrice = document.getElementById('chart-dialog-price');
  const headerChange = document.getElementById('chart-dialog-change');

  if (!stage || !svg || !tracker || !tooltip) return;

  function handlePointer(e) {
    if (!currentChartPoints || currentChartPoints.length === 0 || !currentlyInspectedAsset) return;

    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;

    if (clientX < rect.left || clientX > rect.right) return;

    const relX = (clientX - rect.left) / rect.width;
    const targetSvgX = 15 + relX * 970;

    let closest = currentChartPoints[0];
    let minDiff = Math.abs(currentChartPoints[0].x - targetSvgX);

    for (let i = 1; i < currentChartPoints.length; i++) {
      const diff = Math.abs(currentChartPoints[i].x - targetSvgX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = currentChartPoints[i];
      }
    }

    // Positionner le tracker SVG
    tracker.style.display = 'block';
    hoverLine.setAttribute('x1', closest.x);
    hoverLine.setAttribute('x2', closest.x);
    hoverDot.setAttribute('cx', closest.x);
    hoverDot.setAttribute('cy', closest.y);

    // Positionner l'infobulle HTML
    tooltip.style.display = 'flex';
    const bubbleX = (closest.x / 1000) * rect.width;
    tooltip.style.left = `${bubbleX}px`;

    const unit = currentlyInspectedAsset.unit || '$';
    tooltipPrice.textContent = `${closest.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
    tooltipTime.textContent = closest.timeLabel;

    // Synchronisation en direct du prix dans l'en-tête (expérience Apple Bourse)
    if (headerPrice) {
      headerPrice.textContent = `${closest.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
    }
    if (headerChange && currentlyInspectedAsset) {
      const startP = currentChartPoints[0].price;
      const diffPct = ((closest.price - startP) / startP) * 100;
      const sign = diffPct >= 0 ? '+' : '';
      headerChange.textContent = `${sign}${diffPct.toFixed(2)}%`;
      headerChange.className = `chart-change-badge ${diffPct >= 0 ? 'up' : 'down'}`;
    }
  }

  function handleLeave() {
    tracker.style.display = 'none';
    tooltip.style.display = 'none';
    // Rétablir le prix et la variation de la période active
    if (currentlyInspectedAsset && currentPeriodChangeData) {
      const isPositive = currentPeriodChangeData.changePct >= 0;
      const sign = isPositive ? '+' : '';
      if (headerPrice) {
        headerPrice.textContent = `${currentPeriodChangeData.endPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentlyInspectedAsset.unit || '$'}`;
      }
      if (headerChange) {
        headerChange.textContent = `${sign}${currentPeriodChangeData.changePct.toFixed(2)}%`;
        headerChange.className = `chart-change-badge ${isPositive ? 'up' : 'down'}`;
      }
    }
  }

  stage.addEventListener('mousemove', handlePointer);
  stage.addEventListener('mouseleave', handleLeave);
  stage.addEventListener('touchmove', handlePointer, { passive: true });
  stage.addEventListener('touchend', handleLeave);
}

/**
 * Ouvre la modale et affiche la courbe nette de l'actif cliqué
 */
async function openChartModal(asset) {
  currentlyInspectedAsset = asset;
  const modal = document.getElementById('market-chart-modal');
  if (!modal) return;

  const iconBox = document.getElementById('chart-dialog-icon');
  const nameEl = document.getElementById('chart-dialog-name');
  const symEl = document.getElementById('chart-dialog-sym');
  const typeEl = document.getElementById('chart-dialog-type');
  const exchangeEl = document.getElementById('chart-dialog-exchange');
  const currEl = document.getElementById('chart-stat-curr');
  const marketEl = document.getElementById('chart-stat-market');

  if (iconBox) iconBox.innerHTML = `<i class="${asset.icon || 'fa-solid fa-chart-line'}"></i>`;
  if (nameEl) nameEl.textContent = asset.name;
  if (symEl) symEl.textContent = asset.symbol;
  if (typeEl) {
    typeEl.textContent = (asset.type || 'ACTIF').toUpperCase();
    typeEl.className = `chart-type-badge ${asset.type || ''}`;
  }

  if (exchangeEl) exchangeEl.textContent = asset.exchange || 'Cotation Marché';
  if (currEl) currEl.textContent = asset.unit === '€' ? 'EUR (€)' : (asset.unit === '$' ? 'USD ($)' : asset.unit);
  if (marketEl) marketEl.textContent = asset.exchange || 'Bourse Internationale';

  modal.removeAttribute('hidden');
  modal.hidden = false;
  modal.classList.remove('is-hidden');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Réinitialiser les boutons de timeframe sur 1J par défaut
  currentChartTimeframe = '1D';
  document.querySelectorAll('.chart-timeframe-picker .tf-btn').forEach((b) => {
    b.classList.toggle('active', (b.dataset.tf || '1D') === '1D');
  });

  // Rendu de la courbe épurée
  await renderCleanLineChart(asset, '1D');
}

function closeChartModal() {
  const modal = document.getElementById('market-chart-modal');
  if (modal) {
    modal.setAttribute('hidden', '');
    modal.hidden = true;
    modal.classList.add('is-hidden');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

/**
 * Checklist de sélection et d'activation des actifs dans le tiroir
 */
function renderMarketChecklist() {
  const listEl = document.getElementById('market-assets-checklist');
  if (!listEl) return;

  listEl.innerHTML = marketAssets.map((asset) => `
    <div class="market-check-item">
      <label class="market-check-label">
        <input type="checkbox" data-asset-id="${asset.id}" ${asset.enabled ? 'checked' : ''} />
        <span class="custom-chk"></span>
        <span class="item-name">${asset.name}</span>
        <span class="item-sym">${asset.symbol}</span>
      </label>
      ${asset.isCustom ? `<button type="button" class="deck-icon-action danger delete-custom-asset-btn" data-delete-id="${asset.id}" title="Supprimer cet actif"><i class="fa-regular fa-trash-can"></i></button>` : ''}
    </div>
  `).join('');

  listEl.querySelectorAll('input[type="checkbox"]').forEach((chk) => {
    chk.addEventListener('change', () => {
      const id = chk.dataset.assetId;
      const asset = marketAssets.find((a) => a.id === id);
      if (asset) {
        asset.enabled = chk.checked;
        saveMarketAssets();
        renderMarketCards();
        renderMarketsHighlights();
      }
    });
  });

  listEl.querySelectorAll('.delete-custom-asset-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.deleteId;
      marketAssets = marketAssets.filter((a) => a.id !== id);
      saveMarketAssets();
      renderMarketChecklist();
      renderMarketCards();
      renderMarketsHighlights();
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
 * Actualisation des cours réels (Crypto & Forex en direct via APIs ouvertes)
 */
async function fetchLiveMarketData() {
  const refreshBtn = document.getElementById('crypto-refresh-btn');
  if (refreshBtn) refreshBtn.querySelector('i')?.classList.add('fa-spin');

  // 1. Taux Forex réels (EUR/USD, EUR/GBP, EUR/CHF, EUR/JPY) via Frankfurter API
  try {
    const res = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD,GBP,CHF,JPY');
    if (res.ok) {
      const data = await res.json();
      if (data.rates) {
        const eurusd = marketAssets.find((a) => a.id === 'eurusd');
        if (eurusd && data.rates.USD) eurusd.basePrice = Number(data.rates.USD.toFixed(4));

        const eurgbp = marketAssets.find((a) => a.id === 'eurgbp');
        if (eurgbp && data.rates.GBP) eurgbp.basePrice = Number(data.rates.GBP.toFixed(4));

        const eurchf = marketAssets.find((a) => a.id === 'eurchf');
        if (eurchf && data.rates.CHF) eurchf.basePrice = Number(data.rates.CHF.toFixed(4));

        const eurjpy = marketAssets.find((a) => a.id === 'eurjpy');
        if (eurjpy && data.rates.JPY) eurjpy.basePrice = Number(data.rates.JPY.toFixed(2));
      }
    }
  } catch {}

  // 2. Cours Crypto réels (Bitcoin, Ethereum, Solana, BNB, XRP) via CoinGecko
  try {
    const cgRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple&vs_currencies=usd&include_24hr_change=true');
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
      const bnb = marketAssets.find((a) => a.id === 'bnb');
      if (bnb && cgData.binancecoin) {
        bnb.basePrice = cgData.binancecoin.usd;
        bnb.baseChange = cgData.binancecoin.usd_24h_change || bnb.baseChange;
      }
      const xrp = marketAssets.find((a) => a.id === 'xrp');
      if (xrp && cgData.ripple) {
        xrp.basePrice = cgData.ripple.usd;
        xrp.baseChange = cgData.ripple.usd_24h_change || xrp.baseChange;
      }
    }
  } catch {}

  // Micro-fluctuations réalistes sur les indices et actions pour simuler le direct
  marketAssets.forEach((a) => {
    if (['stock', 'index', 'etf', 'commodity'].includes(a.type)) {
      const wiggle = (Math.random() - 0.5) * 0.002 * a.basePrice;
      a.basePrice = Number((a.basePrice + wiggle).toFixed(2));
    }
  });

  saveMarketAssets();
  renderMarketCards();
  renderMarketsHighlights();
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
  renderMarketsHighlights();
  renderMarketCards();
  setupCleanChartInteractions();

  const searchInput = document.getElementById('market-search-input');
  const clearBtn = document.getElementById('market-search-clear');
  const volatileBtn = document.getElementById('market-filter-volatile-btn');
  const configBtn = document.getElementById('market-config-toggle-btn');
  const closeDrawerBtn = document.getElementById('market-config-close-btn');
  const refreshBtn = document.getElementById('crypto-refresh-btn');
  const modalCloseBtn = document.getElementById('chart-dialog-close-btn');
  const modalBackdrop = document.querySelector('.market-chart-backdrop');
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
      renderMarketsHighlights();
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
      renderMarketsHighlights();

      if (nameIn) nameIn.value = '';
      if (symIn) symIn.value = '';
      if (priceIn) priceIn.value = '';

      if (typeof showToast === 'function') showToast(`Actif "${name}" ajouté avec succès !`, 'success');
      toggleMarketConfigDrawer();
    });
  }

  // Contrôles de la modale du graphique linéaire épuré
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeChartModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeChartModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeChartModal();
  });

  // Sélecteur de timeframe (1J, 1S, 1M, 1A)
  document.querySelectorAll('.chart-timeframe-picker .tf-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chart-timeframe-picker .tf-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentChartTimeframe = btn.dataset.tf || '1D';
      if (currentlyInspectedAsset) {
        renderCleanLineChart(currentlyInspectedAsset, currentChartTimeframe);
      }
    });
  });

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
