// ─────────────────────────────────────────────────────────────────────────────
// GoalsView — Savings Goals CRUD (Phase 2)
// Lets users create targets ("save 500k for vacation by December"), track
// progress, and manually add/withdraw from each goal.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../../lib/supabase'

const fmt = (n) => Math.round(Number(n) || 0).toLocaleString('ru-RU')

// ─── Demo data ──────────────────────────────────────────────────────────────
const DEMO_GOALS = [
  { id: 'demo-1', name: 'Отпуск',         target_amount: 500000, saved_amount: 320000, deadline: '2026-08-01', color: '#4F8EF7', icon: '✈️' },
  { id: 'demo-2', name: 'iPhone',          target_amount: 650000, saved_amount: 150000, deadline: '2026-12-01', color: '#A855F7', icon: '📱' },
  { id: 'demo-3', name: 'Подушка безопасности', target_amount: 2000000, saved_amount: 880000, deadline: null, color: '#10B981', icon: '🛡️' },
  { id: 'demo-4', name: 'Курс по дизайну', target_amount: 120000, saved_amount: 120000, deadline: '2026-04-01', color: '#F59E0B', icon: '🎨' },
]

const DEFAULT_COLORS = ['#4F8EF7', '#A855F7', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316']
const ICONS = ['🎯', '✈️', '🏠', '🚗', '📱', '💻', '🎓', '🛡️', '💍', '🎨', '📚', '🏋️', '🎵', '🌴', '💰', '🧳']

// ─── Goal Card ──────────────────────────────────────────────────────────────
function GoalCard({ goal, onEdit, onDeposit }) {
  const { name, target_amount, saved_amount, deadline, color, icon } = goal
  const target = Number(target_amount) || 0
  const saved = Number(saved_amount) || 0
  const pct = target > 0 ? Math.min(1, saved / target) : 0
  const pctNum = Math.round(pct * 100)
  const remaining = Math.max(0, target - saved)
  const isComplete = saved >= target && target > 0

  // Days left
  let daysLeft = null
  if (deadline) {
    const diff = new Date(deadline) - new Date()
    daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  return (
    <div className={`relative bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-2xl p-4 sm:p-5 transition-colors group ${isComplete ? 'ring-1 ring-mint/30' : ''}`}>
      {/* Complete badge */}
      {isComplete && (
        <div className="absolute -top-2 -right-2 bg-mint text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg">
          Достигнуто!
        </div>
      )}

      {/* Header: icon + name */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30` }}
        >
          {icon || '🎯'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{name}</h3>
          <p className="text-white/40 text-xs mt-0.5">
            {isComplete ? 'Цель достигнута' : `Осталось: ${fmt(remaining)} ₸`}
          </p>
        </div>
        <button
          onClick={() => onEdit(goal)}
          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
          title="Редактировать"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4l4 4-11 11H5v-4L16 4Z" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pctNum}%`, backgroundColor: color }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/70 tabular-nums">{fmt(saved)} / {fmt(target)} ₸</span>
        <div className="flex items-center gap-3">
          {daysLeft !== null && !isComplete && (
            <span className={`${daysLeft < 30 ? 'text-amber-400' : 'text-white/40'}`}>
              {daysLeft} дн
            </span>
          )}
          <span className="font-bold" style={{ color }}>{pctNum}%</span>
        </div>
      </div>

      {/* Deposit button */}
      {!isComplete && (
        <button
          onClick={() => onDeposit(goal)}
          className="mt-3 w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg py-2 text-xs text-white/60 hover:text-white font-medium transition-colors"
        >
          + Пополнить
        </button>
      )}
    </div>
  )
}

// ─── Add/Edit Goal Modal ────────────────────────────────────────────────────
function GoalModal({ goal, onClose, onSave, onDelete }) {
  const isNew = !goal?.id || String(goal.id).startsWith('demo')
  const [name, setName] = useState(goal?.name || '')
  const [target, setTarget] = useState(goal?.target_amount ? String(goal.target_amount) : '')
  const [saved, setSaved] = useState(goal?.saved_amount ? String(goal.saved_amount) : '0')
  const [deadline, setDeadline] = useState(goal?.deadline || '')
  const [color, setColor] = useState(goal?.color || DEFAULT_COLORS[0])
  const [icon, setIcon] = useState(goal?.icon || '🎯')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Укажите название цели'); return }
    const targetNum = Number(target.replace(/\s/g, ''))
    if (!targetNum || targetNum <= 0) { setError('Укажите целевую сумму'); return }
    setSaving(true)
    setError('')
    const res = await onSave({
      id: goal?.id || null,
      name: name.trim(),
      target_amount: targetNum,
      saved_amount: Number(saved.replace(/\s/g, '')) || 0,
      deadline: deadline || null,
      color,
      icon,
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
        className="relative bg-[#161616] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-white font-semibold text-sm">
            {isNew ? 'Новая цель' : 'Редактировать цель'}
          </h3>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white text-sm">
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Название *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Отпуск на Бали"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-mint/40"
              autoFocus
            />
          </div>

          {/* Target amount */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Целевая сумма, ₸ *</label>
            <input
              type="text"
              inputMode="numeric"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="500000"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-mint/40 tabular-nums"
            />
          </div>

          {/* Saved amount (editable on edit, 0 for new) */}
          {!isNew && (
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">Уже накоплено, ₸</label>
              <input
                type="text"
                inputMode="numeric"
                value={saved}
                onChange={(e) => setSaved(e.target.value)}
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-mint/40 tabular-nums"
              />
            </div>
          )}

          {/* Deadline */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Дедлайн (необязательно)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-mint/40"
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Иконка</label>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-colors ${
                    icon === ic ? 'bg-white/15 ring-1 ring-white/30' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Цвет</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white/40' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between gap-2">
          <div>
            {!isNew && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(goal)}
                className="text-red-400/60 hover:text-red-400 text-xs transition-colors"
              >
                Удалить цель
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="text-white/50 hover:text-white text-sm px-4 py-2">
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
        </div>
      </form>
    </div>
  )
}

// ─── Deposit Modal ──────────────────────────────────────────────────────────
function DepositModal({ goal, onClose, onDeposit }) {
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const remaining = Math.max(0, (goal?.target_amount || 0) - (goal?.saved_amount || 0))

  const handleDeposit = async (e) => {
    e.preventDefault()
    const num = Number(amount.replace(/\s/g, ''))
    if (!num || num <= 0) { setError('Введите сумму'); return }
    setSaving(true)
    setError('')
    const res = await onDeposit(goal, num)
    setSaving(false)
    if (res?.error) setError(res.error)
    else onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleDeposit}
        className="relative bg-[#161616] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-white font-semibold text-sm">Пополнить: {goal.name}</h3>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white text-sm">✕</button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <p className="text-white/50 text-xs">Осталось до цели: <span className="text-white font-semibold">{fmt(remaining)} ₸</span></p>
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Сумма, ₸"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-mint/40 tabular-nums"
            autoFocus
          />
          {/* Quick amounts */}
          <div className="flex flex-wrap gap-1.5">
            {[10000, 25000, 50000, 100000].filter(v => v <= remaining || remaining === 0).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v))}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/60 hover:text-white transition-colors tabular-nums"
              >
                {fmt(v)} ₸
              </button>
            ))}
            {remaining > 0 && (
              <button
                type="button"
                onClick={() => setAmount(String(remaining))}
                className="bg-mint/10 hover:bg-mint/20 border border-mint/20 rounded-lg px-2.5 py-1.5 text-xs text-mint hover:text-mint transition-colors"
              >
                Всё ({fmt(remaining)} ₸)
              </button>
            )}
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        <div className="px-5 py-4 border-t border-white/5 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="text-white/50 hover:text-white text-sm px-4 py-2">Отмена</button>
          <button
            type="submit"
            disabled={saving}
            className="bg-mint hover:bg-mint/90 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
          >
            {saving ? '…' : 'Пополнить'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Main view ──────────────────────────────────────────────────────────────
export default function GoalsView({ userId, demo }) {
  const [goals, setGoals] = useState(demo ? DEMO_GOALS : [])
  const [loading, setLoading] = useState(!demo)
  const [error, setError] = useState(null)
  const [editingGoal, setEditingGoal] = useState(null) // null | 'new' | goal object
  const [depositGoal, setDepositGoal] = useState(null)
  const [toast, setToast] = useState(null)

  const isDemo = !!demo

  const fetchGoals = useCallback(async () => {
    if (isDemo) return
    if (!userId) return
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (err) throw err
      setGoals(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [userId, isDemo])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  const handleSave = async (payload) => {
    if (isDemo) return { error: 'В демо-режиме изменения не сохраняются' }
    const row = {
      user_id: userId,
      name: payload.name,
      target_amount: payload.target_amount,
      saved_amount: payload.saved_amount,
      deadline: payload.deadline,
      color: payload.color,
      icon: payload.icon,
    }
    let res
    if (payload.id && !String(payload.id).startsWith('demo')) {
      res = await supabase.from('savings_goals').update(row).eq('id', payload.id).select().single()
    } else {
      res = await supabase.from('savings_goals').insert(row).select().single()
    }
    if (res.error) return { error: res.error.message }
    await fetchGoals()
    showToast(payload.id ? 'Цель обновлена' : 'Цель создана')
    return { data: res.data }
  }

  const handleDelete = async (goal) => {
    if (isDemo) return
    if (!goal?.id) return
    if (!confirm(`Удалить цель "${goal.name}"?`)) return
    const { error: delErr } = await supabase.from('savings_goals').delete().eq('id', goal.id)
    if (delErr) { showToast(`Ошибка: ${delErr.message}`); return }
    setEditingGoal(null)
    await fetchGoals()
    showToast('Цель удалена')
  }

  const handleDeposit = async (goal, amount) => {
    if (isDemo) return { error: 'В демо-режиме изменения не сохраняются' }
    const newSaved = (Number(goal.saved_amount) || 0) + amount
    const { error: err } = await supabase
      .from('savings_goals')
      .update({ saved_amount: newSaved })
      .eq('id', goal.id)
    if (err) return { error: err.message }
    await fetchGoals()
    showToast(`+${fmt(amount)} ₸ → ${goal.name}`)
    return {}
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  // Stats
  const totalTarget = goals.reduce((s, g) => s + (Number(g.target_amount) || 0), 0)
  const totalSaved = goals.reduce((s, g) => s + (Number(g.saved_amount) || 0), 0)
  const completedCount = goals.filter(g => (Number(g.saved_amount) || 0) >= (Number(g.target_amount) || 1)).length

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-white font-semibold text-lg sm:text-xl">Цели накоплений</h2>
            <p className="text-white/40 text-xs sm:text-sm mt-0.5">
              Откладывайте на мечты — видите прогресс в реальном времени
            </p>
          </div>
          <button
            onClick={() => setEditingGoal('new')}
            className="flex items-center gap-1.5 bg-mint hover:bg-mint/90 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <span className="text-base leading-none">+</span>
            <span>Новая цель</span>
          </button>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5">
            <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">Всего целей</p>
            <p className="mt-1 font-bold text-sm sm:text-base text-white tabular-nums">{goals.length}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5">
            <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">Накоплено</p>
            <p className="mt-1 font-bold text-sm sm:text-base text-mint tabular-nums">{fmt(totalSaved)} ₸</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5">
            <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">Цель</p>
            <p className="mt-1 font-bold text-sm sm:text-base text-white tabular-nums">{fmt(totalTarget)} ₸</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5">
            <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">Достигнуто</p>
            <p className="mt-1 font-bold text-sm sm:text-base text-mint tabular-nums">{completedCount} из {goals.length}</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-mint border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-4 text-sm">
            Ошибка: {error}
          </div>
        )}

        {/* Goals grid */}
        {!loading && goals.length === 0 && (
          <div className="text-center py-16 text-white/30">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-sm font-medium">Пока нет целей</p>
            <p className="text-xs mt-1">Создайте первую цель и начните откладывать</p>
          </div>
        )}

        {!loading && goals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={setEditingGoal}
                onDeposit={setDepositGoal}
              />
            ))}
          </div>
        )}

        {/* Edit/Create modal */}
        {editingGoal && (
          <GoalModal
            goal={editingGoal === 'new' ? {} : editingGoal}
            onClose={() => setEditingGoal(null)}
            onSave={handleSave}
            onDelete={editingGoal !== 'new' ? handleDelete : null}
          />
        )}

        {/* Deposit modal */}
        {depositGoal && (
          <DepositModal
            goal={depositGoal}
            onClose={() => setDepositGoal(null)}
            onDeposit={handleDeposit}
          />
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-mint text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow-2xl z-50 flex items-center gap-2">
            <span>✓</span> {toast}
          </div>
        )}
      </div>
    </div>
  )
}
