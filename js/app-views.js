/**
 * Модуль справочников, календаря и печати плана:
 * - renderEncyclopediaView: Энциклопедия культур и фильтрация
 * - renderRotationGuideView: Интерактивный гид по севообороту
 * - printGardenPlan: Генерация и печать схемы огорода на А4
 * - openSeasonCalendarModal: Сезонный календарь посадок и работ
 * - openAutoPlanModal: Мастер умного автоподбора севооборота
 */

(function() {
  if (typeof GardenApp === 'undefined') {
    console.error('GardenApp is not defined. Ensure js/app.js is loaded first.');
    return;
  }

  Object.assign(GardenApp.prototype, {
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
  },

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
  },

  printGardenPlan() {
    const data = this.storage.getData();
    const activeYear = this.storage.getActiveYear();
    const currentLang = window.i18n ? window.i18n.getLanguage() : 'ru';
    const beds = data.beds || [];

    const printContainer = document.getElementById('garden-print-layout');
    if (!printContainer) return;

    let totalArea = 0;
    const tableRows = [];
    const holesCheatSheets = [];

    const formatHoleRanges = (indices) => {
      if (!indices || !indices.length) return '';
      const sorted = [...indices].sort((a, b) => a - b);
      const ranges = [];
      let start = sorted[0], prev = sorted[0];
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === prev + 1) {
          prev = sorted[i];
        } else {
          ranges.push(start === prev ? `№${start}` : `№${start}–${prev}`);
          start = prev = sorted[i];
        }
      }
      ranges.push(start === prev ? `№${start}` : `№${start}–${prev}`);
      return ranges.join(', ');
    };

    const getPatternLabel = (pattern) => {
      if (currentLang === 'et') {
        return pattern === 'single' ? '─ 1 rida' : (pattern === 'double_parallel' ? '═ 2 rida (sirge)' : '⚡ 2 rida (malelaud)');
      } else if (currentLang === 'lv') {
        return pattern === 'single' ? '─ 1 rinda' : (pattern === 'double_parallel' ? '═ 2 rindas (paralēli)' : '⚡ 2 rindas (šaha)');
      } else if (currentLang === 'lt') {
        return pattern === 'single' ? '─ 1 eilė' : (pattern === 'double_parallel' ? '═ 2 eilės (lygiai)' : '⚡ 2 eilės (šachmatai)');
      }
      return pattern === 'single' ? '─ В 1 ряд' : (pattern === 'double_parallel' ? '═ В 2 ряда (ровно)' : '⚡ В 2 ряда (шахматка)');
    };

    const buildHolesDetails = (planting, crop, rowNum, rowTitle) => {
      if (!planting.holes || planting.holes.length === 0) return null;
      const pattern = planting.holePattern || 'zigzag';
      const patternText = getPatternLabel(pattern);
      const defaultCropName = crop ? getCropName(crop, currentLang) : (currentLang === 'et' ? 'Sortimata' : currentLang === 'lv' ? 'Bez šķirnes' : currentLang === 'lt' ? 'Be veislės' : 'Без сорта');
      const groups = new Map();
      let plantedCount = 0;

      planting.holes.forEach((h, idx) => {
        const num = h.index || (idx + 1);
        const hCrop = h.cropId ? getCropById(h.cropId) : crop;
        const vName = (h.variety || '').trim() || (h.cropId || planting.cropId ? (hCrop ? getCropName(hCrop, currentLang) : defaultCropName) : '');
        if (!vName) return;
        plantedCount++;
        const key = vName.toLowerCase();
        if (!groups.has(key)) {
          groups.set(key, { name: vName, indices: [] });
        }
        groups.get(key).indices.push(num);
      });

      const groupList = Array.from(groups.values());
      const pcsUnit = currentLang === 'et' ? 'tk' : currentLang === 'lv' ? 'gab.' : currentLang === 'lt' ? 'vnt.' : 'шт';
      const holesWord = currentLang === 'et' ? 'pesa' : currentLang === 'lv' ? 'bedrītes' : currentLang === 'lt' ? 'duobutės' : 'лунок';

      const varietySummary = groupList.length > 0
        ? groupList.map(g => `${g.name}: ${formatHoleRanges(g.indices)} (${g.indices.length} ${pcsUnit})`).join('; ')
        : (planting.variety || '—');

      const capacitySummary = `${plantedCount}/${planting.holes.length} ${holesWord} (${patternText})`;

      holesCheatSheets.push({
        num: rowNum,
        title: rowTitle,
        cropName: crop ? `${crop.emoji || ''} ${getCropName(crop, currentLang)}` : '—',
        pattern,
        patternText,
        totalHoles: planting.holes.length,
        plantedCount,
        groups: groupList.map(g => ({
          name: g.name,
          ranges: formatHoleRanges(g.indices),
          count: g.indices.length
        })),
        holes: planting.holes.map((h, idx) => {
          const hCrop = h.cropId ? getCropById(h.cropId) : crop;
          const label = (h.variety || '').trim() || (h.cropId || planting.cropId ? (hCrop ? getCropName(hCrop, currentLang) : '') : '');
          return {
            index: h.index || (idx + 1),
            label: label || '—',
            emoji: hCrop?.emoji || ''
          };
        })
      });

      return { varietySummary, capacitySummary };
    };

    beds.forEach((bed, bIdx) => {
      const bedArea = bed.width * bed.height;
      totalArea += bedArea;
      const bName = window.i18n ? window.i18n.getBedName(bed) : bed.name;
      const bType = this.advisor.formatBedType(bed.type);

      if (bed.sections && bed.sections.length > 0) {
        bed.sections.forEach((sec, sIdx) => {
          const secArea = bedArea / bed.sections.length;
          const planting = sec.history?.[activeYear] || {};
          const prevPlanting = sec.history?.[activeYear - 1] || {};
          const crop = planting.cropId 
            ? getCropById(planting.cropId) 
            : (planting.holes?.find(h => h && h.cropId) ? getCropById(planting.holes.find(h => h && h.cropId).cropId) : (planting.holes?.some(h => h && h.variety) ? getCropById('tomato') : null));
          const prevCrop = prevPlanting.cropId ? getCropById(prevPlanting.cropId) : null;
          const history = this.storage.getBedHistoryArray(bed.id, activeYear, sec.id);
          const effectiveCropId = planting.cropId || (crop ? crop.id : null);
          const rot = effectiveCropId ? evaluateCropRotation(effectiveCropId, history) : null;
          const cap = effectiveCropId ? calculateCropCapacity(effectiveCropId, secArea, currentLang) : null;

          const rowNum = `${bIdx + 1}.${sIdx + 1}`;
          const secDisplayName = window.i18n && window.i18n.getSectionName ? window.i18n.getSectionName(sec.name) : sec.name;
          const rowTitle = `${bName} (${secDisplayName})`;

          let varietyDisplay = planting.variety || '—';
          let capacityDisplay = cap ? `~${cap.quantity} ${cap.unit}` : '—';
          const hDetails = buildHolesDetails(planting, crop, rowNum, rowTitle);
          if (hDetails) {
            varietyDisplay = hDetails.varietySummary;
            capacityDisplay = hDetails.capacitySummary;
          }

          tableRows.push({
            num: rowNum,
            name: rowTitle,
            type: bType,
            dimensions: `${bed.width}×${(bed.height / bed.sections.length).toFixed(1)} м`,
            area: `${secArea.toFixed(1)} м²`,
            cropName: crop ? getCropName(crop, currentLang) : '—',
            cropEmoji: crop?.emoji || '',
            variety: varietyDisplay,
            capacity: capacityDisplay,
            prevCrop: prevCrop ? `${prevCrop.emoji || ''} ${getCropName(prevCrop, currentLang)}` : (window.t ? window.t('print_empty_bed') : 'Пустовала'),
            rotation: rot ? `${rot.status === 'optimal' ? '✅ Отлично' : (rot.status === 'warning' ? '⚠️ Внимание' : '⛔ Нарушение')}` : '—',
            note: planting.note || ''
          });
        });
      } else {
        const planting = bed.history?.[activeYear] || {};
        const prevPlanting = bed.history?.[activeYear - 1] || {};
        const crop = planting.cropId 
          ? getCropById(planting.cropId) 
          : (planting.holes?.find(h => h && h.cropId) ? getCropById(planting.holes.find(h => h && h.cropId).cropId) : (planting.holes?.some(h => h && h.variety) ? getCropById('tomato') : null));
        const prevCrop = prevPlanting.cropId ? getCropById(prevPlanting.cropId) : null;
        const history = this.storage.getBedHistoryArray(bed.id, activeYear, null);
        const effectiveCropId = planting.cropId || (crop ? crop.id : null);
        const rot = effectiveCropId ? evaluateCropRotation(effectiveCropId, history) : null;
        const cap = effectiveCropId ? calculateCropCapacity(effectiveCropId, bedArea, currentLang) : null;

        const rowNum = `${bIdx + 1}`;
        let varietyDisplay = planting.variety || '—';
        let capacityDisplay = cap ? `~${cap.quantity} ${cap.unit}` : '—';
        const hDetails = buildHolesDetails(planting, crop, rowNum, bName);
        if (hDetails) {
          varietyDisplay = hDetails.varietySummary;
          capacityDisplay = hDetails.capacitySummary;
        }

        tableRows.push({
          num: rowNum,
          name: bName,
          type: bType,
          dimensions: `${bed.width}×${bed.height} м`,
          area: `${bedArea.toFixed(1)} м²`,
          cropName: crop ? getCropName(crop, currentLang) : '—',
          cropEmoji: crop?.emoji || '',
          variety: varietyDisplay,
          capacity: capacityDisplay,
          prevCrop: prevCrop ? `${prevCrop.emoji || ''} ${getCropName(prevCrop, currentLang)}` : (window.t ? window.t('print_empty_bed') : 'Пустовала'),
          rotation: rot ? `${rot.status === 'optimal' ? '✅ Отлично' : (rot.status === 'warning' ? '⚠️ Внимание' : '⛔ Нарушение')}` : '—',
          note: planting.note || ''
        });
      }
    });

    // Генерация наглядной SVG-схемы огорода для печати
    const M_TO_PX = 28; // 28 px за метр для идеальной посадки на А4 альбомной ориентации
    let minX = 99999, minY = 99999, maxX = -99999, maxY = -99999;
    beds.forEach(b => {
      const bx = (b.x || 0) * M_TO_PX;
      const by = (b.y || 0) * M_TO_PX;
      const bw = Math.max(0.5, b.width || 1) * M_TO_PX;
      const bh = Math.max(0.5, b.height || 1) * M_TO_PX;
      minX = Math.min(minX, bx);
      minY = Math.min(minY, by);
      maxX = Math.max(maxX, bx + bw);
      maxY = Math.max(maxY, by + bh);
    });

    const padding = 16;
    const svgW = Math.max(480, (maxX - minX) + padding * 2);
    const svgH = Math.max(120, (maxY - minY) + padding * 2);
    const offsetX = minX - padding;
    const offsetY = minY - padding;

    let svgBedsHtml = '';
    beds.forEach((b, idx) => {
      const bx = (b.x || 0) * M_TO_PX - offsetX;
      const by = (b.y || 0) * M_TO_PX - offsetY;
      const bw = Math.max(0.5, b.width || 1) * M_TO_PX;
      const bh = Math.max(0.5, b.height || 1) * M_TO_PX;
      const isGh = b.type === 'greenhouse';
      const isRaised = b.type === 'raised';
      const strokeCol = isGh ? '#0284c7' : (isRaised ? '#92400e' : '#059669');
      const fillCol = isGh ? '#f0f9ff' : (isRaised ? '#fffbeb' : '#f0fdf4');
      const clipId = `bed-clip-${b.id || idx}`;

      let label = `№${idx + 1} ${b.name}`;
      const planting = b.history?.[activeYear];
      const crop = planting?.cropId ? getCropById(planting.cropId) : null;
      if (crop) label += ` (${crop.emoji || ''} ${getCropName(crop, currentLang)})`;

      svgBedsHtml += `
        <defs>
          <clipPath id="${clipId}">
            <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="3" />
          </clipPath>
        </defs>
        <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="3" fill="${fillCol}" stroke="${strokeCol}" stroke-width="1.5" />
      `;

      // Если у грядки есть секции, рисуем линии разделения
      if (b.sections && b.sections.length > 1) {
        const secCount = b.sections.length;
        const isGhHorizontal = b.orientation !== 'vertical' && (b.width || 4) >= (b.height || 1.2);
        let isInternalHorizontal = isGhHorizontal;
        if (b.sectionsLayout === 'transverse') {
          isInternalHorizontal = !isGhHorizontal;
        }
        for (let s = 1; s < secCount; s++) {
          if (isInternalHorizontal) {
            const lineY = by + (bh / secCount) * s;
            svgBedsHtml += `<line x1="${bx}" y1="${lineY}" x2="${bx + bw}" y2="${lineY}" stroke="${strokeCol}" stroke-dasharray="2,2" stroke-width="1" />`;
          } else {
            const lineX = bx + (bw / secCount) * s;
            svgBedsHtml += `<line x1="${lineX}" y1="${by}" x2="${lineX}" y2="${by + bh}" stroke="${strokeCol}" stroke-dasharray="2,2" stroke-width="1" />`;
          }
        }
      }

      svgBedsHtml += `
        <g clip-path="url(#${clipId})">
      `;
      if (bw < 50) {
        // Узкая вертикальная грядка
        svgBedsHtml += `
          <text x="${bx + bw / 2}" y="${by + 11}" text-anchor="middle" font-size="8" font-weight="bold" fill="${strokeCol}">№${idx + 1}</text>
          <text x="${bx + bw / 2}" y="${by + 21}" text-anchor="middle" font-size="6.5" fill="#6b7280">${b.width}×${b.height}м</text>
        `;
      } else {
        svgBedsHtml += `
          <text x="${bx + 4}" y="${by + 11}" font-size="8" font-weight="bold" fill="#111827">${escapeHtml(label)}</text>
          <text x="${bx + 4}" y="${by + 21}" font-size="7" fill="#6b7280">${b.width}×${b.height}м</text>
        `;
      }
      svgBedsHtml += `
        </g>
      `;
    });

    const localeMap = { ru: 'ru-RU', et: 'et-EE', lv: 'lv-LV', lt: 'lt-LT' };
    const printDate = new Date().toLocaleDateString(localeMap[currentLang] || 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    const pcsUnit = currentLang === 'et' ? 'tk' : currentLang === 'lv' ? 'gab.' : currentLang === 'lt' ? 'vnt.' : 'шт';

    const holesCheatSheetHtml = holesCheatSheets.length > 0 ? `
      <div class="print-holes-section" style="margin-top: 12px; page-break-inside: avoid;">
        <h3 style="margin: 0 0 6px 0; font-size: 10pt; color: #065f46; border-bottom: 1.5px solid #10b981; padding-bottom: 3px;">
          🌱 ${currentLang === 'et' ? 'Istutuspesade ja sortide meelespea (kasvuhoonesse / peenrale)' : currentLang === 'lv' ? 'Stādīšanas bedrīšu un šķirņu špikeris (siltumnīcai / dobei)' : currentLang === 'lt' ? 'Sodinimo duobučių ir veislių atmintinė (šiltnamiui / lysvei)' : 'Посадочная шпаргалка по лункам и сортам (для работы в теплице и на грядках)'}
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 8px;">
          ${holesCheatSheets.map(cs => {
            const row1 = cs.pattern === 'single' ? cs.holes : cs.holes.filter((_, idx) => idx % 2 === 0);
            const row2 = cs.pattern === 'single' ? [] : cs.holes.filter((_, idx) => idx % 2 === 1);
            const renderPrintHolePill = (h) => `
              <span style="display: inline-block; border: 1px solid #cbd5e1; border-radius: 3px; padding: 1px 4px; font-size: 7pt; background: #fff; margin: 1px;">
                <strong>№${h.index}</strong> ${escapeHtml(h.label)}
              </span>
            `;
            return `
              <div style="border: 1px solid #94a3b8; border-radius: 5px; padding: 6px 8px; background: #f8fafc; page-break-inside: avoid;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px dashed #cbd5e1; padding-bottom: 3px; margin-bottom: 4px;">
                  <strong style="font-size: 8.5pt; color: #0f172a;">№${cs.num} ${escapeHtml(cs.title)} — ${escapeHtml(cs.cropName)}</strong>
                  <span style="font-size: 7.5pt; color: #047857; font-weight: 700;">${escapeHtml(cs.patternText)} • ${cs.plantedCount}/${cs.totalHoles}</span>
                </div>
                ${cs.groups.length > 0 ? `
                  <div style="font-size: 7.5pt; margin-bottom: 4px; color: #1e293b;">
                    ${cs.groups.map(g => `<span style="display: inline-block; margin-right: 8px;">• <strong>${escapeHtml(g.name)}</strong>: ${escapeHtml(g.ranges)} (${g.count} ${pcsUnit})</span>`).join('')}
                  </div>
                ` : ''}
                <div style="font-size: 7pt; color: #334155;">
                  <div style="margin-bottom: 2px;">
                    <strong style="color: #64748b;">${cs.pattern === 'single' ? 'Ряд:' : 'Ряд 1:'}</strong>
                    ${row1.map(renderPrintHolePill).join('')}
                  </div>
                  ${row2.length > 0 ? `
                    <div style="${cs.pattern === 'zigzag' ? 'padding-left: 14px;' : ''}">
                      <strong style="color: #64748b;">Ряд 2:</strong>
                      ${row2.map(renderPrintHolePill).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : '';

    printContainer.innerHTML = `
      <div class="print-header">
        <div>
          <h1>🌿 Умный Огород — План посадок на сезон ${activeYear} года</h1>
          <div class="print-meta">Сформировано: ${printDate} • Участок: ${beds.length} грядок • Полезная площадь: ${totalArea.toFixed(1)} м²</div>
        </div>
      </div>

      <div class="print-map-schematic">
        <svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="110" style="display:block; max-height: 110px;">
          ${svgBedsHtml}
        </svg>
      </div>

      <table class="print-table">
        <thead>
          <tr>
            <th style="width: 30px;">№</th>
            <th>Грядка / Рядок</th>
            <th>Тип</th>
            <th>Размеры</th>
            <th>Площадь</th>
            <th>Культура (${activeYear} г.)</th>
            <th>Сорт / Гибрид (лунки)</th>
            <th>Схема и кол-во</th>
            <th>Предшественник (${activeYear - 1})</th>
            <th>Севооборот</th>
            <th>Заметки и уход</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows.map(r => `
            <tr>
              <td style="text-align: center; font-weight: bold;">${r.num}</td>
              <td><strong>${escapeHtml(r.name)}</strong></td>
              <td>${escapeHtml(r.type)}</td>
              <td>${escapeHtml(r.dimensions)}</td>
              <td>${escapeHtml(r.area)}</td>
              <td><strong>${r.cropEmoji} ${escapeHtml(r.cropName)}</strong></td>
              <td>${escapeHtml(r.variety)}</td>
              <td style="color: #059669; font-weight: 600;">${escapeHtml(r.capacity)}</td>
              <td>${escapeHtml(r.prevCrop)}</td>
              <td>${escapeHtml(r.rotation)}</td>
              <td>${escapeHtml(r.note)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${holesCheatSheetHtml}

      <div class="print-notes-section">
        <strong>📝 Заметки и полевой дневник огородника:</strong>
        <div class="print-note-line"></div>
        <div class="print-note-line"></div>
        <div class="print-note-line"></div>
      </div>
    `.trim();

    const cleanupAfterPrint = () => {
      printContainer.innerHTML = '';
      window.removeEventListener('afterprint', cleanupAfterPrint);
    };
    window.addEventListener('afterprint', cleanupAfterPrint);

    window.print();
  },

  openSeasonCalendarModal() {
    const data = this.storage.getData();
    const activeYear = this.storage.getActiveYear();
    const currentLang = window.i18n ? window.i18n.getLanguage() : 'ru';
    const beds = data.beds || [];

    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) return;

    const monthsData = typeof getSeasonalCalendarEvents === 'function'
      ? getSeasonalCalendarEvents(activeYear, beds, currentLang)
      : [];

    const renderEvents = (filter = 'all') => {
      if (monthsData.length === 0) {
        return `
          <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🌱</div>
            <h3>На ${activeYear} год пока не назначено ни одной посадки</h3>
            <p style="font-size: 0.88rem; margin-top: 0.35rem;">Откройте любую грядку на карте или воспользуйтесь «✨ Авто-севооборотом», чтобы сформировать календарь работ!</p>
          </div>
        `;
      }

      let html = '';
      monthsData.forEach(m => {
        const filteredEvents = filter === 'all' ? m.events : m.events.filter(e => e.stage === filter);
        if (filteredEvents.length === 0) return;

        html += `
          <div class="calendar-month-card">
            <div class="calendar-month-header">
              <span class="calendar-month-title">${m.monthName}</span>
              <span class="calendar-month-count">${filteredEvents.length} задач</span>
            </div>
            <div class="calendar-events-list">
              ${filteredEvents.map(e => `
                <div class="calendar-event-row">
                  <div class="cal-event-crop">
                    <span style="font-size: 1.25rem;">${e.cropEmoji}</span>
                    <div>
                      <strong>${escapeHtml(e.cropName)}</strong>
                      ${e.variety ? `<span class="text-xs text-muted" style="display:block;">${escapeHtml(e.variety)}</span>` : ''}
                    </div>
                  </div>
                  <div style="flex: 1; padding: 0 0.5rem;">
                    <span class="cal-event-stage stage-${e.stage}">${e.icon} ${escapeHtml(e.action)}</span>
                  </div>
                  <div class="cal-event-bed">
                    📍 ${escapeHtml(e.bedName)}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      });

      return html || `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          Нет задач в выбранной категории.
        </div>
      `;
    };

    modalContent.innerHTML = `
      <div class="modal-card calendar-modal-content">
        <div class="modal-header">
          <div>
            <h3>📅 Календарь огородного сезона (${activeYear} г.)</h3>
            <span class="text-xs text-muted">Индивидуальный график работ, составленный под посадки вашего огорода</span>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="calendar-filters-bar">
          <button class="calendar-filter-btn active" data-filter="all">Все работы</button>
          <button class="calendar-filter-btn" data-filter="seedling">🪴 Посев на рассаду</button>
          <button class="calendar-filter-btn" data-filter="greenhouse">🏡 В теплицу</button>
          <button class="calendar-filter-btn" data-filter="ground">🌱 Открытый грунт</button>
          <button class="calendar-filter-btn" data-filter="harvest">🧺 Сбор урожая</button>
        </div>

        <div class="calendar-timeline-body" id="calendar-timeline-body">
          ${renderEvents('all')}
        </div>

        <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
          <button class="btn btn-outline btn-sm" id="calendar-print-btn">
            🖨️ Распечатать план А4
          </button>
          <button class="btn btn-primary btn-sm" id="calendar-close-ok-btn">
            Закрыть
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');

    const closeModal = () => modal.classList.remove('active');
    modalContent.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('calendar-close-ok-btn').addEventListener('click', closeModal);

    document.getElementById('calendar-print-btn').addEventListener('click', () => {
      closeModal();
      this.printGardenPlan();
    });

    modalContent.querySelectorAll('.calendar-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modalContent.querySelectorAll('.calendar-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        document.getElementById('calendar-timeline-body').innerHTML = renderEvents(filter);
      });
    });
  },

  openAutoPlanModal() {
    const data = this.storage.getData();
    const activeYear = this.storage.getActiveYear();
    const prevYear = activeYear - 1;
    const currentLang = window.i18n ? window.i18n.getLanguage() : 'ru';
    const beds = data.beds || [];

    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) return;

    const extractCrop = (plantingObj) => {
      if (!plantingObj) return null;
      if (plantingObj.cropId) return plantingObj.cropId;
      if (Array.isArray(plantingObj.holes)) {
        const hc = plantingObj.holes.find(h => h && h.cropId);
        if (hc) return hc.cropId;
      }
      return null;
    };

    let allSlotsCount = 0;
    let emptySlotsCount = 0;
    beds.forEach(b => {
      if (b.sections && b.sections.length > 0) {
        b.sections.forEach(s => {
          allSlotsCount++;
          const cid = extractCrop(s.history?.[activeYear]);
          if (!cid || cid === 'fallow') emptySlotsCount++;
        });
      } else {
        allSlotsCount++;
        const cid = extractCrop(b.history?.[activeYear]);
        if (!cid || cid === 'fallow') emptySlotsCount++;
      }
    });

    if (allSlotsCount === 0) {
      this.showToast(currentLang === 'et' ? 'Lisage esmalt peenrad kaardile!' : currentLang === 'lv' ? 'Vispirms pievienojiet dobes kartei!' : currentLang === 'lt' ? 'Pirmiausia pridėkite lysves į žemėlapį!' : 'Сначала добавьте грядки на карту огорода!');
      return;
    }

    let onlyEmptyMode = false;
    let carryOverVarieties = true;

    const lastYearCounts = {};
    beds.forEach(b => {
      if (b.sections && b.sections.length > 0) {
        b.sections.forEach(s => {
          const cid = extractCrop(s.history?.[prevYear]);
          if (cid && cid !== 'fallow') lastYearCounts[cid] = (lastYearCounts[cid] || 0) + 1;
        });
      } else {
        const cid = extractCrop(b.history?.[prevYear]);
        if (cid && cid !== 'fallow') lastYearCounts[cid] = (lastYearCounts[cid] || 0) + 1;
      }
    });

    const candidateCrops = [
      'tomato', 'cucumber', 'pepper', 'eggplant', 'potato',
      'carrot', 'onion', 'garlic', 'cabbage_white', 'beet',
      'zucchini', 'pumpkin', 'peas', 'beans', 'strawberry', 'lettuce', 'green_manure_phacelia'
    ];

    const cropCounts = {};
    candidateCrops.forEach(cid => {
      cropCounts[cid] = lastYearCounts[cid] || 0;
    });

    if (Object.values(cropCounts).every(v => v === 0)) {
      cropCounts['tomato'] = Math.min(2, allSlotsCount);
      cropCounts['cucumber'] = Math.min(1, Math.max(0, allSlotsCount - 2));
      cropCounts['carrot'] = Math.min(1, Math.max(0, allSlotsCount - 3));
      cropCounts['onion'] = Math.min(1, Math.max(0, allSlotsCount - 4));
    }

    const L = {
      ru: {
        title: '✨ Умный авто-севооборот в 1 клик',
        sub: 'Агро-алгоритм подберёт идеальные грядки с учётом 4-летней истории, теплиц и соседства культур',
        presetLast: `📋 Как в ${prevYear} году`,
        presetClassic: '🥗 Классический набор',
        presetClear: '🧹 Очистить',
        selected: 'Выбрано:',
        ofSlots: 'из',
        places: 'мест',
        modeAll: `🔄 Все грядки (${allSlotsCount})`,
        modeEmpty: `🌱 Только пустые (${emptySlotsCount})`,
        carryVarieties: `🏷️ Перенести мои сорта и схемы лунок из ${prevYear} г.`,
        cancel: 'Отмена',
        calcBtn: '🚀 Рассчитать идеальный план',
        resTitle: `🎉 Оптимальный севооборот на ${activeYear} год`,
        resAssigned: 'Распределено культур:',
        resOpt: 'Идеально:',
        resWarn: 'Допустимо:',
        resDang: 'Нарушений:',
        colBed: 'Грядка / Рядок',
        colCrop: `Культура (${activeYear})`,
        colPrev: `Предшественник (${prevYear})`,
        colReason: 'Обоснование алгоритма',
        emptyPrev: 'Пустовала',
        backBtn: '↺ Назад к выбору',
        applyBtn: `✅ Применить этот план на ${activeYear} год!`,
        appliedToast: `🎉 План посадок на ${activeYear} год успешно сформирован и сохранён!`
      },
      et: {
        title: '✨ Nutikas automaatne külvikord 1 klõpsuga',
        sub: 'Algoritm valib optimaalsed peenrad, arvestades 4 aasta ajalugu, kasvuhooneid ja naabreid',
        presetLast: `📋 Nagu ${prevYear}. aastal`,
        presetClassic: '🥗 Klassikaline komplekt',
        presetClear: '🧹 Tühjenda',
        selected: 'Valitud:',
        ofSlots: '/',
        places: 'kohta',
        modeAll: `🔄 Kõik peenrad (${allSlotsCount})`,
        modeEmpty: `🌱 Ainult tühjad (${emptySlotsCount})`,
        carryVarieties: `🏷️ Kanna üle minu sordid ja istutuspesad ${prevYear}. aastast`,
        cancel: 'Tühista',
        calcBtn: '🚀 Arvuta ideaalne plaan',
        resTitle: `🎉 Optimaalne külvikord ${activeYear}. aastaks`,
        resAssigned: 'Jaotatud kultuure:',
        resOpt: 'Ideaalne:',
        resWarn: 'Lubatud:',
        resDang: 'Rikkumisi:',
        colBed: 'Peenar / Rida',
        colCrop: `Kultuur (${activeYear})`,
        colPrev: `Eelvili (${prevYear})`,
        colReason: 'Algoritmi põhjendus',
        emptyPrev: 'Puhkas',
        backBtn: '↺ Tagasi valikusse',
        applyBtn: `✅ Rakenda see plaan ${activeYear}. aastaks!`,
        appliedToast: `🎉 ${activeYear}. aasta külviplaan on edukalt koostatud ja salvestatud!`
      },
      lv: {
        title: '✨ Viedā automātiskā augseka 1 klikšķī',
        sub: 'Algoritms piemeklēs ideālas dobes, ņemot vērā 4 gadu vēsturi, siltumnīcas un kaimiņaugus',
        presetLast: `📋 Kā ${prevYear}. gadā`,
        presetClassic: '🥗 Klasiskais komplekts',
        presetClear: '🧹 Notīrīt',
        selected: 'Izvēlēts:',
        ofSlots: 'no',
        places: 'vietām',
        modeAll: `🔄 Visas dobes (${allSlotsCount})`,
        modeEmpty: `🌱 Tikai tukšās (${emptySlotsCount})`,
        carryVarieties: `🏷️ Pārnest manas šķirnes un bedrīšu shēmas no ${prevYear}. gada`,
        cancel: 'Atcelt',
        calcBtn: '🚀 Aprēķināt ideālo plānu',
        resTitle: `🎉 Optimālā augseka ${activeYear}. gadam`,
        resAssigned: 'Sadalītas kultūras:',
        resOpt: 'Ideāli:',
        resWarn: 'Pieļaujami:',
        resDang: 'Pārkāpumi:',
        colBed: 'Dobe / Rinda',
        colCrop: `Kultūra (${activeYear})`,
        colPrev: `Priekšaugs (${prevYear})`,
        colReason: 'Algoritma pamatojums',
        emptyPrev: 'Atpūtās',
        backBtn: '↺ Atpakaļ uz izvēli',
        applyBtn: `✅ Lietot šo plānu ${activeYear}. gadam!`,
        appliedToast: `🎉 ${activeYear}. gada stādīšanas plāns veiksmīgi izveidots un saglabāts!`
      },
      lt: {
        title: '✨ Išmanioji automatinė sėjomaina 1 paspaudimu',
        sub: 'Algoritmas parinks idealias lysves pagal 4 metų istoriją, šiltnamius ir kaimynystę',
        presetLast: `📋 Kaip ${prevYear} m.`,
        presetClassic: '🥗 Klasikinis rinkinys',
        presetClear: '🧹 Išvalyti',
        selected: 'Pasirinkta:',
        ofSlots: 'iš',
        places: 'vietų',
        modeAll: `🔄 Visos lysvės (${allSlotsCount})`,
        modeEmpty: `🌱 Tik tuščios (${emptySlotsCount})`,
        carryVarieties: `🏷️ Perkelti mano veisles ir duobučių schemas iš ${prevYear} m.`,
        cancel: 'Atšaukti',
        calcBtn: '🚀 Apskaičiuoti idealų planą',
        resTitle: `🎉 Optimali sėjomaina ${activeYear} metams`,
        resAssigned: 'Paskirstyta kultūrų:',
        resOpt: 'Idealu:',
        resWarn: 'Leistina:',
        resDang: 'Pažeidimų:',
        colBed: 'Lysvė / Eilė',
        colCrop: `Kultūra (${activeYear})`,
        colPrev: `Priešsėlis (${prevYear})`,
        colReason: 'Algoritmo pagrindimas',
        emptyPrev: 'Pailsėjo',
        backBtn: '↺ Atgal į pasirinkimą',
        applyBtn: `✅ Taikyti šį planą ${activeYear} metams!`,
        appliedToast: `🎉 ${activeYear} m. sodinimo planas sėkmingai sudarytas ir išsaugotas!`
      }
    }[currentLang] || {};

    const renderStepperView = () => {
      const activeTotalSlots = onlyEmptyMode ? emptySlotsCount : allSlotsCount;
      const selectedTotal = Object.values(cropCounts).reduce((a, b) => a + b, 0);

      modalContent.innerHTML = `
        <div class="modal-card auto-plan-modal-content">
          <div class="modal-header">
            <div>
              <h3>${L.title}</h3>
              <span class="text-xs text-muted">${L.sub}</span>
            </div>
            <button class="modal-close-btn">&times;</button>
          </div>

          <div class="auto-plan-body">
            <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between; margin-bottom: 10px; padding: 8px 10px; background: var(--bg-tertiary); border-radius: 8px;">
              <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                <button type="button" class="btn btn-sm ${!onlyEmptyMode ? 'btn-primary' : 'btn-outline'}" id="mode-all-beds-btn" style="padding: 3px 8px; font-size: 0.78rem;">${L.modeAll}</button>
                <button type="button" class="btn btn-sm ${onlyEmptyMode ? 'btn-primary' : 'btn-outline'}" id="mode-empty-beds-btn" style="padding: 3px 8px; font-size: 0.78rem;" ${emptySlotsCount === 0 ? 'disabled' : ''}>${L.modeEmpty}</button>
              </div>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer;">
                <input type="checkbox" id="chk-carry-varieties" ${carryOverVarieties ? 'checked' : ''} style="width: 15px; height: 15px; accent-color: #10b981;">
                <span>${L.carryVarieties}</span>
              </label>
            </div>

            <div class="auto-plan-presets-bar">
              <button class="btn btn-outline btn-sm" id="preset-last-year">${L.presetLast}</button>
              <button class="btn btn-outline btn-sm" id="preset-classic">${L.presetClassic}</button>
              <button class="btn btn-outline btn-sm" id="preset-clear">${L.presetClear}</button>
              <div style="flex: 1; text-align: right; font-size: 0.85rem; font-weight: 700; align-self: center;">
                ${L.selected} <span style="color: ${selectedTotal > activeTotalSlots ? '#ef4444' : 'var(--primary)'}; font-size: 1rem;">${selectedTotal}</span> ${L.ofSlots} ${activeTotalSlots} ${L.places}
              </div>
            </div>

            <div class="auto-plan-stepper-grid">
              ${candidateCrops.map(cid => {
                const crop = getCropById(cid);
                const count = cropCounts[cid] || 0;
                return `
                  <div class="auto-plan-crop-item ${count > 0 ? 'active' : ''}">
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                      <span style="font-size: 1.15rem;">${crop.emoji || '🌱'}</span>
                      <strong style="font-size: 0.82rem;">${escapeHtml(getCropName(crop, currentLang))}</strong>
                    </div>
                    <div class="crop-stepper-wrap">
                      <button type="button" class="stepper-btn stepper-minus" data-crop-id="${cid}">−</button>
                      <span class="stepper-val">${count}</span>
                      <button type="button" class="stepper-btn stepper-plus" data-crop-id="${cid}">+</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
            <button class="btn btn-outline" id="auto-plan-cancel-btn">${L.cancel}</button>
            <button class="btn btn-primary" id="auto-plan-calc-btn" ${selectedTotal === 0 || activeTotalSlots === 0 ? 'disabled' : ''}>
              ${L.calcBtn}
            </button>
          </div>
        </div>
      `;

      attachStepperListeners();
    };

    const attachStepperListeners = () => {
      modalContent.querySelector('.modal-close-btn').addEventListener('click', () => modal.classList.remove('active'));
      document.getElementById('auto-plan-cancel-btn').addEventListener('click', () => modal.classList.remove('active'));

      const modeAllBtn = document.getElementById('mode-all-beds-btn');
      const modeEmptyBtn = document.getElementById('mode-empty-beds-btn');
      if (modeAllBtn) {
        modeAllBtn.addEventListener('click', () => {
          onlyEmptyMode = false;
          renderStepperView();
        });
      }
      if (modeEmptyBtn) {
        modeEmptyBtn.addEventListener('click', () => {
          onlyEmptyMode = true;
          renderStepperView();
        });
      }

      const carryChk = document.getElementById('chk-carry-varieties');
      if (carryChk) {
        carryChk.addEventListener('change', (e) => {
          carryOverVarieties = Boolean(e.target.checked);
        });
      }

      modalContent.querySelectorAll('.stepper-minus').forEach(btn => {
        btn.addEventListener('click', () => {
          const cid = btn.getAttribute('data-crop-id');
          if (cropCounts[cid] > 0) {
            cropCounts[cid]--;
            renderStepperView();
          }
        });
      });

      modalContent.querySelectorAll('.stepper-plus').forEach(btn => {
        btn.addEventListener('click', () => {
          const cid = btn.getAttribute('data-crop-id');
          cropCounts[cid] = (cropCounts[cid] || 0) + 1;
          renderStepperView();
        });
      });

      document.getElementById('preset-last-year').addEventListener('click', () => {
        candidateCrops.forEach(cid => {
          cropCounts[cid] = lastYearCounts[cid] || 0;
        });
        renderStepperView();
      });

      document.getElementById('preset-classic').addEventListener('click', () => {
        candidateCrops.forEach(cid => cropCounts[cid] = 0);
        cropCounts['tomato'] = 2;
        cropCounts['cucumber'] = 1;
        cropCounts['carrot'] = 1;
        cropCounts['onion'] = 1;
        cropCounts['cabbage_white'] = 1;
        cropCounts['zucchini'] = 1;
        cropCounts['beet'] = 1;
        renderStepperView();
      });

      document.getElementById('preset-clear').addEventListener('click', () => {
        candidateCrops.forEach(cid => cropCounts[cid] = 0);
        renderStepperView();
      });

      document.getElementById('auto-plan-calc-btn').addEventListener('click', () => {
        const flatList = [];
        Object.entries(cropCounts).forEach(([cid, cnt]) => {
          for (let i = 0; i < cnt; i++) flatList.push(cid);
        });

        const assignments = solveCropRotationAssignment(beds, flatList, activeYear, { onlyEmpty: onlyEmptyMode });
        renderResultsView(assignments);
      });
    };

    const renderResultsView = (assignments) => {
      let optimalCount = 0;
      let warningCount = 0;
      let dangerCount = 0;

      assignments.forEach(a => {
        if (a.evaluation.status === 'optimal') optimalCount++;
        else if (a.evaluation.status === 'warning') warningCount++;
        else if (a.evaluation.status === 'danger') dangerCount++;
      });

      modalContent.innerHTML = `
        <div class="modal-card auto-plan-modal-content">
          <div class="modal-header">
            <div>
              <h3>${L.resTitle}</h3>
              <span class="text-xs text-muted">
                ${L.resAssigned} ${assignments.length} • 
                <span style="color: #059669; font-weight: 700;">${L.resOpt} ${optimalCount}</span> • 
                <span style="color: #d97706; font-weight: 700;">${L.resWarn} ${warningCount}</span> • 
                <span style="color: ${dangerCount > 0 ? '#dc2626' : '#6b7280'}; font-weight: 700;">${L.resDang} ${dangerCount}</span>
              </span>
            </div>
            <button class="modal-close-btn">&times;</button>
          </div>

          <div class="auto-plan-body">
            <table class="auto-plan-result-table">
              <thead>
                <tr>
                  <th>${L.colBed}</th>
                  <th>${L.colCrop}</th>
                  <th>${L.colPrev}</th>
                  <th>${L.colReason}</th>
                </tr>
              </thead>
              <tbody>
                ${assignments.map(a => {
                  const crop = getCropById(a.cropId);
                  const src = a.target.section || a.target.bed;
                  const prevCid = extractCrop(src.history?.[prevYear]);
                  const prevCrop = prevCid ? getCropById(prevCid) : null;
                  const prevName = prevCrop ? `${prevCrop.emoji || ''} ${getCropName(prevCrop, currentLang)}` : L.emptyPrev;
                  const statusBadge = a.evaluation.status === 'optimal'
                    ? `<span style="color: #059669; font-weight: 700;">✅ ${window.t ? window.t('eval_optimal') : 'Идеально'}</span>`
                    : (a.evaluation.status === 'warning' ? `<span style="color: #d97706; font-weight: 700;">⚠️ ${window.t ? window.t('eval_warning') : 'Допустимо'}</span>` : `<span style="color: #dc2626; font-weight: 700;">⛔ ${window.t ? window.t('eval_danger') : 'Нарушение'}</span>`);

                  const carriedVarText = (carryOverVarieties && a.template && (a.template.variety || (a.template.holes && a.template.holes.length)))
                    ? `<div class="text-xs" style="color: #059669; font-weight: 600; margin-top: 2px;">🏷️ ${escapeHtml(a.template.variety || `${a.template.holes.length} лунок`)}</div>`
                    : '';

                  return `
                    <tr>
                      <td><strong>${escapeHtml(a.target.name)}</strong></td>
                      <td>
                        <div style="display: flex; align-items: center; gap: 0.35rem;">
                          <span style="font-size: 1.15rem;">${crop.emoji || '🌱'}</span>
                          <div>
                            <strong>${escapeHtml(getCropName(crop, currentLang))}</strong>
                            ${carriedVarText}
                          </div>
                        </div>
                      </td>
                      <td>${escapeHtml(prevName)}</td>
                      <td>
                        <div>${statusBadge}</div>
                        <div class="text-xs text-muted" style="margin-top: 2px;">${escapeHtml(a.evaluation.reasons[0] || '')}</div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
            <button class="btn btn-outline" id="auto-plan-back-btn">${L.backBtn}</button>
            <button class="btn btn-primary" id="auto-plan-apply-btn">
              ${L.applyBtn}
            </button>
          </div>
        </div>
      `;

      modalContent.querySelector('.modal-close-btn').addEventListener('click', () => modal.classList.remove('active'));
      document.getElementById('auto-plan-back-btn').addEventListener('click', () => renderStepperView());

      document.getElementById('auto-plan-apply-btn').addEventListener('click', () => {
        assignments.forEach(a => {
          const bedId = a.target.bed.id;
          const secId = a.target.section ? a.target.section.id : null;
          const carriedVariety = (carryOverVarieties && a.template && a.template.variety) ? a.template.variety : '';
          this.storage.updateBedPlanting(bedId, activeYear, a.cropId, carriedVariety, '✨ Авто-севооборот', secId);
          if (carryOverVarieties && a.template && Array.isArray(a.template.holes) && a.template.holes.length > 0) {
            this.storage.updateBedHoles(bedId, activeYear, a.template.holes, a.template.holePattern || 'zigzag', secId);
          }
        });

        modal.classList.remove('active');
        this.showToast(L.appliedToast);
        this.gardenMap.render();
        if (this.activeInspectorBedId) {
          this.openBedInspector(this.activeInspectorBedId, this.activeInspectorSectionId);
        }
      });
    };

    modal.classList.add('active');
    renderStepperView();
  }
  });
})();
