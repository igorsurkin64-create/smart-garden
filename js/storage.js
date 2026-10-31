/**
 * Модуль хранилища данных (LocalStorage + Экспорт/Импорт JSON)
 * Обеспечивает долговечное хранение истории посадок, грядок и многосекционных теплиц
 */

const STORAGE_KEY = 'garden_master_db_v4'; // Версия с теплицами на 2-3 грядки и ориентацией

// Демонстрационный набор данных с реалистичными теплицами (на 3 грядки) и открытым грунтом
const DEMO_GARDEN_DATA = {
  meta: {
    version: '3.0',
    title: 'Мой Урожайный Сад и Огород',
    description: 'План посадок и система севооборота',
    soilType: 'Плодородный суглинок с нейтральной кислотностью (pH 6.5)'
  },
  years: [2024, 2025, 2026],
  activeYear: 2026,
  customCrops: [],
  beds: [
    // --- Теплица 1: классическая стеклянная на 3 раздельные грядки ---
    {
      id: 'bed-gh-1',
      name: 'Теплица 1 (Стеклянная, 3 грядки)',
      type: 'greenhouse',
      orientation: 'horizontal',
      x: 2.0,
      y: 2.0,
      width: 6.5,
      height: 3.2,
      sectionsCount: 3,
      irrigation: 'Капельный полив',
      notes: 'Высокие форточки, солнечная сторона. 3 раздельные грядки с дорожками.',
      sections: [
        {
          id: 'sec-1',
          name: 'Левая грядка (Томаты)',
          history: {
            2024: { cropId: 'cucumber', variety: 'Кураж F1', note: 'Обильный сбор плодов' },
            2025: { cropId: 'tomato', variety: 'Бычье Сердце', note: 'Мульчирование соломой' },
            2026: { cropId: 'tomato', variety: 'Де Барао Царский', note: 'План: высадка рассады в мае' }
          }
        },
        {
          id: 'sec-2',
          name: 'Центральная грядка (Перцы & Базилик)',
          history: {
            2024: { cropId: 'onion', variety: 'Севок', note: 'Очистка почвы' },
            2025: { cropId: 'pepper', variety: 'Калифорнийское Чудо', note: 'Крупные плоды' },
            2026: { cropId: 'pepper', variety: 'Ласточка & Базилик', note: 'План: сладкий перец' }
          }
        },
        {
          id: 'sec-3',
          name: 'Правая грядка (Огурцы)',
          history: {
            2024: { cropId: 'tomato', variety: 'Хурма', note: 'Без болезней' },
            2025: { cropId: 'cucumber', variety: 'Герман F1', note: 'Высокий урожай' },
            2026: { cropId: 'cucumber', variety: 'Кураж F1', note: 'План: ранние огурчики' }
          }
        }
      ]
    },

    // --- Теплица 2: поликарбонатная на 3 раздельные грядки ---
    {
      id: 'bed-gh-2',
      name: 'Теплица 2 (Поликарбонат, 3 грядки)',
      type: 'greenhouse',
      orientation: 'horizontal',
      x: 9.5,
      y: 2.0,
      width: 6.5,
      height: 3.2,
      sectionsCount: 3,
      irrigation: 'Капельный полив',
      notes: 'Автопроветривание, подвязка шпалерой.',
      sections: [
        {
          id: 'sec-1',
          name: 'Левая грядка (Томаты Черри)',
          history: {
            2024: { cropId: 'cabbage_white', variety: 'Ранняя', note: 'Предшественник' },
            2025: { cropId: 'tomato', variety: 'Черри Сладкая Гроздь', note: 'Сладкие плоды' },
            2026: { cropId: 'eggplant', variety: 'Алмаз', note: 'План: баклажаны' }
          }
        },
        {
          id: 'sec-2',
          name: 'Центральная грядка (Баклажаны / Зелень)',
          history: {
            2024: { cropId: 'peas', variety: 'Сахарный', note: 'Азотофиксация' },
            2025: { cropId: 'radish', variety: 'Зелень', note: 'Весенний оборот' },
            2026: { cropId: 'tomato', variety: 'Розовый Гигант', note: 'План: мясистые томаты' }
          }
        },
        {
          id: 'sec-3',
          name: 'Правая грядка (Огурцы шпалерные)',
          history: {
            2024: { cropId: 'garlic', variety: 'Озимый', note: 'Очистка почвы' },
            2025: { cropId: 'cucumber', variety: 'Клавдия F1', note: 'Без горечи' },
            2026: { cropId: 'cucumber', variety: 'Герман F1', note: 'План: подвязка на шпалеру' }
          }
        }
      ]
    },

    // --- Линия 1: Приподнятые деревянные короба (Ряд грядок) ---
    {
      id: 'bed-row1-1',
      name: 'Грядка 1 (Чесночная)',
      type: 'raised',
      orientation: 'horizontal',
      x: 17.5,
      y: 2.0,
      width: 4.2,
      height: 1.2,
      irrigation: 'Шланг',
      notes: 'Высокие бортики из лиственницы 25 см.',
      history: {
        2024: { cropId: 'garlic', variety: 'Любаша (озимый)', note: 'Крупные головки' },
        2025: { cropId: 'carrot', variety: 'Нантская 4', note: 'Чистая и сочная морковь' },
        2026: { cropId: 'onion', variety: 'Штутгартер Ризен', note: 'План: посадка севка в мае' }
      }
    },
    {
      id: 'bed-row1-2',
      name: 'Грядка 2 (Морковная)',
      type: 'raised',
      orientation: 'horizontal',
      x: 23.0,
      y: 2.0,
      width: 4.2,
      height: 1.2,
      irrigation: 'Шланг',
      notes: 'Рядом с грядкой лука для защиты от мухи.',
      history: {
        2024: { cropId: 'onion', variety: 'Халцедон', note: 'Хорошо просушен' },
        2025: { cropId: 'garlic', variety: 'Богатырь', note: 'Отличный урожай' },
        2026: { cropId: 'carrot', variety: 'Самсон', note: 'План: посев с луком-маяком' }
      }
    },
    {
      id: 'bed-row1-3',
      name: 'Грядка 3 (Луковая)',
      type: 'raised',
      orientation: 'horizontal',
      x: 28.5,
      y: 2.0,
      width: 4.2,
      height: 1.2,
      irrigation: 'Лейка',
      notes: 'Песчаная подушка, зольная подкормка.',
      history: {
        2024: { cropId: 'cucumber', variety: 'Зозуля', note: 'Под временной плёнкой' },
        2025: { cropId: 'cabbage_white', variety: 'Слава', note: 'Плотные кочаны' },
        2026: { cropId: 'onion', variety: 'Ред Барон', note: 'План: красный лук' }
      }
    },

    // --- Линия 2: Приподнятые грядки (второй ряд) ---
    {
      id: 'bed-row2-1',
      name: 'Грядка 4 (Кабачки & Патиссоны)',
      type: 'raised',
      orientation: 'horizontal',
      x: 17.5,
      y: 4.0,
      width: 4.2,
      height: 1.2,
      irrigation: 'Шланг',
      notes: 'Заправлена перегноем осенью.',
      history: {
        2024: { cropId: 'zucchini', variety: 'Цукеша & Кавили F1', note: 'Раннее плодоношение' },
        2025: { cropId: 'peas', variety: 'Сахарный', note: 'Обогащение почвы азотом' },
        2026: { cropId: 'cabbage_white', variety: 'Мегатон F1', note: 'План: мощная капуста' }
      }
    },
    {
      id: 'bed-row2-2',
      name: 'Грядка 5 (Бобовая / Горох)',
      type: 'raised',
      orientation: 'horizontal',
      x: 23.0,
      y: 4.0,
      width: 4.2,
      height: 1.2,
      irrigation: 'Шланг',
      notes: 'Шпалерная сетка для вьющихся побегов.',
      history: {
        2024: { cropId: 'cabbage_white', variety: 'Июньская', note: 'Ранняя срезка' },
        2025: { cropId: 'zucchini', variety: 'Аэронавт', note: 'Много плодов' },
        2026: { cropId: 'peas', variety: 'Амброзия', note: 'План: сахарный горошек' }
      }
    },
    {
      id: 'bed-row2-3',
      name: 'Грядка 6 (Свёкла столовая)',
      type: 'raised',
      orientation: 'horizontal',
      x: 28.5,
      y: 4.0,
      width: 4.2,
      height: 1.2,
      irrigation: 'Шланг',
      notes: 'Борщевая грядка.',
      history: {
        2024: { cropId: 'potato', variety: 'Удача', note: 'Ранний картофель' },
        2025: { cropId: 'onion', variety: 'Эксибишен', note: 'Крупные сладкие луковицы' },
        2026: { cropId: 'beet', variety: 'Бордо 237', note: 'План: посев в мае' }
      }
    },

    // --- Клубничники ---
    {
      id: 'bed-berry-1',
      name: 'Клубничник 1 (Молодой, 2-й год)',
      type: 'berry',
      orientation: 'horizontal',
      x: 2.0,
      y: 6.5,
      width: 6.5,
      height: 1.5,
      irrigation: 'Капельная лента',
      notes: 'Чёрный мульчирующий агротекстиль.',
      history: {
        2024: { cropId: 'garlic', variety: 'Озимый', note: 'Предшественник перед закладкой клубники' },
        2025: { cropId: 'strawberry', variety: 'Альба & Клери', note: '1-й год после высадки' },
        2026: { cropId: 'strawberry', variety: 'Альба & Клери', note: '2-й год: пик плодоношения' }
      }
    },
    {
      id: 'bed-berry-2',
      name: 'Клубничник 2 (Взрослый, 3-й год)',
      type: 'berry',
      orientation: 'horizontal',
      x: 9.5,
      y: 6.5,
      width: 6.5,
      height: 1.5,
      irrigation: 'Капельная лента',
      notes: 'Сорта Азия и Мальвина.',
      history: {
        2024: { cropId: 'strawberry', variety: 'Азия', note: '1-й год' },
        2025: { cropId: 'strawberry', variety: 'Азия', note: '2-й год, сладкая ягода' },
        2026: { cropId: 'strawberry', variety: 'Азия', note: '3-й год плодоношения' }
      }
    },

    // --- Овощная зона открытого грунта ---
    {
      id: 'bed-og-1',
      name: 'Грядка 7 (Огурцы грунтовые под дугами)',
      type: 'ground',
      orientation: 'horizontal',
      x: 17.5,
      y: 6.5,
      width: 5.0,
      height: 1.5,
      irrigation: 'Шланг',
      notes: 'Каркас из дуг со спанбондом.',
      history: {
        2024: { cropId: 'beans', variety: 'Масляный Король', note: 'Обогащение почвы' },
        2025: { cropId: 'radish', variety: 'Французский завтрак', note: 'Скороспелый весенний сбор' },
        2026: { cropId: 'cucumber', variety: 'Родничок F1 & Конкурент', note: 'План: грунтовой огурец' }
      }
    },
    {
      id: 'bed-og-2',
      name: 'Грядка 8 (Капуста Брокколи / Цветная)',
      type: 'ground',
      orientation: 'horizontal',
      x: 24.0,
      y: 6.5,
      width: 5.0,
      height: 1.5,
      irrigation: 'Дождеватель',
      notes: 'Укрывной материал от крестоцветной блошки.',
      history: {
        2024: { cropId: 'tomato', variety: 'Грунтовый', note: 'Низкорослые' },
        2025: { cropId: 'peas', variety: 'Альфа', note: 'Отличный предшественник' },
        2026: { cropId: 'broccoli', variety: 'Фиеста & Батавия', note: 'План: высадка в конце мая' }
      }
    },

    // --- Картофельное поле & Отдых почвы ---
    {
      id: 'bed-potato-field',
      name: 'Картофельный участок (Поле)',
      type: 'ground',
      orientation: 'horizontal',
      x: 2.0,
      y: 9.5,
      width: 14.0,
      height: 5.5,
      irrigation: 'Естественный + дождевание',
      notes: 'Окучивание дважды за сезон, обработка от жука.',
      history: {
        2024: { cropId: 'potato', variety: 'Ред Скарлетт & Гала', note: 'Собрали 18 мешков' },
        2025: { cropId: 'green_manure_mustard', variety: 'Горчица белая', note: 'Оздоровление от парши и проволочника' },
        2026: { cropId: 'potato', variety: 'Королева Анна & Беллароза', note: 'План: посадка клубней в мае' }
      }
    },
    {
      id: 'bed-green-manure',
      name: 'Грядка 9 (Оздоровление: Фацелия)',
      type: 'warm',
      orientation: 'horizontal',
      x: 17.5,
      y: 9.5,
      width: 5.0,
      height: 1.5,
      irrigation: 'Естественный',
      notes: 'Почва отдыхает и восстанавливает биогумус.',
      history: {
        2024: { cropId: 'potato', variety: 'Синеглазка', note: 'Было утомление почвы' },
        2025: { cropId: 'fallow', variety: 'Мульча и перегной', note: 'Отдых почвы' },
        2026: { cropId: 'green_manure_phacelia', variety: 'Медоносная фацелия', note: 'План: сидерат для оздоровления' }
      }
    },
    {
      id: 'bed-herbs',
      name: 'Грядка 10 (Аптекарский огород & Зелень)',
      type: 'raised',
      orientation: 'horizontal',
      x: 24.0,
      y: 9.5,
      width: 5.0,
      height: 1.5,
      irrigation: 'Лейка',
      notes: 'Укроп, салат, петрушка, базилик, кинза.',
      history: {
        2024: { cropId: 'carrot', variety: 'Шантане', note: 'Сбор в октябре' },
        2025: { cropId: 'cabbage_white', variety: 'Ранняя', note: 'Чистая земля' },
        2026: { cropId: 'dill', variety: 'Аллигатор + Салаты', note: 'План: конвейер свежей зелени' }
      }
    },
    {
      id: 'bed-beans',
      name: 'Грядка 11 (Кустовая фасоль & Кукуруза)',
      type: 'ground',
      orientation: 'horizontal',
      x: 17.5,
      y: 13.0,
      width: 5.5,
      height: 1.8,
      irrigation: 'Шланг',
      notes: 'Азотофиксация для последующих культур.',
      history: {
        2024: { cropId: 'beet', variety: 'Цилиндра', note: 'Сладкие корнеплоды' },
        2025: { cropId: 'cucumber', variety: 'Парижский корнишон', note: 'Обильный урожай' },
        2026: { cropId: 'beans', variety: 'Масляный Король & Сакса', note: 'План: обогатить грядку перед томатами' }
      }
    },
    {
      id: 'bed-pumpkin-patch',
      name: 'Грядка 12 (Тыквенная поляна / Компост)',
      type: 'ground',
      orientation: 'horizontal',
      x: 24.5,
      y: 13.0,
      width: 5.5,
      height: 2.2,
      irrigation: 'Шланг',
      notes: 'Крупноплодные тыквы на компостной подушке.',
      history: {
        2024: { cropId: 'peas', variety: 'Сахарный', note: 'Хороший предшественник' },
        2025: { cropId: 'onion', variety: 'Севок', note: 'Очистка почвы' },
        2026: { cropId: 'pumpkin', variety: 'Витаминная & Россиянка', note: 'План: тыквы' }
      }
    }
  ]
};

class GardenStorage {
  constructor() {
    this.data = this.loadData();
    this.syncCustomCropsToGlobal();
  }

  syncCustomCropsToGlobal() {
    if (this.data && Array.isArray(this.data.customCrops) && typeof window !== 'undefined' && window.CROPS_DATABASE) {
      this.data.customCrops.forEach(c => {
        if (!window.CROPS_DATABASE.some(item => item.id === c.id)) {
          window.CROPS_DATABASE.push(c);
        }
      });
    }
  }

  getCustomCrops() {
    return this.data.customCrops || [];
  }

  addCustomCrop(cropData) {
    if (!this.data.customCrops) this.data.customCrops = [];
    const name = cropData.name.trim();
    const id = cropData.id || ('custom_' + Date.now());

    let existing = this.data.customCrops.find(c => c.name.toLowerCase() === name.toLowerCase())
      || (typeof window !== 'undefined' && window.CROPS_DATABASE && window.CROPS_DATABASE.find(c => c.name.toLowerCase() === name.toLowerCase()));

    if (existing) {
      return existing;
    }

    const newCrop = {
      id,
      name,
      family: cropData.family || 'custom',
      emoji: cropData.emoji || '🌱',
      nutrientDemand: cropData.nutrientDemand || 'medium',
      nutrientLabel: cropData.nutrientLabel || 'Умеренная потребность',
      rootDepth: cropData.rootDepth || 'Средняя',
      goodPredecessors: cropData.goodPredecessors || ['beans', 'peas', 'onion', 'garlic'],
      badPredecessors: cropData.badPredecessors || [],
      goodNeighbors: cropData.goodNeighbors || [],
      badNeighbors: cropData.badNeighbors || [],
      sowingPeriod: cropData.sowingPeriod || 'Май - Июнь',
      harvestPeriod: cropData.harvestPeriod || 'Август - Сентябрь',
      minYearsReturn: cropData.minYearsReturn || 3,
      description: cropData.description || `Пользовательская культура: ${name}.`,
      agronomicTip: cropData.agronomicTip || 'Соблюдайте регулярный полив и поддержание рыхлости почвы.',
      isCustom: true
    };

    this.data.customCrops.push(newCrop);
    this.saveData();
    this.syncCustomCropsToGlobal();
    return newCrop;
  }

  loadData() {
    try {
      let serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        if (parsed && parsed.beds && Array.isArray(parsed.beds)) {
          return this.sanitizeData(parsed);
        }
      }
    } catch (e) {
      console.warn('Ошибка чтения из LocalStorage, восстанавливаем демо-данные:', e);
    }
    // Первый запуск новой версии — загружаем богатый демонстрационный огород с теплицами на 3 грядки!
    const initialData = JSON.parse(JSON.stringify(DEMO_GARDEN_DATA));
    this.saveData(initialData);
    return initialData;
  }

  sanitizeData(data) {
    if (!data.meta) data.meta = { ...DEMO_GARDEN_DATA.meta };
    if (!data.years || !data.years.length) data.years = [2024, 2025, 2026];
    if (!data.activeYear) data.activeYear = 2026;
    if (!Array.isArray(data.customCrops)) data.customCrops = [];
    if (!Array.isArray(data.beds)) data.beds = [];

    // Приведение грядок
    data.beds.forEach((bed, index) => {
      if (!bed.id) bed.id = 'bed-' + (index + 1);
      if (!bed.orientation) {
        bed.orientation = (bed.width >= bed.height) ? 'horizontal' : 'vertical';
      }

      // Если это теплица и нет секций — создаем 3 раздельные грядки внутри
      if (bed.type === 'greenhouse') {
        if (!bed.sections || bed.sections.length === 0) {
          bed.sectionsCount = 3;
          bed.sections = [
            {
              id: 'sec-1',
              name: 'Левая грядка',
              history: bed.history ? JSON.parse(JSON.stringify(bed.history)) : {}
            },
            {
              id: 'sec-2',
              name: 'Центральная грядка',
              history: {}
            },
            {
              id: 'sec-3',
              name: 'Правая грядка',
              history: {}
            }
          ];
        }
      } else {
        if (!bed.history) bed.history = {};
      }

      if (typeof bed.x !== 'number') bed.x = 2;
      if (typeof bed.y !== 'number') bed.y = 2;
      if (typeof bed.width !== 'number') bed.width = 4;
      if (typeof bed.height !== 'number') bed.height = 1.2;
    });

    // Координаты грядок сохраняются строго в соответствии с выбором пользователя.
    // Автоматическая расстановка дорожек выполняется только по явной кнопке пользователя.
    return data;
  }

  /**
   * Интеллектуальное разделение грядок и выстраивание ровных просторных дорожек.
   * Устраняет любые наложения по вертикали и горизонтали, учитывая реальные габариты
   * карточек, количество рядков/секций и выступающие Excel-закладки (хвостики).
   */
  resolveOverlaps(beds, force = false) {
    if (!beds || beds.length < 2) return beds;

    // Функция расчёта реальной высоты грядки в метрах (включая верхнюю закладку и мин. размер)
    const getEffectiveHeight = (bed) => {
      const isGh = bed.type === 'greenhouse';
      const secCount = (bed.sections && bed.sections.length) ? bed.sections.length : 1;
      
      let minHeightPx = 105;
      if (bed.sections && bed.sections.length > 1 || (isGh && bed.sections && bed.sections.length > 0)) {
        const isGhHorizontal = bed.orientation !== 'vertical' && bed.width >= bed.height;
        let isInternalHorizontal = isGhHorizontal;
        if (bed.sectionsLayout === 'transverse') isInternalHorizontal = !isGhHorizontal;
        minHeightPx = isInternalHorizontal 
          ? (isGh ? 300 : Math.max(124, 46 * secCount + 36))
          : (isGh ? 350 : 250);
      }
      
      const heightFromPx = minHeightPx / 80;
      return Math.max(bed.height || 1.2, heightFromPx);
    };

    const getEffectiveWidth = (bed) => {
      const isGh = bed.type === 'greenhouse';
      let minWidthPx = 125;
      if (bed.sections && bed.sections.length > 1 || (isGh && bed.sections && bed.sections.length > 0)) {
        const isGhHorizontal = bed.orientation !== 'vertical' && bed.width >= bed.height;
        let isInternalHorizontal = isGhHorizontal;
        if (bed.sectionsLayout === 'transverse') isInternalHorizontal = !isGhHorizontal;
        minWidthPx = isInternalHorizontal ? (isGh ? 380 : 320) : (isGh ? 330 : 280);
      }
      return Math.max(bed.width || 4, minWidthPx / 80);
    };

    let hasChanged = false;

    // Шаг 1: Проверка и устранение перекрытий в 2D между всеми парами грядок
    // Делаем несколько проходов (итераций), пока все наложения не исчезнут
    const maxPasses = 8;
    for (let pass = 0; pass < maxPasses; pass++) {
      let passChanged = false;

      // Сортируем грядки сверху вниз, а при одинаковом Y — слева направо
      beds.sort((a, b) => a.y - b.y || a.x - b.x);

      for (let i = 0; i < beds.length; i++) {
        for (let j = i + 1; j < beds.length; j++) {
          const upper = beds[i];
          const lower = beds[j];

          const upperW = getEffectiveWidth(upper);
          const lowerW = getEffectiveWidth(lower);

          // Проверяем пересечение по горизонтали X:
          // Два прямоугольника [A.x, A.x + A.w] и [B.x, B.x + B.w] пересекаются,
          // если max(A.x, B.x) < min(A.x+A.w, B.x+B.w)
          const xOverlap = Math.max(upper.x, lower.x) < (Math.min(upper.x + upperW, lower.x + lowerW) - 0.1);

          if (!xOverlap) {
            continue; // Не на одной вертикали, дорожка между ними свободна
          }

          // Если они пересекаются по горизонтали, то нижняя грядка должна быть строго ниже верхней
          const upperH = getEffectiveHeight(upper);
          // Минимальный вертикальный зазор: 0.35м на Excel-закладку (хвостик) + 0.75м на чистую пешеходную дорожку
          const minWalkway = 1.15; 
          const requiredMinY = Math.round((upper.y + upperH + minWalkway) * 10) / 10;

          if (lower.y < requiredMinY) {
            lower.y = requiredMinY;
            hasChanged = true;
            passChanged = true;
          }
        }
      }

      if (!passChanged) break;
    }

    // Шаг 2 (при нажатии "Расставить дорожки"): Выравнивание грядок по горизонтальным линиям (рядам)
    if (force) {
      // Группируем грядки в ряды, если их Y близки (в пределах 0.85м) и они не перекрываются по X
      const rows = [];
      const sortedByY = [...beds].sort((a, b) => a.y - b.y);

      sortedByY.forEach(bed => {
        let matchingRow = rows.find(r => Math.abs(r.y - bed.y) <= 0.85);
        if (matchingRow) {
          // Проверяем, не перекрывается ли по X с кем-то в этом ряду
          const bW = getEffectiveWidth(bed);
          const hasXConflict = matchingRow.beds.some(other => {
            const oW = getEffectiveWidth(other);
            return Math.max(bed.x, other.x) < Math.min(bed.x + bW, other.x + oW);
          });
          if (!hasXConflict) {
            matchingRow.beds.push(bed);
            return;
          }
        }
        rows.push({ y: bed.y, beds: [bed] });
      });

      // Выравниваем Y всех грядок в каждом ряду по максимальному базовому Y ряда
      rows.forEach(row => {
        if (row.beds.length > 1) {
          const rowY = Math.max(...row.beds.map(b => b.y));
          row.beds.forEach(b => {
            if (b.y !== rowY) {
              b.y = rowY;
              hasChanged = true;
            }
          });
        }
      });

      // Финальный проход устранения наложений после выравнивания рядов
      for (let i = 0; i < beds.length; i++) {
        for (let j = i + 1; j < beds.length; j++) {
          const upper = beds[i];
          const lower = beds[j];
          if (upper.y > lower.y) continue;

          const upperW = getEffectiveWidth(upper);
          const lowerW = getEffectiveWidth(lower);
          const xOverlap = Math.max(upper.x, lower.x) < (Math.min(upper.x + upperW, lower.x + lowerW) - 0.1);

          if (xOverlap) {
            const upperH = getEffectiveHeight(upper);
            const reqY = Math.round((upper.y + upperH + 1.15) * 10) / 10;
            if (lower.y < reqY) {
              lower.y = reqY;
              hasChanged = true;
            }
          }
        }
      }
    }

    if (hasChanged) {
      this.saveData();
    }
    return beds;
  }

  saveData(dataToSave) {
    if (dataToSave) {
      this.data = dataToSave;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      window.dispatchEvent(new CustomEvent('garden-data-changed', { detail: this.data }));
      return true;
    } catch (e) {
      console.error('Ошибка сохранения данных в LocalStorage:', e);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('garden-storage-full', { detail: e }));
        if (window.app && typeof window.app.openStorageFullModal === 'function') {
          window.app.openStorageFullModal();
        } else if (window.app && typeof window.app.showToast === 'function') {
          const quotaMsg = (typeof window.t === 'function') ? window.t('toast_storage_error') : null;
          window.app.showToast(quotaMsg || '⚠️ Память браузера переполнена! Экспортируйте план в файл.', 'error');
        }
      }
      return false;
    }
  }

  getData() {
    return this.data;
  }

  getActiveYear() {
    return this.data.activeYear || 2026;
  }

  setActiveYear(year) {
    this.data.activeYear = parseInt(year, 10);
    if (!this.data.years.includes(this.data.activeYear)) {
      this.data.years.push(this.data.activeYear);
      this.data.years.sort((a, b) => a - b);
    }
    this.saveData();
  }

  addYear(year) {
    const y = parseInt(year, 10);
    if (!this.data.years.includes(y)) {
      this.data.years.push(y);
      this.data.years.sort((a, b) => a - b);
      this.saveData();
      return true;
    }
    return false;
  }

  getBeds() {
    return this.data.beds || [];
  }

  getBedById(id) {
    return this.data.beds.find(b => b.id === id) || null;
  }

  saveBed(bedData) {
    const existingIndex = this.data.beds.findIndex(b => b.id === bedData.id);
    if (existingIndex >= 0) {
      this.data.beds[existingIndex] = { ...this.data.beds[existingIndex], ...bedData };
    } else {
      if (!bedData.id) {
        bedData.id = 'bed-' + Date.now();
      }
      this.data.beds.push(bedData);
    }
    this.saveData();
    return bedData;
  }

  duplicateBed(bedId) {
    const sourceBed = this.getBedById(bedId);
    if (!sourceBed) return null;

    const clone = JSON.parse(JSON.stringify(sourceBed));
    clone.id = 'bed-' + Date.now();
    clone.name = sourceBed.name + ' (Копия)';
    clone.x = Math.round((sourceBed.x + 0.8) * 10) / 10;
    clone.y = Math.round((sourceBed.y + sourceBed.height + 0.6) * 10) / 10;

    if (clone.sections && clone.sections.length > 0) {
      clone.sections = clone.sections.map((sec, idx) => ({
        ...sec,
        id: `sec-${Date.now()}-${idx + 1}`
      }));
    }

    this.data.beds.push(clone);
    this.saveData();
    return clone;
  }

  createBedRow(baseBed, count = 4, gap = 0.9) {
    const createdBeds = [];
    const orientation = baseBed.orientation || 'horizontal';
    const baseName = (baseBed.name && baseBed.name.trim()) ? baseBed.name.trim() : 'Грядка';
    const secCount = (baseBed.sections && baseBed.sections.length) ? baseBed.sections.length : 2;
    const isGh = baseBed.type === 'greenhouse';
    const minHeightPx = isGh ? 300 : Math.max(124, 46 * secCount + 36);
    const visualHeightM = Math.max(baseBed.height || 1.2, minHeightPx / 80);
    const stepY = Math.max(baseBed.height + gap, visualHeightM + 0.35 + gap);
    const stepX = Math.max(baseBed.width + gap, 4.2 + gap);

    for (let i = 0; i < count; i++) {
      const bed = JSON.parse(JSON.stringify(baseBed));
      bed.id = 'bed-' + Date.now() + '-' + i + '-' + Math.floor(Math.random() * 1000);
      bed.name = `${baseName} ${i + 1}`;

      if (orientation === 'horizontal') {
        bed.x = baseBed.x;
        bed.y = baseBed.y + i * stepY;
      } else {
        bed.x = baseBed.x + i * stepX;
        bed.y = baseBed.y;
      }

      bed.x = Math.round(bed.x * 10) / 10;
      bed.y = Math.round(bed.y * 10) / 10;
      bed.history = {};

      if (bed.sections && bed.sections.length > 0) {
        bed.sections = bed.sections.map((s, idx) => ({
          ...s,
          id: `sec-${Date.now()}-${i}-${idx + 1}`,
          history: {}
        }));
      }

      this.data.beds.push(bed);
      createdBeds.push(bed);
    }

    this.saveData();
    return createdBeds;
  }

  createBedGrid(baseBed, cols = 4, rows = 5, gapX = 1.0, gapY = 1.0) {
    const createdBeds = [];
    const baseName = (baseBed.name && baseBed.name.trim()) ? baseBed.name.trim() : 'Грядка';
    const startX = (baseBed.x !== undefined) ? baseBed.x : 2.0;
    const startY = (baseBed.y !== undefined) ? baseBed.y : 2.0;
    let bedNumber = 1;

    const secCount = (baseBed.sections && baseBed.sections.length) ? baseBed.sections.length : 2;
    const isGh = baseBed.type === 'greenhouse';
    const minHeightPx = isGh ? 300 : Math.max(124, 46 * secCount + 36);
    const visualHeightM = Math.max(baseBed.height || 1.2, minHeightPx / 80);
    const stepY = Math.max(baseBed.height + gapY, visualHeightM + 0.35 + gapY);
    const stepX = Math.max(baseBed.width + gapX, 4.2 + gapX);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const bed = JSON.parse(JSON.stringify(baseBed));
        bed.id = 'bed-' + Date.now() + '-' + r + '-' + c + '-' + Math.floor(Math.random() * 1000);
        bed.name = `${baseName} ${bedNumber}`;
        bedNumber++;

        bed.x = startX + c * stepX;
        bed.y = startY + r * stepY;

        bed.x = Math.round(bed.x * 10) / 10;
        bed.y = Math.round(bed.y * 10) / 10;
        bed.history = {};

        if (bed.sections && bed.sections.length > 0) {
          bed.sections = bed.sections.map((s, idx) => ({
            ...s,
            id: `sec-${Date.now()}-${r}-${c}-${idx + 1}`,
            history: {}
          }));
        }

        this.data.beds.push(bed);
        createdBeds.push(bed);
      }
    }

    this.saveData();
    return createdBeds;
  }

  rotateBed(bedId) {
    const bed = this.getBedById(bedId);
    if (!bed) return false;

    // Меняем ширину и длину местами
    const temp = bed.width;
    bed.width = bed.height;
    bed.height = temp;

    bed.orientation = (bed.orientation === 'vertical' || bed.height > bed.width) ? 'horizontal' : 'vertical';

    this.saveData();
    return true;
  }

  setBedSectionsCount(bedId, count) {
    const bed = this.getBedById(bedId);
    if (!bed) return null;

    count = parseInt(count, 10);
    const isGh = bed.type === 'greenhouse';
    const defaultNames2 = isGh ? ['Левая грядка', 'Правая грядка'] : ['Рядок 1 (Левый)', 'Рядок 2 (Правый)'];
    const defaultNames3 = isGh ? ['Левая грядка', 'Центральная грядка', 'Правая грядка'] : ['Рядок 1 (Левый)', 'Рядок 2 (Центр)', 'Рядок 3 (Правый)'];

    if (count <= 1) {
      // Превращаем в 1 цельную грядку
      if (bed.sections && bed.sections.length > 0) {
        // Переносим историю посадок из 1-й секции в корень грядки
        const sec1 = bed.sections[0];
        if (sec1 && sec1.history) {
          bed.history = { ...(bed.history || {}), ...sec1.history };
        }
      }
      bed.sectionsCount = 1;
      delete bed.sections;
    } else {
      // 2 или 3 раздельных рядка/секции
      const prevSections = bed.sections || [];
      const newSections = [];
      const names = count === 2 ? defaultNames2 : defaultNames3;

      for (let i = 0; i < count; i++) {
        const existing = prevSections[i];
        if (existing) {
          newSections.push({
            ...existing,
            name: existing.name || names[i]
          });
        } else {
          // Если это 1-я секция и у грядки уже была история, переносим её сюда
          const initialHistory = (i === 0 && bed.history) ? JSON.parse(JSON.stringify(bed.history)) : {};
          newSections.push({
            id: `sec-${i + 1}-${Date.now()}`,
            name: names[i] || `Рядок ${i + 1}`,
            history: initialHistory
          });
        }
      }
      bed.sectionsCount = count;
      bed.sections = newSections;
    }

    this.saveBed(bed);
    return bed;
  }

  deleteBed(id) {
    this.data.beds = this.data.beds.filter(b => b.id !== id);
    this.saveData();
  }

  updateBedPlanting(bedId, year, cropId, variety = '', note = '', sectionId = null) {
    const bed = this.getBedById(bedId);
    if (!bed) return false;

    // Если это теплица с секциями-грядками
    if (bed.sections && bed.sections.length > 0) {
      const sec = sectionId ? bed.sections.find(s => s.id === sectionId) : bed.sections[0];
      if (sec) {
        if (!sec.history) sec.history = {};
        sec.history[year] = {
          cropId,
          variety,
          note,
          updatedAt: new Date().toISOString()
        };
        this.saveData();
        return true;
      }
    }

    if (!bed.history) bed.history = {};
    bed.history[year] = {
      cropId,
      variety,
      note,
      updatedAt: new Date().toISOString()
    };

    this.saveData();
    return true;
  }

  getBedHistoryArray(bedId, targetYear, sectionId = null) {
    const bed = this.getBedById(bedId);
    if (!bed) return [];

    let historyObj = bed.history || {};
    if (bed.sections && bed.sections.length > 0) {
      const sec = sectionId ? bed.sections.find(s => s.id === sectionId) : bed.sections[0];
      if (sec && sec.history) {
        historyObj = sec.history;
      }
    }

    const yearsBefore = Object.keys(historyObj)
      .map(y => parseInt(y, 10))
      .filter(y => y < targetYear)
      .sort((a, b) => b - a);

    return yearsBefore.map(y => ({
      year: y,
      cropId: historyObj[y]?.cropId || null,
      variety: historyObj[y]?.variety || '',
      note: historyObj[y]?.note || ''
    }));
  }

  resetToDemo() {
    this.data = JSON.parse(JSON.stringify(DEMO_GARDEN_DATA));
    this.saveData();
    return this.data;
  }

  clearAll() {
    this.data = {
      meta: {
        version: '3.0',
        title: 'Мой Новый Огород',
        description: 'Чистый план',
        soilType: 'Обычная садовая земля'
      },
      years: [2025, 2026],
      activeYear: 2026,
      customCrops: this.data.customCrops || [],
      beds: []
    };
    this.saveData();
    return this.data;
  }

  exportJson() {
    const jsonStr = JSON.stringify(this.data, null, 2);
    // Добавляем маркер UTF-8 BOM (\ufeff), чтобы Windows и текстовые редакторы
    // гарантированно открывали файл в правильной кодировке с русскими буквами.
    const blob = new Blob(["\ufeff", jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    const year = this.getActiveYear ? this.getActiveYear() : 2026;
    const fileName = `Мой_Огород_План_${year}_(${dateStr}).json`;
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    // В Google Chrome и Edge удаление URL не должно происходить мгновенно в том же тике,
    // иначе браузер может оборвать сохранение файла на диск.
    setTimeout(() => {
      if (a.parentNode) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    }, 4000);
    return fileName;
  }

  importJson(jsonString) {
    try {
      // Удаляем возможный маркер UTF-8 BOM в начале строки
      const cleanString = (typeof jsonString === 'string') ? jsonString.replace(/^\ufeff/, '') : jsonString;
      const parsed = JSON.parse(cleanString);
      if (!parsed || !Array.isArray(parsed.beds)) {
        throw new Error('Некорректный формат файла плана огорода');
      }
      this.data = this.sanitizeData(parsed);
      this.saveData();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // --- Агро-журнал: Журнал подкормок и ухода (Care Logs) ---
  addBedCareLog(bedId, year, logEntry, sectionId = null) {
    const bed = this.getBedById(bedId);
    if (!bed) return null;
    const target = (sectionId && bed.sections)
      ? (bed.sections.find(s => s.id === sectionId) || bed)
      : bed;

    if (!target.careLogs) target.careLogs = {};
    const yStr = String(year);
    if (!target.careLogs[yStr]) target.careLogs[yStr] = [];

    const entry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      date: logEntry.date || new Date().toISOString().split('T')[0],
      type: logEntry.type || 'fertilizer', // fertilizer | protection | care
      title: (logEntry.title || '').trim(),
      note: (logEntry.note || '').trim(),
      createdAt: new Date().toISOString()
    };

    target.careLogs[yStr].unshift(entry);
    this.saveData();
    return entry;
  }

  getBedCareLogs(bedId, year, sectionId = null) {
    const bed = this.getBedById(bedId);
    if (!bed) return [];
    const target = (sectionId && bed.sections)
      ? (bed.sections.find(s => s.id === sectionId) || bed)
      : bed;

    const yStr = String(year);
    if (!target.careLogs || !target.careLogs[yStr]) return [];
    return target.careLogs[yStr];
  }

  deleteBedCareLog(bedId, year, logId, sectionId = null) {
    const bed = this.getBedById(bedId);
    if (!bed) return false;
    const target = (sectionId && bed.sections)
      ? (bed.sections.find(s => s.id === sectionId) || bed)
      : bed;

    const yStr = String(year);
    if (!target.careLogs || !target.careLogs[yStr]) return false;
    target.careLogs[yStr] = target.careLogs[yStr].filter(item => item.id !== logId);
    this.saveData();
    return true;
  }
}

/**
 * Хранилище фотографий урожая в IndexedDB
 * Позволяет хранить десятки снимков высокого качества,
 * не расходуя лимит LocalStorage и не переполняя браузер!
 */
class GardenPhotoStorage {
  constructor() {
    this.dbName = 'SmartGardenPhotosDB';
    this.dbVersion = 1;
    this.db = null;
    this.memoryFallback = new Map();
  }

  async open() {
    if (this.db) return this.db;
    if (typeof window === 'undefined' || !window.indexedDB) return null;

    return new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(this.dbName, this.dbVersion);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('photos')) {
            const store = db.createObjectStore('photos', { keyPath: 'id' });
            store.createIndex('bedId', 'bedId', { unique: false });
            store.createIndex('year', 'year', { unique: false });
          }
        };
        req.onsuccess = (e) => {
          this.db = e.target.result;
          resolve(this.db);
        };
        req.onerror = (e) => {
          console.warn('IndexedDB unavailable, fallback to memory:', e);
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB error:', err);
        resolve(null);
      }
    });
  }

  async addPhoto(bedId, year, dataUrl, caption = '', date = '') {
    const id = 'photo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const photoObj = {
      id,
      bedId,
      year: parseInt(year, 10),
      caption: (caption || '').trim(),
      date: date || new Date().toISOString().split('T')[0],
      dataUrl,
      createdAt: new Date().toISOString()
    };

    const db = await this.open();
    if (!db) {
      this.memoryFallback.set(id, photoObj);
      return photoObj;
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('photos', 'readwrite');
        const store = tx.objectStore('photos');
        const req = store.add(photoObj);
        req.onsuccess = () => resolve(photoObj);
        req.onerror = (err) => {
          console.warn('IndexedDB add error, falling back to memory:', err);
          this.memoryFallback.set(id, photoObj);
          resolve(photoObj);
        };
      } catch (err) {
        this.memoryFallback.set(id, photoObj);
        resolve(photoObj);
      }
    });
  }

  async getPhotosByBed(bedId, year = null) {
    const memoryPhotos = [];
    this.memoryFallback.forEach(p => {
      if (p.bedId === bedId && (year === null || p.year === parseInt(year, 10))) {
        memoryPhotos.push(p);
      }
    });

    const db = await this.open();
    if (!db) {
      return memoryPhotos.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('photos', 'readonly');
        const store = tx.objectStore('photos');
        const index = store.index('bedId');
        const req = index.getAll(bedId);
        req.onsuccess = () => {
          let list = req.result || [];
          if (year !== null) {
            const targetY = parseInt(year, 10);
            list = list.filter(p => p.year === targetY);
          }
          // Объединяем с фото из fallback памяти, исключая дубликаты ID
          const existingIds = new Set(list.map(p => p.id));
          memoryPhotos.forEach(mp => {
            if (!existingIds.has(mp.id)) list.push(mp);
          });
          list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          resolve(list);
        };
        req.onerror = () => resolve(memoryPhotos);
      } catch (e) {
        resolve(memoryPhotos);
      }
    });
  }

  async deletePhoto(photoId) {
    this.memoryFallback.delete(photoId);
    const db = await this.open();
    if (!db) return true;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction('photos', 'readwrite');
        const store = tx.objectStore('photos');
        const req = store.delete(photoId);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.GardenStorage = GardenStorage;
  window.GardenPhotoStorage = GardenPhotoStorage;
  window.photoStorage = new GardenPhotoStorage();
}
