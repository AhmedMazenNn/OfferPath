import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Trash2, Edit2, CalendarPlus, Filter, Briefcase, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppContext } from '../context/AppContext'
import { ScheduleInterviewModal } from '../components/ScheduleInterviewModal'
import { StatusBadge } from '../components/ui/StatusBadge'
import type { ApplicationSource, Application } from '../types'

interface ApplicationsProps {
  onEdit: (app: Application) => void
  onSelect: (id: string) => void
}

export function Applications({ onEdit, onSelect }: ApplicationsProps) {
  const { applications, applicationsLoading, deleteApplication } = useAppContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<ApplicationSource | 'all'>('all')
  const [scheduleModalApp, setScheduleModalApp] = useState<Application | null>(null)

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.role.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSource = sourceFilter === 'all' || app.source === sourceFilter
      return matchesSearch && matchesSource
    })
  }, [applications, searchQuery, sourceFilter])

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this application?')) {
      await deleteApplication(id)
    }
  }

  if (applicationsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Applications</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-widest mb-2"
          >
            <Briefcase className="w-4 h-4" />
            <span>Management</span>
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Applications
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-md font-medium">
            Review and organize your active job hunting funnel.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass dark:bg-slate-900/50 p-2 rounded-2xl flex flex-col md:flex-row gap-2 border border-slate-200 dark:border-slate-800"
      >
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/50 border border-transparent focus:border-primary-500/30 rounded-xl text-sm transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-2 px-2">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Source:</span>
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as ApplicationSource | 'all')}
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/20 min-w-[140px]"
          >
            <option value="all">All Sources</option>
            <option value="LinkedIn Easy Apply">LinkedIn</option>
            <option value="Company Site">Company Site</option>
            <option value="Referral">Referral</option>
            <option value="Job Board">Job Board</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </motion.div>

      {/* Applications Data Grid/Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Desktop Table View */}
        <div className="card overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Company & Role</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Applied</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Source</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredApplications.map((app, index) => (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group hover:bg-slate-50/50 dark:hover:bg-primary-500/5 transition-all duration-300"
                  >
                    <td className="px-6 py-5">
                      <Link
                        to={`/applications/${app.id}`}
                        className="flex items-center gap-4 cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-primary-600 group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                          {app.company.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                             <span className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
                              {app.company}
                            </span>
                            <ChevronRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                          </div>
                          <p className="text-xs text-slate-500 font-medium truncate">{app.role}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                          {new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                        {app.source}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={app.status || 'applied'} />
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          {(app.status || '').toLowerCase() === 'interview' && (
                            <button
                              onClick={e => { e.preventDefault(); e.stopPropagation(); setScheduleModalApp(app) }}
                              className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-100 dark:hover:bg-violet-900/40 rounded-xl transition-all"
                            >
                              <CalendarPlus className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(app); onSelect(app.id) }}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-xl transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(e, app.id) }}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile List View */}
        <div className="space-y-4 md:hidden">
          {filteredApplications.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card p-4"
            >
              <Link to={`/applications/${app.id}`} className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center font-black text-slate-400">
                  {app.company.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">{app.company}</h3>
                  <p className="text-xs text-slate-500 truncate">{app.role}</p>
                </div>
                <StatusBadge status={app.status || 'applied'} />
              </Link>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applied On</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {new Date(app.appliedDate).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.preventDefault(); onEdit(app); onSelect(app.id) }}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); handleDelete(e, app.id) }}
                    className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 mt-4">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 transition-transform hover:rotate-12">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No applications found</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1 font-medium">Try adjusting your filters or search keywords.</p>
          </div>
        )}
      </motion.div>

      {/* Schedule Interview Modal */}
      {scheduleModalApp && (
        <ScheduleInterviewModal
          isOpen={true}
          onClose={() => setScheduleModalApp(null)}
          applicationId={scheduleModalApp.id}
          company={scheduleModalApp.company}
          role={scheduleModalApp.role}
          onScheduled={() => setScheduleModalApp(null)}
        />
      )}
    </div>
  )
}

