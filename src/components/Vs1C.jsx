import { useLanding } from '../context/LanguageContext'

export default function Vs1C({ onOpenModal }) {
  const lt = useLanding()

  return (
    <section className="bg-dark py-20 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-mint bg-mint/10 px-4 py-1.5 rounded-full">
            {lt.vs1cBadge}
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-white mt-6 leading-tight">
            {lt.vs1cTitle} <span className="text-white/30">1С</span>
          </h2>
          <p className="mt-4 text-white/40 max-w-xl mx-auto text-base">
            {lt.vs1cSub}
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block rounded-2xl overflow-hidden border border-white/10">
          <div className="grid grid-cols-[1fr_1fr_1fr] bg-[#1a1a1a]">
            <div className="px-6 py-4 text-white/30 text-xs font-semibold uppercase tracking-wider border-r border-white/5">
              {lt.vs1cParam}
            </div>
            <div className="px-6 py-4 flex items-center gap-2 border-r border-white/5">
              <div className="w-6 h-6 rounded-lg bg-mint flex items-center justify-center">
                <span className="text-dark font-black text-xs">f</span>
              </div>
              <span className="text-white font-bold text-sm">{lt.vs1cFinvy}</span>
            </div>
            <div className="px-6 py-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-white/40 font-bold text-xs">1C</span>
              </div>
              <span className="text-white/40 font-bold text-sm">1С</span>
            </div>
          </div>
          {lt.vs1cRows.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-[1fr_1fr_1fr] border-t border-white/5 ${
                i % 2 === 0 ? 'bg-[#161616]' : 'bg-[#141414]'
              }`}
            >
              <div className="px-6 py-4 border-r border-white/5 flex items-center">
                <span className="text-white/50 text-sm font-medium">{row.aspect}</span>
              </div>
              <div className="px-6 py-4 border-r border-white/5 flex items-start gap-2.5">
                <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-mint/20 flex items-center justify-center text-mint text-[10px] font-black">✓</span>
                <span className="text-white/80 text-sm leading-snug">{row.finvy}</span>
              </div>
              <div className="px-6 py-4 flex items-start gap-2.5">
                <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-red-500/15 flex items-center justify-center text-red-400 text-[10px] font-black">✕</span>
                <span className="text-white/40 text-sm leading-snug">{row.onec}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {/* Header */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-white/30 text-xs font-semibold uppercase tracking-wider">{lt.vs1cParam}</div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-mint flex items-center justify-center flex-shrink-0">
                <span className="text-dark font-black text-[10px]">f</span>
              </div>
              <span className="text-white font-bold text-xs">{lt.vs1cFinvy}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-white/40 font-bold text-[10px]">1C</span>
              </div>
              <span className="text-white/40 font-bold text-xs">1С</span>
            </div>
          </div>

          {lt.vs1cRows.map((row, i) => (
            <div key={i} className="rounded-xl border border-white/8 bg-[#161616] overflow-hidden">
              <div className="px-4 py-2 border-b border-white/5 bg-[#1a1a1a]">
                <span className="text-white/60 text-xs font-semibold">{row.aspect}</span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-white/5">
                <div className="px-3 py-3 flex items-start gap-2">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-mint/20 flex items-center justify-center text-mint text-[9px] font-black mt-0.5">✓</span>
                  <span className="text-white/80 text-xs leading-snug">{row.finvy}</span>
                </div>
                <div className="px-3 py-3 flex items-start gap-2">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-red-500/15 flex items-center justify-center text-red-400 text-[9px] font-black mt-0.5">✕</span>
                  <span className="text-white/40 text-xs leading-snug">{row.onec}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 bg-gradient-to-r from-mint/10 to-mint/5 border border-mint/20 rounded-2xl px-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-lg">{lt.vs1cSwitchCTA}</p>
            <p className="text-white/40 text-sm mt-1">{lt.vs1cSwitchSub}</p>
          </div>
          <button
            onClick={onOpenModal}
            className="flex-shrink-0 bg-mint text-dark font-bold text-sm px-6 py-3 rounded-xl hover:bg-mint/90 transition-colors"
          >
            {lt.vs1cBtn}
          </button>
        </div>

      </div>
    </section>
  )
}
