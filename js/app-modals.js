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
        title: "📖 Руководство пользователя «Мой Огород»",
        subtitle: "Интерактивная инструкция по работе с картой, грядками, севооборотом и резервными копиями",
        tabs: [
          { id: 'quickstart', label: '🚀 Быстрый старт' },
          { id: 'rotation', label: '🔄 Севооборот' },
          { id: 'beds', label: '📦 Конструктор грядок' },
          { id: 'data', label: '💾 Данные и копии' },
          { id: 'tips', label: '💡 Советы агронома' },
          { id: 'donate', label: '☕ Поддержать автора' },
          { id: 'feedback', label: '💡 Идеи и отзывы' }
        ],
        sections: {
          quickstart: [
            {
              icon: '🖱️',
              title: 'Перемещение и масштаб карты (Pan & Zoom)',
              desc: 'Зажмите левую кнопку мыши на свободном поле огорода и перетаскивайте карту в любую сторону. Колёсико мыши плавно увеличивает или уменьшает масштаб от 15% до 200%.'
            },
            {
              icon: '⛶',
              title: 'Кнопки «Вписать всё» и «Центр»',
              desc: 'Кнопка <strong>⛶ Вписать всё</strong> автоматически рассчитывает границы ваших посадок и настраивает масштаб так, чтобы все грядки аккуратно поместились на экране. Кнопка <strong>📍 Центр</strong> возвращает камеру к началу координат.'
            },
            {
              icon: '📏',
              title: 'Автоматическая расстановка дорожек',
              desc: 'Кнопка <strong>📏 Расставить дорожки</strong> мгновенно упорядочивает грядки ровными рядами с комфортными проходами по 60 см без взаимных наложений.'
            },
            {
              icon: '🖐️',
              title: 'Перемещение грядок по участку',
              desc: 'Зажмите маркер <span class="help-kbd">⋮⋮</span> в левом углу грядки или её заголовок и перетаскивайте в любое удобное место. Новые координаты сохраняются автоматически.'
            },
            {
              icon: '↻',
              title: 'Поворот и дублирование',
              desc: 'Кнопка <strong>↻</strong> на карточке грядки поворачивает её на 90°. Кнопка <strong>❐</strong> мгновенно создаёт рядом точную копию грядки, а кнопка <strong>🗑️</strong> удаляет её.'
            }
          ],
          rotation: [
            {
              icon: '🟢',
              title: 'Зелёный индикатор — «Идеально»',
              desc: 'Превосходный предшественник! Растения принадлежат к разным семействам, почва отдохнула, отсутствуют общие болезни и вредители. Урожай будет максимальным.'
            },
            {
              icon: '🟡',
              title: 'Жёлтый индикатор — «Внимание»',
              desc: 'Допустимый предшественник. Посадка возможна, однако рекомендуется обогатить почву: внести перегной, компост, биогумус или золу.'
            },
            {
              icon: '🔴',
              title: 'Красный индикатор — «Нарушение!»',
              desc: 'Недопустимо! Родственные культуры из одного ботанического семейства (например, томат после картофеля — оба Паслёновые) либо опасный предшественник. Высокий риск фитофторы, нематод и почвоутомления.'
            },
            {
              icon: '💡',
              title: 'Блок умных рекомендаций агронома',
              desc: 'При выборе грядки система автоматически анализирует её историю за все прошедшие годы и прямо в панели Инспектора предлагает <strong>ТОП лучших культур</strong> для посадки на этот сезон с возможностью выбора в 1 клик.'
            },
            {
              icon: '👁️',
              title: 'Режим «Наложить прошлый год»',
              desc: 'Кнопка <strong>👁️ Наложить прошлый год</strong> на панели фильтров проецирует посадки предшествующего сезона полупрозрачным слоем прямо на план огорода.'
            }
          ],
          beds: [
            {
              icon: '🏠',
              title: 'Теплицы с независимыми секциями',
              desc: 'Создавайте теплицы с 2 или 3 отдельными рядами (Левый, Центр, Правый) с проходами. В каждой секции можно независимо сажать свою культуру и контролировать севооборот.'
            },
            {
              icon: '🪵',
              title: 'Разнообразие конструкций',
              desc: 'В конструкторе доступны теплицы, приподнятые деревянные короба, открытый грунт, многолетние клубничники (ягодники) и тёплые органические грядки.'
            },
            {
              icon: '📐',
              title: 'Создание ряда или целой сетки грядок',
              desc: 'Режим <strong>«Ряд грядок»</strong> позволяет в 1 клик разместить от 2 до 8 одинаковых параллельных грядок. Режим <strong>«Сетка грядок»</strong> создаёт квартал (например, 3 × 4 = 12 шт) с заданными проходами.'
            },
            {
              icon: '✏️',
              title: 'Сорта, гибриды и заметки по уходу',
              desc: 'Для каждой грядки или рядка можно указать конкретный сорт («Бычье сердце», «Кураж F1») и записать памятку по поливу, подкормке, дате посева и сбора урожая.'
            }
          ],
          data: [
            {
              icon: '💾',
              title: 'Полная автономность и автосохранение',
              desc: 'Программа работает без интернета. Все грядки, сезоны и заметки моментально сохраняются в локальной памяти вашего браузера или приложения (LocalStorage).'
            },
            {
              icon: '📥',
              title: 'Сохранение плана в файл',
              desc: 'Через кнопку <strong>«💾 Резервная копия»</strong> сохраните файл плана на свой компьютер или телефон, чтобы обезопасить данные или перенести их на другое устройство.'
            },
            {
              icon: '📤',
              title: 'Загрузка и перенос плана',
              desc: 'С помощью кнопки <strong>«📤 Загрузить план из файла»</strong> вы можете в любой момент открыть сохранённый файл и мгновенно восстановить всю расстановку грядок со всей историей.'
            },
            {
              icon: '🔄',
              title: 'Демо-образец для обучения',
              desc: 'Кнопка <strong>«🔄 Демо-пример»</strong> загружает готовый образец участка с 26 грядками и теплицами и историей за 3 года (2024–2026).'
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
              icon: '❤️',
              title: 'Программа бесплатна для всех дачников',
              desc: '«Умный Огород» создан с душой и распространяется свободно. Если программа вам помогла и сберегла силы, вы можете поблагодарить автора любой приятной суммой или чашкой кофе!'
            },
            {
              icon: '🇪🇪',
              title: 'Страны Балтии и Европа (EUR): Swedbank',
              desc: 'Получатель: <strong>IGOR SURKIN</strong><br>Банк: <strong>Swedbank AS (Estonia, SEPA Instant)</strong><br>IBAN: <strong class="help-kbd" style="font-size:0.95rem;">EE882200001105095456</strong><br>Назначение: <em>Toetus / Благодарность за программу</em>'
            },
            {
              icon: '🇷🇺',
              title: 'Россия и другие страны (RUB): Сервис Boosty',
              desc: 'Удобная добровольная поддержка с любых российских карт (МИР, Сбербанк, Т-Банк, СБП):<br><a href="https://boosty.to/igor.surkin/donate" target="_blank" style="color: #ea580c; font-weight: 700; text-decoration: underline;">https://boosty.to/igor.surkin/donate</a>'
            }
          ],
          feedback: [
            {
              icon: '💡',
              title: 'Предложить новую функцию или улучшение',
              desc: 'Есть идея, как сделать планировщик ещё удобнее? Нажмите кнопку <strong>«💡 Идеи и отзывы»</strong> в верхнем меню программы, чтобы отправить ваше пожелание автору.'
            },
            {
              icon: '🌱',
              title: 'Добавить культуру, сорт или региональное правило',
              desc: 'Если в энциклопедии не хватает вашего любимого растения или сорта — напишите нам! Мы оперативно добавим его характеристики, совместимость и сроки возврата.'
            },
            {
              icon: '🐛',
              title: 'Сообщить об ошибке или неточности',
              desc: 'Заметили опечатку, сбой в расчете севооборота или странное поведение интерфейса? Сообщите через форму обратной связи — исправим в ближайшем обновлении.'
            },
            {
              icon: '✉️',
              title: 'Прямой контакт с автором',
              desc: 'Вы также можете написать напрямую на email: <strong style="color:var(--primary);">igor.surkin64@gmail.com</strong>. Автор лично отвечает на все письма садоводов.'
            }
          ]
        }
      },
      et: {
        title: "📖 Kasutusjuhend «Minu Aed»",
        subtitle: "Interaktiivne juhend aiamaa kaardi, peenarde, külvikorra ja varukoopiate haldamiseks",
        tabs: [
          { id: 'quickstart', label: '🚀 Kiire algus' },
          { id: 'rotation', label: '🔄 Külvikord' },
          { id: 'beds', label: '📦 Peenarde ehitaja' },
          { id: 'data', label: '💾 Andmed ja varukoopiad' },
          { id: 'tips', label: '💡 Nõuanded' },
          { id: 'donate', label: '☕ Toeta autorit' },
          { id: 'feedback', label: '💡 Tagasiside & ideed' }
        ],
        sections: {
          quickstart: [
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
              icon: '❤️',
              title: 'Programm on kõigile aednikele tasuta',
              desc: '«Minu Aed» on loodud armastusega aiapidamise vastu ja levitatakse täiesti tasuta. Kui programm on teile abiks olnud, saate autorit tänada teile sobiva toetusega!'
            },
            {
              icon: '🇪🇪',
              title: 'Balti riigid ja Euroopa (EUR): Swedbank',
              desc: 'Saaja: <strong>IGOR SURKIN</strong><br>Pank: <strong>Swedbank AS (Estonia, SEPA Instant)</strong><br>IBAN: <strong class="help-kbd" style="font-size:0.95rem;">EE882200001105095456</strong><br>Selgitus: <em>Toetus aiatarkvarale</em>'
            },
            {
              icon: '🇷🇺',
              title: 'Venemaa ja teised riigid (RUB): Boosty',
              desc: 'Vabatahtlik toetus Boosty kaudu (MIR kaardid, SBP, pangad):<br><a href="https://boosty.to/igor.surkin/donate" target="_blank" style="color: #ea580c; font-weight: 700; text-decoration: underline;">https://boosty.to/igor.surkin/donate</a>'
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
        title: "📖 Lietotāja rokasgrāmata «Mans Dārzs»",
        subtitle: "Interaktīva pamācība darbam ar dārza plānu, dobēm, augseku un datu dublēšanu",
        tabs: [
          { id: 'quickstart', label: '🚀 Ātrais starts' },
          { id: 'rotation', label: '🔄 Augseka' },
          { id: 'beds', label: '📦 Dobju konstruktors' },
          { id: 'data', label: '💾 Dati un kopijas' },
          { id: 'tips', label: '💡 Padomi' },
          { id: 'donate', label: '☕ Atbalstīt autoru' },
          { id: 'feedback', label: '💡 Idejas & atsauksmes' }
        ],
        sections: {
          quickstart: [
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
              icon: '❤️',
              title: 'Programma ir bezmaksas ikvienam dārzniekam',
              desc: '«Mans Dārzs» ir radīts ar mīlestību un tiek izplatīts bez maksas. Ja programma jums ir noderējusi, varat pateikties autoram ar brīvprātīgu atbalstu!'
            },
            {
              icon: '🇪🇪',
              title: 'Baltijas valstis un Eiropa (EUR): Swedbank',
              desc: 'Saņēmējs: <strong>IGOR SURKIN</strong><br>Banka: <strong>Swedbank AS (Estonia, SEPA Instant)</strong><br>IBAN: <strong class="help-kbd" style="font-size:0.95rem;">EE882200001105095456</strong><br>Mērķis: <em>Toetus / Ziedojums dārza programmai</em>'
            },
            {
              icon: '🇷🇺',
              title: 'Krievija un citas valstis (RUB): Boosty',
              desc: 'Brīvprātīgs atbalsts caur Boosty platformu (MIR kartes, SBP, bankas):<br><a href="https://boosty.to/igor.surkin/donate" target="_blank" style="color: #ea580c; font-weight: 700; text-decoration: underline;">https://boosty.to/igor.surkin/donate</a>'
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
        title: "📖 Vartotojo vadovas «Mano Daržas»",
        subtitle: "Interaktyvi instrukcija darbui su daržo planu, lysvėmis, sėjomaina ir atsarginėmis kopijomis",
        tabs: [
          { id: 'quickstart', label: '🚀 Greita pradžia' },
          { id: 'rotation', label: '🔄 Sėjomaina' },
          { id: 'beds', label: '📦 Lysvių konstruktorius' },
          { id: 'data', label: '💾 Duomenys ir kopijos' },
          { id: 'tips', label: '💡 Patarimai' },
          { id: 'donate', label: '☕ Paremti autorių' },
          { id: 'feedback', label: '💡 Idėjos & atsiliepimai' }
        ],
        sections: {
          quickstart: [
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
              icon: '❤️',
              title: 'Programa yra nemokama kiekvienam sodininkui',
              desc: '«Mano Daržas» sukurtas su meile ir platinamas visiškai nemokamai. Jei programa jums padėjo patogiai susiplanuoti daržą, galite padėkoti autoriui savanoriška parama!'
            },
            {
              icon: '🇪🇪',
              title: 'Baltijos šalys ir Europa (EUR): Swedbank',
              desc: 'Gavėjas: <strong>IGOR SURKIN</strong><br>Bankas: <strong>Swedbank AS (Estonia, SEPA Instant)</strong><br>IBAN: <strong class="help-kbd" style="font-size:0.95rem;">EE882200001105095456</strong><br>Paskirtis: <em>Toetus / Parama daržo programai</em>'
            },
            {
              icon: '🇷🇺',
              title: 'Rusija ir kitos šalys (RUB): Boosty',
              desc: 'Savanoriškas palaikymas per Boosty platformą (MIR kortelės, SBP, bankai):<br><a href="https://boosty.to/igor.surkin/donate" target="_blank" style="color: #ea580c; font-weight: 700; text-decoration: underline;">https://boosty.to/igor.surkin/donate</a>'
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

    const tr = (k) => (window.t ? window.t(k) : k);
    const iban = "EE882200001105095456";
    const recipient = "IGOR SURKIN";
    const bank = "Swedbank AS (Estonia, SEPA)";
    const boostyUrl = "https://boosty.to/igor.surkin/donate";

    modalContent.innerHTML = `
      <div class="modal-card modal-donate-card">
        <div class="modal-header">
          <div class="modal-header-info">
            <h3 style="display: flex; align-items: center; gap: 0.5rem; margin: 0;">
              ${tr('donate_modal_title') || '☕ Поддержка автора проекта'}
            </h3>
            <span class="modal-subtitle" style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; display: block;">
              ${tr('donate_modal_subtitle') || '«Умный Огород» — бесплатная программа для всех садоводов. Любая поддержка помогает развивать проект!'}
            </span>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- Вариант 1: Страны Балтии и Европа (EUR) -->
          <div class="donate-method-card">
            <div class="donate-method-header">
              <span class="donate-method-title">
                ${tr('donate_baltic_title') || '🇪🇪 🇱🇻 🇱🇹 🇪🇺 Для стран Балтии и Европы (EUR)'}
              </span>
              <span class="donate-method-badge">SEPA Instant</span>
            </div>
            
            <p style="font-size: 0.86rem; color: var(--text-secondary); margin: 0;">
              ${tr('donate_baltic_desc') || 'Прямой банковский перевод SEPA без комиссии:'}
            </p>

            <div class="donate-field-row">
              <span class="donate-field-label">${tr('donate_recipient_label') || 'Получатель:'}</span>
              <span class="donate-field-val">${recipient}</span>
            </div>

            <div class="donate-field-row">
              <span class="donate-field-label">${tr('donate_bank_label') || 'Банк:'}</span>
              <span class="donate-field-val">${bank}</span>
            </div>

            <div class="donate-field-row">
              <span class="donate-field-label">${tr('donate_iban_label') || 'Номер счёта (IBAN):'}</span>
              <div class="donate-iban-wrap">
                <span class="donate-iban-code" id="donate-iban-text">${iban}</span>
                <button type="button" class="donate-copy-btn" id="donate-copy-iban-btn">
                  ${tr('donate_btn_copy') || '📋 Скопировать IBAN'}
                </button>
              </div>
            </div>

            <div class="donate-sepa-callout">
              <span>💡</span>
              <span>${tr('donate_sepa_note') || 'Мгновенные переводы SEPA без комиссии из любых банков Эстонии, Латвии, Литвы и Европы.'}</span>
            </div>
          </div>

          <!-- Вариант 2: Россия и страны СНГ (RUB) -->
          <div class="donate-method-card">
            <div class="donate-method-header">
              <span class="donate-method-title">
                ${tr('donate_rub_title') || '🇷🇺 Для жителей России и других стран (RUB)'}
              </span>
              <span class="donate-method-badge" style="background: rgba(234, 88, 12, 0.1); color: #ea580c; border-color: rgba(234, 88, 12, 0.3);">
                МИР / СБП
              </span>
            </div>

            <p style="font-size: 0.86rem; color: var(--text-secondary); margin: 0;">
              ${tr('donate_rub_desc') || 'Добровольная поддержка через сервис Boosty (любые карты МИР, СБП, Сбербанк, Т-Банк):'}
            </p>

            <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
              <a href="${boostyUrl}" target="_blank" rel="noopener noreferrer" class="donate-boosty-btn" id="donate-boosty-link">
                ${tr('donate_btn_boosty') || '☕ Поддержать на Boosty'} ↗
              </a>
              <button type="button" class="btn btn-outline btn-sm" id="donate-copy-link-btn">
                ${tr('donate_btn_copy_link') || '📋 Скопировать ссылку'}
              </button>
            </div>

            <div class="donate-link-row">
              <span class="donate-link-text">${boostyUrl}</span>
            </div>
          </div>

        </div>

        <div class="modal-footer" style="padding: 1rem 1.5rem; background: var(--bg-tertiary); display: flex; justify-content: flex-end;">
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

    // Копирование IBAN
    const copyIbanBtn = document.getElementById('donate-copy-iban-btn');
    if (copyIbanBtn) {
      copyIbanBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(iban).then(() => {
          copyIbanBtn.textContent = '✓ Скопировано!';
          copyIbanBtn.classList.add('copied');
          this.showToast(tr('donate_copied_toast') || '✓ Номер счёта (IBAN) скопирован в буфер обмена!');
          setTimeout(() => {
            copyIbanBtn.textContent = tr('donate_btn_copy') || '📋 Скопировать IBAN';
            copyIbanBtn.classList.remove('copied');
          }, 2500);
        }).catch(() => {
          this.showToast(iban);
        });
      });
    }

    // Копирование ссылки Boosty
    const copyLinkBtn = document.getElementById('donate-copy-link-btn');
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(boostyUrl).then(() => {
          copyLinkBtn.textContent = '✓ Скопировано!';
          this.showToast(tr('donate_link_copied_toast') || '✓ Ссылка на Boosty скопирована в буфер обмена!');
          setTimeout(() => {
            copyLinkBtn.textContent = tr('donate_btn_copy_link') || '📋 Скопировать ссылку';
          }, 2500);
        }).catch(() => {
          this.showToast(boostyUrl);
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

        <div class="modal-body" style="padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1.15rem;">
          
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

        <div class="modal-footer" style="padding: 1rem 1.5rem; background: var(--bg-tertiary); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-outline btn-sm" id="feedback-copy-text-btn">
              ${tr('feedback_btn_copy') || '📋 Скопировать текст'}
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="feedback-open-gmail-btn">
              ${tr('feedback_btn_gmail') || '🌐 Открыть в Gmail'}
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="feedback-send-primary-btn">
              ${tr('feedback_btn_send_mail') || '✉️ Отправить по Email'}
            </button>
          </div>

          <button type="button" class="feedback-telegram-btn" id="feedback-send-telegram-btn">
            ${tr('feedback_btn_telegram') || '✈️ Написать в Telegram-чат (@smartgarden_chat)'}
          </button>
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

        // Бот токен закодирован в base64 от автоматических поисковых ботов
        const botKey = atob('ODg3MTgxNDY1MTpBQUdvUUF5amlGS0czdjdOWGZ0MDlyN1pHTTZnSklfc1Rtbw==');
        const tgApiUrl = `https://api.telegram.org/bot${botKey}/sendMessage`;

        try {
          const resp = await fetch(tgApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: '@smartgarden_chat',
              text: tgHtml,
              parse_mode: 'HTML'
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
            throw new Error(resData?.description || 'Telegram API error');
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
  }
  });
})();
