/**
 * themes.js - Gestion des 5 thèmes visuels (Kanagawa, Sakura, Cyberdeck, Retro Wave, Liquid Glass)
 * et du système Ambilight.
 */

const themesConfig = {
  '1': {
    name: 'Kanagawa',
    img: 'images/gif.gif',
    badge: '修理 // KANAGAWA',
    accent: '#a8e6f0'
  },
  '2': {
    name: 'Sakura',
    img: 'images/gif2.gif',
    badge: '桜 // SAKURA',
    accent: '#ff85c0'
  },
  '3': {
    name: 'Cyberdeck',
    img: 'images/gif3.gif',
    badge: '電脳 // CYBERDECK',
    accent: '#31e1f7'
  },
  '4': {
    name: 'Retro Wave',
    img: 'images/gif4.gif',
    badge: '浪裏 // RETRO WAVE',
    accent: '#e2ebf5'
  },
  '5': {
    name: 'Liquid Glass',
    img: 'images/glass.svg',
    badge: '水晶 // LIQUID GLASS',
    accent: '#ffffff'
  }
};

let currentTheme = '4';

function applyTheme(themeId) {
  const cfg = themesConfig[themeId];
  if (!cfg) return;

  currentTheme = themeId;
  document.body.setAttribute('data-theme', themeId);
  document.body.removeAttribute('data-glass-tint');

  const mainArtImg = document.getElementById('main-art');
  const bgWallpaperEl = document.getElementById('bg-wallpaper');
  const artBadgeText = document.getElementById('art-badge-text');

  if (mainArtImg) mainArtImg.src = cfg.img;
  if (bgWallpaperEl) bgWallpaperEl.style.backgroundImage = `url("${cfg.img}")`;

  if (artBadgeText) {
    artBadgeText.textContent = cfg.badge;
  }

  const topbarThemeText = document.getElementById('topbar-theme-text');
  if (topbarThemeText) {
    topbarThemeText.textContent = cfg.name;
  }

  // Mise à jour de la classe active sur tous les boutons de thème
  const hubThemeBtns = document.querySelectorAll('.hub-theme-card-btn');
  hubThemeBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.hubTheme === themeId);
  });

  localStorage.setItem('startpage_theme', themeId);

  if (typeof applyAppearance === 'function') {
    applyAppearance();
  }
}

function initThemes() {
  const urlParam = new URLSearchParams(window.location.search).get('theme');
  const saved = (urlParam && themesConfig[urlParam]) ? urlParam : (localStorage.getItem('startpage_theme') || '4');
  currentTheme = themesConfig[saved] ? saved : '1';

  // Attachement direct des écouteurs sur tous les boutons de thèmes du hub
  document.querySelectorAll('.hub-theme-card-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tId = btn.dataset.hubTheme;
      if (tId) {
        applyTheme(tId);
        if (typeof showToast === 'function') {
          showToast(`Thème appliqué : ${btn.title || tId}`, 'success');
        }
      }
    });
  });

  applyTheme(currentTheme);
}
