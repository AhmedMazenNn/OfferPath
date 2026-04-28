export type ApplicationStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected'

export type ApplicationSource = 
  | 'LinkedIn Easy Apply' 
  | 'Company Site' 
  | 'Referral' 
  | 'Job Board' 
  | 'Other'

export interface TimelineEvent {
  id: string
  stage: string
  date: string
  notes?: string
}

export interface Application {
  id: string
  company: string
  role: string
  jobUrl?: string
  appliedDate: string
  source: string
  status: ApplicationStatus
  notes?: string
  interviewDate?: string
  salary?: number
  location?: string
  currentStageIndex?: number
  customStages?: string[]
  timeline?: TimelineEvent[]
  lastUpdated?: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isAdmin?: boolean
}

export interface Interview {
  id: string
  applicationId: string
  interviewType: string
  scheduledDate: string
  durationMinutes: number
  interviewerName?: string
  interviewerEmail?: string
  location?: string
  notes?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  createdAt: string
  applicationCompany?: string
  applicationRole?: string
}

export interface Offer {
  id: string
  applicationId: string
  baseSalary: number
  currency: string
  bonus?: number
  equity?: string
  benefits: string[]
  startDate?: string
  deadline?: string
  status: 'pending' | 'accepted' | 'declined' | 'negotiating'
  notes?: string
  createdAt: string
  applicationCompany?: string
  applicationRole?: string
}

export const DEFAULT_STAGES = [
  'Applied',
  'Screening',
  'Phone Screen',
  'Technical',
  'Onsite',
  'Offer'
]

export const STATUS_COLORS: Record<ApplicationStatus, { bg: string; text: string; border: string }> = {
  applied: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  screening: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
  interview: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  offer: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
  rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
}