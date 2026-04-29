import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider, useAppContext } from './context/AppContext'
import { Layout } from './components/layout/Layout'
import { NewApplicationModal } from './components/NewApplicationModal'
import { EditApplicationModal } from './components/EditApplicationModal'
import { Dashboard } from './pages/Dashboard'
import { Applications } from './pages/Applications'
import { ApplicationDetail } from './pages/ApplicationDetail'
import { Interviews } from './pages/Interviews'
import { Analytics } from './pages/Analytics'
import { OfferComparison } from './pages/OfferComparison'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Settings } from './pages/Settings'
import { AdminPanel } from './pages/AdminPanel'
import { NotFound } from './pages/NotFound'
import type { Application } from './types'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
})

function AppContent() {
  const { isAuthenticated } = useAppContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<Application | null>(null)

  const handleQuickLog = () => setIsModalOpen(true)
  const handleEdit = (app: Application) => setEditingApp(app)
  const closeEditModal = () => setEditingApp(null)

  if (!isAuthenticated) {
    return (
      <Layout isAuthenticated={false} onQuickLog={() => {}}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    )
  }

  return (
    <Layout onQuickLog={handleQuickLog} isAuthenticated={true}>
      <Routes>
        <Route path="/" element={<Dashboard onQuickLog={handleQuickLog} />} />
        <Route path="/applications" element={<Applications onEdit={handleEdit} onSelect={() => {}} />} />
        <Route path="/applications/:id" element={<ApplicationDetail onEdit={handleEdit} />} />
        <Route path="/interviews" element={<Interviews />} />
        <Route path="/offers" element={<OfferComparison />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <NewApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {editingApp && <EditApplicationModal isOpen={true} onClose={closeEditModal} application={editingApp} />}
    </Layout>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App