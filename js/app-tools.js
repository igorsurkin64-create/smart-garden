/**
 * Модуль инструментов ухода за грядками, водой и медиа:
 * - setupInspectorWaterCalculator: Расчёт полива конкретной грядки
 * - setupInspectorCareLog: Журнал подкормок и обработок грядки
 * - setupInspectorPhotos: Загрузка и галерея фотографий урожая
 * - compressPhotoFile: Сжатие фото на Canvas перед сохранением
 * - openPhotoLightbox: Полноэкранный просмотр фотографий урожая
 * - openGardenWaterModal: Сводный калькулятор расхода воды всего огорода
 * - openStorageFullModal: Экстренное окно при переполнении памяти
 */

(function() {
  if (typeof GardenApp === 'undefined') {
    console.error('GardenApp is not defined. Ensure js/app.js is loaded first.');
    return;
  }

  Object.assign(GardenApp.prototype, {
  setupInspectorWaterCalculator(bed, area, cropId, lang = 'ru') {
    const statsBox = document.getElementById('bed-water-stats');
    const rateBadge = document.getElementById('bed-water-rate');
    const pills = document.querySelectorAll('#inspector-water-box .btn-weather-pill');
    if (!statsBox) return;

    let currentWeather = 'normal';

    const render = () => {
      const isGh = bed.type === 'greenhouse';
      const norm = calculateBedWaterNorm(cropId, area || (bed.width * bed.height), isGh, currentWeather);

      if (rateBadge) {
        rateBadge.textContent = norm.baseLitersM2 > 0 ? `~${norm.baseLitersM2} л/м² в нед.` : 'Отдых почвы';
      }

      statsBox.innerHTML = `
        <div class="water-metric-row">
          <div>
            <div class="water-metric-val">💧 ~${norm.weeklyLiters} литров</div>
            <div class="water-submetric">в неделю на эту грядку (~${norm.weeklyBuckets10L} вёдер по 10 л)</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 800; font-size: 0.82rem; color: #0284c7;">${escapeHtml(norm.frequencyDays)}</div>
            <div class="water-submetric">по ~${norm.singleWateringLiters} л за раз</div>
          </div>
        </div>
        <div class="water-advice-box">
          <strong>💡 Метод и температура:</strong> ${escapeHtml(norm.temperature)}, ${escapeHtml(norm.method)}.<br>
          <em>${escapeHtml(norm.tipsRu)}</em>
        </div>
      `;
    };

    pills.forEach(btn => {
      btn.onclick = () => {
        pills.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        currentWeather = btn.getAttribute('data-weather');
        render();
      };
    });

    render();
  },

  setupInspectorCareLog(bed, activeSection, year, lang = 'ru') {
    const box = document.getElementById('inspector-care-box');
    const toggleBtn = document.getElementById('btn-toggle-add-care');
    const form = document.getElementById('care-add-form');
    const listEl = document.getElementById('care-log-list');
    const saveBtn = document.getElementById('care-save-btn');
    const cancelBtn = document.getElementById('care-cancel-btn');
    const dateInput = document.getElementById('care-input-date');
    const typeSelect = document.getElementById('care-input-type');
    const titleInput = document.getElementById('care-input-title');
    const noteInput = document.getElementById('care-input-note');
    const presetBtns = document.querySelectorAll('.chip-preset-btn');

    if (!box || !listEl) return;

    const secId = activeSection ? activeSection.id : null;

    const renderList = () => {
      const logs = this.storage.getBedCareLogs(bed.id, year, secId);
      if (!logs.length) {
        listEl.innerHTML = `<div class="text-xs text-muted" style="text-align: center; padding: 6px 0;">Записей об обработках за ${year} год пока нет. Нажмите «➕ Записать».</div>`;
        return;
      }

      listEl.innerHTML = logs.map(entry => {
        const typeLabels = {
          fertilizer: { label: '🧪 Подкормка', cls: 'care-tag-fertilizer' },
          protection: { label: '🛡️ Защита', cls: 'care-tag-protection' },
          care: { label: '✂️ Уход', cls: 'care-tag-care' }
        };
        const tInfo = typeLabels[entry.type] || { label: '🌿 Обработка', cls: 'care-tag-care' };

        return `
          <div class="care-entry-card" id="care-card-${entry.id}">
            <div class="care-entry-left">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="care-date-badge">${escapeHtml(entry.date)}</span>
                <span class="care-tag ${tInfo.cls}">${tInfo.label}</span>
              </div>
              <div class="care-title-text">${escapeHtml(entry.title)}</div>
              ${entry.note ? `<div class="care-note-text">${escapeHtml(entry.note)}</div>` : ''}
            </div>
            <button type="button" class="btn-care-del" data-log-id="${entry.id}" title="Удалить запись">&times;</button>
          </div>
        `;
      }).join('');

      listEl.querySelectorAll('.btn-care-del').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const logId = btn.getAttribute('data-log-id');
          this.storage.deleteBedCareLog(bed.id, year, logId, secId);
          renderList();
          this.showToast('Запись удалена из журнала');
        };
      });
    };

    if (toggleBtn && form) {
      toggleBtn.onclick = () => {
        const isHidden = form.style.display === 'none';
        form.style.display = isHidden ? 'block' : 'none';
        if (isHidden && titleInput) titleInput.focus();
      };
    }

    if (cancelBtn && form) {
      cancelBtn.onclick = () => {
        form.style.display = 'none';
      };
    }

    presetBtns.forEach(pBtn => {
      pBtn.onclick = () => {
        const pType = pBtn.getAttribute('data-type');
        const pTitle = pBtn.getAttribute('data-title');
        if (typeSelect) typeSelect.value = pType;
        if (titleInput) {
          titleInput.value = pTitle;
          titleInput.focus();
        }
      };
    });

    if (saveBtn) {
      saveBtn.onclick = () => {
        const title = (titleInput?.value || '').trim();
        if (!title) {
          this.showToast('Укажите название подкормки или действия', 'warning');
          titleInput?.focus();
          return;
        }

        const date = dateInput?.value || new Date().toISOString().split('T')[0];
        const type = typeSelect?.value || 'fertilizer';
        const note = (noteInput?.value || '').trim();

        this.storage.addBedCareLog(bed.id, year, { date, type, title, note }, secId);
        if (titleInput) titleInput.value = '';
        if (noteInput) noteInput.value = '';
        if (form) form.style.display = 'none';

        renderList();
        this.showToast('✓ Запись добавлена в агро-журнал грядки!');
      };
    }

    renderList();
  },

  async setupInspectorPhotos(bed, year, lang = 'ru') {
    const gridEl = document.getElementById('photos-gallery-grid');
    const fileInput = document.getElementById('photo-file-input');
    if (!gridEl || !fileInput) return;

    const renderGallery = async () => {
      gridEl.innerHTML = `<div class="text-xs text-muted">Загрузка фото...</div>`;
      const photos = await window.photoStorage.getPhotosByBed(bed.id, year);

      if (!photos || !photos.length) {
        gridEl.innerHTML = `<div class="text-xs text-muted" style="grid-column: 1 / -1; text-align: center; padding: 6px 0;">Фотографий за ${year} г. пока нет. Нажмите «📷 Добавить фото».</div>`;
        return;
      }

      gridEl.innerHTML = photos.map(p => `
        <div class="photo-card-thumb" data-photo-id="${p.id}" title="${escapeHtml(p.caption || p.date)}">
          <img src="${p.dataUrl}" class="photo-thumb-img" alt="Урожай" loading="lazy">
          <div class="photo-thumb-overlay">${escapeHtml(p.date.substring(5))} ${escapeHtml(p.caption)}</div>
          <button type="button" class="btn-photo-del" data-photo-id="${p.id}" title="Удалить фото">&times;</button>
        </div>
      `).join('');

      // Клик по фото открывает полноэкранный просмотр Lightbox
      gridEl.querySelectorAll('.photo-card-thumb').forEach(thumb => {
        thumb.onclick = (e) => {
          if (e.target.closest('.btn-photo-del')) return;
          const photoId = thumb.getAttribute('data-photo-id');
          const photo = photos.find(item => item.id === photoId);
          if (photo) this.openPhotoLightbox(photo, bed.name);
        };
      });

      // Удаление фото
      gridEl.querySelectorAll('.btn-photo-del').forEach(delBtn => {
        delBtn.onclick = async (e) => {
          e.stopPropagation();
          const photoId = delBtn.getAttribute('data-photo-id');
          if (confirm('Удалить эту фотографию урожая?')) {
            await window.photoStorage.deletePhoto(photoId);
            renderGallery();
            this.showToast('Фотография удалена');
          }
        };
      });
    };

    fileInput.onchange = async () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      this.showToast('⏳ Сжатие и сохранение фотографии...');

      try {
        const compressedDataUrl = await this.compressPhotoFile(file, 1024, 0.8);
        const caption = prompt('Подпись к фотографии (например: «Первый урожай томатов! 4 кг»):', '');
        const dateStr = new Date().toISOString().split('T')[0];

        await window.photoStorage.addPhoto(bed.id, year, compressedDataUrl, caption || '', dateStr);
        fileInput.value = '';
        renderGallery();
        this.showToast('✓ Фотография урожая успешно сохранена в базу!');
      } catch (err) {
        console.error('Ошибка сохранения фото:', err);
        this.showToast('Не удалось сохранить фото', 'error');
      }
    };

    renderGallery();
  },

  compressPhotoFile(file, maxDimension = 1024, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          if (w > maxDimension || h > maxDimension) {
            if (w > h) {
              h = Math.round((h * maxDimension) / w);
              w = maxDimension;
            } else {
              w = Math.round((w * maxDimension) / h);
              h = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  openPhotoLightbox(photo, bedName = '') {
    const existing = document.getElementById('app-photo-lightbox');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.id = 'app-photo-lightbox';
    div.className = 'photo-lightbox-modal';
    div.innerHTML = `
      <button type="button" class="photo-lightbox-close" aria-label="Закрыть">&times;</button>
      <img src="${photo.dataUrl}" class="photo-lightbox-img" alt="Фото урожая">
      <div class="photo-lightbox-caption">
        🌱 ${escapeHtml(bedName)} • ${escapeHtml(photo.date)}<br>
        ${photo.caption ? `<em>${escapeHtml(photo.caption)}</em>` : ''}
      </div>
    `;

    document.body.appendChild(div);
    div.onclick = (e) => {
      if (e.target.tagName !== 'IMG') div.remove();
    };
    div.querySelector('.photo-lightbox-close').onclick = () => div.remove();
  },

  openGardenWaterModal() {
    const modal = document.getElementById('general-modal');
    if (!modal) return;

    let modalContent = document.getElementById('modal-dynamic-content');
    if (!modalContent) {
      modalContent = document.createElement('div');
      modalContent.id = 'modal-dynamic-content';
      modal.innerHTML = '';
      modal.appendChild(modalContent);
    }

    const data = this.storage.getData();
    const activeYear = this.storage.getActiveYear();
    const currentLang = window.i18n ? window.i18n.getLanguage() : 'ru';
    const beds = data.beds || [];

    let currentWeather = 'normal';

    const render = () => {
      const stats = calculateTotalGardenWater(beds, activeYear, currentWeather);

      modalContent.innerHTML = `
        <div class="modal-content" style="max-width: 760px; max-height: 90vh; display: flex; flex-direction: column;">
          <div class="modal-header">
            <h3 style="display: flex; align-items: center; gap: 8px;">💧 Калькулятор полива огорода (${activeYear} г.)</h3>
            <button class="modal-close-btn">&times;</button>
          </div>
          <div class="modal-body" style="padding: 1rem; overflow-y: auto; flex: 1;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
              <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-muted);">Погодные условия на неделю:</span>
              <div class="water-weather-pills" style="display: flex; gap: 4px;">
                <button type="button" class="btn-weather-pill ${currentWeather === 'normal' ? 'active' : ''}" data-weather="normal">⛅ Умеренно (+20..24°C)</button>
                <button type="button" class="btn-weather-pill ${currentWeather === 'hot' ? 'active' : ''}" data-weather="hot">☀️ Жара и сушь (+28..32°C)</button>
                <button type="button" class="btn-weather-pill ${currentWeather === 'rainy' ? 'active' : ''}" data-weather="rainy">🌧️ Дождливая неделя</button>
              </div>
            </div>

            <div class="water-modal-grid">
              <div class="water-modal-stat-card">
                <div class="water-stat-num">💧 ~${stats.totalLiters} л</div>
                <div class="water-stat-lbl">Суммарный расход в неделю</div>
              </div>
              <div class="water-modal-stat-card">
                <div class="water-stat-num" style="color: #059669;">🪣 ~${stats.totalBuckets10L}</div>
                <div class="water-stat-lbl">Вёдер воды (по 10 литров)</div>
              </div>
              <div class="water-modal-stat-card">
                <div class="water-stat-num" style="color: #d97706;">🛢️ ~${stats.totalBarrels200L}</div>
                <div class="water-stat-lbl">Бочек воды (по 200 литров)</div>
              </div>
              <div class="water-modal-stat-card">
                <div class="water-stat-num" style="color: #2563eb;">🏡 ${stats.greenhouseLiters} л</div>
                <div class="water-stat-lbl">Теплицы (постоянный полив)</div>
              </div>
            </div>

            <h4 style="margin: 12px 0 6px 0; font-size: 0.92rem;">Разбивка по грядкам и культурам:</h4>
            <div style="overflow-x: auto; max-height: 260px; border: 1px solid var(--border-subtle); border-radius: 6px;">
              <table class="table-compact" style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">
                <thead>
                  <tr style="background: var(--bg-tertiary); text-align: left;">
                    <th style="padding: 6px 8px;">Грядка / Рядок</th>
                    <th style="padding: 6px 8px;">Культура</th>
                    <th style="padding: 6px 8px;">Площадь</th>
                    <th style="padding: 6px 8px;">Тип</th>
                    <th style="padding: 6px 8px; text-align: right;">Расход / нед.</th>
                  </tr>
                </thead>
                <tbody>
                  ${stats.breakdown.map(item => {
                    const c = getCropById(item.cropId);
                    return `
                      <tr style="border-top: 1px solid var(--border-subtle);">
                        <td style="padding: 5px 8px; font-weight: 700;">${escapeHtml(item.bedName)}</td>
                        <td style="padding: 5px 8px;">${c ? `${c.emoji} ${escapeHtml(getCropName(c, currentLang))}` : '<span class="text-muted">— пустует —</span>'}</td>
                        <td style="padding: 5px 8px;">${item.areaM2.toFixed(1)} м²</td>
                        <td style="padding: 5px 8px;">${item.isGreenhouse ? '🏡 Теплица' : '🌱 Открытый грунт'}</td>
                        <td style="padding: 5px 8px; text-align: right; font-weight: 800; color: #0284c7;">~${item.weeklyLiters} л</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div class="water-advice-box" style="margin-top: 10px;">
              <strong>💡 Советы агронома по экономии воды и поливу:</strong><br>
              • <strong>Мульчирование</strong> (соломой, скошенной травой или агротекстилем) снижает испарение влаги на 50-60%.<br>
              • В теплицах поливайте <strong>утром</strong>, чтобы к ночи влажность воздуха спала (профилактика кладоспориоза и серой гнили).<br>
              • Томаты и перцы любят глубокий редкий полив под корень, огурцы и капуста — частый поверхностный.
            </div>
          </div>
          <div class="modal-footer" style="display: flex; justify-content: flex-end; padding: 10px 16px;">
            <button class="btn btn-primary" id="water-modal-close-btn">Готово</button>
          </div>
        </div>
      `;

      modalContent.querySelector('.modal-close-btn').onclick = () => modal.classList.remove('active');
      modalContent.querySelector('#water-modal-close-btn').onclick = () => modal.classList.remove('active');

      modalContent.querySelectorAll('.btn-weather-pill').forEach(wBtn => {
        wBtn.onclick = () => {
          currentWeather = wBtn.getAttribute('data-weather');
          render();
        };
      });
    };

    modal.classList.add('active');
    render();
  },

  openStorageFullModal() {
    const modal = document.getElementById('general-modal');
    if (!modal) return;

    let modalContent = document.getElementById('modal-dynamic-content');
    if (!modalContent) {
      modalContent = document.createElement('div');
      modalContent.id = 'modal-dynamic-content';
      modal.innerHTML = '';
      modal.appendChild(modalContent);
    }

    modalContent.innerHTML = `
      <div class="modal-content" style="max-width: 520px; border-top: 5px solid #ef4444;">
        <div class="modal-header">
          <h3 style="color: #ef4444; display: flex; align-items: center; gap: 8px;">⚠️ Память браузера переполнена!</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body" style="font-size: 0.92rem; line-height: 1.5; color: var(--text-main);">
          <p><strong>Что произошло:</strong> Браузер исчерпал локальную квоту памяти для этой вкладки (обычно 5 МБ).</p>
          <div style="background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; padding: 10px 12px; border-radius: 6px; margin: 10px 0;">
            <strong style="color: #065f46;">Что делать, чтобы гарантированно спасти данные:</strong><br>
            Нажмите зелёную кнопку ниже — полный файл со всеми вашими грядками и посадками скачается на ваш компьютер или телефон. Все ваши данные будут в безопасности!
          </div>
        </div>
        <div class="modal-footer" style="display: flex; gap: 8px; justify-content: flex-end; padding: 10px 16px;">
          <button class="btn btn-outline" id="storage-full-close-btn">Закрыть</button>
          <button class="btn btn-primary" id="storage-full-download-btn" style="background: #10b981; border-color: #059669; font-weight: 700;">
            📥 Скачать резервную копию плана
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
    modalContent.querySelector('.modal-close-btn').onclick = () => modal.classList.remove('active');
    modalContent.querySelector('#storage-full-close-btn').onclick = () => modal.classList.remove('active');
    modalContent.querySelector('#storage-full-download-btn').onclick = () => {
      this.storage.exportJson();
      modal.classList.remove('active');
      this.showToast('✓ Резервная копия успешно сохранена в файл!');
    };
  },

  // ==========================================================================
  // СХЕМА ПОСАДКИ ПО ЛУНКАМ (ШАХМАТНЫЙ И РЯДОВЫЙ ПОРЯДОК) И КАТАЛОГ СОРТОВ
  // ==========================================================================

  setupInspectorHoles(bed, activeSection, activeYear, lang = 'ru') {
    const box = document.getElementById('inspector-holes-box');
    const badge = document.getElementById('bed-holes-badge');
    const content = document.getElementById('inspector-holes-content');
    if (!box || !content) return;

    const target = (bed.sections && bed.sections.length > 0 && activeSection) ? activeSection : bed;
    const planting = target.history?.[activeYear] || {};
    
    // Pattern: 'zigzag' (шахматка), 'double_parallel' (параллельно), 'single' (1 ряд)
    let currentPattern = planting.plantingPattern || 'zigzag';
    let holes = Array.isArray(planting.holes) ? JSON.parse(JSON.stringify(planting.holes)) : [];

    const bedLength = Math.max(bed.width, bed.height);
    const defaultHoleCount = currentPattern === 'single'
      ? Math.max(4, Math.min(24, Math.round(bedLength / 0.45)))
      : Math.max(6, Math.min(32, Math.round((bedLength / 0.45) * 2)));

    const VARIETY_COLORS = [
      '#059669', '#d97706', '#2563eb', '#7c3aed',
      '#dc2626', '#0891b2', '#ea580c', '#4f46e5',
      '#0d9488', '#b45309', '#1d4ed8', '#be185d'
    ];
    const getVarietyColor = (name) => {
      if (!name) return '#6b7280';
      let hash = 0;
      for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
      const idx = Math.abs(hash) % VARIETY_COLORS.length;
      return VARIETY_COLORS[idx];
    };

    let isExpanded = holes.length > 0;

    const render = async () => {
      if (holes.length === 0 && !isExpanded) {
        if (badge) badge.textContent = 'не настроена';
        content.innerHTML = `
          <div style="padding: 6px 0;">
            <p class="text-xs text-muted" style="margin: 0 0 6px 0;">
              Идеально для теплиц и парников: разметка посадки в шахматном порядке или рядами, несколько сортов на одной грядке и фото каждого куста.
            </p>
            <button type="button" class="btn btn-sm btn-outline" id="btn-enable-holes" style="border-color: #10b981; color: #10b981; font-weight: 700; width: 100%;">
              🌱 Включить схему лунок (шахматка / ряды)
            </button>
          </div>
        `;
        const enableBtn = content.querySelector('#btn-enable-holes');
        if (enableBtn) {
          enableBtn.onclick = () => {
            isExpanded = true;
            const initCount = defaultHoleCount;
            holes = [];
            for (let i = 1; i <= initCount; i++) {
              holes.push({
                index: i,
                cropId: planting.cropId || null,
                variety: planting.variety || '',
                note: ''
              });
            }
            render();
          };
        }
        return;
      }

      if (badge) {
        badge.textContent = `${holes.length} лунок`;
      }

      // Загружаем сохранённые сорта для вывода фото-миниатюр
      let savedVarieties = [];
      try {
        if (window.photoStorage) {
          savedVarieties = await window.photoStorage.getVarieties(planting.cropId || null);
        }
      } catch (e) {
        console.warn('Could not load varieties:', e);
      }
      const varietyMap = new Map();
      savedVarieties.forEach(v => varietyMap.set(v.name.trim().toLowerCase(), v));

      let row1Holes = [];
      let row2Holes = [];

      if (currentPattern === 'single') {
        row1Holes = holes;
      } else {
        holes.forEach((h, idx) => {
          if (idx % 2 === 0) row1Holes.push(h);
          else row2Holes.push(h);
        });
      }

      const renderHoleHtml = (h) => {
        const c = h.cropId ? getCropById(h.cropId) : (planting.cropId ? getCropById(planting.cropId) : null);
        const varietyText = (h.variety || planting.variety || '').trim();
        const vColor = getVarietyColor(varietyText);
        const vData = varietyText ? varietyMap.get(varietyText.toLowerCase()) : null;
        const photoUrl = vData ? vData.photoUrl : null;
        const isEmpty = !c && !varietyText;

        return `
          <button type="button" class="hole-slot-btn ${isEmpty ? 'empty' : ''}" data-hole-idx="${h.index - 1}" title="Лунка №${h.index}: ${escapeHtml(varietyText || 'Пусто')}">
            <span class="hole-slot-num">${h.index}</span>
            <div class="hole-slot-icon-wrap">
              <span class="hole-slot-emoji">${c ? c.emoji : '🌱'}</span>
              ${photoUrl ? `<img src="${photoUrl}" class="hole-slot-photo-thumb" alt="${escapeHtml(varietyText)}">` : ''}
            </div>
            ${varietyText ? `
              <span class="hole-slot-variety-badge" style="background: ${vColor};" title="${escapeHtml(varietyText)}">
                ${escapeHtml(varietyText)}
              </span>
            ` : `<span class="text-xs text-muted" style="font-size:0.6rem;">лунка</span>`}
          </button>
        `;
      };

      content.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; margin: 6px 0;">
          <div class="water-weather-pills" style="display: flex; gap: 4px;">
            <button type="button" class="btn-pattern-pill ${currentPattern === 'zigzag' ? 'active' : ''}" data-pattern="zigzag">⚡ В 2 ряда (шахматка)</button>
            <button type="button" class="btn-pattern-pill ${currentPattern === 'double_parallel' ? 'active' : ''}" data-pattern="double_parallel">═ В 2 ряда (ровно)</button>
            <button type="button" class="btn-pattern-pill ${currentPattern === 'single' ? 'active' : ''}" data-pattern="single">─ В 1 ряд</button>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <button type="button" class="btn btn-sm btn-outline" id="holes-count-minus" style="padding: 2px 7px; font-weight: 800;">−</button>
            <span style="font-size: 0.82rem; font-weight: 800; min-width: 50px; text-align: center;">${holes.length} шт</span>
            <button type="button" class="btn btn-sm btn-outline" id="holes-count-plus" style="padding: 2px 7px; font-weight: 800;">+</button>
          </div>
        </div>

        <!-- Доска грядки -->
        <div class="holes-bed-board">
          ${currentPattern === 'single' ? `
            <div class="holes-row-container">
              <div class="holes-row-label">Ряд:</div>
              <div class="holes-row-items">
                ${row1Holes.map(renderHoleHtml).join('')}
              </div>
            </div>
          ` : `
            <div class="holes-row-container">
              <div class="holes-row-label">Ряд 1:</div>
              <div class="holes-row-items">
                ${row1Holes.map(renderHoleHtml).join('')}
              </div>
            </div>
            <div class="holes-row-container">
              <div class="holes-row-label">Ряд 2:</div>
              <div class="holes-row-items ${currentPattern === 'zigzag' ? 'zigzag-offset' : ''}">
                ${row2Holes.map(renderHoleHtml).join('')}
              </div>
            </div>
          `}
        </div>

        <!-- Экспресс-заполнение диапазона лунок -->
        <div class="holes-batch-panel">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted);">⚡ Быстрое заполнение сортов:</span>
            <button type="button" class="btn-text text-xs" id="btn-open-variety-catalog" style="color: #10b981; font-weight: 700; cursor: pointer; text-decoration: underline;">
              🏷️ Картотека сортов
            </button>
          </div>
          <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
            <span class="text-xs">С:</span>
            <input type="number" id="batch-from" class="form-input" style="width: 44px; padding: 2px 4px; font-size: 0.8rem; text-align: center;" value="1" min="1" max="${holes.length}">
            <span class="text-xs">по:</span>
            <input type="number" id="batch-to" class="form-input" style="width: 44px; padding: 2px 4px; font-size: 0.8rem; text-align: center;" value="${Math.min(5, holes.length)}" min="1" max="${holes.length}">
            <input type="text" id="batch-variety" class="form-input" placeholder="Сорт (напр. Бычье сердце)..." style="flex: 1; min-width: 90px; padding: 3px 6px; font-size: 0.8rem;" value="${escapeHtml(planting.variety || '')}">
            <button type="button" class="btn btn-sm btn-primary" id="btn-batch-apply" style="padding: 3px 8px; font-size: 0.78rem;">Заполнить</button>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <button type="button" class="btn btn-sm btn-outline text-danger" id="btn-clear-holes" style="padding: 2px 6px; font-size: 0.76rem;">
            Сбросить лунки
          </button>
          <button type="button" class="btn btn-sm btn-primary" id="btn-save-holes" style="background: #10b981; border-color: #059669; font-weight: 700; padding: 4px 12px;">
            💾 Сохранить схему лунок
          </button>
        </div>
      `;

      // Event handlers
      content.querySelectorAll('.btn-pattern-pill').forEach(btn => {
        btn.onclick = () => {
          currentPattern = btn.getAttribute('data-pattern');
          render();
        };
      });

      const minusBtn = content.querySelector('#holes-count-minus');
      if (minusBtn) {
        minusBtn.onclick = () => {
          if (holes.length > 2) {
            holes.pop();
            render();
          }
        };
      }

      const plusBtn = content.querySelector('#holes-count-plus');
      if (plusBtn) {
        plusBtn.onclick = () => {
          if (holes.length < 40) {
            holes.push({
              index: holes.length + 1,
              cropId: planting.cropId || null,
              variety: planting.variety || '',
              note: ''
            });
            render();
          }
        };
      }

      // Batch apply
      const batchBtn = content.querySelector('#btn-batch-apply');
      if (batchBtn) {
        batchBtn.onclick = () => {
          const fromVal = parseInt(content.querySelector('#batch-from').value, 10);
          const toVal = parseInt(content.querySelector('#batch-to').value, 10);
          const fromIdx = Math.max(0, Math.min(holes.length - 1, fromVal - 1));
          const toIdx = Math.max(0, Math.min(holes.length - 1, toVal - 1));
          const varietyVal = content.querySelector('#batch-variety').value.trim();

          const start = Math.min(fromIdx, toIdx);
          const end = Math.max(fromIdx, toIdx);

          for (let i = start; i <= end; i++) {
            if (holes[i]) {
              holes[i].variety = varietyVal;
              if (planting.cropId) holes[i].cropId = planting.cropId;
            }
          }
          this.showToast(`Сорт «${varietyVal || '—'}» применён к лункам ${start + 1}–${end + 1}`);
          render();
        };
      }

      // Hole click -> open hole editor
      content.querySelectorAll('.hole-slot-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.getAttribute('data-hole-idx'), 10);
          this.openHoleEditModal(bed, activeSection, activeYear, idx, holes, currentPattern, (updatedHoles) => {
            holes = updatedHoles;
            render();
          });
        };
      });

      // Variety catalog button
      const catBtn = content.querySelector('#btn-open-variety-catalog');
      if (catBtn) {
        catBtn.onclick = () => {
          this.openVarietyCatalogModal(planting.cropId);
        };
      }

      // Save holes button
      const saveBtn = content.querySelector('#btn-save-holes');
      if (saveBtn) {
        saveBtn.onclick = () => {
          this.storage.updateBedHoles(bed.id, activeYear, holes, currentPattern, activeSection?.id);
          this.showToast('✓ Схема посадки по лункам успешно сохранена!');
          if (this.gardenMap) this.gardenMap.render();
          render();
        };
      }

      // Clear holes button
      const clearBtn = content.querySelector('#btn-clear-holes');
      if (clearBtn) {
        clearBtn.onclick = () => {
          if (confirm('Отключить схему лунок для этой грядки?')) {
            holes = [];
            isExpanded = false;
            this.storage.updateBedHoles(bed.id, activeYear, [], 'zigzag', activeSection?.id);
            this.showToast('Схема лунок сброшена');
            if (this.gardenMap) this.gardenMap.render();
            render();
          }
        };
      }
    };

    render();
  },

  openHoleEditModal(bed, activeSection, activeYear, holeIndex, holes, pattern, onSaveCallback) {
    const modal = document.getElementById('general-modal');
    if (!modal) return;
    let modalContent = document.getElementById('modal-dynamic-content');
    if (!modalContent) {
      modalContent = document.createElement('div');
      modalContent.id = 'modal-dynamic-content';
      modal.innerHTML = '';
      modal.appendChild(modalContent);
    }

    const hole = holes[holeIndex] || { index: holeIndex + 1, cropId: null, variety: '', note: '' };
    const target = (bed.sections && bed.sections.length > 0 && activeSection) ? activeSection : bed;
    const planting = target.history?.[activeYear] || {};
    const effectiveCropId = hole.cropId || planting.cropId || 'tomato';

    let currentPhotoUrl = null;

    const renderModal = async () => {
      // Ищем фото сорта в каталоге
      if (hole.variety && window.photoStorage) {
        const v = await window.photoStorage.getVarietyByName(effectiveCropId, hole.variety);
        if (v && v.photoUrl) currentPhotoUrl = v.photoUrl;
      }

      let varietySuggestions = [];
      if (window.photoStorage) {
        varietySuggestions = await window.photoStorage.getVarieties(effectiveCropId);
      }

      modalContent.innerHTML = `
        <div class="modal-content" style="max-width: 480px;">
          <div class="modal-header">
            <h3 style="display: flex; align-items: center; gap: 8px;">
              🌱 Настройка лунки №${hole.index}
            </h3>
            <button class="modal-close-btn">&times;</button>
          </div>
          <div class="modal-body" style="padding: 1rem;">
            <div class="form-group mb-3">
              <label class="form-sublabel" style="font-weight: 700;">Культура (растение):</label>
              <select id="hole-crop-select" class="form-input">
                ${Object.values(CROPS_DATA).map(c => `
                  <option value="${c.id}" ${(hole.cropId || effectiveCropId) === c.id ? 'selected' : ''}>
                    ${c.emoji} ${escapeHtml(c.name)}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group mb-3">
              <label class="form-sublabel" style="font-weight: 700;">Сорт или гибрид:</label>
              <input type="text" id="hole-variety-input" class="form-input" list="hole-variety-datalist" placeholder="Например: Бычье сердце, Кураж F1..." value="${escapeHtml(hole.variety || '')}">
              <datalist id="hole-variety-datalist">
                ${varietySuggestions.map(v => `<option value="${escapeHtml(v.name)}">`).join('')}
              </datalist>
            </div>

            <!-- Фотография сорта -->
            <div class="form-group mb-3" style="background: var(--bg-secondary); padding: 10px; border-radius: 8px; border: 1px dashed var(--border-subtle);">
              <div style="font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: space-between;">
                <span>📸 Фото сорта (пакетик семян или плод):</span>
                ${currentPhotoUrl ? `<button type="button" class="btn-text text-danger text-xs" id="btn-remove-variety-photo">Удалить фото</button>` : ''}
              </div>
              
              <div id="hole-variety-photo-preview" style="margin: 6px 0; text-align: center;">
                ${currentPhotoUrl ? `
                  <img src="${currentPhotoUrl}" style="max-height: 120px; max-width: 100%; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);" alt="Фото сорта">
                ` : `
                  <div style="font-size: 0.78rem; color: var(--text-muted); padding: 8px 0;">
                    Сфотографируйте пакетик с семенами или урожай — фото сохранится в картотеку сортов.
                  </div>
                `}
              </div>

              <label class="btn btn-sm btn-outline" style="cursor: pointer; text-align: center; display: block;">
                📷 ${currentPhotoUrl ? 'Заменить фотографию' : 'Загрузить / сфотографировать сорт'}
                <input type="file" id="hole-photo-file-input" accept="image/*" style="display: none;">
              </label>
            </div>

            <div class="form-group mb-2">
              <label class="form-sublabel">Заметка к лунке (необязательно):</label>
              <input type="text" id="hole-note-input" class="form-input" placeholder="Дата высадки рассады, прищипка, полив..." value="${escapeHtml(hole.note || '')}">
            </div>
          </div>
          <div class="modal-footer" style="display: flex; gap: 8px; justify-content: flex-end; padding: 10px 16px;">
            <button class="btn btn-outline" id="hole-modal-cancel-btn">Отмена</button>
            <button class="btn btn-primary" id="hole-modal-save-btn">💾 Сохранить лунку</button>
          </div>
        </div>
      `;

      modalContent.querySelector('.modal-close-btn').onclick = () => modal.classList.remove('active');
      modalContent.querySelector('#hole-modal-cancel-btn').onclick = () => modal.classList.remove('active');

      const photoInput = modalContent.querySelector('#hole-photo-file-input');
      if (photoInput) {
        photoInput.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          try {
            const compressed = await this.compressPhotoFile(file, 1024, 0.8);
            currentPhotoUrl = compressed;
            const varName = modalContent.querySelector('#hole-variety-input').value.trim() || 'Без названия';
            const cId = modalContent.querySelector('#hole-crop-select').value;
            if (window.photoStorage) {
              await window.photoStorage.saveVariety(cId, varName, compressed);
            }
            renderModal();
          } catch (err) {
            alert('Ошибка сжатия фотографии: ' + err.message);
          }
        };
      }

      const removePhotoBtn = modalContent.querySelector('#btn-remove-variety-photo');
      if (removePhotoBtn) {
        removePhotoBtn.onclick = () => {
          currentPhotoUrl = null;
          renderModal();
        };
      }

      const saveBtn = modalContent.querySelector('#hole-modal-save-btn');
      if (saveBtn) {
        saveBtn.onclick = async () => {
          const newCrop = modalContent.querySelector('#hole-crop-select').value;
          const newVariety = modalContent.querySelector('#hole-variety-input').value.trim();
          const newNote = modalContent.querySelector('#hole-note-input').value.trim();

          hole.cropId = newCrop;
          hole.variety = newVariety;
          hole.note = newNote;

          if (currentPhotoUrl && newVariety && window.photoStorage) {
            await window.photoStorage.saveVariety(newCrop, newVariety, currentPhotoUrl);
          }

          modal.classList.remove('active');
          if (onSaveCallback) onSaveCallback(holes);
        };
      }
    };

    modal.classList.add('active');
    renderModal();
  },

  async openVarietyCatalogModal(initialCropId = null) {
    const modal = document.getElementById('general-modal');
    if (!modal) return;
    let modalContent = document.getElementById('modal-dynamic-content');
    if (!modalContent) {
      modalContent = document.createElement('div');
      modalContent.id = 'modal-dynamic-content';
      modal.innerHTML = '';
      modal.appendChild(modalContent);
    }

    let activeFilterCrop = initialCropId || 'all';

    const render = async () => {
      let varieties = [];
      if (window.photoStorage) {
        varieties = await window.photoStorage.getVarieties(activeFilterCrop === 'all' ? null : activeFilterCrop);
      }

      modalContent.innerHTML = `
        <div class="modal-content" style="max-width: 680px; max-height: 85vh; display: flex; flex-direction: column;">
          <div class="modal-header">
            <h3 style="display: flex; align-items: center; gap: 8px;">
              🏷️ Картотека сортов с фотографиями
            </h3>
            <button class="modal-close-btn">&times;</button>
          </div>
          <div class="modal-body" style="padding: 1rem; overflow-y: auto; flex: 1;">
            <p class="text-xs text-muted" style="margin-top: 0;">
              Хранилище ваших любимых сортов овощей и ягод с эталонными фотографиями плодов и пакетиков семян (в базе IndexedDB).
            </p>

            <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 10px;">
              <button type="button" class="btn-pattern-pill ${activeFilterCrop === 'all' ? 'active' : ''}" data-crop="all">Все культуры</button>
              ${['tomato', 'cucumber', 'pepper', 'eggplant', 'strawberry', 'cabbage_white', 'carrot'].map(cId => {
                const c = getCropById(cId);
                return c ? `<button type="button" class="btn-pattern-pill ${activeFilterCrop === cId ? 'active' : ''}" data-crop="${cId}">${c.emoji} ${c.name}</button>` : '';
              }).join('')}
            </div>

            ${varieties.length === 0 ? `
              <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <div style="font-size: 2.2rem; margin-bottom: 8px;">🌱</div>
                <p>В картотеке пока нет сохранённых сортов с фотографиями.</p>
                <p class="text-xs">Вы можете сфотографировать сорт в лунке на любой грядке, и он автоматически появится здесь!</p>
              </div>
            ` : `
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 8px;">
                ${varieties.map(v => {
                  const c = getCropById(v.cropId);
                  return `
                    <div class="holes-variety-card">
                      ${v.photoUrl ? `
                        <img src="${v.photoUrl}" class="holes-variety-img" alt="${escapeHtml(v.name)}">
                      ` : `
                        <div class="holes-variety-img-placeholder">${c ? c.emoji : '🌱'}</div>
                      `}
                      <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 700; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                          ${escapeHtml(v.name)}
                        </div>
                        <div class="text-xs text-muted">
                          ${c ? `${c.emoji} ${c.name}` : 'Культура не указана'}
                        </div>
                        ${v.notes ? `<div class="text-xs text-secondary mt-1">${escapeHtml(v.notes)}</div>` : ''}
                      </div>
                      <button type="button" class="btn-text text-danger delete-variety-btn" data-var-id="${v.id}" title="Удалить из каталога" style="font-size: 1rem; padding: 4px;">
                        🗑️
                      </button>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
          <div class="modal-footer" style="display: flex; justify-content: flex-end; padding: 10px 16px;">
            <button class="btn btn-primary" id="variety-cat-close-btn">Готово</button>
          </div>
        </div>
      `;

      modalContent.querySelector('.modal-close-btn').onclick = () => modal.classList.remove('active');
      modalContent.querySelector('#variety-cat-close-btn').onclick = () => modal.classList.remove('active');

      modalContent.querySelectorAll('.btn-pattern-pill').forEach(btn => {
        btn.onclick = () => {
          activeFilterCrop = btn.getAttribute('data-crop');
          render();
        };
      });

      modalContent.querySelectorAll('.delete-variety-btn').forEach(btn => {
        btn.onclick = async () => {
          const varId = btn.getAttribute('data-var-id');
          if (confirm('Удалить этот сорт из картотеки?')) {
            if (window.photoStorage) {
              await window.photoStorage.deleteVariety(varId);
            }
            render();
          }
        };
      });
    };

    modal.classList.add('active');
    render();
  }
  });
})();
