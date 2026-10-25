/**
 * Модуль интернационализации (i18n) для приложения "Мой Огород"
 * Поддерживаемые языки:
 *  - ru: Русский (по умолчанию)
 *  - et: Eesti keel (Эстонский)
 *  - lv: Latviešu valoda (Латышский)
 *  - lt: Lietuvių kalba (Литовский)
 */

const SUPPORTED_LANGUAGES = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺', short: 'RU' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪', short: 'ET' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻', short: 'LV' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹', short: 'LT' }
];

const I18N_STORAGE_KEY = 'garden_app_language_v1';

const UI_TRANSLATIONS = {
  // === Русский (RU) ===
  ru: {
    app_title: "Мой Огород",
    app_subtitle: "Планировщик посадок & Севооборот",
    
    // Header
    season_label: "📅 Сезон:",
    btn_add_season: "➕ Сезон",
    btn_add_bed: "➕ Новая грядка",
    btn_clear_plan: "🧹 Очистить план",
    btn_demo: "🔄 Демо-пример",
    btn_db: "💾 База данных",
    btn_backup: "Резервная копия",
    btn_help: "❓ Инструкция",
    btn_help_title: "Руководство пользователя и подсказки",
    btn_donate: "☕ Поддержать автора",
    btn_donate_title: "Поблагодарить автора за программу",
    btn_feedback: "💡 Идеи и отзывы",
    btn_feedback_title: "Предложить улучшение, культуру или сообщить об ошибке",
    btn_pwa_install: "📲 Установить",
    btn_pwa_install_title: "Установить «Умный Огород» как приложение на компьютер или телефон",
    theme_dark: "🌙 Тёмная тема",
    theme_light: "☀️ Светлая тема",

    // Donate Modal
    donate_modal_title: "☕ Поддержка автора проекта",
    donate_modal_subtitle: "«Умный Огород» — бесплатная программа для всех садоводов. Любая поддержка помогает развивать проект!",
    donate_baltic_title: "🇪🇪 🇱🇻 🇱🇹 🇪🇺 Для стран Балтии и Европы (EUR)",
    donate_baltic_desc: "Прямой банковский перевод SEPA без комиссии:",
    donate_recipient_label: "Получатель:",
    donate_iban_label: "Номер счёта (IBAN):",
    donate_bank_label: "Банк:",
    donate_purpose_label: "Назначение платежа:",
    donate_btn_copy: "📋 Скопировать IBAN",
    donate_copied_toast: "✓ Номер счёта (IBAN) скопирован в буфер обмена!",
    donate_sepa_note: "Мгновенные переводы SEPA без комиссии из любых банков Эстонии, Латвии, Литвы и всей Европы (Swedbank, SEB, LHV, Luminor, Revolut и др.).",
    donate_rub_title: "🇷🇺 Для жителей России и других стран (RUB)",
    donate_rub_desc: "Добровольная поддержка через сервис Boosty (любые карты МИР, СБП, Сбербанк, Т-Банк):",
    donate_btn_boosty: "☕ Поддержать на Boosty",
    donate_btn_copy_link: "📋 Скопировать ссылку",
    donate_link_copied_toast: "✓ Ссылка на Boosty скопирована в буфер обмена!",

    // Feedback & Suggestions Modal
    feedback_modal_title: "💡 Обратная связь, идеи и предложения",
    feedback_modal_subtitle: "Автор лично читает все сообщения и добавляет полезные пожелания в обновления программы.",
    feedback_type_label: "О чём ваше обращение?",
    feedback_type_idea: "💡 Идея по новым функциям",
    feedback_type_crop: "🌱 Добавить культуру, сорт или правило",
    feedback_type_bug: "🐛 Ошибка или неточность",
    feedback_type_praise: "💬 Отзыв, вопрос или благодарность",
    feedback_msg_label: "Текст вашего предложения или замечания:",
    feedback_msg_placeholder: "Опишите подробно: какую функцию добавить, что сделать удобнее или какую ошибку вы заметили...",
    feedback_contact_label: "Ваше имя и контакт для ответа (email или Telegram, по желанию):",
    feedback_contact_placeholder: "Иван, ivan@example.com (чтобы автор мог ответить)",
    feedback_btn_send_mail: "✉️ Отправить автору",
    feedback_btn_gmail: "🌐 Открыть в Gmail",
    feedback_btn_telegram: "✈️ Написать в Telegram-чат (@smartgarden_chat)",
    feedback_btn_copy: "📋 Скопировать текст",
    feedback_author_email: "Прямой email автора:",
    feedback_author_telegram: "Telegram-чат проекта:",
    feedback_toast_copied: "✓ Текст обращения скопирован в буфер обмена!",
    feedback_toast_sent: "✓ Текст скопирован! Запускаю почтовую программу для отправки...",
    feedback_toast_telegram: "✓ Текст скопирован! Открываю Telegram-чат @smartgarden_chat...",
    pwa_installed_label: "✓ Установлено",
    pwa_installed_toast: "✓ «Умный Огород» установлен на ваше устройство! Теперь его можно открывать прямо с рабочего стола.",
    install_modal_title: "Установка «Умного Огорода» на устройство",
    install_modal_subtitle: "Запускайте программу в отдельном окне с рабочего стола и пользуйтесь даже без интернета!",

    // Help Modal
    help_modal_title: "📖 Руководство пользователя «Мой Огород»",
    help_modal_subtitle: "Интерактивная инструкция по планированию грядок, севообороту и управлению данными",
    help_tab_quickstart: "🚀 Быстрый старт",
    help_tab_rotation: "🔄 Севооборот",
    help_tab_beds: "📦 Конструктор грядок",
    help_tab_data: "💾 Сохранение и экспорт",
    help_tab_tips: "💡 Советы агронома",
    help_tab_donate: "☕ Поддержать автора",
    help_btn_download_manual: "📥 Скачать инструкцию (.md)",
    help_btn_close: "Понятно",
    btn_close: "Закрыть",

    // Tabs
    tab_map: "План огорода",
    tab_table: "Сводка севооборота",
    tab_encyclopedia: "Справочник культур",
    tab_planner: "Правила & Калькулятор",

    // Toolbar on map
    filter_label: "🔍 Фильтр:",
    filter_all: "Все грядки",
    filter_danger: "⚠️ Только с нарушениями севооборота",
    filter_empty: "🌱 Только незасеянные грядки",
    overlay_prev_year: "👁️ Наложить прошлый год",
    legend_perfect: "Идеально",
    legend_warning: "Внимание",
    legend_danger: "Нарушение",
    hint_pan: "🖱️ Перетаскивайте огород в любую сторону мышью (Pan). Колёсико — масштаб.",
    btn_fit_all: "⛶ Вписать всё",
    btn_center: "📍 Центр",
    btn_arrange: "📏 Расставить дорожки",
    btn_fit_all_title: "Вписать все грядки в экран монитора",
    btn_center_title: "Отцентрировать план по центру экрана",
    btn_arrange_title: "Разровнять грядки и выстроить ровные проходы",
    zoom_in_title: "Приблизить (+)",
    zoom_out_title: "Отдалить (-)",
    toast_fit_all: "⛶ Все грядки вписаны в экран (масштаб {percent}%)",
    toast_center_plot: "📍 План огорода отцентрирован по центру экрана",

    // Empty state
    empty_hero_title: "Ваш участок готов к планированию!",
    empty_hero_desc: "Все демонстрационные грядки убраны. Теперь вы можете расставить свои грядки, теплицы и зоны посадок именно так, как они расположены на вашей даче:",
    empty_btn_bed_title: "Добавить грядку",
    empty_btn_bed_desc: "Приподнятую, грунтовую или клубничник",
    empty_btn_gh_title: "Добавить теплицу",
    empty_btn_gh_desc: "С 2 или 3 отдельными грядками",
    empty_btn_row_title: "Создать ряд грядок",
    empty_btn_row_desc: "Быстро разместить 3–8 грядок с дорожками",
    empty_btn_demo_title: "Вернуть демо-образец",
    empty_btn_demo_desc: "Если хотите снова подсмотреть пример",
    empty_tip: "💡 Совет: Любую созданную грядку можно свободно перетаскивать мышью по участку, поворачивать кнопкой ↻ на 90°, дублировать кнопкой ❐ и мгновенно удалять кнопкой 🗑️.",

    // Bed card tools
    tool_rotate: "Повернуть грядку на 90°",
    tool_clone: "Дублировать грядку",
    tool_delete: "Удалить грядку с плана",
    drag_handle_title: "Зажмите и тяните за хвостик для перемещения грядки",
    plant_cta: "Посадить",
    unplanted: "Не засеяно",
    free_slot: "Свободно для посадки (нажмите, чтобы засеять)",
    grown_in_year: "В {year} г. росло:",

    // Bed types
    type_greenhouse: "Теплица",
    type_raised: "Приподнятая грядка",
    type_ground: "Открытый грунт",
    type_warm: "Тёплая грядка",
    type_berry: "Клубничник (Ягодник)",

    // Sections
    sec_left: "Левая грядка",
    sec_center: "Центральная грядка",
    sec_right: "Правая грядка",
    sec_row: "Рядок",

    // Inspector Drawer
    inspector_title: "Параметры грядки",
    inspector_current_planting: "Текущая посадка ({year} г.)",
    inspector_select_crop_label: "Выберите культуру для посадки:",
    inspector_combobox_placeholder: "Начните вводить название...",
    inspector_create_crop_option: "➕ Создать культуру «{name}»",
    inspector_variety_label: "Сорт или гибрид (необязательно):",
    inspector_variety_placeholder: "Например: Бычье Сердце, Кураж F1...",
    inspector_notes_label: "Заметки и уход:",
    inspector_notes_placeholder: "Полив, подкормка, мульча, даты высадки...",
    inspector_rotation_analysis: "Агрономический анализ севооборота",
    inspector_btn_save: "💾 Сохранить посадку",
    inspector_btn_clear_bed: "🗑️ Освободить грядку",
    inspector_geometry_title: "Размеры и тип конструкции",
    inspector_width_label: "Ширина (м):",
    inspector_length_label: "Длина (м):",
    inspector_bed_name_label: "Название грядки:",
    inspector_bed_type_label: "Тип конструкции:",
    inspector_history_title: "История севооборота по годам",

    // Create custom crop modal
    create_crop_modal_title: "Добавить новую культуру в базу",
    create_crop_name_label: "Название культуры:",
    create_crop_name_placeholder: "Например: Физалис, Патиссон, Спаржа...",
    create_crop_emoji_label: "Иконка (эмодзи) для карты:",
    create_crop_family_label: "Ботаническое семейство:",
    create_crop_rotation_label: "Срок возврата на грядку (лет):",
    create_crop_btn_submit: "➕ Сохранить и выбрать",
    create_crop_btn_cancel: "Отмена",

    // Rotation Summary Tab
    summary_title: "Сводный монитор севооборота на {year} год",
    summary_subtitle: "Автоматическая проверка всех грядок по правилам агрономии и предупреждение истощения почвы",
    summary_stat_total: "Всего участков",
    summary_stat_good: "Идеальный севооборот",
    summary_stat_warning: "Требует внимания",
    summary_stat_danger: "Опасные повторы",
    summary_table_bed: "Грядка / Секция",
    summary_table_current: "Посадка {year}",
    summary_table_prev: "Предшественник {prevYear}",
    summary_table_status: "Оценка агронома",
    summary_table_action: "Действие",

    // Encyclopedia Tab
    encyclo_title: "Агрономический справочник культур",
    encyclo_subtitle: "Семейства растений, сроки возврата, лучшие предшественники и правила севооборота",
    encyclo_search_placeholder: "Поиск культуры по названию или семейству...",
    encyclo_btn_custom_crop: "➕ Своя культура",
    encyclo_family_filter_all: "Все семейства",
    encyclo_return_period: "Срок возврата: {years} года",
    encyclo_best_predecessors: "Лучшие предшественники:",
    encyclo_bad_predecessors: "Нежелательные предшественники:",
    encyclo_agronomic_tip: "Совет агронома:",

    // Rules & Calculator Tab
    rules_title: "Агрономические правила & Интерактивный калькулятор",
    rules_subtitle: "Проверьте совместимость любых культур перед посадкой и узнайте научные законы севооборота",
    calc_box_title: "🧪 Интерактивный калькулятор совместимости",
    calc_what_plant: "Что вы хотите посадить?",
    calc_what_was: "Что росло на этом месте в прошлом году?",
    calc_btn_check: "Проверить севооборот",
    calc_result_title: "Заключение агронома:",

    // Backup & DB Modal
    db_modal_title: "Управление базой данных и резервное копирование",
    db_modal_desc: "Все ваши данные сохраняются локально на этом компьютере. Здесь вы можете скачать резервную копию или загрузить сохранённый файл на другом компьютере.",
    db_btn_download: "📥 Скачать резервную копию (JSON)",
    db_btn_upload: "📤 Загрузить из файла (JSON)",
    db_btn_reset: "⚠️ Сбросить к демо-плану",

    // Toast messages
    toast_saved: "✓ Изменения успешно сохранены!",
    toast_cleared: "План очищен. Добавьте свои грядки!",
    toast_demo_loaded: "Демонстрационный план успешно загружен!",
    toast_crop_created: "Культура «{name}» успешно добавлена!",
    toast_arranged: "📏 Дорожки между грядками аккуратно выровнены!",
    toast_backup_downloaded: "Файл резервной копии успешно скачан!",
    toast_backup_imported: "Данные огорода успешно восстановлены из файла!",
    toast_lang_changed: "Язык интерфейса изменён на Русский",

    // Evaluation messages
    eval_optimal: "Отличный севооборот",
    eval_warning: "Допустимо с оговорками",
    eval_danger: "Нарушение севооборота!",
    eval_neutral: "Культура не выбрана",
    eval_no_history: "Данных о предшественниках нет",
    eval_no_history_reason: "Первый год учета для этой грядки.",
    eval_no_history_advice: "Рекомендуется внести комплексное удобрение или перегной при посадке.",
    eval_fallow_title: "Отличный выбор",
    eval_fallow_reason: "Отдых почвы или сидерат восстанавливает плодородие.",
    eval_fallow_advice: "Почва накопит органику и избавится от патогенов.",
    eval_err_monoculture: "❌ Ошибка монокультуры: {crop} сажается на то же место второй год подряд! Это ведет к резкому падению урожая и вспышке болезней.",
    eval_err_family: "❌ Родственные культуры подряд ({family}): предшественник «{prevCrop}» имеет общих вредителей и болезни с «{crop}».",
    eval_warn_bad_pred: "⚠️ «{prevCrop}» — плохой предшественник для «{crop}».",
    eval_good_pred: "✅ Идеальный предшественник: после «{prevCrop}» почва оптимально подготовлена для «{crop}».",
    eval_warn_return: "ℹ️ Родственная культура ({prevCrop}) уже росла здесь {years} г. назад (рекомендуемый перерыв: {minYears} года).",
    eval_warn_heavy: "⚠️ Внимание: две культуры с высоким выносом питательных веществ подряд («{prevCrop}» -> «{crop}»). Потребуется усиленное внесение органики.",
    eval_balanced: "Севооборот сбалансирован, противопоказаний нет.",
    eval_default_advice: "Соблюдайте режим полива и подкормок."
  },

  // === Eesti (ET) - Эстонский ===
  et: {
    app_title: "Minu Aed",
    app_subtitle: "Külviplaan & Külvikorra planeerija",
    
    // Header
    season_label: "📅 Hooaeg:",
    btn_add_season: "➕ Hooaeg",
    btn_add_bed: "➕ Uus peenar",
    btn_clear_plan: "🧹 Tühjenda plaan",
    btn_demo: "🔄 Näidisplaan",
    btn_db: "💾 Andmebaas",
    btn_backup: "Varukoopia",
    btn_help: "❓ Juhend",
    btn_help_title: "Kasutusjuhend ja nõuanded",
    btn_donate: "☕ Toeta autorit",
    btn_donate_title: "Täna autorit tasuta programmi eest",
    btn_feedback: "💡 Ideed & tagasiside",
    btn_feedback_title: "Paku välja idee, parandus või teata veast",
    btn_pwa_install: "📲 Paigalda",
    btn_pwa_install_title: "Paigalda «Nutikas Aed» oma arvutisse või telefoni",
    theme_dark: "🌙 Tume teema",
    theme_light: "☀️ Hele teema",

    // Donate Modal
    donate_modal_title: "☕ Toeta autorit ja projekti arengut",
    donate_modal_subtitle: "«Minu Aed» on kõigile tasuta aiatarkvara. Saate autorit tänada meelepärase toetusega!",
    donate_baltic_title: "🇪🇪 🇱🇻 🇱🇹 🇪🇺 Balti riigid ja Euroopa (EUR)",
    donate_baltic_desc: "Otsene SEPA pangaülekanne ilma lisatasuta:",
    donate_recipient_label: "Saaja:",
    donate_iban_label: "Konto number (IBAN):",
    donate_bank_label: "Pank:",
    donate_purpose_label: "Selgitus:",
    donate_btn_copy: "📋 Kopeeri IBAN",
    donate_copied_toast: "✓ Konto number (IBAN) kopeeritud lõikelauale!",
    donate_sepa_note: "Kiired SEPA maksed ilma lisatasuta kõigist Eesti, Läti, Leedu ja Euroopa pankadest (Swedbank, SEB, LHV, Luminor, Revolut jt).",
    donate_rub_title: "🇷🇺 Venemaa ja teised riigid (RUB)",
    donate_rub_desc: "Vabatahtlik toetus Boosty kaudu (MIR kaardid, SBP, pangad):",
    donate_btn_boosty: "☕ Toeta Boosty kaudu",
    donate_btn_copy_link: "📋 Kopeeri link",
    donate_link_copied_toast: "✓ Boosty link kopeeritud lõikelauale!",

    // Feedback & Suggestions Modal
    feedback_modal_title: "💡 Tagasiside, ideed ja ettepanekud",
    feedback_modal_subtitle: "Autor loeb isiklikult kõiki teateid ja lisab kasulikke funktsioone programmi uuendustesse.",
    feedback_type_label: "Millest on teie teade?",
    feedback_type_idea: "💡 Idee uute funktsioonide kohta",
    feedback_type_crop: "🌱 Lisa kultuur, sort või reegel",
    feedback_type_bug: "🐛 Viga või ebatäpsus",
    feedback_type_praise: "💬 Tagasiside, küsimus või tänu",
    feedback_msg_label: "Ettepaneku või märkuse tekst:",
    feedback_msg_placeholder: "Kirjeldage lähemalt: millist funktsiooni lisada, mida muuta mugavamaks või millist viga märkasite...",
    feedback_contact_label: "Teie nimi ja kontakt vastamiseks (e-post või Telegram, valikuline):",
    feedback_contact_placeholder: "Jaan, jaan@example.com (et autor saaks vastata)",
    feedback_btn_send_mail: "✉️ Saada autorile",
    feedback_btn_gmail: "🌐 Ava Gmailis",
    feedback_btn_telegram: "✈️ Kirjuta Telegrami vestlusringis (@smartgarden_chat)",
    feedback_btn_copy: "📋 Kopeeri tekst",
    feedback_author_email: "Autori otsene e-post:",
    feedback_author_telegram: "Projekti Telegrami vestlus:",
    feedback_toast_copied: "✓ Teate tekst on kopeeritud lõikelauale!",
    feedback_toast_sent: "✓ Tekst kopeeritud! Avatakse e-posti programm...",
    feedback_toast_telegram: "✓ Tekst kopeeritud! Avatakse Telegrami vestlusring @smartgarden_chat...",
    pwa_installed_label: "✓ Paigaldatud",
    pwa_installed_toast: "✓ «Nutikas Aed» on seadmesse paigaldatud! Saate selle avada otse töölaualt.",
    install_modal_title: "«Nutika Aia» paigaldamine seadmesse",
    install_modal_subtitle: "Käivitage programm eraldi aknas töölaualt ja kasutage seda ka ilma internetita!",

    // Help Modal
    help_modal_title: "📖 Kasutusjuhend «Minu Aed»",
    help_modal_subtitle: "Interaktiivne juhend peenarde planeerimiseks, külvikorraks ja andmehalduseks",
    help_tab_quickstart: "🚀 Kiire algus",
    help_tab_rotation: "🔄 Külvikord",
    help_tab_beds: "📦 Peenarde ehitaja",
    help_tab_data: "💾 Salvestamine ja eksport",
    help_tab_tips: "💡 Agronoomi nõuanded",
    help_tab_donate: "☕ Toeta autorit",
    help_btn_download_manual: "📥 Laadi alla juhend (.md)",
    help_btn_close: "Selge",
    btn_close: "Sulge",

    // Tabs
    tab_map: "Aiamaa plaan",
    tab_table: "Külvikorra ülevaade",
    tab_encyclopedia: "Kultuuride teatmik",
    tab_planner: "Reeglid & Kalkulaator",

    // Toolbar on map
    filter_label: "🔍 Filter:",
    filter_all: "Kõik peenrad",
    filter_danger: "⚠️ Ainult külvikorrarikkumistega",
    filter_empty: "🌱 Ainult tühjad peenrad",
    overlay_prev_year: "👁️ Eelmise aasta kattuvus",
    legend_perfect: "Ideaalne",
    legend_warning: "Tähelepanu",
    legend_danger: "Rikkumine",
    hint_pan: "🖱️ Lohista aeda hiirega igas suunas. Hiireratas — suum.",
    btn_fit_all: "⛶ Sobita vaatesse",
    btn_center: "📍 Keskenda",
    btn_arrange: "📏 Paiguta rajad",
    btn_fit_all_title: "Sobita kõik peenrad ekraanile",
    btn_center_title: "Keskenda aiaplaan ekraani keskele",
    btn_arrange_title: "Joonda peenrad ja loo ühtlased vahekäigud",
    zoom_in_title: "Suurenda (+)",
    zoom_out_title: "Vähenda (-)",
    toast_fit_all: "⛶ Kõik peenrad on vaatesse sobitatud (suum {percent}%)",
    toast_center_plot: "📍 Aia plaan on ekraani keskele joondatud",

    // Empty state
    empty_hero_title: "Teie krunt on planeerimiseks valmis!",
    empty_hero_desc: "Kõik näidispeenrad on eemaldatud. Nüüd saate paigutada oma peenrad, kasvuhooned ja istutusalad täpselt nii, nagu need asuvad teie aias:",
    empty_btn_bed_title: "Lisa peenar",
    empty_btn_bed_desc: "Kõrge peenar, avamaa või maasikad",
    empty_btn_gh_title: "Lisa kasvuhoone",
    empty_btn_gh_desc: "2 või 3 eraldi peenraga",
    empty_btn_row_title: "Loo peenrarida",
    empty_btn_row_desc: "Kiiresti 3–8 peenart vahekäikudega",
    empty_btn_demo_title: "Taasta näidisnäide",
    empty_btn_demo_desc: "Kui soovite uuesti eeskuju vaadata",
    empty_tip: "💡 Nõuanne: Iga loodud peenart saab hiirega vabalt liigutada, pöörata nupuga ↻ 90°, dubleerida nupuga ❐ ja kustutada nupuga 🗑️.",

    // Bed card tools
    tool_rotate: "Pööra peenart 90°",
    tool_clone: "Dubleeri peenart",
    tool_delete: "Kustuta peenar plaanilt",
    drag_handle_title: "Hoia ja lohista lipikust peenra liigutamiseks",
    plant_cta: "Istuta",
    unplanted: "Istutamata",
    free_slot: "Vaba istutamiseks (klõpsake valimiseks)",
    grown_in_year: "{year}. a kasvas:",

    // Bed types
    type_greenhouse: "Kasvuhoone",
    type_raised: "Kõrge peenar",
    type_ground: "Avamaa",
    type_warm: "Soe peenar",
    type_berry: "Maasikapeenar",

    // Sections
    sec_left: "Vasak peenar",
    sec_center: "Keskmine peenar",
    sec_right: "Parem peenar",
    sec_row: "Rida",

    // Inspector Drawer
    inspector_title: "Peenra parameetrid",
    inspector_current_planting: "Praegune istutus ({year}. a)",
    inspector_select_crop_label: "Valige kultuur istutamiseks:",
    inspector_combobox_placeholder: "Alustage nime sisestamist...",
    inspector_create_crop_option: "➕ Loo kultuur «{name}»",
    inspector_variety_label: "Sort või hübriid (valikuline):",
    inspector_variety_placeholder: "Nt: Härjasüda, Kurazh F1...",
    inspector_notes_label: "Märkmed ja hooldus:",
    inspector_notes_placeholder: "Kastmine, väetamine, multš, istutuskuupäevad...",
    inspector_rotation_analysis: "Külvikorra agronoomiline analüüs",
    inspector_btn_save: "💾 Salvesta istutus",
    inspector_btn_clear_bed: "🗑️ Vabasta peenar",
    inspector_geometry_title: "Mõõtmed ja konstruktsiooni tüüp",
    inspector_width_label: "Laius (m):",
    inspector_length_label: "Pikkus (m):",
    inspector_bed_name_label: "Peenra nimetus:",
    inspector_bed_type_label: "Konstruktsiooni tüüp:",
    inspector_history_title: "Külvikorra ajalugu aastate lõikes",

    // Create custom crop modal
    create_crop_modal_title: "Lisa uus kultuur andmebaasi",
    create_crop_name_label: "Kultuuri nimetus:",
    create_crop_name_placeholder: "Nt: Füüsal, Pattisson, Spargel...",
    create_crop_emoji_label: "Ikoon (emoji) kaardi jaoks:",
    create_crop_family_label: "Botaaniline sugukond:",
    create_crop_rotation_label: "Peenrasse tagasipöördumise aeg (aastat):",
    create_crop_btn_submit: "➕ Salvesta ja vali",
    create_crop_btn_cancel: "Tühista",

    // Rotation Summary Tab
    summary_title: "Külvikorra koondülevaade {year}. aastaks",
    summary_subtitle: "Kõigi peenarde automaatne kontroll agronoomiareeglite järgi mulla kurnamise vältimiseks",
    summary_stat_total: "Peenraid kokku",
    summary_stat_good: "Ideaalne külvikord",
    summary_stat_warning: "Vajab tähelepanu",
    summary_stat_danger: "Ohtlikud kordused",
    summary_table_bed: "Peenar / Sektsioon",
    summary_table_current: "Istutus {year}",
    summary_table_prev: "Eelvili {prevYear}",
    summary_table_status: "Agronoomi hinnang",
    summary_table_action: "Tegevus",

    // Encyclopedia Tab
    encyclo_title: "Kultuuride agronoomiline teatmik",
    encyclo_subtitle: "Taimesugukonnad, tagasipöördumise ajad, parimad eelviljad ja külvikorra reeglid",
    encyclo_search_placeholder: "Otsi kultuuri nime või sugukonna järgi...",
    encyclo_btn_custom_crop: "➕ Minu kultuur",
    encyclo_family_filter_all: "Kõik sugukonnad",
    encyclo_return_period: "Tagasipöördumise aeg: {years} aastat",
    encyclo_best_predecessors: "Parimad eelviljad:",
    encyclo_bad_predecessors: "Ebasoovitavad eelviljad:",
    encyclo_agronomic_tip: "Agronoomi nõuanne:",

    // Rules & Calculator Tab
    rules_title: "Agronoomilised reeglid & Interaktiivne kalkulaator",
    rules_subtitle: "Kontrollige mis tahes kultuuride sobivust enne istutamist ja tutvuge teaduslike külvikorra reeglitega",
    calc_box_title: "🧪 Interaktiivne sobivuse kalkulaator",
    calc_what_plant: "Mida soovite istutada?",
    calc_what_was: "Mis kasvas sellel kohal eelmisel aastal?",
    calc_btn_check: "Kontrolli külvikorda",
    calc_result_title: "Agronoomi järeldus:",

    // Backup & DB Modal
    db_modal_title: "Andmebaasi haldamine ja varukoopia",
    db_modal_desc: "Kõik teie andmed salvestatakse lokaalselt sellesse arvutisse. Siin saate alla laadida varukoopia või laadida salvestatud faili teise arvutisse.",
    db_btn_download: "📥 Laadi alla varukoopia (JSON)",
    db_btn_upload: "📤 Laadi failist (JSON)",
    db_btn_reset: "⚠️ Lähtesta näidisplaanile",

    // Toast messages
    toast_saved: "✓ Muudatused edukalt salvestatud!",
    toast_cleared: "Plaan on tühjendatud. Lisage oma peenrad!",
    toast_demo_loaded: "Näidisplaan edukalt laaditud!",
    toast_crop_created: "Kultuur «{name}» edukalt lisatud!",
    toast_arranged: "📏 Rajad peenarde vahel on kenasti joondatud!",
    toast_backup_downloaded: "Varukoopia fail edukalt alla laaditud!",
    toast_backup_imported: "Aia andmed edukalt failist taastatud!",
    toast_lang_changed: "Liidese keel muudeti: Eesti keel",

    // Evaluation messages
    eval_optimal: "Suurepärane külvikord",
    eval_warning: "Lubatud mööndustega",
    eval_danger: "Külvikorra rikkumine!",
    eval_neutral: "Kultuuri pole valitud",
    eval_no_history: "Eelviljade andmed puuduvad",
    eval_no_history_reason: "Selle peenra esimene arvestusaasta.",
    eval_no_history_advice: "Istutamisel on soovitatav lisada kompleksväetist või komposti.",
    eval_fallow_title: "Suurepärane valik",
    eval_fallow_reason: "Mulla puhkus või haljasväetis taastab mulla viljakust.",
    eval_fallow_advice: "Muld kogub orgaanikat ja vabaneb haigustekitajatest.",
    eval_err_monoculture: "❌ Monokultuuri viga: {crop} istutatakse samasse kohta teist aastat järjest! See viib saagi järsu languse ja haigusteni.",
    eval_err_family: "❌ Sugulaskultuurid järjest ({family}): eelviljal «{prevCrop}» on ühised kahjurid ja haigused kultuuriga «{crop}».",
    eval_warn_bad_pred: "⚠️ «{prevCrop}» on ebasoovitav eelvili kultuurile «{crop}».",
    eval_good_pred: "✅ Ideaalne eelvili: pärast «{prevCrop}» on muld optimaalselt ette valmistatud kultuurile «{crop}».",
    eval_warn_return: "ℹ️ Sugulaskultuur ({prevCrop}) kasvas siin {years} a tagasi (soovituslik vaheaeg: {minYears} aastat).",
    eval_warn_heavy: "⚠️ Tähelepanu: kaks järjestikust suurt toitainete tarbijat («{prevCrop}» -> «{crop}»). Vajalik on rohke orgaanika lisamine.",
    eval_balanced: "Külvikord on tasakaalus, vastunäidustusi pole.",
    eval_default_advice: "Jälgige kastmis- ja väetamisrežiimi."
  },

  // === Latviešu (LV) - Латышский ===
  lv: {
    app_title: "Mans Dārzs",
    app_subtitle: "Stādīšanas plānotājs & Augseka",
    
    // Header
    season_label: "📅 Sezona:",
    btn_add_season: "➕ Sezona",
    btn_add_bed: "➕ Jauna dobe",
    btn_clear_plan: "🧹 Notīrīt plānu",
    btn_demo: "🔄 Demo paraugs",
    btn_db: "💾 Datu bāze",
    btn_backup: "Dublējumkopija",
    btn_help: "❓ Pamācība",
    btn_help_title: "Lietotāja rokasgrāmata un padomi",
    btn_donate: "☕ Atbalstīt autoru",
    btn_donate_title: "Pateikties autoram par programmu",
    btn_feedback: "💡 Idejas & atsauksmes",
    btn_feedback_title: "Ieteikt ideju, uzlabojumu vai ziņot par kļūdu",
    btn_pwa_install: "📲 Instalēt",
    btn_pwa_install_title: "Instalēt «Gudrais Dārzs» datorā vai tālrunī",
    theme_dark: "🌙 Tumšā tēma",
    theme_light: "☀️ Gaišā tēma",

    // Donate Modal
    donate_modal_title: "☕ Atbalstīt autoru un projekta attīstību",
    donate_modal_subtitle: "«Mans Dārzs» ir bezmaksas programma visiem dārzniekiem. Jebkurš atbalsts palīdz attīstīt projektu!",
    donate_baltic_title: "🇪🇪 🇱🇻 🇱🇹 🇪🇺 Baltijas valstis un Eiropa (EUR)",
    donate_baltic_desc: "Tiešais SEPA bankas pārskaitījums bez komisijas maksas:",
    donate_recipient_label: "Saņēmējs:",
    donate_iban_label: "Konta numurs (IBAN):",
    donate_bank_label: "Banka:",
    donate_purpose_label: "Maksājuma mērķis:",
    donate_btn_copy: "📋 Kopēt IBAN",
    donate_copied_toast: "✓ Konta numurs (IBAN) nokopēts starpliktuvē!",
    donate_sepa_note: "Ātrie SEPA maksājumi bez komisijas maksas no visām Igaunijas, Latvijas, Lietuvas un Eiropas bankām (Swedbank, SEB, Citadele, Luminor, Revolut u.c.).",
    donate_rub_title: "🇷🇺 Krievija un citas valstis (RUB)",
    donate_rub_desc: "Brīvprātīgs atbalsts caur Boosty (MIR kartes, SBP, bankas):",
    donate_btn_boosty: "☕ Atbalstīt ar Boosty",
    donate_btn_copy_link: "📋 Kopēt saiti",
    donate_link_copied_toast: "✓ Boosty saite nokopēta starpliktuvē!",

    // Feedback & Suggestions Modal
    feedback_modal_title: "💡 Atsauksmes, idejas un ieteikumi",
    feedback_modal_subtitle: "Autors personīgi lasa visas ziņas un pievieno noderīgas funkcijas programmas atjauninājumos.",
    feedback_type_label: "Par ko ir jūsu ziņojums?",
    feedback_type_idea: "💡 Ideja par jaunām funkcijām",
    feedback_type_crop: "🌱 Pievienot augu, šķirni vai noteikumu",
    feedback_type_bug: "🐛 Kļūda vai neprecizitāte",
    feedback_type_praise: "💬 Atsauksme, jautājums vai pateicība",
    feedback_msg_label: "Ieteikuma vai piezīmes teksts:",
    feedback_msg_placeholder: "Aprakstiet sīkāk: kādu funkciju pievienot, ko padarīt ērtāku vai kādu kļūdu pamanījāt...",
    feedback_contact_label: "Jūsu vārds un kontakts saziņai (e-pasts vai Telegram, neobligāti):",
    feedback_contact_placeholder: "Jānis, janis@example.com (lai autors varētu atbildēt)",
    feedback_btn_send_mail: "✉️ Nosūtīt autoram",
    feedback_btn_gmail: "🌐 Atvērt Gmail",
    feedback_btn_telegram: "✈️ Rakstīt Telegram tērzēšanā (@smartgarden_chat)",
    feedback_btn_copy: "📋 Kopēt tekstu",
    feedback_author_email: "Autora tiešais e-pasts:",
    feedback_author_telegram: "Projekta Telegram tērzēšana:",
    feedback_toast_copied: "✓ Ziņojuma teksts nokopēts starpliktuvē!",
    feedback_toast_sent: "✓ Teksts nokopēts! Tiek atvērta e-pasta programma...",
    feedback_toast_telegram: "✓ Teksts nokopēts! Tiek atvērta Telegram tērzēšana @smartgarden_chat...",
    pwa_installed_label: "✓ Uzstādīts",
    pwa_installed_toast: "✓ «Gudrais Dārzs» instalēts ierīcē! Tagad to var atvērt tieši no darbvirsmas.",
    install_modal_title: "«Gudrā Dārza» uzstādīšana ierīcē",
    install_modal_subtitle: "Palaidiet programmu atsevišķā logā no darbvirsmas un lietojiet pat bez interneta!",

    // Help Modal
    help_modal_title: "📖 Lietotāja rokasgrāmata «Mans Dārzs»",
    help_modal_subtitle: "Interaktīva pamācība dobju plānošanai, augsekai un datu pārvaldībai",
    help_tab_quickstart: "🚀 Ātrais starts",
    help_tab_rotation: "🔄 Augseka",
    help_tab_beds: "📦 Dobju konstruktors",
    help_tab_data: "💾 Saglabāšana un eksports",
    help_tab_tips: "💡 Agronoma padomi",
    help_tab_donate: "☕ Atbalstīt autoru",
    help_btn_download_manual: "📥 Lejupielādēt pamācību (.md)",
    help_btn_close: "Sapratu",
    btn_close: "Aizvērt",

    // Tabs
    tab_map: "Dārza plāns",
    tab_table: "Augsekas pārskats",
    tab_encyclopedia: "Kultūru rokasgrāmata",
    tab_planner: "Noteikumi & Kalkulators",

    // Toolbar on map
    filter_label: "🔍 Filtrs:",
    filter_all: "Visas dobes",
    filter_danger: "⚠️ Tikai ar augsekas pārkāpumiem",
    filter_empty: "🌱 Tikai neapstādītās dobes",
    overlay_prev_year: "👁️ Iepriekšējā gada slānis",
    legend_perfect: "Ideāli",
    legend_warning: "Uzmanību",
    legend_danger: "Pārkāpums",
    hint_pan: "🖱️ Velciet dārzu ar peli jebkurā virzienā. Ritenītis — mērogs.",
    btn_fit_all: "⛶ Ietilpināt visu",
    btn_center: "📍 Centrēt",
    btn_arrange: "📏 Izkārtot celiņus",
    btn_fit_all_title: "Ietilpināt visas dobes ekrānā",
    btn_center_title: "Centrēt dārza plānu ekrānā",
    btn_arrange_title: "Izlīdzināt dobes un izveidot glītus celiņus",
    zoom_in_title: "Tuvināt (+)",
    zoom_out_title: "Tālināt (-)",
    toast_fit_all: "⛶ Visas dobes ir ietilpinātas ekrānā (mērogs {percent}%)",
    toast_center_plot: "📍 Dārza plāns ir nocentrēts ekrānā",

    // Empty state
    empty_hero_title: "Jūsu zemes gabals ir gatavs plānošanai!",
    empty_hero_desc: "Visas paraugdobes ir noņemtas. Tagad varat izvietot savas dobes, siltumnīcas un stādījumu zonas tieši tā, kā tās atrodas jūsu dārzā:",
    empty_btn_bed_title: "Pievienot dobi",
    empty_btn_bed_desc: "Paaugstinātu, atklātā gruntī vai zemeņu dobi",
    empty_btn_gh_title: "Pievienot siltumnīcu",
    empty_btn_gh_desc: "Ar 2 vai 3 atsevišķām dobēm",
    empty_btn_row_title: "Izveidot dobju rindu",
    empty_btn_row_desc: "Ātri izvietot 3–8 dobes ar celiņiem",
    empty_btn_demo_title: "Atjaunot demo paraugu",
    empty_btn_demo_desc: "Ja vēlaties vēlreiz apskatīt piemēru",
    empty_tip: "💡 Padoms: Jebkuru izveidoto dobi var brīvi pārvietot ar peli, pagriezt ar pogu ↻ par 90°, dublēt ar pogu ❐ un dzēst ar pogu 🗑️.",

    // Bed card tools
    tool_rotate: "Pagriezt dobi par 90°",
    tool_clone: "Dublēt dobi",
    tool_delete: "Dzēst dobi no plāna",
    drag_handle_title: "Turiet un velciet aiz cilnes, lai pārvietotu dobi",
    plant_cta: "Stādīt",
    unplanted: "Nav apstādīts",
    free_slot: "Brīvs stādīšanai (noklikšķiniet, lai iestādītu)",
    grown_in_year: "{year}. gadā auga:",

    // Bed types
    type_greenhouse: "Siltumnīca",
    type_raised: "Paaugstināta dobe",
    type_ground: "Atklāta grunts",
    type_warm: "Siltā dobe",
    type_berry: "Zemeņu dobe",

    // Sections
    sec_left: "Kreisā dobe",
    sec_center: "Centrālā dobe",
    sec_right: "Labā dobe",
    sec_row: "Rinda",

    // Inspector Drawer
    inspector_title: "Dobes parametri",
    inspector_current_planting: "Pašreizējais stādījums ({year}. gads)",
    inspector_select_crop_label: "Izvēlieties kultūru stādīšanai:",
    inspector_combobox_placeholder: "Sāciet ievadīt nosaukumu...",
    inspector_create_crop_option: "➕ Izveidot kultūru «{name}»",
    inspector_variety_label: "Šķirne vai hibrīds (neobligāti):",
    inspector_variety_placeholder: "Piemēram: Vērša Sirds, Kurāža F1...",
    inspector_notes_label: "Piezīmes un kopšana:",
    inspector_notes_placeholder: "Laistīšana, mēslošana, mulča, stādīšanas datumi...",
    inspector_rotation_analysis: "Augsekas agronomiskā analīze",
    inspector_btn_save: "💾 Saglabāt stādījumu",
    inspector_btn_clear_bed: "🗑️ Atbrīvot dobi",
    inspector_geometry_title: "Izmēri un konstrukcijas tips",
    inspector_width_label: "Platums (m):",
    inspector_length_label: "Garums (m):",
    inspector_bed_name_label: "Dobes nosaukums:",
    inspector_bed_type_label: "Konstrukcijas tips:",
    inspector_history_title: "Augsekas vēsture pa gadiem",

    // Create custom crop modal
    create_crop_modal_title: "Pievienot jaunu kultūru datubāzei",
    create_crop_name_label: "Kultūras nosaukums:",
    create_crop_name_placeholder: "Piemēram: Fizālis, Patisons, Sparģeļi...",
    create_crop_emoji_label: "Ikona (emoji) kartei:",
    create_crop_family_label: "Botāniskā dzimta:",
    create_crop_rotation_label: "Atgriešanās laiks dobē (gadi):",
    create_crop_btn_submit: "➕ Saglabāt un izvēlēties",
    create_crop_btn_cancel: "Atcelt",

    // Rotation Summary Tab
    summary_title: "Augsekas kopsavilkums {year}. gadam",
    summary_subtitle: "Visu dobju automātiska pārbaude saskaņā ar agronomijas noteikumiem augsnes noplicināšanas novēršanai",
    summary_stat_total: "Dobju kopskaits",
    summary_stat_good: "Ideāla augseka",
    summary_stat_warning: "Prasa uzmanību",
    summary_stat_danger: "Bīstami atkārtojumi",
    summary_table_bed: "Dobe / Sekcija",
    summary_table_current: "Stādījums {year}",
    summary_table_prev: "Priekštecis {prevYear}",
    summary_table_status: "Agronoma vērtējums",
    summary_table_action: "Darbība",

    // Encyclopedia Tab
    encyclo_title: "Kultūru agronomiskā rokasgrāmata",
    encyclo_subtitle: "Augu dzimtas, atgriešanās periodi, labākie priekšteči un augsekas likumi",
    encyclo_search_placeholder: "Meklēt kultūru pēc nosaukuma vai dzimtas...",
    encyclo_btn_custom_crop: "➕ Mana kultūra",
    encyclo_family_filter_all: "Visas dzimtas",
    encyclo_return_period: "Atgriešanās periods: {years} gadi",
    encyclo_best_predecessors: "Labākie priekšteči:",
    encyclo_bad_predecessors: "Nevēlamie priekšteči:",
    encyclo_agronomic_tip: "Agronoma padoms:",

    // Rules & Calculator Tab
    rules_title: "Agronomiskie noteikumi & Interaktīvais kalkulators",
    rules_subtitle: "Pārbaudiet jebkuru kultūru saderību pirms stādīšanas un apgūstiet zinātniskos augsekas likumus",
    calc_box_title: "🧪 Interaktīvais saderības kalkulators",
    calc_what_plant: "Ko vēlaties stādīt?",
    calc_what_was: "Kas šajā vietā auga pagājušajā gadā?",
    calc_btn_check: "Pārbaudīt augseku",
    calc_result_title: "Agronoma slēdziens:",

    // Backup & DB Modal
    db_modal_title: "Datu bāzes pārvaldība un dublēšana",
    db_modal_desc: "Visi jūsu dati tiek glabāti lokāli šajā datorā. Šeit varat lejupielādēt dublējumkopiju vai ielādēt saglabāto failu citā datorā.",
    db_btn_download: "📥 Lejupielādēt dublējumkopiju (JSON)",
    db_btn_upload: "📤 Ielādēt no faila (JSON)",
    db_btn_reset: "⚠️ Atiestatīt uz demo plānu",

    // Toast messages
    toast_saved: "✓ Izmaiņas veiksmīgi saglabātas!",
    toast_cleared: "Plāns ir notīrīts. Pievienojiet savas dobes!",
    toast_demo_loaded: "Demo paraugs veiksmīgi ielādēts!",
    toast_crop_created: "Kultūra «{name}» veiksmīgi pievienota!",
    toast_arranged: "📏 Celiņi starp dobēm ir glīti izlīdzināti!",
    toast_backup_downloaded: "Dublējumkopijas fails veiksmīgi lejupielādēts!",
    toast_backup_imported: "Dārza dati veiksmīgi atjaunoti no faila!",
    toast_lang_changed: "Saskarnes valoda nomainīta uz: Latviešu",

    // Evaluation messages
    eval_optimal: "Lieliska augu seka",
    eval_warning: "Pieļaujams ar atrunām",
    eval_danger: "Augu sekas pārkāpums!",
    eval_neutral: "Augs nav izvēlēts",
    eval_no_history: "Nav datu par priekšaugiem",
    eval_no_history_reason: "Šīs dobes pirmais uzskaites gads.",
    eval_no_history_advice: "Stādīšanas laikā ieteicams iestrādāt komplekso mēslojumu vai kompostu.",
    eval_fallow_title: "Lieliska izvēle",
    eval_fallow_reason: "Augsnes atpūta vai zaļmēslojums atjauno auglību.",
    eval_fallow_advice: "Augsne uzkrās organiku un atbrīvosies no slimību ierosinātājiem.",
    eval_err_monoculture: "❌ Monokultūras kļūda: {crop} tiek stādīts tajā pašā vietā otro gadu pēc kārtas! Tas rada krasu ražas kritumu un slimības.",
    eval_err_family: "❌ Radniecīgi augi pēc kārtas ({family}): priekšaugam «{prevCrop}» ir kopīgi kaitēkļi un slimības ar «{crop}».",
    eval_warn_bad_pred: "⚠️ «{prevCrop}» ir slikts priekšaugs augam «{crop}».",
    eval_good_pred: "✅ Ideāls priekšaugs: pēc «{prevCrop}» augsne ir optimāli sagatavota augam «{crop}».",
    eval_warn_return: "ℹ️ Radniecīgs augs ({prevCrop}) šeit auga pirms {years} g. (ieteicamais pārtraukums: {minYears} gadi).",
    eval_warn_heavy: "⚠️ Uzmanību: divi augi ar lielu barības vielu patēriņu pēc kārtas («{prevCrop}» -> «{crop}»). Nepieciešama pastiprināta mēslošana.",
    eval_balanced: "Augu seka ir līdzsvarota, problēmu nav.",
    eval_default_advice: "Ievērojiet laistīšanas un mēslošanas režīmu."
  },

  // === Lietuvių (LT) - Литовский ===
  lt: {
    app_title: "Mano Daržas",
    app_subtitle: "Sodinimo planuotojas & Sėjomainos sistema",
    
    // Header
    season_label: "📅 Sezonas:",
    btn_add_season: "➕ Sezonas",
    btn_add_bed: "➕ Nauja lysvė",
    btn_clear_plan: "🧹 Išvalyti planą",
    btn_demo: "🔄 Demo pavyzdys",
    btn_db: "💾 Duomenų bazė",
    btn_backup: "Atsarginė kopija",
    btn_help: "❓ Instrukcija",
    btn_help_title: "Vartotojo vadovas ir patarimai",
    btn_donate: "☕ Paremti autorių",
    btn_donate_title: "Padėkoti autoriui už programą",
    btn_feedback: "💡 Idėjos & atsiliepimai",
    btn_feedback_title: "Pasiūlyti idėją, patobulinimą ar pranešti apie klaidą",
    btn_pwa_install: "📲 Įdiegti",
    btn_pwa_install_title: "Įdiegti «Mano Daržas» kompiuteryje ar telefone",
    theme_dark: "🌙 Tamsi tema",
    theme_light: "☀️ Šviesi tema",

    // Donate Modal
    donate_modal_title: "☕ Paremti autorių ir projekto plėtrą",
    donate_modal_subtitle: "«Mano Daržas» yra nemokama programa visiems daržininkams. Bet kokia parama padeda tobulinti projektą!",
    donate_baltic_title: "🇪🇪 🇱🇻 🇱🇹 🇪🇺 Baltijos šalys ir Europa (EUR)",
    donate_baltic_desc: "Tiesioginis SEPA banko pavedimas be komisinių:",
    donate_recipient_label: "Gavėjas:",
    donate_iban_label: "Sąskaitos numeris (IBAN):",
    donate_bank_label: "Bankas:",
    donate_purpose_label: "Mokėjimo paskirtis:",
    donate_btn_copy: "📋 Kopijuoti IBAN",
    donate_copied_toast: "✓ Sąskaitos numeris (IBAN) nukopijuotas į iškarpinę!",
    donate_sepa_note: "Greiti SEPA mokėjimai be komisinių iš visų Estijos, Latvijos, Lietuvos ir Europos bankų (Swedbank, SEB, Luminor, Šiaulių bankas, Revolut ir kt.).",
    donate_rub_title: "🇷🇺 Rusija ir kitos šalys (RUB)",
    donate_rub_desc: "Savanoriškas palaikymas per Boosty (MIR kortelės, SBP, bankai):",
    donate_btn_boosty: "☕ Paremkite per Boosty",
    donate_btn_copy_link: "📋 Kopijuoti nuorodą",
    donate_link_copied_toast: "✓ Boosty nuoroda nukopijuota į iškarpinę!",

    // Feedback & Suggestions Modal
    feedback_modal_title: "💡 Atsiliepimai, idėjos ir pasiūlymai",
    feedback_modal_subtitle: "Autorius asmeniškai skaito visas žinutes ir prideda naudingų funkcijų į programos atnaujinimus.",
    feedback_type_label: "Apie ką jūsų kreipimasis?",
    feedback_type_idea: "💡 Idėja apie naujas funkcijas",
    feedback_type_crop: "🌱 Pridėti augalą, veislę ar taisyklę",
    feedback_type_bug: "🐛 Klaida ar netikslumas",
    feedback_type_praise: "💬 Atsiliepimas, klausimas ar padėka",
    feedback_msg_label: "Pasiūlymo ar pastabos tekstas:",
    feedback_msg_placeholder: "Išsamiai aprašykite: kokią funkciją pridėti, ką padaryti patogiau ar kokią klaidą pastebėjote...",
    feedback_contact_label: "Jūsų vardas ir kontaktai ryšiui (el. paštas ar Telegram, neprivaloma):",
    feedback_contact_placeholder: "Jonas, jonas@example.com (kad autorius galėtų atsakyti)",
    feedback_btn_send_mail: "✉️ Siųsti autoriui",
    feedback_btn_gmail: "🌐 Atidaryti Gmail",
    feedback_btn_telegram: "✈️ Rašyti į Telegram grupę (@smartgarden_chat)",
    feedback_btn_copy: "📋 Nukopijuoti tekstą",
    feedback_author_email: "Tiesioginis autoriaus el. paštas:",
    feedback_author_telegram: "Projekto Telegram pokalbiai:",
    feedback_toast_copied: "✓ Žinutės tekstas nukopijuotas į iškarpinę!",
    feedback_toast_sent: "✓ Tekstas nukopijuotas! Atidaroma el. pašto programa...",
    feedback_toast_telegram: "✓ Tekstas nukopijuotas! Atidaroma Telegram grupė @smartgarden_chat...",
    pwa_installed_label: "✓ Įdiegta",
    pwa_installed_toast: "✓ «Mano Daržas» įdiegtas įrenginyje! Dabar galite atidaryti tiesiai iš darbalaukio.",
    install_modal_title: "«Išmaniojo Sodo» įdiegimas į įrenginį",
    install_modal_subtitle: "Paleiskite programą atskirame lange iš darbalaukio ir naudokitės net be interneto!",

    // Help Modal
    help_modal_title: "📖 Vartotojo vadovas «Mano Daržas»",
    help_modal_subtitle: "Interaktyvus lysvių planavimo, sėjomainos ir duomenų valdymo vadovas",
    help_tab_quickstart: "🚀 Greita pradžia",
    help_tab_rotation: "🔄 Sėjomaina",
    help_tab_beds: "📦 Lysvių konstruktorius",
    help_tab_data: "💾 Išsaugojimas ir eksportas",
    help_tab_tips: "💡 Agronomo patarimai",
    help_tab_donate: "☕ Paremti autorių",
    help_btn_download_manual: "📥 Atsisiųsti instrukciją (.md)",
    help_btn_close: "Supratau",
    btn_close: "Uždaryti",

    // Tabs
    tab_map: "Daržo planas",
    tab_table: "Sėjomainos suvestinė",
    tab_encyclopedia: "Augalų žinynas",
    tab_planner: "Taisyklės & Skaičiuoklė",

    // Toolbar on map
    filter_label: "🔍 Filtras:",
    filter_all: "Visos lysvės",
    filter_danger: "⚠️ Tik su sėjomainos pažeidimais",
    filter_empty: "🌱 Tik neapsodintos lysvės",
    overlay_prev_year: "👁️ Praėjusių metų perdanga",
    legend_perfect: "Puiku",
    legend_warning: "Dėmesio",
    legend_danger: "Pažeidimas",
    hint_pan: "🖱️ Vilkite daržą pele bet kuria kryptimi. Ratukas — mastelis.",
    btn_fit_all: "⛶ Sutalpinti viską",
    btn_center: "📍 Centruoti",
    btn_arrange: "📏 Išdėstyti takus",
    btn_fit_all_title: "Sutalpinti visas lysves ekrane",
    btn_center_title: "Centruoti daržo planą ekrano centre",
    btn_arrange_title: "Išlyginti lysves ir sukurti lygius praėjimus",
    zoom_in_title: "Padidinti (+)",
    zoom_out_title: "Sumažinti (-)",
    toast_fit_all: "⛶ Visos lysvės sutalpintos į ekraną (mastelis {percent}%)",
    toast_center_plot: "📍 Daržo planas sucentruotas ekrano centre",

    // Empty state
    empty_hero_title: "Jūsų sklypas paruoštas planavimui!",
    empty_hero_desc: "Visos demonstracinės lysvės pašalintos. Dabar galite išdėstyti savo lysves, šiltnamius ir sodinimo zonas būtent taip, kaip jos yra jūsų sode:",
    empty_btn_bed_title: "Pridėti lysvę",
    empty_btn_bed_desc: "Pakeltą, atviro grunto ar braškių lysvę",
    empty_btn_gh_title: "Pridėti šiltnamį",
    empty_btn_gh_desc: "Su 2 arba 3 atskiromis lysvėmis",
    empty_btn_row_title: "Sukurti lysvių eilę",
    empty_btn_row_desc: "Greitai išdėstyti 3–8 lysves su takeliais",
    empty_btn_demo_title: "Grąžinti pavyzdį",
    empty_btn_demo_desc: "Jei norite dar kartą peržiūrėti pavyzdį",
    empty_tip: "💡 Patarimas: Bet kurią sukurtą lysvę galima laisvai perkelti pele, pasukti mygtuku ↻ 90° kampu, dubliuoti mygtuku ❐ ir ištrinti mygtuku 🗑️.",

    // Bed card tools
    tool_rotate: "Pasukti lysvę 90°",
    tool_clone: "Dubliuoti lysvę",
    tool_delete: "Pašalinti lysvę iš plano",
    drag_handle_title: "Laikykite ir vilkite už skirtuko, norėdami perkelti lysvę",
    plant_cta: "Pasodinti",
    unplanted: "Neapsodinta",
    free_slot: "Laisva sodinimui (spustelėkite, kad pasodintumėte)",
    grown_in_year: "{year} m. augo:",

    // Bed types
    type_greenhouse: "Šiltnamis",
    type_raised: "Pakelta lysvė",
    type_ground: "Atviras gruntas",
    type_warm: "Šiltoji lysvė",
    type_berry: "Braškių lysvė",

    // Sections
    sec_left: "Kairioji lysvė",
    sec_center: "Centrinė lysvė",
    sec_right: "Dešinioji lysvė",
    sec_row: "Eilutė",

    // Inspector Drawer
    inspector_title: "Lysvės parametrai",
    inspector_current_planting: "Dabartinis sodinimas ({year} m.)",
    inspector_select_crop_label: "Pasirinkite augalą sodinimui:",
    inspector_combobox_placeholder: "Pradėkite vesti pavadinimą...",
    inspector_create_crop_option: "➕ Sukurti augalą «{name}»",
    inspector_variety_label: "Veislė ar hibridas (nebūtina):",
    inspector_variety_placeholder: "Pavyzdžiui: Jaučio Širdis, Kuraž F1...",
    inspector_notes_label: "Užrašai ir priežiūra:",
    inspector_notes_placeholder: "Laistymas, tręšimas, mulčiavimas, sodinimo datos...",
    inspector_rotation_analysis: "Sėjomainos agronominė analizė",
    inspector_btn_save: "💾 Išsaugoti sodinimą",
    inspector_btn_clear_bed: "🗑️ Atlaisvinti lysvę",
    inspector_geometry_title: "Matmenys ir konstrukcijos tipas",
    inspector_width_label: "Plotis (m):",
    inspector_length_label: "Ilgis (m):",
    inspector_bed_name_label: "Lysvės pavadinimas:",
    inspector_bed_type_label: "Konstrukcijos tipas:",
    inspector_history_title: "Sėjomainos istorija pagal metus",

    // Create custom crop modal
    create_crop_modal_title: "Pridėti naują augalą į duomenų bazę",
    create_crop_name_label: "Augalo pavadinimas:",
    create_crop_name_placeholder: "Pavyzdžiui: Fizalis, Patisonas, Šparagai...",
    create_crop_emoji_label: "Piktograma (emoji) žemėlapiui:",
    create_crop_family_label: "Botaninė šeima:",
    create_crop_rotation_label: "Grąžinimo į lysvę laikotarpis (metais):",
    create_crop_btn_submit: "➕ Išsaugoti ir pasirinkti",
    create_crop_btn_cancel: "Atšaukti",

    // Rotation Summary Tab
    summary_title: "Sėjomainos suvestinė {year} metams",
    summary_subtitle: "Automatinis visų lysvių patikrinimas pagal agronomijos taisykles dirvožemio nualinimui išvengti",
    summary_stat_total: "Iš viso lysvių",
    summary_stat_good: "Puiki sėjomaina",
    summary_stat_warning: "Reikalauja dėmesio",
    summary_stat_danger: "Pavojingi kartojimai",
    summary_table_bed: "Lysvė / Sekcija",
    summary_table_current: "Sodinimas {year}",
    summary_table_prev: "Priešsėlis {prevYear}",
    summary_table_status: "Agronomo vertinimas",
    summary_table_action: "Veiksmas",

    // Encyclopedia Tab
    encyclo_title: "Agronominis augalų žinynas",
    encyclo_subtitle: "Augalų šeimos, grąžinimo laikotarpiai, geriausi priešsėliai ir sėjomainos dėsniai",
    encyclo_search_placeholder: "Ieškoti augalo pagal pavadinimą ar šeimą...",
    encyclo_btn_custom_crop: "➕ Mano augalas",
    encyclo_family_filter_all: "Visos šeimos",
    encyclo_return_period: "Grąžinimo laikotarpis: {years} metai",
    encyclo_best_predecessors: "Geriausi priešsėliai:",
    encyclo_bad_predecessors: "Nepageidaujami priešsėliai:",
    encyclo_agronomic_tip: "Agronomo patarimas:",

    // Rules & Calculator Tab
    rules_title: "Agronominės taisyklės & Interaktyvi skaičiuoklė",
    rules_subtitle: "Patikrinkite bet kurių augalų suderinamumą prieš sodindami ir sužinokite mokslinius sėjomainos dėsnius",
    calc_box_title: "🧪 Interaktyvi suderinamumo skaičiuoklė",
    calc_what_plant: "Ką norite sodinti?",
    calc_what_was: "Kas šioje vietoje augo praėjusiais metais?",
    calc_btn_check: "Patikrinti sėjomainą",
    calc_result_title: "Agronomo išvada:",

    // Backup & DB Modal
    db_modal_title: "Duomenų bazės valdymas ir atsarginės kopijos",
    db_modal_desc: "Visi jūsų duomenys saugomi vietoje šiame kompiuteryje. Čia galite atsisiųsti atsarginę kopiją arba įkelti išsaugotą failą į kitą kompiuterį.",
    db_btn_download: "📥 Atsisiųsti atsarginę kopiją (JSON)",
    db_btn_upload: "📤 Įkelti iš failo (JSON)",
    db_btn_reset: "⚠️ Atstatyti demonstracinį planą",

    // Toast messages
    toast_saved: "✓ Pakeitimai sėkmingai išsaugoti!",
    toast_cleared: "Planas išvalytas. Pridėkite savo lysves!",
    toast_demo_loaded: "Demonstracinis planas sėkmingai įkeltas!",
    toast_crop_created: "Augalas «{name}» sėkmingai pridėtas!",
    toast_arranged: "📏 Takeliai tarp lysvių tvarkingai išlyginti!",
    toast_backup_downloaded: "Atsarginės kopijos failas sėkmingai atsisiųstas!",
    toast_backup_imported: "Daržo duomenys sėkmingai atkurti iš failo!",
    toast_lang_changed: "Sąsajos kalba pakeista į: Lietuvių",

    // Evaluation messages
    eval_optimal: "Puiki sėjomaina",
    eval_warning: "Leistina su išlygomis",
    eval_danger: "Sėjomainos pažeidimas!",
    eval_neutral: "Augalas nepasirinktas",
    eval_no_history: "Nėra duomenų apie priešsėlius",
    eval_no_history_reason: "Pirmieji šios lysvės apskaitos metai.",
    eval_no_history_advice: "Sodinant rekomenduojama įterpti kompleksinių trąšų arba komposto.",
    eval_fallow_title: "Puikus pasirinkimas",
    eval_fallow_reason: "Dirvos poilsis arba sideratas atkuria derlingumą.",
    eval_fallow_advice: "Dirvožemis sukaups organinių medžiagų ir atsikratys patogenų.",
    eval_err_monoculture: "❌ Monokultūros klaida: {crop} sodinamas toje pačioje vietoje antrus metus iš eilės! Tai sukelia staigų derliaus sumažėjimą.",
    eval_err_family: "❌ Giminingi augalai iš eilės ({family}): priešsėlis «{prevCrop}» turi bendrų kenkėjų ir ligų su «{crop}».",
    eval_warn_bad_pred: "⚠️ «{prevCrop}» yra netinkamas priešsėlis augalui «{crop}».",
    eval_good_pred: "✅ Idealus priešsėlis: po «{prevCrop}» dirva optimaliai paruošta augalui «{crop}».",
    eval_warn_return: "ℹ️ Giminingas augalas ({prevCrop}) čia jau augo prieš {years} m. (rekomenduojama pertrauka: {minYears} metai).",
    eval_warn_heavy: "⚠️ Dėmesio: du didelio maisto medžiagų poreikio augalai iš eilės («{prevCrop}» -> «{crop}»). Reikės papildomo organinio tręšimo.",
    eval_balanced: "Sėjomaina subalansuota, jokių problemų nėra.",
    eval_default_advice: "Laikykitės laistymo ir tręšimo režimo."
  }
};

/**
 * Локализованные названия демонстрационных грядок для многоязычности
 */
const DEMO_BED_LOCALIZED_NAMES = {
  'bed-gh-1': {
    ru: 'Теплица 1 (Стеклянная, 3 грядки)',
    et: 'Kasvuhoone 1 (Klaas, 3 peenart)',
    lv: 'Siltumnīca 1 (Stikls, 3 dobes)',
    lt: 'Šiltnamis 1 (Stiklas, 3 lysvės)'
  },
  'bed-gh-2': {
    ru: 'Теплица 2 (Поликарбонат, 3 грядки)',
    et: 'Kasvuhoone 2 (Polükarbonaat, 3 peenart)',
    lv: 'Siltumnīca 2 (Polikarbonāts, 3 dobes)',
    lt: 'Šiltnamis 2 (Polikarbonatas, 3 lysvės)'
  },
  'bed-row1-1': {
    ru: 'Грядка 1 (Чесночная)',
    et: 'Peenar 1 (Küüslauk)',
    lv: 'Dobe 1 (Ķiploki)',
    lt: 'Lysvė 1 (Česnakai)'
  },
  'bed-row1-2': {
    ru: 'Грядка 2 (Морковная)',
    et: 'Peenar 2 (Porgand)',
    lv: 'Dobe 2 (Burkāni)',
    lt: 'Lysvė 2 (Morkos)'
  },
  'bed-row1-3': {
    ru: 'Грядка 3 (Луковая)',
    et: 'Peenar 3 (Sibul)',
    lv: 'Dobe 3 (Sīpoli)',
    lt: 'Lysvė 3 (Svogūnai)'
  },
  'bed-row2-1': {
    ru: 'Грядка 4 (Кабачки & Патиссоны)',
    et: 'Peenar 4 (Suvikõrvits & Patisson)',
    lv: 'Dobe 4 (Kabači & Patisoni)',
    lt: 'Lysvė 4 (Cukinijos & Patisonai)'
  },
  'bed-row2-2': {
    ru: 'Грядка 5 (Бобовая / Горох)',
    et: 'Peenar 5 (Herned & Oad)',
    lv: 'Dobe 5 (Zirņi & Pupiņas)',
    lt: 'Lysvė 5 (Žirniai & Pupelės)'
  },
  'bed-row2-3': {
    ru: 'Грядка 6 (Свёкла столовая)',
    et: 'Peenar 6 (Punapeet)',
    lv: 'Dobe 6 (Galda bietes)',
    lt: 'Lysvė 6 (Burokėliai)'
  },
  'bed-berry-1': {
    ru: 'Клубничник 1 (Молодой, 2-й год)',
    et: 'Maasikad 1 (Noor, 2. aasta)',
    lv: 'Zemenes 1 (Jaunās, 2. gads)',
    lt: 'Braškės 1 (Jaunos, 2-ti metai)'
  },
  'bed-berry-2': {
    ru: 'Клубничник 2 (Взрослый, 3-й год)',
    et: 'Maasikad 2 (Kandeeas, 3. aasta)',
    lv: 'Zemenes 2 (Pieaugušās, 3. gads)',
    lt: 'Braškės 2 (Subrendusios, 3-ti metai)'
  },
  'bed-potato-field': {
    ru: 'Картофельный участок (Поле)',
    et: 'Kartulipõld (Avamaa)',
    lv: 'Kartupeļu lauks (Platība)',
    lt: 'Bulvių laukas (Plotas)'
  },
  'bed-green-manure': {
    ru: 'Грядка 9 (Оздоровление: Фацелия)',
    et: 'Peenar 9 (Mulla parandus: Keerispea)',
    lv: 'Dobe 9 (Atveseļošana: Facēlija)',
    lt: 'Lysvė 9 (Sveikatinimas: Facelija)'
  },
  'bed-herbs': {
    ru: 'Грядка 10 (Аптекарский огород & Зелень)',
    et: 'Peenar 10 (Ürdiaed & Maitseroheline)',
    lv: 'Dobe 10 (Garšaugu dārzs & Zaļumi)',
    lt: 'Lysvė 10 (Prieskonių darželis & Žalumynai)'
  },
  'bed-beans': {
    ru: 'Грядка 11 (Кустовая фасоль & Кукуруза)',
    et: 'Peenar 11 (Põõsashabe & Mais)',
    lv: 'Dobe 11 (Krūmu pupiņas & Kukurūza)',
    lt: 'Lysvė 11 (Krūminės pupelės & Kukurūzai)'
  },
  'bed-pumpkin-patch': {
    ru: 'Грядка 12 (Тыквенная поляна / Компост)',
    et: 'Peenar 12 (Kõrvitsapeenar / Kompost)',
    lv: 'Dobe 12 (Ķirbju lauks / Komposts)',
    lt: 'Lysvė 12 (Moliūgų plotas / Kompostas)'
  }
};

class I18nManager {
  constructor() {
    this.currentLanguage = this.loadInitialLanguage();
  }

  loadInitialLanguage() {
    try {
      const saved = localStorage.getItem(I18N_STORAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
        return saved;
      }
      // Check browser navigator language
      const navLang = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
      if (SUPPORTED_LANGUAGES.some(l => l.code === navLang)) {
        return navLang;
      }
    } catch (e) {
      console.warn('I18n: localStorage unavailable', e);
    }
    return 'ru';
  }

  getLanguage() {
    return this.currentLanguage;
  }

  setLanguage(langCode) {
    if (!SUPPORTED_LANGUAGES.some(l => l.code === langCode)) {
      console.warn(`Unsupported language: ${langCode}`);
      return;
    }
    this.currentLanguage = langCode;
    try {
      localStorage.setItem(I18N_STORAGE_KEY, langCode);
    } catch (e) {}

    // Apply translations across DOM
    this.applyToDOM();

    // Notify the rest of the application
    window.dispatchEvent(new CustomEvent('language-changed', {
      detail: { language: langCode }
    }));
  }

  t(key, params = {}) {
    const dict = UI_TRANSLATIONS[this.currentLanguage] || UI_TRANSLATIONS.ru;
    let text = dict[key] || UI_TRANSLATIONS.ru[key] || key;

    // Replace {paramName}
    if (params && typeof params === 'object') {
      Object.keys(params).forEach(p => {
        text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
      });
    }
    return text;
  }

  getBedName(bed) {
    if (!bed) return '';
    const name = bed.name || '';
    if (DEMO_BED_LOCALIZED_NAMES[bed.id]) {
      const loc = DEMO_BED_LOCALIZED_NAMES[bed.id];
      return loc[this.currentLanguage] || loc.ru || name;
    }

    const lang = this.currentLanguage || 'ru';

    // 1. "Рядок 1 (Левый)" / "Rida 1 (Vasak)" / "Rinda 1 (Kreisā)" / "Eilutė 1 (Kairė)"
    const rowSubMatch = name.match(/^(?:Рядок|Rida|Rinda|Eilutė)\s*(\d+)\s*\((.*?)\)$/i);
    if (rowSubMatch) {
      const num = rowSubMatch[1];
      const side = rowSubMatch[2].trim();
      let locSide = side;
      if (/лев|vasak|kreis|kair/i.test(side)) {
        locSide = lang === 'et' ? 'Vasak' : lang === 'lv' ? 'Kreisā' : lang === 'lt' ? 'Kairė' : 'Левый';
      } else if (/прав|parem|lab|dešin/i.test(side)) {
        locSide = lang === 'et' ? 'Parem' : lang === 'lv' ? 'Labā' : lang === 'lt' ? 'Dešinė' : 'Правый';
      } else if (/центр|kesk|centr/i.test(side)) {
        locSide = lang === 'et' ? 'Kesk' : lang === 'lv' ? 'Centrs' : lang === 'lt' ? 'Centras' : 'Центр';
      }
      const prefix = lang === 'et' ? 'Rida' : lang === 'lv' ? 'Rinda' : lang === 'lt' ? 'Eilutė' : 'Рядок';
      return `${prefix} ${num} (${locSide})`;
    }

    // 2. Секции внутри теплицы (полные названия)
    if (/^(?:Левая грядка|Vasak peenar|Kreisā dobe|Kairioji lysvė)$/i.test(name.trim())) {
      if (lang === 'et') return 'Vasak peenar';
      if (lang === 'lv') return 'Kreisā dobe';
      if (lang === 'lt') return 'Kairioji lysvė';
      if (lang === 'ru') return 'Левая грядка';
    }
    if (/^(?:Правая грядка|Parem peenar|Labā dobe|Dešinioji lysvė)$/i.test(name.trim())) {
      if (lang === 'et') return 'Parem peenar';
      if (lang === 'lv') return 'Labā dobe';
      if (lang === 'lt') return 'Dešinioji lysvė';
      if (lang === 'ru') return 'Правая грядка';
    }
    if (/^(?:Центральная грядка|Keskpeenar|Centrālā dobe|Centrinė lysvė)$/i.test(name.trim())) {
      if (lang === 'et') return 'Keskpeenar';
      if (lang === 'lv') return 'Centrālā dobe';
      if (lang === 'lt') return 'Centrinė lysvė';
      if (lang === 'ru') return 'Центральная грядка';
    }

    // 3. Отдельные названия сторон (Левый / Vasak / Kreisā / Kairė)
    if (/^(?:левый|левая|vasak|kreisā?|kairė|kairioji)$/i.test(name.trim())) {
      return lang === 'et' ? 'Vasak' : lang === 'lv' ? 'Kreisā' : lang === 'lt' ? 'Kairė' : 'Левый';
    }
    if (/^(?:правый|правая|parem|labā?|dešinė|dešinioji)$/i.test(name.trim())) {
      return lang === 'et' ? 'Parem' : lang === 'lv' ? 'Labā' : lang === 'lt' ? 'Dešinė' : 'Правый';
    }
    if (/^(?:центр|центральный|центральная|kesk|centrs|centras|centrinė)$/i.test(name.trim())) {
      return lang === 'et' ? 'Kesk' : lang === 'lv' ? 'Centrs' : lang === 'lt' ? 'Centras' : 'Центр';
    }

    // 4. "Рядок 1", "Rida 1", "Rinda 1", "Eilutė 1"
    const rowMatch = name.match(/^(?:Рядок|Rida|Rinda|Eilutė)\s*(\d+.*)$/i);
    if (rowMatch) {
      const numPart = rowMatch[1];
      if (lang === 'et') return `Rida ${numPart}`;
      if (lang === 'lv') return `Rinda ${numPart}`;
      if (lang === 'lt') return `Eilutė ${numPart}`;
      if (lang === 'ru') return `Рядок ${numPart}`;
    }

    // 5. "Грядка 1", "Peenar 1", "Dobe 1", "Lysvė 1"
    const bedMatch = name.match(/^(?:Грядка|Peenar|Dobe|Lysvė)\s*(\d+.*)$/i);
    if (bedMatch) {
      const numPart = bedMatch[1];
      if (lang === 'et') return `Peenar ${numPart}`;
      if (lang === 'lv') return `Dobe ${numPart}`;
      if (lang === 'lt') return `Lysvė ${numPart}`;
      if (lang === 'ru') return `Грядка ${numPart}`;
    }

    // 6. "Теплица 1", "Kasvuhoone 1", "Siltumnīca 1", "Šiltnamis 1"
    const ghMatch = name.match(/^(?:Теплица|Kasvuhoone|Siltumnīca|Šiltnamis)\s*(\d+.*)$/i);
    if (ghMatch) {
      const numPart = ghMatch[1];
      if (lang === 'et') return `Kasvuhoone ${numPart}`;
      if (lang === 'lv') return `Siltumnīca ${numPart}`;
      if (lang === 'lt') return `Šiltnamis ${numPart}`;
      if (lang === 'ru') return `Теплица ${numPart}`;
    }

    return name;
  }

  applyToDOM() {
    // 1. Update text content for elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key);
      }
    });

    // 2. Update tooltips for elements with data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', this.t(key));
      }
    });

    // 3. Update placeholders for elements with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.setAttribute('placeholder', this.t(key));
      }
    });

    // 4. Update html lang attribute
    document.documentElement.lang = this.currentLanguage;
  }
}

// Global singleton instance
window.i18n = new I18nManager();
window.t = (key, params) => window.i18n.t(key, params);
I18nManager.getCurrentLanguage = () => (window.i18n ? window.i18n.getLanguage() : 'ru');

