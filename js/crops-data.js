/**
 * База данных культур и агрономических правил севооборота
 * Содержит семейства растений, потребность в питании, совместимость и правила ротации
 */

/**
 * Векторные SVG-иконки высокого качества для всех культур.
 * Гарантируют красивое и четкое отображение без пустых квадратиков на любой версии Windows/браузера.
 */
const CROP_SVG_ICONS = {
  tomato: `<svg viewBox="0 0 36 36" width="100%" height="100%"><circle cx="18" cy="21" r="14" fill="#e53935"/><circle cx="14" cy="17" r="11" fill="#f44336"/><ellipse cx="14" cy="14" rx="4" ry="2" fill="#ff7961" opacity="0.6"/><path d="M18 10 C18 5 19 4 21 3 C20 4 19 7 19 9" stroke="#2e7d32" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M18 10 L14 7 L17 11 L12 11 L16 13 L14 16 L18 13 L22 16 L20 13 L24 11 L19 11 L22 7 Z" fill="#43a047"/></svg>`,
  cucumber: `<svg viewBox="0 0 36 36" width="100%" height="100%"><path d="M7 26 C4 18 8 10 16 7 C24 4 30 9 29 17 C28 25 21 31 13 30 C9 30 8 28 7 26 Z" fill="#2e7d32"/><path d="M9 24 C7 18 10 11 17 8 C22 6 27 10 26 16 C25 23 19 28 13 28 C10 28 9 26 9 24 Z" fill="#43a047"/><circle cx="14" cy="14" r="1" fill="#a5d6a7"/><circle cx="20" cy="12" r="1" fill="#a5d6a7"/><circle cx="17" cy="20" r="1" fill="#a5d6a7"/><circle cx="23" cy="18" r="1" fill="#a5d6a7"/><path d="M6 27 C4 29 3 31 2 33" stroke="#2e7d32" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
  pepper: `<svg viewBox="0 0 36 36" width="100%" height="100%"><path d="M12 11 C8 11 7 16 8 23 C9 29 13 33 18 33 C23 33 27 29 28 23 C29 16 28 11 24 11 C22 11 20 13 18 13 C16 13 14 11 12 11 Z" fill="#d32f2f"/><path d="M13 12 C10 13 9 17 10 23 C11 28 14 31 18 31 C21 31 24 28 25 23 C26 17 25 13 22 12 C20 12 19 14 17.5 14 C16 14 15 12 13 12 Z" fill="#e53935"/><path d="M18 12 C18 7 19 5 22 4" stroke="#2e7d32" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M15 11 L18 13 L21 11 L19 9 L17 9 Z" fill="#43a047"/></svg>`,
  eggplant: `<svg viewBox="0 0 36 36" width="100%" height="100%"><path d="M14 12 C9 14 7 21 9 27 C12 33 20 34 25 31 C30 27 30 18 25 13 C21 9 17 9 14 12 Z" fill="#4a148c"/><path d="M15 14 C11 16 10 22 12 26 C14 31 20 32 23 29 C27 25 27 18 23 15 C20 11 17 11 15 14 Z" fill="#6a1b9a"/><ellipse cx="15" cy="18" rx="2" ry="4" transform="rotate(-30 15 18)" fill="#ba68c8" opacity="0.6"/><path d="M14 12 L17 13 L20 11 L22 14 L18 15 L16 13 Z" fill="#388e3c"/><path d="M17 13 C17 9 16 6 18 4" stroke="#2e7d32" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>`,
  potato: `<svg viewBox="0 0 36 36" width="100%" height="100%"><path d="M8 20 C6 13 12 7 20 7 C27 7 31 12 30 18 C29 25 24 30 17 30 C10 30 9 26 8 20 Z" fill="#8d6e63"/><path d="M9 19 C8 14 13 9 20 9 C25 9 28 13 28 18 C27 23 23 28 17 28 C12 28 10 24 9 19 Z" fill="#a1887f"/><circle cx="14" cy="15" r="1.5" fill="#6d4c41"/><circle cx="22" cy="14" r="1.5" fill="#6d4c41"/><circle cx="18" cy="22" r="1.5" fill="#6d4c41"/><circle cx="24" cy="21" r="1.5" fill="#6d4c41"/></svg>`,
  cabbage_white: `<svg viewBox="0 0 36 36" width="100%" height="100%"><circle cx="18" cy="18" r="15" fill="#2e7d32"/><circle cx="18" cy="18" r="13" fill="#43a047"/><path d="M7 16 C9 8 18 7 23 11 C20 15 12 17 7 16 Z" fill="#66bb6a"/><path d="M29 16 C27 8 18 7 13 11 C16 15 24 17 29 16 Z" fill="#81c784"/><circle cx="18" cy="19" r="8" fill="#a5d6a7"/><path d="M18 13 C14 16 14 22 18 25 C22 22 22 16 18 13 Z" fill="#c8e6c9"/></svg>`,
  broccoli: `<svg viewBox="0 0 36 36" width="100%" height="100%"><path d="M15 23 L15 32 L21 32 L21 23 Z" fill="#66bb6a"/><circle cx="12" cy="16" r="6" fill="#2e7d32"/><circle cx="24" cy="16" r="6" fill="#2e7d32"/><circle cx="18" cy="11" r="7" fill="#388e3c"/><circle cx="18" cy="18" r="6" fill="#1b5e20"/><circle cx="15" cy="14" r="4" fill="#43a047"/><circle cx="21" cy="14" r="4" fill="#43a047"/></svg>`,
  radish: `<svg viewBox="0 0 36 36" width="100%" height="100%"><path d="M18 14 C12 14 10 19 11 24 C13 30 18 34 18 34 C18 34 23 30 25 24 C26 19 24 14 18 14 Z" fill="#c2185b"/><path d="M18 15 C13 15 12 19 13 23 C14 28 18 32 18 32 C18 32 22 28 23 23 C24 19 23 15 18 15 Z" fill="#e91e63"/><path d="M16 30 C18 32 18 34 18 34 C18 34 18 32 20 30 Z" fill="#f8bbd0"/><path d="M18 14 C18 9 14 6 10 5 C11 9 14 12 17 14 Z" fill="#43a047"/><path d="M18 14 C18 8 22 5 26 5 C25 9 22 12 19 14 Z" fill="#2e7d32"/></svg>`,
  carrot: `<svg viewBox="0 0 36 36" width="100%" height="100%"><path d="M22 10 L26 14 L15 33 C14 34 13 34 12 33 L12 33 C11 32 11 31 12 30 Z" fill="#ef6c00"/><path d="M21 11 L24 14 L15 30 L13 28 Z" fill="#f57c00"/><path d="M16 23 L18 24 M18 18 L21 19 M21 14 L23 15" stroke="#e65100" stroke-width="1.5" stroke-linecap="round"/><path d="M24 12 C26 7 28 4 33 3 C30 7 28 10 25 12 Z" fill="#2e7d32"/><path d="M23 11 C22 6 21 3 19 2 C20 6 22 9 23 11 Z" fill="#43a047"/></svg>`,
  dill: `<svg viewBox="0 0 36 36" width="100%" height="100%"><path d="M8 32 C14 26 17 18 18 6" stroke="#2e7d32" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M14 24 C10 22 7 22 6 20 M14 24 C12 20 11 17 10 15" stroke="#43a047" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M16 17 C20 15 23 15 25 13 M16 17 C19 13 21 10 22 7" stroke="#43a047" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M17 11 C15 9 13 9 12 7 M17 11 C19 8 20 6 21 4" stroke="#66bb6a" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>`,
  celery: `<svg viewBox="0 0 36 36" width="100%" height="100%"><path d="M13 32 L15 16 L17 32 Z" fill="#81c784"/><path d="M18 32 L19 13 L21 32 Z" fill="#66bb6a"/><path d="M22 32 L23 17 L24 32 Z" fill="#4caf50"/><circle cx="15" cy="13" r="4" fill="#388e3c"/><circle cx="19" cy="9" r="4.5" fill="#2e7d32"/><circle cx="23" cy="13" r="4" fill="#388e3c"/></svg>`,
  onion: `<svg viewBox="0 0 36 36" width="100%" height="100%"><path d="M18 6 C12 12 9 17 9 22 C9 28 13 32 18 32 C23 32 27 28 27 22 C27 17 24 12 18 6 Z" fill="#f57f17"/><path d="M18 8 C14 13 11 18 11 22 C11 27 14 30 18 30 C22 30 25 27 25 22 C25 18 22 13 18 8 Z" fill="#fbc02d"/><path d="M18 6 L18 3 M16 6 L14 2 M20 6 L22 2" stroke="#43a047" stroke-width="2" stroke-linecap="round"/></svg>`,
  garlic: `<svg viewBox="0 0 36 36" width="100%" height="100%"><path d="M18 7 C14 12 10 17 10 22 C10 28 14 31 18 31 C22 31 26 28 26 22 C26 17 22 12 18 7 Z" fill="#f5f5f5"/><path d="M18 7 C16 13 15 18 15 23 C15 27 16 30 18 31 C20 30 21 27 21 23 C21 18 20 13 18 7 Z" fill="#e0e0e0"/><path d="M10 23 C11 28 14 31 18 31 C15 31 12 28 10 23 Z" fill="#eeeeee"/><path d="M18 7 L18 3" stroke="#8d6e63" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  zucchini: `<svg viewBox="0 0 36 36" width="100%" height="100%"><path d="M8 27 C6 21 10 12 18 8 C25 5 30 8 30 13 C30 20 23 28 14 30 C10 30 9 29 8 27 Z" fill="#388e3c"/><path d="M10 25 C8 20 12 13 18 10 C24 7 28 10 28 14 C28 19 22 26 15 28 C12 28 11 27 10 25 Z" fill="#4caf50"/><path d="M12 24 C15 18 20 14 26 12" stroke="#81c784" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M6 28 L4 30" stroke="#2e7d32" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  pumpkin: `<svg viewBox="0 0 36 36" width="100%" height="100%"><ellipse cx="18" cy="22" rx="14" ry="11" fill="#e65100"/><ellipse cx="18" cy="22" rx="10" ry="11" fill="#f57c00"/><ellipse cx="18" cy="22" rx="5" ry="11" fill="#ff9800"/><path d="M18 11 C18 6 21 4 23 3" stroke="#2e7d32" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`,
  peas: `<svg viewBox="0 0 36 36" width="100%" height="100%"><path d="M6 28 C5 18 14 9 27 7 C29 15 24 26 11 29 C8 30 7 29 6 28 Z" fill="#2e7d32"/><path d="M8 26 C8 19 15 11 25 9 C26 15 22 24 12 27 C10 27 9 27 8 26 Z" fill="#43a047"/><circle cx="12" cy="22" r="2.5" fill="#81c784"/><circle cx="17" cy="17" r="2.5" fill="#81c784"/><circle cx="22" cy="12" r="2.5" fill="#81c784"/></svg>`,
  beans: `<svg viewBox="0 0 36 36" width="100%" height="100%"><path d="M12 28 C7 25 7 17 12 12 C18 8 25 10 26 15 C27 21 21 25 18 25 C15 25 14 30 12 28 Z" fill="#8d6e63"/><path d="M13 26 C9 23 9 17 13 13 C18 9 23 11 24 15 C25 20 20 23 18 23 C15 23 14 27 13 26 Z" fill="#a1887f"/><ellipse cx="18" cy="16" rx="2" ry="3" fill="#ffffff" opacity="0.6"/></svg>`,
  beet: `<svg viewBox="0 0 36 36" width="100%" height="100%"><path d="M18 13 C11 13 8 19 10 25 C12 30 18 35 18 35 C18 35 24 30 26 25 C28 19 25 13 18 13 Z" fill="#880e4f"/><path d="M18 14 C13 14 10 19 12 24 C13 28 18 33 18 33 C18 33 23 28 24 24 C26 19 23 14 18 14 Z" fill="#ad1457"/><path d="M18 13 C16 8 13 5 9 4 C11 8 14 11 17 13 Z" fill="#2e7d32"/><path d="M18 13 C18 7 20 4 23 3 C22 7 20 11 19 13 Z" fill="#43a047"/><path d="M11 7 C14 9 16 11 17 13" stroke="#e91e63" stroke-width="1.5" fill="none"/></svg>`,
  strawberry: `<svg viewBox="0 0 36 36" width="100%" height="100%"><path d="M18 12 C11 12 8 17 9 23 C11 29 18 34 18 34 C18 34 25 29 27 23 C28 17 25 12 18 12 Z" fill="#c62828"/><path d="M18 13 C12 13 10 18 11 23 C12 28 18 32 18 32 C18 32 24 28 25 23 C26 18 24 13 18 13 Z" fill="#e53935"/><circle cx="14" cy="18" r="0.8" fill="#fff59d"/><circle cx="18" cy="18" r="0.8" fill="#fff59d"/><circle cx="22" cy="18" r="0.8" fill="#fff59d"/><circle cx="16" cy="23" r="0.8" fill="#fff59d"/><circle cx="20" cy="23" r="0.8" fill="#fff59d"/><circle cx="18" cy="27" r="0.8" fill="#fff59d"/><path d="M18 12 L15 9 L18 10 L21 9 Z M12 12 L15 10 L14 12 Z M24 12 L21 10 L22 12 Z" fill="#2e7d32"/><path d="M18 10 C18 7 19 5 21 4" stroke="#2e7d32" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
  lettuce: `<svg viewBox="0 0 36 36" width="100%" height="100%"><circle cx="18" cy="18" r="14" fill="#388e3c"/><circle cx="18" cy="18" r="11" fill="#4caf50"/><circle cx="18" cy="18" r="7" fill="#81c784"/><path d="M8 18 C11 14 16 13 18 18 C20 13 25 14 28 18" stroke="#c8e6c9" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
  green_manure_phacelia: `<svg viewBox="0 0 36 36" width="100%" height="100%"><circle cx="18" cy="18" r="13" fill="#e1bee7"/><circle cx="18" cy="18" r="9" fill="#ba68c8"/><circle cx="18" cy="18" r="5" fill="#7b1fa2"/><circle cx="18" cy="18" r="2.5" fill="#fdd835"/><path d="M18 5 L18 10 M18 26 L18 31 M5 18 L10 18 M26 18 L31 18" stroke="#ab47bc" stroke-width="2" stroke-linecap="round"/></svg>`,
  green_manure_mustard: `<svg viewBox="0 0 36 36" width="100%" height="100%"><circle cx="18" cy="18" r="13" fill="#fff9c4"/><circle cx="18" cy="18" r="9" fill="#ffee58"/><circle cx="18" cy="18" r="4" fill="#fbc02d"/><path d="M18 6 L18 10 M18 26 L18 30 M6 18 L10 18 M26 18 L30 18" stroke="#f57f17" stroke-width="2" stroke-linecap="round"/></svg>`,
  fallow: `<svg viewBox="0 0 36 36" width="100%" height="100%"><ellipse cx="18" cy="24" rx="14" ry="7" fill="#5d4037"/><ellipse cx="18" cy="22" rx="12" ry="5" fill="#795548"/><path d="M18 21 C18 15 15 12 12 10 C15 13 17 17 18 21 Z" fill="#4caf50"/><path d="M18 21 C18 14 21 11 24 9 C21 12 19 16 18 21 Z" fill="#81c784"/></svg>`
};

function getCropSvg(cropId) {
  if (CROP_SVG_ICONS[cropId]) {
    return `<span class="crop-svg-wrap">${CROP_SVG_ICONS[cropId]}</span>`;
  }
  const crop = getCropById(cropId);
  return `<span class="crop-emoji-fallback">${crop?.emoji || '🌱'}</span>`;
}

const CROP_FAMILIES = {
  solanaceae: {
    id: 'solanaceae',
    nameRu: 'Паслёновые',
    nameEt: 'Maavitsalised',
    nameLv: 'Naktsvīņu dzimta',
    nameLt: 'Bulviniai (kiauliauoginiai)',
    color: '#e53935',
    lightColor: '#ffebee',
    darkColor: '#ffcdd2',
    description: 'Требовательны к теплу и калию. Общие опасные болезни: фитофтороз, макроспориоз. Нельзя сажать подряд!',
    rotationYears: 4
  },
  cucurbitaceae: {
    id: 'cucurbitaceae',
    nameRu: 'Тыквенные',
    nameEt: 'Kõrvitsalised',
    nameLv: 'Ķirbju dzimta',
    nameLt: 'Moliūginiai',
    color: '#43a047',
    lightColor: '#e8f5e9',
    darkColor: '#c8e6c9',
    description: 'Высокая потребность в органике и азоте. Подвержены мучнистой росе и корневым гнилям.',
    rotationYears: 3
  },
  brassicaceae: {
    id: 'brassicaceae',
    nameRu: 'Крестоцветные (Капустные)',
    nameEt: 'Ristõielised (Kapsalised)',
    nameLv: 'Krustziežu (Kāpostu) dzimta',
    nameLt: 'Kryžmažiedžiai (Kopūstinės)',
    color: '#00897b',
    lightColor: '#e0f2f1',
    darkColor: '#b2dfdb',
    description: 'Высокий вынос питательных веществ. Опасная болезнь — кила капустная, живущая в почве до 5 лет!',
    rotationYears: 4
  },
  apiaceae: {
    id: 'apiaceae',
    nameRu: 'Зонтичные (Сельдерейные)',
    nameEt: 'Sarikalised (Sellerilised)',
    nameLv: 'Čemurziežu (Seleriju) dzimta',
    nameLt: 'Salieriniai (Skėtiniai)',
    color: '#fb8c00',
    lightColor: '#fff3e0',
    darkColor: '#ffe0b2',
    description: 'Умеренная потребность. Не любят свежий навоз (корнеплоды ветвятся). Опасна морковная муха.',
    rotationYears: 3
  },
  amaryllidaceae: {
    id: 'amaryllidaceae',
    nameRu: 'Луковые',
    nameEt: 'Lauguised (Sibulalised)',
    nameLv: 'Sīpolu dzimta',
    nameLt: 'Amariliniai (Svogūniniai)',
    color: '#8e24aa',
    lightColor: '#f3e5f5',
    darkColor: '#e1bee7',
    description: 'Фитонцидные культуры, оздоравливают почву. Опасны стеблевая нематода и луковая муха.',
    rotationYears: 3
  },
  fabaceae: {
    id: 'fabaceae',
    nameRu: 'Бобовые',
    nameEt: 'Liblikõielised (Kaunviljad)',
    nameLv: 'Tauriņziežu (Pākšaugu) dzimta',
    nameLt: 'Pupiniai (Ankštiniai)',
    color: '#3949ab',
    lightColor: '#e8eaf6',
    darkColor: '#c5cae9',
    description: 'Азотофиксаторы! Обогащают почву азотом благодаря клубеньковым бактериям. Лучшие предшественники почти для всех!',
    rotationYears: 3
  },
  chenopodiaceae: {
    id: 'chenopodiaceae',
    nameRu: 'Маревые (Амарантовые)',
    nameEt: 'Maltsalised (Amarandilised)',
    nameLv: 'Balandu (Amarantu) dzimta',
    nameLt: 'Burnotiniai (Balandiniai)',
    color: '#c2185b',
    lightColor: '#fce4ec',
    darkColor: '#f8bbd0',
    description: 'Любят плодородные нейтральные почвы, требовательны к бору и калию.',
    rotationYears: 3
  },
  asteraceae: {
    id: 'asteraceae',
    nameRu: 'Астровые (Сложноцветные)',
    nameEt: 'Korvõielised (Astrilised)',
    nameLv: 'Kurvjziežu (Astru) dzimta',
    nameLt: 'Astriniai',
    color: '#7cb342',
    lightColor: '#f1f8e9',
    darkColor: '#dcedc8',
    description: 'Быстрорастущие листовые культуры, слабо истощают почву.',
    rotationYears: 2
  },
  rosaceae: {
    id: 'rosaceae',
    nameRu: 'Розоцветные (Земляничные)',
    nameEt: 'Roosõielised (Maasikalised)',
    nameLv: 'Rožu dzimta',
    nameLt: 'Erškėtiniai',
    color: '#d81b60',
    lightColor: '#fce4ec',
    darkColor: '#f8bbd0',
    description: 'Многолетники. Растут на одном месте 3-4 года, после чего требуют обязательной смены грядки.',
    rotationYears: 4
  },
  poaceae: {
    id: 'poaceae',
    nameRu: 'Злаковые (Мятликовые)',
    nameEt: 'Kõrrelised',
    nameLv: 'Graudzāļu dzimta',
    nameLt: 'Migliniai (Varpiniai)',
    color: '#fdd835',
    lightColor: '#fffde7',
    darkColor: '#fff9c4',
    description: 'Мощная корневая система, отлично структурирует почву (кукуруза, рожь-сидерат).',
    rotationYears: 2
  },
  green_manure: {
    id: 'green_manure',
    nameRu: 'Сидераты (Оздоровители почвы)',
    nameEt: 'Haljasväetised (Sideraadid)',
    nameLv: 'Zaļmēslojums (Siderāti)',
    nameLt: 'Sideratai (Žalioji trąša)',
    color: '#2e7d32',
    lightColor: '#e8f5e9',
    darkColor: '#c8e6c9',
    description: 'Посевы для восстановления плодородия, подавления сорняков и дезинфекции грунта.',
    rotationYears: 1
  },
  custom: {
    id: 'custom',
    nameRu: 'Мои культуры',
    nameEt: 'Minu kultuurid',
    nameLv: 'Mani augi',
    nameLt: 'Mano augalai',
    color: '#0284c7',
    lightColor: '#e0f2fe',
    darkColor: '#bae6fd',
    description: 'Культуры и растения, добавленные вами вручную.',
    rotationYears: 3
  }
};

/**
 * Каталог популярных овощных и садовых культур
 */
const CROPS_DATABASE = [
  // --- Паслёновые ---
  {
    id: 'tomato',
    name: 'Томат (Помидор)',
    nameRu: 'Томат (Помидор)',
    nameEt: 'Tomat',
    nameLv: 'Tomāti',
    nameLt: 'Pomidorai',
    family: 'solanaceae',
    emoji: '🍅',
    nutrientDemand: 'high', // high | medium | low | enrich
    nutrientLabel: 'Высокая (калий, фосфор)',
    rootDepth: 'Глубокая (до 1-1.5 м)',
    goodPredecessors: ['cucumber', 'cabbage_white', 'beans', 'peas', 'onion', 'garlic', 'zucchini', 'green_manure_phacelia'],
    badPredecessors: ['tomato', 'potato', 'pepper', 'eggplant'],
    goodNeighbors: ['basil', 'onion', 'garlic', 'carrot', 'marigold', 'parsley'],
    badNeighbors: ['fennel', 'dill', 'potato', 'cabbage_white'],
    sowingPeriod: 'Март (рассада) / Май (высадка)',
    harvestPeriod: 'Июль - Сентябрь',
    minYearsReturn: 3,
    description: 'Любит солнечное место и регулярный прикорневой полив. Не переносит повышенной влажности листьев.',
    agronomicTip: 'После огурцов, кабачков или бобовых томаты дают наилучший урожай без риска фитофтороза.'
  },
  {
    id: 'cucumber',
    name: 'Огурец',
    nameRu: 'Огурец',
    nameEt: 'Kurk',
    nameLv: 'Gurķi',
    nameLt: 'Agurkai',
    family: 'cucurbitaceae',
    emoji: '🥒',
    nutrientDemand: 'high',
    nutrientLabel: 'Очень высокая (органика, азот)',
    rootDepth: 'Поверхностная (20-30 см)',
    goodPredecessors: ['peas', 'beans', 'cabbage_white', 'onion', 'garlic', 'tomato', 'green_manure_phacelia'],
    badPredecessors: ['cucumber', 'zucchini', 'pumpkin'],
    goodNeighbors: ['corn', 'beans', 'peas', 'dill', 'radish', 'sunflower'],
    badNeighbors: ['potato', 'aromatic_herbs'],
    sowingPeriod: 'Апрель (рассада) / Май (в грунт)',
    harvestPeriod: 'Июнь - Август',
    minYearsReturn: 3,
    description: 'Влаголюбивая культура с поверхностными корнями. Обожает органические теплые грядки.',
    agronomicTip: 'Отлично сажать после бобовых или лука с чесноком, которые очищают грунт от грибков.'
  },
  {
    id: 'pepper',
    name: 'Перец сладкий',
    nameRu: 'Перец сладкий',
    nameEt: 'Paprika (maguspipar)',
    nameLv: 'Saldā paprika',
    nameLt: 'Saldžioji paprika',
    family: 'solanaceae',
    emoji: '🫑',
    nutrientDemand: 'high',
    nutrientLabel: 'Высокая (фосфор, калий)',
    rootDepth: 'Средняя (30-40 см)',
    goodPredecessors: ['cucumber', 'cabbage_white', 'beans', 'peas', 'onion', 'garlic', 'carrot', 'green_manure_phacelia'],
    badPredecessors: ['pepper', 'tomato', 'eggplant', 'potato'],
    goodNeighbors: ['basil', 'marigold', 'onion', 'carrots', 'parsley'],
    badNeighbors: ['fennel', 'kohlrabi', 'beans_pole'],
    sowingPeriod: 'Февраль - Март (рассада)',
    harvestPeriod: 'Июль - Сентябрь',
    minYearsReturn: 3,
    description: 'Теплолюбив и капризен к перепадам температур. Корневая система чувствительна к рыхлению.',
    agronomicTip: 'Избегайте посадки после картофеля и томатов из-за риска увядания и вирусных инфекций.'
  },
  {
    id: 'eggplant',
    name: 'Баклажан',
    nameRu: 'Баклажан',
    nameEt: 'Baklažaan',
    nameLv: 'Baklažāni',
    nameLt: 'Baklažanai',
    family: 'solanaceae',
    emoji: '🍆',
    nutrientDemand: 'high',
    nutrientLabel: 'Очень высокая',
    rootDepth: 'Средняя (40-50 см)',
    goodPredecessors: ['cucumber', 'cabbage_white', 'beans', 'peas', 'onion', 'garlic', 'green_manure_phacelia'],
    badPredecessors: ['eggplant', 'tomato', 'potato', 'pepper'],
    goodNeighbors: ['beans', 'basil', 'marigold', 'thyme'],
    badNeighbors: ['fennel', 'potato', 'tomato'],
    sowingPeriod: 'Февраль - Март (рассада)',
    harvestPeriod: 'Июль - Сентябрь',
    minYearsReturn: 4,
    description: 'Самый теплолюбивый из паслёновых. Требует максимального солнца и питательной почвы.',
    agronomicTip: 'Не сажайте рядом с картофелем — колорадский жук моментально уничтожит нежные всходы баклажана.'
  },
  {
    id: 'potato',
    name: 'Картофель',
    nameRu: 'Картофель',
    nameEt: 'Kartul',
    nameLv: 'Kartupeļi',
    nameLt: 'Bulvės',
    family: 'solanaceae',
    emoji: '🥔',
    nutrientDemand: 'high',
    nutrientLabel: 'Высокая (калий, органика)',
    rootDepth: 'Средняя (40-50 см)',
    goodPredecessors: ['cabbage_white', 'beans', 'peas', 'cucumber', 'beet', 'green_manure_phacelia', 'green_manure_mustard'],
    badPredecessors: ['potato', 'tomato', 'eggplant', 'pepper'],
    goodNeighbors: ['beans', 'corn', 'cabbage_white', 'marigold', 'horseradish'],
    badNeighbors: ['tomato', 'cucumber', 'sunflower', 'pumpkin', 'raspberry'],
    sowingPeriod: 'Май (клубни)',
    harvestPeriod: 'Август - Сентябрь',
    minYearsReturn: 3,
    description: 'Основная продовольственная культура. Сильно обедняет почву по калию и фосфору.',
    agronomicTip: 'Обязательно чередуйте с сидератами (рожь, фацелия, горчица) для подавления проволочника и парши.'
  },

  // --- Крестоцветные ---
  {
    id: 'cabbage_white',
    name: 'Капуста белокочанная',
    nameRu: 'Капуста белокочанная',
    nameEt: 'Valge peakapsas',
    nameLv: 'Baltie galviņkāposti',
    nameLt: 'Baltagūžiai kopūstai',
    family: 'brassicaceae',
    emoji: '🥬',
    nutrientDemand: 'high',
    nutrientLabel: 'Очень высокая (азот, кальций)',
    rootDepth: 'Глубокая (до 1 м)',
    goodPredecessors: ['peas', 'beans', 'cucumber', 'onion', 'garlic', 'potato', 'carrot'],
    badPredecessors: ['cabbage_white', 'broccoli', 'radish', 'green_manure_mustard'],
    goodNeighbors: ['dill', 'celery', 'mint', 'sage', 'marigold', 'onion', 'beet'],
    badNeighbors: ['strawberry', 'tomato', 'fennel'],
    sowingPeriod: 'Март - Апрель (рассада)',
    harvestPeriod: 'Сентябрь - Октябрь',
    minYearsReturn: 4,
    description: 'Крайне влаголюбива. Требует раскисленной почвы для защиты от килы.',
    agronomicTip: 'Укроп и сельдерей рядом с капустой отпугивают капустную белянку и моль своим ароматом.'
  },
  {
    id: 'broccoli',
    name: 'Брокколи / Цветная капуста',
    nameRu: 'Брокколи / Цветная капуста',
    nameEt: 'Brokoli / Lillkapsas',
    nameLv: 'Brokoļi / Ziedkāposti',
    nameLt: 'Brokoliai / Žiediniai kopūstai',
    family: 'brassicaceae',
    emoji: '🥦',
    nutrientDemand: 'high',
    nutrientLabel: 'Высокая (микроэлементы, бор)',
    rootDepth: 'Средняя (40-60 см)',
    goodPredecessors: ['peas', 'beans', 'onion', 'garlic', 'cucumber', 'potato'],
    badPredecessors: ['cabbage_white', 'broccoli', 'radish', 'green_manure_mustard'],
    goodNeighbors: ['dill', 'mint', 'celery', 'onion', 'potato'],
    badNeighbors: ['strawberry', 'tomato'],
    sowingPeriod: 'Апрель (рассада)',
    harvestPeriod: 'Июль - Сентябрь',
    minYearsReturn: 4,
    description: 'Богата витаминами, требует регулярного полива и не переносит жару выше +25°C в момент завязывания головок.',
    agronomicTip: 'Не сажайте после белой горчицы! Горчица — крестоцветный сидерат, переносит килу.'
  },
  {
    id: 'radish',
    name: 'Редис',
    nameRu: 'Редис',
    nameEt: 'Redis',
    nameLv: 'Redīsi',
    nameLt: 'Ridikėliai',
    family: 'brassicaceae',
    emoji: '🪴',
    nutrientDemand: 'low',
    nutrientLabel: 'Низкая (скороспелка)',
    rootDepth: 'Мелкая (10-15 см)',
    goodPredecessors: ['tomato', 'cucumber', 'potato', 'beans', 'peas', 'onion'],
    badPredecessors: ['cabbage_white', 'broccoli', 'radish', 'green_manure_mustard'],
    goodNeighbors: ['carrot', 'cucumber', 'beans', 'lettuce', 'spinach'],
    badNeighbors: ['hyssop'],
    sowingPeriod: 'Апрель - Май / Август (короткий день)',
    harvestPeriod: 'Через 20-30 дней после всходов',
    minYearsReturn: 3,
    description: 'Идеален как культура-уплотнитель весной до высадки теплолюбивых томатов и огурцов.',
    agronomicTip: 'Прекрасно уживается по краю грядки с морковью, всходит первым и рыхлит землю.'
  },

  // --- Зонтичные ---
  {
    id: 'carrot',
    name: 'Морковь',
    nameRu: 'Морковь',
    nameEt: 'Porgand',
    nameLv: 'Burkāni',
    nameLt: 'Morkos',
    family: 'apiaceae',
    emoji: '🥕',
    nutrientDemand: 'medium',
    nutrientLabel: 'Средняя (калий, фосфор)',
    rootDepth: 'Глубокая (до 60-80 см)',
    goodPredecessors: ['cucumber', 'tomato', 'onion', 'garlic', 'cabbage_white', 'potato', 'peas'],
    badPredecessors: ['carrot', 'parsley', 'dill', 'celery'],
    goodNeighbors: ['onion', 'garlic', 'radish', 'lettuce', 'peas', 'rosemary'],
    badNeighbors: ['dill', 'fennel', 'anise'],
    sowingPeriod: 'Апрель - Май (в грунт) / Под зиму',
    harvestPeriod: 'Август - Октябрь',
    minYearsReturn: 3,
    description: 'Любит рыхлые песчаные почвы. Не выносит свежего навоза — корнеплод становится уродливым.',
    agronomicTip: 'Золотой стандарт садоводства: посадка рядами попеременно "морковь - лук". Лук отгоняет морковную муху, а морковь — луковую!'
  },
  {
    id: 'dill',
    name: 'Укроп / Зелень',
    nameRu: 'Укроп / Зелень',
    nameEt: 'Till / Maitseroheline',
    nameLv: 'Dilles / Zaļumi',
    nameLt: 'Krapai / Žalumynai',
    family: 'apiaceae',
    emoji: '🌿',
    nutrientDemand: 'low',
    nutrientLabel: 'Низкая / Средняя',
    rootDepth: 'Поверхностная (15-20 см)',
    goodPredecessors: ['cucumber', 'cabbage_white', 'beans', 'potato'],
    badPredecessors: ['carrot', 'parsley', 'celery'],
    goodNeighbors: ['cucumber', 'cabbage_white', 'broccoli', 'onion'],
    badNeighbors: ['carrot', 'tomato', 'fennel'],
    sowingPeriod: 'Апрель - Июль конвейером',
    harvestPeriod: 'Через 30-40 дней',
    minYearsReturn: 2,
    description: 'Пряный эфиронос, отпугивает вредителей капусты и огурцов своим ароматом.',
    agronomicTip: 'Смело подсевайте укроп в междурядья огурцов и капусты.'
  },
  {
    id: 'celery',
    name: 'Сельдерей (корневой/черешковый)',
    nameRu: 'Сельдерей (корневой/черешковый)',
    nameEt: 'Seller (juur- ja varrseller)',
    nameLv: 'Selerijas (sakņu un kātu)',
    nameLt: 'Salierai (šakniniai ir kotiniai)',
    family: 'apiaceae',
    emoji: '🌱',
    nutrientDemand: 'high',
    nutrientLabel: 'Высокая (органика, влага)',
    rootDepth: 'Средняя',
    goodPredecessors: ['cucumber', 'cabbage_white', 'beans', 'tomato'],
    badPredecessors: ['carrot', 'parsley', 'celery'],
    goodNeighbors: ['cabbage_white', 'tomato', 'leek', 'beans'],
    badNeighbors: ['carrot', 'potato', 'corn'],
    sowingPeriod: 'Февраль - Март (рассада)',
    harvestPeriod: 'Сентябрь - Октябрь',
    minYearsReturn: 3,
    description: 'Длинный вегетационный период. Мощный стимулятор роста для капусты.',
    agronomicTip: 'Совместная посадка с капустой взаимовыгодна: капуста дает тень, сельдерей отгоняет белянку.'
  },

  // --- Луковые ---
  {
    id: 'onion',
    name: 'Лук репчатый',
    nameRu: 'Лук репчатый',
    nameEt: 'Harilik sibul',
    nameLv: 'Sīpoli',
    nameLt: 'Svogūnai',
    family: 'amaryllidaceae',
    emoji: '🧅',
    nutrientDemand: 'medium',
    nutrientLabel: 'Средняя (азот в начале, калий в конце)',
    rootDepth: 'Мелкая (15-20 см)',
    goodPredecessors: ['cucumber', 'zucchini', 'cabbage_white', 'tomato', 'peas', 'beans', 'potato'],
    badPredecessors: ['onion', 'garlic', 'leek'],
    goodNeighbors: ['carrot', 'beet', 'strawberry', 'tomato', 'lettuce'],
    badNeighbors: ['peas', 'beans', 'sage'],
    sowingPeriod: 'Май (севок) / Октябрь (под зиму)',
    harvestPeriod: 'Июль - Август',
    minYearsReturn: 3,
    description: 'Светолюбив, не переносит застоя влаги во второй половине лета.',
    agronomicTip: 'Никогда не сажайте лук рядом с горохом или фасолью — луковые фитонциды угнетают клубеньковые бактерии бобовых!'
  },
  {
    id: 'garlic',
    name: 'Чеснок (озимый / яровой)',
    nameRu: 'Чеснок (озимый / яровой)',
    nameEt: 'Küüslauk (tali- ja suviküüslauk)',
    nameLv: 'Ķiploki (ziemas un vasaras)',
    nameLt: 'Česnakai (žieminiai ir vasariniai)',
    family: 'amaryllidaceae',
    emoji: '🧄',
    nutrientDemand: 'medium',
    nutrientLabel: 'Средняя (калий, фосфор)',
    rootDepth: 'Мелкая (15-25 см)',
    goodPredecessors: ['cucumber', 'zucchini', 'cabbage_white', 'beans', 'pumpkin', 'green_manure_phacelia'],
    badPredecessors: ['garlic', 'onion', 'potato'],
    goodNeighbors: ['strawberry', 'carrot', 'tomato', 'beet', 'rose'],
    badNeighbors: ['peas', 'beans', 'cabbage_white'],
    sowingPeriod: 'Октябрь (озимый) / Апрель (яровой)',
    harvestPeriod: 'Июль (озимый) / Август (яровой)',
    minYearsReturn: 4,
    description: 'Природный антисептик для грядок. Очищает почву от возбудителей серой гнили.',
    agronomicTip: 'Посадите чеснок рядом с клубникой — он защитит ягоды от серой гнили и долгоносика.'
  },

  // --- Тыквенные ---
  {
    id: 'zucchini',
    name: 'Кабачок / Цукини',
    nameRu: 'Кабачок / Цукини',
    nameEt: 'Suvikõrvits (tsukiini)',
    nameLv: 'Kabači (cukīni)',
    nameLt: 'Cukinijos',
    family: 'cucurbitaceae',
    emoji: '🥒',
    nutrientDemand: 'high',
    nutrientLabel: 'Высокая (перегной, компост)',
    rootDepth: 'Средняя (40-60 см)',
    goodPredecessors: ['peas', 'beans', 'onion', 'garlic', 'cabbage_white', 'carrot', 'beet'],
    badPredecessors: ['zucchini', 'cucumber', 'pumpkin'],
    goodNeighbors: ['corn', 'beans', 'nasturtium', 'marigold', 'radish'],
    badNeighbors: ['potato'],
    sowingPeriod: 'Май (в грунт семенами)',
    harvestPeriod: 'Июль - Сентябрь',
    minYearsReturn: 3,
    description: 'Неприхотлив, быстро наращивает вегетативную массу. Обожает компостные кучи.',
    agronomicTip: 'После кабачков земля остается рыхлой, на следующий год здесь прекрасно удается морковь, лук или чеснок.'
  },
  {
    id: 'pumpkin',
    name: 'Тыква',
    nameRu: 'Тыква',
    nameEt: 'Kõrvits',
    nameLv: 'Ķirbji',
    nameLt: 'Moliūgai',
    family: 'cucurbitaceae',
    emoji: '🎃',
    nutrientDemand: 'high',
    nutrientLabel: 'Очень высокая (органика)',
    rootDepth: 'Глубокая (до 1.5 м)',
    goodPredecessors: ['beans', 'peas', 'onion', 'cabbage_white', 'corn', 'green_manure_phacelia'],
    badPredecessors: ['pumpkin', 'cucumber', 'zucchini'],
    goodNeighbors: ['corn', 'beans', 'sunflower', 'marigold'],
    badNeighbors: ['potato'],
    sowingPeriod: 'Май (семена или рассада)',
    harvestPeriod: 'Сентябрь - Октябрь',
    minYearsReturn: 3,
    description: 'Мощное растение с длинными плетями, подавляет любые сорняки листьями-лопухами.',
    agronomicTip: 'Традиционное индейское трио "Три сестры": кукуруза (опора), фасоль (азот) и тыква (живая мульча).'
  },

  // --- Бобовые ---
  {
    id: 'peas',
    name: 'Горох овощной',
    nameRu: 'Горох овощной',
    nameEt: 'Aedhernes',
    nameLv: 'Zirņi',
    nameLt: 'Žirniai',
    family: 'fabaceae',
    emoji: '🫛',
    nutrientDemand: 'enrich',
    nutrientLabel: 'Обогатитель почвы (Азотофиксатор)',
    rootDepth: 'Глубокая (до 1 м)',
    goodPredecessors: ['cucumber', 'tomato', 'potato', 'cabbage_white', 'pumpkin', 'carrot'],
    badPredecessors: ['peas', 'beans'],
    goodNeighbors: ['carrot', 'radish', 'cucumber', 'corn', 'turnip'],
    badNeighbors: ['onion', 'garlic', 'fennel'],
    sowingPeriod: 'Конец апреля - Май',
    harvestPeriod: 'Июнь - Июль',
    minYearsReturn: 3,
    description: 'Рано освобождает грядку, оставляя в почве азот в легкоусвояемой форме. Не вырывайте корни — срезайте ботву!',
    agronomicTip: 'После уборки гороха в июле на эту же грядку можно сразу посеять редис, дайкон или пекинскую капусту!'
  },
  {
    id: 'beans',
    name: 'Фасоль (кустовая / вьющаяся)',
    nameRu: 'Фасоль (кустовая / вьющаяся)',
    nameEt: 'Aeduba (põõsas- ja lattuba)',
    nameLv: 'Pupiņas (krūmu un kāršu)',
    nameLt: 'Pupelės (krūminės ir vijoklinės)',
    family: 'fabaceae',
    emoji: '🌱',
    nutrientDemand: 'enrich',
    nutrientLabel: 'Обогатитель почвы (Азотофиксатор)',
    rootDepth: 'Средняя (до 80 см)',
    goodPredecessors: ['cucumber', 'tomato', 'cabbage_white', 'potato', 'zucchini'],
    badPredecessors: ['beans', 'peas'],
    goodNeighbors: ['cucumber', 'corn', 'potato', 'eggplant', 'strawberry'],
    badNeighbors: ['onion', 'garlic', 'fennel', 'sunflower'],
    sowingPeriod: 'Конец мая (теплая земля)',
    harvestPeriod: 'Июль - Август',
    minYearsReturn: 3,
    description: 'Более теплолюбива, чем горох. Улучшает микробиологию почвы.',
    agronomicTip: 'Кустовая фасоль в междурядьях картофеля отпугивает колорадского жука и питает картофель азотом.'
  },

  // --- Маревые ---
  {
    id: 'beet',
    name: 'Свёкла столовая',
    nameRu: 'Свёкла столовая',
    nameEt: 'Punapeet',
    nameLv: 'Galda bietes',
    nameLt: 'Burokėliai',
    family: 'chenopodiaceae',
    emoji: '🍠',
    nutrientDemand: 'medium',
    nutrientLabel: 'Средняя (калий, бор, натрий)',
    rootDepth: 'Глубокая (до 1-1.5 м)',
    goodPredecessors: ['cucumber', 'tomato', 'onion', 'garlic', 'cabbage_white', 'peas', 'zucchini'],
    badPredecessors: ['beet', 'spinach', 'chard'],
    goodNeighbors: ['onion', 'cabbage_white', 'lettuce', 'radish', 'bush_beans'],
    badNeighbors: ['mustard', 'pole_beans', 'corn'],
    sowingPeriod: 'Май (в грунт прогретый до +10°C)',
    harvestPeriod: 'Сентябрь',
    minYearsReturn: 3,
    description: 'Чувствительна к кислотности почвы (при кислой краснеют листья). Нуждается в микроэлементе бор.',
    agronomicTip: 'Свёкла отлично растет по краям грядок с луком или капустой, не затеняя соседей.'
  },

  // --- Розоцветные ---
  {
    id: 'strawberry',
    name: 'Клубника (Земляника садовая)',
    nameRu: 'Клубника (Земляника садовая)',
    nameEt: 'Aedmaasikas (maasikad)',
    nameLv: 'Dārza zemenes',
    nameLt: 'Braškės (sodinės žemuogės)',
    family: 'rosaceae',
    emoji: '🍓',
    nutrientDemand: 'high',
    nutrientLabel: 'Высокая (калий, микроэлементы)',
    rootDepth: 'Средняя (25-35 см)',
    goodPredecessors: ['garlic', 'onion', 'carrot', 'radish', 'beans', 'green_manure_marigold', 'green_manure_mustard'],
    badPredecessors: ['strawberry', 'potato', 'tomato', 'eggplant', 'raspberry'],
    goodNeighbors: ['garlic', 'onion', 'parsley', 'spinach', 'thyme', 'marigold'],
    badNeighbors: ['cabbage_white', 'broccoli', 'fennel'],
    sowingPeriod: 'Август (усы) / Май',
    harvestPeriod: 'Июнь - Июль',
    minYearsReturn: 4,
    description: 'Многолетник на 3-4 года. Опасны долгоносик и серая гниль. Не сажать после паслёновых из-за вертициллёза!',
    agronomicTip: 'Обязательно сажайте ряды клубники после чеснока или бархатцев — это лучшая дезинфекция от почвенных нематод.'
  },

  // --- Астровые / Зелень ---
  {
    id: 'lettuce',
    name: 'Салат листовой / Айсберг',
    nameRu: 'Салат листовой / Айсберг',
    nameEt: 'Lehtsalat / Jääsalat',
    nameLv: 'Lapu salāti / Aisberga salāti',
    nameLt: 'Lapinės salotos / Ledinės salotos',
    family: 'asteraceae',
    emoji: '🥗',
    nutrientDemand: 'low',
    nutrientLabel: 'Низкая / Средняя',
    rootDepth: 'Поверхностная (15 см)',
    goodPredecessors: ['cucumber', 'tomato', 'potato', 'peas', 'onion'],
    badPredecessors: ['lettuce', 'sunflower'],
    goodNeighbors: ['carrot', 'radish', 'cucumber', 'strawberry', 'tomato', 'onion'],
    badNeighbors: ['parsley', 'celery'],
    sowingPeriod: 'Апрель - Июль конвейером',
    harvestPeriod: 'Через 25-45 дней',
    minYearsReturn: 2,
    description: 'Скороспелый, компактный. Идеален для весеннего уплотнения любых грядок.',
    agronomicTip: 'Сажайте по периметру томатных или огуречных грядок — он успеет отдать урожай до смыкания листьев.'
  },

  // --- Сидераты ---
  {
    id: 'green_manure_phacelia',
    name: 'Сидерат: Фацелия',
    nameRu: 'Сидерат: Фацелия',
    nameEt: 'Haljasväetis: Keerispea',
    nameLv: 'Zaļmēslojums: Facēlija',
    nameLt: 'Sideratas: Facelija',
    family: 'green_manure',
    emoji: '🌸',
    nutrientDemand: 'enrich',
    nutrientLabel: 'Обогатитель почвы и санитар',
    rootDepth: 'Глубокая, рыхлящая',
    goodPredecessors: ['tomato', 'potato', 'cucumber', 'cabbage_white', 'carrot', 'onion'],
    badPredecessors: [],
    goodNeighbors: ['all'],
    badNeighbors: [],
    sowingPeriod: 'Апрель - Сентябрь',
    harvestPeriod: 'Скашивание в фазе бутонизации',
    minYearsReturn: 1,
    description: 'Универсальный сидерат! Не принадлежит ни к одному огородному семейству, не переносит болезней, раскисляет почву и выгоняет нематоду.',
    agronomicTip: 'Идеальный восстановитель почвы для грядки после паслёновых перед посадкой любых требовательных культур.'
  },
  {
    id: 'green_manure_mustard',
    name: 'Сидерат: Горчица белая',
    nameRu: 'Сидерат: Горчица белая',
    nameEt: 'Haljasväetis: Valge sinep',
    nameLv: 'Zaļmēslojums: Baltā sinepe',
    nameLt: 'Sideratas: Baltoji garstyčia',
    family: 'brassicaceae',
    emoji: '🌼',
    nutrientDemand: 'enrich',
    nutrientLabel: 'Биофунгицид (сера, фитонциды)',
    rootDepth: 'Глубокая',
    goodPredecessors: ['potato', 'tomato', 'cucumber', 'onion', 'garlic'],
    badPredecessors: ['cabbage_white', 'broccoli', 'radish'],
    goodNeighbors: ['potato', 'strawberry'],
    badNeighbors: ['cabbage_white', 'radish'],
    sowingPeriod: 'Август - Сентябрь (после сбора урожая)',
    harvestPeriod: 'Заделка под снег',
    minYearsReturn: 1,
    description: 'Очищает почву от проволочника, парши и фитофторы. Внимание: относится к крестоцветным, нельзя перед капустой!',
    agronomicTip: 'Лучший осенний сидерат после картофеля и томатов. Но категорически запрещен перед капустой и редисом!'
  },
  {
    id: 'fallow',
    name: 'Отдых почвы (Черный пар / Мульча)',
    nameRu: 'Отдых почвы (Черный пар / Мульча)',
    nameEt: 'Mulla puhkus (Mustkesa / Multš)',
    nameLv: 'Augsnes atpūta (Papuve / Mulča)',
    nameLt: 'Dirvos poilsis (Pūdymas / Mulčias)',
    family: 'green_manure',
    emoji: '🍂',
    nutrientDemand: 'enrich',
    nutrientLabel: 'Восстановление структуры',
    rootDepth: '—',
    goodPredecessors: ['all'],
    badPredecessors: [],
    goodNeighbors: [],
    badNeighbors: [],
    sowingPeriod: 'Весь сезон',
    harvestPeriod: '—',
    minYearsReturn: 1,
    description: 'Грядка под слоем компоста или органической мульчи для восстановления естественной биоты и отдыха земли.',
    agronomicTip: 'Один сезон отдыха с мульчированием возвращает плодородие истощенной грядке.'
  }
];

const CROP_ID_ALIASES = {
  'cabbage': 'cabbage_white',
  'potato_early': 'potato',
  'green_manure_rye': 'green_manure_phacelia',
  'parsley': 'dill',
  'spinach': 'lettuce',
  'chard': 'beet',
  'leek': 'onion'
};

/**
 * Получить культуру по ID с автоматической поддержкой синонимов и алиасов
 */
function getCropById(cropId) {
  if (!cropId) return null;
  const canonicalId = CROP_ID_ALIASES[cropId] || cropId;
  const found = CROPS_DATABASE.find(c => c.id === canonicalId);
  if (found) return found;
  if (typeof window !== 'undefined' && window.app && window.app.storage) {
    const custom = window.app.storage.getCustomCrops().find(c => c.id === canonicalId || c.id === cropId);
    if (custom) {
      if (!CROPS_DATABASE.some(c => c.id === custom.id)) {
        CROPS_DATABASE.push(custom);
      }
      return custom;
    }
  }
  return null;
}

/**
 * Получить семейство по ID
 */
function getFamilyById(familyId) {
  if (!familyId) return null;
  return CROP_FAMILIES[familyId] || null;
}

/**
 * Получить локализованное название культуры по объекту или ID
 * @param {Object|string} cropOrId 
 * @param {string} [lang]
 * @returns {string}
 */
function getCropName(cropOrId, lang) {
  if (!cropOrId) return '';
  const crop = typeof cropOrId === 'string' ? getCropById(cropOrId) : cropOrId;
  if (!crop) return typeof cropOrId === 'string' ? cropOrId : '';
  const currentLang = lang || (typeof window !== 'undefined' && window.i18n ? window.i18n.getLanguage() : 'ru');
  if (currentLang === 'et') return crop.nameEt || crop.nameRu || crop.name;
  if (currentLang === 'lv') return crop.nameLv || crop.nameRu || crop.name;
  if (currentLang === 'lt') return crop.nameLt || crop.nameRu || crop.name;
  return crop.nameRu || crop.name;
}

/**
 * Получить локализованное название семейства растений по объекту или ID
 * @param {Object|string} familyOrId 
 * @param {string} [lang]
 * @returns {string}
 */
function getFamilyName(familyOrId, lang) {
  if (!familyOrId) return '';
  const family = typeof familyOrId === 'string' ? getFamilyById(familyOrId) : familyOrId;
  if (!family) return typeof familyOrId === 'string' ? familyOrId : '';
  const currentLang = lang || (typeof window !== 'undefined' && window.i18n ? window.i18n.getLanguage() : 'ru');
  if (currentLang === 'et') return family.nameEt || family.nameRu || family.name;
  if (currentLang === 'lv') return family.nameLv || family.nameRu || family.name;
  if (currentLang === 'lt') return family.nameLt || family.nameRu || family.name;
  return family.nameRu || family.name;
}

/**
 * Оценить севооборот для посадки культуры на грядку с известной историей
 * @param {string} newCropId - ID новой культуры для посадки
 * @param {Array<{year: number, cropId: string}>} history - История посадок прошлых лет (отсортированная по убыванию года)
 * @returns {Object} результат анализа: status ('optimal' | 'warning' | 'danger'), title, reasons, advice
 */
function evaluateCropRotation(newCropId, history = []) {
  const tr = (k, p) => (typeof window !== 'undefined' && window.t ? window.t(k, p) : null);

  if (!newCropId || newCropId === 'fallow') {
    return {
      status: 'optimal',
      score: 100,
      title: tr('eval_fallow_title') || 'Отличный выбор',
      reasons: [tr('eval_fallow_reason') || 'Отдых почвы или сидерат восстанавливает плодородие.'],
      advice: tr('eval_fallow_advice') || 'Почва накопит органику и избавится от патогенов.'
    };
  }

  const newCrop = getCropById(newCropId);
  if (!newCrop) {
    return { status: 'neutral', score: 50, title: tr('eval_neutral') || 'Культура не выбрана', reasons: [], advice: '' };
  }

  const newName = getCropName(newCrop);

  // Если истории нет — нейтральный статус
  if (!history || history.length === 0) {
    return {
      status: 'optimal',
      score: 85,
      title: tr('eval_no_history') || 'Данных о предшественниках нет',
      reasons: [tr('eval_no_history_reason') || 'Первый год учета для этой грядки.'],
      advice: tr('eval_no_history_advice') || 'Рекомендуется внести комплексное удобрение или перегной при посадке.'
    };
  }

  const prevYearRecord = history[0];
  const prevCrop = prevYearRecord ? getCropById(prevYearRecord.cropId) : null;
  const prevName = prevCrop ? getCropName(prevCrop) : '';

  const reasons = [];
  let status = 'optimal';
  let score = 90;

  // 1. Проверка на одно и то же семейство подряд (ГРУБАЯ ОШИБКА)
  if (prevCrop) {
    if (newCrop.id === prevCrop.id && newCrop.family !== 'rosaceae' && newCrop.family !== 'green_manure') {
      status = 'danger';
      score = 15;
      reasons.push(tr('eval_err_monoculture', { crop: newName }) || `❌ Ошибка монокультуры: ${newName} сажается на то же место второй год подряд! Это ведет к резкому падению урожая и вспышке болезней.`);
    } else if (newCrop.family === prevCrop.family && newCrop.family !== 'green_manure') {
      status = 'danger';
      score = 25;
      const famName = getFamilyName(newCrop.family);
      reasons.push(tr('eval_err_family', { family: famName, prevCrop: prevName, crop: newName }) || `❌ Родственные культуры подряд (${famName}): предшественник "${prevName}" имеет общих вредителей и болезни с "${newName}".`);
    }

    // 2. Проверка плохих предшественников
    if (newCrop.badPredecessors.includes(prevCrop.id)) {
      if (status !== 'danger') {
        status = 'warning';
        score = Math.min(score, 45);
      }
      reasons.push(tr('eval_warn_bad_pred', { prevCrop: prevName, crop: newName }) || `⚠️ "${prevName}" — плохой предшественник для "${newName}".`);
    }

    // 3. Проверка хороших предшественников
    if (newCrop.goodPredecessors.includes(prevCrop.id) || (prevCrop.family === 'fabaceae' && newCrop.family !== 'fabaceae')) {
      if (status === 'optimal') {
        score = 98;
        reasons.push(tr('eval_good_pred', { prevCrop: prevName, crop: newName }) || `✅ Идеальный предшественник: после "${prevName}" почва оптимально подготовлена для "${newName}".`);
      }
    }
  }

  // 4. Проверка возврата культуры по годам (правило 3-4 лет)
  for (let i = 1; i < history.length; i++) {
    const pastRec = history[i];
    const pastCrop = getCropById(pastRec.cropId);
    if (!pastCrop) continue;

    const yearsAgo = i + 1;
    if (pastCrop.family === newCrop.family && newCrop.family !== 'green_manure' && newCrop.family !== 'rosaceae') {
      if (yearsAgo < (newCrop.minYearsReturn || 3)) {
        if (status === 'optimal') {
          status = 'warning';
          score = Math.min(score, 60);
        }
        reasons.push(tr('eval_warn_return', { prevCrop: getCropName(pastCrop), years: yearsAgo, minYears: newCrop.minYearsReturn || 3 }) || `ℹ️ Родственная культура (${getCropName(pastCrop)}) уже росла здесь ${yearsAgo} г. назад (рекомендуемый перерыв: ${newCrop.minYearsReturn} года).`);
      }
    }
  }

  // 5. Потребность в питании
  if (prevCrop && prevCrop.nutrientDemand === 'high' && newCrop.nutrientDemand === 'high' && status === 'optimal') {
    status = 'warning';
    score = Math.min(score, 65);
    reasons.push(tr('eval_warn_heavy', { prevCrop: prevName, crop: newName }) || `⚠️ Внимание: две культуры с высоким выносом питательных веществ подряд ("${prevName}" -> "${newName}"). Потребуется усиленное внесение органики и фосфорно-калийных удобрений.`);
  }

  let title = tr('eval_optimal') || 'Отличный севооборот';
  if (status === 'warning') title = tr('eval_warning') || 'Допустимо с оговорками';
  if (status === 'danger') title = tr('eval_danger') || 'Нарушение севооборота!';

  return {
    status,
    score,
    title,
    reasons: reasons.length ? reasons : [tr('eval_balanced') || 'Севооборот сбалансирован, противопоказаний нет.'],
    advice: newCrop.agronomicTip || tr('eval_default_advice') || 'Соблюдайте режим полива и подкормок.'
  };
}

/**
 * Подобрать наилучшие культуры для конкретной грядки на основе её истории
 * @param {Array<{year: number, cropId: string}>} history
 * @returns {Array<{crop: Object, score: number, verdict: string}>}
 */
function recommendCropsForBed(history = []) {
  const recommendations = [];

  for (const crop of CROPS_DATABASE) {
    if (crop.id === 'fallow') continue;
    const evaluation = evaluateCropRotation(crop.id, history);
    recommendations.push({
      crop,
      score: evaluation.score,
      status: evaluation.status,
      verdict: evaluation.title,
      reasons: evaluation.reasons,
      advice: evaluation.advice
    });
  }

  // Сортируем: сначала самые высокие баллы
  recommendations.sort((a, b) => b.score - a.score);
  return recommendations;
}

/**
 * Агрономические нормы высадки (рассада, семена, клубни) на 1 кв.м площади
 */
const CROP_PLANTING_STANDARDS = {
  tomato: { perSqM: 3.5, spacing: '50 × 60 см', unitType: 'seedling', unitRu: 'кустов рассады', unitEt: 'istikut', unitLv: 'stādu', unitLt: 'daigų', hintRu: 'Схема 50×60 см (~3-4 куста на 1 м²)' },
  cucumber: { perSqM: 3.5, spacing: '40 × 60 см', unitType: 'plants', unitRu: 'растений', unitEt: 'taime', unitLv: 'augu', unitLt: 'augalų', hintRu: 'Схема 40×60 см (~3-4 растения на 1 м²)' },
  pepper: { perSqM: 4.5, spacing: '40 × 50 см', unitType: 'seedling', unitRu: 'кустов рассады', unitEt: 'istikut', unitLv: 'stādu', unitLt: 'daigų', hintRu: 'Схема 40×50 см (~4-5 кустов на 1 м²)' },
  eggplant: { perSqM: 4, spacing: '45 × 50 см', unitType: 'seedling', unitRu: 'кустов рассады', unitEt: 'istikut', unitLv: 'stādu', unitLt: 'daigų', hintRu: 'Схема 45×50 см (~4 куста на 1 м²)' },
  potato: { perSqM: 5.5, spacing: '30 × 70 см', unitType: 'tubers', unitRu: 'клубней (~400-500 г)', unitEt: 'mugulat (~400 g)', unitLv: 'bumbuļu (~400 g)', unitLt: 'gumbų (~400 g)', hintRu: 'Схема 30×70 см (~5-6 клубней на 1 м²)' },
  cabbage_white: { perSqM: 3.5, spacing: '50 × 50 см', unitType: 'seedling', unitRu: 'кочанов рассады', unitEt: 'istikut', unitLv: 'stādu', unitLt: 'daigų', hintRu: 'Схема 50×50 см (~3-4 кочана на 1 м²)' },
  broccoli: { perSqM: 4, spacing: '45 × 50 см', unitType: 'seedling', unitRu: 'растений рассады', unitEt: 'istikut', unitLv: 'stādu', unitLt: 'daigų', hintRu: 'Схема 45×50 см (~4 растения на 1 м²)' },
  radish: { perSqM: 80, spacing: '5 × 15 см', unitType: 'seeds', unitRu: 'корнеплодов (~2-3 г семян)', unitEt: 'juurvilja (~2-3 g)', unitLv: 'sakņu (~2-3 g)', unitLt: 'šakniavaisių (~2-3 g)', hintRu: 'Схема 5×15 см (~80 шт. или 2-3 г семян на м²)' },
  carrot: { perSqM: 80, spacing: '4 × 20 см', unitType: 'seeds', unitRu: 'корнеплодов (~1.5 г семян)', unitEt: 'porgandit (~1.5 g)', unitLv: 'burkānu (~1.5 g)', unitLt: 'morkų (~1.5 g)', hintRu: 'Схема 4×20 см (~80 корнеплодов или 1-1.5 г семян на м²)' },
  dill: { perSqM: 2.5, spacing: 'сплошной', unitType: 'grams', unitRu: 'г семян (~150 растений)', unitEt: 'g seemneid', unitLv: 'g sēklu', unitLt: 'g sėklų', hintRu: 'Норма высева: 2-3 г семян на 1 м²' },
  celery: { perSqM: 7, spacing: '30 × 35 см', unitType: 'seedling', unitRu: 'растений рассады', unitEt: 'istikut', unitLv: 'stādu', unitLt: 'daigų', hintRu: 'Схема 30×35 см (~6-8 растений на 1 м²)' },
  onion: { perSqM: 45, spacing: '8 × 20 см', unitType: 'bulbs', unitRu: 'луковиц севка (~600-700 г)', unitEt: 'tippsibulat (~600 g)', unitLv: 'sīksīpolu (~600 g)', unitLt: 'sodinukų (~600 g)', hintRu: 'Схема 8×20 см (~40-50 шт. севка на 1 м²)' },
  garlic: { perSqM: 35, spacing: '10 × 20 см', unitType: 'cloves', unitRu: 'зубчиков (~180-200 г)', unitEt: 'küünt (~200 g)', unitLv: 'daiviņu (~200 g)', unitLt: 'skiltelių (~200 g)', hintRu: 'Схема 10×20 см (~30-40 зубчиков на 1 м²)' },
  zucchini: { perSqM: 1, spacing: '80 × 80 см', unitType: 'plants', unitRu: 'кустов', unitEt: 'taime', unitLv: 'ceru', unitLt: 'krūmų', hintRu: 'Схема 80×80 см (1 куст на 1 м²)' },
  pumpkin: { perSqM: 0.6, spacing: '120 × 120 см', unitType: 'plants', unitRu: 'кустов', unitEt: 'taime', unitLv: 'ceru', unitLt: 'krūmų', hintRu: 'Схема 120×120 см (1 куст на 1.5-2 м²)' },
  peas: { perSqM: 55, spacing: '5 × 20 см', unitType: 'seeds', unitRu: 'горошин (~20-25 г)', unitEt: 'hernetera (~20 g)', unitLv: 'zirņu (~20 g)', unitLt: 'žirnių (~20 g)', hintRu: 'Схема 5×20 см (~50-60 семян на 1 м²)' },
  beans: { perSqM: 35, spacing: '10 × 25 см', unitType: 'seeds', unitRu: 'фасолин (~25-30 г)', unitEt: 'uba (~25 g)', unitLv: 'pupiņu (~25 g)', unitLt: 'pupelių (~25 g)', hintRu: 'Схема 10×25 см (~30-40 семян на 1 м²)' },
  beet: { perSqM: 35, spacing: '8 × 25 см', unitType: 'seeds', unitRu: 'корнеплодов (~2-3 г семян)', unitEt: 'peeti (~2-3 g)', unitLv: 'biešu (~2-3 g)', unitLt: 'burokėlių (~2-3 g)', hintRu: 'Схема 8×25 см (~30-40 растений на 1 м²)' },
  strawberry: { perSqM: 4.5, spacing: '30 × 60 см', unitType: 'plants', unitRu: 'кустов клубники/земляники', unitEt: 'taime', unitLv: 'ceru', unitLt: 'krūmų', hintRu: 'Схема 30×60 см (~4-5 кустов на 1 м²)' },
  lettuce: { perSqM: 16, spacing: '20 × 25 см', unitType: 'plants', unitRu: 'растений салата', unitEt: 'salatitaime', unitLv: 'salātu stādu', unitLt: 'salotų daigų', hintRu: 'Схема 20×25 см (~15-20 растений на 1 м²)' },
  green_manure_phacelia: { perSqM: 3, spacing: 'сплошной', unitType: 'grams', unitRu: 'г семян фацелии', unitEt: 'g seemneid', unitLv: 'g sēklu', unitLt: 'g sėklų', hintRu: 'Норма высева: 2.5-3.5 г на 1 м²' },
  green_manure_mustard: { perSqM: 4, spacing: 'сплошной', unitType: 'grams', unitRu: 'г семян горчицы', unitEt: 'g seemneid', unitLv: 'g sēklu', unitLt: 'g sėklų', hintRu: 'Норма высева: 3.5-4.5 г на 1 м²' }
};

/**
 * Рассчитать вместимость грядки (рассада, семена) исходя из площади
 * @param {string} cropId
 * @param {number} areaSqM
 * @param {string} lang
 * @returns {Object|null}
 */
function calculateCropCapacity(cropId, areaSqM, lang = 'ru') {
  if (!cropId || !areaSqM || areaSqM <= 0) return null;
  const std = CROP_PLANTING_STANDARDS[cropId];
  if (!std) return null;

  const rawQty = areaSqM * std.perSqM;
  const qty = std.perSqM < 1 ? Math.max(1, Math.round(rawQty)) : Math.round(rawQty);
  
  let unit = std.unitRu;
  if (lang === 'et') unit = std.unitEt;
  else if (lang === 'lv') unit = std.unitLv;
  else if (lang === 'lt') unit = std.unitLt;

  return {
    areaSqM: parseFloat(areaSqM.toFixed(2)),
    quantity: qty,
    unit: unit,
    spacing: std.spacing,
    hint: std.hintRu
  };
}

/**
 * Проверка совместимости растений-соседей (добрососедство / компаньоны)
 * @param {string} cropId
 * @param {Array<string>} neighborCropIds
 * @param {string} lang
 * @returns {Object|null}
 */
function evaluateCompanionPlanting(cropId, neighborCropIds = [], lang = 'ru') {
  const crop = getCropById(cropId);
  if (!crop) return null;

  const good = crop.goodNeighbors || [];
  const bad = crop.badNeighbors || [];

  const validNeighbors = neighborCropIds.filter(id => id && id !== cropId);
  const friendly = validNeighbors.filter(id => good.includes(id));
  const antagonistic = validNeighbors.filter(id => bad.includes(id));

  // Получаем объекты хороших и нежелательных соседей для отображения подсказок
  const allGoodCrops = good.map(id => getCropById(id)).filter(Boolean);
  const allBadCrops = bad.map(id => getCropById(id)).filter(Boolean);

  let status = 'neutral'; // 'positive' | 'negative' | 'neutral'
  let alertMessage = null;

  if (antagonistic.length > 0) {
    status = 'negative';
    const badNames = antagonistic.map(id => getCropName(getCropById(id), lang)).join(', ');
    alertMessage = lang === 'et' ? `⚠️ Ebasoovitav naabrus: ${badNames} pärsib taime kasvu!` :
                   lang === 'lv' ? `⚠️ Nevēlama kaimiņattiecība: ${badNames} nomāc auga augšanu!` :
                   lang === 'lt' ? `⚠️ Nepageidaujama kaimynystė: ${badNames} slopina augimą!` :
                   `⚠️ Нежелательное соседство: «${badNames}» угнетает рост «${getCropName(crop, lang)}»!`;
  } else if (friendly.length > 0) {
    status = 'positive';
    const goodNames = friendly.map(id => getCropName(getCropById(id), lang)).join(', ');
    alertMessage = lang === 'et' ? `💚 Suurepärane naabrus: ${goodNames} kaitseb kahjurite eest!` :
                   lang === 'lv' ? `💚 Lieliska kaimiņattiecība: ${goodNames} aizsargā pret kaitēkļiem!` :
                   lang === 'lt' ? `💚 Puiki kaimynystė: ${goodNames} apsaugo nuo kenkėjų!` :
                   `💚 Отличное добрососедство: «${goodNames}» взаимно защищают и стимулируют урожай!`;
  }

  return {
    crop,
    status,
    alertMessage,
    friendlyIds: friendly,
    antagonisticIds: antagonistic,
    allGoodCrops,
    allBadCrops
  };
}

/**
 * График сезонных агрономических работ по месяцам (Февраль - Октябрь)
 */
const CROP_CALENDAR_TIMELINE = {
  tomato: [
    { month: 3, stage: 'seedling', labelRu: 'Посев семян на рассаду дома', icon: '🪴' },
    { month: 5, stage: 'greenhouse', labelRu: 'Высадка рассады в теплицу / под укрытие', icon: '🏡' },
    { month: 6, stage: 'ground', labelRu: 'Пасынкование, подвязка, мульчирование', icon: '🌿' },
    { month: 7, stage: 'harvest', labelRu: 'Сбор первых зрелых плодов', icon: '🧺' },
    { month: 8, stage: 'harvest', labelRu: 'Массовый сбор урожая и заготовки', icon: '🧺' }
  ],
  cucumber: [
    { month: 4, stage: 'seedling', labelRu: 'Посев на рассаду (или в торфяные горшочки)', icon: '🪴' },
    { month: 5, stage: 'greenhouse', labelRu: 'Высадка в теплицу или на тёплую гряду', icon: '🏡' },
    { month: 6, stage: 'harvest', labelRu: 'Начало плодоношения, сбор огурцов', icon: '🧺' },
    { month: 7, stage: 'harvest', labelRu: 'Пик урожая, полив только тёплой водой', icon: '🧺' },
    { month: 8, stage: 'harvest', labelRu: 'Сбор урожая и засолка', icon: '🧺' }
  ],
  pepper: [
    { month: 2, stage: 'seedling', labelRu: 'Ранний посев семян на рассаду', icon: '🪴' },
    { month: 3, stage: 'seedling', labelRu: 'Пикировка сеянцев перца', icon: '🪴' },
    { month: 5, stage: 'greenhouse', labelRu: 'Высадка рассады в теплицу', icon: '🏡' },
    { month: 7, stage: 'harvest', labelRu: 'Сбор первых перцев (техническая спелость)', icon: '🧺' },
    { month: 8, stage: 'harvest', labelRu: 'Массовый сбор биологически зрелых плодов', icon: '🧺' }
  ],
  eggplant: [
    { month: 2, stage: 'seedling', labelRu: 'Посев баклажанов на рассаду', icon: '🪴' },
    { month: 5, stage: 'greenhouse', labelRu: 'Высадка в теплицу или плёночное укрытие', icon: '🏡' },
    { month: 7, stage: 'harvest', labelRu: 'Сбор плодов баклажана', icon: '🧺' },
    { month: 8, stage: 'harvest', labelRu: 'Сбор урожая', icon: '🧺' }
  ],
  potato: [
    { month: 4, stage: 'seedling', labelRu: 'Яровизация и проращивание клубней на свету', icon: '☀️' },
    { month: 5, stage: 'ground', labelRu: 'Посадка картофеля в прогретую почву (+8..10°C)', icon: '🌱' },
    { month: 6, stage: 'ground', labelRu: 'Окучивание рядов и защита от вредителей', icon: '🚜' },
    { month: 7, stage: 'harvest', labelRu: 'Подкоп молодого картофеля к столу', icon: '🧺' },
    { month: 8, stage: 'harvest', labelRu: 'Массовая копка картофеля и просушка клубней', icon: '🧺' }
  ],
  cabbage_white: [
    { month: 3, stage: 'seedling', labelRu: 'Посев ранней и среднеспелой капусты на рассаду', icon: '🪴' },
    { month: 5, stage: 'ground', labelRu: 'Высадка рассады в грунт, защита от блошки', icon: '🌱' },
    { month: 7, stage: 'harvest', labelRu: 'Сбор кочанов ранней капусты', icon: '🧺' },
    { month: 9, stage: 'harvest', labelRu: 'Уборка поздней капусты для длительного хранения', icon: '🧺' }
  ],
  broccoli: [
    { month: 4, stage: 'seedling', labelRu: 'Посев брокколи на рассаду', icon: '🪴' },
    { month: 5, stage: 'ground', labelRu: 'Высадка рассады в открытый грунт', icon: '🌱' },
    { month: 7, stage: 'harvest', labelRu: 'Срезка центральных головок брокколи', icon: '🧺' },
    { month: 8, stage: 'harvest', labelRu: 'Сбор урожая с боковых побегов', icon: '🧺' }
  ],
  radish: [
    { month: 4, stage: 'ground', labelRu: 'Ранний посев семян редиса в парник или открытый грунт', icon: '🌱' },
    { month: 5, stage: 'harvest', labelRu: 'Сбор первого весеннего редиса', icon: '🧺' },
    { month: 8, stage: 'ground', labelRu: 'Повторный осенний посев редиса на короткий световой день', icon: '🌱' },
    { month: 9, stage: 'harvest', labelRu: 'Сбор осеннего сочного редиса', icon: '🧺' }
  ],
  carrot: [
    { month: 4, stage: 'ground', labelRu: 'Посев семян моркови во влажную почву', icon: '🌱' },
    { month: 5, stage: 'ground', labelRu: 'Прореживание всходов и рыхление междурядий', icon: '🌿' },
    { month: 7, stage: 'harvest', labelRu: 'Выборочная уборка на пучок', icon: '🧺' },
    { month: 9, stage: 'harvest', labelRu: 'Генеральная уборка моркови на зимнее хранение', icon: '🧺' }
  ],
  dill: [
    { month: 4, stage: 'ground', labelRu: 'Первый весенний посев укропа в открытый грунт', icon: '🌱' },
    { month: 5, stage: 'harvest', labelRu: 'Срезка свежей зелени, конвейерный подсев', icon: '🧺' },
    { month: 6, stage: 'harvest', labelRu: 'Сбор пряных зонтиков укропа для консервирования', icon: '🧺' }
  ],
  celery: [
    { month: 2, stage: 'seedling', labelRu: 'Посев семян корневого сельдерея на рассаду', icon: '🪴' },
    { month: 5, stage: 'ground', labelRu: 'Высадка рассады в открытый грунт', icon: '🌱' },
    { month: 9, stage: 'harvest', labelRu: 'Уборка крупных корнеплодов сельдерея', icon: '🧺' }
  ],
  onion: [
    { month: 4, stage: 'ground', labelRu: 'Подготовка почвы и посадка севка в борозды', icon: '🌱' },
    { month: 5, stage: 'ground', labelRu: 'Полив и рыхление междурядий', icon: '💧' },
    { month: 7, stage: 'harvest', labelRu: 'Прекращение полива, полегание и подсушивание пера', icon: '☀️' },
    { month: 8, stage: 'harvest', labelRu: 'Уборка лука-репки и просушка на солнце/чердаке', icon: '🧺' }
  ],
  garlic: [
    { month: 4, stage: 'ground', labelRu: 'Посадка ярового чеснока / азотная подкормка озимого', icon: '🌱' },
    { month: 6, stage: 'ground', labelRu: 'Выламывание стрелок озимого чеснока (на заготовки)', icon: '✂️' },
    { month: 7, stage: 'harvest', labelRu: 'Уборка озимого чеснока при растрескивании сигнального чехлика', icon: '🧺' },
    { month: 9, stage: 'ground', labelRu: 'Посадка зубчиков озимого чеснока под зиму', icon: '🍂' }
  ],
  zucchini: [
    { month: 5, stage: 'ground', labelRu: 'Посев семян в теплую почву или высадка рассады', icon: '🌱' },
    { month: 6, stage: 'harvest', labelRu: 'Сбор первых молодых цукини и кабачков', icon: '🧺' },
    { month: 7, stage: 'harvest', labelRu: 'Регулярный сбор урожая каждые 3-4 дня для стимуляции новых завязей', icon: '🧺' },
    { month: 8, stage: 'harvest', labelRu: 'Сбор вызревших плодов с твердой корой на хранение', icon: '🧺' }
  ],
  pumpkin: [
    { month: 5, stage: 'ground', labelRu: 'Посадка тыквы на компостную грядку или солнечное место', icon: '🌱' },
    { month: 6, stage: 'ground', labelRu: 'Прищипывание плетей для формирования крупных тыкв', icon: '🌿' },
    { month: 9, stage: 'harvest', labelRu: 'Срезка тыкв с плодоножкой до наступления заморозков', icon: '🧺' }
  ],
  peas: [
    { month: 4, stage: 'ground', labelRu: 'Ранний посев замоченных семян гороха в грунт', icon: '🌱' },
    { month: 5, stage: 'ground', labelRu: 'Установка шпалер или сетки-опоры для плетей', icon: '🎋' },
    { month: 6, stage: 'harvest', labelRu: 'Сбор сладких стручков сахарного и лущильного горошка', icon: '🧺' },
    { month: 7, stage: 'harvest', labelRu: 'Срезка ботвы, корни оставляем в почве для насыщения азотом', icon: '♻️' }
  ],
  beans: [
    { month: 5, stage: 'ground', labelRu: 'Посев фасоли в прогретую почву (не менее +12..14°C)', icon: '🌱' },
    { month: 7, stage: 'harvest', labelRu: 'Сбор молодой нежной спаржевой фасоли', icon: '🧺' },
    { month: 8, stage: 'harvest', labelRu: 'Сбор и лущение сухих стручков зерновой фасоли', icon: '🧺' }
  ],
  beet: [
    { month: 5, stage: 'ground', labelRu: 'Посев семян свёклы во влажный прогретый грунт', icon: '🌱' },
    { month: 6, stage: 'ground', labelRu: 'Прореживание всходов на расстояние 8-10 см', icon: '🌿' },
    { month: 8, stage: 'harvest', labelRu: 'Выборочный сбор свёклы для летних блюд', icon: '🧺' },
    { month: 9, stage: 'harvest', labelRu: 'Уборка корнеплодов свёклы до заморозков', icon: '🧺' }
  ],
  strawberry: [
    { month: 4, stage: 'ground', labelRu: 'Весенняя очистка от сухих листьев и рыхление', icon: '🧹' },
    { month: 5, stage: 'ground', labelRu: 'Обильное цветение, мульчирование соломой или хвоей', icon: '🌸' },
    { month: 6, stage: 'harvest', labelRu: 'Сбор сладких ягод клубники и земляники', icon: '🍓' },
    { month: 7, stage: 'harvest', labelRu: 'Обрезка усов и старых листьев, подкормка фосфором и калием', icon: '✂️' },
    { month: 8, stage: 'ground', labelRu: 'Посадка укоренённых розеток на новые грядки', icon: '🌱' }
  ],
  lettuce: [
    { month: 4, stage: 'ground', labelRu: 'Весенний посев листового салата в грунт', icon: '🌱' },
    { month: 5, stage: 'harvest', labelRu: 'Срезка свежих листьев, повторный посев новой партии', icon: '🧺' },
    { month: 6, stage: 'harvest', labelRu: 'Сбор салата', icon: '🧺' }
  ],
  green_manure_phacelia: [
    { month: 5, stage: 'ground', labelRu: 'Весенний посев фацелии для оздоровления почвы', icon: '🌱' },
    { month: 6, stage: 'ground', labelRu: 'Цветение медоноса, скашивание до образования семян', icon: '🌸' },
    { month: 8, stage: 'ground', labelRu: 'Осенний посев сидерата после сбора основного урожая', icon: '🌱' },
    { month: 9, stage: 'ground', labelRu: 'Заделка зелёной массы в верхний слой почвы', icon: '🍂' }
  ],
  green_manure_mustard: [
    { month: 4, stage: 'ground', labelRu: 'Ранний посев белой горчицы для очищения почвы от грибков', icon: '🌱' },
    { month: 8, stage: 'ground', labelRu: 'Посев горчицы после уборки картофеля и томатов', icon: '🌱' },
    { month: 9, stage: 'ground', labelRu: 'Скашивание и заделка в грунт против проволочника и парши', icon: '🍂' }
  ]
};

/**
 * Собрать календарные события сезона на основе фактически посаженных культур
 * @param {number} activeYear
 * @param {Array<Object>} beds
 * @param {string} lang
 * @returns {Array<Object>}
 */
function getSeasonalCalendarEvents(activeYear, beds = [], lang = 'ru') {
  const monthNames = {
    2: { ru: 'Февраль', et: 'Veebruar', lv: 'Februāris', lt: 'Vasaris' },
    3: { ru: 'Март', et: 'Märts', lv: 'Marts', lt: 'Kovas' },
    4: { ru: 'Апрель', et: 'Aprill', lv: 'Aprīlis', lt: 'Balandis' },
    5: { ru: 'Май', et: 'Mai', lv: 'Maijs', lt: 'Gegužė' },
    6: { ru: 'Июнь', et: 'Juuni', lv: 'Jūnijs', lt: 'Birželis' },
    7: { ru: 'Июль', et: 'Juuli', lv: 'Jūlijs', lt: 'Liepa' },
    8: { ru: 'Август', et: 'August', lv: 'Augusts', lt: 'Rugpjūtis' },
    9: { ru: 'Сентябрь', et: 'September', lv: 'Septembris', lt: 'Rugsėjis' },
    10: { ru: 'Октябрь', et: 'Oktoober', lv: 'Oktobris', lt: 'Spalis' }
  };

  const plantedItems = [];
  beds.forEach(bed => {
    if (bed.sections && bed.sections.length > 0) {
      bed.sections.forEach(sec => {
        const cropId = sec.history?.[activeYear]?.cropId;
        if (cropId && cropId !== 'fallow') {
          plantedItems.push({
            bed,
            section: sec,
            cropId,
            variety: sec.history[activeYear].variety || '',
            name: `${bed.name} (${sec.name})`
          });
        }
      });
    } else {
      const cropId = bed.history?.[activeYear]?.cropId;
      if (cropId && cropId !== 'fallow') {
        plantedItems.push({
          bed,
          section: null,
          cropId,
          variety: bed.history[activeYear].variety || '',
          name: bed.name
        });
      }
    }
  });

  const monthsMap = {};
  for (let m = 2; m <= 10; m++) {
    monthsMap[m] = {
      monthNumber: m,
      monthName: monthNames[m]?.[lang] || monthNames[m]?.ru || `Месяц ${m}`,
      events: []
    };
  }

  plantedItems.forEach(item => {
    const crop = getCropById(item.cropId);
    if (!crop) return;
    const timeline = CROP_CALENDAR_TIMELINE[item.cropId] || [];
    
    timeline.forEach(evt => {
      if (monthsMap[evt.month]) {
        monthsMap[evt.month].events.push({
          cropId: item.cropId,
          cropName: getCropName(crop, lang),
          cropEmoji: crop.emoji || '🌱',
          variety: item.variety,
          bedName: item.name,
          bedType: item.bed.type,
          stage: evt.stage, // 'seedling' | 'greenhouse' | 'ground' | 'harvest'
          action: evt.labelRu,
          icon: evt.icon || '🌱'
        });
      }
    });
  });

  return Object.values(monthsMap).filter(m => m.events.length > 0);
}

/**
 * Алгоритм автоматического подбора оптимального севооборота в 1 клик
 * @param {Array<Object>} beds - список грядок огорода
 * @param {Array<string>} requestedCropIds - список запрашиваемых культур
 * @param {number} activeYear
 * @returns {Array<Object>}
 */
function solveCropRotationAssignment(beds, requestedCropIds = [], activeYear = 2026) {
  const targets = [];
  beds.forEach(bed => {
    if (bed.sections && bed.sections.length > 0) {
      bed.sections.forEach(sec => {
        targets.push({ bed, section: sec, id: `${bed.id}:${sec.id}`, name: `${bed.name} (${sec.name})` });
      });
    } else {
      targets.push({ bed, section: null, id: bed.id, name: bed.name });
    }
  });

  if (targets.length === 0 || requestedCropIds.length === 0) {
    return [];
  }

  // Сортируем культуры: сначала более требовательные к севообороту
  const sortedCrops = [...requestedCropIds].sort((a, b) => {
    const cA = getCropById(a);
    const cB = getCropById(b);
    return (cB?.badPredecessors?.length || 0) - (cA?.badPredecessors?.length || 0);
  });

  const assignments = [];
  const usedTargets = new Set();

  for (const cropId of sortedCrops) {
    let bestTarget = null;
    let bestScore = -999999;
    let bestEval = null;

    for (const target of targets) {
      if (usedTargets.has(target.id)) continue;

      const history = [];
      const src = target.section || target.bed;
      if (src.history) {
        for (let y = activeYear - 1; y >= activeYear - 4; y--) {
          if (src.history[y]?.cropId) {
            history.push({ year: y, cropId: src.history[y].cropId });
          }
        }
      }

      const ev = evaluateCropRotation(cropId, history);
      let s = ev.score;

      // Штрафы и бонусы
      if (ev.status === 'danger') s -= 2000;
      else if (ev.status === 'warning') s -= 60;
      else if (ev.status === 'optimal') s += 100;

      // Бонус за соответствие теплице / открытому грунту
      if (target.bed.type === 'greenhouse') {
        if (['tomato', 'cucumber', 'pepper', 'eggplant'].includes(cropId)) s += 80;
        if (['potato', 'pumpkin', 'zucchini', 'cabbage_white'].includes(cropId)) s -= 120;
      } else {
        if (['potato', 'carrot', 'beet', 'onion', 'garlic', 'cabbage_white', 'zucchini', 'pumpkin'].includes(cropId)) s += 30;
      }

      if (s > bestScore) {
        bestScore = s;
        bestTarget = target;
        bestEval = ev;
      }
    }

    if (bestTarget) {
      usedTargets.add(bestTarget.id);
      assignments.push({
        target: bestTarget,
        cropId,
        evaluation: bestEval,
        score: bestScore
      });
    }
  }

  return assignments;
}

if (typeof window !== 'undefined') {
  window.CROP_FAMILIES = CROP_FAMILIES;
  window.CROPS_DATABASE = CROPS_DATABASE;
  window.getCropById = getCropById;
  window.getFamilyById = getFamilyById;
  window.getCropName = getCropName;
  window.getFamilyName = getFamilyName;
  window.evaluateCropRotation = evaluateCropRotation;
  window.recommendCropsForBed = recommendCropsForBed;
  window.getCropSvg = getCropSvg;
  window.CROP_SVG_ICONS = CROP_SVG_ICONS;
  window.CROP_PLANTING_STANDARDS = CROP_PLANTING_STANDARDS;
  window.calculateCropCapacity = calculateCropCapacity;
  window.evaluateCompanionPlanting = evaluateCompanionPlanting;
  window.CROP_CALENDAR_TIMELINE = CROP_CALENDAR_TIMELINE;
  window.getSeasonalCalendarEvents = getSeasonalCalendarEvents;
  window.solveCropRotationAssignment = solveCropRotationAssignment;
}
