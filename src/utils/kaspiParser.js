// ─────────────────────────────────────────────────────────────────────────────
// Kaspi Bank statement parser (Excel / CSV / PDF)
// Supports: Kaspi Gold, Kaspi Business выписки
// ─────────────────────────────────────────────────────────────────────────────
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { matchCategory, CB_CATS } from '../data/bankCashbacks'

// ── Column name normalization ────────────────────────────────────────────────
const COL_ALIASES = {
  date: [
    'дата операции', 'дата', 'date', 'дата транзакции', 'дата и время',
    'дата совершения операции', 'operation date', 'операция күні',
  ],
  amount: [
    'сумма операции', 'сумма', 'amount', 'сумма в валюте операции',
    'сумма транзакции', 'sum', 'операция сомасы',
  ],
  description: [
    'назначение платежа', 'описание', 'description', 'детали', 'detail',
    'комментарий', 'назначение', 'наименование операции', 'details',
    'операция', 'контрагент', 'получатель', 'төлем мақсаты',
  ],
  type: [
    'тип операции', 'type', 'тип', 'операция типі',
  ],
  currency: [
    'валюта', 'currency', 'валюта операции', 'валюта', 'валютасы',
  ],
  balance: [
    'остаток', 'balance', 'остаток на счете', 'баланс', 'қалдық',
  ],
}

function normalizeCol(raw) {
  const lower = raw.toLowerCase().trim()
  for (const [key, aliases] of Object.entries(COL_ALIASES)) {
    if (aliases.some(a => lower.includes(a))) return key
  }
  return null
}

// ── Parse date from various formats ─────────────────────────────────────────
function parseDate(val) {
  if (!val) return null
  // Excel serial number
  if (typeof val === 'number') {
    const d = new Date((val - 25569) * 86400000)
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  }
  const s = String(val).trim()
  // DD.MM.YYYY or DD.MM.YYYY HH:MM
  const dotMatch4 = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/)
  if (dotMatch4) {
    const [, d, m, y] = dotMatch4
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
  }
  // DD.MM.YY (2-digit year, common in Kaspi PDF)
  const dotMatch2 = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/)
  if (dotMatch2) {
    const [, d, m, y2] = dotMatch2
    const y = parseInt(y2) > 50 ? `19${y2}` : `20${y2}`
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
  }
  // YYYY-MM-DD
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) return isoMatch[0]
  // Try native parsing
  const d = new Date(s)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  return null
}

// ── Parse amount ─────────────────────────────────────────────────────────────
function parseAmount(val) {
  if (typeof val === 'number') return val
  if (!val) return 0
  // Remove spaces, replace comma with dot
  const cleaned = String(val).replace(/\s/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

// ── Detect if a transaction is expense or income ────────────────────────────
function detectType(row, colMap, amount) {
  // Check explicit type column
  if (colMap.type != null) {
    const t = String(row[colMap.type] || '').toLowerCase()
    if (t.includes('расход') || t.includes('списани') || t.includes('debit') || t.includes('покупка') || t.includes('оплата') || t.includes('шығыс')) return 'expense'
    if (t.includes('доход') || t.includes('зачислен') || t.includes('credit') || t.includes('пополнен') || t.includes('возврат') || t.includes('кіріс')) return 'income'
  }
  // Negative amount = expense
  if (amount < 0) return 'expense'
  if (amount > 0) {
    // Check description for expense hints
    const desc = String(row[colMap.description] || '').toLowerCase()
    if (desc.includes('покупка') || desc.includes('оплата') || desc.includes('списание') || desc.includes('перевод')) return 'expense'
    return 'income'
  }
  return 'expense'
}

// ── Auto-categorize by description ──────────────────────────────────────────
const CATEGORY_RULES = [
  { cat: 'Продукты', kw: ['magnum', 'small', 'арбуз', 'arbuz', 'metro', 'продукт', 'супермаркет', 'бакалея', 'рынок', 'дастархан', 'арзан', 'galmart', 'гастроном', 'фламинго', 'лентамаркет', 'twix market', 'нұрханым', 'нурханым', 'market'] },
  { cat: 'Рестораны и кафе', kw: ['ресторан', 'кафе', 'restaurant', 'cafe', 'coffee', 'пицца', 'burger', 'суши', 'wolt', 'chocofood', 'glovo', 'яндекс еда', 'kfc', 'mcdonalds', 'starbucks', 'costa', 'spirito', 'kosta', 'royal'] },
  { cat: 'Топливо', kw: ['азс', 'бензин', 'helios', 'sinooil', 'казмунайгаз', 'gas station', 'fuel', 'топливо', 'petrol', 'гсм'] },
  { cat: 'Такси', kw: ['yandex.go', 'яндекс.go', 'такси', 'taxi', 'яндекс такси', 'indriver', 'uber', 'bolt'] },
  { cat: 'Доставка', kw: ['yandex.delivery', 'яндекс.delivery', 'доставка', 'delivery', 'chocofood доставка', 'wolt доставка'] },
  { cat: 'Подписки', kw: ['spotify', 'claude.ai', 'capcut', 'suno', 'nsucces', 'yandex.plus', 'netflix', 'subscription', 'подписка', 'youtube premium', 'chatgpt', 'midjourney', 'apple.com/bill'] },
  { cat: 'Коммунальные', kw: ['коммунал', 'жкх', 'квартплат', 'свет', 'вода', 'электроэнерг', 'отопление', 'kcell', 'tele2', 'beeline', 'activ', 'altel', 'интернет', 'телефон', 'связь', 'ivc', 'beeline_kz'] },
  { cat: 'Одежда', kw: ['одежда', 'обувь', 'zara', 'h&m', 'lcw', 'бутик', 'fashion', 'adidas', 'nike', 'puma', 'uniqlo'] },
  { cat: 'Аптека', kw: ['аптека', 'pharmacy', 'apteka', 'лекарств', 'медицин', 'клиника', 'стоматолог', 'dentist', 'больница', 'doctor'] },
  { cat: 'Развлечения', kw: ['кино', 'kinopark', 'chaplin', 'concert', 'боулинг', 'спорт', 'фитнес', 'gym', 'клуб', 'bar', 'бар', 'meloman', 'ticketon', 'tarlan', 'park'] },
  { cat: 'Транспорт', kw: ['onay', 'оплата проезда', 'pegas', 'автобус', 'метро', 'жд', 'паркинг'] },
  { cat: 'Kaspi (онлайн)', kw: ['kaspi магазин', 'kaspi shop', 'wildberries', 'ozon', 'aliexpress', 'amazon', 'lamoda', 'маркетплейс'] },
  { cat: 'Кредиты', kw: ['оплата kaspi кредита', 'кредит наличными', 'погашение кредита', 'кредит'] },
  { cat: 'Переводы', kw: ['перевод', 'transfer', 'p2p', 'аударым'] },
  { cat: 'Образование', kw: ['образован', 'школа', 'университет', 'курсы', 'обучен', 'детский сад'] },
  { cat: 'Электроника', kw: ['sulpak', 'сулпак', 'technodom', 'технодом', 'мечта', 'mechta', 'apple', 'iphone', 'samsung', 'btech'] },
]

function autoCategory(description) {
  if (!description) return 'Прочее'
  const lower = description.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.kw.some(kw => lower.includes(kw))) return rule.cat
  }
  return 'Прочее'
}

// ── PDF parsing (Kaspi Gold statement) ──────────────────────────────────────
// Kaspi PDF line format: DD.MM.YY  ± amount ₸  Операция  Детали
// Some lines have a second line with USD amount: (- 4,99 USD)
const KASPI_TX_RE =
  /^(\d{2}\.\d{2}\.\d{2})\s+([+\-])\s*([\d\s]+,\d{2})\s*₸\s+(Перевод|Покупка|Пополнение)\s+(.+)$/

async function parseKaspiPdf(file) {
  const pdfjsLib = await import('pdfjs-dist')
  // Use inline worker via Vite's ?url import fallback
  const workerMod = await import('pdfjs-dist/build/pdf.worker.mjs?url')
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerMod.default

  const buf = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise

  const lines = []
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const tc = await page.getTextContent()
    // Group text items by Y coordinate to reconstruct lines
    const byY = {}
    for (const item of tc.items) {
      const y = Math.round(item.transform[5])
      if (!byY[y]) byY[y] = []
      byY[y].push({ x: item.transform[4], text: item.str })
    }
    // Sort Y descending (PDF coords go bottom-up), then X ascending within each line
    const sortedYs = Object.keys(byY).map(Number).sort((a, b) => b - a)
    for (const y of sortedYs) {
      const lineItems = byY[y].sort((a, b) => a.x - b.x)
      lines.push(lineItems.map(i => i.text).join(' ').trim())
    }
  }

  const transactions = []

  for (const line of lines) {
    const m = line.match(KASPI_TX_RE)
    if (!m) continue

    const [, dateStr, sign, rawAmt, opType, details] = m
    const amount = parseFloat(rawAmt.replace(/\s/g, '').replace(',', '.'))
    if (!amount || isNaN(amount)) continue

    const date = parseDate(dateStr)
    if (!date) continue

    // Determine type from operation column
    let type
    if (opType === 'Пополнение') {
      type = 'income'
    } else if (opType === 'Покупка') {
      type = 'expense'
    } else {
      // Перевод — use sign: - is expense, + is income
      type = sign === '-' ? 'expense' : 'income'
    }

    // Build description: combine opType + details for better categorization
    const description = `${opType} ${details}`.trim()
    const category = autoCategory(description)

    transactions.push({
      date,
      amount,
      type,
      description: details.trim(),
      category,
      currency: 'KZT',
    })
  }

  transactions.sort((a, b) => a.date.localeCompare(b.date))
  return transactions
}

// ── Main parse function ─────────────────────────────────────────────────────
export function parseKaspiStatement(file) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop().toLowerCase()

    if (ext === 'pdf') {
      parseKaspiPdf(file).then(resolve).catch(reject)
      return
    }

    if (ext === 'csv' || ext === 'txt') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        complete: (result) => {
          try {
            const transactions = processRows(result.data, Object.keys(result.data[0] || {}))
            resolve(transactions)
          } catch (e) { reject(e) }
        },
        error: (err) => reject(err),
      })
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const raw = XLSX.utils.sheet_to_json(ws, { defval: '' })
          if (raw.length === 0) {
            reject(new Error('Пустой файл или неизвестный формат'))
            return
          }
          const headers = Object.keys(raw[0])
          const transactions = processRows(raw, headers)
          resolve(transactions)
        } catch (e) { reject(e) }
      }
      reader.onerror = () => reject(new Error('Ошибка чтения файла'))
      reader.readAsArrayBuffer(file)
    } else {
      reject(new Error(`Формат .${ext} не поддерживается. Используйте .xlsx, .xls, .csv или .pdf`))
    }
  })
}

// ── Process parsed rows ─────────────────────────────────────────────────────
function processRows(rows, headers) {
  // Build column map
  const colMap = {}
  headers.forEach((h, idx) => {
    const norm = normalizeCol(h)
    if (norm && colMap[norm] == null) colMap[norm] = h
  })

  if (!colMap.date && !colMap.amount) {
    throw new Error('Не удалось распознать колонки. Нужны хотя бы "Дата" и "Сумма".')
  }

  const transactions = []

  for (const row of rows) {
    const dateStr = parseDate(row[colMap.date])
    if (!dateStr) continue

    const rawAmount = parseAmount(row[colMap.amount])
    if (rawAmount === 0) continue

    const description = String(row[colMap.description] || '').trim()
    const type = detectType(row, colMap, rawAmount)
    const amount = Math.abs(rawAmount)
    const category = autoCategory(description)
    const currency = colMap.currency ? String(row[colMap.currency] || 'KZT').trim() : 'KZT'

    transactions.push({
      date: dateStr,
      amount,
      type,
      description,
      category,
      currency,
    })
  }

  // Sort by date
  transactions.sort((a, b) => a.date.localeCompare(b.date))

  return transactions
}

// ── Compute statistics from parsed transactions ─────────────────────────────
export function computeStatistics(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense')
  const incomes = transactions.filter(t => t.type === 'income')

  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0)
  const totalIncome = incomes.reduce((s, t) => s + t.amount, 0)

  // Spending by category
  const categoryMap = {}
  expenses.forEach(t => {
    if (!categoryMap[t.category]) categoryMap[t.category] = { expense: 0, count: 0 }
    categoryMap[t.category].expense += t.amount
    categoryMap[t.category].count += 1
  })

  // Top category
  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1].expense - a[1].expense)

  // Daily spending
  const dailyMap = {}
  expenses.forEach(t => {
    if (!dailyMap[t.date]) dailyMap[t.date] = 0
    dailyMap[t.date] += t.amount
  })
  const days = Object.keys(dailyMap).length
  const avgDaily = days > 0 ? totalExpense / days : 0

  // Monthly spending
  const monthlyMap = {}
  expenses.forEach(t => {
    const month = t.date.slice(0, 7) // YYYY-MM
    if (!monthlyMap[month]) monthlyMap[month] = 0
    monthlyMap[month] += t.amount
  })
  const months = Object.entries(monthlyMap).sort((a, b) => a[0].localeCompare(b[0]))

  // Date range
  const dates = transactions.map(t => t.date).sort()
  const dateFrom = dates[0] || null
  const dateTo = dates[dates.length - 1] || null

  // Weekly pattern (day of week)
  const weekdayMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  const weekdayCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  expenses.forEach(t => {
    const dow = new Date(t.date).getDay()
    weekdayMap[dow] += t.amount
    weekdayCount[dow] += 1
  })

  const weekdayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  const weekdaySpending = Object.entries(weekdayMap).map(([dow, total]) => ({
    day: weekdayNames[dow],
    total,
    avg: weekdayCount[dow] > 0 ? total / weekdayCount[dow] : 0,
  }))

  // Largest single expense
  const largestExpense = expenses.length > 0
    ? expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0])
    : null

  // Spending map for cashback report (compatible with CashbackReportModal)
  const spendingMap = {}
  for (const [cat, data] of Object.entries(categoryMap)) {
    spendingMap[cat] = { expense: data.expense }
  }

  return {
    totalExpense,
    totalIncome,
    netFlow: totalIncome - totalExpense,
    transactionCount: transactions.length,
    expenseCount: expenses.length,
    incomeCount: incomes.length,
    topCategories,
    categoryMap,
    avgDaily,
    months,
    dateFrom,
    dateTo,
    weekdaySpending,
    largestExpense,
    spendingMap,
    dailyMap,
  }
}
