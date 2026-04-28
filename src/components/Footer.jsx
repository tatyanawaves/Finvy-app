import { useLanding } from '../context/LanguageContext'

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6z" fill="#0F0F0F"/>
        <path d="M8 4.5v7M5.5 7h5" stroke="#4F8EF7" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
    <span className="text-[#4F8EF7] font-bold text-lg tracking-tight">Finvy</span>
  </div>
)

export default function Footer() {
  const lt = useLanding()

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 pt-12 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
          {/* Brand */}
          <div className="max-w-sm">
            <Logo />
            <p className="text-white/40 text-sm mt-4 leading-relaxed">
              {lt.footerDesc}
            </p>
          </div>

          {/* Nav links — only sections that exist on the page */}
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

        {/* Bottom */}
        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-white/20 text-sm">{lt.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
