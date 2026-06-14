import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'

const TAX_REGIMES = {
  simplified_ip:  { rate: 0.03, base: 'income', labelRu: 'Упрощёнка (ИП)', labelEn: 'Simplified (IE)', formRu: 'ф.910', formEn: 'Form 910' },
  simplified_too: { rate: 0.03, base: 'income', labelRu: 'Упрощёнка (ТОО)', labelEn: 'Simplified (LLC)', formRu: 'ф.910', formEn: 'Form 910' },
  general_ip:     { rate: 0.10, base: 'profit', labelRu: 'Общий (ИП)', labelEn: 'General (IE)', formRu: 'ф.220', formEn: 'Form 220' },
  general_too:    { rate: 0.20, base: 'profit', labelRu: 'Общий (ТОО, КПН)', labelEn: 'General (LLC, CIT)', formRu: 'ф.100', formEn: 'Form 100' },
}

// Tax deadlines for KZ (simplified = semi-annual, general = quarterly)
function getNextDeadline(regime) {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()

  if (regime.startsWith('simplified')) {
    // Simplified: semi-annual deadlines — Aug 15 (H1) and Feb 15 (H2)
    const deadlines = [
      new Date(y, 7, 15),  // Aug 15
      new Date(y + 1, 1, 15), // Feb 15 next year
    ]
    return deadlines.find(d => d > now) || deadlines[0]
  } else {
    // General: quarterly — May 15, Aug 15, Nov 15, Feb 15
    const deadlines = [
      new Date(y, 4, 15),  // May 15
      new Date(y, 7, 15),  // Aug 15
      new Date(y, 10, 15), // Nov 15
      new Date(y + 1, 1, 15), // Feb 15 next year
    ]
    return deadlines.find(d => d > now) || deadlines[0]
  }
}

function getPeriodLabel(regime, deadline, lang) {
  const m = deadline.getMonth()
  if (regime.startsWith('simplified')) {
    return m === 7
      ? (lang === 'en' ? '1st half-year' : '1-е полугодие')
      : (lang === 'en' ? '2nd half-year' : '2-е полугодие')
  }
  const qMap = { 4: 'Q1', 7: 'Q2', 10: 'Q3', 1: 'Q4' }
  return qMap[m] || ''
}

function getPeriodDates(regime, deadline) {
  const y = deadline.getFullYear()
  const m = deadline.getMonth()

  if (regime.startsWith('simplified')) {
    if (m === 7) return { from: `${y}-01-01`, to: `${y}-06-30` }
    return { from: `${y - 1}-07-01`, to: `${y - 1}-12-31` }
  }
  // General quarterly
  const qStarts = { 4: `${y}-01-01`, 7: `${y}-04-01`, 10: `${y}-07-01`, 1: `${y - 1}-10-01` }
  const qEnds = { 4: `${y}-03-31`, 7: `${y}-06-30`, 10: `${y}-09-30`, 1: `${y - 1}-12-31` }
  return { from: qStarts[m], to: qEnds[m] }
}

export default function TaxWidget({ userId, currency }) {
  const { lang, t } = useLanguage()
  const [regime, setRegime] = useState('simplified_ip')
  const [income, setIncome] = useState(0)
  const [expense, setExpense] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  const TAX_REGIMES = {
    simplified_ip:  { rate: 0.03, base: 'income', label: t.taxSimplifiedIP || 'Simplified (IE)', form: 'ф.910' },
    simplified_too: { rate: 0.03, base: 'income', label: t.taxSimplifiedTOO || 'Simplified (LLC)', form: 'ф.910' },
    general_ip:     { rate: 0.10, base: 'profit', label: t.taxGeneralIP || 'General (IE)', form: 'ф.220' },
    general_too:    { rate: 0.20, base: 'profit', label: t.taxGeneralTOO || 'General (LLC, CIT)', form: 'ф.100' },
  }

  function getPeriodLabel(regime, deadline) {
    const m = deadline.getMonth()
    if (regime.startsWith('simplified')) {
      return m === 7
        ? (t.taxHalf1 || '1st half-year')
        : (t.taxHalf2 || '2nd half-year')
    }
    const qMap = { 4: 'Q1', 7: 'Q2', 10: 'Q3', 1: 'Q4' }
    return qMap[m] || ''
  }

  useEffect(() => {
    loadData()
  }, [userId, regime])

  async function loadData() {
    setLoading(true)

    let userRegime = 'simplified_ip'
    const { data: settings } = await supabase
      .from('fm_settings')
      .select('tax_regime')
      .eq('user_id', userId)
      .maybeSingle()
    userRegime = settings?.tax_regime || 'simplified_ip'
    setRegime(userRegime)

    // Calculate income/expense for current period
    const deadline = getNextDeadline(userRegime)
    const { from, to } = getPeriodDates(userRegime, deadline)

    const res = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .gte('date', from)
      .lte('date', to)
    const txs = res.data

    let inc = 0, exp = 0
    if (txs) {
      for (const tx of txs) {
        if (tx.type === 'income') inc += Math.abs(tx.amount)
        if (tx.type === 'expense') exp += Math.abs(tx.amount)
      }
    }
    setIncome(inc)
    setExpense(exp)
    setLoading(false)
  }

  async function saveRegime(newRegime) {
    setRegime(newRegime)
    setEditing(false)
    await supabase.from('fm_settings').upsert({
      user_id: userId,
      tax_regime: newRegime,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    loadData()
  }

  const regimeInfo = TAX_REGIMES[regime]
  const deadline = getNextDeadline(regime)
  const periodLabel = getPeriodLabel(regime, deadline)
  const profit = income - expense
  const taxBase = regimeInfo.base === 'income' ? income : Math.max(0, profit)
  const taxAmount = Math.round(taxBase * regimeInfo.rate)
  const daysLeft = Math.max(0, Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)))

  const fmt = (n) => {
    const sym = { USD: '$', EUR: '€', KZT: '₸', UAH: '₴', GBP: '£' }[currency] || currency
    return `${sym} ${n.toLocaleString(lang === 'kz' ? 'kk-KZ' : (lang === 'ru' ? 'ru-RU' : 'en-US'))}`
  }

  if (loading) {
    return (
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-mint border-t-transparent rounded-full animate-spin" />
          <span className="text-white/30 text-xs">{t.taxLoading || 'Loading taxes...'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🧾</span>
          <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">
            {t.taxes || 'Taxes'}
          </span>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="text-white/30 hover:text-white/60 text-xs transition-colors"
        >
          {t.taxChangeRegime || 'Change regime'}
        </button>
      </div>

      {/* Regime selector */}
      {editing && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {Object.entries(TAX_REGIMES).map(([key, info]) => (
            <button
              key={key}
              onClick={() => saveRegime(key)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                regime === key
                  ? 'bg-mint/20 text-mint border border-mint/30'
                  : 'bg-white/5 text-white/40 border border-white/5 hover:text-white/70'
              }`}
            >
              {info.label}
            </button>
          ))}
        </div>
      )}

      {/* Current regime badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">
          {regimeInfo.label}
        </span>
        <span className="text-[10px] text-white/30">
          {periodLabel}
        </span>
      </div>

      {/* Tax calculation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-xs">{t.taxPeriodIncome || 'Period income'}</span>
          <span className="text-white/70 text-xs font-medium">{fmt(income)}</span>
        </div>

        {regimeInfo.base === 'profit' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs">{t.taxPeriodExpense || 'Period expense'}</span>
              <span className="text-white/70 text-xs font-medium">{fmt(expense)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs">{t.taxProfit || 'Profit'}</span>
              <span className={`text-xs font-medium ${profit >= 0 ? 'text-mint' : 'text-red-400'}`}>
                {fmt(profit)}
              </span>
            </div>
          </>
        )}

        <div className="h-px bg-white/5 my-1" />

        <div className="flex items-center justify-between">
          <span className="text-white/50 text-xs font-medium">
            {`${t.taxLabel || 'Tax'} (${(regimeInfo.rate * 100)}%)`}
          </span>
          <span className="text-white text-sm font-bold">{fmt(taxAmount)}</span>
        </div>

        {/* Deadline warning */}
        <div className={`flex items-center gap-2 mt-2 px-2.5 py-2 rounded-lg ${
          daysLeft <= 14 ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/[0.03] border border-white/5'
        }`}>
          <span className="text-sm">{daysLeft <= 14 ? '⚠️' : '📅'}</span>
          <div className="flex-1">
            <p className={`text-[10px] font-medium ${daysLeft <= 14 ? 'text-red-400' : 'text-white/50'}`}>
              {`${t.taxDeadlineLabel || 'Deadline'} ${regimeInfo.form}: ${deadline.toLocaleDateString(lang === 'kz' ? 'kk-KZ' : (lang === 'ru' ? 'ru-RU' : 'en-US'))}`}
            </p>
            <p className="text-[10px] text-white/30">
              {daysLeft === 0
                ? (t.taxToday || 'Today!')
                : `${daysLeft} ${daysLeft === 1 ? (t.taxDayLeft || 'day left') : (t.taxDaysLeft || 'days left')}`}
            </p>
          </div>
        </div>

        {/* Advice */}
        {taxAmount > 0 && (
          <p className="text-[10px] text-white/30 mt-1">
            {t.taxAdvice?.replace('{amount}', fmt(taxAmount)) || `💡 Set aside ${fmt(taxAmount)} in advance to avoid penalties`}
          </p>
        )}
      </div>
    </div>
  )
}
