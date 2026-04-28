import { useLanding } from '../context/LanguageContext'

export default function CashbackTeaser({ onOpenModal }) {
  const lt = useLanding()

  const totalMonthly = 15250   // 8000+3000+2000+2250
  const totalAnnual  = totalMonthly * 12  // 183 000

  return (
    <section className="relative overflow-hidden py-20 px-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#4F8EF7]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-mint/4 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 bg-mint/10 border border-mint/20 text-mint text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
            {lt.cashbackSectionTag}
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-5 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
            {lt.cashbackSectionTitle}
          </h2>
          <p className="text-white/45 text-base leading-relaxed">
            {lt.cashbackSectionSub}{' '}
            <span className="text-mint font-bold">{lt.cashbackSectionSubHighlight}</span>
            {' '}{lt.cashbackSectionSubEnd}
          </p>
        </div>

        {/* 4 stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {lt.cashbackStats.map((s, i) => (
            <div key={i}
              className="relative group bg-white/[0.03] border border-white/[0.07] hover:border-mint/25 rounded-2xl p-5 text-center transition-all hover:bg-white/[0.05]">
              <div className="text-3xl font-black text-mint mb-1 tabular-nums">{s.value}</div>
              <div className="text-white/80 text-sm font-semibold mb-1">{s.label}</div>
              <div className="text-white/30 text-xs leading-tight">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Main content: example table + visual */}
        <div className="grid lg:grid-cols-2 gap-6 items-start">

          {/* Left: Example calculation table */}
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
                {lt.cashbackExampleTitle}
              </p>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-mint/10 text-mint border border-mint/20">
                Finvy AI
              </span>
            </div>

            <div className="divide-y divide-white/[0.05]">
              {/* Header row */}
              <div className="grid grid-cols-[1fr_80px_90px_72px] gap-2 px-5 py-2.5">
                {lt.cashbackTableHeaders.map(h => (
                  <span key={h} className="text-white/20 text-[10px] font-bold uppercase tracking-wider">{h}</span>
                ))}
              </div>

              {lt.cashbackExampleRows.map((row, i) => (
                <div key={i}
                  className="grid grid-cols-[1fr_80px_90px_72px] gap-2 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <span className="text-white/75 text-sm">{row.cat}</span>
                  <span className="text-white/40 text-sm tabular-nums">{row.spend}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white/50 text-xs truncate">{row.best}</span>
                    <span className="flex-shrink-0 text-[10px] font-bold px-1 py-0.5 rounded-md bg-[#4F8EF7]/15 text-[#4F8EF7]">
                      {row.pct}
                    </span>
                  </div>
                  <span className="text-mint text-sm font-bold tabular-nums">+{row.earn}</span>
                </div>
              ))}
            </div>

            {/* Total row */}
            <div className="px-5 py-4 bg-mint/[0.04] border-t border-mint/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/40 text-xs">{lt.cashbackExampleTotal}</p>
                  <p className="text-2xl font-black text-mint tabular-nums mt-0.5">
                    +{totalMonthly.toLocaleString('ru-RU')} ₸
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/25 text-xs">{lt.cashbackExampleYear}</p>
                  <p className="text-lg font-black text-white/60 tabular-nums mt-0.5">
                    ≈ {totalAnnual.toLocaleString('ru-RU')} ₸
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: how it works + bank logos */}
          <div className="flex flex-col gap-4">

            {/* 3 steps */}
            {lt.cashbackSteps.map((step, i) => ({ ...step, n: String(i + 1) })).map((step) => (
              <div key={step.n} className="flex gap-4 bg-white/[0.025] border border-white/[0.06] rounded-xl p-4 hover:border-white/10 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-mint/10 border border-mint/20 flex items-center justify-center flex-shrink-0 text-sm font-black text-mint">
                  {step.n}
                </div>
                <div>
                  <p className="text-white/80 text-sm font-semibold mb-0.5">{step.icon} {step.title}</p>
                  <p className="text-white/35 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}

            {/* Bank logos strip */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-3">{lt.cashbackBanksLabel}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { logo: '🟢', name: 'Halyk' },
                  { logo: '🟠', name: 'Freedom' },
                  { logo: '🔵', name: 'RBK' },
                  { logo: '🩷', name: 'Home' },
                  { logo: '🟣', name: 'Simply' },
                  { logo: '🔴', name: 'Eurasian' },
                  { logo: '🟩', name: 'Bereke' },
                  { logo: '🟡', name: 'Altyn' },
                  { logo: '🔷', name: 'Nurbank' },
                  { logo: '💜', name: 'Primus' },
                  { logo: '🟧', name: 'Shinhan' },
                ].map(b => (
                  <div key={b.name}
                    className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1.5">
                    <span className="text-sm">{b.logo}</span>
                    <span className="text-white/45 text-xs font-medium">{b.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={onOpenModal}
              className="w-full py-4 rounded-xl bg-mint text-dark font-black text-sm hover:bg-mint/90 active:scale-[0.99] transition-all shadow-[0_0_30px_rgba(79,142,247,0.2)] flex flex-col items-center gap-0.5">
              <span>{lt.cashbackCta}</span>
              <span className="text-dark/50 text-[11px] font-normal">{lt.cashbackCtaSub}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
