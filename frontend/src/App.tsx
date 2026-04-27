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

  if (!isAuthenticated) return <Login />

  return (
    <Layout onQuickLog={handleQuickLog}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/applications" element={<Applications onEdit={handleEdit} onSelect={() => {}} />} />
        <Route path="/applications/:id" element={<ApplicationDetail onEdit={handleEdit} />} />
        <Route path="/interviews" element={<Interviews />} />
        <Route path="/offers" element={<OfferComparison />} />
        <Route path="/documents" element={<div className="p-6"><h1 className="text-2xl font-bold">Documents</h1><p className="text-slate-600 mt-2">Coming soon...</p></div>} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/" replace />} />
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