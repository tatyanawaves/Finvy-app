import { useLanding } from '../context/LanguageContext'
import BrandLogo from './BrandLogo'

export default function Footer() {
  const lt = useLanding()

  return (
    <footer className="bg-[#24272b] border-t border-white/5 pt-12 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
          <div className="max-w-sm">
            <BrandLogo />
            <p className="text-white/40 text-sm mt-4 leading-relaxed">
              {lt.footerDesc}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-1">
            {lt.navLinks.map(item => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  const el = document.querySelector(item.href)
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
                className="text-white/40 text-sm hover:text-white/70 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-white/20 text-sm">{lt.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
