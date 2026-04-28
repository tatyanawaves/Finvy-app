import { useState } from 'react'
import { useLanding, useLanguage } from '../context/LanguageContext'

export default function Pricing({ onOpenModal }) {
  const lt = useLanding()
  const { lang } = useLanguage()
  const [period, setPeriod] = useState('half')

  const isRu = lang === 'ru' || lang === 'kz'

  const formatPrice = (amount) => {
    if (isRu) return `${amount.toLocaleString('ru-RU')} ₸`
    return `$${amount}`
  }

  const getPrice = (plan) => {
    if (plan.monthly === null) return lt.pricingCustom
    if (plan.monthly === 0) return lt.pricingFree
    const raw = period === 'monthly' ? plan.monthly : period === 'half' ? plan.half : plan.annual
    return formatPrice(raw)
  }

  const periodOpts = [
    { key: 'monthly', label: lt.monthly },
    { key: 'half',    label: lt.halfYear, badge: '-15%' },
    { key: 'annual',  label: lt.annually, badge: '-20%' },
  ]

  return (
    <section id="pricing" className="bg-mint-bg grid-bg-light py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-black text-dark mb-4">{lt.pricingTitle}</h2>
          <p className="text-dark/60 mb-8 whitespace-pre-line">{lt.pricingSub}</p>

          {/* Period toggle */}
          <div className="inline-flex bg-white/60 rounded-2xl p-1 gap-1">
            {periodOpts.map(opt => (
              <button
                key={opt.key}
                onClick={() => setPeriod(opt.key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  period === opt.key
                    ? 'bg-dark text-white shadow-sm'
                    : 'text-dark/60 hover:text-dark'
                }`}
              >
                {opt.label}
                {opt.badge && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${period === opt.key ? 'bg-mint/30 text-mint' : 'bg-dark/10'}`}>
                    {opt.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {lt.plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-2xl p-5 flex flex-col ${
                plan.highlight
                  ? 'bg-gradient-to-b from-mint/20 to-mint/5 border-2 border-mint/40 shadow-lg shadow-mint/10'
                  : 'bg-white/60 border border-dark/10'
              }`}
            >
              {plan.highlight && (
                <span className="text-xs bg-mint text-dark font-bold px-2 py-0.5 rounded-full self-start mb-3">{lt.mostPopular}</span>
              )}
              <p className="text-dark font-bold text-base mb-1">{plan.name}</p>
              <p className="text-dark/50 text-xs mb-4">{plan.desc}</p>
              <div className="mb-4">
                <span className={`font-black text-dark ${plan.monthly === null ? 'text-xl' : isRu ? 'text-2xl' : 'text-3xl'}`}>{getPrice(plan)}</span>
                {plan.monthly !== null && (
                  <span className="text-dark/40 text-xs ml-1">{lt.perMonth}</span>
                )}
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-dark/70">
                    <span className="text-mint mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => {
                const planKey = plan.name === 'Корпоративный' ? 'corporate' : plan.name.toLowerCase()
                onOpenModal(planKey, period)
              }} className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                plan.highlight
                  ? 'bg-mint text-dark hover:bg-mint/90'
                  : 'bg-dark text-white hover:bg-dark/80'
              }`}>
                {plan.cta}
              </button>
              <p className="text-center text-xs text-dark/40 mt-2">{lt.firstFree}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
