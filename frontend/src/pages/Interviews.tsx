import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Video } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppContext } from '../context/AppContext'
import type { Application } from '../types'

export function Interviews() {
  const { applications } = useAppContext()

  const interviews = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const withDates = applications.filter((app) => app.interviewDate)
    const upcoming = withDates
      .filter((app) => new Date(app.interviewDate!) >= today)
      .sort(
        (a, b) =>
          new Date(a.interviewDate!).getTime() -
          new Date(b.interviewDate!).getTime(),
      )
    const past = withDates
      .filter((app) => new Date(app.interviewDate!) < today)
      .sort(
        (a, b) =>
          new Date(b.interviewDate!).getTime() -
          new Date(a.interviewDate!).getTime(),
      )
    return { upcoming, past }
  }, [applications])

  const renderInterviewCard = (app: Application, index: number) => {
    const date = new Date(app.interviewDate!)
    const isToday = new Date().toDateString() === date.toDateString()
    return (
      <motion.div
        key={app.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border ${isToday ? 'border-primary-500 dark:border-primary-500 ring-1 ring-primary-500' : 'border-slate-200 dark:border-slate-800'} p-5 hover:shadow-md transition-shadow`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">{app.company.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">{app.company}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{app.role}</p>
            </div>
          </div>
          {isToday && (
            <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 text-xs font-bold px-2.5 py-1 rounded-full">
              TODAY
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-medium">
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Time TBD</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
            <Video className="w-4 h-4 text-slate-400" />
            <span>{app.customStages[app.currentStageIndex]}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Link to={`/applications/${app.id}`} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700">
            View Details →
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Interviews</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Manage your upcoming and past interviews</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-500" />
          Upcoming Interviews
        </h2>
        {interviews.upcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.upcoming.map((app, i) => renderInterviewCard(app, i))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No upcoming interviews</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Keep applying! Your next interview is just around the corner.</p>
          </div>
        )}
      </div>

      {interviews.past.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Past Interviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
            {interviews.past.map((app, i) => renderInterviewCard(app, i))}
          </div>
        </div>
      )}
    </div>
  )
}