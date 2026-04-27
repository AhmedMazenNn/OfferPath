import { STATUS_COLORS } from '../../types'
import type { ApplicationStatus } from '../../types'

interface StatusBadgeProps {
  status: ApplicationStatus
  className?: string
}

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status]
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}