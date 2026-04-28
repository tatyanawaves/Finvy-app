import { useLanding } from '../context/LanguageContext'

export default function Features() {
  const lt = useLanding()

  return (
    <section id="features" className="bg-dark py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-white">
            {lt.featTitle}
          </h2>
          <p className="mt-4 text-white/50 max-w-2xl mx-auto">
            {lt.featSub}
          </p>
        </div>

        {/* AI Copilot card */}
        <div className="bg-[#1a1a1a] rounded-2xl p-8 mb-8 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-2xl font-bold text-white">{lt.aiCopTitle}</h3>
            <span className="text-mint text-lg">✦</span>
            <span className="bg-mint/20 text-mint text-xs px-2 py-0.5 rounded-full font-medium">{lt.aiCopNew}</span>
          </div>
          <p className="text-white/50 mb-6">{lt.aiCopSub}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#232323] rounded-xl p-4">
              <p className="text-mint text-sm font-semibold mb-1">{lt.aiMonthly}</p>
              <p className="text-white/50 text-sm">{lt.aiMonthlyDesc}</p>
            </div>
            <div className="bg-[#232323] rounded-xl p-4">
              <p className="text-mint text-sm font-semibold mb-1">{lt.aiInsights}</p>
              <p className="text-white/50 text-sm">{lt.aiInsightsDesc}</p>
            </div>
            <div className="bg-[#232323] rounded-xl p-4">
              <p className="text-mint text-sm font-semibold mb-1">{lt.aiAlerts}</p>
              <p className="text-white/50 text-sm">{lt.aiAlertsDesc}</p>
            </div>
          </div>
        </div>

        {/* Problems vs Solutions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden">
          {/* Problems */}
          <div className="bg-[#1a1a1a] p-8">
            <h3 className="text-white/40 text-sm font-semibold uppercase tracking-wider mb-6">{lt.withoutApp}</h3>
            <div className="space-y-5">
              {lt.problems.map((p, i) => (
                <div key={i} className="flex items-start gap-4 border-b border-white/5 pb-5 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                    {p.icon}
                  </div>
                  <div>
                    <p className="text-white/80 font-medium text-sm">{p.title}</p>
                    <p className="text-white/40 text-xs mt-1">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div className="bg-gradient-to-br from-mint/20 to-mint/5 p-8">
            <h3 className="text-mint text-sm font-semibold uppercase tracking-wider mb-6">{lt.withApp}</h3>
            <div className="space-y-5">
              {lt.solutions.map((s, i) => (
                <div key={i} className="flex items-start gap-4 border-b border-mint/10 pb-5 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center text-xl flex-shrink-0">
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{s.title}</p>
                    {s.desc && <p className="text-white/50 text-xs mt-1">{s.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Feature cards grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-white/10">
            <span className="text-xs bg-white/10 text-white/60 px-3 py-1 rounded-full">{lt.featAnalTag}</span>
            <h3 className="text-white text-2xl font-bold mt-4 mb-3">{lt.featAnalTitle}</h3>
            <p className="text-white/50 text-sm">{lt.featAnalDesc}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-white/10">
            <span className="text-xs bg-white/10 text-white/60 px-3 py-1 rounded-full">{lt.featCalTag}</span>
            <h3 className="text-white text-2xl font-bold mt-4 mb-3">{lt.featCalTitle}</h3>
            <p className="text-white/50 text-sm">{lt.featCalDesc}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
