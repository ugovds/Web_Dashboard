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

// Mode d'affichage actif pour la Watchlist ('list' par défaut, ou 'grid')
let currentWatchlistViewMode = 'list';
// Actif actuellement mis en vedette dans le Hero Spotlight
let currentHeroAssetId = 'nvda';
// Points du graphique Hero pour le tracker
let currentHeroChartPoints = [];
// Cache des données 24h pour réactivité instantanée
const chart24hCache = {};

/**
 * Récupère ou génère une courbe 24h authentique et fluide pour un actif
 */
async function get24hChartData(asset) {
  if (!asset) return null;
  const cacheKey = `24h_${asset.id}_${asset.basePrice}`;
  if (chart24hCache[cacheKey]) return chart24hCache[cacheKey];

  // 1. Cours Crypto réels sur 24h via l'API CoinGecko
  if (asset.type === 'crypto') {
    const cgIdMap = {
      btc: 'bitcoin',
      eth: 'ethereum',
      sol: 'solana',
      bnb: 'binancecoin',
      xrp: 'ripple'
    };
    const cgId = cgIdMap[asset.id];
    if (cgId) {
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/${cgId}/market_chart?vs_currency=usd&days=1`);
        if (res.ok) {
          const data = await res.json();
          if (data.prices && data.prices.length >= 10) {
            const raw = data.prices;
            const step = Math.max(1, Math.floor(raw.length / 20));
            const sampled = [];
            for (let i = 0; i < raw.length; i += step) {
              const d = new Date(raw[i][0]);
              sampled.push({
                price: Number(raw[i][1].toFixed(2)),
                timeLabel: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
              });
            }
            sampled[sampled.length - 1] = {
              price: asset.basePrice,
              timeLabel: 'Maintenant'
            };
            const startP = sampled[0].price;
            const endP = asset.basePrice;
            const changePct = ((endP - startP) / startP) * 100;
            const prices = sampled.map((p) => p.price);
            const result = {
              points: sampled,
              startPrice: startP,
              endPrice: endP,
              changePct,
              high: Math.max(...prices),
              low: Math.min(...prices),
              axisLabels: { start: 'Il y a 24h', mid: 'Il y a 12h', end: 'Maintenant (En Direct)' }
            };
            chart24hCache[cacheKey] = result;
            return result;
          }
        }
      } catch (e) {
        console.warn('CoinGecko non dispo pour 24h, génération de secours:', e);
      }
    }
  }

  // 2. Trajectoire 24h réaliste pour Actions, ETF, Indices, Forex, Matières
  const changePct = typeof asset.baseChange === 'number' ? asset.baseChange : 0;
  const startP = Number((asset.basePrice / (1 + changePct / 100)).toFixed(2));
  const dayL = asset.dayLow || Math.min(startP, asset.basePrice) * 0.992;
  const dayH = asset.dayHigh || Math.max(startP, asset.basePrice) * 1.008;

  // Profil à 18 points réguliers sur 24h
  const N = 18;
  const sampled = [];
  const seed = (asset.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 20) / 10;

  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const trend = startP + (asset.basePrice - startP) * t;
    const wave = Math.sin(t * Math.PI * 2.5 + seed) * (dayH - dayL) * 0.18;
    const micro = Math.cos(t * Math.PI * 4.8 + seed * 1.4) * (dayH - dayL) * 0.08;
    let p = trend + wave + micro;
    p = Math.max(dayL, Math.min(dayH, p));

    const hoursAgo = Math.round(24 * (1 - t));
    const label = hoursAgo === 0 ? 'Maintenant' : (hoursAgo === 24 ? 'Il y a 24h' : `Il y a ${hoursAgo}h`);
    sampled.push({ price: Number(p.toFixed(2)), timeLabel: label });
  }

  sampled[0].price = startP;
  sampled[0].timeLabel = 'Il y a 24h';
  sampled[sampled.length - 1].price = asset.basePrice;
  sampled[sampled.length - 1].timeLabel = 'Maintenant (Direct)';

  const prices = sampled.map((p) => p.price);
  const result = {
    points: sampled,
    startPrice: startP,
    endPrice: asset.basePrice,
    changePct,
    high: Math.max(...prices, dayH),
    low: Math.min(...prices, dayL),
    axisLabels: { start: 'Il y a 24h', mid: 'Il y a 12h', end: 'Maintenant (Direct)' }
  };

  chart24hCache[cacheKey] = result;
  return result;
}

/**
 * Rendu du Grand Bento HERO SPOTLIGHT (Actif Vedette avec grand graphique 24h direct)
 */
async function renderHeroSpotlight(assetId = currentHeroAssetId) {
  currentHeroAssetId = assetId;
  const asset = marketAssets.find((a) => a.id === assetId) || marketAssets[0];
  if (!asset) return;

  const nameEl = document.getElementById('hero-asset-name');
  const symEl = document.getElementById('hero-asset-sym');
  const iconEl = document.getElementById('hero-asset-icon');
  const exchangeEl = document.getElementById('hero-asset-exchange');
  const priceEl = document.getElementById('hero-price-val');
  const changeEl = document.getElementById('hero-change-badge');
  const lowEl = document.getElementById('hero-stat-low');
  const highEl = document.getElementById('hero-stat-high');
  const rangeFillEl = document.getElementById('hero-range-fill');
  const volEl = document.getElementById('hero-metric-vol');
  const capEl = document.getElementById('hero-metric-cap');
  const sessEl = document.getElementById('hero-metric-session');
  const svgLine = document.getElementById('hero-svg-line');
  const svgArea = document.getElementById('hero-svg-area');
  const baseline = document.getElementById('hero-baseline');

  if (nameEl) nameEl.textContent = asset.name;
  if (symEl) symEl.textContent = asset.symbol.includes(':') ? asset.symbol.split(':')[1] : asset.symbol;
  if (iconEl) iconEl.innerHTML = `<i class="${asset.icon || 'fa-solid fa-chart-line'}"></i>`;
  if (exchangeEl) exchangeEl.textContent = `${asset.exchange || 'Marché International'} • Cotation en temps réel`;

  const isPositive = asset.baseChange >= 0;
  const sign = isPositive ? '+' : '';
  const unit = asset.unit || '$';

  if (priceEl) priceEl.textContent = `${asset.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
  if (changeEl) {
    changeEl.innerHTML = `<i class="fa-solid fa-arrow-trend-${isPositive ? 'up' : 'down'}"></i> ${sign}${asset.baseChange.toFixed(2)}% (24h)`;
    changeEl.className = `hero-change-badge ${isPositive ? 'up' : 'down'}`;
  }

  // Boutons du sélecteur rapide
  document.querySelectorAll('#hero-quick-switch .hero-pill-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.heroId === asset.id);
  });

  const dayL = asset.dayLow || asset.basePrice * 0.985;
  const dayH = asset.dayHigh || asset.basePrice * 1.015;
  if (lowEl) lowEl.textContent = `${dayL.toFixed(2)} ${unit}`;
  if (highEl) highEl.textContent = `${dayH.toFixed(2)} ${unit}`;

  const span = Math.max(0.01, dayH - dayL);
  const pct = Math.max(5, Math.min(95, ((asset.basePrice - dayL) / span) * 100));
  if (rangeFillEl) rangeFillEl.style.width = `${pct.toFixed(1)}%`;

  if (volEl) {
    if (asset.type === 'crypto') volEl.textContent = '24.8 Md $ / 24h';
    else if (asset.type === 'index') volEl.textContent = '3.8 Md titres';
    else volEl.textContent = `${(Math.round(asset.basePrice * 230000) / 1000000).toFixed(1)}M titres`;
  }
  if (capEl) {
    if (asset.id === 'nvda') capEl.textContent = '3.42 B $ (Mega-Cap)';
    else if (asset.id === 'aapl') capEl.textContent = '3.45 B $';
    else if (asset.id === 'msft') capEl.textContent = '3.15 B $';
    else if (asset.id === 'btc') capEl.textContent = '1.75 B $';
    else if (asset.type === 'etf') capEl.textContent = '12.4 Md € AUM';
    else capEl.textContent = '680 Md $';
  }
  if (sessEl) {
    sessEl.textContent = `${asset.unit === '€' ? 'EUR (€)' : (asset.unit === '$' ? 'USD ($)' : asset.unit)} • En direct`;
  }

  // Tracé du graphique 24h dans le Hero
  if (svgLine && svgArea) {
    const chartData = await get24hChartData(asset);
    if (!chartData || !chartData.points || chartData.points.length === 0) return;

    const points = chartData.points;
    const prices = points.map((p) => p.price);
    const minP = Math.min(...prices) * 0.995;
    const maxP = Math.max(...prices) * 1.005;
    const vSpan = Math.max(0.0001, maxP - minP);

    const marginH = 10;
    const usableW = 980;
    const marginV = 15;
    const usableH = 175;

    points.forEach((pt, idx) => {
      pt.x = Number((marginH + (idx / (points.length - 1)) * usableW).toFixed(1));
      pt.y = Number(((marginV + usableH) - ((pt.price - minP) / vSpan) * usableH).toFixed(1));
    });

    currentHeroChartPoints = points;

    let lineD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      lineD += ` C ${cx.toFixed(1)} ${prev.y}, ${cx.toFixed(1)} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const lastPt = points[points.length - 1];
    const firstPt = points[0];
    const areaD = `${lineD} L ${lastPt.x} 230 L ${firstPt.x} 230 Z`;

    const mainColor = isPositive ? '#10b981' : '#ef4444';
    const areaFill = isPositive ? 'url(#heroGradientUp)' : 'url(#heroGradientDown)';

    svgLine.setAttribute('d', lineD);
    svgLine.setAttribute('stroke', mainColor);
    svgArea.setAttribute('d', areaD);
    svgArea.setAttribute('fill', areaFill);

    if (baseline) {
      const baselineY = Number(((marginV + usableH) - ((chartData.startPrice - minP) / vSpan) * usableH).toFixed(1));
      baseline.setAttribute('y1', baselineY);
      baseline.setAttribute('y2', baselineY);
    }
  }

  setupHeroChartInteractions(asset);
}

/**
 * Configure les écouteurs de survol du graphique 24h Hero
 */
function setupHeroChartInteractions(asset) {
  const container = document.getElementById('hero-chart-container');
  const svg = document.getElementById('hero-chart-svg');
  const tracker = document.getElementById('hero-hover-tracker');
  const hoverLine = document.getElementById('hero-hover-line');
  const hoverDot = document.getElementById('hero-hover-dot');
  const tooltip = document.getElementById('hero-tooltip');
  const ttPrice = document.getElementById('hero-tooltip-price');
  const ttTime = document.getElementById('hero-tooltip-time');

  if (!container || !svg || !tracker || !tooltip) return;

  function onPointer(e) {
    if (!currentHeroChartPoints || currentHeroChartPoints.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    if (clientX < rect.left || clientX > rect.right) return;

    const relX = (clientX - rect.left) / rect.width;
    const targetSvgX = 10 + relX * 980;

    let closest = currentHeroChartPoints[0];
    let minDiff = Math.abs(currentHeroChartPoints[0].x - targetSvgX);
    for (let i = 1; i < currentHeroChartPoints.length; i++) {
      const diff = Math.abs(currentHeroChartPoints[i].x - targetSvgX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = currentHeroChartPoints[i];
      }
    }

    tracker.style.display = 'block';
    hoverLine.setAttribute('x1', closest.x);
    hoverLine.setAttribute('x2', closest.x);
    hoverDot.setAttribute('cx', closest.x);
    hoverDot.setAttribute('cy', closest.y);

    tooltip.style.display = 'flex';
    const bubbleX = (closest.x / 1000) * rect.width;
    tooltip.style.left = `${bubbleX}px`;

    const unit = asset.unit || '$';
    ttPrice.textContent = `${closest.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
    ttTime.textContent = closest.timeLabel;
  }

  function onLeave() {
    tracker.style.display = 'none';
    tooltip.style.display = 'none';
  }

  container.onmousemove = onPointer;
  container.onmouseleave = onLeave;
  container.ontouchmove = onPointer;
  container.ontouchend = onLeave;
}

/**
 * Rendu du Bento BAROMÈTRE & INDICES MONDIAUX
 */
function renderMarketBarometer() {
  const listContainer = document.getElementById('barometer-indices-list');
  const sentimentTag = document.getElementById('market-sentiment-tag');
  const fillBar = document.getElementById('barometer-fill-bar');
  const scoreText = document.getElementById('barometer-score-text');

  const enabledAssets = marketAssets.filter((a) => a.enabled);
  const posCount = enabledAssets.filter((a) => a.baseChange >= 0).length;
  const ratio = enabledAssets.length ? Math.round((posCount / enabledAssets.length) * 100) : 70;

  if (fillBar) fillBar.style.width = `${ratio}%`;
  if (sentimentTag) sentimentTag.textContent = `${ratio}% Haussier`;
  if (scoreText) {
    if (ratio >= 65) scoreText.textContent = 'Climat Positif / Bullish 🟢';
    else if (ratio <= 40) scoreText.textContent = 'Climat Prudent / Bearish 🔴';
    else scoreText.textContent = 'Marché Neutre / Équilibré 🟡';
  }

  if (!listContainer) return;

  const pillars = [
    marketAssets.find((a) => a.id === 'sp500') || { id: 'sp500', name: 'S&P 500', symbol: 'US500', basePrice: 5864.20, baseChange: 0.65, unit: 'pts' },
    marketAssets.find((a) => a.id === 'nasdaq100') || { id: 'nasdaq100', name: 'Nasdaq 100', symbol: 'NDX', basePrice: 20680.50, baseChange: 0.95, unit: 'pts' },
    marketAssets.find((a) => a.id === 'cac40') || { id: 'cac40', name: 'CAC 40', symbol: 'PX1', basePrice: 7420.30, baseChange: -0.22, unit: 'pts' },
    marketAssets.find((a) => a.id === 'dax40') || { id: 'dax40', name: 'DAX 40', symbol: 'DAX', basePrice: 19210.80, baseChange: 0.38, unit: 'pts' }
  ];

  listContainer.innerHTML = pillars.map((idx) => {
    const isUp = idx.baseChange >= 0;
    const sign = isUp ? '+' : '';
    const { linePath } = generateSparklinePaths(idx.basePrice, idx.baseChange, isUp);
    return `
      <div class="barometer-index-row" data-asset-id="${idx.id}" title="${idx.name} - Cliquer pour ouvrir la courbe 24h">
        <span class="b-idx-name">${idx.name}</span>
        <svg viewBox="0 0 100 36" class="b-idx-spark" preserveAspectRatio="none">
          <path d="${linePath}" fill="none" stroke="${isUp ? '#10b981' : '#ef4444'}" stroke-width="2.5" />
        </svg>
        <div class="b-idx-price-group">
          <span class="b-idx-val">${idx.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
          <span class="b-idx-chg ${isUp ? 'up' : 'down'}">${sign}${idx.baseChange.toFixed(2)}%</span>
        </div>
      </div>
    `;
  }).join('');

  listContainer.querySelectorAll('.barometer-index-row').forEach((row) => {
    row.addEventListener('click', () => {
      const id = row.dataset.assetId;
      const asset = marketAssets.find((a) => a.id === id);
      if (asset) openChartModal(asset);
    });
  });
}

/**
 * Rendu du Bento TOP MOVERS DU JOUR (Hausses vs Replis)
 */
function renderMarketMovers() {
  const gainersList = document.getElementById('movers-gainers-list');
  const losersList = document.getElementById('movers-losers-list');
  if (!gainersList || !losersList) return;

  const valid = marketAssets.filter((a) => a.enabled && typeof a.baseChange === 'number');
  const sortedGainers = [...valid].sort((a, b) => b.baseChange - a.baseChange).slice(0, 3);
  const sortedLosers = [...valid].sort((a, b) => a.baseChange - b.baseChange).slice(0, 3);

  function renderRows(arr, isGainer) {
    return arr.map((item) => {
      const sign = item.baseChange >= 0 ? '+' : '';
      const sym = item.symbol.includes(':') ? item.symbol.split(':')[1] : item.symbol;
      return `
        <div class="mover-item-row" data-asset-id="${item.id}" title="${item.name} - Voir la courbe 24h">
          <div class="mover-sym-name">
            <span class="mover-sym">${sym}</span>
            <span class="mover-name">${item.name}</span>
          </div>
          <div class="mover-val-chg">
            <span class="mover-price">${item.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${item.unit || '$'}</span>
            <span class="mover-badge ${isGainer ? 'up' : 'down'}">${sign}${item.baseChange.toFixed(2)}%</span>
          </div>
        </div>
      `;
    }).join('');
  }

  gainersList.innerHTML = renderRows(sortedGainers, true);
  losersList.innerHTML = renderRows(sortedLosers, false);

  [gainersList, losersList].forEach((container) => {
    container.querySelectorAll('.mover-item-row').forEach((row) => {
      row.addEventListener('click', () => {
        const id = row.dataset.assetId;
        const asset = marketAssets.find((a) => a.id === id);
        if (asset) openChartModal(asset);
      });
    });
  });
}

/**
 * Rendu du Bento DEVISES (FOREX) & CRYPTO EN DIRECT + Convertisseur express
 */
function renderForexCryptoModule() {
  const container = document.getElementById('forex-crypto-rows');
  if (!container) return;

  const pairs = [
    marketAssets.find((a) => a.id === 'eurusd') || { id: 'eurusd', symbol: 'EUR/USD', name: 'Euro / Dollar', basePrice: 1.0820, baseChange: 0.15, unit: '$' },
    marketAssets.find((a) => a.id === 'eurgbp') || { id: 'eurgbp', symbol: 'EUR/GBP', name: 'Euro / Livre', basePrice: 0.8350, baseChange: -0.08, unit: '£' },
    marketAssets.find((a) => a.id === 'btc') || { id: 'btc', symbol: 'BTC/USD', name: 'Bitcoin', basePrice: 88500, baseChange: 4.80, unit: '$' },
    marketAssets.find((a) => a.id === 'eth') || { id: 'eth', symbol: 'ETH/USD', name: 'Ethereum', basePrice: 3180, baseChange: 3.20, unit: '$' }
  ];

  container.innerHTML = pairs.map((p) => {
    const isUp = p.baseChange >= 0;
    const sign = isUp ? '+' : '';
    const sym = p.symbol.includes(':') ? p.symbol.split(':')[1] : p.symbol;
    return `
      <div class="fc-card-item" data-asset-id="${p.id}" title="${p.name} - Voir la courbe 24h">
        <div class="fc-left">
          <span class="fc-pair">${sym}</span>
          <span class="fc-desc">${p.name}</span>
        </div>
        <div class="fc-right">
          <span class="fc-rate">${p.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: (p.type === 'forex' ? 4 : 2), maximumFractionDigits: (p.type === 'forex' ? 4 : 2) })} ${p.unit || ''}</span>
          <span class="fc-chg ${isUp ? 'up' : 'down'}">${sign}${p.baseChange.toFixed(2)}%</span>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.fc-card-item').forEach((item) => {
    item.addEventListener('click', () => {
      const id = item.dataset.assetId;
      const asset = marketAssets.find((a) => a.id === id);
      if (asset) openChartModal(asset);
    });
  });

  updateQuickConverter();
}

/**
 * Calcule la conversion express (EUR vers USD et BTC)
 */
function updateQuickConverter() {
  const input = document.getElementById('quick-conv-amount');
  const resUsd = document.getElementById('quick-conv-result');
  const resBtc = document.getElementById('quick-conv-btc');
  if (!input || !resUsd) return;

  const eurAmount = parseFloat(input.value) || 100;
  const eurusd = marketAssets.find((a) => a.id === 'eurusd')?.basePrice || 1.0820;
  const btcPrice = marketAssets.find((a) => a.id === 'btc')?.basePrice || 88500;

  const totalUsd = eurAmount * eurusd;
  const totalBtc = totalUsd / btcPrice;

  resUsd.textContent = `${totalUsd.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
  if (resBtc) resBtc.textContent = `~ ${totalBtc.toFixed(5)} BTC`;
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

  if (day === 0 || day === 6) {
    statusEl.textContent = 'Bourses fermées (Week-end) • Crypto 24/7 active';
    return;
  }

  const isEuronextOpen = utcHour >= 7 && utcHour < 15.5;
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
 * Rendu de la Watchlist Complète (Mode Tableau Liste par défaut, ou Mode Grille)
 */
function renderMarketCards() {
  const container = document.getElementById('crypto-ticker-cards');
  if (!container) return;

  let list = marketAssets.filter((a) => a.enabled);

  if (currentMarketCategory !== 'all') {
    list = list.filter((a) => a.type === currentMarketCategory);
  }

  if (isMarketVolatileFilterActive) {
    list = list
      .filter((a) => a.isVolatile || Math.abs(a.baseChange) >= 2.0)
      .sort((a, b) => Math.abs(b.baseChange) - Math.abs(a.baseChange));
  }

  if (currentMarketSearch) {
    const q = currentMarketSearch.toLowerCase();
    list = list.filter((a) => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q));
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="market-empty-hint" style="grid-column: 1 / -1; padding: 3rem 2rem; text-align: center; color: var(--text-muted); background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 20px;">
        <i class="fa-solid fa-chart-line" style="font-size: 2rem; color: var(--accent-primary); margin-bottom: 0.8rem; display: block;"></i>
        <span style="font-size: 0.95rem; display: block; margin-bottom: 1rem;">Aucun actif ne correspond à votre filtre.</span>
        <button type="button" class="market-btn-primary" id="market-open-empty-btn"><i class="fa-solid fa-sliders"></i> Personnaliser la Watchlist</button>
      </div>
    `;
    document.getElementById('market-open-empty-btn')?.addEventListener('click', toggleMarketConfigDrawer);
    return;
  }

  // A) MODE TABLEAU / LISTE (PAR DÉFAUT - STYLE APPLE BOURSE / REVOLUT)
  if (currentWatchlistViewMode === 'list') {
    container.className = 'watchlist-table-container';
    container.innerHTML = `
      <div class="watchlist-table-header">
        <span>Actif &amp; Symbole</span>
        <span>Tendance 24h</span>
        <span>Range Journalier</span>
        <span style="text-align: right;">Dernier Cours</span>
        <span style="text-align: right;">Variation (24h)</span>
        <span></span>
      </div>
      ${list.map((asset) => {
        const isPositive = asset.baseChange >= 0;
        const sign = isPositive ? '+' : '';
        const unit = asset.unit || '$';
        const formattedPrice = `${asset.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
        const { linePath } = generateSparklinePaths(asset.basePrice, asset.baseChange, isPositive);

        const dayL = asset.dayLow || asset.basePrice * 0.985;
        const dayH = asset.dayHigh || asset.basePrice * 1.015;
        const rangeSpan = Math.max(0.01, dayH - dayL);
        const rangePct = Math.max(5, Math.min(95, ((asset.basePrice - dayL) / rangeSpan) * 100));

        let typeColor = 'var(--accent-primary)';
        if (asset.type === 'etf') typeColor = '#60a5fa';
        else if (asset.type === 'stock') typeColor = '#c084fc';
        else if (asset.type === 'crypto') typeColor = '#fbbf24';
        else if (asset.type === 'index') typeColor = '#34d399';
        else if (asset.type === 'forex') typeColor = '#38bdf8';
        else if (asset.type === 'commodity') typeColor = '#f59e0b';

        const cleanSym = asset.symbol.includes(':') ? asset.symbol.split(':')[1] : asset.symbol;

        return `
          <div class="watchlist-row" data-asset-id="${asset.id}" title="${asset.name} - Cliquer pour ouvrir la courbe 24h">
            <div class="wl-asset-cell">
              <div class="wl-icon-box" style="--asset-color: ${typeColor};">
                <i class="${asset.icon || 'fa-solid fa-chart-line'}"></i>
              </div>
              <div class="wl-asset-info">
                <span class="wl-asset-name">${asset.name}</span>
                <div class="wl-asset-meta">
                  <span class="wl-ticker">${cleanSym}</span>
                  <span class="wl-type-tag">${(asset.type || 'actif').toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div class="wl-sparkline-cell">
              <svg viewBox="0 0 100 36" class="wl-sparkline-svg" preserveAspectRatio="none">
                <path d="${linePath}" fill="none" stroke="${isPositive ? '#10b981' : '#ef4444'}" stroke-width="2.2" />
              </svg>
            </div>

            <div class="wl-range-cell">
              <span class="wl-range-bound">${dayL.toFixed(1)}</span>
              <div class="wl-range-track">
                <div class="wl-range-dot" style="left: ${rangePct.toFixed(1)}%;"></div>
              </div>
              <span class="wl-range-bound">${dayH.toFixed(1)}</span>
            </div>

            <div class="wl-price-cell">
              ${formattedPrice}
            </div>

            <div class="wl-change-cell">
              <span class="wl-change-badge ${isPositive ? 'up' : 'down'}">
                <i class="fa-solid fa-arrow-trend-${isPositive ? 'up' : 'down'}"></i>
                ${sign}${asset.baseChange.toFixed(2)}%
              </span>
            </div>

            <div class="wl-action-cell">
              <button type="button" title="Afficher la courbe 24h" data-open-chart="${asset.id}">
                <i class="fa-solid fa-chart-line"></i>
              </button>
            </div>
          </div>
        `;
      }).join('')}
    `;

    container.querySelectorAll('.watchlist-row').forEach((row) => {
      row.addEventListener('click', () => {
        const id = row.dataset.assetId;
        const asset = marketAssets.find((a) => a.id === id);
        if (asset) openChartModal(asset);
      });
    });
    return;
  }

  // B) MODE GRILLE CLASSIQUE (COMPACT)
  container.className = 'markets-grid crypto-ticker-cards';
  container.innerHTML = list.map((asset) => {
    const isPositive = asset.baseChange >= 0;
    const sign = isPositive ? '+' : '';
    const unit = asset.unit || '$';
    const formattedPrice = `${asset.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
    const { linePath, areaPath } = generateSparklinePaths(asset.basePrice, asset.baseChange, isPositive);

    const dayL = asset.dayLow || asset.basePrice * 0.985;
    const dayH = asset.dayHigh || asset.basePrice * 1.015;
    const rangeSpan = Math.max(0.01, dayH - dayL);
    const rangePct = Math.max(5, Math.min(95, ((asset.basePrice - dayL) / rangeSpan) * 100));

    let typeColor = 'var(--accent-primary)';
    if (asset.type === 'etf') typeColor = '#60a5fa';
    else if (asset.type === 'stock') typeColor = '#c084fc';
    else if (asset.type === 'crypto') typeColor = '#fbbf24';
    else if (asset.type === 'index') typeColor = '#34d399';
    else if (asset.type === 'forex') typeColor = '#38bdf8';
    else if (asset.type === 'commodity') typeColor = '#f59e0b';

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
                <span class="market-type-pill ${asset.type}">${(asset.type || 'actif').toUpperCase()}</span>
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
            <span class="range-bound">${dayL.toFixed(2)}</span>
            <div class="range-track">
              <div class="range-point" style="left: ${rangePct.toFixed(1)}%;"></div>
            </div>
            <span class="range-bound">${dayH.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.market-asset-card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.assetId;
      const asset = marketAssets.find((a) => a.id === id);
      if (asset) openChartModal(asset);
    });
  });
}

/**
 * Rendu de la courbe 24h épurée dans la modale
 */
async function renderCleanLineChart(asset) {
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

  const chartData = await get24hChartData(asset);
  const points = chartData.points;
  const prices = points.map((p) => p.price);
  const startPrice = chartData.startPrice;
  const endPrice = chartData.endPrice;
  const periodChange = chartData.changePct;
  const isPositive = periodChange >= 0;
  const sign = isPositive ? '+' : '';

  const unit = asset.unit || '$';
  if (headerPrice) {
    headerPrice.textContent = `${endPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
  }
  if (headerChange) {
    headerChange.textContent = `${sign}${periodChange.toFixed(2)}% (24h)`;
    headerChange.className = `chart-change-badge ${isPositive ? 'up' : 'down'}`;
  }

  if (timeStart) timeStart.textContent = 'Il y a 24h';
  if (timeMid) timeMid.textContent = 'Il y a 12h';
  if (timeEnd) timeEnd.textContent = 'Maintenant (En Direct)';

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

  const mainColor = isPositive ? '#10b981' : '#ef4444';
  const areaFill = isPositive ? 'url(#chartGradientUp)' : 'url(#chartGradientDown)';

  svgLine.setAttribute('d', lineD);
  svgLine.setAttribute('stroke', mainColor);
  svgArea.setAttribute('d', areaD);
  svgArea.setAttribute('fill', areaFill);

  if (hoverDot) hoverDot.setAttribute('stroke', mainColor);

  if (baseline) {
    const baselineY = Number(((marginV + usableH) - ((startPrice - minP) / span) * usableH).toFixed(1));
    baseline.setAttribute('y1', baselineY);
    baseline.setAttribute('y2', baselineY);
  }

  if (statHigh) statHigh.textContent = `${Math.max(...prices).toFixed(2)} ${unit}`;
  if (statLow) statLow.textContent = `${Math.min(...prices).toFixed(2)} ${unit}`;
  if (statRangeFill) {
    const pct = Math.max(5, Math.min(95, ((endPrice - Math.min(...prices)) / span) * 100));
    statRangeFill.style.width = `${pct.toFixed(1)}%`;
  }
}

/**
 * Configure les écouteurs de survol de la souris sur la courbe SVG de la modale
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

    tracker.style.display = 'block';
    hoverLine.setAttribute('x1', closest.x);
    hoverLine.setAttribute('x2', closest.x);
    hoverDot.setAttribute('cx', closest.x);
    hoverDot.setAttribute('cy', closest.y);

    tooltip.style.display = 'flex';
    const bubbleX = (closest.x / 1000) * rect.width;
    tooltip.style.left = `${bubbleX}px`;

    const unit = currentlyInspectedAsset.unit || '$';
    tooltipPrice.textContent = `${closest.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
    tooltipTime.textContent = closest.timeLabel;

    if (headerPrice) {
      headerPrice.textContent = `${closest.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
    }
    if (headerChange && currentlyInspectedAsset) {
      const startP = currentChartPoints[0].price;
      const diffPct = ((closest.price - startP) / startP) * 100;
      const sign = diffPct >= 0 ? '+' : '';
      headerChange.textContent = `${sign}${diffPct.toFixed(2)}% (24h)`;
      headerChange.className = `chart-change-badge ${diffPct >= 0 ? 'up' : 'down'}`;
    }
  }

  function handleLeave() {
    tracker.style.display = 'none';
    tooltip.style.display = 'none';
    if (currentlyInspectedAsset) {
      const isPositive = currentlyInspectedAsset.baseChange >= 0;
      const sign = isPositive ? '+' : '';
      const unit = currentlyInspectedAsset.unit || '$';
      if (headerPrice) {
        headerPrice.textContent = `${currentlyInspectedAsset.basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
      }
      if (headerChange) {
        headerChange.textContent = `${sign}${currentlyInspectedAsset.baseChange.toFixed(2)}% (24h)`;
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
 * Ouvre la modale et affiche la courbe 24h de l'actif cliqué
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

  // Rendu de la courbe 24h épurée
  await renderCleanLineChart(asset);
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
        renderHeroSpotlight(currentHeroAssetId);
  renderMarketBarometer();
  renderMarketMovers();
  renderForexCryptoModule();
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
      renderHeroSpotlight(currentHeroAssetId);
      renderMarketBarometer();
      renderMarketMovers();
      renderForexCryptoModule();
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
  renderHeroSpotlight(currentHeroAssetId);
  renderMarketBarometer();
  renderMarketMovers();
  renderForexCryptoModule();
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
  renderHeroSpotlight(currentHeroAssetId);
  renderMarketBarometer();
  renderMarketMovers();
  renderForexCryptoModule();
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
  const heroExpandBtn = document.getElementById('hero-expand-btn');
  const convInput = document.getElementById('quick-conv-amount');
  const viewListBtn = document.getElementById('view-mode-list-btn');
  const viewGridBtn = document.getElementById('view-mode-grid-btn');

  // Sélecteur de mode d'affichage (Liste / Grille)
  if (viewListBtn && viewGridBtn) {
    viewListBtn.addEventListener('click', () => {
      currentWatchlistViewMode = 'list';
      viewListBtn.classList.add('active');
      viewGridBtn.classList.remove('active');
      renderMarketCards();
    });
    viewGridBtn.addEventListener('click', () => {
      currentWatchlistViewMode = 'grid';
      viewGridBtn.classList.add('active');
      viewListBtn.classList.remove('active');
      renderMarketCards();
    });
  }

  // Sélecteur d'actif vedette Hero (NVDA, TSLA, BTC, S&P 500, CW8)
  document.querySelectorAll('#hero-quick-switch .hero-pill-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const heroId = btn.dataset.heroId;
      renderHeroSpotlight(heroId);
    });
  });

  // Bouton Agrandir de la Hero Card
  if (heroExpandBtn) {
    heroExpandBtn.addEventListener('click', () => {
      const asset = marketAssets.find((a) => a.id === currentHeroAssetId);
      if (asset) openChartModal(asset);
    });
  }

  // Convertisseur express Forex & Crypto
  if (convInput) {
    convInput.addEventListener('input', updateQuickConverter);
  }

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
      renderHeroSpotlight(currentHeroAssetId);
      renderMarketBarometer();
      renderMarketMovers();
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
      renderMarketMovers();

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
