import { supabase } from './supabase'

const DEMO_OPEN_INVOICES = [
  { id: 'demo-plan-inv-1', number: 'INV-0005', client_name: 'ТОО «Алтай Снаб»', amount: 1_180_000, dueDay: 12 },
  { id: 'demo-plan-inv-2', number: 'INV-0006', client_name: 'ИП Султанова А.К.', amount: 420_000, dueDay: 21 },
]

const dateKey = (date) => date.toISOString().slice(0, 10)

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

export function readPlannedPayroll(userId, isDemo = false) {
  try {
    const saved = JSON.parse(localStorage.getItem(`finvy_planned_payroll_${userId}`) || 'null')
    if (saved?.amount > 0) return saved
  } catch {
    // Ignore broken local drafts.
  }

  return isDemo
    ? { amount: 700_000, category: 'Зарплата', description: 'Плановый ФОТ' }
    : null
}

function payrollOperations(userId, isDemo, from, to) {
  const plannedPayroll = readPlannedPayroll(userId, isDemo)
  if (!plannedPayroll?.amount) return []

  return monthKeysBetween(from, to).map(m => {
    const day = String(Math.min(25, m.lastDay)).padStart(2, '0')
    return {
      id: `planned-payroll-${m.key}`,
      type: 'expense',
      amount: plannedPayroll.amount,
      date: `${m.key}-${day}`,
      description: plannedPayroll.description || 'Плановый ФОТ',
      category: plannedPayroll.category || 'Зарплата',
      planned: true,
      plannedKind: 'payroll',
      source: 'payroll',
    }
  })
}

function demoInvoiceOperations(from, to) {
  return monthKeysBetween(from, to).flatMap(m => (
    DEMO_OPEN_INVOICES.map(inv => ({
      id: `planned-invoice-${inv.id}-${m.key}`,
      type: 'income',
      amount: inv.amount || 0,
      date: `${m.key}-${String(Math.min(inv.dueDay, m.lastDay)).padStart(2, '0')}`,
      description: `${inv.client_name || 'Клиент'} · ${inv.number || 'инвойс'}`,
      category: 'Ожидаемый инвойс',
      planned: true,
      plannedKind: 'invoice',
      source: 'invoice',
    }))
  ))
}

async function invoiceOperations(userId, from, to) {
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
    description: `${inv.client_name || 'Клиент'} · ${inv.number || 'инвойс'}`,
    category: 'Ожидаемый инвойс',
    planned: true,
    plannedKind: 'invoice',
    source: 'invoice',
  }))
}

export async function getPlannedOperations({ userId, demo = false, from, to }) {
  if (!from || !to) return []

  const invoices = demo
    ? demoInvoiceOperations(from, to)
    : await invoiceOperations(userId, from, to)

  return [
    ...invoices,
    ...payrollOperations(userId, demo, from, to),
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
