import { STATUS_COLORS } from '../../types'
import type { ApplicationStatus } from '../../types'

interface StatusBadgeProps {
  status: ApplicationStatus
  color?: string
  className?: string
}

export function StatusBadge({ status, color, className = '' }: StatusBadgeProps) {
  const fallbackColors = STATUS_COLORS[status.toLowerCase()] || STATUS_COLORS['applied']
  
  const customStyles = color ? {
    backgroundColor: `${color}15`, // 15 is hex for ~8% opacity
    color: color,
    borderColor: `${color}30`, // 30 is hex for ~20% opacity
  } : {}

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${!color ? `${fallbackColors.bg} ${fallbackColors.text} ${fallbackColors.border}` : ''} ${className}`}
      style={customStyles}
    >
      {status}
    </span>
  )
}