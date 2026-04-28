import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

const PERIODS = [
  { key: '3m' },
  { key: '6m' },
  { key: '12m' },
]

function getMonthsBack(n) {
  const result = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    result.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    })
  }
  return result
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-xs shadow-xl">
      <p className="text-white/60 mb-2 font-semibold">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="mb-1">
          {p.name}: <span className="font-bold">{p.value?.toLocaleString('en', { maximumFractionDigits: 0 })}</span>
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsView({ userId, refreshKey, demoData }) {
  const { t } = useLanguage()
  const [period, setPeriod] = useState('6m')
  const [chartData, setChartData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [totals, setTotals] = useState({ income: 0, expense: 0, profit: 0 })
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    const months = period === '3m' ? 3 : period === '6m' ? 6 : 12
    const monthsList = getMonthsBack(months)

    // From date
    const fromDate = new Date()
    fromDate.setDate(1)
    fromDate.setMonth(fromDate.getMonth() - (months - 1))
    fromDate.setHours(0, 0, 0, 0)

    let data
    if (demoData) {
      data = demoData.filter(tx =>
        tx.date >= fromDate.toISOString().slice(0, 10) &&
        (tx.type === 'income' || tx.type === 'expense')
      )
    } else {
      const res = await supabase
        .from('transactions')
        .select('type, amount, date, category')
        .eq('user_id', userId)
        .gte('date', fromDate.toISOString())
        .in('type', ['income', 'expense'])
      data = res.data
    }

    if (!data) { setLoading(false); return }

    // Build monthly chart data
    const monthMap = {}
    monthsList.forEach(m => { monthMap[m.key] = { ...m, income: 0, expense: 0, profit: 0 } })

    data.forEach(tx => {
      if (!tx.date) return
      const key = tx.date.slice(0, 7)
      if (!monthMap[key]) return
      if (tx.type === 'income') monthMap[key].income += Math.abs(tx.amount || 0)
      else if (tx.type === 'expense') monthMap[key].expense += Math.abs(tx.amount || 0)
    })

    const builtData = monthsList.map(m => ({
      ...monthMap[m.key],
      profit: (monthMap[m.key]?.income || 0) - (monthMap[m.key]?.expense || 0),
    }))

    setChartData(builtData)

    // Totals
    const inc = data.filter(t => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount || 0), 0)
    const exp = data.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount || 0), 0)
    setTotals({ income: inc, expense: exp, profit: inc - exp })

    // Category breakdown (expenses)
    const catMap = {}
    data.filter(tx => tx.type === 'expense').forEach(tx => {
      const cat = tx.category || '—'
      catMap[cat] = (catMap[cat] || 0) + Math.abs(tx.amount || 0)
    })
    const catArr = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
    setCategoryData(catArr)

    setLoading(false)
  }, [userId, period, refreshKey])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const maxCatValue = categoryData[0]?.value || 1

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white/80 text-sm font-semibold">{t.cashFlow}</h2>
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
            {PERIODS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setPeriod(opt.key)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  period === opt.key ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {opt.key === '3m' ? t.months3 : opt.key === '6m' ? t.months6 : t.months12}
              </button>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: t.totalIncome,   value: totals.income,  color: 'text-mint',     bg: 'bg-mint/5 border-mint/10' },
            { label: t.totalExpenses, value: totals.expense, color: 'text-red-400',  bg: 'bg-red-500/5 border-red-500/10' },
            { label: t.netProfit,     value: totals.profit,  color: totals.profit >= 0 ? 'text-mint' : 'text-red-400', bg: 'bg-white/5 border-white/5' },
          ].map(card => (
            <div key={card.label} className={`rounded-xl p-4 border ${card.bg}`}>
              <p className="text-white/40 text-xs mb-2">{card.label}</p>
              <p className={`text-2xl font-black ${card.color}`}>
                {card.value >= 0 ? '' : '−'}
                {Math.abs(card.value).toLocaleString('en', { maximumFractionDigits: 0 })}
              </p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-mint border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Bar chart: Income vs Expenses */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 mb-4">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">{t.incomeVsExpenses}</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar dataKey="income" name={t.totalIncome} fill="#4F8EF7" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="expense" name={t.totalExpenses} fill="rgba(239,68,68,0.7)" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line chart: Profit trend */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 mb-4">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">{t.profitTrend}</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name={t.netProfit}
                    stroke="#4F8EF7"
                    strokeWidth={2}
                    dot={{ fill: '#4F8EF7', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown */}
            {categoryData.length > 0 && (
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">{t.topCategories}</p>
                <div className="space-y-3">
                  {categoryData.map((cat, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/60 text-xs">{cat.name}</span>
                        <span className="text-white/60 text-xs font-medium">
                          {cat.value.toLocaleString('en', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-400/60 rounded-full"
                          style={{ width: `${(cat.value / maxCatValue) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
