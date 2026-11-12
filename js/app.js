/**
 * app.js - Point d'entrée principal de l'application & utilitaires globaux
 */

// Système global de notifications Toast
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Animation d'apparition
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  // Disparition automatique après 3.2s
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3200);
}

// Transition fluide depuis le squelette de préchargement vers la page réelle
function revealDashboardFromSkeleton() {
  const skeleton = document.getElementById('dashboard-skeleton-view');
  const realView = document.getElementById('dashboard-real-view');
  if (!skeleton || !realView) return;

  if (realView.classList.contains('is-loaded')) return;

  requestAnimationFrame(() => {
    skeleton.classList.add('is-fading-out');
    realView.classList.remove('is-loading');
    realView.classList.add('is-loaded');

    setTimeout(() => {
      skeleton.classList.add('is-hidden');
      skeleton.setAttribute('hidden', '');
    }, 460);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const loadStart = performance.now();

  // === PHASE 1 : CRITIQUE (Affichage immédiat de l'interface) ===
  if (typeof initThemes === 'function') initThemes();
  if (typeof initAppearance === 'function') initAppearance();
  if (typeof initBookmarks === 'function') initBookmarks();
  if (typeof initClock === 'function') initClock();
  if (typeof initTasks === 'function') initTasks();
  if (typeof initCalendar === 'function') initCalendar();
  if (typeof initSearch === 'function') initSearch();
  if (typeof loadWidgetSettings === 'function') loadWidgetSettings();
  if (typeof applyWidgetVisibility === 'function') applyWidgetVisibility();
  if (typeof initCustomHub === 'function') initCustomHub();
  if (typeof initShortcuts === 'function') initShortcuts();
  if (typeof initWidgets === 'function') initWidgets();
  if (typeof initOverviewDashboard === 'function') initOverviewDashboard();

  // Déclencher la transition fluide du squelette vers le contenu réel
  // avec un délai minimal perçu (~240ms) pour garantir une transition soyeuse
  const elapsed = performance.now() - loadStart;
  const minSkeletonDisplayMs = Math.max(0, 240 - elapsed);
  setTimeout(revealDashboardFromSkeleton, minSkeletonDisplayMs);

  // Sécurité anti-blocage au cas où un script externe tarderait
  setTimeout(revealDashboardFromSkeleton, 1200);

  // === PHASE 2 : DIFFÉRÉE (Tâches secondaires libérant le thread) ===
  const deferNonCritical = () => {
    if (typeof initMarkets === 'function') initMarkets();
    if (typeof initWeather === 'function') initWeather();
    if (typeof initWeatherFx === 'function') initWeatherFx();
    if (typeof initFeeds === 'function') initFeeds();
    if (typeof initCommandPalette === 'function') initCommandPalette();

    // Enregistrement du Service Worker pour le mode hors-ligne PWA
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(deferNonCritical, { timeout: 800 });
  } else {
    setTimeout(deferNonCritical, 50);
  }
});
