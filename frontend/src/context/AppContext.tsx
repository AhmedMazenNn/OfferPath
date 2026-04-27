import React, { useEffect, useState, createContext, useContext } from 'react'
import type { Application, User } from '../types'
import { DEFAULT_STAGES } from '../types'
import { mockApplications } from '../data/mockData'

interface AppContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, name: string) => void
  signup: (email: string, name: string) => void
  logout: () => void
  applications: Application[]
  addApplication: (app: Omit<Application, 'id' | 'timeline' | 'lastUpdated'>) => void
  updateApplication: (id: string, updates: Partial<Application>) => void
  deleteApplication: (id: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('offerpath_user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const [applications, setApplications] = useState<Application[]>(() => {
    const savedApps = localStorage.getItem('offerpath_apps')
    return savedApps ? JSON.parse(savedApps) : mockApplications
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('offerpath_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('offerpath_user')
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem('offerpath_apps', JSON.stringify(applications))
  }, [applications])

  const login = (email: string, name: string) => {
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
    })
  }

  const signup = (email: string, name: string) => {
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
    })
  }

  const logout = () => {
    setUser(null)
  }

  const addApplication = (appData: Omit<Application, 'id' | 'timeline' | 'lastUpdated'>) => {
    const newApp: Application = {
      ...appData,
      id: Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date().toISOString(),
      timeline: [
        {
          id: Math.random().toString(36).substr(2, 9),
          stage: appData.customStages[appData.currentStageIndex] || DEFAULT_STAGES[0],
          date: new Date().toISOString(),
          notes: 'Application added',
        },
      ],
    }
    setApplications((prev) => [newApp, ...prev])
  }

  const updateApplication = (id: string, updates: Partial<Application>) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const updatedApp = {
            ...app,
            ...updates,
            lastUpdated: new Date().toISOString(),
          }
          if (
            updates.currentStageIndex !== undefined &&
            updates.currentStageIndex !== app.currentStageIndex
          ) {
            const newStage = updatedApp.customStages[updates.currentStageIndex]
            updatedApp.timeline = [
              ...updatedApp.timeline,
              {
                id: Math.random().toString(36).substr(2, 9),
                stage: newStage,
                date: new Date().toISOString(),
              },
            ]
          }
          return updatedApp
        }
        return app
      }),
    )
  }

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id))
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
        addApplication,
        updateApplication,
        deleteApplication,
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