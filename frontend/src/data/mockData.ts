import type { Application } from '../types'
import { DEFAULT_STAGES } from '../types'

const createId = () => Math.random().toString(36).substr(2, 9)

export const mockApplications: Application[] = [
  {
    id: createId(),
    company: 'Stripe',
    role: 'Senior Frontend Engineer',
    jobUrl: 'https://stripe.com/jobs',
    appliedDate: '2026-04-20',
    source: 'LinkedIn Easy Apply',
    status: 'interview',
    lastUpdated: '2026-04-25',
    currentStageIndex: 3,
    customStages: DEFAULT_STAGES,
    timeline: [
      { id: createId(), stage: 'Applied', date: '2026-04-20', notes: 'Application submitted via LinkedIn Easy Apply' },
      { id: createId(), stage: 'Screening', date: '2026-04-22', notes: 'Passed initial screening call' },
      { id: createId(), stage: 'Phone Screen', date: '2026-04-24', notes: 'Scheduled with HR' },
      { id: createId(), stage: 'Technical', date: '2026-04-26', notes: 'Technical interview scheduled' },
    ],
    notes: 'Great opportunity to work on payment infrastructure',
    interviewDate: '2026-04-28T14:00:00',
    salary: 180000,
    location: 'San Francisco, CA (Hybrid)'
  },
  {
    id: createId(),
    company: 'Notion',
    role: 'Full Stack Engineer',
    jobUrl: 'https://notion.so/careers',
    appliedDate: '2026-04-18',
    source: 'Company Site',
    status: 'screening',
    lastUpdated: '2024-04-22',
    currentStageIndex: 1,
    customStages: DEFAULT_STAGES,
    timeline: [
      { id: createId(), stage: 'Applied', date: '2026-04-18' },
      { id: createId(), stage: 'Screening', date: '2026-04-22', notes: 'Phone call scheduled' },
    ],

    location: 'San Francisco, CA'
  },
  {
    id: createId(),
    company: 'Slack',
    role: 'Staff Software Engineer',
    jobUrl: 'https://salesforce.com/careers',
    appliedDate: '2026-04-15',
    source: 'Referral',
    status: 'applied',
    lastUpdated: '2026-04-15',
    currentStageIndex: 0,
    customStages: DEFAULT_STAGES,
    timeline: [
      { id: createId(), stage: 'Applied', date: '2026-04-15', notes: 'Referred by Sarah from previous company' },
    ],
    notes: 'Interesting role in the platform team',

  },
  {
    id: createId(),
    company: 'Figma',
    role: 'Frontend Developer',
    jobUrl: 'https://figma.com/careers',
    appliedDate: '2026-04-10',
    source: 'LinkedIn Easy Apply',
    status: 'offer',
    lastUpdated: '2026-04-24',
    currentStageIndex: 5,
    customStages: DEFAULT_STAGES,
    timeline: [
      { id: createId(), stage: 'Applied', date: '2026-04-10' },
      { id: createId(), stage: 'Screening', date: '2026-04-12' },
      { id: createId(), stage: 'Phone Screen', date: '2026-04-15' },
      { id: createId(), stage: 'Technical', date: '2026-04-18' },
      { id: createId(), stage: 'Onsite', date: '2026-04-21' },
      { id: createId(), stage: 'Offer', date: '2026-04-24', notes: 'Received offer! $165k + equity' },
    ],
    notes: 'Amazing design tool, would love to join!',

    salary: 165000,
    location: 'San Francisco, CA (Hybrid)'
  },
  {
    id: createId(),
    company: 'Airbnb',
    role: 'Senior Software Engineer',
    jobUrl: 'https://airbnb.com/careers',
    appliedDate: '2026-04-08',
    source: 'Job Board',
    status: 'rejected',
    lastUpdated: '2026-04-20',
    currentStageIndex: 3,
    customStages: DEFAULT_STAGES,
    timeline: [
      { id: createId(), stage: 'Applied', date: '2026-04-08' },
      { id: createId(), stage: 'Screening', date: '2026-04-10' },
      { id: createId(), stage: 'Phone Screen', date: '2026-04-14' },
      { id: createId(), stage: 'Technical', date: '2026-04-17' },
      { id: createId(), stage: 'Rejected', date: '2026-04-20', notes: 'Went with another candidate' },
    ],
    notes: 'Tough competition, good interview experience',

  },
  {
    id: createId(),
    company: 'Shopify',
    role: 'Backend Engineer',
    jobUrl: 'https://shopify.com/careers',
    appliedDate: '2026-04-05',
    source: 'Company Site',
    status: 'interview',
    lastUpdated: '2026-04-22',
    currentStageIndex: 2,
    customStages: DEFAULT_STAGES,
    timeline: [
      { id: createId(), stage: 'Applied', date: '2026-04-05' },
      { id: createId(), stage: 'Screening', date: '2026-04-08' },
      { id: createId(), stage: 'Phone Screen', date: '2026-04-12' },
      { id: createId(), stage: 'Technical', date: '2026-04-19' },
      { id: createId(), stage: 'Onsite', date: '2026-04-22', notes: 'Onsite scheduled' },
    ],

    interviewDate: '2026-04-29T16:00:00',
    location: 'Remote'
  },
  {
    id: createId(),
    company: 'Discord',
    role: 'Mobile Engineer',
    jobUrl: 'https://discord.com/careers',
    appliedDate: '2026-04-12',
    source: 'LinkedIn Easy Apply',
    status: 'screening',
    lastUpdated: '2026-04-18',
    currentStageIndex: 1,
    customStages: DEFAULT_STAGES,
    timeline: [
      { id: createId(), stage: 'Applied', date: '2026-04-12' },
      { id: createId(), stage: 'Screening', date: '2026-04-18', notes: 'Great conversation about mobile' },
    ],

  },
  {
    id: createId(),
    company: 'Reddit',
    role: 'Senior Frontend Engineer',
    jobUrl: 'https://redditinc.com/careers',
    appliedDate: '2026-04-02',
    source: 'Company Site',
    status: 'rejected',
    lastUpdated: '2026-04-15',
    currentStageIndex: 2,
    customStages: DEFAULT_STAGES,
    timeline: [
      { id: createId(), stage: 'Applied', date: '2026-04-02' },
      { id: createId(), stage: 'Screening', date: '2026-04-05' },
      { id: createId(), stage: 'Phone Screen', date: '2026-04-10' },
      { id: createId(), stage: 'Rejected', date: '2026-04-15', notes: 'Not moving forward' },
    ],

  },
  {
    id: createId(),
    company: 'Linear',
    role: 'Full Stack Developer',
    jobUrl: 'https://linear.app/careers',
    appliedDate: '2026-04-14',
    source: 'Other',
    status: 'applied',
    lastUpdated: '2026-04-14',
    currentStageIndex: 0,
    customStages: DEFAULT_STAGES,
    timeline: [
      { id: createId(), stage: 'Applied', date: '2026-04-14', notes: 'Found via Twitter' },
    ],
    notes: 'Beautiful product, minimalist design',

  },
  {
    id: createId(),
    company: 'Vercel',
    role: 'Frontend Engineer',
    jobUrl: 'https://vercel.com/careers',
    appliedDate: '2026-04-16',
    source: 'LinkedIn Easy Apply',
    status: 'applied',
    lastUpdated: '2026-04-16',
    currentStageIndex: 0,
    customStages: DEFAULT_STAGES,
    timeline: [
      { id: createId(), stage: 'Applied', date: '2026-04-16' },
    ],

  },
  {
    id: createId(),
    company: 'Loom',
    role: 'Senior Engineer',
    jobUrl: 'https://loom.com/careers',
    appliedDate: '2026-04-01',
    source: 'Job Board',
    status: 'offer',
    lastUpdated: '2026-04-23',
    currentStageIndex: 5,
    customStages: DEFAULT_STAGES,
    timeline: [
      { id: createId(), stage: 'Applied', date: '2026-04-01' },
      { id: createId(), stage: 'Screening', date: '2026-04-03' },
      { id: createId(), stage: 'Phone Screen', date: '2026-04-07' },
      { id: createId(), stage: 'Technical', date: '2026-04-12' },
      { id: createId(), stage: 'Onsite', date: '2026-04-18' },
      { id: createId(), stage: 'Offer', date: '2026-04-23', notes: 'Great offer received - $155k + equity' },
    ],

    salary: 155000,
    location: 'San Francisco, CA (Remote)'
  },
  {
    id: createId(),
    company: 'Spotify',
    role: 'Backend Developer',
    jobUrl: 'https://spotify.com/careers',
    appliedDate: '2026-04-07',
    source: 'Referral',
    status: 'applied',
    lastUpdated: '2026-04-07',
    currentStageIndex: 0,
    customStages: DEFAULT_STAGES,
    timeline: [
      { id: createId(), stage: 'Applied', date: '2026-04-07', notes: 'Internal referral' },
    ],
    notes: 'Would be amazing to work on music recommendation systems',

    location: 'New York, NY'
  },
]