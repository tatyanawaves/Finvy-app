import { useLanding } from '../context/LanguageContext'

export default function HowItWorks() {
  const lt = useLanding()

  return (
    <section id="how-it-works" className="bg-[#24272b] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <h2 className="text-4xl lg:text-5xl font-black text-white max-w-sm">
            {lt.howTitle}
          </h2>
          <p className="text-white/50 max-w-sm md:text-right text-sm leading-relaxed">
            {lt.howSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lt.steps.map((step, i) => (
            <div
              key={i}
              className="bg-[#2b2f34] border border-white/10 rounded-2xl p-7"
            >
              <span className="text-xs bg-white/10 text-white/50 px-3 py-1 rounded-full font-medium">
                {lt.stepLabel} {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-white text-xl font-bold mt-4 mb-3">{step.title}</h3>
              <p className="text-white/50 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
