/**
 * Интерактивная полноэкранная карта огорода
 * - Растянута на весь монитор без искусственных рамок
 * - Бесконечное панорамирование (Pan) и зум (Zoom)
 * - Поддержка теплиц с 2 или 3 отдельными внутренними грядками
 * - Поддержка вертикальной и горизонтальной ориентации
 */

class GardenMap {
  constructor(containerId, storage, onBedSelect, onEmptyAction = null) {
    this.container = document.getElementById(containerId);
    this.storage = storage;
    this.onBedSelect = onBedSelect;
    this.onEmptyAction = onEmptyAction;

    this.meterPixels = 80; // Базовый масштаб (80px на 1 метр, увеличен еще на 30% для максимального удобства и простора)
    this.zoom = 1.0;
    this.panX = 80;
    this.panY = 80;
    this.gridSnap = 0.25;

    this.selectedBedId = null;
    this.selectedSectionId = null;
    this.filterMode = 'all';
    this.showPreviousYearOverlay = false;

    this.dragBedState = {
      isDragging: false,
      bedId: null,
      startX: 0,
      startY: 0,
      initialBedX: 0,
      initialBedY: 0,
      hasMoved: false
    };

    this.panState = {
      isPanning: false,
      startX: 0,
      startY: 0,
      initialPanX: 0,
      initialPanY: 0
    };

    this.init();
  }

  init() {
    this.renderContainerStructure();
    this.render();
    this.setupGlobalEvents();

    // Центровка на весь экран
    setTimeout(() => {
      this.fitPlotToView();
    }, 80);
  }

  renderContainerStructure() {
    if (!this.container) return;

    const tr = (k) => (typeof window !== 'undefined' && window.t ? window.t(k) : null);

    this.container.innerHTML = `
      <!-- Плавающий пульт масштабирования -->
      <div class="map-controls-floating">
        <button class="nav-control-btn" id="map-zoom-in-btn" data-i18n-title="zoom_in_title" title="${tr('zoom_in_title') || 'Приблизить (+)'}">➕</button>
        <span class="nav-zoom-indicator" id="map-zoom-indicator">100%</span>
        <button class="nav-control-btn" id="map-zoom-out-btn" data-i18n-title="zoom_out_title" title="${tr('zoom_out_title') || 'Отдалить (-)'}">➖</button>
        <div class="nav-divider"></div>
        <button class="nav-control-btn" id="map-fit-btn" data-i18n="btn_fit_all" data-i18n-title="btn_fit_all_title" title="${tr('btn_fit_all_title') || 'Вписать все грядки в экран монитора'}">${tr('btn_fit_all') || '⛶ Вписать всё'}</button>
        <button class="nav-control-btn" id="map-center-btn" data-i18n="btn_center" data-i18n-title="btn_center_title" title="${tr('btn_center_title') || 'Центрировать'}">${tr('btn_center') || '📍 Центр'}</button>
        <div class="nav-divider"></div>
        <button class="nav-control-btn" id="map-arrange-btn" data-i18n="btn_arrange" data-i18n-title="btn_arrange_title" title="${tr('btn_arrange_title') || 'Разровнять грядки и выстроить ровные проходы без наложений'}">${tr('btn_arrange') || '📏 Расставить дорожки'}</button>
      </div>

      <!-- Вьюпорт на весь экран -->
      <div class="garden-pan-viewport" id="garden-pan-viewport">
        <div class="garden-transform-plane" id="garden-transform-plane">
          <!-- Слой координатной сетки -->
          <div class="infinite-grid-layer" id="infinite-grid-layer"></div>

          <!-- Слой всех грядок и теплиц -->
          <div class="beds-layer" id="beds-layer"></div>
        </div>

        <!-- Оверлей чистого плана / Пустой огород (Onboarding Hero) -->
        <div class="empty-garden-overlay" id="empty-garden-overlay" style="display: none;"></div>
      </div>
    `;

    this.viewportEl = document.getElementById('garden-pan-viewport');
    this.planeEl = document.getElementById('garden-transform-plane');
    this.bedsLayerEl = document.getElementById('beds-layer');
    this.emptyOverlayEl = document.getElementById('empty-garden-overlay');
    this.zoomIndicatorEl = document.getElementById('map-zoom-indicator');

    document.getElementById('map-zoom-in-btn').addEventListener('click', () => this.zoomBy(1.2, null, null, true));
    document.getElementById('map-zoom-out-btn').addEventListener('click', () => this.zoomBy(0.83, null, null, true));

    document.getElementById('map-fit-btn').addEventListener('click', () => {
      this.fitPlotToView(true);
      if (window.app) {
        const trMsg = window.t ? window.t('toast_fit_all', { percent: Math.round(this.zoom * 100) }) : null;
        window.app.showToast(trMsg || `⛶ Все грядки вписаны в экран (масштаб ${Math.round(this.zoom * 100)}%)`);
      }
    });

    document.getElementById('map-center-btn').addEventListener('click', () => {
      this.centerPlotInView(true);
      if (window.app) {
        const trMsg = window.t ? window.t('toast_center_plot') : null;
        window.app.showToast(trMsg || '📍 План огорода отцентрирован по центру экрана');
      }
    });

    document.getElementById('map-arrange-btn')?.addEventListener('click', () => {
      this.storage.resolveOverlaps(this.storage.data.beds, true);
      this.render();
      this.fitPlotToView(true);
      if (window.app) {
        window.app.showToast(window.t ? window.t('toast_arranged') : '📏 Дорожки между грядками аккуратно выровнены!');
      }
    });

    this.updateControlsLanguage();
  }

  updateControlsLanguage() {
    const tr = (k) => (typeof window !== 'undefined' && window.t ? window.t(k) : null);
    const fitBtn = document.getElementById('map-fit-btn');
    const centerBtn = document.getElementById('map-center-btn');
    const arrangeBtn = document.getElementById('map-arrange-btn');
    const zoomInBtn = document.getElementById('map-zoom-in-btn');
    const zoomOutBtn = document.getElementById('map-zoom-out-btn');

    if (fitBtn) {
      fitBtn.textContent = tr('btn_fit_all') || '⛶ Вписать всё';
      fitBtn.title = tr('btn_fit_all_title') || 'Вписать все грядки в экран монитора';
    }
    if (centerBtn) {
      centerBtn.textContent = tr('btn_center') || '📍 Центр';
      centerBtn.title = tr('btn_center_title') || 'Центрировать';
    }
    if (arrangeBtn) {
      arrangeBtn.textContent = tr('btn_arrange') || '📏 Расставить дорожки';
      arrangeBtn.title = tr('btn_arrange_title') || 'Разровнять грядки и выстроить ровные проходы без наложений';
    }
    if (zoomInBtn) zoomInBtn.title = tr('zoom_in_title') || 'Приблизить (+)';
    if (zoomOutBtn) zoomOutBtn.title = tr('zoom_out_title') || 'Отдалить (-)';
  }

  setupGlobalEvents() {
    if (!this.viewportEl) return;

    window.addEventListener('language-changed', () => {
      this.updateControlsLanguage();
    });

    this.viewportEl.addEventListener('mousedown', (e) => this.handleViewportMouseDown(e));
    window.addEventListener('mousemove', (e) => this.handleGlobalMouseMove(e));
    window.addEventListener('mouseup', (e) => this.handleGlobalMouseUp(e));

    this.viewportEl.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });

    this.viewportEl.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    window.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    window.addEventListener('touchend', (e) => this.handleTouchEnd(e));

    window.addEventListener('resize', () => {
      this.centerPlotInView();
    });
  }

  setFilter(filterMode) {
    this.filterMode = filterMode;
    this.render();
  }

  togglePreviousYearOverlay() {
    this.showPreviousYearOverlay = !this.showPreviousYearOverlay;
    this.render();
    return this.showPreviousYearOverlay;
  }

  updateTransform(smooth = false) {
    if (!this.planeEl) return;
    if (smooth) {
      this.planeEl.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      clearTimeout(this._smoothTimer);
      this._smoothTimer = setTimeout(() => {
        if (this.planeEl) this.planeEl.style.transition = '';
      }, 420);
    }
    this.planeEl.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    if (this.zoomIndicatorEl) {
      this.zoomIndicatorEl.textContent = `${Math.round(this.zoom * 100)}%`;
    }
  }

  zoomBy(factor, clientCenterX = null, clientCenterY = null, smooth = false) {
    const oldZoom = this.zoom;
    const newZoom = Math.max(0.3, Math.min(2.5, oldZoom * factor));
    if (oldZoom === newZoom) return;

    if (clientCenterX !== null && clientCenterY !== null && this.viewportEl) {
      const rect = this.viewportEl.getBoundingClientRect();
      const mouseX = clientCenterX - rect.left;
      const mouseY = clientCenterY - rect.top;

      this.panX = mouseX - (mouseX - this.panX) * (newZoom / oldZoom);
      this.panY = mouseY - (mouseY - this.panY) * (newZoom / oldZoom);
    } else if (this.viewportEl) {
      const rect = this.viewportEl.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      this.panX = cx - (cx - this.panX) * (newZoom / oldZoom);
      this.panY = cy - (cy - this.panY) * (newZoom / oldZoom);
    }

    this.zoom = newZoom;
    this.updateTransform(smooth);
  }

  centerPlotInView(smooth = false) {
    if (!this.viewportEl) return;
    const beds = this.storage.getBeds();
    if (!beds.length) {
      this.panX = 80;
      this.panY = 80;
      this.updateTransform(smooth);
      return;
    }

    const bbox = this.calculateBedsBoundingBox(beds);
    const plotPxW = bbox.width * this.meterPixels * this.zoom;
    const plotPxH = bbox.height * this.meterPixels * this.zoom;

    const vRect = this.viewportEl.getBoundingClientRect();
    const vw = (vRect.width && vRect.width > 200) ? vRect.width : window.innerWidth;
    const vh = (vRect.height && vRect.height > 200) ? vRect.height : (window.innerHeight - 150);

    // Центрирование по горизонтали (X):
    // При ширине меньше экрана центрируем ровно посередине.
    // Если огород шире экрана, центрируем середину, но не даем левому краю уйти дальше левого отступа
    const centeredPanX = Math.round((vw - plotPxW) / 2 - (bbox.minX * this.meterPixels * this.zoom));
    const leftMarginPanX = Math.round(50 - (bbox.minX * this.meterPixels * this.zoom));
    this.panX = (plotPxW <= vw) ? centeredPanX : Math.max(leftMarginPanX, centeredPanX);

    // Центрирование по вертикали (Y):
    // У каждой грядки сверху есть закладка-хвостик высотой 28px (top: -26px),
    // поэтому минимальный комфортный отступ сверху от края карты — 40px.
    const topTabPaddingPx = 40;
    const centeredPanY = Math.round((vh - plotPxH) / 2 - (bbox.minY * this.meterPixels * this.zoom));
    const topAlignedPanY = Math.round(topTabPaddingPx - (bbox.minY * this.meterPixels * this.zoom));

    // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ:
    // Если огород по высоте помещается в экран, centeredPanY > topAlignedPanY и огород центрируется.
    // Если зум увеличен (например 87%-120%) и огород выше экрана (plotPxH > vh),
    // centeredPanY становится отрицательным, из-за чего верхние грядки (1-3 ряды)
    // улетали высоко вверх за экран, и пользователю показывался «самый низ»!
    // С помощью Math.max верхний край огорода ВСЕГДА начинается с отступа 40px,
    // и пользователь сразу видит свои первые грядки, теплицы и начало огорода!
    this.panY = Math.max(topAlignedPanY, centeredPanY);

    this.updateTransform(smooth);
  }

  fitPlotToView(smooth = false) {
    if (!this.viewportEl) return;
    const beds = this.storage.getBeds();
    if (!beds.length) {
      this.zoom = 1.0;
      this.panX = 80;
      this.panY = 80;
      this.updateTransform(smooth);
      return;
    }

    const bbox = this.calculateBedsBoundingBox(beds);
    const vRect = this.viewportEl.getBoundingClientRect();
    const vw = (vRect.width && vRect.width > 200) ? vRect.width : (window.innerWidth - 60);
    const vh = (vRect.height && vRect.height > 200) ? vRect.height : (window.innerHeight - 160);

    const availW = Math.max(300, vw - 120);
    const availH = Math.max(300, vh - 120);

    const targetPxW = Math.max(1, bbox.width * this.meterPixels);
    const targetPxH = Math.max(1, bbox.height * this.meterPixels);

    const factor = Math.min(availW / targetPxW, availH / targetPxH);
    this.zoom = parseFloat(Math.max(0.35, Math.min(1.25, factor)).toFixed(2));

    this.centerPlotInView(smooth);
  }

  calculateBedsBoundingBox(beds) {
    if (!beds || !beds.length) {
      return { minX: 0, minY: 0, maxX: 20, maxY: 15, width: 20, height: 15 };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    beds.forEach(b => {
      const isGh = b.type === 'greenhouse';
      const hasSections = (b.sections && b.sections.length > 1) || (isGh && b.sections && b.sections.length > 0);
      let effectiveW = b.width || 4.0;
      let effectiveH = b.height || 1.2;

      if (hasSections) {
        const secCount = (b.sections && b.sections.length) || (isGh ? 3 : 2);
        const isGhHorizontal = b.orientation !== 'vertical' && (b.width || 4) >= (b.height || 1.2);
        const isInternalHorizontal = b.sectionsLayout === 'transverse' ? !isGhHorizontal : isGhHorizontal;
        const minW = isInternalHorizontal ? (isGh ? 380 : 320) : (isGh ? 330 : 280);
        const minH = isInternalHorizontal 
          ? (isGh ? 300 : Math.max(124, 46 * secCount + 36)) 
          : (isGh ? 350 : 250);
        effectiveW = Math.max(effectiveW, minW / this.meterPixels);
        effectiveH = Math.max(effectiveH, minH / this.meterPixels);
      } else {
        effectiveW = Math.max(effectiveW, 125 / this.meterPixels);
        effectiveH = Math.max(effectiveH, 70 / this.meterPixels);
      }

      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + effectiveW);
      maxY = Math.max(maxY, b.y + effectiveH);
    });

    if (minX === Infinity) {
      return { minX: 0, minY: 0, maxX: 20, maxY: 15, width: 20, height: 15 };
    }

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(0.5, maxX - minX),
      height: Math.max(0.5, maxY - minY)
    };
  }

  render() {
    if (!this.bedsLayerEl) return;

    this.updateControlsLanguage();

    const data = this.storage.getData();
    const activeYear = this.storage.getActiveYear();
    const prevYear = activeYear - 1;
    const beds = data.beds || [];

    // Показываем привлекательный оверлей онбординга, если грядок нет
    if (this.emptyOverlayEl) {
      if (beds.length === 0) {
        this.emptyOverlayEl.style.display = 'flex';
        this.emptyOverlayEl.innerHTML = this.renderEmptyHeroHtml();
        this.attachEmptyStateListeners();
      } else {
        this.emptyOverlayEl.style.display = 'none';
        this.emptyOverlayEl.innerHTML = '';
      }
    }

    this.bedsLayerEl.innerHTML = beds.length ? this.renderBedsHtml(beds, activeYear, prevYear) : '';
    this.attachBedEventListeners();
    this.updateTransform();
  }

  renderEmptyHeroHtml() {
    const tr = (k) => (typeof window !== 'undefined' && window.t ? window.t(k) : null);
    return `
      <div class="empty-garden-card">
        <div class="empty-icon-ring">🌱</div>
        <h2 class="empty-title">${tr('empty_hero_title') || 'Ваш участок готов к планированию!'}</h2>
        <p class="empty-desc">
          ${tr('empty_hero_desc') || 'Все демонстрационные грядки убраны. Теперь вы можете расставить свои грядки, теплицы и зоны посадок именно так, как они расположены на вашей даче:'}
        </p>

        <div class="empty-actions-grid">
          <button type="button" class="empty-btn-hero btn-add-bed-trigger">
            <span class="btn-hero-icon">🪵</span>
            <div class="btn-hero-content">
              <strong>${tr('empty_btn_bed_title') || 'Добавить грядку'}</strong>
              <span>${tr('empty_btn_bed_desc') || 'Приподнятую, грунтовую или клубничник'}</span>
            </div>
          </button>

          <button type="button" class="empty-btn-hero btn-add-greenhouse-trigger">
            <span class="btn-hero-icon">🏡</span>
            <div class="btn-hero-content">
              <strong>${tr('empty_btn_gh_title') || 'Добавить теплицу'}</strong>
              <span>${tr('empty_btn_gh_desc') || 'С 2 или 3 отдельными грядками'}</span>
            </div>
          </button>

          <button type="button" class="empty-btn-hero btn-add-row-trigger">
            <span class="btn-hero-icon">✨</span>
            <div class="btn-hero-content">
              <strong>${tr('empty_btn_row_title') || 'Создать ряд грядок'}</strong>
              <span>${tr('empty_btn_row_desc') || 'Быстро разместить 3–8 грядок с дорожками'}</span>
            </div>
          </button>

          <button type="button" class="empty-btn-hero btn-restore-demo-trigger">
            <span class="btn-hero-icon">🔄</span>
            <div class="btn-hero-content">
              <strong>${tr('empty_btn_demo_title') || 'Вернуть демо-образец'}</strong>
              <span>${tr('empty_btn_demo_desc') || 'Если хотите снова подсмотреть пример'}</span>
            </div>
          </button>
        </div>

        <div class="empty-tips-banner">
          ${tr('empty_tip') || '💡 <strong>Совет:</strong> Любую созданную грядку можно свободно перетаскивать мышью по участку, поворачивать кнопкой ↻ на 90°, дублировать кнопкой ❐ и мгновенно удалять кнопкой 🗑️.'}
        </div>
      </div>
    `;
  }

  attachEmptyStateListeners() {
    if (!this.emptyOverlayEl) return;

    const addBedTrigger = this.emptyOverlayEl.querySelector('.btn-add-bed-trigger');
    if (addBedTrigger) {
      addBedTrigger.addEventListener('click', () => this.onEmptyAction?.('add-bed'));
    }

    const addGhTrigger = this.emptyOverlayEl.querySelector('.btn-add-greenhouse-trigger');
    if (addGhTrigger) {
      addGhTrigger.addEventListener('click', () => this.onEmptyAction?.('add-greenhouse'));
    }

    const addRowTrigger = this.emptyOverlayEl.querySelector('.btn-add-row-trigger');
    if (addRowTrigger) {
      addRowTrigger.addEventListener('click', () => this.onEmptyAction?.('add-row'));
    }

    const restoreDemoTrigger = this.emptyOverlayEl.querySelector('.btn-restore-demo-trigger');
    if (restoreDemoTrigger) {
      restoreDemoTrigger.addEventListener('click', () => this.onEmptyAction?.('restore-demo'));
    }
  }

  renderBedsHtml(beds, activeYear, prevYear) {

    return beds.map(bed => {
      // Проверяем: грядка любого типа с несколькими рядками/секциями или цельная
      const hasMultipleSections = bed.sections && bed.sections.length > 1;
      if (hasMultipleSections || (bed.type === 'greenhouse' && bed.sections && bed.sections.length > 0)) {
        return this.renderMultiSectionBedHtml(bed, activeYear, prevYear);
      } else {
        return this.renderSingleBedHtml(bed, activeYear, prevYear);
      }
    }).join('');
  }

  /**
   * Универсальная отрисовка грядки любого типа (приподнятая, открытый грунт, теплая, теплица)
   * с 2 или 3 отдельными внутренними рядками/полосами!
   */
  renderMultiSectionBedHtml(bed, activeYear, prevYear) {
    const isSelected = bed.id === this.selectedBedId;
    const leftPx = bed.x * this.meterPixels;
    const topPx = bed.y * this.meterPixels;

    const isGh = bed.type === 'greenhouse';
    const isGhHorizontal = bed.orientation !== 'vertical' && bed.width >= bed.height;

    // Расположение внутренних рядков: вдоль или поперёк
    let isInternalHorizontal = isGhHorizontal;
    if (bed.sectionsLayout === 'transverse') {
      isInternalHorizontal = !isGhHorizontal;
    }

    const sections = bed.sections || [];
    const secCount = sections.length || (isGh ? 3 : 2);

    // Комфортные минимальные габариты для читаемости (+30% ещё раз: просторные грядки)
    const minW = isInternalHorizontal ? (isGh ? 380 : 320) : (isGh ? 330 : 280);
    const minH = isInternalHorizontal 
      ? (isGh ? 300 : Math.max(124, 46 * secCount + 36)) 
      : (isGh ? 350 : 250);

    const widthPx = Math.max(minW, bed.width * this.meterPixels);
    const heightPx = Math.max(minH, bed.height * this.meterPixels);

    const typeIcons = {
      greenhouse: '🏡',
      raised: '🪵',
      ground: '🌱',
      warm: '🔥',
      berry: '🍓'
    };
    const typeIcon = typeIcons[bed.type] || '🪵';
    const currentLang = (typeof window !== 'undefined' && window.i18n) ? window.i18n.getLanguage() : 'ru';
    let sectionWord = isGh ? 'грядки' : 'рядка';
    if (currentLang === 'et') {
      sectionWord = isGh ? (secCount === 1 ? 'peenar' : 'peenart') : (secCount === 1 ? 'rida' : 'rida');
    } else if (currentLang === 'lv') {
      sectionWord = isGh ? (secCount === 1 ? 'dobe' : 'dobes') : (secCount === 1 ? 'rinda' : 'rindas');
    } else if (currentLang === 'lt') {
      sectionWord = isGh ? (secCount === 1 ? 'lysvė' : 'lysvės') : (secCount === 1 ? 'eilutė' : 'eilutės');
    }

    const tr = (k, p) => (typeof window !== 'undefined' && window.t ? window.t(k, p) : null);
    const bedDispName = (typeof window !== 'undefined' && window.i18n) ? window.i18n.getBedName(bed) : bed.name;
    const toggleLayoutTitle = tr('tool_toggle_layout') || (
      currentLang === 'et' ? 'Vaheta ridade suunda: piki (⇅) või risti (⇄)' :
      currentLang === 'lv' ? 'Pārslēgt rindu virzienu: gareniski (⇅) vai šķērsām (⇄)' :
      currentLang === 'lt' ? 'Perjungti eilučių kryptį: išilgai (⇅) arba skersai (⇄)' :
      'Переключить рядки: вдоль (⇅) или поперёк (⇄)'
    );

    const bedClass = isGh 
      ? 'bed-type-greenhouse greenhouse-structure' 
      : `bed-type-${bed.type || 'raised'} bed-multi-section`;

    return `
      <div class="bed-item ${bedClass} ${isInternalHorizontal ? 'gh-layout-rows' : 'gh-layout-cols'} ${isSelected ? 'selected' : ''}"
           id="bed-el-${bed.id}"
           data-bed-id="${bed.id}"
           style="
             left: ${leftPx}px;
             top: ${topPx}px;
             width: ${widthPx}px;
             height: ${heightPx}px;
           "
           title="${escapeHtml(bedDispName)}: ${secCount} ${sectionWord}">
        
        <!-- Excel-закладка («хвостик») сверху для названия и перемещения грядки -->
        <div class="bed-tab-handle" data-bed-id="${bed.id}" title="${escapeHtml(tr('drag_handle_title') || 'Зажмите и тяните за хвостик для перемещения грядки')}">
          <span class="bed-tab-icon">${typeIcon}</span>
          <span class="bed-tab-title">${escapeHtml(bedDispName)}</span>
          <span class="bed-tab-grip">⋮⋮</span>
        </div>

        <!-- Конёк крыши для теплиц -->
        ${isGh ? `<div class="greenhouse-roof-ridge ${isGhHorizontal ? 'ridge-h' : 'ridge-v'}"></div>` : ''}
        
        <!-- Полоса инструментов внутри грядки (без названия) -->
        <div class="bed-tools-bar">
          <div class="bed-tools-group">
            <button type="button" class="gh-tool-btn rotate-btn" data-bed-id="${bed.id}" title="${escapeHtml(tr('tool_rotate') || 'Повернуть на 90°')}">↻</button>
            <button type="button" class="gh-tool-btn toggle-layout-btn" data-bed-id="${bed.id}" title="${escapeHtml(toggleLayoutTitle)}">${isInternalHorizontal ? '⇅' : '⇄'}</button>
            <button type="button" class="gh-tool-btn clone-btn" data-bed-id="${bed.id}" title="${escapeHtml(tr('tool_clone') || 'Дублировать грядку')}">❐</button>
            <button type="button" class="gh-tool-btn delete-btn" data-bed-id="${bed.id}" title="${escapeHtml(tr('tool_delete') || 'Удалить с плана')}">🗑️</button>
          </div>
          <span class="bed-sec-indicator">${secCount} ${sectionWord}</span>
        </div>

        <!-- Внутренние рядки / секции с разделителями -->
        <div class="greenhouse-interior ${isInternalHorizontal ? 'interior-h' : 'interior-v'}">
          ${sections.map((sec, secIdx) => {
            const currentPlanting = sec.history?.[activeYear] || null;
            const prevPlanting = sec.history?.[prevYear] || null;
            const currentCrop = currentPlanting?.cropId ? getCropById(currentPlanting.cropId) : null;
            const prevCrop = prevPlanting?.cropId ? getCropById(prevPlanting.cropId) : null;
            const currentCropName = currentCrop ? (typeof getCropName === 'function' ? getCropName(currentCrop, currentLang) : currentCrop.name) : '';
            const prevCropName = prevCrop ? (typeof getCropName === 'function' ? getCropName(prevCrop, currentLang) : prevCrop.name) : '';
            const plantText = tr('plant_cta') || (currentLang === 'et' ? 'Istuta' : currentLang === 'lv' ? 'Stādīt' : currentLang === 'lt' ? 'Pasodinti' : 'Посадить');
            const freeText = tr('free_slot') || (currentLang === 'et' ? 'Vaba istutamiseks' : currentLang === 'lv' ? 'Brīvs stādīšanai' : currentLang === 'lt' ? 'Laisva sodinimui' : 'Свободно для посадки');
            const grownInText = tr('grown_in_year', { year: prevYear }) || `В ${prevYear} г. росло:`;
            const emptyLastYearText = tr('empty_last_year') || (
              currentLang === 'et' ? 'oli tühi' :
              currentLang === 'lv' ? 'bija tukša' :
              currentLang === 'lt' ? 'buvo tuščia' :
              'грядка пустовала'
            );

            const secHistory = this.storage.getBedHistoryArray(bed.id, activeYear, sec.id);
            const rotationEval = currentPlanting?.cropId
              ? evaluateCropRotation(currentPlanting.cropId, secHistory)
              : null;

            const isSectionSelected = isSelected && this.selectedSectionId === sec.id;
            const cropSvg = currentCrop ? getCropSvg(currentCrop.id) : '';
            
            const secLocName = (typeof window !== 'undefined' && window.i18n) ? window.i18n.getBedName(sec) : sec.name;
            let secShortName = secLocName;
            const parenMatch = secLocName ? secLocName.match(/\((.*?)\)/) : null;
            if (parenMatch) {
              secShortName = parenMatch[1].trim();
            }
            if (/лев|vasak|kreis|kair/i.test(secShortName)) {
              secShortName = currentLang === 'et' ? 'Vasak' : currentLang === 'lv' ? 'Kreisā' : currentLang === 'lt' ? 'Kairė' : 'Левый';
            } else if (/прав|parem|lab|dešin/i.test(secShortName)) {
              secShortName = currentLang === 'et' ? 'Parem' : currentLang === 'lv' ? 'Labā' : currentLang === 'lt' ? 'Dešinė' : 'Правый';
            } else if (/центр|kesk|centr/i.test(secShortName)) {
              secShortName = currentLang === 'et' ? 'Kesk' : currentLang === 'lv' ? 'Centrs' : currentLang === 'lt' ? 'Centras' : 'Центр';
            } else {
              secShortName = (secShortName || '')
                .replace(/грядка|рядок|полоса|peenar|rida|dobe|rinda|lysvė|eilutė/gi, '')
                .trim();
            }
            if (!secShortName) secShortName = `${secIdx + 1}`;

            if (isInternalHorizontal) {
              // Горизонтальные полосы/рядки
              return `
                <div class="gh-internal-bed gh-bed-horizontal ${isSectionSelected ? 'gh-sec-selected' : ''}"
                     data-bed-id="${bed.id}"
                     data-section-id="${sec.id}"
                     title="${escapeHtml(secLocName)}: ${currentCrop ? escapeHtml(currentCropName) : escapeHtml(freeText)}">
                  
                  <div class="gh-internal-bed-row">
                    <div class="gh-strip-left">
                      <span class="gh-bed-num-badge">${secIdx + 1}</span>
                      <span class="gh-bed-pill" title="${escapeHtml(secLocName)}">${escapeHtml(secShortName || `${secIdx + 1}`)}</span>
                      ${currentCrop ? `
                        <div class="gh-crop-icon">${cropSvg}</div>
                        <strong class="gh-crop-name">${escapeHtml(currentCropName)}</strong>
                        ${currentPlanting.variety ? `<span class="gh-crop-var">(${escapeHtml(currentPlanting.variety)})</span>` : ''}
                      ` : `
                        <div class="gh-h-cta-btn" title="${escapeHtml(freeText)}">
                          <span class="gh-cta-plus">➕</span>
                          <span class="gh-cta-text">${escapeHtml(plantText)}</span>
                        </div>
                      `}
                    </div>
                    <div class="gh-strip-right">
                      ${this.getRotationBadge(rotationEval, bed.width <= 3.5)}
                      ${prevCrop ? `
                        <span class="gh-prev-year-tag ${this.showPreviousYearOverlay ? 'highlight-prev' : ''}" title="${escapeHtml(grownInText)} ${escapeHtml(prevCropName)}">
                          <span class="prev-year-label">${prevYear}:</span>
                          <span class="prev-crop-svg">${getCropSvg(prevCrop.id)}</span>
                          ${this.showPreviousYearOverlay ? `<strong class="prev-crop-title-gh">${escapeHtml(prevCropName)}</strong>` : ''}
                        </span>
                      ` : (this.showPreviousYearOverlay ? `
                        <span class="gh-prev-year-tag pred-empty-tag" title="${escapeHtml(emptyLastYearText)}">
                          <span class="prev-year-label">${prevYear}:</span>
                          <span class="pred-empty-label">${escapeHtml(emptyLastYearText)}</span>
                        </span>
                      ` : '')}
                    </div>
                  </div>
                </div>
              `;
            } else {
              // Вертикальные рядки-колонки
              return `
                <div class="gh-internal-bed gh-internal-bed-vertical ${isSectionSelected ? 'gh-sec-selected' : ''}"
                     data-bed-id="${bed.id}"
                     data-section-id="${sec.id}"
                     title="${escapeHtml(secLocName)}: ${currentCrop ? escapeHtml(currentCropName) : escapeHtml(freeText)}">
                  
                  <!-- Верх: Номер и название рядка -->
                  <div class="gh-v-top">
                    <div class="gh-v-badge-row">
                      <span class="gh-bed-num-badge">${secIdx + 1}</span>
                      ${rotationEval ? `
                        <span class="gh-v-rot-badge rot-${rotationEval.status}" title="${escapeHtml(rotationEval.comment || rotationEval.title)}">
                          ${rotationEval.status === 'optimal' ? '✓' : rotationEval.status === 'warning' ? '!' : '✕'}
                        </span>
                      ` : ''}
                    </div>
                    <span class="gh-v-name-pill" title="${escapeHtml(secLocName)}">${escapeHtml(secShortName || `${secIdx + 1}`)}</span>
                  </div>

                  <!-- Центр: Кнопка посадки или овощ -->
                  <div class="gh-v-body">
                    ${currentCrop ? `
                      <div class="gh-v-crop-card">
                        <div class="gh-v-crop-avatar" title="${escapeHtml(currentCropName)}">${cropSvg}</div>
                        <span class="gh-v-crop-label" title="${escapeHtml(currentCropName)}">${escapeHtml(currentCropName)}</span>
                        ${currentPlanting.variety ? `<span class="gh-v-variety-label" title="${escapeHtml(currentPlanting.variety)}">${escapeHtml(currentPlanting.variety)}</span>` : ''}
                      </div>
                    ` : `
                      <div class="gh-v-cta-btn" title="${escapeHtml(freeText)}">
                        <div class="gh-v-plus-circle">➕</div>
                        <span class="gh-v-cta-label">${escapeHtml(plantText)}</span>
                      </div>
                    `}
                  </div>

                  <!-- Низ: Предшественник -->
                  <div class="gh-v-bottom ${this.showPreviousYearOverlay ? 'highlight-prev' : ''}">
                    ${prevCrop ? `
                      <div class="gh-v-prev-wrap" title="${escapeHtml(grownInText)} ${escapeHtml(prevCropName)}">
                        <span class="gh-v-prev-year">'${String(prevYear).slice(-2)}:</span>
                        <span class="gh-v-prev-svg">${getCropSvg(prevCrop.id)}</span>
                      </div>
                    ` : `
                      <span class="gh-v-empty-dot" title="${escapeHtml(emptyLastYearText)}">—</span>
                    `}
                  </div>
                </div>
              `;
            }
          }).join(isInternalHorizontal ? `<div class="${isGh ? 'gh-pathway-h' : 'bed-strip-divider-h'}"></div>` : `<div class="${isGh ? 'gh-pathway-v' : 'bed-strip-divider-v'}"></div>`)}
        </div>
      </div>
    `;
  }

  renderGreenhouseHtml(bed, activeYear, prevYear) {
    return this.renderMultiSectionBedHtml(bed, activeYear, prevYear);
  }

  /**
   * Отрисовка обычной грядки (деревянная, открытый грунт, клубничник и т.д.)
   */
  renderSingleBedHtml(bed, activeYear, prevYear) {
    const history = this.storage.getBedHistoryArray(bed.id, activeYear);
    const currentPlanting = bed.history?.[activeYear] || null;
    const prevPlanting = bed.history?.[prevYear] || null;
    const currentCrop = currentPlanting?.cropId ? getCropById(currentPlanting.cropId) : null;
    const prevCrop = prevPlanting?.cropId ? getCropById(prevPlanting.cropId) : null;

    const currentLang = (typeof window !== 'undefined' && window.i18n) ? window.i18n.getLanguage() : 'ru';
    const tr = (k, p) => (typeof window !== 'undefined' && window.t ? window.t(k, p) : null);
    const bedDispName = (typeof window !== 'undefined' && window.i18n) ? window.i18n.getBedName(bed) : bed.name;
    const currentCropName = currentCrop ? (typeof getCropName === 'function' ? getCropName(currentCrop, currentLang) : currentCrop.name) : '';
    const prevCropName = prevCrop ? (typeof getCropName === 'function' ? getCropName(prevCrop, currentLang) : prevCrop.name) : '';
    const unplantedText = tr('unplanted') || (currentLang === 'et' ? 'Istutamata' : currentLang === 'lv' ? 'Neapstādīta' : currentLang === 'lt' ? 'Neapsodinta' : 'Не засеяно');
    const grownInText = tr('grown_in_year', { year: prevYear }) || `В ${prevYear} г. росло:`;

    const rotationEval = currentPlanting?.cropId
      ? evaluateCropRotation(currentPlanting.cropId, history)
      : null;

    if (this.filterMode === 'danger' && (!rotationEval || rotationEval.status !== 'danger')) {
      return '';
    }
    if (this.filterMode === 'empty' && currentCrop) {
      return '';
    }

    const isSelected = bed.id === this.selectedBedId;
    const leftPx = bed.x * this.meterPixels;
    const topPx = bed.y * this.meterPixels;
    const widthPx = Math.max(125, bed.width * this.meterPixels);
    const heightPx = Math.max(98, bed.height * this.meterPixels);

    const statusBadge = this.getRotationBadge(rotationEval);
    const bedTypeClass = `bed-type-${bed.type || 'ground'}`;
    const familyColor = currentCrop ? (getFamilyById(currentCrop.family)?.color || '#2e7d32') : '#94a3b8';
    const isVertical = bed.orientation === 'vertical' || bed.height > bed.width;

    const cropSvgIcon = currentCrop ? getCropSvg(currentCrop.id) : '';
    const prevCropSvgIcon = prevCrop ? getCropSvg(prevCrop.id) : '';
    const prevFamily = prevCrop ? getFamilyById(prevCrop.family) : null;
    const prevFamilyName = prevFamily ? (typeof getFamilyName === 'function' ? getFamilyName(prevFamily, currentLang) : (prevFamily.nameRu || prevFamily.name)) : '';
    const emptyLastYearText = tr('empty_last_year') || (
      currentLang === 'et' ? 'oli tühi' :
      currentLang === 'lv' ? 'bija tukša' :
      currentLang === 'lt' ? 'buvo tuščia' :
      'грядка пустовала'
    );

    const typeIcons = {
      greenhouse: '🏡',
      raised: '🪵',
      ground: '🌱',
      warm: '🔥',
      berry: '🍓'
    };
    const typeIcon = typeIcons[bed.type] || '🌱';

    return `
      <div class="bed-item ${bedTypeClass} ${isVertical ? 'orient-vertical' : 'orient-horizontal'} ${isSelected ? 'selected' : ''}"
           id="bed-el-${bed.id}"
           data-bed-id="${bed.id}"
           style="
             left: ${leftPx}px;
             top: ${topPx}px;
             width: ${widthPx}px;
             height: ${heightPx}px;
             --family-color: ${familyColor};
           "
           title="${escapeHtml(bedDispName)}: ${currentCrop ? escapeHtml(currentCropName) : escapeHtml(unplantedText)}">
        
        <!-- Excel-закладка («хвостик») сверху для названия и перемещения грядки -->
        <div class="bed-tab-handle" data-bed-id="${bed.id}" title="${escapeHtml(tr('drag_handle_title') || 'Зажмите и тяните за хвостик для перемещения грядки')}">
          <span class="bed-tab-icon">${typeIcon}</span>
          <span class="bed-tab-title">${escapeHtml(bedDispName)}</span>
          <span class="bed-tab-grip">⋮⋮</span>
        </div>

        <!-- Верхняя строка: Кнопки управления слева и статус севооборота справа (название вынесено в закладку) -->
        <div class="bed-top-row">
          <div class="bed-inline-tools">
            <button type="button" class="gh-tool-btn rotate-btn" data-bed-id="${bed.id}" title="${escapeHtml(tr('tool_rotate') || 'Повернуть грядку на 90°')}">↻</button>
            <button type="button" class="gh-tool-btn clone-btn" data-bed-id="${bed.id}" title="${escapeHtml(tr('tool_clone') || 'Дублировать грядку')}">❐</button>
            <button type="button" class="gh-tool-btn delete-btn" data-bed-id="${bed.id}" title="${escapeHtml(tr('tool_delete') || 'Удалить грядку с плана')}">🗑️</button>
          </div>
          <div class="bed-badge-wrap">
            ${statusBadge}
          </div>
        </div>

        <!-- Нижняя строка: Иконка и культура слева, посадка прошлого года справа -->
        <div class="bed-main-row">
          ${currentCrop ? `
            <div class="bed-crop-lead">
              <div class="crop-svg-avatar">${cropSvgIcon}</div>
              <div class="crop-text-block">
                <strong class="crop-name">${escapeHtml(currentCropName)}</strong>
                ${currentPlanting.variety ? `<span class="crop-variety">${escapeHtml(currentPlanting.variety)}</span>` : ''}
              </div>
            </div>
          ` : `
            <div class="bed-crop-empty">
              <span class="empty-plus">➕</span>
              <span class="empty-text">${escapeHtml(unplantedText)}</span>
            </div>
          `}

          ${!this.showPreviousYearOverlay && prevCrop ? `
            <span class="bed-prev-year-pill" title="${escapeHtml(grownInText)} ${escapeHtml(prevCropName)}">
              <span class="prev-year-num">${prevYear}:</span>
              <span class="prev-crop-svg">${prevCropSvgIcon}</span>
            </span>
          ` : ''}
        </div>

        ${this.showPreviousYearOverlay ? `
          <div class="bed-predecessor-card ${prevCrop ? '' : 'pred-empty'}" title="${escapeHtml(grownInText)} ${escapeHtml(prevCropName || emptyLastYearText)}">
            <span class="pred-year-tag">${prevYear}:</span>
            ${prevCrop ? `
              <span class="pred-crop-avatar">${prevCropSvgIcon}</span>
              <strong class="pred-crop-title">${escapeHtml(prevCropName)}</strong>
              ${prevFamilyName ? `<span class="pred-crop-family">(${escapeHtml(prevFamilyName)})</span>` : ''}
            ` : `
              <span class="pred-empty-label">${escapeHtml(emptyLastYearText)}</span>
            `}
          </div>
        ` : ''}
      </div>
    `;
  }

  getRotationBadge(rotationEval, compact = false) {
    const tr = (k) => (typeof window !== 'undefined' && window.t ? window.t(k) : null);
    if (!rotationEval) {
      return `<span class="status-pill status-none" title="${escapeHtml(tr('eval_neutral') || 'Культура не выбрана')}">—</span>`;
    }
    if (rotationEval.status === 'optimal') {
      const lbl = tr('legend_perfect') || 'Идеально';
      return `<span class="status-pill status-optimal" title="${escapeHtml(lbl)}">${compact ? '✓' : `✓ ${lbl}`}</span>`;
    }
    if (rotationEval.status === 'warning') {
      const lbl = tr('legend_warning') || 'Внимание';
      return `<span class="status-pill status-warning" title="${escapeHtml(lbl)}">${compact ? '⚠' : `⚠ ${lbl}`}</span>`;
    }
    if (rotationEval.status === 'danger') {
      const lbl = tr('legend_danger') || 'Нарушение!';
      return `<span class="status-pill status-danger" title="${escapeHtml(lbl)}">${compact ? '✕' : `✕ ${lbl}`}</span>`;
    }
    return '';
  }

  attachBedEventListeners() {
    if (!this.bedsLayerEl) return;

    // Клик по обычным цельным грядкам
    this.bedsLayerEl.querySelectorAll('.bed-item:not(.greenhouse-structure):not(.bed-multi-section)').forEach(el => {
      const bedId = el.getAttribute('data-bed-id');
      el.addEventListener('click', (e) => {
        if (e.target.closest('.gh-tool-btn') || e.target.closest('.bed-action-mini')) return;
        if (this.dragBedState.hasMoved) return;
        this.selectBed(bedId, null);
      });

      // Перемещение строго за хвостик (Excel-закладку)
      const handle = el.querySelector('.bed-tab-handle') || el;
      handle.addEventListener('mousedown', (e) => {
        if (e.target.closest('.gh-tool-btn') || e.target.closest('.bed-action-mini')) return;
        this.handleBedMouseDown(e, bedId);
      });
      handle.addEventListener('touchstart', (e) => this.handleBedTouchStart(e, bedId), { passive: false });
    });

    // Клик по теплицам и многосекционным грядкам (любого типа с 2 или 3 рядками)
    this.bedsLayerEl.querySelectorAll('.greenhouse-structure, .bed-multi-section').forEach(ghEl => {
      const bedId = ghEl.getAttribute('data-bed-id');

      ghEl.addEventListener('click', (e) => {
        if (e.target.closest('.gh-tool-btn') || e.target.closest('.bed-action-mini')) return;
        if (this.dragBedState.hasMoved) return;

        const secEl = e.target.closest('.gh-internal-bed');
        const sectionId = secEl ? secEl.getAttribute('data-section-id') : null;
        this.selectBed(bedId, sectionId);
      });

      // Перемещение строго за хвостик (Excel-закладку)
      const handle = ghEl.querySelector('.bed-tab-handle') || ghEl;
      handle.addEventListener('mousedown', (e) => {
        if (e.target.closest('.gh-tool-btn') || e.target.closest('.bed-action-mini') || e.target.closest('.gh-internal-bed')) return;
        this.handleBedMouseDown(e, bedId);
      });
      handle.addEventListener('touchstart', (e) => this.handleBedTouchStart(e, bedId), { passive: false });
    });

    // Предотвращаем запуск перетаскивания при нажатии на кнопки инструментов
    this.bedsLayerEl.querySelectorAll('.gh-tool-btn, .bed-action-mini').forEach(btn => {
      btn.addEventListener('mousedown', (e) => e.stopPropagation());
      btn.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    });

    // Поворот ↻
    this.bedsLayerEl.querySelectorAll('.rotate-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const bedId = btn.getAttribute('data-bed-id');
        this.storage.rotateBed(bedId);
        this.render();
      });
    });

    // Переключение ориентации внутренних грядок в теплице (вдоль / поперёк) ⇄
    this.bedsLayerEl.querySelectorAll('.toggle-layout-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const bedId = btn.getAttribute('data-bed-id');
        const bed = this.storage.getBedById(bedId);
        if (!bed) return;
        bed.sectionsLayout = (bed.sectionsLayout === 'transverse') ? 'longitudinal' : 'transverse';
        this.storage.saveBed(bed);
        this.render();
      });
    });

    // Клонирование ❐
    this.bedsLayerEl.querySelectorAll('.clone-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const bedId = btn.getAttribute('data-bed-id');
        const clone = this.storage.duplicateBed(bedId);
        this.render();
        if (clone) this.selectBed(clone.id);
      });
    });

    // Быстрое удаление грядки / теплицы 🗑️
    this.bedsLayerEl.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const bedId = btn.getAttribute('data-bed-id');
        this.confirmDeleteBed(bedId);
      });
    });
  }

  confirmDeleteBed(bedId) {
    const bed = this.storage.getBedById(bedId);
    if (!bed) return;

    if (this.app && typeof this.app.showConfirmModal === 'function') {
      this.app.showConfirmModal({
        title: 'Удалить грядку?',
        icon: '🗑️',
        message: `Вы действительно хотите удалить <strong>«${escapeHtml(bed.name)}»</strong> с плана участка? Все данные о её посадках будут удалены.`,
        confirmText: '🗑️ Да, удалить',
        confirmClass: 'btn-danger',
        onConfirm: () => {
          this.storage.deleteBed(bedId);
          this.render();
          if (this.selectedBedId === bedId) {
            this.selectBed(null, null);
          }
          if (this.app.activeInspectorBedId === bedId) {
            this.app.closeBedInspector();
          }
          this.app.showToast(`Грядка «${bed.name}» удалена`);
        }
      });
    } else {
      if (confirm(`Удалить «${bed.name}» с плана?`)) {
        this.storage.deleteBed(bedId);
        this.render();
        if (this.selectedBedId === bedId) {
          this.selectBed(null, null);
        }
      }
    }
  }

  selectBed(bedId, sectionId = null) {
    this.selectedBedId = bedId;
    this.selectedSectionId = sectionId;

    if (this.bedsLayerEl) {
      this.bedsLayerEl.querySelectorAll('.bed-item').forEach(el => {
        if (el.getAttribute('data-bed-id') === bedId) {
          el.classList.add('selected');
        } else {
          el.classList.remove('selected');
        }
      });

      this.bedsLayerEl.querySelectorAll('.gh-internal-bed').forEach(el => {
        if (el.getAttribute('data-bed-id') === bedId && (!sectionId || el.getAttribute('data-section-id') === sectionId)) {
          el.classList.add('gh-sec-selected');
        } else {
          el.classList.remove('gh-sec-selected');
        }
      });
    }

    if (this.onBedSelect) {
      const bed = this.storage.getBedById(bedId);
      this.onBedSelect(bed, sectionId);
    }
  }

  handleBedMouseDown(e, bedId) {
    if (e.button !== 0) return;
    e.stopPropagation();

    const bed = this.storage.getBedById(bedId);
    if (!bed) return;

    this.dragBedState = {
      isDragging: true,
      bedId: bedId,
      startX: e.clientX,
      startY: e.clientY,
      initialBedX: bed.x,
      initialBedY: bed.y,
      hasMoved: false
    };

    const bedEl = document.getElementById(`bed-el-${bedId}`);
    if (bedEl) bedEl.classList.add('dragging');
  }

  handleBedTouchStart(e, bedId) {
    if (e.touches.length !== 1) return;
    e.stopPropagation();
    const touch = e.touches[0];
    const bed = this.storage.getBedById(bedId);
    if (!bed) return;

    this.dragBedState = {
      isDragging: true,
      bedId: bedId,
      startX: touch.clientX,
      startY: touch.clientY,
      initialBedX: bed.x,
      initialBedY: bed.y,
      hasMoved: false
    };

    const bedEl = document.getElementById(`bed-el-${bedId}`);
    if (bedEl) bedEl.classList.add('dragging');
  }

  handleViewportMouseDown(e) {
    if (e.button === 1 || e.button === 0) {
      if (e.target.closest('.bed-item') || e.target.closest('.nav-control-btn')) {
        return;
      }

      this.panState = {
        isPanning: true,
        startX: e.clientX,
        startY: e.clientY,
        initialPanX: this.panX,
        initialPanY: this.panY
      };

      if (this.viewportEl) this.viewportEl.classList.add('panning');
    }
  }

  handleWheel(e) {
    e.preventDefault();
    if (Math.abs(e.deltaY) < 0.5) return;
    // Колёсико мыши напрямую меняет масштаб (Zoom In / Zoom Out) в точке курсора
    const factor = e.deltaY < 0 ? 1.14 : 0.88;
    this.zoomBy(factor, e.clientX, e.clientY);
  }

  handleGlobalMouseMove(e) {
    if (this.dragBedState.isDragging) {
      const dxPx = (e.clientX - this.dragBedState.startX) / this.zoom;
      const dyPx = (e.clientY - this.dragBedState.startY) / this.zoom;

      const dxMeters = dxPx / this.meterPixels;
      const dyMeters = dyPx / this.meterPixels;

      if (Math.abs(dxPx) > 3 || Math.abs(dyPx) > 3) {
        this.dragBedState.hasMoved = true;
      }

      let targetX = this.dragBedState.initialBedX + dxMeters;
      let targetY = this.dragBedState.initialBedY + dyMeters;

      targetX = Math.round(targetX / this.gridSnap) * this.gridSnap;
      targetY = Math.round(targetY / this.gridSnap) * this.gridSnap;

      const bedEl = document.getElementById(`bed-el-${this.dragBedState.bedId}`);
      if (bedEl) {
        bedEl.style.left = `${targetX * this.meterPixels}px`;
        bedEl.style.top = `${targetY * this.meterPixels}px`;
      }
      return;
    }

    if (this.panState.isPanning) {
      const dx = e.clientX - this.panState.startX;
      const dy = e.clientY - this.panState.startY;

      this.panX = this.panState.initialPanX + dx;
      this.panY = this.panState.initialPanY + dy;
      this.updateTransform();
    }
  }

  handleGlobalMouseUp() {
    if (this.dragBedState.isDragging) {
      const bedEl = document.getElementById(`bed-el-${this.dragBedState.bedId}`);
      if (bedEl) {
        bedEl.classList.remove('dragging');
      }

      if (this.dragBedState.hasMoved) {
        const leftPx = parseFloat(bedEl.style.left);
        const topPx = parseFloat(bedEl.style.top);
        const newX = parseFloat((leftPx / this.meterPixels).toFixed(2));
        const newY = parseFloat((topPx / this.meterPixels).toFixed(2));

        const bed = this.storage.getBedById(this.dragBedState.bedId);
        if (bed) {
          bed.x = newX;
          bed.y = newY;
          this.storage.saveBed(bed);
        }
      }

      this.dragBedState.isDragging = false;
      this.dragBedState.bedId = null;
    }

    if (this.panState.isPanning) {
      this.panState.isPanning = false;
      if (this.viewportEl) this.viewportEl.classList.remove('panning');
    }
  }

  handleTouchStart(e) {
    if (e.touches.length === 2) {
      this.isPinching = true;
      this.initialPinchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      this.initialPinchZoom = this.zoom;
      this.pinchCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      this.pinchCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      return;
    }

    if (e.touches.length === 1 && !this.dragBedState.isDragging) {
      const touch = e.touches[0];
      this.panState = {
        isPanning: true,
        startX: touch.clientX,
        startY: touch.clientY,
        initialPanX: this.panX,
        initialPanY: this.panY
      };
    }
  }

  handleTouchMove(e) {
    if (this.isPinching && e.touches.length === 2) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (this.initialPinchDistance > 10) {
        const factor = currentDist / this.initialPinchDistance;
        const newZoom = Math.max(0.3, Math.min(2.5, this.initialPinchZoom * factor));
        this.zoomBy(newZoom / this.zoom, this.pinchCenterX, this.pinchCenterY);
      }
      return;
    }

    if (this.dragBedState.isDragging && e.touches.length === 1) {
      e.preventDefault();
      this.handleGlobalMouseMove(e.touches[0]);
    } else if (this.panState.isPanning && e.touches.length === 1) {
      e.preventDefault();
      this.handleGlobalMouseMove(e.touches[0]);
    }
  }

  handleTouchEnd(e) {
    if (!e.touches || e.touches.length < 2) {
      this.isPinching = false;
    }
    this.handleGlobalMouseUp();
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

if (typeof window !== 'undefined') {
  window.GardenMap = GardenMap;
  window.escapeHtml = escapeHtml;
}
