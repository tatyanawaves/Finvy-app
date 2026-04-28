// ─────────────────────────────────────────────────────────────────────────────
// Казахстанские банки — точная база кэшбэков
// Обновлено: 27 апреля 2026
// Ключевые изменения апреля:
//   • Kaspi Gold: с 31.03.2026 базовый кэшбэк 0,15% (раньше 0,5%), бонусы только в промо
//   • Freedom Bank: с 01.03.2026 +2% Apple/Google/Samsung Pay только для Platinum;
//     Standard уровень — 1.5% NFC (раньше 3%); +2% за SuperApp отменён
//   • Freedom Bank: с 31.03.2026 транзакционный кэшбэк за покупки на сайтах отключён
//   • RBK Infinite: акция 8% действует до 30.04.2026 (заканчивается на этой неделе)
//   • Kaspi Gold: с 10.05.2026 — комиссия 5% за операции свыше 300 000 ₸
// Источники: kaspi.kz, halykbank.kz, bankffin.kz, bankrbk.kz/sarqyt, home.kz,
//            simply.cards, forte.kz, finratings.kz, bizmedia.kz
// ─────────────────────────────────────────────────────────────────────────────

export const CB_CATS = {
  GROCERY:       'grocery',       // продукты, супермаркеты
  DINING:        'dining',        // рестораны, кафе, доставка
  FUEL:          'fuel',          // АЗС, бензин
  TRANSPORT:     'transport',     // такси, транспорт, каршеринг
  ONLINE:        'online',        // онлайн-покупки, маркетплейсы
  ENTERTAINMENT: 'entertainment', // кино, спорт, развлечения
  TRAVEL:        'travel',        // авиа, отели, Duty Free
  HEALTH:        'health',        // аптеки, медицина, фитнес
  UTILITIES:     'utilities',     // коммунальные, связь, интернет
  FASHION:       'fashion',       // одежда, обувь
  ELECTRONICS:   'electronics',   // техника, электроника
  EDUCATION:     'education',     // образование, курсы
  OTHER:         'other',
}

// ─────────────────────────────────────────────────────────────────────────────
// Ключевые слова для матчинга категорий (рус/англ)
// ─────────────────────────────────────────────────────────────────────────────
export const CATEGORY_KEYWORDS = {
  [CB_CATS.GROCERY]: [
    'продукт', 'супермаркет', 'магазин', 'бакалея', 'гастроном', 'рынок', 'корзина',
    'grocery', 'supermarket', 'market', 'food shop', 'дастархан', 'magnum', 'small',
    'арзан', 'metro', 'деликатес', 'продуктов', 'arbuz', 'арбуз',
  ],
  [CB_CATS.DINING]: [
    'ресторан', 'кафе', 'еда', 'обед', 'ужин', 'завтрак', 'доставка еды', 'фастфуд',
    'restaurant', 'cafe', 'dining', 'food', 'lunch', 'dinner', 'пицца', 'кафетерий',
    'burger', 'суши', 'sushi', 'wolt', 'chocofood', 'glovo', 'яндекс еда', 'доставка',
  ],
  [CB_CATS.FUEL]: [
    'бензин', 'азс', 'топливо', 'заправка', 'helios', 'sinooil', 'казмунайгаз',
    'fuel', 'gas', 'petrol', 'газ', 'гсм', 'нефть',
  ],
  [CB_CATS.TRANSPORT]: [
    'такси', 'яндекс такси', 'indriver', 'uber', 'метро', 'автобус', 'проезд',
    'транспорт', 'каршеринг', 'taxi', 'transport', 'паркинг', 'жд', 'поезд',
  ],
  [CB_CATS.ONLINE]: [
    'онлайн', 'kaspi', 'ozon', 'wildberries', 'aliexpress', 'amazon',
    'интернет покупки', 'online', 'маркетплейс', 'marketplace', 'lamoda',
  ],
  [CB_CATS.ENTERTAINMENT]: [
    'кино', 'развлечения', 'chaplin', 'kinopark', 'concert', 'концерт', 'боулинг',
    'спорт', 'sport', 'entertainment', 'игры', 'games', 'netflix', 'spotify',
    'клуб', 'bar', 'бар', 'meloman', 'меломан', 'ticketon', 'тикетон', 'подписки', 'подписка',
  ],
  [CB_CATS.TRAVEL]: [
    'авиа', 'отель', 'туризм', 'путешествие', 'тур', 'hotel', 'flight',
    'air astana', 'travel', 'booking', 'airbnb', 'отпуск', 'авиата', 'aviata',
    'duty free', 'дьюти фри', 'зарубеж', 'заграниц',
  ],
  [CB_CATS.HEALTH]: [
    'аптека', 'медицина', 'клиника', 'pharmacy', 'apteka', 'doctor',
    'доктор', 'health', 'фитнес', 'fitness', 'спортзал', 'gym',
    'dentist', 'стоматолог', 'больница', 'лекарств',
  ],
  [CB_CATS.UTILITIES]: [
    'коммунал', 'свет', 'вода', 'газ оплата', 'интернет', 'связь', 'телефон',
    'utilities', 'internet', 'mobile', 'тариф', 'kcell', 'tele2',
    'beeline', 'activ', 'altel', 'жкх', 'квартплат', 'электроэнергия',
  ],
  [CB_CATS.FASHION]: [
    'одежда', 'обувь', 'fashion', 'zara', 'h&m', 'lcw',
    'clothing', 'shoes', 'accessories', 'аксессуары', 'сумка', 'бутик',
  ],
  [CB_CATS.ELECTRONICS]: [
    'электроника', 'техника', 'electronics', 'sulpak', 'mechta', 'technodom',
    'мечта', 'сулпак', 'технодом', 'ноутбук', 'laptop', 'iphone', 'samsung', 'btech',
  ],
  [CB_CATS.EDUCATION]: [
    'образование', 'курсы', 'школа', 'университет', 'education',
    'training', 'обучение', 'репетитор', 'детский сад',
  ],
}

export function matchCategory(txCategoryName) {
  if (!txCategoryName) return CB_CATS.OTHER
  const lower = txCategoryName.toLowerCase()
  for (const [cbKey, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return cbKey
    }
  }
  return CB_CATS.OTHER
}

// ─────────────────────────────────────────────────────────────────────────────
// БАЗЫ БАНКОВ (точные данные на основе официальных сайтов)
// ─────────────────────────────────────────────────────────────────────────────
export const BANKS = [

  // ── KASPI BANK ─────────────────────────────────────────────────────────────
  {
    id: 'kaspi',
    name: 'Kaspi Bank',
    nameRu: 'Каспи Банк',
    color: '#FF0000',
    logo: '🔴',
    url: 'https://kaspi.kz/shop',
    description: 'Самый популярный банк КЗ. С 31.03.2026: базовый кэшбэк 0,15% (только Kaspi QR/Магазин), бонусы только в промо-акциях (до 60% на Kaspi Жұма).',
    cards: [
      {
        name: 'Kaspi Gold',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: '0,15% базовый + до 60% в промо Kaspi Жұма',
        note: '⚠️ С 31.03.2026 правила изменились: бонусы НЕ начисляются за каждую покупку. Только: 0,15% на покупки через Kaspi QR у партнёров и в Магазине Kaspi.kz; до 15% у партнёров через QR; до 60% в Kaspi Магазин в промо-дни (Kaspi Жұма). Детская карта Kaspi Gold: 10 000 ₸/год (была бесплатной). С 10.05.2026: операции свыше 300 000 ₸ — комиссия 5%.',
        cashbacks: [
          { cat: CB_CATS.OTHER,         percent: 0.15, note: 'Базовый — только Kaspi QR у партнёров (бонусами)', maxMonthly: null },
          { cat: CB_CATS.GROCERY,       percent: 2,    note: 'Партнёры Kaspi Магазин (продукты, в промо)', maxMonthly: null },
          { cat: CB_CATS.ELECTRONICS,   percent: 10,   note: 'Kaspi Магазин — техника (промо+рассрочка)', maxMonthly: null },
          { cat: CB_CATS.ONLINE,        percent: 5,    note: 'Kaspi.kz покупки в Магазине', maxMonthly: null },
          { cat: CB_CATS.DINING,        percent: 15,   note: 'Партнёры через Kaspi QR (промо)', maxMonthly: null },
        ],
      },
    ],
  },

  // ── HALYK BANK ─────────────────────────────────────────────────────────────
  {
    id: 'halyk',
    name: 'Halyk Bank',
    nameRu: 'Халык Банк',
    color: '#00853F',
    logo: '🟢',
    url: 'https://halykbank.kz/cards',
    description: 'Крупнейший банк Казахстана. Кэшбэк в виде бонусов Halyk Club, до 30% у партнёров.',
    cards: [
      {
        name: 'Halyk Bonus Digital',
        type: 'debit',
        annualFee: 0,
        annualFeeNote: '0 ₸ первый год, затем 150 ₸/мес',
        currency: 'KZT',
        highlight: '1% NFC/QR + до 30% у партнёров Halyk Club',
        note: 'Кэшбэк бонусными баллами (1 балл = 1 ₸). 1% на оплату смартфоном (Apple Pay, Samsung Pay, Google Pay, QR) в POS-терминалах Halyk. 1% на платежи в приложении Halyk. До 10% по спецпрограммам, до 30% в сети партнёров Halyk Club.',
        cashbacks: [
          { cat: CB_CATS.OTHER,      percent: 1,   note: 'NFC/QR оплата смартфоном в POS Halyk', maxMonthly: null },
          { cat: CB_CATS.GROCERY,    percent: 5,   note: 'В супермаркетах SMALL & Skif (партнёры)', maxMonthly: 8000 },
          { cat: CB_CATS.TRAVEL,     percent: 5,   note: 'Покупки в Halyk Travel', maxMonthly: 15000 },
          { cat: CB_CATS.UTILITIES,  percent: 5,   note: 'Коммунальные через Homebank (бонусами)', maxMonthly: 5000 },
          { cat: CB_CATS.ELECTRONICS,percent: 10,  note: 'В Technodom по промо Halyk Club', maxMonthly: 10000 },
        ],
      },
      {
        name: 'Halyk UnionPay',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: '5–7% на все покупки + зарубеж',
        note: 'Кэшбэк реальными деньгами. Макс. ~10 USD за транзакцию',
        cashbacks: [
          { cat: CB_CATS.OTHER,   percent: 5,  note: 'Все безналичные покупки (макс. ~4 800 ₸/транзакция)', maxMonthly: 20000 },
          { cat: CB_CATS.ONLINE,  percent: 7,  note: 'Иностранные сайты и онлайн-покупки за рубежом', maxMonthly: 20000 },
          { cat: CB_CATS.TRAVEL,  percent: 7,  note: 'Покупки за рубежом', maxMonthly: 20000 },
        ],
      },
      {
        name: 'Halyk Bonus Calendar',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: '7% на ротирующую категорию каждые 4 дня',
        note: 'Категория меняется каждые 4 дня, отображается в Halyk App',
        cashbacks: [
          { cat: CB_CATS.GROCERY,       percent: 7, note: 'В дни акции (через Halyk QR)', maxMonthly: 5000 },
          { cat: CB_CATS.DINING,        percent: 7, note: 'В дни акции', maxMonthly: 5000 },
          { cat: CB_CATS.FUEL,          percent: 7, note: 'В дни акции', maxMonthly: 5000 },
          { cat: CB_CATS.ENTERTAINMENT, percent: 7, note: 'В дни акции', maxMonthly: 5000 },
          { cat: CB_CATS.OTHER,         percent: 1, note: 'В остальные дни', maxMonthly: null },
        ],
      },
    ],
  },

  // ── FREEDOM BANK (FFIN) ─────────────────────────────────────────────────────
  {
    id: 'ffin',
    name: 'Freedom Bank',
    nameRu: 'Фридом Банк',
    color: '#FF6B35',
    logo: '🟠',
    url: 'https://bankffin.kz/ru/cards',
    description: 'Уникальный кэшбэк в "Freedom валюте" — привязан к акциям FRHC (NASDAQ). Растёт вместе с акциями.',
    cards: [
      {
        name: 'Freedom Card',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: 'До 30% в Freedom-валюте (инвестиционный кэшбэк)',
        note: '⚡ Кэшбэк в Freedom Currency (= акции FRHC). Уровни: Standard 1%, Silver 2%, Gold 3%, Platinum 4%. Бесплатное снятие до 500 000 ₸. ⚠️ С 01.03.2026: бонус +2% Apple/Google/Samsung Pay только для Platinum; Standard NFC снижен с 3% до 1.5%; бонус +2% за SuperApp отменён; бонус +1% за оборот >50K отменён. С 31.03.2026: транзакционный кэшбэк за покупки на сайтах отключён (только мобильные приложения).',
        cashbacks: [
          { cat: CB_CATS.OTHER,         percent: 1.5, note: 'Standard NFC (с 01.03 урезано с 3%)', maxMonthly: null },
          { cat: CB_CATS.ONLINE,        percent: 5,   note: 'Онлайн-покупки только в приложениях (с 31.03 сайты исключены)', maxMonthly: null },
          { cat: CB_CATS.TRAVEL,        percent: 14,  note: 'Aviata.kz — авиабилеты (партнёрский)', maxMonthly: null },
          { cat: CB_CATS.GROCERY,       percent: 22,  note: 'Arbuz.kz — продуктовая доставка (партнёрский)', maxMonthly: null },
          { cat: CB_CATS.ENTERTAINMENT, percent: 15,  note: 'Ticketon.kz — билеты (партнёрский)', maxMonthly: null },
        ],
      },
      {
        name: 'Freedom Platinum',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: 'Platinum: до 7% NFC + 4% базовый',
        note: 'Премиум уровень программы (требуется оборот >2 млн ₸/мес или активы >5 млн ₸). Сохраняет повышенный кэшбэк после изменений 01.03.2026. +2% за NFC сохраняется только на этом уровне.',
        cashbacks: [
          { cat: CB_CATS.OTHER,         percent: 7,   note: 'POS NFC (Apple/Google/Samsung Pay) — Platinum', maxMonthly: null },
          { cat: CB_CATS.ONLINE,        percent: 5,   note: 'Онлайн в приложениях', maxMonthly: null },
          { cat: CB_CATS.TRAVEL,        percent: 14,  note: 'Aviata.kz', maxMonthly: null },
          { cat: CB_CATS.GROCERY,       percent: 22,  note: 'Arbuz.kz', maxMonthly: null },
          { cat: CB_CATS.ENTERTAINMENT, percent: 15,  note: 'Ticketon.kz', maxMonthly: null },
        ],
      },
      {
        name: 'Freedom Student',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        maxAge: 17,
        minAge: 14,
        highlight: 'До 37% кэшбэк для подростков 14–17 лет',
        note: '⚡ Максимальный кэшбэк в Freedom Currency. Возрастное ограничение: строго 14–17 лет (не студенческий статус). С 16 лет — открытие онлайн через SuperApp, 14–15 лет — в отделении с согласия родителей. Баланс от 100 000 ₸ совокупно на всех счетах для начисления % на остаток (до 13.8% годовых).',
        cashbacks: [
          { cat: CB_CATS.OTHER,      percent: 37,  note: 'Максимальный при выполнении условий (Freedom Currency)', maxMonthly: null },
          { cat: CB_CATS.EDUCATION,  percent: 37,  note: 'Образовательные платежи', maxMonthly: null },
          { cat: CB_CATS.GROCERY,    percent: 22,  note: 'Arbuz.kz (партнёрский)', maxMonthly: null },
        ],
      },
    ],
  },

  // ── RBK BANK (SARQYT) ──────────────────────────────────────────────────────
  {
    id: 'rbk',
    name: 'RBK Bank',
    nameRu: 'РБК Банк',
    color: '#1A73E8',
    logo: '🔵',
    url: 'https://bankrbk.kz/ru/individuals/card/sarqyt',
    description: 'Программа SARQYT: реальный кэшбэк деньгами на счёт. Ставка зависит от типа карты и остатка.',
    cards: [
      {
        name: 'RBK Gold / Virtual',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: '3% кэшбэк реальными деньгами',
        note: 'SARQYT: 3% на все покупки. Нужен неснижаемый остаток 75 000 ₸. Макс. 30 000 ₸/мес.',
        cashbacks: [
          { cat: CB_CATS.OTHER,         percent: 3,  note: 'Все безналичные покупки (кроме исключений)', maxMonthly: 30000 },
          { cat: CB_CATS.DINING,        percent: 20, note: 'Рестораны в рамках промо', maxMonthly: 5000 },
          { cat: CB_CATS.ENTERTAINMENT, percent: 20, note: 'Кино в рамках промо', maxMonthly: 3000 },
          { cat: CB_CATS.TRAVEL,        percent: 5,  note: 'Booking.com — отели', maxMonthly: 10000 },
          // Excluded: utilities, telecom, gas/supermarket get max 0.7%
          { cat: CB_CATS.FUEL,          percent: 0.7, note: 'АЗС (ограниченная ставка)', maxMonthly: 1000 },
          { cat: CB_CATS.GROCERY,       percent: 0.7, note: 'Супермаркеты (ограниченная ставка)', maxMonthly: 1000 },
          { cat: CB_CATS.UTILITIES,     percent: 0,   note: 'Коммунальные и связь — не начисляется', maxMonthly: 0 },
        ],
      },
      {
        name: 'RBK Platinum',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: '4% кэшбэк реальными деньгами',
        note: 'SARQYT: 4% на все покупки. Неснижаемый остаток 150 000 ₸. Макс. 40 000 ₸/мес.',
        cashbacks: [
          { cat: CB_CATS.OTHER,         percent: 4,  note: 'Все безналичные покупки', maxMonthly: 40000 },
          { cat: CB_CATS.DINING,        percent: 20, note: 'Рестораны в промо-период', maxMonthly: 5000 },
          { cat: CB_CATS.ENTERTAINMENT, percent: 20, note: 'Кино в промо-период', maxMonthly: 3000 },
          { cat: CB_CATS.TRAVEL,        percent: 5,  note: 'Booking.com отели', maxMonthly: 10000 },
          { cat: CB_CATS.FUEL,          percent: 0.7, note: 'АЗС (ограниченно)', maxMonthly: 1000 },
          { cat: CB_CATS.GROCERY,       percent: 0.7, note: 'Супермаркеты (ограниченно)', maxMonthly: 1000 },
        ],
      },
      {
        name: 'RBK Signature',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: '6% кэшбэк — лучшее соотношение',
        note: 'SARQYT Signature: 6% на все покупки. Остаток 250 000 ₸. Макс. 60 000 ₸/мес.',
        cashbacks: [
          { cat: CB_CATS.OTHER,         percent: 6,  note: 'Все безналичные покупки', maxMonthly: 60000 },
          { cat: CB_CATS.DINING,        percent: 20, note: 'Рестораны в промо', maxMonthly: 5000 },
          { cat: CB_CATS.ENTERTAINMENT, percent: 20, note: 'Кино в промо', maxMonthly: 3000 },
          { cat: CB_CATS.TRAVEL,        percent: 5,  note: 'Booking.com', maxMonthly: 10000 },
          { cat: CB_CATS.HEALTH,        percent: 10, note: 'Косметика и здоровье в промо', maxMonthly: 5000 },
          { cat: CB_CATS.FUEL,          percent: 0.7, note: 'АЗС (ограниченно)', maxMonthly: 1000 },
          { cat: CB_CATS.GROCERY,       percent: 0.7, note: 'Супермаркеты (ограниченно)', maxMonthly: 1000 },
        ],
      },
      {
        name: 'RBK 1xCard (Спорт)',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: 'До 6% на спорт, 1% на всё остальное',
        note: 'Первый год бесплатно. Специализирован для спортивных покупок.',
        cashbacks: [
          { cat: CB_CATS.HEALTH,        percent: 6,  note: 'Спортивные товары и фитнес', maxMonthly: 10000 },
          { cat: CB_CATS.ENTERTAINMENT, percent: 6,  note: 'Спортивные события', maxMonthly: 5000 },
          { cat: CB_CATS.OTHER,         percent: 1,  note: 'Все остальные категории', maxMonthly: null },
        ],
      },
    ],
  },

  // ── HOME CREDIT (HOMECARD) ─────────────────────────────────────────────────
  {
    id: 'home',
    name: 'Home Credit',
    nameRu: 'Хоум Кредит',
    color: '#E91E8C',
    logo: '🩷',
    url: 'https://home.kz/debit-cards/homecard',
    description: 'HomeCard: до 5% тиерная система. HomeCard Lite: 10% на продукты, АЗС и коммунальные первые 90 дней.',
    cards: [
      {
        name: 'HomeCard',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: 'До 5% (1% базовый + 2%+2% при условиях)',
        note: '+2% при остатке ≥100 000 ₸, +2% при депозите ≥500 000 ₸. 1 балл = 1 ₸, срок 18 мес.',
        cashbacks: [
          { cat: CB_CATS.OTHER,      percent: 1,  note: 'Гарантированный на все покупки', maxMonthly: null },
          { cat: CB_CATS.GROCERY,    percent: 5,  note: 'До 5% при выполнении условий остатка и депозита', maxMonthly: 10000 },
          { cat: CB_CATS.DINING,     percent: 5,  note: 'До 5% при выполнении условий', maxMonthly: 5000 },
          { cat: CB_CATS.ONLINE,     percent: 5,  note: 'До 5% при выполнении условий', maxMonthly: 8000 },
          { cat: CB_CATS.ELECTRONICS,percent: 5,  note: 'В Technodom — партнёрский кэшбэк 5%', maxMonthly: 10000 },
        ],
      },
      {
        name: 'HomeCard Lite',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: '10% продукты + АЗС + коммунальные (90 дней)',
        note: '10% на супермаркеты, АЗС и коммунальные в первые 90 дней. Затем 5%. + 3 ротируемых категории 10%/мес.',
        cashbacks: [
          { cat: CB_CATS.GROCERY,    percent: 10, note: 'Супермаркеты (90 дней, затем 5%)', maxMonthly: 8000 },
          { cat: CB_CATS.FUEL,       percent: 10, note: 'АЗС (90 дней, затем 5%)', maxMonthly: 5000 },
          { cat: CB_CATS.UTILITIES,  percent: 10, note: 'Коммунальные через приложение (90 дней)', maxMonthly: 3000 },
          { cat: CB_CATS.OTHER,      percent: 5,  note: 'Ротируемые категории месяца (по 10%)', maxMonthly: 5000 },
          { cat: CB_CATS.HEALTH,     percent: 5,  note: 'Яндекс-сервисы (через Яндекс Plus)', maxMonthly: 3000 },
        ],
      },
    ],
  },

  // ── SIMPLY ─────────────────────────────────────────────────────────────────
  {
    id: 'simply',
    name: 'Simply',
    nameRu: 'Simply',
    color: '#7C3AED',
    logo: '🟣',
    url: 'https://www.simply.cards',
    description: 'Visa Platinum от ForteBank. Лучшая карта-компаньон для путешествий: 10% Duty Free, 3% NFC.',
    cards: [
      {
        name: 'Simply Card',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: '10% Duty Free за рубежом, 3% везде NFC',
        note: 'Visa Platinum, ForteBank. Идеальна для путешествий и ежедневных покупок через NFC.',
        cashbacks: [
          { cat: CB_CATS.TRAVEL,     percent: 10, note: 'Duty Free магазины за рубежом', maxMonthly: null },
          { cat: CB_CATS.OTHER,      percent: 3,  note: 'Все бесконтактные NFC-покупки', maxMonthly: null },
          { cat: CB_CATS.UTILITIES,  percent: 5,  note: 'Связь и интернет (Beeline промо завершено)', maxMonthly: 2500 },
          { cat: CB_CATS.ONLINE,     percent: 1.5,note: 'Онлайн-покупки без NFC', maxMonthly: null },
          { cat: CB_CATS.GROCERY,    percent: 3,  note: 'Через NFC в магазинах', maxMonthly: null },
          { cat: CB_CATS.DINING,     percent: 3,  note: 'Через NFC в кафе и ресторанах', maxMonthly: null },
          { cat: CB_CATS.FUEL,       percent: 3,  note: 'Через NFC на АЗС', maxMonthly: null },
          { cat: CB_CATS.TRANSPORT,  percent: 3,  note: 'Такси и транспорт через NFC', maxMonthly: null },
        ],
      },
    ],
  },

  // ── EURASIAN BANK ──────────────────────────────────────────────────────────
  {
    id: 'eubank',
    name: 'Eurasian Bank',
    nameRu: 'Евразийский банк',
    color: '#C8102E',
    logo: '🔴',
    url: 'https://eubank.kz/loyalty-program',
    description: 'Программа лояльности до 30% бонусов у партнёров. Карты «Чемпион» и «Просто».',
    cards: [
      {
        name: 'Eurasian Чемпион',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: 'До 30% бонусов у партнёров, 3% на повседневные покупки',
        note: 'Бонусы (не деньги), начисляются в программе лояльности. 1 бонус ≈ 1 ₸ при оплате.',
        cashbacks: [
          { cat: CB_CATS.OTHER,         percent: 3,  note: 'Все безналичные покупки (бонусами)', maxMonthly: 15000 },
          { cat: CB_CATS.GROCERY,       percent: 5,  note: 'Супермаркеты-партнёры', maxMonthly: 8000 },
          { cat: CB_CATS.DINING,        percent: 5,  note: 'Кафе и рестораны-партнёры', maxMonthly: 5000 },
          { cat: CB_CATS.FUEL,          percent: 5,  note: 'АЗС-партнёры', maxMonthly: 5000 },
          { cat: CB_CATS.ENTERTAINMENT, percent: 10, note: 'Развлечения и кино у партнёров', maxMonthly: 5000 },
          { cat: CB_CATS.TRAVEL,        percent: 10, note: 'Туризм и отели у партнёров', maxMonthly: 10000 },
          { cat: CB_CATS.ELECTRONICS,   percent: 15, note: 'Техника у партнёров (до 30% на акциях)', maxMonthly: 15000 },
          { cat: CB_CATS.HEALTH,        percent: 10, note: 'Аптеки и медицина у партнёров', maxMonthly: 5000 },
        ],
      },
      {
        name: 'Eurasian Просто',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: '1.5% на все покупки, без условий',
        note: 'Простая дебетовая карта, кэшбэк бонусами. Без требований к остатку.',
        cashbacks: [
          { cat: CB_CATS.OTHER,    percent: 1.5, note: 'Все безналичные покупки', maxMonthly: 5000 },
          { cat: CB_CATS.GROCERY,  percent: 3,   note: 'Супермаркеты', maxMonthly: 3000 },
          { cat: CB_CATS.FUEL,     percent: 3,   note: 'АЗС', maxMonthly: 2000 },
          { cat: CB_CATS.DINING,   percent: 3,   note: 'Рестораны и кафе', maxMonthly: 2000 },
        ],
      },
    ],
  },

  // ── BEREKE BANK (ALL IN) ────────────────────────────────────────────────────
  {
    id: 'bereke',
    name: 'Bereke Bank',
    nameRu: 'Береке Банк',
    color: '#00A86B',
    logo: '🟩',
    url: 'https://berekebank.kz/promo',
    description: 'Бывший Сбербанк Казахстана. Флагманская карта ALL IN — до 10% на ключевые категории.',
    cards: [
      {
        name: 'ALL IN',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: 'До 10% такси/АЗС, 1.5–7% на всё (зависит от депозита)',
        note: 'Кэшбэк реальными деньгами. Макс. 15 000 ₸/мес (180 000 ₸/год). Без депозита — 1.5%. Депозит 100K–500K ₸ → 3%, 500K–7M ₸ → 5%, 7M+ ₸ → 7%. С 16 февраля 2026: бесплатное обслуживание при остатке 100K ₸ или зарплатном проекте.',
        cashbacks: [
          { cat: CB_CATS.OTHER,         percent: 1.5, note: 'Базовый (без депозита), до 7% с депозитом', maxMonthly: 15000 },
          { cat: CB_CATS.FUEL,          percent: 10,  note: 'АЗС (при депозите от 100 000 ₸)', maxMonthly: 5000 },
          { cat: CB_CATS.TRANSPORT,     percent: 10,  note: 'Такси (при депозите от 100 000 ₸)', maxMonthly: 5000 },
          { cat: CB_CATS.GROCERY,       percent: 5,   note: 'Продуктовые магазины (с депозитом)', maxMonthly: 7000 },
          { cat: CB_CATS.DINING,        percent: 5,   note: 'Рестораны и кафе (с депозитом)', maxMonthly: 5000 },
          { cat: CB_CATS.ONLINE,        percent: 5,   note: 'Онлайн-покупки (с депозитом)', maxMonthly: 5000 },
          { cat: CB_CATS.ENTERTAINMENT, percent: 10,  note: 'Кино и развлечения (акционные периоды)', maxMonthly: 3000 },
          { cat: CB_CATS.UTILITIES,     percent: 3,   note: 'Коммунальные и связь', maxMonthly: 2000 },
        ],
      },
      {
        name: 'ALL IN Premium',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: 'До 15% в приоритетных категориях, 7% на всё',
        note: 'Повышенный кэшбэк для клиентов с депозитом от 7 000 000 ₸. Макс. 15 000 ₸/мес. Бесплатные такси и доставка еды от партнёров.',
        cashbacks: [
          { cat: CB_CATS.OTHER,     percent: 7,  note: 'Все безналичные (при депозите 7M+ ₸)', maxMonthly: 15000 },
          { cat: CB_CATS.GROCERY,   percent: 8,  note: 'Супермаркеты', maxMonthly: 10000 },
          { cat: CB_CATS.FUEL,      percent: 10, note: 'АЗС', maxMonthly: 7000 },
          { cat: CB_CATS.TRAVEL,    percent: 10, note: 'Путешествия и отели', maxMonthly: 15000 },
          { cat: CB_CATS.DINING,    percent: 8,  note: 'Рестораны', maxMonthly: 7000 },
          { cat: CB_CATS.ONLINE,    percent: 8,  note: 'Онлайн', maxMonthly: 8000 },
          { cat: CB_CATS.TRANSPORT, percent: 15, note: 'Такси и транспорт', maxMonthly: 7000 },
        ],
      },
    ],
  },

  // ── ALTYN BANK ─────────────────────────────────────────────────────────────
  {
    id: 'altyn',
    name: 'Altyn Bank',
    nameRu: 'Алтын Банк',
    color: '#FFD700',
    logo: '🟡',
    url: 'https://altyn-bank.kz/news',
    description: 'Дочерний банк ICBC (Китай). Цифровая карта Altyn-i — кэшбэк до 5% с удобным мобильным приложением.',
    cards: [
      {
        name: 'Altyn-i',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: 'До 5% на повседневные категории, 1% на всё',
        note: 'Цифровая карта. Кэшбэк в тенге на карту. Промо-категории меняются ежемесячно.',
        cashbacks: [
          { cat: CB_CATS.OTHER,         percent: 1,  note: 'Все безналичные покупки', maxMonthly: null },
          { cat: CB_CATS.GROCERY,       percent: 3,  note: 'Супермаркеты', maxMonthly: 5000 },
          { cat: CB_CATS.FUEL,          percent: 3,  note: 'АЗС', maxMonthly: 3000 },
          { cat: CB_CATS.DINING,        percent: 3,  note: 'Кафе и рестораны', maxMonthly: 3000 },
          { cat: CB_CATS.TRANSPORT,     percent: 5,  note: 'Такси (Яндекс, InDriver)', maxMonthly: 3000 },
          { cat: CB_CATS.ONLINE,        percent: 5,  note: 'Онлайн-покупки (промо)', maxMonthly: 5000 },
          { cat: CB_CATS.ENTERTAINMENT, percent: 5,  note: 'Развлечения (ротируемая категория)', maxMonthly: 3000 },
          { cat: CB_CATS.UTILITIES,     percent: 2,  note: 'Коммунальные через приложение', maxMonthly: 2000 },
        ],
      },
    ],
  },

  // ── NURBANK ─────────────────────────────────────────────────────────────────
  {
    id: 'nurbank',
    name: 'Nurbank',
    nameRu: 'Нурбанк',
    color: '#005BAA',
    logo: '🔷',
    url: 'https://nurbank.kz/cards/cashback',
    description: 'Нуркарта — базовый кэшбэк 1% на все покупки без условий, плюс спецпредложения партнёров.',
    cards: [
      {
        name: 'Нуркарта',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: '1% на все покупки без минимального баланса',
        note: 'Простая и доступная карта. Кэшбэк реальными деньгами. Спецпредложения у отдельных партнёров.',
        cashbacks: [
          { cat: CB_CATS.OTHER,         percent: 1,  note: 'Все безналичные покупки (без ограничений)', maxMonthly: null },
          { cat: CB_CATS.GROCERY,       percent: 3,  note: 'Продуктовые магазины-партнёры', maxMonthly: 3000 },
          { cat: CB_CATS.FUEL,          percent: 3,  note: 'АЗС-партнёры', maxMonthly: 2000 },
          { cat: CB_CATS.DINING,        percent: 3,  note: 'Рестораны-партнёры', maxMonthly: 2000 },
          { cat: CB_CATS.ONLINE,        percent: 5,  note: 'Kaspi.kz покупки', maxMonthly: 3000 },
        ],
      },
    ],
  },

  // ── RBK PRIMUS ──────────────────────────────────────────────────────────────
  {
    id: 'rbk_primus',
    name: 'RBK Primus',
    nameRu: 'РБК Primus',
    color: '#6C3CD3',
    logo: '💜',
    url: 'https://bankrbk.kz/cards/primus',
    description: 'Премиальная карта RBK Bank. Повышенный SARQYT кэшбэк + эксклюзивные партнёрские предложения.',
    cards: [
      {
        name: 'RBK Primus',
        type: 'credit',
        annualFee: 24000,
        currency: 'KZT',
        highlight: 'До 15% на топ-категории, 8% базовый кэшбэк',
        note: 'Премиальная карта. Кэшбэк реальными деньгами. Требуется доход от 500 000 ₸/мес или VIP-статус.',
        cashbacks: [
          { cat: CB_CATS.OTHER,         percent: 8,  note: 'Все безналичные покупки (SARQYT Premium)', maxMonthly: 100000 },
          { cat: CB_CATS.TRAVEL,        percent: 15, note: 'Авиа, отели, туризм', maxMonthly: 30000 },
          { cat: CB_CATS.DINING,        percent: 15, note: 'Рестораны и кафе', maxMonthly: 15000 },
          { cat: CB_CATS.ENTERTAINMENT, percent: 15, note: 'Развлечения, кино, спорт', maxMonthly: 10000 },
          { cat: CB_CATS.HEALTH,        percent: 10, note: 'Косметика, здоровье, фитнес', maxMonthly: 10000 },
          { cat: CB_CATS.FASHION,       percent: 10, note: 'Одежда и аксессуары', maxMonthly: 10000 },
          { cat: CB_CATS.ONLINE,        percent: 10, note: 'Онлайн-покупки', maxMonthly: 20000 },
          // RBK limits still apply on gas/grocery
          { cat: CB_CATS.FUEL,          percent: 0.7, note: 'АЗС (ограниченная ставка SARQYT)', maxMonthly: 1000 },
          { cat: CB_CATS.GROCERY,       percent: 0.7, note: 'Супермаркеты (ограниченная ставка)', maxMonthly: 1000 },
          { cat: CB_CATS.UTILITIES,     percent: 0,   note: 'ЖКХ и связь — не начисляется', maxMonthly: 0 },
        ],
      },
    ],
  },

  // ── SHINHAN BANK KAZAKHSTAN ─────────────────────────────────────────────────
  {
    id: 'shinhan',
    name: 'Shinhan Bank',
    nameRu: 'Шинхан Банк',
    color: '#FF6200',
    logo: '🟧',
    url: 'https://shinhan.kz/promotions',
    description: 'Корейский банк в Казахстане. Периодические партнёрские акции с высоким кэшбэком до 20%.',
    cards: [
      {
        name: 'Shinhan Debit',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: 'До 20% в партнёрских акциях, 1% на всё',
        note: 'Акционные предложения с корейскими и местными партнёрами. Основной кэшбэк 1% на все покупки.',
        cashbacks: [
          { cat: CB_CATS.OTHER,         percent: 1,  note: 'Все безналичные покупки', maxMonthly: null },
          { cat: CB_CATS.DINING,        percent: 10, note: 'Рестораны-партнёры (корейские и местные)', maxMonthly: 5000 },
          { cat: CB_CATS.ONLINE,        percent: 5,  note: 'Онлайн-покупки в акционные периоды', maxMonthly: 5000 },
          { cat: CB_CATS.GROCERY,       percent: 5,  note: 'Продукты у партнёров', maxMonthly: 3000 },
          { cat: CB_CATS.TRAVEL,        percent: 10, note: 'Путешествия в партнёрских акциях', maxMonthly: 10000 },
          { cat: CB_CATS.ENTERTAINMENT, percent: 20, note: 'Партнёрские акции — кино, события', maxMonthly: 5000 },
        ],
      },
    ],
  },

  // ── JUSAN BANK (ALATAU CITY) ──────────────────────────────────────────────
  {
    id: 'jusan',
    name: 'Jusan Bank',
    nameRu: 'Жусан Банк',
    color: '#6B21A8',
    logo: '💜',
    url: 'https://jusan.kz',
    description: 'Ребрендинг в Alatau City. Программа лояльности до 15% по выбранным категориям. Бизнес-карта с 1% кэшбэком.',
    cards: [
      {
        name: 'Jusan Card Silver',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: 'До 15% в 1 категории на выбор + 0.5% на всё',
        note: 'Базовый уровень. Выбираете 1 категорию с повышенным кэшбэком до 15%. На остальные покупки — 0.5%.',
        cashbacks: [
          { cat: CB_CATS.OTHER,         percent: 0.5, note: 'Все безналичные покупки', maxMonthly: null },
          { cat: CB_CATS.GROCERY,       percent: 15,  note: 'Выбранная категория (или другая на выбор)', maxMonthly: 10000 },
          { cat: CB_CATS.FUEL,          percent: 15,  note: 'АЗС (если выбрана категория)', maxMonthly: 10000 },
          { cat: CB_CATS.DINING,        percent: 15,  note: 'Рестораны (если выбрана категория)', maxMonthly: 10000 },
        ],
      },
      {
        name: 'Jusan Card Gold',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: 'До 15% в 2 категориях + 1% на всё',
        note: 'Уровень Gold: при покупках от 70 000 ₸/мес. 2 категории с повышенным кэшбэком до 15%. На остальные — 1%.',
        cashbacks: [
          { cat: CB_CATS.OTHER,         percent: 1,   note: 'Все безналичные покупки', maxMonthly: null },
          { cat: CB_CATS.GROCERY,       percent: 15,  note: '1-я выбранная категория', maxMonthly: 10000 },
          { cat: CB_CATS.FUEL,          percent: 15,  note: '2-я выбранная категория', maxMonthly: 10000 },
          { cat: CB_CATS.TRANSPORT,     percent: 15,  note: 'Такси (если выбрана)', maxMonthly: 10000 },
        ],
      },
      {
        name: 'Jusan Business',
        type: 'debit',
        annualFee: 0,
        currency: 'KZT',
        highlight: '1% кэшбэк для бизнеса, макс. 35 000 ₸/мес',
        note: 'Бизнес-карта для ИП и ТОО. 1% на все покупки от 1 000 ₸. Макс. 35 000 ₸/мес.',
        cashbacks: [
          { cat: CB_CATS.OTHER, percent: 1, note: 'Все бизнес-покупки от 1 000 ₸', maxMonthly: 35000 },
        ],
      },
    ],
  },

  // ── RBK INFINITE ──────────────────────────────────────────────────────────
  {
    id: 'rbk_infinite',
    name: 'RBK Bank',
    nameRu: 'РБК Банк',
    color: '#1A73E8',
    logo: '🔵',
    url: 'https://bankrbk.kz/ru/premium/cards',
    description: 'Премиальная карта RBK Infinite — до 8% кэшбэк реальными деньгами. Бесплатное снятие до 5 000 000 ₸/мес в любых банкоматах.',
    cards: [
      {
        name: 'RBK Infinite',
        type: 'debit',
        annualFee: 10000,
        currency: 'KZT',
        highlight: '⏰ До 8% кэшбэк — акция заканчивается 30.04.2026',
        note: '⚠️ ВНИМАНИЕ: акция 8% действует только до 30 апреля 2026. После — стандартная ставка SARQYT по уровню. Премиум-карта. Выпуск 10 000 ₸. Бесплатное снятие до 5 000 000 ₸/мес в любых банкоматах мира. Мультивалютная: KZT, USD, EUR. Условие: остаток от 500 000 ₸.',
        cashbacks: [
          { cat: CB_CATS.OTHER,         percent: 8,  note: 'Все безналичные (АКЦИЯ заканчивается 30.04.2026)', maxMonthly: 100000 },
          { cat: CB_CATS.DINING,        percent: 20, note: 'Рестораны в промо-период', maxMonthly: 10000 },
          { cat: CB_CATS.ENTERTAINMENT, percent: 20, note: 'Кино в промо-период', maxMonthly: 5000 },
          { cat: CB_CATS.TRAVEL,        percent: 10, note: 'Booking.com отели', maxMonthly: 15000 },
          { cat: CB_CATS.FUEL,          percent: 0.7, note: 'АЗС (ограниченная ставка SARQYT)', maxMonthly: 1000 },
          { cat: CB_CATS.GROCERY,       percent: 0.7, note: 'Супермаркеты (ограниченная ставка)', maxMonthly: 1000 },
        ],
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Движок рекомендаций
// ─────────────────────────────────────────────────────────────────────────────

/**
 * txsByCategory: { [categoryName]: { expense: number } }
 * Возвращает ранжированный список карт с расчётом потенциального кэшбэка
 */
export function computeRecommendations(txsByCategory, { isAdult = true, banks } = {}) {
  const banksSource = Array.isArray(banks) && banks.length > 0 ? banks : BANKS

  const spendByCbKey = {}
  for (const [catName, amounts] of Object.entries(txsByCategory)) {
    const cbKey = matchCategory(catName)
    spendByCbKey[cbKey] = (spendByCbKey[cbKey] || 0) + (amounts.expense || 0)
  }

  const results = []

  for (const bank of banksSource) {
    for (const card of bank.cards) {
      // Filter out age-restricted cards (Student cards only for 14-17)
      if (isAdult && card.maxAge && card.maxAge < 18) continue
      let totalCashback = 0
      const breakdown = []

      for (const [cbKey, spend] of Object.entries(spendByCbKey)) {
        if (spend <= 0) continue

        // Точное совпадение категории
        const exactRule = card.cashbacks.find(r => r.cat === cbKey)
        // Фоллбэк на OTHER
        const otherRule = card.cashbacks.find(r => r.cat === CB_CATS.OTHER)
        const rule = exactRule || otherRule

        if (!rule || rule.percent <= 0 || rule.maxMonthly === 0) continue

        const rawCashback = spend * (rule.percent / 100)
        const capped = rule.maxMonthly ? Math.min(rawCashback, rule.maxMonthly) : rawCashback
        totalCashback += capped

        if (exactRule && exactRule.percent > 0 && capped > 0) {
          breakdown.push({
            cbKey,
            spend,
            percent: rule.percent,
            cashback: capped,
            note: rule.note,
          })
        }
      }

      const feePerMonth = (card.annualFee || 0) / 12
      const netCashback = Math.max(0, totalCashback - feePerMonth)

      results.push({
        bankId: bank.id,
        bankName: bank.nameRu || bank.name,
        bankColor: bank.color,
        bankLogo: bank.logo,
        bankUrl: bank.url,
        bankDesc: bank.description,
        cardName: card.name,
        cardType: card.type,
        annualFee: card.annualFee,
        highlight: card.highlight,
        cardNote: card.note,
        grossCashback: Math.round(totalCashback),
        netCashback: Math.round(netCashback),
        feePerMonth: Math.round(feePerMonth),
        breakdown: breakdown.sort((a, b) => b.cashback - a.cashback),
      })
    }
  }

  return results.sort((a, b) => b.netCashback - a.netCashback)
}

/**
 * Найти лучшую карту для конкретной категории
 */
export function bestCardForCategory(cbKey, banks) {
  const banksSource = Array.isArray(banks) && banks.length > 0 ? banks : BANKS
  let best = null
  let bestPct = 0
  for (const bank of banksSource) {
    for (const card of bank.cards) {
      const rule = card.cashbacks.find(r => r.cat === cbKey && (r.maxMonthly === null || r.maxMonthly > 0))
      if (rule && rule.percent > bestPct) {
        bestPct = rule.percent
        best = { bank, card, rule }
      }
    }
  }
  return best
}

// Читаемые названия ключей категорий (рус)
export const CB_CAT_LABELS_RU = {
  [CB_CATS.GROCERY]:       '🛒 Продукты',
  [CB_CATS.DINING]:        '🍽 Рестораны',
  [CB_CATS.FUEL]:          '⛽ Топливо',
  [CB_CATS.TRANSPORT]:     '🚕 Транспорт',
  [CB_CATS.ONLINE]:        '🛍 Онлайн',
  [CB_CATS.ENTERTAINMENT]: '🎬 Развлечения',
  [CB_CATS.TRAVEL]:        '✈️ Путешествия',
  [CB_CATS.HEALTH]:        '💊 Здоровье',
  [CB_CATS.UTILITIES]:     '💡 ЖКХ и связь',
  [CB_CATS.FASHION]:       '👗 Одежда',
  [CB_CATS.ELECTRONICS]:   '📱 Электроника',
  [CB_CATS.EDUCATION]:     '📚 Образование',
  [CB_CATS.OTHER]:         '💳 Прочее',
}
