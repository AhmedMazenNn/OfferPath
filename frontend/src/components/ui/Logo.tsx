interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeMap[size]}`}
      >
        <rect
          width="32"
          height="32"
          rx="8"
          className="fill-primary-600"
        />
        <path
          d="M8 20L14 14L18 18L24 10"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 10H24V14"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="8" cy="20" r="2" fill="white" />
      </svg>
      <span className={`font-bold text-slate-900 dark:text-white ${textSizeMap[size]}`}>
        OfferPath
      </span>
    </div>
  )
}