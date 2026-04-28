import { useLanding } from '../context/LanguageContext'

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
        <div className="bg-mint rounded-3xl p-10 md:p-16 flex flex-col items-center justify-center gap-8 overflow-hidden relative text-center">
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none">
            <div className="absolute right-8 top-8 w-64 h-48 bg-[#24272b]/20 rounded-2xl" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <h3 className="text-4xl font-black text-[#24272b] mb-5 whitespace-pre-line max-w-3xl">
              {lt.bizCTA}
            </h3>
            <button onClick={onOpenModal} className="bg-[#24272b] text-white font-semibold px-6 py-3 rounded-xl inline-flex items-center justify-center gap-3 hover:bg-[#24272b]/85 transition-colors">
              {lt.bizBtn}
            </button>
          </div>
          {/* Mini chart mockup */}
          <div className="relative z-10 bg-white/10 rounded-2xl p-4 w-full max-w-sm">
            <div className="bg-[#2b2f34] rounded-xl p-4">
              <div className="flex justify-between text-xs text-white/40 mb-3">
                <span>{lt.bizChartYear}</span>
                <span>{lt.bizChartCat}</span>
                <span>{lt.bizChartLines}</span>
              </div>
              <div className="flex items-end gap-1 h-20">
                {[60, 80, 45, 90, 70, 55, 85, 40, 75, 65, 88, 50].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-0.5 justify-end">
                    <div className="bg-mint rounded-sm" style={{ height: `${h * 0.4}px` }} />
                    <div className="bg-[#24272b] rounded-sm" style={{ height: `${(100-h) * 0.2}px` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
