import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { parseKaspiStatement, computeStatistics } from '../../utils/kaspiParser'
import { matchCategory, computeRecommendations, bestCardForCategory, CB_CAT_LABELS_RU } from '../../data/bankCashbacks'
import { useLiveCashbacks } from '../../hooks/useLiveCashbacks'
import { useLanguage } from '../../context/LanguageContext'

const fmt = (n) => Math.round(n).toLocaleString('ru-RU')

const txIdentity = (tx) => [
  tx.date || '',
  tx.type || '',
  Math.round(Math.abs(tx.amount || 0) * 100) / 100,
  String(tx.description || '').trim().toLowerCase(),
].join('|')

// ─────────────────────────────────────────────────────────────────────────────
// Step 0 — File upload
// ─────────────────────────────────────────────────────────────────────────────
function StepUpload({ onParsed, loading, setLoading, error, setError, t }) {
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(async (file) => {
    if (!file) return
    setError(null)
    setLoading(true)
    try {
      const transactions = await parseKaspiStatement(file)
      if (transactions.length === 0) {
        setError(t.errSomethingWrong || 'Не найдено транзакций. Проверьте формат файла.')
        setLoading(false)
        return
      }
      const stats = computeStatistics(transactions)
      onParsed({ transactions, stats, fileName: file.name })
    } catch (e) {
      setError(e.message || (t.error || 'Ошибка при разборе файла'))
    }
    setLoading(false)
  }, [onParsed, setError, setLoading, t])

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-white font-bold text-base">{t.importStatement}</h3>
        <p className="text-white/40 text-sm mt-1">{t.uploadStatementDesc}</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer mb-4 ${
          dragOver
            ? 'border-[#4F8EF7] bg-[#4F8EF7]/10'
            : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
        }`}
        onClick={() => document.getElementById('stmt-file-input').click()}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-[#4F8EF7]/30 border-t-[#4F8EF7] rounded-full animate-spin" />
            <p className="text-white/50 text-sm">{t.analyzingStatement}</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <polyline points="9,15 12,12 15,15" />
              </svg>
            </div>
            <p className="text-white/70 text-sm font-semibold mb-1">
              {t.dropFileHere || 'Перетащите файл сюда или нажмите'}
            </p>
            <p className="text-white/30 text-xs">
              {t.supportedFormats}
            </p>
          </>
        )}
        <input
          id="stmt-file-input"
          type="file"
          accept=".pdf,.xlsx,.xls,.csv,.txt"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Supported banks hint */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-3">{t.howToGetStatement}</p>
        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5">
            <span className="text-base flex-shrink-0">🏦</span>
            <div>
              <p className="text-white/60 text-xs font-semibold">Kaspi Bank</p>
              <p className="text-white/30 text-[11px]">Kaspi.kz → Мой Банк → Выписка → Скачать PDF или Excel</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-base flex-shrink-0">🟢</span>
            <div>
              <p className="text-white/60 text-xs font-semibold">Halyk Bank</p>
              <p className="text-white/30 text-[11px]">Homebank → История → Экспорт → Excel/CSV</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-base flex-shrink-0">🔵</span>
            <div>
              <p className="text-white/60 text-xs font-semibold">{t.other} банки</p>
              <p className="text-white/30 text-[11px]">Любая выписка с колонками: Дата, Сумма, Описание</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Statistics overview
// ─────────────────────────────────────────────────────────────────────────────
function StepStats({ stats, fileName, onCashback, onSave, onBack, t, lang }) {
  const { banks } = useLiveCashbacks()
  const {
    totalExpense, totalIncome, netFlow, transactionCount,
    expenseCount, incomeCount, topCategories, avgDaily,
    months, dateFrom, dateTo, weekdaySpending, largestExpense,
  } = stats

  const maxCatExpense = topCategories[0]?.[1]?.expense || 1
  const maxWeekday = Math.max(...weekdaySpending.map(w => w.avg), 1)

  const formatDate = (d) => {
    if (!d) return '—'
    const [y, m, day] = d.split('-')
    return `${day}.${m}.${y}`
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-white font-bold text-base">{t.yourStats}</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4F8EF7]/15 text-[#4F8EF7] border border-[#4F8EF7]/25 font-bold">
            {fileName}
          </span>
        </div>
        <p className="text-white/30 text-xs">
          {formatDate(dateFrom)} — {formatDate(dateTo)} · {transactionCount} {t.reportTxCount?.toLowerCase()}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3">
          <p className="text-white/35 text-[10px] mb-1">{t.reportExpense}</p>
          <p className="text-red-400 text-lg font-black">{Math.round(totalExpense).toLocaleString(lang)} ₸</p>
          <p className="text-white/20 text-[10px]">{expenseCount} оп.</p>
        </div>
        <div className="bg-[#4F8EF7]/5 border border-[#4F8EF7]/10 rounded-xl p-3">
          <p className="text-white/35 text-[10px] mb-1">{t.reportIncome}</p>
          <p className="text-[#4F8EF7] text-lg font-black">{Math.round(totalIncome).toLocaleString(lang)} ₸</p>
          <p className="text-white/20 text-[10px]">{incomeCount} оп.</p>
        </div>
        <div className={`border rounded-xl p-3 ${netFlow >= 0 ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
          <p className="text-white/35 text-[10px] mb-1">{t.reportProfit}</p>
          <p className={`text-lg font-black ${netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {netFlow >= 0 ? '+' : '−'}{Math.round(Math.abs(netFlow)).toLocaleString(lang)} ₸
          </p>
          <p className="text-white/20 text-[10px]">{t.reportPeriod?.toLowerCase()}</p>
        </div>
      </div>

      {/* Avg daily + largest */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
          <p className="text-white/35 text-[10px] mb-1">📊 {t.avgDailySpend}</p>
          <p className="text-white text-base font-bold">{Math.round(avgDaily).toLocaleString(lang)} ₸</p>
        </div>
        {largestExpense && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
            <p className="text-white/35 text-[10px] mb-1">💰 {t.largestSpend}</p>
            <p className="text-white text-base font-bold">{Math.round(largestExpense.amount).toLocaleString(lang)} ₸</p>
            <p className="text-white/25 text-[10px] truncate">{largestExpense.description || largestExpense.category}</p>
          </div>
        )}
      </div>

      {/* Top categories */}
      <div className="mb-4">
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2.5">{t.reportByCategory}</p>
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
          {topCategories.slice(0, 8).map(([catName, data]) => {
            const pct = totalExpense > 0 ? (data.expense / totalExpense * 100) : 0
            const barPct = (data.expense / maxCatExpense * 100)
            const cbKey = matchCategory(catName)
            const best = bestCardForCategory(cbKey, banks)

            return (
              <div key={catName} className="bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-white/60 text-xs font-medium truncate">{catName}</span>
                    <span className="text-white/20 text-[10px]">{data.count} оп.</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-white/70 text-xs font-bold">{Math.round(data.expense).toLocaleString(lang)} ₸</span>
                    <span className="text-white/25 text-[10px]">{pct.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/[0.05] rounded-full h-1">
                    <div className="h-1 rounded-full bg-[#4F8EF7]" style={{ width: `${Math.min(100, barPct)}%` }} />
                  </div>
                  {best && (
                    <span className="text-[9px] font-bold flex-shrink-0 px-1.5 py-0.5 rounded"
                      style={{ background: best.bank.color + '20', color: best.bank.color }}>
                      {best.bank.logo} {t.fromLabel || 'до'} {best.rule.percent}%
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly spending pattern */}
      <div className="mb-4">
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2.5">{t.spendingByWeekday}</p>
        <div className="flex items-end gap-1.5 h-16 px-2">
          {weekdaySpending.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-white/[0.05] rounded-t relative" style={{ height: `${Math.max(4, (w.avg / maxWeekday) * 48)}px` }}>
                <div className="absolute inset-0 rounded-t bg-[#4F8EF7]/60" style={{ height: '100%' }} />
              </div>
              <span className="text-white/30 text-[9px]">{w.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly breakdown */}
      {months.length > 1 && (
        <div className="mb-4">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2.5">{t.monthlyBreakdown}</p>
          <div className="space-y-1">
            {months.map(([month, total]) => {
              const [y, m] = month.split('-')
              const monthNames = t.monthsNames || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              const label = `${monthNames[parseInt(m) - 1].slice(0, 3)} ${y}`
              const maxMonth = Math.max(...months.map(([, v]) => v), 1)
              return (
                <div key={month} className="flex items-center gap-2">
                  <span className="text-white/40 text-[10px] w-14 flex-shrink-0">{label}</span>
                  <div className="flex-1 bg-white/[0.05] rounded-full h-2">
                    <div className="h-2 rounded-full bg-[#4F8EF7]/70" style={{ width: `${(total / maxMonth) * 100}%` }} />
                  </div>
                  <span className="text-white/50 text-[10px] font-bold w-20 text-right flex-shrink-0">{Math.round(total).toLocaleString(lang)} ₸</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button onClick={onBack}
          className="py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm font-medium transition-colors">
          ← {t.loadAnother}
        </button>
        <button onClick={onSave}
          className="py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.1] hover:text-white font-bold text-sm transition-colors">
          {t.saveOperations}
        </button>
        <button onClick={onCashback}
          className="py-3 rounded-xl bg-[#4F8EF7] text-white font-bold text-sm hover:bg-[#4F8EF7]/90 transition-all shadow-[0_0_20px_rgba(79,142,247,0.25)] flex items-center justify-center gap-1.5">
          <span>💳</span> {t.seeRecommendations} →
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Save imported transactions
// ─────────────────────────────────────────────────────────────────────────────
function StepSave({ parsed, userId, demo, onImported, onCashback, onBack, t, lang }) {
  const [accounts, setAccounts] = useState([])
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [existingKeys, setExistingKeys] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saveResult, setSaveResult] = useState(null)

  useEffect(() => {
    let cancelled = false

    const loadContext = async () => {
      setLoading(true)
      setError(null)

      if (demo || !userId) {
        if (!cancelled) setLoading(false)
        return
      }

      const [{ data: accountRows, error: accountsError }, { data: existingRows, error: txError }] = await Promise.all([
        supabase
          .from('accounts')
          .select('id,name,balance,currency,type')
          .eq('user_id', userId)
          .order('name'),
        supabase
          .from('transactions')
          .select('date,type,amount,description')
          .eq('user_id', userId)
          .gte('date', parsed.stats.dateFrom)
          .lte('date', `${parsed.stats.dateTo}T23:59:59`),
      ])

      if (cancelled) return

      if (accountsError || txError) {
        setError(accountsError?.message || txError?.message || (t.errSomethingWrong || 'Не удалось проверить импорт'))
      }

      const rows = accountRows || []
      setAccounts(rows)
      setSelectedAccountId(rows[0]?.id || '')
      setExistingKeys(new Set((existingRows || []).map(txIdentity)))
      setLoading(false)
    }

    loadContext()
    return () => { cancelled = true }
  }, [demo, parsed.stats.dateFrom, parsed.stats.dateTo, userId, t])

  const prepared = parsed.transactions.map(tx => ({
    ...tx,
    duplicate: existingKeys.has(txIdentity(tx)),
  }))
  const newRows = prepared.filter(tx => !tx.duplicate)
  const duplicateCount = prepared.length - newRows.length
  const selectedAccount = accounts.find(account => account.id === selectedAccountId)

  const handleSave = async () => {
    if (demo) return
    if (!selectedAccountId) {
      setError(t.errSelectAccount || 'Сначала выберите счет для импорта')
      return
    }
    if (newRows.length === 0) {
      setSaveResult({ imported: 0, skipped: duplicateCount })
      return
    }

    setSaving(true)
    setError(null)

    const rows = newRows.map(tx => ({
      user_id: userId,
      type: tx.type,
      amount: Math.abs(tx.amount || 0),
      description: tx.description || t.importStatement,
      accountId: selectedAccountId,
      date: tx.date,
      category: tx.category || null,
      comment: `Import: ${parsed.fileName}`,
    }))

    const { error: insertError } = await supabase
      .from('transactions')
      .insert(rows)

    if (insertError) {
      setError(insertError.message || (t.errSomethingWrong || 'Не удалось сохранить транзакции'))
      setSaving(false)
      return
    }

    const netDelta = rows.reduce((sum, tx) => (
      tx.type === 'income' ? sum + tx.amount : sum - tx.amount
    ), 0)

    if (selectedAccount) {
      await supabase
        .from('accounts')
        .update({ balance: Number(selectedAccount.balance || 0) + netDelta })
        .eq('id', selectedAccountId)
    }

    setSaveResult({ imported: rows.length, skipped: duplicateCount })
    setExistingKeys(new Set(prepared.map(txIdentity)))
    setSaving(false)
    onImported?.()
  }

  if (demo) {
    return (
      <div>
        <h3 className="text-white font-bold text-base mb-2">{t.saveImport} ({t.demoProfile})</h3>
        <div className="bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 rounded-2xl p-4 mb-4">
          <p className="text-white/70 text-sm">{t.demoSaveWarning}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm font-medium transition-colors">
            ← {t.stepStats}
          </button>
          <button onClick={onCashback}
            className="flex-1 py-3 rounded-xl bg-[#4F8EF7] text-white font-bold text-sm hover:bg-[#4F8EF7]/90 transition-colors">
            {t.stepCashback} →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-white font-bold text-base">{t.saveImport}</h3>
        <p className="text-white/30 text-xs mt-1">{t.selectAccountDesc}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-2 border-[#4F8EF7] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <label className="block mb-4">
            <span className="block text-white/35 text-[10px] font-bold uppercase tracking-widest mb-2">{t.accountForOps}</span>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-[#4F8EF7]/50"
            >
              {accounts.length === 0 && <option value="">{t.noAccounts}</option>}
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} · {account.currency || 'KZT'}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
              <p className="text-white/30 text-[10px] mb-1">{t.found}</p>
              <p className="text-white text-lg font-black">{prepared.length}</p>
            </div>
            <div className="bg-[#4F8EF7]/5 border border-[#4F8EF7]/10 rounded-xl p-3">
              <p className="text-white/30 text-[10px] mb-1">{t.new}</p>
              <p className="text-[#4F8EF7] text-lg font-black">{newRows.length}</p>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3">
              <p className="text-white/30 text-[10px] mb-1">{t.duplicates}</p>
              <p className="text-amber-300 text-lg font-black">{duplicateCount}</p>
            </div>
          </div>

          <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1 mb-4">
            {prepared.slice(0, 12).map((tx, index) => (
              <div key={`${tx.date}-${index}`} className="grid grid-cols-[82px_1fr_86px] gap-3 items-center bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2">
                <div>
                  <p className="text-white/45 text-[10px]">{tx.date}</p>
                  <p className={`text-[10px] font-bold ${tx.type === 'income' ? 'text-emerald-300' : 'text-red-300'}`}>
                    {tx.type === 'income' ? t.reportIncome : t.reportExpense}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-white/70 text-xs font-semibold truncate">{tx.description || tx.category || t.operation}</p>
                  <p className="text-white/30 text-[10px] truncate">{tx.category || (t.noCategory || 'Без категории')}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-xs font-bold">{Math.round(Math.abs(tx.amount || 0)).toLocaleString(lang)} ₸</p>
                  {tx.duplicate && <p className="text-amber-300 text-[9px] font-bold">{t.duplicate}</p>}
                </div>
              </div>
            ))}
          </div>

          {saveResult && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-4">
              <p className="text-emerald-300 text-sm font-semibold">
                {t.savedCount}: {saveResult.imported}. {t.skippedCount}: {saveResult.skipped}.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button onClick={onBack}
              className="py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm font-medium transition-colors">
              ← {t.stepStats}
            </button>
            <button onClick={handleSave} disabled={saving || !selectedAccountId || newRows.length === 0}
              className="py-3 rounded-xl bg-[#4F8EF7] disabled:bg-white/[0.06] disabled:text-white/20 text-white font-bold text-sm hover:bg-[#4F8EF7]/90 transition-colors">
              {saving ? (t.saving || 'Сохраняем...') : `${t.save || 'Сохранить'} ${newRows.length}`}
            </button>
            <button onClick={onCashback}
              className="py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.1] hover:text-white font-bold text-sm transition-colors">
              {t.stepCashback} →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Cashback recommendations
// ─────────────────────────────────────────────────────────────────────────────
function StepCashback({ stats, onBack, t, lang }) {
  const [expandedCard, setExpandedCard] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const { banks, source, updatedAt, version } = useLiveCashbacks()

  const recommendations = computeRecommendations(stats.spendingMap, { banks })
  const winner = recommendations[0]
  const top3 = recommendations.slice(0, 3)
  const rest = recommendations.slice(3)

  const downloadReport = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    let y = 20
    const lm = 20, pw = 170

    doc.setFontSize(18); doc.setTextColor(79, 142, 247)
    doc.text('Finvy', lm, y)
    doc.setTextColor(100, 100, 100); doc.setFontSize(10)
    doc.text('Cashback Report', lm + 30, y); y += 12

    doc.setDrawColor(79, 142, 247); doc.setLineWidth(0.5)
    doc.line(lm, y, lm + pw, y); y += 8

    doc.setFontSize(10); doc.setTextColor(60, 60, 60)
    doc.text(`Period: ${stats.dateFrom || '—'} — ${stats.dateTo || '—'}`, lm, y); y += 6
    doc.text(`Total expenses: ${Math.round(stats.totalExpense).toLocaleString(lang)} KZT`, lm, y); y += 10

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

    stats.topCategories.forEach(([cat, v]) => {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.setFontSize(9); doc.setTextColor(60, 60, 60)
      doc.text(cat, lm, y)
      doc.text(`${Math.round(v.expense).toLocaleString(lang)} KZT`, lm + 100, y); y += 5
    })

    y += 10; if (y > 275) { doc.addPage(); y = 20 }
    doc.setFontSize(8); doc.setTextColor(150, 150, 150)
    doc.text('Generated by Finvy — finvy.kz', lm, y)

    doc.save('finvy-cashback-report.pdf')
  }

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white font-bold text-base">{t.bestCardsForYou}</h3>
          <p className="text-white/30 text-xs mt-1">
            {t.basedOnExpenses} {Math.round(stats.totalExpense).toLocaleString(lang)} ₸ {t.reportExpense?.toLowerCase()}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          {source === 'live' ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> LIVE v{version}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
              OFFLINE
            </span>
          )}
          {updatedAt && (
            <p className="text-white/20 text-[9px] mt-1">
              {new Date(updatedAt).toLocaleDateString(lang, { day: '2-digit', month: 'short' })}
            </p>
          )}
        </div>
      </div>

      {/* Winner */}
      {winner && (
        <div className="relative overflow-hidden rounded-2xl p-4 mb-4"
          style={{ background: `linear-gradient(135deg, ${winner.bankColor}18 0%, ${winner.bankColor}06 100%)`,
                   border: `1px solid ${winner.bankColor}28` }}>
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: winner.bankColor + '25', color: winner.bankColor }}>
            🏆 #1 {t.bestChoice}
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
              </div>
              <p className="text-white/45 text-xs mb-2">{winner.highlight}</p>
              <div className="flex items-end gap-3">
                <div>
                  <p className="text-[10px] text-white/30 mb-0.5">{t.perMonth}</p>
                  <p className="text-2xl font-black" style={{ color: winner.bankColor }}>+{Math.round(winner.netCashback).toLocaleString(lang)} ₸</p>
                </div>
                <div className="pb-0.5">
                  <p className="text-[10px] text-white/25 mb-0.5">{t.perYear}</p>
                  <p className="text-sm font-bold text-white/50">+{Math.round(winner.netCashback * 12).toLocaleString(lang)} ₸</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards list */}
      <div className="space-y-1.5 mb-3">
        {top3.map((card, idx) => {
          const key = `${card.bankId}-${card.cardName}`
          const isOpen = expandedCard === key

          return (
            <div key={key} className="overflow-hidden rounded-xl border transition-all"
              style={{ borderColor: isOpen ? card.bankColor + '30' : 'rgba(255,255,255,0.06)' }}>
              <button onClick={() => setExpandedCard(isOpen ? null : key)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.03] transition-colors">
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black"
                  style={{ background: idx === 0 ? '#FFD700' + '20' : card.bankColor + '15', color: idx === 0 ? '#FFD700' : card.bankColor }}>
                  {idx + 1}
                </div>
                <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ background: card.bankColor + '18' }}>
                  <span className="text-sm">{card.bankLogo}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-white/80 text-sm font-semibold">{card.bankName}</span>
                    <span className="text-white/35 text-xs">{card.cardName}</span>
                  </div>
                  <p className="text-white/30 text-[10px] truncate mt-0.5">{card.highlight}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black" style={{ color: card.bankColor }}>+{Math.round(card.netCashback).toLocaleString(lang)} ₸</p>
                  <p className="text-white/20 text-[10px]">/{t.month}</p>
                </div>
              </button>

              {isOpen && (
                <div className="border-t px-3 py-3 space-y-1.5" style={{ borderColor: card.bankColor + '20', background: card.bankColor + '06' }}>
                  {card.breakdown.length > 0 ? (
                    <>
                      <p className="text-white/25 text-[10px] font-bold uppercase tracking-wider mb-1.5">{t.cashbackAnalysis}</p>
                      {card.breakdown.map((b, i) => {
                        const emoji = CB_CAT_LABELS_RU[b.cbKey]?.split(' ')[0] || '💳'
                        const catLabel = CB_CAT_LABELS_RU[b.cbKey]?.split(' ').slice(1).join(' ') || b.cbKey
                        return (
                          <div key={i} className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{emoji}</span>
                              <span className="text-white/55 text-xs">{catLabel}</span>
                              <span className="text-white/20 text-[10px] ml-1">{Math.round(b.spend).toLocaleString(lang)} ₸</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-white/25 text-[10px]">{b.percent}%</span>
                              <span className="text-xs font-bold" style={{ color: card.bankColor }}>+{Math.round(b.cashback).toLocaleString(lang)} ₸</span>
                            </div>
                          </div>
                        )
                      })}
                      <div className="flex items-center justify-between pt-1.5 border-t mt-1" style={{ borderColor: card.bankColor + '20' }}>
                        <span className="text-white/35 text-xs font-semibold">{t.totalPerMonth}</span>
                        <span className="font-black text-sm" style={{ color: card.bankColor }}>+{Math.round(card.netCashback).toLocaleString(lang)} ₸</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-white/30 text-xs py-2">{t.cashbackAnalysis} {t.allTime?.toLowerCase()}: {Math.round(card.netCashback).toLocaleString(lang)} ₸/{t.month}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* More cards */}
      {rest.length > 0 && (
        <div className="mb-3">
          <button onClick={() => setShowAll(!showAll)}
            className="w-full flex items-center justify-center gap-1.5 text-white/25 hover:text-white/50 text-xs py-2 transition-colors">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"
              className={`transition-transform ${showAll ? 'rotate-180' : ''}`}>
              <path d="M2 3l3 3 3-3"/>
            </svg>
            {showAll ? t.hide : `${t.moreCards} ${rest.length} ${t.moreCards}`}
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
                  <span className="text-xs font-semibold" style={{ color: card.bankColor }}>+{Math.round(card.netCashback).toLocaleString(lang)} ₸/{t.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tip */}
      {winner && (
        <div className="bg-[#4F8EF7]/[0.06] border border-[#4F8EF7]/15 rounded-xl p-3.5 mb-3">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div>
              <p className="text-[#4F8EF7] text-xs font-semibold mb-0.5">{t.personalTip}</p>
              <p className="text-white/45 text-xs leading-relaxed">
                С картой <span className="text-white/70 font-medium">{winner.bankName} {winner.cardName}</span> вы
                будете получать примерно <span className="text-[#4F8EF7] font-bold">{Math.round(winner.netCashback).toLocaleString(lang)} ₸</span> кэшбэка
                в месяц — это <span className="text-white/70 font-semibold">{Math.round(winner.netCashback * 12).toLocaleString(lang)} ₸ {t.perYear}</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onBack}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 text-xs font-medium transition-colors">
          ← {t.stepStats}
        </button>
        <button onClick={downloadReport}
          className="flex-[2] py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white/60 hover:bg-white/[0.08] hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 9h8M6 1v6M3.5 5l2.5 2.5L9 5"/>
          </svg>
          {t.downloadReportPdf || 'Скачать отчёт'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────────────────────────────────────
function StepIndicator({ step, t }) {
  const steps = [t.stepUpload || 'Load', t.stepStats || 'Stats', t.stepSave || 'Save', t.stepCashback || 'Cashback']
  return (
    <div className="flex items-center gap-1 mb-5">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
            ${step === i
              ? 'bg-[#4F8EF7] text-white'
              : step > i
                ? 'text-white/50'
                : 'text-white/20'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
              ${step > i ? 'bg-[#4F8EF7]/20 text-[#4F8EF7]' : step === i ? 'bg-white/20' : 'bg-white/5 text-white/20'}`}>
              {step > i ? '✓' : i + 1}
            </span>
            {label}
          </div>
          {i < steps.length - 1 && <div className={`w-4 h-px ${step > i ? 'bg-[#4F8EF7]/30' : 'bg-white/10'}`} />}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main modal
// ─────────────────────────────────────────────────────────────────────────────
export default function ImportStatementModal({ userId, demo = false, onImported, onClose }) {
  const { t, lang } = useLanguage()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [parsed, setParsed] = useState(null)

  const handleParsed = (data) => {
    setParsed(data)
    setStep(1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#131313] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 flex items-center justify-center text-lg">
                📄
              </div>
              <div>
                <p className="text-white font-bold text-sm">{t.importStatement}</p>
                <p className="text-white/30 text-xs">{t.cashbackAnalysis} + {t.importStatement?.toLowerCase()}</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-colors text-lg">
              ✕
            </button>
          </div>
          <StepIndicator step={step} t={t} />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 0 && (
            <StepUpload
              onParsed={handleParsed}
              loading={loading}
              setLoading={setLoading}
              error={error}
              setError={setError}
              t={t}
            />
          )}
          {step === 1 && parsed && (
            <StepStats
              stats={parsed.stats}
              fileName={parsed.fileName}
              onCashback={() => setStep(3)}
              onSave={() => setStep(2)}
              onBack={() => { setParsed(null); setStep(0) }}
              t={t}
              lang={lang}
            />
          )}
          {step === 2 && parsed && (
            <StepSave
              parsed={parsed}
              userId={userId}
              demo={demo}
              onImported={onImported}
              onCashback={() => setStep(3)}
              onBack={() => setStep(1)}
              t={t}
              lang={lang}
            />
          )}
          {step === 3 && parsed && (
            <StepCashback
              stats={parsed.stats}
              onBack={() => setStep(1)}
              t={t}
              lang={lang}
            />
          )}
        </div>
      </div>
    </div>
  )
}
