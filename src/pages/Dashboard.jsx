import { useState, useEffect, useRef, useCallback } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useLanguage, LANGS } from '../context/LanguageContext'
import { DEMO_ACCOUNTS, DEMO_TRANSACTIONS } from '../data/demoData'
import TransactionsView from './dashboard/TransactionsView'
import AnalyticsView from './dashboard/AnalyticsView'
import CalendarView from './dashboard/CalendarView'
import UsersView from './dashboard/UsersView'
import InvoicesView from './dashboard/InvoicesView'
import CategoriesView from './dashboard/CategoriesView'
import ReportsView from './dashboard/ReportsView'
import SettingsView from './dashboard/SettingsView'
import AIAnalyticsView from './dashboard/AIAnalyticsView'
import BudgetView from './dashboard/BudgetView'
import GoalsView from './dashboard/GoalsView'
import AddTransactionModal from './dashboard/AddTransactionModal'
import AddAccountModal from './dashboard/AddAccountModal'
import OnboardingSurvey from './dashboard/OnboardingSurvey'
import TaxWidget from './dashboard/TaxWidget'
import PayrollCalculator from './dashboard/PayrollCalculator'
import BrandLogo from '../components/BrandLogo'

function ToolPage({ title, subtitle, children }) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <div className="mb-5">
          <h2 className="text-white font-semibold text-base">{title}</h2>
          {subtitle && <p className="text-white/30 text-xs mt-1">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}

function LangSwitcher() {
  const { lang, changeLang, LANGS } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = LANGS.find(l => l.code === lang) || LANGS[0]

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-1.5 transition-colors"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M4 6L1 2h6L4 6z"/></svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[100px]">
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => { changeLang(l.code); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors
                ${lang === l.code ? 'text-white bg-white/5' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <span>{l.flag}</span>
              <span className="font-medium">{l.label}</span>
              {lang === l.code && <span className="ml-auto text-mint">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DashboardInner({ demo }) {
  const auth = useAuth()
  const user = demo ? { id: 'demo', email: 'demo@finvy.kz' } : auth.user
  const signOut = demo ? () => window.location.href = '/' : auth.signOut
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [accounts, setAccounts] = useState(demo ? DEMO_ACCOUNTS : [])
  const [totalBalance, setTotalBalance] = useState(demo ? DEMO_ACCOUNTS.reduce((s, a) => s + a.balance, 0) : 0)
  const [showAddModal, setShowAddModal] = useState(null)
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [defaultCurrency, setDefaultCurrency] = useState('USD')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingChecked, setOnboardingChecked] = useState(false)
  const [profileType, setProfileType] = useState('business')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const profileMenuRef = useRef(null)
  const tabsScrollRef = useRef(null)

  const currentTab = location.pathname.includes('ai') ? 'ai'
    : location.pathname.includes('analytics') ? 'analytics'
    : location.pathname.includes('goals') ? 'goals'
    : location.pathname.includes('budget') ? 'budget'
    : location.pathname.includes('calendar') ? 'calendar'
    : location.pathname.includes('taxes') ? 'taxes'
    : location.pathname.includes('payroll') ? 'payroll'
    : location.pathname.includes('users') ? 'users'
    : location.pathname.includes('invoices') ? 'invoices'
    : location.pathname.includes('categories') ? 'categories'
    : location.pathname.includes('reports') ? 'reports'
    : location.pathname.includes('settings') ? 'settings'
    : 'transactions'

  // Close profile menu on outside click
  useEffect(() => {
    const handler = (e) => { if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setShowProfileMenu(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Load user settings (default currency etc.) + check onboarding
  const loadSettings = useCallback(async () => {
    if (demo) {
      setDefaultCurrency('KZT')
      setProfileType('business')
      setOnboardingChecked(true)
      return
    }
    const { data } = await supabase
      .from('fm_settings')
      .select('default_currency, onboarding_done, survey_data')
      .eq('user_id', user.id)
      .maybeSingle()
    if (data?.default_currency) setDefaultCurrency(data.default_currency)
    if (data?.survey_data) {
      try {
        const sd = typeof data.survey_data === 'string' ? JSON.parse(data.survey_data) : data.survey_data
        if (sd?.profileType) setProfileType(sd.profileType)
      } catch {}
    }
    if (!data || !data.onboarding_done) setShowOnboarding(true)
    setOnboardingChecked(true)
  }, [user.id, demo])

  useEffect(() => { if (!demo) fetchAccounts() }, [refreshKey])
  useEffect(() => { loadSettings() }, [loadSettings])

  const fetchAccounts = async () => {
    if (demo) return
    const { data } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('balance', { ascending: false })
    if (data) {
      setAccounts(data)
      setTotalBalance(data.reduce((s, a) => s + (a.balance || 0), 0))
    }
  }

  const onTransactionAdded = () => {
    setRefreshKey(k => k + 1)
    setShowAddModal(null)
  }

  const onAccountAdded = () => {
    setShowAddAccount(false)
    fetchAccounts()
  }

  const base = demo ? '/demo' : '/dashboard'
  const tabs = [
    { key: 'transactions', label: t.transactions,  path: base },
    { key: 'budget',      label: t.budget || 'Бюджет', path: `${base}/budget` },
    { key: 'goals',       label: t.goals || 'Цели',   path: `${base}/goals` },
    { key: 'analytics',   label: t.analytics,     path: `${base}/analytics` },
    { key: 'ai',          label: `✦ ${t.aiAnalytics || 'AI'}`, path: `${base}/ai` },
    { key: 'calendar',    label: t.calendar,       path: `${base}/calendar` },
    { key: 'invoices',    label: t.invoices,       path: `${base}/invoices` },
    { key: 'reports',     label: t.reports,        path: `${base}/reports` },
    { key: 'taxes',       label: t.taxes || 'Налоги', path: `${base}/taxes` },
    { key: 'payroll',     label: 'З/п',               path: `${base}/payroll` },
    { key: 'categories',  label: t.categories,     path: `${base}/categories` },
    { key: 'users',       label: t.users,          path: `${base}/users` },
    { key: 'settings',    label: t.settings,       path: `${base}/settings` },
  ]

  const currencySymbol = (c) => ({ USD: '$', EUR: '€', KZT: '₸', UAH: '₴', GBP: '£' }[c] || c)
  const scrollTabs = (direction) => {
    tabsScrollRef.current?.scrollBy({ left: direction * 220, behavior: 'smooth' })
  }

  return (
    <div className="flex h-screen bg-[#111] text-white overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-[86vw] max-w-xs lg:w-56 flex-shrink-0 bg-[#0f0f0f] border-r border-white/5 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <BrandLogo textClassName="text-white text-base" />
          <div ref={profileMenuRef} className="relative">
            <button
              onClick={() => setShowProfileMenu(o => !o)}
              className="text-white/40 hover:text-white/70 text-xs border border-white/10 hover:border-white/20 rounded-lg px-2 py-1 transition-colors flex items-center gap-1"
            >
              <span>{profileType === 'personal' ? '👤' : '🏢'}</span>
              <span>{profileType === 'personal' ? (t.personal || 'Физ. лицо') : t.business}</span>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M4 6L1 2h6L4 6z"/></svg>
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[130px]">
                <button
                  onClick={async () => {
                    setProfileType('business')
                    setShowProfileMenu(false)
                    if (!demo) {
                      const { data: s } = await supabase.from('fm_settings').select('survey_data').eq('user_id', user.id).maybeSingle()
                      let sd = {}; try { sd = s?.survey_data ? (typeof s.survey_data === 'string' ? JSON.parse(s.survey_data) : s.survey_data) : {} } catch {}
                      sd.profileType = 'business'
                      await supabase.from('fm_settings').upsert({ user_id: user.id, survey_data: JSON.stringify(sd) }, { onConflict: 'user_id' })
                    }
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors ${profileType === 'business' ? 'text-white bg-white/5' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                  <span>🏢</span><span className="font-medium">{t.business}</span>
                  {profileType === 'business' && <span className="ml-auto text-mint">✓</span>}
                </button>
                <button
                  onClick={async () => {
                    setProfileType('personal')
                    setShowProfileMenu(false)
                    if (!demo) {
                      const { data: s } = await supabase.from('fm_settings').select('survey_data').eq('user_id', user.id).maybeSingle()
                      let sd = {}; try { sd = s?.survey_data ? (typeof s.survey_data === 'string' ? JSON.parse(s.survey_data) : s.survey_data) : {} } catch {}
                      sd.profileType = 'personal'
                      await supabase.from('fm_settings').upsert({ user_id: user.id, survey_data: JSON.stringify(sd) }, { onConflict: 'user_id' })
                    }
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors ${profileType === 'personal' ? 'text-white bg-white/5' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                  <span>👤</span><span className="font-medium">{t.personal || 'Физ. лицо'}</span>
                  {profileType === 'personal' && <span className="ml-auto text-mint">✓</span>}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Total balance */}
        <div className="px-5 py-4 border-b border-white/5">
          <p className="text-white/40 text-xs mb-1">{t.totalBalance}</p>
          <p className="text-white text-xl font-bold">
            {currencySymbol(defaultCurrency)}{' '}{totalBalance.toLocaleString('en', { maximumFractionDigits: 2 })}
          </p>
          <p className="text-white/20 text-[10px] mt-0.5">{defaultCurrency}</p>
        </div>

        {/* Accounts list */}
        <div className="px-5 py-3 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">{t.myAccounts}</p>
            <button
              onClick={() => setShowAddAccount(true)}
              className="w-5 h-5 rounded-md bg-mint/20 text-mint flex items-center justify-center text-sm hover:bg-mint/30 transition-colors leading-none"
              title="Add account"
            >+</button>
          </div>
          <div className="space-y-2.5">
            {accounts.map(acc => (
              <div key={acc.id} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    acc.type === 'bank'    ? 'bg-[#4F8EF7]' :
                    acc.type === 'cash'   ? 'bg-yellow-400' :
                    acc.type === 'card'   ? 'bg-purple-400' :
                    acc.type === 'crypto' ? 'bg-orange-400' :
                    'bg-[#4F8EF7]'
                  }`} />
                  <span className="text-white/70 text-xs group-hover:text-white transition-colors truncate max-w-[90px]">{acc.name}</span>
                </div>
                <span className="text-white/50 text-xs">
                  {currencySymbol(acc.currency)}{' '}{(acc.balance || 0).toLocaleString('en', { maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* User + sign out / back to landing */}
        <div className="px-5 py-4 border-t border-white/5">
          {demo ? (
            <button onClick={() => navigate('/')} className="text-mint hover:text-mint/80 text-xs font-medium transition-colors flex items-center gap-1.5">
              ← {t.backToSite || 'На главную'}
            </button>
          ) : (
            <>
              <p className="text-white/40 text-xs truncate mb-2">{user?.email}</p>
              <button onClick={signOut} className="text-white/40 hover:text-white/70 text-xs transition-colors flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 1h2a1 1 0 011 1v8a1 1 0 01-1 1H8M5 9l3-3-3-3M8 6H1"/>
                </svg>
                {t.signOut}
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 sm:px-6 py-2.5 lg:py-3 border-b border-white/5 bg-[#111] flex-shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Hamburger (mobile only) */}
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="lg:hidden flex-shrink-0 flex flex-col gap-1 p-2 -ml-1 rounded-lg hover:bg-white/5"
              aria-label="Toggle sidebar"
            >
              <span className="w-5 h-0.5 bg-white/70 block" />
              <span className="w-5 h-0.5 bg-white/70 block" />
              <span className="w-5 h-0.5 bg-white/70 block" />
            </button>

            {/* Tabs — horizontally scrollable */}
            <div className="relative flex-1 min-w-0">
              <div
                ref={tabsScrollRef}
                className="flex items-center gap-1 overflow-x-auto scroll-smooth pr-16 min-w-0 scrollbar-none"
              >
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => { navigate(tab.path); setSidebarOpen(false) }}
                    className={`flex-shrink-0 px-2 sm:px-2.5 py-2 rounded-lg text-[11px] sm:text-xs font-medium transition-colors ${
                      tab.key === 'ai'
                        ? currentTab === 'ai'
                          ? 'bg-[#4F8EF7]/20 text-[#4F8EF7] border border-[#4F8EF7]/30'
                          : 'text-[#4F8EF7]/50 hover:text-[#4F8EF7]/80 border border-[#4F8EF7]/10 hover:border-[#4F8EF7]/30'
                        : currentTab === tab.key
                          ? 'bg-white/10 text-white'
                          : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#111] to-transparent" />
              <button
                type="button"
                onClick={() => scrollTabs(1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg border border-white/10 bg-[#1a1a1a] text-white/60 hover:text-white hover:border-white/20 transition-colors"
                aria-label="Scroll tabs right"
              >
                →
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none min-w-0 pb-0.5 lg:pb-0">
            <button onClick={() => setShowAddModal('income')}
              className="flex-shrink-0 bg-mint text-dark text-xs font-bold px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-mint/90 transition-colors">
              <span className="text-base leading-none">+</span> <span className="whitespace-nowrap">{t.income}</span>
            </button>
            <button onClick={() => setShowAddModal('expense')}
              className="flex-shrink-0 bg-red-500/80 text-white text-xs font-bold px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-red-500 transition-colors">
              <span className="text-base leading-none">−</span> <span className="whitespace-nowrap">{t.expense}</span>
            </button>
            <button onClick={() => setShowAddModal('transfer')}
              className="flex-shrink-0 bg-white/10 text-white text-xs font-bold px-3 sm:px-4 py-2 rounded-lg hover:bg-white/15 transition-colors whitespace-nowrap">
              ⇄ {t.transfer}
            </button>
            <div className="w-px h-6 bg-white/10 mx-1 flex-shrink-0" />
            {/* Language switcher */}
            <LangSwitcher />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route index element={<TransactionsView userId={user.id} refreshKey={refreshKey} accounts={accounts} currency={defaultCurrency} demoData={demo ? DEMO_TRANSACTIONS : null} />} />
            <Route path="transactions" element={<TransactionsView userId={user.id} refreshKey={refreshKey} accounts={accounts} currency={defaultCurrency} demoData={demo ? DEMO_TRANSACTIONS : null} />} />
            <Route path="budget" element={<BudgetView userId={user.id} refreshKey={refreshKey} demo={demo} demoData={demo ? DEMO_TRANSACTIONS : null} />} />
            <Route path="goals" element={<GoalsView userId={user.id} demo={demo} />} />
            <Route path="analytics" element={<AnalyticsView userId={user.id} refreshKey={refreshKey} currency={defaultCurrency} demoData={demo ? DEMO_TRANSACTIONS : null} />} />
            <Route path="calendar" element={<CalendarView userId={user.id} demoData={demo ? DEMO_TRANSACTIONS : null} />} />
            <Route path="users" element={<UsersView />} />
            <Route path="invoices" element={<InvoicesView userId={user.id} currency={defaultCurrency} demoData={demo ? DEMO_TRANSACTIONS : null} />} />
            <Route path="categories" element={<CategoriesView userId={user.id} />} />
            <Route path="reports" element={<ReportsView userId={user.id} currency={defaultCurrency} demoData={demo ? DEMO_TRANSACTIONS : null} />} />
            <Route path="taxes" element={
              <ToolPage title={t.taxes || 'Налоги'} subtitle={t.taxesSubtitle || 'Расчёт налогов и ближайшие сроки сдачи'}>
                <TaxWidget userId={user.id} currency={defaultCurrency} demoData={demo ? DEMO_TRANSACTIONS : null} />
              </ToolPage>
            } />
            <Route path="payroll" element={
              <ToolPage title={t.payroll || 'Зарплата'} subtitle={t.payrollSubtitle || 'Калькулятор начислений, удержаний и полной стоимости сотрудника'}>
                <PayrollCalculator userId={user.id} currency={defaultCurrency} onPlannedChange={() => setRefreshKey(k => k + 1)} />
              </ToolPage>
            } />
            <Route path="settings" element={<SettingsView userId={user.id} onSave={loadSettings} demo={demo} />} />
            <Route path="ai" element={<AIAnalyticsView userId={user.id} currency={defaultCurrency} demoData={demo ? DEMO_TRANSACTIONS : null} demoAccounts={demo ? DEMO_ACCOUNTS : null} />} />
          </Routes>
        </main>
      </div>

      {/* Add transaction modal */}
      {showAddModal && (
        <AddTransactionModal
          type={showAddModal}
          userId={user.id}
          accounts={accounts}
          onClose={() => setShowAddModal(null)}
          onSuccess={onTransactionAdded}
        />
      )}

      {/* Add account modal */}
      {showAddAccount && (
        <AddAccountModal
          userId={user.id}
          onClose={() => setShowAddAccount(false)}
          onSuccess={onAccountAdded}
        />
      )}

      {/* Onboarding survey on first login */}
      {onboardingChecked && showOnboarding && (
        <OnboardingSurvey
          userId={user.id}
          onComplete={() => {
            setShowOnboarding(false)
            setRefreshKey(k => k + 1)
            loadSettings()
          }}
        />
      )}
    </div>
  )
}

export default function Dashboard({ demo }) {
  return <DashboardInner demo={demo} />
}
