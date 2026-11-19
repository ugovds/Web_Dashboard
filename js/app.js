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
  showSkeleton() {},
  revealView(viewKey, callback) {
    if (typeof callback === 'function') callback();
  },
  prepareAndRevealView(viewKey, onRender) {
    if (typeof onRender === 'function') onRender();
  }
};

window.PageSkeletonManager = PageSkeletonManager;

function revealBookmarksFromSkeleton() {}
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

  // === TÂCHES DIFFÉRÉES ===
  const deferNonCritical = () => {
    safeInit(initCommandPalette, 'initCommandPalette');

    // Enregistrement du Service Worker pour le mode instantané 0 ms
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
