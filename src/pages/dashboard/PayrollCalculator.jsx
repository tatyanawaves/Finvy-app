import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'

const MZP = 85_000
const MRP = 3_932
const IPN_DEDUCTION = 14 * MRP

const RATES = {
  opv: 0.10,
  vosms: 0.02,
  ipn: 0.10,
  so: 0.035,
  osms: 0.03,
  oppv: 0.015,
}

const DEFAULT_EMPLOYEES = [
  { id: 'owner', name: 'Айгерим', role: 'Руководитель', gross: 420000, active: true },
  { id: 'manager', name: 'Данияр', role: 'Менеджер', gross: 320000, active: true },
  { id: 'accountant', name: 'Мадина', role: 'Бухгалтер', gross: 280000, active: true },
]

function calcFromGross(gross) {
  const amount = Math.max(0, Math.round(gross || 0))
  const opv = Math.round(amount * RATES.opv)
  const vosms = Math.round(amount * RATES.vosms)
  const ipnBase = Math.max(0, amount - opv - vosms - IPN_DEDUCTION)
  const ipn = Math.round(ipnBase * RATES.ipn)
  const net = amount - opv - vosms - ipn
  const so = Math.round(Math.max(amount * RATES.so, MZP * RATES.so))
  const osms = Math.round(amount * RATES.osms)
  const oppv = Math.round(amount * RATES.oppv)
  const employer = so + osms + oppv
  const cost = amount + employer

  return { gross: amount, opv, vosms, ipnBase, ipn, net, so, osms, oppv, employer, cost }
}

function calcFromNet(net) {
  let lo = Math.max(0, Math.round(net || 0))
  let hi = Math.max(lo * 2, 1)
  for (let i = 0; i < 60; i++) {
    const mid = Math.round((lo + hi) / 2)
    const result = calcFromGross(mid)
    if (result.net === net) return result
    if (result.net < net) lo = mid + 1
    else hi = mid - 1
  }
  return calcFromGross(Math.round((lo + hi) / 2))
}

const toNumber = (value) => parseInt(String(value || '').replace(/\D/g, ''), 10) || 0

export default function PayrollCalculator({ userId = 'demo', currency = 'KZT', onPlannedChange }) {
  const { lang } = useLanguage()
  const isRu = lang !== 'en'
  const [employees, setEmployees] = useState(DEFAULT_EMPLOYEES)
  const [selectedId, setSelectedId] = useState(DEFAULT_EMPLOYEES[0].id)
  const [mode, setMode] = useState('gross')
  const [notice, setNotice] = useState('')

  const employeeKey = `finvy_payroll_employees_${userId}`
  const planKey = `finvy_planned_payroll_${userId}`

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(employeeKey) || 'null')
      if (Array.isArray(saved) && saved.length) {
        setEmployees(saved)
        setSelectedId(saved[0].id)
      }
    } catch {}
  }, [employeeKey])

  useEffect(() => {
    localStorage.setItem(employeeKey, JSON.stringify(employees))
  }, [employeeKey, employees])

  const activeEmployees = employees.filter(e => e.active)
  const rows = activeEmployees.map(employee => ({
    employee,
    result: calcFromGross(employee.gross),
  }))

  const totals = rows.reduce((acc, row) => {
    Object.keys(acc).forEach(key => { acc[key] += row.result[key] || 0 })
    return acc
  }, { gross: 0, opv: 0, vosms: 0, ipn: 0, net: 0, so: 0, osms: 0, oppv: 0, employer: 0, cost: 0 })

  const selected = employees.find(e => e.id === selectedId) || employees[0]
  const selectedResult = selected ? calcFromGross(selected.gross) : null
  const payrollShareHint = totals.cost > 0 ? Math.round((totals.employer / totals.cost) * 100) : 0

  const fmt = (n) => {
    const sym = { USD: '$', EUR: '€', KZT: '₸', UAH: '₴', GBP: '£' }[currency] || currency
    return `${sym} ${Math.round(n || 0).toLocaleString('ru-RU')}`
  }

  const updateEmployee = (id, patch) => {
    setEmployees(prev => prev.map(employee => employee.id === id ? { ...employee, ...patch } : employee))
  }

  const addEmployee = () => {
    const id = `emp-${Date.now()}`
    const next = { id, name: isRu ? 'Новый сотрудник' : 'New employee', role: isRu ? 'Должность' : 'Role', gross: 250000, active: true }
    setEmployees(prev => [...prev, next])
    setSelectedId(id)
  }

  const removeEmployee = (id) => {
    setEmployees(prev => {
      const next = prev.filter(employee => employee.id !== id)
      if (selectedId === id && next[0]) setSelectedId(next[0].id)
      return next.length ? next : DEFAULT_EMPLOYEES
    })
  }

  const saveAsPlannedExpense = () => {
    const today = new Date()
    const planned = {
      source: 'payroll',
      category: isRu ? 'Зарплата' : 'Payroll',
      description: isRu ? 'Плановый фонд оплаты труда' : 'Planned payroll',
      amount: totals.cost,
      net: totals.net,
      gross: totals.gross,
      employer: totals.employer,
      date: new Date(today.getFullYear(), today.getMonth(), 25).toISOString().slice(0, 10),
      repeat: 'monthly',
      employeeCount: activeEmployees.length,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(planKey, JSON.stringify(planned))
    window.dispatchEvent(new CustomEvent('finvy:planned-payroll-updated', { detail: planned }))
    onPlannedChange?.(planned)
    setNotice(isRu ? 'ФОТ добавлен в аналитику как плановый расход' : 'Payroll added to analytics as a planned expense')
    window.setTimeout(() => setNotice(''), 3500)
  }

  const scenario = useMemo(() => {
    const plus10 = activeEmployees.reduce((sum, employee) => sum + calcFromGross(Math.round(employee.gross * 1.1)).cost, 0)
    const newHire = calcFromGross(300000).cost
    return {
      raise10: plus10 - totals.cost,
      newHire,
      monthAfterRaise: plus10,
    }
  }, [activeEmployees, totals.cost])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: isRu ? 'На руки' : 'Net', value: totals.net, tone: 'text-mint', bg: 'bg-mint/5 border-mint/10' },
          { label: isRu ? 'Начислено' : 'Gross', value: totals.gross, tone: 'text-white', bg: 'bg-white/[0.04] border-white/10' },
          { label: isRu ? 'Налоги и взносы' : 'Taxes and contributions', value: totals.opv + totals.vosms + totals.ipn + totals.employer, tone: 'text-[#4F8EF7]', bg: 'bg-[#4F8EF7]/5 border-[#4F8EF7]/15' },
          { label: isRu ? 'Расход компании' : 'Company cost', value: totals.cost, tone: 'text-white', bg: 'bg-white/[0.04] border-white/10' },
        ].map(card => (
          <div key={card.label} className={`rounded-2xl border p-4 ${card.bg}`}>
            <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-2">{card.label}</p>
            <p className={`${card.tone} text-lg sm:text-xl font-black break-words`}>{fmt(card.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-4">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-white text-sm font-semibold">{isRu ? 'Команда' : 'Team'}</h3>
              <p className="text-white/30 text-xs mt-0.5">
                {isRu ? `${activeEmployees.length} активных сотрудников` : `${activeEmployees.length} active employees`}
              </p>
            </div>
            <button onClick={addEmployee} className="w-full sm:w-auto bg-[#4F8EF7] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#4F8EF7]/90 transition-colors">
              + {isRu ? 'Сотрудник' : 'Employee'}
            </button>
          </div>

          <div className="space-y-2">
            {employees.map(employee => {
              const result = calcFromGross(employee.gross)
              const active = employee.id === selectedId
              return (
                <button
                  key={employee.id}
                  onClick={() => setSelectedId(employee.id)}
                  className={`w-full text-left rounded-xl border p-3 transition-colors ${
                    active ? 'bg-[#4F8EF7]/10 border-[#4F8EF7]/30' : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${employee.active ? 'bg-[#4F8EF7]/15 text-[#4F8EF7]' : 'bg-white/5 text-white/25'}`}>
                      {employee.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <input
                          value={employee.name}
                          onClick={e => e.stopPropagation()}
                          onChange={e => updateEmployee(employee.id, { name: e.target.value })}
                          className="min-w-0 flex-1 bg-transparent text-white/80 text-xs font-semibold outline-none"
                        />
                        <label onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-[10px] text-white/35">
                          <input type="checkbox" checked={employee.active} onChange={e => updateEmployee(employee.id, { active: e.target.checked })} />
                          {isRu ? 'активен' : 'active'}
                        </label>
                      </div>
                      <input
                        value={employee.role}
                        onClick={e => e.stopPropagation()}
                        onChange={e => updateEmployee(employee.id, { role: e.target.value })}
                        className="w-full bg-transparent text-white/30 text-[11px] outline-none mt-0.5"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                        <div>
                          <p className="text-white/25 text-[10px] mb-1">{isRu ? 'Начислено' : 'Gross'}</p>
                          <input
                            inputMode="numeric"
                            value={employee.gross.toLocaleString('ru-RU')}
                            onClick={e => e.stopPropagation()}
                            onChange={e => updateEmployee(employee.id, { gross: toNumber(e.target.value) })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white/70 text-xs outline-none focus:border-[#4F8EF7]/40"
                          />
                        </div>
                        <div>
                          <p className="text-white/25 text-[10px] mb-1">{isRu ? 'На руки' : 'Net'}</p>
                          <p className="text-mint text-xs font-bold py-1.5">{fmt(result.net)}</p>
                        </div>
                        <div>
                          <p className="text-white/25 text-[10px] mb-1">{isRu ? 'Стоимость' : 'Cost'}</p>
                          <p className="text-white/70 text-xs font-bold py-1.5">{fmt(result.cost)}</p>
                        </div>
                      </div>
                    </div>
                    <span
                      onClick={e => { e.stopPropagation(); removeEmployee(employee.id) }}
                      className="text-white/20 hover:text-red-400 text-xs px-1"
                    >
                      ×
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-white text-sm font-semibold">{isRu ? 'Подробный расчет' : 'Detailed calculation'}</h3>
                <p className="text-white/30 text-xs mt-0.5">{selected?.name || '—'} · {selected?.role || '—'}</p>
              </div>
              <div className="flex w-full sm:w-auto items-center gap-1 bg-white/5 rounded-lg p-0.5">
                {['gross', 'net'].map(key => (
                  <button
                    key={key}
                    onClick={() => setMode(key)}
                    className={`flex-1 sm:flex-none px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors ${mode === key ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white/60'}`}
                  >
                    {key === 'gross' ? (isRu ? 'От начисл.' : 'Gross') : (isRu ? 'От рук' : 'Net')}
                  </button>
                ))}
              </div>
            </div>

            {selected && selectedResult && (
              <div className="space-y-2">
                {mode === 'net' && (
                  <NetReverseCalculator isRu={isRu} fmt={fmt} onApply={gross => updateEmployee(selected.id, { gross })} />
                )}

                <PayrollLine label={isRu ? 'Начислено' : 'Gross salary'} value={selectedResult.gross} fmt={fmt} strong />
                <div className="h-px bg-white/5 my-2" />
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider">{isRu ? 'Удержания с сотрудника' : 'Employee deductions'}</p>
                <PayrollLine label="ОПВ 10%" value={selectedResult.opv} fmt={fmt} />
                <PayrollLine label="ВОСМС 2%" value={selectedResult.vosms} fmt={fmt} />
                <PayrollLine label={isRu ? 'Вычет 14 МРП' : '14 MCI deduction'} value={IPN_DEDUCTION} fmt={fmt} muted />
                <PayrollLine label={isRu ? 'База ИПН' : 'IIT base'} value={selectedResult.ipnBase} fmt={fmt} muted />
                <PayrollLine label="ИПН 10%" value={selectedResult.ipn} fmt={fmt} />
                <PayrollLine label={isRu ? 'На руки' : 'Net salary'} value={selectedResult.net} fmt={fmt} strong tone="text-mint" />
                <div className="h-px bg-white/5 my-2" />
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider">{isRu ? 'За счет работодателя' : 'Employer contributions'}</p>
                <PayrollLine label="СО 3.5%" value={selectedResult.so} fmt={fmt} />
                <PayrollLine label="ОСМС 3%" value={selectedResult.osms} fmt={fmt} />
                <PayrollLine label="ОППВ 1.5%" value={selectedResult.oppv} fmt={fmt} />
                <PayrollLine label={isRu ? 'Полная стоимость сотрудника' : 'Total employee cost'} value={selectedResult.cost} fmt={fmt} strong tone="text-white" />
              </div>
            )}
          </div>

          <div className="bg-[#4F8EF7]/[0.06] border border-[#4F8EF7]/15 rounded-2xl p-4">
            <h3 className="text-white text-sm font-semibold mb-3">{isRu ? 'Влияние на бизнес' : 'Business impact'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="bg-white/[0.04] rounded-xl p-3">
                <p className="text-white/30 text-[10px] mb-1">{isRu ? 'Нагрузка работодателя' : 'Employer load'}</p>
                <p className="text-[#4F8EF7] text-lg font-black">{payrollShareHint}%</p>
              </div>
              <div className="bg-white/[0.04] rounded-xl p-3">
                <p className="text-white/30 text-[10px] mb-1">{isRu ? '+10% к окладам' : '+10% salaries'}</p>
                <p className="text-white text-lg font-black">+{fmt(scenario.raise10)}</p>
              </div>
              <div className="bg-white/[0.04] rounded-xl p-3 sm:col-span-2">
                <p className="text-white/30 text-[10px] mb-1">{isRu ? 'Новый сотрудник с окладом 300 000' : 'New hire with 300,000 gross'}</p>
                <p className="text-white text-lg font-black">{fmt(scenario.newHire)} / {isRu ? 'мес.' : 'mo'}</p>
              </div>
            </div>
            <button
              onClick={saveAsPlannedExpense}
              disabled={totals.cost <= 0}
              className="w-full bg-[#4F8EF7] disabled:opacity-40 text-white text-sm font-bold py-3 rounded-xl hover:bg-[#4F8EF7]/90 transition-colors"
            >
              {isRu ? 'Добавить ФОТ в аналитику' : 'Add payroll to analytics'}
            </button>
            {notice && <p className="text-mint text-xs mt-3">{notice}</p>}
            <p className="text-white/25 text-[10px] leading-relaxed mt-3">
              {isRu
                ? `Расчеты используют МЗП ${MZP.toLocaleString('ru-RU')}₸ и МРП ${MRP.toLocaleString('ru-RU')}₸. Перед реальной выплатой проверьте актуальные правила.`
                : `Calculations use min wage ${MZP.toLocaleString('ru-RU')}₸ and MCI ${MRP.toLocaleString('ru-RU')}₸. Verify current rules before real payroll.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PayrollLine({ label, value, fmt, strong, muted, tone = 'text-white/60' }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={`${muted ? 'text-white/25' : 'text-white/40'} text-xs`}>{label}</span>
      <span className={`${strong ? `${tone} font-bold` : 'text-white/50'} text-xs`}>{fmt(value)}</span>
    </div>
  )
}

function NetReverseCalculator({ isRu, fmt, onApply }) {
  const [net, setNet] = useState('')
  const result = calcFromNet(toNumber(net))

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 mb-3">
      <p className="text-white/35 text-[10px] font-bold uppercase tracking-wider mb-2">
        {isRu ? 'Подбор оклада от суммы на руки' : 'Find gross from net'}
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          inputMode="numeric"
          value={net ? toNumber(net).toLocaleString('ru-RU') : ''}
          onChange={e => setNet(e.target.value)}
          placeholder={isRu ? 'На руки, ₸' : 'Net, ₸'}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#4F8EF7]/40"
        />
        <button
          onClick={() => onApply(result.gross)}
          disabled={!toNumber(net)}
          className="px-3 py-2 rounded-lg bg-white/10 text-white/70 text-xs font-semibold disabled:opacity-40 hover:bg-white/15"
        >
          {isRu ? 'Применить' : 'Apply'}
        </button>
      </div>
      {toNumber(net) > 0 && (
        <p className="text-white/30 text-[10px] mt-2">
          {isRu ? 'Нужно начислить примерно' : 'Estimated gross'}: <span className="text-white/70 font-semibold">{fmt(result.gross)}</span>
        </p>
      )}
    </div>
  )
}
