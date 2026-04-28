import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'

// KZ 2026 payroll rates
const MZP = 85_000 // Минимальная заработная плата 2026
const RATES = {
  opv:  0.10,   // ОПВ — 10% (удерживается с работника)
  oppv: 0.015,  // ОППВ — 1.5% (за счёт работодателя, с 2024)
  ipn:  0.10,   // ИПН — 10%
  so:   0.035,  // СО — 3.5% (работодатель)
  osms_er: 0.03,  // ОСМС — 3% (работодатель)
  osms_ee: 0.02,  // ВОСМС — 2% (работник)
}

// IPN deduction (14 MRP for standard deduction) — MRP 2026 = 3,932₸
const MRP = 3_932
const IPN_DEDUCTION = 14 * MRP // стандартный вычет

function calcFromGross(gross) {
  const opv = Math.round(gross * RATES.opv)
  const vosms = Math.round(gross * RATES.osms_ee)
  // ИПН: (начислено - ОПВ - ВОСМС - 14МРП) × 10%
  const ipnBase = Math.max(0, gross - opv - vosms - IPN_DEDUCTION)
  const ipn = Math.round(ipnBase * RATES.ipn)
  const netSalary = gross - opv - vosms - ipn

  // Работодатель
  const so = Math.round(Math.max(gross * RATES.so, MZP * RATES.so))
  const osms = Math.round(gross * RATES.osms_er)
  const oppv = Math.round(gross * RATES.oppv)
  const employerTotal = so + osms + oppv
  const totalCost = gross + employerTotal

  return { gross, opv, vosms, ipn, ipnBase, netSalary, so, osms, oppv, employerTotal, totalCost }
}

function calcFromNet(net) {
  // Iterative approach: find gross that produces this net
  let lo = net, hi = net * 2
  for (let i = 0; i < 50; i++) {
    const mid = Math.round((lo + hi) / 2)
    const result = calcFromGross(mid)
    if (result.netSalary === net) return result
    if (result.netSalary < net) lo = mid + 1
    else hi = mid - 1
  }
  return calcFromGross(Math.round((lo + hi) / 2))
}

export default function PayrollCalculator({ currency }) {
  const { lang } = useLanguage()
  const isRu = lang !== 'en'
  const [mode, setMode] = useState('net') // 'net' = на руки → начислено, 'gross' = начислено → на руки
  const [amount, setAmount] = useState('')
  const [employees, setEmployees] = useState(1)
  const [expanded, setExpanded] = useState(false)

  const numAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0
  const result = numAmount > 0
    ? (mode === 'net' ? calcFromNet(numAmount) : calcFromGross(numAmount))
    : null

  const fmt = (n) => {
    const sym = { USD: '$', EUR: '€', KZT: '₸', UAH: '₴', GBP: '£' }[currency] || currency
    return `${sym} ${n.toLocaleString('ru-RU')}`
  }

  const formatInput = (val) => {
    const digits = val.replace(/\D/g, '')
    if (!digits) return ''
    return parseInt(digits, 10).toLocaleString('ru-RU')
  }

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">👥</span>
          <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">
            {isRu ? 'Зарплата' : 'Payroll'}
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-white/30 hover:text-white/60 text-xs transition-colors"
        >
          {expanded ? (isRu ? 'Свернуть' : 'Collapse') : (isRu ? 'Развернуть' : 'Expand')}
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setMode('net')}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            mode === 'net'
              ? 'bg-mint/20 text-mint border border-mint/30'
              : 'bg-white/5 text-white/40 border border-white/5 hover:text-white/70'
          }`}
        >
          {isRu ? 'На руки → Начисл.' : 'Net → Gross'}
        </button>
        <button
          onClick={() => setMode('gross')}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            mode === 'gross'
              ? 'bg-mint/20 text-mint border border-mint/30'
              : 'bg-white/5 text-white/40 border border-white/5 hover:text-white/70'
          }`}
        >
          {isRu ? 'Начисл. → На руки' : 'Gross → Net'}
        </button>
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <input
            type="text"
            inputMode="numeric"
            value={amount ? formatInput(amount) : ''}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
            placeholder={isRu ? (mode === 'net' ? 'На руки, ₸' : 'Начислено, ₸') : (mode === 'net' ? 'Net salary, ₸' : 'Gross salary, ₸')}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-mint/40 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setEmployees(Math.max(1, employees - 1))}
            className="w-7 h-7 rounded-lg bg-white/5 text-white/40 hover:text-white/70 text-sm flex items-center justify-center">−</button>
          <span className="text-white/60 text-xs w-5 text-center">{employees}</span>
          <button onClick={() => setEmployees(employees + 1)}
            className="w-7 h-7 rounded-lg bg-white/5 text-white/40 hover:text-white/70 text-sm flex items-center justify-center">+</button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-2">
          {/* Key numbers */}
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs">
              {isRu ? 'На руки' : 'Net salary'}
            </span>
            <span className="text-mint text-sm font-bold">
              {fmt(result.netSalary * employees)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs">
              {isRu ? 'Начислено' : 'Gross salary'}
            </span>
            <span className="text-white/70 text-xs font-medium">
              {fmt(result.gross * employees)}
            </span>
          </div>

          <div className="h-px bg-white/5 my-1" />

          {/* Employee deductions */}
          <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider">
            {isRu ? 'Удержания с работника' : 'Employee deductions'}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-[11px]">{isRu ? 'ОПВ' : 'MPF'} 10%</span>
            <span className="text-white/50 text-[11px]">{fmt(result.opv * employees)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-[11px]">{isRu ? 'ВОСМС' : 'CMHI'} 2%</span>
            <span className="text-white/50 text-[11px]">{fmt(result.vosms * employees)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-[11px]">{isRu ? 'ИПН' : 'IIT'} 10%</span>
            <span className="text-white/50 text-[11px]">{fmt(result.ipn * employees)}</span>
          </div>

          {expanded && (
            <>
              <div className="h-px bg-white/5 my-1" />

              {/* Employer contributions */}
              <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider">
                {isRu ? 'За счёт работодателя' : 'Employer contributions'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-[11px]">{isRu ? 'СО' : 'SC'} 3.5%</span>
                <span className="text-white/50 text-[11px]">{fmt(result.so * employees)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-[11px]">{isRu ? 'ОСМС' : 'CMHI-ER'} 3%</span>
                <span className="text-white/50 text-[11px]">{fmt(result.osms * employees)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-[11px]">{isRu ? 'ОППВ' : 'AMPF'} 1.5%</span>
                <span className="text-white/50 text-[11px]">{fmt(result.oppv * employees)}</span>
              </div>

              <div className="h-px bg-white/5 my-1" />

              {/* IPN calculation detail */}
              <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider">
                {isRu ? 'Расчёт ИПН' : 'IIT calculation'}
              </p>
              <div className="text-white/30 text-[10px] space-y-0.5">
                <p>{isRu ? 'Начислено' : 'Gross'}: {fmt(result.gross)}</p>
                <p>− {isRu ? 'ОПВ' : 'MPF'}: {fmt(result.opv)}</p>
                <p>− {isRu ? 'ВОСМС' : 'CMHI'}: {fmt(result.vosms)}</p>
                <p>− {isRu ? 'Вычет 14 МРП' : '14 MCI deduction'}: {fmt(IPN_DEDUCTION)}</p>
                <p>= {isRu ? 'База ИПН' : 'IIT base'}: {fmt(result.ipnBase)}</p>
                <p>× 10% = {isRu ? 'ИПН' : 'IIT'}: {fmt(result.ipn)}</p>
              </div>
            </>
          )}

          <div className="h-px bg-white/5 my-1" />

          {/* Total cost */}
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-xs font-medium">
              {isRu ? 'Итого расход компании' : 'Total company cost'}
            </span>
            <span className="text-white text-sm font-bold">{fmt(result.totalCost * employees)}</span>
          </div>

          {employees > 1 && (
            <p className="text-[10px] text-white/30">
              {isRu ? `× ${employees} сотрудников` : `× ${employees} employees`}
            </p>
          )}

          {/* Info */}
          <p className="text-[10px] text-white/20 mt-1">
            {isRu
              ? `💡 МЗП ${MZP.toLocaleString('ru-RU')}₸ · МРП ${MRP.toLocaleString('ru-RU')}₸ · 2026`
              : `💡 Min wage ${MZP.toLocaleString('ru-RU')}₸ · MCI ${MRP.toLocaleString('ru-RU')}₸ · 2026`}
          </p>
        </div>
      )}
    </div>
  )
}
