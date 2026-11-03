/**
 * shortcuts.js - Raccourcis clavier globaux
 */
function initShortcuts() {
  document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const searchInput = document.getElementById('search-input');
    const todoInput = document.getElementById('todo-input');
    const todoDate = document.getElementById('todo-date');

    const editModal = document.getElementById('edit-modal');
    const weatherModal = document.getElementById('weather-modal');
    const feedsModal = document.getElementById('feeds-modal');
    const widgetsModal = document.getElementById('widgets-modal');
    const appearanceModal = document.getElementById('appearance-modal');
    const categoryModal = document.getElementById('category-modal');
    const scratchpadPanel = document.getElementById('scratchpad-panel');

    const isEditModalOpen = editModal && !editModal.hidden;
    const isWeatherModalOpen = weatherModal && !weatherModal.hidden;
    const isFeedsModalOpen = feedsModal && !feedsModal.hidden;
    const isWidgetsModalOpen = widgetsModal && !widgetsModal.hidden;
    const isAppearanceModalOpen = appearanceModal && !appearanceModal.hidden;
    const isCategoryModalOpen = categoryModal && !categoryModal.hidden;
    const isScratchpadOpen = scratchpadPanel && !scratchpadPanel.hidden;

    // Fermeture des modales et tiroirs avec Échap
    if (e.key === 'Escape') {
      if (isEditModalOpen && typeof closeEditModal === 'function') {
        closeEditModal();
        return;
      }
      if (isCategoryModalOpen && typeof closeCategoryModal === 'function') {
        closeCategoryModal();
        return;
      }
      if (isWidgetsModalOpen && typeof closeWidgetsModal === 'function') {
        closeWidgetsModal();
        return;
      }
      if (isAppearanceModalOpen && typeof closeAppearanceModal === 'function') {
        closeAppearanceModal();
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
      if (isScratchpadOpen) {
        scratchpadPanel.hidden = true;
        const notesBtn = document.getElementById('topbar-notes-btn');
        if (notesBtn) notesBtn.classList.remove('active');
        return;
      }
    }

    const isAnyModalOpen =
      isEditModalOpen ||
      isWeatherModalOpen ||
      isFeedsModalOpen ||
      isWidgetsModalOpen ||
      isAppearanceModalOpen ||
      isCategoryModalOpen;
    if (isAnyModalOpen) return;

    const isTodoFocused = active === todoInput || active === todoDate;
    const isSearchEmpty = active === searchInput && searchInput.value.trim() === '';
    const isNotTyping = active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA';

    const isThemeKey =
      e.code === 'Numpad1' ||
      e.code === 'Numpad2' ||
      e.code === 'Numpad3' ||
      ((isNotTyping || isSearchEmpty) && ['1', '2', '3'].includes(e.key));

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
