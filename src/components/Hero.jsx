import { useLanding } from '../context/LanguageContext'
import { IconBank, IconLock, IconBolt, IconCheck } from './Icons'

const financialFigures = [
  { name: 'Warren Buffett',    role: 'Berkshire Hathaway' },
  { name: 'Ray Dalio',         role: 'Bridgewater' },
  { name: 'George Soros',      role: 'Soros Fund' },
  { name: 'Jamie Dimon',       role: 'JPMorgan Chase' },
  { name: 'Larry Fink',        role: 'BlackRock' },
  { name: 'Jack Bogle',        role: 'Vanguard' },
  { name: 'Peter Lynch',       role: 'Fidelity' },
  { name: 'Carl Icahn',        role: 'Icahn Enterprises' },
  { name: 'Michael Bloomberg', role: 'Bloomberg L.P.' },
  { name: 'Howard Marks',      role: 'Oaktree Capital' },
  { name: 'Paul Tudor Jones',  role: 'Tudor Investment' },
  { name: 'Stanley Druckenmiller', role: 'Duquesne Capital' },
  // duplicate for seamless loop
  { name: 'Warren Buffett',    role: 'Berkshire Hathaway' },
  { name: 'Ray Dalio',         role: 'Bridgewater' },
  { name: 'George Soros',      role: 'Soros Fund' },
  { name: 'Jamie Dimon',       role: 'JPMorgan Chase' },
  { name: 'Larry Fink',        role: 'BlackRock' },
  { name: 'Jack Bogle',        role: 'Vanguard' },
  { name: 'Peter Lynch',       role: 'Fidelity' },
  { name: 'Carl Icahn',        role: 'Icahn Enterprises' },
  { name: 'Michael Bloomberg', role: 'Bloomberg L.P.' },
  { name: 'Howard Marks',      role: 'Oaktree Capital' },
  { name: 'Paul Tudor Jones',  role: 'Tudor Investment' },
  { name: 'Stanley Druckenmiller', role: 'Duquesne Capital' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Banknote — realistic mini banknote rendered with SVG (KZT / USD / EUR)
// ─────────────────────────────────────────────────────────────────────────────
function Banknote({ type }) {
  const styles = {
    kzt: {
      base: '#3b6cb3',
      light: '#7fa8df',
      dark: '#1c3f7a',
      ink: '#0c2147',
      text: '1000',
      symbol: '₸', // ₸
      label: 'TENGE',
    },
    usd: {
      base: '#3b8a4a',
      light: '#86c393',
      dark: '#1f4d2a',
      ink: '#0e2a16',
      text: '100',
      symbol: '$',
      label: 'DOLLAR',
    },
    eur: {
      base: '#7a5fb3',
      light: '#bba0e0',
      dark: '#3f2a6e',
      ink: '#211541',
      text: '500',
      symbol: '€', // €
      label: 'EURO',
    },
  }
  const s = styles[type] || styles.kzt
  return (
    <svg viewBox="0 0 200 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))' }}>
      <defs>
        <linearGradient id={`bill-bg-${type}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={s.light} />
          <stop offset="50%" stopColor={s.base} />
          <stop offset="100%" stopColor={s.dark} />
        </linearGradient>
        <linearGradient id={`bill-shine-${type}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
        </linearGradient>
        <radialGradient id={`bill-medallion-${type}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      {/* Paper body */}
      <rect x="2" y="2" width="196" height="96" rx="6" fill={`url(#bill-bg-${type})`} stroke={s.dark} strokeWidth="1" />
      {/* Inner decorative border */}
      <rect x="8" y="8" width="184" height="84" rx="4" fill="none" stroke={s.light} strokeWidth="0.6" strokeOpacity="0.55" />
      <rect x="11" y="11" width="178" height="78" rx="3" fill="none" stroke={s.dark} strokeWidth="0.4" strokeOpacity="0.5" />
      {/* Center medallion */}
      <circle cx="100" cy="50" r="22" fill="none" stroke={s.light} strokeWidth="0.6" strokeOpacity="0.65" />
      <circle cx="100" cy="50" r="18" fill={`url(#bill-medallion-${type})`} />
      <circle cx="100" cy="50" r="15" fill="none" stroke={s.dark} strokeWidth="0.4" strokeOpacity="0.5" />
      {/* Currency symbol big in center */}
      <text x="100" y="62" textAnchor="middle" fontFamily="Georgia, serif" fontSize="26" fontWeight="900" fill={s.ink} style={{ filter: `drop-shadow(0 1px 0 ${s.light})` }}>
        {s.symbol}
      </text>
      {/* Denomination corners */}
      <text x="22" y="28" textAnchor="middle" fontFamily="Georgia, serif" fontSize="14" fontWeight="900" fill={s.ink}>{s.text}</text>
      <text x="178" y="28" textAnchor="middle" fontFamily="Georgia, serif" fontSize="14" fontWeight="900" fill={s.ink}>{s.text}</text>
      <text x="22" y="78" textAnchor="middle" fontFamily="Georgia, serif" fontSize="14" fontWeight="900" fill={s.ink}>{s.text}</text>
      <text x="178" y="78" textAnchor="middle" fontFamily="Georgia, serif" fontSize="14" fontWeight="900" fill={s.ink}>{s.text}</text>
      {/* Tiny guilloche-style horizontal lines */}
      <g stroke={s.dark} strokeWidth="0.3" strokeOpacity="0.35">
        <line x1="40" y1="40" x2="72" y2="40" />
        <line x1="40" y1="44" x2="72" y2="44" />
        <line x1="40" y1="56" x2="72" y2="56" />
        <line x1="40" y1="60" x2="72" y2="60" />
        <line x1="128" y1="40" x2="160" y2="40" />
        <line x1="128" y1="44" x2="160" y2="44" />
        <line x1="128" y1="56" x2="160" y2="56" />
        <line x1="128" y1="60" x2="160" y2="60" />
      </g>
      {/* Currency label tiny */}
      <text x="100" y="84" textAnchor="middle" fontFamily="Helvetica, Arial, sans-serif" fontSize="5" fontWeight="700" letterSpacing="2" fill={s.ink} fillOpacity="0.7">
        {s.label}
      </text>
      {/* Diagonal shine overlay */}
      <rect x="2" y="2" width="196" height="96" rx="6" fill={`url(#bill-shine-${type})`} pointerEvents="none" />
    </svg>
  )
}

export default function Hero({ onOpenModal }) {
  const lt = useLanding()
  return (
    <section className="relative min-h-[100svh] flex flex-col pt-14 overflow-hidden bg-[#285aa0]">

      {/* ── Deep base gradient ── */}
      <div className="absolute inset-0 bg-[#285aa0]" />

      {/* ── Layered radial glow blobs (depth) ── */}
      <div
        className="hidden absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 16%, rgba(143,190,255,0.34) 0%, rgba(79,142,247,0.16) 32%, transparent 62%), linear-gradient(180deg, rgba(7,22,51,0.1) 0%, rgba(7,22,51,0.42) 100%)',
        }}
      />
      <div
        className="hidden absolute inset-x-[-12%] top-[12%] h-[52%] pointer-events-none opacity-70"
        style={{
          background:
            'linear-gradient(110deg, transparent 8%, rgba(255,255,255,0.07) 31%, transparent 46%), linear-gradient(125deg, transparent 48%, rgba(3,15,36,0.34) 68%, transparent 82%)',
          transform: 'skewY(-7deg)',
          filter: 'blur(0.2px)',
        }}
      />
      <div
        className="hidden absolute inset-x-0 bottom-0 h-[44%] pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(17,68,152,0.28) 38%, rgba(79,142,247,0.26) 100%)',
          boxShadow: 'inset 0 -90px 130px rgba(79,142,247,0.32), inset 0 90px 120px rgba(7,22,51,0.16)',
        }}
      />

      {/* ── Vignette for inner depth ── */}
      <div
        className="hidden absolute inset-0 pointer-events-none"
        style={{
          boxShadow:
            'inset 0 120px 170px rgba(5,17,40,0.38), inset 0 -110px 150px rgba(42,107,217,0.24), inset 70px 0 130px rgba(4,15,36,0.26), inset -70px 0 130px rgba(4,15,36,0.2)',
        }}
      />

      {/* ── Subtle grid overlay ── */}
      <div
        className="hidden absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(79,142,247,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,247,0.6) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Falling banknotes layer ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[
          // Tenge (KZT) — blue-purple paper
          { type: 'kzt', left: '6%',  delay: '0s',  duration: '13s', drift: '60px',   width: 78, startRot: '-12deg', endRot: '395deg', flutterDur: '2.6s' },
          { type: 'kzt', left: '52%', delay: '5s',  duration: '15s', drift: '-50px',  width: 88, startRot: '8deg',   endRot: '-380deg',flutterDur: '2.2s' },
          { type: 'kzt', left: '78%', delay: '11s', duration: '14s', drift: '40px',   width: 72, startRot: '-6deg',  endRot: '410deg', flutterDur: '2.8s' },
          // USD — green
          { type: 'usd', left: '20%', delay: '3s',  duration: '14s', drift: '-45px',  width: 82, startRot: '14deg',  endRot: '-360deg',flutterDur: '2.4s' },
          { type: 'usd', left: '64%', delay: '8s',  duration: '13s', drift: '55px',   width: 76, startRot: '-10deg', endRot: '420deg', flutterDur: '2.5s' },
          // EUR — bluish-purple
          { type: 'eur', left: '36%', delay: '6s',  duration: '15s', drift: '-35px',  width: 80, startRot: '6deg',   endRot: '-400deg',flutterDur: '2.3s' },
          { type: 'eur', left: '88%', delay: '14s', duration: '12s', drift: '-55px',  width: 74, startRot: '-8deg',  endRot: '370deg', flutterDur: '2.7s' },
          { type: 'eur', left: '12%', delay: '18s', duration: '14s', drift: '45px',   width: 70, startRot: '10deg',  endRot: '-410deg',flutterDur: '2.5s' },
        ].map((b, i) => (
          <span
            key={i}
            className="bill-fall"
            style={{
              left: b.left,
              ['--bill-delay']: b.delay,
              ['--bill-duration']: b.duration,
              ['--bill-drift']: b.drift,
              ['--bill-start-rot']: b.startRot,
              ['--bill-end-rot']: b.endRot,
              ['--bill-flutter-dur']: b.flutterDur,
              width: b.width,
              height: b.width * 0.5,
            }}
          >
            <span className="bill-flutter">
              <Banknote type={b.type} />
            </span>
          </span>
        ))}
      </div>

      {/* ── Floating glass cards (decorative) — z-10 above central plate ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {/* Card left — moved LOWER to separate from Cash Flow card */}
        <div className="absolute bottom-[18%] left-[3%] lg:left-[6%] hidden lg:block float-card-a">
          <div className="w-52 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65),0_0_30px_rgba(79,142,247,0.18)]">
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">Balance</p>
            <p className="text-white font-black text-xl tabular-nums drop-shadow-[0_3px_8px_rgba(0,0,0,0.55)]">₸ 842 500</p>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="text-[#7aaeff] text-xs font-semibold drop-shadow-[0_2px_6px_rgba(79,142,247,0.5)]">+12.4% this month</span>
            </div>
          </div>
        </div>
        {/* Card right */}
        <div className="absolute top-[18%] right-[2%] lg:right-[5%] hidden lg:block float-card-b">
          <div className="w-48 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65),0_0_30px_rgba(79,142,247,0.18)]">
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">Cashback</p>
            <p className="text-[#7aaeff] font-black text-xl tabular-nums drop-shadow-[0_3px_8px_rgba(79,142,247,0.45)]">+₸ 15 250</p>
            <p className="text-white/40 text-xs mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">saved this month</p>
          </div>
        </div>
        {/* Card bottom-right */}
        <div className="absolute bottom-[18%] right-[2%] lg:right-[5%] hidden lg:block float-card-c">
          <div className="w-44 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65),0_0_30px_rgba(79,142,247,0.18)]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-[#4F8EF7]/30 flex items-center justify-center shadow-[0_0_12px_rgba(79,142,247,0.5)] text-[#7aaeff]">
                <IconCheck className="h-3.5 w-3.5" />
              </div>
              <span className="text-white/50 text-[10px] font-bold uppercase tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">AI Report</span>
            </div>
            <p className="text-white/85 text-xs leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">Best card: <span className="text-[#7aaeff] font-bold">Halyk Bonus</span></p>
            <p className="text-white/40 text-[10px] mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">37% cashback on fuel</p>
          </div>
        </div>
      </div>

      {/* ── Main hero content ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-1/2 top-[10%] h-[78%] w-[92%] max-w-5xl -translate-x-1/2 rounded-[28px] sm:rounded-[40px] border border-white/[0.10] bg-white/[0.04] shadow-[0_50px_140px_-44px_rgba(0,0,0,0.78),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-[3px]" />

        {/* Cash Flow card — moved HIGHER (top) so it doesn't overlap with Balance card below */}
        <div className="hero-depth-card-a absolute left-[4%] top-[18%] hidden w-44 rounded-2xl border border-white/[0.16] bg-white/[0.10] p-3.5 shadow-[0_24px_58px_-24px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-md md:block lg:left-[8%]">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/55">Cash Flow</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.12] text-white/80">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M5 17V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M5 17h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="m8 14 3-3 2.4 2.3L18 8.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <p className="text-xl font-black tabular-nums text-white">+18%</p>
          <div className="mt-3 flex h-12 items-end gap-1">
            {[32, 44, 26, 52, 39, 58, 46].map((height, i) => (
              <span key={i} className="w-full rounded-t bg-white/45" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>

        <div className="hero-depth-card-b absolute right-[4%] top-[39%] hidden w-48 rounded-2xl border border-white/[0.16] bg-white/[0.10] p-3.5 shadow-[0_24px_58px_-24px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-md md:block lg:right-[10%]">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.12] text-white/85">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="M6 8.5h12v8.2A2.3 2.3 0 0 1 15.7 19H8.3A2.3 2.3 0 0 1 6 16.7V8.5Z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8.5 8.5V7A3.5 3.5 0 0 1 12 3.5 3.5 3.5 0 0 1 15.5 7v1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Secured</p>
              <p className="text-sm font-bold text-white">Bank sync</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <span className="block h-2 rounded-full bg-white/35" />
            <span className="block h-2 w-2/3 rounded-full bg-white/20" />
          </div>
        </div>

      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-14 sm:py-20">

        {/* Headline */}
        <h1
          className="text-[2.35rem] sm:text-5xl lg:text-6xl font-black leading-[1.04] sm:leading-tight max-w-3xl mb-2"
        >
          <span
            className="text-white"
            style={{ textShadow: '0 8px 28px rgba(0,0,0,0.42), 0 2px 8px rgba(0,0,0,0.32)' }}
          >
            {lt.heroTitleLine1 ?? lt.heroTitle}
          </span>
          {lt.heroTitleLine2 && (
            <>
              <br />
              <span
                className="bg-gradient-to-br from-[#5a9bff] via-[#9cc6ff] to-[#3a7fea] bg-clip-text text-transparent"
                style={{
                  filter: [
                    'drop-shadow(0 2px 0 rgba(255,255,255,0.40))',      // emboss highlight
                    'drop-shadow(0 4px 8px rgba(79,142,247,0.45))',     // close blue glow
                    'drop-shadow(0 12px 28px rgba(79,142,247,0.55))',   // wide blue glow
                    'drop-shadow(0 18px 40px rgba(13,42,98,0.45))',     // depth ground shadow
                    'drop-shadow(0 2px 5px rgba(7,22,51,0.32))',        // close-contact shadow
                  ].join(' '),
                }}
              >
                {lt.heroTitleLine2}
              </span>
            </>
          )}
        </h1>

        <p
          className="mt-5 sm:mt-6 text-white text-base sm:text-lg max-w-xl leading-relaxed"
          style={{ textShadow: '0 4px 16px rgba(0,0,0,0.45)' }}
        >
          {lt.heroSub}
        </p>

        {/* CTA buttons */}
        <div className="mt-8 sm:mt-10 flex w-full flex-wrap items-center justify-center gap-3 sm:gap-4">
          {/* Primary CTA */}
          <button
            onClick={onOpenModal}
            className="relative group w-full max-w-[23rem] sm:w-auto overflow-hidden rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 text-white transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
            style={{
              background: 'linear-gradient(135deg, rgba(111,170,255,0.98) 0%, rgba(79,142,247,1) 42%, rgba(37,93,190,1) 100%)',
              boxShadow: [
                'inset 0 1px 0 rgba(255,255,255,0.42)',
                'inset 0 -1px 0 rgba(8,31,75,0.45)',
                '0 18px 42px -18px rgba(10,35,88,0.72)',
                '0 16px 48px -16px rgba(79,142,247,0.62)',
              ].join(', '),
              textShadow: '0 2px 8px rgba(7,22,51,0.38)',
            }}
          >
            <span className="pointer-events-none absolute inset-0 rounded-2xl border border-white/25" />
            <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[#1d5ed1]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative z-10 flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-3">
              <span className="flex items-center gap-2 text-[15px] font-black sm:text-base">
                <span>{lt.tryFree}</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" aria-hidden="true">
                  <path d="M5 12h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="m13 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="rounded-full border border-white/25 bg-white/18 px-3 py-1 text-[11px] font-bold text-white/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
                {lt.freeBadge}
              </span>
            </span>
          </button>

        </div>

        <p
          className="mt-4 text-white/35 text-sm"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
        >
          {lt.trialNote}
        </p>

        {/* Trust strip — glass cards */}
        <div className="mt-10 sm:mt-14 grid w-full max-w-sm grid-cols-1 gap-2 sm:max-w-none sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
          {[
            { Icon: IconBank, label: lt.heroTrust1 ?? '11 banks' },
            { Icon: IconLock, label: lt.heroTrust2 ?? 'Secure data' },
            { Icon: IconBolt, label: lt.heroTrust3 ?? '3-min setup' },
          ].map(({ Icon, label }, i) => (
            <div key={i} className="flex items-center justify-center gap-2 bg-white/[0.06] backdrop-blur-md border border-white/[0.12] rounded-full px-4 py-2 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <Icon className="h-4 w-4 text-[#7aaeff] drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
              <span className="text-white/65 text-xs font-medium" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Financial figures marquee ── */}
      <div className="relative border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-sm py-3 overflow-hidden">
        <p className="text-center text-white/15 text-[9px] uppercase tracking-[0.2em] font-bold mb-2">
          World's greatest financial minds trust data-driven decisions
        </p>
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {financialFigures.map((fig, i) => (
              <span key={i} className="inline-flex items-center gap-2 mx-8">

                <span className="text-white/35 font-semibold text-sm">{fig.name}</span>
                <span className="text-white/15 text-xs font-normal">{fig.role}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
