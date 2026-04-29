import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  GitCompare,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Logo } from '../ui/Logo'
import { useAppContext } from '../../context/AppContext'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation()
  const { logout, user } = useAppContext()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/applications', icon: Briefcase, label: 'Applications' },
    { path: '/interviews', icon: Calendar, label: 'Interviews' },
    { path: '/offers', icon: GitCompare, label: 'Offers' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ]

  const bottomItems = [
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  const adminItem = user?.isAdmin ? {
    path: '/admin',
    icon: Shield,
    label: 'Admin',
  } : null

  const isActuallyCollapsed = isCollapsed && !isMobile

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <motion.aside
        initial={false}
        animate={{
          width: isActuallyCollapsed ? 80 : 280,
          x: isMobile ? (isMobileOpen ? 0 : -280) : 0
        }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
        }}
        className={`fixed left-0 top-0 h-screen bg-[#020617] text-slate-400 border-r border-slate-800/50 flex flex-col z-50 shadow-2xl transition-[width] md:translate-x-0 ${
          isMobile ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        }`}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 mb-4">
          <Link to="/" className="flex items-center" onClick={onMobileClose}>
            <Logo 
              size={isActuallyCollapsed ? "md" : "lg"} 
              hideText={isActuallyCollapsed} 
              className="transition-all duration-300"
            />
          </Link>
        </div>

        {/* Navigation Group */}
        <div className="px-4 mb-8 flex-1 overflow-y-auto">
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 px-2 ${isActuallyCollapsed ? 'hidden' : ''}`}>
             Main Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onMobileClose}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative ${
                    isActive
                      ? 'bg-primary-600/10 text-white shadow-sm'
                      : 'hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute left-0 w-1 h-5 bg-primary-500 rounded-r-full"
                    />
                  )}
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-primary-400' : 'group-hover:text-primary-400'}`} />
                  {!isActuallyCollapsed && (
                    <span className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>
                      {item.label}
                    </span>
                  )}
                  {isActuallyCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-slate-800">
                      {item.label}
                    </div>
                  )}
                </Link>
              )
            })}

            {adminItem && (
               <Link
                to={adminItem.path}
                onClick={onMobileClose}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                  location.pathname === adminItem.path ? 'bg-primary-600/10 text-white' : 'hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <adminItem.icon className={`w-5 h-5 flex-shrink-0 ${location.pathname === adminItem.path ? 'text-primary-400' : 'group-hover:text-primary-400'}`} />
                {!isActuallyCollapsed && <span className="text-sm font-medium">{adminItem.label}</span>}
              </Link>
            )}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="mt-auto p-4 space-y-4">
          <nav className="space-y-1">
            {bottomItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onMobileClose}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-primary-600/10 text-white' : 'hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-400' : 'group-hover:text-primary-400'}`} />
                  {!isActuallyCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* User Card */}
          <div className={`p-2 bg-slate-900/50 border border-slate-800/50 rounded-2xl ${isActuallyCollapsed ? 'items-center' : ''}`}>
            <div className={`flex items-center gap-3 ${isActuallyCollapsed ? 'justify-center' : ''}`}>
              <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow-lg ring-2 ring-primary-500/20">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              {!isActuallyCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'User'}</p>
                </div>
              )}
            </div>
            
            <div className={`mt-3 flex gap-1 ${isActuallyCollapsed ? 'flex-col' : ''}`}>
              <button
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                {!isActuallyCollapsed && <span className="text-xs font-bold uppercase tracking-wider">Logout</span>}
              </button>
              {!isMobile && (
                <button
                  onClick={onToggle}
                  className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-slate-500 hover:text-primary-400 hover:bg-primary-400/10 transition-all"
                  title={isActuallyCollapsed ? 'Expand' : 'Collapse'}
                >
                  {isActuallyCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  {!isActuallyCollapsed && <span className="text-xs font-bold uppercase tracking-wider">Collapse</span>}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}