import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'

const PERIOD_KEYS = ['week', 'month', 'quarter', 'year', 'all']

function getPeriodDates(period) {
  const now = new Date()
  const from = new Date()
  if (period === 'week') from.setDate(now.getDate() - 7)
  else if (period === 'month') from.setMonth(now.getMonth() - 1)
  else if (period === 'quarter') from.setMonth(now.getMonth() - 3)
  else if (period === 'year') from.setFullYear(now.getFullYear() - 1)
  else return null
  return from.toISOString()
}

const DATE_LOCALES = { en: 'en-US', ru: 'ru-RU', kz: 'kk-KZ' }

function formatDate(dateStr, lang = 'en') {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString(DATE_LOCALES[lang] || 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatAmount(amount, type) {
  const abs = Math.abs(amount || 0)
  const formatted = abs.toLocaleString('en', { maximumFractionDigits: 2 })
  if (type === 'income') return `+${formatted}`
  if (type === 'expense') return `−${formatted}`
  return formatted
}

const typeColor = {
  income: 'text-mint',
  expense: 'text-red-400',
  transfer: 'text-white/50',
}

const typeBg = {
  income: 'bg-mint/10 text-mint',
  expense: 'bg-red-500/10 text-red-400',
  transfer: 'bg-white/5 text-white/40',
}

const CURRENCY_SYMBOL = { USD: '$', EUR: '€', KZT: '₸', UAH: '₴', GBP: '£' }
const symOf = (c) => CURRENCY_SYMBOL[c] || (c || '')

export default function TransactionsView({ userId, refreshKey, accounts, currency = 'USD', demoData }) {
  const { t, lang } = useLanguage()
  const sym = symOf(currency)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('all')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'income' | 'expense' | 'transfer'
  const [summary, setSummary] = useState({ income: 0, expense: 0, profit: 0 })

  const fetchTransactions = useCallback(async () => {
    setLoading(true)

    let data
    if (demoData) {
      // Filter demo data locally
      data = [...demoData].sort((a, b) => b.date.localeCompare(a.date))
      const fromDate = getPeriodDates(period)
      if (fromDate) data = data.filter(t => t.date >= fromDate)
      if (typeFilter !== 'all') data = data.filter(t => t.type === typeFilter)
      if (search.trim()) data = data.filter(t => t.description?.toLowerCase().includes(search.trim().toLowerCase()))
    } else {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      const fromDate = getPeriodDates(period)
      if (fromDate) query = query.gte('date', fromDate)
      if (typeFilter !== 'all') query = query.eq('type', typeFilter)
      if (search.trim()) query = query.ilike('description', `%${search.trim()}%`)

      const res = await query.limit(200)
      data = res.data
    }

    if (data) {
      setTransactions(data)
      const inc = data.filter(t => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount || 0), 0)
      const exp = data.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount || 0), 0)
      setSummary({ income: inc, expense: exp, profit: inc - exp })
    }
    setLoading(false)
  }, [userId, period, typeFilter, search, refreshKey, demoData])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const accountName = (id) => {
    const acc = accounts?.find(a => a.id === id)
    return acc?.name || '—'
  }

  // Group by date
  const grouped = transactions.reduce((acc, tx) => {
    const key = tx.date ? tx.date.slice(0, 10) : 'Unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(tx)
    return acc
  }, {})
  const dateKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const PERIOD_LABELS = { week: t.week, month: t.month, quarter: t.quarter, year: t.year, all: t.allTime }
  const TYPE_LABELS = { all: t.all, income: t.income, expense: t.expense, transfer: t.transfer }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 px-4 sm:px-6 py-3 border-b border-white/5 flex-shrink-0 overflow-x-auto scrollbar-none">
        <div className="min-w-[88px]">
          <p className="text-white/30 text-xs mb-0.5">{t.income}</p>
          <p className="text-mint font-bold text-sm">{sym}+{summary.income.toLocaleString('en', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="hidden sm:block w-px h-8 bg-white/5" />
        <div className="min-w-[88px]">
          <p className="text-white/30 text-xs mb-0.5">{t.expense}</p>
          <p className="text-red-400 font-bold text-sm">{sym}−{summary.expense.toLocaleString('en', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="hidden sm:block w-px h-8 bg-white/5" />
        <div className="min-w-[88px]">
          <p className="text-white/30 text-xs mb-0.5">{t.profit}</p>
          <p className={`font-bold text-sm ${summary.profit >= 0 ? 'text-mint' : 'text-red-400'}`}>
            {sym}{summary.profit >= 0 ? '+' : '−'}{Math.abs(summary.profit).toLocaleString('en', { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="hidden xl:block flex-1" />

        {/* Period toggle */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 overflow-x-auto scrollbar-none max-w-full">
          {PERIOD_KEYS.map(key => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                period === key ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {PERIOD_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none max-w-full">
          {['all', 'income', 'expense', 'transfer'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === type
                  ? type === 'income' ? 'bg-mint/20 text-mint'
                    : type === 'expense' ? 'bg-red-500/20 text-red-400'
                    : 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="5" cy="5" r="3.5"/><path d="M8 8l2 2"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.search}
            className="bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-mint/50 w-[min(15rem,calc(100vw-2rem))] sm:w-36"
          />
        </div>
      </div>

      {/* Table header */}
      <div className="hidden sm:grid min-w-[760px] grid-cols-[minmax(220px,1fr)_120px_120px_100px_100px] gap-4 px-6 py-2 border-b border-white/5 flex-shrink-0">
        {[t.description, t.category, t.account, t.date, t.amount].map(h => (
          <p key={h} className="text-white/30 text-xs font-semibold uppercase tracking-wider">{h}</p>
        ))}
      </div>

      {/* Transactions list */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-mint border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-white/20">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">{t.noTransactions}</p>
            <p className="text-xs mt-1">{t.noTransactionsSub}</p>
          </div>
        ) : (
          dateKeys.map(dateKey => (
            <div key={dateKey}>
              {/* Date separator */}
              <div className="px-6 py-2 bg-white/[0.02] border-b border-white/5">
                <p className="text-white/30 text-xs font-semibold">{formatDate(dateKey, lang)}</p>
              </div>
              {grouped[dateKey].map(tx => (
                <div
                  key={tx.id}
                  className="sm:grid sm:min-w-[760px] sm:grid-cols-[minmax(220px,1fr)_120px_120px_100px_100px] sm:gap-4 px-4 sm:px-6 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group cursor-pointer"
                >
                  {/* Description + type badge */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${typeBg[tx.type] || 'bg-white/5 text-white/40'}`}>
                      {t[tx.type] || tx.type}
                    </span>
                    <span className="text-white/80 text-xs truncate">{tx.description || t.description}</span>
                    {tx.comment && (
                      <span className="text-white/30 text-xs truncate hidden group-hover:block">{tx.comment}</span>
                    )}
                  </div>
                  {/* Category */}
                  <p className="text-white/40 text-xs truncate self-center mt-1 sm:mt-0">{tx.category || '—'}</p>
                  {/* Account */}
                  <p className="hidden sm:block text-white/40 text-xs truncate self-center">{accountName(tx.accountId)}</p>
                  {/* Date */}
                  <p className="hidden sm:block text-white/30 text-xs self-center">{formatDate(tx.date, lang)}</p>
                  {/* Amount */}
                  <p className={`mt-2 sm:mt-0 text-xs font-bold self-center sm:text-right ${typeColor[tx.type] || 'text-white/50'}`}>
                    {formatAmount(tx.amount, tx.type)}
                  </p>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
