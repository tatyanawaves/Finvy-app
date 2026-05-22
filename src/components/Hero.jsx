import { useLanding } from '../context/LanguageContext'
import { IconBank, IconLock, IconBolt, IconChart, IconArrowUpRight } from './Icons'

// Helper Component: Bank capsule badge with live pulse indicator
function BankBadge({ name, logoColor, className }) {
  return (
    <div className={`absolute z-30 flex items-center gap-1.5 rounded-full border border-white/60 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-slate-800 shadow-[0_12px_24px_-10px_rgba(15,72,154,0.15)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
      </span>
      <span className="flex items-center gap-1">
        <span className={logoColor}>●</span> {name}
      </span>
    </div>
  )
}

// Visual Composition Component (Floating Cards, Widgets, and SVG Chart)
function VisualComposition() {
  return (
    <div className="relative mx-auto h-[480px] w-full max-w-[480px] xl:max-w-[520px]">
      {/* ── Soft glowing background blobs matching project colors ── */}
      <div className="bg-blob-1 absolute -left-4 top-[10%] h-80 w-80 rounded-full bg-gradient-to-tr from-[#38bdf8]/18 to-[#38bdf8]/5 blur-[80px] pointer-events-none" />
      <div className="bg-blob-2 absolute -right-6 bottom-[15%] h-80 w-80 rounded-full bg-gradient-to-br from-[#34d399]/18 to-[#34d399]/5 blur-[80px] pointer-events-none" />
      
      {/* 3D Perspective container */}
      <div className="relative h-full w-full" style={{ perspective: '1200px' }}>
        
        {/* ── Element 1: Premium Glassmorphic Debit/Credit Card ("Finvy Card") ── */}
        <div className="float-card-a absolute left-[10%] top-[4%] z-20 w-[290px] sm:w-[320px] h-[175px] sm:h-[190px] rounded-2xl border border-white/40 bg-gradient-to-br from-[#38bdf8]/90 via-[#38bdf8]/40 to-[#34d399]/85 p-5 text-white shadow-[0_32px_64px_-20px_rgba(14,66,145,0.4)] backdrop-blur-xl transition-all duration-500 hover:rotate-[-2deg] hover:scale-105 hover:shadow-[0_45px_80px_-25px_rgba(14,66,145,0.55)]">
          {/* Card Glass Highlight */}
          <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(255,255,255,0.25),transparent_60%)]" />
          
          <div className="relative z-10 flex h-full flex-col justify-between">
            {/* Top Row */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Finvy</span>
                <p className="text-xs font-bold leading-none tracking-tight opacity-90 mt-0.5">Business Premium</p>
              </div>
              {/* Contactless symbol */}
              <svg className="h-5 w-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 8a4 4 0 0 1 0 8M8 6a7 7 0 0 1 0 12M11 4a10 10 0 0 1 0 16" />
              </svg>
            </div>

            {/* Chip */}
            <div className="my-1.5 h-7 w-9 rounded-md bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-300 p-1 shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 opacity-40 border border-amber-900/10 grid grid-cols-3 grid-rows-3" />
              <div className="w-full h-full border border-amber-900/20 rounded-sm" />
            </div>

            {/* Bottom Row */}
            <div className="flex items-end justify-between">
              <div>
                <p className="font-mono text-sm tracking-[0.15em] sm:text-base">•••• •••• •••• 2026</p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider opacity-75">Finvy Partner</p>
              </div>
              
              {/* Premium Dual Sphere Logo (Revolut-style) */}
              <div className="flex -space-x-2.5">
                <div className="h-7 w-7 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm" />
                <div className="h-7 w-7 rounded-full bg-white/30 border border-white/30 backdrop-blur-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Element 2: Translucent AI Insights Panel ── */}
        <div className="float-card-b absolute right-[2%] top-[34%] z-35 w-[240px] sm:w-[260px] rounded-2xl border border-white/50 bg-white/80 p-4 shadow-[0_24px_50px_-18px_rgba(15,72,154,0.18)] backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:bg-white/90">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-[#34d399]/15 text-[#059669]">
                ✦
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">AI Insight</span>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600">Активно</span>
          </div>

          <div className="mt-2.5">
            <p className="text-[13px] font-bold text-slate-800 leading-snug">
              Найдено <span className="text-[#059669]">183 000 ₸</span> неиспользованного кэшбека
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-400">
              Kaspi Business → переведите ФОТ на Freedom Bank
            </p>
          </div>

          <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#34d399] py-2 text-xs font-bold text-white shadow-md transition-all duration-300 hover:brightness-105 hover:shadow-lg active:scale-98">
            <span>Применить оптимизацию</span>
            <IconArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        {/* ── Element 3: Translucent Live Cash Flow SVG Chart ── */}
        <div className="float-card-c absolute left-[2%] bottom-[6%] z-30 w-[270px] sm:w-[290px] rounded-2xl border border-white/50 bg-white/85 p-4 shadow-[0_28px_56px_-22px_rgba(15,72,154,0.22)] backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:bg-white/95">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Прогноз Cash Flow</p>
              <h4 className="text-lg font-black tracking-tight text-slate-800 mt-0.5">₸ 5 412 000</h4>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
              ↑ 18.4%
            </span>
          </div>

          {/* SVG Chart Area */}
          <div className="mt-3 h-20 w-full overflow-hidden rounded-lg">
            <svg viewBox="0 0 280 80" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#34d399" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="15" x2="280" y2="15" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="40" x2="280" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="65" x2="280" y2="65" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              
              {/* Gradient Fill under Path */}
              <path
                d="M 0 70 Q 40 68 80 50 T 160 38 T 240 18 L 280 12 L 280 80 L 0 80 Z"
                fill="url(#chartGradient)"
              />
              
              {/* Main Line */}
              <path
                d="M 0 70 Q 40 68 80 50 T 160 38 T 240 18 L 280 12"
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              
              {/* Pulsing Active Tracker Dot */}
              <g transform="translate(280, 12)">
                <circle r="6" fill="#34d399" className="animate-ping opacity-60" />
                <circle r="4.5" fill="#34d399" stroke="white" strokeWidth="1.5" />
              </g>
            </svg>
          </div>
          
          <div className="mt-2.5 flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            <span>1 Мая</span>
            <span>15 Мая</span>
            <span>30 Мая (Прогноз)</span>
          </div>
        </div>

        {/* ── Element 4: Floating active Bank sync capsules ── */}
        <BankBadge name="Kaspi" logoColor="text-red-500" className="right-[50%] top-[-2%] translate-x-[50%]" />
        <BankBadge name="Halyk" logoColor="text-emerald-500" className="left-[4%] top-[45%]" />
        <BankBadge name="Bereke" logoColor="text-orange-500" className="right-[35%] bottom-[2%]" />
      </div>
    </div>
  )
}

export default function Hero({ onOpenModal }) {
  const lt = useLanding()

  const trustItems = [
    { Icon: IconBank, label: lt.heroTrust1 ?? '11 банков КЗ' },
    { Icon: IconLock, label: lt.heroTrust2 ?? 'Банковское шифрование' },
    { Icon: IconBolt, label: lt.heroTrust3 ?? 'Настройка за 3 мин' },
  ]

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-white pt-20 pb-16 sm:pb-20 lg:pt-24">
      {/* ── Custom organic background gradient blend (light blue + light green) ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-[#f0f9ff] to-[#f0fdf4] pointer-events-none" />
      
      {/* ── Background soft spots (glowing blobs) ── */}
      <div className="absolute left-[10%] top-[8%] h-[32rem] w-[32rem] rounded-full bg-gradient-to-tr from-[#38bdf8]/14 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute right-[-10%] top-[25%] h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-[#34d399]/12 to-transparent blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[25%] h-[28rem] w-[28rem] rounded-full bg-gradient-to-t from-[#38bdf8]/10 via-[#34d399]/8 to-transparent blur-[110px] pointer-events-none" />

      {/* Modern Light grid backdrop */}
      <div className="absolute inset-0 grid-bg-light opacity-[0.32] pointer-events-none" />

      {/* Main Grid Wrapper */}
      <div className="relative mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl items-center gap-10 px-6 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
        
        {/* Left Side: Content & Typography */}
        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
          
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#38bdf8]/20 bg-[#38bdf8]/6 px-4 py-1.5 text-xs font-bold text-[#0284c7] backdrop-blur-md transition-all duration-300 hover:bg-[#38bdf8]/12">
            <span className="flex h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#38bdf8] to-[#34d399]"></span>
            <span>{lt.heroTag ?? '✦ Умные финансы для Казахстана'}</span>
          </div>

          {/* Big bold headline inspired by Revolut */}
          <h1 className="mt-6 text-[2.5rem] font-black leading-[1.05] tracking-tight text-slate-800 sm:text-[3.4rem] lg:text-[4.2rem] xl:text-[4.5rem]">
            {lt.heroTitleLine1 ?? 'Получите реальную прибыль'}
            {lt.heroTitleLine2 && (
              <>
                <br />
                <span className="bg-gradient-to-r from-[#38bdf8] via-[#0284c7] to-[#059669] bg-clip-text text-transparent drop-shadow-sm">
                  {lt.heroTitleLine2}
                </span>
              </>
            )}
          </h1>

          {/* Elegant Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-slate-500 sm:text-[1.125rem] lg:mx-0">
            {lt.heroSub}
          </p>

          {/* CTA Row with glowing hover effect */}
          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
            <button
              onClick={onOpenModal}
              className="group relative flex w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#38bdf8] to-[#34d399] px-8 py-4.5 text-base font-extrabold text-white shadow-[0_20px_40px_-15px_rgba(56,189,248,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_25px_50px_-12px_rgba(56,189,248,0.6)] active:translate-y-0 sm:w-auto"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span>{lt.tryFree}</span>
            </button>
            
            <a
              href="/download"
              className="flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-7 py-4 text-base font-bold text-slate-700 backdrop-blur transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-98 sm:w-auto"
            >
              <span>Презентация</span>
              <IconArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
            </a>
          </div>

          {/* Trust badges bar */}
          <div className="mt-12 border-t border-slate-100 pt-8">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 text-center lg:text-left mb-4">
              Безопасность и интеграция
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {trustItems.map(({ Icon, label }) => (
                <div key={label} className="group flex items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white/60 px-4 py-3.5 shadow-[0_12px_30px_-20px_rgba(22,75,145,0.08)] backdrop-blur transition-all duration-300 hover:border-slate-200 hover:bg-white lg:justify-start">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#38bdf8]/10 text-[#0284c7] transition-colors duration-300 group-hover:bg-[#34d399]/15 group-hover:text-[#059669]">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="text-xs font-extrabold text-slate-600 transition-colors duration-300 group-hover:text-slate-800">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Floating Dashboard mockups (Desktop Only) */}
        <div className="relative hidden lg:block select-none">
          <VisualComposition />
          
          {/* Subtitle features bottom bar */}
          <div className="mx-auto mt-4 grid max-w-[480px] xl:max-w-[520px] grid-cols-3 gap-3">
            {[
              ['20+', lt.cashbackSubtitle ?? 'карт с кэшбеком', 'border-sky-100 bg-sky-50/20 text-[#0284c7]'],
              ['24/7', lt.analyticsSubtitle ?? 'аналитика', 'border-emerald-100 bg-emerald-50/20 text-[#059669]'],
              ['PDF', lt.reportsSubtitle ?? 'отчёты', 'border-slate-200 bg-slate-50/20 text-slate-600'],
            ].map(([value, label, themeClass]) => (
              <div key={label} className={`rounded-xl border p-3 text-center shadow-[0_12px_24px_-16px_rgba(15,72,154,0.1)] backdrop-blur-md transition-all duration-300 hover:scale-103 ${themeClass}`}>
                <p className="text-lg font-black">{value}</p>
                <p className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wide opacity-80">{label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </section>
  )
}
