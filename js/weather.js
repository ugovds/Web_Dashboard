/**
 * weather.js - Widget météo complet intégré dans le Deck (wttr.in)
 * - Météo en direct, conditions, ressenti, vent, humidité, UV, pression, visibilité
 * - Prévisions complètes sur 3 jours
 * - Recherche de ville et géolocalisation automatique
 * - Contrôle direct des effets météo d'arrière-plan (Canvas)
 */

let cachedWeatherData = null;

function getStoredWeatherCache() {
  try {
    const raw = localStorage.getItem('startpage_weather_cache');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredWeatherCache(data) {
  try {
    localStorage.setItem('startpage_weather_cache', JSON.stringify({ data, time: Date.now() }));
  } catch {}
}

const weatherDescFr = {
  'clear': 'Ciel dégagé',
  'sunny': 'Ensoleillé',
  'partly cloudy': 'Éclaircies',
  'cloudy': 'Nuageux',
  'overcast': 'Couvert',
  'mist': 'Brume',
  'fog': 'Brouillard',
  'light rain': 'Pluie légère',
  'moderate rain': 'Pluie modérée',
  'heavy rain': 'Forte pluie',
  'patchy rain nearby': 'Averses éparses',
  'patchy rain possible': 'Risque d\'averses',
  'light drizzle': 'Bruine légère',
  'drizzle': 'Bruine',
  'thunderstorm': 'Orage',
  'thundery outbreaks possible': 'Orages possibles',
  'light snow': 'Neige légère',
  'moderate snow': 'Neige modérée',
  'heavy snow': 'Forte neige',
  'sleet': 'Grésil',
  'blizzard': 'Blizzard'
};

const WMO_CODES = {
  0: { desc: 'Ciel dégagé', icon: 'fa-solid fa-sun' },
  1: { desc: 'Principalement dégagé', icon: 'fa-solid fa-sun' },
  2: { desc: 'Éclaircies', icon: 'fa-solid fa-cloud-sun' },
  3: { desc: 'Couvert', icon: 'fa-solid fa-cloud' },
  45: { desc: 'Brouillard', icon: 'fa-solid fa-smog' },
  48: { desc: 'Brouillard givrant', icon: 'fa-solid fa-smog' },
  51: { desc: 'Bruine légère', icon: 'fa-solid fa-cloud-rain' },
  53: { desc: 'Bruine modérée', icon: 'fa-solid fa-cloud-rain' },
  55: { desc: 'Bruine dense', icon: 'fa-solid fa-cloud-showers-heavy' },
  56: { desc: 'Bruine verglaçante', icon: 'fa-solid fa-snowflake' },
  57: { desc: 'Forte bruine verglaçante', icon: 'fa-solid fa-snowflake' },
  61: { desc: 'Pluie faible', icon: 'fa-solid fa-cloud-rain' },
  63: { desc: 'Pluie modérée', icon: 'fa-solid fa-cloud-rain' },
  65: { desc: 'Forte pluie', icon: 'fa-solid fa-cloud-showers-heavy' },
  66: { desc: 'Pluie verglaçante', icon: 'fa-solid fa-snowflake' },
  67: { desc: 'Forte pluie verglaçante', icon: 'fa-solid fa-snowflake' },
  71: { desc: 'Chutes de neige légères', icon: 'fa-solid fa-snowflake' },
  73: { desc: 'Chutes de neige modérées', icon: 'fa-solid fa-snowflake' },
  75: { desc: 'Fortes chutes de neige', icon: 'fa-solid fa-snowflake' },
  77: { desc: 'Grains de neige', icon: 'fa-solid fa-snowflake' },
  80: { desc: 'Averses légères', icon: 'fa-solid fa-cloud-rain' },
  81: { desc: 'Averses modérées', icon: 'fa-solid fa-cloud-rain' },
  82: { desc: 'Violentes averses', icon: 'fa-solid fa-cloud-showers-heavy' },
  85: { desc: 'Averses de neige', icon: 'fa-solid fa-snowflake' },
  86: { desc: 'Fortes averses de neige', icon: 'fa-solid fa-snowflake' },
  95: { desc: 'Orage', icon: 'fa-solid fa-cloud-bolt' },
  96: { desc: 'Orage et grêle', icon: 'fa-solid fa-cloud-bolt' },
  99: { desc: 'Violent orage de grêle', icon: 'fa-solid fa-cloud-bolt' }
};

function getWmoInfo(code) {
  return WMO_CODES[code] || { desc: 'Partiellement nuageux', icon: 'fa-solid fa-cloud' };
}

function translateWeatherDesc(desc) {
  if (!desc) return '';
  const clean = desc.trim().toLowerCase();
  for (const [en, fr] of Object.entries(weatherDescFr)) {
    if (clean.includes(en)) return fr;
  }
  return desc.trim();
}

function getWeatherIconClass(desc) {
  if (!desc) return 'fa-solid fa-cloud';
  const d = desc.toLowerCase();
  if (d.includes('thunder') || d.includes('storm') || d.includes('orage')) {
    return 'fa-solid fa-cloud-bolt';
  } else if (d.includes('rain') || d.includes('drizzle') || d.includes('shower') || d.includes('pluie')) {
    return 'fa-solid fa-cloud-rain';
  } else if (d.includes('snow') || d.includes('ice') || d.includes('flurry') || d.includes('neige')) {
    return 'fa-solid fa-snowflake';
  } else if (d.includes('fog') || d.includes('mist') || d.includes('brume') || d.includes('brouillard')) {
    return 'fa-solid fa-smog';
  } else if (d.includes('clear') || d.includes('sun') || d.includes('ensoleillé')) {
    return 'fa-solid fa-sun';
  } else if (d.includes('partly cloudy') || d.includes('éclaircies')) {
    return 'fa-solid fa-cloud-sun';
  }
  return 'fa-solid fa-cloud';
}

function getSavedCity() {
  return (localStorage.getItem('startpage_weather_city') || '').trim();
}

function setSavedCity(city) {
  if (city) {
    localStorage.setItem('startpage_weather_city', city.trim());
  } else {
    localStorage.removeItem('startpage_weather_city');
  }
  updateFavButtonState();
  renderWeatherFavorites();
}

function getWeatherFavorites() {
  try {
    const saved = localStorage.getItem('startpage_weather_favorites');
    if (saved) return JSON.parse(saved);
  } catch {}
  return ['Paris', 'Tokyo', 'New York'];
}

function saveWeatherFavorites(favs) {
  localStorage.setItem('startpage_weather_favorites', JSON.stringify(favs));
  renderWeatherFavorites();
  updateFavButtonState();
}

function renderWeatherFavorites() {
  const container = document.getElementById('weather-favorites-bar');
  if (!container) return;

  const favs = getWeatherFavorites();
  const currentCity = getSavedCity().toLowerCase();

  if (favs.length === 0) {
    container.innerHTML = `<span class="fav-empty-hint">Aucun favori enregistré (étoile ci-dessus).</span>`;
    return;
  }

  container.innerHTML = favs
    .map((city) => {
      const isSelected = currentCity && city.toLowerCase() === currentCity;
      return `
        <div class="weather-fav-chip ${isSelected ? 'active' : ''}" data-fav-city="${escapeHtml(city)}">
          <span class="fav-chip-name">${escapeHtml(city)}</span>
          <button type="button" class="fav-chip-remove" data-remove-fav="${escapeHtml(city)}" title="Retirer ${escapeHtml(city)}">&times;</button>
        </div>
      `;
    })
    .join('');
}

function updateFavButtonState() {
  const favBtn = document.getElementById('deck-city-fav-btn');
  if (!favBtn) return;
  const currentCity = getSavedCity().trim();
  const favs = getWeatherFavorites();
  const isFav = currentCity && favs.some((c) => c.toLowerCase() === currentCity.toLowerCase());

  const icon = favBtn.querySelector('i');
  if (icon) {
    icon.className = isFav ? 'fa-solid fa-star fav-active' : 'fa-regular fa-star';
  }
  favBtn.title = isFav ? `Retirer "${currentCity}" des favoris` : `Ajouter "${currentCity || 'cette ville'}" aux favoris`;
}

function degreesToCompass(deg) {
  if (deg === undefined || deg === null) return 'N';
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(deg / 22.5) % 16;
  return dirs[idx];
}

async function fetchOpenMeteo(city) {
  let locInfo = null;
  if (city) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) return null;
    const geoData = await geoRes.json();
    if (!geoData.results || !geoData.results.length) return null;
    const first = geoData.results[0];
    locInfo = {
      name: first.name,
      country: first.country || '',
      latitude: first.latitude,
      longitude: first.longitude
    };
  } else {
    // Détection automatique basée sur l'adresse IP
    try {
      const wttrRes = await fetch('https://wttr.in/?format=j1');
      if (wttrRes.ok) {
        const wttrData = await wttrRes.json();
        const area = wttrData.nearest_area && wttrData.nearest_area[0];
        if (area) {
          locInfo = {
            name: area.areaName?.[0]?.value || 'Position locale',
            country: area.country?.[0]?.value || '',
            latitude: parseFloat(area.latitude) || 48.8566,
            longitude: parseFloat(area.longitude) || 2.3522
          };
        }
      }
    } catch {}
    if (!locInfo) {
      locInfo = { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 };
    }
  }

  // Requête Open-Meteo pour 7 jours complets + données horaires et instantanées
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${locInfo.latitude}&longitude=${locInfo.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunrise,sunset,uv_index_max&hourly=temperature_2m,precipitation_probability,precipitation,weathercode&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&timezone=auto&forecast_days=7`;
  const fRes = await fetch(forecastUrl);
  if (!fRes.ok) return null;
  const omData = await fRes.json();

  const current = omData.current || {};
  const daily = omData.daily || {};
  const hourly = omData.hourly || {};
  const wmo = getWmoInfo(current.weather_code);

  // Échantillonnage de 8 créneaux horaires sur les prochaines 24 heures (toutes les 3h)
  const nowIso = new Date().toISOString().slice(0, 13);
  let startIdx = 0;
  if (hourly.time && hourly.time.length) {
    const foundIdx = hourly.time.findIndex((t) => t.startsWith(nowIso));
    if (foundIdx !== -1) {
      startIdx = foundIdx;
    } else {
      const currentHour = new Date().getHours();
      startIdx = Math.min(hourly.time.length - 1, Math.max(0, currentHour));
    }
  }

  const sampleHourly = [];
  for (let i = 0; i < 8; i++) {
    const idx = Math.min(hourly.time.length - 1, startIdx + i * 3);
    const rawTime = hourly.time[idx] || '';
    const code = hourly.weathercode?.[idx] ?? 0;
    const hourWmo = getWmoInfo(code);
    sampleHourly.push({
      time: rawTime,
      tempC: Math.round(hourly.temperature_2m?.[idx] ?? current.temperature_2m ?? 0).toString(),
      chanceofrain: Math.round(hourly.precipitation_probability?.[idx] ?? 0).toString(),
      precipMM: (hourly.precipitation?.[idx] ?? 0).toString(),
      weatherDesc: [{ value: hourWmo.desc }],
      weatherIcon: hourWmo.icon
    });
  }

  // Formatage des 7 jours de prévisions
  const daysList = [];
  const numDays = (daily.time || []).length;
  for (let d = 0; d < numDays; d++) {
    const dateStr = daily.time[d];
    const code = daily.weathercode?.[d] ?? 0;
    const dayWmo = getWmoInfo(code);
    const maxT = Math.round(daily.temperature_2m_max?.[d] ?? 0).toString();
    const minT = Math.round(daily.temperature_2m_min?.[d] ?? 0).toString();
    const rainProb = Math.round(daily.precipitation_probability_max?.[d] ?? 0).toString();

    const sunriseIso = daily.sunrise?.[d] || '';
    const sunsetIso = daily.sunset?.[d] || '';
    const sunriseStr = sunriseIso.includes('T') ? sunriseIso.split('T')[1].slice(0, 5) : sunriseIso;
    const sunsetStr = sunsetIso.includes('T') ? sunsetIso.split('T')[1].slice(0, 5) : sunsetIso;

    daysList.push({
      date: dateStr,
      maxtempC: maxT,
      mintempC: minT,
      astronomy: [
        {
          sunrise: sunriseStr || '07:00',
          sunset: sunsetStr || '19:00'
        }
      ],
      hourly: [
        {
          time: '1200',
          tempC: maxT,
          chanceofrain: rainProb,
          precipMM: (daily.precipitation_sum?.[d] ?? 0).toString(),
          weatherDesc: [{ value: dayWmo.desc }],
          weatherIcon: dayWmo.icon
        }
      ]
    });
  }

  // Le jour d'aujourd'hui reçoit l'échantillon 24h pour le graphique
  if (daysList[0]) {
    daysList[0].hourly = sampleHourly;
  }

  return {
    source: 'open-meteo',
    current_condition: [
      {
        temp_C: Math.round(current.temperature_2m ?? 0).toString(),
        FeelsLikeC: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 0).toString(),
        humidity: Math.round(current.relative_humidity_2m ?? 50).toString(),
        windspeedKmph: Math.round(current.wind_speed_10m ?? 0).toString(),
        winddir16Point: degreesToCompass(current.wind_direction_10m),
        uvIndex: Math.round(daily.uv_index_max?.[0] ?? 0).toString(),
        pressure: Math.round(current.surface_pressure ?? 1013).toString(),
        visibility: '10',
        weatherDesc: [{ value: wmo.desc }],
        weatherIcon: wmo.icon,
        precipMM: (current.precipitation ?? 0).toString()
      }
    ],
    nearest_area: [
      {
        areaName: [{ value: locInfo.name || 'Position locale' }],
        country: [{ value: locInfo.country || '' }],
        latitude: String(locInfo.latitude || '48.8566'),
        longitude: String(locInfo.longitude || '2.3522')
      }
    ],
    weather: daysList
  };
}

async function fetchWttrIn(city) {
  const queryUrl = city
    ? `https://wttr.in/${encodeURIComponent(city)}?format=j1`
    : 'https://wttr.in/?format=j1';
  const res = await fetch(queryUrl);
  if (!res.ok) throw new Error('Erreur wttr.in');
  return await res.json();
}

async function fetchWeather() {
  const city = getSavedCity();

  const locEl = document.getElementById('deck-weather-loc');
  const tempEl = document.getElementById('deck-weather-temp');
  const descEl = document.getElementById('deck-weather-desc');
  const iconEl = document.getElementById('deck-weather-icon');
  const refreshBtn = document.getElementById('deck-weather-refresh-btn');

  if (refreshBtn) refreshBtn.querySelector('i')?.classList.add('fa-spin');
  if (descEl) descEl.textContent = 'Actualisation en cours...';

  try {
    let data = null;
    try {
      data = await fetchOpenMeteo(city);
    } catch (e) {
      console.warn('Open-Meteo failed, trying wttr.in fallback:', e);
    }

    if (!data) {
      data = await fetchWttrIn(city);
    }

    if (!data || !data.current_condition || !data.current_condition[0]) {
      throw new Error('Données météo invalides');
    }

    cachedWeatherData = data;
    setStoredWeatherCache(data);
    renderWeatherDeckView(data);
    updateFavButtonState();
    renderWeatherFavorites();

    // Mettre à jour l'effet météo Canvas
    const rawDesc = data.current_condition[0].weatherDesc[0]?.value || '';
    if (typeof setWeatherFxCondition === 'function') {
      setWeatherFxCondition(rawDesc);
    }

    if (refreshBtn) {
      setTimeout(() => refreshBtn.querySelector('i')?.classList.remove('fa-spin'), 600);
    }
    return true;
  } catch (err) {
    if (descEl) descEl.textContent = 'Météo indisponible (hors-ligne)';
    if (tempEl) tempEl.textContent = '--°C';
    if (locEl) locEl.textContent = city || 'Position inconnue';
    if (iconEl) iconEl.className = 'fa-solid fa-triangle-exclamation';
    if (refreshBtn) {
      setTimeout(() => refreshBtn.querySelector('i')?.classList.remove('fa-spin'), 600);
    }
    return false;
  }
}

function renderWeatherDeckView(data) {
  if (!data || !data.current_condition || !data.current_condition[0]) return;

  const current = data.current_condition[0];
  const area = data.nearest_area && data.nearest_area[0];
  const areaName = area?.areaName?.[0]?.value || getSavedCity() || 'Position Locale';
  const country = area?.country?.[0]?.value || '';
  const fullLoc = country ? `${areaName}, ${country}` : areaName;

  const rawDesc = current.weatherDesc[0]?.value || '';
  const frDesc = translateWeatherDesc(rawDesc);
  const iconCls = getWeatherIconClass(rawDesc);
  const todayWeather = data.weather && data.weather[0];

  // Éléments du hero Samsung
  const tempEl = document.getElementById('deck-weather-temp');
  const descEl = document.getElementById('deck-weather-desc');
  const locEl = document.getElementById('deck-weather-loc');
  const iconEl = document.getElementById('deck-weather-icon');
  const updatedEl = document.getElementById('deck-weather-updated');
  const inputEl = document.getElementById('deck-city-input');
  const highLowEl = document.getElementById('deck-weather-highlow');
  const feelsHeroEl = document.getElementById('deck-weather-feels-hero');

  if (tempEl) tempEl.textContent = `${current.temp_C}°`;
  if (descEl) descEl.textContent = frDesc;
  if (locEl) locEl.textContent = fullLoc;
  if (iconEl) iconEl.className = iconCls;
  if (inputEl && !inputEl.value) inputEl.value = getSavedCity();

  if (todayWeather && highLowEl) {
    const maxT = todayWeather.maxtempC || current.temp_C;
    const minT = todayWeather.mintempC || current.temp_C;
    highLowEl.innerHTML = `↑ ${maxT}° / ↓ ${minT}° • Ressenti <strong id="deck-weather-feels-hero">${current.FeelsLikeC}°</strong>`;
  } else if (feelsHeroEl) {
    feelsHeroEl.textContent = `${current.FeelsLikeC}°`;
  }

  const topbarWeatherText = document.getElementById('topbar-weather-text');
  if (topbarWeatherText) topbarWeatherText.textContent = `${current.temp_C}°C • ${fullLoc.split(',')[0]}`;

  if (updatedEl) {
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    updatedEl.textContent = `Mis à jour à ${timeStr}`;
  }

  // Perspectives / Alerte Météo (Style Samsung)
  const insightText = document.getElementById('weather-insight-text');
  const hourlySummary = document.getElementById('weather-hourly-summary');
  if (todayWeather) {
    const maxT = todayWeather.maxtempC;
    const minT = todayWeather.mintempC;
    const hourlyRains = (todayWeather.hourly || []).map((h) => parseInt(h.chanceofrain, 10) || 0);
    const maxRainToday = Math.max(0, ...hourlyRains);
    let rainAdvice = ' Pas de fortes précipitations prévues aujourd\'hui.';
    if (maxRainToday > 60) {
      rainAdvice = ' Risque important d\'averses, prévoyez un parapluie.';
    } else if (maxRainToday > 30) {
      rainAdvice = ' Risque modéré de pluies ou d\'ondées passagères.';
    }
    if (insightText) {
      insightText.textContent = `${frDesc}. Maximales : ${maxT}°C, Minimales : ${minT}°C.${rainAdvice}`;
    }
    if (hourlySummary) {
      hourlySummary.textContent = `Aujourd'hui : ${frDesc.toLowerCase()} avec des températures oscillant entre ${minT}°C et ${maxT}°C.`;
    }
  }

  // Métriques détaillées
  const feelsEl = document.getElementById('deck-weather-feels');
  const humidityEl = document.getElementById('deck-weather-humidity');
  const windEl = document.getElementById('deck-weather-wind');
  const uvEl = document.getElementById('deck-weather-uv');
  const pressureEl = document.getElementById('deck-weather-pressure');
  const visibilityEl = document.getElementById('deck-weather-visibility');

  if (feelsEl) feelsEl.textContent = `${current.FeelsLikeC}°C`;
  if (humidityEl) humidityEl.textContent = `${current.humidity}%`;
  if (windEl) windEl.textContent = `${current.windspeedKmph} km/h (${current.winddir16Point || ''})`;

  const uvVal = parseInt(current.uvIndex, 10) || 0;
  let uvLabel = 'Faible';
  if (uvVal >= 8) uvLabel = 'Très Élevé';
  else if (uvVal >= 6) uvLabel = 'Élevé';
  else if (uvVal >= 3) uvLabel = 'Modéré';
  if (uvEl) uvEl.textContent = `${uvVal} / 10 (${uvLabel})`;

  if (pressureEl) pressureEl.textContent = `${current.pressure || '1015'} hPa`;
  if (visibilityEl) visibilityEl.textContent = `${current.visibility || '10'} km`;

  // Lever et Coucher du soleil
  const sunriseEl = document.getElementById('deck-weather-sunrise');
  const sunsetEl = document.getElementById('deck-weather-sunset');
  const astro = todayWeather?.astronomy?.[0];
  if (astro) {
    if (sunriseEl) sunriseEl.innerHTML = `<i class="fa-regular fa-sun"></i> Lever : <strong>${astro.sunrise}</strong>`;
    if (sunsetEl) sunsetEl.innerHTML = `<i class="fa-solid fa-moon"></i> Coucher : <strong>${astro.sunset}</strong>`;
  }

  // Prévisions Multi-Jours Samsung (avec jauges thermiques)
  const forecastList = document.getElementById('deck-weather-forecast-list');
  if (forecastList && data.weather && Array.isArray(data.weather)) {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const todayStr = new Date().toISOString().slice(0, 10);

    const allMin = Math.min(...data.weather.map((w) => parseInt(w.mintempC, 10)));
    const allMax = Math.max(...data.weather.map((w) => parseInt(w.maxtempC, 10)));
    const totalSpan = Math.max(1, allMax - allMin);

    forecastList.innerHTML = data.weather.map((w, idx) => {
      const parts = w.date.split('-').map(Number);
      const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
      let dayLabel = days[dateObj.getDay()];
      if (w.date === todayStr || idx === 0) dayLabel = 'Aujourd\'hui';
      else if (idx === 1) dayLabel = 'Demain';

      const hourlyMid = w.hourly && (w.hourly[4] || w.hourly[0]);
      const dayDescRaw = hourlyMid?.weatherDesc?.[0]?.value || '';
      const dayDesc = translateWeatherDesc(dayDescRaw);
      const dayIcon = hourlyMid?.weatherIcon || getWeatherIconClass(dayDescRaw);

      const maxRain = Math.max(0, ...((w.hourly || []).map((h) => parseInt(h.chanceofrain, 10) || 0)));
      const rainHtml = maxRain > 15 ? `<span class="multiday-rain-badge"><i class="fa-solid fa-droplet"></i> ${maxRain}%</span>` : '';

      const minT = parseInt(w.mintempC, 10);
      const maxT = parseInt(w.maxtempC, 10);
      const leftPct = Math.max(0, Math.min(80, ((minT - allMin) / totalSpan) * 100));
      const widthPct = Math.max(12, Math.min(100 - leftPct, ((maxT - minT) / totalSpan) * 100));

      return `
        <div class="multiday-row" title="${dayLabel} : ${dayDesc}, Min ${minT}°C / Max ${maxT}°C">
          <div class="multiday-day-info">
            <span class="multiday-name">${dayLabel}</span>
            ${rainHtml}
          </div>
          <div class="multiday-icon-box">
            <i class="${dayIcon}"></i>
          </div>
          <div class="multiday-slider-wrap">
            <span class="multiday-min-temp">${minT}°</span>
            <div class="multiday-range-track">
              <div class="multiday-range-fill" style="margin-left: ${leftPct.toFixed(1)}%; width: ${widthPct.toFixed(1)}%;"></div>
            </div>
            <span class="multiday-max-temp">${maxT}°</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Graphique interactif des températures et barres de pluie (24h)
  renderWeatherHourlyGraph(data);

  // Mise à jour de l'URL du radar satellite RainViewer
  updateWeatherRadar(area);

  // Hook vers le tableau de bord d'accueil
  if (typeof renderDashboardWeather === 'function') {
    renderDashboardWeather(data);
  }
}

/**
 * Construit la courbe de Bézier et les barres de précipitations Samsung 24h
 */
function renderWeatherHourlyGraph(data) {
  const lineEl = document.getElementById('weather-graph-line');
  const areaEl = document.getElementById('weather-graph-area');
  const chipsRow = document.getElementById('weather-hourly-chips-row');
  const chartSummary = document.getElementById('weather-chart-summary');
  const precipRow = document.getElementById('weather-precip-bars-row');

  if (!data?.weather?.[0]?.hourly) return;
  const hourly = data.weather[0].hourly;

  const temps = hourly.map((h) => parseInt(h.tempC, 10));
  const minTemp = Math.min(...temps) - 1;
  const maxTemp = Math.max(...temps) + 1;
  const tempRange = Math.max(1, maxTemp - minTemp);

  const svgW = 1000;
  const svgH = 130;
  const padX = 45;
  const padY = 24;
  const usableW = svgW - padX * 2;
  const usableH = svgH - padY * 2;

  const points = hourly.map((h, i) => {
    const x = padX + i * (usableW / (hourly.length - 1));
    const t = parseInt(h.tempC, 10);
    const y = padY + (1 - (t - minTemp) / tempRange) * usableH;
    return {
      x,
      y,
      temp: t,
      hour: h.time,
      rain: parseInt(h.chanceofrain, 10) || 0,
      precip: parseFloat(h.precipMM) || 0,
      desc: h.weatherDesc?.[0]?.value || '',
      icon: h.weatherIcon
    };
  });

  // Construction de la courbe SVG lissée (Bézier spline)
  let linePath = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cX = (prev.x + curr.x) / 2;
    linePath += ` C ${cX.toFixed(1)} ${prev.y.toFixed(1)}, ${cX.toFixed(1)} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${svgH} L ${points[0].x.toFixed(1)} ${svgH} Z`;

  if (lineEl) lineEl.setAttribute('d', linePath);
  if (areaEl) areaEl.setAttribute('d', areaPath);

  if (chartSummary) {
    const minT = Math.min(...temps);
    const maxT = Math.max(...temps);
    chartSummary.textContent = `Min ${minT}°C • Max ${maxT}°C`;
  }

  // Carrousel horizontal Samsung avec heure, icône, température et probabilité de pluie
  if (chipsRow) {
    const formatHour = (rawTime, idx) => {
      if (idx === 0) return 'Maintenant';
      if (typeof rawTime === 'string') {
        if (rawTime.includes('T')) return rawTime.split('T')[1].slice(0, 5);
        if (rawTime.includes(':')) return rawTime.slice(0, 5);
      }
      const h = Math.floor(parseInt(rawTime, 10) / 100);
      return `${String(h).padStart(2, '0')}:00`;
    };

    chipsRow.innerHTML = points.map((p, idx) => {
      const iconCls = p.icon || getWeatherIconClass(p.desc);
      const rainHtml = p.rain > 10
        ? `<span class="hour-rain-drop"><i class="fa-solid fa-droplet"></i> ${p.rain}%</span>`
        : '<span class="hour-rain-drop" style="opacity:0;">--</span>';
      return `
        <div class="samsung-hour-cell" title="${formatHour(p.hour, idx)} : ${p.temp}°C, Pluie ${p.rain}%, ${p.desc}">
          <span class="hour-time-label">${formatHour(p.hour, idx)}</span>
          <div class="hour-icon"><i class="${iconCls}"></i></div>
          <span class="hour-temp-val">${p.temp}°</span>
          ${rainHtml}
        </div>
      `;
    }).join('');
  }

  // Barres de précipitations Samsung en mm
  if (precipRow) {
    const precips = points.map((p) => p.precip);
    const maxPrecip = Math.max(1.5, ...precips); // minimum 1.5mm pour que l'échelle soit jolie

    precipRow.innerHTML = points.map((p) => {
      const heightPct = Math.min(100, Math.max(4, (p.precip / maxPrecip) * 100));
      return `
        <div class="precip-bar-col" title="${p.precip.toFixed(2)} mm de précipitations">
          <div class="precip-bar-fill" style="height: ${heightPct.toFixed(0)}%;"></div>
          <span class="precip-val-label">${p.precip > 0 ? p.precip.toFixed(1) : '0.0'} mm</span>
        </div>
      `;
    }).join('');
  }
}

/**
 * Configure le radar précipitations satellite en direct (RainViewer)
 */
function updateWeatherRadar(area) {
  const radarIframe = document.getElementById('weather-radar-iframe');
  if (!radarIframe) return;

  const lat = area?.latitude || '48.8566';
  const lon = area?.longitude || '2.3522';
  // RainViewer Map Embed libre et sans clé API
  const radarUrl = `https://www.rainviewer.com/map.html?loc=${lat},${lon},8&oFa=0&oC=1&oU=0&oRev=0&oA=1&oD=0&oF=0&oAP=1&rmt=4&layer=radar&sm=1&sn=1`;
  if (radarIframe.getAttribute('data-loaded-src') !== radarUrl) {
    radarIframe.setAttribute('data-loaded-src', radarUrl);
    radarIframe.src = radarUrl;
  }
}

function initWeather() {
  const cityInput = document.getElementById('deck-city-input');
  const searchBtn = document.getElementById('deck-city-search-btn');
  const autoLocBtn = document.getElementById('deck-city-gps-btn');
  const favBtn = document.getElementById('deck-city-fav-btn');
  const refreshBtn = document.getElementById('deck-weather-refresh-btn');
  const fxToggle = document.getElementById('deck-weather-fx-toggle');
  const favoritesBar = document.getElementById('weather-favorites-bar');

  const executeSearch = async (overrideCity) => {
    const val = typeof overrideCity === 'string' ? overrideCity.trim() : (cityInput ? cityInput.value : '').trim();
    if (cityInput && typeof overrideCity === 'string') {
      cityInput.value = overrideCity;
    }
    if (!val) {
      setSavedCity('');
      await fetchWeather();
      if (typeof showToast === 'function') showToast('Météo : Détection automatique', 'info');
      return;
    }
    setSavedCity(val);
    const ok = await fetchWeather();
    if (ok) {
      if (typeof showToast === 'function') showToast(`Météo mise à jour pour ${val}`, 'success');
    } else {
      if (typeof showToast === 'function') showToast(`Impossible de trouver la ville "${val}"`, 'error');
    }
  };

  if (searchBtn) searchBtn.addEventListener('click', () => executeSearch());
  if (cityInput) {
    cityInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSearch();
      }
    });
  }

  // Toggle de ville favorite (Étoile)
  if (favBtn) {
    favBtn.addEventListener('click', () => {
      const currentCity = getSavedCity().trim();
      if (!currentCity) {
        if (typeof showToast === 'function') showToast('Recherchez d\'abord une ville à ajouter aux favoris', 'info');
        return;
      }
      let favs = getWeatherFavorites();
      const existingIdx = favs.findIndex((c) => c.toLowerCase() === currentCity.toLowerCase());
      if (existingIdx !== -1) {
        favs.splice(existingIdx, 1);
        saveWeatherFavorites(favs);
        if (typeof showToast === 'function') showToast(`"${currentCity}" retirée des favoris`, 'info');
      } else {
        if (favs.length >= 6) {
          favs.shift(); // Max 6 favoris
        }
        favs.push(currentCity);
        saveWeatherFavorites(favs);
        if (typeof showToast === 'function') showToast(`"${currentCity}" ajoutée aux favoris`, 'success');
      }
    });
  }

  // Clic sur un chip favori ou sur la croix de suppression
  if (favoritesBar) {
    favoritesBar.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-remove-fav]');
      if (removeBtn) {
        e.stopPropagation();
        const cityToRemove = removeBtn.dataset.removeFav;
        let favs = getWeatherFavorites().filter((c) => c.toLowerCase() !== cityToRemove.toLowerCase());
        saveWeatherFavorites(favs);
        if (typeof showToast === 'function') showToast(`"${cityToRemove}" supprimée`, 'info');
        return;
      }

      const chip = e.target.closest('[data-fav-city]');
      if (chip) {
        const city = chip.dataset.favCity;
        executeSearch(city);
      }
    });
  }

  if (autoLocBtn) {
    autoLocBtn.addEventListener('click', async () => {
      setSavedCity('');
      if (cityInput) cityInput.value = '';
      await fetchWeather();
      if (typeof showToast === 'function') showToast('Météo : Détection automatique par IP', 'info');
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      await fetchWeather();
      if (typeof showToast === 'function') showToast('Données météo actualisées', 'info');
    });
  }

  if (fxToggle) {
    const savedFx = localStorage.getItem('startpage_weather_fx');
    fxToggle.checked = savedFx !== 'false';
    fxToggle.addEventListener('change', () => {
      if (typeof toggleWeatherFx === 'function') {
        toggleWeatherFx(fxToggle.checked);
      }
    });
  }

  // Le radar satellite est désormais intégré directement dans le flux principal
  const radarPanel = document.getElementById('weather-radar-panel');
  if (radarPanel) {
    radarPanel.hidden = false;
  }

  renderWeatherFavorites();
  updateFavButtonState();

  // Hydratation synchrone immédiate depuis le cache local (0 ms de latence)
  const cacheEntry = getStoredWeatherCache();
  if (cacheEntry && cacheEntry.data) {
    cachedWeatherData = cacheEntry.data;
    renderWeatherDeckView(cacheEntry.data);
  }

  // Revalidation réseau si le cache est absent ou périmé (> 30 min)
  const isExpired = !cacheEntry || (Date.now() - (cacheEntry.time || 0) > 1800000);
  if (isExpired) {
    fetchWeather();
  }
  setInterval(fetchWeather, 1800000); // 30 minutes
}
