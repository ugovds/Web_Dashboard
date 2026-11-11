/**
 * themes.js - Gestion des 4 thèmes visuels et du système Ambilight
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
  }
};

let currentTheme = '4';

function applyTheme(themeId) {
  const cfg = themesConfig[themeId];
  if (!cfg) return;

  currentTheme = themeId;
  document.body.setAttribute('data-theme', themeId);

  const mainArtImg = document.getElementById('main-art');
  const bgWallpaperEl = document.getElementById('bg-wallpaper');
  const artBadgeText = document.getElementById('art-badge-text');

  if (mainArtImg) mainArtImg.src = cfg.img;
  if (bgWallpaperEl) bgWallpaperEl.style.backgroundImage = `url("${cfg.img}")`;
  if (artBadgeText) artBadgeText.textContent = cfg.badge;

  const topbarThemeText = document.getElementById('topbar-theme-text');
  if (topbarThemeText) topbarThemeText.textContent = cfg.name || cfg.badge.replace(/^.*?\/\/\s*/, '');

  const themeBtns = document.querySelectorAll('.theme-btn');
  themeBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.themeBtn === themeId);
  });

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

  const themeBtns = document.querySelectorAll('.theme-btn');
  themeBtns.forEach((btn) => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.themeBtn));
  });

  applyTheme(currentTheme);
}
