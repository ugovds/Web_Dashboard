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

document.addEventListener('DOMContentLoaded', () => {
  // Initialisation des différents modules
  if (typeof initThemes === 'function') initThemes();
  if (typeof initAppearance === 'function') initAppearance();
  if (typeof initWeatherFx === 'function') initWeatherFx();
  if (typeof initBookmarks === 'function') initBookmarks();
  if (typeof initWidgets === 'function') initWidgets();
  if (typeof initClock === 'function') initClock();
  if (typeof initWeather === 'function') initWeather();
  if (typeof initTasks === 'function') initTasks();
  if (typeof initCalendar === 'function') initCalendar();
  if (typeof initSearch === 'function') initSearch();
  if (typeof initFeeds === 'function') initFeeds();
  if (typeof initShortcuts === 'function') initShortcuts();
});
