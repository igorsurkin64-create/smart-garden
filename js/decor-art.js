/**
 * 🎨 Декор участка (3D мультяшные объекты дачи) + улучшенные глянцевые арт-иллюстрации культур
 * Все иллюстрации — чистый масштабируемый вектор (SVG), работают мгновенно и оффлайн.
 */

const GARDEN_DECOR_CATALOG = [
  {
    type: 'house',
    icon: '🏠',
    nameRu: 'Дачный домик',
    nameEt: 'Suvila',
    nameLv: 'Vasarnīca',
    nameLt: 'Sodo namelis',
    width: 3.5,
    height: 2.8,
    zLayer: 'high',
    svg: `<svg viewBox="0 0 180 150" width="100%" height="100%">
      <ellipse cx="94" cy="132" rx="76" ry="15" fill="#1e3a0f" opacity="0.32"/>
      <!-- Стены домика (3D вид спереди) -->
      <rect x="26" y="76" width="128" height="54" rx="8" fill="#f5d5a7" stroke="#5c3518" stroke-width="3.5"/>
      <line x1="28" y1="90" x2="152" y2="90" stroke="#d4a373" stroke-width="2"/>
      <line x1="28" y1="104" x2="152" y2="104" stroke="#d4a373" stroke-width="2"/>
      <line x1="28" y1="118" x2="152" y2="118" stroke="#d4a373" stroke-width="2"/>
      <!-- Дверь и окошки -->
      <rect x="76" y="88" width="28" height="42" rx="4" fill="#9a5b2c" stroke="#4a260d" stroke-width="2.5"/>
      <circle cx="98" cy="110" r="2.5" fill="#fde047"/>
      <rect x="40" y="92" width="24" height="22" rx="4" fill="#bae6fd" stroke="#4a260d" stroke-width="2.5"/>
      <line x1="52" y1="92" x2="52" y2="114" stroke="#4a260d" stroke-width="2"/>
      <line x1="40" y1="103" x2="64" y2="103" stroke="#4a260d" stroke-width="2"/>
      <rect x="116" y="92" width="24" height="22" rx="4" fill="#bae6fd" stroke="#4a260d" stroke-width="2.5"/>
      <line x1="128" y1="92" x2="128" y2="114" stroke="#4a260d" stroke-width="2"/>
      <line x1="116" y1="103" x2="140" y2="103" stroke="#4a260d" stroke-width="2"/>
      <!-- Дымоход -->
      <rect x="122" y="18" width="18" height="30" rx="3" fill="#b45309" stroke="#4a260d" stroke-width="2.5"/>
      <circle cx="132" cy="11" r="6" fill="#ffffff" opacity="0.72"/>
      <circle cx="141" cy="5" r="4.5" fill="#ffffff" opacity="0.52"/>
      <!-- Черепичная 3D крыша -->
      <path d="M12 82 L90 20 L168 82 L156 88 L90 36 L24 88 Z" fill="#dc2626" stroke="#7f1d1d" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M22 82 L90 28 L158 82 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="3" stroke-linejoin="round"/>
      <path d="M40 70 L90 32 L140 70" stroke="#fca5a5" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.55"/>
      <circle cx="90" cy="58" r="9" fill="#fef08a" stroke="#7f1d1d" stroke-width="2.5"/>
      <line x1="90" y1="49" x2="90" y2="67" stroke="#7f1d1d" stroke-width="1.8"/>
      <line x1="81" y1="58" x2="99" y2="58" stroke="#7f1d1d" stroke-width="1.8"/>
    </svg>`
  },
  {
    type: 'gazebo',
    icon: '⛺',
    nameRu: 'Беседка',
    nameEt: 'Lehtla',
    nameLv: 'Lapene',
    nameLt: 'Pavėsinė',
    width: 2.5,
    height: 2.5,
    zLayer: 'high',
    svg: `<svg viewBox="0 0 140 140" width="100%" height="100%">
      <ellipse cx="73" cy="120" rx="54" ry="14" fill="#1e3a0f" opacity="0.3"/>
      <!-- Основание и столбики -->
      <polygon points="34,70 106,70 116,108 24,108" fill="#d9a066" stroke="#5c3518" stroke-width="3" stroke-linejoin="round"/>
      <rect x="34" y="62" width="8" height="44" fill="#8c5327" stroke="#4a260d" stroke-width="2"/>
      <rect x="98" y="62" width="8" height="44" fill="#8c5327" stroke="#4a260d" stroke-width="2"/>
      <!-- Столик внутри -->
      <ellipse cx="70" cy="92" rx="18" ry="8" fill="#fef3c7" stroke="#78350f" stroke-width="2.2"/>
      <!-- Восьмиугольная мультяшная крыша -->
      <polygon points="70,16 124,62 110,76 30,76 16,62" fill="#16a34a" stroke="#14532d" stroke-width="3.2" stroke-linejoin="round"/>
      <polygon points="70,16 104,76 36,76" fill="#22c55e" stroke="#14532d" stroke-width="2.2" stroke-linejoin="round"/>
      <circle cx="70" cy="16" r="5.5" fill="#fde047" stroke="#854d0e" stroke-width="2"/>
    </svg>`
  },
  {
    type: 'apple_tree',
    icon: '🌳',
    nameRu: 'Яблоня',
    nameEt: 'Õunapuu',
    nameLv: 'Ābele',
    nameLt: 'Obelis',
    width: 2.0,
    height: 2.0,
    zLayer: 'high',
    svg: `<svg viewBox="0 0 130 130" width="100%" height="100%">
      <ellipse cx="68" cy="112" rx="42" ry="12" fill="#1a3a0d" opacity="0.32"/>
      <!-- Ствол -->
      <path d="M57 76 L54 110 C54 114 76 114 76 110 L73 76 Z" fill="#8d5524" stroke="#4a260d" stroke-width="3" stroke-linejoin="round"/>
      <path d="M62 84 L61 106" stroke="#b97a45" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Пышная 3D крона -->
      <circle cx="40" cy="64" r="28" fill="#2e7d32" stroke="#143d17" stroke-width="3"/>
      <circle cx="90" cy="64" r="28" fill="#2e7d32" stroke="#143d17" stroke-width="3"/>
      <circle cx="65" cy="40" r="32" fill="#43a047" stroke="#143d17" stroke-width="3"/>
      <circle cx="65" cy="62" r="29" fill="#4caf50"/>
      <circle cx="52" cy="36" r="14" fill="#81c784" opacity="0.65"/>
      <!-- Спелые красные яблоки -->
      <circle cx="44" cy="56" r="6" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.8"/>
      <circle cx="42.5" cy="54" r="1.8" fill="#ffffff" opacity="0.75"/>
      <circle cx="80" cy="48" r="6.2" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.8"/>
      <circle cx="78.5" cy="46" r="1.8" fill="#ffffff" opacity="0.75"/>
      <circle cx="62" cy="70" r="5.8" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.8"/>
      <circle cx="60.5" cy="68" r="1.6" fill="#ffffff" opacity="0.75"/>
      <circle cx="66" cy="30" r="5.5" fill="#f97316" stroke="#7c2d12" stroke-width="1.6"/>
      <circle cx="88" cy="68" r="5.5" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.8"/>
    </svg>`
  },
  {
    type: 'cherry_tree',
    icon: '🌸',
    nameRu: 'Вишня в цвету',
    nameEt: 'Õitsev kirss',
    nameLv: 'Ziedošs ķirsis',
    nameLt: 'Žydinti vyšnia',
    width: 1.9,
    height: 1.9,
    zLayer: 'high',
    svg: `<svg viewBox="0 0 130 130" width="100%" height="100%">
      <ellipse cx="68" cy="112" rx="40" ry="11" fill="#1a3a0d" opacity="0.3"/>
      <path d="M58 76 L55 110 C55 114 75 114 75 110 L72 76 Z" fill="#7c4a26" stroke="#3e220e" stroke-width="3"/>
      <circle cx="40" cy="64" r="27" fill="#f472b6" stroke="#831843" stroke-width="3"/>
      <circle cx="90" cy="64" r="27" fill="#f472b6" stroke="#831843" stroke-width="3"/>
      <circle cx="65" cy="40" r="31" fill="#f9a8d4" stroke="#831843" stroke-width="3"/>
      <circle cx="65" cy="60" r="27" fill="#fbcfe8"/>
      <circle cx="52" cy="44" r="5" fill="#ffffff" opacity="0.85"/>
      <circle cx="52" cy="44" r="2" fill="#facc15"/>
      <circle cx="78" cy="52" r="5" fill="#ffffff" opacity="0.85"/>
      <circle cx="78" cy="52" r="2" fill="#facc15"/>
      <circle cx="62" cy="68" r="4.5" fill="#ffffff" opacity="0.85"/>
      <circle cx="62" cy="68" r="1.8" fill="#facc15"/>
      <circle cx="66" cy="28" r="4.5" fill="#ffffff" opacity="0.85"/>
      <circle cx="66" cy="28" r="1.8" fill="#facc15"/>
    </svg>`
  },
  {
    type: 'berry_bush',
    icon: '🫐',
    nameRu: 'Куст смородины',
    nameEt: 'Sõstrapõõsas',
    nameLv: 'Upeņu krūms',
    nameLt: 'Serbentų krūmas',
    width: 1.3,
    height: 1.3,
    zLayer: 'mid',
    svg: `<svg viewBox="0 0 110 110" width="100%" height="100%">
      <ellipse cx="57" cy="92" rx="40" ry="11" fill="#1a3a0d" opacity="0.32"/>
      <circle cx="34" cy="62" r="24" fill="#2e7d32" stroke="#143d17" stroke-width="3"/>
      <circle cx="76" cy="62" r="24" fill="#2e7d32" stroke="#143d17" stroke-width="3"/>
      <circle cx="55" cy="42" r="26" fill="#43a047" stroke="#143d17" stroke-width="3"/>
      <circle cx="55" cy="62" r="24" fill="#4caf50"/>
      <circle cx="46" cy="36" r="10" fill="#81c784" opacity="0.65"/>
      <!-- Гроздья ягод -->
      <circle cx="38" cy="58" r="4.5" fill="#4c1d95" stroke="#1e1b4b" stroke-width="1.4"/>
      <circle cx="44" cy="64" r="4.5" fill="#5b21b6" stroke="#1e1b4b" stroke-width="1.4"/>
      <circle cx="68" cy="50" r="4.5" fill="#4c1d95" stroke="#1e1b4b" stroke-width="1.4"/>
      <circle cx="74" cy="56" r="4.5" fill="#5b21b6" stroke="#1e1b4b" stroke-width="1.4"/>
      <circle cx="56" cy="70" r="4.5" fill="#4c1d95" stroke="#1e1b4b" stroke-width="1.4"/>
    </svg>`
  },
  {
    type: 'water_barrel',
    icon: '💧',
    nameRu: 'Бочка для полива',
    nameEt: 'Kastmistünn',
    nameLv: 'Laistīšanas muca',
    nameLt: 'Laistymo statinė',
    width: 1.1,
    height: 1.1,
    zLayer: 'mid',
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <ellipse cx="52" cy="86" rx="32" ry="9" fill="#1a3a0d" opacity="0.34"/>
      <!-- Бочка 3D -->
      <path d="M22 30 L20 74 C20 84 80 84 80 74 L78 30 Z" fill="#0284c7" stroke="#0c4a6e" stroke-width="3.2"/>
      <path d="M21 48 Q50 56 79 48" stroke="#0c4a6e" stroke-width="3.5" fill="none"/>
      <path d="M21 66 Q50 74 79 66" stroke="#0c4a6e" stroke-width="3.5" fill="none"/>
      <!-- Вода внутри -->
      <ellipse cx="50" cy="30" rx="28" ry="12" fill="#38bdf8" stroke="#0c4a6e" stroke-width="3"/>
      <ellipse cx="50" cy="31" rx="22" ry="8" fill="#7dd3fc"/>
      <ellipse cx="44" cy="29" rx="9" ry="3" fill="#ffffff" opacity="0.72"/>
      <!-- Краник -->
      <rect x="76" y="64" width="12" height="6" rx="2" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
    </svg>`
  },
  {
    type: 'well',
    icon: '🪣',
    nameRu: 'Колодец',
    nameEt: 'Kaev',
    nameLv: 'Aka',
    nameLt: 'Šulinys',
    width: 1.5,
    height: 1.5,
    zLayer: 'high',
    svg: `<svg viewBox="0 0 120 120" width="100%" height="100%">
      <ellipse cx="62" cy="105" rx="40" ry="10" fill="#1a3a0d" opacity="0.32"/>
      <!-- Каменный сруб -->
      <path d="M28 66 L28 96 C28 106 92 106 92 96 L92 66 Z" fill="#94a3b8" stroke="#334155" stroke-width="3"/>
      <ellipse cx="60" cy="66" rx="32" ry="11" fill="#38bdf8" stroke="#334155" stroke-width="3"/>
      <path d="M32 82 Q60 90 88 82" stroke="#475569" stroke-width="2" fill="none"/>
      <!-- Стойки -->
      <rect x="33" y="36" width="7" height="32" fill="#8d5524" stroke="#4a260d" stroke-width="2"/>
      <rect x="80" y="36" width="7" height="32" fill="#8d5524" stroke="#4a260d" stroke-width="2"/>
      <!-- Крыша колодца -->
      <path d="M18 44 L60 14 L102 44 Z" fill="#c2410c" stroke="#5c2408" stroke-width="3" stroke-linejoin="round"/>
      <path d="M32 39 L60 20 L88 39" stroke="#fdba74" stroke-width="2.5" fill="none" opacity="0.55"/>
    </svg>`
  },
  {
    type: 'compost',
    icon: '♻️',
    nameRu: 'Компостер',
    nameEt: 'Komposter',
    nameLv: 'Kompostētājs',
    nameLt: 'Kompostinė',
    width: 1.4,
    height: 1.2,
    zLayer: 'mid',
    svg: `<svg viewBox="0 0 110 100" width="100%" height="100%">
      <ellipse cx="57" cy="86" rx="42" ry="9" fill="#1a3a0d" opacity="0.32"/>
      <rect x="16" y="30" width="78" height="52" rx="8" fill="#8d5524" stroke="#4a260d" stroke-width="3"/>
      <line x1="18" y1="48" x2="92" y2="48" stroke="#4a260d" stroke-width="2.5"/>
      <line x1="18" y1="66" x2="92" y2="66" stroke="#4a260d" stroke-width="2.5"/>
      <ellipse cx="55" cy="30" rx="35" ry="12" fill="#5c3c24" stroke="#3e2723" stroke-width="2.5"/>
      <path d="M55 28 C55 18 49 14 43 13 C47 18 51 23 55 28 Z" fill="#4ade80" stroke="#14532d" stroke-width="1.8"/>
      <path d="M55 28 C55 17 61 13 67 12 C63 17 59 22 55 28 Z" fill="#22c55e" stroke="#14532d" stroke-width="1.8"/>
    </svg>`
  },
  {
    type: 'pond',
    icon: '🪷',
    nameRu: 'Прудик',
    nameEt: 'Tiik',
    nameLv: 'Dīķītis',
    nameLt: 'Tvenkinukas',
    width: 2.4,
    height: 1.8,
    zLayer: 'low',
    svg: `<svg viewBox="0 0 160 120" width="100%" height="100%">
      <!-- Каменный берег -->
      <path d="M22 62 C16 28 54 12 96 18 C136 24 152 52 142 82 C132 108 86 112 52 104 C28 98 26 84 22 62 Z" fill="#cbd5e1" stroke="#475569" stroke-width="3.2"/>
      <!-- Бирюзовая вода -->
      <path d="M30 62 C26 36 58 22 94 26 C126 30 140 54 132 78 C124 98 84 102 56 96 C36 92 33 78 30 62 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="2.5"/>
      <ellipse cx="74" cy="54" rx="28" ry="14" fill="#7dd3fc" opacity="0.65"/>
      <!-- Кувшинки -->
      <path d="M52 68 A11 9 0 1 1 60 76 L56 68 Z" fill="#22c55e" stroke="#14532d" stroke-width="1.8"/>
      <circle cx="56" cy="64" r="5" fill="#f472b6" stroke="#831843" stroke-width="1.4"/>
      <circle cx="56" cy="64" r="2" fill="#fde047"/>
      <path d="M104 54 A10 8 0 1 1 112 61 L108 54 Z" fill="#4ade80" stroke="#14532d" stroke-width="1.8"/>
    </svg>`
  },
  {
    type: 'flowerbed',
    icon: '🌻',
    nameRu: 'Клумба с цветами',
    nameEt: 'Lillepeenar',
    nameLv: 'Puķu dobe',
    nameLt: 'Gėlynas',
    width: 1.6,
    height: 1.6,
    zLayer: 'mid',
    svg: `<svg viewBox="0 0 120 120" width="100%" height="100%">
      <ellipse cx="62" cy="64" rx="50" ry="48" fill="#1a3a0d" opacity="0.28"/>
      <circle cx="60" cy="60" r="48" fill="#d6d3d1" stroke="#57534e" stroke-width="3.5"/>
      <circle cx="60" cy="60" r="39" fill="#694326" stroke="#442914" stroke-width="2.5"/>
      <circle cx="44" cy="46" r="11" fill="#4ade80" stroke="#14532d" stroke-width="2"/>
      <circle cx="76" cy="48" r="11" fill="#22c55e" stroke="#14532d" stroke-width="2"/>
      <circle cx="58" cy="74" r="12" fill="#4ade80" stroke="#14532d" stroke-width="2"/>
      <!-- Цветы -->
      <circle cx="44" cy="44" r="7" fill="#facc15" stroke="#a16207" stroke-width="1.6"/>
      <circle cx="44" cy="44" r="3" fill="#78350f"/>
      <circle cx="76" cy="46" r="7" fill="#f472b6" stroke="#9d174d" stroke-width="1.6"/>
      <circle cx="76" cy="46" r="2.8" fill="#fef08a"/>
      <circle cx="58" cy="72" r="7.5" fill="#fb923c" stroke="#9a3412" stroke-width="1.6"/>
      <circle cx="58" cy="72" r="3" fill="#fef08a"/>
      <circle cx="60" cy="52" r="6" fill="#c084fc" stroke="#6b21a8" stroke-width="1.5"/>
      <circle cx="60" cy="52" r="2.2" fill="#fef08a"/>
    </svg>`
  },
  {
    type: 'path_stone',
    icon: '🛤️',
    nameRu: 'Садовая дорожка',
    nameEt: 'Aiatee',
    nameLv: 'Dārza celiņš',
    nameLt: 'Sodo takelis',
    width: 3.0,
    height: 0.9,
    zLayer: 'low',
    svg: `<svg viewBox="0 0 210 64" width="100%" height="100%">
      <rect x="6" y="10" width="44" height="44" rx="12" fill="#e7e5e4" stroke="#78716c" stroke-width="3"/>
      <rect x="12" y="15" width="32" height="14" rx="6" fill="#ffffff" opacity="0.45"/>
      <rect x="58" y="8" width="46" height="48" rx="14" fill="#d6d3d1" stroke="#78716c" stroke-width="3"/>
      <rect x="64" y="13" width="34" height="15" rx="6" fill="#ffffff" opacity="0.4"/>
      <rect x="112" y="11" width="42" height="42" rx="12" fill="#e7e5e4" stroke="#78716c" stroke-width="3"/>
      <rect x="162" y="9" width="42" height="46" rx="13" fill="#d6d3d1" stroke="#78716c" stroke-width="3"/>
    </svg>`
  },
  {
    type: 'fence',
    icon: '🪵',
    nameRu: 'Деревянный забор',
    nameEt: 'Puitaed',
    nameLv: 'Koka žogs',
    nameLt: 'Medinė tvora',
    width: 3.0,
    height: 0.65,
    zLayer: 'mid',
    svg: `<svg viewBox="0 0 210 52" width="100%" height="100%">
      <rect x="6" y="20" width="198" height="10" rx="4" fill="#a1622e" stroke="#4a260d" stroke-width="2.5"/>
      <rect x="6" y="34" width="198" height="8" rx="3" fill="#8c5122" stroke="#4a260d" stroke-width="2.5"/>
      <path d="M16 10 L26 4 L36 10 L36 46 L16 46 Z" fill="#e5a55d" stroke="#4a260d" stroke-width="2.5"/>
      <path d="M54 10 L64 4 L74 10 L74 46 L54 46 Z" fill="#e5a55d" stroke="#4a260d" stroke-width="2.5"/>
      <path d="M92 10 L102 4 L112 10 L112 46 L92 46 Z" fill="#e5a55d" stroke="#4a260d" stroke-width="2.5"/>
      <path d="M130 10 L140 4 L150 10 L150 46 L130 46 Z" fill="#e5a55d" stroke="#4a260d" stroke-width="2.5"/>
      <path d="M168 10 L178 4 L188 10 L188 46 L168 46 Z" fill="#e5a55d" stroke="#4a260d" stroke-width="2.5"/>
    </svg>`
  }
];

function getDecorTemplate(type) {
  return GARDEN_DECOR_CATALOG.find(d => d.type === type) || GARDEN_DECOR_CATALOG[0];
}

function getDecorName(decorTpl, lang = 'ru') {
  if (!decorTpl) return '';
  if (lang === 'et') return decorTpl.nameEt || decorTpl.nameRu;
  if (lang === 'lv') return decorTpl.nameLv || decorTpl.nameRu;
  if (lang === 'lt') return decorTpl.nameLt || decorTpl.nameRu;
  return decorTpl.nameRu;
}

/**
 * Повышаем детализацию векторных арт-иллюстраций культур в стиле Hay Day
 * (многослойный глянец, сочные объёмные тени и яркие блики).
 */
(function enhanceCropArt() {
  if (typeof CROP_SVG_ICONS === 'undefined') return;
  const hayDayArt = {
    tomato: `<svg viewBox="0 0 44 44" width="100%" height="100%">
      <defs>
        <radialGradient id="hd-tom" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#ff7961"/>
          <stop offset="55%" stop-color="#ef4444"/>
          <stop offset="100%" stop-color="#b91c1c"/>
        </radialGradient>
      </defs>
      <ellipse cx="22" cy="39" rx="13" ry="3.2" fill="#000" opacity="0.2"/>
      <path d="M22 12 C12 12 6 18 7 27 C8 35 15 39 22 39 C29 39 36 35 37 27 C38 18 32 12 22 12 Z" fill="url(#hd-tom)" stroke="#5c1111" stroke-width="2.2" stroke-linejoin="round"/>
      <ellipse cx="15.5" cy="20" rx="5" ry="2.8" transform="rotate(-30 15.5 20)" fill="#fff" opacity="0.72"/>
      <circle cx="12" cy="25.5" r="1.6" fill="#fff" opacity="0.55"/>
      <path d="M22 14 L15 8.5 L19 14.5 L12 14 L18 17.5 L15.5 21.5 L22 17.5 L28.5 21.5 L26 17.5 L32 14 L25 14.5 L29 8.5 Z" fill="#22c55e" stroke="#14532d" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M22 13 C22 8 24 5.5 27 4.5" stroke="#14532d" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M22 13 C22 8 24 5.5 27 4.5" stroke="#86efac" stroke-width="1.3" stroke-linecap="round" fill="none"/>
    </svg>`,
    cucumber: `<svg viewBox="0 0 44 44" width="100%" height="100%">
      <defs>
        <linearGradient id="hd-cuc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#86efac"/>
          <stop offset="45%" stop-color="#22c55e"/>
          <stop offset="100%" stop-color="#15803d"/>
        </linearGradient>
      </defs>
      <ellipse cx="22" cy="39" rx="13" ry="3" fill="#000" opacity="0.2"/>
      <path d="M9 33 C5 25 10 13 21 8 C29 4 36 8 36 16 C36 26 26 37 15 37 C11 37 10 35 9 33 Z" fill="url(#hd-cuc)" stroke="#14532d" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M13 26 C13 19 16 14 23 11" stroke="#dcfce7" stroke-width="2.8" stroke-linecap="round" fill="none" opacity="0.8"/>
      <circle cx="17" cy="28" r="1.6" fill="#14532d"/>
      <circle cx="24" cy="23" r="1.6" fill="#14532d"/>
      <circle cx="29" cy="17" r="1.6" fill="#14532d"/>
      <circle cx="34" cy="9" r="3.4" fill="#fde047" stroke="#a16207" stroke-width="1.3"/>
      <circle cx="34" cy="9" r="1.3" fill="#f97316"/>
    </svg>`,
    pepper: `<svg viewBox="0 0 44 44" width="100%" height="100%">
      <defs>
        <radialGradient id="hd-pep" cx="35%" cy="28%" r="72%">
          <stop offset="0%" stop-color="#fca5a5"/>
          <stop offset="48%" stop-color="#ef4444"/>
          <stop offset="100%" stop-color="#991b1b"/>
        </radialGradient>
      </defs>
      <ellipse cx="22" cy="39" rx="11" ry="2.8" fill="#000" opacity="0.2"/>
      <path d="M14 13 C8.5 13 7 19 8.5 27 C10 35 15 38 22 38 C29 38 34 35 35.5 27 C37 19 35.5 13 30 13 C27 13 24.5 14.8 22 14.8 C19.5 14.8 17 13 14 13 Z" fill="url(#hd-pep)" stroke="#5c1111" stroke-width="2.2" stroke-linejoin="round"/>
      <ellipse cx="15" cy="21" rx="2.6" ry="5.5" transform="rotate(-12 15 21)" fill="#fff" opacity="0.68"/>
      <path d="M17 13.5 L22 16 L27 13.5 L24.5 10 L19.5 10 Z" fill="#22c55e" stroke="#14532d" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M22 10.5 C22 6 24.5 4 28 4" stroke="#14532d" stroke-width="3" stroke-linecap="round" fill="none"/>
    </svg>`,
    eggplant: `<svg viewBox="0 0 44 44" width="100%" height="100%">
      <defs>
        <radialGradient id="hd-egg" cx="32%" cy="32%" r="72%">
          <stop offset="0%" stop-color="#c084fc"/>
          <stop offset="45%" stop-color="#7e22ce"/>
          <stop offset="100%" stop-color="#3b0764"/>
        </radialGradient>
      </defs>
      <ellipse cx="22" cy="39" rx="11" ry="2.8" fill="#000" opacity="0.2"/>
      <path d="M17 13 C10.5 15 7.5 24 11 32 C14.5 38 24 40 30 35 C36.5 29.5 35.5 19.5 29 13 C25.5 9.5 20.5 9.5 17 13 Z" fill="url(#hd-egg)" stroke="#2e054e" stroke-width="2.2" stroke-linejoin="round"/>
      <ellipse cx="17.5" cy="22" rx="2.8" ry="6.5" transform="rotate(-24 17.5 22)" fill="#f3e8ff" opacity="0.78"/>
      <path d="M15 14 L20 17 L23.5 13.5 L28 17.5 L26.5 12 L22 10.5 L17.5 11.5 Z" fill="#22c55e" stroke="#14532d" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M22 10.5 C22 6.5 23.5 4.5 26 3.5" stroke="#14532d" stroke-width="2.8" stroke-linecap="round" fill="none"/>
    </svg>`,
    carrot: `<svg viewBox="0 0 44 44" width="100%" height="100%">
      <defs>
        <linearGradient id="hd-car" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fdba74"/>
          <stop offset="45%" stop-color="#f97316"/>
          <stop offset="100%" stop-color="#c2410c"/>
        </linearGradient>
      </defs>
      <ellipse cx="19" cy="39" rx="9" ry="2.5" fill="#000" opacity="0.18"/>
      <path d="M27 14 C30 7.5 33 4 40 4 C36.5 10 33 13 28.5 15.5 Z" fill="#22c55e" stroke="#14532d" stroke-width="1.7" stroke-linejoin="round"/>
      <path d="M26 13 C25 6.5 24 3 20.5 3 C22 8 24 11 25 14 Z" fill="#4ade80" stroke="#14532d" stroke-width="1.7" stroke-linejoin="round"/>
      <path d="M25 12 L32 19 L15 39 C13 40.5 11 39.5 10.5 38 C10 36 11 34 12.5 32 Z" fill="url(#hd-car)" stroke="#7c2d12" stroke-width="2.2" stroke-linejoin="round"/>
      <ellipse cx="23" cy="19" rx="2" ry="4.2" transform="rotate(40 23 19)" fill="#fff" opacity="0.62"/>
      <path d="M18 28 L21.5 29.5 M21 22.5 L24.5 24" stroke="#9a3412" stroke-width="1.7" stroke-linecap="round"/>
    </svg>`,
    strawberry: `<svg viewBox="0 0 44 44" width="100%" height="100%">
      <defs>
        <radialGradient id="hd-str" cx="35%" cy="30%" r="72%">
          <stop offset="0%" stop-color="#fca5a5"/>
          <stop offset="48%" stop-color="#ef4444"/>
          <stop offset="100%" stop-color="#991b1b"/>
        </radialGradient>
      </defs>
      <ellipse cx="22" cy="39" rx="9" ry="2.6" fill="#000" opacity="0.2"/>
      <path d="M22 13 C13 13 9 19.5 11 27.5 C13 34 22 39 22 39 C22 39 31 34 33 27.5 C35 19.5 31 13 22 13 Z" fill="url(#hd-str)" stroke="#7f1d1d" stroke-width="2.2" stroke-linejoin="round"/>
      <ellipse cx="16.5" cy="21" rx="2.6" ry="4.4" transform="rotate(-18 16.5 21)" fill="#fff" opacity="0.58"/>
      <circle cx="16.5" cy="22" r="1.1" fill="#fef08a"/><circle cx="22" cy="21" r="1.1" fill="#fef08a"/><circle cx="27.5" cy="22" r="1.1" fill="#fef08a"/>
      <circle cx="18.5" cy="27.5" r="1.1" fill="#fef08a"/><circle cx="25.5" cy="27.5" r="1.1" fill="#fef08a"/><circle cx="22" cy="33" r="1.1" fill="#fef08a"/>
      <path d="M22 14.5 L14 10 L17.5 15.5 L12 15 L17.5 17.5 L22 15.5 L26.5 17.5 L32 15 L26.5 15.5 L30 10 Z" fill="#22c55e" stroke="#14532d" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M22 12 C22 8 23.5 6 26 4.5" stroke="#14532d" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    </svg>`,
    onion: `<svg viewBox="0 0 44 44" width="100%" height="100%">
      <defs>
        <radialGradient id="hd-oni" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#fde68a"/>
          <stop offset="50%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#b45309"/>
        </radialGradient>
      </defs>
      <ellipse cx="22" cy="39" rx="11" ry="2.6" fill="#000" opacity="0.2"/>
      <path d="M22 10 L22 4 M19 10.5 L16 4 M25 10.5 L28 4" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
      <path d="M22 9 C14 15.5 10 21 10 27.5 C10 34 15.5 38.5 22 38.5 C28.5 38.5 34 34 34 27.5 C34 21 30 15.5 22 9 Z" fill="url(#hd-oni)" stroke="#78350f" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M22 11 C18.5 17.5 18.5 29 22 36.5 M22 11 C25.5 17.5 25.5 29 22 36.5" stroke="#b45309" stroke-width="1.3" fill="none" opacity="0.55"/>
      <ellipse cx="16.5" cy="24" rx="2.4" ry="4.8" transform="rotate(-15 16.5 24)" fill="#fff" opacity="0.65"/>
    </svg>`
  };
  Object.assign(CROP_SVG_ICONS, hayDayArt);
})();
