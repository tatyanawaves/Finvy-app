// ─────────────────────────────────────────────────────────────────────────────
// budgetAI — One-click AI budget generator.
// Reads the last 3 full months of expense history, asks the LLM (via the
// existing ai-finance-chat Edge Function) to suggest a sensible monthly cap
// per category for the target month, and returns a structured proposal.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from './supabase'

function shiftMonth(monthKey, delta) {
  const [yearStr, monthStr] = monthKey.split('-')
  const d = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1 + delta, 1))
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function monthRangeISO(monthKey) {
  const [y, m] = monthKey.split('-')
  const from = new Date(Date.UTC(Number(y), Number(m) - 1, 1)).toISOString()
  const to = new Date(Date.UTC(Number(y), Number(m), 1)).toISOString()
  return { from, to }
}

// Aggregate expenses per category for a given month
async function fetchMonthlyExpenses({ userId, month }) {
  const { from, to } = monthRangeISO(month)
  const { data, error } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('date', from)
    .lt('date', to)
  if (error) throw error
  const byCat = {}
  for (const tx of data || []) {
    const cat = tx.category || 'Другое'
    byCat[cat] = (byCat[cat] || 0) + Math.abs(Number(tx.amount) || 0)
  }
  return byCat
}

// Build the prompt for the LLM
function buildPrompt({ targetMonth, history, knownCategories }) {
  const historyLines = history.map(({ month, byCat }) => {
    const cats = Object.entries(byCat)
      .sort((a, b) => b[1] - a[1])
      .map(([c, v]) => `${c}: ${Math.round(v).toLocaleString('ru-RU')} ₸`)
      .join(', ')
    return `${month}: ${cats || '(нет данных)'}`
  })
  const allCats = Array.from(new Set([
    ...knownCategories,
    ...history.flatMap(h => Object.keys(h.byCat)),
  ])).filter(Boolean)

  return `Ты — финансовый ассистент. На основе истории расходов за последние 3 месяца сгенерируй разумный месячный бюджет на месяц ${targetMonth}.

ИСТОРИЯ РАСХОДОВ ПО КАТЕГОРИЯМ:
${historyLines.join('\n')}

ИЗВЕСТНЫЕ КАТЕГОРИИ В СИСТЕМЕ: ${allCats.join(', ')}

ПРАВИЛА:
1. Используй среднее значение за 3 месяца как базу
2. Округли суммы до 1000 ₸
3. Для нестабильных категорий (волатильность >50% мес.-к-мес.) добавь +15% запаса
4. Игнорируй категории-разовые-всплески (если категория встречается только в 1 из 3 месяцев и сумма > 100 000 ₸)
5. Не добавляй категории, которых нет в истории расходов
6. Дай короткий комментарий (1-2 слова) для каждой категории

ВЕРНИ ТОЛЬКО JSON в таком формате (никакого текста до или после):
\`\`\`json
{
  "month": "${targetMonth}",
  "budget": [
    { "category": "Продукты", "planned": 60000, "note": "среднее +10%" },
    { "category": "Топливо", "planned": 35000, "note": "стабильно" }
  ]
}
\`\`\``
}

// Extract JSON object from raw LLM text (handles ```json fences and bare {...})
function extractJSON(raw) {
  if (!raw) return null
  const fenceMatch = raw.match(/```json\s*([\s\S]*?)```/)
  const block = fenceMatch ? fenceMatch[1] : raw.match(/\{[\s\S]*\}/)?.[0]
  if (!block) return null
  try {
    return JSON.parse(block)
  } catch {
    return null
  }
}

/**
 * Generate a budget proposal for a given month using AI.
 * @returns {Promise<{ items: Array<{category, planned, note, prevAvg}>, monthsAnalyzed: string[] } | { error: string }>}
 */
export async function generateBudgetProposal({ userId, targetMonth, knownCategories = [] }) {
  if (!userId || userId === 'demo') {
    return { error: 'Доступно только для авторизованных пользователей' }
  }
  if (!targetMonth) {
    return { error: 'Не указан целевой месяц' }
  }

  // 1. Pull last 3 months of expense history
  const months = [shiftMonth(targetMonth, -3), shiftMonth(targetMonth, -2), shiftMonth(targetMonth, -1)]
  const historyByMonth = []
  for (const m of months) {
    try {
      const byCat = await fetchMonthlyExpenses({ userId, month: m })
      historyByMonth.push({ month: m, byCat })
    } catch (e) {
      return { error: `Ошибка загрузки истории за ${m}: ${e.message}` }
    }
  }

  const totalHistoryEntries = historyByMonth.reduce(
    (s, h) => s + Object.keys(h.byCat).length, 0
  )
  if (totalHistoryEntries === 0) {
    return { error: 'Недостаточно истории расходов за последние 3 месяца' }
  }

  // 2. Compute per-category 3-month average (used as fallback if AI fails or for prevAvg display)
  const sumByCat = {}
  const countByCat = {}
  for (const { byCat } of historyByMonth) {
    for (const [cat, val] of Object.entries(byCat)) {
      sumByCat[cat] = (sumByCat[cat] || 0) + val
      countByCat[cat] = (countByCat[cat] || 0) + 1
    }
  }
  const avgByCat = Object.fromEntries(
    Object.entries(sumByCat).map(([cat, sum]) => [cat, sum / 3]) // divide by 3 months, not by occurrence count
  )

  // 3. Ask AI
  const prompt = buildPrompt({ targetMonth, history: historyByMonth, knownCategories })
  const { data, error } = await supabase.functions.invoke('ai-finance-chat', {
    body: {
      messages: [{ role: 'user', content: prompt }],
      context: '',
      language: 'ru',
    },
  })
  if (error) return { error: `AI error: ${error.message || error}` }
  if (data?.error) return { error: `AI error: ${data.error}` }

  const reply = data?.reply || ''
  const parsed = extractJSON(reply)
  if (!parsed || !Array.isArray(parsed.budget)) {
    // Fallback: build a heuristic proposal from averages
    const fallback = Object.entries(avgByCat)
      .filter(([_, v]) => v > 1000)
      .map(([category, avg]) => ({
        category,
        planned: Math.round(avg / 1000) * 1000,
        note: 'среднее за 3 мес',
        prevAvg: avg,
      }))
      .sort((a, b) => b.planned - a.planned)
    return {
      items: fallback,
      monthsAnalyzed: months,
      fromFallback: true,
    }
  }

  // 4. Enrich AI items with prevAvg from history for display
  const items = parsed.budget
    .filter((it) => it && it.category && Number(it.planned) > 0)
    .map((it) => ({
      category: String(it.category).trim(),
      planned: Math.round(Number(it.planned)),
      note: String(it.note || '').trim(),
      prevAvg: avgByCat[it.category] || 0,
    }))

  return { items, monthsAnalyzed: months, fromFallback: false }
}

/**
 * Bulk-upsert a proposal into monthly_budgets.
 * Existing rows for the same (user, month, category) are updated.
 */
export async function applyBudgetProposal({ userId, month, items }) {
  if (!userId || !month || !Array.isArray(items) || items.length === 0) {
    return { error: 'invalid args' }
  }
  const rows = items.map((it) => ({
    user_id: userId,
    month,
    category: it.category,
    planned_amount: it.planned,
    notes: it.note || null,
    rollover_enabled: true,
  }))
  const { error } = await supabase
    .from('monthly_budgets')
    .upsert(rows, { onConflict: 'user_id,month,category' })
  if (error) return { error: error.message }
  return { ok: true, applied: rows.length }
}
