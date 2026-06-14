import { supabase } from './supabase'

const dateKey = (date) => date.toISOString().slice(0, 10)

function parseSurveyData(value) {
  if (!value) return {}
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

function monthKeysBetween(from, to) {
  const start = new Date(`${from}T00:00:00`)
  const end = new Date(`${to}T00:00:00`)
  start.setDate(1)
  end.setDate(1)

  const months = []
  const cursor = new Date(start)
  while (cursor <= end) {
    months.push({
      year: cursor.getFullYear(),
      month: cursor.getMonth(),
      key: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`,
      lastDay: new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate(),
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return months
}

async function fetchPlannedPayroll(userId) {
  if (!userId) return null

  try {
    // 1. Try Supabase first
    const { data, error } = await supabase
      .from('fm_planned_payroll')
      .select('amount, description, category')
      .eq('user_id', userId)
      .maybeSingle()

    if (!error && data) return data

    // 2. Fallback to localStorage
    const saved = JSON.parse(localStorage.getItem(`finvy_planned_payroll_${userId}`) || 'null')
    if (saved?.amount > 0) return saved
  } catch (e) {
    console.warn('[fetchPlannedPayroll] error:', e)
  }

  return null
}

async function payrollOperations(userId, from, to) {
  const plannedPayroll = await fetchPlannedPayroll(userId)
  if (!plannedPayroll?.amount) return []

  return monthKeysBetween(from, to).map(m => {
    const day = String(Math.min(25, m.lastDay)).padStart(2, '0')
    return {
      id: `planned-payroll-${m.key}`,
      type: 'expense',
      amount: plannedPayroll.amount,
      date: `${m.key}-${day}`,
      description: plannedPayroll.description || 'Payroll plan',
      category: plannedPayroll.category || 'Payroll',
      planned: true,
      plannedKind: 'payroll',
      source: 'payroll',
    }
  })
}

function maxDateKey(a, b) {
  return a > b ? a : b
}

function minDateKey(a, b) {
  return a < b ? a : b
}

function monthlyGoalReserveOperations(goals = [], from, to) {
  const today = new Date()
  const todayKey = dateKey(today)
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`

  return goals.flatMap(goal => {
    const target = Number(goal.target_amount) || 0
    const saved = Number(goal.saved_amount) || 0
    const remaining = Math.max(0, target - saved)
    if (!remaining || !goal.deadline || goal.deadline < todayKey) return []

    const planningMonths = monthKeysBetween(currentMonth, goal.deadline)
    const monthlyReserve = Math.ceil(remaining / Math.max(1, planningMonths.length))
    const rangeFrom = maxDateKey(from, currentMonth)
    const rangeTo = minDateKey(to, goal.deadline)
    if (rangeFrom > rangeTo) return []

    return monthKeysBetween(rangeFrom, rangeTo).map(m => {
      const deadlineMonth = goal.deadline.slice(0, 7) === m.key
      const targetDay = deadlineMonth
        ? Number(goal.deadline.slice(8, 10))
        : Math.min(20, m.lastDay)
      const rawDate = `${m.key}-${String(targetDay).padStart(2, '0')}`
      const opDate = maxDateKey(rawDate, todayKey)

      return {
        id: `planned-goal-${goal.id}-${m.key}`,
        type: 'expense',
        amount: monthlyReserve,
        date: opDate,
        description: `Reserve: ${goal.name}`,
        category: 'Financial goals',
        planned: true,
        plannedKind: 'goal',
        source: 'goals',
        goalId: goal.id,
      }
    })
  }).filter(op => op.date >= from && op.date <= to)
}

async function goalReserveOperations(userId, from, to) {
  if (!userId) return []

  const { data } = await supabase
    .from('savings_goals')
    .select('id, name, target_amount, saved_amount, deadline')
    .eq('user_id', userId)
    .not('deadline', 'is', null)

  return monthlyGoalReserveOperations(data || [], from, to)
}

async function invoiceOperations(userId, from, to) {
  if (!userId) return []

  const { data } = await supabase
    .from('fm_invoices')
    .select('id, number, client_name, amount, currency, status, due_date, description')
    .eq('user_id', userId)
    .in('status', ['pending', 'overdue'])
    .gte('due_date', from)
    .lte('due_date', to)

  return (data || []).map(inv => ({
    id: `planned-invoice-${inv.id}`,
    type: 'income',
    amount: inv.amount || 0,
    date: inv.due_date,
    description: `${inv.client_name || 'Client'} - ${inv.number || 'invoice'}`,
    category: 'Expected invoice',
    planned: true,
    plannedKind: 'invoice',
    source: 'invoice',
  }))
}

async function surveyObligationOperations(userId, from, to) {
  if (!userId) return []

  const { data } = await supabase
    .from('fm_settings')
    .select('survey_data')
    .eq('user_id', userId)
    .maybeSingle()

  const survey = parseSurveyData(data?.survey_data)
  const obligations = Array.isArray(survey.monthlyObligations) ? survey.monthlyObligations : []
  if (!obligations.length) return []

  return monthKeysBetween(from, to).flatMap(month => obligations
    .filter(item => item?.enabled !== false && Number(item?.amount) > 0)
    .map(item => {
      const day = Math.min(Math.max(1, Number(item.day) || 1), month.lastDay)
      const paymentDate = `${month.key}-${String(day).padStart(2, '0')}`
      return {
        id: `planned-obligation-${String(item.name || 'payment').toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-')}-${month.key}`,
        type: 'expense',
        amount: Number(item.amount) || 0,
        date: paymentDate,
        description: item.name || 'Monthly payment',
        category: item.category || item.name || 'Monthly payments',
        planned: true,
        plannedKind: 'obligation',
        source: 'onboarding',
      }
    })
  ).filter(op => op.date >= from && op.date <= to)
}

export async function getPlannedOperations({ userId, from, to }) {
  if (!from || !to) return []

  const [invoices, goals, obligations, payroll] = await Promise.all([
    invoiceOperations(userId, from, to),
    goalReserveOperations(userId, from, to),
    surveyObligationOperations(userId, from, to),
    payrollOperations(userId, from, to),
  ])

  return [
    ...invoices,
    ...obligations,
    ...payroll,
    ...goals,
  ].filter(op => op.date >= from && op.date <= to)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function summarizePlannedOperations(ops = []) {
  return ops.reduce((acc, op) => {
    const amount = Math.abs(op.amount || 0)
    if (op.type === 'income') acc.income += amount
    if (op.type === 'expense') acc.expense += amount
    acc.net = acc.income - acc.expense
    return acc
  }, { income: 0, expense: 0, net: 0 })
}
