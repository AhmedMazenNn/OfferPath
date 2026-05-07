import React, { createContext, useContext, useEffect, useCallback } from 'react'
import type { Application, User } from '../types'
import { applicationsApi, authApi } from '../services/api'

interface AppContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signup: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
  applications: Application[]
  applicationsLoading: boolean
  addApplication: (app: Omit<Application, 'id' | 'timeline' | 'lastUpdated'>) => Promise<Application>
  updateApplication: (id: string, updates: Partial<Application>) => Promise<Application>
  deleteApplication: (id: string) => Promise<void>
  refetchApplications: () => void
  updateProfile: (updates: { name?: string; email?: string; avatar?: string; password?: string }) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const ACCESS_TOKEN_KEY = 'offerpath_access_token'
const REFRESH_TOKEN_KEY = 'offerpath_refresh_token'
const USER_KEY = 'offerpath_user'
const API_URL = import.meta.env.VITE_API_URL || 'https://ahmedmazen-offer-path-backend.hf.space'

const syncWithExtension = (accessToken: string | null, refreshToken: string | null, user: User | null) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any
  if (win?.chrome?.storage) {
    if (accessToken && refreshToken && user) {
      win.chrome.storage.local.set({
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: user,
        tokenExpiry: String(Date.now() + 30 * 60 * 1000), // 30 min default
        apiUrl: API_URL
      })
    } else {
      win.chrome.storage.local.remove(['accessToken', 'refreshToken', 'user', 'tokenExpiry', 'apiUrl'])
    }
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY)
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (savedUser && accessToken && refreshToken) {
      return JSON.parse(savedUser)
    }
    return null
  })

  const [applications, setApplications] = React.useState<Application[]>([])
  const [applicationsLoading, setApplicationsLoading] = React.useState(true)

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

  useEffect(() => {
    const handleLogout = () => {
      logout()
    }
    window.addEventListener('logout', handleLogout)
    
    // Refetch applications when window gains focus (e.g. after using extension)
    const handleFocus = () => {
      if (user) {
        loadApplications()
      }
    }
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('logout', handleLogout)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user])

  useEffect(() => {
    const validateAndLoad = async () => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      
      if (user && accessToken && refreshToken) {
        try {
          await authApi.getMe()
          await loadApplications()
          syncWithExtension(accessToken, refreshToken, user)
        } catch (error) {
          console.error('Session validation failed:', error)
          logout()
        }
      } else {
        setApplications([])
        setApplicationsLoading(false)
      }
    }
    
    validateAndLoad()
  }, [])

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const data = await authApi.login(email, password, rememberMe)
      const userWithAdmin = {
        ...data.user,
        isAdmin: data.user.is_admin || false
      }
      localStorage.setItem(USER_KEY, JSON.stringify(userWithAdmin))
      setUser(userWithAdmin)
      await loadApplications()
      syncWithExtension(data.access_token, data.refresh_token, userWithAdmin)
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
      localStorage.setItem(USER_KEY, JSON.stringify(userWithAdmin))
      setUser(userWithAdmin)
      await loadApplications()
      syncWithExtension(data.access_token, data.refresh_token, userWithAdmin)
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    }
  }

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (e) {
      console.error('Logout API call failed:', e)
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
    syncWithExtension(null, null, null)
  }, [])

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
    const currentApp = applications.find((app) => app.id === id)
    if (currentApp) {
      const newIndex = (updates.currentStageIndex !== undefined ? updates.currentStageIndex : currentApp.currentStageIndex) ?? 0
      const newStages = updates.customStages !== undefined ? updates.customStages : currentApp.customStages
      const newStatus = (newStages && newIndex !== undefined && newStages[newIndex]) ? newStages[newIndex].name : currentApp.status

      const optimisticApp: Application = {
        ...currentApp,
        ...updates,
        status: newStatus,
        currentStageIndex: newIndex,
        customStages: newStages,
      }
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? optimisticApp : app))
      )
    }
    try {
      const updatedApp = await applicationsApi.update(id, updates)
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? updatedApp : app))
      )
      return updatedApp
    } catch (error) {
      if (currentApp) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? currentApp : app))
        )
      }
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

  const updateProfile = async (updates: { name?: string; email?: string; avatar?: string; password?: string }) => {
    try {
      const updatedUser = await authApi.updateProfile(updates)
      const userWithAdmin = {
        ...updatedUser,
        isAdmin: updatedUser.is_admin || false
      }
      localStorage.setItem(USER_KEY, JSON.stringify(userWithAdmin))
      setUser(userWithAdmin)
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      syncWithExtension(accessToken, refreshToken, userWithAdmin)
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
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
        updateProfile,
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
