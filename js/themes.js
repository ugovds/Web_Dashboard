/**
 * themes.js - Gestion des 3 thèmes visuels et du système Ambilight
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
  }
};

let currentTheme = '1';

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

  const themeBtns = document.querySelectorAll('.theme-btn');
  themeBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.themeBtn === themeId);
  });

  localStorage.setItem('startpage_theme', themeId);

  if (typeof applyAppearance === 'function') {
    applyAppearance();
  }
}

function initThemes() {
  const saved = localStorage.getItem('startpage_theme') || '1';
  currentTheme = themesConfig[saved] ? saved : '1';

  const themeBtns = document.querySelectorAll('.theme-btn');
  themeBtns.forEach((btn) => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.themeBtn));
  });

  applyTheme(currentTheme);
}
