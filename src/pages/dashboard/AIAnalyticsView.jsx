import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'

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
]

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AIAnalyticsView({ userId, demoData, demoAccounts }) {
  const { t, lang } = useLanguage()
  const auth = useAuth()
  const user = demoData ? { id: 'demo' } : auth.user
  const insightL = INSIGHT_I18N[lang] || INSIGHT_I18N.en
  const [txs, setTxs] = useState(demoData || [])
  const [accounts, setAccounts] = useState(demoAccounts || [])
  const [loading, setLoading] = useState(!demoData)
  const [insights, setInsights] = useState(demoData ? computeInsights(demoData, lang) : [])
  const [messages, setMessages] = useState([
    { role: 'assistant', content: t.aiWelcome || 'Hi! I\'m your AI financial assistant. Ask me anything about your finances, or try one of the prompts below.' }
  ])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const chatEndRef = useRef(null)

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

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
    return `Total balance: $${totalBalance.toLocaleString('en')}
This month income: $${income.toLocaleString('en')}
This month expenses: $${expenses.toLocaleString('en')}
Net profit this month: $${(income - expenses).toLocaleString('en')}
Savings rate: ${income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0}%
Top expense categories: ${topCats.map(([k, v]) => `${k} ($${Math.round(v).toLocaleString('en')})`).join(', ')}
Total transactions this month: ${thisMonth.length}
Accounts: ${accounts.map(a => `${a.name} ($${(a.balance || 0).toLocaleString('en')})`).join(', ')}`
  }, [txs, accounts])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || chatLoading) return
    setInput('')
    const newMessages = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setChatLoading(true)
    setApiKeyMissing(false)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`https://woelxkjfbjgazcbozrak.supabase.co/functions/v1/ai-finance-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          context: buildContext(),
        }),
      })
      const data = await res.json()
      if (data.error) {
        if (data.error.includes('ANTHROPIC_API_KEY')) {
          setApiKeyMissing(true)
          setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ ' + data.error }])
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }])
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Network error: ${err.message}` }])
    }
    setChatLoading(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-[#4F8EF7] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Insights */}
      <div className="w-[44%] border-r border-white/5 overflow-y-auto flex-shrink-0">
        <div className="px-5 py-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-[#4F8EF7]/20 flex items-center justify-center text-sm">✦</div>
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
            <div className="space-y-3">
              {insights.map((ins, i) => (
                <div key={i} className={`rounded-xl border p-4 ${INSIGHT_STYLES[ins.type]}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl leading-none flex-shrink-0 mt-0.5">{ins.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${INSIGHT_DOT[ins.type]}`} />
                        <p className="text-white/80 text-xs font-semibold">{ins.title}</p>
                      </div>
                      <p className="text-white/50 text-xs leading-relaxed">{ins.text}</p>
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4F8EF7] to-[#8b5cf6] flex items-center justify-center text-white text-sm font-bold">
            ✦
          </div>
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
            <p className="text-yellow-400/70 text-xs">Add your Anthropic API key in Supabase Dashboard → Edge Functions → ai-finance-chat → Secrets → <code className="bg-yellow-500/10 px-1 rounded">ANTHROPIC_API_KEY</code></p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
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
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => sendMessage(p[lang] || p.en)}
                className="text-xs text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-colors">
                {p[lang] || p.en}
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
