/**
 * calendar.js - Calendrier mensuel étendu avec tâches intégrées
 * - Affichage dynamique du mois et navigation rapide
 * - Affichage direct des puces de tâches avec code couleur de priorité
 * - Liste défilante interne si une journée contient plusieurs tâches
 * - Filtrage instantané au clic sur un jour pour voir les détails et éditer
 */
let calDate = new Date();

function safeEscape(str) {
  if (typeof escapeHtml === 'function') return escapeHtml(str);
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[m]);
}

function renderCalendar() {
  const calTitle = document.getElementById('cal-title');
  const calDaysContainer = document.getElementById('cal-days');
  if (!calTitle || !calDaysContainer) return;

  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const todayStr = typeof toISODate === 'function' ? toISODate(new Date()) : '';
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
    html += `<div class="cal-day empty"></div>`;
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

    // Puces épurées et lisibles : pastilles de priorité sans texte tronqué
    let tasksHtml = '';
    let tasksSummary = '';
    if (stats && stats.tasks && stats.tasks.length > 0) {
      tasksSummary = stats.tasks.map((t) => `\n • [${t.priority || 'normal'}] ${t.text}`).join('');
      const maxVisibleDots = 3;
      const visibleTasks = stats.tasks.slice(0, maxVisibleDots);
      const remainingCount = stats.tasks.length - maxVisibleDots;

      const dots = visibleTasks.map((t) => {
        const priorityCls = `priority-${t.priority || 'normal'}`;
        const doneCls = t.done ? 'done' : '';
        return `<span class="cal-dot ${priorityCls} ${doneCls}"></span>`;
      }).join('');

      const countBadge = remainingCount > 0 ? `<span class="cal-dot-count">+${remainingCount}</span>` : '';
      tasksHtml = `<div class="cal-day-dots">${dots}${countBadge}</div>`;
    }

    const dayTitle = `${d} ${monthName} • ${totalTasks} tâche(s)${tasksSummary}`;

    html += `
      <div class="${classes}" data-date="${iso}" title="${safeEscape(dayTitle)}" role="button" tabindex="0">
        <div class="cal-day-top">
          <span class="cal-day-num">${d}</span>
          ${isToday ? '<span class="cal-day-dot" title="Aujourd\'hui"></span>' : ''}
        </div>
        ${tasksHtml}
      </div>
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
    const handleSelectDay = (dayEl) => {
      if (!dayEl) return;
      const clickedDate = dayEl.dataset.date;
      const currentFilter = typeof getSelectedDateFilter === 'function' ? getSelectedDateFilter() : null;

      if (typeof setDateFilter === 'function') {
        if (currentFilter === clickedDate) {
          setDateFilter(null);
        } else {
          setDateFilter(clickedDate);
        }
      }
    };

    calDaysContainer.addEventListener('click', (e) => {
      const dayEl = e.target.closest('.cal-day:not(.empty)');
      handleSelectDay(dayEl);
    });

    calDaysContainer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const dayEl = e.target.closest('.cal-day:not(.empty)');
        if (dayEl) {
          e.preventDefault();
          handleSelectDay(dayEl);
        }
      }
    });
  }

  renderCalendar();
}
