/**
 * tasks.js - Gestionnaire de tâches (To-Do List) et persistance
 * - Filtrage par date liée au calendrier ou global
 * - Filtres par statut (Toutes, À faire, Faites)
 * - Badges dynamiques des échéances (Auj, J-X, J+X)
 * - Mini barre de progression d'accomplissement
 * - Vue d'état vide ergonomique
 */
let todos = [];
let selectedDateFilter = null;
let currentStatusFilter = 'all'; // 'all', 'pending', 'done'

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

function getTaskDatesMap() {
  const map = {};
  todos.forEach((t) => {
    if (t.date) {
      if (!map[t.date]) map[t.date] = { pending: 0, done: 0 };
      if (t.done) map[t.date].done++;
      else map[t.date].pending++;
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

function saveAndRenderTodos() {
  localStorage.setItem('startpage_todos_v2', JSON.stringify(todos));

  if (typeof renderCalendar === 'function') {
    renderCalendar();
  }

  const todoListEl = document.getElementById('todo-list');
  const clearDateFilterBtn = document.getElementById('clear-date-filter');
  const filterDateLabel = document.getElementById('filter-date-label');
  const statsBadge = document.getElementById('tasks-stats-badge');
  const progressFill = document.getElementById('tasks-progress-mini-fill');

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

  // Filtrage selon la date sélectionnée et le statut actif
  const visibleTodos = todos
    .map((t, index) => ({ ...t, originalIndex: index }))
    .filter((t) => {
      const matchDate = !selectedDateFilter || t.date === selectedDateFilter;
      const matchStatus =
        currentStatusFilter === 'all' ||
        (currentStatusFilter === 'pending' && !t.done) ||
        (currentStatusFilter === 'done' && t.done);
      return matchDate && matchStatus;
    });

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
      const badge = computeDaysBadge(t.date);
      return `
        <li class="todo-item ${t.done ? 'done' : ''}">
          <label>
            <input type="checkbox" data-idx="${t.originalIndex}" ${t.done ? 'checked' : ''} />
            <span class="todo-text">${escapeHtml(t.text)}</span>
          </label>
          <div class="todo-right">
            ${badge ? `<span class="deadline-badge ${badge.cls}">${badge.label}</span>` : ''}
            <button class="todo-del" data-del="${t.originalIndex}" title="Supprimer">&times;</button>
          </div>
        </li>
      `;
    })
    .join('');
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
  const todoListEl = document.getElementById('todo-list');
  const clearDateFilterBtn = document.getElementById('clear-date-filter');

  // Boutons de filtrage (Toutes, À faire, Faites)
  document.querySelectorAll('.task-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.task-filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentStatusFilter = btn.dataset.filter || 'all';
      saveAndRenderTodos();
    });
  });

  if (todoForm) {
    todoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = todoInput.value.trim();
      if (!text) return;

      const chosenDate = todoDateInput.value || selectedDateFilter || '';
      todos.unshift({
        text,
        date: chosenDate,
        done: false
      });

      todoInput.value = '';
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
      } else if (e.target.matches('.todo-del')) {
        const idx = Number(e.target.dataset.del);
        if (todos[idx]) {
          todos.splice(idx, 1);
          saveAndRenderTodos();
        }
      }
    });
  }

  if (clearDateFilterBtn) {
    clearDateFilterBtn.addEventListener('click', () => {
      setDateFilter(null);
    });
  }

  saveAndRenderTodos();
}
