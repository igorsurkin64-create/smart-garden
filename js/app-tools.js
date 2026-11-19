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

    const currentLang = (window.i18n && window.i18n.getLanguage()) || lang || 'ru';
    const W = {
      ru: { rest: 'Отдых почвы', lWeekM2: 'л/м² в нед.', liters: 'литров', perWeekSub: (b) => `в неделю на эту грядку (~${b} вёдер по 10 л)`, singleSub: (s) => `по ~${s} л за раз`, methodLbl: '💡 Метод и температура:' },
      et: { rest: 'Mulla puhkus', lWeekM2: 'l/m² nädalas', liters: 'liitrit', perWeekSub: (b) => `nädalas sellele peenrale (~${b} ämbrit × 10 l)`, singleSub: (s) => `~${s} l korraga`, methodLbl: '💡 Meetod ja temperatuur:' },
      lv: { rest: 'Augsnes atpūta', lWeekM2: 'l/m² ned.', liters: 'litri', perWeekSub: (b) => `nedēļā šai dobei (~${b} spaiņi pa 10 l)`, singleSub: (s) => `pa ~${s} l reizē`, methodLbl: '💡 Metode un temperatūra:' },
      lt: { rest: 'Dirvos poilsis', lWeekM2: 'l/m² per sav.', liters: 'litrų', perWeekSub: (b) => `per savaitę šiai lysvei (~${b} kibirų po 10 l)`, singleSub: (s) => `po ~${s} l už kartą`, methodLbl: '💡 Metodas ir temperatūra:' }
    }[currentLang] || { rest: 'Отдых почвы', lWeekM2: 'л/м² в нед.', liters: 'литров', perWeekSub: (b) => `в неделю на эту грядку (~${b} вёдер по 10 л)`, singleSub: (s) => `по ~${s} л за раз`, methodLbl: '💡 Метод и температура:' };

    let currentWeather = 'normal';

    const render = () => {
      const isGh = bed.type === 'greenhouse';
      const norm = calculateBedWaterNorm(cropId, area || (bed.width * bed.height), isGh, currentWeather);

      if (rateBadge) {
        rateBadge.textContent = norm.baseLitersM2 > 0 ? `~${norm.baseLitersM2} ${W.lWeekM2}` : W.rest;
      }

      statsBox.innerHTML = `
        <div class="water-metric-row">
          <div>
            <div class="water-metric-val">💧 ~${norm.weeklyLiters} ${W.liters}</div>
            <div class="water-submetric">${W.perWeekSub(norm.weeklyBuckets10L)}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 800; font-size: 0.82rem; color: #0284c7;">${escapeHtml(norm.frequencyDays)}</div>
            <div class="water-submetric">${W.singleSub(norm.singleWateringLiters)}</div>
          </div>
        </div>
        <div class="water-advice-box">
          <strong>${W.methodLbl}</strong> ${escapeHtml(norm.temperature)}, ${escapeHtml(norm.method)}.<br>
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

    const currentLang = (window.i18n && window.i18n.getLanguage()) || lang || 'ru';
    const C = {
      ru: { empty: `Записей об обработках за ${year} год пока нет. Нажмите «➕ Записать».`, fert: '🧪 Подкормка', prot: '🛡️ Защита', care: '✂️ Уход', delTitle: 'Удалить запись', delToast: 'Запись удалена из журнала', warnTitle: 'Укажите название подкормки или действия', addedToast: '✓ Запись добавлена в агро-журнал грядки!' },
      et: { empty: `${year}. aasta hoolduskirjeid veel pole. Vajutage «➕ Lisa».`, fert: '🧪 Väetamine', prot: '🛡️ Kaitse', care: '✂️ Hooldus', delTitle: 'Kustuta kirje', delToast: 'Kirje kustutatud päevikust', warnTitle: 'Sisestage väetise või tegevuse nimetus', addedToast: '✓ Kirje lisatud peenra päevikusse!' },
      lv: { empty: `Par ${year}. gadu kopšanas ierakstu vēl nav. Nospiediet «➕ Pievienot».`, fert: '🧪 Mēslošana', prot: '🛡️ Aizsardzība', care: '✂️ Kopšana', delTitle: 'Dzēst ierakstu', delToast: 'Ieraksts dzēsts no žurnāla', warnTitle: 'Norādiet mēslojuma vai darbības nosaukumu', addedToast: '✓ Ieraksts pievienots dobes žurnālam!' },
      lt: { empty: `${year} m. priežiūros įrašų dar nėra. Paspauskite «➕ Pridėti».`, fert: '🧪 Tręšimas', prot: '🛡️ Apsauga', care: '✂️ Priežiūra', delTitle: 'Ištrinti įrašą', delToast: 'Įrašas ištrintas iš žurnalo', warnTitle: 'Nurodykite trąšų ar veiksmo pavadinimą', addedToast: '✓ Įrašas pridėtas į lysvės žurnalą!' }
    }[currentLang] || { empty: `Записей об обработках за ${year} год пока нет. Нажмите «➕ Записать».`, fert: '🧪 Подкормка', prot: '🛡️ Защита', care: '✂️ Уход', delTitle: 'Удалить запись', delToast: 'Запись удалена из журнала', warnTitle: 'Укажите название подкормки или действия', addedToast: '✓ Запись добавлена в агро-журнал грядки!' };

    const secId = activeSection ? activeSection.id : null;

    const renderList = () => {
      const logs = this.storage.getBedCareLogs(bed.id, year, secId);
      if (!logs.length) {
        listEl.innerHTML = `<div class="text-xs text-muted" style="text-align: center; padding: 6px 0;">${C.empty}</div>`;
        return;
      }

      listEl.innerHTML = logs.map(entry => {
        const typeLabels = {
          fertilizer: { label: C.fert, cls: 'care-tag-fertilizer' },
          protection: { label: C.prot, cls: 'care-tag-protection' },
          care: { label: C.care, cls: 'care-tag-care' }
        };
        const tInfo = typeLabels[entry.type] || { label: C.care, cls: 'care-tag-care' };

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
            <button type="button" class="btn-care-del" data-log-id="${entry.id}" title="${C.delTitle}">&times;</button>
          </div>
        `;
      }).join('');

      listEl.querySelectorAll('.btn-care-del').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const logId = btn.getAttribute('data-log-id');
          this.storage.deleteBedCareLog(bed.id, year, logId, secId);
          renderList();
          this.showToast(C.delToast);
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
          this.showToast(C.warnTitle, 'warning');
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
        this.showToast(C.addedToast);
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

    const WM = {
      ru: {
        title: `💧 Калькулятор полива огорода (${activeYear} г.)`,
        weatherLbl: 'Погодные условия на неделю:',
        wNormal: '⛅ Умеренно (+20..24°C)',
        wHot: '☀️ Жара и сушь (+28..32°C)',
        wRainy: '🌧️ Дождливая неделя',
        statTotal: 'Суммарный расход в неделю',
        statBuckets: 'Вёдер воды (по 10 литров)',
        statBarrels: 'Бочек воды (по 200 литров)',
        statGh: 'Теплицы (постоянный полив)',
        breakdownTitle: 'Разбивка по грядкам и культурам:',
        colBed: 'Грядка / Рядок',
        colCrop: 'Культура',
        colArea: 'Площадь',
        colType: 'Тип',
        colRate: 'Расход / нед.',
        emptyBed: '— пустует —',
        typeGh: '🏡 Теплица',
        typeGround: '🌱 Открытый грунт',
        tipsTitle: '💡 Советы агронома по экономии воды и поливу:',
        tip1: '• <strong>Мульчирование</strong> (соломой, скошенной травой или агротекстилем) снижает испарение влаги на 50-60%.',
        tip2: '• В теплицах поливайте <strong>утром</strong>, чтобы к ночи влажность воздуха спала (профилактика кладоспориоза и серой гнили).',
        tip3: '• Томаты и перцы любят глубокий редкий полив под корень, огурцы и капуста — частый поверхностный.',
        done: 'Готово'
      },
      et: {
        title: `💧 Aia kastmiskalkulaator (${activeYear}. a)`,
        weatherLbl: 'Ilmastikutingimused nädalaks:',
        wNormal: '⛅ Mõõdukas (+20..24°C)',
        wHot: '☀️ Kuum ja põud (+28..32°C)',
        wRainy: '🌧️ Vihmane nädal',
        statTotal: 'Kogukulu nädalas',
        statBuckets: 'Ämbrit vett (10 liitrit)',
        statBarrels: 'Tünni vett (200 liitrit)',
        statGh: 'Kasvuhooned (pidev kastmine)',
        breakdownTitle: 'Jaotus peenarde ja kultuuride kaupa:',
        colBed: 'Peenar / Rida',
        colCrop: 'Kultuur',
        colArea: 'Pindala',
        colType: 'Tüüp',
        colRate: 'Kulu / näd.',
        emptyBed: '— tühi —',
        typeGh: '🏡 Kasvuhoone',
        typeGround: '🌱 Avamaa',
        tipsTitle: '💡 Agronoomi nõuanded vee säästmiseks ja kastmiseks:',
        tip1: '• <strong>Multšimine</strong> (põhu, niidetud muru või tekstiiliga) vähendab niiskuse aurustumist 50–60%.',
        tip2: '• Kasvuhoones kastke <strong>hommikul</strong>, et ööseks õhuniiskus langeks (hallmädaniku ennetamine).',
        tip3: '• Tomatid ja paprikad eelistavad sügavat harva kastmist juure alla, kurgid ja kapsad sagedast pindmist kastmist.',
        done: 'Valmis'
      },
      lv: {
        title: `💧 Dārza laistīšanas kalkulators (${activeYear}. g.)`,
        weatherLbl: 'Laikapstākļi nedēļai:',
        wNormal: '⛅ Mēreni (+20..24°C)',
        wHot: '☀️ Karsts un sauss (+28..32°C)',
        wRainy: '🌧️ Lietaina nedēļa',
        statTotal: 'Kopējais patēriņš nedēļā',
        statBuckets: 'Spaiņi ūdens (pa 10 litriem)',
        statBarrels: 'Mucas ūdens (pa 200 litriem)',
        statGh: 'Siltumnīcas (pastāvīga laistīšana)',
        breakdownTitle: 'Sadalījums pa dobēm un kultūrām:',
        colBed: 'Dobe / Rinda',
        colCrop: 'Kultūra',
        colArea: 'Platība',
        colType: 'Tips',
        colRate: 'Patēriņš / ned.',
        emptyBed: '— tukša —',
        typeGh: '🏡 Siltumnīca',
        typeGround: '🌱 Atklāta zeme',
        tipsTitle: '💡 Agronoma padomi ūdens taupīšanai un laistīšanai:',
        tip1: '• <strong>Mulčēšana</strong> (ar salmiem, nopļautu zāli vai agrotekstilu) samazina mitruma iztvaikošanu par 50–60%.',
        tip2: '• Siltumnīcās laistiet <strong>no rīta</strong>, lai līdz naktij gaisa mitrums samazinātos.',
        tip3: '• Tomātiem un paprikai patīk dziļa reta laistīšana pie saknes, gurķiem un kāpostiem — bieža virspusēja.',
        done: 'Gatavs'
      },
      lt: {
        title: `💧 Daržo laistymo skaičiuoklė (${activeYear} m.)`,
        weatherLbl: 'Oro sąlygos savaitei:',
        wNormal: '⛅ Vidutiniškai (+20..24°C)',
        wHot: '☀️ Karšta ir sausa (+28..32°C)',
        wRainy: '🌧️ Lietinga savaitė',
        statTotal: 'Bendras sunaudojimas per savaitę',
        statBuckets: 'Kibirai vandens (po 10 litrų)',
        statBarrels: 'Statikos vandens (po 200 litrų)',
        statGh: 'Šiltnamiai (nuolatinis laistymas)',
        breakdownTitle: 'Paskirstymas pagal lysves ir kultūras:',
        colBed: 'Lysvė / Eilė',
        colCrop: 'Kultūra',
        colArea: 'Plotas',
        colType: 'Tipas',
        colRate: 'Sąnaudos / sav.',
        emptyBed: '— tuščia —',
        typeGh: '🏡 Šiltnamis',
        typeGround: '🌱 Atviras gruntas',
        tipsTitle: '💡 Agronomo patarimai vandens taupymui ir laistymui:',
        tip1: '• <strong>Mulčiavimas</strong> (šiaudais, nupjauta žole ar agrotekstile) sumažina drėgmės garavimą 50–60%.',
        tip2: '• Šiltnamiuose laistykite <strong>ryte</strong>, kad iki nakties oro drėgmė sumažėtų.',
        tip3: '• Pomidorai ir paprikos mėgsta gilų retą laistymą po šaknimis, agurkai ir kopūstai — dažną paviršinį.',
        done: 'Atlikta'
      }
    }[currentLang] || {};

    let currentWeather = 'normal';

    const render = () => {
      const stats = calculateTotalGardenWater(beds, activeYear, currentWeather);

      modalContent.innerHTML = `
        <div class="modal-card modal-content" style="max-width: 760px; max-height: 90vh; display: flex; flex-direction: column;">
          <div class="modal-header">
            <h3 style="display: flex; align-items: center; gap: 8px;">${WM.title}</h3>
            <button class="modal-close-btn">&times;</button>
          </div>
          <div class="modal-body" style="padding: 1rem; overflow-y: auto; flex: 1;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
              <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-muted);">${WM.weatherLbl}</span>
              <div class="water-weather-pills" style="display: flex; gap: 4px;">
                <button type="button" class="btn-weather-pill ${currentWeather === 'normal' ? 'active' : ''}" data-weather="normal">${WM.wNormal}</button>
                <button type="button" class="btn-weather-pill ${currentWeather === 'hot' ? 'active' : ''}" data-weather="hot">${WM.wHot}</button>
                <button type="button" class="btn-weather-pill ${currentWeather === 'rainy' ? 'active' : ''}" data-weather="rainy">${WM.wRainy}</button>
              </div>
            </div>

            <div class="water-modal-grid">
              <div class="water-modal-stat-card">
                <div class="water-stat-num">💧 ~${stats.totalLiters} l</div>
                <div class="water-stat-lbl">${WM.statTotal}</div>
              </div>
              <div class="water-modal-stat-card">
                <div class="water-stat-num" style="color: #059669;">🪣 ~${stats.totalBuckets10L}</div>
                <div class="water-stat-lbl">${WM.statBuckets}</div>
              </div>
              <div class="water-modal-stat-card">
                <div class="water-stat-num" style="color: #d97706;">🛢️ ~${stats.totalBarrels200L}</div>
                <div class="water-stat-lbl">${WM.statBarrels}</div>
              </div>
              <div class="water-modal-stat-card">
                <div class="water-stat-num" style="color: #2563eb;">🏡 ${stats.greenhouseLiters} l</div>
                <div class="water-stat-lbl">${WM.statGh}</div>
              </div>
            </div>

            <h4 style="margin: 12px 0 6px 0; font-size: 0.92rem;">${WM.breakdownTitle}</h4>
            <div style="overflow-x: auto; max-height: 260px; border: 1px solid var(--border-subtle); border-radius: 6px;">
              <table class="table-compact" style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">
                <thead>
                  <tr style="background: var(--bg-tertiary); text-align: left;">
                    <th style="padding: 6px 8px;">${WM.colBed}</th>
                    <th style="padding: 6px 8px;">${WM.colCrop}</th>
                    <th style="padding: 6px 8px;">${WM.colArea}</th>
                    <th style="padding: 6px 8px;">${WM.colType}</th>
                    <th style="padding: 6px 8px; text-align: right;">${WM.colRate}</th>
                  </tr>
                </thead>
                <tbody>
                  ${stats.breakdown.map(item => {
                    const c = getCropById(item.cropId);
                    return `
                      <tr style="border-top: 1px solid var(--border-subtle);">
                        <td style="padding: 5px 8px; font-weight: 700;">${escapeHtml(item.bedName)}</td>
                        <td style="padding: 5px 8px;">${c ? `${c.emoji} ${escapeHtml(getCropName(c, currentLang))}` : `<span class="text-muted">${WM.emptyBed}</span>`}</td>
                        <td style="padding: 5px 8px;">${item.areaM2.toFixed(1)} m²</td>
                        <td style="padding: 5px 8px;">${item.isGreenhouse ? WM.typeGh : WM.typeGround}</td>
                        <td style="padding: 5px 8px; text-align: right; font-weight: 800; color: #0284c7;">~${item.weeklyLiters} l</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div class="water-advice-box" style="margin-top: 10px;">
              <strong>${WM.tipsTitle}</strong><br>
              ${WM.tip1}<br>
              ${WM.tip2}<br>
              ${WM.tip3}
            </div>
          </div>
          <div class="modal-footer" style="display: flex; justify-content: flex-end; padding: 10px 16px;">
            <button class="btn btn-primary" id="water-modal-close-btn">${WM.done}</button>
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

    render();
    modal.classList.add('active');
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
      <div class="modal-card modal-content" style="max-width: 520px; border-top: 5px solid #ef4444;">
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

    // Определяем преобладающую культуру грядки/лунок для контекстных подсказок
    const inspectorSelectCrop = document.getElementById('inspector-crop-select')?.value;
    const existingHoleCrop = holes.find(h => h && h.cropId)?.cropId;
    const bedEffectiveCropId = planting.cropId 
      || inspectorSelectCrop 
      || existingHoleCrop 
      || (typeof window !== 'undefined' ? window._lastSelectedHoleCropId : null) 
      || null;

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
    const currentLang = (window.i18n && window.i18n.getLanguage()) || lang || 'ru';
    const H = {
      ru: {
        notSet: 'не настроена',
        intro: 'Идеально для теплиц и парников: разметка посадки в шахматном порядке или рядами, несколько сортов на одной грядке и фото каждого куста.',
        enableBtn: '🌱 Включить схему лунок (шахматка / ряды)',
        holesCount: (n) => `${n} лунок`,
        pcs: 'шт',
        holeWord: 'лунка',
        emptyWord: 'Пусто',
        pZigzag: '⚡ В 2 ряда (шахматка)',
        pDouble: '═ В 2 ряда (ровно)',
        pSingle: '─ В 1 ряд',
        rowSingle: 'Ряд:',
        row1: 'Ряд 1:',
        row2: 'Ряд 2:',
        fastFill: '⚡ Быстрое заполнение сортов:',
        catalogBtn: '🏷️ Картотека сортов',
        fastHint: 'Укажите диапазон лунок (напр. 1–5), выберите сорт и нажмите «Заполнить». Для разных участков грядки можно задать разные сорта!',
        fromLbl: 'С:',
        toLbl: 'по:',
        varPlh: 'Сорт (напр. Бычье сердце)...',
        fillBtn: 'Заполнить',
        quickPick: 'Быстрый выбор:',
        clearBtn: 'Сбросить лунки',
        saveBtn: '💾 Сохранить схему лунок',
        appliedToast: (v, a, b) => `Сорт «${v || '—'}» применён к лункам ${a}–${b}`,
        savedToast: '✓ Схема посадки по лункам успешно сохранена!',
        clearConfirm: 'Отключить схему лунок для этой грядки?',
        clearedToast: 'Схема лунок сброшена'
      },
      et: {
        notSet: 'seadistamata',
        intro: 'Ideaalne kasvuhoonetele: istutamine malelauamustris või ridadena, mitu sorti ühel peenral ja iga taime foto.',
        enableBtn: '🌱 Lülita istutuspesade skeem sisse (malelaud / read)',
        holesCount: (n) => `${n} pesa`,
        pcs: 'tk',
        holeWord: 'pesa',
        emptyWord: 'Tühi',
        pZigzag: '⚡ 2 rida (malelaud)',
        pDouble: '═ 2 rida (sirge)',
        pSingle: '─ 1 rida',
        rowSingle: 'Rida:',
        row1: 'Rida 1:',
        row2: 'Rida 2:',
        fastFill: '⚡ Sortide kiire täitmine:',
        catalogBtn: '🏷️ Sortide kataloog',
        fastHint: 'Määrake pesade vahemik (nt 1–5), valige sort ja vajutage «Täida». Peenra eri osadele saab määrata erinevad sordid!',
        fromLbl: 'Alates:',
        toLbl: 'kuni:',
        varPlh: 'Sort (nt Härjasüda)...',
        fillBtn: 'Täida',
        quickPick: 'Kiirvalik:',
        clearBtn: 'Lähtesta pesad',
        saveBtn: '💾 Salvesta pesade skeem',
        appliedToast: (v, a, b) => `Sort «${v || '—'}» määratud pesadele ${a}–${b}`,
        savedToast: '✓ Istutuspesade skeem edukalt salvestatud!',
        clearConfirm: 'Kas lülitada selle peenra istutuspesade skeem välja?',
        clearedToast: 'Istutuspesade skeem lähtestatud'
      },
      lv: {
        notSet: 'nav iestatīta',
        intro: 'Ideāli siltumnīcām: stādīšana šaha secībā vai rindās, vairākas šķirnes vienā dobē un katra stāda foto.',
        enableBtn: '🌱 Ieslēgt bedrīšu shēmu (šaha / rindas)',
        holesCount: (n) => `${n} bedrītes`,
        pcs: 'gab.',
        holeWord: 'bedrīte',
        emptyWord: 'Tukšs',
        pZigzag: '⚡ 2 rindās (šaha)',
        pDouble: '═ 2 rindās (līdzeni)',
        pSingle: '─ 1 rindā',
        rowSingle: 'Rinda:',
        row1: '1. rinda:',
        row2: '2. rinda:',
        fastFill: '⚡ Ātra šķirņu aizpildīšana:',
        catalogBtn: '🏷️ Šķirņu katalogs',
        fastHint: 'Norādiet bedrīšu diapazonu (piem. 1–5), izvēlieties šķirni un nospiediet «Aizpildīt»!',
        fromLbl: 'No:',
        toLbl: 'līdz:',
        varPlh: 'Šķirne (piem. Vērša sirds)...',
        fillBtn: 'Aizpildīt',
        quickPick: 'Ātrā izvēle:',
        clearBtn: 'Atiestatīt bedrītes',
        saveBtn: '💾 Saglabāt bedrīšu shēmu',
        appliedToast: (v, a, b) => `Šķirne «${v || '—'}» piešķirta bedrītēm ${a}–${b}`,
        savedToast: '✓ Bedrīšu stādīšanas shēma veiksmīgi saglabāta!',
        clearConfirm: 'Vai atslēgt bedrīšu shēmu šai dobei?',
        clearedToast: 'Bedrīšu shēma atiestatīta'
      },
      lt: {
        notSet: 'nenustatyta',
        intro: 'Idealu šiltnamiams: sodinimas šachmatų tvarka arba eilėmis, kelios veislės vienoje lysvėje ir kiekvieno krūmo nuotrauka.',
        enableBtn: '🌱 Įjungti duobučių schemą (šachmatai / eilės)',
        holesCount: (n) => `${n} duobutės`,
        pcs: 'vnt.',
        holeWord: 'duobutė',
        emptyWord: 'Tuščia',
        pZigzag: '⚡ 2 eilės (šachmatai)',
        pDouble: '═ 2 eilės (lygiai)',
        pSingle: '─ 1 eilė',
        rowSingle: 'Eilė:',
        row1: '1 eilė:',
        row2: '2 eilė:',
        fastFill: '⚡ Greitas veislių užpildymas:',
        catalogBtn: '🏷️ Veislių katalogas',
        fastHint: 'Nurodykite duobučių intervalą (pvz., 1–5), pasirinkite veislę ir paspauskite «Užpildyti»!',
        fromLbl: 'Nuo:',
        toLbl: 'iki:',
        varPlh: 'Veislė (pvz., Jaučio širdis)...',
        fillBtn: 'Užpildyti',
        quickPick: 'Greitas pasirinkimas:',
        clearBtn: 'Atstatyti duobutes',
        saveBtn: '💾 Išsaugoti duobučių schemą',
        appliedToast: (v, a, b) => `Veislė «${v || '—'}» priskirta duobutėms ${a}–${b}`,
        savedToast: '✓ Duobučių sodinimo schema sėkmingai išsaugota!',
        clearConfirm: 'Išjungti duobučių schemą šiai lysvei?',
        clearedToast: 'Duobučių schema atstatyta'
      }
    }[currentLang] || {};

    const render = async () => {
      if (holes.length === 0 && !isExpanded) {
        if (badge) badge.textContent = H.notSet;
        content.innerHTML = `
          <div style="padding: 6px 0;">
            <p class="text-xs text-muted" style="margin: 0 0 6px 0;">
              ${H.intro}
            </p>
            <button type="button" class="btn btn-sm btn-outline" id="btn-enable-holes" style="border-color: #10b981; color: #10b981; font-weight: 700; width: 100%;">
              ${H.enableBtn}
            </button>
          </div>
        `;
        const enableBtn = content.querySelector('#btn-enable-holes');
        if (enableBtn) {
          enableBtn.onclick = () => {
            isExpanded = true;
            const initCount = defaultHoleCount;
            const initCrop = bedEffectiveCropId || planting.cropId || null;
            holes = [];
            for (let i = 1; i <= initCount; i++) {
              holes.push({
                index: i,
                cropId: initCrop,
                variety: i === 1 && planting.variety ? planting.variety : '',
                note: ''
              });
            }
            render();
          };
        }
        return;
      }

      if (badge) {
        badge.textContent = H.holesCount(holes.length);
      }

      // Загружаем сохранённые сорта для вывода фото-миниатюр
      let savedVarieties = [];
      try {
        if (window.photoStorage) {
          savedVarieties = await window.photoStorage.getVarieties(bedEffectiveCropId || planting.cropId || null);
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
          <button type="button" class="hole-slot-btn ${isEmpty ? 'empty' : ''}" data-hole-idx="${h.index - 1}" title="№${h.index}: ${escapeHtml(varietyText || H.emptyWord)}">
            <span class="hole-slot-num">${h.index}</span>
            <div class="hole-slot-icon-wrap">
              <span class="hole-slot-emoji">${c ? c.emoji : '🌱'}</span>
              ${photoUrl ? `<img src="${photoUrl}" class="hole-slot-photo-thumb" alt="${escapeHtml(varietyText)}">` : ''}
            </div>
            ${varietyText ? `
              <span class="hole-slot-variety-badge" style="background: ${vColor};" title="${escapeHtml(varietyText)}">
                ${escapeHtml(varietyText)}
              </span>
            ` : `<span class="text-xs text-muted" style="font-size:0.6rem;">${H.holeWord}</span>`}
          </button>
        `;
      };

      const effectiveCropId = bedEffectiveCropId || planting.cropId || null;
      const effectiveCrop = effectiveCropId ? getCropById(effectiveCropId) : null;
      const popVarieties = effectiveCrop?.popularVarieties || [];

      // Доска грядки
      content.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; margin: 6px 0;">
          <div class="water-weather-pills" style="display: flex; gap: 4px;">
            <button type="button" class="btn-pattern-pill ${currentPattern === 'zigzag' ? 'active' : ''}" data-pattern="zigzag">${H.pZigzag}</button>
            <button type="button" class="btn-pattern-pill ${currentPattern === 'double_parallel' ? 'active' : ''}" data-pattern="double_parallel">${H.pDouble}</button>
            <button type="button" class="btn-pattern-pill ${currentPattern === 'single' ? 'active' : ''}" data-pattern="single">${H.pSingle}</button>
          </div>
          <div style="display: flex; align-items: center; gap: 5px; background: var(--bg-primary); padding: 3px 6px; border-radius: 8px; border: 1px solid var(--border-subtle);">
            <span style="font-size: 0.76rem; font-weight: 700; color: var(--text-muted);">Лунок:</span>
            <button type="button" class="btn btn-sm btn-outline" id="holes-count-minus" style="padding: 2px 9px; font-weight: 900; font-size: 0.95rem;">−</button>
            <input type="number" id="holes-count-input" min="1" max="60" value="${holes.length}" style="width: 48px; text-align: center; font-weight: 800; font-size: 0.88rem; padding: 2px 4px; border: 1px solid var(--border-subtle); border-radius: 6px; background: var(--bg-secondary); color: var(--text-main);">
            <button type="button" class="btn btn-sm btn-outline" id="holes-count-plus" style="padding: 2px 9px; font-weight: 900; font-size: 0.95rem;">+</button>
          </div>
        </div>

        <!-- Доска грядки -->
        <div class="holes-bed-board">
          ${currentPattern === 'single' ? `
            <div class="holes-row-container">
              <div class="holes-row-label">${H.rowSingle}</div>
              <div class="holes-row-items">
                ${row1Holes.map(renderHoleHtml).join('')}
              </div>
            </div>
          ` : `
            <div class="holes-row-container">
              <div class="holes-row-label">${H.row1}</div>
              <div class="holes-row-items">
                ${row1Holes.map(renderHoleHtml).join('')}
              </div>
            </div>
            <div class="holes-row-container">
              <div class="holes-row-label">${H.row2}</div>
              <div class="holes-row-items ${currentPattern === 'zigzag' ? 'zigzag-offset' : ''}">
                ${row2Holes.map(renderHoleHtml).join('')}
              </div>
            </div>
          `}
        </div>

        <!-- Экспресс-заполнение диапазона лунок -->
        <div class="holes-batch-panel">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted);">${H.fastFill}</span>
            <button type="button" class="btn-text text-xs" id="btn-open-variety-catalog" style="color: #10b981; font-weight: 700; cursor: pointer; text-decoration: underline;">
              ${H.catalogBtn}
            </button>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 5px;">
            ${H.fastHint}
          </div>
          <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
            <span class="text-xs">${H.fromLbl}</span>
            <input type="number" id="batch-from" class="form-input" style="width: 44px; padding: 2px 4px; font-size: 0.8rem; text-align: center;" value="1" min="1" max="${holes.length}">
            <span class="text-xs">${H.toLbl}</span>
            <input type="number" id="batch-to" class="form-input" style="width: 44px; padding: 2px 4px; font-size: 0.8rem; text-align: center;" value="${Math.min(5, holes.length)}" min="1" max="${holes.length}">
            <input type="text" id="batch-variety" class="form-input" list="batch-variety-datalist" placeholder="${H.varPlh}" style="flex: 1; min-width: 90px; padding: 3px 6px; font-size: 0.8rem;" value="${escapeHtml(planting.variety || '')}">
            <datalist id="batch-variety-datalist">
              ${popVarieties.map(v => `<option value="${escapeHtml(v)}">`).join('')}
              ${savedVarieties.map(v => `<option value="${escapeHtml(v.name)}">`).join('')}
            </datalist>
            <button type="button" class="btn btn-sm btn-primary" id="btn-batch-apply" style="padding: 3px 8px; font-size: 0.78rem;">${H.fillBtn}</button>
          </div>
          ${popVarieties.length > 0 ? `
            <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 6px; align-items: center;">
              <span style="font-size: 0.7rem; color: var(--text-muted);">${H.quickPick}</span>
              ${popVarieties.slice(0, 5).map(v => `
                <button type="button" class="btn-text batch-variety-chip" data-var="${escapeHtml(v)}" style="font-size: 0.7rem; padding: 2px 6px; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: 4px; cursor: pointer;">
                  + ${escapeHtml(v)}
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <button type="button" class="btn btn-sm btn-outline text-danger" id="btn-clear-holes" style="padding: 2px 6px; font-size: 0.76rem;">
            ${H.clearBtn}
          </button>
          <button type="button" class="btn btn-sm btn-primary" id="btn-save-holes" style="background: #10b981; border-color: #059669; font-weight: 700; padding: 4px 12px;">
            ${H.saveBtn}
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

      const resizeHoles = (targetCount) => {
        const clamped = Math.max(1, Math.min(60, parseInt(targetCount, 10) || holes.length));
        const nextCrop = document.getElementById('inspector-crop-select')?.value || bedEffectiveCropId || planting.cropId || holes[holes.length - 1]?.cropId || null;
        while (holes.length < clamped) {
          holes.push({ index: holes.length + 1, cropId: nextCrop, variety: '', note: '' });
        }
        while (holes.length > clamped) {
          holes.pop();
        }
        render();
      };

      const minusBtn = content.querySelector('#holes-count-minus');
      if (minusBtn) {
        minusBtn.onclick = () => resizeHoles(holes.length - 1);
      }

      const plusBtn = content.querySelector('#holes-count-plus');
      if (plusBtn) {
        plusBtn.onclick = () => resizeHoles(holes.length + 1);
      }

      const countInput = content.querySelector('#holes-count-input');
      if (countInput) {
        countInput.onchange = () => resizeHoles(countInput.value);
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

          const defaultCrop = bedEffectiveCropId || planting.cropId || holes.find(h => h && h.cropId)?.cropId || 'cucumber';
          for (let i = start; i <= end; i++) {
            if (holes[i]) {
              holes[i].variety = varietyVal;
              holes[i].cropId = holes[i].cropId || defaultCrop;
            }
          }
          this.showToast(H.appliedToast(varietyVal, start + 1, end + 1));
          render();
        };
      }

      content.querySelectorAll('.batch-variety-chip').forEach(chip => {
        chip.onclick = () => {
          const varName = chip.getAttribute('data-var');
          const input = content.querySelector('#batch-variety');
          if (input) input.value = varName;
        };
      });

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
          this.openVarietyCatalogModal(bedEffectiveCropId || planting.cropId);
        };
      }

      // Save holes button
      const saveBtn = content.querySelector('#btn-save-holes');
      if (saveBtn) {
        saveBtn.onclick = () => {
          this.storage.updateBedHoles(bed.id, activeYear, holes, currentPattern, activeSection?.id);

          // Синхронизируем поля в форме инспектора, если открыт
          const targetObj = (bed.sections && bed.sections.length > 0 && activeSection) ? activeSection : bed;
          const updatedPlanting = targetObj.history?.[activeYear] || {};
          if (updatedPlanting.cropId) {
            const cropSelect = document.getElementById('inspector-crop-select');
            if (cropSelect) cropSelect.value = updatedPlanting.cropId;
          }
          if (updatedPlanting.variety) {
            const varietyInput = document.getElementById('inspector-variety-input');
            if (varietyInput) varietyInput.value = updatedPlanting.variety;
          }

          this.showToast(H.savedToast);
          if (this.gardenMap) this.gardenMap.render();
          render();
        };
      }

      // Clear holes button
      const clearBtn = content.querySelector('#btn-clear-holes');
      if (clearBtn) {
        clearBtn.onclick = () => {
          if (confirm(H.clearConfirm)) {
            holes = [];
            isExpanded = false;
            this.storage.updateBedHoles(bed.id, activeYear, [], 'zigzag', activeSection?.id);
            this.showToast(H.clearedToast);
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

    const allCrops = (typeof window !== 'undefined' && window.CROPS_DATABASE) ? window.CROPS_DATABASE : [];
    const currentLang = window.i18n ? window.i18n.getLanguage() : 'ru';

    const HE = {
      ru: { title: (n) => `🌱 Настройка лунки №${n}`, cropLbl: 'Культура (растение):', varLbl: 'Сорт или гибрид:', varPlh: 'Например: Бычье сердце, Кураж F1...', popLbl: 'Популярные:', photoLbl: '📸 Фото сорта (пакетик семян или плод):', delPhoto: 'Удалить фото', photoHint: 'Сфотографируйте пакетик с семенами или урожай — фото сохранится в картотеку сортов.', replacePhoto: 'Заменить фотографию', uploadPhoto: 'Загрузить / сфотографировать сорт', noteLbl: 'Заметка к лунке (необязательно):', notePlh: 'Дата высадки рассады, прищипка, полив...', cancel: 'Отмена', save: '💾 Сохранить лунку' },
      et: { title: (n) => `🌱 Istutuspesa nr ${n} seadistamine`, cropLbl: 'Kultuur (taim):', varLbl: 'Sort või hübriid:', varPlh: 'Nt: Härjasüda, Kuraaž F1...', popLbl: 'Populaarsed:', photoLbl: '📸 Sordi foto (seemnepakk või vili):', delPhoto: 'Kustuta foto', photoHint: 'Pildistage seemnepakki või saaki — foto salvestatakse sortide kataloogi.', replacePhoto: 'Asenda foto', uploadPhoto: 'Laadi üles / pildista sorti', noteLbl: 'Märkus pesa kohta (valikuline):', notePlh: 'Istutamise kuupäev, kärpimine, kastmine...', cancel: 'Tühista', save: '💾 Salvesta pesa' },
      lv: { title: (n) => `🌱 Bedrītes Nr.${n} iestatīšana`, cropLbl: 'Kultūra (augs):', varLbl: 'Šķirne vai hibrīds:', varPlh: 'Piem.: Vērša sirds, Kurāža F1...', popLbl: 'Populārās:', photoLbl: '📸 Šķirnes foto (sēklu paciņa vai auglis):', delPhoto: 'Dzēst foto', photoHint: 'Nofotografējiet sēklu paciņu vai ražu — foto tiks saglabāts šķirņu katalogā.', replacePhoto: 'Nomainīt fotogrāfiju', uploadPhoto: 'Augšupielādēt / nofotografēt šķirni', noteLbl: 'Piezīme bedrītei (neobligāti):', notePlh: 'Stādīšanas datums, galotņošana, laistīšana...', cancel: 'Atcelt', save: '💾 Saglabāt bedrīti' },
      lt: { title: (n) => `🌱 Duobutės Nr.${n} nustatymas`, cropLbl: 'Kultūra (augalas):', varLbl: 'Veislė arba hibridas:', varPlh: 'Pvz.: Jaučio širdis, Kuraž F1...', popLbl: 'Populiarios:', photoLbl: '📸 Veislės nuotrauka (sėklų pakelis ar vaisius):', delPhoto: 'Ištrinti nuotrauką', photoHint: 'Nufotografuokite sėklų pakelį ar derlių — nuotrauka bus išsaugota veislių kataloge.', replacePhoto: 'Pakeisti nuotrauką', uploadPhoto: 'Įkelti / nufotografuoti veislę', noteLbl: 'Pastaba duobutei (nebūtina):', notePlh: 'Daigų sodinimo data, genėjimas, laistymas...', cancel: 'Atšaukti', save: '💾 Išsaugoti duobutę' }
    }[currentLang] || {};

    const hole = holes[holeIndex] || { index: holeIndex + 1, cropId: null, variety: '', note: '' };
    const target = (bed.sections && bed.sections.length > 0 && activeSection) ? activeSection : bed;
    const planting = target.history?.[activeYear] || {};

    const inspectorSelectCrop = document.getElementById('inspector-crop-select')?.value;
    const prevHoleCrop = holeIndex > 0 ? holes[holeIndex - 1]?.cropId : null;
    const nextHoleCrop = (holeIndex + 1 < holes.length) ? holes[holeIndex + 1]?.cropId : null;
    const anyHoleCrop = holes.find(h => h && h.cropId)?.cropId;
    const lastSelectedCrop = (typeof window !== 'undefined') ? window._lastSelectedHoleCropId : null;

    // Приоритет: культура этой лунки -> выбранная культура грядки/рядка -> соседняя лунка -> последняя выбранная
    let currentCropId = hole.cropId
      || inspectorSelectCrop
      || planting.cropId
      || prevHoleCrop
      || nextHoleCrop
      || anyHoleCrop
      || lastSelectedCrop
      || 'tomato';

    hole.cropId = currentCropId;
    if (typeof window !== 'undefined') {
      window._lastSelectedHoleCropId = currentCropId;
    }

    let currentPhotoUrl = null;

    const renderModal = async () => {
      // Ищем фото сорта в каталоге
      if (hole.variety && window.photoStorage) {
        const v = await window.photoStorage.getVarietyByName(currentCropId, hole.variety);
        if (v && v.photoUrl) currentPhotoUrl = v.photoUrl;
      }

      let varietySuggestions = [];
      if (window.photoStorage) {
        varietySuggestions = await window.photoStorage.getVarieties(currentCropId);
      }

      const cropObj = getCropById(currentCropId);
      const popVars = cropObj?.popularVarieties || [];

      modalContent.innerHTML = `
        <div class="modal-card modal-content" style="max-width: 480px;">
          <div class="modal-header">
            <h3 style="display: flex; align-items: center; gap: 8px;">
              ${HE.title(hole.index)}
            </h3>
            <button class="modal-close-btn">&times;</button>
          </div>
          <div class="modal-body" style="padding: 1rem;">
            <div class="form-group mb-3">
              <label class="form-sublabel" style="font-weight: 700;">${HE.cropLbl}</label>
              <select id="hole-crop-select" class="form-input">
                ${allCrops.filter(c => c.id !== 'fallow').map(c => `
                  <option value="${c.id}" ${currentCropId === c.id ? 'selected' : ''}>
                    ${c.emoji} ${escapeHtml(getCropName(c, currentLang))}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group mb-3">
              <label class="form-sublabel" style="font-weight: 700;">${HE.varLbl}</label>
              <input type="text" id="hole-variety-input" class="form-input" list="hole-variety-datalist" placeholder="${HE.varPlh}" value="${escapeHtml(hole.variety || '')}">
              <datalist id="hole-variety-datalist">
                ${popVars.map(v => `<option value="${escapeHtml(v)}">`).join('')}
                ${varietySuggestions.map(v => `<option value="${escapeHtml(v.name)}">`).join('')}
              </datalist>
              ${popVars.length > 0 ? `
                <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 5px; align-items: center;">
                  <span style="font-size: 0.7rem; color: var(--text-muted);">${HE.popLbl}</span>
                  ${popVars.slice(0, 6).map(v => `
                    <button type="button" class="btn-text hole-pop-var-chip" data-var="${escapeHtml(v)}" style="font-size: 0.72rem; padding: 2px 6px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 4px; cursor: pointer;">
                      + ${escapeHtml(v)}
                    </button>
                  `).join('')}
                </div>
              ` : ''}
            </div>

            <!-- Фотография сорта -->
            <div class="form-group mb-3" style="background: var(--bg-secondary); padding: 10px; border-radius: 8px; border: 1px dashed var(--border-subtle);">
              <div style="font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: space-between;">
                <span>${HE.photoLbl}</span>
                ${currentPhotoUrl ? `<button type="button" class="btn-text text-danger text-xs" id="btn-remove-variety-photo">${HE.delPhoto}</button>` : ''}
              </div>
              
              <div id="hole-variety-photo-preview" style="margin: 6px 0; text-align: center;">
                ${currentPhotoUrl ? `
                  <img src="${currentPhotoUrl}" style="max-height: 120px; max-width: 100%; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);" alt="Фото сорта">
                ` : `
                  <div style="font-size: 0.78rem; color: var(--text-muted); padding: 8px 0;">
                    ${HE.photoHint}
                  </div>
                `}
              </div>

              <label class="btn btn-sm btn-outline" style="cursor: pointer; text-align: center; display: block;">
                📷 ${currentPhotoUrl ? HE.replacePhoto : HE.uploadPhoto}
                <input type="file" id="hole-photo-file-input" accept="image/*" style="display: none;">
              </label>
            </div>

            <div class="form-group mb-2">
              <label class="form-sublabel">${HE.noteLbl}</label>
              <input type="text" id="hole-note-input" class="form-input" placeholder="${HE.notePlh}" value="${escapeHtml(hole.note || '')}">
            </div>
          </div>
          <div class="modal-footer" style="display: flex; gap: 8px; justify-content: flex-end; padding: 10px 16px;">
            <button class="btn btn-outline" id="hole-modal-cancel-btn">${HE.cancel}</button>
            <button class="btn btn-primary" id="hole-modal-save-btn">${HE.save}</button>
          </div>
        </div>
      `;

      modalContent.querySelector('.modal-close-btn').onclick = () => modal.classList.remove('active');
      modalContent.querySelector('#hole-modal-cancel-btn').onclick = () => modal.classList.remove('active');

      const cropSelect = modalContent.querySelector('#hole-crop-select');
      if (cropSelect) {
        cropSelect.onchange = () => {
          currentCropId = cropSelect.value;
          hole.cropId = cropSelect.value;
          if (typeof window !== 'undefined') {
            window._lastSelectedHoleCropId = cropSelect.value;
          }
          currentPhotoUrl = null;
          renderModal();
        };
      }

      modalContent.querySelectorAll('.hole-pop-var-chip').forEach(chip => {
        chip.onclick = () => {
          const varInput = modalContent.querySelector('#hole-variety-input');
          if (varInput) {
            varInput.value = chip.getAttribute('data-var');
          }
        };
      });

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

          if (typeof window !== 'undefined') {
            window._lastSelectedHoleCropId = newCrop;
          }

          // Автоматически распространяем выбранную культуру на все незаполненные лунки грядки,
          // чтобы при открытии следующей лунки сразу по умолчанию был огурец (или выбранная культура), а не томат!
          holes.forEach(h => {
            if (h && !h.cropId) {
              h.cropId = newCrop;
            }
          });

          // Синхронизируем культуру с текущей грядкой/секцией если она еще не была задана
          if (!target.history) target.history = {};
          if (!target.history[activeYear]) target.history[activeYear] = {};
          if (!target.history[activeYear].cropId) {
            target.history[activeYear].cropId = newCrop;
          }
          const inspectorCropSelect = document.getElementById('inspector-crop-select');
          if (inspectorCropSelect && (!inspectorCropSelect.value || inspectorCropSelect.value === 'fallow')) {
            inspectorCropSelect.value = newCrop;
            const comboboxInput = document.getElementById('inspector-crop-combobox-input');
            const leadIcon = document.getElementById('combobox-selected-icon');
            const cObj = getCropById(newCrop);
            if (comboboxInput && cObj) {
              comboboxInput.value = getCropName(cObj, currentLang);
            }
            if (leadIcon && cObj) {
              leadIcon.innerHTML = getCropSvg(cObj.id);
            }
          }

          if (currentPhotoUrl && newVariety && window.photoStorage) {
            await window.photoStorage.saveVariety(newCrop, newVariety, currentPhotoUrl);
          }

          modal.classList.remove('active');
          if (onSaveCallback) onSaveCallback(holes);
        };
      }
    };

    renderModal().then(() => {
      modal.classList.add('active');
    }).catch(err => {
      console.error('Error rendering hole edit modal:', err);
      modal.classList.remove('active');
    });
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
    let searchQuery = '';
    let editingId = null;
    let isAddingCustomCrop = false;
    let formCropId = (initialCropId && initialCropId !== 'all')
      ? initialCropId
      : ((typeof window !== 'undefined' && window._lastSelectedHoleCropId) ? window._lastSelectedHoleCropId : 'tomato');
    let formName = '';
    let formNotes = '';
    let formPhotoUrl = null;

    const currentLang = window.i18n ? window.i18n.getLanguage() : 'ru';

    const VC = {
      ru: { title: '🏷️ Картотека сортов с фото', formTitleAdd: '🌱 Новый сорт', formTitleEdit: '✏️ Редактирование сорта', cropLbl: '1. Культура:', nameLbl: '2. Название сорта:', namePlh: 'Например: Бычье сердце, Кураж F1...', popLbl: 'Быстрый выбор:', photoLbl: '3. Фото пакетика или плода:', photoHint: 'Нажмите, перетащите фото сюда или вставьте через Ctrl+V', replacePhoto: 'Заменить фото', removePhoto: 'Убрать фото', notesLbl: '4. Краткое описание (вкус, высота, сроки):', notesPlh: 'Например: крупноплодный, сладкий, до 450г, для теплицы', cancelEdit: 'Отмена', save: '💾 Сохранить сорт', saveEdit: '💾 Обновить сорт', allCrops: 'Все', searchPlh: '🔍 Поиск сорта или описания...', emptyTitle: 'В этом разделе пока нет сортов', emptySub: 'Заполните карточку слева — укажите название, описание и добавьте фото пакетика семян!', noCrop: 'Культура не указана', delTitle: 'Удалить', editTitle: 'Редактировать', done: 'Закрыть', enterNameAlert: 'Пожалуйста, введите название сорта.', savedToast: (n) => `✓ Сорт «${n}» сохранён в картотеку!`, delConfirm: 'Удалить этот сорт из картотеки?' },
      et: { title: '🏷️ Sortide kataloog fotodega', formTitleAdd: '🌱 Uus sort', formTitleEdit: '✏️ Sordi muutmine', cropLbl: '1. Kultuur:', nameLbl: '2. Sordi nimetus:', namePlh: 'Nt: Härjasüda, Kuraaž F1...', popLbl: 'Kiirvalik:', photoLbl: '3. Seemnepaki või vilja foto:', photoHint: 'Klõpsake, lohistage foto siia või kleepige Ctrl+V', replacePhoto: 'Asenda foto', removePhoto: 'Eemalda foto', notesLbl: '4. Lühikirjeldus (maitse, kõrgus, aeg):', notesPlh: 'Nt: suureviljaline, magus, kuni 450g', cancelEdit: 'Tühista', save: '💾 Salvesta sort', saveEdit: '💾 Uuenda sorti', allCrops: 'Kõik', searchPlh: '🔍 Otsi sorti või kirjeldust...', emptyTitle: 'Selles jaotises pole veel sorte', emptySub: 'Täitke vasakul olev kaart — lisage nimetus, kirjeldus ja foto!', noCrop: 'Kultuur määramata', delTitle: 'Kustuta', editTitle: 'Muuda', done: 'Sulge', enterNameAlert: 'Palun sisestage sordi nimetus.', savedToast: (n) => `✓ Sort «${n}» salvestatud!`, delConfirm: 'Kas kustutada see sort kataloogist?' },
      lv: { title: '🏷️ Šķirņu katalogs ar foto', formTitleAdd: '🌱 Jauna šķirne', formTitleEdit: '✏️ Rediģēt šķirni', cropLbl: '1. Kultūra:', nameLbl: '2. Šķirnes nosaukums:', namePlh: 'Piem.: Vērša sirds, Kurāža F1...', popLbl: 'Ātrā izvēle:', photoLbl: '3. Sēklu paciņas vai augļa foto:', photoHint: 'Noklikšķiniet, ievelciet foto šeit vai ielīmējiet ar Ctrl+V', replacePhoto: 'Nomainīt foto', removePhoto: 'Noņemt foto', notesLbl: '4. Īss apraksts (garša, augstums):', notesPlh: 'Piem.: lielaugļu, salds, līdz 450g', cancelEdit: 'Atcelt', save: '💾 Saglabāt šķirni', saveEdit: '💾 Atjaunināt šķirni', allCrops: 'Visas', searchPlh: '🔍 Meklēt šķirni vai aprakstu...', emptyTitle: 'Šajā sadaļā vēl nav šķirņu', emptySub: 'Aizpildiet kartīti kreisajā pusē — pievienojiet nosaukumu, aprakstu un foto!', noCrop: 'Kultūra nav norādīta', delTitle: 'Dzēst', editTitle: 'Rediģēt', done: 'Aizvērt', enterNameAlert: 'Lūdzu, ievadiet šķirnes nosaukumu.', savedToast: (n) => `✓ Šķirne «${n}» saglabāta!`, delConfirm: 'Vai dzēst šo šķirni no kataloga?' },
      lt: { title: '🏷️ Veislių katalogas su nuotraukomis', formTitleAdd: '🌱 Nauja veislė', formTitleEdit: '✏️ Redaguoti veislę', cropLbl: '1. Kultūra:', nameLbl: '2. Veislės pavadinimas:', namePlh: 'Pvz.: Jaučio širdis, Kuraž F1...', popLbl: 'Greitas pasirinkimas:', photoLbl: '3. Sėklų pakelio ar vaisiaus foto:', photoHint: 'Spustelėkite, įtempkite foto čia arba įklijuokite Ctrl+V', replacePhoto: 'Pakeisti foto', removePhoto: 'Pašalinti foto', notesLbl: '4. Trumpas aprašymas (skonis, aukštis):', notesPlh: 'Pvz.: stambiavaisis, saldus, iki 450g', cancelEdit: 'Atšaukti', save: '💾 Išsaugoti veislę', saveEdit: '💾 Atnaujinti veislę', allCrops: 'Visos', searchPlh: '🔍 Ieškoti veislės ar aprašymo...', emptyTitle: 'Šiame skyriuje dar nėra veislių', emptySub: 'Užpildykite kortelę kairėje — įrašykite pavadinimą, aprašymą ir pridėkite foto!', noCrop: 'Kultūra nenurodyta', delTitle: 'Trinti', editTitle: 'Redaguoti', done: 'Uždaryti', enterNameAlert: 'Įveskite veislės pavadinimą.', savedToast: (n) => `✓ Veislė «${n}» išsaugota!`, delConfirm: 'Ištrinti šią veislę iš katalogo?' }
    }[currentLang] || {};

    // Обработчик вставки картинки через Ctrl+V, пока открыта картотека
    const handlePaste = async (e) => {
      if (!modal.classList.contains('active')) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            try {
              formName = modalContent.querySelector('#vc-name-input')?.value || formName;
              formNotes = modalContent.querySelector('#vc-notes-input')?.value || formNotes;
              formPhotoUrl = await this.compressPhotoFile(file, 1024, 0.8);
              this.showToast('📸 Фото вставлено из буфера обмена!');
              render();
            } catch (err) {
              console.warn('Paste photo failed:', err);
            }
          }
          break;
        }
      }
    };

    const closeModal = () => {
      modal.classList.remove('active');
      document.removeEventListener('paste', handlePaste);
    };

    document.addEventListener('paste', handlePaste);

    const render = async () => {
      const allCrops = (typeof window !== 'undefined' && window.CROPS_DATABASE) ? window.CROPS_DATABASE : [];
      const customCropIds = (this.storage && typeof this.storage.getCustomCrops === 'function')
        ? this.storage.getCustomCrops().map(c => c.id)
        : [];

      let allVarieties = [];
      if (window.photoStorage) {
        allVarieties = await window.photoStorage.getVarieties(null);
      }

      // Подсчёт сортов по культурам для удобных вкладок
      const cropCounts = new Map();
      allVarieties.forEach(v => {
        if (v.cropId) cropCounts.set(v.cropId, (cropCounts.get(v.cropId) || 0) + 1);
      });

      const q = searchQuery.trim().toLowerCase();
      const filteredVarieties = allVarieties.filter(v => {
        if (activeFilterCrop !== 'all' && v.cropId !== activeFilterCrop) return false;
        if (q) {
          const hay = `${v.name || ''} ${v.notes || ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      const priorityCropIds = ['tomato', 'cucumber', 'pepper', 'eggplant', 'strawberry', 'carrot', 'onion', 'garlic', 'cabbage_white', 'zucchini', 'pumpkin', 'beet', 'potato'];
      const usedCropIds = [...new Set([...priorityCropIds, ...customCropIds, ...cropCounts.keys()])]
        .filter(id => id !== 'fallow' && getCropById(id));

      const popVars = getCropById(formCropId)?.popularVarieties || [];

      modalContent.innerHTML = `
        <div class="modal-card modal-content vc-large-modal" style="max-width: 1080px; width: 95vw; height: 88vh; max-height: 88vh; display: flex; flex-direction: column;">
          <div class="modal-header" style="display: flex; align-items: center; justify-content: space-between; padding: 0.9rem 1.25rem; flex-shrink: 0;">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <h3 style="margin: 0; font-size: 1.2rem;">${VC.title}</h3>
              <span class="badge-mini" style="background: #dcfce7; color: #15803d; padding: 3px 9px; border-radius: 999px; font-weight: 800; font-size: 0.78rem;">
                ${allVarieties.length} шт.
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button type="button" class="btn btn-sm btn-primary" id="btn-print-varieties-a4" style="padding: 6px 14px; font-size: 0.85rem; font-weight: 700;" title="Распечатать выбранные сорта с фото и описаниями на листе A4">
                🖨️ Распечатать каталог (A4)
              </button>
              <button class="modal-close-btn">&times;</button>
            </div>
          </div>

          <div class="vc-split-layout">
            <!-- ЛЕВАЯ КОЛОНКА: Всегда открытая, понятная карточка добавления/редактирования -->
            <div class="vc-left-form-col">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <h4 style="margin: 0; font-size: 1rem; color: #15803d; font-weight: 800;">
                  ${editingId ? VC.formTitleEdit : VC.formTitleAdd}
                </h4>
                ${editingId ? `<button type="button" class="btn btn-sm btn-outline" id="vc-cancel-edit-btn" style="padding: 2px 8px; font-size: 0.75rem;">${VC.cancelEdit}</button>` : ''}
              </div>

              <div class="form-group mb-2">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                  <label class="form-sublabel" style="font-weight: 700; font-size: 0.82rem; margin: 0;">${VC.cropLbl}</label>
                  <button type="button" class="btn-text" id="vc-toggle-custom-crop-btn" style="font-size: 0.76rem; font-weight: 800; color: #15803d; cursor: pointer; padding: 1px 6px; border-radius: 6px; background: #dcfce7; border: 1px solid #86efac;">
                    ${isAddingCustomCrop ? '✕ Отмена' : '➕ Своя культура'}
                  </button>
                </div>
                <select id="vc-crop-select" class="form-input" style="font-weight: 600;">
                  ${allCrops.filter(c => c.id !== 'fallow').map(c => `
                    <option value="${c.id}" ${formCropId === c.id ? 'selected' : ''}>${c.emoji} ${escapeHtml(getCropName(c, currentLang))}</option>
                  `).join('')}
                </select>
                ${isAddingCustomCrop ? `
                  <div style="margin-top: 6px; padding: 8px; border-radius: 8px; background: #f0fdf4; border: 1.5px solid #22c55e;">
                    <div style="font-size: 0.74rem; font-weight: 700; color: #15803d; margin-bottom: 5px;">✨ Добавить новое растение (появится и на грядках!):</div>
                    <div style="display: flex; gap: 5px; align-items: center;">
                      <select id="vc-custom-crop-emoji" class="form-input" style="width: 58px; padding: 5px 4px; font-size: 1rem;">
                        <option value="🌿">🌿</option>
                        <option value="🍉">🍉</option>
                        <option value="🍈">🍈</option>
                        <option value="🍇">🍇</option>
                        <option value="🫐">🫐</option>
                        <option value="🍓">🍓</option>
                        <option value="🍒">🍒</option>
                        <option value="🍎">🍎</option>
                        <option value="🌽">🌽</option>
                        <option value="🌻">🌻</option>
                        <option value="🌹">🌹</option>
                        <option value="🌸">🌸</option>
                        <option value="🌱">🌱</option>
                      </select>
                      <input type="text" id="vc-custom-crop-name" class="form-input" placeholder="Арбуз, Малина, Розы..." style="flex: 1; padding: 5px 8px; font-size: 0.84rem;">
                      <button type="button" class="btn btn-sm btn-primary" id="vc-save-custom-crop-btn" style="padding: 5px 10px; font-weight: 800;">✓</button>
                    </div>
                  </div>
                ` : ''}
              </div>

              <div class="form-group mb-2">
                <label class="form-sublabel" style="font-weight: 700; font-size: 0.82rem;">${VC.nameLbl}</label>
                <input type="text" id="vc-name-input" class="form-input" list="vc-name-datalist" placeholder="${VC.namePlh}" value="${escapeHtml(formName)}" style="font-size: 0.92rem; font-weight: 600;">
                <datalist id="vc-name-datalist">
                  ${popVars.map(v => `<option value="${escapeHtml(v)}">`).join('')}
                </datalist>
                ${popVars.length > 0 ? `
                  <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 6px; align-items: center;">
                    <span style="font-size: 0.7rem; color: var(--text-muted);">${VC.popLbl}</span>
                    ${popVars.slice(0, 6).map(v => `
                      <button type="button" class="vc-pop-chip" data-var="${escapeHtml(v)}">+ ${escapeHtml(v)}</button>
                    `).join('')}
                  </div>
                ` : ''}
              </div>

              <div class="form-group mb-2">
                <label class="form-sublabel" style="font-weight: 700; font-size: 0.82rem;">${VC.photoLbl}</label>
                <div id="vc-photo-dropzone" class="vc-photo-dropzone ${formPhotoUrl ? 'has-photo' : ''}">
                  ${formPhotoUrl ? `
                    <img src="${formPhotoUrl}" alt="Фото сорта" style="max-height: 140px; max-width: 100%; border-radius: 8px; object-fit: contain; display: block; margin: 0 auto 6px;">
                    <div style="display: flex; gap: 6px; justify-content: center;">
                      <label class="btn btn-sm btn-outline" style="cursor: pointer; font-size: 0.76rem; padding: 3px 8px;">
                        📷 ${VC.replacePhoto}
                        <input type="file" id="vc-photo-file" accept="image/*" style="display: none;">
                      </label>
                      <button type="button" class="btn btn-sm btn-outline" id="vc-remove-photo-btn" style="font-size: 0.76rem; padding: 3px 8px; color: #dc2626; border-color: #fca5a5;">
                        ✕ ${VC.removePhoto}
                      </button>
                    </div>
                  ` : `
                    <label style="cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 14px 8px; width: 100%;">
                      <span style="font-size: 2rem;">📸</span>
                      <span style="font-size: 0.8rem; font-weight: 700; color: #15803d;">Выбрать фото или перетащить сюда</span>
                      <span style="font-size: 0.72rem; color: var(--text-muted); text-align: center;">${VC.photoHint}</span>
                      <input type="file" id="vc-photo-file" accept="image/*" style="display: none;">
                    </label>
                  `}
                </div>
              </div>

              <div class="form-group mb-3">
                <label class="form-sublabel" style="font-weight: 700; font-size: 0.82rem;">${VC.notesLbl}</label>
                <textarea id="vc-notes-input" class="form-input" rows="3" placeholder="${VC.notesPlh}" style="resize: vertical; font-size: 0.85rem;">${escapeHtml(formNotes)}</textarea>
              </div>

              <button type="button" class="btn btn-primary btn-block" id="vc-save-btn" style="padding: 0.65rem; font-size: 0.95rem; font-weight: 800;">
                ${editingId ? VC.saveEdit : VC.save}
              </button>
            </div>

            <!-- ПРАВАЯ КОЛОНКА: Просторная галерея сортов с поиском и фильтрами -->
            <div class="vc-right-gallery-col">
              <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px; flex-wrap: wrap;">
                <input type="text" id="vc-search-input" class="form-input" placeholder="${VC.searchPlh}" value="${escapeHtml(searchQuery)}" style="flex: 1; min-width: 180px; padding: 7px 10px; font-size: 0.88rem;">
              </div>

              <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 12px;">
                <button type="button" class="btn-pattern-pill vc-filter-pill ${activeFilterCrop === 'all' ? 'active' : ''}" data-crop="all">
                  ${VC.allCrops} (${allVarieties.length})
                </button>
                ${usedCropIds.map(cId => {
                  const c = getCropById(cId);
                  const cnt = cropCounts.get(cId) || 0;
                  const isCustom = customCropIds.includes(cId);
                  if (cnt === 0 && !isCustom && !['tomato', 'cucumber', 'pepper', 'eggplant', 'strawberry', 'carrot', 'onion'].includes(cId)) return '';
                  return `<button type="button" class="btn-pattern-pill vc-filter-pill ${activeFilterCrop === cId ? 'active' : ''}" data-crop="${cId}">
                    ${escapeHtml(c.emoji)} ${escapeHtml(getCropName(c, currentLang))}${cnt > 0 ? ` (${cnt})` : ''}
                  </button>`;
                }).join('')}
                <button type="button" class="btn-pattern-pill" id="vc-filter-add-crop-btn" style="border-style: dashed; border-color: #16a34a; color: #15803d; font-weight: 700;" title="Добавить своё растение (арбуз, малина, цветы и т.д.)">
                  ➕ Своя культура
                </button>
              </div>

              ${filteredVarieties.length === 0 ? `
                <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); background: var(--bg-secondary); border-radius: 12px; border: 1.5px dashed var(--border-subtle);">
                  <div style="font-size: 2.6rem; margin-bottom: 8px;">🌱</div>
                  <h4 style="margin: 0 0 6px 0; color: var(--text-main); font-size: 1rem;">${VC.emptyTitle}</h4>
                  <p class="text-xs" style="max-width: 420px; margin: 0 auto; line-height: 1.45;">
                    ${VC.emptySub}
                  </p>
                </div>
              ` : `
                <div class="vc-cards-grid">
                  ${filteredVarieties.map(v => {
                    const c = getCropById(v.cropId);
                    const isEd = editingId === v.id;
                    return `
                      <div class="vc-variety-card ${isEd ? 'is-editing' : ''}">
                        <div class="vc-card-photo-box">
                          ${v.photoUrl ? `
                            <img src="${v.photoUrl}" alt="${escapeHtml(v.name)}">
                          ` : `
                            <div class="vc-card-photo-empty">${c ? escapeHtml(c.emoji) : '🌱'}</div>
                          `}
                        </div>
                        <div class="vc-card-info">
                          <div class="vc-card-crop-badge">
                            ${c ? `${escapeHtml(c.emoji)} ${escapeHtml(getCropName(c, currentLang))}` : VC.noCrop}
                          </div>
                          <div class="vc-card-title" title="${escapeHtml(v.name)}">${escapeHtml(v.name)}</div>
                          ${v.notes ? `<div class="vc-card-notes">${escapeHtml(v.notes)}</div>` : ''}
                          <div class="vc-card-actions">
                            <button type="button" class="btn btn-sm btn-outline vc-edit-btn" data-var-id="${v.id}" style="padding: 3px 8px; font-size: 0.74rem;">✏️ ${VC.editTitle}</button>
                            <button type="button" class="btn btn-sm btn-outline vc-delete-btn" data-var-id="${v.id}" style="padding: 3px 8px; font-size: 0.74rem; color: #dc2626; border-color: #fca5a5;">🗑️ ${VC.delTitle}</button>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `}
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; padding: 10px 18px; flex-shrink: 0;">
            <button class="btn btn-primary" id="variety-cat-close-btn">${VC.done}</button>
          </div>
        </div>
      `;

      modalContent.querySelector('.modal-close-btn').onclick = closeModal;
      modalContent.querySelector('#variety-cat-close-btn').onclick = closeModal;

      // Смена культуры в форме
      const cropSel = modalContent.querySelector('#vc-crop-select');
      if (cropSel) {
        cropSel.onchange = () => {
          formName = modalContent.querySelector('#vc-name-input')?.value || '';
          formNotes = modalContent.querySelector('#vc-notes-input')?.value || '';
          formCropId = cropSel.value;
          render();
        };
      }

      // Добавление своей новой культуры прямо из картотеки сортов
      const openCustomCropCreator = () => {
        formName = modalContent.querySelector('#vc-name-input')?.value || formName;
        formNotes = modalContent.querySelector('#vc-notes-input')?.value || formNotes;
        isAddingCustomCrop = !isAddingCustomCrop;
        render().then(() => {
          if (isAddingCustomCrop) modalContent.querySelector('#vc-custom-crop-name')?.focus();
        });
      };

      modalContent.querySelector('#vc-toggle-custom-crop-btn')?.addEventListener('click', openCustomCropCreator);
      modalContent.querySelector('#vc-filter-add-crop-btn')?.addEventListener('click', () => {
        if (!isAddingCustomCrop) openCustomCropCreator();
        else modalContent.querySelector('#vc-custom-crop-name')?.focus();
      });

      const saveCustomCrop = () => {
        const nameVal = modalContent.querySelector('#vc-custom-crop-name')?.value.trim();
        const emojiVal = modalContent.querySelector('#vc-custom-crop-emoji')?.value || '🌿';
        if (!nameVal) {
          this.showToast('⚠️ Введите название растения (например: Арбуз, Малина, Розы)');
          return;
        }
        const created = this.storage.addCustomCrop({ name: nameVal, emoji: emojiVal, family: 'custom' });
        if (created) {
          formCropId = created.id;
          activeFilterCrop = created.id;
          isAddingCustomCrop = false;
          this.showToast(`✓ Новое растение «${created.emoji} ${created.name}» добавлено!`);
          render().then(() => modalContent.querySelector('#vc-name-input')?.focus());
        }
      };

      modalContent.querySelector('#vc-save-custom-crop-btn')?.addEventListener('click', saveCustomCrop);
      modalContent.querySelector('#vc-custom-crop-name')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveCustomCrop();
        }
      });

      // Клик по чипсу популярного сорта
      modalContent.querySelectorAll('.vc-pop-chip').forEach(chip => {
        chip.onclick = () => {
          const val = chip.getAttribute('data-var');
          formName = val;
          const inp = modalContent.querySelector('#vc-name-input');
          if (inp) {
            inp.value = val;
            inp.focus();
          }
        };
      });

      // Загрузка фото (кнопка + drag-and-drop)
      const handlePhotoFile = async (f) => {
        if (!f || !f.type.startsWith('image/')) return;
        try {
          formName = modalContent.querySelector('#vc-name-input')?.value || formName;
          formNotes = modalContent.querySelector('#vc-notes-input')?.value || formNotes;
          formPhotoUrl = await this.compressPhotoFile(f, 1024, 0.8);
          render();
        } catch (err) {
          alert('Ошибка обработки фото: ' + err.message);
        }
      };

      const fileInput = modalContent.querySelector('#vc-photo-file');
      if (fileInput) {
        fileInput.onchange = (e) => handlePhotoFile(e.target.files[0]);
      }

      const dropzone = modalContent.querySelector('#vc-photo-dropzone');
      if (dropzone) {
        dropzone.ondragover = (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); };
        dropzone.ondragleave = () => dropzone.classList.remove('drag-over');
        dropzone.ondrop = (e) => {
          e.preventDefault();
          dropzone.classList.remove('drag-over');
          if (e.dataTransfer?.files?.[0]) handlePhotoFile(e.dataTransfer.files[0]);
        };
      }

      modalContent.querySelector('#vc-remove-photo-btn')?.addEventListener('click', () => {
        formName = modalContent.querySelector('#vc-name-input')?.value || formName;
        formNotes = modalContent.querySelector('#vc-notes-input')?.value || formNotes;
        formPhotoUrl = null;
        render();
      });

      modalContent.querySelector('#vc-cancel-edit-btn')?.addEventListener('click', () => {
        editingId = null;
        formName = '';
        formNotes = '';
        formPhotoUrl = null;
        render();
      });

      // Сохранение нового или редактируемого сорта
      const saveBtn = modalContent.querySelector('#vc-save-btn');
      if (saveBtn) {
        saveBtn.onclick = async () => {
          const nameVal = modalContent.querySelector('#vc-name-input')?.value.trim();
          const notesVal = modalContent.querySelector('#vc-notes-input')?.value.trim() || '';
          if (!nameVal) {
            alert(VC.enterNameAlert);
            modalContent.querySelector('#vc-name-input')?.focus();
            return;
          }
          if (window.photoStorage) {
            if (editingId) {
              await window.photoStorage.deleteVariety(editingId);
            }
            await window.photoStorage.saveVariety(formCropId, nameVal, formPhotoUrl, notesVal);
          }
          this.showToast(VC.savedToast(nameVal));
          editingId = null;
          formName = '';
          formNotes = '';
          formPhotoUrl = null;
          if (activeFilterCrop !== 'all' && activeFilterCrop !== formCropId) {
            activeFilterCrop = formCropId;
          }
          render();
        };
      }

      // Поиск
      const searchInput = modalContent.querySelector('#vc-search-input');
      if (searchInput) {
        searchInput.oninput = (e) => {
          searchQuery = e.target.value;
          const pos = searchInput.selectionStart;
          render().then(() => {
            const nextInput = modalContent.querySelector('#vc-search-input');
            if (nextInput) {
              nextInput.focus();
              nextInput.setSelectionRange(pos, pos);
            }
          });
        };
      }

      // Фильтры по культуре (авто-подставляют культуру в форму слева!)
      modalContent.querySelectorAll('.vc-filter-pill').forEach(btn => {
        btn.onclick = () => {
          activeFilterCrop = btn.getAttribute('data-crop');
          if (activeFilterCrop !== 'all' && !editingId) {
            formCropId = activeFilterCrop;
          }
          render();
        };
      });

      // Редактирование карточки
      modalContent.querySelectorAll('.vc-edit-btn').forEach(btn => {
        btn.onclick = () => {
          const varId = btn.getAttribute('data-var-id');
          const found = allVarieties.find(v => v.id === varId);
          if (!found) return;
          editingId = found.id;
          formCropId = found.cropId || 'tomato';
          formName = found.name || '';
          formNotes = found.notes || '';
          formPhotoUrl = found.photoUrl || null;
          render();
        };
      });

      // Удаление карточки
      modalContent.querySelectorAll('.vc-delete-btn').forEach(btn => {
        btn.onclick = async () => {
          const varId = btn.getAttribute('data-var-id');
          if (confirm(VC.delConfirm)) {
            if (window.photoStorage) {
              await window.photoStorage.deleteVariety(varId);
            }
            if (editingId === varId) {
              editingId = null;
              formName = '';
              formNotes = '';
              formPhotoUrl = null;
            }
            render();
          }
        };
      });

      // Печать каталога сортов на A4
      const printVarBtn = modalContent.querySelector('#btn-print-varieties-a4');
      if (printVarBtn) {
        printVarBtn.onclick = () => {
          if (!filteredVarieties || filteredVarieties.length === 0) {
            this.showToast('⚠️ Сначала добавьте хотя бы один сорт в каталог, чтобы распечатать лист А4!');
            return;
          }
          const filterCropObj = activeFilterCrop !== 'all' ? getCropById(activeFilterCrop) : null;
          const filterTitle = filterCropObj ? `${filterCropObj.emoji} ${getCropName(filterCropObj, currentLang)}` : VC.allCrops;
          const printWin = window.open('', '_blank', 'width=900,height=700');
          if (!printWin) {
            this.showToast('⚠️ Разрешите всплывающие окна в браузере для печати А4');
            return;
          }
          const cardsHtml = filteredVarieties.map((v, idx) => {
            const c = v.cropId ? getCropById(v.cropId) : null;
            const cName = c ? `${c.emoji} ${escapeHtml(getCropName(c, currentLang))}` : escapeHtml(VC.noCrop);
            return `
              <div class="var-print-card">
                <div class="var-print-photo">
                  ${v.photoUrl ? `<img src="${v.photoUrl}" alt="${escapeHtml(v.name)}">` : `<div class="var-print-no-photo">${c ? c.emoji : '🌱'}</div>`}
                </div>
                <div class="var-print-info">
                  <div class="var-print-crop">${idx + 1}. ${cName}</div>
                  <div class="var-print-name">${escapeHtml(v.name)}</div>
                  ${v.notes ? `<div class="var-print-notes">${escapeHtml(v.notes)}</div>` : `<div class="var-print-notes muted">—</div>`}
                </div>
              </div>
            `;
          }).join('');

          printWin.document.write(`<!DOCTYPE html>
            <html lang="${currentLang}">
            <head>
              <meta charset="UTF-8">
              <title>${escapeHtml(VC.title)} — ${escapeHtml(filterTitle)}</title>
              <style>
                @page { size: A4 portrait; margin: 12mm; }
                body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; margin: 0; padding: 12px; }
                .header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #15803d; padding-bottom: 8px; margin-bottom: 14px; }
                .header h1 { font-size: 18px; margin: 0; color: #14532d; }
                .header .meta { font-size: 12px; color: #6b7280; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .var-print-card { display: flex; gap: 10px; border: 1.5px solid #d1d5db; border-radius: 8px; padding: 8px; break-inside: avoid; page-break-inside: avoid; background: #fff; }
                .var-print-photo { width: 82px; height: 82px; flex-shrink: 0; border-radius: 6px; overflow: hidden; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; background: #f9fafb; }
                .var-print-photo img { width: 100%; height: 100%; object-fit: cover; }
                .var-print-no-photo { font-size: 32px; }
                .var-print-info { flex: 1; min-width: 0; }
                .var-print-crop { font-size: 11px; color: #15803d; font-weight: 700; margin-bottom: 2px; }
                .var-print-name { font-size: 14px; font-weight: 800; color: #111827; margin-bottom: 4px; }
                .var-print-notes { font-size: 11.5px; color: #374151; line-height: 1.35; }
                .var-print-notes.muted { color: #9ca3af; }
                .no-print { text-align: right; margin-bottom: 10px; }
                .no-print button { padding: 6px 14px; font-size: 13px; font-weight: 700; background: #16a34a; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
                @media print { .no-print { display: none; } body { padding: 0; } }
              </style>
            </head>
            <body>
              <div class="no-print"><button onclick="window.print()">🖨️ Распечатать (A4)</button></div>
              <div class="header">
                <h1>🌿 Каталог сортов: ${escapeHtml(filterTitle)}</h1>
                <div class="meta">Всего сортов: ${filteredVarieties.length} • ${new Date().toLocaleDateString('ru-RU')}</div>
              </div>
              <div class="grid">${cardsHtml}</div>
            </body>
            </html>`);
          printWin.document.close();
          setTimeout(() => { try { printWin.print(); } catch (e) {} }, 350);
        };
      }
    };

    render().then(() => {
      modal.classList.add('active');
    }).catch(err => {
      console.error('Error rendering variety catalog modal:', err);
      closeModal();
    });
  }
  });
})();
