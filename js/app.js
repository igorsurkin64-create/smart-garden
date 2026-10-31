/**
 * Основной контроллер приложения "Умный Огород: Севооборот и Планирование"
 */

class GardenApp {
  constructor() {
    this.storage = new GardenStorage();
    this.advisor = new RotationAdvisor(this.storage);
    this.currentTab = 'map'; // 'map' | 'table' | 'encyclopedia' | 'planner'
    this.activeCropFilter = 'all';
    this.searchQuery = '';
    this.activeInspectorBedId = null;

    this.init();
  }

  init() {
    this.setupTheme();
    this.setupLanguageSwitcher();
    this.renderHeaderControls();
    this.initGardenMap();
    this.setupTabNavigation();
    this.setupEventListeners();
    this.setupPwa();
    this.setupBackupReminder();
    this.renderActiveTab();

    // Слушаем изменение данных
    window.addEventListener('garden-data-changed', () => {
      this.refreshCurrentView();
      // Мягко планируем проверку напоминания после сохранения изменений
      clearTimeout(this._backupReminderDebounce);
      this._backupReminderDebounce = setTimeout(() => {
        this.checkBackupReminder();
      }, 6000);
    });

    // Слушаем смену языка
    window.addEventListener('language-changed', () => {
      this.updateLanguageUI();
      this.renderHeaderControls();
      this.refreshCurrentView();
      if (this.gardenMap) {
        this.gardenMap.render();
      }
      if (this.activeInspectorBedId) {
        this.openBedInspector(this.activeInspectorBedId, this.activeInspectorSectionId);
      }
    });
  }

  setupTheme() {
    const savedTheme = localStorage.getItem('garden_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeButton(savedTheme === 'dark');
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('garden_theme', next);
    this.updateThemeButton(next === 'dark');
  }

  updateThemeButton(isDark) {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (!themeBtn) return;
    const titleText = isDark 
      ? (window.t ? window.t('theme_light') : '☀️ Светлая тема')
      : (window.t ? window.t('theme_dark') : '🌙 Тёмная тема');
    themeBtn.setAttribute('title', titleText);
    themeBtn.setAttribute('aria-label', titleText);
    const iconSpan = themeBtn.querySelector('.theme-icon');
    if (iconSpan) {
      iconSpan.textContent = isDark ? '☀️' : '🌙';
    } else {
      themeBtn.innerHTML = isDark ? '<span class="theme-icon">☀️</span>' : '<span class="theme-icon">🌙</span>';
    }
  }

  setupLanguageSwitcher() {
    const wrap = document.getElementById('lang-selector-wrap');
    const menuBtn = document.getElementById('lang-menu-btn');
    const dropdown = document.getElementById('lang-dropdown');
    const currentFlag = document.getElementById('current-lang-flag');
    const currentCode = document.getElementById('current-lang-code');

    if (!wrap || !menuBtn || !dropdown) return;

    const supported = typeof SUPPORTED_LANGUAGES !== 'undefined' ? SUPPORTED_LANGUAGES : [
      { code: 'ru', name: 'Русский', flag: '🇷🇺', short: 'RU' },
      { code: 'et', name: 'Eesti', flag: '🇪🇪', short: 'ET' },
      { code: 'lv', name: 'Latviešu', flag: '🇱🇻', short: 'LV' },
      { code: 'lt', name: 'Lietuvių', flag: '🇱🇹', short: 'LT' }
    ];

    const updateWidgetDisplay = () => {
      const currentLang = window.i18n ? window.i18n.getLanguage() : 'ru';
      const langObj = supported.find(l => l.code === currentLang) || supported[0];
      if (currentFlag) currentFlag.textContent = langObj.flag;
      if (currentCode) currentCode.textContent = langObj.short;

      dropdown.querySelectorAll('.lang-option').forEach(btn => {
        const isSelected = btn.getAttribute('data-lang') === currentLang;
        btn.classList.toggle('active', isSelected);
      });
    };

    updateWidgetDisplay();

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrap.classList.toggle('open');
      dropdown.hidden = !isOpen;
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    dropdown.querySelectorAll('.lang-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = btn.getAttribute('data-lang');
        if (lang && window.i18n) {
          window.i18n.setLanguage(lang);
          updateWidgetDisplay();
          this.showToast(window.t('toast_lang_changed'));
        }
        wrap.classList.remove('open');
        dropdown.hidden = true;
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) {
        wrap.classList.remove('open');
        dropdown.hidden = true;
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Первоначальное применение переводов к DOM
    if (window.i18n) {
      window.i18n.applyToDOM();
    }
  }

  updateLanguageUI() {
    if (window.i18n) {
      window.i18n.applyToDOM();
    }
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    this.updateThemeButton(current === 'dark');
  }

  initGardenMap() {
    this.gardenMap = new GardenMap(
      'garden-map-container',
      this.storage,
      (bed, sectionId) => {
        if (bed) {
          this.openBedInspector(bed.id, sectionId);
        } else {
          this.closeBedInspector();
        }
      },
      (action) => {
        this.handleEmptyMapAction(action);
      }
    );
    this.gardenMap.app = this;
  }

  closeBedInspector() {
    const drawer = document.getElementById('bed-inspector-drawer');
    if (drawer) drawer.classList.remove('open');
    const backdrop = document.getElementById('bed-inspector-backdrop');
    if (backdrop) backdrop.classList.remove('active');
    this.activeInspectorBedId = null;
    this.activeInspectorSectionId = null;
    if (this.gardenMap) {
      this.gardenMap.render();
    }
  }

  showConfirmModal({ title, icon = '🗑️', message, confirmText = 'Подтвердить', confirmClass = 'btn-danger', onConfirm, onCancel }) {
    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) {
      if (confirm(message.replace(/<[^>]*>/g, ''))) {
        if (onConfirm) onConfirm();
      }
      return;
    }

    modalContent.innerHTML = `
      <div class="modal-card modal-confirm-card" style="max-width: 440px;">
        <div class="modal-header">
          <h3>${icon} ${escapeHtml(title)}</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p class="confirm-message" style="font-size: 0.95rem; line-height: 1.5; color: var(--text-main); margin: 0.5rem 0;">${message}</p>
        </div>
        <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 8px;">
          <button class="btn btn-outline" id="confirm-modal-cancel">Отмена</button>
          <button class="btn ${confirmClass}" id="confirm-modal-ok">${escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;

    modal.classList.add('active');

    const closeModal = () => {
      modal.classList.remove('active');
    };

    modalContent.querySelector('.modal-close-btn').addEventListener('click', () => {
      closeModal();
      if (onCancel) onCancel();
    });

    const cancelBtn = document.getElementById('confirm-modal-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        closeModal();
        if (onCancel) onCancel();
      });
    }

    const okBtn = document.getElementById('confirm-modal-ok');
    if (okBtn) {
      okBtn.addEventListener('click', () => {
        closeModal();
        if (onConfirm) onConfirm();
      });
    }
  }

  renderHeaderControls() {
    // 1. Года
    const yearsContainer = document.getElementById('years-bar');
    if (!yearsContainer) return;

    const data = this.storage.getData();
    const activeYear = this.storage.getActiveYear();
    const sortedYears = [...data.years].sort((a, b) => a - b);
    const tr = (k) => (typeof window !== 'undefined' && window.t ? window.t(k) : null);
    const yearSuffix = (typeof window !== 'undefined' && window.i18n) 
      ? (window.i18n.getLanguage() === 'et' ? ' a' : (window.i18n.getLanguage() === 'ru' ? ' г.' : ' g.'))
      : ' г.';

    let html = '';
    sortedYears.forEach(year => {
      const isActive = year === activeYear;
      html += `
        <button class="year-btn ${isActive ? 'active' : ''}" data-year="${year}">
          ${year}${yearSuffix} ${isActive ? '<span class="active-dot">●</span>' : ''}
        </button>
      `;
    });

    const addSeasonText = tr('btn_add_season') || '+ Сезон';
    html += `
      <button class="year-btn add-year-btn" id="add-year-btn" title="${escapeHtml(addSeasonText)}">
        ${escapeHtml(addSeasonText)}
      </button>
    `;

    yearsContainer.innerHTML = html;

    // Вешаем клики по годам
    yearsContainer.querySelectorAll('.year-btn[data-year]').forEach(btn => {
      btn.addEventListener('click', () => {
        const y = parseInt(btn.getAttribute('data-year'), 10);
        this.storage.setActiveYear(y);
        this.renderHeaderControls();
        this.refreshCurrentView();
        this.showToast(`Выбран сезон: ${y} год`);
      });
    });

    const addYearBtn = document.getElementById('add-year-btn');
    if (addYearBtn) {
      addYearBtn.addEventListener('click', () => this.promptAddYear());
    }
  }

  promptAddYear() {
    const data = this.storage.getData();
    const maxYear = Math.max(...data.years, 2026);
    const nextYear = maxYear + 1;

    const yearInput = prompt(`Введите новый год для планирования посадок:`, nextYear);
    if (yearInput) {
      const y = parseInt(yearInput, 10);
      if (y >= 2000 && y <= 2100) {
        const added = this.storage.addYear(y);
        if (added) {
          this.storage.setActiveYear(y);
          this.renderHeaderControls();
          this.refreshCurrentView();
          this.showToast(`Добавлен новый сезон: ${y} год!`);
        } else {
          this.showToast(`Сезон ${y} уже существует.`);
        }
      } else {
        alert('Пожалуйста, введите корректный год (например, 2027).');
      }
    }
  }

  setupTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentTab = tab.getAttribute('data-tab');
        this.renderActiveTab();
      });
    });

    const backdrop = document.getElementById('bed-inspector-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        this.closeBedInspector();
      });
    }
  }

  renderActiveTab() {
    // Синхронизируем активные вкладки в нижней панели и мобильном меню
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-tab') === this.currentTab);
    });
    document.querySelectorAll('.mobile-view-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === this.currentTab);
    });

    // Скрываем все виды
    document.getElementById('view-map').style.display = 'none';
    document.getElementById('view-table').style.display = 'none';
    document.getElementById('view-encyclopedia').style.display = 'none';
    document.getElementById('view-planner').style.display = 'none';

    if (this.currentTab === 'map') {
      document.getElementById('view-map').style.display = 'flex';
      this.gardenMap.render();
      setTimeout(() => {
        this.gardenMap.fitPlotToView();
      }, 50);
    } else if (this.currentTab === 'table') {
      document.getElementById('view-table').style.display = 'block';
      this.renderTableView();
    } else if (this.currentTab === 'encyclopedia') {
      document.getElementById('view-encyclopedia').style.display = 'block';
      this.renderEncyclopediaView();
    } else if (this.currentTab === 'planner') {
      document.getElementById('view-planner').style.display = 'block';
      this.renderRotationGuideView();
    }
  }

  refreshCurrentView() {
    this.renderHeaderControls();
    if (this.currentTab === 'map') {
      this.gardenMap.render();
    } else if (this.currentTab === 'table') {
      this.renderTableView();
    }
    // Если открыт инспектор грядки — обновляем его
    if (this.activeInspectorBedId) {
      this.openBedInspector(this.activeInspectorBedId, this.activeInspectorSectionId);
    }
  }

  renderTableView() {
    const container = document.getElementById('table-view-container');
    if (!container) return;
    container.innerHTML = this.advisor.renderSummaryTable();

    // Вешаем клики на кнопки редактирования
    container.querySelectorAll('.edit-bed-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const bedId = btn.getAttribute('data-bed-id');
        const sectionId = btn.getAttribute('data-section-id') || null;
        this.openBedInspector(bedId, sectionId);
      });
    });
  }

  // --- Вынесено в отдельный модуль: renderEncyclopediaView ---

  // --- Вынесено в отдельный модуль: renderRotationGuideView ---

  // --- Вынесено в отдельный модуль js/app-inspector.js: openBedInspector, setupCropCombobox, openCreateCropModal ---

  // --- Вынесено в отдельный модуль: printGardenPlan ---

  // --- Вынесено в отдельный модуль: openSeasonCalendarModal ---

  // --- Вынесено в отдельный модуль: openAutoPlanModal ---

  // --- Вынесено в отдельный модуль: setupInspectorWaterCalculator ---

  // --- Вынесено в отдельный модуль: setupInspectorCareLog ---

  // --- Вынесено в отдельный модуль: setupInspectorPhotos ---

  // --- Вынесено в отдельный модуль: compressPhotoFile ---

  // --- Вынесено в отдельный модуль: openPhotoLightbox ---

  // --- Вынесено в отдельный модуль: openGardenWaterModal ---

  // --- Вынесено в отдельный модуль: openStorageFullModal ---

  setupEventListeners() {
    // Закрытие модального окна по клику на затемненный фон (любое случайное зависание)
    const generalModal = document.getElementById('general-modal');
    if (generalModal) {
      generalModal.addEventListener('click', (e) => {
        if (e.target === generalModal || e.target.id === 'modal-dynamic-content') {
          generalModal.classList.remove('active');
        }
      });
    }

    // Переключатель темы
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Кнопка добавления новой грядки
    const addBedBtn = document.getElementById('add-bed-btn');
    if (addBedBtn) {
      addBedBtn.addEventListener('click', () => this.openAddBedModal());
    }

    // Очистить весь план (начать строить огород с чистого листа)
    const clearPlanBtn = document.getElementById('clear-plan-btn');
    if (clearPlanBtn) {
      clearPlanBtn.addEventListener('click', () => this.confirmClearPlan());
    }

    // Загрузить демонстрационный пример грядок
    const resetDemoBtn = document.getElementById('reset-demo-btn');
    if (resetDemoBtn) {
      resetDemoBtn.addEventListener('click', () => this.confirmResetDemo());
    }

    // Кнопка показа предшественников (прошлый год) на карте
    const toggleGhostBtn = document.getElementById('toggle-ghost-btn');
    if (toggleGhostBtn) {
      toggleGhostBtn.addEventListener('click', () => {
        const isShown = this.gardenMap.togglePreviousYearOverlay();
        toggleGhostBtn.classList.toggle('active', isShown);
        const msg = isShown
          ? (window.t ? window.t('toast_overlay_on') : '🕰️ Режим предшественников: показано, что росло в прошлом году')
          : (window.t ? window.t('toast_overlay_off') : 'Режим сравнения выключен');
        this.showToast(msg);
      });
    }

    // Фильтр по грядкам на карте
    const filterSelect = document.getElementById('map-filter-select');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.gardenMap.setFilter(e.target.value);
      });
    }

    // Резервная копия и база данных
    const dbModalBtn = document.getElementById('db-modal-btn');
    if (dbModalBtn) {
      dbModalBtn.addEventListener('click', () => this.openDbModal());
    }

    // Руководство пользователя / Инструкция
    const helpModalBtn = document.getElementById('help-modal-btn');
    if (helpModalBtn) {
      helpModalBtn.addEventListener('click', () => this.openHelpModal());
    }

    // Поддержка автора
    const donateModalBtn = document.getElementById('donate-modal-btn');
    if (donateModalBtn) {
      donateModalBtn.addEventListener('click', () => this.openDonateModal());
    }

    // Обратная связь и предложения
    const feedbackModalBtn = document.getElementById('feedback-modal-btn');
    if (feedbackModalBtn) {
      feedbackModalBtn.addEventListener('click', () => this.openFeedbackModal());
    }

    // PWA Установка на устройство
    const pwaInstallBtn = document.getElementById('pwa-install-btn');
    if (pwaInstallBtn) {
      pwaInstallBtn.addEventListener('click', () => this.promptPwaInstall());
    }

    // Печать плана А4 и памятки огородника
    const printPlanBtn = document.getElementById('print-plan-btn');
    if (printPlanBtn) {
      printPlanBtn.addEventListener('click', () => this.printGardenPlan());
    }
    const toolbarPrintBtn = document.getElementById('toolbar-print-btn');
    if (toolbarPrintBtn) {
      toolbarPrintBtn.addEventListener('click', () => this.printGardenPlan());
    }

    // Календарь сезона
    const seasonCalBtn = document.getElementById('season-calendar-btn');
    if (seasonCalBtn) {
      seasonCalBtn.addEventListener('click', () => this.openSeasonCalendarModal());
    }
    const toolbarCalBtn = document.getElementById('toolbar-calendar-btn');
    if (toolbarCalBtn) {
      toolbarCalBtn.addEventListener('click', () => this.openSeasonCalendarModal());
    }

    // Умный авто-севооборот в 1 клик
    const autoPlanBtn = document.getElementById('auto-plan-btn');
    if (autoPlanBtn) {
      autoPlanBtn.addEventListener('click', () => this.openAutoPlanModal());
    }
    const toolbarAutoBtn = document.getElementById('toolbar-auto-plan-btn');
    if (toolbarAutoBtn) {
      toolbarAutoBtn.addEventListener('click', () => this.openAutoPlanModal());
    }

    // Калькулятор расхода воды и полива
    const waterBtn = document.getElementById('garden-water-btn');
    if (waterBtn) {
      waterBtn.addEventListener('click', () => this.openGardenWaterModal());
    }
    const toolbarWaterBtn = document.getElementById('toolbar-water-btn');
    if (toolbarWaterBtn) {
      toolbarWaterBtn.addEventListener('click', () => this.openGardenWaterModal());
    }

    // Картотека сортов с фотографиями
    const varietiesBtn = document.getElementById('varieties-catalog-btn');
    if (varietiesBtn) {
      varietiesBtn.addEventListener('click', () => this.openVarietyCatalogModal());
    }

    // Выпадающее меню дополнительных действий
    this.setupHeaderMenu();

    // Полноэкранный режим карты (Zen Mode)
    this.setupZenMode();

    // Мобильное меню для смартфонов
    this.initMobileMenu();
  }

  setupHeaderMenu() {
    const wrap = document.getElementById('header-menu-wrap');
    const btn = document.getElementById('header-menu-btn');
    const dropdown = document.getElementById('header-menu-dropdown');
    if (!wrap || !btn || !dropdown) return;

    const toggle = (force) => {
      const isCurrentlyHidden = dropdown.hidden;
      const willShow = force !== undefined ? force : isCurrentlyHidden;
      dropdown.hidden = !willShow;
      wrap.classList.toggle('open', willShow);
      btn.setAttribute('aria-expanded', willShow ? 'true' : 'false');
    };

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });

    dropdown.addEventListener('click', (e) => {
      if (e.target.closest('button')) {
        toggle(false);
      }
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) {
        toggle(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !dropdown.hidden) {
        toggle(false);
      }
    });
  }

  setupZenMode() {
    const zenBtn = document.getElementById('toggle-zen-btn');
    const appContainer = document.querySelector('.app-container');
    if (!zenBtn || !appContainer) return;

    const updateZenBtnText = (isZen) => {
      const icon = zenBtn.querySelector('.zen-btn-icon');
      const text = zenBtn.querySelector('.zen-btn-text');
      if (icon) icon.textContent = isZen ? '🗗' : '⛶';
      if (text) text.textContent = isZen 
        ? (window.t ? window.t('btn_exit_zen') : 'Свернуть экран')
        : (window.t ? window.t('btn_zen_mode') : 'Во весь экран');
      const title = isZen
        ? (window.t ? window.t('btn_exit_zen') : 'Свернуть полноэкранный режим')
        : (window.t ? window.t('btn_zen_title') : 'Развернуть карту на весь экран (скрыть верхние меню для максимального поля грядок)');
      zenBtn.setAttribute('title', title);
    };

    const toggleZen = (force) => {
      const isZen = force !== undefined ? force : !appContainer.classList.contains('zen-mode');
      appContainer.classList.toggle('zen-mode', isZen);
      zenBtn.classList.toggle('active', isZen);
      updateZenBtnText(isZen);

      if (isZen) {
        this.showToast(window.t ? window.t('toast_zen_on') : '⛶ Карта развёрнута на весь экран! Нажмите «Свернуть» или Esc для возврата меню');
      }

      // Пересчитать масштабирование грядок под максимальный вьюпорт
      setTimeout(() => {
        if (this.gardenMap) {
          this.gardenMap.fitPlotToView(true);
        }
      }, 120);
    };

    zenBtn.addEventListener('click', () => toggleZen());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('general-modal');
        if (modal && modal.classList.contains('active')) {
          modal.classList.remove('active');
          return;
        }
        const drawer = document.getElementById('bed-inspector-drawer');
        if (drawer && drawer.classList.contains('open')) {
          this.closeBedInspector();
          if (this.gardenMap) {
            this.gardenMap.selectBed(null, null);
          }
          return;
        }
        if (appContainer.classList.contains('zen-mode')) {
          toggleZen(false);
        }
      }
    });

    window.addEventListener('language-changed', () => {
      updateZenBtnText(appContainer.classList.contains('zen-mode'));
    });
  }

  initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const overlay = document.getElementById('mobile-menu-overlay');
    const closeBtn = document.getElementById('close-mobile-menu-btn');
    if (!mobileMenuBtn || !overlay) return;

    const openMenu = () => overlay.classList.add('active');
    const closeMenu = () => overlay.classList.remove('active');

    mobileMenuBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeMenu();
    });

    const bindMobileAction = (id, action) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          closeMenu();
          action();
        });
      }
    };

    const switchToTab = (tabName) => {
      this.currentTab = tabName;
      this.renderActiveTab();
    };

    bindMobileAction('m-nav-map', () => switchToTab('map'));
    bindMobileAction('m-nav-table', () => switchToTab('table'));
    bindMobileAction('m-nav-encyclo', () => switchToTab('encyclopedia'));
    bindMobileAction('m-nav-rules', () => switchToTab('planner'));

    bindMobileAction('m-autoplan-btn', () => this.openAutoPlanModal());
    bindMobileAction('m-calendar-btn', () => this.openSeasonCalendarModal());
    bindMobileAction('m-print-btn', () => this.printGardenPlan());
    bindMobileAction('m-water-btn', () => this.openGardenWaterModal());
    bindMobileAction('m-varieties-btn', () => this.openVarietyCatalogModal());
    bindMobileAction('m-backup-btn', () => this.openDbModal());
    bindMobileAction('m-demo-btn', () => this.confirmResetDemo());
    bindMobileAction('m-clear-btn', () => this.confirmClearPlan());
    bindMobileAction('m-feedback-btn', () => this.openFeedbackModal());
    bindMobileAction('m-install-btn', () => this.promptPwaInstall());
    bindMobileAction('m-help-btn', () => this.openHelpModal());
    bindMobileAction('m-donate-btn', () => this.openDonateModal());

    const mThemeBtn = document.getElementById('m-theme-btn');
    if (mThemeBtn) {
      mThemeBtn.addEventListener('click', () => {
        this.toggleTheme();
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        mThemeBtn.textContent = currentTheme === 'dark' ? '☀️ Светлая тема' : '🌙 Тёмная тема';
      });
    }

    // Языковые кнопки в мобильном меню
    const langPills = document.querySelectorAll('.m-lang-pill');
    langPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const lang = pill.getAttribute('data-lang');
        if (window.i18n && lang) {
          window.i18n.setLanguage(lang);
          langPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
        }
      });
    });

    window.addEventListener('language-changed', (e) => {
      const cur = e.detail?.language || (window.i18n ? window.i18n.getLanguage() : 'ru');
      langPills.forEach(p => {
        if (p.getAttribute('data-lang') === cur) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });
    });
  }

  confirmClearPlan() {
    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) {
      if (confirm('Очистить весь план огорода и удалить все грядки? (Вы сможете в любой момент вернуть демо-образец кнопкой «Демо-пример»)')) {
        this.executeClearPlan();
      }
      return;
    }

    modalContent.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3>🧹 Очистить план участка?</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-confirm-text">
            Вы собираетесь удалить все текущие грядки и теплицы, чтобы спланировать свой собственный огород <strong>с чистого листа</strong>.
          </p>
          <div class="notice-callout mt-3">
            💡 <strong>Не переживайте:</strong> Вы всегда сможете вернуть демонстрационный образец в 1 клик с помощью кнопки <strong>«🔄 Демо-пример»</strong> в верхнем меню.
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline modal-cancel-btn">Отмена</button>
          <button class="btn btn-danger" id="confirm-clear-action-btn">🧹 Да, очистить план</button>
        </div>
      </div>
    `;

    modal.classList.add('active');
    const closeModal = () => modal.classList.remove('active');
    modalContent.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modalContent.querySelector('.modal-cancel-btn').addEventListener('click', closeModal);

    document.getElementById('confirm-clear-action-btn').addEventListener('click', () => {
      closeModal();
      this.executeClearPlan();
    });
  }

  executeClearPlan() {
    this.storage.clearAll();
    this.closeBedInspector();
    this.refreshCurrentView();
    if (this.gardenMap) {
      this.gardenMap.centerPlotInView();
    }
    this.showToast('План очищен! Теперь расставьте свои грядки 🌱');
  }

  loadDemoPlan() {
    this.confirmResetDemo();
  }

  confirmResetDemo() {
    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) {
      if (confirm('Загрузить демонстрационный пример грядок и теплиц?')) {
        this.executeResetDemo();
      }
      return;
    }

    modalContent.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3>🔄 Загрузить демонстрационный пример?</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-confirm-text">
            Текущий план будет заменен на наглядный демонстрационный образец:
          </p>
          <ul class="modal-list-features mt-2">
            <li>🏡 <strong>Стеклянная теплица 6.5×3.2м</strong> с 3 раздельными грядками (Томаты, Перцы, Огурцы)</li>
            <li>🏡 <strong>Поликарбонатная теплица 6×3м</strong> на 3 грядки</li>
            <li>🪵 <strong>Приподнятые грядки</strong> (Капуста, Морковь, Лук, Свёкла, Бобы)</li>
            <li>🍓 <strong>Клубничник</strong> и чесночные посадки</li>
            <li>🥔 <strong>Картофельное поле</strong> с историей предшественников</li>
          </ul>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline modal-cancel-btn">Отмена</button>
          <button class="btn btn-primary" id="confirm-reset-action-btn">🔄 Загрузить демо</button>
        </div>
      </div>
    `;

    modal.classList.add('active');
    const closeModal = () => modal.classList.remove('active');
    modalContent.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modalContent.querySelector('.modal-cancel-btn').addEventListener('click', closeModal);

    document.getElementById('confirm-reset-action-btn').addEventListener('click', () => {
      closeModal();
      this.executeResetDemo();
    });
  }

  executeResetDemo() {
    this.storage.resetToDemo();
    this.closeBedInspector();
    this.refreshCurrentView();
    setTimeout(() => {
      if (this.gardenMap) {
        this.gardenMap.fitPlotToView();
      }
    }, 60);
    this.showToast('Демонстрационный план успешно загружен!');
  }

  handleEmptyMapAction(action) {
    if (action === 'add-bed') {
      this.openAddBedModal({ defaultType: 'raised' });
    } else if (action === 'add-greenhouse') {
      this.openAddBedModal({ defaultType: 'greenhouse' });
    } else if (action === 'add-row') {
      this.openAddBedModal({ defaultMode: 'row' });
    } else if (action === 'add-grid') {
      this.openAddBedModal({ defaultMode: 'grid' });
    } else if (action === 'restore-demo') {
      this.confirmResetDemo();
    }
  }

  // --- Вынесено в отдельный модуль: openAddBedModal ---

  openCropModal(cropId) {
    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-card modal-lg">
        <div class="modal-header">
          <h3>Агрономический справочник</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          ${this.advisor.renderCropEncyclopediaCard(cropId)}
        </div>
      </div>
    `;

    modal.classList.add('active');
    modalContent.querySelector('.modal-close-btn').addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  openDbModal() {
    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) return;

    const data = this.storage.getData();
    const bedCount = data.beds?.length || 0;
    const yearsList = (data.years || []).join(', ');
    const tr = (k) => (window.t ? window.t(k) : k);

    modalContent.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3>${tr('db_modal_title') || '💾 Сохранение и перенос плана огорода'}</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="db-stats-box">
            <div>📊 Всего грядок на плане: <strong>${bedCount}</strong></div>
            <div>📅 Сезоны в памяти: <strong>${yearsList}</strong></div>
            <div>🌱 Статус хранилища: <span class="text-success">Автосохранение в браузере включено</span></div>
          </div>

          <div class="db-actions-list mt-3">
            <div class="db-action-item">
              <div>
                <strong>${(tr('db_btn_download') || 'Сохранить план в файл').replace(/^[^\p{L}\p{N}]+/u, '').trim()}</strong>
                <p class="text-xs text-muted">Скачать файл с вашими грядками на компьютер или телефон. Пригодится, чтобы записи никогда не потерялись.</p>
              </div>
              <button class="btn btn-primary" id="db-export-btn">${tr('db_btn_download') || '📥 Сохранить план в файл'}</button>
            </div>

            <div class="db-action-item mt-3">
              <div>
                <strong>${(tr('db_btn_upload') || 'Загрузить план из файла').replace(/^[^\p{L}\p{N}]+/u, '').trim()}</strong>
                <p class="text-xs text-muted">Открыть сохранённый ранее файл с планом огорода на этом или другом устройстве.</p>
              </div>
              <label class="btn btn-outline file-input-label">
                ${tr('db_btn_upload') || '📤 Загрузить план из файла'}
                <input type="file" id="db-import-file" accept=".json,application/json,text/plain" style="display: none;">
              </label>
            </div>

            <div class="db-guide-note mt-3 p-3 bg-tertiary rounded" style="font-size: 0.84rem; line-height: 1.5; border-left: 3px solid var(--primary);">
              <strong style="display: block; margin-bottom: 0.25rem;">💡 Как это устроено простыми словами:</strong>
              Все ваши грядки автоматически сохраняются прямо в этом браузере. Но если вы почистите историю или захотите работать на другом телефоне или компьютере — нажмите <strong>«Сохранить план в файл»</strong>. Открывать этот файл двойным кликом в Windows не нужно — когда понадобится продолжить работу, просто нажмите здесь <strong>«Загрузить план из файла»</strong>, и весь ваш огород сразу вернётся!
            </div>

            <div class="db-action-item mt-3">
              <div>
                <strong>Восстановить демонстрационные данные</strong>
                <p class="text-xs text-muted">Загрузить готовый пример огорода с историей 2024-2026 гг. для тестирования севооборота.</p>
              </div>
              <button class="btn btn-warning" id="db-reset-demo-btn">🔄 Загрузить демо</button>
            </div>

            <div class="db-action-item mt-3">
              <div>
                <strong class="text-danger">Очистить всё</strong>
                <p class="text-xs text-muted">Удалить все грядки и начать проектирование огорода с чистого листа.</p>
              </div>
              <button class="btn btn-danger" id="db-clear-all-btn">🗑️ Очистить всё</button>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');

    const closeModal = () => modal.classList.remove('active');
    modalContent.querySelector('.modal-close-btn').addEventListener('click', closeModal);

    // Экспорт
    document.getElementById('db-export-btn').addEventListener('click', () => {
      const fileName = this.storage.exportJson();
      localStorage.setItem('sg_last_backup_time', Date.now().toString());
      const card = document.getElementById('backup-reminder-card');
      if (card) card.style.display = 'none';
      this.showExportSuccessModal(fileName);
    });

    // Импорт
    const importInput = document.getElementById('db-import-file');
    importInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const res = this.storage.importJson(event.target.result);
        if (res.success) {
          closeModal();
          this.refreshCurrentView();
          this.showToast('✓ План огорода успешно загружен и восстановлен!');
        } else {
          alert('Ошибка при чтении файла: ' + res.error);
        }
      };
      reader.readAsText(file);
    });

    // Сброс к демо
    document.getElementById('db-reset-demo-btn').addEventListener('click', () => {
      if (confirm('Восстановить демонстрационный огород? Текущие изменения будут заменены примером.')) {
        this.storage.resetToDemo();
        closeModal();
        this.refreshCurrentView();
        this.showToast('Демо-огород восстановлен!');
      }
    });

    // Очистить всё
    document.getElementById('db-clear-all-btn').addEventListener('click', () => {
      if (confirm('ВНИМАНИЕ: Вы уверены, что хотите удалить все грядки и начать с чистого листа?')) {
        this.storage.clearAll();
        closeModal();
        this.refreshCurrentView();
        this.showToast('План огорода очищен');
      }
    });
  }

  // --- Вынесено в отдельный модуль: openHelpModal ---

  // --- Вынесено в отдельный модуль: openDonateModal ---

  setupPwa() {
    // Регистрация Service Worker для PWA и работы без интернета (офлайн)
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
          console.warn('Service Worker registration skipped or failed:', err);
        });
      });
    }

    // Обработка системного события установки PWA
    this.deferredInstallPrompt = null;
    const pwaBtn = document.getElementById('pwa-install-btn');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    if (isStandalone && pwaBtn) {
      pwaBtn.innerHTML = window.t ? window.t('pwa_installed_label') : '✓ Установлено';
      pwaBtn.style.animation = 'none';
      pwaBtn.style.opacity = '0.85';
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      if (pwaBtn && !isStandalone) {
        pwaBtn.style.display = 'inline-flex';
      }
    });

    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
      if (pwaBtn) {
        pwaBtn.innerHTML = window.t ? window.t('pwa_installed_label') : '✓ Установлено';
        pwaBtn.style.animation = 'none';
      }
      this.showToast(window.t ? window.t('pwa_installed_toast') : '✓ «Умный Огород» установлен на ваше устройство!');
    });
  }

  promptPwaInstall() {
    if (this.deferredInstallPrompt) {
      this.deferredInstallPrompt.prompt();
      this.deferredInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          const pwaBtn = document.getElementById('pwa-install-btn');
          if (pwaBtn) {
            pwaBtn.innerHTML = window.t ? window.t('pwa_installed_label') : '✓ Установлено';
            pwaBtn.style.animation = 'none';
          }
        }
        this.deferredInstallPrompt = null;
      });
    } else {
      this.openInstallModal();
    }
  }

  // --- Вынесено в отдельный модуль: openInstallModal ---

  // --- Вынесено в отдельный модуль: openFeedbackModal ---

  showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'app-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // ==========================================================================
  // Умное напоминание о резервной копии (Smart Backup Reminder)
  // ==========================================================================

  setupBackupReminder() {
    const card = document.getElementById('backup-reminder-card');
    if (!card) return;

    const closeBtn = document.getElementById('backup-reminder-close-btn');
    const laterBtn = document.getElementById('backup-reminder-later-btn');
    const downloadBtn = document.getElementById('backup-reminder-download-btn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.dismissBackupReminder());
    }
    if (laterBtn) {
      laterBtn.addEventListener('click', () => this.dismissBackupReminder());
    }
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadBackupFromReminder());
    }

    // Первый мягкий запуск проверки через 12 секунд после загрузки страницы
    setTimeout(() => {
      this.checkBackupReminder();
    }, 12000);
  }

  checkBackupReminder() {
    const card = document.getElementById('backup-reminder-card');
    if (!card) return;

    // Если карточка уже открыта — не трогаем
    if (card.style.display !== 'none' && !card.classList.contains('closing')) return;

    // Проверяем наличие плана (не менее 2 грядок в огороде)
    const beds = this.storage ? this.storage.getBeds() : [];
    if (!beds || beds.length < 2) return;

    // 7 дней интервал (7 * 24 * 60 * 60 * 1000 = 604800000 ms)
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const lastBackup = parseInt(localStorage.getItem('sg_last_backup_time') || '0', 10);
    const lastDismissed = parseInt(localStorage.getItem('sg_backup_reminder_dismissed_time') || '0', 10);

    if (now - lastBackup < SEVEN_DAYS_MS) return;
    if (now - lastDismissed < SEVEN_DAYS_MS) return;

    // Показываем карточку напоминания
    card.classList.remove('closing');
    card.style.display = 'block';
    if (window.i18n) {
      window.i18n.applyToDOM();
    }
  }

  dismissBackupReminder() {
    const card = document.getElementById('backup-reminder-card');
    if (card) {
      card.classList.add('closing');
      setTimeout(() => {
        card.style.display = 'none';
        card.classList.remove('closing');
      }, 350);
    }
    // Запоминаем время откладывания (7 дней)
    localStorage.setItem('sg_backup_reminder_dismissed_time', Date.now().toString());
  }

  downloadBackupFromReminder() {
    let fileName = '';
    if (this.storage) {
      fileName = this.storage.exportJson();
    }
    localStorage.setItem('sg_last_backup_time', Date.now().toString());

    const card = document.getElementById('backup-reminder-card');
    if (card) {
      card.classList.add('closing');
      setTimeout(() => {
        card.style.display = 'none';
        card.classList.remove('closing');
      }, 350);
    }

    this.showExportSuccessModal(fileName);
  }

  showExportSuccessModal(fileName) {
    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) {
      const toastMsg = (window.t ? window.t('backup_saved_toast') : null) || '✓ План огорода успешно сохранён в файл!';
      this.showToast(toastMsg);
      return;
    }

    const currentLang = (window.i18n && window.i18n.getLanguage()) || 'ru';
    const displayFile = fileName || 'Мой_Огород_План.json';

    let contentHtml = '';
    if (currentLang === 'et') {
      contentHtml = `
        <div class="modal-card" style="max-width: 480px;">
          <div class="modal-header">
            <h3>✅ Aiaplaan edukalt faili salvestatud!</h3>
            <button class="modal-close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <p style="font-size: 0.95rem; line-height: 1.5; margin-bottom: 0.85rem;">
              Teie peenarde fail laaditi seadmesse kausta <strong>«Allalaadimised» (Downloads)</strong>.
            </p>
            <div class="p-3 bg-tertiary rounded" style="font-size: 0.85rem; line-height: 1.5; border-left: 3px solid #10b981; margin-bottom: 1rem;">
              <strong style="color: var(--text-main);">📁 Fail:</strong> <code>${escapeHtml(displayFile)}</code><br><br>
              <strong>💡 Kuidas seda faili kasutada:</strong><br>
              See fail on mõeldud programmi «Nutikas Aed» jaoks. Seda ei pea arvutis otse avama — seal on andmed teie peenarde taastamiseks.
            </div>
            <p style="font-size: 0.86rem; color: var(--text-secondary); line-height: 1.5;">
              <strong>Kuidas plaani teise arvutisse või telefoni viia?</strong><br>
              1. Avage programm teises seadmes.<br>
              2. Vajutage <strong>«💾 Varukoopia»</strong> → <strong>«📤 Laadi plaan failist»</strong>.<br>
              3. Valige see fail — ja kõik peenrad ilmuvad kohe tagasi!
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="export-success-close-btn">Selge, aitäh!</button>
          </div>
        </div>
      `;
    } else if (currentLang === 'lv') {
      contentHtml = `
        <div class="modal-card" style="max-width: 480px;">
          <div class="modal-header">
            <h3>✅ Dārza plāns veiksmīgi saglabāts failā!</h3>
            <button class="modal-close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <p style="font-size: 0.95rem; line-height: 1.5; margin-bottom: 0.85rem;">
              Dobju plāna fails ir lejupielādēts jūsu ierīces mapē <strong>«Lejupielādes» (Downloads)</strong>.
            </p>
            <div class="p-3 bg-tertiary rounded" style="font-size: 0.85rem; line-height: 1.5; border-left: 3px solid #10b981; margin-bottom: 1rem;">
              <strong style="color: var(--text-main);">📁 Fails:</strong> <code>${escapeHtml(displayFile)}</code><br><br>
              <strong>💡 Kā izmantot šo failu:</strong><br>
              Šis fails ir paredzēts programmai «Gudrais Dārzs». To nav nepieciešams atvērt datorā — tajā glabājas dati dobju atjaunošanai.
            </div>
            <p style="font-size: 0.86rem; color: var(--text-secondary); line-height: 1.5;">
              <strong>Kā pārcelt plānu uz citu datoru vai tālruni?</strong><br>
              1. Atveriet programmu vēlamajā ierīcē.<br>
              2. Nospiediet <strong>«💾 Dublējumkopija»</strong> → <strong>«📤 Ielādēt plānu no faila»</strong>.<br>
              3. Izvēlieties šo failu — un visas dobes uzreiz atvērsies!
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="export-success-close-btn">Skaidrs, paldies!</button>
          </div>
        </div>
      `;
    } else if (currentLang === 'lt') {
      contentHtml = `
        <div class="modal-card" style="max-width: 480px;">
          <div class="modal-header">
            <h3>✅ Daržo planas sėkmingai išsaugotas į failą!</h3>
            <button class="modal-close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <p style="font-size: 0.95rem; line-height: 1.5; margin-bottom: 0.85rem;">
              Lysvių plano failas atsisiųstas į jūsų įrenginio aplanką <strong>«Atsisiuntimai» (Downloads)</strong>.
            </p>
            <div class="p-3 bg-tertiary rounded" style="font-size: 0.85rem; line-height: 1.5; border-left: 3px solid #10b981; margin-bottom: 1rem;">
              <strong style="color: var(--text-main);">📁 Failas:</strong> <code>${escapeHtml(displayFile)}</code><br><br>
              <strong>💡 Kaip naudoti šį failą:</strong><br>
              Šis failas sukurtas programai «Išmanusis Daržas». Jo nereikia atidaryti kompiuteryje — jame saugomi duomenys lysvėms atstatyti.
            </div>
            <p style="font-size: 0.86rem; color: var(--text-secondary); line-height: 1.5;">
              <strong>Kaip perkelti planą į kitą kompiuterį ar telefoną?</strong><br>
              1. Atidarykite programą kitame įrenginyje.<br>
              2. Paspauskite <strong>«💾 Atsarginė kopija»</strong> → <strong>«📤 Įkelti planą iš failo»</strong>.<br>
              3. Pasirinkite šį failą — ir visos lysvės iškart bus atkurtos!
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="export-success-close-btn">Aišku, ačiū!</button>
          </div>
        </div>
      `;
    } else {
      contentHtml = `
        <div class="modal-card" style="max-width: 490px;">
          <div class="modal-header">
            <h3>✅ План огорода успешно сохранён в файл!</h3>
            <button class="modal-close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <p style="font-size: 0.95rem; line-height: 1.5; margin-bottom: 0.85rem;">
              Файл с вашими грядками скачан на устройство в папку <strong>«Загрузки»</strong>.
            </p>
            <div class="p-3 bg-tertiary rounded" style="font-size: 0.85rem; line-height: 1.5; border-left: 3px solid #10b981; margin-bottom: 1rem;">
              <strong style="color: var(--text-main);">📁 Имя файла:</strong> <code style="font-size: 0.88rem; background: var(--bg-primary); padding: 2px 6px; border-radius: 4px;">${escapeHtml(displayFile)}</code><br><br>
              <strong>💡 Как пользоваться этим файлом:</strong><br>
              Этот файл создан специально для программы «Умный Огород». Открывать его напрямую через Windows или блокнот не нужно — внутри хранятся данные для расстановки ваших грядок.
            </div>
            <p style="font-size: 0.86rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 0;">
              <strong>Как перенести план на другой компьютер или телефон?</strong><br>
              1. Откройте сайт программы на нужном устройстве.<br>
              2. Нажмите <strong>«💾 Резервная копия»</strong> → <strong>«📤 Загрузить план из файла»</strong>.<br>
              3. Выберите этот файл — и весь ваш огород со всеми грядками сразу появится!
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="export-success-close-btn">Понятно, спасибо!</button>
          </div>
        </div>
      `;
    }

    modalContent.innerHTML = contentHtml;
    modal.classList.add('active');

    const closeModal = () => modal.classList.remove('active');
    modalContent.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    const closeBtn = document.getElementById('export-success-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  }
}

// Запуск приложения при загрузке документа
// Экспорт класса приложения и глобального пространства имён
window.GardenApp = GardenApp;
window.Garden = {
  Storage: GardenStorage,
  Map: GardenMap,
  Advisor: RotationAdvisor,
  App: GardenApp,
  get instance() { return window.app; }
};

document.addEventListener('DOMContentLoaded', () => {
  window.app = new GardenApp();
});
