// ─────────────────────────────────────────────────────────────────────────────
// BudgetAlertWidget — compact alert strip shown on the main dashboard.
// Surfaces categories that are close to or over their monthly budget cap.
// Hidden when nothing is critical.
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate } from 'react-router-dom'
import { useBudget, currentMonthKey } from '../../hooks/useBudget'

const fmt = (n) => Math.round(Number(n) || 0).toLocaleString('ru-RU')

export default function BudgetAlertWidget({ userId, demo, basePath = '/dashboard' }) {
  const navigate = useNavigate()
  // Skip the hook in demo mode entirely — widget hidden there
  const { rows, loading } = useBudget(currentMonthKey(), { userId: demo ? null : userId })

  if (demo || loading) return null

  // Critical = over cap OR ≥ 90% spent (warning)
  const critical = rows
    .filter((r) => !r.unbudgeted && (r.status === 'over' || r.status === 'warning'))
    .slice(0, 3)

  if (critical.length === 0) return null

  const overCount = rows.filter((r) => r.status === 'over' && !r.unbudgeted).length
  const warningCount = rows.filter((r) => r.status === 'warning' && !r.unbudgeted).length

  return (
    <div
      onClick={() => navigate(`${basePath}/budget`)}
      className="mx-4 sm:mx-6 mt-3 cursor-pointer group"
      role="button"
    >
      <div className="bg-gradient-to-r from-amber-500/[0.08] via-red-500/[0.08] to-amber-500/[0.08] border border-amber-400/25 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-amber-400/40 transition-colors">
        <div className="w-8 h-8 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber-400">
            <path d="M12 3.8 20 18H4L12 3.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M12 8.8v4.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M12 16h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white/90 text-xs sm:text-sm font-semibold leading-tight">
            {overCount > 0 && `${overCount} ${overCount === 1 ? 'категория превышена' : 'категорий превышено'}`}
            {overCount > 0 && warningCount > 0 && ' · '}
            {warningCount > 0 && `${warningCount} близко к лимиту`}
          </p>
          <p className="text-white/50 text-[11px] sm:text-xs mt-0.5 truncate">
            {critical.map((r) => {
              const status = r.status === 'over' ? '−' : ''
              return `${r.category}: ${status}${fmt(Math.abs(r.remaining))} ₸`
            }).join(' · ')}
          </p>
        </div>

        <span className="text-white/40 group-hover:text-white/70 text-xs font-medium flex-shrink-0 hidden sm:inline">
          Открыть бюджет →
        </span>
        <span className="text-white/40 group-hover:text-white/70 sm:hidden flex-shrink-0">→</span>
      </div>
    </div>
  )
}
