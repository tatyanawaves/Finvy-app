import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'

const SURVEY_I18N = {
  en: {
    title: 'Welcome to Finvy!',
    subtitle: 'Answer a few questions so we can personalize your experience',
    profileTypeQ: 'How will you use Finvy?',
    profileBusiness: 'Business',
    profilePersonal: 'Personal',
    studentQ: 'Are you a student?',
    yes: 'Yes',
    no: 'No',
    revenueQ: 'Monthly revenue',
    revenues: ['Up to ₸500K', '₸500K – ₸2M', '₸2M – ₸10M', '₸10M – ₸50M', '₸50M+'],
    incomeQ: 'Monthly household income',
    incomes: ['Up to ₸200K', '₸200K – ₸400K', '₸400K – ₸700K', '₸700K – ₸1M', '₸1M+'],
    banksQ: 'Which banks do you use?',
    banks: ['Kaspi', 'Halyk', 'Freedom', 'Jusan', 'Bereke', 'Home Credit', 'RBK', 'Other'],
    expensesQ: 'Main expense categories',
    expenses: ['Salary', 'Rent', 'Marketing', 'Purchases', 'Logistics', 'IT/Telecom', 'Taxes', 'Other'],
    personalExpensesQ: 'Main expense categories',
    personalExpenses: ['Groceries', 'Rent/Mortgage', 'Utilities', 'Transport', 'Health', 'Kids', 'Entertainment', 'Other'],
    industryQ: 'Your industry',
    industries: ['Retail', 'Services', 'IT', 'HoReCa', 'Construction', 'Production', 'Consulting', 'Other'],
    taxRegimeQ: 'Tax regime',
    taxRegimes: [
      { key: 'simplified_ip', label: 'Simplified (IE)' },
      { key: 'simplified_too', label: 'Simplified (LLC)' },
      { key: 'general_ip', label: 'General (IE)' },
      { key: 'general_too', label: 'General (LLC)' },
    ],
    familyQ: 'How many people in your household?',
    families: ['1', '2', '3', '4', '5+'],
    start: 'Start using Finvy',
    skip: 'Skip for now',
  },
  ru: {
    title: 'Добро пожаловать в Finvy!',
    subtitle: 'Ответьте на несколько вопросов, чтобы мы настроили сервис под вас',
    profileTypeQ: 'Как вы будете использовать Finvy?',
    profileBusiness: 'Бизнес',
    profilePersonal: 'Физ. лицо',
    studentQ: 'Вы студент?',
    yes: 'Да',
    no: 'Нет',
    revenueQ: 'Ежемесячная выручка',
    revenues: ['До ₸500 тыс', '₸500 тыс – ₸2 млн', '₸2 млн – ₸10 млн', '₸10 млн – ₸50 млн', '₸50+ млн'],
    incomeQ: 'Ежемесячный доход семьи',
    incomes: ['До ₸200 тыс', '₸200 – ₸400 тыс', '₸400 – ₸700 тыс', '₸700 тыс – ₸1 млн', '₸1+ млн'],
    banksQ: 'Какими банками пользуетесь?',
    banks: ['Kaspi', 'Halyk', 'Freedom', 'Jusan', 'Bereke', 'Home Credit', 'RBK', 'Другой'],
    expensesQ: 'Основные статьи расходов',
    expenses: ['Зарплата', 'Аренда', 'Реклама', 'Закуп товаров', 'Логистика', 'Связь/IT', 'Налоги', 'Другое'],
    personalExpensesQ: 'Основные статьи расходов',
    personalExpenses: ['Продукты', 'Аренда/Ипотека', 'Коммуналка', 'Транспорт', 'Здоровье', 'Дети', 'Развлечения', 'Другое'],
    industryQ: 'Ваша сфера деятельности',
    industries: ['Торговля', 'Услуги', 'IT', 'HoReCa', 'Строительство', 'Производство', 'Консалтинг', 'Другое'],
    taxRegimeQ: 'Налоговый режим',
    taxRegimes: [
      { key: 'simplified_ip', label: 'Упрощёнка (ИП)' },
      { key: 'simplified_too', label: 'Упрощёнка (ТОО)' },
      { key: 'general_ip', label: 'Общий (ИП)' },
      { key: 'general_too', label: 'Общий (ТОО, КПН)' },
    ],
    familyQ: 'Сколько человек в семье?',
    families: ['1', '2', '3', '4', '5+'],
    start: 'Начать работу с Finvy',
    skip: 'Пропустить',
  },
  kz: {
    title: 'Finvy-ге қош келдіңіз!',
    subtitle: 'Сервисті сіз үшін баптау үшін бірнеше сұраққа жауап беріңіз',
    profileTypeQ: 'Finvy-ді қалай қолданасыз?',
    profileBusiness: 'Бизнес',
    profilePersonal: 'Жеке тұлға',
    studentQ: 'Сіз студентсіз бе?',
    yes: 'Иә',
    no: 'Жоқ',
    revenueQ: 'Айлық табыс',
    revenues: ['₸500 мыңға дейін', '₸500 мың – ₸2 млн', '₸2 млн – ₸10 млн', '₸10 млн – ₸50 млн', '₸50+ млн'],
    incomeQ: 'Отбасының айлық табысы',
    incomes: ['₸200 мыңға дейін', '₸200 – ₸400 мың', '₸400 – ₸700 мың', '₸700 мың – ₸1 млн', '₸1+ млн'],
    banksQ: 'Қай банктерді пайдаланасыз?',
    banks: ['Kaspi', 'Halyk', 'Freedom', 'Jusan', 'Bereke', 'Home Credit', 'RBK', 'Басқа'],
    expensesQ: 'Негізгі шығын баптары',
    expenses: ['Жалақы', 'Жалға алу', 'Жарнама', 'Тауар сатып алу', 'Логистика', 'Байланыс/IT', 'Салықтар', 'Басқа'],
    personalExpensesQ: 'Негізгі шығын баптары',
    personalExpenses: ['Азық-түлік', 'Жалға алу/Ипотека', 'Коммуналдық', 'Көлік', 'Денсаулық', 'Балалар', 'Ойын-сауық', 'Басқа'],
    industryQ: 'Сіздің сала',
    industries: ['Сауда', 'Қызметтер', 'IT', 'HoReCa', 'Құрылыс', 'Өндіріс', 'Кеңес беру', 'Басқа'],
    taxRegimeQ: 'Салық режимі',
    taxRegimes: [
      { key: 'simplified_ip', label: 'Жеңілдетілген (ЖК)' },
      { key: 'simplified_too', label: 'Жеңілдетілген (ЖШС)' },
      { key: 'general_ip', label: 'Жалпы (ЖК)' },
      { key: 'general_too', label: 'Жалпы (ЖШС, КТС)' },
    ],
    familyQ: 'Отбасында қанша адам?',
    families: ['1', '2', '3', '4', '5+'],
    start: 'Finvy-мен бастау',
    skip: 'Өткізіп жіберу',
  },
}

/* ─── BUSINESS seed: среднестатистический бизнес в Усть-Каменогорске ─── */
async function seedBusinessData(userId) {
  await supabase.from('transactions').delete().eq('user_id', userId)
  await supabase.from('accounts').delete().eq('user_id', userId)
  await supabase.from('fm_categories').delete().eq('user_id', userId)

  const { data: accs } = await supabase.from('accounts').insert([
    { user_id: userId, name: 'Kaspi Business', type: 'bank', currency: 'KZT', balance: 2_340_000 },
    { user_id: userId, name: 'Halyk Bank ВКО', type: 'bank', currency: 'KZT', balance: 1_120_000 },
    { user_id: userId, name: 'Наличные',       type: 'cash', currency: 'KZT', balance: 185_000 },
  ]).select()
  if (!accs || accs.length === 0) return

  const kaspi = accs.find(a => a.name === 'Kaspi Business')
  const halyk = accs.find(a => a.name === 'Halyk Bank ВКО')
  const cash  = accs.find(a => a.name === 'Наличные')

  await supabase.from('fm_categories').insert([
    { user_id: userId, name: 'Продажи',       type: 'income',  icon: '💰', color: '#4F8EF7' },
    { user_id: userId, name: 'Услуги',         type: 'income',  icon: '🛠', color: '#06b6d4' },
    { user_id: userId, name: 'Возврат',        type: 'income',  icon: '↩️', color: '#14b8a6' },
    { user_id: userId, name: 'Субсидия',       type: 'income',  icon: '🏦', color: '#8b5cf6' },
    { user_id: userId, name: 'Прочий доход',   type: 'income',  icon: '📥', color: '#a3e635' },
    { user_id: userId, name: 'Зарплата',       type: 'expense', icon: '👤', color: '#ef4444' },
    { user_id: userId, name: 'Аренда',         type: 'expense', icon: '🏢', color: '#f97316' },
    { user_id: userId, name: 'Реклама',        type: 'expense', icon: '📢', color: '#ec4899' },
    { user_id: userId, name: 'Закуп товаров',  type: 'expense', icon: '🛒', color: '#f59e0b' },
    { user_id: userId, name: 'Связь/IT',       type: 'expense', icon: '💻', color: '#a855f7' },
    { user_id: userId, name: 'Логистика',      type: 'expense', icon: '🚚', color: '#0ea5e9' },
    { user_id: userId, name: 'Налоги',         type: 'expense', icon: '🏛', color: '#6b7280' },
    { user_id: userId, name: 'Коммуналка',     type: 'expense', icon: '💡', color: '#78716c' },
    { user_id: userId, name: 'ГСМ',            type: 'expense', icon: '⛽', color: '#fb923c' },
    { user_id: userId, name: 'Прочие расходы', type: 'expense', icon: '📦', color: '#94a3b8' },
  ])

  const now = new Date()
  const d = (daysAgo) => {
    const dt = new Date(now); dt.setDate(dt.getDate() - daysAgo)
    return dt.toISOString().slice(0, 10)
  }

  // ТОО в Усть-Каменогорске: стройматериалы + услуги монтажа, выручка ~4-6 млн/мес
  // Контрагенты — реальные названия районов и улиц ВКО
  await supabase.from('transactions').insert([
    // ─── Доходы (последние 30 дней) ───
    { user_id: userId, type: 'income',  amount: 1_850_000, description: 'ТОО «Иртыш Строй» — профнастил + металлочерепица', category: 'Продажи', accountId: kaspi.id, date: d(1) },
    { user_id: userId, type: 'income',  amount: 420_000,   description: 'ИП Жумабаев К. — монтаж кровли, пос. Меновное',    category: 'Услуги',  accountId: kaspi.id, date: d(2) },
    { user_id: userId, type: 'income',  amount: 1_200_000, description: 'ТОО «ВК-Регион» — партия утеплителя',              category: 'Продажи', accountId: halyk.id, date: d(5) },
    { user_id: userId, type: 'income',  amount: 380_000,   description: 'ИП Токтаров С. — установка ворот, Аблакетка',      category: 'Услуги',  accountId: kaspi.id, date: d(7) },
    { user_id: userId, type: 'income',  amount: 760_000,   description: 'КГУ «Школа №38» — ремонт фасада (госзакупки)',     category: 'Продажи', accountId: halyk.id, date: d(10) },
    { user_id: userId, type: 'income',  amount: 95_000,    description: 'Возврат от ТОО «Алтай Снаб» за пересортицу',       category: 'Возврат', accountId: kaspi.id, date: d(13) },
    { user_id: userId, type: 'income',  amount: 540_000,   description: 'ИП Муканова Д. — окна ПВХ, 12 шт',                 category: 'Продажи', accountId: kaspi.id, date: d(16) },
    { user_id: userId, type: 'income',  amount: 650_000,   description: 'ТОО «Риддер-Комфорт» — доставка стройматериалов',  category: 'Услуги',  accountId: halyk.id, date: d(19) },
    { user_id: userId, type: 'income',  amount: 180_000,   description: 'Частный заказ — забор из профлиста, Согра',         category: 'Услуги',  accountId: cash.id,  date: d(22) },
    { user_id: userId, type: 'income',  amount: 320_000,   description: 'Субсидия «Даму» — компенсация % по кредиту',       category: 'Субсидия', accountId: halyk.id, date: d(26) },

    // ─── Расходы ───
    // Зарплата (3 сотрудника)
    { user_id: userId, type: 'expense', amount: 280_000,   description: 'Зарплата — Ерлан, менеджер по продажам',         category: 'Зарплата',  accountId: halyk.id, date: d(1) },
    { user_id: userId, type: 'expense', amount: 220_000,   description: 'Зарплата — Асхат, монтажник',                    category: 'Зарплата',  accountId: halyk.id, date: d(1) },
    { user_id: userId, type: 'expense', amount: 200_000,   description: 'Зарплата — Марат, водитель-экспедитор',          category: 'Зарплата',  accountId: halyk.id, date: d(1) },

    // Налоги и отчисления
    { user_id: userId, type: 'expense', amount: 210_000,   description: 'ОПВ + СО + ОСМС за 3 сотрудников (март)',        category: 'Налоги',    accountId: halyk.id, date: d(2) },
    { user_id: userId, type: 'expense', amount: 162_000,   description: 'ИПН + соц. налог за март',                       category: 'Налоги',    accountId: halyk.id, date: d(2) },

    // Аренда
    { user_id: userId, type: 'expense', amount: 250_000,   description: 'Аренда склад + офис, ул. Кабанбай батыра 122',   category: 'Аренда',    accountId: halyk.id, date: d(3), comment: 'Апрель 2026' },

    // Закуп товаров
    { user_id: userId, type: 'expense', amount: 1_350_000, description: 'ТОО «Алтай Снаб» — профлист С-8, утеплитель',    category: 'Закуп товаров', accountId: kaspi.id, date: d(4) },
    { user_id: userId, type: 'expense', amount: 480_000,   description: 'ТОО «СтройОпт НС» — окна ПВХ, фурнитура',       category: 'Закуп товаров', accountId: kaspi.id, date: d(11) },
    { user_id: userId, type: 'expense', amount: 290_000,   description: 'Kaspi Магазин — крепёж, герметики, инструмент',   category: 'Закуп товаров', accountId: kaspi.id, date: d(18) },

    // Логистика и ГСМ
    { user_id: userId, type: 'expense', amount: 120_000,   description: 'Доставка из Алматы — транспортная «КазГрузАвто»', category: 'Логистика', accountId: kaspi.id, date: d(5) },
    { user_id: userId, type: 'expense', amount: 85_000,    description: 'Газпром нефть — дизель Газель + бензин Duster',   category: 'ГСМ',       accountId: kaspi.id, date: d(6) },
    { user_id: userId, type: 'expense', amount: 78_000,    description: 'Газпром нефть — заправка (Риддер + район)',       category: 'ГСМ',       accountId: kaspi.id, date: d(15) },

    // Реклама
    { user_id: userId, type: 'expense', amount: 65_000,    description: 'Instagram таргет — УКА и ВКО',                    category: 'Реклама',   accountId: kaspi.id, date: d(8) },
    { user_id: userId, type: 'expense', amount: 35_000,    description: '2GIS + баннер на Крыша.kz',                       category: 'Реклама',   accountId: kaspi.id, date: d(14) },

    // Связь/IT
    { user_id: userId, type: 'expense', amount: 28_000,    description: 'Beeline — корп. тариф 3 номера + WiFi склад',     category: 'Связь/IT',  accountId: kaspi.id, date: d(7) },
    { user_id: userId, type: 'expense', amount: 45_000,    description: '1С:Бухгалтерия подписка + Kaspi Pay комиссия',    category: 'Связь/IT',  accountId: kaspi.id, date: d(12) },

    // Коммуналка
    { user_id: userId, type: 'expense', amount: 42_000,    description: 'Коммунальные — свет, вода, отопление (склад)',    category: 'Коммуналка', accountId: halyk.id, date: d(9) },

    // Прочие
    { user_id: userId, type: 'expense', amount: 38_000,    description: 'Спецодежда — каски, перчатки, жилеты',            category: 'Прочие расходы', accountId: cash.id, date: d(20) },
    { user_id: userId, type: 'expense', amount: 55_000,    description: 'Ремонт Газели — замена тормозных колодок',        category: 'Прочие расходы', accountId: cash.id, date: d(24) },
    { user_id: userId, type: 'expense', amount: 15_000,    description: 'Канцтовары + печать договоров',                   category: 'Прочие расходы', accountId: cash.id, date: d(27) },
  ])

  await supabase.from('fm_settings').upsert({
    user_id: userId, default_currency: 'KZT',
  }, { onConflict: 'user_id' })
}

/* ─── PERSONAL seed: семья, 350-370K на двоих ─── */
async function seedPersonalData(userId) {
  await supabase.from('transactions').delete().eq('user_id', userId)
  await supabase.from('accounts').delete().eq('user_id', userId)
  await supabase.from('fm_categories').delete().eq('user_id', userId)

  const { data: accs } = await supabase.from('accounts').insert([
    { user_id: userId, name: 'Kaspi Gold',    type: 'card', currency: 'KZT', balance: 142_500 },
    { user_id: userId, name: 'Halyk карта',   type: 'card', currency: 'KZT', balance: 38_000 },
    { user_id: userId, name: 'Наличные',      type: 'cash', currency: 'KZT', balance: 12_000 },
    { user_id: userId, name: 'Kaspi Депозит', type: 'savings', currency: 'KZT', balance: 450_000 },
  ]).select()
  if (!accs || accs.length === 0) return

  const kaspi   = accs.find(a => a.name === 'Kaspi Gold')
  const halyk   = accs.find(a => a.name === 'Halyk карта')
  const cash    = accs.find(a => a.name === 'Наличные')
  const deposit = accs.find(a => a.name === 'Kaspi Депозит')

  await supabase.from('fm_categories').insert([
    { user_id: userId, name: 'Зарплата',      type: 'income',  icon: '💼', color: '#4F8EF7' },
    { user_id: userId, name: 'Подработка',    type: 'income',  icon: '🔧', color: '#06b6d4' },
    { user_id: userId, name: 'Кэшбэк',       type: 'income',  icon: '🎁', color: '#14b8a6' },
    { user_id: userId, name: 'Прочий доход',  type: 'income',  icon: '📥', color: '#8b5cf6' },
    { user_id: userId, name: 'Продукты',      type: 'expense', icon: '🛒', color: '#ef4444' },
    { user_id: userId, name: 'Аренда/Ипотека', type: 'expense', icon: '🏠', color: '#f97316' },
    { user_id: userId, name: 'Коммуналка',    type: 'expense', icon: '💡', color: '#78716c' },
    { user_id: userId, name: 'Транспорт',     type: 'expense', icon: '🚌', color: '#0ea5e9' },
    { user_id: userId, name: 'Здоровье',      type: 'expense', icon: '💊', color: '#ec4899' },
    { user_id: userId, name: 'Одежда',        type: 'expense', icon: '👕', color: '#a855f7' },
    { user_id: userId, name: 'Дети',          type: 'expense', icon: '🧒', color: '#f59e0b' },
    { user_id: userId, name: 'Развлечения',   type: 'expense', icon: '🎬', color: '#6366f1' },
    { user_id: userId, name: 'Связь',         type: 'expense', icon: '📱', color: '#64748b' },
    { user_id: userId, name: 'Прочее',        type: 'expense', icon: '📦', color: '#94a3b8' },
  ])

  const now = new Date()
  const d = (daysAgo) => {
    const dt = new Date(now); dt.setDate(dt.getDate() - daysAgo)
    return dt.toISOString().slice(0, 10)
  }

  // Семья из 2-х: муж ~210K + жена ~155K = ~365K на двоих
  await supabase.from('transactions').insert([
    // --- Зарплата ---
    { user_id: userId, type: 'income',  amount: 210_000, description: 'Зарплата — ТОО «КазЭнерго»',          category: 'Зарплата',  accountId: kaspi.id, date: d(0) },
    { user_id: userId, type: 'income',  amount: 155_000, description: 'Зарплата — ТОО «Астана Медикал»',      category: 'Зарплата',  accountId: halyk.id, date: d(1) },
    // --- Подработка / кэшбэк ---
    { user_id: userId, type: 'income',  amount: 25_000,  description: 'Репетиторство английский (4 урока)',    category: 'Подработка', accountId: kaspi.id, date: d(8) },
    { user_id: userId, type: 'income',  amount: 3_200,   description: 'Kaspi кэшбэк за март',                 category: 'Кэшбэк',   accountId: kaspi.id, date: d(3) },

    // --- Обязательные расходы ---
    { user_id: userId, type: 'expense', amount: 95_000,  description: 'Ипотека — Halyk банк',                  category: 'Аренда/Ипотека', accountId: halyk.id, date: d(0), comment: 'Март 2026' },
    { user_id: userId, type: 'expense', amount: 18_500,  description: 'Коммуналка — свет, вода, отопление',    category: 'Коммуналка', accountId: kaspi.id, date: d(2) },
    { user_id: userId, type: 'expense', amount: 5_800,   description: 'Beeline — 2 номера семейный тариф',     category: 'Связь',     accountId: kaspi.id, date: d(2) },
    { user_id: userId, type: 'expense', amount: 7_500,   description: 'Интернет + Кселл домашний',              category: 'Связь',     accountId: kaspi.id, date: d(2) },

    // --- Продукты ---
    { user_id: userId, type: 'expense', amount: 28_500,  description: 'Magnum — продукты на неделю',            category: 'Продукты',  accountId: kaspi.id, date: d(1) },
    { user_id: userId, type: 'expense', amount: 12_400,  description: 'Small — молоко, хлеб, фрукты',           category: 'Продукты',  accountId: kaspi.id, date: d(4) },
    { user_id: userId, type: 'expense', amount: 31_200,  description: 'Magnum — большая закупка',               category: 'Продукты',  accountId: kaspi.id, date: d(8) },
    { user_id: userId, type: 'expense', amount: 8_900,   description: 'Рынок — мясо, овощи',                    category: 'Продукты',  accountId: cash.id,  date: d(11) },
    { user_id: userId, type: 'expense', amount: 15_600,  description: 'Magnum — продукты',                      category: 'Продукты',  accountId: kaspi.id, date: d(15) },

    // --- Транспорт ---
    { user_id: userId, type: 'expense', amount: 15_000,  description: 'Бензин АИ-92 — КазМунайГаз',             category: 'Транспорт', accountId: kaspi.id, date: d(3) },
    { user_id: userId, type: 'expense', amount: 4_200,   description: 'Яндекс Go — поездки за неделю',          category: 'Транспорт', accountId: kaspi.id, date: d(7) },
    { user_id: userId, type: 'expense', amount: 15_000,  description: 'Бензин АИ-92',                           category: 'Транспорт', accountId: kaspi.id, date: d(14) },

    // --- Здоровье ---
    { user_id: userId, type: 'expense', amount: 8_500,   description: 'Аптека — лекарства, витамины',           category: 'Здоровье', accountId: kaspi.id, date: d(5) },
    { user_id: userId, type: 'expense', amount: 12_000,  description: 'Стоматолог — чистка зубов',              category: 'Здоровье', accountId: kaspi.id, date: d(12) },

    // --- Дети / Развлечения / Одежда ---
    { user_id: userId, type: 'expense', amount: 15_000,  description: 'Детский сад — оплата за март',           category: 'Дети',      accountId: kaspi.id, date: d(0) },
    { user_id: userId, type: 'expense', amount: 7_800,   description: 'Детская одежда — LC Waikiki',            category: 'Дети',      accountId: kaspi.id, date: d(9) },
    { user_id: userId, type: 'expense', amount: 8_500,   description: 'Кинотеатр + пицца — семейный выход',     category: 'Развлечения', accountId: kaspi.id, date: d(6) },
    { user_id: userId, type: 'expense', amount: 5_200,   description: 'Netflix + Spotify подписки',             category: 'Развлечения', accountId: kaspi.id, date: d(10) },
    { user_id: userId, type: 'expense', amount: 18_500,  description: 'Zara — куртка весна',                    category: 'Одежда',    accountId: kaspi.id, date: d(13) },

    // --- Прочее ---
    { user_id: userId, type: 'expense', amount: 3_500,   description: 'Стрижка — барбершоп',                    category: 'Прочее',    accountId: cash.id,  date: d(10) },
    { user_id: userId, type: 'expense', amount: 6_000,   description: 'Подарок коллеге на ДР',                  category: 'Прочее',    accountId: kaspi.id, date: d(16) },
  ])

  await supabase.from('fm_settings').upsert({
    user_id: userId, default_currency: 'KZT',
  }, { onConflict: 'user_id' })
}

export default function OnboardingSurvey({ userId, onComplete }) {
  const { lang } = useLanguage()
  const L = SURVEY_I18N[lang] || SURVEY_I18N.ru
  const [profileType, setProfileType] = useState(null) // 'business' | 'personal'
  const [isStudent, setIsStudent] = useState(null)
  const [revenue, setRevenue] = useState('')
  const [banks, setBanks] = useState([])
  const [expenses, setExpenses] = useState([])
  const [industry, setIndustry] = useState('')
  const [taxRegime, setTaxRegime] = useState('')
  const [familySize, setFamilySize] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleBank = (b) => setBanks(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])
  const toggleExpense = (e) => setExpenses(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])

  const handleSubmit = async () => {
    setLoading(true)
    await supabase.from('fm_settings').upsert({
      user_id: userId,
      default_currency: 'KZT',
      survey_data: JSON.stringify({ profileType, isStudent, revenue, banks, expenses, industry, taxRegime, familySize }),
      onboarding_done: true,
      ...(taxRegime ? { tax_regime: taxRegime } : {}),
    }, { onConflict: 'user_id' })

    if (profileType === 'personal') {
      await seedPersonalData(userId)
    } else {
      await seedBusinessData(userId)
    }
    setLoading(false)
    onComplete()
  }

  const handleSkip = async () => {
    setLoading(true)
    await supabase.from('fm_settings').upsert({
      user_id: userId,
      default_currency: 'KZT',
      survey_data: JSON.stringify({ profileType: profileType || 'business' }),
      onboarding_done: true,
    }, { onConflict: 'user_id' })
    if (profileType === 'personal') {
      await seedPersonalData(userId)
    } else {
      await seedBusinessData(userId)
    }
    setLoading(false)
    onComplete()
  }

  const chipClass = (active) =>
    `px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
      active
        ? 'bg-[#4F8EF7]/20 text-[#4F8EF7] border-[#4F8EF7]/30'
        : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white/70'
    }`

  const bigChipClass = (active) =>
    `flex-1 py-4 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer text-center ${
      active
        ? 'bg-[#4F8EF7]/20 text-[#4F8EF7] border-[#4F8EF7]/40'
        : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white/70'
    }`

  const isBusiness = profileType === 'business'
  const isPersonal = profileType === 'personal'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#4F8EF7]/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">✦</span>
          </div>
          <h2 className="text-white font-bold text-lg">{L.title}</h2>
          <p className="text-white/40 text-sm mt-1">{L.subtitle}</p>
        </div>

        {/* Questions */}
        <div className="px-6 pb-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Profile type — first question */}
          <div>
            <p className="text-white/60 text-xs font-semibold mb-2">{L.profileTypeQ}</p>
            <div className="flex gap-3">
              <button onClick={() => setProfileType('business')} className={bigChipClass(isBusiness)}>
                🏢 {L.profileBusiness}
              </button>
              <button onClick={() => setProfileType('personal')} className={bigChipClass(isPersonal)}>
                👤 {L.profilePersonal}
              </button>
            </div>
          </div>

          {/* Student (both) */}
          <div>
            <p className="text-white/60 text-xs font-semibold mb-2">{L.studentQ}</p>
            <div className="flex gap-2">
              <button onClick={() => setIsStudent(true)} className={chipClass(isStudent === true)}>{L.yes}</button>
              <button onClick={() => setIsStudent(false)} className={chipClass(isStudent === false)}>{L.no}</button>
            </div>
          </div>

          {/* Business-specific: Industry */}
          {isBusiness && (
            <div>
              <p className="text-white/60 text-xs font-semibold mb-2">{L.industryQ}</p>
              <div className="flex flex-wrap gap-2">
                {L.industries.map(ind => (
                  <button key={ind} onClick={() => setIndustry(ind)} className={chipClass(industry === ind)}>{ind}</button>
                ))}
              </div>
            </div>
          )}

          {/* Business-specific: Tax regime */}
          {isBusiness && (
            <div>
              <p className="text-white/60 text-xs font-semibold mb-2">{L.taxRegimeQ}</p>
              <div className="flex flex-wrap gap-2">
                {L.taxRegimes.map(tr => (
                  <button key={tr.key} onClick={() => setTaxRegime(tr.key)} className={chipClass(taxRegime === tr.key)}>{tr.label}</button>
                ))}
              </div>
            </div>
          )}

          {/* Personal-specific: Family size */}
          {isPersonal && (
            <div>
              <p className="text-white/60 text-xs font-semibold mb-2">{L.familyQ}</p>
              <div className="flex flex-wrap gap-2">
                {L.families.map(f => (
                  <button key={f} onClick={() => setFamilySize(f)} className={chipClass(familySize === f)}>{f}</button>
                ))}
              </div>
            </div>
          )}

          {/* Revenue / Income */}
          <div>
            <p className="text-white/60 text-xs font-semibold mb-2">{isBusiness ? L.revenueQ : L.incomeQ}</p>
            <div className="flex flex-wrap gap-2">
              {(isBusiness ? L.revenues : L.incomes).map(r => (
                <button key={r} onClick={() => setRevenue(r)} className={chipClass(revenue === r)}>{r}</button>
              ))}
            </div>
          </div>

          {/* Banks */}
          <div>
            <p className="text-white/60 text-xs font-semibold mb-2">{L.banksQ}</p>
            <div className="flex flex-wrap gap-2">
              {L.banks.map(b => (
                <button key={b} onClick={() => toggleBank(b)} className={chipClass(banks.includes(b))}>{b}</button>
              ))}
            </div>
          </div>

          {/* Expenses */}
          <div>
            <p className="text-white/60 text-xs font-semibold mb-2">{isBusiness ? L.expensesQ : L.personalExpensesQ}</p>
            <div className="flex flex-wrap gap-2">
              {(isBusiness ? L.expenses : L.personalExpenses).map(e => (
                <button key={e} onClick={() => toggleExpense(e)} className={chipClass(expenses.includes(e))}>{e}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={handleSkip} disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70 transition-colors disabled:opacity-50">
            {L.skip}
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-bold bg-[#4F8EF7] text-white hover:bg-[#4F8EF7]/80 transition-colors disabled:opacity-50">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </span>
            ) : L.start}
          </button>
        </div>
      </div>
    </div>
  )
}
