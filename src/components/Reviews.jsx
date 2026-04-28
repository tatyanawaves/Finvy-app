import { useLanding } from '../context/LanguageContext'

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="#FACC15">
    <path d="M7 1l1.5 3.1 3.5.5-2.5 2.4.6 3.5L7 9 4.9 10.5l.6-3.5L3 4.6l3.5-.5L7 1z"/>
  </svg>
)

export default function Reviews({ onOpenModal }) {
  const lt = useLanding()

  return (
    <section className="bg-dark py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">{lt.reviewsTitle}</h2>
          <div className="flex items-center justify-center gap-3">
            <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <StarIcon key={i} />)}</div>
            <span className="text-white font-bold text-xl">4.7</span>
            <span className="text-white/40">Google Reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lt.reviews.map((r, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-7">
              <div className="flex gap-0.5 mb-4">
                {[...Array(r.rating)].map((_, j) => <StarIcon key={j} />)}
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-6">"{r.text}"</p>
              <div>
                <p className="text-white font-semibold text-sm">{r.name}</p>
                <p className="text-white/40 text-xs">{r.company}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-16 text-center">
          <h3 className="text-3xl font-black text-white mb-6">{lt.readyTitle}</h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button onClick={onOpenModal} className="bg-mint text-dark font-bold px-8 py-4 rounded-2xl hover:bg-mint/90 transition-colors text-base flex items-center gap-3">
              {lt.tryFree}
              <span className="bg-dark/20 text-xs px-2 py-0.5 rounded-full">{lt.demoBadge}</span>
            </button>
            <button className="border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl hover:border-white/40 transition-colors text-base">
              {lt.bookDemo}
            </button>
          </div>
          <p className="text-white/30 text-sm mt-4">{lt.trialNote2}</p>
        </div>
      </div>
    </section>
  )
}
