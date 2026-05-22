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

const WORK_ONBOARDING = {
  en: {
    businessFormQ: 'Business format',
    businessForms: ['IE', 'LLC', 'Self-employed', 'Other'],
    employeeCountQ: 'Team size',
    employeeCounts: ['No employees', '1-3', '4-10', '11-30', '30+'],
    obligationsQ: 'Required payments',
    businessObligations: ['Payroll', 'Taxes', 'Rent', 'Loans/leasing', 'Suppliers', 'Utilities', 'Telecom/IT', 'Marketing', 'Logistics', 'Subscriptions'],
    personalObligations: ['Rent/mortgage', 'Loans', 'Utilities', 'Telecom/internet', 'School/kids', 'Subscriptions', 'Insurance', 'Family support', 'Transport', 'Health'],
    goalsQ: 'Main goals',
    businessGoals: ['3-month reserve', 'Pay taxes on time', 'Payroll control', 'Purchase planning', 'Reduce cash gaps', 'Profit growth'],
    personalGoals: ['Emergency fund', 'Close loans', 'Save for a purchase', 'Control spending', 'Family budget', 'Investing'],
    monthlyPlanHint: 'For selected required payments, add the monthly amount and payment day. Finvy will show them in planning and cashback analysis.',
    monthlyAmount: 'Monthly amount',
    monthlyDay: 'Payment day',
    startMethodQ: 'How do you want to start?',
    startMethods: [
      { key: 'import', label: 'Upload bank statement', hint: 'Create transactions from a bank file' },
      { key: 'manual', label: 'Manual entry', hint: 'Add accounts and operations yourself' },
    ],
  },
  ru: {
    businessFormQ: 'Форма бизнеса',
    businessForms: ['ИП', 'ТОО', 'Самозанятый', 'Другое'],
    employeeCountQ: 'Сколько сотрудников?',
    employeeCounts: ['Нет сотрудников', '1-3', '4-10', '11-30', '30+'],
    obligationsQ: 'Обязательные платежи',
    businessObligations: ['Зарплата', 'Налоги', 'Аренда', 'Кредиты/лизинг', 'Поставщики', 'Коммунальные', 'Связь/IT', 'Реклама', 'Логистика', 'Подписки'],
    personalObligations: ['Аренда/ипотека', 'Кредиты', 'Коммунальные', 'Связь/интернет', 'Детсад/школа', 'Подписки', 'Страховка', 'Помощь семье', 'Транспорт', 'Лечение'],
    goalsQ: 'Главные цели',
    businessGoals: ['Резерв на 3 месяца', 'Закрывать налоги вовремя', 'Контроль ФОТ', 'План закупок', 'Сократить кассовые разрывы', 'Рост прибыли'],
    personalGoals: ['Финансовая подушка', 'Закрыть кредиты', 'Накопить на покупку', 'Контроль расходов', 'Семейный бюджет', 'Инвестиции'],
    monthlyPlanHint: 'Для выбранных обязательных платежей укажите сумму и день оплаты. Finvy будет учитывать их в планировании и расчёте кэшбека.',
    monthlyAmount: 'Сумма в месяц',
    monthlyDay: 'День оплаты',
    startMethodQ: 'Как начнем работу?',
    startMethods: [
      { key: 'import', label: 'Загрузить выписку', hint: 'Быстро создать операции из файла банка' },
      { key: 'manual', label: 'Ввести вручную', hint: 'Добавить счета и операции самостоятельно' },
    ],
  },
  kz: {
    businessFormQ: 'Бизнес форматы',
    businessForms: ['ЖК', 'ЖШС', 'Өзін-өзі жұмыспен қамтыған', 'Басқа'],
    employeeCountQ: 'Қызметкерлер саны',
    employeeCounts: ['Қызметкер жоқ', '1-3', '4-10', '11-30', '30+'],
    obligationsQ: 'Міндетті төлемдер',
    businessObligations: ['Жалақы', 'Салықтар', 'Жалға алу', 'Несие/лизинг', 'Жеткізушілер', 'Коммуналдық', 'Байланыс/IT', 'Жарнама', 'Логистика', 'Жазылымдар'],
    personalObligations: ['Жалға алу/ипотека', 'Несиелер', 'Коммуналдық', 'Байланыс/интернет', 'Балалар/мектеп', 'Жазылымдар', 'Сақтандыру', 'Отбасына көмек', 'Көлік', 'Денсаулық'],
    goalsQ: 'Негізгі мақсаттар',
    businessGoals: ['3 айлық резерв', 'Салықтарды уақытында төлеу', 'Жалақы қорын бақылау', 'Сатып алуды жоспарлау', 'Касса алшақтығын азайту', 'Пайданы өсіру'],
    personalGoals: ['Қаржы қоры', 'Несиені жабу', 'Сатып алуға жинау', 'Шығынды бақылау', 'Отбасы бюджеті', 'Инвестиция'],
    monthlyPlanHint: 'Таңдалған міндетті төлемдер үшін айлық соманы және төлем күнін көрсетіңіз. Finvy оларды жоспарлау мен кэшбэк есебінде ескереді.',
    monthlyAmount: 'Айлық сома',
    monthlyDay: 'Төлем күні',
    startMethodQ: 'Қалай бастаймыз?',
    startMethods: [
      { key: 'import', label: 'Банк көшірмесін жүктеу', hint: 'Файлдан операциялар жасау' },
      { key: 'manual', label: 'Қолмен енгізу', hint: 'Шоттар мен операцияларды өзіңіз қосасыз' },
    ],
  },
}

const DEFAULT_BUSINESS_CATEGORIES = [
  { name: 'Продажи', type: 'income', icon: '💰', color: '#4F8EF7' },
  { name: 'Услуги', type: 'income', icon: '🧾', color: '#06b6d4' },
  { name: 'Зарплата', type: 'expense', icon: '👥', color: '#ef4444' },
  { name: 'Налоги', type: 'expense', icon: '🏛️', color: '#6b7280' },
  { name: 'Аренда', type: 'expense', icon: '🏢', color: '#f97316' },
  { name: 'Закуп товаров', type: 'expense', icon: '📦', color: '#f59e0b' },
  { name: 'Связь/IT', type: 'expense', icon: '💻', color: '#8b5cf6' },
  { name: 'Логистика', type: 'expense', icon: '🚚', color: '#0ea5e9' },
  { name: 'Прочие расходы', type: 'expense', icon: '📁', color: '#94a3b8' },
]

const DEFAULT_PERSONAL_CATEGORIES = [
  { name: 'Доход', type: 'income', icon: '💼', color: '#4F8EF7' },
  { name: 'Кэшбэк', type: 'income', icon: '🎁', color: '#14b8a6' },
  { name: 'Продукты', type: 'expense', icon: '🛒', color: '#ef4444' },
  { name: 'Аренда/Ипотека', type: 'expense', icon: '🏠', color: '#f97316' },
  { name: 'Коммунальные', type: 'expense', icon: '💡', color: '#78716c' },
  { name: 'Транспорт', type: 'expense', icon: '🚕', color: '#0ea5e9' },
  { name: 'Здоровье', type: 'expense', icon: '💊', color: '#ec4899' },
  { name: 'Подписки', type: 'expense', icon: '🔁', color: '#6366f1' },
  { name: 'Прочее', type: 'expense', icon: '📁', color: '#94a3b8' },
]

const onboardingOptions = (lang) => WORK_ONBOARDING[lang] || WORK_ONBOARDING.ru

const parseMoney = (value) => Number(String(value || '').replace(/\s/g, '').replace(',', '.')) || 0
const clampPaymentDay = (value) => {
  const day = Math.round(Number(value) || 1)
  return Math.min(28, Math.max(1, day))
}

async function ensureStarterCategories(userId, profileType, selectedExpenses = []) {
  const { data: existing } = await supabase
    .from('fm_categories')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  if (existing?.length) return

  const base = profileType === 'personal' ? DEFAULT_PERSONAL_CATEGORIES : DEFAULT_BUSINESS_CATEGORIES
  const customExpenses = selectedExpenses
    .filter(name => !base.some(item => item.name.toLowerCase() === String(name).toLowerCase()))
    .map(name => ({ name, type: 'expense', icon: '📁', color: '#94a3b8' }))

  await supabase.from('fm_categories').insert(
    [...base, ...customExpenses].map(category => ({ ...category, user_id: userId }))
  )
}

export default function OnboardingSurvey({ userId, onComplete }) {
  const { lang } = useLanguage()
  const L = SURVEY_I18N[lang] || SURVEY_I18N.ru
  const W = onboardingOptions(lang)
  const [profileType, setProfileType] = useState(null) // 'business' | 'personal'
  const [isStudent, setIsStudent] = useState(null)
  const [revenue, setRevenue] = useState('')
  const [banks, setBanks] = useState([])
  const [expenses, setExpenses] = useState([])
  const [industry, setIndustry] = useState('')
  const [taxRegime, setTaxRegime] = useState('')
  const [familySize, setFamilySize] = useState('')
  const [businessForm, setBusinessForm] = useState('')
  const [employeeCount, setEmployeeCount] = useState('')
  const [obligations, setObligations] = useState([])
  const [obligationPlans, setObligationPlans] = useState({})
  const [financialGoals, setFinancialGoals] = useState([])
  const [startMethod, setStartMethod] = useState('import')
  const [loading, setLoading] = useState(false)

  const toggleBank = (b) => setBanks(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])
  const toggleExpense = (e) => setExpenses(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])
  const toggleObligation = (item) => setObligations(prev => {
    const selected = prev.includes(item)
    if (selected) {
      setObligationPlans(plans => {
        const next = { ...plans }
        delete next[item]
        return next
      })
      return prev.filter(x => x !== item)
    }
    setObligationPlans(plans => ({ ...plans, [item]: { amount: '', day: 10, category: item } }))
    return [...prev, item]
  })
  const toggleGoal = (item) => setFinancialGoals(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  const setObligationPlan = (item, key, value) => {
    setObligationPlans(prev => ({
      ...prev,
      [item]: { amount: '', day: 10, category: item, ...(prev[item] || {}), [key]: value },
    }))
  }

  const buildSurveyData = (override = {}) => ({
    profileType: profileType || 'business',
    isStudent,
    revenue,
    banks,
    expenses,
    industry,
    taxRegime,
    familySize,
    businessForm,
    employeeCount,
    obligations,
    monthlyObligations: obligations
      .map(name => {
        const plan = obligationPlans[name] || {}
        return {
          name,
          category: plan.category || name,
          amount: parseMoney(plan.amount),
          day: clampPaymentDay(plan.day),
          enabled: parseMoney(plan.amount) > 0,
        }
      })
      .filter(item => item.enabled),
    financialGoals,
    startMethod,
    ...override,
  })

  const handleSubmit = async () => {
    setLoading(true)
    const surveyData = buildSurveyData()
    await supabase.from('fm_settings').upsert({
      user_id: userId,
      default_currency: 'KZT',
      survey_data: JSON.stringify(surveyData),
      onboarding_done: true,
      ...(taxRegime ? { tax_regime: taxRegime } : {}),
    }, { onConflict: 'user_id' })

    setLoading(false)
    onComplete?.(surveyData)
  }

  const handleSkip = async () => {
    setLoading(true)
    const surveyData = buildSurveyData({ profileType: profileType || 'business', startMethod: 'manual' })
    await supabase.from('fm_settings').upsert({
      user_id: userId,
      default_currency: 'KZT',
      survey_data: JSON.stringify(surveyData),
      onboarding_done: true,
    }, { onConflict: 'user_id' })
    setLoading(false)
    onComplete?.(surveyData)
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
  const profileSelected = Boolean(profileType)

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

          {isBusiness && (
            <div>
              <p className="text-white/60 text-xs font-semibold mb-2">{W.businessFormQ}</p>
              <div className="flex flex-wrap gap-2">
                {W.businessForms.map(form => (
                  <button key={form} onClick={() => setBusinessForm(form)} className={chipClass(businessForm === form)}>{form}</button>
                ))}
              </div>
            </div>
          )}

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

          {isBusiness && (
            <div>
              <p className="text-white/60 text-xs font-semibold mb-2">{W.employeeCountQ}</p>
              <div className="flex flex-wrap gap-2">
                {W.employeeCounts.map(count => (
                  <button key={count} onClick={() => setEmployeeCount(count)} className={chipClass(employeeCount === count)}>{count}</button>
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

          {profileType && (
            <div>
              <p className="text-white/60 text-xs font-semibold mb-2">{W.obligationsQ}</p>
              <div className="flex flex-wrap gap-2">
                {(isBusiness ? W.businessObligations : W.personalObligations).map(item => (
                  <button key={item} onClick={() => toggleObligation(item)} className={chipClass(obligations.includes(item))}>{item}</button>
                ))}
              </div>
              {obligations.length > 0 && (
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 space-y-3">
                  <p className="text-white/35 text-[11px] leading-relaxed">{W.monthlyPlanHint}</p>
                  <div className="space-y-2">
                    {obligations.map(item => {
                      const plan = obligationPlans[item] || { amount: '', day: 10 }
                      return (
                        <div key={item} className="grid grid-cols-1 sm:grid-cols-[1fr_120px_92px] gap-2 items-center">
                          <p className="text-white/70 text-xs font-medium truncate">{item}</p>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={plan.amount}
                            onChange={e => setObligationPlan(item, 'amount', e.target.value)}
                            placeholder={W.monthlyAmount}
                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#4F8EF7]/40"
                          />
                          <input
                            type="number"
                            min="1"
                            max="28"
                            value={plan.day}
                            onChange={e => setObligationPlan(item, 'day', e.target.value)}
                            placeholder={W.monthlyDay}
                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#4F8EF7]/40"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Expenses */}
          <div>
            <p className="text-white/60 text-xs font-semibold mb-2">{isBusiness ? L.expensesQ : L.personalExpensesQ}</p>
            <div className="flex flex-wrap gap-2">
              {(isBusiness ? L.expenses : L.personalExpenses).map(e => (
                <button key={e} onClick={() => toggleExpense(e)} className={chipClass(expenses.includes(e))}>{e}</button>
              ))}
            </div>
          </div>

          {profileType && (
            <div>
              <p className="text-white/60 text-xs font-semibold mb-2">{W.goalsQ}</p>
              <div className="flex flex-wrap gap-2">
                {(isBusiness ? W.businessGoals : W.personalGoals).map(item => (
                  <button key={item} onClick={() => toggleGoal(item)} className={chipClass(financialGoals.includes(item))}>{item}</button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-white/60 text-xs font-semibold mb-2">{W.startMethodQ}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {W.startMethods.map(method => (
                <button
                  key={method.key}
                  onClick={() => setStartMethod(method.key)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    startMethod === method.key
                      ? 'bg-[#4F8EF7]/20 border-[#4F8EF7]/40 text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                  }`}
                >
                  <span className="block text-sm font-semibold">{method.label}</span>
                  <span className="mt-1 block text-xs text-white/40">{method.hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={handleSkip} disabled={loading || !profileSelected}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70 transition-colors disabled:opacity-50">
            {L.skip}
          </button>
          <button onClick={handleSubmit} disabled={loading || !profileSelected}
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
