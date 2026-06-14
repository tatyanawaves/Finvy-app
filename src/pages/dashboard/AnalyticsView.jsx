import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { getPlannedOperations } from '../../lib/plannedOperations'
import { buildCashflowForecast } from '../../lib/cashflowService'
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

const fmtMoney = (value) => {
  const symbol = window.finvyCurrencySymbol?.(window.finvyDefaultCurrency || 'KZT') || '₸';
  const formattedValue = Math.round(Math.abs(value || 0)).toLocaleString('ru-RU');
  return (symbol === '₸' || symbol === '₽') ? `${formattedValue} ${symbol}` : `${symbol}${formattedValue}`;
}

function CashflowForecastCard({ forecast, profileType = 'business', t }) {
  if (!forecast) return null
  const isPersonal = profileType === 'personal'
  const risk = forecast.riskLevel
  const isCritical = risk === 'critical'
  const isWarning = risk === 'warning'
  
  const statusLabel = isCritical
    ? (isPersonal ? (t.riskLowMoney || 'Риск нехватки денег') : (t.riskGap || 'Риск кассового разрыва'))
    : isWarning
      ? (t.riskLowLiquidity || 'Низкий запас ликвидности')
      : (t.riskNormalLiquidity || 'Запас ликвидности в норме')

  const statusClass = isCritical
    ? 'bg-red-500/10 text-red-300 border-red-500/20'
    : isWarning
      ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
      : 'bg-mint/10 text-mint border-mint/20'
  const spark = forecast.daily.filter((_, i) => i % 6 === 0 || i === forecast.daily.length - 1)
  const min = Math.min(...spark.map(d => d.balance), forecast.openingBalance)
  const max = Math.max(...spark.map(d => d.balance), forecast.openingBalance)
  const range = Math.max(1, max - min)
  const points = spark.map((d, i) => {
    const x = (i / Math.max(1, spark.length - 1)) * 100
    const y = 74 - ((d.balance - min) / range) * 58
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-[#4F8EF7]/15 bg-[#4F8EF7]/[0.055]">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-white">
              {isPersonal ? (t.forecastPersonalTitle || 'Личный прогноз на 60 дней') : (t.forecastBizTitle || 'Прогноз Cash Flow на 60 дней')}
            </h3>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClass}`}>
              {statusLabel}
            </span>
          </div>
          <p className="max-w-2xl text-xs leading-relaxed text-white/45">
            {isPersonal
              ? (t.forecastPersonalDesc || 'Считает будущий баланс с учетом текущих счетов, регулярных платежей и финансовых целей.')
              : (t.forecastBizDesc || 'Считает будущий баланс с учетом текущих счетов, ожидаемых инвойсов, ФОТ и резервов по бизнес-целям.')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            [t.balanceNow || 'Баланс сейчас', fmtMoney(forecast.openingBalance), 'text-[#4F8EF7]'],
            [t.incomePlan || 'План доходов', `+${fmtMoney(forecast.totalIncome)}`, 'text-mint'],
            [t.expensePlan || 'План расходов', `−${fmtMoney(forecast.totalExpense)}`, 'text-red-300'],
            [t.minBalance || 'Мин. остаток', fmtMoney(forecast.minBalance), forecast.minBalance < 0 ? 'text-red-300' : 'text-amber-300'],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-lg border border-white/5 bg-black/10 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{label}</p>
              <p className={`mt-1 whitespace-nowrap text-sm font-black tabular-nums ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/5 px-4 py-3">
        <svg viewBox="0 0 100 82" className="h-20 w-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="cashflowForecastLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4F8EF7" />
              <stop offset="100%" stopColor="#8DDCFF" />
            </linearGradient>
          </defs>
          <line x1="0" x2="100" y1="74" y2="74" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <polyline points={points} fill="none" stroke="url(#cashflowForecastLine)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {spark.map((d, i) => {
            const x = (i / Math.max(1, spark.length - 1)) * 100
            const y = 74 - ((d.balance - min) / range) * 58
            return <circle key={d.date} cx={x} cy={y} r="1.8" fill={d.balance < 0 ? '#f87171' : '#8DDCFF'} vectorEffect="non-scaling-stroke" />
          })}
        </svg>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/35">
          <span>{forecast.from}</span>
          <span>{t.minimum || 'Минимум'}: {forecast.minDate}</span>
          <span>{forecast.to}</span>
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsView({ userId, refreshKey, accounts = [], profileType = 'business' }) {
  const { t, lang } = useLanguage()
  const isPersonal = profileType === 'personal'
  const netLabel = isPersonal ? (t.netLabelPersonal || 'Остаток') : (t.netLabelBiz || t.netProfit)
  const [period, setPeriod] = useState('6m')
  const [includePlanned, setIncludePlanned] = useState(true)
  const [plannedAvailable, setPlannedAvailable] = useState(false)
  const [plannedRefreshKey, setPlannedRefreshKey] = useState(0)
  const [chartData, setChartData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [totals, setTotals] = useState({ income: 0, expense: 0, profit: 0 })
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const refreshPlanned = () => setPlannedRefreshKey(key => key + 1)
    window.addEventListener('finvy:planned-payroll-updated', refreshPlanned)
    window.addEventListener('finvy:business-goals-updated', refreshPlanned)
    window.addEventListener('storage', refreshPlanned)
    return () => {
      window.removeEventListener('finvy:planned-payroll-updated', refreshPlanned)
      window.removeEventListener('finvy:business-goals-updated', refreshPlanned)
      window.removeEventListener('storage', refreshPlanned)
    }
  }, [])

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    const months = period === '3m' ? 3 : period === '6m' ? 6 : 12
    const monthsList = getMonthsBack(months)

    // From date
    const fromDate = new Date()
    fromDate.setDate(1)
    fromDate.setMonth(fromDate.getMonth() - (months - 1))
    fromDate.setHours(0, 0, 0, 0)
    const toDate = new Date(monthsList[monthsList.length - 1].year, monthsList[monthsList.length - 1].month + 1, 0)
    const from = fromDate.toISOString().slice(0, 10)
    const to = toDate.toISOString().slice(0, 10)

    const res = await supabase
      .from('transactions')
      .select('type, amount, date, category')
      .eq('user_id', userId)
      .gte('date', from)
      .in('type', ['income', 'expense'])
    const data = res.data

    if (!data) { setLoading(false); return }

    const plannedTxs = await getPlannedOperations({ userId, from, to })
    setPlannedAvailable(plannedTxs.length > 0)

    const forecastFromDate = new Date()
    forecastFromDate.setHours(0, 0, 0, 0)
    const forecastToDate = new Date(forecastFromDate)
    forecastToDate.setDate(forecastToDate.getDate() + 60)
    const forecastFrom = forecastFromDate.toISOString().slice(0, 10)
    const forecastTo = forecastToDate.toISOString().slice(0, 10)
    const forecastPlanned = await getPlannedOperations({
      userId,
      from: forecastFrom,
      to: forecastTo,
    })
    setForecast(buildCashflowForecast({
      accounts,
      transactions: data,
      plannedOperations: forecastPlanned,
      horizonDays: 60,
      startDate: forecastFromDate,
    }))

    const analyticsData = includePlanned ? [...data, ...plannedTxs] : data

    // Build monthly chart data
    const monthMap = {}
    monthsList.forEach(m => { monthMap[m.key] = { ...m, income: 0, expense: 0, profit: 0 } })

    analyticsData.forEach(tx => {
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
    const inc = analyticsData.filter(t => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount || 0), 0)
    const exp = analyticsData.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount || 0), 0)
    setTotals({ income: inc, expense: exp, profit: inc - exp })

    // Category breakdown (expenses)
    const catMap = {}
    analyticsData.filter(tx => tx.type === 'expense').forEach(tx => {
      const cat = tx.planned ? `${tx.category || (t.salaryLabel || 'Зарплата')} ${t.planSuffix || '(план)'}` : (tx.category || '—')
      catMap[cat] = (catMap[cat] || 0) + Math.abs(tx.amount || 0)
    })
    const catArr = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
    setCategoryData(catArr)

    setLoading(false)
  }, [userId, period, refreshKey, includePlanned, plannedRefreshKey, accounts, t])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const maxCatValue = categoryData[0]?.value || 1

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 sm:px-6 py-4">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-white/80 text-sm font-semibold">{isPersonal ? (t.personalCashFlow || 'Личный денежный поток') : (t.bizCashFlow || t.cashFlow)}</h2>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {plannedAvailable && (
              <button
                onClick={() => setIncludePlanned(v => !v)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  includePlanned
                    ? 'bg-[#4F8EF7]/15 border-[#4F8EF7]/30 text-[#4F8EF7]'
                    : 'bg-white/5 border-white/10 text-white/35 hover:text-white/60'
                }`}
              >
                {t.planBtn || 'План'}
              </button>
            )}
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
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: t.totalIncome,   value: totals.income,  color: 'text-mint',     bg: 'bg-mint/5 border-mint/10' },
            { label: t.totalExpenses, value: totals.expense, color: 'text-red-400',  bg: 'bg-red-500/5 border-red-500/10' },
            { label: netLabel,     value: totals.profit,  color: totals.profit >= 0 ? 'text-mint' : 'text-red-400', bg: 'bg-white/5 border-white/5' },
          ].map(card => (
            <div key={card.label} className={`rounded-xl p-4 border ${card.bg}`}>
              <p className="text-white/40 text-xs mb-2">{card.label}</p>
              <p className={`text-2xl font-black ${card.color}`}>
                {card.value >= 0 ? '' : '−'}
                {Math.abs(card.value).toLocaleString(lang, { maximumFractionDigits: 0 })}
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
            <CashflowForecastCard forecast={forecast} profileType={profileType} t={t} />

            {/* Bar chart: Income vs Expenses */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 mb-4">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">{t.incomeVsExpenses}</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
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
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">{isPersonal ? (t.remTrend || 'Динамика остатка') : (t.profitTrend || 'Динамика прибыли')}</p>
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
                    name={netLabel}
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
                          {cat.value.toLocaleString(lang, { maximumFractionDigits: 0 })}
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
