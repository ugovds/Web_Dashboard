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

/**
 * Rendu de la courbe SVG nette et épurée (Apple/Robinhood style)
 * "juste une droite qui monte et qui descend" avec infobulle au survol
 */
function renderCleanLineChart(asset, timeframe = '1D') {
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

  if (!svgLine || !svgArea || !asset) return;

  // Déterminer le nombre de points et les libellés de temps selon l'échelle
  let steps = 24;
  let tfFactor = 1;
  let startLabel = '09:00';
  let midLabel = '13:00';
  let endLabel = 'Maintenant (En Direct)';

  if (timeframe === '1W') {
    steps = 28;
    tfFactor = 1.8;
    startLabel = 'Il y a 7 jours';
    midLabel = 'Mi-semaine';
    endLabel = 'Aujourd\'hui';
  } else if (timeframe === '1M') {
    steps = 30;
    tfFactor = 2.9;
    startLabel = 'Il y a 30 jours';
    midLabel = 'Mi-mois';
    endLabel = 'Aujourd\'hui';
  } else if (timeframe === '1Y') {
    steps = 48;
    tfFactor = 5.2;
    startLabel = 'Il y a 1 an';
    midLabel = '6 mois';
    endLabel = 'Aujourd\'hui';
  }

  if (timeStart) timeStart.textContent = startLabel;
  if (timeMid) timeMid.textContent = midLabel;
  if (timeEnd) timeEnd.textContent = endLabel;

  // Calcul du prix de départ pour la période
  const periodChange = asset.baseChange * tfFactor;
  const startPrice = Math.max(0.0001, asset.basePrice / (1 + periodChange / 100));
  const isPositive = asset.basePrice >= startPrice;

  // Génération de la trajectoire fluide et réaliste
  const points = [];
  const prices = [];
  const hashSeed = Math.abs(asset.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const wave1 = Math.sin(t * Math.PI * 2.8 + hashSeed * 0.15) * 0.008;
    const wave2 = Math.cos(t * Math.PI * 5.4 + hashSeed * 0.05) * 0.005;
    const noise = (wave1 + wave2) * asset.basePrice;

    let p = startPrice + (asset.basePrice - startPrice) * t + noise;
    if (i === 0) p = startPrice;
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

    prices.push(p);
    points.push({ price: p, timeLabel });
  }

  const minP = Math.min(...prices) * 0.995;
  const maxP = Math.max(...prices) * 1.005;
  const span = Math.max(0.0001, maxP - minP);

  // Mappage dans le viewBox 0 0 1000 360
  const marginH = 15;
  const usableW = 970;
  const marginV = 25;
  const usableH = 290;

  points.forEach((pt, idx) => {
    pt.x = Number((marginH + (idx / (steps - 1)) * usableW).toFixed(1));
    pt.y = Number(((marginV + usableH) - ((pt.price - minP) / span) * usableH).toFixed(1));
  });

  currentChartPoints = points;

  // Construction de la droite/courbe fluide
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

  // Ligne de référence de départ (baseline d'ouverture)
  if (baseline) {
    const baselineY = Number(((marginV + usableH) - ((startPrice - minP) / span) * usableH).toFixed(1));
    baseline.setAttribute('y1', baselineY);
    baseline.setAttribute('y2', baselineY);
  }

  // Statistiques de la période
  const unit = asset.unit || '$';
  if (statHigh) statHigh.textContent = `${Math.max(...prices).toFixed(2)} ${unit}`;
  if (statLow) statLow.textContent = `${Math.min(...prices).toFixed(2)} ${unit}`;
  if (statRangeFill) {
    const pct = Math.max(5, Math.min(95, ((asset.basePrice - Math.min(...prices)) / span) * 100));
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
    // Rétablir le prix et la variation originaux de l'actif
    if (currentlyInspectedAsset) {
      const isPositive = currentlyInspectedAsset.baseChange >= 0;
      const sign = isPositive ? '+' : '';
      if (headerPrice) {
        headerPrice.textContent = `${currentlyInspectedAsset.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentlyInspectedAsset.unit || '$'}`;
      }
      if (headerChange) {
        headerChange.textContent = `${sign}${currentlyInspectedAsset.baseChange.toFixed(2)}%`;
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
  const currEl = document.getElementById('chart-stat-curr');
  const marketEl = document.getElementById('chart-stat-market');

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
  if (currEl) currEl.textContent = asset.unit === '€' ? 'EUR (€)' : (asset.unit === '$' ? 'USD ($)' : asset.unit);
  if (marketEl) marketEl.textContent = asset.exchange || 'Bourse Internationale';

  // Réinitialiser les boutons de timeframe sur 1J
  document.querySelectorAll('.chart-timeframe-picker .tf-btn').forEach((b) => {
    b.classList.toggle('active', (b.dataset.tf || '1D') === currentChartTimeframe);
  });

  // Rendu de la courbe épurée
  renderCleanLineChart(asset, currentChartTimeframe);

  modal.removeAttribute('hidden');
  modal.hidden = false;
  modal.classList.remove('is-hidden');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
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
