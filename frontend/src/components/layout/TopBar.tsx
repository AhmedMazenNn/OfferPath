import { Menu, Moon, Sun, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

interface TopBarProps {
  isDarkMode: boolean
  onToggleDarkMode: () => void
  onToggleMobileMenu?: () => void
  onQuickLog?: () => void
}

export function TopBar({
  isDarkMode,
  onToggleDarkMode,
  onToggleMobileMenu,
  onQuickLog,
}: TopBarProps) {
  const { user } = useAppContext()

  return (
    <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
      {/* Mobile Menu & Identity */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-slate-500 hover:text-primary-500 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* User Identity / Settings Link (formerly on the right) */}
        <Link 
          to="/settings"
          className="flex items-center gap-3 p-1 pl-3 pr-1 bg-slate-100 dark:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 rounded-2xl transition-all duration-300 group"
        >
          {!user ? (
             <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center">
               <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
             </div>
          ) : (
            <>
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <span className="text-white font-bold text-[10px]">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start leading-none pr-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {user.name.split(' ')[0]}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Settings</span>
              </div>
            </>
          )}
        </Link>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block" />

        <div className="hidden md:flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">Synchronized</span>
          </div>
        </div>
      </div>

      {/* Actions (Right Side) */}
      <div className="flex items-center gap-4">
        {onQuickLog && (
          <button
            onClick={onQuickLog}
            className="hidden md:flex btn-primary py-2 px-4 text-xs font-bold uppercase tracking-wider gap-2 items-center"
          >
            + New Application
          </button>
        )}
        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 bg-slate-100 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-300"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  )
}