/**
 * api.ts
 * =======
 * 
 * API service layer for communicating with the OfferPath backend.
 * Handles all HTTP requests with proper error handling and TypeScript types.
 * Uses Access Token + Refresh Token authentication with proactive refresh.
 */

import type { Application, ApplicationStatus, Interview, Offer, TimelineEvent, Stage } from '../types'
import { DEFAULT_STAGES } from '../types'

function getApiUrl() {
  const base = import.meta.env.VITE_API_URL || 'https://ahmedmazen-offer-path-backend.hf.space'
  
  let cleanBase = base.trim()
  const isLocal = cleanBase.includes('localhost') || cleanBase.includes('127.0.0.1')
  
  if (!isLocal) {
    if (cleanBase.startsWith('http://')) {
      cleanBase = cleanBase.replace('http://', 'https://')
    } else if (!cleanBase.startsWith('https://')) {
      cleanBase = `https://${cleanBase}`
    }
  } else {
    if (!cleanBase.startsWith('http://') && !cleanBase.startsWith('https://')) {
      cleanBase = `http://${cleanBase}`
    }
  }
  
  return cleanBase.replace(/\/+$/, '')
}

const API_URL = getApiUrl()

const ACCESS_TOKEN_KEY = 'offerpath_access_token'
const REFRESH_TOKEN_KEY = 'offerpath_refresh_token'
const TOKEN_EXPIRY_KEY = 'offerpath_token_expiry'

function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

function setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  const expiryTime = Date.now() + (expiresIn * 1000)
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryTime))
}

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
}

let isRefreshing = false
let refreshPromise: Promise<void> | null = null

async function doRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return false
  }
  
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    
    if (!response.ok) {
      return false
    }
    
    const data = await response.json()
    if (data.access_token && data.refresh_token) {
      setTokens(data.access_token, data.refresh_token, data.expires_in)
      return true
    }
    return false
  } catch (e) {
    console.error('Token refresh failed:', e)
    return false
  }
}

async function refreshTokenIfNeeded(): Promise<boolean> {
  if (isRefreshing) {
    await refreshPromise
    return !!getAccessToken()
  }
  
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY)
  const expiry = expiryStr ? parseInt(expiryStr, 10) : 0
  const now = Date.now()
  const fiveMinutes = 5 * 60 * 1000
  
  if (expiry && now >= expiry - fiveMinutes) {
    isRefreshing = true
    refreshPromise = (async () => {
      await doRefreshToken()
      isRefreshing = false
      refreshPromise = null
    })()
    await refreshPromise
    return !!getAccessToken()
  }
  
  return true
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}, _retry = true) {
  const token = getAccessToken()
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/signup')) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  
  const cleanEndpoint = endpoint.replace(/\/+$/, '')
  const url = `${API_URL}/api${cleanEndpoint}`
  
  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers,
    credentials: 'include',
  })
  
  if (response.status === 401 && _retry) {
    const refreshed = await refreshTokenIfNeeded()
    if (refreshed) {
      return fetchWithAuth(endpoint, options, false)
    }
    clearTokens()
    window.dispatchEvent(new CustomEvent('logout'))
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

// ============================================
// Transform Functions (Backend <-> Frontend)
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformApplicationFromBackend(backendApp: any): Application {
  // Parse custom_stages from JSON string to array of Stage objects
  let customStages: Stage[] = DEFAULT_STAGES;
  if (backendApp.custom_stages) {
    if (typeof backendApp.custom_stages === 'string') {
      try {
        const parsed = JSON.parse(backendApp.custom_stages);
        if (Array.isArray(parsed)) {
          customStages = parsed.map((s: any) => {
            if (typeof s === 'string') return { name: s, color: '#3b82f6' };
            return { name: s.name || '', color: s.color || '#3b82f6' };
          });
        } else {
          customStages = backendApp.custom_stages.split(',').map((s: string) => ({ name: s.trim(), color: '#3b82f6' })).filter((s: any) => s.name);
        }
      } catch {
        customStages = backendApp.custom_stages.split(',').map((s: string) => ({ name: s.trim(), color: '#3b82f6' })).filter((s: any) => s.name);
      }
    } else if (Array.isArray(backendApp.custom_stages)) {
      customStages = backendApp.custom_stages.map((s: any) => {
        if (typeof s === 'string') return { name: s, color: '#3b82f6' };
        return { name: s.name || '', color: s.color || '#3b82f6' };
      });
    }
  }
  
  // Parse timeline from JSON string to array
  let timeline: TimelineEvent[] = [];
  if (backendApp.timeline) {
    if (typeof backendApp.timeline === 'string') {
      try {
        timeline = JSON.parse(backendApp.timeline);
      } catch {
        timeline = [];
      }
    } else if (Array.isArray(backendApp.timeline)) {
      timeline = backendApp.timeline;
    }
  }
  
  return {
    id: String(backendApp.id),
    company: backendApp.company,
    role: backendApp.role,
    jobUrl: backendApp.job_url,
    appliedDate: backendApp.applied_date,
    source: backendApp.source,
    status: backendApp.status as ApplicationStatus,
    lastUpdated: backendApp.last_updated,
    currentStageIndex: backendApp.current_stage_index,
    customStages,
    timeline,
    notes: backendApp.notes,
    interviewDate: backendApp.interview_date,
    salary: backendApp.salary,
    location: backendApp.location,
  }
}

function transformApplicationToBackend(app: Partial<Application>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const backend: any = {}
  
  if (app.company !== undefined) backend.company = app.company
  if (app.role !== undefined) backend.role = app.role
  if (app.jobUrl !== undefined) backend.job_url = app.jobUrl
  if (app.appliedDate !== undefined) backend.applied_date = app.appliedDate
  if (app.source !== undefined) backend.source = app.source
  if (app.status !== undefined) backend.status = app.status
  if (app.currentStageIndex !== undefined) backend.current_stage_index = app.currentStageIndex
  if (app.customStages !== undefined) backend.custom_stages = app.customStages
  if (app.timeline !== undefined) backend.timeline = app.timeline
  if (app.notes !== undefined) backend.notes = app.notes
  if (app.interviewDate !== undefined) backend.interview_date = app.interviewDate
  if (app.salary !== undefined) backend.salary = app.salary
  if (app.location !== undefined) backend.location = app.location
  
  return backend
}

// ============================================
// Application API
// ============================================

export const applicationsApi = {
  list: async (): Promise<Application[]> => {
    const data = await fetchWithAuth('/applications')
    return data.map(transformApplicationFromBackend)
  },
  
  get: async (id: string): Promise<Application> => {
    const data = await fetchWithAuth(`/applications/${id}`)
    return transformApplicationFromBackend(data)
  },
  
  create: async (application: Partial<Application>): Promise<Application> => {
    const backendData = transformApplicationToBackend(application)
    const data = await fetchWithAuth('/applications', {
      method: 'POST',
      body: JSON.stringify(backendData),
    })
    return transformApplicationFromBackend(data)
  },
  
  update: async (id: string, updates: Partial<Application>): Promise<Application> => {
    const backendData = transformApplicationToBackend(updates)
    const data = await fetchWithAuth(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    })
    return transformApplicationFromBackend(data)
  },
  
  delete: async (id: string): Promise<void> => {
    await fetchWithAuth(`/applications/${id}`, {
      method: 'DELETE',
    })
  },
  
  getStats: async () => {
    return fetchWithAuth('/applications/stats/summary')
  },
}

// ============================================
// Interview API
// ============================================

export const interviewsApi = {
  list: async (params?: { status?: string; application_id?: string }): Promise<Interview[]> => {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.application_id) query.set('application_id', params.application_id)
    
    const queryString = query.toString()
    const data = await fetchWithAuth(`/interviews${queryString ? '?' + queryString : ''}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((item: any) => ({
      id: String(item.id),
      applicationId: String(item.application_id),
      interviewType: item.interview_type,
      scheduledDate: item.scheduled_date,
      durationMinutes: item.duration_minutes,
      interviewerName: item.interviewer_name,
      interviewerEmail: item.interviewer_email,
      location: item.location,
      isRemote: item.is_remote,
      meetingLink: item.meeting_link,
      notes: item.notes,
      status: item.status,
      createdAt: item.created_at,
      applicationCompany: item.application_company,
      applicationRole: item.application_role,
    }))
  },
  
  getUpcoming: async (days: number = 30): Promise<Interview[]> => {
    const data = await fetchWithAuth(`/interviews/upcoming?days=${days}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((item: any) => ({
      id: String(item.id),
      applicationId: String(item.application_id),
      interviewType: item.interview_type,
      scheduledDate: item.scheduled_date,
      durationMinutes: item.duration_minutes,
      interviewerName: item.interviewer_name,
      interviewerEmail: item.interviewer_email,
      location: item.location,
      isRemote: item.is_remote,
      meetingLink: item.meeting_link,
      notes: item.notes,
      status: item.status,
      createdAt: item.created_at,
      applicationCompany: item.application_company,
      applicationRole: item.application_role,
    }))
  },
  
  get: async (id: string): Promise<Interview> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item = await fetchWithAuth(`/interviews/${id}`)
    return {
      id: String(item.id),
      applicationId: String(item.application_id),
      interviewType: item.interview_type,
      scheduledDate: item.scheduled_date,
      durationMinutes: item.duration_minutes,
      interviewerName: item.interviewer_name,
      interviewerEmail: item.interviewer_email,
      location: item.location,
      isRemote: item.is_remote,
      meetingLink: item.meeting_link,
      notes: item.notes,
      status: item.status,
      createdAt: item.created_at,
      applicationCompany: item.application_company,
      applicationRole: item.application_role,
    }
  },
  
  create: async (interview: Partial<Interview>): Promise<Interview> => {
    const backendData = {
      application_id: interview.applicationId ? parseInt(interview.applicationId) : undefined,
      interview_type: interview.interviewType,
      scheduled_date: interview.scheduledDate,
      duration_minutes: interview.durationMinutes,
      interviewer_name: interview.interviewerName,
      interviewer_email: interview.interviewerEmail,
      location: interview.location,
      is_remote: interview.isRemote,
      meeting_link: interview.meetingLink,
      notes: interview.notes,
      status: interview.status,
    }
    
    const item = await fetchWithAuth('/interviews', {
      method: 'POST',
      body: JSON.stringify(backendData),
    })
    
    return {
      id: String(item.id),
      applicationId: String(item.application_id),
      interviewType: item.interview_type,
      scheduledDate: item.scheduled_date,
      durationMinutes: item.duration_minutes,
      interviewerName: item.interviewer_name,
      interviewerEmail: item.interviewer_email,
      location: item.location,
      notes: item.notes,
      status: item.status,
      createdAt: item.created_at,
      applicationCompany: item.application_company,
      applicationRole: item.application_role,
    }
  },
  
  update: async (id: string, updates: Partial<Interview>): Promise<Interview> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const backendData: any = {}
    if (updates.interviewType !== undefined) backendData.interview_type = updates.interviewType
    if (updates.scheduledDate !== undefined) backendData.scheduled_date = updates.scheduledDate
    if (updates.durationMinutes !== undefined) backendData.duration_minutes = updates.durationMinutes
    if (updates.interviewerName !== undefined) backendData.interviewer_name = updates.interviewerName
    if (updates.interviewerEmail !== undefined) backendData.interviewer_email = updates.interviewerEmail
    if (updates.location !== undefined) backendData.location = updates.location
    if (updates.notes !== undefined) backendData.notes = updates.notes
    if (updates.status !== undefined) backendData.status = updates.status
    
    const item = await fetchWithAuth(`/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    })
    
    return {
      id: String(item.id),
      applicationId: String(item.application_id),
      interviewType: item.interview_type,
      scheduledDate: item.scheduled_date,
      durationMinutes: item.duration_minutes,
      interviewerName: item.interviewer_name,
      interviewerEmail: item.interviewer_email,
      location: item.location,
      notes: item.notes,
      status: item.status,
      createdAt: item.created_at,
      applicationCompany: item.application_company,
      applicationRole: item.application_role,
    }
  },
  
  delete: async (id: string): Promise<void> => {
    await fetchWithAuth(`/interviews/${id}`, { method: 'DELETE' })
  },
}

// ============================================
// Offer API
// ============================================

export const offersApi = {
  /** Fetch real offers for a specific application (uses /offers endpoint directly) */
  listByApplication: async (applicationId: string): Promise<Offer[]> => {
    const data = await fetchWithAuth(`/offers?application_id=${applicationId}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((item: any) => {
      const parse = (v: any): string[] => {
        if (!v) return []
        if (Array.isArray(v)) return v
        try { const p = JSON.parse(v); return Array.isArray(p) ? p : v.split(',').map((s: string) => s.trim()).filter(Boolean) }
        catch { return v.split(',').map((s: string) => s.trim()).filter(Boolean) }
      }
      return {
        id: String(item.id),
        applicationId: String(item.application_id),
        baseSalary: item.base_salary,
        currency: item.currency,
        bonus: item.bonus,
        equity: item.equity,
        benefits: parse(item.benefits),
        pros: parse(item.pros),
        cons: parse(item.cons),
        startDate: item.start_date,
        deadline: item.deadline,
        status: item.status,
        notes: item.notes,
        createdAt: item.created_at,
        applicationCompany: item.application_company,
        applicationRole: item.application_role,
      }
    })
  },

  list: async (params?: { status?: string; application_id?: string }): Promise<Offer[]> => {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.application_id) query.set('application_id', params.application_id)
    
    const queryString = query.toString()
    const data = await fetchWithAuth(`/offers/from-applications${queryString ? '?' + queryString : ''}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((item: any) => {
      // Parse benefits from string to array
      let benefits: string[] = []
      if (item.benefits) {
        if (typeof item.benefits === 'string') {
          try {
            // Try parsing as JSON first
            const parsed = JSON.parse(item.benefits)
            benefits = Array.isArray(parsed) ? parsed : item.benefits.split(',').map((s: string) => s.trim()).filter(Boolean)
          } catch {
            // Fall back to comma-separated
            benefits = item.benefits.split(',').map((s: string) => s.trim()).filter(Boolean)
          }
        } else if (Array.isArray(item.benefits)) {
          benefits = item.benefits
        }
      }
      
      // Parse pros from string to array
      let pros: string[] = []
      if (item.pros) {
        if (typeof item.pros === 'string') {
          try {
            const parsed = JSON.parse(item.pros)
            pros = Array.isArray(parsed) ? parsed : item.pros.split(',').map((s: string) => s.trim()).filter(Boolean)
          } catch {
            pros = item.pros.split(',').map((s: string) => s.trim()).filter(Boolean)
          }
        } else if (Array.isArray(item.pros)) {
          pros = item.pros
        }
      }
      
      // Parse cons from string to array
      let cons: string[] = []
      if (item.cons) {
        if (typeof item.cons === 'string') {
          try {
            const parsed = JSON.parse(item.cons)
            cons = Array.isArray(parsed) ? parsed : item.cons.split(',').map((s: string) => s.trim()).filter(Boolean)
          } catch {
            cons = item.cons.split(',').map((s: string) => s.trim()).filter(Boolean)
          }
        } else if (Array.isArray(item.cons)) {
          cons = item.cons
        }
      }
      
      return {
        id: String(item.id),
        applicationId: String(item.application_id),
        baseSalary: item.base_salary,
        currency: item.currency,
        bonus: item.bonus,
        equity: item.equity,
        benefits,
        pros,
        cons,
        startDate: item.start_date,
        deadline: item.deadline,
        status: item.status,
        notes: item.notes,
        createdAt: item.created_at,
        applicationCompany: item.application_company,
        applicationRole: item.application_role,
      }
    })
  },
  
  compare: async (offerIds: string[]): Promise<Offer[]> => {
    const query = new URLSearchParams()
    offerIds.forEach(id => query.append('offer_ids', id))
    
    const data = await fetchWithAuth(`/offers/compare?${query.toString()}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((item: any) => {
      // Parse benefits from string to array
      let benefits: string[] = []
      if (item.benefits) {
        if (typeof item.benefits === 'string') {
          try {
            const parsed = JSON.parse(item.benefits)
            benefits = Array.isArray(parsed) ? parsed : item.benefits.split(',').map((s: string) => s.trim()).filter(Boolean)
          } catch {
            benefits = item.benefits.split(',').map((s: string) => s.trim()).filter(Boolean)
          }
        } else if (Array.isArray(item.benefits)) {
          benefits = item.benefits
        }
      }
      
      // Parse pros from string to array
      let pros: string[] = []
      if (item.pros) {
        if (typeof item.pros === 'string') {
          try {
            const parsed = JSON.parse(item.pros)
            pros = Array.isArray(parsed) ? parsed : item.pros.split(',').map((s: string) => s.trim()).filter(Boolean)
          } catch {
            pros = item.pros.split(',').map((s: string) => s.trim()).filter(Boolean)
          }
        } else if (Array.isArray(item.pros)) {
          pros = item.pros
        }
      }
      
      // Parse cons from string to array
      let cons: string[] = []
      if (item.cons) {
        if (typeof item.cons === 'string') {
          try {
            const parsed = JSON.parse(item.cons)
            cons = Array.isArray(parsed) ? parsed : item.cons.split(',').map((s: string) => s.trim()).filter(Boolean)
          } catch {
            cons = item.cons.split(',').map((s: string) => s.trim()).filter(Boolean)
          }
        } else if (Array.isArray(item.cons)) {
          cons = item.cons
        }
      }
      
      return {
        id: String(item.id),
        applicationId: String(item.application_id),
        baseSalary: item.base_salary,
        currency: item.currency,
        bonus: item.bonus,
        equity: item.equity,
        benefits,
        pros,
        cons,
        startDate: item.start_date,
        deadline: item.deadline,
        status: item.status,
        notes: item.notes,
        createdAt: item.created_at,
        applicationCompany: item.application_company,
        applicationRole: item.application_role,
      }
    })
  },
  
  get: async (id: string): Promise<Offer> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item = await fetchWithAuth(`/offers/${id}`)
    // Parse pros and cons
    let pros: string[] = []
    if (item.pros) {
      if (typeof item.pros === 'string') {
        try {
          pros = JSON.parse(item.pros)
        } catch {
          pros = item.pros.split(',').map((s: string) => s.trim()).filter(Boolean)
        }
      } else {
        pros = item.pros
      }
    }
    let cons: string[] = []
    if (item.cons) {
      if (typeof item.cons === 'string') {
        try {
          cons = JSON.parse(item.cons)
        } catch {
          cons = item.cons.split(',').map((s: string) => s.trim()).filter(Boolean)
        }
      } else {
        cons = item.cons
      }
    }
    return {
      id: String(item.id),
      applicationId: String(item.application_id),
      baseSalary: item.base_salary,
      currency: item.currency,
      bonus: item.bonus,
      equity: item.equity,
      benefits: item.benefits || [],
      pros,
      cons,
      startDate: item.start_date,
      deadline: item.deadline,
      status: item.status,
      notes: item.notes,
      createdAt: item.created_at,
      applicationCompany: item.application_company,
      applicationRole: item.application_role,
    }
  },
  
  create: async (offer: Partial<Offer>): Promise<Offer> => {
    const backendData = {
      application_id: offer.applicationId ? parseInt(offer.applicationId) : undefined,
      base_salary: offer.baseSalary,
      currency: offer.currency,
      bonus: offer.bonus,
      equity: offer.equity,
      benefits: offer.benefits,
      pros: offer.pros,
      cons: offer.cons,
      start_date: offer.startDate,
      deadline: offer.deadline,
      status: offer.status,
      notes: offer.notes,
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item = await fetchWithAuth('/offers', {
      method: 'POST',
      body: JSON.stringify(backendData),
    })
    
    // Parse pros and cons
    let pros: string[] = []
    if (item.pros) {
      if (typeof item.pros === 'string') {
        try {
          pros = JSON.parse(item.pros)
        } catch {
          pros = item.pros.split(',').map((s: string) => s.trim()).filter(Boolean)
        }
      } else {
        pros = item.pros
      }
    }
    let cons: string[] = []
    if (item.cons) {
      if (typeof item.cons === 'string') {
        try {
          cons = JSON.parse(item.cons)
        } catch {
          cons = item.cons.split(',').map((s: string) => s.trim()).filter(Boolean)
        }
      } else {
        cons = item.cons
      }
    }
    
    return {
      id: String(item.id),
      applicationId: String(item.application_id),
      baseSalary: item.base_salary,
      currency: item.currency,
      bonus: item.bonus,
      equity: item.equity,
      benefits: item.benefits || [],
      pros,
      cons,
      startDate: item.start_date,
      deadline: item.deadline,
      status: item.status,
      notes: item.notes,
      createdAt: item.created_at,
      applicationCompany: item.application_company,
      applicationRole: item.application_role,
    }
  },
  
  update: async (id: string, updates: Partial<Offer>): Promise<Offer> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const backendData: any = {}
    if (updates.baseSalary !== undefined) backendData.base_salary = updates.baseSalary
    if (updates.currency !== undefined) backendData.currency = updates.currency
    if (updates.bonus !== undefined) backendData.bonus = updates.bonus
    if (updates.equity !== undefined) backendData.equity = updates.equity
    if (updates.benefits !== undefined) backendData.benefits = updates.benefits
    if (updates.pros !== undefined) backendData.pros = updates.pros
    if (updates.cons !== undefined) backendData.cons = updates.cons
    if (updates.startDate !== undefined) backendData.start_date = updates.startDate
    if (updates.deadline !== undefined) backendData.deadline = updates.deadline
    if (updates.status !== undefined) backendData.status = updates.status
    if (updates.notes !== undefined) backendData.notes = updates.notes
    
    const item = await fetchWithAuth(`/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    })
    
    // Parse pros and cons
    let pros: string[] = []
    if (item.pros) {
      if (typeof item.pros === 'string') {
        try {
          pros = JSON.parse(item.pros)
        } catch {
          pros = item.pros.split(',').map((s: string) => s.trim()).filter(Boolean)
        }
      } else {
        pros = item.pros
      }
    }
    let cons: string[] = []
    if (item.cons) {
      if (typeof item.cons === 'string') {
        try {
          cons = JSON.parse(item.cons)
        } catch {
          cons = item.cons.split(',').map((s: string) => s.trim()).filter(Boolean)
        }
      } else {
        cons = item.cons
      }
    }
    
    return {
      id: String(item.id),
      applicationId: String(item.application_id),
      baseSalary: item.base_salary,
      currency: item.currency,
      bonus: item.bonus,
      equity: item.equity,
      benefits: item.benefits || [],
      pros,
      cons,
      startDate: item.start_date,
      deadline: item.deadline,
      status: item.status,
      notes: item.notes,
      createdAt: item.created_at,
      applicationCompany: item.application_company,
      applicationRole: item.application_role,
    }
  },
  
  delete: async (id: string): Promise<void> => {
    await fetchWithAuth(`/offers/${id}`, { method: 'DELETE' })
  },
}

// ============================================
// Analytics API
// ============================================

export const analyticsApi = {
  getFunnel: async () => {
    return fetchWithAuth('/analytics/funnel')
  },
  
  getMetrics: async (period: string = 'all') => {
    return fetchWithAuth(`/analytics/metrics?period=${period}`)
  },
  
  getTrends: async (days: number = 30) => {
    return fetchWithAuth(`/analytics/trends?days=${days}`)
  },
}

// ============================================
// Auth API
// ============================================

export const authApi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  login: async (email: string, password: string, rememberMe: boolean = false): Promise<{ user: any; access_token: string; refresh_token: string }> => {
    let lastError: Error | null = null
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const data = await fetchWithAuth(`/auth/login?remember_me=${rememberMe}`, {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        
        if (data.access_token && data.refresh_token) {
          setTokens(data.access_token, data.refresh_token, data.expires_in)
        }
        
        return data as { user: any; access_token: string; refresh_token: string }
      } catch (e) {
        lastError = e instanceof Error ? e : new Error('An error occurred')
        if (lastError.message.includes('500') || lastError.message.includes('Internal Server Error')) {
          await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
          continue
        }
        throw lastError
      }
    }
    throw lastError
  },
   
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signup: async (email: string, name: string, password: string): Promise<{ user: any; access_token: string; refresh_token: string }> => {
    const data = await fetchWithAuth('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    })
    
    if (data.access_token && data.refresh_token) {
      setTokens(data.access_token, data.refresh_token, data.expires_in)
    }
    
    return data as { user: any; access_token: string; refresh_token: string }
  },
  
  getMe: async () => {
    return fetchWithAuth('/auth/me')
  },

  refresh: async () => {
    const data = await fetchWithAuth('/auth/refresh', {
      method: 'POST',
    })
    if (data.access_token && data.refresh_token) {
      setTokens(data.access_token, data.refresh_token, data.expires_in)
    }
    return data
  },

  updateProfile: async (updates: { name?: string; email?: string; avatar?: string; password?: string }) => {
    return fetchWithAuth('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  logout: async () => {
    try {
      await fetchWithAuth('/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error('Logout API call failed:', e)
    }
    clearTokens()
  },
}

export default {
  applications: applicationsApi,
  interviews: interviewsApi,
  offers: offersApi,
  analytics: analyticsApi,
  auth: authApi,
  fetchWithAuth,
}
