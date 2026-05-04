import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Trash2, Edit2, CalendarPlus, Filter, Briefcase, ChevronRight, ArrowUpDown, Calendar, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '../context/AppContext'
import { ScheduleInterviewModal } from '../components/ScheduleInterviewModal'
import { StatusBadge } from '../components/ui/StatusBadge'
import type { ApplicationSource, Application, ApplicationStatus } from '../types'

type SortOption = 'newest' | 'oldest' | 'company-az' | 'company-za' | 'title-az' | 'title-za' | 'status-asc' | 'status-desc'

interface ApplicationsProps {
  onEdit: (app: Application) => void
  onSelect: (id: string) => void
}

export function Applications({ onEdit, onSelect }: ApplicationsProps) {
  const { applications, applicationsLoading, deleteApplication, updateApplication } = useAppContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<ApplicationSource | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [editingDateId, setEditingDateId] = useState<string | null>(null)
  const [scheduleModalApp, setScheduleModalApp] = useState<Application | null>(null)

  const statusOptions: { value: ApplicationStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'applied', label: 'Applied' },
    { value: 'screening', label: 'Screening' },
    { value: 'interview', label: 'Interview' },
    { value: 'offer', label: 'Offer' },
    { value: 'rejected', label: 'Rejected' },
  ]

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest to Oldest' },
    { value: 'oldest', label: 'Oldest to Newest' },
    { value: 'company-az', label: 'Company (A–Z)' },
    { value: 'company-za', label: 'Company (Z–A)' },
    { value: 'title-az', label: 'Title (A–Z)' },
    { value: 'title-za', label: 'Title (Z–A)' },
    { value: 'status-asc', label: 'Status (A–Z)' },
    { value: 'status-desc', label: 'Status (Z–A)' },
  ]

  const uniqueCompanies = useMemo(() => {
    const companies = new Set(applications.map(app => app.company))
    return Array.from(companies).sort()
  }, [applications])

  const filteredApplications = useMemo(() => {
    let result = applications.filter((app) => {
      const matchesSearch =
        searchQuery === '' ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.role.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSource = sourceFilter === 'all' || app.source === sourceFilter
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter
      const matchesDateFrom = !dateFrom || new Date(app.appliedDate) >= new Date(dateFrom)
      const matchesDateTo = !dateTo || new Date(app.appliedDate) <= new Date(dateTo)
      const matchesCompany = !companyFilter || app.company.toLowerCase().includes(companyFilter.toLowerCase())
      return matchesSearch && matchesSource && matchesStatus && matchesDateFrom && matchesDateTo && matchesCompany
    })

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
        case 'oldest':
          return new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime()
        case 'company-az':
          return a.company.localeCompare(b.company)
        case 'company-za':
          return b.company.localeCompare(a.company)
        case 'title-az':
          return a.role.localeCompare(b.role)
        case 'title-za':
          return b.role.localeCompare(a.role)
        case 'status-asc':
          return (a.status || 'applied').localeCompare(b.status || 'applied')
        case 'status-desc':
          return (b.status || 'applied').localeCompare(a.status || 'applied')
        default:
          return 0
      }
    })

    return result
  }, [applications, searchQuery, sourceFilter, statusFilter, sortBy, dateFrom, dateTo, companyFilter])

  const hasActiveFilters = searchQuery || sourceFilter !== 'all' || statusFilter !== 'all' || dateFrom || dateTo || companyFilter

  const clearFilters = () => {
    setSearchQuery('')
    setSourceFilter('all')
    setStatusFilter('all')
    setDateFrom('')
    setDateTo('')
    setCompanyFilter('')
  }

  const handleDateEdit = async (id: string, newDate: string) => {
    await updateApplication(id, { appliedDate: newDate })
    setEditingDateId(null)
  }

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

      {/* Filter & Sort Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
      >
        {/* Primary Row: Search and Sort */}
        <div className="flex flex-col md:flex-row gap-2">
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

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-slate-400 px-2">
              <ArrowUpDown className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/20 min-w-[160px]"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-col md:flex-row gap-2">
          {/* Source Filter */}
          <div className="flex items-center gap-2 px-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Filter className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Source:</span>
            </div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as ApplicationSource | 'all')}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/20 min-w-[120px]"
            >
              <option value="all">All Sources</option>
              <option value="LinkedIn Easy Apply">LinkedIn</option>
              <option value="Company Site">Company Site</option>
              <option value="Referral">Referral</option>
              <option value="Job Board">Job Board</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 px-2">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/20 min-w-[120px]"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2 px-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Date:</span>
            </div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-2 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/20 w-[110px]"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-2 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/20 w-[110px]"
            />
          </div>

          {/* Company Filter */}
          <div className="flex items-center gap-2 px-2">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Company:</span>
            </div>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/20 min-w-[120px]"
            >
              <option value="">All Companies</option>
              {uniqueCompanies.map((company) => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </motion.div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          Showing <span className="text-primary-600 dark:text-primary-400 font-bold">{filteredApplications.length}</span> {filteredApplications.length === 1 ? 'application' : 'applications'}
          {hasActiveFilters && <span className="text-slate-400"> (filtered)</span>}
        </p>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Sorted: {sortOptions.find(s => s.value === sortBy)?.label}
        </span>
      </div>

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
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 cursor-pointer hover:text-primary-500 transition-colors" onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}>
                    <div className="flex items-center gap-1">
                      Applied
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
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
                      <div className="flex items-center gap-2">
                        <AnimatePresence mode="wait">
                          {editingDateId === app.id ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="flex items-center gap-1"
                            >
                              <input
                                type="date"
                                defaultValue={app.appliedDate.split('T')[0]}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const target = e.target as HTMLInputElement
                                    handleDateEdit(app.id, target.value)
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingDateId(null)
                                  }
                                }}
                                onBlur={(e) => handleDateEdit(app.id, e.target.value)}
                                autoFocus
                                className="bg-slate-100 dark:bg-slate-800 border border-primary-500/30 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none w-[130px]"
                              />
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="flex items-center gap-2 cursor-pointer group/date"
                              onClick={() => setEditingDateId(app.id)}
                              title="Click to edit date"
                            >
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                                {new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <Edit2 className="w-3 h-3 text-slate-300 opacity-0 group-hover/date:opacity-100 transition-all hover:text-primary-500" />
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                  <AnimatePresence mode="wait">
                    {editingDateId === app.id ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <input
                          type="date"
                          defaultValue={app.appliedDate.split('T')[0]}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const target = e.target as HTMLInputElement
                              handleDateEdit(app.id, target.value)
                            }
                            if (e.key === 'Escape') {
                              setEditingDateId(null)
                            }
                          }}
                          onBlur={(e) => handleDateEdit(app.id, e.target.value)}
                          autoFocus
                          className="bg-slate-100 dark:bg-slate-800 border border-primary-500/30 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => setEditingDateId(app.id)}
                        title="Click to edit date"
                      >
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {new Date(app.appliedDate).toLocaleDateString()}
                        </span>
                        <Edit2 className="w-3 h-3 text-slate-300 hover:text-primary-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
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

