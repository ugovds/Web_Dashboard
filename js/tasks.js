/**
 * tasks.js - Gestionnaire de tâches (To-Do List) et persistance
 * - Système de priorité avec code couleur (🔴 Urgent, 🟡 Normal, 🟢 Faible)
 * - Édition en ligne des tâches existantes (texte et échéance)
 * - Annulation de suppression (Undo / Ctrl+Z)
 * - Tri dynamique : Par Priorité / Par Échéance / Normal
 * - Filtrage avancé : Toutes, À faire, Faites, Aujourd'hui, ou par date du calendrier
 * - Badges dynamiques des échéances (Auj, J-X, J+X retard)
 * - Export de l'agenda au format standard iCalendar (.ics)
 * - Mini barre de progression d'accomplissement & vue d'état vide
 */
let todos = [];
let selectedDateFilter = null;
let currentStatusFilter = 'all'; // 'all', 'pending', 'done', 'today'
let taskSortMode = 'none'; // 'none', 'priority', 'date'
let editingTaskIndex = null;
let lastDeletedTask = null;

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function computeDaysBadge(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: 'Auj.', cls: 'today' };
  if (diffDays === 1) return { label: 'Demain', cls: 'upcoming' };
  if (diffDays > 1) return { label: `J-${diffDays}`, cls: 'upcoming' };
  return { label: `J+${Math.abs(diffDays)} retard`, cls: 'overdue' };
}

function getPriorityConfig(priority) {
  switch (priority) {
    case 'urgent':
      return { label: '🔴 Urgent', cls: 'priority-urgent', weight: 3 };
    case 'low':
      return { label: '🟢 Faible', cls: 'priority-low', weight: 1 };
    case 'normal':
    default:
      return { label: '🟡 Normal', cls: 'priority-normal', weight: 2 };
  }
}

function cyclePriority(current) {
  if (current === 'urgent') return 'normal';
  if (current === 'normal') return 'low';
  return 'urgent';
}

function getTaskDatesMap() {
  const map = {};
  todos.forEach((t) => {
    if (t.date) {
      if (!map[t.date]) map[t.date] = { pending: 0, done: 0, tasks: [] };
      if (t.done) map[t.date].done++;
      else map[t.date].pending++;
      map[t.date].tasks.push(t);
    }
  });
  return map;
}

function getSelectedDateFilter() {
  return selectedDateFilter;
}

function setDateFilter(date) {
  selectedDateFilter = date;
  const todoDateInput = document.getElementById('todo-date');
  if (todoDateInput) {
    todoDateInput.value = date || '';
  }
  saveAndRenderTodos();
}

function undoDeleteTask() {
  if (!lastDeletedTask) return false;
  todos.splice(lastDeletedTask.index, 0, lastDeletedTask.item);
  const restoredText = lastDeletedTask.item.text;
  lastDeletedTask = null;
  saveAndRenderTodos();
  if (typeof showToast === 'function') {
    showToast(`Tâche restaurée : "${restoredText}"`, 'success');
  }
  return true;
}

function exportTodosToICS() {
  if (todos.length === 0) {
    if (typeof showToast === 'function') showToast('Aucune tâche à exporter.', 'info');
    return;
  }

  const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Violet Startpage//Cyberdeck Tasks//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  todos.forEach((t, i) => {
    const uid = `task-${Date.now()}-${i}@violet-startpage`;
    let dtStart;
    if (t.date) {
      const cleanDate = t.date.replace(/-/g, '');
      dtStart = `VALUE=DATE:${cleanDate}`;
    } else {
      const todayClean = toISODate(new Date()).replace(/-/g, '');
      dtStart = `VALUE=DATE:${todayClean}`;
    }

    const priorityVal = t.priority === 'urgent' ? 1 : t.priority === 'low' ? 9 : 5;
    const statusVal = t.done ? 'COMPLETED' : 'NEEDS-ACTION';
    const escapedSummary = (t.text || 'Tâche')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');

    icsContent.push('BEGIN:VTODO');
    icsContent.push(`UID:${uid}`);
    icsContent.push(`DTSTAMP:${nowStr}`);
    icsContent.push(`DUE;${dtStart}`);
    icsContent.push(`SUMMARY:${escapedSummary}`);
    icsContent.push(`STATUS:${statusVal}`);
    icsContent.push(`PRIORITY:${priorityVal}`);
    icsContent.push('END:VTODO');
  });

  icsContent.push('END:VCALENDAR');
  const fullIcs = icsContent.join('\r\n');

  const blob = new Blob([fullIcs], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `agenda_taches_${toISODate(new Date())}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  if (typeof showToast === 'function') {
    showToast('Agenda exporté en fichier .ics', 'success');
  }
}

function saveAndRenderTodos(skipStorageSave = false, skipCalendar = false) {
  if (!skipStorageSave) {
    localStorage.setItem('startpage_todos_v2', JSON.stringify(todos));
  }

  if (!skipCalendar && typeof renderCalendar === 'function') {
    renderCalendar();
  }

  const todoListEl = document.getElementById('todo-list');
  const clearDateFilterBtn = document.getElementById('clear-date-filter');
  const filterDateLabel = document.getElementById('filter-date-label');
  const statsBadge = document.getElementById('tasks-stats-badge');
  const progressFill = document.getElementById('tasks-progress-mini-fill');
  const sortBtnLabel = document.getElementById('task-sort-label');

  // Mise à jour de l'indicateur de tri
  if (sortBtnLabel) {
    if (taskSortMode === 'priority') sortBtnLabel.textContent = 'Priorité';
    else if (taskSortMode === 'date') sortBtnLabel.textContent = 'Échéance';
    else sortBtnLabel.textContent = 'Tri';
  }

  // Mise à jour de la puce de filtrage par date
  if (clearDateFilterBtn && filterDateLabel) {
    if (selectedDateFilter) {
      const parts = selectedDateFilter.split('-');
      if (parts.length === 3) {
        filterDateLabel.textContent = `${parts[2]}/${parts[1]}`;
      }
      clearDateFilterBtn.hidden = false;
    } else {
      clearDateFilterBtn.hidden = true;
    }
  }

  // Statistiques globales de complétion
  const totalCount = todos.length;
  const doneCount = todos.filter((t) => t.done).length;
  if (statsBadge) {
    statsBadge.textContent = `${doneCount} / ${totalCount}`;
    statsBadge.title = `${doneCount} tâche(s) terminée(s) sur ${totalCount}`;
  }
  if (progressFill) {
    const pct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
    progressFill.style.width = `${pct}%`;
  }

  if (!todoListEl) return;

  const todayStr = toISODate(new Date());

  // Filtrage selon la date sélectionnée et le statut actif
  let visibleTodos = todos
    .map((t, index) => ({ ...t, originalIndex: index }))
    .filter((t) => {
      const matchDate = !selectedDateFilter || t.date === selectedDateFilter;
      let matchStatus = true;
      if (currentStatusFilter === 'pending') matchStatus = !t.done;
      else if (currentStatusFilter === 'done') matchStatus = t.done;
      else if (currentStatusFilter === 'today') matchStatus = t.date === todayStr;

      return matchDate && matchStatus;
    });

  // Application du tri si actif
  if (taskSortMode === 'priority') {
    visibleTodos.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const wA = getPriorityConfig(a.priority).weight;
      const wB = getPriorityConfig(b.priority).weight;
      return wB - wA;
    });
  } else if (taskSortMode === 'date') {
    visibleTodos.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.localeCompare(b.date);
    });
  }

  if (visibleTodos.length === 0) {
    let emptyMessage = 'Toutes vos tâches sont accomplies !';
    let emptySub = 'Ajoutez une tâche ou échéance ci-dessus pour planifier votre journée.';

    if (selectedDateFilter) {
      emptyMessage = 'Aucune tâche pour cette date.';
      emptySub = 'Cliquez sur le calendrier pour sélectionner un autre jour ou créez-en une.';
    } else if (currentStatusFilter === 'pending') {
      emptyMessage = 'Aucune tâche en attente.';
      emptySub = 'Bravo ! Votre agenda est parfaitement dégagé.';
    } else if (currentStatusFilter === 'done') {
      emptyMessage = 'Aucune tâche terminée.';
      emptySub = 'Cochez vos tâches au fur et à mesure pour les archiver.';
    } else if (currentStatusFilter === 'today') {
      emptyMessage = 'Aucune tâche prévue pour aujourd\'hui.';
      emptySub = 'Sélectionnez une autre date ou ajoutez une échéance pour aujourd\'hui.';
    }

    todoListEl.innerHTML = `
      <li class="todo-empty-state">
        <i class="fa-solid fa-calendar-check"></i>
        <p>${emptyMessage}</p>
        <span>${emptySub}</span>
      </li>
    `;
    return;
  }

  todoListEl.innerHTML = visibleTodos
    .map((t) => {
      const isEditing = t.originalIndex === editingTaskIndex;
      if (isEditing) {
        return `
          <li class="todo-item editing">
            <div class="todo-edit-form">
              <input type="text" class="todo-edit-text-input" id="todo-edit-text-${t.originalIndex}" value="${escapeHtml(t.text)}" autocomplete="off" />
              <input type="date" class="todo-edit-date-input" id="todo-edit-date-${t.originalIndex}" value="${t.date || ''}" />
              <div class="todo-edit-actions">
                <button type="button" class="todo-edit-save-btn" data-save-edit="${t.originalIndex}" title="Valider les modifications"><i class="fa-solid fa-check"></i></button>
                <button type="button" class="todo-edit-cancel-btn" data-cancel-edit="${t.originalIndex}" title="Annuler"><i class="fa-solid fa-xmark"></i></button>
              </div>
            </div>
          </li>
        `;
      }

      const badge = computeDaysBadge(t.date);
      const prio = getPriorityConfig(t.priority);
      return `
        <li class="todo-item ${t.done ? 'done' : ''}">
          <label>
            <input type="checkbox" data-idx="${t.originalIndex}" ${t.done ? 'checked' : ''} />
            <span class="todo-text">${escapeHtml(t.text)}</span>
          </label>
          <div class="todo-right">
            <button
              type="button"
              class="todo-priority-badge ${prio.cls}"
              data-toggle-prio="${t.originalIndex}"
              title="Priorité : ${prio.label} (cliquez pour changer)"
            >
              ${prio.label}
            </button>
            ${badge ? `<span class="deadline-badge ${badge.cls}">${badge.label}</span>` : ''}
            <button type="button" class="todo-edit-btn" data-edit="${t.originalIndex}" title="Modifier cette tâche"><i class="fa-solid fa-pen"></i></button>
            <button class="todo-del" data-del="${t.originalIndex}" title="Supprimer">&times;</button>
          </div>
        </li>
      `;
    })
    .join('');

  if (editingTaskIndex !== null) {
    const inputToFocus = document.getElementById(`todo-edit-text-${editingTaskIndex}`);
    if (inputToFocus) {
      setTimeout(() => inputToFocus.focus(), 20);
    }
  }

  if (typeof renderDashboardAgenda === 'function') {
    renderDashboardAgenda();
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => {
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

function initTasks() {
  try {
    todos = JSON.parse(localStorage.getItem('startpage_todos_v2') || '[]');
  } catch {
    todos = [];
  }

  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoDateInput = document.getElementById('todo-date');
  const todoPrioritySelect = document.getElementById('todo-priority');
  const todoListEl = document.getElementById('todo-list');
  const clearDateFilterBtn = document.getElementById('clear-date-filter');
  const sortBtn = document.getElementById('task-sort-btn');
  const exportIcsBtn = document.getElementById('task-export-ics-btn');

  if (todoPrioritySelect) {
    todoPrioritySelect.value = localStorage.getItem('startpage_agenda_default_priority') || 'normal';
  }

  // Boutons de filtrage (Toutes, À faire, Faites, Auj)
  document.querySelectorAll('.task-filter-btn[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.task-filter-btn[data-filter]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentStatusFilter = btn.dataset.filter || 'all';
      saveAndRenderTodos();
    });
  });

  // Bouton de bascule de tri
  if (sortBtn) {
    sortBtn.addEventListener('click', () => {
      if (taskSortMode === 'none') {
        taskSortMode = 'priority';
      } else if (taskSortMode === 'priority') {
        taskSortMode = 'date';
      } else {
        taskSortMode = 'none';
      }
      saveAndRenderTodos();
    });
  }

  // Exportation iCalendar .ics
  if (exportIcsBtn) {
    exportIcsBtn.addEventListener('click', () => {
      exportTodosToICS();
    });
  }

  if (todoForm) {
    todoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = todoInput.value.trim();
      if (!text) return;

      const chosenDate = todoDateInput.value || selectedDateFilter || '';
      const priority = todoPrioritySelect ? todoPrioritySelect.value : 'normal';

      todos.unshift({
        text,
        date: chosenDate,
        priority: priority || 'normal',
        done: false
      });

      todoInput.value = '';
      if (todoPrioritySelect) {
        todoPrioritySelect.value = localStorage.getItem('startpage_agenda_default_priority') || 'normal';
      }
      saveAndRenderTodos();
    });
  }

  if (todoListEl) {
    todoListEl.addEventListener('click', (e) => {
      if (e.target.matches('input[type="checkbox"]')) {
        const idx = Number(e.target.dataset.idx);
        if (todos[idx]) {
          todos[idx].done = e.target.checked;
          saveAndRenderTodos();
        }
      } else if (e.target.closest('[data-toggle-prio]')) {
        const btn = e.target.closest('[data-toggle-prio]');
        const idx = Number(btn.dataset.togglePrio);
        if (todos[idx]) {
          todos[idx].priority = cyclePriority(todos[idx].priority || 'normal');
          saveAndRenderTodos();
        }
      } else if (e.target.closest('[data-edit]')) {
        const btn = e.target.closest('[data-edit]');
        editingTaskIndex = Number(btn.dataset.edit);
        saveAndRenderTodos();
      } else if (e.target.closest('[data-save-edit]')) {
        const btn = e.target.closest('[data-save-edit]');
        const idx = Number(btn.dataset.saveEdit);
        const textIn = document.getElementById(`todo-edit-text-${idx}`);
        const dateIn = document.getElementById(`todo-edit-date-${idx}`);
        if (textIn && textIn.value.trim() && todos[idx]) {
          todos[idx].text = textIn.value.trim();
          todos[idx].date = dateIn ? dateIn.value : (todos[idx].date || '');
          editingTaskIndex = null;
          saveAndRenderTodos();
          if (typeof showToast === 'function') showToast('Tâche modifiée !', 'success');
        }
      } else if (e.target.closest('[data-cancel-edit]')) {
        editingTaskIndex = null;
        saveAndRenderTodos();
      } else if (e.target.matches('.todo-del')) {
        const idx = Number(e.target.dataset.del);
        if (todos[idx]) {
          lastDeletedTask = { item: todos[idx], index: idx };
          const delText = todos[idx].text;
          todos.splice(idx, 1);
          saveAndRenderTodos();
          if (typeof showToast === 'function') {
            showToast(`Tâche supprimée • Appuyez sur Ctrl+Z pour annuler`, 'info');
          }
        }
      }
    });

    // Validation touche Entrée lors de l'édition en ligne
    todoListEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.classList.contains('todo-edit-text-input')) {
        e.preventDefault();
        const saveBtn = e.target.closest('.todo-item')?.querySelector('[data-save-edit]');
        if (saveBtn) saveBtn.click();
      } else if (e.key === 'Escape' && editingTaskIndex !== null) {
        editingTaskIndex = null;
        saveAndRenderTodos();
      }
    });
  }

  if (clearDateFilterBtn) {
    clearDateFilterBtn.addEventListener('click', () => {
      setDateFilter(null);
    });
  }

  saveAndRenderTodos(true, true);
}
