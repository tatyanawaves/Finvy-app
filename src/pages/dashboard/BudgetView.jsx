// ─────────────────────────────────────────────────────────────────────────────
// BudgetView — Phase 1 envelope budgeting screen
// Shows: month switcher, totals strip, "to budget" indicator,
// per-category rows with planned/spent/remaining + progress bar,
// inline edit/delete, "add category" form.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react'
import { useBudget, currentMonthKey, shiftMonth } from '../../hooks/useBudget'
import { generateBudgetProposal, applyBudgetProposal } from '../../lib/budgetAI'

const fmt = (n) => Math.round(Number(n) || 0).toLocaleString('ru-RU')

function formatMonthLabel(monthKey) {
  // monthKey: 'YYYY-MM'
  const [y, m] = monthKey.split('-')
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ]
  return `${months[Number(m) - 1]} ${y}`
}

// ─── Single category row ─────────────────────────────────────────────────────
function BudgetRow({ row, onEdit, onDelete }) {
  const { category, planned, rolloverIn, cap, spent, remaining, percentUsed, status, unbudgeted } = row
  const pct = Math.min(100, Math.round(percentUsed * 100))

  const barColor =
    status === 'over' ? 'bg-red-500'
    : status === 'warning' ? 'bg-amber-400'
    : 'bg-mint'

  const remColor =
    status === 'over' ? 'text-red-400'
    : status === 'warning' ? 'text-amber-400'
    : 'text-mint'

  return (
    <div className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-xl px-4 py-3 transition-colors group">
      <div className="flex items-center gap-4">
        {/* Category name + planned */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white/90 font-medium text-sm truncate">{category}</p>
            {unbudgeted && (
              <span className="text-[10px] uppercase tracking-wider text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5">
                нет лимита
              </span>
            )}
            {rolloverIn !== 0 && (
              <span className={`text-[10px] tracking-wider rounded-full px-2 py-0.5 border ${
                rolloverIn > 0
                  ? 'text-mint/80 bg-mint/10 border-mint/20'
                  : 'text-red-400/80 bg-red-400/10 border-red-400/20'
              }`}>
                {rolloverIn > 0 ? '+' : ''}{fmt(rolloverIn)} перенос
              </span>
            )}
          </div>
          <p className="text-white/40 text-xs mt-0.5">
            {fmt(spent)} ₸ из {unbudgeted ? '—' : fmt(cap)}{cap > 0 && ` ₸`}
          </p>
        </div>

        {/* Progress bar (visible on sm+) */}
        <div className="hidden sm:block w-32 lg:w-40 flex-shrink-0">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} transition-all duration-500`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[10px] text-white/30 mt-1 tabular-nums">{pct}%</p>
        </div>

        {/* Remaining */}
        <div className="text-right flex-shrink-0 min-w-[110px]">
          <p className={`font-bold text-sm tabular-nums ${remColor}`}>
            {remaining >= 0 ? '' : '−'}{fmt(Math.abs(remaining))} ₸
          </p>
          <p className="text-[10px] text-white/30 mt-0.5">
            {remaining >= 0 ? 'осталось' : 'перерасход'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(row)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs"
            title={unbudgeted ? 'Создать бюджет' : 'Изменить'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M16 4l4 4-11 11H5v-4L16 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {!unbudgeted && (
            <button
              onClick={() => onDelete(row)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 text-xs"
              title="Удалить"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M5 7h14M9 7v-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M7 7l1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Edit modal ──────────────────────────────────────────────────────────────
function EditBudgetModal({ row, onClose, onSave }) {
  const [planned, setPlanned] = useState(row.planned ? String(row.planned) : '')
  const [notes, setNotes] = useState(row.notes || '')
  const [rolloverEnabled, setRolloverEnabled] = useState(row.rolloverEnabled !== false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    const amount = Number(planned.replace(/\s/g, ''))
    if (Number.isNaN(amount) || amount < 0) {
      setError('Введите положительную сумму')
      return
    }
    setSaving(true)
    setError('')
    const res = await onSave({
      id: row.id,
      category: row.category,
      plannedAmount: amount,
      notes,
      rolloverEnabled,
    })
    setSaving(false)
    if (res?.error) setError(res.error)
    else onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSave}
        className="relative bg-[#161616] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-white font-semibold text-sm">
            {row.id ? 'Изменить бюджет' : 'Создать бюджет'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Категория</label>
            <p className="text-white font-medium text-sm bg-white/5 px-3 py-2.5 rounded-lg border border-white/10">
              {row.category}
            </p>
          </div>

          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Запланировано на месяц, ₸ *</label>
            <input
              type="text"
              inputMode="numeric"
              value={planned}
              onChange={(e) => setPlanned(e.target.value)}
              placeholder="50000"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-mint/40 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Заметка</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Например: Magnum + Galmart"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-mint/40 transition-colors"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rolloverEnabled}
              onChange={(e) => setRolloverEnabled(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-mint focus:ring-mint/30"
            />
            <span>
              <span className="text-white/85 text-xs font-medium block">Переносить остаток</span>
              <span className="text-white/40 text-[11px] block mt-0.5">
                Если в конце месяца останутся неиспользованные деньги — добавятся к бюджету следующего месяца
              </span>
            </span>
          </label>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        <div className="px-5 py-4 border-t border-white/5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-white/50 hover:text-white text-sm px-4 py-2"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-mint hover:bg-mint/90 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
          >
            {saving ? 'Сохраняю…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Add new (unused) category form ──────────────────────────────────────────
function AddCategoryForm({ existingCategories, onAdd }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [planned, setPlanned] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handle = async (e) => {
    e.preventDefault()
    const cat = name.trim()
    const amount = Number(planned.replace(/\s/g, ''))
    if (!cat) { setError('Введите название категории'); return }
    if (existingCategories.includes(cat)) { setError('Такая категория уже есть в бюджете'); return }
    if (Number.isNaN(amount) || amount < 0) { setError('Введите положительную сумму'); return }
    setSaving(true)
    setError('')
    const res = await onAdd({ category: cat, plannedAmount: amount })
    setSaving(false)
    if (res?.error) setError(res.error)
    else { setName(''); setPlanned(''); setOpen(false) }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-dashed border-white/15 rounded-xl px-4 py-3 text-white/50 hover:text-white text-sm font-medium transition-colors"
      >
        + Добавить категорию в бюджет
      </button>
    )
  }

  return (
    <form onSubmit={handle} className="bg-white/[0.04] border border-white/10 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-2">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Категория (например: Подписки)"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-mint/40"
        />
        <input
          type="text"
          inputMode="numeric"
          value={planned}
          onChange={(e) => setPlanned(e.target.value)}
          placeholder="План, ₸"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-mint/40 tabular-nums"
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-mint hover:bg-mint/90 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2.5 rounded-lg"
          >
            {saving ? '…' : 'Добавить'}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setError('') }}
            className="text-white/40 hover:text-white text-sm px-2"
          >
            ✕
          </button>
        </div>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </form>
  )
}

// ─── Demo data (used when user is not authenticated, /demo route) ────────────
const DEMO_BUDGETS = [
  { category: 'Продукты',      planned: 60000,  notes: 'Magnum + Galmart' },
  { category: 'Рестораны',     planned: 35000,  notes: 'кафе и доставка' },
  { category: 'Топливо',       planned: 40000,  notes: '' },
  { category: 'Транспорт',     planned: 15000,  notes: 'такси, автобусы' },
  { category: 'Одежда',        planned: 30000,  notes: '' },
  { category: 'Развлечения',   planned: 20000,  notes: '' },
  { category: 'Здоровье',      planned: 25000,  notes: 'аптека, врачи' },
  { category: 'Реклама',       planned: 80000,  notes: 'Instagram + Google' },
  { category: 'Налоги',        planned: 210000, notes: 'ИПН + ОПВ' },
  { category: 'Закуп товаров', planned: 300000, notes: '' },
  { category: 'Логистика',     planned: 60000,  notes: '' },
  { category: 'Аренда',        planned: 120000, notes: 'офис' },
]

function buildDemoState({ demoData, month }) {
  // Compute spent per category for the given month from demo transactions
  const [yearStr, monthStr] = month.split('-')
  const spent = {}
  let income = 0
  for (const tx of demoData || []) {
    const txMonth = (tx.date || '').slice(0, 7)
    if (txMonth !== month) continue
    if (tx.type === 'expense') {
      const cat = tx.category || 'Другое'
      spent[cat] = (spent[cat] || 0) + Math.abs(Number(tx.amount) || 0)
    } else if (tx.type === 'income') {
      income += Math.abs(Number(tx.amount) || 0)
    }
  }
  // Build rows
  const seen = new Set()
  const rows = []
  for (const b of DEMO_BUDGETS) {
    seen.add(b.category)
    const cap = b.planned
    const sp = spent[b.category] || 0
    const remaining = cap - sp
    const percentUsed = cap > 0 ? sp / cap : 0
    rows.push({
      id: `demo-${b.category}`,
      category: b.category,
      planned: b.planned,
      rolloverIn: 0,
      cap,
      spent: sp,
      remaining,
      percentUsed,
      status: remaining < 0 ? 'over' : (percentUsed >= 0.9 ? 'warning' : 'ok'),
      notes: b.notes,
      rolloverEnabled: true,
      unbudgeted: false,
    })
  }
  for (const [cat, sp] of Object.entries(spent)) {
    if (seen.has(cat)) continue
    rows.push({
      id: null,
      category: cat,
      planned: 0,
      rolloverIn: 0,
      cap: 0,
      spent: sp,
      remaining: -sp,
      percentUsed: 1,
      status: 'over',
      notes: '',
      rolloverEnabled: true,
      unbudgeted: true,
    })
  }
  rows.sort((a, b) => {
    const order = { over: 0, warning: 1, ok: 2 }
    const so = order[a.status] - order[b.status]
    if (so !== 0) return so
    return b.planned - a.planned
  })
  const totalPlanned = rows.reduce((s, r) => s + r.planned, 0)
  const totalSpent = rows.reduce((s, r) => s + r.spent, 0)
  const totalRemaining = totalPlanned - totalSpent
  return {
    rows,
    totals: { planned: totalPlanned, spent: totalSpent, remaining: totalRemaining, rolloverIn: 0 },
    monthIncome: income,
    toBudget: income - totalPlanned,
  }
}

// ─── Main view ───────────────────────────────────────────────────────────────
export default function BudgetView({ userId, demo, demoData }) {
  const [month, setMonth] = useState(currentMonthKey())
  const [editing, setEditing] = useState(null)
  const [showAIProposal, setShowAIProposal] = useState(false)
  const [appliedToast, setAppliedToast] = useState(null)
  const live = useBudget(month, { userId: demo ? null : userId })

  // In demo mode, compute everything locally from demoData
  const isDemo = !!demo
  const demoState = useMemo(
    () => isDemo ? buildDemoState({ demoData, month }) : null,
    [isDemo, demoData, month]
  )

  const rows         = isDemo ? demoState.rows         : live.rows
  const totals       = isDemo ? demoState.totals       : live.totals
  const monthIncome  = isDemo ? demoState.monthIncome  : live.monthIncome
  const toBudget     = isDemo ? demoState.toBudget     : live.toBudget
  const loading      = isDemo ? false                  : live.loading
  const error        = isDemo ? null                   : live.error
  const save         = isDemo ? (async () => ({ error: 'В демо-режиме изменения не сохраняются' })) : live.save
  const remove       = isDemo ? (async () => ({ error: 'В демо-режиме изменения не сохраняются' })) : live.remove

  const existingCategories = useMemo(
    () => rows.filter(r => !r.unbudgeted).map(r => r.category),
    [rows]
  )

  const handleDelete = async (row) => {
    if (!row.id) return
    if (!confirm(`Удалить бюджет на категорию "${row.category}"?`)) return
    await remove(row.id)
  }

  const overCount = rows.filter(r => r.status === 'over' && !r.unbudgeted).length
  const warningCount = rows.filter(r => r.status === 'warning').length

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6">

        {/* ── Header: month switcher + label ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-white font-semibold text-lg sm:text-xl">Бюджет</h2>
            <p className="text-white/40 text-xs sm:text-sm mt-0.5">
              Сколько ещё можно потратить из запланированного
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {!isDemo && (
              <button
                onClick={() => setShowAIProposal(true)}
                className="flex items-center gap-1.5 bg-mint/15 hover:bg-mint/25 border border-mint/30 text-mint text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
                title="Сгенерировать бюджет на основе истории"
              >
                <span className="text-base leading-none">✦</span>
                <span>AI-бюджет</span>
              </button>
            )}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setMonth(shiftMonth(month, -1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Предыдущий месяц"
              >
                ‹
              </button>
              <span className="text-white/85 font-medium text-xs sm:text-sm px-3 min-w-[110px] text-center">
                {formatMonthLabel(month)}
              </span>
              <button
                onClick={() => setMonth(shiftMonth(month, 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Следующий месяц"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* ── Summary strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <SummaryCard
            label="Доход"
            value={`${fmt(monthIncome)} ₸`}
            tone="neutral"
          />
          <SummaryCard
            label="Запланировано"
            value={`${fmt(totals.planned)} ₸`}
            tone="neutral"
          />
          <SummaryCard
            label="Потрачено"
            value={`${fmt(totals.spent)} ₸`}
            tone="neutral"
          />
          <SummaryCard
            label={totals.remaining >= 0 ? 'Осталось всего' : 'Перерасход'}
            value={`${totals.remaining >= 0 ? '' : '−'}${fmt(Math.abs(totals.remaining))} ₸`}
            tone={totals.remaining >= 0 ? 'mint' : 'red'}
          />
        </div>

        {/* ── "To budget" hint (Actual Budget signature) ── */}
        {monthIncome > 0 && (
          <div className={`mb-4 rounded-xl border px-4 py-3 ${
            toBudget > 0
              ? 'border-mint/30 bg-mint/[0.06] text-mint'
              : toBudget < 0
                ? 'border-red-400/30 bg-red-400/[0.06] text-red-400'
                : 'border-white/10 bg-white/[0.03] text-white/60'
          }`}>
            <p className="text-xs sm:text-sm">
              {toBudget > 0 && (<>
                <span className="font-bold">К распределению: {fmt(toBudget)} ₸</span>
                <span className="text-white/50 ml-2">— назначь их на категории, чтобы каждый тенге имел работу</span>
              </>)}
              {toBudget < 0 && (<>
                <span className="font-bold">Перебюджетировано: {fmt(Math.abs(toBudget))} ₸</span>
                <span className="text-white/50 ml-2">— планы превышают доход; убавь лимиты в категориях</span>
              </>)}
              {toBudget === 0 && <span className="font-medium">Бюджет сбалансирован — каждый тенге распределён.</span>}
            </p>
          </div>
        )}

        {/* ── Status alerts ── */}
        {(overCount > 0 || warningCount > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {overCount > 0 && (
              <div className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-full px-3 py-1.5">
                {overCount} {overCount === 1 ? 'категория превышена' : 'категорий превышено'}
              </div>
            )}
            {warningCount > 0 && (
              <div className="text-xs bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-full px-3 py-1.5">
                {warningCount} близко к лимиту
              </div>
            )}
          </div>
        )}

        {/* ── Loading / error ── */}
        {loading && (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-mint border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-4 text-sm">
            Ошибка: {error}
          </div>
        )}

        {/* ── Rows ── */}
        {!loading && (
          <div className="space-y-2 mb-4">
            {rows.length === 0 && (
              <div className="text-center py-10 text-white/40 text-sm">
                В этом месяце пока нет бюджетов.<br />
                Добавь первую категорию ниже.
              </div>
            )}
            {rows.map((row) => (
              <BudgetRow
                key={row.id || `unbudgeted-${row.category}`}
                row={row}
                onEdit={setEditing}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* ── Add new category ── */}
        {!loading && (
          <AddCategoryForm
            existingCategories={existingCategories}
            onAdd={save}
          />
        )}

        {/* ── Edit modal ── */}
        {editing && (
          <EditBudgetModal
            row={editing}
            onClose={() => setEditing(null)}
            onSave={save}
          />
        )}

        {/* ── AI proposal modal ── */}
        {showAIProposal && (
          <AIProposalModal
            userId={userId}
            targetMonth={month}
            knownCategories={existingCategories}
            onClose={() => setShowAIProposal(false)}
            onApplied={(count) => {
              setAppliedToast(`Применено ${count} ${count === 1 ? 'категория' : 'категорий'}`)
              setTimeout(() => setAppliedToast(null), 4000)
              if (typeof live?.reload === 'function') live.reload()
            }}
          />
        )}

        {/* ── Toast ── */}
        {appliedToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-mint text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow-2xl z-50 flex items-center gap-2">
            <span>✓</span> {appliedToast}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── AI Budget Proposal Modal ────────────────────────────────────────────────
function AIProposalModal({ userId, targetMonth, knownCategories, onClose, onApplied }) {
  const [step, setStep] = useState('loading') // 'loading' | 'review' | 'applying' | 'error'
  const [proposal, setProposal] = useState(null)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(new Set()) // categories user wants to apply
  const [overrides, setOverrides] = useState({}) // category -> custom planned amount

  // Trigger generation on mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await generateBudgetProposal({ userId, targetMonth, knownCategories })
      if (cancelled) return
      if (res.error) {
        setError(res.error)
        setStep('error')
        return
      }
      setProposal(res)
      setSelected(new Set(res.items.map((i) => i.category)))
      setStep('review')
    })()
    return () => { cancelled = true }
  }, [userId, targetMonth])

  const toggle = (cat) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const handleApply = async () => {
    if (!proposal) return
    const items = proposal.items
      .filter((it) => selected.has(it.category))
      .map((it) => ({
        category: it.category,
        planned: overrides[it.category] !== undefined ? Number(overrides[it.category]) : it.planned,
        note: it.note,
      }))
    if (items.length === 0) {
      setError('Выберите хотя бы одну категорию')
      return
    }
    setStep('applying')
    setError('')
    const res = await applyBudgetProposal({ userId, month: targetMonth, items })
    if (res.error) {
      setError(res.error)
      setStep('review')
      return
    }
    onApplied?.(res.applied)
    onClose()
  }

  const totalSelected = proposal
    ? proposal.items
        .filter((it) => selected.has(it.category))
        .reduce((s, it) => s + (overrides[it.category] !== undefined ? Number(overrides[it.category]) : it.planned), 0)
    : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#161616] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
          <div>
            <h3 className="text-white font-semibold text-sm">✦ AI-генератор бюджета</h3>
            <p className="text-white/40 text-xs mt-0.5">
              На основе истории расходов за последние 3 месяца
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 'loading' && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-mint border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/60 text-sm">Анализирую вашу историю расходов…</p>
              <p className="text-white/30 text-xs mt-1">Это займёт ~10 секунд</p>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-10">
              <p className="text-red-400 text-sm font-semibold mb-2">Не удалось сгенерировать бюджет</p>
              <p className="text-white/50 text-xs">{error}</p>
            </div>
          )}

          {step === 'review' && proposal && (
            <div>
              {proposal.fromFallback && (
                <div className="bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-lg px-3 py-2 text-xs mb-3">
                  AI вернул некорректный ответ — использовано усреднение по истории.
                </div>
              )}
              <p className="text-white/50 text-xs mb-3">
                Анализ по месяцам: {proposal.monthsAnalyzed.join(', ')}.<br/>
                Снимите галочки с тех категорий, которые не хотите включать.
              </p>
              <div className="space-y-1.5">
                {proposal.items.map((item) => {
                  const isSel = selected.has(item.category)
                  const customVal = overrides[item.category]
                  const finalAmount = customVal !== undefined ? Number(customVal) : item.planned
                  return (
                    <label
                      key={item.category}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                        isSel
                          ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.06]'
                          : 'bg-white/[0.01] border-white/5 opacity-50 hover:opacity-75'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSel}
                        onChange={() => toggle(item.category)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-mint focus:ring-mint/30 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white/90 text-sm font-medium truncate">{item.category}</p>
                        <p className="text-white/40 text-[11px] mt-0.5 truncate">
                          {item.note ? `${item.note} · ` : ''}среднее за 3 мес: {Math.round(item.prevAvg).toLocaleString('ru-RU')} ₸
                        </p>
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={customVal !== undefined ? customVal : item.planned}
                        onChange={(e) => setOverrides((prev) => ({ ...prev, [item.category]: e.target.value.replace(/[^\d]/g, '') }))}
                        onClick={(e) => e.stopPropagation()}
                        disabled={!isSel}
                        className="w-24 sm:w-28 bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-white text-right tabular-nums disabled:opacity-40 focus:outline-none focus:border-mint/40"
                      />
                      <span className="text-white/40 text-xs flex-shrink-0">₸</span>
                    </label>
                  )
                })}
              </div>
              {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
            </div>
          )}

          {step === 'applying' && (
            <div className="text-center py-12">
              <div className="w-6 h-6 border-2 border-mint border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/60 text-sm">Применяю бюджет…</p>
            </div>
          )}
        </div>

        {(step === 'review' || step === 'error') && (
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-white/5 flex-shrink-0">
            <p className="text-white/60 text-xs">
              {step === 'review' && proposal && (
                <>Выбрано: {selected.size} из {proposal.items.length} · Сумма: <span className="text-white font-semibold">{Math.round(totalSelected).toLocaleString('ru-RU')} ₸</span></>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="text-white/50 hover:text-white text-sm px-3 py-2"
              >
                Отмена
              </button>
              {step === 'review' && (
                <button
                  onClick={handleApply}
                  disabled={selected.size === 0}
                  className="bg-mint hover:bg-mint/90 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
                >
                  Применить ({selected.size})
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value, tone = 'neutral' }) {
  const valueColor =
    tone === 'mint' ? 'text-mint'
    : tone === 'red' ? 'text-red-400'
    : 'text-white'
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5">
      <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">{label}</p>
      <p className={`mt-1 font-bold text-sm sm:text-base tabular-nums ${valueColor}`}>{value}</p>
    </div>
  )
}
