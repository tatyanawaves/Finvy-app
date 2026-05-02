export default function BrandLogo({
  textClassName = 'text-[#4F8EF7] text-lg',
  iconClassName = 'w-10 h-10',
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`${iconClassName} relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#4F8EF7] shadow-[0_10px_24px_-14px_rgba(79,142,247,0.95),inset_0_1px_0_rgba(255,255,255,0.35)]`}
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.36),transparent_44%)]" />
        <svg viewBox="0 0 32 32" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
          <path
            d="M8.5 21.5 13 17.2l3 2.7 6.4-7.4"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.28"
          />
          <path
            d="M8.8 24.1h14.4"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.18"
          />
        </svg>
        <span className="relative z-10 text-white font-black text-[12px] leading-none tracking-[-0.04em]">
          FV
        </span>
      </span>
      <span className={`font-bold tracking-tight ${textClassName}`}>Finvy</span>
    </div>
  )
}
