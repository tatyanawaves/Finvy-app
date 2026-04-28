import { useLanding } from '../context/LanguageContext'

const financialFigures = [
  { name: 'Warren Buffett',    role: 'Berkshire Hathaway' },
  { name: 'Ray Dalio',         role: 'Bridgewater' },
  { name: 'George Soros',      role: 'Soros Fund' },
  { name: 'Jamie Dimon',       role: 'JPMorgan Chase' },
  { name: 'Larry Fink',        role: 'BlackRock' },
  { name: 'Jack Bogle',        role: 'Vanguard' },
  { name: 'Peter Lynch',       role: 'Fidelity' },
  { name: 'Carl Icahn',        role: 'Icahn Enterprises' },
  { name: 'Michael Bloomberg', role: 'Bloomberg L.P.' },
  { name: 'Howard Marks',      role: 'Oaktree Capital' },
  { name: 'Paul Tudor Jones',  role: 'Tudor Investment' },
  { name: 'Stanley Druckenmiller', role: 'Duquesne Capital' },
  // duplicate for seamless loop
  { name: 'Warren Buffett',    role: 'Berkshire Hathaway' },
  { name: 'Ray Dalio',         role: 'Bridgewater' },
  { name: 'George Soros',      role: 'Soros Fund' },
  { name: 'Jamie Dimon',       role: 'JPMorgan Chase' },
  { name: 'Larry Fink',        role: 'BlackRock' },
  { name: 'Jack Bogle',        role: 'Vanguard' },
  { name: 'Peter Lynch',       role: 'Fidelity' },
  { name: 'Carl Icahn',        role: 'Icahn Enterprises' },
  { name: 'Michael Bloomberg', role: 'Bloomberg L.P.' },
  { name: 'Howard Marks',      role: 'Oaktree Capital' },
  { name: 'Paul Tudor Jones',  role: 'Tudor Investment' },
  { name: 'Stanley Druckenmiller', role: 'Duquesne Capital' },
]

export default function Hero({ onOpenModal }) {
  const lt = useLanding()
  const heroTag = (lt.heroTag ?? 'Smart Finance for Kazakhstan').replace(/^[✦★\s]+/, '')

  return (
    <section className="relative min-h-screen flex flex-col pt-14 overflow-hidden bg-[#0d1f3c]">

      {/* ── Deep background gradient ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#123f7a] to-[#4F8EF7]" />


      {/* ── Subtle grid overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(79,142,247,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,247,0.6) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Floating glass cards (decorative) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Card left */}
        <div className="absolute top-1/3 left-[5%] lg:left-[8%] hidden lg:block">
          <div className="w-52 bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-2xl p-4 rotate-[-6deg] shadow-xl">
            <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2 font-bold">Balance</p>
            <p className="text-white font-black text-xl tabular-nums">₸ 842 500</p>
            <div className="mt-3 flex items-center gap-1.5">

              <span className="text-[#4F8EF7] text-xs font-semibold">+12.4% this month</span>
            </div>
          </div>
        </div>
        {/* Card right */}
        <div className="absolute top-1/4 right-[5%] lg:right-[8%] hidden lg:block">
          <div className="w-48 bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-2xl p-4 rotate-[5deg] shadow-xl">
            <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2 font-bold">Cashback</p>
            <p className="text-[#4F8EF7] font-black text-xl tabular-nums">+₸ 15 250</p>
            <p className="text-white/30 text-xs mt-1">saved this month</p>
          </div>
        </div>
        {/* Card bottom-right */}
        <div className="absolute bottom-1/4 right-[6%] lg:right-[12%] hidden lg:block">
          <div className="w-44 bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-2xl p-4 rotate-[-3deg] shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-[#4F8EF7]/20 flex items-center justify-center">
                <span className="text-[#4F8EF7] text-xs">✓</span>
              </div>
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-wide">AI Report</span>
            </div>
            <p className="text-white/80 text-xs leading-relaxed">Best card: <span className="text-[#4F8EF7] font-bold">Halyk Bonus</span></p>
            <p className="text-white/30 text-[10px] mt-1">37% cashback on fuel</p>
          </div>
        </div>
      </div>

      {/* ── Main hero content ── */}
      <div className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-20">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6 bg-[#4F8EF7]/10 backdrop-blur-sm border border-[#4F8EF7]/20 text-[#4F8EF7] text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">

          {heroTag}
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight max-w-3xl mb-2">
          <span className="text-white">{lt.heroTitleLine1 ?? lt.heroTitle}</span>
          {lt.heroTitleLine2 && (
            <>
              <br />
              <span className="bg-gradient-to-r from-[#4F8EF7] via-[#7aaeff] to-[#4F8EF7] bg-clip-text text-transparent">
                {lt.heroTitleLine2}
              </span>
            </>
          )}
        </h1>

        <p className="mt-6 text-white/45 text-lg max-w-xl leading-relaxed">
          {lt.heroSub}
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {/* Primary — solid blue */}
          <button
            onClick={onOpenModal}
            className="relative group bg-[#4F8EF7] hover:bg-[#4F8EF7]/90 text-white font-bold px-8 py-4 rounded-2xl transition-all flex items-center gap-3 text-base shadow-[0_0_40px_rgba(79,142,247,0.35)] hover:shadow-[0_0_55px_rgba(79,142,247,0.5)] active:scale-[0.98]"
          >
            {lt.tryFree}
            <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full font-semibold">{lt.freeBadge}</span>
          </button>

        </div>

        <p className="mt-4 text-white/25 text-sm">{lt.trialNote}</p>

        {/* Trust strip — glass cards */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: '🏦', label: lt.heroTrust1 ?? '11 banks' },
            { icon: '🔒', label: lt.heroTrust2 ?? 'Secure data' },
            { icon: '⚡', label: lt.heroTrust3 ?? '3-min setup' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-full px-4 py-2">
              <span className="text-sm">{item.icon}</span>
              <span className="text-white/50 text-xs font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Financial figures marquee ── */}
      <div className="relative border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-sm py-3 overflow-hidden">
        <p className="text-center text-white/15 text-[9px] uppercase tracking-[0.2em] font-bold mb-2">
          World's greatest financial minds trust data-driven decisions
        </p>
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {financialFigures.map((fig, i) => (
              <span key={i} className="inline-flex items-center gap-2 mx-8">

                <span className="text-white/35 font-semibold text-sm">{fig.name}</span>
                <span className="text-white/15 text-xs font-normal">{fig.role}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
