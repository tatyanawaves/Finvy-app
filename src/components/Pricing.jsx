import { useState } from 'react'
import { useLanding, useLanguage } from '../context/LanguageContext'
import { IconCheck } from './Icons'

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
    <section id="pricing" className="bg-[#24272b] grid-bg py-14 sm:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">{lt.pricingTitle}</h2>
          <p className="text-white/60 mb-8 whitespace-pre-line">{lt.pricingSub}</p>

          {/* Period toggle */}
          <div className="overflow-x-auto scrollbar-none">
            <div className="inline-flex min-w-max bg-white/10 rounded-2xl p-1 gap-1">
              {periodOpts.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setPeriod(opt.key)}
                  className={`flex-shrink-0 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                    period === opt.key
                      ? 'bg-[#24272b] text-white shadow-sm'
                      : 'text-white hover:text-white/80'
                  }`}
                >
                  {opt.label}
                  {opt.badge && (
                    <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full ${period === opt.key ? 'bg-mint/30 text-mint' : 'bg-white/10'}`}>
                      {opt.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
          {lt.plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-2xl p-5 flex flex-col ${
              plan.highlight
                ? 'bg-gradient-to-b from-mint/20 to-mint/5 border-2 border-mint/40 shadow-lg shadow-mint/10'
                : 'bg-[#2b2f34] border border-white/10'
              }`}
            >
              {plan.highlight && (
                <span className="text-xs bg-mint text-white font-bold px-2 py-0.5 rounded-full self-start mb-3">{lt.mostPopular}</span>
              )}
              <p className="text-white font-bold text-lg mb-1">{plan.name}</p>
              <p className="text-white/70 text-sm mb-4">{plan.desc}</p>
              <div className="mb-4">
                <span className={`font-black text-white ${plan.monthly === null ? 'text-xl' : isRu ? 'text-2xl' : 'text-3xl'}`}>{getPrice(plan)}</span>
                {plan.monthly !== null && (
                  <span className="text-white/40 text-xs ml-1">{lt.perMonth}</span>
                )}
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-white/70">
                    <IconCheck className="h-4 w-4 text-mint mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => {
                const planKey = plan.name === 'Корпоративный' ? 'corporate' : plan.name.toLowerCase()
                onOpenModal(planKey, period)
              }} className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                plan.highlight
                  ? 'bg-mint text-white hover:bg-mint/90'
                  : 'bg-[#24272b] text-white hover:bg-[#24272b]/85'
              }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
