import React, { createContext, useContext, useEffect } from 'react'
import type { Application, User } from '../types'
import { applicationsApi, authApi } from '../services/api'

interface AppContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
  applications: Application[]
  applicationsLoading: boolean
  addApplication: (app: Omit<Application, 'id' | 'timeline' | 'lastUpdated'>) => Promise<Application>
  updateApplication: (id: string, updates: Partial<Application>) => Promise<Application>
  deleteApplication: (id: string) => Promise<void>
  refetchApplications: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Helper to sync auth state with Chrome extension
const syncWithExtension = (token: string | null, user: User | null) => {
  // Check if we're in a Chrome extension context
  if (typeof window !== 'undefined' && (window as any).chrome?.storage) {
    const chrome = (window as any).chrome;
    if (token && user) {
      chrome.storage.local.set({
        authToken: token,
        user: user
      })
    } else {
      chrome.storage.local.remove(['authToken', 'user'])
    }
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(() => {
    const savedUser = localStorage.getItem('offerpath_user')
    const savedToken = localStorage.getItem('offerpath_token')
    if (savedUser && savedToken) {
      return JSON.parse(savedUser)
    }
    return null
  })

  const [applications, setApplications] = React.useState<Application[]>([])
  const [applicationsLoading, setApplicationsLoading] = React.useState(true)

  // Load applications when user is authenticated
  useEffect(() => {
    if (user) {
      loadApplications()
    } else {
      setApplications([])
      setApplicationsLoading(false)
    }
  }, [user])

  const loadApplications = async () => {
    try {
      setApplicationsLoading(true)
      const data = await applicationsApi.list()
      setApplications(data)
    } catch (error) {
      console.error('Failed to load applications:', error)
    } finally {
      setApplicationsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password)
      const userWithAdmin = {
        ...data.user,
        isAdmin: data.user.is_admin || false
      }
      localStorage.setItem('offerpath_token', data.token)
      localStorage.setItem('offerpath_user', JSON.stringify(userWithAdmin))
      setUser(userWithAdmin)
      // Sync with Chrome extension
      syncWithExtension(data.token, userWithAdmin)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const signup = async (email: string, name: string, password: string) => {
    try {
      const data = await authApi.signup(email, name, password)
      const userWithAdmin = {
        ...data.user,
        isAdmin: data.user.is_admin || false
      }
      localStorage.setItem('offerpath_token', data.token)
      localStorage.setItem('offerpath_user', JSON.stringify(userWithAdmin))
      setUser(userWithAdmin)
      // Sync with Chrome extension
      syncWithExtension(data.token, userWithAdmin)
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('offerpath_token')
    localStorage.removeItem('offerpath_user')
    setUser(null)
    // Sync with Chrome extension
    syncWithExtension(null, null)
  }

  const addApplication = async (appData: Omit<Application, 'id' | 'timeline' | 'lastUpdated'>): Promise<Application> => {
    try {
      const newApp = await applicationsApi.create(appData)
      setApplications((prev) => [newApp, ...prev])
      return newApp
    } catch (error) {
      console.error('Failed to add application:', error)
      throw error
    }
  }

  const updateApplication = async (id: string, updates: Partial<Application>): Promise<Application> => {
    try {
      const updatedApp = await applicationsApi.update(id, updates)
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? updatedApp : app))
      )
      return updatedApp
    } catch (error) {
      console.error('Failed to update application:', error)
      throw error
    }
  }

  const deleteApplication = async (id: string): Promise<void> => {
    try {
      await applicationsApi.delete(id)
      setApplications((prev) => prev.filter((app) => app.id !== id))
    } catch (error) {
      console.error('Failed to delete application:', error)
      throw error
    }
  }

  const refetchApplications = () => {
    if (user) {
      loadApplications()
    }
  }

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        applications,
        applicationsLoading,
        addApplication,
        updateApplication,
        deleteApplication,
        refetchApplications,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
