/**
 * База данных культур и агрономических правил севооборота
 * Содержит семейства растений, потребность в питании, совместимость и правила ротации
 */

/**
 * Векторные SVG-иконки высокого качества для всех культур.
 * Гарантируют красивое и четкое отображение без пустых квадратиков на любой версии Windows/браузера.
 */
const CROP_SVG_ICONS = {
  tomato: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="35" rx="11" ry="3" fill="#000" opacity="0.16"/><path d="M20 11 C11 11 6 17 7 25 C8 32 14 35 20 35 C26 35 32 32 33 25 C34 17 29 11 20 11 Z" fill="#e53935" stroke="#5c1614" stroke-width="2" stroke-linejoin="round"/><path d="M19 13 C12 13 9 18 10 24 C11 29 15 32 20 32 C24 32 28 30 29 25 C25 29 17 30 13 26 C10 23 11 16 19 13 Z" fill="#ff5252"/><ellipse cx="14.5" cy="18" rx="4" ry="2.2" transform="rotate(-28 14.5 18)" fill="#fff" opacity="0.65"/><circle cx="11.5" cy="22.5" r="1.3" fill="#fff" opacity="0.5"/><path d="M20 13 L14 8 L17.5 13.5 L11 13 L16.5 16 L14 19.5 L20 16 L26 19.5 L23.5 16 L29 13 L22.5 13.5 L26 8 Z" fill="#43a047" stroke="#1b4d1e" stroke-width="1.4" stroke-linejoin="round"/><path d="M20 12 C20 7.5 21.5 5 24 4" stroke="#1b4d1e" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M20 12 C20 7.5 21.5 5 24 4" stroke="#66bb6a" stroke-width="1.2" stroke-linecap="round" fill="none"/></svg>`,
  cucumber: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="35" rx="11" ry="2.8" fill="#000" opacity="0.16"/><path d="M9 30 C5 23 9 12 19 7 C26 4 33 8 33 15 C33 24 24 33 14 33 C11 33 10 32 9 30 Z" fill="#2e7d32" stroke="#143d17" stroke-width="2" stroke-linejoin="round"/><path d="M11 28 C8 22 11 13 19 9 C25 7 30 10 30 15 C30 22 22 30 14 30 C12 30 11.5 29 11 28 Z" fill="#4caf50"/><path d="M13 24 C12 18 15 13 21 10" stroke="#a5d6a7" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.75"/><circle cx="16" cy="25" r="1.4" fill="#1b5e20"/><circle cx="22" cy="21" r="1.4" fill="#1b5e20"/><circle cx="26" cy="15" r="1.4" fill="#1b5e20"/><circle cx="19" cy="15" r="1.2" fill="#c8e6c9"/><circle cx="23" cy="25" r="1.2" fill="#c8e6c9"/><path d="M30 8 C33 6 35 7 35 9 C35 11 32 11 31 9.5" stroke="#1b5e20" stroke-width="1.8" stroke-linecap="round" fill="none"/><circle cx="33" cy="8.5" r="2.2" fill="#fdd835" stroke="#b28704" stroke-width="1"/></svg>`,
  pepper: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="36" rx="10" ry="2.6" fill="#000" opacity="0.16"/><path d="M13 12 C8 12 7 18 8 25 C9 32 14 35 20 35 C26 35 31 32 32 25 C33 18 32 12 27 12 C24.5 12 22.5 13.5 20 13.5 C17.5 13.5 15.5 12 13 12 Z" fill="#e53935" stroke="#5c1414" stroke-width="2" stroke-linejoin="round"/><path d="M14 14 C11 15 10 19 11 25 C12 30 15 32 20 32 C24 32 27 29 28 24 C25 28 19 30 15 26 C12 23 12 17 14 14 Z" fill="#ff5252"/><path d="M20 14 L20 33" stroke="#b71c1c" stroke-width="1.4" opacity="0.45"/><ellipse cx="14" cy="19" rx="2.2" ry="4.5" transform="rotate(-12 14 19)" fill="#fff" opacity="0.6"/><path d="M16 12.5 L20 14.5 L24 12.5 L22 9.5 L18 9.5 Z" fill="#43a047" stroke="#1b4d1e" stroke-width="1.4" stroke-linejoin="round"/><path d="M20 10 C20 6 22 4 25 4" stroke="#1b4d1e" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M20 10 C20 6 22 4 25 4" stroke="#66bb6a" stroke-width="1.2" stroke-linecap="round" fill="none"/></svg>`,
  eggplant: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="36" rx="10" ry="2.6" fill="#000" opacity="0.16"/><path d="M16 12 C10 14 7 22 10 29 C13 35 22 36 27 32 C33 27 32 18 26 12 C23 9 19 9 16 12 Z" fill="#6a1b9a" stroke="#2c0945" stroke-width="2" stroke-linejoin="round"/><path d="M17 14 C13 16 11 22 13 27 C15 32 21 33 25 30 C28 27 29 20 25 15 C22 12 19 12 17 14 Z" fill="#8e24aa"/><ellipse cx="16" cy="20" rx="2.4" ry="5.5" transform="rotate(-24 16 20)" fill="#e1bee7" opacity="0.7"/><path d="M14 13 L18 15.5 L21 12.5 L25 16 L24 11.5 L20 10 L16 11 Z" fill="#43a047" stroke="#1b4d1e" stroke-width="1.4" stroke-linejoin="round"/><path d="M20 10 C20 6.5 21 4.5 23 3.5" stroke="#1b4d1e" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>`,
  potato: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="34" rx="12" ry="2.8" fill="#000" opacity="0.16"/><path d="M8 22 C6 14 13 8 22 8 C30 8 34 13 33 20 C32 28 26 33 18 33 C11 33 9 28 8 22 Z" fill="#c5945b" stroke="#5d3a1a" stroke-width="2" stroke-linejoin="round"/><path d="M10 21 C9 15 14 10 22 10 C28 10 31 14 30 19 C29 25 24 30 18 30 C13 30 11 26 10 21 Z" fill="#dba96c"/><ellipse cx="16" cy="14.5" rx="4.5" ry="2.2" transform="rotate(-15 16 14.5)" fill="#fff" opacity="0.45"/><circle cx="15" cy="21" r="1.4" fill="#6d4c41"/><circle cx="24" cy="16" r="1.5" fill="#6d4c41"/><circle cx="22" cy="25" r="1.4" fill="#6d4c41"/><circle cx="28" cy="22" r="1.2" fill="#6d4c41"/></svg>`,
  cabbage_white: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="35" rx="12" ry="3" fill="#000" opacity="0.16"/><circle cx="20" cy="20" r="15" fill="#43a047" stroke="#1b4d1e" stroke-width="2"/><path d="M7 18 C9 9 19 6 25 11 C22 16 13 19 7 18 Z" fill="#66bb6a" stroke="#1b4d1e" stroke-width="1.3"/><path d="M33 18 C31 9 21 6 15 11 C18 16 27 19 33 18 Z" fill="#81c784" stroke="#1b4d1e" stroke-width="1.3"/><circle cx="20" cy="21" r="9.5" fill="#a5d6a7" stroke="#2e7d32" stroke-width="1.5"/><path d="M20 14 C15.5 17 15.5 24 20 28 C24.5 24 24.5 17 20 14 Z" fill="#e8f5e9"/><ellipse cx="16" cy="16" rx="2.5" ry="1.4" transform="rotate(-30 16 16)" fill="#fff" opacity="0.7"/></svg>`,
  broccoli: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="36" rx="8" ry="2.4" fill="#000" opacity="0.16"/><path d="M16 23 L15 34 L25 34 L24 23 Z" fill="#81c784" stroke="#1b4d1e" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="18" r="6.5" fill="#2e7d32" stroke="#143d17" stroke-width="1.8"/><circle cx="28" cy="18" r="6.5" fill="#2e7d32" stroke="#143d17" stroke-width="1.8"/><circle cx="20" cy="12" r="7.5" fill="#43a047" stroke="#143d17" stroke-width="1.8"/><circle cx="20" cy="19" r="6.5" fill="#388e3c"/><circle cx="15" cy="15" r="4.5" fill="#66bb6a"/><circle cx="25" cy="15" r="4" fill="#66bb6a"/><circle cx="18" cy="10" r="2.2" fill="#a5d6a7" opacity="0.8"/></svg>`,
  radish: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="36" rx="8" ry="2.2" fill="#000" opacity="0.16"/><path d="M20 15 C19 9 14 5 9 5 C11 10 14 13 18 15 Z" fill="#43a047" stroke="#1b4d1e" stroke-width="1.5" stroke-linejoin="round"/><path d="M20 15 C21 8 26 5 31 5 C29 10 26 13 22 15 Z" fill="#66bb6a" stroke="#1b4d1e" stroke-width="1.5" stroke-linejoin="round"/><path d="M20 14 C12.5 14 10 20 12 26 C14 31 20 35 20 35 C20 35 26 31 28 26 C30 20 27.5 14 20 14 Z" fill="#e91e63" stroke="#6a0b31" stroke-width="2" stroke-linejoin="round"/><path d="M16 30 C18 33 20 35 20 35 C20 35 22 33 24 30 C22 31 18 31 16 30 Z" fill="#fce4ec"/><ellipse cx="16" cy="20" rx="2.4" ry="3.6" transform="rotate(-18 16 20)" fill="#fff" opacity="0.65"/></svg>`,
  carrot: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="18" cy="36" rx="8" ry="2.2" fill="#000" opacity="0.16"/><path d="M25 13 C27 7 30 4 36 4 C33 9 30 12 26 14 Z" fill="#43a047" stroke="#1b4d1e" stroke-width="1.5" stroke-linejoin="round"/><path d="M24 12 C23 6 22 3 19 3 C20 7 22 10 23 13 Z" fill="#66bb6a" stroke="#1b4d1e" stroke-width="1.5" stroke-linejoin="round"/><path d="M23 11 L29 17 L14 35 C12.5 36.5 10.5 35.5 10 34 C9.5 32.5 10.5 30.5 12 29 Z" fill="#fb8c00" stroke="#7c3300" stroke-width="2" stroke-linejoin="round"/><path d="M22 13 L26 17 L14 32 L12 30 Z" fill="#ffa726"/><path d="M17 25 L20 26.5 M19.5 20 L23 21.5 M22 15.5 L25 17" stroke="#c65102" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="21" cy="17" rx="1.6" ry="3.5" transform="rotate(38 21 17)" fill="#fff" opacity="0.55"/></svg>`,
  dill: `<svg viewBox="0 0 40 40" width="100%" height="100%"><circle cx="20" cy="20" r="16" fill="#e8f5e9" stroke="#2e7d32" stroke-width="1.8"/><path d="M10 33 C16 26 19 18 20 7" stroke="#1b5e20" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M15 25 C10 23 8 22 7 19 M15 25 C12 20 11 17 10 14" stroke="#43a047" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M18 18 C23 16 26 16 29 13 M18 18 C22 13 24 10 26 7" stroke="#43a047" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M19 11 C16 9 14 8 13 6 M19 11 C22 8 23 6 24 4" stroke="#66bb6a" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
  celery: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="36" rx="9" ry="2.2" fill="#000" opacity="0.15"/><path d="M13 34 L15 16 L19 34 Z" fill="#81c784" stroke="#1b4d1e" stroke-width="1.6" stroke-linejoin="round"/><path d="M18 34 L20 12 L23 34 Z" fill="#a5d6a7" stroke="#1b4d1e" stroke-width="1.6" stroke-linejoin="round"/><path d="M22 34 L25 16 L27 34 Z" fill="#66bb6a" stroke="#1b4d1e" stroke-width="1.6" stroke-linejoin="round"/><circle cx="15" cy="14" r="4.8" fill="#43a047" stroke="#1b4d1e" stroke-width="1.6"/><circle cx="20" cy="10" r="5.2" fill="#2e7d32" stroke="#1b4d1e" stroke-width="1.6"/><circle cx="25" cy="14" r="4.8" fill="#43a047" stroke="#1b4d1e" stroke-width="1.6"/></svg>`,
  onion: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="36" rx="10" ry="2.5" fill="#000" opacity="0.16"/><path d="M20 9 L20 4 M17.5 9.5 L15 4 M22.5 9.5 L25 4" stroke="#43a047" stroke-width="2.6" stroke-linecap="round"/><path d="M20 8 C13 14 9 19 9 25 C9 31 14 35 20 35 C26 35 31 31 31 25 C31 19 27 14 20 8 Z" fill="#f59e0b" stroke="#78350f" stroke-width="2" stroke-linejoin="round"/><path d="M20 10 C15 15 12 20 12 25 C12 30 15.5 33 20 33 C24.5 33 28 30 28 25 C28 20 25 15 20 10 Z" fill="#fbbf24"/><path d="M20 10 C17 16 17 26 20 33 M20 10 C23 16 23 26 20 33" stroke="#d97706" stroke-width="1.2" fill="none" opacity="0.65"/><ellipse cx="15" cy="22" rx="2" ry="4" transform="rotate(-15 15 22)" fill="#fff" opacity="0.6"/></svg>`,
  garlic: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="35" rx="10" ry="2.5" fill="#000" opacity="0.16"/><path d="M20 9 L20 4" stroke="#795548" stroke-width="3" stroke-linecap="round"/><path d="M20 8 C15 13 10 18 10 24 C10 31 14.5 34 20 34 C25.5 34 30 31 30 24 C30 18 25 13 20 8 Z" fill="#faf5ff" stroke="#5d4037" stroke-width="2" stroke-linejoin="round"/><path d="M20 9 C17 15 16 22 17 33 M20 9 C23 15 24 22 23 33" stroke="#d7ccc8" stroke-width="1.6" fill="none"/><ellipse cx="15" cy="23" rx="1.8" ry="3.5" transform="rotate(-14 15 23)" fill="#fff" opacity="0.9"/></svg>`,
  zucchini: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="35" rx="11" ry="2.5" fill="#000" opacity="0.16"/><path d="M8 29 C6 22 10 12 20 8 C28 5 33 8 33 14 C33 22 25 31 15 32 C10 32 9 31 8 29 Z" fill="#388e3c" stroke="#143d17" stroke-width="2" stroke-linejoin="round"/><path d="M10 27 C9 21 13 14 20 10 C26 7 30 10 30 14 C30 20 24 28 16 29 C12 29 11 28 10 27 Z" fill="#66bb6a"/><path d="M13 25 C17 19 22 14 28 12" stroke="#c8e6c9" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.75"/><path d="M7 30 L4 33" stroke="#1b4d1e" stroke-width="3" stroke-linecap="round"/></svg>`,
  pumpkin: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="35" rx="13" ry="2.8" fill="#000" opacity="0.18"/><path d="M20 12 C20 7 23 4.5 26 4" stroke="#1b4d1e" stroke-width="3.4" stroke-linecap="round" fill="none"/><path d="M20 12 C20 7 23 4.5 26 4" stroke="#66bb6a" stroke-width="1.4" stroke-linecap="round" fill="none"/><ellipse cx="20" cy="23" rx="15" ry="11.5" fill="#e65100" stroke="#6b2400" stroke-width="2"/><ellipse cx="20" cy="23" rx="10" ry="11.5" fill="#f57c00" stroke="#8a3000" stroke-width="1.4"/><ellipse cx="20" cy="23" rx="5.2" ry="11.5" fill="#ffa726" stroke="#8a3000" stroke-width="1.2"/><ellipse cx="14" cy="18" rx="2.4" ry="4" transform="rotate(-18 14 18)" fill="#fff" opacity="0.45"/></svg>`,
  peas: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="35" rx="10" ry="2.4" fill="#000" opacity="0.16"/><path d="M7 30 C6 18 15 9 30 7 C32 16 27 28 12 31 C9 32 8 31 7 30 Z" fill="#43a047" stroke="#143d17" stroke-width="2" stroke-linejoin="round"/><circle cx="13.5" cy="24" r="3.4" fill="#a5d6a7" stroke="#1b5e20" stroke-width="1.3"/><circle cx="19.5" cy="18.5" r="3.4" fill="#a5d6a7" stroke="#1b5e20" stroke-width="1.3"/><circle cx="25.5" cy="13" r="3.4" fill="#a5d6a7" stroke="#1b5e20" stroke-width="1.3"/><circle cx="12.5" cy="23" r="1" fill="#fff" opacity="0.8"/><circle cx="18.5" cy="17.5" r="1" fill="#fff" opacity="0.8"/><circle cx="24.5" cy="12" r="1" fill="#fff" opacity="0.8"/></svg>`,
  beans: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="35" rx="9" ry="2.4" fill="#000" opacity="0.16"/><path d="M13 31 C7 27 7 18 13 12 C20 7 28 9 29 16 C30 22 24 27 20 27 C17 27 16 33 13 31 Z" fill="#b45309" stroke="#572404" stroke-width="2" stroke-linejoin="round"/><path d="M14 28 C10 25 10 18 14 14 C19 10 25 11 26 16 C27 21 22 24 19 24 C16 24 16 29 14 28 Z" fill="#d97706"/><ellipse cx="18" cy="16.5" rx="2.5" ry="3.8" transform="rotate(-22 18 16.5)" fill="#fff" opacity="0.55"/></svg>`,
  beet: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="36" rx="8" ry="2.2" fill="#000" opacity="0.16"/><path d="M20 14 C18 8 14 5 9 4 C11 9 14 12 18 14 Z" fill="#2e7d32" stroke="#143d17" stroke-width="1.5" stroke-linejoin="round"/><path d="M20 14 C20 7 23 4 27 4 C26 9 23 12 21 14 Z" fill="#43a047" stroke="#143d17" stroke-width="1.5" stroke-linejoin="round"/><path d="M20 13 C12 13 9 19 11 26 C13 31 20 36 20 36 C20 36 27 31 29 26 C31 19 28 13 20 13 Z" fill="#ad1457" stroke="#4a0725" stroke-width="2" stroke-linejoin="round"/><ellipse cx="16" cy="20" rx="2.2" ry="3.6" transform="rotate(-20 16 20)" fill="#f48fb1" opacity="0.7"/></svg>`,
  strawberry: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="36" rx="8" ry="2.4" fill="#000" opacity="0.16"/><path d="M20 12 C12 12 8.5 18 10 25 C12 31 20 36 20 36 C20 36 28 31 30 25 C31.5 18 28 12 20 12 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="2" stroke-linejoin="round"/><ellipse cx="15" cy="19" rx="2.2" ry="3.8" transform="rotate(-18 15 19)" fill="#fff" opacity="0.5"/><circle cx="15" cy="20" r="1" fill="#fef08a"/><circle cx="20" cy="19" r="1" fill="#fef08a"/><circle cx="25" cy="20" r="1" fill="#fef08a"/><circle cx="17" cy="25" r="1" fill="#fef08a"/><circle cx="23" cy="25" r="1" fill="#fef08a"/><circle cx="20" cy="30" r="1" fill="#fef08a"/><path d="M20 13 L13 9 L16 14 L11 13.5 L16 16 L20 14 L24 16 L29 13.5 L24 14 L27 9 Z" fill="#43a047" stroke="#1b4d1e" stroke-width="1.4" stroke-linejoin="round"/><path d="M20 11 C20 7.5 21 5.5 23 4.5" stroke="#1b4d1e" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>`,
  lettuce: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="35" rx="12" ry="2.8" fill="#000" opacity="0.16"/><circle cx="20" cy="20" r="15" fill="#43a047" stroke="#1b4d1e" stroke-width="2"/><circle cx="20" cy="20" r="11.5" fill="#66bb6a" stroke="#2e7d32" stroke-width="1.3"/><circle cx="20" cy="20" r="7.5" fill="#a5d6a7"/><path d="M10 20 C13 15 18 14 20 20 C22 14 27 15 30 20" stroke="#e8f5e9" stroke-width="2.2" stroke-linecap="round" fill="none"/></svg>`,
  green_manure_phacelia: `<svg viewBox="0 0 40 40" width="100%" height="100%"><circle cx="20" cy="20" r="14" fill="#d8b4fe" stroke="#581c87" stroke-width="2"/><circle cx="20" cy="20" r="9.5" fill="#a855f7"/><circle cx="20" cy="20" r="4.5" fill="#facc15" stroke="#854d0e" stroke-width="1.2"/><path d="M20 6 L20 11 M20 29 L20 34 M6 20 L11 20 M29 20 L34 20" stroke="#7e22ce" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  green_manure_mustard: `<svg viewBox="0 0 40 40" width="100%" height="100%"><circle cx="20" cy="20" r="14" fill="#fef08a" stroke="#854d0e" stroke-width="2"/><circle cx="20" cy="20" r="9.5" fill="#facc15"/><circle cx="20" cy="20" r="4.5" fill="#f59e0b" stroke="#78350f" stroke-width="1.2"/><path d="M20 6 L20 11 M20 29 L20 34 M6 20 L11 20 M29 20 L34 20" stroke="#ca8a04" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  fallow: `<svg viewBox="0 0 40 40" width="100%" height="100%"><ellipse cx="20" cy="28" rx="15" ry="7.5" fill="#795548" stroke="#3e2723" stroke-width="2"/><ellipse cx="20" cy="26" rx="12" ry="5" fill="#8d6e63"/><path d="M20 24 C20 16 16 12 12 10 C15 14 18 19 20 24 Z" fill="#43a047" stroke="#1b4d1e" stroke-width="1.4" stroke-linejoin="round"/><path d="M20 24 C20 15 24 11 28 9 C25 13 22 18 20 24 Z" fill="#66bb6a" stroke="#1b4d1e" stroke-width="1.4" stroke-linejoin="round"/></svg>`
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
    popularVarieties: ['Бычье сердце', 'Де Барао', 'Черри', 'Хурма', 'Розовый гигант', 'Кёнигсберг', 'Санька', 'Пузата хата', 'Яблонька России', 'Черный принц'],
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
    popularVarieties: ['Кураж F1', 'Герман F1', 'Зозуля F1', 'Родничок F1', 'Маша F1', 'Парижский корнишон', 'Артист F1', 'Конни F1', 'Китайский змей'],
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
    popularVarieties: ['Калифорнийское чудо', 'Богатырь', 'Ласточка', 'Винни-Пух', 'Клаудио F1', 'Атлант', 'Оранжевый бык', 'Халапеньо', 'Белозерка'],
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
    popularVarieties: ['Алмаз', 'Черный красавец', 'Эпик F1', 'Клоринда F1', 'Король севера', 'Бибо F1'],
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
    popularVarieties: ['Нантская 4', 'Шантане 2461', 'Витаминная 6', 'Самсон', 'Каротель', 'Королева осени', 'Абако F1'],
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
    popularVarieties: ['Альба', 'Клери', 'Азия', 'Корона', 'Хоней', 'Мальвина', 'Елизавета II', 'Мурано', 'Фестивальная'],
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

const VARIETY_COLORS = [
  '#059669', '#d97706', '#2563eb', '#7c3aed',
  '#dc2626', '#0891b2', '#ea580c', '#4f46e5',
  '#0d9488', '#b45309', '#1d4ed8', '#be185d'
];

function getVarietyColor(name) {
  if (!name) return '#6b7280';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % VARIETY_COLORS.length;
  return VARIETY_COLORS[idx];
}
if (typeof window !== 'undefined') {
  window.VARIETY_COLORS = VARIETY_COLORS;
  window.getVarietyColor = getVarietyColor;
}

/**
 * Умная сводка посадки по лункам:
 * группирует лунки по сортам/культурам, формирует понятные диапазоны (напр. "№1–5 (5 шт)")
 */
function summarizeHolePlantings(holes = [], defaultCrop = null, lang = 'ru', pattern = 'zigzag') {
  if (!Array.isArray(holes) || holes.length === 0) return null;

  // Нормализуем схему посадки: 'zigzag', 'double_parallel', 'single'
  let effPattern = pattern || 'zigzag';
  if (effPattern === 'double') effPattern = 'double_parallel';

  // Привязываем оригинальный 1-based номер лунки на случай, если h.index не был проставлен
  const indexedHoles = holes.map((h, i) => {
    if (!h) return null;
    return {
      ...h,
      index: (typeof h.index === 'number' && h.index > 0) ? h.index : (i + 1)
    };
  }).filter(Boolean);

  // Ищем лунки, где явно указан сорт
  const holesWithVariety = indexedHoles.filter(h => h.variety && h.variety.trim());

  // Если сорта указаны хотя бы для одной лунки, группируем только лунки с сортами!
  // Пустые нераспределенные лунки НЕ должны превращаться в псевдо-сорт "Томат 25 шт".
  let targetHoles = holesWithVariety;
  if (holesWithVariety.length === 0) {
    const holesWithCrop = indexedHoles.filter(h => h.cropId);
    if (holesWithCrop.length === 0) return null;
    targetHoles = holesWithCrop;
  }

  const groups = new Map();
  targetHoles.forEach((h) => {
    if (!h) return;
    const vName = (h.variety || '').trim();
    const cId = h.cropId || defaultCrop?.id || null;
    const key = vName ? `var:::${vName.toLowerCase()}` : `crop:::${cId || 'default'}`;

    if (!groups.has(key)) {
      const cropObj = cId ? getCropById(cId) : defaultCrop;
      groups.set(key, {
        cropId: cId,
        crop: cropObj,
        variety: vName,
        holeIndices: [],
        count: 0
      });
    }
    const g = groups.get(key);
    g.holeIndices.push(h.index);
    g.count++;
  });

  const formatRanges = (indices) => {
    if (!indices || indices.length === 0) return '';
    if (indices.length === 1) return `№${indices[0]}`;
    const sorted = [...indices].sort((a, b) => a - b);
    const ranges = [];
    let start = sorted[0];
    let prev = start;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === prev + 1) {
        prev = sorted[i];
      } else {
        ranges.push(start === prev ? `№${start}` : `№${start}–${prev}`);
        start = sorted[i];
        prev = start;
      }
    }
    ranges.push(start === prev ? `№${start}` : `№${start}–${prev}`);
    return ranges.join(', ');
  };

  const varieties = [];
  groups.forEach(g => {
    const rawCropName = g.crop ? (typeof getCropName === 'function' ? getCropName(g.crop, lang) : g.crop.name) : '';
    const cleanCrop = rawCropName.replace(/\s*\(.*?\)/g, '').trim() || 'Посадка';
    const varTitle = g.variety || cleanCrop;
    varieties.push({
      cropId: g.cropId,
      crop: g.crop,
      cropEmoji: g.crop?.emoji || '🌱',
      variety: varTitle,
      count: g.count,
      rangeText: formatRanges(g.holeIndices),
      indices: g.holeIndices,
      color: (typeof getVarietyColor === 'function' ? getVarietyColor(g.variety || g.cropId) : '#059669')
    });
  });

  const totalPlanted = targetHoles.length;
  const plantedIndicesSet = new Set(targetHoles.map(h => h.index));
  const emptyIndices = indexedHoles.filter(h => !plantedIndicesSet.has(h.index)).map(h => h.index);
  const emptyRangeText = formatRanges(emptyIndices);

  const holeMap = indexedHoles.map(h => {
    const hasVar = Boolean(h.variety && h.variety.trim());
    const vName = (h.variety || '').trim();
    const cId = h.cropId || defaultCrop?.id || null;
    const cropObj = cId ? getCropById(cId) : defaultCrop;
    const isPlanted = hasVar || (!holesWithVariety.length && Boolean(h.cropId));
    let color = '#cbd5e1';
    if (hasVar) {
      color = (typeof getVarietyColor === 'function' ? getVarietyColor(vName) : '#10b981');
    } else if (isPlanted && cropObj) {
      color = cropObj.color || '#10b981';
    }
    return {
      index: h.index,
      variety: vName,
      cropId: cId,
      isPlanted,
      color
    };
  });

  const patternIcon = effPattern === 'double_parallel' ? '═' : (effPattern === 'single' ? '─' : '⚡');
  const patternName = effPattern === 'double_parallel'
    ? 'В 2 ряда (ровно)'
    : (effPattern === 'single' ? 'В 1 ряд' : 'В 2 ряда (шахматка)');

  const row1Holes = [];
  const row2Holes = [];
  if (effPattern === 'single') {
    row1Holes.push(...holeMap);
  } else {
    holeMap.forEach((h, idx) => {
      if (idx % 2 === 0) row1Holes.push(h);
      else row2Holes.push(h);
    });
  }

  return {
    totalHoles: holes.length,
    plantedCount: totalPlanted,
    emptyCount: holes.length - totalPlanted,
    emptyRangeText,
    pattern: effPattern,
    patternIcon,
    patternName,
    varieties,
    holes: holeMap,
    row1Holes,
    row2Holes
  };
}

if (typeof window !== 'undefined') {
  window.summarizeHolePlantings = summarizeHolePlantings;
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
function solveCropRotationAssignment(beds, requestedCropIds = [], activeYear = 2026, options = {}) {
  const onlyEmpty = Boolean(options.onlyEmpty);
  const targets = [];
  const prevTemplatesByCrop = new Map();
  const prevYear = activeYear - 1;

  const extractEffectiveCropId = (plantingObj) => {
    if (!plantingObj) return null;
    if (plantingObj.cropId) return plantingObj.cropId;
    if (Array.isArray(plantingObj.holes)) {
      const hWithCrop = plantingObj.holes.find(h => h && h.cropId);
      if (hWithCrop) return hWithCrop.cropId;
    }
    return null;
  };

  beds.forEach(bed => {
    const bName = (typeof window !== 'undefined' && window.i18n && window.i18n.getBedName) ? window.i18n.getBedName(bed) : bed.name;
    if (bed.sections && bed.sections.length > 0) {
      bed.sections.forEach(sec => {
        const prevPlanting = sec.history?.[prevYear];
        const prevCid = extractEffectiveCropId(prevPlanting);
        if (prevCid && prevCid !== 'fallow') {
          if (!prevTemplatesByCrop.has(prevCid)) prevTemplatesByCrop.set(prevCid, []);
          prevTemplatesByCrop.get(prevCid).push({
            variety: prevPlanting?.variety || '',
            holes: Array.isArray(prevPlanting?.holes) ? JSON.parse(JSON.stringify(prevPlanting.holes)) : null,
            holePattern: prevPlanting?.holePattern || prevPlanting?.plantingPattern || 'zigzag'
          });
        }

        const currPlanting = sec.history?.[activeYear];
        const currCid = extractEffectiveCropId(currPlanting);
        if (onlyEmpty && currCid && currCid !== 'fallow') return;

        const secName = (typeof window !== 'undefined' && window.i18n && window.i18n.getSectionName) ? window.i18n.getSectionName(sec.name) : sec.name;
        targets.push({ bed, section: sec, id: `${bed.id}:${sec.id}`, name: `${bName} (${secName})` });
      });
    } else {
      const prevPlanting = bed.history?.[prevYear];
      const prevCid = extractEffectiveCropId(prevPlanting);
      if (prevCid && prevCid !== 'fallow') {
        if (!prevTemplatesByCrop.has(prevCid)) prevTemplatesByCrop.set(prevCid, []);
        prevTemplatesByCrop.get(prevCid).push({
          variety: prevPlanting?.variety || '',
          holes: Array.isArray(prevPlanting?.holes) ? JSON.parse(JSON.stringify(prevPlanting.holes)) : null,
          holePattern: prevPlanting?.holePattern || prevPlanting?.plantingPattern || 'zigzag'
        });
      }

      const currPlanting = bed.history?.[activeYear];
      const currCid = extractEffectiveCropId(currPlanting);
      if (onlyEmpty && currCid && currCid !== 'fallow') return;

      targets.push({ bed, section: null, id: bed.id, name: bName });
    }
  });

  if (targets.length === 0 || requestedCropIds.length === 0) {
    return [];
  }

  // Сортируем культуры: сначала более требовательные к севообороту и тепличные
  const greenhousePriority = new Set(['tomato', 'cucumber', 'pepper', 'eggplant']);
  const sortedCrops = [...requestedCropIds].sort((a, b) => {
    const ghA = greenhousePriority.has(a) ? 1 : 0;
    const ghB = greenhousePriority.has(b) ? 1 : 0;
    if (ghA !== ghB) return ghB - ghA;
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
          const histCid = extractEffectiveCropId(src.history[y]);
          if (histCid) {
            history.push({ year: y, cropId: histCid });
          }
        }
      }

      const ev = evaluateCropRotation(cropId, history);
      let s = ev.score;

      // Штрафы и бонусы севооборота
      if (ev.status === 'danger') s -= 2000;
      else if (ev.status === 'warning') s -= 60;
      else if (ev.status === 'optimal') s += 100;

      // Бонус за соответствие теплице / открытому грунту и ягоднику
      if (target.bed.type === 'greenhouse') {
        if (['tomato', 'cucumber', 'pepper', 'eggplant'].includes(cropId)) s += 95;
        if (['potato', 'pumpkin', 'zucchini', 'cabbage_white'].includes(cropId)) s -= 150;
      } else if (target.bed.type === 'berry') {
        if (cropId === 'strawberry') s += 150;
      } else {
        if (['potato', 'carrot', 'beet', 'onion', 'garlic', 'cabbage_white', 'zucchini', 'pumpkin'].includes(cropId)) s += 30;
      }

      // Учёт соседства внутри одной теплицы / разделённой грядки
      if (target.section && target.bed.sections) {
        const sameBedAssignedCrops = assignments
          .filter(a => a.target.bed.id === target.bed.id)
          .map(a => a.cropId);
        if (sameBedAssignedCrops.length > 0 && typeof evaluateCompanionPlanting === 'function') {
          const comp = evaluateCompanionPlanting(cropId, sameBedAssignedCrops);
          if (comp.status === 'good') s += 35;
          else if (comp.status === 'bad') s -= 45;
        }
      }

      if (s > bestScore) {
        bestScore = s;
        bestTarget = target;
        bestEval = ev;
      }
    }

    if (bestTarget) {
      usedTargets.add(bestTarget.id);
      const templates = prevTemplatesByCrop.get(cropId);
      const template = (templates && templates.length > 0) ? templates.shift() : null;
      assignments.push({
        target: bestTarget,
        cropId,
        evaluation: bestEval,
        score: bestScore,
        template
      });
    }
  }

  return assignments;
}

/**
 * ==========================================================================
 * Нормативы водопотребления и калькулятор полива огорода
 * ==========================================================================
 */
const CROP_WATER_NORMS = {
  cucumber: {
    weeklyLitersM2: 24,
    frequencyDays: 'каждые 2 дня',
    temperature: 'теплая отстоянная (+22..25°C)',
    method: 'под корень или капельно, избегая увлажнения стебля у шейки',
    tipsRu: 'Поверхностная корневая система. Не допускать пересыхания, иначе огурцы горчат.'
  },
  cabbage_white: {
    weeklyLitersM2: 26,
    frequencyDays: '2 раза в неделю',
    temperature: 'прохладная (+18..20°C)',
    method: 'обильный полив в лунки / дождевание до завязывания кочана',
    tipsRu: 'Гигантский вынос влаги широкими листьями. Пик полива — во время налива кочана.'
  },
  broccoli: {
    weeklyLitersM2: 22,
    frequencyDays: 'каждые 2-3 дня',
    temperature: 'умеренная (+18..22°C)',
    method: 'под корень и мелкодисперсное дождевание в жару',
    tipsRu: 'Любит влажный воздух вокруг головки, при засухе преждевременно уходит в цветушность.'
  },
  zucchini: {
    weeklyLitersM2: 20,
    frequencyDays: 'раз в 3-4 дня',
    temperature: 'теплая (+20..22°C)',
    method: 'строго под корень широким кольцом, не мочить листья и цветки',
    tipsRu: 'При поливе холодной водой загнивают молодые завязи.'
  },
  pumpkin: {
    weeklyLitersM2: 18,
    frequencyDays: 'раз в неделю',
    temperature: 'теплая (+20..22°C)',
    method: 'глубокий обильный пролив всей прикорневой зоны',
    tipsRu: 'Глубокие корни. За 3-4 недели до сбора полив полностью прекращают для сахаристости.'
  },
  pepper: {
    weeklyLitersM2: 16,
    frequencyDays: 'каждые 2-3 дня',
    temperature: 'теплая (+22..24°C)',
    method: 'под корень в утренние часы',
    tipsRu: 'При дефиците влаги осыпаются цветки и формируются мелкие тонкостенные плоды.'
  },
  eggplant: {
    weeklyLitersM2: 18,
    frequencyDays: 'каждые 2-3 дня',
    temperature: 'теплая (+22..24°C)',
    method: 'под корень под мульчу',
    tipsRu: 'Очень требовательны к теплу и равномерной влажности без застоя воды у корней.'
  },
  tomato: {
    weeklyLitersM2: 15,
    frequencyDays: '1-2 раза в неделю',
    temperature: 'теплая (+20..22°C)',
    method: 'строго под корень, мульчирование, сухой воздух в теплице',
    tipsRu: 'Никакого дождевания по листьям — это главная защита от фитофторы!'
  },
  strawberry: {
    weeklyLitersM2: 14,
    frequencyDays: '2 раза в неделю',
    temperature: 'умеренная (+18..20°C)',
    method: 'под корень или по бороздам между кустами',
    tipsRu: 'Критически важен полив во время цветения и налива ягод, а также после сбора урожая.'
  },
  carrot: {
    weeklyLitersM2: 12,
    frequencyDays: 'раз в 4-5 дней',
    temperature: 'обычная отстоянная',
    method: 'глубокое равномерное промачивание на глубину 20-30 см',
    tipsRu: 'При неравномерном поливе (засуха, потом резкий залив) корнеплоды трескаются.'
  },
  beet: {
    weeklyLitersM2: 12,
    frequencyDays: 'раз в 5 дней',
    temperature: 'обычная',
    method: 'под корень по междурядьям',
    tipsRu: 'За 3 недели до выкопки полив прекращают для лучшей лежкости зимой.'
  },
  radish: {
    weeklyLitersM2: 14,
    frequencyDays: 'через день малыми дозами',
    temperature: 'прохладная',
    method: 'мелкое дождевание из лейки с ситечком',
    tipsRu: 'При малейшем пересыхании грунта редис грубеет, горчит и стрелкуется.'
  },
  onion: {
    weeklyLitersM2: 9,
    frequencyDays: 'раз в 5-6 дней',
    temperature: 'умеренная',
    method: 'по междурядьям, не мочить само перо',
    tipsRu: 'Полив нужен только в мае-июне при росте пера. В июле полив полностью останавливают!'
  },
  garlic: {
    weeklyLitersM2: 9,
    frequencyDays: 'раз в неделю',
    temperature: 'умеренная',
    method: 'в бороздки между рядами',
    tipsRu: 'За 3 недели до уборки (в июле) полив прекращают, чтобы чешуи высохли.'
  },
  dill: {
    weeklyLitersM2: 12,
    frequencyDays: '2 раза в неделю',
    temperature: 'обычная',
    method: 'дождевание',
    tipsRu: 'Частый легкий полив дает сочную нежную зелень без жестких волокон.'
  },
  lettuce: {
    weeklyLitersM2: 13,
    frequencyDays: 'каждые 2 дня',
    temperature: 'прохладная утренняя',
    method: 'под корень, стараясь не пачкать розетки землей',
    tipsRu: 'Листья на 95% состоят из воды, регулярный полив сохраняет нежность и сладость.'
  },
  celery: {
    weeklyLitersM2: 16,
    frequencyDays: '2 раза в неделю',
    temperature: 'умеренная',
    method: 'обильно под корень',
    tipsRu: 'Влаголюбивая культура, почва должна быть умеренно влажной весь сезон.'
  },
  peas: {
    weeklyLitersM2: 10,
    frequencyDays: 'раз в 5 дней',
    temperature: 'обычная',
    method: 'под корень вдоль шпалеры',
    tipsRu: 'Особенно важен полив во время массового цветения и налива стручков.'
  },
  beans: {
    weeklyLitersM2: 11,
    frequencyDays: 'раз в 4-5 дней',
    temperature: 'теплая (+20°C)',
    method: 'под корень',
    tipsRu: 'До цветения поливают умеренно, с появлением бутонов полив удваивают.'
  },
  potato: {
    weeklyLitersM2: 12,
    frequencyDays: 'раз в неделю',
    temperature: 'обычная',
    method: 'в борозды между гребнями',
    tipsRu: 'Критическая фаза полива — бутонизация и цветение (завязывание клубней).'
  },
  green_manure_phacelia: {
    weeklyLitersM2: 8,
    frequencyDays: 'при засухе раз в неделю',
    temperature: 'любая',
    method: 'дождевание',
    tipsRu: 'Засухоустойчива, полив нужен только для дружных всходов.'
  },
  green_manure_mustard: {
    weeklyLitersM2: 8,
    frequencyDays: 'при засухе раз в неделю',
    temperature: 'любая',
    method: 'дождевание',
    tipsRu: 'Быстро наращивает зеленую массу, неприхотлива к поливу.'
  },
  fallow: {
    weeklyLitersM2: 0,
    frequencyDays: 'не требуется',
    temperature: '—',
    method: 'отдых почвы под слоем мульчи',
    tipsRu: 'Слой мульчи сохраняет естественную влагу в почве.'
  }
};

/**
 * Расчет нормы полива для отдельной грядки
 */
function calculateBedWaterNorm(cropId, areaM2 = 4, isGreenhouse = false, weather = 'normal') {
  if (!cropId) {
    return {
      weeklyLiters: 0,
      weeklyBuckets10L: '0.0',
      singleWateringLiters: 0,
      frequencyDays: 'не требуется',
      temperature: '—',
      method: 'грядка пустует',
      tipsRu: 'Культура не высажена, полив не требуется.',
      baseLitersM2: 0
    };
  }

  const norm = CROP_WATER_NORMS[cropId] || {
    weeklyLitersM2: 14,
    frequencyDays: '2 раза в неделю',
    temperature: 'теплая отстоянная',
    method: 'под корень',
    tipsRu: 'Регулярный умеренный полив теплой водой утром или вечером.'
  };

  const weatherCoeffs = {
    hot: 1.45,
    normal: 1.0,
    rainy: isGreenhouse ? 0.9 : 0.25
  };
  const coeff = weatherCoeffs[weather] || 1.0;

  const weeklyLiters = Math.round(norm.weeklyLitersM2 * areaM2 * coeff);
  const buckets10L = (weeklyLiters / 10).toFixed(1);
  const singleWateringLiters = Math.round(weeklyLiters / (norm.frequencyDays.includes('2') ? 2 : (norm.frequencyDays.includes('3') ? 3 : 1)));

  return {
    weeklyLiters,
    weeklyBuckets10L: buckets10L,
    singleWateringLiters,
    frequencyDays: norm.frequencyDays,
    temperature: norm.temperature,
    method: norm.method,
    tipsRu: norm.tipsRu,
    baseLitersM2: norm.weeklyLitersM2
  };
}

/**
 * Сводный расчет полива для всего огорода
 */
function calculateTotalGardenWater(beds = [], activeYear = 2026, weather = 'normal') {
  let totalLiters = 0;
  let greenhouseLiters = 0;
  let groundLiters = 0;
  const breakdown = [];

  beds.forEach(bed => {
    const isGh = bed.type === 'greenhouse';
    const hasSections = Boolean(bed.sections && bed.sections.length > 0);
    const secCount = hasSections ? bed.sections.length : 1;
    const bedArea = (bed.width || 4) * (bed.height || 1.2);

    if (hasSections) {
      const secArea = bedArea / secCount;
      bed.sections.forEach((sec, idx) => {
        const cropId = sec.history?.[activeYear]?.cropId || null;
        const norm = calculateBedWaterNorm(cropId, secArea, isGh, weather);
        totalLiters += norm.weeklyLiters;
        if (isGh) greenhouseLiters += norm.weeklyLiters;
        else groundLiters += norm.weeklyLiters;

        breakdown.push({
          bedId: bed.id,
          bedName: `${bed.name} — ${sec.name || `Рядок ${idx + 1}`}`,
          cropId,
          areaM2: secArea,
          weeklyLiters: norm.weeklyLiters,
          isGreenhouse: isGh
        });
      });
    } else {
      const cropId = bed.history?.[activeYear]?.cropId || null;
      const norm = calculateBedWaterNorm(cropId, bedArea, isGh, weather);
      totalLiters += norm.weeklyLiters;
      if (isGh) greenhouseLiters += norm.weeklyLiters;
      else groundLiters += norm.weeklyLiters;

      breakdown.push({
        bedId: bed.id,
        bedName: bed.name,
        cropId,
        areaM2: bedArea,
        weeklyLiters: norm.weeklyLiters,
        isGreenhouse: isGh
      });
    }
  });

  return {
    totalLiters,
    totalBuckets10L: (totalLiters / 10).toFixed(1),
    totalBarrels200L: (totalLiters / 200).toFixed(1),
    greenhouseLiters,
    groundLiters,
    breakdown
  };
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
  window.CROP_WATER_NORMS = CROP_WATER_NORMS;
  window.calculateBedWaterNorm = calculateBedWaterNorm;
  window.calculateTotalGardenWater = calculateTotalGardenWater;
}
