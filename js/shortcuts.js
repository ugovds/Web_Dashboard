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
    const hubModal = document.getElementById('custom-hub-modal');
    const categoryModal = document.getElementById('category-modal');

    const isEditModalOpen = editModal && !editModal.hidden;
    const isWeatherModalOpen = weatherModal && !weatherModal.hidden;
    const isFeedsModalOpen = feedsModal && !feedsModal.hidden;
    const isHubModalOpen = hubModal && !hubModal.hidden;
    const isCategoryModalOpen = categoryModal && !categoryModal.hidden;

    // Fermeture des modales avec Échap
    if (e.key === 'Escape') {
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

    const isAnyModalOpen =
      isEditModalOpen ||
      isWeatherModalOpen ||
      isFeedsModalOpen ||
      isHubModalOpen ||
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
