/**
 * Модуль советника по севообороту и аналитической таблицы сезонов
 */

class RotationAdvisor {
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * Сформировать HTML сводной таблицы севооборота по всем грядкам и годам
   */
  renderSummaryTable() {
    const data = this.storage.getData();
    const years = [...data.years].sort((a, b) => a - b);
    const activeYear = this.storage.getActiveYear();
    const beds = data.beds || [];
    const tr = (k, p) => (typeof window !== 'undefined' && window.t ? window.t(k, p) : null);

    if (!beds.length) {
      return `
        <div class="empty-state-box">
          <p>${tr('empty_hero_desc') || 'Нет созданных грядок. Добавьте грядки на карте, чтобы увидеть таблицу севооборота.'}</p>
        </div>
      `;
    }

    const colBed = tr('summary_table_bed') || 'Грядка / Секция';
    const colType = tr('inspector_bed_type_label') || 'Тип';
    const colStatus = tr('summary_table_status') || 'Оценка агронома';
    const colAdvice = tr('encyclo_agronomic_tip') || 'Совет агронома';
    const colAction = tr('summary_table_action') || 'Действие';

    let theadHtml = `
      <thead>
        <tr>
          <th>${escapeHtml(colBed)}</th>
          <th>${escapeHtml(colType)}</th>
    `;

    years.forEach(year => {
      const isCurrent = year === activeYear;
      theadHtml += `<th class="${isCurrent ? 'th-active-year' : ''}">${year} ${isCurrent ? '★' : ''}</th>`;
    });

    theadHtml += `
          <th>${escapeHtml(colStatus)} (${activeYear})</th>
          <th>${escapeHtml(colAdvice)}</th>
          <th>${escapeHtml(colAction)}</th>
        </tr>
      </thead>
    `;

    let tbodyHtml = '<tbody>';

    beds.forEach(bed => {
      const bedDispName = (typeof window !== 'undefined' && window.i18n) ? window.i18n.getBedName(bed) : bed.name;

      // Если у грядки есть отдельные внутренние рядки/секции
      if (bed.sections && bed.sections.length > 0) {
        bed.sections.forEach((sec, sIdx) => {
          const secHistory = this.storage.getBedHistoryArray(bed.id, activeYear, sec.id);
          const currentPlanting = sec.history?.[activeYear] || null;
          const currentCrop = currentPlanting?.cropId ? getCropById(currentPlanting.cropId) : null;
          const rotationEval = currentPlanting?.cropId
            ? evaluateCropRotation(currentPlanting.cropId, secHistory)
            : null;

          let statusBadge = `<span class="status-pill status-none">${tr('unplanted') || 'Не запланировано'}</span>`;
          let adviceText = tr('inspector_combobox_placeholder') || 'Выберите культуру на текущий сезон';

          if (rotationEval) {
            if (rotationEval.status === 'optimal') {
              statusBadge = `<span class="status-pill status-optimal">✓ ${tr('legend_perfect') || 'Идеально'}</span>`;
            } else if (rotationEval.status === 'warning') {
              statusBadge = `<span class="status-pill status-warning">⚠ ${tr('legend_warning') || 'Внимание'}</span>`;
            } else {
              statusBadge = `<span class="status-pill status-danger">✕ ${tr('legend_danger') || 'Ошибка'}</span>`;
            }
            adviceText = rotationEval.reasons.join('<br>') + (rotationEval.advice ? `<br><small class="text-muted">💡 ${escapeHtml(rotationEval.advice)}</small>` : '');
          }

          const secDispName = (typeof window !== 'undefined' && window.i18n) ? window.i18n.getBedName(sec) : sec.name;
          tbodyHtml += `
            <tr class="table-bed-row" data-bed-id="${bed.id}" data-section-id="${sec.id}">
              <td>
                <strong>${escapeHtml(bedDispName)}</strong>
                <div class="text-xs" style="color: #0284c7; font-weight: 700;">🌿 ${escapeHtml(secDispName)}</div>
                <div class="text-xs text-muted">${bed.width}×${bed.height} м</div>
              </td>
              <td><span class="bed-type-tag">${this.formatBedType(bed.type)}</span></td>
          `;

          // Колонки по годам для секции теплицы
          years.forEach(year => {
            const p = sec.history?.[year];
            const crop = p?.cropId ? getCropById(p.cropId) : null;
            const isCurrent = year === activeYear;

            if (crop) {
              const svgIcon = getCropSvg(crop.id);
              const cropName = typeof getCropName === 'function' ? getCropName(crop) : crop.name;
              tbodyHtml += `
                <td class="${isCurrent ? 'td-active-year' : ''}">
                  <div class="table-crop-cell">
                    <span class="crop-svg-wrap-sm">${svgIcon}</span>
                    <div>
                      <div class="crop-name-sm">${escapeHtml(cropName)}</div>
                      ${p.variety ? `<div class="crop-variety-sm">${escapeHtml(p.variety)}</div>` : ''}
                    </div>
                  </div>
                </td>
              `;
            } else {
              tbodyHtml += `
                <td class="${isCurrent ? 'td-active-year' : ''} text-muted">—</td>
              `;
            }
          });

          tbodyHtml += `
              <td>${statusBadge}</td>
              <td class="col-advice">${adviceText}</td>
              <td>
                <button class="btn btn-sm btn-outline edit-bed-btn" data-bed-id="${bed.id}" data-section-id="${sec.id}">
                  ✏️ ${tr('summary_table_action') || 'Настроить'}
                </button>
              </td>
            </tr>
          `;
        });
        return;
      }

      // Обычная грядка
      const history = this.storage.getBedHistoryArray(bed.id, activeYear);
      const currentPlanting = bed.history?.[activeYear] || null;
      const currentCrop = currentPlanting?.cropId ? getCropById(currentPlanting.cropId) : null;
      const rotationEval = currentPlanting?.cropId
        ? evaluateCropRotation(currentPlanting.cropId, history)
        : null;

      let statusBadge = `<span class="status-pill status-none">${tr('unplanted') || 'Не запланировано'}</span>`;
      let adviceText = tr('inspector_combobox_placeholder') || 'Выберите культуру на текущий сезон';

      if (rotationEval) {
        if (rotationEval.status === 'optimal') {
          statusBadge = `<span class="status-pill status-optimal">✓ ${tr('legend_perfect') || 'Идеально'}</span>`;
        } else if (rotationEval.status === 'warning') {
          statusBadge = `<span class="status-pill status-warning">⚠ ${tr('legend_warning') || 'Внимание'}</span>`;
        } else {
          statusBadge = `<span class="status-pill status-danger">✕ ${tr('legend_danger') || 'Ошибка'}</span>`;
        }
        adviceText = rotationEval.reasons.join('<br>') + (rotationEval.advice ? `<br><small class="text-muted">💡 ${escapeHtml(rotationEval.advice)}</small>` : '');
      }

      tbodyHtml += `
        <tr class="table-bed-row" data-bed-id="${bed.id}">
          <td>
            <strong>${escapeHtml(bedDispName)}</strong>
            <div class="text-xs text-muted">${bed.width}×${bed.height} м</div>
          </td>
          <td><span class="bed-type-tag">${this.formatBedType(bed.type)}</span></td>
      `;

      // Колонки по годам
      years.forEach(year => {
        const p = bed.history?.[year];
        const crop = p?.cropId ? getCropById(p.cropId) : null;
        const isCurrent = year === activeYear;

        if (crop) {
          const svgIcon = getCropSvg(crop.id);
          const cropName = typeof getCropName === 'function' ? getCropName(crop) : crop.name;
          tbodyHtml += `
            <td class="${isCurrent ? 'td-active-year' : ''}">
              <div class="table-crop-cell">
                <span class="crop-svg-wrap-sm">${svgIcon}</span>
                <div>
                  <div class="crop-name-sm">${escapeHtml(cropName)}</div>
                  ${p.variety ? `<div class="crop-variety-sm">${escapeHtml(p.variety)}</div>` : ''}
                </div>
              </div>
            </td>
          `;
        } else {
          tbodyHtml += `
            <td class="${isCurrent ? 'td-active-year' : ''} text-muted">—</td>
          `;
        }
      });

      tbodyHtml += `
          <td>${statusBadge}</td>
          <td class="col-advice">${adviceText}</td>
          <td>
            <button class="btn btn-sm btn-outline edit-bed-btn" data-bed-id="${bed.id}">
              ✏️ ${tr('summary_table_action') || 'Настроить'}
            </button>
          </td>
        </tr>
      `;
    });

    tbodyHtml += '</tbody>';

    return `
      <div class="table-responsive">
        <table class="agro-table">
          ${theadHtml}
          ${tbodyHtml}
        </table>
      </div>
    `;
  }

  formatBedType(type) {
    const tr = (k) => (typeof window !== 'undefined' && window.t ? window.t(k) : null);
    switch (type) {
      case 'greenhouse': return `🏡 ${tr('type_greenhouse') || 'Теплица'}`;
      case 'raised': return `🪵 ${tr('type_raised') || 'Приподнятая'}`;
      case 'berry': return `🍓 ${tr('type_berry') || 'Клубничник'}`;
      case 'warm': return `🔥 ${tr('type_warm') || 'Теплая'}`;
      default: return `🌱 ${tr('type_ground') || 'Открытый грунт'}`;
    }
  }

  /**
   * Сформировать карточку подробного справочника по выбранной культуре
   */
  renderCropEncyclopediaCard(cropId) {
    const crop = getCropById(cropId);
    if (!crop) return '<p>Культура не найдена</p>';

    const tr = (k, p) => (typeof window !== 'undefined' && window.t ? window.t(k, p) : null);
    const family = getFamilyById(crop.family);
    const cropName = typeof getCropName === 'function' ? getCropName(crop) : crop.name;
    const famName = typeof getFamilyName === 'function' ? getFamilyName(family) : (family?.nameRu || '—');

    const goodPreds = crop.goodPredecessors
      .map(id => getCropById(id))
      .filter(Boolean);

    const badPreds = crop.badPredecessors
      .map(id => getCropById(id))
      .filter(Boolean);

    const goodCompanions = crop.goodNeighbors
      .map(id => getCropById(id))
      .filter(Boolean);

    const badCompanions = crop.badNeighbors
      .map(id => getCropById(id))
      .filter(Boolean);

    const colBest = tr('encyclo_best_predecessors') || 'Лучшие предшественники:';
    const colBad = tr('encyclo_bad_predecessors') || 'Нежелательные предшественники:';
    const colTip = tr('encyclo_agronomic_tip') || 'Совет агронома:';

    return `
      <div class="crop-details-card">
        <div class="crop-details-header" style="border-left: 6px solid ${family?.color || '#2e7d32'};">
          <div class="crop-details-icon">${getCropSvg(crop.id)}</div>
          <div>
            <h2 class="crop-details-title">${escapeHtml(cropName)}</h2>
            <div class="crop-details-family">
              <strong>${escapeHtml(famName)}</strong> 
              <span class="nutrient-pill nutrient-${crop.nutrientDemand}">
                ${crop.nutrientLabel}
              </span>
            </div>
          </div>
        </div>

        <p class="crop-description">${escapeHtml(crop.description)}</p>

        <div class="crop-info-grid">
          <div class="crop-info-item">
            <span class="info-label">${tr('encyclo_return_period', { years: crop.minYearsReturn }) || `Срок возврата: ${crop.minYearsReturn} года`}</span>
          </div>
          <div class="crop-info-item">
            <span class="info-label">🌱 ${crop.rootDepth}</span>
          </div>
          <div class="crop-info-item">
            <span class="info-label">📅 ${crop.sowingPeriod}</span>
          </div>
          <div class="crop-info-item">
            <span class="info-label">🌾 ${crop.harvestPeriod}</span>
          </div>
        </div>

        <div class="crop-matrix-section">
          <div class="matrix-column good-column">
            <h4>✅ ${escapeHtml(colBest)}</h4>
            <div class="crop-chip-list">
              ${goodPreds.length ? goodPreds.map(c => {
                const cName = typeof getCropName === 'function' ? getCropName(c) : c.name;
                return `<span class="crop-chip chip-good" title="${escapeHtml(cName)}"><span class="chip-svg">${getCropSvg(c.id)}</span> ${escapeHtml(cName)}</span>`;
              }).join('') : '<span class="text-muted">—</span>'}
            </div>
          </div>

          <div class="matrix-column bad-column">
            <h4>❌ ${escapeHtml(colBad)}</h4>
            <div class="crop-chip-list">
              ${badPreds.length ? badPreds.map(c => {
                const cName = typeof getCropName === 'function' ? getCropName(c) : c.name;
                return `<span class="crop-chip chip-bad" title="${escapeHtml(cName)}"><span class="chip-svg">${getCropSvg(c.id)}</span> ${escapeHtml(cName)}</span>`;
              }).join('') : '<span class="text-muted">—</span>'}
            </div>
          </div>
        </div>

        <div class="crop-matrix-section mt-3">
          <div class="matrix-column good-neighbors-column">
            <h4>🤝 ${escapeHtml(currentLang === 'et' ? 'Head naabrid:' : currentLang === 'lv' ? 'Labi kaimiņi:' : currentLang === 'lt' ? 'Geri kaimynai:' : 'Дружные соседи:')}</h4>
            <div class="crop-chip-list">
              ${goodCompanions.length ? goodCompanions.map(c => {
                const cName = typeof getCropName === 'function' ? getCropName(c, currentLang) : c.name;
                return `<span class="crop-chip chip-neighbor-good"><span class="chip-svg">${getCropSvg(c.id)}</span> ${escapeHtml(cName)}</span>`;
              }).join('') : '<span class="text-muted">—</span>'}
            </div>
          </div>

          <div class="matrix-column bad-neighbors-column">
            <h4>⚔️ ${escapeHtml(currentLang === 'et' ? 'Halvad naabrid:' : currentLang === 'lv' ? 'Nevēlami kaimiņi:' : currentLang === 'lt' ? 'Nepageidaujami kaimynai:' : 'Нежелательные соседи:')}</h4>
            <div class="crop-chip-list">
              ${badCompanions.length ? badCompanions.map(c => {
                const cName = typeof getCropName === 'function' ? getCropName(c, currentLang) : c.name;
                return `<span class="crop-chip chip-neighbor-bad"><span class="chip-svg">${getCropSvg(c.id)}</span> ${escapeHtml(cName)}</span>`;
              }).join('') : '<span class="text-muted">—</span>'}
            </div>
          </div>
        </div>

        <div class="agronomic-pro-tip">
          <div class="tip-icon">💡</div>
          <div class="tip-text">
            <strong>${escapeHtml(colTip)}</strong> ${escapeHtml(crop.agronomicTip)}
          </div>
        </div>
      </div>
    `;
  }
}

if (typeof window !== 'undefined') {
  window.RotationAdvisor = RotationAdvisor;
}
