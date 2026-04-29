import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Monitor,
  Building,
  CalendarPlus,
  AlertCircle,
  ArrowRight,
  User,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { interviewsApi } from '../services/api'
import { useAppContext } from '../context/AppContext'
import { ScheduleInterviewModal } from '../components/ScheduleInterviewModal'
import type { Interview, Application } from '../types'

export function Interviews() {
  const { applications } = useAppContext()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming')
  const [scheduleModalApp, setScheduleModalApp] = useState<Application | null>(null)

  const hasAuthToken = () => !!localStorage.getItem('offerpath_token')

  const loadInterviews = useCallback(async () => {
    if (!hasAuthToken()) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await interviewsApi.list()
      setInterviews(data)
    } catch (error) {
      console.error('Failed to load interviews:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!hasAuthToken()) return
    loadInterviews()
  }, [])

  // Apps in Interview stage that haven't had any interview scheduled yet
  const scheduledAppIds = new Set(interviews.map(i => i.applicationId))
  const awaitingSchedule = applications.filter(app => {
    const stage = app.customStages?.[app.currentStageIndex ?? 0] || ''
    return stage.toLowerCase() === 'interview' && !scheduledAppIds.has(app.id)
  })

  const upcoming = interviews.filter(i => new Date(i.scheduledDate) >= new Date())
  const past = interviews.filter(i => new Date(i.scheduledDate) < new Date())
  const displayedInterviews =
    filter === 'upcoming' ? upcoming : filter === 'past' ? past : interviews

  const renderInterviewCard = (interview: Interview, index: number) => {
    const date = new Date(interview.scheduledDate)
    const isToday = new Date().toDateString() === date.toDateString()
    const isRemote = interview.isRemote !== false

    return (
      <motion.div
        key={interview.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`card group group/card hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${
          isToday ? 'ring-2 ring-primary-500/50 shadow-xl shadow-primary-500/10' : ''
        }`}
      >
        <div className="p-6 relative overflow-hidden">
          {/* Subtle Glow for Today */}
          {isToday && (
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
          )}

          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover/card:bg-primary-600 group-hover/card:text-white transition-all transform group-hover/card:rotate-6">
                {interview.applicationCompany?.charAt(0) || '?'}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white truncate">
                  {interview.applicationCompany || 'Unknown'}
                </h3>
                <p className="text-xs text-slate-500 font-medium truncate">
                  {interview.applicationRole || 'Unknown Role'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              {isToday && (
                <span className="animate-pulse bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary-200 dark:border-primary-500/30">
                  Today
                </span>
              )}
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                isRemote 
                  ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' 
                  : 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20'
              }`}>
                {isRemote ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                {isRemote ? 'Remote' : 'On-site'}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                {interview.interviewType}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Date</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Time</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
          </div>

          {(interview.location || interview.meetingLink) && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl mb-6">
               <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                  {isRemote ? <Monitor className="w-4 h-4 text-primary-500" /> : <Building className="w-4 h-4 text-primary-500" />}
               </div>
               <div className="min-w-0 flex-1">
                 {interview.meetingLink ? (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline underline-offset-4 truncate block"
                    >
                      Join Meeting Space
                    </a>
                 ) : (
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate block">
                      {interview.location}
                    </span>
                 )}
               </div>
            </div>
          )}

          <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link
              to={`/applications/${interview.applicationId}`}
              className="text-xs font-bold text-slate-500 hover:text-primary-600 uppercase tracking-widest flex items-center gap-1 group/link transition-colors"
            >
              View Context
              <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
            </Link>
            {interview.interviewerName && (
              <div className="flex items-center gap-2 text-slate-400">
                <User className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase">{interview.interviewerName}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Agenda</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-widest mb-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Agenda</span>
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Interviews</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-md font-medium">
            Manage your schedule and prepare for upcoming sessions.
          </p>
        </div>
      </div>

      {/* Awaiting Schedule Alerts */}
      <AnimatePresence>
        {awaitingSchedule.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-primary-600 rounded-3xl p-8 text-white shadow-2xl shadow-primary-500/20 relative overflow-hidden group"
          >
            {/* Decorative Background */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">
                    Pending Schedule
                  </h2>
                  <p className="text-white/80 font-medium">
                    You have {awaitingSchedule.length} application{awaitingSchedule.length !== 1 ? 's' : ''} waiting to be scheduled for interviews.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {awaitingSchedule.slice(0, 3).map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/20 transition-all cursor-pointer group/item"
                    onClick={() => setScheduleModalApp(app)}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-white text-primary-600 rounded-xl flex items-center justify-center font-black">
                        {app.company.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm truncate">{app.company}</h3>
                        <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider truncate">{app.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 group-hover/item:text-white transition-colors">Click to Schedule</span>
                       <CalendarPlus className="w-4 h-4 group-hover/item:scale-110 transition-transform" />
                    </div>
                  </motion.div>
                ))}
                {awaitingSchedule.length > 3 && (
                   <div className="flex items-center justify-center p-4 border border-white/10 border-dashed rounded-2xl hover:bg-white/5 transition-colors cursor-pointer">
                      <span className="text-xs font-bold uppercase tracking-widest">+{awaitingSchedule.length - 3} More Pending</span>
                   </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scheduled Interviews Feed */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-1.5 h-6 bg-primary-600 rounded-full" />
            Agenda Feed
          </h2>
          
          <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            {(['upcoming', 'past', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  filter === f
                    ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {f}
                <span className="ml-2 py-0.5 px-1.5 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-[10px]">
                  {f === 'upcoming' ? upcoming.length : f === 'past' ? past.length : interviews.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {displayedInterviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedInterviews.map((interview, i) => renderInterviewCard(interview, i))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
               <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Clear Schedule</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-xs font-medium">
              You have no {filter === 'all' ? '' : filter} interviews at the moment. 
              {filter === 'upcoming' ? ' Time to prepare for the next hunt!' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {scheduleModalApp && (
        <ScheduleInterviewModal
          isOpen={true}
          onClose={() => setScheduleModalApp(null)}
          applicationId={scheduleModalApp.id}
          company={scheduleModalApp.company}
          role={scheduleModalApp.role}
          onScheduled={() => {
            setScheduleModalApp(null)
            loadInterviews()
          }}
        />
      )}
    </div>
  )
}

