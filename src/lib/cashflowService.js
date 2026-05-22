const dateKey = (date) => date.toISOString().slice(0, 10)

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function buildCashflowForecast({
  accounts = [],
  transactions = [],
  plannedOperations = [],
  horizonDays = 60,
  startDate = new Date(),
}) {
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const end = addDays(start, horizonDays)
  const from = dateKey(start)
  const to = dateKey(end)

  const openingBalance = accounts.reduce((sum, account) => sum + (Number(account.balance) || 0), 0)
  const futureActual = transactions
    .filter(tx => tx?.date >= from && tx.date <= to && (tx.type === 'income' || tx.type === 'expense'))
    .map(tx => ({ ...tx, planned: false, source: tx.source || 'transactions' }))
  const futurePlan = plannedOperations
    .filter(op => op?.date >= from && op.date <= to && (op.type === 'income' || op.type === 'expense'))
    .map(op => ({ ...op, planned: true }))
  const events = [...futureActual, ...futurePlan].sort((a, b) => a.date.localeCompare(b.date))

  const byDay = new Map()
  events.forEach(event => {
    const key = event.date
    const row = byDay.get(key) || { date: key, income: 0, expense: 0, events: [] }
    const amount = Math.abs(Number(event.amount) || 0)
    if (event.type === 'income') row.income += amount
    if (event.type === 'expense') row.expense += amount
    row.events.push(event)
    byDay.set(key, row)
  })

  let balance = openingBalance
  let minBalance = openingBalance
  let minDate = from
  let breakDate = null
  const daily = []

  for (let i = 0; i <= horizonDays; i += 1) {
    const key = dateKey(addDays(start, i))
    const row = byDay.get(key) || { date: key, income: 0, expense: 0, events: [] }
    balance += row.income - row.expense
    if (balance < minBalance) {
      minBalance = balance
      minDate = key
    }
    if (balance < 0 && !breakDate) breakDate = key
    daily.push({ ...row, balance })
  }

  const totalIncome = events
    .filter(event => event.type === 'income')
    .reduce((sum, event) => sum + Math.abs(Number(event.amount) || 0), 0)
  const totalExpense = events
    .filter(event => event.type === 'expense')
    .reduce((sum, event) => sum + Math.abs(Number(event.amount) || 0), 0)

  return {
    from,
    to,
    horizonDays,
    openingBalance,
    closingBalance: balance,
    minBalance,
    minDate,
    breakDate,
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    daily,
    events,
    riskLevel: breakDate ? 'critical' : minBalance < openingBalance * 0.2 ? 'warning' : 'ok',
  }
}
