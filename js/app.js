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
    this.activeInspectorBedId = null;
    this.activeInspectorSectionId = null;
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
  }

  renderActiveTab() {
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

  openBedInspector(bedId, sectionId = null) {
    this.activeInspectorBedId = bedId;
    const bed = this.storage.getBedById(bedId);
    if (!bed) return;

    const drawer = document.getElementById('bed-inspector-drawer');
    if (!drawer) return;

    const currentLang = window.i18n ? window.i18n.getLanguage() : 'ru';

    const hasSections = Boolean(bed.sections && bed.sections.length > 0);
    const sectionsCount = hasSections ? bed.sections.length : 1;
    let activeSection = null;
    if (hasSections) {
      if (sectionId) {
        activeSection = bed.sections.find(s => s.id === sectionId) || bed.sections[0];
      } else if (this.activeInspectorSectionId) {
        activeSection = bed.sections.find(s => s.id === this.activeInspectorSectionId) || bed.sections[0];
      } else {
        activeSection = bed.sections[0];
      }
      this.activeInspectorSectionId = activeSection.id;
    } else {
      this.activeInspectorSectionId = null;
    }

    const activeYear = this.storage.getActiveYear();
    const prevYear = activeYear - 1;

    // Целевой объект посадки: конкретная секция/рядок или сама грядка
    const targetSource = activeSection || bed;
    const currentPlanting = targetSource.history?.[activeYear] || {};
    const currentCrop = currentPlanting.cropId ? getCropById(currentPlanting.cropId) : null;
    const history = this.storage.getBedHistoryArray(bed.id, activeYear, activeSection ? activeSection.id : null);
    const rotationEval = currentPlanting.cropId
      ? evaluateCropRotation(currentPlanting.cropId, history)
      : null;

    // Расчет полезной площади для калькулятора рассады/семян
    const targetArea = hasSections && sectionsCount > 1
      ? (bed.width * bed.height) / sectionsCount
      : (bed.width * bed.height);

    // Собираем культуры с соседних секций этой же грядки для анализа добрососедства
    const neighborCropIds = [];
    if (hasSections && sectionsCount > 1) {
      bed.sections.forEach(sec => {
        if (sec.id !== activeSection.id) {
          const nCid = sec.history?.[activeYear]?.cropId;
          if (nCid) neighborCropIds.push(nCid);
        }
      });
    }

    // Рекомендации для этой грядки
    const recommendations = recommendCropsForBed(history).slice(0, 5);

    const bedTitle = window.i18n ? window.i18n.getBedName(bed) : bed.name;
    const dimText = currentLang === 'et' ? `Mõõtmed: ${bed.width} × ${bed.height} m • Hooaeg: ${activeYear}. a` :
                    currentLang === 'lv' ? `Izmēri: ${bed.width} × ${bed.height} m • Sezona: ${activeYear}. g.` :
                    currentLang === 'lt' ? `Matmenys: ${bed.width} × ${bed.height} m • Sezonas: ${activeYear} m.` :
                    `Размеры: ${bed.width} × ${bed.height} м • Сезон: ${activeYear} г.`;

    const splitLabel = currentLang === 'et' ? '📐 Jagamine ridadeks / peenardeks:' :
                       currentLang === 'lv' ? '📐 Sadalīšana rindās / joslās:' :
                       currentLang === 'lt' ? '📐 Padalijimas į eilutes / juostas:' :
                       '📐 Разделение на рядки / полосы:';
    const sec1Btn = currentLang === 'et' ? '🌱 1 terve' : currentLang === 'lv' ? '🌱 1 vesela' : currentLang === 'lt' ? '🌱 1 visa' : '🌱 1 цельная';
    const sec2Btn = currentLang === 'et' ? '🌿 2 rida' : currentLang === 'lv' ? '🌿 2 rindas' : currentLang === 'lt' ? '🌿 2 eilutės' : '🌿 2 рядка';
    const sec3Btn = currentLang === 'et' ? '🌾 3 rida' : currentLang === 'lv' ? '🌾 3 rindas' : currentLang === 'lt' ? '🌾 3 eilutės' : '🌾 3 рядка';

    const chooseRowLabel = bed.type === 'greenhouse'
      ? (currentLang === 'et' ? `🌿 Vali peenar kasvuhoones (${sectionsCount} tk):` :
         currentLang === 'lv' ? `🌿 Izvēlieties dobi siltumnīcā (${sectionsCount} gab.):` :
         currentLang === 'lt' ? `🌿 Pasirinkite lysvę šiltnamyje (${sectionsCount} vnt.):` :
         `🌿 Выберите грядку внутри теплицы (${sectionsCount} шт.):`)
      : (currentLang === 'et' ? `🌱 Vali peenrarida (${sectionsCount} tk):` :
         currentLang === 'lv' ? `🌱 Izvēlieties rindu (${sectionsCount} gab.):` :
         currentLang === 'lt' ? `🌱 Pasirinkite eilutę (${sectionsCount} vnt.):` :
         `🌱 Выберите рядок / полосу (${sectionsCount} шт.):`);
    const activeRowLabel = currentLang === 'et' ? 'Aktiivne rida:' : currentLang === 'lv' ? 'Aktīvā rinda:' : currentLang === 'lt' ? 'Aktyvi eilutė:' : 'Активный рядок:';

    const activeSecTitle = activeSection ? (window.i18n ? window.i18n.getBedName(activeSection) : activeSection.name) : '';
    const plantingLabel = hasSections && sectionsCount > 1
      ? (currentLang === 'et' ? `Külv alale «${escapeHtml(activeSecTitle)}» (${activeYear}. a):` :
         currentLang === 'lv' ? `Stādījums uz «${escapeHtml(activeSecTitle)}» (${activeYear}. g.):` :
         currentLang === 'lt' ? `Sodinimas į «${escapeHtml(activeSecTitle)}» (${activeYear} m.):` :
         `Посадка на «${escapeHtml(activeSecTitle)}» (${activeYear} г.):`)
      : (currentLang === 'et' ? `Külv ${activeYear}. aastaks:` :
         currentLang === 'lv' ? `Stādījums ${activeYear}. gadam:` :
         currentLang === 'lt' ? `Sodinimas ${activeYear} metams:` :
         `Посадка на ${activeYear} год:`);

    const cropSelectLabel = currentLang === 'et' ? 'Kultuur (taim):' :
                            currentLang === 'lv' ? 'Kultūra (augs):' :
                            currentLang === 'lt' ? 'Augalas (daržovė):' :
                            'Культура (растение):';
    const comboboxPh = window.t ? window.t('inspector_combobox_placeholder') : 'Начните вводить...';
    const varietyLabel = window.t ? window.t('inspector_variety_label') : 'Сорт или гибрид (необязательно):';
    const notesLabel = window.t ? window.t('inspector_notes_label') : 'Заметка к посадке (необязательно):';
    const varietyPh = window.t ? window.t('inspector_variety_placeholder') : 'Сорт или гибрид...';
    const notesPh = window.t ? window.t('inspector_notes_placeholder') : 'Заметка к посадке...';
    const noteHelpText = currentLang === 'et' ? 'Isiklikud märkmed: külvikuupäevad, kastmine, hooldus (valikuline)' :
                         currentLang === 'lv' ? 'Personīgās piezīmes: sēšanas datumi, laistīšana, kopšana (neobligāti)' :
                         currentLang === 'lt' ? 'Asmeniniai užrašai: sėjos datos, laistymas, priežiūra (nebūtina)' :
                         'Личные пометки: даты посева, полив, схема (необязательно)';
    const savePlantingBtnText = currentLang === 'et' ? `💾 Salvesta ${activeYear}. a külv` :
                               currentLang === 'lv' ? `💾 Saglabāt ${activeYear}. g. stādījumu` :
                               currentLang === 'lt' ? `💾 Išsaugoti ${activeYear} m. sodinimą` :
                               `💾 Сохранить посадку на ${activeYear} г.`;

    const topRecTitle = currentLang === 'et' ? '💡 Parimad soovitused sellele peenrale:' :
                        currentLang === 'lv' ? '💡 Labākie ieteikumi šai dobei:' :
                        currentLang === 'lt' ? '💡 Geriausios rekomendacijos šiai lysvei:' :
                        '💡 Топ-рекомендации для этой грядки:';
    const topRecDesc = currentLang === 'et' ? `Valitud algoritmi poolt arvestades seda, mis kasvas ${prevYear}. a ja varem:` :
                       currentLang === 'lv' ? `Izvēlēts ar algoritmu, ņemot vērā, kas auga ${prevYear}. g. un agrāk:` :
                       currentLang === 'lt' ? `Parinkta algoritmo, atsižvelgiant į tai, kas augo ${prevYear} m. ir anksčiau:` :
                       `Подобрано агро-алгоритмом с учетом того, что росло в ${prevYear} г. и ранее:`;
    const chooseBtnText = currentLang === 'et' ? 'Vali' : currentLang === 'lv' ? 'Izvēlēties' : currentLang === 'lt' ? 'Pasirinkti' : 'Выбрать';

    const pastHistTitle = currentLang === 'et' ? '📜 Varasemate aastate ajalugu:' :
                          currentLang === 'lv' ? '📜 Iepriekšējo gadu vēsture:' :
                          currentLang === 'lt' ? '📜 Ankstesnių metų istorija:' :
                          '📜 История посадок прошлых лет:';

    const paramsTitle = currentLang === 'et' ? '⚙️ Peenra parameetrid ja tüüp:' :
                        currentLang === 'lv' ? '⚙️ Dobes parametri un tips:' :
                        currentLang === 'lt' ? '⚙️ Lysvės parametrai ir tipas:' :
                        '⚙️ Параметры и тип конструкции:';
    const nameSubLabel = currentLang === 'et' ? 'Nimi:' : currentLang === 'lv' ? 'Nosaukums:' : currentLang === 'lt' ? 'Pavadinimas:' : 'Название:';
    const wSubLabel = currentLang === 'et' ? 'Laius (m):' : currentLang === 'lv' ? 'Platums (m):' : currentLang === 'lt' ? 'Plotis (m):' : 'Ширина (м):';
    const lSubLabel = currentLang === 'et' ? 'Pikkus (m):' : currentLang === 'lv' ? 'Garums (m):' : currentLang === 'lt' ? 'Ilgis (m):' : 'Длина (м):';
    const typeSubLabel = currentLang === 'et' ? 'Konstruktsiooni tüüp:' : currentLang === 'lv' ? 'Konstrukcijas tips:' : currentLang === 'lt' ? 'Konstrukcijos tipas:' : 'Тип конструкции:';
    const rotBtnText = currentLang === 'et' ? '↻ Pööra 90°' : currentLang === 'lv' ? '↻ Pagriezt par 90°' : currentLang === 'lt' ? '↻ Pasukti 90°' : '↻ Повернуть на 90°';
    const cloneBtnText = currentLang === 'et' ? '❐ Kopeeri' : currentLang === 'lv' ? '❐ Klonēt' : currentLang === 'lt' ? '❐ Klonuoti' : '❐ Клонировать';
    const updateBtnText = currentLang === 'et' ? 'Uuenda parameetreid' : currentLang === 'lv' ? 'Atjaunināt parametrus' : currentLang === 'lt' ? 'Atnaujinti parametrus' : 'Обновить параметры';
    const delBtnText = currentLang === 'et' ? `🗑️ Kustuta ${bed.type === 'greenhouse' ? 'kasvuhoone' : 'peenar'}` :
                       currentLang === 'lv' ? `🗑️ Dzēst ${bed.type === 'greenhouse' ? 'siltumnīcu' : 'dobi'}` :
                       currentLang === 'lt' ? `🗑️ Pašalinti ${bed.type === 'greenhouse' ? 'šiltnamį' : 'lysvę'}` :
                       `🗑️ Удалить ${bed.type === 'greenhouse' ? 'теплицу' : 'грядку'}`;

    drawer.innerHTML = `
      <div class="inspector-header">
        <div>
          <span class="inspector-badge">${this.advisor.formatBedType(bed.type)}</span>
          <h2 class="inspector-title">
            ${escapeHtml(bedTitle)}
            <button class="btn-rename-pill" id="btn-quick-rename-header" title="Быстро изменить название этой грядки">✏️ ${nameSubLabel}</button>
          </h2>
          <span class="text-xs text-muted">${dimText}</span>
        </div>
        <button class="close-inspector-btn" id="close-inspector-btn" title="Закрыть панель (Esc)" aria-label="Закрыть">&times;</button>
      </div>

      <div class="inspector-body">
        <!-- 1. Основные параметры грядки: Название, размеры, тип и ориентация (сразу сверху) -->
        <div class="inspector-section" style="border-left: 3px solid #0284c7; background: rgba(2, 132, 199, 0.03);">
          <label class="section-label">${paramsTitle}</label>
          <div class="form-group">
            <label class="form-sublabel">${nameSubLabel}</label>
            <input type="text" id="inspector-bed-name" class="form-input" value="${escapeHtml(bed.name)}">
          </div>
          <div class="form-row-2 mt-2">
            <div>
              <label class="form-sublabel">${wSubLabel}</label>
              <input type="number" id="inspector-bed-w" class="form-input" step="0.1" min="0.5" max="30" value="${bed.width}">
            </div>
            <div>
              <label class="form-sublabel">${lSubLabel}</label>
              <input type="number" id="inspector-bed-h" class="form-input" step="0.1" min="0.5" max="30" value="${bed.height}">
            </div>
          </div>
          <div class="form-group mt-2">
            <label class="form-sublabel">${typeSubLabel}</label>
            <select id="inspector-bed-type" class="form-select">
              <option value="greenhouse" ${bed.type === 'greenhouse' ? 'selected' : ''}>🏡 ${window.t ? window.t('type_greenhouse') : 'Теплица'}</option>
              <option value="raised" ${bed.type === 'raised' ? 'selected' : ''}>🪵 ${window.t ? window.t('type_raised') : 'Приподнятая грядка'}</option>
              <option value="ground" ${bed.type === 'ground' ? 'selected' : ''}>🌱 ${window.t ? window.t('type_ground') : 'Открытый грунт'}</option>
              <option value="berry" ${bed.type === 'berry' ? 'selected' : ''}>🍓 ${window.t ? window.t('type_berry') : 'Клубничник'}</option>
              <option value="warm" ${bed.type === 'warm' ? 'selected' : ''}>🔥 ${window.t ? window.t('type_warm') : 'Тёплая грядка'}</option>
            </select>
          </div>
          <div class="btn-group-row mt-2">
            <button class="btn btn-outline btn-sm" id="inspector-rotate-bed-btn" title="${rotBtnText}">
              ${rotBtnText}
            </button>
            <button class="btn btn-outline btn-sm" id="inspector-clone-bed-btn" title="${cloneBtnText}">
              ${cloneBtnText}
            </button>
          </div>
          <button class="btn btn-primary btn-block mt-2" id="inspector-save-params-btn">
            💾 ${updateBtnText}
          </button>
        </div>

        <!-- 2. Блок разделения грядки на рядки (1, 2 или 3) -->
        <div class="inspector-section" style="border-left: 3px solid var(--primary);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label class="section-label" style="margin-bottom: 0;">${splitLabel}</label>
            <span class="text-xs" style="color: var(--primary); font-weight: 700;">${sectionsCount}</span>
          </div>
          <div class="bed-section-split-selector">
            <button type="button" class="split-tab-btn ${sectionsCount === 1 ? 'active' : ''}" data-split-count="1">
              ${sec1Btn}
            </button>
            <button type="button" class="split-tab-btn ${sectionsCount === 2 ? 'active' : ''}" data-split-count="2">
              ${sec2Btn}
            </button>
            <button type="button" class="split-tab-btn ${sectionsCount === 3 ? 'active' : ''}" data-split-count="3">
              ${sec3Btn}
            </button>
          </div>
        </div>

        ${hasSections && sectionsCount > 1 ? `
          <!-- 3. Выбор активного рядка внутри грядки / теплицы -->
          <div class="inspector-section" style="border-left: 3px solid #0284c7;">
            <label class="section-label">
              ${chooseRowLabel}
            </label>
            <div class="gh-section-nav">
              ${bed.sections.map((sec) => {
                const secPlanting = sec.history?.[activeYear];
                const secCrop = secPlanting?.cropId ? getCropById(secPlanting.cropId) : null;
                const isActive = sec.id === activeSection.id;
                const secLocName = window.i18n ? window.i18n.getBedName(sec) : sec.name;
                return `
                  <button type="button" class="gh-nav-tab ${isActive ? 'active' : ''}" data-section-id="${sec.id}">
                    ${secCrop ? secCrop.emoji : '🌱'} ${escapeHtml(secLocName)}
                  </button>
                `;
              }).join('')}
            </div>
            <div class="text-xs text-secondary mt-1">
              ${activeRowLabel} <strong style="color: #0284c7;">${escapeHtml(activeSecTitle)}</strong>
            </div>
          </div>
        ` : ''}

        <!-- 4. Блок выбора посадки на активный год -->
        <div class="inspector-section">
          <label class="section-label">
            ${plantingLabel}
          </label>

          <div class="form-group">
            <label class="form-sublabel" style="font-weight: 700; color: var(--text-main); margin-bottom: 4px;">
              🌱 ${cropSelectLabel}
            </label>
            <div class="crop-combobox-wrap" id="crop-combobox-wrap">
              <input type="hidden" id="inspector-crop-select" value="${currentPlanting.cropId || ''}">
              
              <div class="combobox-field" id="crop-combobox-field">
                <span class="combobox-lead-icon" id="combobox-selected-icon">
                  ${currentCrop ? getCropSvg(currentCrop.id) : '<span style="font-size: 1.15rem;">🌱</span>'}
                </span>
                <input type="text"
                       id="inspector-crop-combobox-input"
                       class="combobox-input"
                       placeholder="${comboboxPh}"
                       autocomplete="off"
                       value="${currentCrop ? escapeHtml(getCropName(currentCrop, currentLang)) : ''}">
                <button type="button" class="combobox-clear-btn ${currentCrop ? 'visible' : ''}" id="combobox-clear-btn" title="✕">✕</button>
                <button type="button" class="combobox-toggle-btn" id="combobox-toggle-btn" title="▾">▾</button>
              </div>

              <div class="crop-combobox-dropdown" id="crop-combobox-dropdown" style="display: none;">
                <!-- Элементы списка генерируются через setupCropCombobox -->
              </div>
            </div>
          </div>

          <div class="form-group mt-3">
            <label class="form-sublabel" for="inspector-variety-input" style="font-weight: 700; color: var(--text-main); margin-bottom: 4px;">
              🏷️ ${varietyLabel}
            </label>
            <input type="text" id="inspector-variety-input" class="form-input" placeholder="${varietyPh}" value="${escapeHtml(currentPlanting.variety || '')}">
          </div>

          <div class="form-group mt-3">
            <label class="form-sublabel" for="inspector-note-input" style="font-weight: 700; color: var(--text-main); margin-bottom: 4px;">
              📝 ${notesLabel}
            </label>
            <input type="text" id="inspector-note-input" class="form-input" placeholder="${notesPh}" value="${escapeHtml(currentPlanting.note || '')}">
            <small class="text-xs text-muted" style="display: block; margin-top: 3px;">${noteHelpText}</small>
          </div>

          <button class="btn btn-primary btn-block mt-3" id="inspector-save-planting-btn">
            ${savePlantingBtnText}
          </button>

          <!-- 4.1 Вместимость грядки / калькулятор семян и рассады -->
          <div id="inspector-capacity-container">
            ${this.renderInspectorCapacity(currentPlanting.cropId, targetArea, currentLang)}
          </div>

          <!-- 4.2 Растения-союзники и добрососедство -->
          <div id="inspector-companions-container">
            ${this.renderInspectorCompanions(currentPlanting.cropId, neighborCropIds, currentLang)}
          </div>
        </div>

        <!-- 4.3 Схема посадки по лункам и сортам (Шахматка / Ряды) -->
        <div class="inspector-section" id="inspector-holes-box" style="border-left: 3px solid #10b981; background: rgba(16, 185, 129, 0.03);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <label class="section-label" style="margin-bottom: 0;">🌱 Схема посадки по лункам (${activeYear} г.)</label>
            <span class="badge-mini" id="bed-holes-badge" style="font-size: 0.76rem; background: #dcfce7; color: #15803d; padding: 2px 7px; border-radius: 4px; font-weight: 800;"></span>
          </div>
          <div id="inspector-holes-content"></div>
        </div>

        <!-- 5. Анализ севооборота -->
        <div class="inspector-section rotation-analysis-box" id="rotation-status-box">
          ${this.renderInspectorRotationStatus(rotationEval)}
        </div>

        <!-- 5.1 Калькулятор полива для этой грядки -->
        <div class="inspector-section" id="inspector-water-box" style="border-left: 3px solid #0284c7; background: rgba(2, 132, 199, 0.03);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <label class="section-label" style="margin-bottom: 0;">💧 Потребность в воде и полив</label>
            <span class="badge-mini" id="bed-water-rate" style="font-size: 0.76rem; background: #e0f2fe; color: #0284c7; padding: 2px 7px; border-radius: 4px; font-weight: 800;"></span>
          </div>
          <div class="water-weather-pills" style="display: flex; gap: 4px; margin: 6px 0;">
            <button type="button" class="btn-weather-pill active" data-weather="normal">⛅ Норма (+20°C)</button>
            <button type="button" class="btn-weather-pill" data-weather="hot">☀️ Жара (+30°C)</button>
            <button type="button" class="btn-weather-pill" data-weather="rainy">🌧️ Дожди</button>
          </div>
          <div id="bed-water-stats" class="water-stats-card"></div>
        </div>

        <!-- 5.2 Журнал подкормок и ухода (Агро-дневник) -->
        <div class="inspector-section" id="inspector-care-box" style="border-left: 3px solid #16a34a; background: rgba(22, 163, 74, 0.03);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <label class="section-label" style="margin-bottom: 0;">🌿 Журнал подкормок и ухода (${activeYear} г.)</label>
            <button type="button" class="btn btn-sm btn-outline" id="btn-toggle-add-care" style="padding: 2px 8px; font-size: 0.78rem;">➕ Записать</button>
          </div>

          <div id="care-add-form" style="display: none; background: var(--bg-primary); padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); margin: 6px 0;">
            <div style="font-size: 0.78rem; font-weight: 700; margin-bottom: 4px; color: var(--text-muted);">Быстрые шаблоны в 1 клик:</div>
            <div class="care-presets-wrap" style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
              <button type="button" class="chip-preset-btn" data-type="fertilizer" data-title="Настой древесной золы (калий/фосфор)">🪵 Зола</button>
              <button type="button" class="chip-preset-btn" data-type="fertilizer" data-title="Настой крапивы (азот/органика)">🌿 Крапива</button>
              <button type="button" class="chip-preset-btn" data-type="fertilizer" data-title="Биогумус / Гумат калия">💧 Гумат</button>
              <button type="button" class="chip-preset-btn" data-type="protection" data-title="Опрыскивание Фитоспорином (профилактика)">🛡️ Фитоспорин</button>
              <button type="button" class="chip-preset-btn" data-type="protection" data-title="Обработка от вредителей (Табачная пыль / Мыло)">🪲 Защита</button>
              <button type="button" class="chip-preset-btn" data-type="care" data-title="Мульчирование соломой / травой">🌾 Мульча</button>
              <button type="button" class="chip-preset-btn" data-type="care" data-title="Пасынкование и формирование">✂️ Пасынкование</button>
            </div>
            <div class="form-row-2">
              <div>
                <label class="form-sublabel">Дата:</label>
                <input type="date" id="care-input-date" class="form-input" style="padding: 4px 6px; font-size: 0.82rem;" value="${new Date().toISOString().split('T')[0]}">
              </div>
              <div>
                <label class="form-sublabel">Тип:</label>
                <select id="care-input-type" class="form-input" style="padding: 4px 6px; font-size: 0.82rem;">
                  <option value="fertilizer">🧪 Подкормка</option>
                  <option value="protection">🛡️ Защита от болезней</option>
                  <option value="care">✂️ Уход и мульча</option>
                </select>
              </div>
            </div>
            <div class="mt-2">
              <input type="text" id="care-input-title" class="form-input" placeholder="Название подкормки или действия..." style="padding: 4px 8px; font-size: 0.84rem;">
            </div>
            <div class="mt-1">
              <input type="text" id="care-input-note" class="form-input" placeholder="Заметка, дозировка (необязательно)..." style="padding: 4px 8px; font-size: 0.82rem;">
            </div>
            <div style="display: flex; gap: 6px; justify-content: flex-end; margin-top: 8px;">
              <button type="button" class="btn btn-sm btn-outline" id="care-cancel-btn">Отмена</button>
              <button type="button" class="btn btn-sm btn-primary" id="care-save-btn">💾 Сохранить</button>
            </div>
          </div>

          <div id="care-log-list" class="care-timeline-list mt-2"></div>
        </div>

        <!-- 5.3 Фотографии урожая (IndexedDB) -->
        <div class="inspector-section" id="inspector-photos-box" style="border-left: 3px solid #8b5cf6; background: rgba(139, 92, 246, 0.03);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <label class="section-label" style="margin-bottom: 0;">📸 Фотографии урожая (${activeYear} г.)</label>
            <label class="btn btn-sm btn-primary" style="cursor: pointer; padding: 2px 8px; font-size: 0.78rem; margin-bottom: 0;">
              📷 Добавить фото
              <input type="file" id="photo-file-input" accept="image/*" style="display: none;">
            </label>
          </div>
          <p class="text-xs text-muted" style="margin: 2px 0 6px 0;">Фото сжимаются до ~70 КБ и хранятся в базе IndexedDB, не занимая память браузера.</p>
          <div id="photos-gallery-grid" class="photos-grid-wrap"></div>
        </div>

        <!-- 6. Умные рекомендации агронома -->
        <div class="inspector-section">
          <label class="section-label">${topRecTitle}</label>
          <p class="text-xs text-muted">${topRecDesc}</p>
          <div class="recommended-crops-list">
            ${recommendations.map(r => `
              <div class="recommendation-item" data-crop-id="${r.crop.id}">
                <div class="rec-icon">${getCropSvg(r.crop.id)}</div>
                <div class="rec-info">
                  <strong>${escapeHtml(getCropName(r.crop, currentLang))}</strong>
                  <div class="text-xs text-success">${escapeHtml(r.reasons[0] || '✓')}</div>
                </div>
                <button class="btn btn-sm btn-outline apply-rec-btn" data-crop-id="${r.crop.id}" title="${chooseBtnText}">
                  ${chooseBtnText}
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 7. История прошлых лет -->
        <div class="inspector-section">
          <label class="section-label">${pastHistTitle}</label>
          <div class="history-list">
            ${this.renderBedPastHistoryList(targetSource, activeYear)}
          </div>
        </div>

        <div class="inspector-footer-actions">
          <button class="btn btn-danger btn-sm" id="inspector-delete-bed-btn">
            ${delBtnText}
          </button>
        </div>
      </div>
    `;

    drawer.classList.add('open');

    // Навешиваем слушатели
    document.getElementById('close-inspector-btn').addEventListener('click', () => {
      drawer.classList.remove('open');
      this.activeInspectorBedId = null;
      this.activeInspectorSectionId = null;
      this.gardenMap.selectBed(null, null);
    });

    // Быстрое переименование в шапке инспектора
    const quickRenameBtn = document.getElementById('btn-quick-rename-header');
    if (quickRenameBtn) {
      quickRenameBtn.addEventListener('click', () => {
        const currentName = bed.name;
        const newName = prompt(`Введите название для этой грядки (например: «У забора», «Южная»):`, currentName);
        if (newName !== null) {
          const trimmed = newName.trim();
          if (trimmed && trimmed !== currentName) {
            bed.name = trimmed;
            this.storage.saveBed(bed);
            this.showToast(`Грядка переименована в «${trimmed}»`);
            this.gardenMap.render();
            this.openBedInspector(bedId, activeSection ? activeSection.id : null);
          }
        }
      });
    }

    // Переключение разделения грядки на 1, 2 или 3 рядка
    drawer.querySelectorAll('.split-tab-btn').forEach(splitBtn => {
      splitBtn.addEventListener('click', () => {
        const count = parseInt(splitBtn.getAttribute('data-split-count'), 10);
        if (count === sectionsCount) return;
        this.storage.setBedSectionsCount(bedId, count);
        this.showToast(count <= 1 
          ? `Грядка «${bed.name}» объединена в одну цельную` 
          : `Грядка «${bed.name}» разделена на ${count} автономных рядка!`
        );
        this.gardenMap.render();
        this.openBedInspector(bedId, count > 1 ? 'sec-1' : null);
      });
    });

    // Переключение активного рядка внутри грядки / теплицы
    if (hasSections && sectionsCount > 1) {
      drawer.querySelectorAll('.gh-nav-tab').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
          const secId = tabBtn.getAttribute('data-section-id');
          this.gardenMap.selectBed(bedId, secId);
          this.openBedInspector(bedId, secId);
        });
      });
    }

    // Поворот грядки
    document.getElementById('inspector-rotate-bed-btn').addEventListener('click', () => {
      this.storage.rotateBed(bedId);
      this.showToast('Объект повернут на 90°');
      this.gardenMap.render();
      this.openBedInspector(bedId, activeSection ? activeSection.id : null);
    });

    // Клонирование грядки
    document.getElementById('inspector-clone-bed-btn').addEventListener('click', () => {
      const clone = this.storage.duplicateBed(bedId);
      this.showToast('Создана копия');
      this.gardenMap.render();
      if (clone) this.openBedInspector(clone.id);
    });

    // Сохранение посадки
    document.getElementById('inspector-save-planting-btn').addEventListener('click', () => {
      const cropId = document.getElementById('inspector-crop-select').value;
      const variety = document.getElementById('inspector-variety-input').value.trim();
      const note = document.getElementById('inspector-note-input').value.trim();

      this.storage.updateBedPlanting(bedId, activeYear, cropId, variety, note, activeSection ? activeSection.id : null);
      this.showToast(`Посадка на ${activeYear} г. обновлена!`);
      this.gardenMap.render();
      this.openBedInspector(bedId, activeSection ? activeSection.id : null);
    });

    // Быстрый клик по рекомендации
    drawer.querySelectorAll('.apply-rec-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cropId = btn.getAttribute('data-crop-id');
        const selectedCrop = getCropById(cropId);
        document.getElementById('inspector-crop-select').value = cropId;
        const autoNote = currentLang === 'et' ? 'Külvikorra soovituse järgi' :
                         currentLang === 'lv' ? 'Pēc augsekas ieteikuma' :
                         currentLang === 'lt' ? 'Pagal sėjomainos rekomendaciją' :
                         'По рекомендации севооборота';
        this.storage.updateBedPlanting(bedId, activeYear, cropId, '', autoNote, activeSection ? activeSection.id : null);
        const cropName = selectedCrop ? getCropName(selectedCrop, currentLang) : '';
        const toastMsg = currentLang === 'et' ? `Valitud kultuur: ${cropName}` :
                         currentLang === 'lv' ? `Izvēlētā kultūra: ${cropName}` :
                         currentLang === 'lt' ? `Pasirinkta kultūra: ${cropName}` :
                         `Выбрана культура: ${cropName}`;
        this.showToast(toastMsg);
        this.gardenMap.render();
        this.openBedInspector(bedId, activeSection ? activeSection.id : null);
      });
    });

    // Изменение параметров грядки
    document.getElementById('inspector-save-params-btn').addEventListener('click', () => {
      const name = document.getElementById('inspector-bed-name').value.trim() || bed.name;
      const w = parseFloat(document.getElementById('inspector-bed-w').value) || bed.width;
      const h = parseFloat(document.getElementById('inspector-bed-h').value) || bed.height;
      const type = document.getElementById('inspector-bed-type').value;

      bed.name = name;
      bed.width = w;
      bed.height = h;
      bed.type = type;
      this.storage.saveBed(bed);
      this.showToast(window.t ? window.t('toast_saved') : 'Параметры сохранены!');
      this.gardenMap.render();
      this.openBedInspector(bedId, activeSection ? activeSection.id : null);
    });

    // Удаление грядки
    document.getElementById('inspector-delete-bed-btn').addEventListener('click', () => {
      const isGh = bed.type === 'greenhouse';
      const confirmTitle = currentLang === 'et' ? (isGh ? 'Kustuta kasvuhoone?' : 'Kustuta peenar?') :
                           currentLang === 'lv' ? (isGh ? 'Dzēst siltumnīcu?' : 'Dzēst dobi?') :
                           currentLang === 'lt' ? (isGh ? 'Pašalinti šiltnamį?' : 'Pašalinti lysvę?') :
                           'Удалить грядку?';
      const confirmMsg = currentLang === 'et' ? `Kas soovite tõesti kustutada «<strong>${escapeHtml(bedTitle)}</strong>» plaanilt? Kõik selle istutusandmed kustutatakse.` :
                         currentLang === 'lv' ? `Vai tiešām vēlaties dzēst «<strong>${escapeHtml(bedTitle)}</strong>» no plāna? Visi stādījumu dati tiks dzēsti.` :
                         currentLang === 'lt' ? `Ar tikrai norite pašalinti «<strong>${escapeHtml(bedTitle)}</strong>» iš plano? Visi sodinimo duomenys bus ištrinti.` :
                         `Вы действительно хотите удалить грядку <strong>«${escapeHtml(bedTitle)}»</strong> с плана участка? Все данные о её посадках будут удалены.`;
      const confirmBtnText = currentLang === 'et' ? '🗑️ Jah, kustuta' :
                             currentLang === 'lv' ? '🗑️ Jā, dzēst' :
                             currentLang === 'lt' ? '🗑️ Taip, pašalinti' :
                             '🗑️ Да, удалить';

      this.showConfirmModal({
        title: confirmTitle,
        icon: '🗑️',
        message: confirmMsg,
        confirmText: confirmBtnText,
        confirmClass: 'btn-danger',
        onConfirm: () => {
          this.storage.deleteBed(bedId);
          drawer.classList.remove('open');
          this.activeInspectorBedId = null;
          this.activeInspectorSectionId = null;
          this.gardenMap.render();
          const delToast = currentLang === 'et' ? `«${bedTitle}» on kustutatud` :
                           currentLang === 'lv' ? `«${bedTitle}» ir dzēsta` :
                           currentLang === 'lt' ? `«${bedTitle}» pašalinta` :
                           `Грядка «${bedTitle}» удалена`;
          this.showToast(delToast);
        }
      });
    });

    // Инициализация интерактивного комбобокса с живым поиском и созданием новой культуры
    this.setupCropCombobox(bedId, activeSection, history, targetArea, neighborCropIds);

    // Инициализация калькулятора полива, схемы лунок, журнала подкормок и фотогалереи
    this.setupInspectorWaterCalculator(bed, targetArea, currentPlanting.cropId, currentLang);
    this.setupInspectorHoles(bed, activeSection, activeYear, currentLang);
    this.setupInspectorCareLog(bed, activeSection, activeYear, currentLang);
    this.setupInspectorPhotos(bed, activeYear, currentLang);
  }

  setupCropCombobox(bedId, activeSection, history, targetArea = 0, neighborCropIds = []) {
    const wrap = document.getElementById('crop-combobox-wrap');
    const input = document.getElementById('inspector-crop-combobox-input');
    const hiddenSelect = document.getElementById('inspector-crop-select');
    const dropdown = document.getElementById('crop-combobox-dropdown');
    const clearBtn = document.getElementById('combobox-clear-btn');
    const toggleBtn = document.getElementById('combobox-toggle-btn');
    const leadIcon = document.getElementById('combobox-selected-icon');
    const statusBox = document.getElementById('rotation-status-box');

    if (!wrap || !input || !hiddenSelect || !dropdown) return;

    const currentLang = window.i18n ? window.i18n.getLanguage() : 'ru';
    let highlightedIndex = -1;
    let currentMatches = [];

    const updateRotationPreview = (cropId) => {
      if (statusBox) {
        const liveEval = evaluateCropRotation(cropId, history);
        statusBox.innerHTML = this.renderInspectorRotationStatus(liveEval);
      }
      const capContainer = document.getElementById('inspector-capacity-container');
      if (capContainer) {
        capContainer.innerHTML = this.renderInspectorCapacity(cropId, targetArea, currentLang);
      }
      const compContainer = document.getElementById('inspector-companions-container');
      if (compContainer) {
        compContainer.innerHTML = this.renderInspectorCompanions(cropId, neighborCropIds, currentLang);
      }
    };

    const renderDropdown = (query = '') => {
      const q = query.trim().toLowerCase();
      const allCrops = (typeof window !== 'undefined' && window.CROPS_DATABASE) ? [...window.CROPS_DATABASE] : [];
      
      // Сортировка: сначала пользовательские, затем алфавитно по активному языку
      allCrops.sort((a, b) => {
        if (a.isCustom && !b.isCustom) return -1;
        if (!a.isCustom && b.isCustom) return 1;
        const nameA = getCropName(a, currentLang);
        const nameB = getCropName(b, currentLang);
        return nameA.localeCompare(nameB, currentLang);
      });

      let matches = [];
      if (!q) {
        matches = allCrops;
      } else {
        const matchesCrop = (c) => {
          const nLoc = getCropName(c, currentLang).toLowerCase();
          const nRu = (c.name || '').toLowerCase();
          const nEt = (c.nameEt || '').toLowerCase();
          const nLv = (c.nameLv || '').toLowerCase();
          const nLt = (c.nameLt || '').toLowerCase();
          return nLoc.includes(q) || nRu.includes(q) || nEt.includes(q) || nLv.includes(q) || nLt.includes(q);
        };
        const startsWithCrop = (c) => {
          const nLoc = getCropName(c, currentLang).toLowerCase();
          const nRu = (c.name || '').toLowerCase();
          return nLoc.startsWith(q) || nRu.startsWith(q);
        };
        const prefix = allCrops.filter(c => matchesCrop(c) && startsWithCrop(c));
        const other = allCrops.filter(c => matchesCrop(c) && !startsWithCrop(c));
        matches = [...prefix, ...other];
      }

      currentMatches = matches;
      highlightedIndex = matches.length > 0 ? 0 : -1;

      const hasExactMatch = allCrops.some(c => {
        return getCropName(c, currentLang).toLowerCase() === q || (c.name || '').toLowerCase() === q;
      });
      const showCreateOption = q.length > 0 && !hasExactMatch;

      let html = '';

      if (matches.length > 0) {
        html += `<div class="combobox-list">`;
        matches.forEach((crop, idx) => {
          const fam = getFamilyById(crop.family);
          const cropName = getCropName(crop, currentLang);
          let nameHtml = escapeHtml(cropName);
          if (q) {
            const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            nameHtml = escapeHtml(cropName).replace(regex, '<mark class="combobox-hl">$1</mark>');
          }

          const isSelected = hiddenSelect.value === crop.id;
          html += `
            <div class="combobox-item ${idx === 0 ? 'highlighted' : ''} ${isSelected ? 'selected' : ''}" data-crop-id="${crop.id}" data-index="${idx}">
              <div class="combobox-item-icon">${getCropSvg(crop.id)}</div>
              <div class="combobox-item-info">
                <span class="combobox-item-name">${nameHtml}</span>
                <span class="combobox-item-meta">${fam ? escapeHtml(getFamilyName(fam, currentLang)) : ''}</span>
              </div>
              ${isSelected ? '<span class="combobox-item-check">✓</span>' : ''}
            </div>
          `;
        });
        html += `</div>`;
      } else {
        const notFoundMsg = currentLang === 'et' ? `Kultuuri <strong>«${escapeHtml(query.trim())}»</strong> ei leitud nimekirjast` :
                            currentLang === 'lv' ? `Kultūra <strong>«${escapeHtml(query.trim())}»</strong> nav atrasta sarakstā` :
                            currentLang === 'lt' ? `Kultūra <strong>«${escapeHtml(query.trim())}»</strong> nerasta sąraše` :
                            `Культура <strong>«${escapeHtml(query.trim())}»</strong> не найдена в списке`;
        html += `
          <div class="combobox-empty-notice">
            <span>${notFoundMsg}</span>
          </div>
        `;
      }

      if (showCreateOption) {
        const createTitle = currentLang === 'et' ? `Loo kultuur <strong>«${escapeHtml(query.trim())}»</strong>` :
                            currentLang === 'lv' ? `Izveidot kultūru <strong>«${escapeHtml(query.trim())}»</strong>` :
                            currentLang === 'lt' ? `Sukurti kultūrą <strong>«${escapeHtml(query.trim())}»</strong>` :
                            `Создать культуру <strong>«${escapeHtml(query.trim())}»</strong>`;
        const createDesc = currentLang === 'et' ? 'Lisa taim oma teatmikku ja vali kohe külviks' :
                           currentLang === 'lv' ? 'Pievienot augu savai rokasgrāmatai un uzreiz izvēlēties stādīšanai' :
                           currentLang === 'lt' ? 'Pridėti augalą į žinyną ir iškart pasirinkti sodinimui' :
                           'Добавить растение в свой справочник и сразу выбрать для посадки';
        const createTag = currentLang === 'et' ? 'Uus' : currentLang === 'lv' ? 'Jauns' : currentLang === 'lt' ? 'Naujas' : 'Новая';

        html += `
          <div class="combobox-create-card ${matches.length === 0 ? 'solitary highlighted' : ''}" id="combobox-create-card-trigger" data-typed-name="${escapeHtml(query.trim())}">
            <div class="create-card-left">
              <span class="create-plus-badge">➕</span>
            </div>
            <div class="create-card-body">
              <div class="create-card-title">${createTitle}</div>
              <div class="create-card-desc">${createDesc}</div>
            </div>
            <span class="create-card-tag">${createTag}</span>
          </div>
        `;
      }

      dropdown.innerHTML = html;
      dropdown.style.display = 'block';
      if (toggleBtn) toggleBtn.classList.add('open');

      // Клик по элементу списка
      dropdown.querySelectorAll('.combobox-item').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const cid = el.getAttribute('data-crop-id');
          selectCrop(cid);
        });
      });

      // Клик по карточке создания новой культуры
      const createTrigger = document.getElementById('combobox-create-card-trigger');
      if (createTrigger) {
        createTrigger.addEventListener('click', (e) => {
          e.stopPropagation();
          const typedName = createTrigger.getAttribute('data-typed-name');
          this.openCreateCropModal(typedName, (newCrop) => {
            selectCrop(newCrop.id);
          });
        });
      }
    };

    const selectCrop = (cropId) => {
      const crop = getCropById(cropId);
      if (crop) {
        hiddenSelect.value = crop.id;
        input.value = getCropName(crop, currentLang);
        leadIcon.innerHTML = getCropSvg(crop.id);
        if (clearBtn) clearBtn.classList.add('visible');
        updateRotationPreview(crop.id);
      } else {
        hiddenSelect.value = '';
        input.value = '';
        leadIcon.innerHTML = '<span style="font-size: 1.15rem;">🌱</span>';
        if (clearBtn) clearBtn.classList.remove('visible');
        updateRotationPreview('');
      }
      closeDropdown();
    };

    const openDropdown = () => {
      renderDropdown(input.value);
    };

    const closeDropdown = () => {
      dropdown.style.display = 'none';
      if (toggleBtn) toggleBtn.classList.remove('open');
      highlightedIndex = -1;
      const currentSelected = getCropById(hiddenSelect.value);
      if (currentSelected) {
        input.value = getCropName(currentSelected, currentLang);
        leadIcon.innerHTML = getCropSvg(currentSelected.id);
        if (clearBtn) clearBtn.classList.add('visible');
      } else {
        input.value = '';
        leadIcon.innerHTML = '<span style="font-size: 1.15rem;">🌱</span>';
        if (clearBtn) clearBtn.classList.remove('visible');
      }
    };

    input.addEventListener('focus', () => {
      input.select();
      openDropdown();
    });

    input.addEventListener('input', () => {
      const val = input.value;
      if (!val) {
        hiddenSelect.value = '';
        leadIcon.innerHTML = '<span style="font-size: 1.15rem;">🌱</span>';
        if (clearBtn) clearBtn.classList.remove('visible');
        updateRotationPreview('');
      } else {
        if (clearBtn) clearBtn.classList.add('visible');
      }
      renderDropdown(val);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectCrop('');
        input.focus();
        renderDropdown('');
      });
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdown.style.display === 'block') {
          closeDropdown();
        } else {
          input.focus();
          openDropdown();
        }
      });
    }

    // Клавиатурная навигация
    input.addEventListener('keydown', (e) => {
      if (dropdown.style.display !== 'block') {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          openDropdown();
          return;
        }
      }

      const items = dropdown.querySelectorAll('.combobox-item');
      const createBtn = document.getElementById('combobox-create-card-trigger');
      const totalCount = items.length + (createBtn ? 1 : 0);
      if (totalCount === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedIndex = (highlightedIndex + 1) % totalCount;
        updateHighlight(items, createBtn);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedIndex = (highlightedIndex - 1 + totalCount) % totalCount;
        updateHighlight(items, createBtn);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (createBtn && highlightedIndex === items.length) {
          createBtn.click();
        } else if (items[highlightedIndex]) {
          items[highlightedIndex].click();
        } else if (createBtn) {
          createBtn.click();
        }
      } else if (e.key === 'Escape') {
        closeDropdown();
      }
    });

    const updateHighlight = (items, createBtn) => {
      items.forEach((it, idx) => {
        const isHl = idx === highlightedIndex;
        it.classList.toggle('highlighted', isHl);
        if (isHl) it.scrollIntoView({ block: 'nearest' });
      });
      if (createBtn) {
        const isHl = highlightedIndex === items.length;
        createBtn.classList.toggle('highlighted', isHl);
        if (isHl) createBtn.scrollIntoView({ block: 'nearest' });
      }
    };

    // Закрытие при клике снаружи
    const onDocClick = (e) => {
      if (!wrap.contains(e.target)) {
        closeDropdown();
      }
    };
    document.addEventListener('click', onDocClick);
  }

  openCreateCropModal(initialName = '', onCreated = null) {
    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) return;

    const emojiPresets = [
      '🌱', '🌿', '🥬', '🥦', '🥕', '🧄', '🧅', '🫘', '🌽', '🍅', 
      '🥒', '🍆', '🌶️', '🫑', '🥔', '🍓', '🍇', '🍈', '🍉', '🌻'
    ];

    const lowerName = (initialName || '').toLowerCase();
    let defaultEmoji = '🌱';
    if (lowerName.includes('земляник') || lowerName.includes('клубник') || lowerName.includes('ягод') || lowerName.includes('малин')) defaultEmoji = '🍓';
    else if (lowerName.includes('виноград')) defaultEmoji = '🍇';
    else if (lowerName.includes('арбуз')) defaultEmoji = '🍉';
    else if (lowerName.includes('дыня')) defaultEmoji = '🍈';
    else if (lowerName.includes('кукуруз')) defaultEmoji = '🌽';
    else if (lowerName.includes('зелен') || lowerName.includes('укроп') || lowerName.includes('петрушк') || lowerName.includes('базилик') || lowerName.includes('мята') || lowerName.includes('руккол') || lowerName.includes('кинз') || lowerName.includes('розмарин')) defaultEmoji = '🌿';
    else if (lowerName.includes('салат') || lowerName.includes('шпинат') || lowerName.includes('щавель')) defaultEmoji = '🥬';
    else if (lowerName.includes('чеснок')) defaultEmoji = '🧄';
    else if (lowerName.includes('лук') || lowerName.includes('порей')) defaultEmoji = '🧅';
    else if (lowerName.includes('перец')) defaultEmoji = '🌶️';
    else if (lowerName.includes('баклажан')) defaultEmoji = '🍆';
    else if (lowerName.includes('картоф') || lowerName.includes('батат')) defaultEmoji = '🥔';
    else if (lowerName.includes('боб') || lowerName.includes('фасол') || lowerName.includes('горох') || lowerName.includes('нут') || lowerName.includes('чечевиц')) defaultEmoji = '🫘';
    else if (lowerName.includes('подсолнух') || lowerName.includes('цветок')) defaultEmoji = '🌻';

    let selectedEmoji = defaultEmoji;

    modalContent.innerHTML = `
      <div class="modal-card modal-create-crop-card" style="max-width: 480px;">
        <div class="modal-header">
          <div class="modal-header-info">
            <h3>🌱 Создать новую культуру</h3>
            <span class="modal-subtitle">Добавление в персональный каталог огорода</span>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-sublabel"><strong>🏷️ Название культуры:</strong></label>
            <input type="text" id="new-crop-name" class="form-input" placeholder="Например: Руккола, Физалис, Дыня..." value="${escapeHtml(initialName)}">
          </div>

          <div class="form-group mt-3">
            <label class="form-sublabel"><strong>🎨 Выберите значок (смайлик):</strong></label>
            <div class="crop-emoji-picker-grid" id="crop-emoji-picker">
              ${emojiPresets.map(em => `
                <button type="button" class="emoji-chip ${em === selectedEmoji ? 'active' : ''}" data-emoji="${em}">
                  ${em}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="form-group mt-3">
            <label class="form-sublabel"><strong>🌿 Семейство растений (для севооборота):</strong></label>
            <select id="new-crop-family" class="form-select">
              <option value="custom" selected>⭐ Мои культуры (универсальное)</option>
              <option value="cucurbitaceae">Тыквенные (Огурец, Кабачок, Тыква, Дыня)</option>
              <option value="solanaceae">Паслёновые (Томат, Перец, Баклажан, Картофель, Физалис)</option>
              <option value="brassicaceae">Крестоцветные (Капуста, Редис, Руккола, Горчица)</option>
              <option value="apiaceae">Зонтичные (Морковь, Укроп, Петрушка, Сельдерей, Кинза)</option>
              <option value="amaryllidaceae">Луковые (Лук репчатый, Чеснок, Порей)</option>
              <option value="fabaceae">Бобовые (Горох, Фасоль, Бобы, Нут)</option>
              <option value="chenopodiaceae">Маревые (Свёкла, Мангольд, Шпинат)</option>
              <option value="asteraceae">Астровые (Салат листовой, Эстрагон, Подсолнечник)</option>
              <option value="rosaceae">Розоцветные (Клубника, Земляника, Малина)</option>
              <option value="poaceae">Злаковые (Кукуруза, Овес, Рожь)</option>
            </select>
          </div>

          <div class="form-group mt-3">
            <label class="form-sublabel">⏳ Срок возврата на ту же грядку:</label>
            <select id="new-crop-return" class="form-select">
              <option value="3" selected>Через 3 года (стандартно)</option>
              <option value="2">Через 2 года (для листовых и трав)</option>
              <option value="4">Через 4 года (для требовательных культур)</option>
              <option value="1">Ежегодно (сидерат / самовосстановление)</option>
            </select>
          </div>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" class="btn btn-outline modal-cancel-btn">Отмена</button>
          <button type="button" class="btn btn-primary" id="btn-confirm-create-crop">
            ➕ Добавить культуру
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
    const closeModal = () => modal.classList.remove('active');

    modalContent.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modalContent.querySelector('.modal-cancel-btn').addEventListener('click', closeModal);

    const nameInput = document.getElementById('new-crop-name');
    nameInput.focus();
    nameInput.select();

    // Переключение эмодзи
    modalContent.querySelectorAll('.emoji-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        modalContent.querySelectorAll('.emoji-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedEmoji = btn.getAttribute('data-emoji');
      });
    });

    const handleCreate = () => {
      const name = nameInput.value.trim();
      if (!name) {
        nameInput.focus();
        return;
      }

      const family = document.getElementById('new-crop-family').value || 'custom';
      const minYearsReturn = parseInt(document.getElementById('new-crop-return').value, 10) || 3;

      const newCrop = this.storage.addCustomCrop({
        name,
        emoji: selectedEmoji,
        family,
        minYearsReturn
      });

      closeModal();
      this.showToast(`Культура «${newCrop.name}» ${selectedEmoji} добавлена в справочник!`);
      
      if (onCreated) {
        onCreated(newCrop);
      }
    };

    document.getElementById('btn-confirm-create-crop').addEventListener('click', handleCreate);
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCreate();
      }
    });
  }

  renderInspectorRotationStatus(rotationEval) {
    const currentLang = window.i18n ? window.i18n.getLanguage() : 'ru';
    if (!rotationEval) {
      const neutralTitle = currentLang === 'et' ? 'Kultuuri pole valitud' :
                           currentLang === 'lv' ? 'Kultūra nav izvēlēta' :
                           currentLang === 'lt' ? 'Kultūra nepasirinkta' :
                           'Культура не выбрана';
      const neutralDesc = currentLang === 'et' ? 'Valige taim, et näha sobivuse ja eelviljade analüüsi.' :
                          currentLang === 'lv' ? 'Izvēlieties augu, lai redzētu saderības un priekšaugu analīzi.' :
                          currentLang === 'lt' ? 'Pasirinkite augalą, kad pamatytumėte suderinamumo ir priešsėlių analizę.' :
                          'Выберите растение, чтобы увидеть анализ совместимости и предшественников.';
      return `
        <div class="status-alert alert-neutral">
          <div class="alert-title">${neutralTitle}</div>
          <div class="alert-desc">${neutralDesc}</div>
        </div>
      `;
    }

    let alertClass = 'alert-optimal';
    let icon = '✅';
    if (rotationEval.status === 'warning') {
      alertClass = 'alert-warning';
      icon = '⚠️';
    } else if (rotationEval.status === 'danger') {
      alertClass = 'alert-danger';
      icon = '❌';
    }

    const adviceLabel = currentLang === 'et' ? 'Nõuanne' :
                        currentLang === 'lv' ? 'Padoms' :
                        currentLang === 'lt' ? 'Patarimas' :
                        'Совет';

    return `
      <div class="status-alert ${alertClass}">
        <div class="alert-title">${icon} ${escapeHtml(rotationEval.title)}</div>
        <ul class="alert-reasons-list">
          ${rotationEval.reasons.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
        </ul>
        ${rotationEval.advice ? `
          <div class="alert-advice">
            <strong>${adviceLabel}:</strong> ${escapeHtml(rotationEval.advice)}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderInspectorCapacity(cropId, targetArea, currentLang = 'ru') {
    if (!cropId || cropId === 'fallow') return '';
    const cap = typeof calculateCropCapacity === 'function' ? calculateCropCapacity(cropId, targetArea, currentLang) : null;
    if (!cap) return '';

    const title = currentLang === 'et' ? '📐 Peenra mahutavus ja seemned' :
                  currentLang === 'lv' ? '📐 Dobes ietilpība un sēklas' :
                  currentLang === 'lt' ? '📐 Lysvės talpa ir sėklos' :
                  '📐 Вместимость грядки и калькулятор семян';

    return `
      <div class="bed-capacity-card" id="bed-capacity-card">
        <div class="bed-capacity-header">
          <span class="bed-capacity-title">
            <span>${title}</span>
          </span>
          <span class="bed-capacity-area-tag">${cap.areaSqM} м²</span>
        </div>
        <div class="bed-capacity-result">
          <span class="capacity-qty">~${cap.quantity}</span>
          <span class="capacity-unit">${escapeHtml(cap.unit)}</span>
        </div>
        <div class="capacity-scheme-hint">
          📏 ${escapeHtml(cap.hint || cap.spacing)}
        </div>
      </div>
    `;
  }

  renderInspectorCompanions(cropId, neighborCropIds = [], currentLang = 'ru') {
    if (!cropId || cropId === 'fallow') return '';
    const comp = typeof evaluateCompanionPlanting === 'function' ? evaluateCompanionPlanting(cropId, neighborCropIds, currentLang) : null;
    if (!comp) return '';

    const title = currentLang === 'et' ? '🌿 Naabertaimed ja kaaslased' :
                  currentLang === 'lv' ? '🌿 Kaimiņaugi un saderība' :
                  currentLang === 'lt' ? '🌿 Augalai-kaimynai ir suderinamumas' :
                  '🌿 Растения-союзники (соседство)';
    const goodTitle = currentLang === 'et' ? '👍 Head naabrid:' :
                      currentLang === 'lv' ? '👍 Labi kaimiņi:' :
                      currentLang === 'lt' ? '👍 Geri kaimynai:' :
                      '👍 Отличные соседи:';
    const badTitle = currentLang === 'et' ? '👎 Ebasoovitav kõrvale:' :
                     currentLang === 'lv' ? '👎 Nevēlams blakus:' :
                     currentLang === 'lt' ? '👎 Nepageidautina šalia:' :
                     '👎 Не сажать рядом:';

    let alertHtml = '';
    if (comp.alertMessage) {
      const alertClass = comp.status === 'positive' ? 'companion-alert-positive' : 'companion-alert-negative';
      alertHtml = `<div class="companion-alert-banner ${alertClass}">${escapeHtml(comp.alertMessage)}</div>`;
    }

    const goodPills = (comp.allGoodCrops || []).slice(0, 5).map(c => `
      <span class="companion-pill companion-pill-good" title="Отличный сосед">${c.emoji || '🌱'} ${escapeHtml(getCropName(c, currentLang))}</span>
    `).join('');

    const badPills = (comp.allBadCrops || []).slice(0, 4).map(c => `
      <span class="companion-pill companion-pill-bad" title="Конфликтный сосед">${c.emoji || '🌱'} ${escapeHtml(getCropName(c, currentLang))}</span>
    `).join('');

    return `
      <div class="bed-companions-card" id="bed-companions-card">
        <div class="bed-capacity-header" style="margin-bottom: 0.45rem;">
          <span class="bed-capacity-title">
            <span>${title}</span>
          </span>
        </div>
        ${alertHtml}
        ${goodPills ? `
          <div class="companion-section-title">${goodTitle}</div>
          <div class="companion-pills-wrap">${goodPills}</div>
        ` : ''}
        ${badPills ? `
          <div class="companion-section-title">${badTitle}</div>
          <div class="companion-pills-wrap">${badPills}</div>
        ` : ''}
      </div>
    `;
  }

  renderBedPastHistoryList(bed, activeYear) {
    const currentLang = window.i18n ? window.i18n.getLanguage() : 'ru';
    const years = Object.keys(bed.history || {})
      .map(y => parseInt(y, 10))
      .filter(y => y < activeYear)
      .sort((a, b) => b - a);

    const noRecords = currentLang === 'et' ? 'Varasemate aastate kanded puuduvad' :
                      currentLang === 'lv' ? 'Nav ierakstu par iepriekšējiem gadiem' :
                      currentLang === 'lt' ? 'Nėra ankstesnių metų įrašų' :
                      'Нет записей за предыдущие годы';
    const yrWord = currentLang === 'et' ? 'a.' :
                   currentLang === 'lv' ? 'g.' :
                   currentLang === 'lt' ? 'm.' :
                   'г.';
    const fallowText = currentLang === 'et' ? 'Külvamata / maa puhkab' :
                       currentLang === 'lv' ? 'Nav apsēts / atpūta' :
                       currentLang === 'lt' ? 'Neapsėta / poilsis' :
                       'Не засеяно / отдых';

    if (!years.length) {
      return `<div class="text-xs text-muted">${noRecords}</div>`;
    }

    return years.map(year => {
      const p = bed.history[year];
      const crop = p?.cropId ? getCropById(p.cropId) : null;
      return `
        <div class="history-item">
          <span class="history-year">${year} ${yrWord}:</span>
          ${crop ? `
            <span class="history-crop"><span class="history-crop-svg">${getCropSvg(crop.id)}</span> <strong>${escapeHtml(getCropName(crop, currentLang))}</strong></span>
            ${p.variety ? `<span class="history-variety">(${escapeHtml(p.variety)})</span>` : ''}
            ${p.note ? `<div class="history-note text-xs text-muted">${escapeHtml(p.note)}</div>` : ''}
          ` : `
            <span class="text-muted">${fallowText}</span>
          `}
        </div>
      `;
    }).join('');
  }

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
