/**
 * Модуль создания и редактирования грядок:
 * - openAddBedModal: Модальное окно параметров грядки (размеры, ориентация, форма, секции)
 */

(function() {
  if (typeof GardenApp === 'undefined') {
    console.error('GardenApp is not defined. Ensure js/app.js is loaded first.');
    return;
  }

  Object.assign(GardenApp.prototype, {
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
  });
})();
