import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  ExternalLink, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Briefcase, 
  CalendarPlus, 
  History,
  Info,
  ChevronRight,
  GitBranch,
  Edit3
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppContext } from '../context/AppContext'
import { ScheduleInterviewModal } from '../components/ScheduleInterviewModal'
import { StatusBadge } from '../components/ui/StatusBadge'
import type { Application } from '../types'

interface ApplicationDetailProps {
  onEdit: (app: Application) => void
}

export function ApplicationDetail({ onEdit }: ApplicationDetailProps) {
  const { id } = useParams()
  const { applications } = useAppContext()
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  
  const app = applications.find(a => a.id === id) || null

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
           <Info className="w-10 h-10 text-slate-300 dark:text-slate-700" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Application not found</h2>
        <p className="text-slate-500 mt-2 mb-8 max-w-sm mx-auto font-medium">The record you are looking for might have been moved or deleted.</p>
        <Link 
          to="/applications" 
          className="btn-secondary py-2 px-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Funnel
        </Link>
      </div>
    )
  }

  const currentStage = app.customStages?.[app.currentStageIndex || 0] || 'Applied'

  return (
    <div className="space-y-8 pb-10">
      {/* breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
        <Link to="/applications" className="hover:text-primary-500 transition-colors">Applications</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-900 dark:text-white">{app.company}</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center font-black text-2xl text-slate-400 shadow-xl"
           >
              {app.company.charAt(0)}
           </motion.div>
           <div>
             <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">
               {app.company}
             </h1>
             <div className="flex items-center gap-3">
               <span className="text-lg font-bold text-slate-500 dark:text-slate-400">{app.role}</span>
               <StatusBadge status={app.status || 'applied'} />
             </div>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <button
              onClick={() => onEdit(app)}
              className="btn-secondary py-2.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
           >
              <Edit3 className="w-4 h-4" />
              Edit Record
           </button>
           {currentStage.toLowerCase() === 'interview' && (
              <button
                onClick={() => setScheduleModalOpen(true)}
                className="btn-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-primary-500/20"
              >
                <CalendarPlus className="w-4 h-4" />
                Schedule
              </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8"
          >
            <div className="flex items-center gap-3 mb-8">
               <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
               <h2 className="text-xl font-bold text-slate-900 dark:text-white">Position Intel</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4 group">
                 <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Briefcase className="w-5 h-5 text-primary-500" />
                 </div>
                 <div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Status</span>
                   <p className="text-base font-bold text-slate-900 dark:text-white uppercase">{currentStage}</p>
                 </div>
              </div>

              <div className="flex items-start gap-4 group">
                 <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <ExternalLink className="w-5 h-5 text-indigo-500" />
                 </div>
                 <div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Source</span>
                   <p className="text-base font-bold text-slate-900 dark:text-white">{app.source}</p>
                 </div>
              </div>

              <div className="flex items-start gap-4 group">
                 <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Calendar className="w-5 h-5 text-slate-400" />
                 </div>
                 <div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Applied</span>
                   <p className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                     {new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                   </p>
                 </div>
              </div>

              {app.location && (
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Location</span>
                    <p className="text-base font-bold text-slate-900 dark:text-white">{app.location}</p>
                  </div>
                </div>
              )}

              {app.salary && (
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Comp Target</span>
                    <p className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                      ${app.salary?.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {app.jobUrl && (
              <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={app.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-3 px-6 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-800"
                >
                  <ExternalLink className="w-4 h-4" />
                  Access Job Directory
                </a>
              </div>
            )}
          </motion.div>

          {/* Timeline Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-8"
          >
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Timeline Feed</h2>
               </div>
               <History className="w-5 h-5 text-slate-300" />
            </div>
            
            <div className="space-y-0 relative">
              <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800" />
              {(app.timeline || []).length === 0 ? (
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest text-center py-4">No events logged</p>
              ) : (
                (app.timeline || []).map((event, index) => (
                  <div key={event.id || `timeline-${index}`} className="flex gap-6 pb-8 last:pb-0 relative">
                    <div className="flex flex-col items-center relative z-10">
                      <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-4 border-primary-500 shadow-lg" />
                    </div>
                    <div className="flex-1 bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{event.stage}</p>
                        <span className="text-[10px] font-black text-slate-400 tabular-nums uppercase">
                          {new Date(event.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      {event.notes && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">"{event.notes}"</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Pipeline Progress */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <GitBranch className="w-4 h-4" />
               Funnel Progress
            </h2>
            <div className="space-y-4">
              {(app.customStages || []).map((stage, index) => {
                const isActive = index === (app.currentStageIndex || 0)
                const isPast = index < (app.currentStageIndex || 0)
                return (
                  <div
                    key={index}
                    className={`relative p-4 rounded-2xl border transition-all duration-300 ${
                      isActive
                        ? 'bg-primary-500 border-primary-500 text-white shadow-xl shadow-primary-500/20 scale-105 z-10'
                        : isPast
                        ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                       <span className={`text-xs font-black uppercase tracking-tight ${isActive ? 'text-white' : ''}`}>{stage}</span>
                       {isPast && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                       {isActive && <div className="w-2 h-2 rounded-full bg-white animate-ping" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Notes Widget */}
          {app.notes && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6 bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30"
            >
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Internal Notes</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {app.notes}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modals */}
      {scheduleModalOpen && (
        <ScheduleInterviewModal
          isOpen={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          applicationId={app.id}
          company={app.company}
          role={app.role}
          onScheduled={() => setScheduleModalOpen(false)}
        />
      )}
    </div>
  )
}

