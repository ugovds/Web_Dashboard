/**
 * clock.js - Horloge numérique stylisée au centre de la barre supérieure
 */
function updateClock() {
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  if (!timeEl) return;

  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  timeEl.textContent = `${h}:${m}:${s}`;

  if (dateEl) {
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    const dateStr = now.toLocaleDateString('fr-FR', options);
    dateEl.textContent = dateStr;
  }
}

function initClock() {
  updateClock();
  setInterval(updateClock, 1000);
}
