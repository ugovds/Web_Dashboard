/**
 * shortcuts.js - Raccourcis clavier globaux & Navigation rapide
 * - Alt+1 : Onglet Raccourcis
 * - Alt+2 : Onglet Paramètres
 * - Ctrl+K ou B : Ouvre la palette de commande et recherche de signets
 * - Ctrl+Shift+D : Bascule le mode Nuit / Atténuation HUD
 * - 1, 2, 3, 4, 5 : Changement de thème instantané
 * - / : Cible la barre de recherche Omnibox
 * - Échap : Ferme les modales ou retourne aux raccourcis
 * - Ctrl+Z : Annule la suppression du dernier raccourci
 */
function initShortcuts() {
  const DECK_VIEWS_ORDER = [
    'bookmarks',
    'customize'
  ];

  document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const searchInput = document.getElementById('search-input');

    const editModal = document.getElementById('edit-modal');
    const categoryModal = document.getElementById('category-modal');
    const commandPaletteModal = document.getElementById('command-palette-modal');

    const isEditModalOpen = editModal && !editModal.hidden;
    const isCategoryModalOpen = categoryModal && !categoryModal.hidden;
    const isPaletteOpen = commandPaletteModal && !commandPaletteModal.hidden;

    // Fermeture des modales ou retour avec Échap
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
      // Si on est dans les paramètres et qu'aucune modale n'est ouverte, retourner aux raccourcis
      const customView = document.getElementById('deck-view-customize');
      if (customView && !customView.hidden && customView.classList.contains('active')) {
        const bookmarksBtn = document.querySelector('.deck-nav-btn[data-deck-view="bookmarks"]');
        if (bookmarksBtn) bookmarksBtn.click();
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

    // Navigation dans le deck via Alt+1 (Raccourcis) et Alt+2 (Paramètres)
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
        const targetIdx = num - 1;
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

    const isAnyModalOpen = isEditModalOpen || isCategoryModalOpen || isPaletteOpen;
    if (isAnyModalOpen) return;

    const isSearchEmpty = active === searchInput && searchInput.value.trim() === '';
    const isNotTyping = active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA' && active.tagName !== 'SELECT';

    // Navigation au clavier par touches Flèches Haut & Bas entre Raccourcis et Paramètres
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && isNotTyping) {
      e.preventDefault();
      const sidebarBtns = Array.from(document.querySelectorAll('.sidebar-nav .deck-nav-btn'));
      if (sidebarBtns.length) {
        const activeBtn = document.querySelector('.sidebar-nav .deck-nav-btn.active');
        const activeIdx = activeBtn ? sidebarBtns.indexOf(activeBtn) : -1;
        let targetIdx;
        if (e.key === 'ArrowDown') {
          targetIdx = (activeIdx < 0 || activeIdx >= sidebarBtns.length - 1) ? 0 : activeIdx + 1;
        } else {
          targetIdx = (activeIdx <= 0) ? sidebarBtns.length - 1 : activeIdx - 1;
        }
        sidebarBtns[targetIdx]?.click();
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
      if (typeof undoDeleteBookmark === 'function' && undoDeleteBookmark()) {
        e.preventDefault();
        return;
      }
    }

    // Touches 1 à 5 pour changer de thème
    const isThemeKey =
      e.code === 'Numpad1' ||
      e.code === 'Numpad2' ||
      e.code === 'Numpad3' ||
      e.code === 'Numpad4' ||
      e.code === 'Numpad5' ||
      ((isNotTyping || isSearchEmpty) && ['1', '2', '3', '4', '5'].includes(e.key));

    if (isThemeKey && (isNotTyping || isSearchEmpty)) {
      const num = e.code.startsWith('Numpad') ? e.code.replace('Numpad', '') : e.key;
      if (typeof themesConfig !== 'undefined' && themesConfig[num] && typeof applyTheme === 'function') {
        e.preventDefault();
        applyTheme(num);
        return;
      }
    }

    // Touche / pour cibler le champ de recherche
    if (e.key === '/' && isNotTyping && searchInput) {
      e.preventDefault();
      searchInput.focus();
    } else if (e.key === 'Escape' && !isNotTyping) {
      active.blur();
    }
  });
}
