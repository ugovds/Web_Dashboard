/**
 * weather.js - Widget météo complet intégré dans le Deck (wttr.in)
 * - Météo en direct, conditions, ressenti, vent, humidité, UV, pression, visibilité
 * - Prévisions complètes sur 3 jours
 * - Recherche de ville et géolocalisation automatique
 * - Contrôle direct des effets météo d'arrière-plan (Canvas)
 */

let cachedWeatherData = null;

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

async function fetchWeather() {
  const city = getSavedCity();
  const queryUrl = city
    ? `https://wttr.in/${encodeURIComponent(city)}?format=j1`
    : 'https://wttr.in/?format=j1';

  const locEl = document.getElementById('deck-weather-loc');
  const tempEl = document.getElementById('deck-weather-temp');
  const descEl = document.getElementById('deck-weather-desc');
  const iconEl = document.getElementById('deck-weather-icon');
  const refreshBtn = document.getElementById('deck-weather-refresh-btn');

  if (refreshBtn) refreshBtn.querySelector('i')?.classList.add('fa-spin');
  if (descEl) descEl.textContent = 'Actualisation en cours...';

  try {
    const res = await fetch(queryUrl);
    if (!res.ok) throw new Error('Erreur météo');
    const data = await res.json();
    if (!data.current_condition || !data.current_condition[0]) {
      throw new Error('Données invalides');
    }

    cachedWeatherData = data;
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

  // Éléments du hero
  const tempEl = document.getElementById('deck-weather-temp');
  const descEl = document.getElementById('deck-weather-desc');
  const locEl = document.getElementById('deck-weather-loc');
  const iconEl = document.getElementById('deck-weather-icon');
  const updatedEl = document.getElementById('deck-weather-updated');
  const inputEl = document.getElementById('deck-city-input');

  if (tempEl) tempEl.textContent = `${current.temp_C}°C`;
  if (descEl) descEl.textContent = frDesc;
  if (locEl) locEl.textContent = fullLoc;
  if (iconEl) iconEl.className = iconCls;
  if (inputEl && !inputEl.value) inputEl.value = getSavedCity();

  if (updatedEl) {
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    updatedEl.textContent = `Mis à jour à ${timeStr}`;
  }

  // Métriques
  const feelsEl = document.getElementById('deck-weather-feels');
  const humidityEl = document.getElementById('deck-weather-humidity');
  const windEl = document.getElementById('deck-weather-wind');
  const uvEl = document.getElementById('deck-weather-uv');
  const pressureEl = document.getElementById('deck-weather-pressure');
  const visibilityEl = document.getElementById('deck-weather-visibility');

  if (feelsEl) feelsEl.textContent = `${current.FeelsLikeC}°C`;
  if (humidityEl) humidityEl.textContent = `${current.humidity}%`;
  if (windEl) windEl.textContent = `${current.windspeedKmph} km/h (${current.winddir16Point || ''})`;
  if (uvEl) uvEl.textContent = `${current.uvIndex || '0'} / 10`;
  if (pressureEl) pressureEl.textContent = `${current.pressure || '1015'} hPa`;
  if (visibilityEl) visibilityEl.textContent = `${current.visibility || '10'} km`;

  // Prévisions 3 jours
  const forecastList = document.getElementById('deck-weather-forecast-list');
  if (forecastList && data.weather && Array.isArray(data.weather)) {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const todayStr = new Date().toISOString().slice(0, 10);

    forecastList.innerHTML = data.weather
      .slice(0, 3)
      .map((w, idx) => {
        const parts = w.date.split('-').map(Number);
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        let dayLabel = days[dateObj.getDay()];
        if (w.date === todayStr || idx === 0) dayLabel = 'Aujourd\'hui';
        else if (idx === 1) dayLabel = 'Demain';

        const hourlyMid = w.hourly && (w.hourly[4] || w.hourly[0]);
        const dayDescRaw = hourlyMid?.weatherDesc?.[0]?.value || '';
        const dayDesc = translateWeatherDesc(dayDescRaw);
        const dayIcon = getWeatherIconClass(dayDescRaw);

        return `
          <div class="forecast-card">
            <span class="forecast-day">${dayLabel}</span>
            <i class="${dayIcon} forecast-icon"></i>
            <span class="forecast-temps">
              <span class="temp-max">${w.maxtempC}°</span>
              <span class="temp-sep">/</span>
              <span class="temp-min">${w.mintempC}°</span>
            </span>
            <span class="forecast-desc">${dayDesc}</span>
          </div>
        `;
      })
      .join('');
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

  renderWeatherFavorites();
  updateFavButtonState();
  fetchWeather();
  setInterval(fetchWeather, 1800000); // 30 minutes
}
