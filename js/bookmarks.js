/**
 * bookmarks.js - Gestion des catégories de signets, ajustement adaptatif de la taille,
 * ajout/suppression de liens et catégories, glisser-déposer et sauvegarde/restauration JSON complète
 */
const defaultCategories = [
  {
    id: 'social',
    title: 'Social',
    icon: 'fa-solid fa-share-nodes',
    links: [
      { name: 'YouTube', url: 'https://www.youtube.com/', icon: 'fa-brands fa-youtube' },
      { name: 'Twitch', url: 'https://www.twitch.tv/', icon: 'fa-brands fa-twitch' },
      { name: 'Gmail', url: 'https://mail.google.com/', icon: 'fa-solid fa-envelope-open-text' },
      { name: 'Twitter / X', url: 'https://x.com/', icon: 'fa-brands fa-x-twitter' },
      { name: 'Google Docs', url: 'https://docs.google.com/document/', icon: 'fa-solid fa-file-lines' },
      { name: 'Google Slides', url: 'https://docs.google.com/presentation/', icon: 'fa-solid fa-display' }
    ]
  },
  {
    id: 'jeux',
    title: 'Jeux',
    icon: 'fa-solid fa-gamepad',
    links: [
      { name: 'Chess', url: 'https://www.chess.com/home', icon: 'fa-solid fa-chess-knight' },
      { name: 'Monkeytype', url: 'https://monkeytype.com/', icon: 'fa-solid fa-keyboard' },
      { name: 'Cémantix', url: 'https://cemantix.certitudes.org/', icon: 'fa-solid fa-fire-flame-curved' },
      { name: 'Worldle', url: 'https://worldle.teuteuf.fr/', icon: 'fa-solid fa-earth-europe' },
      { name: 'Framed', url: 'https://framed.wtf/', icon: 'fa-solid fa-film' },
      { name: 'Chronophoto', url: 'https://www.chronophoto.app/', icon: 'fa-solid fa-camera-retro' }
    ]
  },
  {
    id: 'ia',
    title: 'IA',
    icon: 'fa-solid fa-microchip',
    links: [
      { name: 'Gemini', url: 'https://gemini.google.com/app?hl=fr', icon: 'fa-solid fa-wand-magic-sparkles' },
      { name: 'ChatGPT', url: 'https://chatgpt.com/', icon: 'fa-solid fa-bolt' },
      { name: 'NotebookLM', url: 'https://notebooklm.google.com/', icon: 'fa-solid fa-book-open-reader' },
      { name: 'Claude', url: 'https://claude.ai/new', icon: 'fa-solid fa-brain' },
      { name: 'Perplexity', url: 'https://www.perplexity.ai/', icon: 'fa-solid fa-magnifying-glass-chart' },
      { name: 'DeepSeek', url: 'https://chat.deepseek.com/', icon: 'fa-solid fa-terminal' }
    ]
  },
  {
    id: 'unif',
    title: 'Unif',
    icon: 'fa-solid fa-graduation-cap',
    links: [
      { name: 'Moodle', url: 'https://moodle.uclouvain.be/my/', icon: 'fa-solid fa-book-bookmark' },
      { name: 'INGInious', url: 'https://inginious.info.ucl.ac.be/mycourses', icon: 'fa-solid fa-code' },
      { name: 'MonHoraire', url: 'https://monhoraire.uclouvain.be/', icon: 'fa-regular fa-calendar-days' },
      { name: 'Outlook', url: 'https://outlook.office.com/mail/', icon: 'fa-solid fa-envelope' },
      { name: 'Overleaf', url: 'https://overleaf.info.ucl.ac.be/project', icon: 'fa-solid fa-feather-pointed' },
      { name: 'MyUCL', url: 'https://uclouvain.be/fr/myuclouvain', icon: 'fa-solid fa-building-columns' }
    ]
  }
];

let categories = [];
let quickShortcuts = [];
let isEditMode = false;
let currentEditingTarget = { catIdx: null, linkIdx: null }; // linkIdx === null signifie ajout d'un nouveau lien
let currentEditingCategoryIdx = null; // null = ajout de catégorie

function getCleanDomain(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || '';
  }
}

// Variables pour le Glisser-Déposer
let draggedData = null;
let didDragOccur = false;

function getQuickShortcuts() {
  return quickShortcuts;
}

function getCategoryDensityClass(count) {
  if (count <= 6) return 'density-normal';
  if (count <= 8) return 'density-compact';
  if (count <= 12) return 'density-dense';
  return 'density-scroll';
}

function renderCategories() {
  const categoriesContainer = document.getElementById('categories-container');
  if (!categoriesContainer) return;

  if (categories.length > 4) {
    categoriesContainer.classList.add('multi-categories');
  } else {
    categoriesContainer.classList.remove('multi-categories');
  }

  quickShortcuts = [];

  categoriesContainer.innerHTML = categories
    .map((cat, catIdx) => {
      const densityClass = getCategoryDensityClass(cat.links.length);
      return `
      <div class="category-card ${densityClass}" data-cat="${catIdx}">
        <div class="category-header">
          <div class="category-title-wrap">
            <i class="${cat.icon || 'fa-solid fa-folder'}"></i>
            <h3>${escapeHtml(cat.title)}</h3>
          </div>
          ${
            isEditMode
              ? `
              <div class="category-tools-group">
                <button type="button" class="cat-tool-btn cat-tool-add-btn" data-cat="${catIdx}" title="Ajouter un lien dans cette catégorie">
                  <i class="fa-solid fa-plus"></i>
                </button>
                <button type="button" class="cat-tool-btn cat-tool-edit-btn" data-cat="${catIdx}" title="Modifier cette catégorie">
                  <i class="fa-solid fa-pen"></i>
                </button>
                ${
                  categories.length > 1
                    ? `<button type="button" class="cat-tool-btn danger cat-tool-del-btn" data-cat="${catIdx}" title="Supprimer la catégorie">
                         <i class="fa-solid fa-trash-can"></i>
                       </button>`
                    : ''
                }
              </div>`
              : ''
          }
        </div>

        <div class="link-list" data-cat="${catIdx}">
          ${
            cat.links.length === 0
              ? `
              <div class="empty-cat-placeholder" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; color: var(--text-muted); padding: 1.5rem; text-align: center;">
                <i class="fa-regular fa-folder-open" style="font-size: 1.8rem; opacity: 0.6;"></i>
                <span style="font-size: 0.8rem;">Aucun raccourci pour le moment.</span>
                ${
                  isEditMode
                    ? `<button type="button" class="cat-tool-btn primary link-item-add-quick" data-cat="${catIdx}" style="width: auto; padding: 0.35rem 0.75rem; gap: 0.4rem; font-size: 0.75rem;">
                         <i class="fa-solid fa-plus"></i> Ajouter un lien
                       </button>`
                    : ''
                }
              </div>
            `
              : cat.links
                  .map((link, linkIdx) => {
                    quickShortcuts.push({
                      catIdx,
                      linkIdx,
                      catTitle: cat.title,
                      name: link.name,
                      url: link.url,
                      icon: link.icon
                    });

                    return `
                    <a
                      href="${escapeHtml(link.url)}"
                      ${isEditMode ? '' : 'target="_blank" rel="noopener noreferrer"'}
                      class="link-item"
                      data-cat="${catIdx}"
                      data-link="${linkIdx}"
                      draggable="${isEditMode ? 'true' : 'false'}"
                    >
                      <div class="link-icon-box">
                        <i class="${link.icon || 'fa-solid fa-link'}"></i>
                      </div>
                      <div class="link-details">
                        <span class="link-name-text">${escapeHtml(link.name)}</span>
                      </div>
                      ${
                        isEditMode
                          ? `<button
                               type="button"
                               class="link-delete-badge"
                               data-del-cat="${catIdx}"
                               data-del-link="${linkIdx}"
                               title="Supprimer ce raccourci"
                             >
                               <i class="fa-solid fa-xmark"></i>
                             </button>`
                          : ''
                      }
                    </a>
                  `;
                  })
                  .join('')
          }
        </div>
      </div>
    `;
    })
    .join('');

  attachCategoryActionEvents();
  attachDragAndDropEvents();
}

function setEditMode(active) {
  isEditMode = Boolean(active);
  document.body.classList.toggle('customization-mode', isEditMode);
  document.body.classList.toggle('edit-mode-active', isEditMode);
  document.body.classList.toggle('bookmarks-edit-mode', isEditMode);

  const customBar = document.getElementById('customization-bar');
  if (customBar) customBar.hidden = !isEditMode;

  const toggleBtn = document.getElementById('toggle-customization-btn');
  if (toggleBtn) {
    toggleBtn.classList.toggle('active', isEditMode);
    toggleBtn.innerHTML = isEditMode ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-pen"></i>';
    toggleBtn.title = isEditMode ? 'Quitter le mode personnalisation' : 'Mode Personnalisation (Modifier/Ajouter/Supprimer)';
  }

  renderCategories();
}

function toggleEditMode() {
  setEditMode(!isEditMode);
}
window.setEditMode = setEditMode;
window.toggleEditMode = toggleEditMode;

function attachCategoryActionEvents() {
  document.querySelectorAll('.cat-tool-add-btn, .link-item-add-quick').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const catIdx = Number(btn.dataset.cat);
      openAddModal(catIdx);
    });
  });

  document.querySelectorAll('.cat-tool-edit-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const catIdx = Number(btn.dataset.cat);
      openCategoryModal(catIdx);
    });
  });

  document.querySelectorAll('.cat-tool-del-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const catIdx = Number(btn.dataset.cat);
      const catName = categories[catIdx]?.title || 'cette catégorie';
      if (confirm(`Voulez-vous vraiment supprimer la catégorie "${catName}" et tous ses raccourcis ?`)) {
        categories.splice(catIdx, 1);
        localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
        renderCategories();
        if (typeof renderHubShortcuts === 'function') renderHubShortcuts();
        if (typeof showToast === 'function') showToast(`Catégorie "${catName}" supprimée`, 'info');
      }
    });
  });

  document.querySelectorAll('.link-delete-badge').forEach((badge) => {
    badge.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const catIdx = Number(badge.dataset.delCat);
      const linkIdx = Number(badge.dataset.delLink);
      deleteBookmark(catIdx, linkIdx);
    });
  });
}

let lastDeletedBookmark = null;

function undoDeleteBookmark() {
  if (!lastDeletedBookmark) return false;
  const { catIdx, linkIdx, item } = lastDeletedBookmark;
  if (!categories[catIdx]) return false;
  categories[catIdx].links.splice(linkIdx, 0, item);
  lastDeletedBookmark = null;
  localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
  renderCategories();
  if (typeof renderHubShortcuts === 'function') renderHubShortcuts();
  if (typeof showToast === 'function') showToast(`Raccourci "${item.name}" restauré !`, 'success');
  return true;
}

function deleteBookmark(catIdx, linkIdx) {
  if (!categories[catIdx] || !categories[catIdx].links[linkIdx]) return;
  const item = categories[catIdx].links[linkIdx];
  lastDeletedBookmark = { catIdx, linkIdx, item };
  categories[catIdx].links.splice(linkIdx, 1);
  localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
  renderCategories();
  if (typeof renderHubShortcuts === 'function') renderHubShortcuts();
  if (typeof showToast === 'function') {
    showToast(`Raccourci "${item.name}" supprimé. (Ctrl+Z pour annuler)`, 'info');
  }
}

function attachDragAndDropEvents() {
  const linkItems = document.querySelectorAll('.link-item[draggable="true"]');
  const linkLists = document.querySelectorAll('.link-list');

  linkItems.forEach((item) => {
    item.addEventListener('dragstart', (e) => {
      didDragOccur = true;
      const catIdx = Number(item.dataset.cat);
      const linkIdx = Number(item.dataset.link);
      draggedData = { catIdx, linkIdx };
      item.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
      try {
        e.dataTransfer.setData('text/plain', JSON.stringify(draggedData));
      } catch {}
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('is-dragging');
      document.querySelectorAll('.drag-over-top, .drag-over-bottom, .is-drag-target').forEach((el) => {
        el.classList.remove('drag-over-top', 'drag-over-bottom', 'is-drag-target');
      });
      setTimeout(() => {
        didDragOccur = false;
        draggedData = null;
      }, 50);
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';

      const rect = item.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const isTop = e.clientY < midY;

      item.classList.toggle('drag-over-top', isTop);
      item.classList.toggle('drag-over-bottom', !isTop);
    });

    item.addEventListener('dragleave', (e) => {
      if (!item.contains(e.relatedTarget)) {
        item.classList.remove('drag-over-top', 'drag-over-bottom');
      }
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      item.classList.remove('drag-over-top', 'drag-over-bottom');

      if (!draggedData) return;
      const targetCatIdx = Number(item.dataset.cat);
      const targetLinkIdx = Number(item.dataset.link);
      const rect = item.getBoundingClientRect();
      const isTop = e.clientY < rect.top + rect.height / 2;

      moveBookmark(draggedData.catIdx, draggedData.linkIdx, targetCatIdx, targetLinkIdx, isTop);
    });
  });

  linkLists.forEach((list) => {
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      list.classList.add('is-drag-target');
    });

    list.addEventListener('dragleave', (e) => {
      if (!list.contains(e.relatedTarget)) {
        list.classList.remove('is-drag-target');
      }
    });

    list.addEventListener('drop', (e) => {
      if (e.target.closest('.link-item')) return;
      e.preventDefault();
      list.classList.remove('is-drag-target');

      if (!draggedData) return;
      const targetCatIdx = Number(list.dataset.cat);
      moveBookmark(draggedData.catIdx, draggedData.linkIdx, targetCatIdx, categories[targetCatIdx].links.length, false);
    });
  });
}

function moveBookmark(srcCat, srcLink, dstCat, dstLink, insertBefore) {
  if (srcCat === dstCat && srcLink === dstLink) return;

  const itemToMove = categories[srcCat].links[srcLink];
  categories[srcCat].links.splice(srcLink, 1);

  let insertionIndex = dstLink;
  if (srcCat === dstCat && srcLink < dstLink) {
    insertionIndex -= 1;
  }
  if (!insertBefore && insertionIndex < categories[dstCat].links.length) {
    insertionIndex += 1;
  }
  if (insertionIndex < 0) insertionIndex = 0;
  if (insertionIndex > categories[dstCat].links.length) insertionIndex = categories[dstCat].links.length;

  categories[dstCat].links.splice(insertionIndex, 0, itemToMove);
  localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
  renderCategories();
}

function openAddModal(catIdx = 0) {
  openEditModal(catIdx, null);
}

function openEditModal(catIdx, linkIdx) {
  const editModal = document.getElementById('edit-modal');
  const modalTitle = document.getElementById('edit-modal-title');
  const editNameInput = document.getElementById('edit-name');
  const editUrlInput = document.getElementById('edit-url');
  const editIconInput = document.getElementById('edit-icon');
  const deleteBtn = document.getElementById('modal-delete-shortcut-btn');
  const submitBtn = document.getElementById('modal-submit-btn');
  const catSelect = document.getElementById('edit-category-select');

  currentEditingTarget = { catIdx: (catIdx !== null ? catIdx : 0), linkIdx };

  // Remplir le sélecteur de catégorie si présent
  if (catSelect) {
    catSelect.innerHTML = categories.map((c, i) => `<option value="${i}">${escapeHtml(c.title)}</option>`).join('');
    catSelect.value = String(currentEditingTarget.catIdx);
  }

  if (linkIdx !== null) {
    // Modification
    const data = categories[catIdx]?.links[linkIdx];
    if (modalTitle) modalTitle.textContent = 'Modifier le raccourci';
    if (editNameInput) editNameInput.value = data?.name || '';
    if (editUrlInput) editUrlInput.value = data?.url || '';
    if (editIconInput) editIconInput.value = data?.icon || 'fa-solid fa-link';
    updateIconPreview(data?.icon || 'fa-solid fa-link');
    if (deleteBtn) deleteBtn.hidden = false;
    if (submitBtn) submitBtn.textContent = 'Enregistrer';
  } else {
    // Ajout
    if (modalTitle) modalTitle.textContent = 'Ajouter un raccourci';
    if (editNameInput) editNameInput.value = '';
    if (editUrlInput) editUrlInput.value = '';
    if (editIconInput) editIconInput.value = 'fa-solid fa-link';
    updateIconPreview('fa-solid fa-link');
    if (deleteBtn) deleteBtn.hidden = true;
    if (submitBtn) submitBtn.textContent = 'Ajouter';
  }

  if (editModal) {
    editModal.hidden = false;
    editModal.classList.add('visible');
    setTimeout(() => {
      if (editNameInput) editNameInput.focus();
    }, 50);
  }
}

function closeEditModal() {
  const editModal = document.getElementById('edit-modal');
  if (editModal) {
    editModal.hidden = true;
    editModal.classList.remove('visible');
  }
  currentEditingTarget = { catIdx: null, linkIdx: null };
}

function updateIconPreview(cls) {
  const editIconPreview = document.getElementById('edit-icon-preview');
  if (editIconPreview) {
    editIconPreview.innerHTML = `<i class="${cls || 'fa-solid fa-link'}"></i>`;
  }
}

function openCategoryModal(catIdx = null) {
  const modal = document.getElementById('category-modal');
  const titleEl = document.getElementById('cat-modal-title');
  const nameInput = document.getElementById('cat-modal-name');
  const iconInput = document.getElementById('cat-modal-icon');
  const preview = document.getElementById('cat-modal-icon-preview');

  currentEditingCategoryIdx = catIdx;

  if (catIdx !== null && categories[catIdx]) {
    const cat = categories[catIdx];
    if (titleEl) titleEl.textContent = 'Modifier la catégorie';
    if (nameInput) nameInput.value = cat.title;
    if (iconInput) iconInput.value = cat.icon || 'fa-solid fa-folder';
    if (preview) preview.innerHTML = `<i class="${cat.icon || 'fa-solid fa-folder'}"></i>`;
  } else {
    if (titleEl) titleEl.textContent = 'Nouvelle catégorie';
    if (nameInput) nameInput.value = '';
    if (iconInput) iconInput.value = 'fa-solid fa-folder';
    if (preview) preview.innerHTML = '<i class="fa-solid fa-folder"></i>';
  }

  if (modal) {
    modal.hidden = false;
    modal.classList.add('visible');
    setTimeout(() => {
      if (nameInput) nameInput.focus();
    }, 50);
  }
}

function closeCategoryModal() {
  const modal = document.getElementById('category-modal');
  if (modal) {
    modal.hidden = true;
    modal.classList.remove('visible');
  }
  currentEditingCategoryIdx = null;
}

// ========================================================
// EXPORT & IMPORT DE LA CONFIGURATION
// ========================================================
function exportFullConfig() {
  let appearanceData = null;
  try {
    const a = localStorage.getItem('startpage_appearance');
    if (a) appearanceData = JSON.parse(a);
  } catch {}

  let animSettingsData = null;
  try {
    const s = localStorage.getItem('startpage_anim_settings');
    if (s) animSettingsData = JSON.parse(s);
  } catch {}

  let userCustomThemesData = null;
  try {
    const ct = localStorage.getItem('startpage_user_custom_themes');
    if (ct) userCustomThemesData = JSON.parse(ct);
  } catch {}

  let sidebarSettingsData = null;
  try {
    const sb = localStorage.getItem('startpage_sidebar_custom_settings');
    if (sb) sidebarSettingsData = JSON.parse(sb);
  } catch {}

  const config = {
    version: '6.0',
    exportDate: new Date().toISOString(),
    theme: localStorage.getItem('startpage_theme') || '4',
    categories,
    appearance: appearanceData,
    animSettings: animSettingsData,
    customThemes: userCustomThemesData,
    sidebarSettings: sidebarSettingsData
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
  const downloadAnchor = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `startpage_backup_${today}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  if (typeof showToast === 'function') {
    showToast('Sauvegarde exportée avec succès !', 'success');
  }
}

function importFullConfig(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      if (Array.isArray(data.categories) && data.categories.length > 0) {
        categories = data.categories;
        localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
        renderCategories();
      }

      if (data.appearance) {
        localStorage.setItem('startpage_appearance', JSON.stringify(data.appearance));
        if (typeof loadAppearanceSettings === 'function') loadAppearanceSettings();
        if (typeof applyAppearance === 'function') applyAppearance();
      }

      if (data.theme && typeof applyTheme === 'function') {
        applyTheme(data.theme);
      }

      if (data.animSettings && typeof saveAnimationSettings === 'function') {
        saveAnimationSettings(data.animSettings);
      }

      if (data.customThemes) {
        localStorage.setItem('startpage_user_custom_themes', JSON.stringify(data.customThemes));
        if (typeof renderUserCustomThemes === 'function') renderUserCustomThemes();
      }

      if (data.sidebarSettings && typeof saveSidebarSettings === 'function') {
        saveSidebarSettings(data.sidebarSettings);
      }

      if (typeof showToast === 'function') {
        showToast('Configuration complète restaurée avec succès !', 'success');
      }
    } catch (err) {
      if (typeof showToast === 'function') {
        showToast('Erreur : fichier JSON non valide ou corrompu', 'error');
      }
    }
  };

  reader.readAsText(file);
}

// ========================================================
// INITIALISATION DU MODULE BOOKMARKS
// ========================================================
function initBookmarks() {
  try {
    const saved = localStorage.getItem('startpage_categories_v1');
    categories = saved ? JSON.parse(saved) : structuredClone(defaultCategories);
  } catch {
    categories = structuredClone(defaultCategories);
  }

  renderCategories();

  const editModal = document.getElementById('edit-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const deleteShortcutBtn = document.getElementById('modal-delete-shortcut-btn');
  const editForm = document.getElementById('edit-shortcut-form');
  const editNameInput = document.getElementById('edit-name');
  const editUrlInput = document.getElementById('edit-url');
  const editIconInput = document.getElementById('edit-icon');
  const catSelect = document.getElementById('edit-category-select');
  const categoriesContainer = document.getElementById('categories-container');

  // Boutons du mode personnalisation
  const toggleCustomizationBtn = document.getElementById('toggle-customization-btn');
  if (toggleCustomizationBtn) {
    toggleCustomizationBtn.addEventListener('click', () => {
      toggleEditMode();
      if (typeof showToast === 'function') {
        showToast(isEditMode ? 'Mode Personnalisation activé' : 'Mode Normal activé', 'info');
      }
    });
  }

  const customDoneBtn = document.getElementById('customization-done-btn');
  if (customDoneBtn) {
    customDoneBtn.addEventListener('click', () => {
      setEditMode(false);
      if (typeof showToast === 'function') {
        showToast('Mode Normal activé', 'info');
      }
    });
  }

  const customAddCatBtn = document.getElementById('customization-add-category-btn');
  if (customAddCatBtn) {
    customAddCatBtn.addEventListener('click', () => {
      openCategoryModal(null);
    });
  }

  // Boutons d'ajout global
  const topbarAddBtn = document.getElementById('topbar-add-shortcut-btn');
  const bookmarksAddBtn = document.getElementById('bookmarks-add-link-btn');

  if (topbarAddBtn) {
    topbarAddBtn.addEventListener('click', () => openAddModal(0));
  }
  if (bookmarksAddBtn) {
    bookmarksAddBtn.addEventListener('click', () => openAddModal(0));
  }

  // Modale de catégorie
  const catModal = document.getElementById('category-modal');
  const catModalCloseBtn = document.getElementById('cat-modal-close');
  const catModalCancelBtn = document.getElementById('cat-modal-cancel');
  const catModalForm = document.getElementById('category-form');
  const catNameInput = document.getElementById('cat-modal-name');
  const catIconInput = document.getElementById('cat-modal-icon');
  const catIconPreview = document.getElementById('cat-modal-icon-preview');
  const resetAllBtn = document.getElementById('reset-all-shortcuts-btn');

  // Clic sur un lien en mode édition
  if (categoriesContainer) {
    categoriesContainer.addEventListener('click', (e) => {
      if (!isEditMode) return;
      if (didDragOccur) return;

      if (e.target.closest('.link-delete-badge') || e.target.closest('.cat-tool-btn') || e.target.closest('.link-item-add-quick')) {
        return;
      }

      const linkEl = e.target.closest('.link-item');
      if (!linkEl) return;

      e.preventDefault();
      const catIdx = Number(linkEl.dataset.cat);
      const linkIdx = Number(linkEl.dataset.link);
      openEditModal(catIdx, linkIdx);
    });
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeEditModal);
  if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeEditModal);

  if (deleteShortcutBtn) {
    deleteShortcutBtn.addEventListener('click', () => {
      const { catIdx, linkIdx } = currentEditingTarget;
      if (catIdx !== null && linkIdx !== null) {
        deleteBookmark(catIdx, linkIdx);
        closeEditModal();
      }
    });
  }

  if (editModal) {
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) closeEditModal();
    });
  }

  if (editIconInput) {
    editIconInput.addEventListener('input', () => {
      updateIconPreview(editIconInput.value.trim());
    });
  }

  document.querySelectorAll('.q-icon-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const iconCls = btn.dataset.icon;
      if (editIconInput) {
        editIconInput.value = iconCls;
        updateIconPreview(iconCls);
      }
    });
  });

  // Formulaire d'édition de raccourci
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let targetCatIdx = currentEditingTarget.catIdx;
      if (catSelect) {
        targetCatIdx = parseInt(catSelect.value, 10);
      }
      if (targetCatIdx === null || isNaN(targetCatIdx) || !categories[targetCatIdx]) {
        targetCatIdx = 0;
      }

      const newBookmark = {
        name: editNameInput.value.trim(),
        url: editUrlInput.value.trim(),
        icon: editIconInput.value.trim() || 'fa-solid fa-link'
      };

      const { linkIdx } = currentEditingTarget;
      if (linkIdx === null) {
        // Ajout
        categories[targetCatIdx].links.push(newBookmark);
        if (typeof showToast === 'function') {
          showToast(`Nouveau raccourci "${newBookmark.name}" ajouté !`, 'success');
        }
      } else {
        // Modification (vérifier si la catégorie a changé)
        const oldCatIdx = currentEditingTarget.catIdx;
        if (oldCatIdx !== targetCatIdx) {
          categories[oldCatIdx].links.splice(linkIdx, 1);
          categories[targetCatIdx].links.push(newBookmark);
        } else {
          categories[targetCatIdx].links[linkIdx] = newBookmark;
        }
        if (typeof showToast === 'function') {
          showToast(`Raccourci "${newBookmark.name}" mis à jour`, 'success');
        }
      }

      localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
      renderCategories();
      if (typeof renderHubShortcuts === 'function') renderHubShortcuts();
      closeEditModal();
    });
  }

  // Formulaire de catégorie
  if (catModalCloseBtn) catModalCloseBtn.addEventListener('click', closeCategoryModal);
  if (catModalCancelBtn) catModalCancelBtn.addEventListener('click', closeCategoryModal);
  if (catModal) {
    catModal.addEventListener('click', (e) => {
      if (e.target === catModal) closeCategoryModal();
    });
  }

  if (catIconInput) {
    catIconInput.addEventListener('input', () => {
      if (catIconPreview) catIconPreview.innerHTML = `<i class="${catIconInput.value.trim() || 'fa-solid fa-folder'}"></i>`;
    });
  }

  document.querySelectorAll('.q-cat-icon-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const iconCls = btn.dataset.icon;
      if (catIconInput) catIconInput.value = iconCls;
      if (catIconPreview) catIconPreview.innerHTML = `<i class="${iconCls}"></i>`;
    });
  });

  if (catModalForm) {
    catModalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = (catNameInput?.value || '').trim();
      const icon = (catIconInput?.value || '').trim() || 'fa-solid fa-folder';
      if (!title) return;

      if (currentEditingCategoryIdx !== null && categories[currentEditingCategoryIdx]) {
        // Mise à jour
        categories[currentEditingCategoryIdx].title = title;
        categories[currentEditingCategoryIdx].icon = icon;
        if (typeof showToast === 'function') {
          showToast(`Catégorie "${title}" mise à jour`, 'success');
        }
      } else {
        // Nouvelle catégorie
        categories.push({
          id: `cat_${Date.now()}`,
          title,
          icon,
          links: []
        });
        if (typeof showToast === 'function') {
          showToast(`Catégorie "${title}" créée avec succès !`, 'success');
        }
      }

      localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
      renderCategories();
      if (typeof renderHubShortcuts === 'function') renderHubShortcuts();
      closeCategoryModal();
    });
  }

  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', () => {
      if (confirm("Voulez-vous vraiment restaurer tous les raccourcis d'origine ?")) {
        categories = structuredClone(defaultCategories);
        localStorage.setItem('startpage_categories_v1', JSON.stringify(categories));
        renderCategories();
        if (typeof renderHubShortcuts === 'function') renderHubShortcuts();
        closeEditModal();
        if (typeof showToast === 'function') {
          showToast('Raccourcis par défaut restaurés', 'info');
        }
      }
    });
  }
}
