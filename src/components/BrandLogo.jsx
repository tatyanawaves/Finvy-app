export default function BrandLogo({
  textClassName = 'text-[#4F8EF7] text-lg',
  iconClassName = 'w-10 h-10',
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`${iconClassName} relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#4F8EF7] shadow-[0_10px_24px_-14px_rgba(79,142,247,0.95),inset_0_1px_0_rgba(255,255,255,0.30)]`}
      >
        <span className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.22),transparent_42%)]" />
        <svg viewBox="0 0 32 32" className="relative z-10 h-[56%] w-[56%]" fill="none" aria-hidden="true">
          <path
            d="M10 8.5h13"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M10 16h9.5"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path d="M10 8.5v15" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
        </svg>
      </span>
      <span className={`font-bold tracking-tight ${textClassName}`}>Finvy</span>
    </div>
  )
}
