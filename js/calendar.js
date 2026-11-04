/**
 * calendar.js - Mini-calendrier synchronisé avec les échéances des tâches
 * - Affichage dynamique du mois et navigation rapide
 * - Badges du nombre de tâches directement sur les jours du calendrier
 * - Filtrage instantané au clic sur un jour pour voir les tâches associées
 */
let calDate = new Date();

function renderCalendar() {
  const calTitle = document.getElementById('cal-title');
  const calDaysContainer = document.getElementById('cal-days');
  if (!calTitle || !calDaysContainer) return;

  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const todayStr = toISODate(new Date());
  const selectedDate = typeof getSelectedDateFilter === 'function' ? getSelectedDateFilter() : null;

  const monthName = calDate.toLocaleDateString('fr-FR', {
    month: 'short',
    year: 'numeric'
  });
  calTitle.textContent = monthName;

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = (firstDayOfMonth + 6) % 7; // Lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const taskDatesMap = typeof getTaskDatesMap === 'function' ? getTaskDatesMap() : {};

  let html = '';
  for (let i = 0; i < startOffset; i++) {
    html += `<span class="cal-day empty"></span>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = iso === todayStr;
    const isSelected = iso === selectedDate;
    const stats = taskDatesMap[iso];

    let classes = 'cal-day';
    if (isToday) classes += ' today';
    if (isSelected) classes += ' selected';
    if (stats) {
      classes += stats.pending > 0 ? ' has-pending' : ' has-done';
    }

    const totalTasks = stats ? (stats.pending + stats.done) : 0;
    const badgeHtml = totalTasks > 0
      ? `<span class="cal-badge ${stats.pending > 0 ? 'pending' : 'done'}" title="${totalTasks} tâche(s)">${totalTasks}</span>`
      : '';

    html += `
      <button type="button" class="${classes}" data-date="${iso}" title="${iso}${totalTasks > 0 ? ` • ${totalTasks} tâche(s)` : ''}">
        <span class="cal-day-num">${d}</span>
        ${badgeHtml}
      </button>
    `;
  }

  calDaysContainer.innerHTML = html;
}

function initCalendar() {
  const calPrevBtn = document.getElementById('cal-prev');
  const calNextBtn = document.getElementById('cal-next');
  const calTodayBtn = document.getElementById('cal-today');
  const calDaysContainer = document.getElementById('cal-days');

  if (calPrevBtn) {
    calPrevBtn.addEventListener('click', () => {
      calDate.setMonth(calDate.getMonth() - 1);
      renderCalendar();
    });
  }

  if (calNextBtn) {
    calNextBtn.addEventListener('click', () => {
      calDate.setMonth(calDate.getMonth() + 1);
      renderCalendar();
    });
  }

  if (calTodayBtn) {
    calTodayBtn.addEventListener('click', () => {
      calDate = new Date();
      const todayIso = typeof toISODate === 'function' ? toISODate(new Date()) : null;
      const current = typeof getSelectedDateFilter === 'function' ? getSelectedDateFilter() : null;
      if (typeof setDateFilter === 'function') {
        // Alterne entre le filtre du jour et toutes les tâches
        if (current === todayIso) {
          setDateFilter(null);
        } else {
          setDateFilter(todayIso);
        }
      } else {
        renderCalendar();
      }
    });
  }

  if (calDaysContainer) {
    calDaysContainer.addEventListener('click', (e) => {
      const dayBtn = e.target.closest('.cal-day:not(.empty)');
      if (!dayBtn) return;
      const clickedDate = dayBtn.dataset.date;
      const currentFilter = typeof getSelectedDateFilter === 'function' ? getSelectedDateFilter() : null;

      if (typeof setDateFilter === 'function') {
        if (currentFilter === clickedDate) {
          setDateFilter(null);
        } else {
          setDateFilter(clickedDate);
        }
      }
    });
  }

  renderCalendar();
}
