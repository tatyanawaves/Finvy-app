// ─────────────────────────────────────────────────────────────────────────────
// useBudget(month) — Phase 1 envelope budgeting hook
//
// Returns:
//   {
//     rows: [{ category, planned, rolloverIn, spent, remaining, percentUsed,
//              status: 'ok'|'warning'|'over', notes, id, rolloverEnabled }],
//     totals: { planned, spent, remaining, rolloverIn },
//     monthIncome, toBudget,
//     loading, error,
//     reload, save, remove
//   }
//
// Spent is computed live from the `transactions` table for the given month.
// Income is summed for the same month (used for "to budget" display).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'

// Build [from, to) ISO timestamps for a 'YYYY-MM' month
function monthRange(month) {
  const [yearStr, monthStr] = month.split('-')
  const y = Number(yearStr)
  const m = Number(monthStr) - 1 // 0-indexed
  const from = new Date(Date.UTC(y, m, 1)).toISOString()
  const to = new Date(Date.UTC(y, m + 1, 1)).toISOString()
  return { from, to }
}

function deriveStatus(percent, remaining) {
  if (remaining < 0) return 'over'
  if (percent >= 0.9) return 'warning'
  return 'ok'
}

export function useBudget(month, { userId } = {}) {
  const [budgets, setBudgets] = useState([])
  const [spentMap, setSpentMap] = useState({})
  const [monthIncome, setMonthIncome] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    if (!userId || !month) return
    // Demo mode: don't hit Supabase (user_id is the literal string "demo")
    if (userId === 'demo') {
      setBudgets([])
      setSpentMap({})
      setMonthIncome(0)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { from, to } = monthRange(month)

      // 1. Fetch budget rows for the month
      const { data: budgetRows, error: bErr } = await supabase
        .from('monthly_budgets')
        .select('id, category, planned_amount, rollover_in, rollover_enabled, notes')
        .eq('user_id', userId)
        .eq('month', month)
      if (bErr) throw bErr

      // 2. Fetch transactions for the month (only category + amount + type)
      const { data: txs, error: tErr } = await supabase
        .from('transactions')
        .select('category, amount, type')
        .eq('user_id', userId)
        .gte('date', from)
        .lt('date', to)
      if (tErr) throw tErr

      // 3. Reduce: spent per category + total income
      const spent = {}
      let income = 0
      for (const tx of txs || []) {
        if (tx.type === 'expense') {
          const cat = tx.category || 'Другое'
          spent[cat] = (spent[cat] || 0) + Math.abs(Number(tx.amount) || 0)
        } else if (tx.type === 'income') {
          income += Math.abs(Number(tx.amount) || 0)
        }
      }

      setBudgets(budgetRows || [])
      setSpentMap(spent)
      setMonthIncome(income)
    } catch (e) {
      console.error('[useBudget]', e)
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }, [userId, month])

  useEffect(() => { reload() }, [reload])

  // ─── Derived view: rows + totals ───────────────────────────────────────────
  const { rows, totals, toBudget } = useMemo(() => {
    const seen = new Set()
    const out = []

    for (const b of budgets) {
      seen.add(b.category)
      const planned = Number(b.planned_amount) || 0
      const rollover = Number(b.rollover_in) || 0
      const cap = planned + rollover
      const spent = Number(spentMap[b.category] || 0)
      const remaining = cap - spent
      const percentUsed = cap > 0 ? spent / cap : 0
      out.push({
        id: b.id,
        category: b.category,
        planned,
        rolloverIn: rollover,
        cap,
        spent,
        remaining,
        percentUsed,
        status: deriveStatus(percentUsed, remaining),
        notes: b.notes || '',
        rolloverEnabled: !!b.rollover_enabled,
        unbudgeted: false,
      })
    }

    // Categories with spending but no budget → show as "unbudgeted"
    for (const [category, spentAmt] of Object.entries(spentMap)) {
      if (seen.has(category)) continue
      out.push({
        id: null,
        category,
        planned: 0,
        rolloverIn: 0,
        cap: 0,
        spent: spentAmt,
        remaining: -spentAmt,
        percentUsed: 1,
        status: 'over',
        notes: '',
        rolloverEnabled: true,
        unbudgeted: true,
      })
    }

    out.sort((a, b) => {
      // Status priority: over > warning > ok; then biggest planned first
      const order = { over: 0, warning: 1, ok: 2 }
      const so = order[a.status] - order[b.status]
      if (so !== 0) return so
      return b.planned - a.planned
    })

    const totalPlanned = out.reduce((s, r) => s + r.planned, 0)
    const totalRollover = out.reduce((s, r) => s + r.rolloverIn, 0)
    const totalSpent = out.reduce((s, r) => s + r.spent, 0)
    const totalRemaining = totalPlanned + totalRollover - totalSpent

    return {
      rows: out,
      totals: {
        planned: totalPlanned,
        rolloverIn: totalRollover,
        spent: totalSpent,
        remaining: totalRemaining,
      },
      // "К распределению" — income minus everything assigned to envelopes
      toBudget: monthIncome - totalPlanned,
    }
  }, [budgets, spentMap, monthIncome])

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const save = useCallback(async ({ id, category, plannedAmount, notes, rolloverEnabled }) => {
    if (!userId || !month || !category) return { error: 'missing args' }
    const payload = {
      user_id: userId,
      month,
      category,
      planned_amount: Number(plannedAmount) || 0,
      notes: notes || null,
      rollover_enabled: rolloverEnabled !== false,
    }
    let res
    if (id) {
      res = await supabase.from('monthly_budgets').update(payload).eq('id', id).select().single()
    } else {
      res = await supabase.from('monthly_budgets').insert(payload).select().single()
    }
    if (res.error) return { error: res.error.message }
    await reload()
    return { data: res.data }
  }, [userId, month, reload])

  const remove = useCallback(async (id) => {
    if (!id) return { error: 'no id' }
    const { error: delErr } = await supabase.from('monthly_budgets').delete().eq('id', id)
    if (delErr) return { error: delErr.message }
    await reload()
    return { data: true }
  }, [reload])

  return {
    rows,
    totals,
    monthIncome,
    toBudget,
    loading,
    error,
    reload,
    save,
    remove,
  }
}

// ─── Lightweight helper: spent for a single category in a month ──────────────
// Used by AddTransactionModal to show "осталось в категории X"
export async function fetchCategorySpent({ userId, month, category }) {
  if (!userId || !month || !category) return 0
  if (userId === 'demo') return 0
  const { from, to } = monthRange(month)
  const { data, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .eq('category', category)
    .gte('date', from)
    .lt('date', to)
  if (error) {
    console.warn('[fetchCategorySpent]', error.message)
    return 0
  }
  return (data || []).reduce((s, t) => s + Math.abs(Number(t.amount) || 0), 0)
}

// ─── Helper: get the budget row (if any) for a (month, category) ─────────────
export async function fetchBudgetRow({ userId, month, category }) {
  if (!userId || !month || !category) return null
  if (userId === 'demo') return null
  const { data, error } = await supabase
    .from('monthly_budgets')
    .select('id, planned_amount, rollover_in, rollover_enabled, notes')
    .eq('user_id', userId)
    .eq('month', month)
    .eq('category', category)
    .maybeSingle()
  if (error) {
    console.warn('[fetchBudgetRow]', error.message)
    return null
  }
  return data
}

// ─── Helper: format YYYY-MM key for current month ────────────────────────────
export function currentMonthKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

// ─── Helper: roll over a month's leftover into the next month ───────────────
// Calls the SQL function monthly_budgets_rollover. Returns { items, error }.
export async function rolloverMonth({ userId, fromMonth, toMonth }) {
  if (!userId || userId === 'demo') return { error: 'demo' }
  const { data, error } = await supabase.rpc('monthly_budgets_rollover', {
    p_user_id: userId,
    p_from_month: fromMonth,
    p_to_month: toMonth,
  })
  if (error) return { error: error.message }
  return { items: data || [] }
}

// ─── Helper: shift a month key by N months ───────────────────────────────────
export function shiftMonth(monthKey, delta) {
  const [yearStr, monthStr] = monthKey.split('-')
  const d = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1 + delta, 1))
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}
