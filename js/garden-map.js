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

    this.activeVarietiesPopover = null;

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
        <button class="nav-control-btn" id="map-fit-btn" data-i18n-title="btn_fit_all_title" title="${tr('btn_fit_all_title') || 'Вписать все грядки в экран монитора'}"><span class="nav-control-icon">⛶</span><span class="nav-control-label" data-i18n="btn_fit_all_label"> ${tr('btn_fit_all_label') || 'Вписать всё'}</span></button>
        <button class="nav-control-btn" id="map-center-btn" data-i18n-title="btn_center_title" title="${tr('btn_center_title') || 'Центрировать'}"><span class="nav-control-icon">📍</span><span class="nav-control-label" data-i18n="btn_center_label"> ${tr('btn_center_label') || 'Центр'}</span></button>
        <div class="nav-divider"></div>
        <button class="nav-control-btn" id="map-arrange-btn" data-i18n-title="btn_arrange_title" title="${tr('btn_arrange_title') || 'Разровнять грядки и выстроить ровные проходы без наложений'}"><span class="nav-control-icon">📏</span><span class="nav-control-label" data-i18n="btn_arrange_label"> ${tr('btn_arrange_label') || 'Расставить дорожки'}</span></button>
        <div class="nav-divider"></div>
        <button class="nav-control-btn" id="map-decor-btn" title="Добавить декор участка: домик, яблоня, бочка, дорожка, забор"><span class="nav-control-icon">🌳</span><span class="nav-control-label"> Декор</span></button>
        <button class="nav-control-btn" id="map-season-btn" title="Переключить сезон: Весна / Лето / Осень"><span class="nav-control-icon" id="map-season-icon">☀️</span><span class="nav-control-label" id="map-season-label"> Лето</span></button>
        <button class="nav-control-btn" id="map-style-toggle-btn" title="Переключить оформление: «Живой сад» или «Схема»"><span class="nav-control-icon" id="map-style-icon">🎨</span><span class="nav-control-label" id="map-style-label"> Живой сад</span></button>
      </div>

      <!-- Вьюпорт на весь экран -->
      <div class="garden-pan-viewport" id="garden-pan-viewport">
        <div class="garden-transform-plane" id="garden-transform-plane">
          <!-- Слой координатной сетки -->
          <div class="infinite-grid-layer" id="infinite-grid-layer"></div>

          <!-- Слой декора участка (домик, деревья, дорожки, забор, бочка) -->
          <div class="decor-layer" id="decor-layer"></div>

          <!-- Слой всех грядок и теплиц -->
          <div class="beds-layer" id="beds-layer"></div>
        </div>

        <!-- Атмосфера живого сада (солнечные лучи, бабочки, лепестки весны и осенние листья) -->
        <div class="cartoon-atmosphere-layer" aria-hidden="true">
          <div class="cartoon-sunbeams"></div>
          <!-- Летние бабочки -->
          <div class="cartoon-butterfly bf-1">
            <svg viewBox="0 0 32 32" width="24" height="24">
              <ellipse cx="11" cy="13" rx="7" ry="5.5" transform="rotate(-22 11 13)" fill="#fde047" stroke="#78350f" stroke-width="1.4"/>
              <ellipse cx="21" cy="13" rx="7" ry="5.5" transform="rotate(22 21 13)" fill="#fde047" stroke="#78350f" stroke-width="1.4"/>
              <ellipse cx="12" cy="20" rx="5" ry="4" transform="rotate(18 12 20)" fill="#fb923c" stroke="#78350f" stroke-width="1.3"/>
              <ellipse cx="20" cy="20" rx="5" ry="4" transform="rotate(-18 20 20)" fill="#fb923c" stroke="#78350f" stroke-width="1.3"/>
              <ellipse cx="16" cy="16.5" rx="1.8" ry="6.5" fill="#451a03"/>
            </svg>
          </div>
          <div class="cartoon-butterfly bf-2">
            <svg viewBox="0 0 32 32" width="20" height="20">
              <ellipse cx="11" cy="13" rx="7" ry="5.5" transform="rotate(-22 11 13)" fill="#7dd3fc" stroke="#0c4a6e" stroke-width="1.4"/>
              <ellipse cx="21" cy="13" rx="7" ry="5.5" transform="rotate(22 21 13)" fill="#7dd3fc" stroke="#0c4a6e" stroke-width="1.4"/>
              <ellipse cx="12" cy="20" rx="5" ry="4" transform="rotate(18 12 20)" fill="#bae6fd" stroke="#0c4a6e" stroke-width="1.3"/>
              <ellipse cx="20" cy="20" rx="5" ry="4" transform="rotate(-18 20 20)" fill="#bae6fd" stroke="#0c4a6e" stroke-width="1.3"/>
              <ellipse cx="16" cy="16.5" rx="1.8" ry="6.5" fill="#0f172a"/>
            </svg>
          </div>
          <!-- Весенние лепестки цветения -->
          <div class="season-particle spring-petal sp-1"></div>
          <div class="season-particle spring-petal sp-2"></div>
          <div class="season-particle spring-petal sp-3"></div>
          <div class="season-particle spring-petal sp-4"></div>
          <div class="season-particle spring-petal sp-5"></div>
          <!-- Осенние золотые листья -->
          <div class="season-particle autumn-leaf al-1"></div>
          <div class="season-particle autumn-leaf al-2"></div>
          <div class="season-particle autumn-leaf al-3"></div>
          <div class="season-particle autumn-leaf al-4"></div>
          <div class="season-particle autumn-leaf al-5"></div>
        </div>

        <!-- Кнопки-стрелки прокрутки участка (для тех, кому привычнее листать кнопками) -->
        <div class="map-pan-dpad" aria-label="Навигация по участку">
          <button type="button" class="dpad-btn dpad-up" id="dpad-up" title="Сдвинуть карту вверх">▲</button>
          <div class="dpad-mid-row">
            <button type="button" class="dpad-btn dpad-left" id="dpad-left" title="Сдвинуть карту влево">◀</button>
            <button type="button" class="dpad-btn dpad-fit" id="dpad-fit" title="Показать весь участок целиком">⛶</button>
            <button type="button" class="dpad-btn dpad-right" id="dpad-right" title="Сдвинуть карту вправо">▶</button>
          </div>
          <button type="button" class="dpad-btn dpad-down" id="dpad-down" title="Сдвинуть карту вниз">▼</button>
        </div>

        <!-- Оверлей чистого плана / Пустой огород (Onboarding Hero) -->
        <div class="empty-garden-overlay" id="empty-garden-overlay" style="display: none;"></div>
      </div>
    `;

    this.viewportEl = document.getElementById('garden-pan-viewport');
    this.planeEl = document.getElementById('garden-transform-plane');
    this.decorLayerEl = document.getElementById('decor-layer');
    this.bedsLayerEl = document.getElementById('beds-layer');
    this.emptyOverlayEl = document.getElementById('empty-garden-overlay');
    this.zoomIndicatorEl = document.getElementById('map-zoom-indicator');
    this.selectedDecorId = null;
    this.dragDecorState = { isDragging: false, decorId: null, startX: 0, startY: 0, initialX: 0, initialY: 0 };

    const panStep = (dx, dy) => {
      this.panX += dx;
      this.panY += dy;
      this.updateTransform();
    };
    document.getElementById('dpad-up')?.addEventListener('click', (e) => { e.stopPropagation(); panStep(0, 140); });
    document.getElementById('dpad-down')?.addEventListener('click', (e) => { e.stopPropagation(); panStep(0, -140); });
    document.getElementById('dpad-left')?.addEventListener('click', (e) => { e.stopPropagation(); panStep(160, 0); });
    document.getElementById('dpad-right')?.addEventListener('click', (e) => { e.stopPropagation(); panStep(-160, 0); });
    document.getElementById('dpad-fit')?.addEventListener('click', (e) => { e.stopPropagation(); this.fitPlotToView(true); });

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

    // Переключатель стиля: «🎨 Живой сад» (мультяшный) ⇄ «📐 Схема» (классический)
    const savedStyle = localStorage.getItem('smart_garden_visual_style') || 'cartoon';
    this.applyVisualStyle(savedStyle, false);

    document.getElementById('map-style-toggle-btn')?.addEventListener('click', () => {
      const isCartoon = document.body.classList.contains('theme-cartoon');
      const nextStyle = isCartoon ? 'classic' : 'cartoon';
      this.applyVisualStyle(nextStyle, true);
    });

    // Переключатель живых сезонов: Весна / Лето / Осень
    const savedSeason = localStorage.getItem('smart_garden_season') || 'summer';
    this.applySeason(savedSeason, false);

    document.getElementById('map-season-btn')?.addEventListener('click', () => {
      const order = ['spring', 'summer', 'autumn'];
      const cur = localStorage.getItem('smart_garden_season') || 'summer';
      const next = order[(order.indexOf(cur) + 1) % order.length];
      this.applySeason(next, true);
    });

    // Кнопка «🌳 Декор участка» (домик, деревья, бочка, дорожки, забор)
    document.getElementById('map-decor-btn')?.addEventListener('click', () => {
      this.openDecorPickerModal();
    });

    this.updateControlsLanguage();
  }

  applySeason(season, showNotification = false) {
    const valid = ['spring', 'summer', 'autumn'].includes(season) ? season : 'summer';
    document.body.classList.remove('season-spring', 'season-summer', 'season-autumn');
    document.body.classList.add(`season-${valid}`);
    try {
      localStorage.setItem('smart_garden_season', valid);
    } catch (e) {}

    this.updateSeasonButton();

    if (showNotification && window.app) {
      const lang = (typeof window !== 'undefined' && window.i18n) ? window.i18n.getLanguage() : 'ru';
      const msgs = {
        spring: lang === 'et' ? '🌸 Kevad: aed õitseb ja rohi tärkab!' : lang === 'lv' ? '🌸 Pavasaris: dārzs zied!' : lang === 'lt' ? '🌸 Pavasaris: sodas žydi!' : '🌸 Сезон: Весна — сад цветёт, летят лепестки!',
        summer: lang === 'et' ? '☀️ Suvi: soe päike ja liblikad!' : lang === 'lv' ? '☀️ Vasara: saule un tauriņi!' : lang === 'lt' ? '☀️ Vasara: saulė ir drugeliai!' : '☀️ Сезон: Лето — тёплое солнце и порхают бабочки!',
        autumn: lang === 'et' ? '🍂 Sügis: kuldne saagikoristusaeg!' : lang === 'lv' ? '🍂 Rudens: zelta ražas laiks!' : lang === 'lt' ? '🍂 Ruduo: auksinis derliaus metas!' : '🍂 Сезон: Осень — золотой свет и опадают листья!'
      };
      window.app.showToast(msgs[valid]);
    }
  }

  updateSeasonButton() {
    const btn = document.getElementById('map-season-btn');
    if (!btn) return;
    const cur = localStorage.getItem('smart_garden_season') || 'summer';
    const lang = (typeof window !== 'undefined' && window.i18n) ? window.i18n.getLanguage() : 'ru';
    const labels = {
      spring: { icon: '🌸', text: lang === 'et' ? 'Kevad' : lang === 'lv' ? 'Pavasaris' : lang === 'lt' ? 'Pavasaris' : 'Весна' },
      summer: { icon: '☀️', text: lang === 'et' ? 'Suvi' : lang === 'lv' ? 'Vasara' : lang === 'lt' ? 'Vasara' : 'Лето' },
      autumn: { icon: '🍂', text: lang === 'et' ? 'Sügis' : lang === 'lv' ? 'Rudens' : lang === 'lt' ? 'Ruduo' : 'Осень' }
    };
    const item = labels[cur] || labels.summer;
    btn.innerHTML = `<span class="nav-control-icon">${item.icon}</span><span class="nav-control-label"> ${item.text}</span>`;

    const decorBtn = document.getElementById('map-decor-btn');
    if (decorBtn) {
      const decorWord = lang === 'et' ? 'Dekoor' : lang === 'lv' ? 'Dekors' : lang === 'lt' ? 'Dekoras' : 'Декор';
      decorBtn.innerHTML = `<span class="nav-control-icon">🌳</span><span class="nav-control-label"> ${decorWord}</span>`;
    }
  }

  openDecorPickerModal() {
    if (typeof GARDEN_DECOR_CATALOG === 'undefined') return;
    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) return;

    const lang = (typeof window !== 'undefined' && window.i18n) ? window.i18n.getLanguage() : 'ru';
    const title = lang === 'et' ? '🌳 Aia dekoor ja ehitised' : lang === 'lv' ? '🌳 Dārza dekors un būves' : lang === 'lt' ? '🌳 Sodo dekoras ir statiniai' : '🌳 Декор участка — уютная дача';
    const subtitle = lang === 'et' ? 'Klõpsake objektil, et lisada see plaanile. Seejärel saate seda lohistada ja pöörata!'
      : lang === 'lv' ? 'Noklikšķiniet uz objekta, lai pievienotu to plānam. Pēc tam to var pārvietot un pagriezt!'
      : lang === 'lt' ? 'Spustelėkite objektą, kad pridėtumėte jį prie plano. Vėliau galėsite jį perkelti ir pasukti!'
      : 'Нажмите на любой объект — он появится в центре плана, и вы сможете перетащить его мышкой куда угодно!';

    modalContent.innerHTML = `
      <div class="modal-card modal-decor-picker" style="max-width: 680px; width: 95%;">
        <div class="modal-header">
          <div>
            <h3 style="margin: 0;">${title}</h3>
            <span class="text-xs text-muted">${subtitle}</span>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body" style="padding: 1.1rem 1.25rem; max-height: 70vh; overflow-y: auto;">
          <div class="decor-picker-grid">
            ${GARDEN_DECOR_CATALOG.map(d => `
              <button type="button" class="decor-picker-card" data-decor-type="${d.type}">
                <div class="decor-picker-preview">${d.svg}</div>
                <div class="decor-picker-name">${escapeHtml(getDecorName(d, lang))}</div>
                <div class="decor-picker-size">${d.width}×${d.height} м</div>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
    modalContent.querySelector('.modal-close-btn')?.addEventListener('click', () => modal.classList.remove('active'));

    modalContent.querySelectorAll('.decor-picker-card').forEach(card => {
      card.addEventListener('click', () => {
        const type = card.getAttribute('data-decor-type');
        // Вычисляем центр видимой области карты в метрах
        const rect = this.viewportEl ? this.viewportEl.getBoundingClientRect() : { width: 900, height: 600 };
        const centerX = ((rect.width / 2 - this.panX) / this.zoom) / this.meterPixels;
        const centerY = ((rect.height / 2 - this.panY) / this.zoom) / this.meterPixels;
        const tpl = getDecorTemplate(type);
        const x = Math.max(0.5, centerX - (tpl.width || 2) / 2);
        const y = Math.max(0.5, centerY - (tpl.height || 2) / 2);

        const added = this.storage.addDecorItem(type, x, y);
        if (added) this.selectedDecorId = added.id;
        this.renderDecorItems();
        modal.classList.remove('active');
        if (window.app) {
          const isLine = type === 'fence' || type === 'path_stone';
          window.app.showToast(isLine
            ? `${tpl.icon} «${getDecorName(tpl, lang)}» добавлен! Нажимайте «➕ Продлить» сверху, чтобы выложить в ряд.`
            : `${tpl.icon} «${getDecorName(tpl, lang)}» добавлен на участок! Перетащите его куда нужно.`);
        }
      });
    });
  }

  renderDecorItems() {
    if (!this.decorLayerEl || typeof getDecorTemplate !== 'function') return;
    const items = this.storage.getDecorItems();
    const lang = (typeof window !== 'undefined' && window.i18n) ? window.i18n.getLanguage() : 'ru';
    const lblRotate = lang === 'et' ? 'Pööra' : lang === 'lv' ? 'Pagriezt' : lang === 'lt' ? 'Pasukti' : 'Повернуть';
    const lblExtend = lang === 'et' ? 'Pikenda' : lang === 'lv' ? 'Pagarināt' : lang === 'lt' ? 'Pratęsti' : 'Продлить';
    const lblMore = lang === 'et' ? 'Veel üks' : lang === 'lv' ? 'Vēl vienu' : lang === 'lt' ? 'Dar vieną' : 'Ещё';
    const lblDelete = lang === 'et' ? 'Kustuta' : lang === 'lv' ? 'Dzēst' : lang === 'lt' ? 'Trinti' : 'Удалить';

    this.decorLayerEl.innerHTML = items.map(item => {
      const tpl = getDecorTemplate(item.type);
      const leftPx = item.x * this.meterPixels;
      const topPx = item.y * this.meterPixels;
      const widthPx = (item.width || tpl.width || 2) * this.meterPixels;
      const heightPx = (item.height || tpl.height || 2) * this.meterPixels;
      const rot = item.rotation || 0;
      const zClass = `decor-z-${tpl.zLayer || 'mid'}`;
      const isSelected = this.selectedDecorId === item.id;
      const isLine = item.type === 'fence' || item.type === 'path_stone';

      return `
        <div class="decor-item ${zClass} ${isSelected ? 'decor-selected' : ''}"
             id="decor-el-${item.id}"
             data-decor-id="${item.id}"
             style="left: ${leftPx}px; top: ${topPx}px; width: ${widthPx}px; height: ${heightPx}px;">
          <div class="decor-svg-stage" style="transform: rotate(${rot}deg);" title="${escapeHtml(getDecorName(tpl, lang))} — нажмите для действий или перетащите">
            ${tpl.svg}
          </div>
          <div class="decor-item-tools">
            <button type="button" class="decor-action-btn decor-action-primary decor-clone-btn" data-decor-id="${item.id}" title="${isLine ? 'Поставить следующую секцию ровно встык' : 'Поставить ещё один такой же объект рядом'}">➕ ${isLine ? lblExtend : lblMore}</button>
            <button type="button" class="decor-action-btn decor-rotate-btn" data-decor-id="${item.id}" title="${lblRotate} на 90°">↻ ${lblRotate}</button>
            <button type="button" class="decor-action-btn decor-action-danger decor-delete-btn" data-decor-id="${item.id}" title="${lblDelete} (клавиша Delete)">🗑️ ${lblDelete}</button>
          </div>
        </div>
      `;
    }).join('');

    // Привязываем выбор, перетаскивание и кнопки управления декора
    this.decorLayerEl.querySelectorAll('.decor-item').forEach(el => {
      el.addEventListener('mousedown', (e) => {
        if (e.target.closest('.decor-item-tools')) return;
        e.stopPropagation();
        const id = el.getAttribute('data-decor-id');
        const item = this.storage.getDecorItems().find(d => d.id === id);
        if (!item) return;

        // Выделяем объект, чтобы крупная панель действий оставалась видимой
        if (this.selectedDecorId !== id) {
          this.selectedDecorId = id;
          this.decorLayerEl.querySelectorAll('.decor-item.decor-selected').forEach(n => n.classList.remove('decor-selected'));
          el.classList.add('decor-selected');
        }

        this.dragDecorState = {
          isDragging: true,
          decorId: id,
          startX: e.clientX,
          startY: e.clientY,
          initialX: item.x,
          initialY: item.y
        };
        el.classList.add('dragging');
      });
    });

    this.decorLayerEl.querySelectorAll('.decor-rotate-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-decor-id');
        this.storage.rotateDecorItem(id);
        this.selectedDecorId = id;
        this.renderDecorItems();
      });
    });

    this.decorLayerEl.querySelectorAll('.decor-clone-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const clone = this.storage.cloneDecorItem(btn.getAttribute('data-decor-id'));
        if (clone) this.selectedDecorId = clone.id;
        this.renderDecorItems();
        if (window.app) window.app.showToast('❐ Объект скопирован рядом — перетащите его куда нужно!');
      });
    });

    this.decorLayerEl.querySelectorAll('.decor-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-decor-id');
        this.storage.deleteDecorItem(id);
        if (this.selectedDecorId === id) this.selectedDecorId = null;
        this.renderDecorItems();
        if (window.app) window.app.showToast('🗑️ Объект декора удалён с плана');
      });
    });
  }

  applyVisualStyle(style, showNotification = false) {
    const isCartoon = style !== 'classic';
    document.body.classList.toggle('theme-cartoon', isCartoon);
    try {
      localStorage.setItem('smart_garden_visual_style', isCartoon ? 'cartoon' : 'classic');
    } catch (e) {}

    this.updateStyleToggleButton();

    if (showNotification && window.app) {
      const lang = (typeof window !== 'undefined' && window.i18n) ? window.i18n.getLanguage() : 'ru';
      const msg = isCartoon
        ? (lang === 'et' ? '🎨 «Elav aed» stiil on sisse lülitatud!' : lang === 'lv' ? '🎨 Ieslēgts «Dzīvais dārzs» stils!' : lang === 'lt' ? '🎨 Įjungtas «Gyvas sodas» stilius!' : '🎨 Включён мультяшный стиль «Живой сад»!')
        : (lang === 'et' ? '📐 «Skeem» stiil on sisse lülitatud' : lang === 'lv' ? '📐 Ieslēgts «Shēma» stils' : lang === 'lt' ? '📐 Įjungtas «Schema» stilius' : '📐 Включён классический стиль «Схема»');
      window.app.showToast(msg);
    }
  }

  updateStyleToggleButton() {
    const btn = document.getElementById('map-style-toggle-btn');
    if (!btn) return;
    const isCartoon = document.body.classList.contains('theme-cartoon');
    const lang = (typeof window !== 'undefined' && window.i18n) ? window.i18n.getLanguage() : 'ru';
    const cartoonLabel = lang === 'et' ? 'Elav aed' : lang === 'lv' ? 'Dzīvais dārzs' : lang === 'lt' ? 'Gyvas sodas' : 'Живой сад';
    const classicLabel = lang === 'et' ? 'Skeem' : lang === 'lv' ? 'Shēma' : lang === 'lt' ? 'Schema' : 'Схема';

    btn.classList.toggle('style-toggle-active', isCartoon);
    btn.innerHTML = isCartoon
      ? `<span class="nav-control-icon">🎨</span><span class="nav-control-label"> ${cartoonLabel}</span>`
      : `<span class="nav-control-icon">📐</span><span class="nav-control-label"> ${classicLabel}</span>`;
    btn.title = isCartoon
      ? 'Нажмите, чтобы переключить на классическую схему'
      : 'Нажмите, чтобы включить мультяшный «Живой сад»';
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
    this.updateStyleToggleButton();
    this.updateSeasonButton();
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
    window.addEventListener('touchcancel', (e) => this.handleTouchEnd(e));

    window.addEventListener('resize', () => {
      this.centerPlotInView();
    });

    // Закрытие поповера и снятие выделения декора при клике вне него
    document.addEventListener('click', (e) => {
      if (this.activeVarietiesPopover) {
        if (!e.target.closest('#garden-varieties-popover') && !e.target.closest('.gh-varieties-dropdown-btn') && !e.target.closest('.gh-holes-micro-strip')) {
          this.closeVarietiesPopover();
        }
      }
      if (this.selectedDecorId && !e.target.closest('.decor-item')) {
        this.selectedDecorId = null;
        this.decorLayerEl?.querySelectorAll('.decor-item.decor-selected').forEach(n => n.classList.remove('decor-selected'));
      }
    });

    // Горячие клавиши: Delete для удаления выделенного декора, стрелки для плавного сдвига карты
    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedDecorId) {
        e.preventDefault();
        this.storage.deleteDecorItem(this.selectedDecorId);
        this.selectedDecorId = null;
        this.renderDecorItems();
        if (window.app) window.app.showToast('🗑️ Объект декора удалён (Delete)');
        return;
      }

      if (e.key === 'ArrowUp') { this.panY += 100; this.updateTransform(); }
      else if (e.key === 'ArrowDown') { this.panY -= 100; this.updateTransform(); }
      else if (e.key === 'ArrowLeft') { this.panX += 120; this.updateTransform(); }
      else if (e.key === 'ArrowRight') { this.panX -= 120; this.updateTransform(); }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeVarietiesPopover) {
        this.closeVarietiesPopover();
      }
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
    this.closeVarietiesPopover();
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

  getTopSafePaddingPx() {
    const vRect = this.viewportEl ? this.viewportEl.getBoundingClientRect() : null;
    const floatingBar = this.container ? this.container.querySelector('.map-controls-floating') : null;
    if (vRect && floatingBar) {
      const fRect = floatingBar.getBoundingClientRect();
      // Нижний край плавающего меню относительно верха вьюпорта + 46px под закладку-хвостик грядки и воздух
      const barBottom = Math.max(0, fRect.bottom - vRect.top);
      return Math.ceil(barBottom + 46);
    }
    return 116;
  }

  centerPlotInView(smooth = false) {
    if (!this.viewportEl) return;
    const beds = this.storage.getBeds();
    const topSafePx = this.getTopSafePaddingPx();
    if (!beds.length) {
      this.panX = 80;
      this.panY = topSafePx;
      this.updateTransform(smooth);
      return;
    }

    const bbox = this.calculateBedsBoundingBox(beds);
    const plotPxW = bbox.width * this.meterPixels * this.zoom;
    const plotPxH = bbox.height * this.meterPixels * this.zoom;

    const vRect = this.viewportEl.getBoundingClientRect();
    const vw = (vRect.width && vRect.width > 200) ? vRect.width : window.innerWidth;
    const vh = (vRect.height && vRect.height > 200) ? vRect.height : (window.innerHeight - 150);

    // Центрирование по горизонтали (X)
    const centeredPanX = Math.round((vw - plotPxW) / 2 - (bbox.minX * this.meterPixels * this.zoom));
    const leftMarginPanX = Math.round(50 - (bbox.minX * this.meterPixels * this.zoom));
    this.panX = (plotPxW <= vw) ? centeredPanX : Math.max(leftMarginPanX, centeredPanX);

    // Центрирование по вертикали (Y) строго НИЖЕ плавающего верхнего меню (.map-controls-floating)!
    const bottomMarginPx = 28;
    const usableH = Math.max(120, vh - topSafePx - bottomMarginPx);
    const centeredPanY = Math.round(topSafePx + (usableH - plotPxH) / 2 - (bbox.minY * this.meterPixels * this.zoom));
    const topAlignedPanY = Math.round(topSafePx - (bbox.minY * this.meterPixels * this.zoom));

    // Верхний край участка и закладки грядок НИКОГДА не уходят под верхнее меню
    this.panY = Math.max(topAlignedPanY, centeredPanY);

    this.updateTransform(smooth);
  }

  fitPlotToView(smooth = false) {
    if (!this.viewportEl) return;
    const beds = this.storage.getBeds();
    const topSafePx = this.getTopSafePaddingPx();
    if (!beds.length) {
      this.zoom = 1.0;
      this.panX = 80;
      this.panY = topSafePx;
      this.updateTransform(smooth);
      return;
    }

    const bbox = this.calculateBedsBoundingBox(beds);
    const vRect = this.viewportEl.getBoundingClientRect();
    const vw = (vRect.width && vRect.width > 200) ? vRect.width : (window.innerWidth - 60);
    const vh = (vRect.height && vRect.height > 200) ? vRect.height : (window.innerHeight - 160);

    const availW = Math.max(300, vw - 110);
    const availH = Math.max(240, vh - topSafePx - 44);

    const targetPxW = Math.max(1, bbox.width * this.meterPixels);
    const targetPxH = Math.max(1, bbox.height * this.meterPixels);

    const factor = Math.min(availW / targetPxW, availH / targetPxH);
    this.zoom = parseFloat(Math.max(0.35, Math.min(1.25, factor)).toFixed(2));

    this.centerPlotInView(smooth);
  }

  calculateBedsBoundingBox(beds) {
    const decorItems = (this.storage && typeof this.storage.getDecorItems === 'function')
      ? this.storage.getDecorItems()
      : [];
    if ((!beds || !beds.length) && !decorItems.length) {
      return { minX: 0, minY: 0, maxX: 20, maxY: 15, width: 20, height: 15 };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    (beds || []).forEach(b => {
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

    // Учитываем также объекты декора (забор, домик, деревья), чтобы они тоже не уезжали под меню!
    decorItems.forEach(d => {
      const dw = d.width || 2;
      const dh = d.height || 2;
      minX = Math.min(minX, d.x);
      minY = Math.min(minY, d.y);
      maxX = Math.max(maxX, d.x + dw);
      maxY = Math.max(maxY, d.y + dh);
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
    this.closeVarietiesPopover();
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

    this.renderDecorItems();
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

    // Общий статус севооборота для всей конструкции/теплицы (над всеми секциями в шапке)
    let overallEval = null;
    let worstScore = 999;
    sections.forEach(sec => {
      const secPlanting = sec.history?.[activeYear] || null;
      const cId = secPlanting?.cropId || (secPlanting?.holes?.find(h => h && h.cropId)?.cropId);
      if (cId) {
        const secHist = this.storage.getBedHistoryArray(bed.id, activeYear, sec.id);
        const ev = evaluateCropRotation(cId, secHist);
        if (ev) {
          const score = ev.status === 'danger' ? 0 : (ev.status === 'warning' ? 50 : 100);
          if (score < worstScore) {
            worstScore = score;
            overallEval = ev;
          }
        }
      }
    });
    const overallStatusBadge = overallEval ? this.getRotationBadge(overallEval, false) : '';

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
        
        <!-- Excel-закладка («хвостик») сверху для названия и перемещения грядки (включает статус севооборота в ряд) -->
        <div class="bed-tab-handle" data-bed-id="${bed.id}" title="${escapeHtml(tr('drag_handle_title') || 'Зажмите и тяните за хвостик для перемещения грядки')}">
          <span class="bed-tab-icon">${typeIcon}</span>
          <span class="bed-tab-title">${escapeHtml(bedDispName)}</span>
          ${overallStatusBadge ? `<span class="bed-tab-rot-wrap">${overallStatusBadge}</span>` : ''}
          <span class="bed-tab-grip">⋮⋮</span>
        </div>

        <!-- Конёк крыши для теплиц -->
        ${isGh ? `<div class="greenhouse-roof-ridge ${isGhHorizontal ? 'ridge-h' : 'ridge-v'}"></div>` : ''}
        
        <!-- Полоса инструментов внутри грядки -->
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
            const holes = currentPlanting?.holes || [];
            let currentCrop = currentPlanting?.cropId ? getCropById(currentPlanting.cropId) : null;

            // Авто-восстановление/подстановка культуры из лунок, если она не была выбрана отдельно
            if (!currentCrop && holes.length > 0) {
              const holeWithCrop = holes.find(h => h && h.cropId);
              const derivedCropId = holeWithCrop ? holeWithCrop.cropId : (holes.some(h => h && h.variety) ? 'tomato' : null);
              if (derivedCropId) {
                currentCrop = getCropById(derivedCropId);
                if (currentPlanting && !currentPlanting.cropId) {
                  currentPlanting.cropId = derivedCropId;
                }
              }
            }

            const holeVarieties = holes.length > 0
              ? [...new Set(holes.filter(h => h && h.variety && h.variety.trim()).map(h => h.variety.trim()))]
              : [];
            const displayVariety = holeVarieties.length > 0
              ? holeVarieties.join(', ')
              : (currentPlanting?.variety || '');
            if (currentPlanting && !currentPlanting.variety && displayVariety) {
              currentPlanting.variety = displayVariety;
            }
            const holesPlantedCount = holes.filter(h => h && (h.cropId || (h.variety && h.variety.trim()))).length;

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
            if (secCount === 3) {
              if (secIdx === 0) {
                secShortName = currentLang === 'et' ? 'Vasak' : currentLang === 'lv' ? 'Kreisā' : currentLang === 'lt' ? 'Kairė' : 'Левый';
              } else if (secIdx === 1) {
                secShortName = currentLang === 'et' ? 'Kesk' : currentLang === 'lv' ? 'Centrs' : currentLang === 'lt' ? 'Centras' : 'Центр';
              } else {
                secShortName = currentLang === 'et' ? 'Parem' : currentLang === 'lv' ? 'Labā' : currentLang === 'lt' ? 'Dešinė' : 'Правый';
              }
            } else if (secCount === 2) {
              if (secIdx === 0) {
                secShortName = currentLang === 'et' ? 'Vasak' : currentLang === 'lv' ? 'Kreisā' : currentLang === 'lt' ? 'Kairė' : 'Левый';
              } else {
                secShortName = currentLang === 'et' ? 'Parem' : currentLang === 'lv' ? 'Labā' : currentLang === 'lt' ? 'Dešinė' : 'Правый';
              }
            } else if (/лев|vasak|kreis|kair/i.test(secShortName)) {
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

            const cleanCropName = currentCropName ? currentCropName.replace(/\s*\(.*?\)/g, '').trim() : '';
            const secPlanting = sec.history?.[activeYear] || null;
            const plantingPattern = secPlanting?.plantingPattern || (holes.length > 15 ? 'zigzag' : 'single');
            const holeSummary = (holes.length > 0 && typeof summarizeHolePlantings === 'function')
              ? summarizeHolePlantings(holes, currentCrop, currentLang, plantingPattern)
              : null;

            if (isInternalHorizontal) {
              // Горизонтальные полосы/рядки
              return `
                <div class="gh-internal-bed gh-bed-horizontal ${isSectionSelected ? 'gh-sec-selected' : ''} ${currentCrop ? 'is-planted-bed' : ''}"
                     data-bed-id="${bed.id}"
                     data-section-id="${sec.id}"
                     data-crop-id="${currentCrop ? currentCrop.id : ''}"
                     data-crop-family="${currentCrop ? (currentCrop.family || '') : ''}"
                     title="${escapeHtml(secLocName)}: ${currentCrop ? escapeHtml(currentCropName) : escapeHtml(freeText)}">
                  
                  <div class="gh-bed-h-container">
                    <!-- Верхняя строка: Слева культура, справа сорта и статистика -->
                    <div class="gh-bed-h-top-row">
                      <div class="gh-h-top-left">
                        <span class="gh-bed-num-badge">${secIdx + 1}</span>
                        <span class="gh-bed-pill" title="${escapeHtml(secLocName)}">
                          ${escapeHtml(secShortName || `${secIdx + 1}`)}
                          ${rotationEval ? `<span class="gh-pill-rot rot-${rotationEval.status}" title="${escapeHtml(rotationEval.reasons?.join('. ') || rotationEval.title)}">${rotationEval.status === 'optimal' ? '✓' : (rotationEval.status === 'warning' ? '!' : '✕')}</span>` : ''}
                        </span>
                        ${currentCrop ? `
                          <div class="gh-crop-icon">${cropSvg}</div>
                          <strong class="gh-crop-name">${escapeHtml(cleanCropName)}</strong>
                        ` : `
                          <div class="gh-h-cta-btn" title="${escapeHtml(freeText)}">
                            <span class="gh-cta-plus">➕</span>
                            <span class="gh-cta-text">${escapeHtml(plantText)}</span>
                          </div>
                        `}
                      </div>

                      <div class="gh-h-top-right">
                        ${currentCrop && holeSummary && holeSummary.varieties.length > 0 ? `
                          <!-- Кнопка сортов со схемой и стрелочкой -->
                          <button type="button" class="gh-varieties-dropdown-btn" data-bed-id="${bed.id}" data-section-id="${sec.id}" title="Схема: ${holeSummary.patternName}. Нажмите для просмотра сортов">
                            <span class="gh-btn-pattern-icon" title="Схема: ${holeSummary.patternName}">${holeSummary.patternIcon}</span>
                            <span class="gh-btn-var-dot" style="background-color: ${holeSummary.varieties[0]?.color || '#10b981'};"></span>
                            <span class="gh-btn-var-label">
                              ${holeSummary.varieties.length === 1
                                ? escapeHtml(holeSummary.varieties[0].variety)
                                : `${holeSummary.varieties.length} ${holeSummary.varieties.length < 5 ? 'сорта' : 'сортов'}`}
                            </span>
                            <span class="gh-btn-arrow">▾</span>
                          </button>

                          <span class="gh-holes-chip-count" title="${holeSummary.plantedCount} кустов высажено из ${holeSummary.totalHoles} лунок">🌱 ${holeSummary.plantedCount}/${holeSummary.totalHoles}</span>
                        ` : (displayVariety ? `
                          <span class="gh-crop-var" title="${escapeHtml(displayVariety)}">(${escapeHtml(displayVariety)})</span>
                        ` : '')}

                        ${this.showPreviousYearOverlay && prevCrop ? `
                          <span class="gh-prev-year-tag highlight-prev" title="${escapeHtml(grownInText)} ${escapeHtml(prevCropName)}">
                            <span class="prev-year-label">${prevYear}:</span>
                            <span class="prev-crop-svg">${getCropSvg(prevCrop.id)}</span>
                            <strong class="prev-crop-title-gh">${escapeHtml(prevCropName)}</strong>
                          </span>
                        ` : (this.showPreviousYearOverlay ? `
                          <span class="gh-prev-year-tag pred-empty-tag" title="${escapeHtml(emptyLastYearText)}">
                            <span class="prev-year-label">${prevYear}:</span>
                            <span class="pred-empty-label">${escapeHtml(emptyLastYearText)}</span>
                          </span>
                        ` : '')}
                      </div>
                    </div>

                    <!-- Нижняя строка: ВСЯ ШИРИНА ОТДАНА ПОД ЛУНКИ! -->
                    ${currentCrop && holeSummary && holeSummary.varieties.length > 0 ? `
                      <div class="gh-bed-h-bottom-row">
                        <div class="gh-holes-micro-strip pattern-${holeSummary.pattern}" data-bed-id="${bed.id}" data-section-id="${sec.id}" title="Схема посадки: ${holeSummary.patternName} • ${holeSummary.plantedCount} из ${holeSummary.totalHoles} высажено (нажмите для подробностей)">
                          ${holeSummary.pattern === 'single' ? `
                            <div class="gh-holes-micro-row row-1">
                              ${holeSummary.row1Holes.map(h => `
                                <span class="gh-micro-hole ${h.isPlanted ? 'is-planted' : 'is-empty'}"
                                      style="${h.isPlanted ? `background-color: ${h.color}; border-color: ${h.color};` : ''}"
                                      title="№${h.index}: ${escapeHtml(h.variety || 'свободно')}"></span>
                              `).join('')}
                            </div>
                          ` : `
                            <div class="gh-holes-micro-row row-1">
                              ${holeSummary.row1Holes.map(h => `
                                <span class="gh-micro-hole ${h.isPlanted ? 'is-planted' : 'is-empty'}"
                                      style="${h.isPlanted ? `background-color: ${h.color}; border-color: ${h.color};` : ''}"
                                      title="№${h.index}: ${escapeHtml(h.variety || 'свободно')}"></span>
                              `).join('')}
                            </div>
                            <div class="gh-holes-micro-row row-2 ${holeSummary.pattern === 'zigzag' ? 'is-zigzag' : ''}">
                              ${holeSummary.row2Holes.map(h => `
                                <span class="gh-micro-hole ${h.isPlanted ? 'is-planted' : 'is-empty'}"
                                      style="${h.isPlanted ? `background-color: ${h.color}; border-color: ${h.color};` : ''}"
                                      title="№${h.index}: ${escapeHtml(h.variety || 'свободно')}"></span>
                              `).join('')}
                            </div>
                          `}
                        </div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            } else {
              // Вертикальные рядки-колонки
              return `
                <div class="gh-internal-bed gh-internal-bed-vertical ${isSectionSelected ? 'gh-sec-selected' : ''} ${currentCrop ? 'is-planted-bed' : ''}"
                     data-bed-id="${bed.id}"
                     data-section-id="${sec.id}"
                     data-crop-id="${currentCrop ? currentCrop.id : ''}"
                     data-crop-family="${currentCrop ? (currentCrop.family || '') : ''}"
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

                  <!-- Центр: Кнопка посадки или овощ с понятными сортами -->
                  <div class="gh-v-body">
                    ${currentCrop ? `
                      <div class="gh-v-crop-card">
                        <div class="gh-v-crop-avatar" title="${escapeHtml(currentCropName)}">${cropSvg}</div>
                        <div class="gh-v-crop-title" title="${escapeHtml(currentCropName)}">${escapeHtml(cleanCropName)}</div>
                        
                        ${holeSummary && holeSummary.varieties.length > 0 ? `
                          <!-- Вариант 1: Компактная цветная мини-лента лунок со схемой -->
                          <div class="gh-holes-micro-strip is-vertical pattern-${holeSummary.pattern}" data-bed-id="${bed.id}" data-section-id="${sec.id}" title="Схема посадки: ${holeSummary.patternName} • ${holeSummary.plantedCount} из ${holeSummary.totalHoles} высажено">
                            ${holeSummary.pattern === 'single' ? `
                              <div class="gh-holes-micro-row row-1">
                                ${holeSummary.row1Holes.map(h => `
                                  <span class="gh-micro-hole ${h.isPlanted ? 'is-planted' : 'is-empty'}"
                                        style="${h.isPlanted ? `background-color: ${h.color}; border-color: ${h.color};` : ''}"
                                        title="№${h.index}: ${escapeHtml(h.variety || 'свободно')}"></span>
                                `).join('')}
                              </div>
                            ` : `
                              <div class="gh-holes-micro-row row-1">
                                ${holeSummary.row1Holes.map(h => `
                                  <span class="gh-micro-hole ${h.isPlanted ? 'is-planted' : 'is-empty'}"
                                        style="${h.isPlanted ? `background-color: ${h.color}; border-color: ${h.color};` : ''}"
                                        title="№${h.index}: ${escapeHtml(h.variety || 'свободно')}"></span>
                                `).join('')}
                              </div>
                              <div class="gh-holes-micro-row row-2 ${holeSummary.pattern === 'zigzag' ? 'is-zigzag' : ''}">
                                ${holeSummary.row2Holes.map(h => `
                                  <span class="gh-micro-hole ${h.isPlanted ? 'is-planted' : 'is-empty'}"
                                        style="${h.isPlanted ? `background-color: ${h.color}; border-color: ${h.color};` : ''}"
                                        title="№${h.index}: ${escapeHtml(h.variety || 'свободно')}"></span>
                                `).join('')}
                              </div>
                            `}
                          </div>

                          <!-- Вариант 2: Кнопка выпадающего списка сортов со схемой -->
                          <button type="button" class="gh-varieties-dropdown-btn is-compact" data-bed-id="${bed.id}" data-section-id="${sec.id}" title="Схема: ${holeSummary.patternName}">
                            <span class="gh-btn-pattern-icon">${holeSummary.patternIcon}</span>
                            <span class="gh-btn-var-dot" style="background-color: ${holeSummary.varieties[0]?.color || '#10b981'};"></span>
                            <span class="gh-btn-var-label">
                              ${holeSummary.varieties.length === 1 
                                ? escapeHtml(holeSummary.varieties[0].variety)
                                : `${holeSummary.varieties.length} сорт.`}
                            </span>
                            <span class="gh-btn-arrow">▾</span>
                          </button>

                          <div class="gh-v-summary-pill">
                            🌱 ${holeSummary.plantedCount}/${holeSummary.totalHoles}
                          </div>
                        ` : (displayVariety ? `
                          <span class="gh-v-variety-label" title="${escapeHtml(displayVariety)}">${escapeHtml(displayVariety)}</span>
                        ` : '')}
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
    const holes = currentPlanting?.holes || [];
    let currentCrop = currentPlanting?.cropId ? getCropById(currentPlanting.cropId) : null;

    // Авто-восстановление/подстановка культуры из лунок, если она не была выбрана отдельно
    if (!currentCrop && holes.length > 0) {
      const holeWithCrop = holes.find(h => h && h.cropId);
      const derivedCropId = holeWithCrop ? holeWithCrop.cropId : (holes.some(h => h && h.variety) ? 'tomato' : null);
      if (derivedCropId) {
        currentCrop = getCropById(derivedCropId);
        if (currentPlanting && !currentPlanting.cropId) {
          currentPlanting.cropId = derivedCropId;
        }
      }
    }

    const holeVarieties = holes.length > 0
      ? [...new Set(holes.filter(h => h && h.variety && h.variety.trim()).map(h => h.variety.trim()))]
      : [];
    const displayVariety = holeVarieties.length > 0
      ? holeVarieties.join(', ')
      : (currentPlanting?.variety || '');
    if (currentPlanting && !currentPlanting.variety && displayVariety) {
      currentPlanting.variety = displayVariety;
    }
    const holesPlantedCount = holes.filter(h => h && (h.cropId || (h.variety && h.variety.trim()))).length;

    const prevCrop = prevPlanting?.cropId ? getCropById(prevPlanting.cropId) : null;

    const currentLang = (typeof window !== 'undefined' && window.i18n) ? window.i18n.getLanguage() : 'ru';
    const tr = (k, p) => (typeof window !== 'undefined' && window.t ? window.t(k, p) : null);
    const bedDispName = (typeof window !== 'undefined' && window.i18n) ? window.i18n.getBedName(bed) : bed.name;
    const currentCropName = currentCrop ? (typeof getCropName === 'function' ? getCropName(currentCrop, currentLang) : currentCrop.name) : '';
    const prevCropName = prevCrop ? (typeof getCropName === 'function' ? getCropName(prevCrop, currentLang) : prevCrop.name) : '';
    const unplantedText = tr('unplanted') || (currentLang === 'et' ? 'Istutamata' : currentLang === 'lv' ? 'Neapstādīta' : currentLang === 'lt' ? 'Neapsodinta' : 'Не засеяно');
    const grownInText = tr('grown_in_year', { year: prevYear }) || `В ${prevYear} г. росло:`;

    const cleanCropName = currentCropName ? currentCropName.replace(/\s*\(.*?\)/g, '').trim() : '';
    const plantingPattern = currentPlanting?.plantingPattern || (holes.length > 15 ? 'zigzag' : 'single');
    const holeSummary = (holes.length > 0 && typeof summarizeHolePlantings === 'function')
      ? summarizeHolePlantings(holes, currentCrop, currentLang, plantingPattern)
      : null;

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
      <div class="bed-item ${bedTypeClass} ${isVertical ? 'orient-vertical' : 'orient-horizontal'} ${isSelected ? 'selected' : ''} ${currentCrop ? 'is-planted-bed' : ''}"
           id="bed-el-${bed.id}"
           data-bed-id="${bed.id}"
           data-crop-id="${currentCrop ? currentCrop.id : ''}"
           data-crop-family="${currentCrop ? (currentCrop.family || '') : ''}"
           style="
             left: ${leftPx}px;
             top: ${topPx}px;
             width: ${widthPx}px;
             height: ${heightPx}px;
             --family-color: ${familyColor};
           "
           title="${escapeHtml(bedDispName)}: ${currentCrop ? escapeHtml(currentCropName) : escapeHtml(unplantedText)}">
        
        <!-- Excel-закладка («хвостик») сверху для названия и перемещения грядки (включает статус севооборота в ряд) -->
        <div class="bed-tab-handle" data-bed-id="${bed.id}" title="${escapeHtml(tr('drag_handle_title') || 'Зажмите и тяните за хвостик для перемещения грядки')}">
          <span class="bed-tab-icon">${typeIcon}</span>
          <span class="bed-tab-title">${escapeHtml(bedDispName)}</span>
          ${statusBadge ? `<span class="bed-tab-rot-wrap">${statusBadge}</span>` : ''}
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
        <div class="bed-main-row" style="flex-direction: column; align-items: stretch; gap: 4px;">
          ${currentCrop ? `
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <div class="bed-crop-lead">
                <div class="crop-svg-avatar">${cropSvgIcon}</div>
                <strong class="crop-name">${escapeHtml(cleanCropName)}</strong>
              </div>
              <div style="display: flex; align-items: center; gap: 5px;">
                ${holeSummary && holeSummary.varieties.length > 0 ? `
                  <button type="button" class="gh-varieties-dropdown-btn" data-bed-id="${bed.id}" title="Схема: ${holeSummary.patternName}. Нажмите для просмотра сортов">
                    <span class="gh-btn-pattern-icon" title="Схема: ${holeSummary.patternName}">${holeSummary.patternIcon}</span>
                    <span class="gh-btn-var-dot" style="background-color: ${holeSummary.varieties[0]?.color || '#10b981'};"></span>
                    <span class="gh-btn-var-label">
                      ${holeSummary.varieties.length === 1 
                        ? escapeHtml(holeSummary.varieties[0].variety)
                        : `${holeSummary.varieties.length} ${holeSummary.varieties.length < 5 ? 'сорта' : 'сортов'}`}
                    </span>
                    <span class="gh-btn-arrow">▾</span>
                  </button>
                  <span class="gh-holes-chip-count" title="${holeSummary.plantedCount} кустов высажено из ${holeSummary.totalHoles} лунок">🌱 ${holeSummary.plantedCount}/${holeSummary.totalHoles}</span>
                ` : (displayVariety ? `
                  <span class="crop-variety">${escapeHtml(displayVariety)}</span>
                ` : '')}

                ${this.showPreviousYearOverlay && prevCrop ? `
                  <span class="bed-prev-year-pill" title="${escapeHtml(grownInText)} ${escapeHtml(prevCropName)}">
                    <span class="prev-year-num">${prevYear}:</span>
                    <span class="prev-crop-svg">${prevCropSvgIcon}</span>
                  </span>
                ` : ''}
              </div>
            </div>

            ${holeSummary && holeSummary.varieties.length > 0 ? `
              <div class="gh-bed-h-bottom-row">
                <div class="gh-holes-micro-strip pattern-${holeSummary.pattern}" data-bed-id="${bed.id}" title="Схема посадки: ${holeSummary.patternName} • ${holeSummary.plantedCount} из ${holeSummary.totalHoles} высажено">
                  ${holeSummary.pattern === 'single' ? `
                    <div class="gh-holes-micro-row row-1">
                      ${holeSummary.row1Holes.map(h => `
                        <span class="gh-micro-hole ${h.isPlanted ? 'is-planted' : 'is-empty'}"
                              style="${h.isPlanted ? `background-color: ${h.color}; border-color: ${h.color};` : ''}"
                              title="№${h.index}: ${escapeHtml(h.variety || 'свободно')}"></span>
                      `).join('')}
                    </div>
                  ` : `
                    <div class="gh-holes-micro-row row-1">
                      ${holeSummary.row1Holes.map(h => `
                        <span class="gh-micro-hole ${h.isPlanted ? 'is-planted' : 'is-empty'}"
                              style="${h.isPlanted ? `background-color: ${h.color}; border-color: ${h.color};` : ''}"
                              title="№${h.index}: ${escapeHtml(h.variety || 'свободно')}"></span>
                      `).join('')}
                    </div>
                    <div class="gh-holes-micro-row row-2 ${holeSummary.pattern === 'zigzag' ? 'is-zigzag' : ''}">
                      ${holeSummary.row2Holes.map(h => `
                        <span class="gh-micro-hole ${h.isPlanted ? 'is-planted' : 'is-empty'}"
                              style="${h.isPlanted ? `background-color: ${h.color}; border-color: ${h.color};` : ''}"
                              title="№${h.index}: ${escapeHtml(h.variety || 'свободно')}"></span>
                      `).join('')}
                    </div>
                  `}
                </div>
              </div>
            ` : ''}
          ` : `
            <div class="bed-crop-empty">
              <span class="empty-plus">➕</span>
              <span class="empty-text">${escapeHtml(unplantedText)}</span>
            </div>
          `}
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
        if (e.target.closest('.gh-tool-btn') || e.target.closest('.bed-action-mini') || e.target.closest('.gh-varieties-dropdown-btn') || e.target.closest('.gh-holes-micro-strip')) return;
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
        if (e.target.closest('.gh-tool-btn') || e.target.closest('.bed-action-mini') || e.target.closest('.gh-varieties-dropdown-btn') || e.target.closest('.gh-holes-micro-strip')) return;
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

    // Вариант 1 + Вариант 2: клик по цветным меткам лунок или кнопке выпадающего списка
    this.bedsLayerEl.querySelectorAll('.gh-varieties-dropdown-btn, .gh-holes-micro-strip').forEach(el => {
      el.addEventListener('mousedown', (e) => e.stopPropagation());
      el.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const bedId = el.getAttribute('data-bed-id');
        const sectionId = el.getAttribute('data-section-id') || null;
        this.showVarietiesPopover(el, bedId, sectionId);
      });
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
    // Если на экране оставалось открыто модальное окно, закрываем его
    const modal = document.getElementById('general-modal');
    if (modal && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }

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
    this.closeVarietiesPopover();
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
    if (this.dragDecorState && this.dragDecorState.isDragging) {
      const dxMeters = ((e.clientX - this.dragDecorState.startX) / this.zoom) / this.meterPixels;
      const dyMeters = ((e.clientY - this.dragDecorState.startY) / this.zoom) / this.meterPixels;
      let targetX = Math.round((this.dragDecorState.initialX + dxMeters) / this.gridSnap) * this.gridSnap;
      let targetY = Math.round((this.dragDecorState.initialY + dyMeters) / this.gridSnap) * this.gridSnap;
      targetX = Math.max(-50, Math.min(100, targetX));
      targetY = Math.max(-50, Math.min(100, targetY));
      this._dragDecorPendingX = targetX;
      this._dragDecorPendingY = targetY;
      const el = document.getElementById(`decor-el-${this.dragDecorState.decorId}`);
      if (el) {
        el.style.left = `${targetX * this.meterPixels}px`;
        el.style.top = `${targetY * this.meterPixels}px`;
      }
      return;
    }

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
      // Разрешаем свободное перемещение по всей координатной сетке огорода (-50м ... +100м)
      targetX = Math.max(-50, Math.min(100, targetX));
      targetY = Math.max(-50, Math.min(100, targetY));

      this._dragPendingX = targetX;
      this._dragPendingY = targetY;
      if (!this._dragRafId) {
        this._dragRafId = window.requestAnimationFrame(() => {
          this._dragRafId = null;
          const bedEl = document.getElementById(`bed-el-${this.dragBedState.bedId}`);
          if (bedEl && this.dragBedState.isDragging) {
            bedEl.style.left = `${this._dragPendingX * this.meterPixels}px`;
            bedEl.style.top = `${this._dragPendingY * this.meterPixels}px`;
          }
        });
      }
      return;
    }

    if (this.panState.isPanning) {
      const dx = e.clientX - this.panState.startX;
      const dy = e.clientY - this.panState.startY;

      this.panX = this.panState.initialPanX + dx;
      this.panY = this.panState.initialPanY + dy;
      if (!this._panRafId) {
        this._panRafId = window.requestAnimationFrame(() => {
          this._panRafId = null;
          this.updateTransform();
        });
      }
    }
  }

  handleGlobalMouseUp() {
    if (this.dragDecorState && this.dragDecorState.isDragging) {
      const el = document.getElementById(`decor-el-${this.dragDecorState.decorId}`);
      if (el) el.classList.remove('dragging');
      if (this._dragDecorPendingX !== undefined && this._dragDecorPendingY !== undefined) {
        this.storage.updateDecorItemPosition(this.dragDecorState.decorId, this._dragDecorPendingX, this._dragDecorPendingY);
      }
      this.dragDecorState.isDragging = false;
      this.dragDecorState.decorId = null;
      this._dragDecorPendingX = undefined;
      this._dragDecorPendingY = undefined;
      return;
    }

    if (this._panRafId) {
      window.cancelAnimationFrame(this._panRafId);
      this._panRafId = null;
      this.updateTransform();
    }
    if (this._dragRafId) {
      window.cancelAnimationFrame(this._dragRafId);
      this._dragRafId = null;
    }
    if (this.dragBedState.isDragging) {
      const bedEl = document.getElementById(`bed-el-${this.dragBedState.bedId}`);
      if (bedEl) {
        bedEl.classList.remove('dragging');
      }

      if (this.dragBedState.hasMoved) {
        let newX = (this._dragPendingX !== undefined && this._dragPendingX !== null)
          ? this._dragPendingX
          : (bedEl ? parseFloat((parseFloat(bedEl.style.left) / this.meterPixels).toFixed(2)) : 0);
        let newY = (this._dragPendingY !== undefined && this._dragPendingY !== null)
          ? this._dragPendingY
          : (bedEl ? parseFloat((parseFloat(bedEl.style.top) / this.meterPixels).toFixed(2)) : 0);

        // Предотвращаем утаскивание грядки за пределы рабочей зоны
        newX = Math.max(-50, Math.min(100, newX));
        newY = Math.max(-50, Math.min(100, newY));

        if (bedEl) {
          bedEl.style.left = `${newX * this.meterPixels}px`;
          bedEl.style.top = `${newY * this.meterPixels}px`;
        }

        const bed = this.storage.getBedById(this.dragBedState.bedId);
        if (bed) {
          bed.x = newX;
          bed.y = newY;
          this.storage.saveBed(bed);
        }
      }

      this.dragBedState.isDragging = false;
      this.dragBedState.bedId = null;
      this._dragPendingX = null;
      this._dragPendingY = null;
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

  closeVarietiesPopover() {
    if (this.activeVarietiesPopover) {
      if (this.activeVarietiesPopover.triggerBtn) {
        this.activeVarietiesPopover.triggerBtn.classList.remove('active');
      }
      if (this.activeVarietiesPopover.element && this.activeVarietiesPopover.element.parentNode) {
        this.activeVarietiesPopover.element.parentNode.removeChild(this.activeVarietiesPopover.element);
      }
      this.activeVarietiesPopover = null;
    }
  }

  showVarietiesPopover(triggerEl, bedId, sectionId = null) {
    if (this.activeVarietiesPopover && this.activeVarietiesPopover.triggerBtn === triggerEl) {
      this.closeVarietiesPopover();
      return;
    }

    this.closeVarietiesPopover();

    const bed = this.storage.getBedById(bedId);
    if (!bed) return;

    const activeYear = this.storage.getActiveYear();
    let sec = null;
    let planting = null;
    let secOrBedName = bed.name || 'Грядка';

    if (sectionId && Array.isArray(bed.sections)) {
      sec = bed.sections.find(s => s.id === sectionId);
      if (sec) {
        planting = sec.history?.[activeYear] || null;
        secOrBedName = `${bed.name || 'Теплица'} • ${sec.name || 'Рядок'}`;
      }
    }
    if (!planting) {
      planting = bed.history?.[activeYear] || null;
    }

    const holes = planting?.holes || [];
    if (!holes.length) return;

    const cropId = planting?.cropId || holes.find(h => h && h.cropId)?.cropId || 'tomato';
    const crop = getCropById(cropId);
    const cropName = crop ? (typeof getCropName === 'function' ? getCropName(crop, this.currentLang) : crop.name) : 'Культура';
    const pattern = planting?.plantingPattern || (holes.length > 15 ? 'zigzag' : 'single');
    const holeSummary = (typeof summarizeHolePlantings === 'function') ? summarizeHolePlantings(holes, crop, this.currentLang, pattern) : null;
    if (!holeSummary) return;

    const popover = document.createElement('div');
    popover.id = 'garden-varieties-popover';
    popover.className = 'garden-varieties-popover';

    popover.innerHTML = `
      <div class="gvp-header">
        <div class="gvp-header-lead">
          <span class="gvp-crop-icon">${crop?.emoji || '🌱'}</span>
          <div>
            <div class="gvp-title">${escapeHtml(secOrBedName)}</div>
            <div class="gvp-subtitle">${escapeHtml(cropName)} • ${holeSummary.totalHoles} лунок</div>
          </div>
        </div>
        <button type="button" class="gvp-close-btn" title="Закрыть">✕</button>
      </div>

      <!-- Бейдж схемы посадки -->
      <div class="gvp-pattern-strip">
        <span class="gvp-pattern-pill" title="Тип размещения лунок">
          ${holeSummary.patternIcon} Схема: <strong>${holeSummary.patternName}</strong>
        </span>
        <span class="gvp-stat-pill">🌱 ${holeSummary.plantedCount}/${holeSummary.totalHoles} шт</span>
      </div>

      <!-- Наглядная 2D мини-схема лунок в поповере -->
      <div class="gvp-board-wrap">
        <div class="gvp-board ${holeSummary.pattern === 'zigzag' ? 'is-zigzag' : (holeSummary.pattern === 'single' ? 'is-single' : 'is-double')}">
          ${holeSummary.pattern === 'single' ? `
            <div class="gvp-board-row">
              <span class="gvp-board-label">Ряд:</span>
              <div class="gvp-board-cells">
                ${holeSummary.row1Holes.map(h => `
                  <span class="gvp-board-cell ${h.isPlanted ? 'is-planted' : 'is-empty'}"
                        style="${h.isPlanted ? `background-color: ${h.color}; border-color: ${h.color};` : ''}"
                        title="№${h.index}: ${escapeHtml(h.variety || 'свободно')}">${h.index}</span>
                `).join('')}
              </div>
            </div>
          ` : `
            <div class="gvp-board-row">
              <span class="gvp-board-label">Ряд 1:</span>
              <div class="gvp-board-cells">
                ${holeSummary.row1Holes.map(h => `
                  <span class="gvp-board-cell ${h.isPlanted ? 'is-planted' : 'is-empty'}"
                        style="${h.isPlanted ? `background-color: ${h.color}; border-color: ${h.color};` : ''}"
                        title="№${h.index}: ${escapeHtml(h.variety || 'свободно')}">${h.index}</span>
                `).join('')}
              </div>
            </div>
            <div class="gvp-board-row">
              <span class="gvp-board-label">Ряд 2:</span>
              <div class="gvp-board-cells ${holeSummary.pattern === 'zigzag' ? 'zigzag-offset' : ''}">
                ${holeSummary.row2Holes.map(h => `
                  <span class="gvp-board-cell ${h.isPlanted ? 'is-planted' : 'is-empty'}"
                        style="${h.isPlanted ? `background-color: ${h.color}; border-color: ${h.color};` : ''}"
                        title="№${h.index}: ${escapeHtml(h.variety || 'свободно')}">${h.index}</span>
                `).join('')}
              </div>
            </div>
          `}
        </div>
      </div>

      <div class="gvp-bar">
        ${holeSummary.varieties.map(v => `
          <div class="gvp-bar-segment" style="width: ${(v.count / holeSummary.totalHoles) * 100}%; background-color: ${v.color};" title="${escapeHtml(v.variety)}: ${v.count} шт (${escapeHtml(v.rangeText)})"></div>
        `).join('')}
        ${holeSummary.emptyCount > 0 ? `
          <div class="gvp-bar-segment is-empty" style="width: ${(holeSummary.emptyCount / holeSummary.totalHoles) * 100}%;" title="Свободно: ${holeSummary.emptyCount} шт"></div>
        ` : ''}
      </div>

      <div class="gvp-list">
        ${holeSummary.varieties.map(v => `
          <div class="gvp-item">
            <span class="gvp-dot" style="background-color: ${v.color};"></span>
            <div class="gvp-item-body">
              <div class="gvp-item-main">
                <strong class="gvp-var-name">${escapeHtml(v.variety)}</strong>
                <span class="gvp-var-count">${v.count} шт</span>
              </div>
              <div class="gvp-item-meta">
                <span class="gvp-var-range">Лунки: <strong>${escapeHtml(v.rangeText)}</strong></span>
              </div>
            </div>
          </div>
        `).join('')}

        ${holeSummary.emptyCount > 0 ? `
          <div class="gvp-item is-empty">
            <span class="gvp-dot is-empty"></span>
            <div class="gvp-item-body">
              <div class="gvp-item-main">
                <span class="gvp-empty-label">Свободные лунки</span>
                <span class="gvp-var-count">${holeSummary.emptyCount} шт</span>
              </div>
              <div class="gvp-item-meta">
                <span class="gvp-empty-range">${escapeHtml(holeSummary.emptyRangeText || 'не засажены')}</span>
              </div>
            </div>
          </div>
        ` : ''}
      </div>

      <div class="gvp-footer">
        <span class="gvp-footer-stat">Высажено: <strong>${holeSummary.plantedCount}</strong> из <strong>${holeSummary.totalHoles}</strong> кустов</span>
        <button type="button" class="btn btn-sm btn-primary gvp-edit-holes-btn">Настроить лунки ✏️</button>
      </div>
    `;

    document.body.appendChild(popover);

    triggerEl.classList.add('active');
    this.activeVarietiesPopover = {
      element: popover,
      triggerBtn: triggerEl
    };

    const rect = triggerEl.getBoundingClientRect();
    const popoverWidth = 320;
    let left = rect.left;
    let top = rect.bottom + 8;

    if (left + popoverWidth > window.innerWidth - 12) {
      left = window.innerWidth - popoverWidth - 12;
    }
    if (left < 12) left = 12;

    const popoverHeight = popover.offsetHeight || 320;
    if (top + popoverHeight > window.innerHeight - 12) {
      top = Math.max(12, rect.top - popoverHeight - 8);
    }

    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;

    popover.querySelector('.gvp-close-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeVarietiesPopover();
    });

    popover.querySelector('.gvp-edit-holes-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeVarietiesPopover();
      this.selectBed(bedId, sectionId);
      setTimeout(() => {
        const box = document.getElementById('inspector-holes-box');
        if (box) {
          box.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 250);
    });
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
