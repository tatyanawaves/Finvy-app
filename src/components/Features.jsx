import { useLanding } from '../context/LanguageContext'

const solutionIcons = [
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M4 19V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 15l3-3 2.4 2.4L18 9.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 9h2.5v2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M5 7.8A2.8 2.8 0 0 1 7.8 5h2.4l1.7 2H16A3 3 0 0 1 19 10v6.2A2.8 2.8 0 0 1 16.2 19H7.8A2.8 2.8 0 0 1 5 16.2V7.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 14h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M7.2 8.3A6 6 0 0 1 17.9 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17.9 6.8V10h-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.8 15.7A6 6 0 0 1 6.1 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.1 17.2V14h3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M9.5 11.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 18.5c.7-2.7 2.4-4.2 5-4.2s4.3 1.5 5 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.5 12.2a2.5 2.5 0 1 0 0-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17.2 18.1c1.2-.1 2-.1 2.8-.1-.4-2-1.5-3.2-3.2-3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M12 20a2.2 2.2 0 0 0 2.1-1.6H9.9A2.2 2.2 0 0 0 12 20Z" fill="currentColor" />
      <path d="M18 16.5H6l1.2-1.7V11a4.8 4.8 0 0 1 9.6 0v3.8L18 16.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M17.8 7.2c.7.8 1.1 1.7 1.3 2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.2 7.2A5 5 0 0 0 4.9 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
]

const problemIcons = [
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M5 19V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19 19V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 19v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 19V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 19v-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M3.8 12s3-5 8.2-5 8.2 5 8.2 5-3 5-8.2 5-8.2-5-8.2-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 14.7a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 19 19 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M5 17.5 9.5 13l3 3L19 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 6.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 6.5v12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 9.5h2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M8.5 11.2a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 18c.7-2.5 2.2-3.8 4.5-3.8S12.3 15.5 13 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.5 11.2a2.7 2.7 0 1 0 0-5.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 18h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M12 3.8 20 18H4L12 3.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 8.8v4.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 16h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  ),
]

export default function Features() {
  const lt = useLanding()

  return (
    <section id="features" className="bg-[#24272b] py-20 px-4">
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
        <div className="bg-[#2b2f34] rounded-2xl p-8 mb-8 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-2xl font-bold text-white">{lt.aiCopTitle}</h3>
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
          <div className="bg-[#2b2f34] p-8">
            <h3 className="text-white/40 text-sm font-semibold uppercase tracking-wider mb-6">{lt.withoutApp}</h3>
            <div className="space-y-5">
              {lt.problems.map((p, i) => (
                <div key={i} className="flex items-start gap-4 border-b border-white/5 pb-5 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/55 flex items-center justify-center flex-shrink-0">
                    {problemIcons[i] || problemIcons[0]}
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
                  <div className="w-10 h-10 rounded-xl bg-mint/15 border border-mint/20 text-mint flex items-center justify-center flex-shrink-0">
                    {solutionIcons[i] || solutionIcons[0]}
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
          <div className="bg-[#2b2f34] rounded-2xl p-8 border border-white/10">
            <span className="text-xs bg-white/10 text-white/60 px-3 py-1 rounded-full">{lt.featAnalTag}</span>
            <h3 className="text-white text-2xl font-bold mt-4 mb-3">{lt.featAnalTitle}</h3>
            <p className="text-white/50 text-sm">{lt.featAnalDesc}</p>
          </div>
          <div className="bg-[#2b2f34] rounded-2xl p-8 border border-white/10">
            <span className="text-xs bg-white/10 text-white/60 px-3 py-1 rounded-full">{lt.featCalTag}</span>
            <h3 className="text-white text-2xl font-bold mt-4 mb-3">{lt.featCalTitle}</h3>
            <p className="text-white/50 text-sm">{lt.featCalDesc}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
