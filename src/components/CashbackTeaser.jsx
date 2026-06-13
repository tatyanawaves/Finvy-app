import { useLanding } from '../context/LanguageContext'

const banks = [
  { name: 'Halyk', icon: '/bank-logos/halyk.png' },
  { name: 'Freedom', icon: '/bank-logos/freedom.ico' },
  { name: 'RBK', icon: '/bank-logos/rbk.ico' },
  { name: 'Home', icon: '/bank-logos/homecredit.png' },
  { name: 'Simply', icon: '/bank-logos/simply.png' },
  { name: 'Eurasian', icon: '/bank-logos/eurasian.ico' },
  { name: 'Bereke', icon: '/bank-logos/bereke.svg' },
  { name: 'Altyn', icon: '/bank-logos/altyn.png' },
  { name: 'Nurbank', icon: '/bank-logos/nurbank.png' },
  { name: 'Primus', icon: '/bank-logos/primus.ico' },
  { name: 'Shinhan', icon: '/bank-logos/shinhan.ico' },
]

const stepIcons = [
  (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M5 6.8A2.8 2.8 0 0 1 7.8 4h8.4A2.8 2.8 0 0 1 19 6.8v10.4a2.8 2.8 0 0 1-2.8 2.8H7.8A2.8 2.8 0 0 1 5 17.2V6.8Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.4 9.2h7.2M8.4 12h7.2M8.4 14.8h4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M4.5 10.2 12 5l7.5 5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.2 10.2h11.6v7.2H6.2v-7.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.6 17.4v-4.2M12 17.4v-4.2M15.4 17.4v-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5.2 19h13.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5v-9Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.4 13.4 11 16l4.8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.2 8.6h7.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
]

const exampleIcons = [
  (
    <svg viewBox="0 0 28 28" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M8.2 11.1h12l-1.1 7.6a2.4 2.4 0 0 1-2.4 2.1H11a2.4 2.4 0 0 1-2.4-2.1l-1.1-7.6Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M8.2 11.1h12l-1.1 7.6a2.4 2.4 0 0 1-2.4 2.1H11a2.4 2.4 0 0 1-2.4-2.1l-1.1-7.6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M10.9 11a3.3 3.3 0 0 1 6.6 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7 11.1h14.2M12 15h4.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 28 28" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M9.3 8h9.4l1.1 4.6H8.2L9.3 8Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M9.3 8h9.4l1.1 4.6H8.2L9.3 8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M8.6 12.6h10.8v8.2H8.6v-8.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 16h4M12 18.7h4M10.8 8V6.8h6.4V8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 28 28" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M8.2 7.3v6.3a3.1 3.1 0 0 0 6.2 0V7.3M14.4 7.3v6.3a3.1 3.1 0 0 0 6.2 0V7.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6.8 21h14.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M10.7 20.8v-4.2M17.3 20.8v-4.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9.2 7.3h10.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity="0.55" />
    </svg>
  ),
  (
    <svg viewBox="0 0 28 28" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M7.2 18.2h12.1l1.2-4.7a2.2 2.2 0 0 0-2.1-2.8H9.8a2.2 2.2 0 0 0-2 1.2l-1.6 3.2" fill="currentColor" fillOpacity="0.12" />
      <path d="M7.2 18.2h12.1l1.2-4.7a2.2 2.2 0 0 0-2.1-2.8H9.8a2.2 2.2 0 0 0-2 1.2l-1.6 3.2" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.4 18.2a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8ZM18 18.2a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10.6 10.7 12.4 6h3.3l1.4 4.7M10.3 14.4h3.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
]

const stripLeadingIcon = (value) => String(value || '').replace(/^[^\p{L}\p{N}]+/u, '').trim()
const tableGridClass = 'grid grid-cols-[minmax(210px,1.35fr)_minmax(92px,0.65fr)_minmax(118px,0.8fr)_minmax(102px,0.7fr)] gap-3'

export default function CashbackTeaser({ onOpenModal }) {
  const lt = useLanding()

  const totalMonthly = 15250   // 8000+3000+2000+2250
  const totalAnnual  = totalMonthly * 12  // 183 000

  return (
    <section className="relative overflow-hidden py-10 sm:py-14 px-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#4F8EF7]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-mint/4 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto">

        {/* Badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 bg-mint/10 border border-mint/20 text-mint text-xs font-bold px-3 py-1 rounded-full tracking-wide">
            {lt.cashbackSectionTag}
          </span>
        </div>

        {/* Headline - smaller */}
        <div className="text-center mb-4 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
            {lt.cashbackSectionTitle}
          </h2>
          <p className="text-white/45 text-sm leading-relaxed">
            {lt.cashbackSectionSub}{' '}
            <span className="text-mint font-bold">{lt.cashbackSectionSubHighlight}</span>
            {' '}{lt.cashbackSectionSubEnd}
          </p>
        </div>

        {/* 4 stats - compact */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {lt.cashbackStats.map((s, i) => (
            <div key={i}
              className="relative group bg-white/[0.03] border border-white/[0.07] hover:border-mint/25 rounded-lg p-3 text-center transition-all hover:bg-white/[0.05]">
              <div className="text-xl sm:text-2xl font-black text-mint mb-0.5 tabular-nums">{s.value}</div>
              <div className="text-white/80 text-xs font-semibold mb-0.5">{s.label}</div>
              <div className="text-white/30 text-[10px] leading-tight">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Main content: smaller layout */}
        <div className="grid lg:grid-cols-2 gap-4 items-start">

          {/* Left: Example calculation table - compact */}
          <div className="bg-[#24272b] border border-white/[0.08] rounded-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                {lt.cashbackExampleTitle}
              </p>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-mint/10 text-mint border border-mint/20">
                AI
              </span>
            </div>

            <div className="divide-y divide-white/[0.05] overflow-x-auto scrollbar-none">
              <div className="min-w-[600px] sm:min-w-0">
              {/* Header row */}
              <div className={`${tableGridClass} px-3 py-2`}>
                {lt.cashbackTableHeaders.map((h, i) => (
                  <span
                    key={h}
                    className={`text-white/20 text-[9px] font-bold uppercase tracking-wider ${
                      i === 1 || i === 3 ? 'text-right' : ''
                    }`}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {lt.cashbackExampleRows.map((row, i) => (
                <div key={i}
                  className={`${tableGridClass} px-3 py-2 hover:bg-white/[0.02] transition-colors`}>
                  <span className="flex items-center gap-2 text-white/75 text-xs">
                    <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#83b5ff]/28 bg-[linear-gradient(145deg,rgba(79,142,247,0.22),rgba(21,63,132,0.26))] text-[#9bc2ff] shadow-[0_12px_28px_-18px_rgba(79,142,247,0.95),inset_0_1px_0_rgba(255,255,255,0.18)]">
                      <span className="absolute inset-0.5 rounded-lg bg-white/[0.04]" />
                      <span className="relative text-[10px]">
                      {exampleIcons[i] || exampleIcons[0]}
                      </span>
                    </span>
                    <span className="truncate text-[11px]">{stripLeadingIcon(row.cat)}</span>
                  </span>
                  <span className="text-white/40 text-xs tabular-nums text-right whitespace-nowrap">{row.spend}</span>
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-white/50 text-[10px] truncate">{row.best}</span>
                    <span className="flex-shrink-0 text-[9px] font-bold px-0.5 py-0.5 rounded-md bg-[#4F8EF7]/15 text-[#4F8EF7]">
                      {row.pct}
                    </span>
                  </div>
                  <span className="text-mint text-xs font-bold tabular-nums text-right whitespace-nowrap">+{row.earn}</span>
                </div>
              ))}
              </div>
            </div>

            {/* Total row */}
            <div className="px-3 py-3 bg-mint/[0.04] border-t border-mint/10">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-white/40 text-[9px]">{lt.cashbackExampleTotal}</p>
                  <p className="text-xl font-black text-mint tabular-nums mt-0.5">
                    +{totalMonthly.toLocaleString('ru-RU')} ₸
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/25 text-[9px]">{lt.cashbackExampleYear}</p>
                  <p className="text-sm font-black text-white/60 tabular-nums mt-0.5">
                    ≈ {totalAnnual.toLocaleString('ru-RU')} ₸
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: how it works + bank logos - compact */}
          <div className="flex flex-col gap-3">

            {/* 3 steps */}
            {lt.cashbackSteps.map((step, i) => ({ ...step, n: String(i + 1) })).map((step) => (
              <div key={step.n} className="flex items-start gap-3 bg-white/[0.025] border border-white/[0.06] rounded-lg p-3 hover:border-white/10 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-mint/10 border border-mint/20 flex items-center justify-center flex-shrink-0 text-xs font-black text-mint">
                  {step.n}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white/80 text-xs font-semibold mb-0.5">
                    {step.title}
                  </p>
                  <p className="text-white/35 text-[10px] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}

            {/* Bank logos strip - hidden on mobile */}
            <div className="hidden sm:block bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
              <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mb-2">{lt.cashbackBanksLabel}</p>
              <div className="flex flex-wrap gap-1">
                {banks.slice(0, 8).map((bank) => (
                  <div key={bank.name}
                    className="flex min-w-[90px] items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white">
                      <img src={bank.icon} alt="" className="h-full w-full object-contain" loading="lazy" />
                    </span>
                    <span className="text-white/45 text-[10px] font-medium">{bank.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA - smaller */}
            <button
              onClick={onOpenModal}
              className="w-full py-3 rounded-lg bg-mint text-[#24272b] font-black text-xs hover:bg-mint/90 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(79,142,247,0.2)] flex flex-col items-center gap-0.5">
              <span>{lt.cashbackCta}</span>
              <span className="text-[#24272b]/50 text-[10px] font-normal">{lt.cashbackCtaSub}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
