import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getPlannedOperations } from '../../lib/plannedOperations'
import {
  matchCategory,
  computeRecommendations,
  bestCardForCategory,
  CB_CAT_LABELS_RU,
  CB_CATS,
} from '../../data/bankCashbacks'
import { useLiveCashbacks } from '../../hooks/useLiveCashbacks'
import { useLanguage } from '../../context/LanguageContext'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function getPeriodDates(key) {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth()
  if (key === 'this_month')   return { from: new Date(y, m, 1),     to: new Date(y, m + 1, 0) }
  if (key === 'last_month')   return { from: new Date(y, m - 1, 1), to: new Date(y, m, 0) }
  if (key === 'this_quarter') { const q = Math.floor(m / 3); return { from: new Date(y, q*3, 1), to: new Date(y, q*3+3, 0) } }
  if (key === 'this_year')    return { from: new Date(y, 0, 1),     to: new Date(y, 11, 31) }
  return null
}

const fmt = (n) => Math.round(n).toLocaleString('ru-RU')
const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-zа-я0-9]+/gi, '')

function parseSurveyData(value) {
  if (!value) return {}
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

const dateKey = (value) => {
  if (!value) return ''
  if (value instanceof Date) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  return String(value).slice(0, 10)
}

function buildSpendingMapFromTransactions(transactions = [], dates, t) {
  const from = dates ? dateKey(dates.from) : ''
  const to = dates ? dateKey(dates.to) : ''
  const map = {}

  transactions
    .filter(tx => tx.type === 'expense')
    .filter(tx => isCashbackEligible(tx.category, tx.description))
    .filter(tx => {
      const txDate = dateKey(tx.date)
      if (!from || !to) return true
      return txDate >= from && txDate <= to
    })
    .forEach(tx => {
      const cat = tx.category || (t.other || 'Прочее')
      if (!map[cat]) map[cat] = { expense: 0 }
      map[cat].expense += Math.abs(Number(tx.amount) || 0)
    })

  return map
}

function isCashbackEligible(category = '', description = '') {
  const text = `${category} ${description}`.toLowerCase()
  const excluded = [
    'зарплат',
    'налог',
    'ипн',
    'опв',
    'осмс',
    'соц.',
    'аренд',
    'крипто-комисс',
    'комиссия сети',
    'usdt',
    'перевод',
    'обмен',
  ]
  return !excluded.some(word => text.includes(word))
}

// ─────────────────────────────────────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────────────────────────────────────
function StepIndicator({ step, onGoTo, t }) {
  const steps = [t.stepPeriod || 'Period', t.stepExpenses || 'Expenses', t.stepRecommendations || 'Recommendations']
  return (
    <div className="flex items-center gap-1 mb-5">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-1">
          <button
            onClick={() => i < step && onGoTo(i)}
            disabled={i >= step}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${step === i
                ? 'bg-mint text-dark'
                : step > i
                  ? 'text-white/50 hover:text-white cursor-pointer'
                  : 'text-white/20 cursor-default'}`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
              ${step > i ? 'bg-mint/20 text-mint' : step === i ? 'bg-dark/20' : 'bg-white/5 text-white/20'}`}>
              {step > i ? '✓' : i + 1}
            </span>
            {label}
          </button>
          {i < 2 && (
            <div className={`w-4 h-px ${step > i ? 'bg-mint/30' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 0 — Period picker
// ─────────────────────────────────────────────────────────────────────────────
function StepPeriod({ period, setPeriod, customFrom, setCustomFrom, customTo, setCustomTo, onNext, loading, isAdult, setIsAdult, banks, source, updatedAt, t, lang }) {
  const canProceed = period !== 'custom' || (customFrom && customTo)
  const totalCards = banks.reduce((s, b) => s + b.cards.length, 0)
  
  const PERIODS = [
    { key: 'this_month',   label: t.thisMonth },
    { key: 'last_month',   label: t.lastMonth },
    { key: 'this_quarter', label: t.thisQuarter },
    { key: 'this_year',    label: t.thisYear },
    { key: 'custom',       label: t.custom },
  ]

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-white font-bold text-base">{t.cashbackAnalysis}</h3>
        <p className="text-white/40 text-sm mt-1">
          {(t.selectPeriodCompareBanks || 'Выберите период — мы сравним ваши траты с условиями {n} банков и найдём лучший кэшбэк').replace('{n}', banks.length)}
        </p>
        <div className="flex items-center gap-2 mt-2">
          {source === 'live' ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> {t.liveUpdate || 'AI · ежедневное обновление'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
              {t.localDatabase || 'Локальная база'}
            </span>
          )}
          {updatedAt && (
            <span className="text-white/25 text-[9px]">
              {t.updated || 'обновлено'} {new Date(updatedAt).toLocaleDateString(lang, { day: '2-digit', month: 'short' })}
            </span>
          )}
        </div>
      </div>

      {/* Age toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setIsAdult(true)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isAdult
              ? 'bg-mint text-dark shadow-[0_0_16px_rgba(79,142,247,0.25)]'
              : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.07] border border-white/[0.06]'
          }`}
        >
          <span>👤</span> {t.adult18 || '18+'}
        </button>
        <button
          onClick={() => setIsAdult(false)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
            !isAdult
              ? 'bg-mint text-dark shadow-[0_0_16px_rgba(79,142,247,0.25)]'
              : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.07] border border-white/[0.06]'
          }`}
        >
          <span>🎓</span> {t.student1417 || '14–17 лет'}
        </button>
      </div>

      {/* Period buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {PERIODS.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all text-center
              ${period === p.key
                ? 'bg-mint text-dark shadow-[0_0_16px_rgba(79,142,247,0.25)]'
                : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.07] hover:text-white/80 border border-white/[0.06]'}`}>
            {p.label}
          </button>
        ))}
      </div>

      {period === 'custom' && (
        <div className="flex items-center gap-2 mb-4">
          <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white [color-scheme:dark] focus:outline-none focus:border-mint/40" />
          <span className="text-white/20 text-xs">—</span>
          <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white [color-scheme:dark] focus:outline-none focus:border-mint/40" />
        </div>
      )}

      {/* Bank grid */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 mb-5">
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-3">{t.analyzeCards || 'Анализируем карты'}</p>
        <div className="grid grid-cols-2 gap-2">
          {banks.map(b => (
            <div key={b.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white/[0.03]">
              <span className="text-base">{b.logo}</span>
              <div className="min-w-0">
                <p className="text-white/70 text-xs font-medium truncate">{lang === 'en' ? b.name : b.nameRu}</p>
                <p className="text-white/25 text-[10px]">{b.cards.length} {t.moreCards || 'карт'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onNext} disabled={!canProceed || loading}
        className="w-full py-3.5 rounded-xl bg-mint text-dark font-bold text-sm hover:bg-mint/90 active:scale-[0.99] transition-all disabled:opacity-40 flex items-center justify-center gap-2">
        {loading ? (
          <><div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin" /> {t.analyzingTransactions || 'Анализируем транзакции...'}</>
        ) : <><span>✦</span> {t.generatingReport || 'Сгенерировать отчёт'}</>}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Spending breakdown
// ─────────────────────────────────────────────────────────────────────────────
function StepAnalysis({ spendingMap, totalExpense, periodLabel, onNext, onBack, banks, t, lang }) {
  const topCategories = Object.entries(spendingMap)
    .filter(([, v]) => v.expense > 0)
    .sort((a, b) => b[1].expense - a[1].expense)

  const maxSpend = topCategories[0]?.[1]?.expense || 1

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-white font-bold text-base">{t.yourExpenses || 'Ваши расходы'}</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-black text-white">{Math.round(totalExpense).toLocaleString(lang)} ₸</span>
          <span className="text-white/30 text-sm">{t.fromLabel || 'за'} {periodLabel?.toLowerCase()}</span>
        </div>
      </div>

      {topCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-36 text-white/20 mb-5">
          <p className="text-4xl mb-2">📭</p>
          <p className="text-sm">{t.noExpensesPeriod || 'Нет расходов за выбранный период'}</p>
          <p className="text-xs mt-1">{t.addTxsTryAgain || 'Добавьте транзакции и попробуйте снова'}</p>
        </div>
      ) : (
        <div className="space-y-2 mb-5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
          {topCategories.map(([catName, amounts]) => {
            const cbKey = matchCategory(catName)
            const label = CB_CAT_LABELS_RU[cbKey] || catName
            const emoji = label.split(' ')[0]
            const pct = totalExpense > 0 ? (amounts.expense / totalExpense) * 100 : 0
            const barPct = (amounts.expense / maxSpend) * 100
            const best = bestCardForCategory(cbKey, banks)

            return (
              <div key={catName}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3.5 py-3 hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base flex-shrink-0">{emoji}</span>
                    <div className="min-w-0">
                      <p className="text-white/75 text-sm font-medium truncate">{catName}</p>
                      <p className="text-white/25 text-[10px]">{label.split(' ').slice(1).join(' ')}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-white/85 text-sm font-bold">{Math.round(amounts.expense).toLocaleString(lang)} ₸</p>
                    <p className="text-white/25 text-[10px]">{pct.toFixed(0)}% {t.fromTotalOf || 'от'} {t.expenseCategories?.toLowerCase() || 'трат'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/[0.05] rounded-full h-1">
                    <div className="h-1 rounded-full transition-all" style={{ width: `${Math.min(100, barPct)}%`, background: '#4F8EF7' }} />
                  </div>
                  {best && (
                    <span className="text-[10px] font-bold flex-shrink-0 px-1.5 py-0.5 rounded-md"
                      style={{ background: best.bank.color + '20', color: best.bank.color }}>
                      {best.bank.logo} {t.fromLabel || 'до'} {best.rule.percent}%
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={onBack}
          className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm font-medium transition-colors">
          ← {t.cancel || 'Назад'}
        </button>
        <button onClick={onNext}
          className="flex-[2] py-3 rounded-xl bg-mint text-dark font-bold text-sm hover:bg-mint/90 transition-colors">
          {t.seeRecommendations || 'Смотреть рекомендации'} →
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Recommendations
// ─────────────────────────────────────────────────────────────────────────────
function StepRecommendations({ recommendations, totalExpense, periodLabel, spendingMap, onBack, isAdult, banks, t, lang }) {
  const [expandedCard, setExpandedCard] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const winner = recommendations[0]
  const top3 = recommendations.slice(0, 3)
  const rest = recommendations.slice(3)
  const displayed = showAll ? rest : rest.slice(0, 0)

  // Download report as text
  const downloadReport = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    let y = 20
    const lm = 20, pw = 170

    doc.setFontSize(18); doc.setTextColor(79, 142, 247)
    doc.text('Finvy', lm, y)
    doc.setTextColor(100, 100, 100); doc.setFontSize(10)
    doc.text('Cashback Report', lm + 30, y)
    y += 12

    doc.setDrawColor(79, 142, 247); doc.setLineWidth(0.5)
    doc.line(lm, y, lm + pw, y); y += 8

    doc.setFontSize(10); doc.setTextColor(60, 60, 60)
    doc.text(`Period: ${periodLabel}`, lm, y); y += 6
    doc.text(`Total expenses: ${Math.round(totalExpense).toLocaleString(lang)} KZT`, lm, y); y += 10

    doc.setFontSize(12); doc.setTextColor(30, 30, 30)
    doc.text('Top Recommendations', lm, y); y += 8

    recommendations.slice(0, 5).forEach((r, i) => {
      if (y > 260) { doc.addPage(); y = 20 }
      doc.setFontSize(10); doc.setTextColor(79, 142, 247)
      doc.text(`#${i + 1}`, lm, y)
      doc.setTextColor(30, 30, 30)
      doc.text(`${r.bankName} — ${r.cardName}`, lm + 8, y); y += 5
      doc.setFontSize(9); doc.setTextColor(80, 80, 80)
      doc.text(`Cashback: ~${Math.round(r.netCashback).toLocaleString(lang)} KZT/month (${Math.round(r.netCashback * 12).toLocaleString(lang)} KZT/year)`, lm + 8, y); y += 5
      doc.text(r.highlight || '', lm + 8, y); y += 7
    })

    y += 4; doc.setDrawColor(200, 200, 200); doc.line(lm, y, lm + pw, y); y += 8

    doc.setFontSize(12); doc.setTextColor(30, 30, 30)
    doc.text('Spending by Category', lm, y); y += 8

    Object.entries(spendingMap).sort((a,b) => b[1].expense - a[1].expense).forEach(([cat, v]) => {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.setFontSize(9); doc.setTextColor(60, 60, 60)
      doc.text(cat, lm, y)
      doc.text(`${Math.round(v.expense).toLocaleString(lang)} KZT`, lm + 100, y); y += 5
    })

    if (winner) {
      y += 6; doc.setDrawColor(200, 200, 200); doc.line(lm, y, lm + pw, y); y += 8
      doc.setFontSize(12); doc.setTextColor(30, 30, 30)
      doc.text('Best Choice', lm, y); y += 7
      doc.setFontSize(10); doc.setTextColor(60, 60, 60)
      doc.text(`Bank: ${winner.bankName}`, lm, y); y += 5
      doc.text(`Card: ${winner.cardName}`, lm, y); y += 5
      doc.text(`Cashback: ~${Math.round(winner.netCashback).toLocaleString(lang)} KZT/month`, lm, y); y += 5
      doc.text(`Annual benefit: ~${Math.round(winner.netCashback * 12).toLocaleString(lang)} KZT`, lm, y); y += 5
      const bankUrl = banks.find(b => b.id === winner.bankId)?.url
      if (bankUrl) { doc.text(`Website: ${bankUrl}`, lm, y); y += 5 }
    }

    y += 10; if (y > 275) { doc.addPage(); y = 20 }
    doc.setFontSize(8); doc.setTextColor(150, 150, 150)
    doc.text('Generated by Finvy — finvy.kz', lm, y)

    doc.save('finvy-cashback-report.pdf')
  }

  const toggleCard = (key) => setExpandedCard(expandedCard === key ? null : key)

  return (
    <div>
      {/* Winner hero */}
      {winner ? (
        <div className="relative overflow-hidden rounded-2xl p-4 mb-4"
          style={{ background: `linear-gradient(135deg, ${winner.bankColor}18 0%, ${winner.bankColor}06 100%)`,
                   border: `1px solid ${winner.bankColor}28` }}>
          {/* #1 badge */}
          <div className="absolute -top-0.5 right-3 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-b-lg"
            style={{ background: winner.bankColor + '30', color: winner.bankColor }}>
            🏆 #1 {t.bestChoice || 'лучший выбор'}
          </div>

          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: winner.bankColor + '18' }}>
              {winner.bankLogo}
            </div>
            <div className="flex-1 min-w-0 pr-14">
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <span className="text-white font-bold">{winner.bankName}</span>
                <span className="text-white/40 text-sm">{winner.cardName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: winner.bankColor + '20', color: winner.bankColor }}>
                  {winner.cardType === 'debit' ? (t.debit || 'Дебетовая') : (t.credit || 'Кредитная')}
                </span>
              </div>
              <p className="text-white/45 text-xs mb-2">{winner.highlight}</p>
              <div className="flex items-end gap-3">
                <div>
                  <p className="text-[10px] text-white/30 mb-0.5">{t.perMonth || 'в месяц'}</p>
                  <p className="text-2xl font-black" style={{ color: winner.bankColor }}>
                    +{Math.round(winner.netCashback).toLocaleString(lang)} ₸
                  </p>
                </div>
                <div className="pb-0.5">
                  <p className="text-[10px] text-white/25 mb-0.5">{t.perYear || 'в год'}</p>
                  <p className="text-sm font-bold text-white/50">
                    +{Math.round(winner.netCashback * 12).toLocaleString(lang)} ₸
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Condition note */}
          {winner.cardNote && (
            <div className="mt-3 flex items-start gap-1.5 bg-white/[0.04] rounded-xl px-3 py-2">
              <span className="text-yellow-400 text-xs flex-shrink-0 mt-0.5">⚡</span>
              <p className="text-white/40 text-[11px] leading-relaxed">{winner.cardNote}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-white/20 mb-4">
          <p className="text-4xl mb-2">📭</p>
          <p className="text-sm">{t.noDataRecommendation || 'Нет данных для рекомендации'}</p>
          <p className="text-xs mt-1">{t.addFirstCategoryHint || 'Добавьте расходы по категориям'}</p>
        </div>
      )}

      {/* Age info block for 18+ */}
      {isAdult && winner && (
        <div className="bg-[#4F8EF7]/[0.06] border border-[#4F8EF7]/15 rounded-xl p-3.5 mb-3">
          <div className="flex items-start gap-2">
            <span className="text-base flex-shrink-0">ℹ️</span>
            <div>
              <p className="text-[#4F8EF7] text-xs font-semibold mb-1">{t.whyNotFreedomStudent || 'Почему не Freedom Student?'}</p>
              <p className="text-white/45 text-[11px] leading-relaxed">
                {(t.freedomStudentDesc || 'Freedom Student (до 37% кэшбэк) доступна только для подростков 14–17 лет. Для вас {bank} {card} — лучший выбор.')
                  .replace('{bank}', winner.bankName)
                  .replace('{card}', winner.cardName)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 */}
      <div className="space-y-1.5 mb-3">
        {top3.map((card, idx) => {
          const key = `${card.bankId}-${card.cardName}`
          const isOpen = expandedCard === key

          return (
            <div key={key} className="overflow-hidden rounded-xl border transition-all"
              style={{ borderColor: isOpen ? card.bankColor + '30' : 'rgba(255,255,255,0.06)' }}>
              <button onClick={() => toggleCard(key)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.03] transition-colors">
                {/* Rank */}
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black"
                  style={{ background: idx === 0 ? '#FFD700' + '20' : card.bankColor + '15',
                           color: idx === 0 ? '#FFD700' : card.bankColor }}>
                  {idx + 1}
                </div>
                {/* Logo */}
                <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ background: card.bankColor + '18' }}>
                  <span className="text-sm">{card.bankLogo}</span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-white/80 text-sm font-semibold">{card.bankName}</span>
                    <span className="text-white/35 text-xs">{card.cardName}</span>
                    {idx === 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-mint/15 text-mint font-bold">{t.best || 'лучший'}</span>}
                  </div>
                  <p className="text-white/30 text-[10px] truncate mt-0.5">{card.highlight}</p>
                </div>
                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black" style={{ color: card.bankColor }}>+{Math.round(card.netCashback).toLocaleString(lang)} ₸</p>
                  <p className="text-white/20 text-[10px]">/{t.month || 'мес'}</p>
                </div>
                {/* Arrow */}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
                  className={`text-white/20 flex-shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                  <path d="M4 2l4 4-4 4"/>
                </svg>
              </button>

              {/* Expanded breakdown */}
              {isOpen && (
                <div className="border-t px-3 py-3 space-y-1.5"
                  style={{ borderColor: card.bankColor + '20', background: card.bankColor + '06' }}>

                  {/* Card condition note */}
                  {card.cardNote && (
                    <div className="flex items-start gap-1.5 bg-yellow-400/5 border border-yellow-400/15 rounded-lg px-2.5 py-2 mb-2">
                      <span className="text-yellow-400 text-xs flex-shrink-0">⚡</span>
                      <p className="text-yellow-300/60 text-[10px] leading-relaxed">{card.cardNote}</p>
                    </div>
                  )}

                  {/* Breakdown by category */}
                  {card.breakdown.length > 0 ? (
                    <>
                      <p className="text-white/25 text-[10px] font-bold uppercase tracking-wider mb-1.5">{t.cashbackAnalysis || 'Кэшбэк по вашим категориям'}</p>
                      {card.breakdown.map((b, i) => {
                        const emoji = CB_CAT_LABELS_RU[b.cbKey]?.split(' ')[0] || '💳'
                        const catLabel = CB_CAT_LABELS_RU[b.cbKey]?.split(' ').slice(1).join(' ') || b.cbKey
                        return (
                          <div key={i} className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{emoji}</span>
                              <div>
                                <span className="text-white/55 text-xs">{catLabel}</span>
                                <span className="text-white/20 text-[10px] ml-1.5">{Math.round(b.spend).toLocaleString(lang)} ₸ {t.reportExpense || 'потрачено'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-white/25 text-[10px]">{b.percent}%</span>
                              <span className="text-xs font-bold" style={{ color: card.bankColor }}>+{Math.round(b.cashback).toLocaleString(lang)} ₸</span>
                            </div>
                          </div>
                        )
                      })}
                      <div className="flex items-center justify-between pt-1.5 border-t mt-1"
                        style={{ borderColor: card.bankColor + '20' }}>
                        <span className="text-white/35 text-xs font-semibold">{t.totalPerMonth || 'Итого в месяц'}</span>
                        <span className="font-black text-sm" style={{ color: card.bankColor }}>+{Math.round(card.netCashback).toLocaleString(lang)} ₸</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/25 text-xs">{t.annualBenefit || 'Выгода за год'}</span>
                        <span className="text-white/50 text-xs font-semibold">≈ {Math.round(card.netCashback * 12).toLocaleString(lang)} ₸</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-white/30 text-xs py-2">{t.cashbackAnalysis || 'Кэшбэк'} {t.allTime?.toLowerCase() || 'на все покупки'}: {Math.round(card.netCashback).toLocaleString(lang)} ₸/{t.month || 'мес'}</p>
                  )}

                  {/* Open bank link */}
                  <a href={banks.find(b => b.id === card.bankId)?.url}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border text-xs font-semibold transition-colors hover:text-white"
                    style={{ borderColor: card.bankColor + '35', color: card.bankColor }}>
                    {t.openBankWebsite || 'Открыть карту на сайте банка'}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 1h5v5M9 1L5 5M1 5h2v4H1V5z" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* More cards toggle */}
      {rest.length > 0 && (
        <div className="mb-3">
          <button onClick={() => setShowAll(!showAll)}
            className="w-full flex items-center justify-center gap-1.5 text-white/25 hover:text-white/50 text-xs py-2 transition-colors">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"
              className={`transition-transform ${showAll ? 'rotate-180' : ''}`}>
              <path d="M2 3l3 3 3-3"/>
            </svg>
            {showAll ? (t.hide || 'Скрыть') : `${t.moreCards || 'Ещё'} ${rest.length} ${t.moreCards || 'карт'}`}
          </button>
          {showAll && (
            <div className="space-y-1 mt-1.5">
              {rest.map(card => (
                <div key={`${card.bankId}-${card.cardName}`}
                  className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span>{card.bankLogo}</span>
                    <span className="text-white/35 text-xs">{card.bankName} · {card.cardName}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: card.bankColor }}>+{Math.round(card.netCashback).toLocaleString(lang)} ₸/{t.month || 'мес'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tip + download */}
      {winner && (
        <div className="bg-mint/[0.06] border border-mint/15 rounded-xl p-3.5 mb-3">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div>
              <p className="text-mint text-xs font-semibold mb-0.5">{t.personalTip || 'Персональный совет'}</p>
              <p className="text-white/45 text-xs leading-relaxed">
                С картой <span className="text-white/70 font-medium">{winner.bankName} {winner.cardName}</span> вы
                будете получать примерно <span className="text-mint font-bold">{Math.round(winner.netCashback).toLocaleString(lang)} ₸</span> кэшбэка
                в месяц — это <span className="text-white/70 font-semibold">{Math.round(winner.netCashback * 12).toLocaleString(lang)} ₸ {t.perYear || 'в год'}</span> на ваших текущих тратах.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onBack}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 text-xs font-medium transition-colors">
          ← {t.changePeriod || 'Изменить период'}
        </button>
        <button onClick={downloadReport}
          className="flex-[2] py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white/60 hover:bg-white/[0.08] hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 9h8M6 1v6M3.5 5l2.5 2.5L9 5"/>
          </svg>
          {t.downloadReportPdf || 'Скачать отчёт (PDF)'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main modal
// ─────────────────────────────────────────────────────────────────────────────
export default function CashbackReportModal({ userId, onClose }) {
  const { t, lang } = useLanguage()
  const [step, setStep] = useState(0)
  const [period, setPeriod] = useState('this_month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [spendingMap, setSpendingMap] = useState({})
  const [totalExpense, setTotalExpense] = useState(0)
  const [recommendations, setRecommendations] = useState([])
  const [isAdult, setIsAdult] = useState(true)
  const [surveyContext, setSurveyContext] = useState({})
  const { banks, source, updatedAt, version } = useLiveCashbacks()
  const selectedBankNames = Array.isArray(surveyContext.banks) ? surveyContext.banks : []
  const banksForAnalysis = useMemo(() => {
    if (!selectedBankNames.length) return banks
    const selected = selectedBankNames.map(normalize).filter(Boolean)
    const preferred = banks.filter(bank => {
      const bankName = normalize(`${bank.name || ''} ${bank.nameRu || ''}`)
      return selected.some(name => bankName.includes(name) || name.includes(bankName))
    })
    if (!preferred.length) return banks
    const preferredIds = new Set(preferred.map(bank => bank.id))
    return [...preferred, ...banks.filter(bank => !preferredIds.has(bank.id))]
  }, [banks, selectedBankNames])
  
  const PERIODS = [
    { key: 'this_month',   label: t.thisMonth },
    { key: 'last_month',   label: t.lastMonth },
    { key: 'this_quarter', label: t.thisQuarter },
    { key: 'this_year',    label: t.thisYear },
    { key: 'custom',       label: t.custom },
  ]
  const periodLabel = PERIODS.find(p => p.key === period)?.label || ''

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!userId) return
      const { data } = await supabase
        .from('fm_settings')
        .select('survey_data')
        .eq('user_id', userId)
        .maybeSingle()
      if (!cancelled) setSurveyContext(parseSurveyData(data?.survey_data))
    })()
    return () => { cancelled = true }
  }, [userId])

  const fetchAndAnalyze = async () => {
    setLoading(true)

    let map = {}

    const dates = period === 'custom'
      ? (customFrom && customTo ? { from: customFrom, to: customTo } : null)
      : getPeriodDates(period)
    if (!dates) { setLoading(false); return }

    const from = dates.from instanceof Date ? dates.from.toISOString().slice(0, 10) : dates.from
    const to   = dates.to   instanceof Date ? dates.to.toISOString().slice(0, 10)   : dates.to

    const { data: txs } = await supabase
      .from('transactions')
      .select('type, amount, category, description, date')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', from + 'T00:00:00')
      .lte('date', to   + 'T23:59:59')

    if (txs?.length) {
      map = buildSpendingMapFromTransactions(txs, { from, to }, t)
    }

    if (Object.keys(map).length === 0) {
      const planned = await getPlannedOperations({ userId, from, to })
      const onboardingPayments = planned.filter(op => op.type === 'expense' && op.plannedKind === 'obligation')
      map = buildSpendingMapFromTransactions(onboardingPayments, { from, to }, t)
    }

    const total = Object.values(map).reduce((s, v) => s + v.expense, 0)
    setSpendingMap(map)
    setTotalExpense(total)
    setRecommendations(computeRecommendations(map, { isAdult, banks: banksForAnalysis }))
    setLoading(false)
    setStep(1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#131313] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-mint/10 border border-mint/20 flex items-center justify-center text-lg">
                💳
              </div>
              <div>
                <p className="text-white font-bold text-sm">{t.cashbackAnalysis}</p>
                <p className="text-white/30 text-xs">
                  {banks.length} {t.moreCards} · {banks.reduce((s,b) => s+b.cards.length, 0)} {t.moreCards}
                  {source === 'live' && version > 0 && (
                    <span className="ml-1 text-emerald-300/70">· v{version}</span>
                  )}
                </p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-colors text-lg">
              ✕
            </button>
          </div>
          <StepIndicator step={step} onGoTo={setStep} t={t} />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 0 && (
            <StepPeriod
              period={period} setPeriod={setPeriod}
              customFrom={customFrom} setCustomFrom={setCustomFrom}
              customTo={customTo} setCustomTo={setCustomTo}
              onNext={fetchAndAnalyze} loading={loading}
              isAdult={isAdult} setIsAdult={setIsAdult}
              banks={banksForAnalysis} source={source} updatedAt={updatedAt}
              t={t} lang={lang}
            />
          )}
          {step === 1 && (
            <StepAnalysis
              spendingMap={spendingMap}
              totalExpense={totalExpense}
              periodLabel={periodLabel}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
              banks={banksForAnalysis}
              t={t} lang={lang}
            />
          )}
          {step === 2 && (
            <StepRecommendations
              recommendations={recommendations}
              totalExpense={totalExpense}
              periodLabel={periodLabel}
              spendingMap={spendingMap}
              onBack={() => setStep(0)}
              isAdult={isAdult}
              banks={banksForAnalysis}
              t={t} lang={lang}
            />
          )}
        </div>
      </div>
    </div>
  )
}
