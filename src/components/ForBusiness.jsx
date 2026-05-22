import { useLanding } from '../context/LanguageContext'
import { IconBolt, IconChart, IconCheck, IconLock } from './Icons'

export default function ForBusiness({ onOpenModal }) {
  const lt = useLanding()

  return (
    <section id="for-business" className="bg-[#24272b] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
            {lt.bizTitle}
          </h2>
          <p className="text-white/50 whitespace-pre-line">{lt.bizSub}</p>
        </div>

        {/* Business tags */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {lt.businesses.map((b, i) => (
            <span
              key={i}
              className="bg-[#2b2f34] border border-white/10 text-white/70 text-sm px-4 py-2 rounded-full hover:border-mint/30 hover:text-white transition-colors cursor-pointer"
            >
              {b}
            </span>
          ))}
        </div>

        {/* CTA banner */}
        <div className="relative overflow-hidden rounded-[2rem] border border-[#cfe3ff] bg-white p-6 shadow-[0_34px_100px_-58px_rgba(79,142,247,0.72)] md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(184,220,255,0.65),transparent_34%),linear-gradient(135deg,#ffffff_0%,#f3f9ff_48%,#eaf7ff_100%)]" />
          <div className="absolute right-[-10%] top-[-28%] h-72 w-72 rounded-full bg-[#b8dcff]/50 blur-3xl" />
          <div className="absolute bottom-[-32%] left-[28%] h-60 w-60 rounded-full bg-[#8ddcff]/20 blur-3xl" />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_0.92fr]">
            <div className="text-center lg:text-left">
              <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#d7e8ff] bg-white/78 px-4 py-2 text-sm font-bold text-[#1d66f2] shadow-[0_14px_36px_-28px_rgba(29,102,242,0.55)] lg:mx-0">
                <IconLock className="h-4 w-4" />
                Финансовые отчёты без ручной сборки
              </div>

              <h3 className="mx-auto max-w-3xl whitespace-pre-line text-3xl font-black leading-tight tracking-tight text-[#123b73] sm:text-4xl lg:mx-0 lg:text-[2.75rem]">
                {lt.bizCTA}
              </h3>

              <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-relaxed text-[#587198] lg:mx-0">
                Finvy собирает операции, категории и движение денег в понятный управленческий отчёт для собственника.
              </p>

              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                <button
                  onClick={onOpenModal}
                  className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-[#1d66f2] px-6 py-4 text-base font-black text-white shadow-[0_22px_48px_-24px_rgba(29,102,242,0.82)] transition hover:-translate-y-0.5 hover:bg-[#1557d5] active:translate-y-0 sm:w-auto"
                >
                  {lt.bizBtn}
                  <IconBolt className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ['Cash Flow', 'готов сразу'],
                  ['P&L', 'по категориям'],
                  ['PDF', 'для команды'],
                ].map(([title, desc]) => (
                  <div key={title} className="rounded-2xl border border-[#d7e8ff] bg-white/76 px-4 py-3 text-left shadow-[0_16px_40px_-32px_rgba(22,75,145,0.45)] backdrop-blur">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#eaf5ff] text-[#1d66f2]">
                      <IconCheck className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-black text-[#123b73]">{title}</p>
                    <p className="mt-1 text-xs font-bold text-[#6f86a8]">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-5 rounded-[2rem] bg-[#78cfff]/18 blur-3xl" />
              <div className="relative overflow-hidden rounded-[1.6rem] border border-[#cfe3ff] bg-white shadow-[0_28px_80px_-44px_rgba(18,59,115,0.62)]">
                <div className="border-b border-[#e2edff] bg-gradient-to-r from-[#f7fbff] to-[#edf8ff] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6f86a8]">{lt.bizChartYear}</p>
                      <p className="mt-1 text-xl font-black text-[#123b73]">₸ 12.8M</p>
                    </div>
                    <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-bold text-[#1d66f2]">
                      {lt.bizChartCat}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#123b73] text-[#8ddcff]">
                        <IconChart className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-black text-[#123b73]">Cash Flow</p>
                        <p className="text-xs font-bold text-[#7d8fab]">доходы, расходы, прибыль</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-[#1d66f2]">+24%</p>
                  </div>

                  <div className="flex h-28 items-end gap-2 rounded-2xl border border-[#edf3ff] bg-[#f8fbff] px-4 py-3">
                    {[60, 80, 45, 90, 70, 55, 85, 40, 75, 65, 88, 50].map((h, i) => (
                      <div key={i} className="flex flex-1 flex-col justify-end gap-1">
                        <div className="rounded-t bg-[#1d66f2]" style={{ height: `${h * 0.52}px` }} />
                        <div className="rounded-b bg-[#8ddcff]" style={{ height: `${Math.max(10, (100 - h) * 0.18)}px` }} />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#123b73] p-3 text-white">
                      <p className="text-xs font-bold text-white/60">Прибыль</p>
                      <p className="mt-1 text-lg font-black">₸ 3.1M</p>
                    </div>
                    <div className="rounded-2xl border border-[#d7e8ff] bg-[#f8fbff] p-3">
                      <p className="text-xs font-bold text-[#6f86a8]">Отчёт</p>
                      <p className="mt-1 text-lg font-black text-[#1d66f2]">3 мин</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
