/**
 * Модуль информационных и сервисных диалоговых окон:
 * - openHelpModal: Интерактивное руководство пользователя по приложению
 * - openDonateModal: Окно поддержки проекта
 * - openInstallModal: Инструкция по установке PWA на ПК и мобильные
 * - openFeedbackModal: Форма обратной связи с автором
 */

(function() {
  if (typeof GardenApp === 'undefined') {
    console.error('GardenApp is not defined. Ensure js/app.js is loaded first.');
    return;
  }

  Object.assign(GardenApp.prototype, {
  openHelpModal() {
    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) return;

    const lang = (window.i18n && window.i18n.getLanguage()) || document.documentElement.lang || 'ru';
    const tr = (k) => (window.t ? window.t(k) : k);

    // Локализованные разделы инструкции
    const HELP_CONTENT = {
      ru: {
        title: "📖 Руководство пользователя «Умный Огород» (v8.6)",
        subtitle: "Интерактивная инструкция: Живой сад, декор, лунки, каталог сортов, календарь работ и подкормок, севооборот и сохранение",
        tabs: [
          { id: 'quickstart', label: '🚀 Быстрый старт' },
          { id: 'holes', label: '🌱 Лунки и сорта' },
          { id: 'rotation', label: '🔄 Севооборот и культуры' },
          { id: 'beds', label: '📦 Грядки и декор' },
          { id: 'care', label: '🧪 Подкормки и календарь' },
          { id: 'data', label: '💾 Сохранение и печать' },
          { id: 'tips', label: '💡 Советы агронома' },
          { id: 'donate', label: '☕ Поддержать автора' },
          { id: 'feedback', label: '✈️ Связь и Telegram' }
        ],
        sections: {
          quickstart: [
            {
              icon: '🎨',
              title: 'Два стиля карты: «🎨 Живой сад» и «📐 Схема»',
              desc: 'Переключайте оформление участка в 1 клик на панели карты: объёмный 3D-стиль <strong>«🎨 Живой сад»</strong> (деревянные короба, арочные теплицы, живая зелень и лужайка) или строгий чертёж <strong>«📐 Схема»</strong>. В режиме «Живой сад» можно также менять сезон: <strong>🌸 Весна</strong>, <strong>☀️ Лето</strong> и <strong>🍂 Осень</strong>.'
            },
            {
              icon: '🖱️',
              title: 'Перемещение, масштаб и стрелки D-pad',
              desc: 'Перетаскивайте огород мышью (или пальцем на телефоне), масштабируйте колёсиком (15%–200%). В правом нижнем углу есть пульт со стрелками <strong>▲ ▼ ◀ ▶ ⛶</strong> (работают и стрелки на клавиатуре), а кнопки <strong>⛶ Вписать всё</strong> и <strong>📍 Центр</strong> мгновенно вернут весь участок на экран.'
            },
            {
              icon: '↩️',
              title: 'Отмена случайного переноса (↩️ Отменить / Ctrl+Z)',
              desc: 'Зажмите заголовок грядки или маркер <span class="help-kbd">⋮⋮</span>, чтобы перетащить её. Если вы случайно сдвинули грядку на телефоне или ПК — внизу появится кнопка <strong>↩️ Отменить</strong> (или нажмите <span class="help-kbd">Ctrl+Z</span>), которая сразу вернёт грядку на место.'
            },
            {
              icon: '⚙️',
              title: 'Простой режим и режим «⚙️ Агроном»',
              desc: 'Кликните на любую грядку — справа откроется Инспектор. По умолчанию он простой и чистый (культура, сорт, лунки, заметки, подкормки). Нажмите <strong>⚙️ Агроном</strong>, чтобы раскрыть подробный севооборот, калькулятор полива, расчёт семян и рекомендации.'
            },
            {
              icon: '📏',
              title: 'Автоматическая расстановка дорожек (60 см)',
              desc: 'Кнопка <strong>📏 Расставить дорожки</strong> мгновенно выстраивает все грядки ровными рядами с удобными проходами по 60 см без наложений.'
            },
            {
              icon: '📲',
              title: 'Мобильная версия и установка без интернета (PWA)',
              desc: 'На телефоне интерфейс автоматически упрощается (только главные кнопки). Нажмите <strong>📲 Установить</strong> в верхнем меню — программа установится как обычное приложение и будет работать на даче даже без интернета.'
            }
          ],
          holes: [
            {
              icon: '⚡',
              title: 'Схемы посадки по лункам (от 1 до 60 шт.)',
              desc: 'Для любой грядки или рядка теплицы настройте схему лунок: <strong>⚡ Шахматка</strong>, <strong>═ 2 ряда</strong> или <strong>─ 1 ряд</strong>. Количество лунок задаётся от <strong>1 до 60 шт.</strong> кнопками <span class="help-kbd">−</span> / <span class="help-kbd">+</span> или прямым вводом числа.'
            },
            {
              icon: '🗺️',
              title: 'Наглядная лента лунок прямо на грядке',
              desc: 'Включённые лунки равномерно растягиваются по всей длине грядки над названием культуры и не перекрывают кнопки управления. Рядом отображается счётчик высадки (<em>🌱 12/20</em>).'
            },
            {
              icon: '🍅',
              title: 'Разные сорта на одной грядке и быстрое заполнение',
              desc: 'В одну грядку можно посадить разные сорта: например, лунки 1–5 — <em>«Черри»</em>, 6–15 — <em>«Бычье сердце»</em>. В блоке быстрого заполнения укажите диапазон, выберите сорт и нажмите <strong>«Заполнить»</strong>.'
            },
            {
              icon: '🏷️',
              title: 'Обновлённая 2-колоночная «🏷️ Картотека сортов»',
              desc: 'Откройте <strong>🏷️ Каталог сортов</strong> в шапке программы: слева — всегда открытая форма добавления нового сорта, справа — поиск, редактирование и удаление ваших карточек. Прямо здесь есть кнопка <strong>«➕ Своя культура»</strong>.'
            },
            {
              icon: '📸',
              title: 'Фото пакетиков семян (файл, перетаскивание и Ctrl+V)',
              desc: 'В картотеке сортов и в окне лунки можно сфотографировать пакетик семян, перетащить картинку мышкой или просто вставить скопированное изображение из интернета клавишами <span class="help-kbd">Ctrl+V</span>.'
            },
            {
              icon: '🖨️',
              title: 'Печать каталога сортов (A4)',
              desc: 'Внутри окна «🏷️ Каталог сортов» нажмите <strong>«🖨️ Распечатать каталог (A4)»</strong> — программа соберёт аккуратный список ваших сортов с фотографиями и заметками для печати или PDF.'
            }
          ],
          rotation: [
            {
              icon: '🎛️',
              title: 'Кнопка «🔄 Севооборот: Вкл / Выкл»',
              desc: 'Не хотите видеть подсказки и красные предупреждения? Нажмите кнопку <strong>🔄 Севооборот: Вкл</strong> на панели фильтров — все значки севооборота и легенда мгновенно скроются, а при необходимости так же легко включатся обратно.'
            },
            {
              icon: '🟢',
              title: 'Зелёный индикатор — «Идеально ✓»',
              desc: 'Превосходный предшественник! Растения принадлежат к разным ботаническим семействам, почва отдохнула, отсутствуют общие болезни и вредители.'
            },
            {
              icon: '🟡',
              title: 'Жёлтый индикатор — «Внимание !»',
              desc: 'Допустимый предшественник. Посадка возможна, но желательно обогатить почву: внести перегной, компост, биогумус или золу.'
            },
            {
              icon: '🔴',
              title: 'Красный индикатор — «Нарушение ✕»',
              desc: 'Недопустимо! Родственные культуры одного семейства подряд (напр. томат после картофеля — оба Паслёновые). Высокий риск фитофторы, нематод и истощения почвы.'
            },
            {
              icon: '➕',
              title: 'Живой поиск и создание своей культуры в 1 клик',
              desc: 'Начните вводить название в поиске культур. Если редкого растения нет в базе, нажмите <strong>«➕ Создать культуру»</strong>, выберите значок и семейство — оно навсегда добавится в вашу базу и будет учитываться в севообороте.'
            },
            {
              icon: '👁️',
              title: 'Режим «Наложить прошлый год» и рекомендации',
              desc: 'Кнопка <strong>👁️ Наложить прошлый год</strong> показывает посадки прошлого сезона поверх карты. А в режиме <strong>⚙️ Агроном</strong> Инспектор сам предлагает <strong>ТОП лучших культур</strong> для выбранной грядки.'
            }
          ],
          beds: [
            {
              icon: '🌳',
              title: 'Декор участка («🌳 Декор»): дом, деревья, заборы, дорожки',
              desc: 'Нажмите <strong>🌳 Декор</strong> на панели карты, чтобы расставить по участку дом, беседку, яблоню, вишню, кусты, бочку, колодец, компост, пруд, клумбу, каменную дорожку и деревянный забор.'
            },
            {
              icon: '🧱',
              title: 'Кнопка «➕ Продлить» встык для заборов и дорожек',
              desc: 'Кликните на любой объект декора — появится панель действий: <strong>➕ Продлить</strong> (ставит следующую секцию забора или дорожки ровно встык!), <strong>➕ Ещё</strong>, <strong>↻ Повернуть</strong> и <strong>🗑️ Удалить</strong> (работает и клавиша <span class="help-kbd">Delete</span>).'
            },
            {
              icon: '📊',
              title: 'Деление грядки до 10 независимых рядков',
              desc: 'Любую грядку или теплицу можно разделить на <strong>1–10 отдельных рядков (секций)</strong> прямо в Инспекторе. У каждого рядка — своя культура, свой сорт, свои лунки и своя история.'
            },
            {
              icon: '🌿',
              title: 'Совместные посадки («Вторая культура рядом»)',
              desc: 'В Инспекторе грядки можно выбрать <strong>🌿 Вторую культуру рядом</strong> (например, <em>🫛 Горох + 🥕 Морковь</em> или <em>🍅 Томат + 🌿 Базилик</em>) — обе культуры красиво отобразятся на табличке грядки.'
            },
            {
              icon: '📐',
              title: 'Конструктор: теплицы, короба, ряды и сетки',
              desc: 'Кнопка <strong>➕ Новая грядка</strong> позволяет создать теплицу, деревянный короб, открытый грунт, клубничник или тёплую грядку — по одной, целым рядом (2–8 шт.) или сеткой (например, 3 × 4).'
            }
          ],
          care: [
            {
              icon: '🧪',
              title: 'Новый «🧪 Календарь подкормок и обработок»',
              desc: 'Нажмите <strong>🧪 Подкормки</strong> в верхней панели: выбирайте дату, тип (подкормка, обработка, полив, уход), нужную грядку или весь огород и записывайте, чем кормили. Есть быстрые кнопки-подсказки (зола, перегной, фитоспорин и др.).'
            },
            {
              icon: '🔀',
              title: 'Сравнение подкормок по сезонам (2025 и 2026) и повтор в 1 клик',
              desc: 'В календаре подкормок переключайте годы или нажмите <strong>«🔀 Сравнить 2025 и 2026»</strong> — откроются две колонки рядом. Любую прошлогоднюю подкормку можно повторить в текущем сезоне в 1 клик! Все записи синхронизируются с журналом внутри каждой грядки.'
            },
            {
              icon: '📅',
              title: 'Интерактивный «📅 Календарь работ» с галочками и датами',
              desc: 'Кнопка <strong>📅 Календарь</strong> в шапке открывает план садовых дел по месяцам: ставьте галочки ☑️ о выполнении, указывайте точные даты, добавляйте <strong>свои дела</strong> на любой день и следите за шкалой прогресса.'
            },
            {
              icon: '💧',
              title: 'Умный калькулятор полива по погоде (режим «⚙️ Агроном»)',
              desc: 'Включите <strong>⚙️ Агроном</strong> в Инспекторе грядки: калькулятор сам рассчитает норму воды на грядку и на каждый куст с учётом погоды — <strong>☀️ Жара</strong>, <strong>⛅ Норма</strong> или <strong>🌧️ Дождь</strong>.'
            },
            {
              icon: '📸',
              title: 'Фотогалерея грядки по годам',
              desc: 'Сохраняйте фото рассады, цветения и урожая прямо в карточке грядки — создавайте наглядную летопись вашего участка из года в год.'
            }
          ],
          data: [
            {
              icon: '⚠️',
              title: 'Напоминание: «💾 Внесли изменения? Не забудьте сохранить!»',
              desc: 'Все правки автоматически сохраняются в памяти вашего браузера (LocalStorage). Но чтобы не потерять данные при очистке браузера или перенести их на телефон — нажимайте яркую кнопку <strong>💾 Внесли изменения? Не забудьте сохранить!</strong> в верхней панели и скачивайте файл копии (.json).'
            },
            {
              icon: '📥',
              title: 'Сохранение и загрузка плана из файла (.json)',
              desc: 'В меню <strong>💾 Резервная копия</strong> нажмите <strong>📥 Сохранить план в файл</strong> — сохранятся все грядки, декор, лунки, фото сортов, календарь работ и подкормки. На другом устройстве откройте этот файл кнопкой <strong>📤 Загрузить план из файла</strong>.'
            },
            {
              icon: '🖨️',
              title: 'Печать на А4: план, календарь работ, подкормки и сорта',
              desc: 'Печатать или сохранять в PDF (формат А4) теперь можно всё: общий <strong>план огорода</strong>, <strong>календарь работ</strong>, <strong>журнал подкормок</strong> и <strong>каталог сортов с фото</strong>!'
            },
            {
              icon: '📲',
              title: 'Автономная работа на даче (PWA)',
              desc: 'Установите программу через кнопку <strong>📲 Установить</strong> — она будет открываться с рабочего стола или экрана смартфона и работать полностью без интернета.'
            },
            {
              icon: '🔄',
              title: 'Демо-образец для знакомства',
              desc: 'Кнопка <strong>🔄 Демо-пример</strong> в меню резервной копии загружает готовый участок с грядками, теплицами и историей за 3 года (2024–2026).'
            }
          ],
          tips: [
            {
              icon: '🌿',
              title: 'Золотое правило 3–4 лет',
              desc: 'Культуры одного ботанического семейства (Паслёновые, Крестоцветные, Тыквенные, Луковые) не должны возвращаться на прежнюю грядку раньше, чем через 3–4 года.'
            },
            {
              icon: '🌾',
              title: 'Сидераты — лекари почвы',
              desc: 'Посев горчицы, фацелии, ржи или вики после сбора урожая дезинфицирует почву, подавляет споры вредных грибков и насыщает грунт органикой.'
            },
            {
              icon: '🥕',
              title: 'Чередование глубины залегания корней',
              desc: 'После культур со стержневыми глубокими корнями (морковь, томат) сажайте растения с мочковатой поверхностной системой (лук, чеснок, огурцы, салат).'
            },
            {
              icon: '🤝',
              title: 'Растения-компаньоны (дружественные соседи)',
              desc: 'Бархатцы и календула отпугивают нематод и бабочек-белянок. Базилик возле томатов отгоняет вредителей и улучшает вкусовые качества плодов.'
            }
          ],
          donate: [
            {
              icon: '💻',
              title: 'Разработка программ на заказ',
              desc: 'Хотите персональную программу, веб-сервис или бота лично для себя, семьи или бизнеса? Напишите мне в Telegram: <a href="https://t.me/igorSurkin" target="_blank" style="color: #0088cc; font-weight: 700;">@igorSurkin</a> или на почту <strong style="color:var(--primary);">igor.surkin64@gmail.com</strong>.'
            },
            {
              icon: '🧡',
              title: 'Поддержка автора (Revolut, Apple Pay, карты)',
              desc: 'Быстрая поддержка автора в 1 клик через Revolut, Apple Pay, Google Pay или любую банковскую карту:<br><a href="https://revolut.me/isurkin" target="_blank" style="color: #f15f2c; font-weight: 700; text-decoration: underline;">https://revolut.me/isurkin</a>'
            },
            {
              icon: '🇪🇪',
              title: 'Банковский перевод (EUR): Swedbank SEPA',
              desc: 'Получатель: <strong>IGOR SURKIN</strong><br>Банк: <strong>Swedbank AS (Estonia, SEPA Instant)</strong><br>IBAN: <strong class="help-kbd" style="font-size:0.95rem;">EE882200001105095456</strong><br>Назначение: <em>Toetus / Благодарность за программу</em>'
            }
          ],
          feedback: [
            {
              icon: '🚀',
              title: 'Прямая отправка в Telegram-чат проекта',
              desc: 'В окне <strong>«💡 Идеи и отзывы»</strong> напишите ваше предложение или вопрос и нажмите синюю кнопку <strong>«🚀 Отправить прямо в Telegram-чат»</strong> — бот мгновенно доставит сообщение в чат сообщества @smartgarden_chat!'
            },
            {
              icon: '💡',
              title: 'Предложить новую функцию или улучшение',
              desc: 'Есть идея, как сделать планировщик ещё удобнее? Напишите нам, и автор обязательно рассмотрит и добавит её в ближайших обновлениях.'
            },
            {
              icon: '🌱',
              title: 'Добавить культуру, сорт или региональное правило',
              desc: 'Если в энциклопедии не хватает вашего любимого растения или сорта — напишите нам! Мы оперативно добавим его характеристики, совместимость и сроки возврата.'
            },
            {
              icon: '🐛',
              title: 'Сообщить об ошибке или неточности',
              desc: 'Заметили опечатку, сбой в расчёте севооборота или странное поведение интерфейса? Сообщите через форму обратной связи — исправим немедленно.'
            },
            {
              icon: '✉️',
              title: 'Прямой email автора',
              desc: 'Вы также можете написать напрямую на почту: <strong style="color:var(--primary);">igor.surkin64@gmail.com</strong>. Автор лично отвечает на все письма садоводов.'
            }
          ]
        }
      },
      et: {
        title: "📖 Kasutusjuhend «Minu Aed» (v8.7)",
        subtitle: "Interaktiivne juhend: Elav aed, dekoor, istutuspesad, sordikataloog, töö- ja väetamiskalender, külvikord",
        tabs: [
          { id: 'quickstart', label: '🚀 Kiire algus' },
          { id: 'holes', label: '🌱 Istutuspesad ja sordid' },
          { id: 'rotation', label: '🔄 Külvikord' },
          { id: 'beds', label: '📦 Peenrad ja dekoor' },
          { id: 'care', label: '🧪 Väetamine ja kalender' },
          { id: 'data', label: '💾 Salvestamine ja trükk' },
          { id: 'tips', label: '💡 Nõuanded' },
          { id: 'donate', label: '☕ Toeta autorit' },
          { id: 'feedback', label: '✈️ Tagasiside & Telegram' }
        ],
        sections: {
          quickstart: [
            {
              icon: '🎨',
              title: 'Kaks kaardistiili: «🎨 Elav aed» ja «📐 Skeem» + Aastaajad',
              desc: 'Vaheta kaardi välimust 1 klõpsuga: 3D-stiil <strong>«🎨 Elav aed»</strong> (puitpeenrad, kaarkasvuhooned, rohelus) või klassikaline <strong>«📐 Skeem»</strong>. «Elavas aias» saad valida hooaja: <strong>🌸 Kevad</strong>, <strong>☀️ Suvi</strong>, <strong>🍂 Sügis</strong>.'
            },
            {
              icon: '🌳',
              title: 'Aia dekoor («🌳 Dekoor») ja «➕ Pikenda»',
              desc: 'Lisa plaani aiamaja, lehtla, õunapuu, marjapõõsad, tiik, kivitee ja puitaed. Klõpsa objektil, et kasutada <strong>➕ Pikenda</strong> (ühendab aia ja tee täpselt kokku), <strong>↻ Pööra</strong> või <strong>🗑️ Kustuta</strong> (ka klahv <span class="help-kbd">Delete</span>).'
            },
            {
              icon: '🧪',
              title: 'Väetamiskalender («🧪 Väetamine») ja Töökalender («📅 Kalender»)',
              desc: 'Pane kirja väetamised kuupäevade ja peenarde kaupa, võrdle <strong>2025 ja 2026</strong> hooaega kõrvuti ja korda eelmise aasta väetamist 1 klõpsuga. Töökalendris saad märkida tööd tehtuks ☑️ ja lisada oma ülesandeid.'
            },
            {
              icon: '↩️',
              title: 'Juhusliku liigutamise tagasivõtmine ja «🔄 Külvikord: Sees/Väljas»',
              desc: 'Kui liigutad peenart kogemata, ilmub alla nupp <strong>↩️ Võta tagasi</strong> (või <span class="help-kbd">Ctrl+Z</span>). Tööriistaribal saad külvikorra märgid 1 klõpsuga sisse või välja lülitada.'
            },
            {
              icon: '🖱️',
              title: 'Kaardi nihutamine ja suum (Pan & Zoom)',
              desc: 'Hoidke hiire vasakut nuppu all tühjal alal ja lohistage aeda igas suunas. Hiirerattaga saab sujuvalt suumida 15% kuni 200%.'
            },
            {
              icon: '⛶',
              title: '«Sobita vaatesse» ja «Keskenda»',
              desc: 'Nupp <strong>⛶ Sobita vaatesse</strong> arvutab peenarde piirid ja sobitab kogu aia ekraanile. Nupp <strong>📍 Keskenda</strong> tsentreerib vaate.'
            },
            {
              icon: '📏',
              title: 'Automaatne teede paigutus',
              desc: 'Nupp <strong>📏 Paiguta rajad</strong> korrastab peenrad sirgetesse ridadesse mugavate 60 cm vahekäikudega ilma kattumisteta.'
            },
            {
              icon: '🖐️',
              title: 'Peenarde liigutamine',
              desc: 'Haarake peenra päisest või sümbolist <span class="help-kbd">⋮⋮</span> ja lohistage see soovitud asukohta. Koordinaadid salvestuvad automaatselt.'
            },
            {
              icon: '↻',
              title: 'Pööramine ja kopeerimine',
              desc: 'Nupp <strong>↻</strong> pöörab peenart 90°. Nupp <strong>❐</strong> teeb peenrast koopia ja <strong>🗑️</strong> kustutab selle.'
            }
          ],
          holes: [
            {
              icon: '⚡',
              title: 'Istutusskeemid (siksak, 2 rida, 1 rida)',
              desc: 'Iga peenra jaoks saab valida istutusskeemi: siksak <strong>⚡</strong>, 2 rida <strong>═</strong> või 1 rida <strong>─</strong> ja määrata taimepesade arvu (2–40 tk).'
            },
            {
              icon: '🍅',
              title: 'Erinevad sordid ühel peenral',
              desc: 'Võite istutada pesadesse erinevaid sorte (nt kirsstomatid, härjasüda jne) ja märkida igale pesale sordi nime.'
            },
            {
              icon: '⚡',
              title: 'Kiire sortide täitmine',
              desc: 'Määrake pesade vahemik (nt 1–10) ja valige sort — süsteem täidab need ühe klõpsuga.'
            },
            {
              icon: '📸',
              title: 'Sortide kartoteek ja fotod',
              desc: 'Tehke foto seemnepakist või saagist ja salvestage see otse sordi juurde.'
            }
          ],
          rotation: [
            {
              icon: '🟢',
              title: 'Roheline indikaator — «Ideaalne»',
              desc: 'Suurepärane eelvili! Taimed kuuluvad eri sugukondadesse, muld on puhanud ja haigusrisk minimaalne.'
            },
            {
              icon: '🟡',
              title: 'Kollane indikaator — «Tähelepanu»',
              desc: 'Lubatud eelvili. Istutamine on võimalik, kuid soovitatav on lisada komposti või orgaanilist väetist.'
            },
            {
              icon: '🔴',
              title: 'Punane indikaator — «Rikkumine!»',
              desc: 'Mittelubatud! Sama sugukonna taimed järjest (nt tomat pärast kartulit) või ohtlik eelvili. Haiguste ja mulla kurnatuse oht.'
            },
            {
              icon: '💡',
              title: 'Nutikad agronoomi soovitused',
              desc: 'Peenra valimisel analüüsib süsteem varasemate aastate ajalugu ja soovitab kohe parimaid kultuure selleks hooajaks.'
            },
            {
              icon: '👁️',
              title: 'Eelmise aasta kattuvus',
              desc: 'Nupp <strong>👁️ Eelmise aasta kattuvus</strong> kuvab eelmise hooaja taimed poolläbipaistva kihina otse kaardil.'
            }
          ],
          beds: [
            {
              icon: '🏠',
              title: 'Sõltumatute osadega kasvuhooned',
              desc: 'Looge kasvuhooneid 2 või 3 eraldi peenraga (vasak, kesk, parem). Igas osas saab kasvatada eraldi kultuure.'
            },
            {
              icon: '🪵',
              title: 'Erinevad peenratüübid',
              desc: 'Valikus on kasvuhooned, kõrgpeenrad, avamaa, maasikapeenrad ja soojad orgaanilised peenrad.'
            },
            {
              icon: '📐',
              title: 'Peenarde rea või võrgustiku loomine',
              desc: 'Režiimiga <strong>«Rida»</strong> või <strong>«Võrgustik»</strong> saate luua korraga terve grupi peenraid vahekäikudega.'
            },
            {
              icon: '✏️',
              title: 'Sordid ja märkmed',
              desc: 'Igale peenrale või reale saab lisada täpse sordi nime ja hooldusmärkmed kastmise või väetamise kohta.'
            }
          ],
          care: [
            {
              icon: '💧',
              title: 'Kastmiskalkulaator',
              desc: 'Arvutab automaatselt veevajaduse liitrites peenra ja üksikute taimede kohta vastavalt ilmale (kuumus, tavaline, vihm).'
            },
            {
              icon: '📝',
              title: 'Hooldus- ja väetamispäevik',
              desc: 'Salvestage väetamise, kastmise ja taimekaitse kuupäevad ning märkmed otse peenra kaardile.'
            }
          ],
          data: [
            {
              icon: '💾',
              title: 'Täielik autonoomsus ja automaatsalvestus',
              desc: 'Töötab ilma internetita. Kõik andmed salvestuvad kohe kohalikku brauseri mällu (LocalStorage).'
            },
            {
              icon: '📥',
              title: 'Varukoopia eksport (JSON)',
              desc: 'Nupust <strong>«💾 Varukoopia»</strong> laadige alla JSON-fail oma aiaplaaniga andmete kaitsmiseks.'
            },
            {
              icon: '📤',
              title: 'Import teises arvutis',
              desc: 'Nupuga <strong>«📤 Vali fail»</strong> saate salvestatud JSON-faili igal ajal teise arvutisse laadida.'
            },
            {
              icon: '🔄',
              title: 'Näidisplaan proovimiseks',
              desc: 'Nupp <strong>«🔄 Näidisplaan»</strong> laadib kohe valmis aia 26 peenra ja 3 aasta ajalooga.'
            }
          ],
          tips: [
            {
              icon: '🌿',
              title: '3–4 aasta reegel',
              desc: 'Sama botaanilise sugukonna taimed ei tohi naasta samale peenrale varem kui 3–4 aasta pärast.'
            },
            {
              icon: '🌾',
              title: 'Vahekultuurid (haljasväetised)',
              desc: 'Sinep, keerispea või rukis pärast saagikoristust tervendavad mulda ja tõrjuvad haigustekitajaid.'
            },
            {
              icon: '🥕',
              title: 'Juuresüsteemi sügavuse vaheldumine',
              desc: 'Sügavate juurtega taimede (porgand, tomat) järel kasvatage madalate juurtega taimi (sibul, salat, kurk).'
            },
            {
              icon: '🤝',
              title: 'Naabertaimede sobivus',
              desc: 'Saialilled ja peiulilled peletavad kahjureid. Basiilik tomati kõrval parandab viljade maitset.'
            }
          ],
          donate: [
            {
              icon: '💻',
              title: 'Tarkvara arendus tellimusel',
              desc: 'Soovite personaalset programmi, veebiteenust või rakendust endale või ettevõttele? Kirjutage Telegramis: <a href="https://t.me/igorSurkin" target="_blank" style="color: #0088cc; font-weight: 700;">@igorSurkin</a> või e-posti teel <strong style="color:var(--primary);">igor.surkin64@gmail.com</strong>.'
            },
            {
              icon: '🧡',
              title: 'Toeta autorit (Revolut, Apple Pay, kaardid)',
              desc: 'Kiire toetus ühe klõpsuga Revolut, Apple Pay, Google Pay või pangakaardiga:<br><a href="https://revolut.me/isurkin" target="_blank" style="color: #f15f2c; font-weight: 700; text-decoration: underline;">https://revolut.me/isurkin</a>'
            },
            {
              icon: '🇪🇪',
              title: 'Pangaülekanne (EUR): Swedbank SEPA',
              desc: 'Saaja: <strong>IGOR SURKIN</strong><br>Pank: <strong>Swedbank AS (Estonia, SEPA Instant)</strong><br>IBAN: <strong class="help-kbd" style="font-size:0.95rem;">EE882200001105095456</strong><br>Selgitus: <em>Toetus aiatarkvarale</em>'
            }
          ],
          feedback: [
            {
              icon: '💡',
              title: 'Paku välja uus funktsioon või parandus',
              desc: 'Kas teil on mõte, kuidas aia planeerimist mugavamaks teha? Klõpsake ülamenüüs nuppu <strong>«💡 Ideed & tagasiside»</strong>, et saata oma ettepanek otse autorile.'
            },
            {
              icon: '🌱',
              title: 'Lisa aiavilju või sorte',
              desc: 'Kui teatmikust puudub teie lemmiktaim või -sort, kirjutage meile ja me lisame selle järgmisesse uuendusse.'
            },
            {
              icon: '🐛',
              title: 'Teata veast või ebatäpsusest',
              desc: 'Märkasite viga või külvikorra arvutuse ebatäpsust? Andke meile teada tagasiside vormi kaudu.'
            },
            {
              icon: '✉️',
              title: 'Autori otsene kontakt',
              desc: 'Võite kirjutada ka otse e-posti aadressile: <strong style="color:var(--primary);">igor.surkin64@gmail.com</strong>.'
            }
          ]
        }
      },
      lv: {
        title: "📖 Lietotāja rokasgrāmata «Mans Dārzs» (v8.7)",
        subtitle: "Interaktīva pamācība: Dzīvais dārzs, dekors, bedrītes, šķirņu katalogs, darbu un mēslošanas kalendārs",
        tabs: [
          { id: 'quickstart', label: '🚀 Ātrais starts' },
          { id: 'holes', label: '🌱 Stādīšanas bedrītes' },
          { id: 'rotation', label: '🔄 Augseka' },
          { id: 'beds', label: '📦 Dobes un dekors' },
          { id: 'care', label: '🧪 Mēslošana un kalendārs' },
          { id: 'data', label: '💾 Saglabāšana un druka' },
          { id: 'tips', label: '💡 Padomi' },
          { id: 'donate', label: '☕ Atbalstīt autoru' },
          { id: 'feedback', label: '✈️ Saziņa & Telegram' }
        ],
        sections: {
          quickstart: [
            {
              icon: '🎨',
              title: 'Divi kartes stili: «🎨 Dzīvais dārzs» un «📐 Shēma» + Gadalaiki',
              desc: 'Pārslēdziet skatu ar 1 klikšķi: 3D stils <strong>«🎨 Dzīvais dārzs»</strong> (koka dobes, siltumnīcas, zaļumi) vai klasiskā <strong>«📐 Shēma»</strong>. «Dzīvajā dārzā» var mainīt gadalaiku: <strong>🌸 Pavasaris</strong>, <strong>☀️ Vasara</strong>, <strong>🍂 Rudens</strong>.'
            },
            {
              icon: '🌳',
              title: 'Dārza dekors («🌳 Dekors») un «➕ Pagarināt»',
              desc: 'Novietojiet dārza māju, lapeni, ābeli, ogulājus, dīķi, akmeņu taciņu un žogu. Noklikšķiniet uz objekta, lai izmantotu <strong>➕ Pagarināt</strong> (savieno žogu/taciņu cieši kopā), <strong>↻ Pagriezt</strong> vai <strong>🗑️ Dzēst</strong> (<span class="help-kbd">Delete</span>).'
            },
            {
              icon: '🧪',
              title: 'Mēslošanas kalendārs («🧪 Mēslošana») un Darbu kalendārs («📅 Kalendārs»)',
              desc: 'Pierakstiet mēslošanu pa datumiem un dobēm, salīdziniet <strong>2025 un 2026</strong> sezonu blakus un atkārtojiet ar 1 klikšķi. Darbu kalendārā atzīmējiet paveikto ☑️ un pievienojiet savus darbus.'
            },
            {
              icon: '↩️',
              title: 'Nejaušas pārvietošanas atsaukšana un «🔄 Augu seka: Iesl./Izsl.»',
              desc: 'Ja nejauši pārbīdījāt dobi, apakšā parādīsies poga <strong>↩️ Atsaukt</strong> (vai <span class="help-kbd">Ctrl+Z</span>). Rīkjoslā varat ieslēgt vai izslēgt augu sekas norādes ar 1 klikšķi.'
            },
            {
              icon: '🖱️',
              title: 'Plāna pārvietošana un mērogs (Pan & Zoom)',
              desc: 'Turiet nospiestu peles kreiso pogu tukšā laukumā un velciet dārzu. Peles ritenītis vienmērīgi pietuvina vai attālina mērogu (15%–200%).'
            },
            {
              icon: '⛶',
              title: 'Pogas «Ietilpināt visu» un «Centrs»',
              desc: 'Poga <strong>⛶ Ietilpināt visu</strong> automātiski aprēķina robežas un iestata mērogu tā, lai visas dobes ietilptu ekrānā. Poga <strong>📍 Centrs</strong> centrē skatu.'
            },
            {
              icon: '📏',
              title: 'Automātiska celiņu sakārtošana',
              desc: 'Poga <strong>📏 Izvietot celiņus</strong> sakārto dobes taisnās rindās ar ērtām 60 cm ejām bez pārklāšanās.'
            },
            {
              icon: '🖐️',
              title: 'Dobju pārvietošana',
              desc: 'Satveriet dobi aiz <span class="help-kbd">⋮⋮</span> vai galvenes un brīvi pārvietojiet to plānā. Koordinātas saglabājas automātiski.'
            },
            {
              icon: '↻',
              title: 'Pagriešana un dublēšana',
              desc: 'Poga <strong>↻</strong> pagriež dobi par 90°. Poga <strong>❐</strong> izveido dobes kopiju, bet <strong>🗑️</strong> to izdzēš.'
            }
          ],
          holes: [
            {
              icon: '⚡',
              title: 'Stādīšanas shēmas (šaha kārtībā, 2 rindās, 1 rindā)',
              desc: 'Katrai dobei var iestatīt bedrīšu shēmu: šaha kārtībā <strong>⚡</strong>, 2 taisnās rindās <strong>═</strong> vai 1 rindā <strong>─</strong> (2–40 bedrītes).'
            },
            {
              icon: '🍅',
              title: 'Dažādas šķirnes vienā dobē',
              desc: 'Varat stādīt dažādas šķirnes atsevišķās bedrītēs un fiksēt katras bedrītes nosaukumu.'
            },
            {
              icon: '⚡',
              title: 'Ātrā šķirņu aizpildīšana diapazonā',
              desc: 'Norādiet bedrīšu diapazonu (piem., 1–10) un izvēlieties šķirni — tās tiks aizpildītas ar 1 klikšķi.'
            },
            {
              icon: '📸',
              title: 'Šķirņu kartotēka ar fotogrāfijām',
              desc: 'Nofotografējiet sēklu paciņu vai ražu un saglabājiet to dobes kartotēkā.'
            }
          ],
          rotation: [
            {
              icon: '🟢',
              title: 'Zaļais indikators — «Ideāli»',
              desc: 'Lielisks priekšaugs! Augi pieder dažādām dzimtām, augsne ir atpūtusies, un slimību risks ir minimāls.'
            },
            {
              icon: '🟡',
              title: 'Dzeltenais indikators — «Uzmanību»',
              desc: 'Pieļaujams priekšaugs. Stādīšana ir iespējama, taču ieteicams augsni papildināt ar kompostu vai organisko mēslojumu.'
            },
            {
              icon: '🔴',
              title: 'Sarkanais indikators — «Pārkāpums!»',
              desc: 'Nav pieļaujams! Vienas dzimtas augi pēc kārtas (piemēram, tomāti pēc kartupeļiem) vai bīstams priekšaugs. Slimību un augsnes noguruma risks.'
            },
            {
              icon: '💡',
              title: 'Gudrie agronoma ieteikumi',
              desc: 'Izvēloties dobi, sistēma analizē iepriekšējo gadu vēsturi un uzreiz iesaka labākās kultūras šai sezonai.'
            },
            {
              icon: '👁️',
              title: 'Iepriekšējā gada pārklājums',
              desc: 'Poga <strong>👁️ Iepriekšējā gada pārklājums</strong> parāda iepriekšējās sezonas stādījumus kā caurspīdīgu slāni.'
            }
          ],
          beds: [
            {
              icon: '🏠',
              title: 'Siltumnīcas ar atsevišķām rindām',
              desc: 'Veidojiet siltumnīcas ar 2 vai 3 atsevišķām dobēm (kreisā, centrs, labā) ar ejām. Katrā daļā var stādīt savu kultūru neatkarīgi.'
            },
            {
              icon: '🪵',
              title: 'Konstrukciju daudzveidība',
              desc: 'Pieejamas siltumnīcas, paceltās koka kastes, atklātā grunts, zemeņu dobes un siltās organiskās dobes.'
            },
            {
              icon: '📐',
              title: 'Rindu vai režģa veidošana',
              desc: 'Režīms <strong>«Dobju rinda»</strong> vai <strong>«Režģis»</strong> ļauj ar vienu klikšķi izveidot veselu dobju masīvu ar celiņiem.'
            },
            {
              icon: '✏️',
              title: 'Šķirnes un kopšanas piezīmes',
              desc: 'Katrai dobei var norādīt konkrētu šķirni un piezīmes par laistīšanu un mēslošanu.'
            }
          ],
          care: [
            {
              icon: '💧',
              title: 'Laistīšanas kalkulators',
              desc: 'Automātiski aprēķina ūdens daudzumu litros dobei un katrai bedrītei atkarībā no laika apstākļiem.'
            },
            {
              icon: '📝',
              title: 'Kopšanas un mēslošanas žurnāls',
              desc: 'Reģistrējiet mēslošanas, laistīšanas un apstrādes datumus tieši dobes kartītē.'
            }
          ],
          data: [
            {
              icon: '💾',
              title: 'Pilnīga autonomija un automātiska saglabāšana',
              desc: 'Darbojas bez interneta. Visi dati nekavējoties tiek saglabāti pārlūka lokālajā atmiņā (LocalStorage).'
            },
            {
              icon: '📥',
              title: 'Dublējuma eksports (JSON)',
              desc: 'Izvēlnē <strong>«💾 Dublējumkopija»</strong> lejupielādējiet JSON failu ar dārza plānu.'
            },
            {
              icon: '📤',
              title: 'Imports citā datorā',
              desc: 'Ar pogu <strong>«📤 Izvēlēties failu»</strong> varat ielādēt saglabāto failu jebkurā citā ierīcē.'
            },
            {
              icon: '🔄',
              title: 'Demo paraugs izmēģināšanai',
              desc: 'Poga <strong>«🔄 Demo paraugs»</strong> ielādē gatavu dārzu ar 26 dobēm un 3 gadu vēsturi.'
            }
          ],
          tips: [
            {
              icon: '🌿',
              title: '3–4 gadu augsekas likums',
              desc: 'Vienas botāniskās dzimtas augi nedrīkst atgriezties tajā pašā dobē ātrāk par 3–4 gadiem.'
            },
            {
              icon: '🌾',
              title: 'Zaļmēslojums augsnes dziedināšanai',
              desc: 'Sinepju, facēlijas vai rudzu sēja pēc ražas novākšanas dezinficē augsni un bagātina to ar humusu.'
            },
            {
              icon: '🥕',
              title: 'Sakņu dziļuma maiņa',
              desc: 'Pēc dziļo sakņu augiem (burkāni, tomāti) stādiet seklos sakņu augus (sīpoli, salāti, gurķi).'
            },
            {
              icon: '🤝',
              title: 'Draudzīgie kaimiņaugi',
              desc: 'Samtenes un kliņģerītes atbaida kaitēkļus. Baziliks blakus tomātiem uzlabo augļu garšu.'
            }
          ],
          donate: [
            {
              icon: '💻',
              title: 'Programmu izstrāde pēc pasūtījuma',
              desc: 'Vēlaties personisku programmu, tīmekļa pakalpojumu vai lietotni sev vai uzņēmumam? Rakstiet Telegram: <a href="https://t.me/igorSurkin" target="_blank" style="color: #0088cc; font-weight: 700;">@igorSurkin</a> vai e-pastā <strong style="color:var(--primary);">igor.surkin64@gmail.com</strong>.'
            },
            {
              icon: '🧡',
              title: 'Atbalstīt autoru (Revolut, Apple Pay, kartes)',
              desc: 'Ātrs atbalsts 1 klikšķī caur Revolut, Apple Pay, Google Pay vai bankas karti:<br><a href="https://revolut.me/isurkin" target="_blank" style="color: #f15f2c; font-weight: 700; text-decoration: underline;">https://revolut.me/isurkin</a>'
            },
            {
              icon: '🇪🇪',
              title: 'Bankas pārskaitījums (EUR): Swedbank SEPA',
              desc: 'Saņēmējs: <strong>IGOR SURKIN</strong><br>Banka: <strong>Swedbank AS (Estonia, SEPA Instant)</strong><br>IBAN: <strong class="help-kbd" style="font-size:0.95rem;">EE882200001105095456</strong><br>Mērķis: <em>Toetus / Ziedojums dārza programmai</em>'
            }
          ],
          feedback: [
            {
              icon: '💡',
              title: 'Ieteikt jaunu funkciju vai uzlabojumu',
              desc: 'Vai jums ir ideja, kā padarīt dārza plānotāju vēl ērtāku? Noklikšķiniet uz pogas <strong>«💡 Idejas & atsauksmes»</strong> augšējā izvēlnē, lai nosūtītu ieteikumu autoram.'
            },
            {
              icon: '🌱',
              title: 'Pievienot dārzeņus vai šķirnes',
              desc: 'Ja enciklopēdijā trūkst jūsu iecienītā auga vai šķirnes, uzrakstiet mums, un mēs to pievienosim.'
            },
            {
              icon: '🐛',
              title: 'Ziņot par kļūdu vai neprecizitāti',
              desc: 'Pamanījāt kļūdu vai augsekas aprēķina neprecizitāti? Paziņojiet par to caur atgriezeniskās saites formu.'
            },
            {
              icon: '✉️',
              title: 'Autora tiešais kontakts',
              desc: 'Varat arī rakstīt tieši uz e-pastu: <strong style="color:var(--primary);">igor.surkin64@gmail.com</strong>. Autors atbild uz visām dārznieku vēstulēm.'
            }
          ]
        }
      },
      lt: {
        title: "📖 Vartotojo vadovas «Mano Daržas» (v8.7)",
        subtitle: "Interaktyvi instrukcija: Gyvas sodas, dekoras, duobutės, veislių katalogas, darbų ir tręšimo kalendorius",
        tabs: [
          { id: 'quickstart', label: '🚀 Greita pradžia' },
          { id: 'holes', label: '🌱 Duobutės ir veislės' },
          { id: 'rotation', label: '🔄 Sėjomaina' },
          { id: 'beds', label: '📦 Lysvės ir dekoras' },
          { id: 'care', label: '🧪 Tręšimas ir kalendorius' },
          { id: 'data', label: '💾 Išsaugojimas ir spauda' },
          { id: 'tips', label: '💡 Patarimai' },
          { id: 'donate', label: '☕ Paremti autorių' },
          { id: 'feedback', label: '✈️ Grįžtamasis ryšys & Telegram' }
        ],
        sections: {
          quickstart: [
            {
              icon: '🎨',
              title: 'Du žemėlapio stiliai: «🎨 Gyvas sodas» ir «📐 Schema» + Metų laikai',
              desc: 'Perjunkite vaizdą 1 paspaudimu: 3D stilius <strong>«🎨 Gyvas sodas»</strong> (medinės lysvės, šiltnamiai, žaluma) arba klasikinė <strong>«📐 Schema»</strong>. «Gyvame sode» galima keisti sezoną: <strong>🌸 Pavasaris</strong>, <strong>☀️ Vasara</strong>, <strong>🍂 Ruduo</strong>.'
            },
            {
              icon: '🌳',
              title: 'Sklypo dekoras («🌳 Dekoras») ir «➕ Pratęsti»',
              desc: 'Pridėkite namelį, pavėsinę, obelį, krūmus, tvenkinį, akmeninį taką ir tvorą. Spustelėkite objektą ir naudokite <strong>➕ Pratęsti</strong> (tiksliai sujungia tvorą/taką), <strong>↻ Pasukti</strong> arba <strong>🗑️ Ištrinti</strong> (<span class="help-kbd">Delete</span>).'
            },
            {
              icon: '🧪',
              title: 'Tręšimo kalendorius («🧪 Tręšimas») ir Darbų kalendorius («📅 Kalendorius»)',
              desc: 'Fiksuokite tręšimus pagal datas ir lysves, palyginkite <strong>2025 ir 2026</strong> sezonus šalia ir pakartokite 1 paspaudimu. Darbų kalendoriuje žymėkite atliktus darbus ☑️ ir pridėkite savo užduotis.'
            },
            {
              icon: '↩️',
              title: 'Atsitiktinio perkėlimo atšaukimas ir «🔄 Sėjomaina: Įj./Išj.»',
              desc: 'Jei netyčia pajudinote lysvę, apačioje atsiras mygtukas <strong>↩️ Atšaukti</strong> (arba <span class="help-kbd">Ctrl+Z</span>). Įrankių juostoje galite įjungti arba išjungti sėjomainos ženklus 1 paspaudimu.'
            },
            {
              icon: '🖱️',
              title: 'Plano slinkimas ir mastelis (Pan & Zoom)',
              desc: 'Laikykite nuspaudę kairįjį pelės klavišą tuščioje vietoje ir vilkite daržą. Pelės ratuku sklandžiai keiskite mastelį nuo 15% iki 200%.'
            },
            {
              icon: '⛶',
              title: 'Mygtukai «Sutalpinti viską» ir «Centras»',
              desc: 'Mygtukas <strong>⛶ Sutalpinti viską</strong> automatiškai apskaičiuoja lysvių ribas ir sutalpina visą daržą ekrane. Mygtukas <strong>📍 Centras</strong> sugrąžina vaizdą į centrą.'
            },
            {
              icon: '📏',
              title: 'Automatinis takelių išdėstymas',
              desc: 'Mygtukas <strong>📏 Išdėstyti takus</strong> tvarkingai išlygina lysves eilėmis su patogiais 60 cm praėjimais be persidengimų.'
            },
            {
              icon: '🖐️',
              title: 'Lysvių perkėlimas',
              desc: 'Paimkite lysvę už žymeklio <span class="help-kbd">⋮⋮</span> arba antraštės ir perkelkite į norimą vietą. Koordinatės išsisaugo automatiškai.'
            },
            {
              icon: '↻',
              title: 'Pasukimas ir dubliavimas',
              desc: 'Mygtukas <strong>↻</strong> pasuka lysvę 90° kampu. Mygtukas <strong>❐</strong> sukuria kopiją, o <strong>🗑️</strong> ją pašalina.'
            }
          ],
          holes: [
            {
              icon: '⚡',
              title: 'Sodinimo schemos (šachmatiškai, 2 eilėmis, 1 eile)',
              desc: 'Kiekvienai lysvei galima nustatyti duobučių schemą: šachmatiškai <strong>⚡</strong>, 2 eilėmis <strong>═</strong> arba 1 eile <strong>─</strong> (2–40 vnt.).'
            },
            {
              icon: '🍅',
              title: 'Skirtingos veislės vienoje lysvėje',
              desc: 'Galite sodinti kelias veisles toje pačioje lysvėje ir priskirti joms atskiras duobutes.'
            },
            {
              icon: '⚡',
              title: 'Greitas veislių užpildymas',
              desc: 'Nurodykite duobučių intervalą (pvz., 1–10) ir pasirinkite veislę 1 paspaudimu.'
            },
            {
              icon: '📸',
              title: 'Veislių kartoteka ir nuotraukos',
              desc: 'Nufotografuokite sėklų pakuotę ar derlių ir išsaugokite programoje.'
            }
          ],
          rotation: [
            {
              icon: '🟢',
              title: 'Žalias indikatorius — «Puiku»',
              desc: 'Puikus priešsėlis! Augalai priklauso skirtingoms šeimoms, dirvožemis pailsėjęs, ligų rizika minimali.'
            },
            {
              icon: '🟡',
              title: 'Geltonas indikatorius — «Dėmesio»',
              desc: 'Leistinas priešsėlis. Sodinimas galimas, tačiau rekomenduojama praturtinti žemę kompostu ar organinėmis trąšomis.'
            },
            {
              icon: '🔴',
              title: 'Raudonas indikatorius — «Pažeidimas!»',
              desc: 'Draudžiama! Tos pačios šeimos augalai iš eilės (pvz., pomidorai po bulvių) arba pavojingas priešsėlis. Didelė ligų ir dirvos nualinimo rizika.'
            },
            {
              icon: '💡',
              title: 'Išmaniosios agronomo rekomendacijos',
              desc: 'Pasirinkus lysvę, sistema automatiškai išanalizuoja praėjusių metų istoriją ir inspektoriuje pasiūlo geriausius augalus šiam sezonui 1 paspaudimu.'
            },
            {
              icon: '👁️',
              title: 'Praėjusių metų perdanga',
              desc: 'Mygtukas <strong>👁️ Praėjusių metų perdanga</strong> rodo ankstesnio sezono pasėlius pusiau permatomu sluoksniu tiesiai žemėlapyje.'
            }
          ],
          beds: [
            {
              icon: '🏠',
              title: 'Šiltnamiai su atskiromis eilėmis',
              desc: 'Kurkite šiltnamius su 2 arba 3 atskiromis lysvėmis (kairė, centras, dešinė) su takais. Kiekvienoje dalyje galima sodinti skirtingus augalus.'
            },
            {
              icon: '🪵',
              title: 'Konstrukcijų įvairovė',
              desc: 'Galima rinktis šiltnamius, pakeltas medines lysves, atvirą gruntą, braškių lysves ir šiltas organines lysves.'
            },
            {
              icon: '📐',
              title: 'Lysvių eilės ar tinklelio kūrimas',
              desc: 'Režimu <strong>«Lysvių eilė»</strong> arba <strong>«Tinklelis»</strong> galima 1 paspaudimu sukurti visą lysvių masyvą su takais.'
            },
            {
              icon: '✏️',
              title: 'Veislės ir priežiūros pastabos',
              desc: 'Kiekvienai lysvei ar eilei galima nurodyti konkrečią veislę ir įrašyti laistymo bei tręšimo pastabas.'
            }
          ],
          care: [
            {
              icon: '💧',
              title: 'Laistymo skaičiuoklė',
              desc: 'Automatiškai apskaičiuoja vandens poreikį litrais lysvei ir kiekvienai duobutei pagal orą.'
            },
            {
              icon: '📝',
              title: 'Priežiūros ir tręšimo žurnalas',
              desc: 'Fiksuokite tręšimo, laistymo ir augalų apsaugos datas tiesiai inspektoriuje.'
            }
          ],
          data: [
            {
              icon: '💾',
              title: 'Visiška autonomija ir automatinis išsaugojimas',
              desc: 'Veikia be interneto. Visi duomenys iškart išsaugomi vietinėje naršyklės atmintyje (LocalStorage).'
            },
            {
              icon: '📥',
              title: 'Atsarginės kopijos eksportas (JSON)',
              desc: 'Meniu <strong>«💾 Atsarginė kopija»</strong> atsisiųskite JSON failą su daržo planu.'
            },
            {
              icon: '📤',
              title: 'Importas kitame kompiuteryje',
              desc: 'Mygtuku <strong>«📤 Pasirinkti failą»</strong> galite bet kada įkelti išsaugotą failą į kitą įrenginį.'
            },
            {
              icon: '🔄',
              title: 'Demo pavyzdys išbandymui',
              desc: 'Mygtukas <strong>«🔄 Demo pavyzdys»</strong> įkelia paruoštą 26 lysvių ir 3 metų istorijos daržą.'
            }
          ],
          tips: [
            {
              icon: '🌿',
              title: '3–4 metų sėjomainos taisyklė',
              desc: 'Tos pačios botaninės šeimos augalai neturėtų grįžti į tą pačią lysvę anksčiau nei po 3–4 metų.'
            },
            {
              icon: '🌾',
              title: 'Sideratai dirvos gydymui',
              desc: 'Garstyčių, facelijų ar rugių sėja po derliaus nuėmimo dezinfekuoja dirvą ir praturtina ją organika.'
            },
            {
              icon: '🥕',
              title: 'Šaknų gylio kaita',
              desc: 'Po gilias šaknis turinčių augalų (morkų, pomidorų) sodinkite paviršines šaknis turinčius augalus (svogūnus, salotas, agurkus).'
            },
            {
              icon: '🤝',
              title: 'Draugiški augalai kaimynai',
              desc: 'Serenčiai ir medetkos atbaido kenkėjus. Bazilikai šalia pomidorų gerina jų skonį.'
            }
          ],
          donate: [
            {
              icon: '💻',
              title: 'Programinės įrangos kūrimas pagal užsakymą',
              desc: 'Norite asmeninės programos, interneto paslaugos ar programėlės sau ar verslui? Parašykite Telegram: <a href="https://t.me/igorSurkin" target="_blank" style="color: #0088cc; font-weight: 700;">@igorSurkin</a> arba el. paštu <strong style="color:var(--primary);">igor.surkin64@gmail.com</strong>.'
            },
            {
              icon: '🧡',
              title: 'Paremti autorių (Revolut, Apple Pay, kortelės)',
              desc: 'Greita parama vienu paspaudimu per Revolut, Apple Pay, Google Pay ar banko kortelę:<br><a href="https://revolut.me/isurkin" target="_blank" style="color: #f15f2c; font-weight: 700; text-decoration: underline;">https://revolut.me/isurkin</a>'
            },
            {
              icon: '🇪🇪',
              title: 'Banko pavedimas (EUR): Swedbank SEPA',
              desc: 'Gavėjas: <strong>IGOR SURKIN</strong><br>Bankas: <strong>Swedbank AS (Estonia, SEPA Instant)</strong><br>IBAN: <strong class="help-kbd" style="font-size:0.95rem;">EE882200001105095456</strong><br>Paskirtis: <em>Toetus / Parama daržo programai</em>'
            }
          ],
          feedback: [
            {
              icon: '💡',
              title: 'Pasiūlyti naują funkciją ar patobulinimą',
              desc: 'Turite idėjų, kaip padaryti daržo planuotoją patogesnį? Viršutiniame meniu spustelėkite mygtuką <strong>«💡 Idėjos & atsiliepimai»</strong>.'
            },
            {
              icon: '🌱',
              title: 'Pridėti kultūrą, veislę ar taisyklę',
              desc: 'Jei žinyne trūksta jūsų mėgstamo augalo, parašykite mums ir mes jį pridėsime artimiausiame atnaujinime.'
            },
            {
              icon: '🐛',
              title: 'Pranešti apie klaidą ar netikslumą',
              desc: 'Pastebėjote klaidą ar netikslumą? Praneškite per atsiliepimų formą.'
            },
            {
              icon: '✉️',
              title: 'Tiesioginis autoriaus kontaktas',
              desc: 'Taip pat galite rašyti tiesiogiai el. paštu: <strong style="color:var(--primary);">igor.surkin64@gmail.com</strong>.'
            }
          ]
        }
      }
    };

    const langData = HELP_CONTENT[lang] || HELP_CONTENT.ru;
      let activeTabId = 'quickstart';

      const renderTabContent = (tabId) => {
        const items = langData.sections[tabId] || [];
        return `
          <div class="help-card-row">
            ${items.map(item => `
              <div class="help-card-item">
                <div class="help-card-icon">${item.icon}</div>
                <div class="help-card-content">
                  <h4>${item.title}</h4>
                  <p>${item.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      };

      modalContent.innerHTML = `
        <div class="modal-card modal-help-card">
          <div class="help-modal-header">
            <div class="help-modal-title-wrap">
              <h3>${langData.title}</h3>
              <span class="help-modal-subtitle">${langData.subtitle}</span>
            </div>
            <button class="modal-close-btn">&times;</button>
          </div>

          <div class="help-nav-tabs">
            ${langData.tabs.map(tab => `
              <button class="help-nav-tab ${tab.id === activeTabId ? 'active' : ''}" data-tab="${tab.id}">
                ${tab.label}
              </button>
            `).join('')}
          </div>

          <div class="help-tab-body" id="help-modal-tab-body">
            ${renderTabContent(activeTabId)}
          </div>

          <div class="help-modal-footer">
            <button class="btn btn-outline" id="help-download-md-btn">
              ${tr('help_btn_download_manual') || '📥 Скачать инструкцию (.md)'}
            </button>
            <button class="btn btn-primary modal-close-action-btn">
              ${tr('help_btn_close') || 'Понятно'}
            </button>
          </div>
        </div>
      `;

      modal.classList.add('active');
      const closeModal = () => modal.classList.remove('active');
      modalContent.querySelector('.modal-close-btn').addEventListener('click', closeModal);
      modalContent.querySelector('.modal-close-action-btn').addEventListener('click', closeModal);

      // Переключение вкладок в модальном окне
      modalContent.querySelectorAll('.help-nav-tab').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
          modalContent.querySelectorAll('.help-nav-tab').forEach(b => b.classList.remove('active'));
          tabBtn.classList.add('active');
          activeTabId = tabBtn.getAttribute('data-tab');
          const bodyEl = document.getElementById('help-modal-tab-body');
          if (bodyEl) {
            bodyEl.innerHTML = renderTabContent(activeTabId);
          }
        });
      });

      // Скачивание файла инструкции
      document.getElementById('help-download-md-btn').addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = 'ИНСТРУКЦИЯ_ПОЛЬЗОВАТЕЛЯ.md';
        link.download = 'ИНСТРУКЦИЯ_ПОЛЬЗОВАТЕЛЯ.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showToast('Файл инструкции скачивается на ваш компьютер');
      });
  },

  openDonateModal() {
    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) return;

    const lang = (window.i18n && window.i18n.getLanguage()) || document.documentElement.lang || 'ru';
    const tr = (k) => (window.t ? window.t(k) : k);
    const iban = "EE882200001105095456";
    const recipient = "IGOR SURKIN";
    const bank = "Swedbank AS (Estonia, SEPA)";
    const revolutUrl = "https://revolut.me/isurkin";
    const telegramUrl = "https://t.me/igorSurkin";

    const DONATE_TXT = {
      ru: {
        customTitle: 'Разработка программ на заказ',
        customBadge: 'Принимаю заказы',
        customDesc: 'Если у вас есть желание, чтобы я создал удобную программу или приложение лично для вас, семьи или бизнеса — обращайтесь! Буду рад обсудить идею и разработать решение под ваши задачи.',
        btnTelegram: 'В Telegram',
        btnEmail: 'На Email',
        emailSubject: 'Разработка программы на заказ',
        supportTitle: 'Поддержать проект',
        supportDesc: 'Программа бесплатна и без рекламы. Если она вам помогла и сберегла силы — вы можете угостить автора чашкой кофе!',
        revolutBtn: 'Поддержать автора (Revolut) ➔',
        revolutMethods: '⚡ Оплата в 1 клик без регистрации: Apple Pay • Google Pay • Любая банковская карта • Revolut',
        sepaTitle: '🇪🇪 🇱🇻 🇱🇹 🇪🇺 Банковский перевод (SEPA Instant)',
        recipientLabel: 'Получатель:',
        copyBtn: '📋 Скопировать IBAN',
        copiedBtn: '✓ Скопировано!'
      },
      et: {
        customTitle: 'Tarkvara arendus tellimusel',
        customBadge: 'Võtan tellimusi',
        customDesc: 'Kui soovite, et looksin mugava programmi või rakenduse isiklikult teile, perele või ettevõttele — võtke ühendust! Arutame hea meelega ideed ja loome teie vajadustele sobiva lahenduse.',
        btnTelegram: 'Telegramis',
        btnEmail: 'E-postiga',
        emailSubject: 'Tarkvara tellimus',
        supportTitle: 'Toeta projekti',
        supportDesc: 'Programm on tasuta ja reklaamivaba. Kui see aitas teid ja säästis aega — saate autorile tassi kohvi välja teha!',
        revolutBtn: 'Toeta autorit (Revolut) ➔',
        revolutMethods: '⚡ Makse 1 klõpsuga ilma registreerimiseta: Apple Pay • Google Pay • Pangakaart • Revolut',
        sepaTitle: '🇪🇪 🇱🇻 🇱🇹 🇪🇺 Pangaülekanne (SEPA Instant)',
        recipientLabel: 'Saaja:',
        copyBtn: '📋 Kopeeri IBAN',
        copiedBtn: '✓ Kopeeritud!'
      },
      lv: {
        customTitle: 'Programmu izstrāde pēc pasūtījuma',
        customBadge: 'Pieņemu pasūtījumus',
        customDesc: 'Ja vēlaties, lai es izveidotu ērtu programmu vai lietotni tieši jums, ģimenei vai biznesam — sazinieties! Ar prieku apspriedīsim ideju un izstrādāsim risinājumu jūsu vajadzībām.',
        btnTelegram: 'Telegram',
        btnEmail: 'Uz e-pastu',
        emailSubject: 'Programmas izstrādes pasūtījums',
        supportTitle: 'Atbalstīt projektu',
        supportDesc: 'Programma ir bezmaksas un bez reklāmām. Ja tā jums palīdzēja un ietaupīja laiku — varat uzsaukt autoram kafiju!',
        revolutBtn: 'Atbalstīt autoru (Revolut) ➔',
        revolutMethods: '⚡ Maksājums 1 klikšķī bez reģistrācijas: Apple Pay • Google Pay • Bankas karte • Revolut',
        sepaTitle: '🇪🇪 🇱🇻 🇱🇹 🇪🇺 Bankas pārskaitījums (SEPA Instant)',
        recipientLabel: 'Saņēmējs:',
        copyBtn: '📋 Kopēt IBAN',
        copiedBtn: '✓ Nokopēts!'
      },
      lt: {
        customTitle: 'Programų kūrimas pagal užsakymą',
        customBadge: 'Priimu užsakymus',
        customDesc: 'Jei norite, kad sukurčiau patogią programą ar programėlę asmeniškai jums, šeimai ar verslui — susisiekite! Mielai aptarsiu idėją ir sukursiu sprendimą pagal jūsų poreikius.',
        btnTelegram: 'Į Telegram',
        btnEmail: 'El. paštu',
        emailSubject: 'Programos kūrimo užsakymas',
        supportTitle: 'Paremti projektą',
        supportDesc: 'Programa nemokama ir be reklamos. Jei ji jums padėjo ir sutaupė laiko — galite pavaišinti autorių puodeliu kavos!',
        revolutBtn: 'Paremti autorių (Revolut) ➔',
        revolutMethods: '⚡ Mokėjimas 1 paspaudimu be registracijos: Apple Pay • Google Pay • Banko kortelė • Revolut',
        sepaTitle: '🇪🇪 🇱🇻 🇱🇹 🇪🇺 Bankinis pavedimas (SEPA Instant)',
        recipientLabel: 'Gavėjas:',
        copyBtn: '📋 Kopijuoti IBAN',
        copiedBtn: '✓ Nukopijuota!'
      }
    }[lang] || {};

    const emailUrl = `mailto:igor.surkin64@gmail.com?subject=${encodeURIComponent(DONATE_TXT.emailSubject || 'Разработка программы на заказ')}`;

    modalContent.innerHTML = `
      <div class="modal-card modal-donate-card" style="max-height: 88vh; display: flex; flex-direction: column;">
        <div class="modal-header">
          <div class="modal-header-info">
            <h3 style="display: flex; align-items: center; gap: 0.5rem; margin: 0;">
              <span>🧡</span> ${tr('donate_modal_title')}
            </h3>
            <span class="modal-subtitle" style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; display: block;">
              ${tr('donate_modal_subtitle')}
            </span>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body" style="padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.85rem; overflow-y: auto;">
          
          <!-- Раздел 1: Разработка программ на заказ (TOP - Сразу на виду!) -->
          <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%); border: 1.5px solid rgba(99, 102, 241, 0.35); border-radius: var(--radius-md, 12px); padding: 13px 14px; text-align: left; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 6px;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.98rem; color: var(--primary, #4f46e5);">
                <span style="font-size: 1.25rem;">💻</span> ${DONATE_TXT.customTitle}
              </div>
              <span style="background: #10b981; color: white; font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap;">${DONATE_TXT.customBadge}</span>
            </div>
            <p style="font-size: 0.83rem; color: var(--text-primary); line-height: 1.45; margin: 0 0 10px 0;">
              ${DONATE_TXT.customDesc}
            </p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <a href="${telegramUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; min-width: 135px; text-align: center; padding: 10px 12px; border-radius: var(--radius-sm, 8px); background: #0088cc; color: white; font-weight: 800; font-size: 0.86rem; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 8px rgba(0, 136, 204, 0.35);">
                <span>💬</span> ${DONATE_TXT.btnTelegram}
              </a>
              <a href="${emailUrl}" style="flex: 1; min-width: 135px; text-align: center; padding: 10px 12px; border-radius: var(--radius-sm, 8px); background: var(--bg-card, var(--bg-secondary)); border: 1.5px solid var(--border-subtle); color: var(--text-primary); font-weight: 700; font-size: 0.86rem; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span>✉️</span> ${DONATE_TXT.btnEmail}
              </a>
            </div>
          </div>

          <!-- Раздел 2: Поддержка автора через Revolut -->
          <div style="background: rgba(241, 95, 44, 0.08); border: 1.5px solid rgba(241, 95, 44, 0.28); border-radius: var(--radius-md, 12px); padding: 12px 14px; text-align: left;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.95rem; color: #f15f2c;">
                <span style="font-size: 1.2rem;">☕</span> ${DONATE_TXT.supportTitle}
              </div>
              <span style="font-size: 0.72rem; color: #f15f2c; font-weight: 700; background: rgba(241, 95, 44, 0.12); padding: 2px 6px; border-radius: 4px;">Revolut</span>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin: 0 0 9px 0;">
              ${DONATE_TXT.supportDesc}
            </p>

            <a href="${revolutUrl}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 11px 16px; border-radius: var(--radius-sm, 8px); background: linear-gradient(135deg, #f15f2c 0%, #ff7343 100%); color: white; font-weight: 800; font-size: 0.94rem; text-decoration: none; box-shadow: 0 2px 8px rgba(241, 95, 44, 0.35); transition: transform 0.15s ease;">
              <span>☕</span> <span>${DONATE_TXT.revolutBtn}</span>
            </a>

            <div style="font-size: 0.73rem; color: var(--text-muted); text-align: center; margin-top: 6px; line-height: 1.35;">
              ${DONATE_TXT.revolutMethods}
            </div>
          </div>

          <!-- Раздел 3: Банковский перевод SEPA (Swedbank) -->
          <div style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 12px); padding: 11px 14px; text-align: left;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 0.86rem; font-weight: 700; color: var(--text-primary);">
                ${DONATE_TXT.sepaTitle}
              </span>
              <span style="font-size: 0.7rem; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px;">EUR</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 6px;">
              ${DONATE_TXT.recipientLabel} <b>${recipient}</b> (${bank})
            </div>
            <div class="donate-iban-wrap" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="donate-iban-code" id="donate-iban-text" style="font-family: monospace; font-size: 0.92rem; font-weight: 700;">${iban}</span>
              <button type="button" class="donate-copy-btn" id="donate-copy-iban-btn" style="padding: 6px 12px; font-size: 0.78rem; border-radius: 6px;">
                ${DONATE_TXT.copyBtn}
              </button>
            </div>
          </div>

          <!-- Раздел 4: Другие программы автора (Vercel) -->
          <div style="background: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.28); border-radius: var(--radius-md, 12px); padding: 12px 14px; text-align: left;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.95rem; color: #10b981;">
                <span style="font-size: 1.2rem;">🛒</span> ${tr('other_apps_title')}
              </div>
              <span style="font-size: 0.72rem; color: #10b981; font-weight: 700; background: rgba(16, 185, 129, 0.15); padding: 2px 6px; border-radius: 4px;">Vercel</span>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin: 0 0 9px 0;">
              ${tr('other_apps_reminder_desc')}
            </p>
            <a href="https://reminder-eight-blush.vercel.app" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 10px 14px; border-radius: var(--radius-sm, 8px); background: #10b981; color: white; font-weight: 800; font-size: 0.88rem; text-decoration: none; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);">
              <span>🛒</span> <span>${tr('other_apps_reminder_btn')}</span>
            </a>
          </div>

        </div>

        <div class="modal-footer" style="padding: 0.85rem 1.25rem; background: var(--bg-tertiary); display: flex; justify-content: flex-end;">
          <button class="btn btn-primary modal-close-action-btn">
            ${tr('help_btn_close')}
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
    const closeModal = () => modal.classList.remove('active');
    modalContent.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modalContent.querySelector('.modal-close-action-btn').addEventListener('click', closeModal);

    // Копирование IBAN
    const copyIbanBtn = document.getElementById('donate-copy-iban-btn');
    if (copyIbanBtn) {
      copyIbanBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(iban).then(() => {
          copyIbanBtn.textContent = DONATE_TXT.copiedBtn;
          copyIbanBtn.classList.add('copied');
          this.showToast(tr('donate_copied_toast'));
          setTimeout(() => {
            copyIbanBtn.textContent = DONATE_TXT.copyBtn;
            copyIbanBtn.classList.remove('copied');
          }, 2500);
        }).catch(() => {
          this.showToast(iban);
        });
      });
    }
  },

  openInstallModal() {
    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) return;

    const tr = (k) => (window.t ? window.t(k) : k);
    const liveUrl = 'https://igorsurkin64-create.github.io/smart-garden/';
    const appUrl = window.location.protocol.startsWith('http') ? window.location.href.split('#')[0] : liveUrl;
    const userAgent = navigator.userAgent.toLowerCase();
    const isFirefox = userAgent.includes('firefox');
    const isEdge = userAgent.includes('edg');
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    modalContent.innerHTML = `
      <div class="modal-card modal-install-card">
        <div class="modal-header">
          <div class="modal-header-info">
            <h3 style="display: flex; align-items: center; gap: 0.5rem; margin: 0;">
              📲 ${tr('install_modal_title') || 'Установка «Умного Огорода» на устройство'}
            </h3>
            <span class="modal-subtitle" style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; display: block;">
              ${tr('install_modal_subtitle') || 'Запускайте программу в отдельном окне с рабочего стола и пользуйтесь даже без интернета!'}
            </span>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body" style="padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1.15rem;">
          ${isStandalone ? `
            <div style="background: rgba(16, 185, 129, 0.12); border: 1.5px solid #10b981; border-radius: var(--radius-md); padding: 1rem 1.2rem; display: flex; align-items: center; gap: 0.8rem;">
              <span style="font-size: 2rem;">✅</span>
              <div>
                <div style="font-weight: 700; color: #059669; font-size: 1rem;">Приложение уже установлено!</div>
                <div style="font-size: 0.85rem; color: var(--text-main); margin-top: 0.2rem;">
                  Вы уже запустили «Умный Огород» как автономное приложение. Все данные автоматически сохраняются и доступны оффлайн.
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Если браузер поддерживает прямой prompt -->
          ${this.deferredInstallPrompt ? `
            <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.08)); border: 2px solid #10b981; border-radius: var(--radius-md); padding: 1.1rem; text-align: center;">
              <p style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.6rem; color: #065f46;">
                Ваш браузер готов к быстрой установке!
              </p>
              <button id="direct-install-action-btn" class="btn btn-primary" style="padding: 0.75rem 1.75rem; font-size: 1rem; font-weight: 700; background: #10b981; border: none; box-shadow: 0 4px 14px rgba(16,185,129,0.4); cursor: pointer;">
                📲 Нажмите сюда для установки
              </button>
            </div>
          ` : ''}

          <div style="display: flex; flex-direction: column; gap: 0.85rem;">

            ${isFirefox ? `
              <!-- Для пользователей Firefox -->
              <div class="install-guide-box" style="border: 2px solid #f59e0b; border-radius: var(--radius-md); padding: 1.1rem; background: rgba(245, 158, 11, 0.08);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
                  <div style="font-weight: 700; font-size: 0.98rem; display: flex; align-items: center; gap: 0.4rem; color: #d97706;">
                    🦊 Вы просматриваете сайт через Mozilla Firefox
                  </div>
                  <span style="background: #f59e0b; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 999px;">
                    Ваш браузер
                  </span>
                </div>
                <p style="font-size: 0.88rem; line-height: 1.5; color: var(--text-main); margin: 0 0 0.75rem 0;">
                  В настольной версии Firefox разработчиками отключена функция установки веб-сайтов как автономных программ. Чтобы установить «Умный Огород» как отдельную программу на компьютер:
                </p>
                <div style="font-size: 0.88rem; line-height: 1.5; color: var(--text-main); margin-bottom: 0.8rem; background: var(--bg-card); padding: 0.75rem 0.9rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                  <div><b>1. Скопируйте ссылку ниже</b> и откройте её в <b>Google Chrome</b> или <b>Microsoft Edge</b> (Edge уже встроен в Windows!).</div>
                  <div style="margin-top: 0.35rem;"><b>2.</b> В Chrome / Edge нажмите на значок <b>«Установить»</b> <i>(монитор со стрелочкой 📥)</i> в правой части строки адреса.</div>
                  <div style="margin-top: 0.35rem;"><b>3. Либо в Firefox:</b> Нажмите <kbd style="background: var(--bg-hover); padding: 0.15rem 0.4rem; border-radius: 4px; border: 1px solid var(--border-color); font-weight: 600;">Ctrl + D</kbd>, чтобы сохранить огород в Закладки браузера.</div>
                </div>
                <button type="button" class="btn btn-primary copy-garden-url-btn" style="background: #f59e0b; border: none; font-weight: 700; padding: 0.6rem 1.1rem; cursor: pointer;">
                  📋 Скопировать ссылку для Edge / Chrome
                </button>
              </div>
            ` : ''}

            <!-- Карточка: ПК Chrome / Edge / Яндекс -->
            <div class="install-guide-box" style="border: ${!isFirefox && !isMobile ? '2px solid #10b981' : '1px solid var(--border-color)'}; border-radius: var(--radius-md); padding: 1.1rem; background: ${!isFirefox && !isMobile ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-card)'};">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
                <div style="font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-main);">
                  🖥️ Google Chrome, Microsoft Edge, Яндекс.Браузер (Windows / Mac)
                </div>
                ${!isFirefox && !isMobile ? '<span style="background: #10b981; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 999px;">Ваш браузер</span>' : ''}
              </div>
              <ol style="margin: 0.4rem 0 0 1.2rem; padding: 0; font-size: 0.88rem; line-height: 1.55; color: var(--text-main);">
                <li>Посмотрите в <b>правую часть адресной строки</b> вверху браузера (где написан адрес сайта).</li>
                <li>Нажмите на значок <b>«Установить приложение»</b> <i>(мониторчик со стрелочкой 📥 или плюс ➕)</i>.</li>
                <li><i>Либо в меню браузера:</i> нажмите <b>⋮</b> (три точки в правом верхнем углу) ➔ <b>«Приложения»</b> ➔ <b>«Установить этот сайт как приложение»</b>.</li>
                <li>Программа появится отдельным окном без адресной строки, на Рабочем столе и в меню «Пуск»!</li>
              </ol>
            </div>

            <!-- Карточка: Смартфоны и планшеты -->
            <div class="install-guide-box" style="border: ${isMobile ? '2px solid #10b981' : '1px solid var(--border-color)'}; border-radius: var(--radius-md); padding: 1rem; background: var(--bg-card);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
                <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">
                  📱 Смартфоны и планшеты (Android / iPhone / iPad)
                </div>
                ${isMobile ? '<span style="background: #10b981; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 999px;">Ваше устройство</span>' : ''}
              </div>
              <div style="font-size: 0.88rem; line-height: 1.5; color: var(--text-main);">
                <div>• <b>Android (Chrome):</b> Нажмите кнопку меню <b>⋮</b> ➔ <b>«Установить приложение»</b> (или «Добавить на главный экран»).</div>
                <div style="margin-top: 0.35rem;">• <b>iPhone / iPad (Safari):</b> Нажмите кнопку «Поделиться» <i>(квадрат со стрелкой вверх)</i> ➔ <b>«На экран "Домой"»</b>.</div>
              </div>
            </div>

          </div>

          <!-- Ссылка на сайт -->
          <div style="background: var(--bg-hover); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.8rem; font-size: 0.82rem;">
            <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-muted);">
              Ссылка: <span style="color: var(--text-main); font-weight: 600;">${appUrl}</span>
            </div>
            <button type="button" class="btn btn-sm btn-outline copy-garden-url-btn" style="flex-shrink: 0; cursor: pointer;">
              📋 Скопировать
            </button>
          </div>

        </div>

        <div class="modal-footer" style="padding: 0.85rem 1.5rem; background: var(--bg-hover); display: flex; justify-content: flex-end;">
          <button class="btn btn-secondary modal-close-btn" style="padding: 0.5rem 1.25rem;">
            ${tr('btn_close') || 'Закрыть'}
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');

    const closeBtns = modalContent.querySelectorAll('.modal-close-btn');
    closeBtns.forEach(btn => {
      btn.onclick = () => modal.classList.remove('active');
    });

    const directInstallBtn = modalContent.querySelector('#direct-install-action-btn');
    if (directInstallBtn && this.deferredInstallPrompt) {
      directInstallBtn.onclick = () => {
        modal.classList.remove('active');
        this.deferredInstallPrompt.prompt();
        this.deferredInstallPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            const pwaBtn = document.getElementById('pwa-install-btn');
            if (pwaBtn) {
              pwaBtn.innerHTML = window.t ? window.t('pwa_installed_label') : '✓ Установлено';
              pwaBtn.style.animation = 'none';
            }
          }
          this.deferredInstallPrompt = null;
        });
      };
    }

    const copyBtns = modalContent.querySelectorAll('.copy-garden-url-btn');
    copyBtns.forEach(btn => {
      btn.onclick = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(appUrl).then(() => {
            this.showToast('✓ Ссылка скопирована! Откройте её в Google Chrome или Microsoft Edge.');
          }).catch(() => {
            prompt('Скопируйте ссылку вручную:', appUrl);
          });
        } else {
          prompt('Скопируйте ссылку вручную:', appUrl);
        }
      };
    });
  },

  openFeedbackModal() {
    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) return;

    const tr = (k) => (window.t ? window.t(k) : k);
    const authorEmail = 'igor.surkin64@gmail.com';

    modalContent.innerHTML = `
      <div class="modal-card modal-feedback-card">
        <div class="modal-header">
          <div class="modal-header-info">
            <h3 style="display: flex; align-items: center; gap: 0.5rem; margin: 0;">
              ${tr('feedback_modal_title') || '💡 Обратная связь, идеи и предложения'}
            </h3>
            <span class="modal-subtitle" style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; display: block;">
              ${tr('feedback_modal_subtitle') || 'Автор лично читает все сообщения и добавляет полезные пожелания в обновления программы.'}
            </span>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body feedback-modal-body">
          
          <!-- Выбор категории обращения -->
          <div>
            <label style="font-size: 0.88rem; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 0.4rem;">
              ${tr('feedback_type_label') || 'О чём ваше обращение?'}
            </label>
            <div class="feedback-category-pills">
              <button type="button" class="feedback-type-btn active" data-type="idea">
                ${tr('feedback_type_idea') || '💡 Идея по новым функциям'}
              </button>
              <button type="button" class="feedback-type-btn" data-type="crop">
                ${tr('feedback_type_crop') || '🌱 Добавить культуру или правило'}
              </button>
              <button type="button" class="feedback-type-btn" data-type="bug">
                ${tr('feedback_type_bug') || '🐛 Ошибка или неточность'}
              </button>
              <button type="button" class="feedback-type-btn" data-type="praise">
                ${tr('feedback_type_praise') || '💬 Отзыв или вопрос'}
              </button>
            </div>
          </div>

          <!-- Поле ввода текста -->
          <div>
            <label style="font-size: 0.88rem; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 0.4rem;">
              ${tr('feedback_msg_label') || 'Текст предложения или замечания:'}
            </label>
            <textarea id="feedback-message-input" class="feedback-textarea" 
                      placeholder="${tr('feedback_msg_placeholder') || 'Опишите подробно: какую функцию добавить, что сделать удобнее или какую ошибку вы заметили...'}"></textarea>
          </div>

          <!-- Контактные данные пользователя -->
          <div>
            <label style="font-size: 0.88rem; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 0.4rem;">
              ${tr('feedback_contact_label') || 'Ваше имя и контакт для связи (email или Telegram, необязательно):'}
            </label>
            <input type="text" id="feedback-contact-input" class="feedback-input" 
                   placeholder="${tr('feedback_contact_placeholder') || 'Иван, ivan@example.com (чтобы автор мог ответить)'}">
          </div>

          <!-- Прямые контакты автора (Email и Telegram) -->
          <div class="feedback-author-card">
            <div>
              <span style="color: var(--text-muted); font-size: 0.8rem; display: block;">Прямые контакты и сообщество:</span>
              <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.25rem; font-size: 0.9rem;">
                <span>📧 <a href="mailto:${authorEmail}" style="color: var(--primary); font-weight: 700;">${authorEmail}</a></span>
                <span>✈️ <a href="https://t.me/smartgarden_chat" target="_blank" style="color: #0088cc; font-weight: 700; text-decoration: none;">Telegram-чат: @smartgarden_chat</a></span>
              </div>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="feedback-copy-email-btn">
              📋 Скопировать email
            </button>
          </div>

          <!-- Подсказка по отправке в Telegram -->
          <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; margin-top: 0.75rem; background: var(--bg-secondary); padding: 0.6rem 0.85rem; border-radius: 8px; border-left: 3px solid #0088cc;">
            ${tr('feedback_tip_telegram') || '💡 При нажатии текст скопируется в буфер, и Telegram откроется с готовым сообщением. В чате также можно просто нажать «Вставить» (Ctrl+V).'}
          </div>

        </div>

        <div class="modal-footer feedback-modal-footer">
          <button type="button" class="feedback-telegram-btn" id="feedback-send-telegram-btn">
            <span>🚀</span>
            <span>${tr('feedback_btn_telegram') || 'Отправить прямо в Telegram-чат (@smartgarden_chat)'}</span>
          </button>

          <div class="feedback-footer-secondary">
            <span class="feedback-secondary-label">Или отправить по почте:</span>
            <div class="feedback-secondary-buttons">
              <button type="button" class="btn btn-outline btn-sm" id="feedback-send-primary-btn" title="Открыть почтовую программу">
                ${tr('feedback_btn_send_mail') || '✉️ Отправить автору'}
              </button>
              <button type="button" class="btn btn-outline btn-sm" id="feedback-open-gmail-btn" title="Открыть в веб-версии Gmail">
                ${tr('feedback_btn_gmail') || '🌐 Открыть в Gmail'}
              </button>
              <button type="button" class="btn btn-outline btn-sm" id="feedback-copy-text-btn" title="Скопировать текст сообщения">
                ${tr('feedback_btn_copy') || '📋 Скопировать текст'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
    const closeModal = () => modal.classList.remove('active');
    modalContent.querySelector('.modal-close-btn').addEventListener('click', closeModal);

    // Переключение категории обращения
    let selectedCategory = 'idea';
    const typeButtons = modalContent.querySelectorAll('.feedback-type-btn');
    typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCategory = btn.getAttribute('data-type') || 'idea';
      });
    });

    // Надежное копирование в буфер обмена (синхронное через execCommand + async navigator.clipboard)
    const copyToClipboard = (text) => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '-9999px';
        ta.setAttribute('readonly', '');
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) {}
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    };

    const getFormattedMessage = () => {
      const msg = document.getElementById('feedback-message-input')?.value.trim() || '';
      const contact = document.getElementById('feedback-contact-input')?.value.trim() || 'Не указан';
      const catTitles = {
        idea: '💡 Идея по новым функциям',
        crop: '🌱 Добавить культуру / сорт / правило',
        bug: '🐛 Ошибка или неточность',
        praise: '💬 Отзыв / Вопрос'
      };
      const catText = catTitles[selectedCategory] || selectedCategory;
      const lang = window.i18n ? window.i18n.getLanguage() : 'ru';

      const subject = `[Умный Огород] ${catText}`;
      const body = `Категория: ${catText}\nОтправитель: ${contact}\nЯзык: ${lang.toUpperCase()}\n\nТекст сообщения:\n${msg || '(Без текста)'}\n\n---\nОтправлено из веб-приложения «Умный Огород»`;

      return { subject, body, msg, contact, catText };
    };

    // Прямая отправка в Telegram-чат через бота
    const sendTelegramBtn = document.getElementById('feedback-send-telegram-btn');
    if (sendTelegramBtn) {
      sendTelegramBtn.addEventListener('click', async () => {
        const { msg, contact, catText } = getFormattedMessage();

        // Проверка на пустое сообщение
        if (!msg || msg.trim().length === 0) {
          const emptyMsg = tr('feedback_toast_empty_msg') || '⚠️ Пожалуйста, напишите текст вашего сообщения или вопроса!';
          this.showToast(emptyMsg);
          const inputEl = document.getElementById('feedback-message-input');
          if (inputEl) {
            inputEl.focus();
            inputEl.style.borderColor = 'var(--danger, #e53935)';
            setTimeout(() => { if (inputEl) inputEl.style.borderColor = ''; }, 2500);
          }
          return;
        }

        const origBtnText = sendTelegramBtn.innerHTML;
        sendTelegramBtn.disabled = true;
        sendTelegramBtn.innerHTML = tr('feedback_sending') || '⏳ Отправка...';

        const escapeHtml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeMsg = escapeHtml(msg);
        const safeContact = (contact && contact !== 'Не указан' && contact !== 'Nav norādīts' && contact !== 'Määramata' && contact !== 'Nenurodyta') 
          ? escapeHtml(contact) 
          : 'Анонимно';
        const safeCat = escapeHtml(catText);
        const langCode = (window.i18n ? window.i18n.getLanguage() : 'ru').toUpperCase();

        const tgHtml = `🌱 <b>[Умный Огород — Обратная связь]</b>\n\n` +
          `📌 <b>Тема:</b> ${safeCat}\n` +
          `👤 <b>Отправитель:</b> ${safeContact}\n` +
          `🌐 <b>Язык:</b> ${langCode}\n\n` +
          `💬 <b>Сообщение:</b>\n${safeMsg}`;

        // Отправка через безопасный серверный прокси Google Apps Script (без токена в браузере)
        const FEEDBACK_SCRIPT_URL = window.SMART_GARDEN_FEEDBACK_URL || 'https://script.google.com/macros/s/AKfycbyeV4HD7wz_hotJdi_p112JEuDrgBChYKOp7auXC25M5FP6hDazzlN0NUTG_ztsVpRP/exec';

        try {
          if (!FEEDBACK_SCRIPT_URL) {
            throw new Error('Feedback webhook URL is not configured yet');
          }

          // Используем text/plain, чтобы браузер не делал CORS preflight (OPTIONS), который Google Apps Script не поддерживает
          const resp = await fetch(FEEDBACK_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              category: catText,
              contact: safeContact,
              lang: langCode,
              message: msg,
              html: tgHtml
            })
          });

          const resData = await resp.json();

          if (resData && resData.ok) {
            this.showToast(tr('feedback_toast_telegram_success') || '✓ Сообщение успешно отправлено в Telegram-чат @smartgarden_chat! Спасибо за отзыв!');
            const msgInput = document.getElementById('feedback-message-input');
            if (msgInput) msgInput.value = '';
            setTimeout(() => {
              closeModal();
            }, 1400);
            return;
          } else {
            throw new Error(resData?.description || 'Feedback script error');
          }
        } catch (err) {
          console.warn('Telegram direct send fallback:', err);
          // Фолбэк: если сеть блокирует прямой доступ к API Telegram (например блокировка провайдера), копируем в буфер и открываем чат
          const plainText = `🌱 [Умный Огород]\n📌 ${catText}\n👤 От: ${safeContact}\n💬 ${msg}`;
          copyToClipboard(plainText);
          this.showToast(tr('feedback_toast_telegram') || '✓ Текст обращения скопирован! Открываю Telegram...');
          window.open('https://t.me/smartgarden_chat', '_blank');
        } finally {
          sendTelegramBtn.disabled = false;
          sendTelegramBtn.innerHTML = origBtnText;
        }
      });
    }

    // Кнопка: Скопировать email автора
    const copyEmailBtn = document.getElementById('feedback-copy-email-btn');
    if (copyEmailBtn) {
      copyEmailBtn.addEventListener('click', () => {
        copyToClipboard(authorEmail);
        copyEmailBtn.textContent = '✓ Скопировано!';
        this.showToast('✓ Email автора скопирован: ' + authorEmail);
        setTimeout(() => {
          copyEmailBtn.textContent = '📋 Скопировать email';
        }, 2000);
      });
    }

    // Кнопка: Скопировать текст
    const copyTextBtn = document.getElementById('feedback-copy-text-btn');
    if (copyTextBtn) {
      copyTextBtn.addEventListener('click', () => {
        const { body, msg } = getFormattedMessage();
        if (!msg) {
          this.showToast(tr('feedback_toast_empty_msg') || '⚠️ Пожалуйста, напишите текст вашего сообщения или вопроса!');
          return;
        }
        copyToClipboard(body);
        copyTextBtn.textContent = '✓ Текст скопирован!';
        this.showToast(tr('feedback_toast_copied') || '✓ Текст обращения скопирован в буфер обмена!');
        setTimeout(() => {
          copyTextBtn.textContent = tr('feedback_btn_copy') || '📋 Скопировать текст';
        }, 2000);
      });
    }

    // Кнопка: Открыть в Gmail (Web)
    const openGmailBtn = document.getElementById('feedback-open-gmail-btn');
    if (openGmailBtn) {
      openGmailBtn.addEventListener('click', () => {
        const { subject, body, msg } = getFormattedMessage();
        if (!msg) {
          this.showToast(tr('feedback_toast_empty_msg') || '⚠️ Пожалуйста, напишите текст вашего сообщения или вопроса!');
          return;
        }
        copyToClipboard(body);
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(authorEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailUrl, '_blank');
      });
    }

    // Основная кнопка: Отправить автору (mailto:)
    const sendPrimaryBtn = document.getElementById('feedback-send-primary-btn');
    if (sendPrimaryBtn) {
      sendPrimaryBtn.addEventListener('click', () => {
        const { subject, body, msg } = getFormattedMessage();
        if (!msg) {
          this.showToast(tr('feedback_toast_empty_msg') || '⚠️ Пожалуйста, напишите текст вашего сообщения или вопроса!');
          return;
        }
        copyToClipboard(body);
        this.showToast(tr('feedback_toast_sent') || '✓ Текст скопирован! Запускаю почтовую программу для отправки...');

        const mailtoUrl = `mailto:${encodeURIComponent(authorEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
      });
    }
  },

  /**
   * Обучающее приветственное окно демо-плана
   */
  openDemoWelcomeModal() {
    const modal = document.getElementById('general-modal');
    const modalContent = document.getElementById('modal-dynamic-content');
    if (!modal || !modalContent) return;

    const lang = (window.i18n && window.i18n.getLanguage()) || document.documentElement.lang || 'ru';
    const DEMO_WELCOME_I18N = {
      ru: {
        title: "🌿 Добро пожаловать в «Умный Огород»!",
        badge: "Демонстрационный план",
        lead: "Перед вами <strong>готовый демонстрационный огород</strong>, созданный для наглядного примера и быстрого знакомства со всеми возможностями программы.",
        featuresTitle: "Что можно посмотреть и попробовать прямо сейчас:",
        feat1: "🏡 <strong>2 большие теплицы</strong> (на 3 грядки каждая: томаты, перцы, огурцы) с капельным поливом",
        feat2: "🪵 <strong>Приподнятые деревянные грядки</strong>, чесночник, посадки клубники и картофеля",
        feat3: "🔄 <strong>Умный севооборот</strong>: кликните на любую грядку, чтобы открыть историю предшественников и цветные подсказки",
        feat4: "🖱️ <strong>Интерактивность</strong>: свободно двигайте грядки, меняйте культуры и экспериментируйте",
        tipTitle: "Как начать строить свой собственный огород?",
        tipText: "Если хотите сразу распланировать свой участок с нуля — нажмите <strong>«Убрать демо-грядки»</strong>. Вы в любой момент сможете вернуть этот пример через верхнее <strong>«Меню ⚙️» ➔ «🔄 Демо-пример»</strong>.",
        btnExplore: "👀 Изучить демо-огород",
        btnClear: "🧹 Убрать демо-грядки",
        dontShow: "Больше не показывать это окно при запуске",
        toastExplore: "🌱 Приятного изучения! Кликайте по грядкам для просмотра деталей",
        toastCleared: "🧹 Демо-грядки убраны! Нажмите «➕ Новая грядка» для создания своего плана. Вернуть демо можно через Меню ⚙️"
      },
      et: {
        title: "🌿 Tere tulemast «Nutikas Aed» rakendusse!",
        badge: "Näidisplaan",
        lead: "Teie ees on <strong>valmis näidispeenarde plaan</strong>, mis aitab tutvuda kõigi aia planeerimise võimalustega.",
        featuresTitle: "Mida saate kohe proovida ja uurida:",
        feat1: "🏡 <strong>2 kolmeosalist kasvuhoonet</strong> (tomatid, paprikad, kurgid) koos tilkkastmisega",
        feat2: "🪵 <strong>Kõrgpeenrad</strong>, küüslauk, maasikad ja kartul 3 aasta ajalooga",
        feat3: "🔄 <strong>Nutikas külvikord</strong>: klõpsake peenral, et näha sobivaid ja ebasoovitavaid eelvilju",
        feat4: "🖱️ <strong>Interaktiivne</strong>: liigutage peenraid vabalt ja katsetage taimede vahetamist",
        tipTitle: "Kuidas luua omaenda aed?",
        tipText: "Kui soovite alustada puhtalt lehelt, vajutage <strong>«Eemalda näidispeenrad»</strong>. Näidise saab alati tagasi menüüst <strong>«⚙️ Menüü» ➔ «🔄 Näidisplaan»</strong>.",
        btnExplore: "👀 Uuri näidispeenraid",
        btnClear: "🧹 Eemalda näidispeenrad",
        dontShow: "Ära näita seda akent käivitamisel enam",
        toastExplore: "🌱 Head avastamist! Klõpsake peenral selle vaatamiseks",
        toastCleared: "🧹 Näidis eemaldatud! Vajutage «➕ Uus peenar» oma aia loomiseks. Näidise saab tagasi Menüüst ⚙️"
      },
      lv: {
        title: "🌿 Laipni lūdzam «Gudrais Dārzs»!",
        badge: "Demo paraugs",
        lead: "Jūsu priekšā ir <strong>gatavs demonstrācijas dārza plāns</strong>, kas parāda visas programmas iespējas.",
        featuresTitle: "Ko varat apskatīt un izmēģināt tūlīt:",
        feat1: "🏡 <strong>2 siltumnīcas ar 3 sekcijām</strong> (tomāti, paprika, gurķi) un pilienlaistīšanu",
        feat2: "🪵 <strong>Paaugstinātās koka dobes</strong>, ķiploki, zemenes un kartupeļi ar vēsturi",
        feat3: "🔄 <strong>Gudrā augseka</strong>: uzklikšķiniet uz jebkuras dobes, lai redzētu 3 gadu vēsturi un padomus",
        feat4: "🖱️ <strong>Interaktivitāte</strong>: brīvi pārvietojiet dobes un mainiet kultūras bez uztraukuma",
        tipTitle: "Kā sākt savu dārzu?",
        tipText: "Ja vēlaties uzreiz veidot savu dārzu no nulles, spiediet <strong>«Noņemt demo dobes»</strong>. Jebkurā brīdī varat atgriezt paraugu caur <strong>«⚙️ Izvēlne» ➔ «🔄 Demo paraugs»</strong>.",
        btnExplore: "👀 Apskatīt demo dobes",
        btnClear: "🧹 Noņemt demo dobes",
        dontShow: "Vairs nerādīt šo logu startēšanas laikā",
        toastExplore: "🌱 Patīkamu izpēti! Noklikšķiniet uz dobes, lai skatītu detaļas",
        toastCleared: "🧹 Demo dobes noņemtas! Spiediet «➕ Jauna dobe», lai veidotu savu plānu. Paraugu var atgriezt Izvēlnē ⚙️"
      },
      lt: {
        title: "🌿 Sveiki atvykę į «Išmanusis Daržas»!",
        badge: "Demo pavyzdys",
        lead: "Prieš jus yra <strong>paruoštas demonstracinis daržo planas</strong>, skirtas susipažinti su visomis galimybėmis.",
        featuresTitle: "Ką galite pamatyti ir išbandyti dabar:",
        feat1: "🏡 <strong>2 šiltnamiai su 3 zonomis</strong> (pomidorai, paprikos, agurkai) ir laistymu",
        feat2: "🪵 <strong>Pakeltos medinės lysvės</strong>, braškių, česnakų ir bulvių plotai",
        feat3: "🔄 <strong>Išmani sėjomaina</strong>: spustelėkite bet kurią lysvę ir pamatykite 3 metų istoriją bei patarimus",
        feat4: "🖱️ <strong>Interaktyvu</strong>: laisvai vilkite lysves ir keiskite augalus be baimės suklysti",
        tipTitle: "Kaip pradėti savo daržą?",
        tipText: "Jei norite pradėti kurti savo daržą nuo švaraus lapo, spauskite <strong>«Pašalinti demo lysves»</strong>. Bet kada pavyzdį galite grąžinti per <strong>«⚙️ Meniu» ➔ «🔄 Demo pavyzdys»</strong>.",
        btnExplore: "👀 Apžiūrėti demo daržą",
        btnClear: "🧹 Pašalinti demo lysves",
        dontShow: "Daugiau nerodyti šio lango paleidžiant",
        toastExplore: "🌱 Malonaus tyrinėjimo! Spustelėkite lysvę norėdami pamatyti detales",
        toastCleared: "🧹 Demo lysvės pašalintos! Paspauskite «➕ Nauja lysvė» savo planui kurti. Pavyzdį grąžinti galite Meniu ⚙️"
      }
    };

    const txt = DEMO_WELCOME_I18N[lang] || DEMO_WELCOME_I18N.ru;

    modalContent.innerHTML = `
      <div class="modal-card modal-demo-welcome">
        <div class="demo-welcome-hero">
          <div class="demo-welcome-title-wrap">
            <span class="demo-welcome-badge">${txt.badge}</span>
            <h3 class="demo-welcome-title">${txt.title}</h3>
          </div>
          <button class="modal-close-btn" aria-label="Закрыть">&times;</button>
        </div>

        <div class="demo-welcome-body">
          <p class="demo-welcome-lead">${txt.lead}</p>

          <div class="demo-welcome-features">
            <div class="demo-welcome-features-title">${txt.featuresTitle}</div>
            <ul class="demo-welcome-list">
              <li>${txt.feat1}</li>
              <li>${txt.feat2}</li>
              <li>${txt.feat3}</li>
              <li>${txt.feat4}</li>
            </ul>
          </div>

          <div class="demo-welcome-tip-box">
            <span class="demo-welcome-tip-icon">💡</span>
            <div class="demo-welcome-tip-text">
              <strong>${txt.tipTitle}</strong><br>
              ${txt.tipText}
            </div>
          </div>

          <div class="demo-welcome-checkbox-row">
            <label class="demo-welcome-checkbox-label">
              <input type="checkbox" id="demo-welcome-never-cb">
              <span>${txt.dontShow}</span>
            </label>
          </div>
        </div>

        <div class="demo-welcome-footer">
          <button class="btn btn-outline btn-demo-clear" id="demo-welcome-clear-btn">${txt.btnClear}</button>
          <button class="btn btn-primary btn-demo-explore" id="demo-welcome-explore-btn">${txt.btnExplore}</button>
        </div>
      </div>
    `;

    modal.classList.add('active');

    const cb = document.getElementById('demo-welcome-never-cb');
    if (cb) {
      cb.addEventListener('change', () => {
        if (cb.checked) {
          localStorage.setItem('sg_hide_demo_welcome', 'true');
        } else {
          localStorage.removeItem('sg_hide_demo_welcome');
        }
      });
    }

    const saveCheckboxState = () => {
      if (cb && cb.checked) {
        localStorage.setItem('sg_hide_demo_welcome', 'true');
      }
    };

    const closeModal = () => {
      saveCheckboxState();
      modal.classList.remove('active');
    };

    const closeBtn = modalContent.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Кнопка: Изучить демо-огород
    const exploreBtn = document.getElementById('demo-welcome-explore-btn');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        closeModal();
        this.showToast(txt.toastExplore);
      });
    }

    // Кнопка: Убрать демо-грядки (с чистого листа)
    const clearBtn = document.getElementById('demo-welcome-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        closeModal();
        this.executeClearPlan();
        this.showToast(txt.toastCleared);
      });
    }
  },

  /**
   * Проверка и автоматический показ приветственного окна
   * (только на ПК / ноутбуках, при наличии демо-плана и если не выключено галочкой)
   */
  checkDemoWelcome() {
    // 1. На телефонах и планшетах (сенсорных и узких экранах <= 768px) не выскакивает
    const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      (typeof window !== 'undefined' && (window.innerWidth <= 768 || (window.matchMedia && window.matchMedia('(max-width: 768px)').matches)));
    if (isMobileDevice) {
      return;
    }

    // 2. Не показывать, если пользователь уже поставил галочку «Больше не показывать»
    if (localStorage.getItem('sg_hide_demo_welcome') === 'true') {
      return;
    }

    // 3. Показывать только если текущий план — демонстрационный
    if (!this.storage || typeof this.storage.isDemoData !== 'function' || !this.storage.isDemoData()) {
      return;
    }

    // 4. Пауза 500мс для плавной отрисовки карты на заднем плане
    setTimeout(() => {
      this.openDemoWelcomeModal();
    }, 500);
  }
  });
})();
