/**
 * app.js - Point d'entrée principal de l'application & utilitaires globaux
 * Violet Startpage - Cockpit Haute Performance
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

/**
 * ========================================================
 * PageSkeletonManager - GESTIONNAIRE UNIVERSEL DE PRÉCHARGEMENT
 * ========================================================
 * Élimine TOUT décalage ou élément tardif (pop-in à 400ms).
 * Chaque page s'affiche en squelette puis se révèle d'un seul bloc.
 */
const PageSkeletonManager = {
  activeTransitions: new Map(),
  revealedViews: new Set(),

  // Réaffiche le squelette et masque le contenu réel pendant la préparation
  showSkeleton(viewKey) {
    const skeleton = document.getElementById(`${viewKey}-skeleton-view`);
    const realView = document.getElementById(`${viewKey}-real-view`);
    if (!skeleton || !realView) return;

    if (this.activeTransitions.has(viewKey)) {
      clearTimeout(this.activeTransitions.get(viewKey));
      this.activeTransitions.delete(viewKey);
    }

    skeleton.classList.remove('is-hidden', 'is-fading-out');
    skeleton.removeAttribute('hidden');
    realView.classList.remove('is-loaded');
    realView.classList.add('is-loading');
  },

  // Révèle une vue depuis son squelette de manière synchronisée
  revealView(viewKey, callback) {
    const skeleton = document.getElementById(`${viewKey}-skeleton-view`);
    const realView = document.getElementById(`${viewKey}-real-view`);
    if (!skeleton || !realView) {
      if (typeof callback === 'function') callback();
      return;
    }

    if (this.activeTransitions.has(viewKey)) {
      clearTimeout(this.activeTransitions.get(viewKey));
      this.activeTransitions.delete(viewKey);
    }

    requestAnimationFrame(() => {
      skeleton.classList.add('is-fading-out');
      realView.classList.remove('is-loading');
      realView.classList.add('is-loaded');
      this.revealedViews.add(viewKey);

      const timeoutId = setTimeout(() => {
        skeleton.classList.add('is-hidden');
        skeleton.setAttribute('hidden', '');
        if (typeof callback === 'function') callback();
      }, 380);

      this.activeTransitions.set(viewKey, timeoutId);
    });
  },

  // Prépare le rendu sous le squelette puis révèle la vue complète d'un coup
  prepareAndRevealView(viewKey, onRender, minDelayMs = 240) {
    const skeleton = document.getElementById(`${viewKey}-skeleton-view`);
    const realView = document.getElementById(`${viewKey}-real-view`);

    if (!skeleton || !realView) {
      if (typeof onRender === 'function') {
        try { onRender(); } catch (err) { console.warn(`Render error on ${viewKey}:`, err); }
      }
      return;
    }

    // Afficher le squelette immédiatement
    this.showSkeleton(viewKey);

    const t0 = performance.now();

    // Rendu hors-champ pendant que le squelette est visible
    if (typeof onRender === 'function') {
      try {
        onRender();
      } catch (err) {
        console.warn(`Render error on ${viewKey}:`, err);
      }
    }

    // Ajustement de la temporisation pour garantir une transition fluide et soyeuse
    const elapsed = performance.now() - t0;
    const remainingDelay = Math.max(0, minDelayMs - elapsed);

    const timerId = setTimeout(() => {
      this.revealView(viewKey);
    }, remainingDelay);

    this.activeTransitions.set(viewKey, timerId);
  }
};

window.PageSkeletonManager = PageSkeletonManager;

// Rétrocompatibilité avec les scripts appelant revealDashboardFromSkeleton()
function revealDashboardFromSkeleton() {
  PageSkeletonManager.revealView('dashboard');
}
window.revealDashboardFromSkeleton = revealDashboardFromSkeleton;

document.addEventListener('DOMContentLoaded', () => {
  const loadStart = performance.now();

  // === PHASE 1 : CRITIQUE & SYNCHRONE (Hydratation complète des données locales) ===
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

  // Pré-initialisation synchrone des Marchés et de la Météo locale AVANT la révélation
  // afin que TOUS les éléments du Cockpit soient déjà calculés et affichés ensemble
  if (typeof initMarkets === 'function') initMarkets();
  if (typeof initWeather === 'function') initWeather();
  if (typeof initOverviewDashboard === 'function') initOverviewDashboard();

  // Révélation coordonnée de la vue initiale complète
  const activeBtn = document.querySelector('.deck-nav-btn.active');
  const initialViewKey = activeBtn?.dataset?.deckView || 'dashboard';

  const elapsed = performance.now() - loadStart;
  const minSkeletonDisplayMs = Math.max(0, 260 - elapsed);
  setTimeout(() => {
    PageSkeletonManager.revealView(initialViewKey);
  }, minSkeletonDisplayMs);

  // Sécurité anti-blocage
  setTimeout(() => {
    PageSkeletonManager.revealView(initialViewKey);
  }, 1200);

  // === PHASE 2 : DIFFÉRÉE (Tâches réseau d'arrière-plan sans impact sur le layout) ===
  const deferNonCritical = () => {
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
    setTimeout(deferNonCritical, 80);
  }
});
