/**
 * app.js - Point d'entrée principal de l'application & utilitaires globaux
 * Cyberdeck - Page de Raccourcis & Favoris Web
 */

// Utilitaire global d'échappement HTML sécurisé
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}
window.escapeHtml = escapeHtml;

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
window.showToast = showToast;

/**
 * ========================================================
 * PageSkeletonManager - GESTIONNAIRE UNIVERSEL DE PRÉCHARGEMENT
 * ========================================================
 * Élimine TOUT décalage ou élément tardif.
 * Chaque page s'affiche en squelette puis se révèle d'un seul bloc.
 */
const PageSkeletonManager = {
  activeTransitions: new Map(),
  revealedViews: new Set(),

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
      }, 120);

      this.activeTransitions.set(viewKey, timeoutId);
    });
  },

  prepareAndRevealView(viewKey, onRender, minDelayMs = 0) {
    const skeleton = document.getElementById(`${viewKey}-skeleton-view`);
    const realView = document.getElementById(`${viewKey}-real-view`);

    if (!skeleton || !realView) {
      if (typeof onRender === 'function') {
        try { onRender(); } catch (err) { console.warn(`Render error on ${viewKey}:`, err); }
      }
      return;
    }

    if (typeof onRender === 'function') {
      try {
        onRender();
      } catch (err) {
        console.warn(`Render error on ${viewKey}:`, err);
      }
    }

    if (minDelayMs > 0) {
      const timerId = setTimeout(() => {
        this.revealView(viewKey);
      }, minDelayMs);
      this.activeTransitions.set(viewKey, timerId);
    } else {
      this.revealView(viewKey);
    }
  }
};

window.PageSkeletonManager = PageSkeletonManager;

function revealBookmarksFromSkeleton() {
  PageSkeletonManager.revealView('bookmarks');
}
window.revealBookmarksFromSkeleton = revealBookmarksFromSkeleton;
window.revealDashboardFromSkeleton = revealBookmarksFromSkeleton;

document.addEventListener('DOMContentLoaded', () => {
  const safeInit = (fn, name) => {
    if (typeof fn === 'function') {
      try {
        fn();
      } catch (err) {
        console.error(`[Startpage] Error during ${name}:`, err);
      }
    }
  };

  // === INITIALISATION CRITIQUE & SYNCHRONE ===
  safeInit(initThemes, 'initThemes');
  safeInit(initAppearance, 'initAppearance');
  safeInit(initBookmarks, 'initBookmarks');
  safeInit(initSearch, 'initSearch');
  safeInit(initCustomHub, 'initCustomHub');
  safeInit(initShortcuts, 'initShortcuts');

  // Révélation immédiate de la vue des raccourcis
  const activeBtn = document.querySelector('.deck-nav-btn.active');
  const initialViewKey = activeBtn?.dataset?.deckView || 'bookmarks';
  requestAnimationFrame(() => {
    PageSkeletonManager.revealView(initialViewKey);
  });

  // === TÂCHES DIFFÉRÉES ===
  const deferNonCritical = () => {
    safeInit(initCommandPalette, 'initCommandPalette');

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
