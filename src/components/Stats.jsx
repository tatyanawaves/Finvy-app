import { useLanding } from '../context/LanguageContext'

export default function Stats() {
  const lt = useLanding()

  return (
    <section className="bg-gradient-to-b from-[#24272b] via-[#2b2f34] to-[#24272b] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* "Trusted by" section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
            {lt.trustedTitle}
          </h2>
          <p className="text-white/50">{lt.trustedSub}</p>
        </div>

        {/* Support section */}
        <div className="bg-[#2b2f34] rounded-2xl p-10 mb-8 border border-white/10">
          <h3 className="text-3xl font-black text-white mb-8 text-center">
            {lt.supportTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center max-w-lg mx-auto">
            <div>
              <div className="w-12 h-12 bg-white/5 rounded-full mx-auto mb-3 flex items-center justify-center text-xl">💬</div>
              <p className="text-white font-semibold text-sm">{lt.supportChat}</p>
              <p className="text-white/40 text-xs mt-1">{lt.supportChatSub}</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-white/5 rounded-full mx-auto mb-3 flex items-center justify-center text-xl">🎓</div>
              <p className="text-white font-semibold text-sm">{lt.supportConsult}</p>
              <p className="text-white/40 text-xs mt-1">{lt.supportConsultSub}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
