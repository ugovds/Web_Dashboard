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
  document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const searchInput = document.getElementById('search-input');

    const editModal = document.getElementById('edit-modal');
    const categoryModal = document.getElementById('category-modal');
    const commandPaletteModal = document.getElementById('command-palette-modal');
    const settingsModal = document.getElementById('settings-modal');

    const isEditModalOpen = editModal && !editModal.hidden;
    const isCategoryModalOpen = categoryModal && !categoryModal.hidden;
    const isPaletteOpen = commandPaletteModal && !commandPaletteModal.hidden;
    const isSettingsModalOpen = settingsModal && !settingsModal.hidden && settingsModal.classList.contains('visible');

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
      if (isSettingsModalOpen && typeof closeCustomHub === 'function') {
        closeCustomHub();
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

    // Raccourcis Alt+1 (Raccourcis) et Alt+2 (Paramètres)
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      if (e.key === '1' || e.code === 'Digit1' || e.code === 'Numpad1') {
        e.preventDefault();
        if (typeof closeCustomHub === 'function') closeCustomHub();
        if (typeof showToast === 'function') showToast('Vue : Raccourcis (Alt+1)', 'info');
        return;
      }
      if (e.key === '2' || e.code === 'Digit2' || e.code === 'Numpad2') {
        e.preventDefault();
        if (typeof toggleCustomHub === 'function') toggleCustomHub('appearance');
        return;
      }
    }

    const isAnyModalOpen = isEditModalOpen || isCategoryModalOpen || isPaletteOpen || isSettingsModalOpen;
    if (isAnyModalOpen) return;

    const isSearchEmpty = active === searchInput && searchInput.value.trim() === '';
    const isNotTyping = active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA' && active.tagName !== 'SELECT';

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
