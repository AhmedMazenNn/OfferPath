interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  hideText?: boolean
  light?: boolean
}

export function Logo({ size = 'md', className = '', hideText = false, light = false }: LogoProps) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative flex items-center justify-center ${sizeMap[size]}`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <rect
            width="32"
            height="32"
            rx="10"
            fill="url(#logo-gradient)"
          />
          <path
            d="M8 22L14 16L18 20L24 12"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 12H24V18"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {!hideText && (
        <span className={`font-black tracking-tighter uppercase italic ${light ? 'text-white' : 'text-slate-900 dark:text-white'} ${textSizeMap[size]}`}>
          Offer<span className="text-primary-600 dark:text-primary-400">Path</span>
        </span>
      )}
    </div>
  )
}