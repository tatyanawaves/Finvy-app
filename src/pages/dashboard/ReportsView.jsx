import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import CashbackReportModal from './CashbackReportModal'
import ImportStatementModal from './ImportStatementModal'

const PRESET_KEYS = ['this_month', 'last_month', 'this_quarter', 'this_year', 'custom']

function getPresetDates(key) {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth()
  if (key === 'this_month') {
    return {
      from: new Date(y, m, 1).toISOString().slice(0, 10),
      to: new Date(y, m + 1, 0).toISOString().slice(0, 10),
    }
  }
  if (key === 'last_month') {
    return {
      from: new Date(y, m - 1, 1).toISOString().slice(0, 10),
      to: new Date(y, m, 0).toISOString().slice(0, 10),
    }
  }
  if (key === 'this_quarter') {
    const q = Math.floor(m / 3)
    return {
      from: new Date(y, q * 3, 1).toISOString().slice(0, 10),
      to: new Date(y, q * 3 + 3, 0).toISOString().slice(0, 10),
    }
  }
  if (key === 'this_year') {
    return {
      from: new Date(y, 0, 1).toISOString().slice(0, 10),
      to: new Date(y, 11, 31).toISOString().slice(0, 10),
    }
  }
  return null
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-xs shadow-xl">
      <p className="text-white/60 mb-2 font-semibold">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill }} className="mb-1">
          {p.name}: <span className="font-bold">{p.value?.toLocaleString('en', { maximumFractionDigits: 0 })}</span>
        </p>
      ))}
    </div>
  )
}

export default function ReportsView({ userId, profileType = 'business' }) {
  const { t, lang } = useLanguage()
  const isPersonal = profileType === 'personal'
  const netLabel = isPersonal ? (t.netLabelPersonal || 'Остаток') : t.reportProfit
  const [showCashback, setShowCashback] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const PRESET_PERIODS = [
    { key: 'this_month',   label: t.thisMonth },
    { key: 'last_month',   label: t.lastMonth },
    { key: 'this_quarter', label: t.thisQuarter },
    { key: 'this_year',    label: t.thisYear },
    { key: 'custom',       label: t.custom },
  ]
  const [preset, setPreset] = useState('this_month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [data, setData] = useState([])
  const [summary, setSummary] = useState({ income: 0, expense: 0, profit: 0, count: 0 })
  const [catData, setCatData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReport = useCallback(async () => {
    const dates = preset === 'custom'
      ? (customFrom && customTo ? { from: customFrom, to: customTo } : null)
      : getPresetDates(preset)

    if (!dates) { setLoading(false); return }

    setLoading(true)

    const { data: txs } = await supabase
      .from('transactions')
      .select('type, amount, date, category')
      .eq('user_id', userId)
      .gte('date', dates.from + 'T00:00:00')
      .lte('date', dates.to + 'T23:59:59')
      .in('type', ['income', 'expense'])

    if (!txs) { setLoading(false); return }

    const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount || 0), 0)
    const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount || 0), 0)
    setSummary({ income: inc, expense: exp, profit: inc - exp, count: txs.length })

    // Group by category
    const catMap = {}
    txs.forEach(tx => {
      const cat = tx.category || (t.noCategory || '—')
      if (!catMap[cat]) catMap[cat] = { name: cat, income: 0, expense: 0 }
      if (tx.type === 'income') catMap[cat].income += Math.abs(tx.amount || 0)
      else catMap[cat].expense += Math.abs(tx.amount || 0)
    })
    const catArr = Object.values(catMap)
      .map(c => ({ ...c, total: c.income + c.expense }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
    setCatData(catArr)

    // Daily breakdown
    const dayMap = {}
    txs.forEach(tx => {
      const day = tx.date?.slice(0, 10) || 'Unknown'
      if (!dayMap[day]) dayMap[day] = { date: day, income: 0, expense: 0 }
      if (tx.type === 'income') dayMap[day].income += Math.abs(tx.amount || 0)
      else dayMap[day].expense += Math.abs(tx.amount || 0)
    })
    const dayArr = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({ ...d, label: new Date(d.date).toLocaleDateString(lang, { month: 'short', day: 'numeric' }) }))
    setData(dayArr)

    setLoading(false)
  }, [userId, preset, customFrom, customTo, lang, t])

  useEffect(() => { fetchReport() }, [fetchReport])

  const exportCsv = () => {
    const rows = [['Date','Type','Category','Amount']]
    // We just export summary by category
    catData.forEach(c => {
      if (c.income > 0) rows.push([c.name, 'income', c.name, c.income])
      if (c.expense > 0) rows.push([c.name, 'expense', c.name, c.expense])
    })
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `report-${preset}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const exportPdf = () => window.print()

  return (
    <>
    <div className="h-full overflow-y-auto">
      <div className="px-4 sm:px-6 py-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
          <h2 className="text-white/80 text-sm font-semibold">{t.reports}</h2>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
            {/* Import statement CTA */}
            <button
              onClick={() => setShowImport(true)}
              className="flex-shrink-0 bg-[#4F8EF7]/10 hover:bg-[#4F8EF7]/20 border border-[#4F8EF7]/25 text-[#4F8EF7] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>📄</span>
              {t.importStatement}
            </button>
            {/* Cashback report CTA */}
            {lang !== 'en' && (
              <button
                onClick={() => setShowCashback(true)}
                className="flex-shrink-0 bg-mint/10 hover:bg-mint/20 border border-mint/25 text-mint text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>💳</span>
                {t.cashbackAnalysis}
              </button>
            )}
            <div className="w-px h-4 bg-white/10 flex-shrink-0" />
            <button onClick={exportCsv} className="flex-shrink-0 text-white/50 hover:text-white border border-white/10 hover:border-white/20 text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 9h8M6 1v6M3.5 5l2.5 2.5L9 5"/></svg>
              {t.exportCsv}
            </button>
            <button onClick={exportPdf} className="flex-shrink-0 text-white/50 hover:text-white border border-white/10 hover:border-white/20 text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="10" height="10" rx="1"/><path d="M4 4h4M4 6h4M4 8h2"/></svg>
              {t.exportPdf}
            </button>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 overflow-x-auto scrollbar-none max-w-full">
            {PRESET_PERIODS.map(p => (
              <button key={p.key} onClick={() => setPreset(p.key)}
                className={`flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  preset === p.key ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
                }`}>
                {p.label}
              </button>
            ))}
          </div>
          {preset === 'custom' && (
            <div className="flex items-center gap-2">
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white [color-scheme:dark] focus:outline-none focus:border-mint/40" />
              <span className="text-white/30 text-xs">—</span>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white [color-scheme:dark] focus:outline-none focus:border-mint/40" />
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-mint border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
              {[
                { label: t.reportIncome,  value: summary.income,  color: 'text-mint',    bg: 'bg-mint/5 border-mint/10' },
                { label: t.reportExpense, value: summary.expense, color: 'text-red-400', bg: 'bg-red-500/5 border-red-500/10' },
                { label: netLabel,  value: summary.profit,  color: summary.profit >= 0 ? 'text-mint' : 'text-red-400', bg: 'bg-white/5 border-white/5' },
                { label: t.reportTxCount, value: summary.count,   color: 'text-white/70', bg: 'bg-white/5 border-white/5', plain: true },
              ].map(card => (
                <div key={card.label} className={`rounded-xl p-4 border ${card.bg}`}>
                  <p className="text-white/40 text-xs mb-2">{card.label}</p>
                  <p className={`text-2xl font-black ${card.color}`}>
                    {card.plain ? card.value : (
                      <>
                        {card.value >= 0 ? '' : '−'}
                        {Math.abs(card.value).toLocaleString(lang, { maximumFractionDigits: 0 })}
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>

            {summary.count === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-white/20">
                <p className="text-4xl mb-3">📊</p>
                <p className="text-sm">{t.noReportData}</p>
              </div>
            ) : (
              <>
                {/* Daily bar chart */}
                {data.length > 1 && (
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 mb-4">
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">{t.dailyBreakdown}</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={data} barCategoryGap="30%" barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false}
                          tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Bar dataKey="income" name={t.reportIncome} fill="#4F8EF7" radius={[3,3,0,0]} maxBarSize={28} />
                        <Bar dataKey="expense" name={t.reportExpense} fill="rgba(239,68,68,0.7)" radius={[3,3,0,0]} maxBarSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Category breakdown table */}
                {catData.length > 0 && (
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 sm:p-5 overflow-x-auto">
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">{t.reportByCategory}</p>
                    <div className="space-y-0 min-w-[560px]">
                      {/* Header */}
                      <div className="grid grid-cols-[1fr_100px_100px_100px] gap-4 pb-2 border-b border-white/5 mb-1">
                        {[t.category, t.reportIncome, t.reportExpense, netLabel].map(h => (
                          <p key={h} className="text-white/30 text-xs font-semibold uppercase tracking-wider">{h}</p>
                        ))}
                      </div>
                      {catData.map((cat, i) => (
                        <div key={i} className="grid grid-cols-[1fr_100px_100px_100px] gap-4 py-2.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                          <p className="text-white/70 text-xs font-medium">{cat.name}</p>
                          <p className="text-mint text-xs font-medium">{cat.income > 0 ? '+' + cat.income.toLocaleString(lang, { maximumFractionDigits: 0 }) : '—'}</p>
                          <p className="text-red-400 text-xs font-medium">{cat.expense > 0 ? '−' + cat.expense.toLocaleString(lang, { maximumFractionDigits: 0 }) : '—'}</p>
                          <p className={`text-xs font-medium ${(cat.income - cat.expense) >= 0 ? 'text-mint' : 'text-red-400'}`}>
                            {(cat.income - cat.expense) >= 0 ? '+' : '−'}
                            {Math.abs(cat.income - cat.expense).toLocaleString(lang, { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>

    {showCashback && (
      <CashbackReportModal
        userId={userId}
        onClose={() => setShowCashback(false)}
      />
    )}
    {showImport && (
      <ImportStatementModal
        userId={userId}
        onImported={fetchReport}
        onClose={() => setShowImport(false)}
      />
    )}
    </>
  )
}
