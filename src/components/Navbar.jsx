import { useState, useRef, useEffect } from 'react'
import { useLanguage, LANGS, useLanding } from '../context/LanguageContext'

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-full bg-[#4F8EF7] flex items-center justify-center">
      <span className="text-white font-black text-[10px] leading-none">fv</span>
    </div>
    <span className="text-[#4F8EF7] font-bold text-lg tracking-tight">Finvy</span>
  </div>
)

function LangDropdown({ inMenu = false }) {
  const { lang, changeLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = LANGS.find(l => l.code === lang) || LANGS[0]

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (inMenu) {
    return (
      <div className="pt-2 border-t border-white/10">
        <p className="text-white/30 text-xs uppercase tracking-wider mb-2 px-1">Язык / Language</p>
        <div className="flex gap-2">
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => changeLang(l.code)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                lang === l.code
                  ? 'bg-mint/20 text-mint border border-mint/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-white/10'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="hidden sm:flex items-center gap-1 text-white/70 hover:text-white text-sm transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M5 7L1 3h8L5 7z"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[90px]">
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => { changeLang(l.code); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5 ${
                lang === l.code ? 'text-mint' : 'text-white/60'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar({ onOpenModal, onOpenLogin }) {
  const lt = useLanding()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNavClick = (e, href) => {
    e.preventDefault()
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col gap-1 p-1 lg:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <>
                  <span className="w-5 h-0.5 bg-white/70 block rotate-45 translate-y-[6px] transition-transform" />
                  <span className="w-5 h-0.5 bg-white/70 block opacity-0 transition-opacity" />
                  <span className="w-5 h-0.5 bg-white/70 block -rotate-45 -translate-y-[6px] transition-transform" />
                </>
              ) : (
                <>
                  <span className="w-5 h-0.5 bg-white/70 block" />
                  <span className="w-5 h-0.5 bg-white/70 block" />
                  <span className="w-5 h-0.5 bg-white/70 block" />
                </>
              )}
            </button>
            <span className="text-white/50 text-sm hidden lg:block">{lt.menu}</span>
            <Logo />
          </div>

          {/* Center: nav links (desktop) */}
          <div className="hidden lg:flex items-center gap-8">
            {lt.navLinks.map(item => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right: lang + CTAs */}
          <div className="flex items-center gap-3">
            <LangDropdown />
            <button onClick={onOpenModal} className="bg-mint text-dark text-sm font-semibold px-4 py-2 rounded-full hover:bg-mint/90 transition-colors whitespace-nowrap">
              {lt.signUp}
            </button>
            <button onClick={onOpenLogin} className="hidden sm:block border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full hover:border-white/40 transition-colors">
              {lt.myAccount}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="lg:hidden bg-dark/98 border-t border-white/10 px-4 py-4 flex flex-col gap-3">
          {/* Nav links */}
          <div className="flex flex-col gap-1">
            {lt.navLinks.map(item => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-white/70 hover:text-white text-sm py-2.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { setMenuOpen(false); onOpenModal() }}
              className="flex-1 bg-mint text-dark text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-mint/90 transition-colors"
            >
              {lt.signUp}
            </button>
            <button
              onClick={() => { setMenuOpen(false); onOpenLogin() }}
              className="flex-1 border border-white/20 text-white text-sm font-medium px-4 py-2.5 rounded-full hover:border-white/40 transition-colors"
            >
              {lt.myAccount}
            </button>
          </div>

          {/* Language switcher */}
          <LangDropdown inMenu={true} />
        </div>
      )}
    </nav>
  )
}
