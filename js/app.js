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

  renderEncyclopediaView() {
    const container = document.getElementById('encyclopedia-container');
    if (!container) return;

    const currentLang = window.i18n ? window.i18n.getLanguage() : 'ru';

    // Рендерим фильтры по семействам
    const familiesList = Object.values(CROP_FAMILIES);
    const searchPh = window.t ? window.t('encyclo_search_placeholder') : 'Поиск культуры...';
    const customCropBtnText = window.t ? window.t('encyclo_btn_custom_crop') : '➕ Своя культура';
    const allCropsText = window.t ? window.t('encyclo_family_filter_all') : 'Все культуры';

    let filtersHtml = `
      <div class="encyclopedia-toolbar">
        <div style="display: flex; gap: 10px; width: 100%; align-items: center;">
          <div class="search-box" style="flex: 1;">
            <span class="search-icon">🔍</span>
            <input type="text" id="crop-search-input" placeholder="${searchPh}" value="${escapeHtml(this.searchQuery)}">
          </div>
          <button class="btn btn-primary" id="btn-encyclopedia-add-crop" style="white-space: nowrap; font-size: 0.88rem; padding: 0.6rem 1rem;" title="${window.t ? window.t('create_crop_modal_title') : 'Создать культуру'}">
            ${customCropBtnText}
          </button>
        </div>
        <div class="family-filters">
          <button class="chip-filter ${this.activeCropFilter === 'all' ? 'active' : ''}" data-family="all">
            ${allCropsText} (${CROPS_DATABASE.length})
          </button>
          ${familiesList.map(fam => {
            const count = CROPS_DATABASE.filter(c => c.family === fam.id).length;
            if (count === 0) return '';
            const isActive = this.activeCropFilter === fam.id;
            return `
              <button class="chip-filter ${isActive ? 'active' : ''}" data-family="${fam.id}">
                <span class="family-dot" style="background-color: ${fam.color};"></span>
                ${escapeHtml(getFamilyName(fam, currentLang))} (${count})
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Фильтрация культур
    const q = (this.searchQuery || '').toLowerCase().trim();
    const filteredCrops = CROPS_DATABASE.filter(c => {
      if (this.activeCropFilter !== 'all' && c.family !== this.activeCropFilter) return false;
      if (q) {
        const matchName = (c.name || '').toLowerCase().includes(q) ||
                          (c.nameEt && c.nameEt.toLowerCase().includes(q)) ||
                          (c.nameLv && c.nameLv.toLowerCase().includes(q)) ||
                          (c.nameLt && c.nameLt.toLowerCase().includes(q));
        const matchDesc = (c.description || '').toLowerCase().includes(q);
        const matchTip = (c.agronomicTip || '').toLowerCase().includes(q);
        const fam = getFamilyById(c.family);
        const matchFam = fam && (
          (fam.nameRu && fam.nameRu.toLowerCase().includes(q)) ||
          (fam.nameEt && fam.nameEt.toLowerCase().includes(q)) ||
          (fam.nameLv && fam.nameLv.toLowerCase().includes(q)) ||
          (fam.nameLt && fam.nameLt.toLowerCase().includes(q))
        );
        return matchName || matchDesc || matchTip || matchFam;
      }
      return true;
    });

    // Сортировка по алфавиту выбранного языка
    filteredCrops.sort((a, b) => {
      const nameA = getCropName(a, currentLang);
      const nameB = getCropName(b, currentLang);
      return nameA.localeCompare(nameB, currentLang);
    });

    const returnWord = currentLang === 'et' ? 'a.' : currentLang === 'lv' ? 'g.' : currentLang === 'lt' ? 'm.' : 'г.';
    const returnLabel = currentLang === 'et' ? 'Paus' : currentLang === 'lv' ? 'Pauze' : currentLang === 'lt' ? 'Pertrauka' : 'Возврат';
    const bestPredLabel = currentLang === 'et' ? '✅ Parimad:' : currentLang === 'lv' ? '✅ Labākie:' : currentLang === 'lt' ? '✅ Geriausi:' : '✅ Лучшие:';
    const badPredLabel = currentLang === 'et' ? '❌ Vältida:' : currentLang === 'lv' ? '❌ Izvairīties:' : currentLang === 'lt' ? '❌ Vengti:' : '❌ Избегать:';
    const dossierBtnText = currentLang === 'et' ? '📖 Täielik toimik' : currentLang === 'lv' ? '📖 Pilna dosjē' : currentLang === 'lt' ? '📖 Pilnas dosjė' : '📖 Полное агро-досье';

    let cardsHtml = `
      <div class="crop-catalog-grid">
        ${filteredCrops.map(crop => {
          const fam = getFamilyById(crop.family);
          return `
            <div class="crop-catalog-card" data-crop-id="${crop.id}">
              <div class="catalog-card-header">
                <div class="catalog-crop-svg">${getCropSvg(crop.id)}</div>
                <div class="catalog-crop-title-group">
                  <h3 class="catalog-crop-title">${escapeHtml(getCropName(crop, currentLang))}</h3>
                  <span class="catalog-family-tag" style="background-color: ${fam?.color || '#2e7d32'};">
                    ${fam ? escapeHtml(getFamilyName(fam, currentLang)) : ''}
                  </span>
                </div>
              </div>

              <p class="catalog-crop-desc">${escapeHtml(crop.description)}</p>

              <div class="catalog-meta-row">
                <span class="meta-tag">⏳ ${returnLabel}: ${crop.minYearsReturn} ${returnWord}</span>
                <span class="meta-tag">🌱 ${crop.rootDepth}</span>
              </div>

              <div class="catalog-predecessors-preview">
                <div class="pred-label-good">${bestPredLabel}</div>
                <div class="pred-icons">
                  ${crop.goodPredecessors.slice(0, 4).map(pid => {
                    const pc = getCropById(pid);
                    return pc ? `<span class="icon-tiny-svg" title="${escapeHtml(getCropName(pc, currentLang))}">${getCropSvg(pc.id)}</span>` : '';
                  }).join('')}
                </div>
              </div>

              <div class="catalog-predecessors-preview">
                <div class="pred-label-bad">${badPredLabel}</div>
                <div class="pred-icons">
                  ${crop.badPredecessors.slice(0, 4).map(pid => {
                    const pc = getCropById(pid);
                    return pc ? `<span class="icon-tiny-svg" title="${escapeHtml(getCropName(pc, currentLang))}">${getCropSvg(pc.id)}</span>` : '';
                  }).join('')}
                </div>
              </div>

              <button class="btn btn-sm btn-outline view-crop-details-btn mt-2" data-crop-id="${crop.id}">
                ${dossierBtnText}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.innerHTML = filtersHtml + cardsHtml;

    // Слушатели поиска и фильтрации
    const searchInput = document.getElementById('crop-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderEncyclopediaView();
      });
    }

    const addCropBtn = document.getElementById('btn-encyclopedia-add-crop');
    if (addCropBtn) {
      addCropBtn.addEventListener('click', () => {
        this.openCreateCropModal('', () => {
          this.renderEncyclopediaView();
        });
      });
    }

    container.querySelectorAll('.chip-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeCropFilter = btn.getAttribute('data-family');
        this.renderEncyclopediaView();
      });
    });

    container.querySelectorAll('.view-crop-details-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cropId = btn.getAttribute('data-crop-id');
        this.openCropModal(cropId);
      });
    });
  }

  renderRotationGuideView() {
    const container = document.getElementById('planner-container');
    if (!container) return;

    const currentLang = window.i18n ? window.i18n.getLanguage() : 'ru';

    const guideTexts = {
      ru: {
        heroTitle: '🌾 Золотые правила севооборота для богатого урожая',
        heroDesc: 'Правильный севооборот (чередование культур) решает 3 ключевые задачи на огороде: <strong>не допускает накопления почвенных инфекций</strong>, <strong>предотвращает одностороннее истощение питательных веществ</strong> и <strong>подавляет специализированных сорняков и вредителей</strong>.',
        r1Title: 'Правило семейств',
        r1Desc: 'Никогда не сажайте культуры одного ботанического семейства подряд на одном месте! Картофель после томатов или баклажан после перца приведут к накоплению фитофторы и колорадского жука.',
        r1Badge: 'Пауза: 3-4 года',
        r2Title: 'Баланс питательных веществ',
        r2Desc: 'Чередуйте культуры по уровню «аппетита»: «Прожорливые» (огурцы, капуста, кабачки) ➔ «Умеренные» (морковь, свёкла, лук) ➔ «Обогатители» (горох, бобы, фасоль, сидераты).',
        r2Badge: 'Органика ➔ Корнеплоды ➔ Азот',
        r3Title: 'Чередование горизонтов корней',
        r3Desc: 'Чередуйте растения с поверхностными корнями (огурцы, лук, зелень) с растениями с глубокой корневой системой (морковь, свёкла, томаты), чтобы брать питание из разных слоев почвы.',
        r3Badge: 'Верхний слой ➔ Глубокий слой',
        r4Title: 'Сила сидератов',
        r4Desc: 'После ранней уборки культур (чеснок, ранний картофель, горох) обязательно засевайте грядку фацелией, белой горчицей или озимой рожью. Сидераты санируют грунт лучше любой химии.',
        r4Badge: 'Оздоровление за 40 дней',
        cycleTitle: '🔄 Классический 4-польный севооборот для огородника',
        y1: '1-й ГОД', y1T: 'Тыквенные & Капуста', y1D: 'Вносится навоз, компост или перегной. Максимальное плодородие.',
        y2: '2-й ГОД', y2T: 'Паслёновые (Томаты, Перцы)', y2D: 'Потребляют калий и фосфор из перепревшей органики первого года.',
        y3: '3-й ГОД', y3T: 'Корнеплоды & Луковые', y3D: 'Морковь, свёкла, лук, чеснок. Свежий навоз не нужен, чистая земля.',
        y4: '4-й ГОД', y4T: 'Бобовые & Сидераты', y4D: 'Горох, фасоль, вика, фацелия. Восстановление азота и отдых почвы.',
        calcTitle: '⚡ Экспресс-калькулятор предшественников',
        calcDesc: 'Выберите культуру, которую планируете посадить, чтобы узнать её идеальный севооборот:',
        calcBtn: 'Показать рекомендации'
      },
      et: {
        heroTitle: '🌾 Külvikorra kuldsed reeglid rikkaliku saagi saamiseks',
        heroDesc: 'Õige külvikord lahendab aias 3 põhiprobleemi: <strong>hoiab ära mulla patogeenide kogunemise</strong>, <strong>väldib toitainete ühekülgset kurnamist</strong> ja <strong>pärsib spetsiifilisi kahjureid ning umbrohtu</strong>.',
        r1Title: 'Sugukondade reegel',
        r1Desc: 'Ärge kunagi istutage sama botaanilise sugukonna taimi järjest samale kohale! Kartul tomati järel toob kaasa lehemädaniku ja kahjurite kogunemise.',
        r1Badge: 'Paus: 3-4 aastat',
        r2Title: 'Toitainete tasakaal',
        r2Desc: 'Vaheldage kultuure toitainevajaduse järgi: „Nõudlikud“ (kurgid, kapsas) ➔ „Mõõdukad“ (porgand, peet, sibul) ➔ „Rikastajad“ (hernes, oad, vahekultuurid).',
        r2Badge: 'Kompost ➔ Juurvili ➔ Lämmastik',
        r3Title: 'Juurekihtide vaheldumine',
        r3Desc: 'Vaheldage pinnapealse juurestikuga taimi (kurk, sibul, maitseroheline) sügavajuurelistega (porgand, peet, tomat), et kasutada mulla eri kihte.',
        r3Badge: 'Ülemine kiht ➔ Sügav kiht',
        r4Title: 'Vahekultuuride jõud',
        r4Desc: 'Pärast varajast saaki (küüslauk, varajane kartul, hernes) külvake peenrale keerispead, valget sinepit või talirukist mulla tervendamiseks.',
        r4Badge: 'Mulla tervis 40 päevaga',
        cycleTitle: '🔄 Klassikaline 4-väljaline külvikord koduaias',
        y1: '1. AASTA', y1T: 'Kõrvitsalised & Kapsas', y1D: 'Antakse kõdusõnnikut või komposti. Maksimaalne viljakus.',
        y2: '2. AASTA', y2T: 'Maavitsalised (Tomat, Paprika)', y2D: 'Tarbivad kaaliumi ja fosforit esimese aasta orgaanikast.',
        y3: '3. AASTA', y3T: 'Juurviljad & Sibulad', y3D: 'Porgand, peet, sibul, küüslauk. Puhas maa ilma värske orgaanikata.',
        y4: '4. AASTA', y4T: 'Liblikõielised & Sideraadid', y4D: 'Hernes, uba, vikk, keerispea. Lämmastiku taastamine ja mulla puhkus.',
        calcTitle: '⚡ Eelviljade ekspress-kalkulaator',
        calcDesc: 'Valige kultuur, mida plaanite istutada, et näha selle ideaalset külvikorda:',
        calcBtn: 'Näita soovitusi'
      },
      lv: {
        heroTitle: '🌾 Augsekas zelta likumi bagātīgai ražai',
        heroDesc: 'Pareiza augseka dārzā atrisina 3 galvenos uzdevumus: <strong>novērš augsnes slimību uzkrāšanos</strong>, <strong>novērš barības vielu vienpusēju noplicināšanu</strong> un <strong>apspiež specifiskos kaitēkļus un nezāles</strong>.',
        r1Title: 'Dzimtu likums',
        r1Desc: 'Nekad nestādiet vienas botāniskās dzimtas kultūras pēc kārtas vienā vietā! Kartupeļi pēc tomātiem vai baklažāni pēc pipariem izraisa puves un kaitēkļu savairošanos.',
        r1Badge: 'Pauze: 3-4 gadi',
        r2Title: 'Barības vielu līdzsvars',
        r2Desc: 'Mainiet kultūras pēc barības vielu patēriņa: Prasīgās (gurķi, kāposti) ➔ Mērenās (burkāni, bietes, sīpoli) ➔ Bagātinātājas (zirņi, pupas, zaļmēslojums).',
        r2Badge: 'Komposts ➔ Sakņaugi ➔ Slāpeklis',
        r3Title: 'Sakņu slāņu maiņa',
        r3Desc: 'Mainiet augus ar seklu sakņu sistēmu (gurķi, sīpoli) ar dziļo sakņu augiem (burkāni, bietes, tomāti), lai izmantotu dažādus augsnes slāņus.',
        r3Badge: 'Virsējais slānis ➔ Dziļais slānis',
        r4Title: 'Zaļmēslojuma spēks',
        r4Desc: 'Pēc agrīnās ražas novākšanas (ķiploki, agrie kartupeļi, zirņi) noteikti iesējiet facēliju, baltās sinepes vai rudzus augsnes atveseļošanai.',
        r4Badge: 'Atveseļošana 40 dienās',
        cycleTitle: '🔄 Klasiskā 4 lauku augseka mazdārziņā',
        y1: '1. GADS', y1T: 'Ķirbjaugi & Kāposti', y1D: 'Iestrādā kompostu vai kūtsmēslus. Maksimāla auglība.',
        y2: '2. GADS', y2T: 'Solanaceae (Tomāti, Pipari)', y2D: 'Patērē kāliju un fosforu no iepriekšējā gada organiskajām vielām.',
        y3: '3. GADS', y3T: 'Sakņaugi & Sīpoli', y3D: 'Burkāni, bietes, sīpoli, ķiploki. Tīra augsne bez svaigiem mēsliem.',
        y4: '4. GADS', y4T: 'Pākšaugi & Zaļmēslojums', y4D: 'Zirņi, pupas, vīķi, facēlija. Slāpekļa atjaunošana un augsnes atpūta.',
        calcTitle: '⚡ Priekšaugu ekspreskalkulators',
        calcDesc: 'Izvēlieties kultūru, kuru plānojat stādīt, lai uzzinātu tās ideālo augseku:',
        calcBtn: 'Rādīt ieteikumus'
      },
      lt: {
        heroTitle: '🌾 Auksinės sėjomainos taisyklės gausiam derliui',
        heroDesc: 'Teisinga sėjomaina sode išsprendžia 3 svarbiausius uždavinius: <strong>neleidžia kauptis dirvos ligoms</strong>, <strong>apsaugo nuo vienpusio maisto medžiagų išeikvojimo</strong> ir <strong>slopina specifines piktžoles bei kenkėjus</strong>.',
        r1Title: 'Šeimų taisyklė',
        r1Desc: 'Niekada nesodinkite tos pačios botaninės šeimos augalų iš eilės toje pačioje vietoje! Bulvės po pomidorų sukelia fitoftorozės ir kolorado vabalų antplūdį.',
        r1Badge: 'Pertrauka: 3-4 metai',
        r2Title: 'Maistinių medžiagų balansas',
        r2Desc: 'Kaitokite kultūras pagal poreikius: „Reiklios“ (agurkai, kopūstai) ➔ „Vidutinės“ (morkos, burokėliai, svogūnai) ➔ „Turtintojai“ (žirniai, pupelės, sideratai).',
        r2Badge: 'Kompostas ➔ Šakniavaisiai ➔ Azotas',
        r3Title: 'Šaknų gylių kaita',
        r3Desc: 'Kaitokite paviršinių šaknų augalus (agurkai, svogūnai, žalumynai) su giliašakniais (morkos, burokėliai, pomidorai), kad paimtumėte maistą iš skirtingų sluoksnių.',
        r3Badge: 'Paviršinis ➔ Gilusis sluoksnis',
        r4Title: 'Sideratų galia',
        r4Desc: 'Nuėmus ankstyvą derlių (česnakai, ankstyvos bulvės, žirniai) būtinai pasėkite facelijas, baltąsias garstyčias ar rugius dirvai atgaivinti.',
        r4Badge: 'Sveika dirva per 40 dienų',
        cycleTitle: '🔄 Klasikinė 4 laukų sėjomaina darže',
        y1: '1 METAI', y1T: 'Moliūginiai & Kopūstai', y1D: 'Įterpiamas kompostas ar perpuvęs mėšlas. Maksimalus derlingumas.',
        y2: '2 METAI', y2T: 'Bulviniai (Pomidorai, Paprikos)', y2D: 'Vartoja kalį ir fosforą iš pirmais metais įterptos organikos.',
        y3: '3 METAI', y3T: 'Šakniavaisiai & Svogūniniai', y3D: 'Morkos, burokėliai, svogūnai, česnakai. Švari žemė be šviežio mėšlo.',
        y4: '4 METAI', y4T: 'Ankštiniai & Sideratai', y4D: 'Žirniai, pupelės, vikiai, facelijos. Azoto atkūrimas ir dirvos poilsis.',
        calcTitle: '⚡ Priešsėlių greitasis skaičiuotuvas',
        calcDesc: 'Pasirinkite kultūrą, kurią planuojate sodinti, kad sužinotumėte tobulą jos sėjomainą:',
        calcBtn: 'Rodyti rekomendacijas'
      }
    };

    const g = guideTexts[currentLang] || guideTexts.ru;

    const sortedCrops = [...CROPS_DATABASE].sort((a, b) => {
      const nameA = getCropName(a, currentLang);
      const nameB = getCropName(b, currentLang);
      return nameA.localeCompare(nameB, currentLang);
    });

    container.innerHTML = `
      <div class="guide-wrapper">
        <div class="guide-hero-card">
          <h2>${g.heroTitle}</h2>
          <p>${g.heroDesc}</p>
        </div>

        <div class="guide-grid-steps">
          <div class="step-card">
            <div class="step-number">1</div>
            <h3>${g.r1Title}</h3>
            <p>${g.r1Desc}</p>
            <div class="step-badge">${g.r1Badge}</div>
          </div>

          <div class="step-card">
            <div class="step-number">2</div>
            <h3>${g.r2Title}</h3>
            <p>${g.r2Desc}</p>
            <div class="step-badge">${g.r2Badge}</div>
          </div>

          <div class="step-card">
            <div class="step-number">3</div>
            <h3>${g.r3Title}</h3>
            <p>${g.r3Desc}</p>
            <div class="step-badge">${g.r3Badge}</div>
          </div>

          <div class="step-card">
            <div class="step-number">4</div>
            <h3>${g.r4Title}</h3>
            <p>${g.r4Desc}</p>
            <div class="step-badge">${g.r4Badge}</div>
          </div>
        </div>

        <div class="rotation-cycle-showcase">
          <h3>${g.cycleTitle}</h3>
          <div class="cycle-timeline">
            <div class="cycle-step">
              <div class="cycle-year-badge">${g.y1}</div>
              <div class="cycle-crop-icon">🥒 🥬</div>
              <h4>${g.y1T}</h4>
              <p>${g.y1D}</p>
            </div>
            <div class="cycle-arrow">➔</div>
            <div class="cycle-step">
              <div class="cycle-year-badge">${g.y2}</div>
              <div class="cycle-crop-icon">🍅 🫑</div>
              <h4>${g.y2T}</h4>
              <p>${g.y2D}</p>
            </div>
            <div class="cycle-arrow">➔</div>
            <div class="cycle-step">
              <div class="cycle-year-badge">${g.y3}</div>
              <div class="cycle-crop-icon">🥕 🧅</div>
              <h4>${g.y3T}</h4>
              <p>${g.y3D}</p>
            </div>
            <div class="cycle-arrow">➔</div>
            <div class="cycle-step">
              <div class="cycle-year-badge">${g.y4}</div>
              <div class="cycle-crop-icon">🫛 🌸</div>
              <h4>${g.y4T}</h4>
              <p>${g.y4D}</p>
            </div>
          </div>
        </div>

        <!-- Интерактивный калькулятор предшественников -->
        <div class="predecessor-calculator-card mt-4">
          <h3>${g.calcTitle}</h3>
          <p>${g.calcDesc}</p>
          <div class="calc-row">
            <select id="quick-calc-crop-select" class="form-select select-lg">
              ${sortedCrops.map(c => `
                <option value="${c.id}">${c.emoji} ${escapeHtml(getCropName(c, currentLang))}</option>
              `).join('')}
            </select>
            <button class="btn btn-primary" id="quick-calc-btn">${g.calcBtn}</button>
          </div>
          <div id="quick-calc-result" class="mt-3"></div>
        </div>
      </div>
    `;

    const calcBtn = document.getElementById('quick-calc-btn');
    const calcSelect = document.getElementById('quick-calc-crop-select');
    if (calcBtn && calcSelect) {
      const runCalc = () => {
        const cropId = calcSelect.value;
        const resultContainer = document.getElementById('quick-calc-result');
        if (resultContainer) {
          resultContainer.innerHTML = this.advisor.renderCropEncyclopediaCard(cropId);
        }
      };

      calcBtn.addEventListener('click', runCalc);
      calcSelect.addEventListener('change', runCalc);
      runCalc(); // Первичный запуск
    }
  }

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

    const comboboxPh = window.t ? window.t('inspector_combobox_placeholder') : 'Начните вводить...';
    const varietyPh = window.t ? window.t('inspector_variety_placeholder') : 'Сорт или гибрид...';
    const notesPh = window.t ? window.t('inspector_notes_placeholder') : 'Заметка к посадке...';
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
        <button class="close-inspector-btn" id="close-inspector-btn">&times;</button>
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

          <div class="form-group mt-2">
            <input type="text" id="inspector-variety-input" class="form-input" placeholder="${varietyPh}" value="${escapeHtml(currentPlanting.variety || '')}">
          </div>

          <div class="form-group mt-2">
            <input type="text" id="inspector-note-input" class="form-input" placeholder="${notesPh}" value="${escapeHtml(currentPlanting.note || '')}">
          </div>

          <button class="btn btn-primary btn-block mt-2" id="inspector-save-planting-btn">
            ${savePlantingBtnText}
          </button>
        </div>

        <!-- 5. Анализ севооборота -->
        <div class="inspector-section rotation-analysis-box" id="rotation-status-box">
          ${this.renderInspectorRotationStatus(rotationEval)}
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
    this.setupCropCombobox(bedId, activeSection, history);
  }

  setupCropCombobox(bedId, activeSection, history) {
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
      if (e.key === 'Escape' && appContainer.classList.contains('zen-mode')) {
        toggleZen(false);
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

    bindMobileAction('m-backup-btn', () => this.openDbModal());
    bindMobileAction('m-demo-btn', () => this.loadDemoPlan());
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

  openAddBedModal(options = {}) {
    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-card modal-bed-builder">
        <div class="modal-header">
          <div class="modal-header-info">
            <h3>➕ Добавить грядку или теплицу</h3>
            <span class="modal-subtitle">Конструктор посадочных мест для огорода</span>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <!-- Режим размещения -->
          <div class="modal-step-section">
            <div class="step-label">
              <span class="step-num">1</span>
              <span class="step-title">Режим размещения:</span>
            </div>
            <div class="modal-tabs-row">
              <button type="button" class="tab-chip-btn active" id="modal-tab-single">🌱 Одиночная грядка / теплица</button>
              <button type="button" class="tab-chip-btn" id="modal-tab-row">✨ Ряд грядок (в 1 линию)</button>
              <button type="button" class="tab-chip-btn" id="modal-tab-grid">▦ Сетка грядок (4×5 и др.)</button>
            </div>
          </div>

          <!-- ШАГ 1 (Главное действие): ТИП КОНСТРУКЦИИ -->
          <div class="modal-step-section mt-3">
            <div class="step-label">
              <span class="step-num">2</span>
              <span class="step-title" id="step-type-title">Что создаём? (Тип конструкции):</span>
            </div>
            <div class="bed-type-grid" id="bed-type-grid">
              <button type="button" class="bed-type-card active" data-type="raised">
                <span class="bed-type-icon">📦</span>
                <span class="bed-type-name">Приподнятая</span>
                <span class="bed-type-desc">Короб из досок / бортики</span>
              </button>
              <button type="button" class="bed-type-card" data-type="greenhouse">
                <span class="bed-type-icon">🏡</span>
                <span class="bed-type-name">Теплица / Парник</span>
                <span class="bed-type-desc">С грядками внутри</span>
              </button>
              <button type="button" class="bed-type-card" data-type="ground">
                <span class="bed-type-icon">🌱</span>
                <span class="bed-type-name">Открытый грунт</span>
                <span class="bed-type-desc">Обычная грунтовая грядка</span>
              </button>
              <button type="button" class="bed-type-card" data-type="berry">
                <span class="bed-type-icon">🍓</span>
                <span class="bed-type-name">Клубничник</span>
                <span class="bed-type-desc">Под спанбонд / мульчу</span>
              </button>
              <button type="button" class="bed-type-card" data-type="warm">
                <span class="bed-type-icon">🔥</span>
                <span class="bed-type-name">Тёплая грядка</span>
                <span class="bed-type-desc">С биотопливом / компостом</span>
              </button>
            </div>
            <select id="new-bed-type" class="form-select" style="display: none;">
              <option value="raised">🪵 Приподнятая грядка (короб из досок)</option>
              <option value="greenhouse">🏡 Теплица / Парник</option>
              <option value="ground">🌱 Открытый грунт</option>
              <option value="berry">🍓 Клубничник</option>
              <option value="warm">🔥 Тёплая грядка</option>
            </select>
          </div>

          <!-- ШАГ 2 (Логически следует СРАЗУ ПОСЛЕ типа конструкции): НАЗВАНИЕ -->
          <div class="modal-step-section mt-3">
            <div class="name-custom-box">
              <div class="name-custom-label">
                <div class="step-label mb-0">
                  <span class="step-num">3</span>
                  <span class="step-title" id="name-field-title">🏷️ Название грядки:</span>
                </div>
                <span class="name-label-hint">Своё название</span>
              </div>
              <div class="name-input-wrapper">
                <input type="text" id="new-bed-name" class="form-input input-name-hero" 
                       placeholder="Введите своё название: например, «У забора», «Южная»..." 
                       value="Грядка у забора">
                <button type="button" class="btn-clear-input" id="btn-clear-bed-name" title="Очистить поле">&times;</button>
              </div>

              <!-- Подсказки названий под выбранный тип конструкции (только для одиночной грядки) -->
              <div class="name-suggestions-bar mt-2" id="name-suggestions-bar">
                <span class="suggestions-lead">💡 Варианты названий (нажмите, чтобы выбрать):</span>
                <div class="suggestions-pills" id="name-suggestions-pills">
                  <!-- Заполняется динамически -->
                </div>
              </div>
            </div>
          </div>

          <!-- ШАГ 3: РАЗМЕРЫ И ОРИЕНТАЦИЯ -->
          <div class="modal-step-section mt-3">
            <div class="step-label">
              <span class="step-num">4</span>
              <span class="step-title">Размеры и ориентация на плане:</span>
            </div>

            <!-- Быстрые шаблоны популярных размеров для выбранного типа -->
            <div class="size-presets-row" id="size-presets-container">
              <!-- Заполняется динамически -->
            </div>

            <div class="form-row-2 mt-2">
              <div>
                <label>Ориентация:</label>
                <div class="orientation-toggle-group">
                  <button type="button" class="btn-orientation active" id="btn-orient-horizontal" data-orient="horizontal">
                    ↔ Вдоль (горизонтально)
                  </button>
                  <button type="button" class="btn-orientation" id="btn-orient-vertical" data-orient="vertical">
                    ↕ Поперёк (вертикально)
                  </button>
                </div>
              </div>
              <div>
                <div class="form-row-2">
                  <div>
                    <label id="label-bed-w">Ширина (м):</label>
                    <input type="number" id="new-bed-w" class="form-input" step="0.1" value="4.0">
                  </div>
                  <div>
                    <label id="label-bed-h">Длина (м):</label>
                    <input type="number" id="new-bed-h" class="form-input" step="0.1" value="1.2">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ШАГ 4: ВНУТРЕННЕЕ РАЗДЕЛЕНИЕ НА РЯДКИ / ГРЯДКИ В ТЕПЛИЦЕ -->
          <div class="modal-step-section mt-3">
            <div id="bed-sections-settings-block" class="p-3 bg-tertiary rounded">
              <div class="step-label mb-1">
                <span class="step-num">5</span>
                <span class="step-title" id="sections-block-title">🌿 Разделение на рядки / полосы:</span>
              </div>
              <div class="gh-beds-count-group mt-1">
                <button type="button" class="btn-beds-count active" id="btn-sections-1" data-count="1">
                  🌱 1 цельная
                </button>
                <button type="button" class="btn-beds-count" id="btn-sections-2" data-count="2">
                  🌿 2 рядка
                </button>
                <button type="button" class="btn-beds-count" id="btn-sections-3" data-count="3">
                  🌾 3 рядка
                </button>
              </div>
              <div class="text-xs text-muted mt-2" id="sections-block-hint">
                💡 Можно оставить грядку цельной (1) или сразу разделить на 2–3 параллельных рядка (например: морковь + лук на одной грядке).
              </div>
            </div>
          </div>

          <!-- Специфика для ряда грядок (в 1 линию) -->
          <div id="row-settings-block" style="display: none;" class="modal-step-section mt-2 p-2 bg-tertiary rounded">
            <div class="step-label mb-1">
              <span class="step-num">6</span>
              <span class="step-title">Параметры ряда грядок:</span>
            </div>
            <div class="form-row-2">
              <div>
                <label>Количество грядок в ряду:</label>
                <input type="number" id="new-bed-row-count" class="form-input" min="2" max="12" value="4">
              </div>
              <div>
                <label>Ширина дорожки между ними (м):</label>
                <input type="number" id="new-bed-row-gap" class="form-input" step="0.1" min="0.4" max="2.0" value="0.9">
              </div>
            </div>
          </div>

          <!-- Специфика для сетки грядок (матрица: N по ширине × M по длине) -->
          <div id="grid-settings-block" style="display: none;" class="modal-step-section mt-2 p-2 bg-tertiary rounded">
            <div class="step-label mb-1">
              <span class="step-num">6</span>
              <span class="step-title">Параметры сетки огорода:</span>
            </div>
            <div class="form-row-2">
              <div>
                <label><strong>Грядок по ширине (столбцов):</strong></label>
                <input type="number" id="new-bed-grid-cols" class="form-input" min="1" max="10" value="4">
              </div>
              <div>
                <label><strong>Грядок по длине (рядов/строк):</strong></label>
                <input type="number" id="new-bed-grid-rows" class="form-input" min="1" max="10" value="5">
              </div>
            </div>
            <div class="form-row-2 mt-2">
              <div>
                <label>Дорожка между столбцами (м):</label>
                <input type="number" id="new-bed-grid-gap-x" class="form-input" step="0.1" min="0.4" max="2.0" value="1.0">
              </div>
              <div>
                <label>Дорожка между рядами (м):</label>
                <input type="number" id="new-bed-grid-gap-y" class="form-input" step="0.1" min="0.4" max="2.0" value="1.0">
              </div>
            </div>
            <div class="grid-summary-pill mt-2 p-2 rounded" id="grid-summary-pill" style="background: rgba(16, 185, 129, 0.12); color: var(--primary); font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: space-between;">
              <span>📊 Всего будет создано:</span>
              <span id="grid-total-beds-badge" style="background: var(--primary); color: #fff; padding: 2px 8px; border-radius: 9999px;">20 грядок</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline modal-cancel-btn">Отмена</button>
          <button class="btn btn-primary" id="confirm-add-bed-btn">Создать грядку</button>
        </div>
      </div>
    `;

    modal.classList.add('active');

    // Логика и состояние конструктора
    let createMode = options.defaultMode || 'single'; // 'single' | 'row' | 'grid'
    let selectedType = options.defaultType || 'raised'; // 'raised' | 'greenhouse' | 'ground' | 'berry' | 'warm'
    let selectedOrientation = 'horizontal';
    let selectedSectionsCount = selectedType === 'greenhouse' ? 3 : 1;
    let hasUserTypedName = false;

    // Конфигурации для каждого типа конструкции
    const typeConfigs = {
      raised: {
        icon: '📦',
        name: 'Приподнятая',
        desc: 'Короб из досок / бортики',
        defaultName: 'Грядка у забора',
        labelTitle: '🏷️ Название грядки:',
        rowLabelTitle: '🏷️ Название для ряда грядок:',
        gridLabelTitle: '🏷️ Базовое название для сетки:',
        defaultW: 4.0,
        defaultH: 1.2,
        defaultSections: 1,
        secTitle: '🌿 Разделение на рядки / полосы:',
        secHint: '💡 Можно оставить грядку цельной (1) или сразу разделить на 2–3 параллельных рядка (например: морковь + лук на одной грядке).',
        secLabels: ['🌱 1 цельная', '🌿 2 рядка', '🌾 3 рядка'],
        btnCreateText: 'Создать приподнятую грядку',
        suggestions: ['У забора', 'Южная', 'Возле бани', 'У яблони', 'Центральная', 'У колодца', 'У беседки'],
        sizePresets: [
          { label: '4 × 1.2 м (стандарт)', w: 4.0, h: 1.2, sec: 1 },
          { label: '3 × 1.0 м (компакт)', w: 3.0, h: 1.0, sec: 1 },
          { label: '6 × 1.2 м (длинная)', w: 6.0, h: 1.2, sec: 1 },
          { label: '2 × 1.0 м (мини)', w: 2.0, h: 1.0, sec: 1 }
        ]
      },
      greenhouse: {
        icon: '🏡',
        name: 'Теплица / Парник',
        desc: 'С грядками внутри',
        defaultName: 'Теплица 1',
        labelTitle: '🏷️ Название теплицы:',
        rowLabelTitle: '🏷️ Название для ряда теплиц:',
        gridLabelTitle: '🏷️ Базовое название для теплиц:',
        defaultW: 6.0,
        defaultH: 3.0,
        defaultSections: 3,
        secTitle: '🏡 Раздельные грядки внутри теплицы:',
        secHint: '💡 В теплице обычно делают 2 или 3 раздельные грядки с дорожкой. Для каждой грядки ведется независимый севооборот!',
        secLabels: ['🌱 1 цельная', '🌿 2 грядки (по бокам)', '🌾 3 грядки (с 2 проходами)'],
        btnCreateText: 'Создать теплицу',
        suggestions: ['Теплица 1', 'Теплица большая', 'Теплица у забора', 'Стеклянная теплица', 'Парник огуречный', 'Теплица томатная'],
        sizePresets: [
          { label: '6 × 3.0 м (3 грядки)', w: 6.0, h: 3.0, sec: 3 },
          { label: '4 × 2.5 м (2 грядки)', w: 4.0, h: 2.5, sec: 2 },
          { label: '8 × 3.0 м (3 грядки)', w: 8.0, h: 3.0, sec: 3 },
          { label: '3 × 2.0 м (парник)', w: 3.0, h: 2.0, sec: 2 }
        ]
      },
      ground: {
        icon: '🌱',
        name: 'Открытый грунт',
        desc: 'Обычная грунтовая грядка',
        defaultName: 'Грядка 1',
        labelTitle: '🏷️ Название грядки в грунте:',
        rowLabelTitle: '🏷️ Название для ряда грядок:',
        gridLabelTitle: '🏷️ Базовое название для сетки:',
        defaultW: 5.0,
        defaultH: 1.2,
        defaultSections: 1,
        secTitle: '🌿 Разделение на рядки / полосы:',
        secHint: '💡 Можно оставить грядку цельной (1) или сразу разделить на 2–3 параллельных рядка (например: морковь + свекла).',
        secLabels: ['🌱 1 цельная', '🌿 2 рядка', '🌾 3 рядка'],
        btnCreateText: 'Создать грядку в грунте',
        suggestions: ['Грядка 1', 'У забора', 'Южный огород', 'Картофельник', 'У колодца', 'Длинная грядка'],
        sizePresets: [
          { label: '5 × 1.2 м (стандарт)', w: 5.0, h: 1.2, sec: 1 },
          { label: '4 × 1.0 м', w: 4.0, h: 1.0, sec: 1 },
          { label: '6 × 1.2 м (длинная)', w: 6.0, h: 1.2, sec: 1 },
          { label: '8 × 1.5 м (широкая)', w: 8.0, h: 1.5, sec: 1 }
        ]
      },
      berry: {
        icon: '🍓',
        name: 'Клубничник',
        desc: 'Под спанбонд / мульчу',
        defaultName: 'Клубничник 1',
        labelTitle: '🏷️ Название клубничника:',
        rowLabelTitle: '🏷️ Название для ряда клубничников:',
        gridLabelTitle: '🏷️ Базовое название для сетки:',
        defaultW: 5.0,
        defaultH: 1.2,
        defaultSections: 2,
        secTitle: '🌿 Полосы посадки клубники:',
        secHint: '💡 Обычно клубнику высаживают в 1 или 2 аккуратных ряда для удобства сбора ягод и прополки усов.',
        secLabels: ['🌱 1 ряд кустов', '🌿 2 рядка кустов', '🌾 3 рядка кустов'],
        btnCreateText: 'Создать клубничник',
        suggestions: ['Клубничник 1', 'Ягодная грядка', 'Сортовая земляника', 'Ремонтантная', 'У террасы'],
        sizePresets: [
          { label: '5 × 1.2 м (2 рядка)', w: 5.0, h: 1.2, sec: 2 },
          { label: '6 × 1.5 м (2 рядка)', w: 6.0, h: 1.5, sec: 2 },
          { label: '4 × 1.2 м', w: 4.0, h: 1.2, sec: 1 },
          { label: '3 × 1.0 м (мини)', w: 3.0, h: 1.0, sec: 1 }
        ]
      },
      warm: {
        icon: '🔥',
        name: 'Тёплая грядка',
        desc: 'С биотопливом / компостом',
        defaultName: 'Тёплая грядка 1',
        labelTitle: '🏷️ Название тёплой грядки:',
        rowLabelTitle: '🏷️ Название для ряда тёплых грядок:',
        gridLabelTitle: '🏷️ Базовое название для сетки:',
        defaultW: 4.0,
        defaultH: 1.0,
        defaultSections: 1,
        secTitle: '🌿 Разделение на рядки / полосы:',
        secHint: '💡 Тёплые грядки идеальны для огурцов, кабачков, тыкв и ранней зелени.',
        secLabels: ['🌱 1 цельная', '🌿 2 рядка', '🌾 3 рядка'],
        btnCreateText: 'Создать тёплую грядку',
        suggestions: ['Тёплая грядка 1', 'Компостная', 'Кабачковая', 'Ранняя', 'Тыквенная'],
        sizePresets: [
          { label: '4 × 1.0 м (стандарт)', w: 4.0, h: 1.0, sec: 1 },
          { label: '3 × 1.0 м (компакт)', w: 3.0, h: 1.0, sec: 1 },
          { label: '5 × 1.2 м', w: 5.0, h: 1.2, sec: 1 }
        ]
      }
    };

    const defaultNamesList = [
      'Грядка у забора', 'Грядка 1', 'Теплица 1', 'Клубничник 1', 'Тёплая грядка 1', 'Грядка в грунте 1', 'Грядка'
    ];

    const tabSingle = document.getElementById('modal-tab-single');
    const tabRow = document.getElementById('modal-tab-row');
    const tabGrid = document.getElementById('modal-tab-grid');
    const rowBlock = document.getElementById('row-settings-block');
    const gridBlock = document.getElementById('grid-settings-block');
    const gridColsInput = document.getElementById('new-bed-grid-cols');
    const gridRowsInput = document.getElementById('new-bed-grid-rows');
    const gridGapXInput = document.getElementById('new-bed-grid-gap-x');
    const gridGapYInput = document.getElementById('new-bed-grid-gap-y');
    const gridTotalBadge = document.getElementById('grid-total-beds-badge');

    const sectionsBlock = document.getElementById('bed-sections-settings-block');
    const sectionsBlockTitle = document.getElementById('sections-block-title');
    const sectionsBlockHint = document.getElementById('sections-block-hint');
    const typeSelect = document.getElementById('new-bed-type');
    const nameInput = document.getElementById('new-bed-name');
    const nameFieldTitle = document.getElementById('name-field-title');
    const nameSuggestionsBar = document.getElementById('name-suggestions-bar');
    const nameSuggestionsPills = document.getElementById('name-suggestions-pills');
    const sizePresetsContainer = document.getElementById('size-presets-container');
    const wInput = document.getElementById('new-bed-w');
    const hInput = document.getElementById('new-bed-h');
    const btnOrientH = document.getElementById('btn-orient-horizontal');
    const btnOrientV = document.getElementById('btn-orient-vertical');
    const btnSec1 = document.getElementById('btn-sections-1');
    const btnSec2 = document.getElementById('btn-sections-2');
    const btnSec3 = document.getElementById('btn-sections-3');
    const clearNameBtn = document.getElementById('btn-clear-bed-name');
    const secBtns = [btnSec1, btnSec2, btnSec3];

    const setSectionsCount = (count) => {
      selectedSectionsCount = count;
      secBtns.forEach(btn => {
        if (!btn) return;
        const bCount = parseInt(btn.getAttribute('data-count'), 10);
        btn.classList.toggle('active', bCount === count);
      });
    };

    secBtns.forEach(btn => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        const count = parseInt(btn.getAttribute('data-count'), 10);
        setSectionsCount(count);
      });
    });

    const renderSuggestions = () => {
      if (createMode !== 'single') {
        if (nameSuggestionsBar) nameSuggestionsBar.style.display = 'none';
        return;
      }
      if (nameSuggestionsBar) nameSuggestionsBar.style.display = 'block';

      const config = typeConfigs[selectedType] || typeConfigs.raised;
      let list = config.suggestions || [];

      nameSuggestionsPills.innerHTML = list.map(item => `
        <button type="button" class="name-pill-btn">${escapeHtml(item)}</button>
      `).join('');

      nameSuggestionsPills.querySelectorAll('.name-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          nameInput.value = btn.textContent.trim();
          hasUserTypedName = true;
          updateRowPreview();
          nameInput.focus();
        });
      });
    };

    const renderSizePresets = () => {
      const config = typeConfigs[selectedType] || typeConfigs.raised;
      const presets = config.sizePresets || [];
      sizePresetsContainer.innerHTML = presets.map((p, idx) => `
        <button type="button" class="size-chip-btn ${idx === 0 ? 'active' : ''}" 
                data-w="${p.w}" data-h="${p.h}" data-sec="${p.sec}">
          ${escapeHtml(p.label)}
        </button>
      `).join('');

      sizePresetsContainer.querySelectorAll('.size-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          sizePresetsContainer.querySelectorAll('.size-chip-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const pw = parseFloat(btn.getAttribute('data-w'));
          const ph = parseFloat(btn.getAttribute('data-h'));
          const pSec = parseInt(btn.getAttribute('data-sec'), 10) || 1;
          
          if (selectedOrientation === 'horizontal') {
            wInput.value = Math.max(pw, ph);
            hInput.value = Math.min(pw, ph);
          } else {
            wInput.value = Math.min(pw, ph);
            hInput.value = Math.max(pw, ph);
          }
          setSectionsCount(pSec);
        });
      });
    };

    const updateConfirmBtnText = () => {
      const confirmBtn = document.getElementById('confirm-add-bed-btn');
      if (!confirmBtn) return;
      const config = typeConfigs[selectedType] || typeConfigs.raised;
      if (createMode === 'row') {
        const count = parseInt(document.getElementById('new-bed-row-count').value, 10) || 4;
        confirmBtn.textContent = `Создать ряд грядок (${count} шт)`;
      } else if (createMode === 'grid') {
        const cols = parseInt(gridColsInput.value, 10) || 4;
        const rows = parseInt(gridRowsInput.value, 10) || 5;
        const total = cols * rows;
        confirmBtn.textContent = `Создать сетку из ${total} грядок`;
      } else {
        confirmBtn.textContent = config.btnCreateText;
      }
    };

    const updateRowPreview = () => {
      updateConfirmBtnText();
      if (createMode === 'grid') {
        const cols = parseInt(gridColsInput.value, 10) || 4;
        const rows = parseInt(gridRowsInput.value, 10) || 5;
        const total = cols * rows;
        if (gridTotalBadge) gridTotalBadge.textContent = `${total} грядок (${cols} × ${rows})`;
      }
    };

    // Функция переключения типа конструкции (Шаг 1)
    const selectType = (type) => {
      selectedType = type;
      typeSelect.value = type;

      modalContent.querySelectorAll('.bed-type-card').forEach(card => {
        card.classList.toggle('active', card.getAttribute('data-type') === type);
      });

      const config = typeConfigs[type] || typeConfigs.raised;

      // Если пользователь ещё не печатал своё уникальное имя, подставляем умное имя по типу
      if (!hasUserTypedName || defaultNamesList.includes(nameInput.value.trim())) {
        nameInput.value = config.defaultName;
      }

      // Размеры по умолчанию
      if (selectedOrientation === 'horizontal') {
        wInput.value = Math.max(config.defaultW, config.defaultH);
        hInput.value = Math.min(config.defaultW, config.defaultH);
      } else {
        wInput.value = Math.min(config.defaultW, config.defaultH);
        hInput.value = Math.max(config.defaultW, config.defaultH);
      }

      // Секции
      setSectionsCount(config.defaultSections);
      if (sectionsBlockTitle) sectionsBlockTitle.innerHTML = config.secTitle;
      if (sectionsBlockHint) sectionsBlockHint.innerHTML = config.secHint;
      if (btnSec1) btnSec1.innerHTML = config.secLabels[0];
      if (btnSec2) btnSec2.innerHTML = config.secLabels[1];
      if (btnSec3) btnSec3.innerHTML = config.secLabels[2];

      // Заголовок поля имени
      if (createMode === 'row') {
        nameFieldTitle.textContent = config.rowLabelTitle;
      } else if (createMode === 'grid') {
        nameFieldTitle.textContent = config.gridLabelTitle;
      } else {
        nameFieldTitle.textContent = config.labelTitle;
      }

      renderSuggestions();
      renderSizePresets();
      updateRowPreview();
      updateConfirmBtnText();
    };

    // Клик по карточкам типа конструкции
    modalContent.querySelectorAll('.bed-type-card').forEach(card => {
      card.addEventListener('click', () => {
        const type = card.getAttribute('data-type');
        selectType(type);
      });
    });

    nameInput.addEventListener('input', () => {
      hasUserTypedName = true;
      updateRowPreview();
    });

    clearNameBtn.addEventListener('click', () => {
      nameInput.value = '';
      hasUserTypedName = true;
      updateRowPreview();
      nameInput.focus();
    });

    // Переключение ориентации ↔ / ↕
    btnOrientH.addEventListener('click', () => {
      selectedOrientation = 'horizontal';
      btnOrientH.classList.add('active');
      btnOrientV.classList.remove('active');
      const w = parseFloat(wInput.value) || 4.0;
      const h = parseFloat(hInput.value) || 1.2;
      if (h > w) {
        wInput.value = h;
        hInput.value = w;
      }
    });

    btnOrientV.addEventListener('click', () => {
      selectedOrientation = 'vertical';
      btnOrientV.classList.add('active');
      btnOrientH.classList.remove('active');
      const w = parseFloat(wInput.value) || 4.0;
      const h = parseFloat(hInput.value) || 1.2;
      if (w > h) {
        wInput.value = h;
        hInput.value = w;
      }
    });

    // Переключение режимов: Одиночная / Ряд / Сетка
    tabSingle.addEventListener('click', () => {
      createMode = 'single';
      tabSingle.classList.add('active');
      tabRow.classList.remove('active');
      tabGrid.classList.remove('active');
      rowBlock.style.display = 'none';
      gridBlock.style.display = 'none';
      if (nameSuggestionsBar) nameSuggestionsBar.style.display = 'block';
      if (sectionsBlockHint) sectionsBlockHint.style.display = 'block';
      const config = typeConfigs[selectedType] || typeConfigs.raised;
      nameFieldTitle.textContent = config.labelTitle;
      if (!hasUserTypedName) {
        nameInput.value = config.defaultName;
      }
      renderSuggestions();
      updateRowPreview();
    });

    tabRow.addEventListener('click', () => {
      createMode = 'row';
      tabRow.classList.add('active');
      tabSingle.classList.remove('active');
      tabGrid.classList.remove('active');
      rowBlock.style.display = 'block';
      gridBlock.style.display = 'none';
      if (nameSuggestionsBar) nameSuggestionsBar.style.display = 'none';
      if (sectionsBlockHint) sectionsBlockHint.style.display = 'none';
      const config = typeConfigs[selectedType] || typeConfigs.raised;
      nameFieldTitle.textContent = config.rowLabelTitle;
      if (!hasUserTypedName || defaultNamesList.includes(nameInput.value.trim())) {
        nameInput.value = 'Грядка у забора';
      }
      renderSuggestions();
      updateRowPreview();
    });

    tabGrid.addEventListener('click', () => {
      createMode = 'grid';
      tabGrid.classList.add('active');
      tabSingle.classList.remove('active');
      tabRow.classList.remove('active');
      rowBlock.style.display = 'none';
      gridBlock.style.display = 'block';
      if (nameSuggestionsBar) nameSuggestionsBar.style.display = 'none';
      if (sectionsBlockHint) sectionsBlockHint.style.display = 'none';
      const config = typeConfigs[selectedType] || typeConfigs.raised;
      nameFieldTitle.textContent = config.gridLabelTitle;
      if (!hasUserTypedName || defaultNamesList.includes(nameInput.value.trim())) {
        nameInput.value = 'Грядка';
      }
      renderSuggestions();
      updateRowPreview();
    });

    document.getElementById('new-bed-row-count').addEventListener('input', updateRowPreview);
    document.getElementById('new-bed-row-gap').addEventListener('input', updateRowPreview);
    gridColsInput.addEventListener('input', updateRowPreview);
    gridRowsInput.addEventListener('input', updateRowPreview);
    gridGapXInput.addEventListener('input', updateRowPreview);
    gridGapYInput.addEventListener('input', updateRowPreview);

    const closeModal = () => modal.classList.remove('active');
    modalContent.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modalContent.querySelector('.modal-cancel-btn').addEventListener('click', closeModal);

    // Инициализация при открытии (с учётом переданных options)
    if (options.defaultType) {
      selectType(options.defaultType);
    } else {
      selectType(selectedType);
    }

    if (options.defaultMode === 'grid') {
      tabGrid.click();
    } else if (options.defaultMode === 'row') {
      tabRow.click();
    }

    // Создание грядки, ряда или сетки грядок
    document.getElementById('confirm-add-bed-btn').addEventListener('click', () => {
      const name = nameInput.value.trim() || (createMode === 'single' ? (selectedType === 'greenhouse' ? 'Теплица 1' : 'Грядка 1') : 'Грядка');
      const width = parseFloat(wInput.value) || 4.0;
      const height = parseFloat(hInput.value) || 1.2;
      const type = selectedType;

      const beds = this.storage.getBeds();
      let x = 2.0;
      let y = 2.0;
      if (beds.length === 0) {
        x = 2.0;
        y = 2.0;
      } else {
        // Размещаем новую грядку аккуратно рядом или под существующими грядками,
        // либо в текущей видимой области экрана, чтобы она не улетала на 20 метров вниз!
        if (this.gardenMap && this.gardenMap.viewportEl) {
          const vRect = this.gardenMap.viewportEl.getBoundingClientRect();
          const vw = (vRect.width && vRect.width > 200) ? vRect.width : window.innerWidth;
          const vh = (vRect.height && vRect.height > 200) ? vRect.height : (window.innerHeight - 150);
          const cxM = (vw / 2 - this.gardenMap.panX) / (this.gardenMap.meterPixels * this.gardenMap.zoom);
          const cyM = (vh / 2 - this.gardenMap.panY) / (this.gardenMap.meterPixels * this.gardenMap.zoom);
          
          if (cxM >= 0 && cyM >= 0 && cxM < 50 && cyM < 50) {
            x = Math.max(1.0, Math.round((cxM - width / 2) * 2) / 2);
            y = Math.max(1.0, Math.round((cyM - height / 2) * 2) / 2);
          } else {
            const bbox = this.gardenMap.calculateBedsBoundingBox(beds);
            x = bbox.minX;
            y = Math.round((bbox.maxY + 1.2) * 10) / 10;
          }
        } else {
          const bbox = this.gardenMap.calculateBedsBoundingBox(beds);
          x = bbox.minX;
          y = Math.round((bbox.maxY + 1.2) * 10) / 10;
        }
      }

      try {
        let sections = null;
        let sectionsCount = selectedSectionsCount;

        if (selectedSectionsCount > 1) {
          const isGh = type === 'greenhouse';
          if (selectedSectionsCount === 2) {
            sections = [
              { id: 'sec-1', name: isGh ? 'Левая грядка' : 'Рядок 1 (Левый)', history: {} },
              { id: 'sec-2', name: isGh ? 'Правая грядка' : 'Рядок 2 (Правый)', history: {} }
            ];
          } else if (selectedSectionsCount === 3) {
            sections = [
              { id: 'sec-1', name: isGh ? 'Левая грядка' : 'Рядок 1 (Левый)', history: {} },
              { id: 'sec-2', name: isGh ? 'Центральная грядка' : 'Рядок 2 (Центр)', history: {} },
              { id: 'sec-3', name: isGh ? 'Правая грядка' : 'Рядок 3 (Правый)', history: {} }
            ];
          }
        }

        if (createMode === 'grid') {
          const cols = parseInt(gridColsInput.value, 10) || 4;
          const rows = parseInt(gridRowsInput.value, 10) || 5;
          const gapX = parseFloat(gridGapXInput.value) || 1.0;
          const gapY = parseFloat(gridGapYInput.value) || 1.0;
          const total = cols * rows;

          let startX = 2.0;
          let startY = 2.0;
          if (beds.length > 0) {
            const bbox = this.gardenMap.calculateBedsBoundingBox(beds);
            startX = Math.round((bbox.maxX + 1.5) * 10) / 10;
            startY = 2.0;
          }

          this.storage.createBedGrid({
            name,
            type,
            width,
            height,
            orientation: selectedOrientation,
            sectionsCount,
            sections,
            x: startX,
            y: startY
          }, cols, rows, gapX, gapY);

          closeModal();
          this.gardenMap.render();
          this.gardenMap.fitPlotToView();
          const secWord = selectedSectionsCount > 1 ? ` (по ${selectedSectionsCount} рядка в каждой)` : '';
          this.showToast(`Создана сетка из ${total} грядок (${cols} × ${rows}) («${name} 1–${total}»)${secWord}!`);
        } else if (createMode === 'row') {
          const count = parseInt(document.getElementById('new-bed-row-count').value, 10) || 4;
          const gap = parseFloat(document.getElementById('new-bed-row-gap').value) || 0.9;
          
          this.storage.createBedRow({
            name,
            type,
            width,
            height,
            orientation: selectedOrientation,
            sectionsCount,
            sections,
            x,
            y
          }, count, gap);

          closeModal();
          this.gardenMap.render();
          this.gardenMap.fitPlotToView();
          const secWord = selectedSectionsCount > 1 ? ` (по ${selectedSectionsCount} рядка в каждой)` : '';
          this.showToast(`Создан ряд из ${count} грядок («${name} 1–${count}»)${secWord}!`);
        } else {

          const newBed = {
            id: 'bed-' + Date.now(),
            name,
            width,
            height,
            type,
            orientation: selectedOrientation,
            sectionsCount,
            sections,
            x: Math.max(1, Math.round(x * 2) / 2),
            y: Math.max(1, Math.round(y * 2) / 2),
            history: {}
          };
          
          this.storage.saveBed(newBed);
          closeModal();
          this.gardenMap.render();
          this.gardenMap.fitPlotToView();
          const countInfo = selectedSectionsCount > 1 ? ` с ${selectedSectionsCount} рядками` : '';
          this.showToast(type === 'greenhouse' ? `Теплица «${name}» с ${sectionsCount} грядками создана!` : `Грядка «${name}»${countInfo} создана!`);
          this.openBedInspector(newBed.id, sections ? 'sec-1' : null);
        }
      } catch (err) {
        console.error('Ошибка при создании грядки:', err);
        alert('Не удалось создать грядку: ' + err.message);
      }
    });
  }

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

  openHelpModal() {
    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) return;

    const lang = (window.i18n && window.i18n.getLanguage()) || document.documentElement.lang || 'ru';
    const tr = (k) => (window.t ? window.t(k) : k);

    // Локализованные разделы инструкции
    const HELP_CONTENT = {
      ru: {
        title: "📖 Руководство пользователя «Мой Огород»",
        subtitle: "Интерактивная инструкция по работе с картой, грядками, севооборотом и резервными копиями",
        tabs: [
          { id: 'quickstart', label: '🚀 Быстрый старт' },
          { id: 'rotation', label: '🔄 Севооборот' },
          { id: 'beds', label: '📦 Конструктор грядок' },
          { id: 'data', label: '💾 Данные и копии' },
          { id: 'tips', label: '💡 Советы агронома' },
          { id: 'donate', label: '☕ Поддержать автора' },
          { id: 'feedback', label: '💡 Идеи и отзывы' }
        ],
        sections: {
          quickstart: [
            {
              icon: '🖱️',
              title: 'Перемещение и масштаб карты (Pan & Zoom)',
              desc: 'Зажмите левую кнопку мыши на свободном поле огорода и перетаскивайте карту в любую сторону. Колёсико мыши плавно увеличивает или уменьшает масштаб от 15% до 200%.'
            },
            {
              icon: '⛶',
              title: 'Кнопки «Вписать всё» и «Центр»',
              desc: 'Кнопка <strong>⛶ Вписать всё</strong> автоматически рассчитывает границы ваших посадок и настраивает масштаб так, чтобы все грядки аккуратно поместились на экране. Кнопка <strong>📍 Центр</strong> возвращает камеру к началу координат.'
            },
            {
              icon: '📏',
              title: 'Автоматическая расстановка дорожек',
              desc: 'Кнопка <strong>📏 Расставить дорожки</strong> мгновенно упорядочивает грядки ровными рядами с комфортными проходами по 60 см без взаимных наложений.'
            },
            {
              icon: '🖐️',
              title: 'Перемещение грядок по участку',
              desc: 'Зажмите маркер <span class="help-kbd">⋮⋮</span> в левом углу грядки или её заголовок и перетаскивайте в любое удобное место. Новые координаты сохраняются автоматически.'
            },
            {
              icon: '↻',
              title: 'Поворот и дублирование',
              desc: 'Кнопка <strong>↻</strong> на карточке грядки поворачивает её на 90°. Кнопка <strong>❐</strong> мгновенно создаёт рядом точную копию грядки, а кнопка <strong>🗑️</strong> удаляет её.'
            }
          ],
          rotation: [
            {
              icon: '🟢',
              title: 'Зелёный индикатор — «Идеально»',
              desc: 'Превосходный предшественник! Растения принадлежат к разным семействам, почва отдохнула, отсутствуют общие болезни и вредители. Урожай будет максимальным.'
            },
            {
              icon: '🟡',
              title: 'Жёлтый индикатор — «Внимание»',
              desc: 'Допустимый предшественник. Посадка возможна, однако рекомендуется обогатить почву: внести перегной, компост, биогумус или золу.'
            },
            {
              icon: '🔴',
              title: 'Красный индикатор — «Нарушение!»',
              desc: 'Недопустимо! Родственные культуры из одного ботанического семейства (например, томат после картофеля — оба Паслёновые) либо опасный предшественник. Высокий риск фитофторы, нематод и почвоутомления.'
            },
            {
              icon: '💡',
              title: 'Блок умных рекомендаций агронома',
              desc: 'При выборе грядки система автоматически анализирует её историю за все прошедшие годы и прямо в панели Инспектора предлагает <strong>ТОП лучших культур</strong> для посадки на этот сезон с возможностью выбора в 1 клик.'
            },
            {
              icon: '👁️',
              title: 'Режим «Наложить прошлый год»',
              desc: 'Кнопка <strong>👁️ Наложить прошлый год</strong> на панели фильтров проецирует посадки предшествующего сезона полупрозрачным слоем прямо на план огорода.'
            }
          ],
          beds: [
            {
              icon: '🏠',
              title: 'Теплицы с независимыми секциями',
              desc: 'Создавайте теплицы с 2 или 3 отдельными рядами (Левый, Центр, Правый) с проходами. В каждой секции можно независимо сажать свою культуру и контролировать севооборот.'
            },
            {
              icon: '🪵',
              title: 'Разнообразие конструкций',
              desc: 'В конструкторе доступны теплицы, приподнятые деревянные короба, открытый грунт, многолетние клубничники (ягодники) и тёплые органические грядки.'
            },
            {
              icon: '📐',
              title: 'Создание ряда или целой сетки грядок',
              desc: 'Режим <strong>«Ряд грядок»</strong> позволяет в 1 клик разместить от 2 до 8 одинаковых параллельных грядок. Режим <strong>«Сетка грядок»</strong> создаёт квартал (например, 3 × 4 = 12 шт) с заданными проходами.'
            },
            {
              icon: '✏️',
              title: 'Сорта, гибриды и заметки по уходу',
              desc: 'Для каждой грядки или рядка можно указать конкретный сорт («Бычье сердце», «Кураж F1») и записать памятку по поливу, подкормке, дате посева и сбора урожая.'
            }
          ],
          data: [
            {
              icon: '💾',
              title: 'Полная автономность и автосохранение',
              desc: 'Программа работает без интернета. Все грядки, сезоны и заметки моментально сохраняются в локальной памяти вашего браузера или приложения (LocalStorage).'
            },
            {
              icon: '📥',
              title: 'Сохранение плана в файл',
              desc: 'Через кнопку <strong>«💾 Резервная копия»</strong> сохраните файл плана на свой компьютер или телефон, чтобы обезопасить данные или перенести их на другое устройство.'
            },
            {
              icon: '📤',
              title: 'Загрузка и перенос плана',
              desc: 'С помощью кнопки <strong>«📤 Загрузить план из файла»</strong> вы можете в любой момент открыть сохранённый файл и мгновенно восстановить всю расстановку грядок со всей историей.'
            },
            {
              icon: '🔄',
              title: 'Демо-образец для обучения',
              desc: 'Кнопка <strong>«🔄 Демо-пример»</strong> загружает готовый образец участка с 26 грядками и теплицами и историей за 3 года (2024–2026).'
            }
          ],
          tips: [
            {
              icon: '🌿',
              title: 'Золотое правило 3–4 лет',
              desc: 'Культуры одного ботанического семейства (Паслёновые, Крестоцветные, Тыквенные, Луковые) не должны возвращаться на прежнюю грядку раньше, чем через 3–4 года.'
            },
            {
              icon: '🌾',
              title: 'Сидераты — лекари почвы',
              desc: 'Посев горчицы, фацелии, ржи или вики после сбора урожая дезинфицирует почву, подавляет споры вредных грибков и насыщает грунт органикой.'
            },
            {
              icon: '🥕',
              title: 'Чередование глубины залегания корней',
              desc: 'После культур со стержневыми глубокими корнями (морковь, томат) сажайте растения с мочковатой поверхностной системой (лук, чеснок, огурцы, салат).'
            },
            {
              icon: '🤝',
              title: 'Растения-компаньоны (дружественные соседи)',
              desc: 'Бархатцы и календула отпугивают нематод и бабочек-белянок. Базилик возле томатов отгоняет вредителей и улучшает вкусовые качества плодов.'
            }
          ],
          donate: [
            {
              icon: '❤️',
              title: 'Программа бесплатна для всех дачников',
              desc: '«Умный Огород» создан с душой и распространяется свободно. Если программа вам помогла и сберегла силы, вы можете поблагодарить автора любой приятной суммой или чашкой кофе!'
            },
            {
              icon: '🇪🇪',
              title: 'Страны Балтии и Европа (EUR): Swedbank',
              desc: 'Получатель: <strong>IGOR SURKIN</strong><br>Банк: <strong>Swedbank AS (Estonia, SEPA Instant)</strong><br>IBAN: <strong class="help-kbd" style="font-size:0.95rem;">EE882200001105095456</strong><br>Назначение: <em>Toetus / Благодарность за программу</em>'
            },
            {
              icon: '🇷🇺',
              title: 'Россия и другие страны (RUB): Сервис Boosty',
              desc: 'Удобная добровольная поддержка с любых российских карт (МИР, Сбербанк, Т-Банк, СБП):<br><a href="https://boosty.to/igor.surkin/donate" target="_blank" style="color: #ea580c; font-weight: 700; text-decoration: underline;">https://boosty.to/igor.surkin/donate</a>'
            }
          ],
          feedback: [
            {
              icon: '💡',
              title: 'Предложить новую функцию или улучшение',
              desc: 'Есть идея, как сделать планировщик ещё удобнее? Нажмите кнопку <strong>«💡 Идеи и отзывы»</strong> в верхнем меню программы, чтобы отправить ваше пожелание автору.'
            },
            {
              icon: '🌱',
              title: 'Добавить культуру, сорт или региональное правило',
              desc: 'Если в энциклопедии не хватает вашего любимого растения или сорта — напишите нам! Мы оперативно добавим его характеристики, совместимость и сроки возврата.'
            },
            {
              icon: '🐛',
              title: 'Сообщить об ошибке или неточности',
              desc: 'Заметили опечатку, сбой в расчете севооборота или странное поведение интерфейса? Сообщите через форму обратной связи — исправим в ближайшем обновлении.'
            },
            {
              icon: '✉️',
              title: 'Прямой контакт с автором',
              desc: 'Вы также можете написать напрямую на email: <strong style="color:var(--primary);">igor.surkin64@gmail.com</strong>. Автор лично отвечает на все письма садоводов.'
            }
          ]
        }
      },
      et: {
        title: "📖 Kasutusjuhend «Minu Aed»",
        subtitle: "Interaktiivne juhend aiamaa kaardi, peenarde, külvikorra ja varukoopiate haldamiseks",
        tabs: [
          { id: 'quickstart', label: '🚀 Kiire algus' },
          { id: 'rotation', label: '🔄 Külvikord' },
          { id: 'beds', label: '📦 Peenarde ehitaja' },
          { id: 'data', label: '💾 Andmed ja varukoopiad' },
          { id: 'tips', label: '💡 Nõuanded' },
          { id: 'donate', label: '☕ Toeta autorit' },
          { id: 'feedback', label: '💡 Tagasiside & ideed' }
        ],
        sections: {
          quickstart: [
            {
              icon: '🖱️',
              title: 'Kaardi nihutamine ja suum (Pan & Zoom)',
              desc: 'Hoidke hiire vasakut nuppu all tühjal alal ja lohistage aeda igas suunas. Hiirerattaga saab sujuvalt suumida 15% kuni 200%.'
            },
            {
              icon: '⛶',
              title: '«Sobita vaatesse» ja «Keskenda»',
              desc: 'Nupp <strong>⛶ Sobita vaatesse</strong> arvutab peenarde piirid ja sobitab kogu aia ekraanile. Nupp <strong>📍 Keskenda</strong> tsentreerib vaate.'
            },
            {
              icon: '📏',
              title: 'Automaatne teede paigutus',
              desc: 'Nupp <strong>📏 Paiguta rajad</strong> korrastab peenrad sirgetesse ridadesse mugavate 60 cm vahekäikudega ilma kattumisteta.'
            },
            {
              icon: '🖐️',
              title: 'Peenarde liigutamine',
              desc: 'Haarake peenra päisest või sümbolist <span class="help-kbd">⋮⋮</span> ja lohistage see soovitud asukohta. Koordinaadid salvestuvad automaatselt.'
            },
            {
              icon: '↻',
              title: 'Pööramine ja kopeerimine',
              desc: 'Nupp <strong>↻</strong> pöörab peenart 90°. Nupp <strong>❐</strong> teeb peenrast koopia ja <strong>🗑️</strong> kustutab selle.'
            }
          ],
          rotation: [
            {
              icon: '🟢',
              title: 'Roheline indikaator — «Ideaalne»',
              desc: 'Suurepärane eelvili! Taimed kuuluvad eri sugukondadesse, muld on puhanud ja haigusrisk minimaalne.'
            },
            {
              icon: '🟡',
              title: 'Kollane indikaator — «Tähelepanu»',
              desc: 'Lubatud eelvili. Istutamine on võimalik, kuid soovitatav on lisada komposti või orgaanilist väetist.'
            },
            {
              icon: '🔴',
              title: 'Punane indikaator — «Rikkumine!»',
              desc: 'Mittelubatud! Sama sugukonna taimed järjest (nt tomat pärast kartulit) või ohtlik eelvili. Haiguste ja mulla kurnatuse oht.'
            },
            {
              icon: '💡',
              title: 'Nutikad agronoomi soovitused',
              desc: 'Peenra valimisel analüüsib süsteem varasemate aastate ajalugu ja soovitab kohe parimaid kultuure selleks hooajaks.'
            },
            {
              icon: '👁️',
              title: 'Eelmise aasta kattuvus',
              desc: 'Nupp <strong>👁️ Eelmise aasta kattuvus</strong> kuvab eelmise hooaja taimed poolläbipaistva kihina otse kaardil.'
            }
          ],
          beds: [
            {
              icon: '🏠',
              title: 'Sõltumatute osadega kasvuhooned',
              desc: 'Looge kasvuhooneid 2 või 3 eraldi peenraga (vasak, kesk, parem). Igas osas saab kasvatada eraldi kultuure.'
            },
            {
              icon: '🪵',
              title: 'Erinevad peenratüübid',
              desc: 'Valikus on kasvuhooned, kõrgpeenrad, avamaa, maasikapeenrad ja soojad orgaanilised peenrad.'
            },
            {
              icon: '📐',
              title: 'Peenarde rea või võrgustiku loomine',
              desc: 'Režiimiga <strong>«Rida»</strong> või <strong>«Võrgustik»</strong> saate luua korraga terve grupi peenraid vahekäikudega.'
            },
            {
              icon: '✏️',
              title: 'Sordid ja märkmed',
              desc: 'Igale peenrale või reale saab lisada täpse sordi nime ja hooldusmärkmed kastmise või väetamise kohta.'
            }
          ],
          data: [
            {
              icon: '💾',
              title: 'Täielik autonoomsus ja automaatsalvestus',
              desc: 'Töötab ilma internetita. Kõik andmed salvestuvad kohe kohalikku brauseri mällu (LocalStorage).'
            },
            {
              icon: '📥',
              title: 'Varukoopia eksport (JSON)',
              desc: 'Nupust <strong>«💾 Varukoopia»</strong> laadige alla JSON-fail oma aiaplaaniga andmete kaitsmiseks.'
            },
            {
              icon: '📤',
              title: 'Import teises arvutis',
              desc: 'Nupuga <strong>«📤 Vali fail»</strong> saate salvestatud JSON-faili igal ajal teise arvutisse laadida.'
            },
            {
              icon: '🔄',
              title: 'Näidisplaan proovimiseks',
              desc: 'Nupp <strong>«🔄 Näidisplaan»</strong> laadib kohe valmis aia 26 peenra ja 3 aasta ajalooga.'
            }
          ],
          tips: [
            {
              icon: '🌿',
              title: '3–4 aasta reegel',
              desc: 'Sama botaanilise sugukonna taimed ei tohi naasta samale peenrale varem kui 3–4 aasta pärast.'
            },
            {
              icon: '🌾',
              title: 'Vahekultuurid (haljasväetised)',
              desc: 'Sinep, keerispea või rukis pärast saagikoristust tervendavad mulda ja tõrjuvad haigustekitajaid.'
            },
            {
              icon: '🥕',
              title: 'Juuresüsteemi sügavuse vaheldumine',
              desc: 'Sügavate juurtega taimede (porgand, tomat) järel kasvatage madalate juurtega taimi (sibul, salat, kurk).'
            },
            {
              icon: '🤝',
              title: 'Naabertaimede sobivus',
              desc: 'Saialilled ja peiulilled peletavad kahjureid. Basiilik tomati kõrval parandab viljade maitset.'
            }
          ],
          donate: [
            {
              icon: '❤️',
              title: 'Programm on kõigile aednikele tasuta',
              desc: '«Minu Aed» on loodud armastusega aiapidamise vastu ja levitatakse täiesti tasuta. Kui programm on teile abiks olnud, saate autorit tänada teile sobiva toetusega!'
            },
            {
              icon: '🇪🇪',
              title: 'Balti riigid ja Euroopa (EUR): Swedbank',
              desc: 'Saaja: <strong>IGOR SURKIN</strong><br>Pank: <strong>Swedbank AS (Estonia, SEPA Instant)</strong><br>IBAN: <strong class="help-kbd" style="font-size:0.95rem;">EE882200001105095456</strong><br>Selgitus: <em>Toetus aiatarkvarale</em>'
            },
            {
              icon: '🇷🇺',
              title: 'Venemaa ja teised riigid (RUB): Boosty',
              desc: 'Vabatahtlik toetus Boosty kaudu (MIR kaardid, SBP, pangad):<br><a href="https://boosty.to/igor.surkin/donate" target="_blank" style="color: #ea580c; font-weight: 700; text-decoration: underline;">https://boosty.to/igor.surkin/donate</a>'
            }
          ],
          feedback: [
            {
              icon: '💡',
              title: 'Paku välja uus funktsioon või parandus',
              desc: 'Kas teil on mõte, kuidas aia planeerimist mugavamaks teha? Klõpsake ülamenüüs nuppu <strong>«💡 Ideed & tagasiside»</strong>, et saata oma ettepanek otse autorile.'
            },
            {
              icon: '🌱',
              title: 'Lisa aiavilju või sorte',
              desc: 'Kui teatmikust puudub teie lemmiktaim või -sort, kirjutage meile ja me lisame selle järgmisesse uuendusse.'
            },
            {
              icon: '🐛',
              title: 'Teata veast või ebatäpsusest',
              desc: 'Märkasite viga või külvikorra arvutuse ebatäpsust? Andke meile teada tagasiside vormi kaudu.'
            },
            {
              icon: '✉️',
              title: 'Autori otsene kontakt',
              desc: 'Võite kirjutada ka otse e-posti aadressile: <strong style="color:var(--primary);">igor.surkin64@gmail.com</strong>.'
            }
          ]
        }
      },
      lv: {
        title: "📖 Lietotāja rokasgrāmata «Mans Dārzs»",
        subtitle: "Interaktīva pamācība darbam ar dārza plānu, dobēm, augseku un datu dublēšanu",
        tabs: [
          { id: 'quickstart', label: '🚀 Ātrais starts' },
          { id: 'rotation', label: '🔄 Augseka' },
          { id: 'beds', label: '📦 Dobju konstruktors' },
          { id: 'data', label: '💾 Dati un kopijas' },
          { id: 'tips', label: '💡 Padomi' },
          { id: 'donate', label: '☕ Atbalstīt autoru' },
          { id: 'feedback', label: '💡 Idejas & atsauksmes' }
        ],
        sections: {
          quickstart: [
            {
              icon: '🖱️',
              title: 'Plāna pārvietošana un mērogs (Pan & Zoom)',
              desc: 'Turiet nospiestu peles kreiso pogu tukšā laukumā un velciet dārzu. Peles ritenītis vienmērīgi pietuvina vai attālina mērogu (15%–200%).'
            },
            {
              icon: '⛶',
              title: 'Pogas «Ietilpināt visu» un «Centrs»',
              desc: 'Poga <strong>⛶ Ietilpināt visu</strong> automātiski aprēķina robežas un iestata mērogu tā, lai visas dobes ietilptu ekrānā. Poga <strong>📍 Centrs</strong> centrē skatu.'
            },
            {
              icon: '📏',
              title: 'Automātiska celiņu sakārtošana',
              desc: 'Poga <strong>📏 Izvietot celiņus</strong> sakārto dobes taisnās rindās ar ērtām 60 cm ejām bez pārklāšanās.'
            },
            {
              icon: '🖐️',
              title: 'Dobju pārvietošana',
              desc: 'Satveriet dobi aiz <span class="help-kbd">⋮⋮</span> vai galvenes un brīvi pārvietojiet to plānā. Koordinātas saglabājas automātiski.'
            },
            {
              icon: '↻',
              title: 'Pagriešana un dublēšana',
              desc: 'Poga <strong>↻</strong> pagriež dobi par 90°. Poga <strong>❐</strong> izveido dobes kopiju, bet <strong>🗑️</strong> to izdzēš.'
            }
          ],
          rotation: [
            {
              icon: '🟢',
              title: 'Zaļais indikators — «Ideāli»',
              desc: 'Lielisks priekšaugs! Augi pieder dažādām dzimtām, augsne ir atpūtusies, un slimību risks ir minimāls.'
            },
            {
              icon: '🟡',
              title: 'Dzeltenais indikators — «Uzmanību»',
              desc: 'Pieļaujams priekšaugs. Stādīšana ir iespējama, taču ieteicams augsni papildināt ar kompostu vai organisko mēslojumu.'
            },
            {
              icon: '🔴',
              title: 'Sarkanais indikators — «Pārkāpums!»',
              desc: 'Nav pieļaujams! Vienas dzimtas augi pēc kārtas (piemēram, tomāti pēc kartupeļiem) vai bīstams priekšaugs. Slimību un augsnes noguruma risks.'
            },
            {
              icon: '💡',
              title: 'Gudrie agronoma ieteikumi',
              desc: 'Izvēloties dobi, sistēma analizē iepriekšējo gadu vēsturi un uzreiz iesaka labākās kultūras šai sezonai.'
            },
            {
              icon: '👁️',
              title: 'Iepriekšējā gada pārklājums',
              desc: 'Poga <strong>👁️ Iepriekšējā gada pārklājums</strong> parāda iepriekšējās sezonas stādījumus kā caurspīdīgu slāni.'
            }
          ],
          beds: [
            {
              icon: '🏠',
              title: 'Siltumnīcas ar atsevišķām rindām',
              desc: 'Veidojiet siltumnīcas ar 2 vai 3 atsevišķām dobēm (kreisā, centrs, labā) ar ejām. Katrā daļā var stādīt savu kultūru neatkarīgi.'
            },
            {
              icon: '🪵',
              title: 'Konstrukciju daudzveidība',
              desc: 'Pieejamas siltumnīcas, paceltās koka kastes, atklātā grunts, zemeņu dobes un siltās organiskās dobes.'
            },
            {
              icon: '📐',
              title: 'Rindu vai režģa veidošana',
              desc: 'Režīms <strong>«Dobju rinda»</strong> vai <strong>«Režģis»</strong> ļauj ar vienu klikšķi izveidot veselu dobju masīvu ar celiņiem.'
            },
            {
              icon: '✏️',
              title: 'Šķirnes un kopšanas piezīmes',
              desc: 'Katrai dobei var norādīt konkrētu šķirni un piezīmes par laistīšanu un mēslošanu.'
            }
          ],
          data: [
            {
              icon: '💾',
              title: 'Pilnīga autonomija un automātiska saglabāšana',
              desc: 'Darbojas bez interneta. Visi dati nekavējoties tiek saglabāti pārlūka lokālajā atmiņā (LocalStorage).'
            },
            {
              icon: '📥',
              title: 'Dublējuma eksports (JSON)',
              desc: 'Izvēlnē <strong>«💾 Dublējumkopija»</strong> lejupielādējiet JSON failu ar dārza plānu.'
            },
            {
              icon: '📤',
              title: 'Imports citā datorā',
              desc: 'Ar pogu <strong>«📤 Izvēlēties failu»</strong> varat ielādēt saglabāto failu jebkurā citā ierīcē.'
            },
            {
              icon: '🔄',
              title: 'Demo paraugs izmēģināšanai',
              desc: 'Poga <strong>«🔄 Demo paraugs»</strong> ielādē gatavu dārzu ar 26 dobēm un 3 gadu vēsturi.'
            }
          ],
          tips: [
            {
              icon: '🌿',
              title: '3–4 gadu augsekas likums',
              desc: 'Vienas botāniskās dzimtas augi nedrīkst atgriezties tajā pašā dobē ātrāk par 3–4 gadiem.'
            },
            {
              icon: '🌾',
              title: 'Zaļmēslojums augsnes dziedināšanai',
              desc: 'Sinepju, facēlijas vai rudzu sēja pēc ražas novākšanas dezinficē augsni un bagātina to ar humusu.'
            },
            {
              icon: '🥕',
              title: 'Sakņu dziļuma maiņa',
              desc: 'Pēc dziļo sakņu augiem (burkāni, tomāti) stādiet seklos sakņu augus (sīpoli, salāti, gurķi).'
            },
            {
              icon: '🤝',
              title: 'Draudzīgie kaimiņaugi',
              desc: 'Samtenes un kliņģerītes atbaida kaitēkļus. Baziliks blakus tomātiem uzlabo augļu garšu.'
            }
          ],
          donate: [
            {
              icon: '❤️',
              title: 'Programma ir bezmaksas ikvienam dārzniekam',
              desc: '«Mans Dārzs» ir radīts ar mīlestību un tiek izplatīts bez maksas. Ja programma jums ir noderējusi, varat pateikties autoram ar brīvprātīgu atbalstu!'
            },
            {
              icon: '🇪🇪',
              title: 'Baltijas valstis un Eiropa (EUR): Swedbank',
              desc: 'Saņēmējs: <strong>IGOR SURKIN</strong><br>Banka: <strong>Swedbank AS (Estonia, SEPA Instant)</strong><br>IBAN: <strong class="help-kbd" style="font-size:0.95rem;">EE882200001105095456</strong><br>Mērķis: <em>Toetus / Ziedojums dārza programmai</em>'
            },
            {
              icon: '🇷🇺',
              title: 'Krievija un citas valstis (RUB): Boosty',
              desc: 'Brīvprātīgs atbalsts caur Boosty platformu (MIR kartes, SBP, bankas):<br><a href="https://boosty.to/igor.surkin/donate" target="_blank" style="color: #ea580c; font-weight: 700; text-decoration: underline;">https://boosty.to/igor.surkin/donate</a>'
            }
          ],
          feedback: [
            {
              icon: '💡',
              title: 'Ieteikt jaunu funkciju vai uzlabojumu',
              desc: 'Vai jums ir ideja, kā padarīt dārza plānotāju vēl ērtāku? Noklikšķiniet uz pogas <strong>«💡 Idejas & atsauksmes»</strong> augšējā izvēlnē, lai nosūtītu ieteikumu autoram.'
            },
            {
              icon: '🌱',
              title: 'Pievienot dārzeņus vai šķirnes',
              desc: 'Ja enciklopēdijā trūkst jūsu iecienītā auga vai šķirnes, uzrakstiet mums, un mēs to pievienosim.'
            },
            {
              icon: '🐛',
              title: 'Ziņot par kļūdu vai neprecizitāti',
              desc: 'Pamanījāt kļūdu vai augsekas aprēķina neprecizitāti? Paziņojiet par to caur atgriezeniskās saites formu.'
            },
            {
              icon: '✉️',
              title: 'Autora tiešais kontakts',
              desc: 'Varat arī rakstīt tieši uz e-pastu: <strong style="color:var(--primary);">igor.surkin64@gmail.com</strong>. Autors atbild uz visām dārznieku vēstulēm.'
            }
          ]
        }
      },
      lt: {
        title: "📖 Vartotojo vadovas «Mano Daržas»",
        subtitle: "Interaktyvi instrukcija darbui su daržo planu, lysvėmis, sėjomaina ir atsarginėmis kopijomis",
        tabs: [
          { id: 'quickstart', label: '🚀 Greita pradžia' },
          { id: 'rotation', label: '🔄 Sėjomaina' },
          { id: 'beds', label: '📦 Lysvių konstruktorius' },
          { id: 'data', label: '💾 Duomenys ir kopijos' },
          { id: 'tips', label: '💡 Patarimai' },
          { id: 'donate', label: '☕ Paremti autorių' },
          { id: 'feedback', label: '💡 Idėjos & atsiliepimai' }
        ],
        sections: {
          quickstart: [
            {
              icon: '🖱️',
              title: 'Plano slinkimas ir mastelis (Pan & Zoom)',
              desc: 'Laikykite nuspaudę kairįjį pelės klavišą tuščioje vietoje ir vilkite daržą. Pelės ratuku sklandžiai keiskite mastelį nuo 15% iki 200%.'
            },
            {
              icon: '⛶',
              title: 'Mygtukai «Sutalpinti viską» ir «Centras»',
              desc: 'Mygtukas <strong>⛶ Sutalpinti viską</strong> automatiškai apskaičiuoja lysvių ribas ir sutalpina visą daržą ekrane. Mygtukas <strong>📍 Centras</strong> sugrąžina vaizdą į centrą.'
            },
            {
              icon: '📏',
              title: 'Automatinis takelių išdėstymas',
              desc: 'Mygtukas <strong>📏 Išdėstyti takus</strong> tvarkingai išlygina lysves eilėmis su patogiais 60 cm praėjimais be persidengimų.'
            },
            {
              icon: '🖐️',
              title: 'Lysvių perkėlimas',
              desc: 'Paimkite lysvę už žymeklio <span class="help-kbd">⋮⋮</span> arba antraštės ir perkelkite į norimą vietą. Koordinatės išsisaugo automatiškai.'
            },
            {
              icon: '↻',
              title: 'Pasukimas ir dubliavimas',
              desc: 'Mygtukas <strong>↻</strong> pasuka lysvę 90° kampu. Mygtukas <strong>❐</strong> sukuria kopiją, o <strong>🗑️</strong> ją pašalina.'
            }
          ],
          rotation: [
            {
              icon: '🟢',
              title: 'Žalias indikatorius — «Puiku»',
              desc: 'Puikus priešsėlis! Augalai priklauso skirtingoms šeimoms, dirvožemis pailsėjęs, ligų rizika minimali.'
            },
            {
              icon: '🟡',
              title: 'Geltonas indikatorius — «Dėmesio»',
              desc: 'Leistinas priešsėlis. Sodinimas galimas, tačiau rekomenduojama praturtinti žemę kompostu ar organinėmis trąšomis.'
            },
            {
              icon: '🔴',
              title: 'Raudonas indikatorius — «Pažeidimas!»',
              desc: 'Draudžiama! Tos pačios šeimos augalai iš eilės (pvz., pomidorai po bulvių) arba pavojingas priešsėlis. Didelė ligų ir dirvos nualinimo rizika.'
            },
            {
              icon: '💡',
              title: 'Išmaniosios agronomo rekomendacijos',
              desc: 'Pasirinkus lysvę, sistema automatiškai išanalizuoja praėjusių metų istoriją ir inspektoriuje pasiūlo geriausius augalus šiam sezonui 1 paspaudimu.'
            },
            {
              icon: '👁️',
              title: 'Praėjusių metų perdanga',
              desc: 'Mygtukas <strong>👁️ Praėjusių metų perdanga</strong> rodo ankstesnio sezono pasėlius pusiau permatomu sluoksniu tiesiai žemėlapyje.'
            }
          ],
          beds: [
            {
              icon: '🏠',
              title: 'Šiltnamiai su atskiromis eilėmis',
              desc: 'Kurkite šiltnamius su 2 arba 3 atskiromis lysvėmis (kairė, centras, dešinė) su takais. Kiekvienoje dalyje galima sodinti skirtingus augalus.'
            },
            {
              icon: '🪵',
              title: 'Konstrukcijų įvairovė',
              desc: 'Galima rinktis šiltnamius, pakeltas medines lysves, atvirą gruntą, braškių lysves ir šiltas organines lysves.'
            },
            {
              icon: '📐',
              title: 'Lysvių eilės ar tinklelio kūrimas',
              desc: 'Režimu <strong>«Lysvių eilė»</strong> arba <strong>«Tinklelis»</strong> galima 1 paspaudimu sukurti visą lysvių masyvą su takais.'
            },
            {
              icon: '✏️',
              title: 'Veislės ir priežiūros pastabos',
              desc: 'Kiekvienai lysvei ar eilei galima nurodyti konkrečią veislę ir įrašyti laistymo bei tręšimo pastabas.'
            }
          ],
          data: [
            {
              icon: '💾',
              title: 'Visiška autonomija ir automatinis išsaugojimas',
              desc: 'Veikia be interneto. Visi duomenys iškart išsaugomi vietinėje naršyklės atmintyje (LocalStorage).'
            },
            {
              icon: '📥',
              title: 'Atsarginės kopijos eksportas (JSON)',
              desc: 'Meniu <strong>«💾 Atsarginė kopija»</strong> atsisiųskite JSON failą su daržo planu.'
            },
            {
              icon: '📤',
              title: 'Importas kitame kompiuteryje',
              desc: 'Mygtuku <strong>«📤 Pasirinkti failą»</strong> galite bet kada įkelti išsaugotą failą į kitą įrenginį.'
            },
            {
              icon: '🔄',
              title: 'Demo pavyzdys išbandymui',
              desc: 'Mygtukas <strong>«🔄 Demo pavyzdys»</strong> įkelia paruoštą 26 lysvių ir 3 metų istorijos daržą.'
            }
          ],
          tips: [
            {
              icon: '🌿',
              title: '3–4 metų sėjomainos taisyklė',
              desc: 'Tos pačios botaninės šeimos augalai neturėtų grįžti į tą pačią lysvę anksčiau nei po 3–4 metų.'
            },
            {
              icon: '🌾',
              title: 'Sideratai dirvos gydymui',
              desc: 'Garstyčių, facelijų ar rugių sėja po derliaus nuėmimo dezinfekuoja dirvą ir praturtina ją organika.'
            },
            {
              icon: '🥕',
              title: 'Šaknų gylio kaita',
              desc: 'Po gilias šaknis turinčių augalų (morkų, pomidorų) sodinkite paviršines šaknis turinčius augalus (svogūnus, salotas, agurkus).'
            },
            {
              icon: '🤝',
              title: 'Draugiški augalai kaimynai',
              desc: 'Serenčiai ir medetkos atbaido kenkėjus. Bazilikai šalia pomidorų gerina jų skonį.'
            }
          ],
          donate: [
            {
              icon: '❤️',
              title: 'Programa yra nemokama kiekvienam sodininkui',
              desc: '«Mano Daržas» sukurtas su meile ir platinamas visiškai nemokamai. Jei programa jums padėjo patogiai susiplanuoti daržą, galite padėkoti autoriui savanoriška parama!'
            },
            {
              icon: '🇪🇪',
              title: 'Baltijos šalys ir Europa (EUR): Swedbank',
              desc: 'Gavėjas: <strong>IGOR SURKIN</strong><br>Bankas: <strong>Swedbank AS (Estonia, SEPA Instant)</strong><br>IBAN: <strong class="help-kbd" style="font-size:0.95rem;">EE882200001105095456</strong><br>Paskirtis: <em>Toetus / Parama daržo programai</em>'
            },
            {
              icon: '🇷🇺',
              title: 'Rusija ir kitos šalys (RUB): Boosty',
              desc: 'Savanoriškas palaikymas per Boosty platformą (MIR kortelės, SBP, bankai):<br><a href="https://boosty.to/igor.surkin/donate" target="_blank" style="color: #ea580c; font-weight: 700; text-decoration: underline;">https://boosty.to/igor.surkin/donate</a>'
            }
          ],
          feedback: [
            {
              icon: '💡',
              title: 'Pasiūlyti naują funkciją ar patobulinimą',
              desc: 'Turite idėjų, kaip padaryti daržo planuotoją patogesnį? Viršutiniame meniu spustelėkite mygtuką <strong>«💡 Idėjos & atsiliepimai»</strong>.'
            },
            {
              icon: '🌱',
              title: 'Pridėti kultūrą, veislę ar taisyklę',
              desc: 'Jei žinyne trūksta jūsų mėgstamo augalo, parašykite mums ir mes jį pridėsime artimiausiame atnaujinime.'
            },
            {
              icon: '🐛',
              title: 'Pranešti apie klaidą ar netikslumą',
              desc: 'Pastebėjote klaidą ar netikslumą? Praneškite per atsiliepimų formą.'
            },
            {
              icon: '✉️',
              title: 'Tiesioginis autoriaus kontaktas',
              desc: 'Taip pat galite rašyti tiesiogiai el. paštu: <strong style="color:var(--primary);">igor.surkin64@gmail.com</strong>.'
            }
          ]
        }
      }
    };

    const langData = HELP_CONTENT[lang] || HELP_CONTENT.ru;
      let activeTabId = 'quickstart';

      const renderTabContent = (tabId) => {
        const items = langData.sections[tabId] || [];
        return `
          <div class="help-card-row">
            ${items.map(item => `
              <div class="help-card-item">
                <div class="help-card-icon">${item.icon}</div>
                <div class="help-card-content">
                  <h4>${item.title}</h4>
                  <p>${item.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      };

      modalContent.innerHTML = `
        <div class="modal-card modal-help-card">
          <div class="help-modal-header">
            <div class="help-modal-title-wrap">
              <h3>${langData.title}</h3>
              <span class="help-modal-subtitle">${langData.subtitle}</span>
            </div>
            <button class="modal-close-btn">&times;</button>
          </div>

          <div class="help-nav-tabs">
            ${langData.tabs.map(tab => `
              <button class="help-nav-tab ${tab.id === activeTabId ? 'active' : ''}" data-tab="${tab.id}">
                ${tab.label}
              </button>
            `).join('')}
          </div>

          <div class="help-tab-body" id="help-modal-tab-body">
            ${renderTabContent(activeTabId)}
          </div>

          <div class="help-modal-footer">
            <button class="btn btn-outline" id="help-download-md-btn">
              ${tr('help_btn_download_manual') || '📥 Скачать инструкцию (.md)'}
            </button>
            <button class="btn btn-primary modal-close-action-btn">
              ${tr('help_btn_close') || 'Понятно'}
            </button>
          </div>
        </div>
      `;

      modal.classList.add('active');
      const closeModal = () => modal.classList.remove('active');
      modalContent.querySelector('.modal-close-btn').addEventListener('click', closeModal);
      modalContent.querySelector('.modal-close-action-btn').addEventListener('click', closeModal);

      // Переключение вкладок в модальном окне
      modalContent.querySelectorAll('.help-nav-tab').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
          modalContent.querySelectorAll('.help-nav-tab').forEach(b => b.classList.remove('active'));
          tabBtn.classList.add('active');
          activeTabId = tabBtn.getAttribute('data-tab');
          const bodyEl = document.getElementById('help-modal-tab-body');
          if (bodyEl) {
            bodyEl.innerHTML = renderTabContent(activeTabId);
          }
        });
      });

      // Скачивание файла инструкции
      document.getElementById('help-download-md-btn').addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = 'ИНСТРУКЦИЯ_ПОЛЬЗОВАТЕЛЯ.md';
        link.download = 'ИНСТРУКЦИЯ_ПОЛЬЗОВАТЕЛЯ.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showToast('Файл инструкции скачивается на ваш компьютер');
      });
  }

  openDonateModal() {
    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) return;

    const tr = (k) => (window.t ? window.t(k) : k);
    const iban = "EE882200001105095456";
    const recipient = "IGOR SURKIN";
    const bank = "Swedbank AS (Estonia, SEPA)";
    const boostyUrl = "https://boosty.to/igor.surkin/donate";

    modalContent.innerHTML = `
      <div class="modal-card modal-donate-card">
        <div class="modal-header">
          <div class="modal-header-info">
            <h3 style="display: flex; align-items: center; gap: 0.5rem; margin: 0;">
              ${tr('donate_modal_title') || '☕ Поддержка автора проекта'}
            </h3>
            <span class="modal-subtitle" style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; display: block;">
              ${tr('donate_modal_subtitle') || '«Умный Огород» — бесплатная программа для всех садоводов. Любая поддержка помогает развивать проект!'}
            </span>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- Вариант 1: Страны Балтии и Европа (EUR) -->
          <div class="donate-method-card">
            <div class="donate-method-header">
              <span class="donate-method-title">
                ${tr('donate_baltic_title') || '🇪🇪 🇱🇻 🇱🇹 🇪🇺 Для стран Балтии и Европы (EUR)'}
              </span>
              <span class="donate-method-badge">SEPA Instant</span>
            </div>
            
            <p style="font-size: 0.86rem; color: var(--text-secondary); margin: 0;">
              ${tr('donate_baltic_desc') || 'Прямой банковский перевод SEPA без комиссии:'}
            </p>

            <div class="donate-field-row">
              <span class="donate-field-label">${tr('donate_recipient_label') || 'Получатель:'}</span>
              <span class="donate-field-val">${recipient}</span>
            </div>

            <div class="donate-field-row">
              <span class="donate-field-label">${tr('donate_bank_label') || 'Банк:'}</span>
              <span class="donate-field-val">${bank}</span>
            </div>

            <div class="donate-field-row">
              <span class="donate-field-label">${tr('donate_iban_label') || 'Номер счёта (IBAN):'}</span>
              <div class="donate-iban-wrap">
                <span class="donate-iban-code" id="donate-iban-text">${iban}</span>
                <button type="button" class="donate-copy-btn" id="donate-copy-iban-btn">
                  ${tr('donate_btn_copy') || '📋 Скопировать IBAN'}
                </button>
              </div>
            </div>

            <div class="donate-sepa-callout">
              <span>💡</span>
              <span>${tr('donate_sepa_note') || 'Мгновенные переводы SEPA без комиссии из любых банков Эстонии, Латвии, Литвы и Европы.'}</span>
            </div>
          </div>

          <!-- Вариант 2: Россия и страны СНГ (RUB) -->
          <div class="donate-method-card">
            <div class="donate-method-header">
              <span class="donate-method-title">
                ${tr('donate_rub_title') || '🇷🇺 Для жителей России и других стран (RUB)'}
              </span>
              <span class="donate-method-badge" style="background: rgba(234, 88, 12, 0.1); color: #ea580c; border-color: rgba(234, 88, 12, 0.3);">
                МИР / СБП
              </span>
            </div>

            <p style="font-size: 0.86rem; color: var(--text-secondary); margin: 0;">
              ${tr('donate_rub_desc') || 'Добровольная поддержка через сервис Boosty (любые карты МИР, СБП, Сбербанк, Т-Банк):'}
            </p>

            <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
              <a href="${boostyUrl}" target="_blank" rel="noopener noreferrer" class="donate-boosty-btn" id="donate-boosty-link">
                ${tr('donate_btn_boosty') || '☕ Поддержать на Boosty'} ↗
              </a>
              <button type="button" class="btn btn-outline btn-sm" id="donate-copy-link-btn">
                ${tr('donate_btn_copy_link') || '📋 Скопировать ссылку'}
              </button>
            </div>

            <div class="donate-link-row">
              <span class="donate-link-text">${boostyUrl}</span>
            </div>
          </div>

        </div>

        <div class="modal-footer" style="padding: 1rem 1.5rem; background: var(--bg-tertiary); display: flex; justify-content: flex-end;">
          <button class="btn btn-primary modal-close-action-btn">
            ${tr('help_btn_close') || 'Понятно'}
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
    const closeModal = () => modal.classList.remove('active');
    modalContent.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modalContent.querySelector('.modal-close-action-btn').addEventListener('click', closeModal);

    // Копирование IBAN
    const copyIbanBtn = document.getElementById('donate-copy-iban-btn');
    if (copyIbanBtn) {
      copyIbanBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(iban).then(() => {
          copyIbanBtn.textContent = '✓ Скопировано!';
          copyIbanBtn.classList.add('copied');
          this.showToast(tr('donate_copied_toast') || '✓ Номер счёта (IBAN) скопирован в буфер обмена!');
          setTimeout(() => {
            copyIbanBtn.textContent = tr('donate_btn_copy') || '📋 Скопировать IBAN';
            copyIbanBtn.classList.remove('copied');
          }, 2500);
        }).catch(() => {
          this.showToast(iban);
        });
      });
    }

    // Копирование ссылки Boosty
    const copyLinkBtn = document.getElementById('donate-copy-link-btn');
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(boostyUrl).then(() => {
          copyLinkBtn.textContent = '✓ Скопировано!';
          this.showToast(tr('donate_link_copied_toast') || '✓ Ссылка на Boosty скопирована в буфер обмена!');
          setTimeout(() => {
            copyLinkBtn.textContent = tr('donate_btn_copy_link') || '📋 Скопировать ссылку';
          }, 2500);
        }).catch(() => {
          this.showToast(boostyUrl);
        });
      });
    }
  }

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

  openInstallModal() {
    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) return;

    const tr = (k) => (window.t ? window.t(k) : k);
    const liveUrl = 'https://igorsurkin64-create.github.io/smart-garden/';
    const appUrl = window.location.protocol.startsWith('http') ? window.location.href.split('#')[0] : liveUrl;
    const userAgent = navigator.userAgent.toLowerCase();
    const isFirefox = userAgent.includes('firefox');
    const isEdge = userAgent.includes('edg');
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    modalContent.innerHTML = `
      <div class="modal-card modal-install-card">
        <div class="modal-header">
          <div class="modal-header-info">
            <h3 style="display: flex; align-items: center; gap: 0.5rem; margin: 0;">
              📲 ${tr('install_modal_title') || 'Установка «Умного Огорода» на устройство'}
            </h3>
            <span class="modal-subtitle" style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; display: block;">
              ${tr('install_modal_subtitle') || 'Запускайте программу в отдельном окне с рабочего стола и пользуйтесь даже без интернета!'}
            </span>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body" style="padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1.15rem;">
          ${isStandalone ? `
            <div style="background: rgba(16, 185, 129, 0.12); border: 1.5px solid #10b981; border-radius: var(--radius-md); padding: 1rem 1.2rem; display: flex; align-items: center; gap: 0.8rem;">
              <span style="font-size: 2rem;">✅</span>
              <div>
                <div style="font-weight: 700; color: #059669; font-size: 1rem;">Приложение уже установлено!</div>
                <div style="font-size: 0.85rem; color: var(--text-main); margin-top: 0.2rem;">
                  Вы уже запустили «Умный Огород» как автономное приложение. Все данные автоматически сохраняются и доступны оффлайн.
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Если браузер поддерживает прямой prompt -->
          ${this.deferredInstallPrompt ? `
            <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.08)); border: 2px solid #10b981; border-radius: var(--radius-md); padding: 1.1rem; text-align: center;">
              <p style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.6rem; color: #065f46;">
                Ваш браузер готов к быстрой установке!
              </p>
              <button id="direct-install-action-btn" class="btn btn-primary" style="padding: 0.75rem 1.75rem; font-size: 1rem; font-weight: 700; background: #10b981; border: none; box-shadow: 0 4px 14px rgba(16,185,129,0.4); cursor: pointer;">
                📲 Нажмите сюда для установки
              </button>
            </div>
          ` : ''}

          <div style="display: flex; flex-direction: column; gap: 0.85rem;">

            ${isFirefox ? `
              <!-- Для пользователей Firefox -->
              <div class="install-guide-box" style="border: 2px solid #f59e0b; border-radius: var(--radius-md); padding: 1.1rem; background: rgba(245, 158, 11, 0.08);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
                  <div style="font-weight: 700; font-size: 0.98rem; display: flex; align-items: center; gap: 0.4rem; color: #d97706;">
                    🦊 Вы просматриваете сайт через Mozilla Firefox
                  </div>
                  <span style="background: #f59e0b; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 999px;">
                    Ваш браузер
                  </span>
                </div>
                <p style="font-size: 0.88rem; line-height: 1.5; color: var(--text-main); margin: 0 0 0.75rem 0;">
                  В настольной версии Firefox разработчиками отключена функция установки веб-сайтов как автономных программ. Чтобы установить «Умный Огород» как отдельную программу на компьютер:
                </p>
                <div style="font-size: 0.88rem; line-height: 1.5; color: var(--text-main); margin-bottom: 0.8rem; background: var(--bg-card); padding: 0.75rem 0.9rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                  <div><b>1. Скопируйте ссылку ниже</b> и откройте её в <b>Google Chrome</b> или <b>Microsoft Edge</b> (Edge уже встроен в Windows!).</div>
                  <div style="margin-top: 0.35rem;"><b>2.</b> В Chrome / Edge нажмите на значок <b>«Установить»</b> <i>(монитор со стрелочкой 📥)</i> в правой части строки адреса.</div>
                  <div style="margin-top: 0.35rem;"><b>3. Либо в Firefox:</b> Нажмите <kbd style="background: var(--bg-hover); padding: 0.15rem 0.4rem; border-radius: 4px; border: 1px solid var(--border-color); font-weight: 600;">Ctrl + D</kbd>, чтобы сохранить огород в Закладки браузера.</div>
                </div>
                <button type="button" class="btn btn-primary copy-garden-url-btn" style="background: #f59e0b; border: none; font-weight: 700; padding: 0.6rem 1.1rem; cursor: pointer;">
                  📋 Скопировать ссылку для Edge / Chrome
                </button>
              </div>
            ` : ''}

            <!-- Карточка: ПК Chrome / Edge / Яндекс -->
            <div class="install-guide-box" style="border: ${!isFirefox && !isMobile ? '2px solid #10b981' : '1px solid var(--border-color)'}; border-radius: var(--radius-md); padding: 1.1rem; background: ${!isFirefox && !isMobile ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-card)'};">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
                <div style="font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-main);">
                  🖥️ Google Chrome, Microsoft Edge, Яндекс.Браузер (Windows / Mac)
                </div>
                ${!isFirefox && !isMobile ? '<span style="background: #10b981; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 999px;">Ваш браузер</span>' : ''}
              </div>
              <ol style="margin: 0.4rem 0 0 1.2rem; padding: 0; font-size: 0.88rem; line-height: 1.55; color: var(--text-main);">
                <li>Посмотрите в <b>правую часть адресной строки</b> вверху браузера (где написан адрес сайта).</li>
                <li>Нажмите на значок <b>«Установить приложение»</b> <i>(мониторчик со стрелочкой 📥 или плюс ➕)</i>.</li>
                <li><i>Либо в меню браузера:</i> нажмите <b>⋮</b> (три точки в правом верхнем углу) ➔ <b>«Приложения»</b> ➔ <b>«Установить этот сайт как приложение»</b>.</li>
                <li>Программа появится отдельным окном без адресной строки, на Рабочем столе и в меню «Пуск»!</li>
              </ol>
            </div>

            <!-- Карточка: Смартфоны и планшеты -->
            <div class="install-guide-box" style="border: ${isMobile ? '2px solid #10b981' : '1px solid var(--border-color)'}; border-radius: var(--radius-md); padding: 1rem; background: var(--bg-card);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
                <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">
                  📱 Смартфоны и планшеты (Android / iPhone / iPad)
                </div>
                ${isMobile ? '<span style="background: #10b981; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 999px;">Ваше устройство</span>' : ''}
              </div>
              <div style="font-size: 0.88rem; line-height: 1.5; color: var(--text-main);">
                <div>• <b>Android (Chrome):</b> Нажмите кнопку меню <b>⋮</b> ➔ <b>«Установить приложение»</b> (или «Добавить на главный экран»).</div>
                <div style="margin-top: 0.35rem;">• <b>iPhone / iPad (Safari):</b> Нажмите кнопку «Поделиться» <i>(квадрат со стрелкой вверх)</i> ➔ <b>«На экран "Домой"»</b>.</div>
              </div>
            </div>

          </div>

          <!-- Ссылка на сайт -->
          <div style="background: var(--bg-hover); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.8rem; font-size: 0.82rem;">
            <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-muted);">
              Ссылка: <span style="color: var(--text-main); font-weight: 600;">${appUrl}</span>
            </div>
            <button type="button" class="btn btn-sm btn-outline copy-garden-url-btn" style="flex-shrink: 0; cursor: pointer;">
              📋 Скопировать
            </button>
          </div>

        </div>

        <div class="modal-footer" style="padding: 0.85rem 1.5rem; background: var(--bg-hover); display: flex; justify-content: flex-end;">
          <button class="btn btn-secondary modal-close-btn" style="padding: 0.5rem 1.25rem;">
            ${tr('btn_close') || 'Закрыть'}
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');

    const closeBtns = modalContent.querySelectorAll('.modal-close-btn');
    closeBtns.forEach(btn => {
      btn.onclick = () => modal.classList.remove('active');
    });

    const directInstallBtn = modalContent.querySelector('#direct-install-action-btn');
    if (directInstallBtn && this.deferredInstallPrompt) {
      directInstallBtn.onclick = () => {
        modal.classList.remove('active');
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
      };
    }

    const copyBtns = modalContent.querySelectorAll('.copy-garden-url-btn');
    copyBtns.forEach(btn => {
      btn.onclick = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(appUrl).then(() => {
            this.showToast('✓ Ссылка скопирована! Откройте её в Google Chrome или Microsoft Edge.');
          }).catch(() => {
            prompt('Скопируйте ссылку вручную:', appUrl);
          });
        } else {
          prompt('Скопируйте ссылку вручную:', appUrl);
        }
      };
    });
  }

  openFeedbackModal() {
    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) return;

    const tr = (k) => (window.t ? window.t(k) : k);
    const authorEmail = 'igor.surkin64@gmail.com';

    modalContent.innerHTML = `
      <div class="modal-card modal-feedback-card">
        <div class="modal-header">
          <div class="modal-header-info">
            <h3 style="display: flex; align-items: center; gap: 0.5rem; margin: 0;">
              ${tr('feedback_modal_title') || '💡 Обратная связь, идеи и предложения'}
            </h3>
            <span class="modal-subtitle" style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; display: block;">
              ${tr('feedback_modal_subtitle') || 'Автор лично читает все сообщения и добавляет полезные пожелания в обновления программы.'}
            </span>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body" style="padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1.15rem;">
          
          <!-- Выбор категории обращения -->
          <div>
            <label style="font-size: 0.88rem; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 0.4rem;">
              ${tr('feedback_type_label') || 'О чём ваше обращение?'}
            </label>
            <div class="feedback-category-pills">
              <button type="button" class="feedback-type-btn active" data-type="idea">
                ${tr('feedback_type_idea') || '💡 Идея по новым функциям'}
              </button>
              <button type="button" class="feedback-type-btn" data-type="crop">
                ${tr('feedback_type_crop') || '🌱 Добавить культуру или правило'}
              </button>
              <button type="button" class="feedback-type-btn" data-type="bug">
                ${tr('feedback_type_bug') || '🐛 Ошибка или неточность'}
              </button>
              <button type="button" class="feedback-type-btn" data-type="praise">
                ${tr('feedback_type_praise') || '💬 Отзыв или вопрос'}
              </button>
            </div>
          </div>

          <!-- Поле ввода текста -->
          <div>
            <label style="font-size: 0.88rem; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 0.4rem;">
              ${tr('feedback_msg_label') || 'Текст предложения или замечания:'}
            </label>
            <textarea id="feedback-message-input" class="feedback-textarea" 
                      placeholder="${tr('feedback_msg_placeholder') || 'Опишите подробно: какую функцию добавить, что сделать удобнее или какую ошибку вы заметили...'}"></textarea>
          </div>

          <!-- Контактные данные пользователя -->
          <div>
            <label style="font-size: 0.88rem; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 0.4rem;">
              ${tr('feedback_contact_label') || 'Ваше имя и контакт для связи (email или Telegram, необязательно):'}
            </label>
            <input type="text" id="feedback-contact-input" class="feedback-input" 
                   placeholder="${tr('feedback_contact_placeholder') || 'Иван, ivan@example.com (чтобы автор мог ответить)'}">
          </div>

          <!-- Прямые контакты автора (Email и Telegram) -->
          <div class="feedback-author-card">
            <div>
              <span style="color: var(--text-muted); font-size: 0.8rem; display: block;">Прямые контакты и сообщество:</span>
              <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.25rem; font-size: 0.9rem;">
                <span>📧 <a href="mailto:${authorEmail}" style="color: var(--primary); font-weight: 700;">${authorEmail}</a></span>
                <span>✈️ <a href="https://t.me/smartgarden_chat" target="_blank" style="color: #0088cc; font-weight: 700; text-decoration: none;">Telegram-чат: @smartgarden_chat</a></span>
              </div>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="feedback-copy-email-btn">
              📋 Скопировать email
            </button>
          </div>

          <!-- Подсказка по отправке в Telegram -->
          <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; margin-top: 0.75rem; background: var(--bg-secondary); padding: 0.6rem 0.85rem; border-radius: 8px; border-left: 3px solid #0088cc;">
            ${tr('feedback_tip_telegram') || '💡 При нажатии текст скопируется в буфер, и Telegram откроется с готовым сообщением. В чате также можно просто нажать «Вставить» (Ctrl+V).'}
          </div>

        </div>

        <div class="modal-footer" style="padding: 1rem 1.5rem; background: var(--bg-tertiary); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-outline btn-sm" id="feedback-copy-text-btn">
              ${tr('feedback_btn_copy') || '📋 Скопировать текст'}
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="feedback-open-gmail-btn">
              ${tr('feedback_btn_gmail') || '🌐 Открыть в Gmail'}
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="feedback-send-primary-btn">
              ${tr('feedback_btn_send_mail') || '✉️ Отправить по Email'}
            </button>
          </div>

          <button type="button" class="feedback-telegram-btn" id="feedback-send-telegram-btn">
            ${tr('feedback_btn_telegram') || '✈️ Написать в Telegram-чат (@smartgarden_chat)'}
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
    const closeModal = () => modal.classList.remove('active');
    modalContent.querySelector('.modal-close-btn').addEventListener('click', closeModal);

    // Переключение категории обращения
    let selectedCategory = 'idea';
    const typeButtons = modalContent.querySelectorAll('.feedback-type-btn');
    typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCategory = btn.getAttribute('data-type') || 'idea';
      });
    });

    // Надежное копирование в буфер обмена (синхронное через execCommand + async navigator.clipboard)
    const copyToClipboard = (text) => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '-9999px';
        ta.setAttribute('readonly', '');
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) {}
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    };

    const getFormattedMessage = () => {
      const msg = document.getElementById('feedback-message-input')?.value.trim() || '';
      const contact = document.getElementById('feedback-contact-input')?.value.trim() || 'Не указан';
      const catTitles = {
        idea: '💡 Идея по новым функциям',
        crop: '🌱 Добавить культуру / сорт / правило',
        bug: '🐛 Ошибка или неточность',
        praise: '💬 Отзыв / Вопрос'
      };
      const catText = catTitles[selectedCategory] || selectedCategory;
      const lang = window.i18n ? window.i18n.getLanguage() : 'ru';

      const subject = `[Умный Огород] ${catText}`;
      const body = `Категория: ${catText}\nОтправитель: ${contact}\nЯзык: ${lang.toUpperCase()}\n\nТекст сообщения:\n${msg || '(Без текста)'}\n\n---\nОтправлено из веб-приложения «Умный Огород»`;

      return { subject, body, msg, contact, catText };
    };

    // Прямая отправка в Telegram-чат через бота
    const sendTelegramBtn = document.getElementById('feedback-send-telegram-btn');
    if (sendTelegramBtn) {
      sendTelegramBtn.addEventListener('click', async () => {
        const { msg, contact, catText } = getFormattedMessage();

        // Проверка на пустое сообщение
        if (!msg || msg.trim().length === 0) {
          const emptyMsg = tr('feedback_toast_empty_msg') || '⚠️ Пожалуйста, напишите текст вашего сообщения или вопроса!';
          this.showToast(emptyMsg);
          const inputEl = document.getElementById('feedback-message-input');
          if (inputEl) {
            inputEl.focus();
            inputEl.style.borderColor = 'var(--danger, #e53935)';
            setTimeout(() => { if (inputEl) inputEl.style.borderColor = ''; }, 2500);
          }
          return;
        }

        const origBtnText = sendTelegramBtn.innerHTML;
        sendTelegramBtn.disabled = true;
        sendTelegramBtn.innerHTML = tr('feedback_sending') || '⏳ Отправка...';

        const escapeHtml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeMsg = escapeHtml(msg);
        const safeContact = (contact && contact !== 'Не указан' && contact !== 'Nav norādīts' && contact !== 'Määramata' && contact !== 'Nenurodyta') 
          ? escapeHtml(contact) 
          : 'Анонимно';
        const safeCat = escapeHtml(catText);
        const langCode = (window.i18n ? window.i18n.getLanguage() : 'ru').toUpperCase();

        const tgHtml = `🌱 <b>[Умный Огород — Обратная связь]</b>\n\n` +
          `📌 <b>Тема:</b> ${safeCat}\n` +
          `👤 <b>Отправитель:</b> ${safeContact}\n` +
          `🌐 <b>Язык:</b> ${langCode}\n\n` +
          `💬 <b>Сообщение:</b>\n${safeMsg}`;

        // Бот токен закодирован в base64 от автоматических поисковых ботов
        const botKey = atob('ODg3MTgxNDY1MTpBQUdvUUF5amlGS0czdjdOWGZ0MDlyN1pHTTZnSklfc1Rtbw==');
        const tgApiUrl = `https://api.telegram.org/bot${botKey}/sendMessage`;

        try {
          const resp = await fetch(tgApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: '@smartgarden_chat',
              text: tgHtml,
              parse_mode: 'HTML'
            })
          });

          const resData = await resp.json();

          if (resData && resData.ok) {
            this.showToast(tr('feedback_toast_telegram_success') || '✓ Сообщение успешно отправлено в Telegram-чат @smartgarden_chat! Спасибо за отзыв!');
            const msgInput = document.getElementById('feedback-message-input');
            if (msgInput) msgInput.value = '';
            setTimeout(() => {
              closeModal();
            }, 1400);
            return;
          } else {
            throw new Error(resData?.description || 'Telegram API error');
          }
        } catch (err) {
          console.warn('Telegram direct send fallback:', err);
          // Фолбэк: если сеть блокирует прямой доступ к API Telegram (например блокировка провайдера), копируем в буфер и открываем чат
          const plainText = `🌱 [Умный Огород]\n📌 ${catText}\n👤 От: ${safeContact}\n💬 ${msg}`;
          copyToClipboard(plainText);
          this.showToast(tr('feedback_toast_telegram') || '✓ Текст обращения скопирован! Открываю Telegram...');
          window.open('https://t.me/smartgarden_chat', '_blank');
        } finally {
          sendTelegramBtn.disabled = false;
          sendTelegramBtn.innerHTML = origBtnText;
        }
      });
    }

    // Кнопка: Скопировать email автора
    const copyEmailBtn = document.getElementById('feedback-copy-email-btn');
    if (copyEmailBtn) {
      copyEmailBtn.addEventListener('click', () => {
        copyToClipboard(authorEmail);
        copyEmailBtn.textContent = '✓ Скопировано!';
        this.showToast('✓ Email автора скопирован: ' + authorEmail);
        setTimeout(() => {
          copyEmailBtn.textContent = '📋 Скопировать email';
        }, 2000);
      });
    }

    // Кнопка: Скопировать текст
    const copyTextBtn = document.getElementById('feedback-copy-text-btn');
    if (copyTextBtn) {
      copyTextBtn.addEventListener('click', () => {
        const { body, msg } = getFormattedMessage();
        if (!msg) {
          this.showToast(tr('feedback_toast_empty_msg') || '⚠️ Пожалуйста, напишите текст вашего сообщения или вопроса!');
          return;
        }
        copyToClipboard(body);
        copyTextBtn.textContent = '✓ Текст скопирован!';
        this.showToast(tr('feedback_toast_copied') || '✓ Текст обращения скопирован в буфер обмена!');
        setTimeout(() => {
          copyTextBtn.textContent = tr('feedback_btn_copy') || '📋 Скопировать текст';
        }, 2000);
      });
    }

    // Кнопка: Открыть в Gmail (Web)
    const openGmailBtn = document.getElementById('feedback-open-gmail-btn');
    if (openGmailBtn) {
      openGmailBtn.addEventListener('click', () => {
        const { subject, body, msg } = getFormattedMessage();
        if (!msg) {
          this.showToast(tr('feedback_toast_empty_msg') || '⚠️ Пожалуйста, напишите текст вашего сообщения или вопроса!');
          return;
        }
        copyToClipboard(body);
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(authorEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailUrl, '_blank');
      });
    }

    // Основная кнопка: Отправить автору (mailto:)
    const sendPrimaryBtn = document.getElementById('feedback-send-primary-btn');
    if (sendPrimaryBtn) {
      sendPrimaryBtn.addEventListener('click', () => {
        const { subject, body, msg } = getFormattedMessage();
        if (!msg) {
          this.showToast(tr('feedback_toast_empty_msg') || '⚠️ Пожалуйста, напишите текст вашего сообщения или вопроса!');
          return;
        }
        copyToClipboard(body);
        this.showToast(tr('feedback_toast_sent') || '✓ Текст скопирован! Запускаю почтовую программу для отправки...');

        const mailtoUrl = `mailto:${encodeURIComponent(authorEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
      });
    }
  }

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
document.addEventListener('DOMContentLoaded', () => {
  window.app = new GardenApp();
});
