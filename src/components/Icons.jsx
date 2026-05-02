// ─────────────────────────────────────────────────────────────────────────────
// Icons — unified line-art icon set for the landing page.
// Style:
//   - viewBox 0 0 24 24
//   - fill="none", stroke="currentColor", strokeWidth 1.8
//   - strokeLinecap/Linejoin = round
//   - color via parent (text-*); size via className (default h-5 w-5)
// Matches the style established in components/Features.jsx.
// ─────────────────────────────────────────────────────────────────────────────

const baseProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  'aria-hidden': true,
}
const strokeProps = {
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconCheck({ className = 'h-5 w-5' }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M5 12.5l4.2 4.2L19 7" {...strokeProps} />
    </svg>
  )
}

export function IconX({ className = 'h-5 w-5' }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" {...strokeProps} />
    </svg>
  )
}

// Bank — classical pillars building (replaces 🏦 emoji)
export function IconBank({ className = 'h-5 w-5' }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M3.5 9.5L12 4l8.5 5.5" {...strokeProps} />
      <path d="M5 9.5v9M9 9.5v9M15 9.5v9M19 9.5v9" {...strokeProps} />
      <path d="M3 19h18" {...strokeProps} />
      <path d="M3 9.5h18" {...strokeProps} />
    </svg>
  )
}

// Lock / shield (replaces 🔒 emoji)
export function IconLock({ className = 'h-5 w-5' }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M6 11h12v8.2A1.8 1.8 0 0 1 16.2 21H7.8A1.8 1.8 0 0 1 6 19.2V11Z" {...strokeProps} />
      <path d="M8.5 11V8a3.5 3.5 0 1 1 7 0v3" {...strokeProps} />
      <circle cx="12" cy="15.5" r="1.2" {...strokeProps} />
    </svg>
  )
}

// Lightning bolt (replaces ⚡ emoji)
export function IconBolt({ className = 'h-5 w-5' }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M13.5 3 5.5 13.5h5L9.5 21l8-10.5h-5L13.5 3Z" {...strokeProps} />
    </svg>
  )
}

// Generic helpers — kept available for any future use
export function IconArrowUpRight({ className = 'h-5 w-5' }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M7 17 17 7" {...strokeProps} />
      <path d="M9 7h8v8" {...strokeProps} />
    </svg>
  )
}

export function IconChart({ className = 'h-5 w-5' }) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M4 19V5" {...strokeProps} />
      <path d="M4 19h16" {...strokeProps} />
      <path d="M8 15l3-3 2.4 2.4L18 9.8" {...strokeProps} />
    </svg>
  )
}
