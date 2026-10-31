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
  }
  });
})();
