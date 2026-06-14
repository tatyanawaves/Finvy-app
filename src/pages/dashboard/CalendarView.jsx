import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { getPlannedOperations } from '../../lib/plannedOperations'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  // Monday-based: Mon=0 ... Sun=6
  const d = new Date(year, month, 1).getDay()
  return (d + 6) % 7
}

const MONTH_NAMES = {
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  ru: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
  kz: ['Қаңтар','Ақпан','Наурыз','Сәуір','Мамыр','Маусым','Шілде','Тамыз','Қыркүйек','Қазан','Қараша','Желтоқсан'],
}

export default function CalendarView({ userId }) {
  const { t, lang } = useLanguage()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [txByDay, setTxByDay] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    fetchMonth()
  }, [year, month, userId])

  useEffect(() => {
    const refreshPlanned = () => fetchMonth()
    window.addEventListener('finvy:planned-payroll-updated', refreshPlanned)
    window.addEventListener('finvy:business-goals-updated', refreshPlanned)
    window.addEventListener('storage', refreshPlanned)
    return () => {
      window.removeEventListener('finvy:planned-payroll-updated', refreshPlanned)
      window.removeEventListener('finvy:business-goals-updated', refreshPlanned)
      window.removeEventListener('storage', refreshPlanned)
    }
  }, [year, month, userId])

  const fetchMonth = async () => {
    setLoading(true)
    const from = `${year}-${String(month + 1).padStart(2,'0')}-01`
    const lastDay = getDaysInMonth(year, month)
    const to   = `${year}-${String(month + 1).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}`

    const [txRes, plannedRows] = await Promise.all([
      supabase
      .from('transactions')
      .select('id, type, amount, date, description, category')
      .eq('user_id', userId)
      .gte('date', from)
      .lte('date', to),
      getPlannedOperations({ userId, from, to }),
    ])
    const data = txRes.data
    const plannedItems = plannedRows || []

    if (data) {
      const map = {}
      data.forEach(tx => {
        const day = parseInt(tx.date?.slice(8, 10))
        if (!map[day]) map[day] = { income: 0, expense: 0, plannedIncome: 0, plannedExpense: 0, items: [] }
        if (tx.type === 'income')  map[day].income  += Math.abs(tx.amount || 0)
        if (tx.type === 'expense') map[day].expense += Math.abs(tx.amount || 0)
        map[day].items.push(tx)
      })

      plannedItems.forEach(item => {
        if (!item.date) return
        const day = parseInt(item.date.slice(8, 10))
        if (!map[day]) map[day] = { income: 0, expense: 0, plannedIncome: 0, plannedExpense: 0, items: [] }
        if (item.type === 'income') map[day].plannedIncome += Math.abs(item.amount || 0)
        if (item.type === 'expense') map[day].plannedExpense += Math.abs(item.amount || 0)
        map[day].items.push(item)
      })

      setTxByDay(map)
    }
    setLoading(false)
  }

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }
  const goToday = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setSelectedDay(today.getDate())
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const monthNames = t.monthsNames || MONTH_NAMES[lang] || MONTH_NAMES.en

  // Build calendar grid (6 weeks max)
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  const selectedTx = selectedDay ? (txByDay[selectedDay]?.items || []) : []

  return (
    <div className="flex h-full overflow-hidden relative">
      {/* Calendar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">‹</button>
            <h2 className="text-white font-semibold text-sm min-w-[140px] text-center">
              {monthNames[month]} {year}
            </h2>
            <button onClick={nextMonth} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">›</button>
          </div>
          <button onClick={goToday} className="text-xs text-mint hover:text-mint/70 border border-mint/30 px-3 py-1 rounded-lg transition-colors">
            {t.today}
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/5 flex-shrink-0">
          {t.weekDays.map(d => (
            <div key={d} className="py-2 text-center text-white/30 text-xs font-semibold uppercase">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-6 h-6 border-2 border-mint border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 border-l border-t border-white/5">
              {cells.map((day, i) => {
                const data = day ? txByDay[day] : null
                const isSel = day === selectedDay
                const isTod = day && isToday(day)
                return (
                  <div
                    key={i}
                    onClick={() => day && setSelectedDay(isSel ? null : day)}
                    className={`border-r border-b border-white/5 min-h-[74px] sm:min-h-[80px] p-1 sm:p-1.5 transition-colors
                      ${day ? 'cursor-pointer' : 'bg-white/[0.01]'}
                      ${isSel ? 'bg-mint/5 border-mint/20' : day ? 'hover:bg-white/[0.03]' : ''}
                    `}
                  >
                    {day && (
                      <>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-semibold mb-1
                          ${isTod ? 'bg-mint text-dark' : isSel ? 'bg-white/10 text-white' : 'text-white/50'}`}>
                          {day}
                        </div>
                        {data && (
                          <div className="space-y-0.5">
                            {data.income > 0 && (
                              <div className="text-[10px] text-mint font-medium leading-tight truncate">
                                +{data.income.toLocaleString('en', { maximumFractionDigits: 0 })}
                              </div>
                            )}
                            {data.expense > 0 && (
                              <div className="text-[10px] text-red-400 font-medium leading-tight truncate">
                                −{data.expense.toLocaleString('en', { maximumFractionDigits: 0 })}
                              </div>
                            )}
                            {data.plannedIncome > 0 && (
                              <div className="text-[10px] text-[#4F8EF7] font-medium leading-tight truncate">
                                {t.planned || 'план'} +{data.plannedIncome.toLocaleString('en', { maximumFractionDigits: 0 })}
                              </div>
                            )}
                            {data.plannedExpense > 0 && (
                              <div className="text-[10px] text-amber-300 font-medium leading-tight truncate">
                                {t.planned || 'план'} −{data.plannedExpense.toLocaleString('en', { maximumFractionDigits: 0 })}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Side panel — selected day */}
      <div className={`fixed sm:static inset-x-0 bottom-0 z-30 sm:z-auto bg-[#111] sm:bg-transparent rounded-t-2xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-white/10 sm:border-white/5 flex-shrink-0 flex flex-col transition-all duration-200 overflow-hidden shadow-2xl sm:shadow-none
        ${selectedDay ? 'max-h-[56vh] sm:max-h-none sm:w-64' : 'max-h-0 sm:w-0'}`}>
        {selectedDay && (
          <>
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <p className="text-white font-semibold text-sm">
                {selectedDay} {monthNames[month]}
              </p>
              <button onClick={() => setSelectedDay(null)} className="text-white/30 hover:text-white text-lg leading-none">×</button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {selectedTx.length === 0 ? (
                <p className="text-white/30 text-xs text-center mt-8">{t.noData}</p>
              ) : (
                <div className="space-y-2">
                  {selectedTx.map(tx => (
                    <div key={tx.id} className="bg-white/5 rounded-lg px-3 py-2">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium
                          ${tx.planned ? 'bg-[#4F8EF7]/10 text-[#4F8EF7]' : tx.type === 'income' ? 'bg-mint/10 text-mint' : tx.type === 'expense' ? 'bg-red-500/10 text-red-400' : 'bg-white/10 text-white/40'}`}>
                          {tx.planned ? (t.planned || 'план') : t[tx.type]}
                        </span>
                        <span className={`text-xs font-bold ${tx.planned ? 'text-[#4F8EF7]' : tx.type === 'income' ? 'text-mint' : tx.type === 'expense' ? 'text-red-400' : 'text-white/50'}`}>
                          {tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : ''}
                          {Math.abs(tx.amount || 0).toLocaleString('en', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <p className="text-white/70 text-xs truncate">{tx.description || '—'}</p>
                      {tx.category && <p className="text-white/30 text-[10px] mt-0.5">{tx.category}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {txByDay[selectedDay] && (
              <div className="px-4 py-3 border-t border-white/5 flex-shrink-0 space-y-1">
                {txByDay[selectedDay].income > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">{t.income}</span>
                    <span className="text-mint font-medium">+{txByDay[selectedDay].income.toLocaleString()}</span>
                  </div>
                )}
                {txByDay[selectedDay].expense > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">{t.expense}</span>
                    <span className="text-red-400 font-medium">−{txByDay[selectedDay].expense.toLocaleString()}</span>
                  </div>
                )}
                {txByDay[selectedDay].plannedIncome > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">{t.plannedLabel || 'План'} {t.income}</span>
                    <span className="text-[#4F8EF7] font-medium">+{txByDay[selectedDay].plannedIncome.toLocaleString()}</span>
                  </div>
                )}
                {txByDay[selectedDay].plannedExpense > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">{t.plannedLabel || 'План'} {t.expense}</span>
                    <span className="text-amber-300 font-medium">−{txByDay[selectedDay].plannedExpense.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
