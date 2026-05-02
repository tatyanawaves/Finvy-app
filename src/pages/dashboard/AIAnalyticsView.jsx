import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { getPlannedOperations, summarizePlannedOperations } from '../../lib/plannedOperations'

// ─── i18n strings for insights ───────────────────────────────────────────────
const INSIGHT_I18N = {
  en: {
    incomeGrow: 'Income growing', incomeDecline: 'Income declining',
    incomeText: (dir, pct, from, to) => `Income ${dir > 0 ? 'increased' : 'decreased'} by ${pct}% vs last month (${from} → ${to})`,
    expUp: 'Expenses rising', expDown: 'Expenses down',
    expText: (dir, pct, from, to) => `Expenses ${dir > 0 ? 'up' : 'down'} ${pct}% vs last month (${from} → ${to})`,
    savings: 'Savings rate',
    savText: (rate) => `You saved ${rate}% of income this month. ${rate >= 20 ? 'Excellent financial health!' : rate >= 0 ? 'Try to reach 20%+.' : 'Expenses exceed income — review your budget.'}`,
    topSpend: (cat) => `Top spending: ${cat}`,
    topText: (cat, pct, amt) => `${cat} accounts for ${pct}% of expenses this month — ${amt}.`,
    anomaly: 'Unusual transaction detected',
    anomText: (n, amt) => `${n} expense(s) this month are 3× above your average. Largest: ${amt}`,
    forecast: 'Next month forecast',
    foreText: (amt) => `Based on your last 3 months, expected income ~${amt}. Plan expenses accordingly.`,
    dataOverview: 'Data overview', totalTx: 'Total transactions', accounts: 'Accounts',
    totalIncome: 'Total income', totalExpenses: 'Total expenses',
  },
  ru: {
    incomeGrow: 'Доходы растут', incomeDecline: 'Доходы снижаются',
    incomeText: (dir, pct, from, to) => `Доход ${dir > 0 ? 'вырос' : 'снизился'} на ${pct}% по сравнению с прошлым месяцем (${from} → ${to})`,
    expUp: 'Расходы растут', expDown: 'Расходы снижаются',
    expText: (dir, pct, from, to) => `Расходы ${dir > 0 ? 'выросли' : 'снизились'} на ${pct}% по сравнению с прошлым месяцем (${from} → ${to})`,
    savings: 'Норма сбережений',
    savText: (rate) => `Вы сэкономили ${rate}% дохода в этом месяце. ${rate >= 20 ? 'Отличное финансовое здоровье!' : rate >= 0 ? 'Постарайтесь достичь 20%+.' : 'Расходы превышают доход — пересмотрите бюджет.'}`,
    topSpend: (cat) => `Топ расходов: ${cat}`,
    topText: (cat, pct, amt) => `${cat} составляет ${pct}% расходов за этот месяц — ${amt}.`,
    anomaly: 'Необычная транзакция',
    anomText: (n, amt) => `${n} расход(ов) в этом месяце превышает среднее в 3 раза. Максимум: ${amt}`,
    forecast: 'Прогноз на следующий месяц',
    foreText: (amt) => `На основе последних 3 месяцев, ожидаемый доход ~${amt}. Планируйте расходы соответственно.`,
    dataOverview: 'Обзор данных', totalTx: 'Всего транзакций', accounts: 'Счета',
    totalIncome: 'Общий доход', totalExpenses: 'Общие расходы',
  },
  kz: {
    incomeGrow: 'Кіріс өсуде', incomeDecline: 'Кіріс төмендеуде',
    incomeText: (dir, pct, from, to) => `Кіріс ${dir > 0 ? 'өсті' : 'төмендеді'} — ${pct}% өткен аймен салыстырғанда (${from} → ${to})`,
    expUp: 'Шығындар өсуде', expDown: 'Шығындар азайды',
    expText: (dir, pct, from, to) => `Шығындар ${dir > 0 ? 'өсті' : 'азайды'} — ${pct}% өткен аймен салыстырғанда (${from} → ${to})`,
    savings: 'Жинақ деңгейі',
    savText: (rate) => `Бұл айда кірістің ${rate}% жиналды. ${rate >= 20 ? 'Тамаша қаржылық жағдай!' : rate >= 0 ? '20%+ жетуге тырысыңыз.' : 'Шығындар кірістен асып кетті — бюджетті қайта қараңыз.'}`,
    topSpend: (cat) => `Негізгі шығын: ${cat}`,
    topText: (cat, pct, amt) => `${cat} — бұл айдағы шығындардың ${pct}%, ${amt}.`,
    anomaly: 'Әдеттен тыс транзакция',
    anomText: (n, amt) => `Бұл айда ${n} шығын орташадан 3 есе жоғары. Ең үлкені: ${amt}`,
    forecast: 'Келесі ай болжамы',
    foreText: (amt) => `Соңғы 3 айға сүйене отырып, күтілетін кіріс ~${amt}. Шығындарды жоспарлаңыз.`,
    dataOverview: 'Деректерге шолу', totalTx: 'Барлық транзакциялар', accounts: 'Шоттар',
    totalIncome: 'Жалпы кіріс', totalExpenses: 'Жалпы шығыс',
  },
}

// ─── Smart Insight Engine ─────────────────────────────────────────────────────
function computeInsights(txs, lang) {
  if (!txs || txs.length === 0) return []
  const L = INSIGHT_I18N[lang] || INSIGHT_I18N.en
  const insights = []

  const now = new Date()
  const thisMonth = txs.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const lastMonth = txs.filter(t => {
    const d = new Date(t.date)
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear()
  })

  const sumIncome = arr => arr.filter(t => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount || 0), 0)
  const sumExpense = arr => arr.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount || 0), 0)

  const incThis = sumIncome(thisMonth)
  const incLast = sumIncome(lastMonth)
  const expThis = sumExpense(thisMonth)
  const expLast = sumExpense(lastMonth)

  // Income trend
  if (incLast > 0) {
    const diff = ((incThis - incLast) / incLast) * 100
    if (Math.abs(diff) > 5) {
      insights.push({
        type: diff > 0 ? 'positive' : 'warning',
        icon: diff > 0 ? '📈' : '📉',
        title: diff > 0 ? L.incomeGrow : L.incomeDecline,
        text: L.incomeText(diff, Math.abs(diff).toFixed(0), fmtAmt(incLast), fmtAmt(incThis)),
      })
    }
  }

  // Expense trend
  if (expLast > 0) {
    const diff = ((expThis - expLast) / expLast) * 100
    if (Math.abs(diff) > 10) {
      insights.push({
        type: diff > 0 ? 'warning' : 'positive',
        icon: diff > 0 ? '⚠️' : '✅',
        title: diff > 0 ? L.expUp : L.expDown,
        text: L.expText(diff, Math.abs(diff).toFixed(0), fmtAmt(expLast), fmtAmt(expThis)),
      })
    }
  }

  // Savings rate
  if (incThis > 0) {
    const rate = ((incThis - expThis) / incThis) * 100
    insights.push({
      type: rate >= 20 ? 'positive' : rate >= 0 ? 'neutral' : 'danger',
      icon: rate >= 20 ? '💰' : rate >= 0 ? '🎯' : '🔴',
      title: L.savings,
      text: L.savText(rate.toFixed(0)),
    })
  }

  // Top expense category
  const catMap = {}
  thisMonth.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category || 'Other'] = (catMap[t.category || 'Other'] || 0) + Math.abs(t.amount || 0)
  })
  const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]
  if (topCat && expThis > 0) {
    insights.push({
      type: 'info',
      icon: '🏷',
      title: L.topSpend(topCat[0]),
      text: L.topText(topCat[0], ((topCat[1] / expThis) * 100).toFixed(0), fmtAmt(topCat[1])),
    })
  }

  // Anomaly: unusually large single transaction
  const allExpenses = txs.filter(t => t.type === 'expense').map(t => Math.abs(t.amount || 0))
  if (allExpenses.length > 3) {
    const avg = allExpenses.reduce((a, b) => a + b, 0) / allExpenses.length
    const anomalies = thisMonth.filter(t => t.type === 'expense' && Math.abs(t.amount) > avg * 3)
    if (anomalies.length > 0) {
      insights.push({
        type: 'warning',
        icon: '🔍',
        title: L.anomaly,
        text: L.anomText(anomalies.length, fmtAmt(Math.max(...anomalies.map(t => Math.abs(t.amount))))),
      })
    }
  }

  // Forecast next month (simple linear projection)
  const last3Income = []
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i - 1, 1)
    const mo = txs.filter(t => {
      const td = new Date(t.date)
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear()
    })
    last3Income.push(sumIncome(mo))
  }
  const avgIncome = last3Income.filter(v => v > 0).reduce((a, b) => a + b, 0) / (last3Income.filter(v => v > 0).length || 1)
  if (avgIncome > 0) {
    insights.push({
      type: 'info',
      icon: '🔮',
      title: L.forecast,
      text: L.foreText(fmtAmt(avgIncome)),
    })
  }

  return insights.slice(0, 6)
}

function fmtAmt(n) {
  return '₸' + Math.round(n).toLocaleString('ru')
}

function createLocalAIReply(question, txs, accounts, lang, plannedOps = []) {
  const isRu = lang === 'ru'
  const isKz = lang === 'kz'
  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0)
  const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount || 0), 0)
  const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount || 0), 0)
  const net = income - expenses
  const catMap = {}
  txs.filter(t => t.type === 'expense').forEach(t => {
    const category = t.category || (isRu ? 'Без категории' : isKz ? 'Санатсыз' : 'Uncategorized')
    catMap[category] = (catMap[category] || 0) + Math.abs(t.amount || 0)
  })
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 3)
  const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0
  const planned = summarizePlannedOperations(plannedOps)
  const plannedRu = plannedOps.length
    ? `План на ближайший период: доходы ${fmtAmt(planned.income)}, расходы ${fmtAmt(planned.expense)}, чистый план ${fmtAmt(planned.net)}.`
    : 'Плановых операций на ближайший период пока нет.'
  const plannedEn = plannedOps.length
    ? `Upcoming plan: income ${fmtAmt(planned.income)}, expenses ${fmtAmt(planned.expense)}, net plan ${fmtAmt(planned.net)}.`
    : 'There are no planned operations for the upcoming period yet.'

  if (isRu) {
    return [
      'Сейчас внешний AI-сервис временно недоступен, но я уже посчитал базовую аналитику по вашим данным.',
      `Баланс по счетам: ${fmtAmt(totalBalance)}.`,
      `Доходы: ${fmtAmt(income)}, расходы: ${fmtAmt(expenses)}, результат: ${fmtAmt(net)}.`,
      `Норма сбережений: ${savingsRate}%.`,
      plannedRu,
      topCats.length ? `Самые крупные статьи расходов: ${topCats.map(([cat, sum]) => `${cat} — ${fmtAmt(sum)}`).join('; ')}.` : 'Расходов для анализа пока мало.',
      'Рекомендация: проверьте самые крупные категории и поставьте лимит на 10-15% ниже текущего уровня.',
    ].join('\n\n')
  }

  if (isKz) {
    return [
      'Сыртқы AI сервисі уақытша қолжетімсіз, бірақ мен деректер бойынша негізгі талдауды есептедім.',
      `Шоттар балансы: ${fmtAmt(totalBalance)}.`,
      `Кіріс: ${fmtAmt(income)}, шығыс: ${fmtAmt(expenses)}, нәтиже: ${fmtAmt(net)}.`,
      `Жинақ деңгейі: ${savingsRate}%.`,
      plannedRu,
      topCats.length ? `Ең үлкен шығын санаттары: ${topCats.map(([cat, sum]) => `${cat} — ${fmtAmt(sum)}`).join('; ')}.` : 'Талдауға шығын деректері әзірге аз.',
      'Ұсыныс: ең үлкен санаттарды қарап, ағымдағы деңгейден 10-15% төмен лимит қойыңыз.',
    ].join('\n\n')
  }

  return [
    'The external AI service is temporarily unavailable, but I calculated a local financial summary from your data.',
    `Account balance: ${fmtAmt(totalBalance)}.`,
    `Income: ${fmtAmt(income)}, expenses: ${fmtAmt(expenses)}, net result: ${fmtAmt(net)}.`,
    `Savings rate: ${savingsRate}%.`,
    plannedEn,
    topCats.length ? `Top expense categories: ${topCats.map(([cat, sum]) => `${cat} — ${fmtAmt(sum)}`).join('; ')}.` : 'There is not enough expense data yet.',
    'Recommendation: review the largest categories and set limits 10-15% below the current level.',
  ].join('\n\n')
}

// ─── Insight Card ─────────────────────────────────────────────────────────────
const INSIGHT_STYLES = {
  positive: 'border-blue-500/20 bg-blue-500/5',
  warning:  'border-yellow-500/20 bg-yellow-500/5',
  danger:   'border-red-500/20 bg-red-500/5',
  neutral:  'border-white/10 bg-white/[0.03]',
  info:     'border-white/10 bg-white/[0.03]',
}
const INSIGHT_DOT = {
  positive: 'bg-[#4F8EF7]',
  warning:  'bg-yellow-400',
  danger:   'bg-red-400',
  neutral:  'bg-white/30',
  info:     'bg-white/30',
}

// ─── Chat Message ─────────────────────────────────────────────────────────────
function ChatBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
        isUser ? 'bg-white/10 text-white/60' : 'bg-[#4F8EF7]/20 text-[#4F8EF7]'
      }`}>
        {isUser ? 'You' : '✦'}
      </div>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isUser
          ? 'bg-[#4F8EF7]/20 text-white/90 rounded-tr-sm'
          : 'bg-white/[0.06] text-white/80 rounded-tl-sm'
      }`}>
        {msg.content}
      </div>
    </div>
  )
}

// ─── Quick Prompts ─────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { en: 'Analyze my spending habits', ru: 'Проанализируй мои расходы', kz: 'Шығындарымды талда' },
  { en: 'How can I save more?', ru: 'Как мне больше экономить?', kz: 'Қалай көбірек үнемдеуге болады?' },
  { en: 'What are my biggest risks?', ru: 'Какие у меня финансовые риски?', kz: 'Қаржылық тәуекелдерім қандай?' },
  { en: 'Forecast next month', ru: 'Прогноз на следующий месяц', kz: 'Келесі айға болжам' },
  { en: 'Find hidden losses', ru: 'Найди скрытые потери', kz: 'Жасырын шығындарды тап' },
  { en: 'Create an action plan', ru: 'Составь план действий', kz: 'Іс-қимыл жоспарын жаса' },
  { en: 'What should I pay first?', ru: 'Что оплатить в первую очередь?', kz: 'Алдымен нені төлеу керек?' },
  { en: 'How to improve cash flow?', ru: 'Как улучшить Cash Flow?', kz: 'Cash Flow қалай жақсартамын?' },
]

function getSmartPrompts(lang, messages, insights) {
  const last = [...messages].reverse().find(m => m.role === 'assistant' || m.role === 'user')?.content?.toLowerCase() || ''
  const hasRisk = last.includes('риск') || last.includes('risk') || insights.some(i => i.type === 'warning' || i.type === 'danger')
  const hasForecast = last.includes('прогноз') || last.includes('forecast')
  const hasExpenses = last.includes('расход') || last.includes('expense')
  const contextual = []

  if (hasExpenses) contextual.push({ en: 'Which expenses should I cut first?', ru: 'Какие расходы сократить первыми?', kz: 'Қай шығындарды бірінші қысқарту керек?' })
  if (hasRisk) contextual.push({ en: 'Explain these risks by priority', ru: 'Разложи риски по приоритету', kz: 'Тәуекелдерді басымдықпен түсіндір' })
  if (hasForecast) contextual.push({ en: 'Show the forecast assumptions', ru: 'Покажи допущения прогноза', kz: 'Болжамның негіздерін көрсет' })
  if (insights[0]?.title) contextual.push({ en: `Explain: ${insights[0].title}`, ru: `Объясни: ${insights[0].title}`, kz: `Түсіндір: ${insights[0].title}` })

  return [...contextual, ...QUICK_PROMPTS].slice(0, 9).map(p => p[lang] || p.en)
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AIAnalyticsView({ userId, demoData, demoAccounts }) {
  const { t, lang } = useLanguage()
  const auth = useAuth()
  const user = demoData ? { id: 'demo' } : auth.user
  const insightL = INSIGHT_I18N[lang] || INSIGHT_I18N.en
  const [txs, setTxs] = useState(demoData || [])
  const [accounts, setAccounts] = useState(demoAccounts || [])
  const [plannedOps, setPlannedOps] = useState([])
  const [budgetSnapshot, setBudgetSnapshot] = useState(null) // {month, rows, totals, monthIncome, toBudget}
  const [loading, setLoading] = useState(!demoData)
  const [insights, setInsights] = useState(demoData ? computeInsights(demoData, lang) : [])
  const [messages, setMessages] = useState([
    { role: 'assistant', content: t.aiWelcome || 'Hi! I\'m your AI financial assistant. Ask me anything about your finances, or try one of the prompts below.' }
  ])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const chatEndRef = useRef(null)
  const smartPrompts = getSmartPrompts(lang, messages, insights)

  // Load transaction data
  useEffect(() => {
    if (demoData) return
    const load = async () => {
      setLoading(true)
      const [{ data: txData }, { data: accData }] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(200),
        supabase.from('accounts').select('*').eq('user_id', userId),
      ])
      if (txData) { setTxs(txData); setInsights(computeInsights(txData, lang)) }
      if (accData) setAccounts(accData)
      setLoading(false)
    }
    load()
  }, [userId, lang, demoData])

  useEffect(() => {
    const loadPlanned = async () => {
      const from = new Date()
      const to = new Date()
      to.setDate(to.getDate() + 60)
      const ops = await getPlannedOperations({
        userId,
        demo: !!demoData,
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
      })
      setPlannedOps(ops)
    }
    loadPlanned()
    window.addEventListener('finvy:planned-payroll-updated', loadPlanned)
    window.addEventListener('storage', loadPlanned)
    return () => {
      window.removeEventListener('finvy:planned-payroll-updated', loadPlanned)
      window.removeEventListener('storage', loadPlanned)
    }
  }, [userId, demoData])

  // Load current month's budget snapshot for AI context
  useEffect(() => {
    if (demoData) {
      setBudgetSnapshot(null)
      return
    }
    const loadBudget = async () => {
      const now = new Date()
      const m = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const { data, error } = await supabase
        .from('monthly_budgets')
        .select('category, planned_amount, rollover_in')
        .eq('user_id', userId)
        .eq('month', m)
      if (error) return
      // Compute spent per category from already-loaded transactions for this month
      const spentMap = {}
      for (const tx of txs) {
        const txMonth = (tx.date || '').slice(0, 7)
        if (txMonth !== m || tx.type !== 'expense') continue
        const cat = tx.category || 'Другое'
        spentMap[cat] = (spentMap[cat] || 0) + Math.abs(Number(tx.amount) || 0)
      }
      setBudgetSnapshot({ month: m, rows: data || [], spent: spentMap })
    }
    loadBudget()
  }, [userId, demoData, txs])

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Format budget snapshot as a short text block for AI context
  const formatBudgetText = useCallback((amount) => {
    if (!budgetSnapshot || !budgetSnapshot.rows.length) return null
    const lines = budgetSnapshot.rows.map((b) => {
      const planned = Number(b.planned_amount) || 0
      const rollover = Number(b.rollover_in) || 0
      const cap = planned + rollover
      const spent = Number(budgetSnapshot.spent[b.category] || 0)
      const remaining = cap - spent
      const pct = cap > 0 ? Math.round((spent / cap) * 100) : 0
      return `${b.category}: план ${amount(cap)}, потрачено ${amount(spent)} (${pct}%), осталось ${amount(remaining)}`
    })
    const totalPlanned = budgetSnapshot.rows.reduce((s, b) => s + (Number(b.planned_amount) || 0) + (Number(b.rollover_in) || 0), 0)
    const totalSpent = Object.values(budgetSnapshot.spent).reduce((s, v) => s + v, 0)
    return `Месяц ${budgetSnapshot.month}: всего запланировано ${amount(totalPlanned)}, всего потрачено ${amount(totalSpent)}.\n${lines.join('\n')}`
  }, [budgetSnapshot])

  // Build financial context summary for Claude
  const buildContext = useCallback(() => {
    const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0)
    const now = new Date()
    const thisMonth = txs.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const income = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount || 0), 0)
    const expenses = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount || 0), 0)
    const catMap = {}
    thisMonth.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category || 'Other'] = (catMap[t.category || 'Other'] || 0) + Math.abs(t.amount || 0)
    })
    const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const amount = (value) => `${Math.round(value).toLocaleString('ru-RU')} ₸`
    const topCategoryText = topCats.map(([k, v]) => `${k} (${amount(v)})`).join(', ')
    const accountText = accounts.map(a => `${a.name} (${amount(a.balance || 0)})`).join(', ')
    const planned = summarizePlannedOperations(plannedOps)
    const plannedText = plannedOps.length
      ? plannedOps.slice(0, 8).map(op => `${op.date}: ${op.type === 'income' ? '+' : '-'}${amount(op.amount || 0)} ${op.category || op.description}`).join('; ')
      : 'none'
    const budgetText = formatBudgetText(amount)

    if (lang === 'ru') {
      return `Отвечай на русском языке. Валюта всех сумм: казахстанский тенге (₸).
Общий баланс: ${amount(totalBalance)}
Доход за текущий месяц: ${amount(income)}
Расходы за текущий месяц: ${amount(expenses)}
Чистый результат за текущий месяц: ${amount(income - expenses)}
Норма сбережений: ${income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0}%
Главные категории расходов: ${topCategoryText}
Количество транзакций за месяц: ${thisMonth.length}
Плановые операции на 60 дней: доходы ${amount(planned.income)}, расходы ${amount(planned.expense)}, чистый план ${amount(planned.net)}. Список: ${plannedText}
Счета: ${accountText}${budgetText ? `\nБюджет (envelope-budgeting):\n${budgetText}` : ''}`
    }

    if (lang === 'kz') {
      return `Қазақ тілінде жауап бер. Барлық сома валютасы: қазақстандық теңге (₸).
Жалпы баланс: ${amount(totalBalance)}
Осы айдағы кіріс: ${amount(income)}
Осы айдағы шығыс: ${amount(expenses)}
Осы айдағы таза нәтиже: ${amount(income - expenses)}
Жинақ деңгейі: ${income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0}%
Негізгі шығыс санаттары: ${topCategoryText}
Осы айдағы транзакциялар саны: ${thisMonth.length}
Плановые операции на 60 дней: доходы ${amount(planned.income)}, расходы ${amount(planned.expense)}, чистый план ${amount(planned.net)}. Список: ${plannedText}
Шоттар: ${accountText}${budgetText ? `\nБюджет (envelope):\n${budgetText}` : ''}`
    }

    return `Answer in English. Currency for all amounts: Kazakhstani tenge (₸).
Total balance: ${amount(totalBalance)}
This month income: ${amount(income)}
This month expenses: ${amount(expenses)}
Net profit this month: ${amount(income - expenses)}
Savings rate: ${income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0}%
Top expense categories: ${topCategoryText}
Total transactions this month: ${thisMonth.length}
Planned operations for 60 days: income ${amount(planned.income)}, expenses ${amount(planned.expense)}, net plan ${amount(planned.net)}. List: ${plannedText}
Accounts: ${accountText}${budgetText ? `\nEnvelope budget:\n${budgetText}` : ''}`
  }, [txs, accounts, plannedOps, lang, formatBudgetText])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || chatLoading) return
    setInput('')
    const newMessages = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setChatLoading(true)
    setApiKeyMissing(false)

    try {
      const { data, error } = await Promise.race([
        supabase.functions.invoke('ai-finance-chat', {
          body: {
            messages: newMessages.map(m => ({ role: m.role, content: m.content })),
            context: buildContext(),
            language: lang,
          },
        }),
        new Promise(resolve => {
          setTimeout(() => resolve({ data: { error: 'AI_TIMEOUT' }, error: null }), 12000)
        }),
      ])
      if (error || data?.error) {
        const message = error?.message || data?.error || 'AI service is unavailable'
        if (message.includes('OPENROUTER_API_KEY') || message.includes('ANTHROPIC_API_KEY')) {
          setApiKeyMissing(true)
        }
        setMessages(prev => [...prev, { role: 'assistant', content: createLocalAIReply(msg, txs, accounts, lang, plannedOps) }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply || createLocalAIReply(msg, txs, accounts, lang, plannedOps) }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: createLocalAIReply(msg, txs, accounts, lang, plannedOps) }])
    }
    setChatLoading(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-[#4F8EF7] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto px-4 sm:px-5 py-4 sm:py-5">
      {/* Left: Insights */}
      <div className="w-full flex-shrink-0 rounded-2xl border border-white/10 bg-[#151515]">
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-5">
            <div>
              <h2 className="text-white font-semibold text-sm">{t.aiInsights || 'AI Insights'}</h2>
              <p className="text-white/30 text-xs">{t.aiInsightsSub || 'Based on your transaction history'}</p>
            </div>
          </div>

          {insights.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-white/20">
              <p className="text-3xl mb-2">🤖</p>
              <p className="text-sm">{t.noInsights || 'Add more transactions to get insights'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {insights.map((ins, i) => (
                <div key={i} className={`rounded-xl border p-4 ${INSIGHT_STYLES[ins.type]}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl leading-none flex-shrink-0 mt-0.5">{ins.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${INSIGHT_DOT[ins.type]}`} />
                        <p className="text-white/80 text-xs font-semibold line-clamp-2">{ins.title}</p>
                      </div>
                      <p className="text-white/50 text-xs leading-relaxed line-clamp-3">{ins.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats summary */}
          {txs.length > 0 && (
            <div className="mt-5 bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">{insightL.dataOverview}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: insightL.totalTx, value: txs.length },
                  { label: insightL.accounts, value: accounts.length },
                  { label: insightL.totalIncome, value: fmtAmt(txs.filter(t=>t.type==='income').reduce((s,t)=>s+Math.abs(t.amount||0),0)) },
                  { label: insightL.totalExpenses, value: fmtAmt(txs.filter(t=>t.type==='expense').reduce((s,t)=>s+Math.abs(t.amount||0),0)) },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-white/30 text-[10px] mb-0.5">{item.label}</p>
                    <p className="text-white/70 text-sm font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: AI Chat */}
      <div className="flex min-h-[520px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#151515] shadow-[0_22px_70px_-56px_rgba(79,142,247,0.55)]">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-white/5 flex-shrink-0">
          <div>
            <p className="text-white/80 text-sm font-semibold">{t.aiAssistant || 'AI Financial Assistant'}</p>
            <p className="text-white/30 text-xs">{t.aiPoweredBy || 'Powered by Claude'}</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4F8EF7] animate-pulse" />
            <span className="text-white/30 text-xs">Online</span>
          </div>
        </div>

        {/* API key missing banner */}
        {apiKeyMissing && (
          <div className="mx-4 mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
            <p className="text-yellow-400 text-xs font-semibold mb-1">⚙️ Setup required</p>
            <p className="text-yellow-400/70 text-xs">Add your OpenRouter API key in Supabase Dashboard → Edge Functions → ai-finance-chat → Secrets → <code className="bg-yellow-500/10 px-1 rounded">OPENROUTER_API_KEY</code></p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 min-h-[300px] overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} />
          ))}
          {chatLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-[#4F8EF7]/20 text-[#4F8EF7]">✦</div>
              <div className="bg-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4F8EF7]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#4F8EF7]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#4F8EF7]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick prompts */}
        {!chatLoading && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {smartPrompts.map((prompt, i) => (
              <button key={`${prompt}-${i}`} onClick={() => sendMessage(prompt)}
                className="text-xs text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20 bg-white/[0.025] px-3 py-1.5 rounded-full transition-colors">
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2 flex-shrink-0">
          <div className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-2.5 focus-within:border-[#4F8EF7]/30 transition-colors">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={t.aiAskPlaceholder || 'Ask about your finances...'}
              className="flex-1 bg-transparent text-white/80 text-sm placeholder-white/20 outline-none"
              disabled={chatLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || chatLoading}
              className="w-7 h-7 rounded-xl bg-[#4F8EF7] disabled:opacity-30 flex items-center justify-center hover:bg-[#4F8EF7]/80 transition-colors flex-shrink-0"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 6L2 6M6 2l4 4-4 4"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
