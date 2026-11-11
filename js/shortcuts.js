/**
 * shortcuts.js - Raccourcis clavier globaux & Navigation rapide
 * - Alt+1 à Alt+9 : Bascule directe entre les vues du deck unifié
 * - T : Cible instantanément le champ d'ajout de tâche (vue Agenda)
 * - Ctrl+K ou B : Ouvre la palette de commande et recherche de signets
 * - Ctrl+Shift+D : Bascule le mode Nuit / Atténuation HUD
 * - 1, 2, 3 : Changement de thème (quand aucun champ n'est actif)
 * - / : Cible la barre de recherche globale
 * - Échap : Ferme les modales ouvertes ou quitte le champ actif
 */
function initShortcuts() {
  const DECK_VIEWS_ORDER = [
    'dashboard',
    'agenda',
    'weather',
    'feeds',
    'system',
    'pomodoro',
    'notes',
    'ambient',
    'quotes',
    'customize'
  ];

  document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const searchInput = document.getElementById('search-input');
    const todoInput = document.getElementById('todo-input');
    const todoDate = document.getElementById('todo-date');

    const editModal = document.getElementById('edit-modal');
    const weatherModal = document.getElementById('weather-modal');
    const feedsModal = document.getElementById('feeds-modal');
    const hubModal = document.getElementById('custom-hub-modal');
    const categoryModal = document.getElementById('category-modal');
    const commandPaletteModal = document.getElementById('command-palette-modal');

    const isEditModalOpen = editModal && !editModal.hidden;
    const isWeatherModalOpen = weatherModal && !weatherModal.hidden;
    const isFeedsModalOpen = feedsModal && !feedsModal.hidden;
    const isHubModalOpen = hubModal && !hubModal.hidden;
    const isCategoryModalOpen = categoryModal && !categoryModal.hidden;
    const isPaletteOpen = commandPaletteModal && !commandPaletteModal.hidden;

    // Fermeture des modales avec Échap
    if (e.key === 'Escape') {
      if (isPaletteOpen && typeof closeCommandPalette === 'function') {
        closeCommandPalette();
        return;
      }
      if (isEditModalOpen && typeof closeEditModal === 'function') {
        closeEditModal();
        return;
      }
      if (isCategoryModalOpen && typeof closeCategoryModal === 'function') {
        closeCategoryModal();
        return;
      }
      if (isHubModalOpen && typeof closeCustomHub === 'function') {
        closeCustomHub();
        return;
      }
      if (isWeatherModalOpen && typeof closeWeatherModal === 'function') {
        closeWeatherModal();
        return;
      }
      if (isFeedsModalOpen && typeof closeFeedsModal === 'function') {
        closeFeedsModal();
        return;
      }
    }

    // Toggle Palette de Commande via Ctrl+K / Cmd+K
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'k')) {
      e.preventDefault();
      if (isPaletteOpen) {
        if (typeof closeCommandPalette === 'function') closeCommandPalette();
      } else {
        if (typeof openCommandPalette === 'function') openCommandPalette();
      }
      return;
    }

    // Toggle Dim Mode (Mode Nuit / Atténuation HUD) via Ctrl+Shift+D
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      if (typeof toggleDimMode === 'function') toggleDimMode();
      return;
    }

    // Navigation dans le deck via Alt+1 à Alt+9 et Alt+0
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      let num = null;
      if (e.code.startsWith('Digit')) {
        num = parseInt(e.code.replace('Digit', ''), 10);
      } else if (e.code.startsWith('Numpad')) {
        num = parseInt(e.code.replace('Numpad', ''), 10);
      } else if (e.key >= '0' && e.key <= '9') {
        num = parseInt(e.key, 10);
      }

      if (num !== null) {
        const targetIdx = num === 0 ? 9 : num - 1;
        if (targetIdx >= 0 && targetIdx < DECK_VIEWS_ORDER.length) {
          e.preventDefault();
          const targetViewKey = DECK_VIEWS_ORDER[targetIdx];
          const navBtn = document.querySelector(`.deck-nav-btn[data-deck-view="${targetViewKey}"]`);
          if (navBtn) {
            navBtn.click();
            if (typeof showToast === 'function') {
              const label = navBtn.querySelector('.nav-label')?.textContent || navBtn.querySelector('span')?.textContent || targetViewKey;
              showToast(`Vue : ${label} (Alt+${num})`, 'info');
            }
          }
          return;
        }
      }
    }

    const isAnyModalOpen =
      isEditModalOpen ||
      isWeatherModalOpen ||
      isFeedsModalOpen ||
      isHubModalOpen ||
      isCategoryModalOpen ||
      isPaletteOpen;
    if (isAnyModalOpen) return;

    const isTodoFocused = active === todoInput || active === todoDate;
    const isSearchEmpty = active === searchInput && searchInput.value.trim() === '';
    const isNotTyping = active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA' && active.tagName !== 'SELECT';

    // Navigation au clavier par touches Flèches Haut & Bas entre les onglets
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && isNotTyping) {
      e.preventDefault();
      const visibleBtns = Array.from(document.querySelectorAll('.deck-nav-btn')).filter(
        (b) => b.offsetParent !== null && b.style.display !== 'none'
      );
      if (visibleBtns.length) {
        const activeIdx = visibleBtns.findIndex((b) => b.classList.contains('active'));
        let targetIdx;
        if (e.key === 'ArrowDown') {
          targetIdx = activeIdx < 0 ? 0 : (activeIdx + 1) % visibleBtns.length;
        } else {
          targetIdx = activeIdx < 0 ? 0 : (activeIdx - 1 + visibleBtns.length) % visibleBtns.length;
        }
        visibleBtns[targetIdx].click();
      }
      return;
    }

    // Raccourci B : Ouvrir la palette de commande si on ne tape nulle part
    if ((e.key === 'b' || e.key === 'B') && isNotTyping) {
      e.preventDefault();
      if (typeof openCommandPalette === 'function') openCommandPalette();
      return;
    }

    // Annuler la suppression (Ctrl+Z / Cmd+Z) quand on ne tape pas dans un champ
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && isNotTyping) {
      if (typeof undoDeleteTask === 'function' && undoDeleteTask()) {
        e.preventDefault();
        return;
      }
      if (typeof undoDeleteBookmark === 'function' && undoDeleteBookmark()) {
        e.preventDefault();
        return;
      }
    }

    // Raccourci T : Ajout rapide de tâche (active la vue Agenda et focus le champ)
    if ((e.key === 't' || e.key === 'T') && isNotTyping) {
      e.preventDefault();
      const agendaBtn = document.querySelector('.deck-nav-btn[data-deck-view="agenda"]');
      if (agendaBtn) agendaBtn.click();
      if (todoInput) {
        setTimeout(() => todoInput.focus(), 80);
      }
      return;
    }

    const isThemeKey =
      e.code === 'Numpad1' ||
      e.code === 'Numpad2' ||
      e.code === 'Numpad3' ||
      e.code === 'Numpad4' ||
      ((isNotTyping || isSearchEmpty) && ['1', '2', '3', '4'].includes(e.key));

    if (isThemeKey && !isTodoFocused && (isNotTyping || isSearchEmpty)) {
      const num = e.code.startsWith('Numpad') ? e.code.replace('Numpad', '') : e.key;
      if (typeof themesConfig !== 'undefined' && themesConfig[num] && typeof applyTheme === 'function') {
        e.preventDefault();
        applyTheme(num);
        return;
      }
    }

    if (e.key === '/' && isNotTyping && searchInput) {
      e.preventDefault();
      searchInput.focus();
    } else if (e.key === 'Escape' && !isNotTyping) {
      active.blur();
    }
  });
}
