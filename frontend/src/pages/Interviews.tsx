import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Video } from 'lucide-react'
import { motion } from 'framer-motion'
import { interviewsApi } from '../services/api'
import type { Interview } from '../types'

export function Interviews() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming')

  useEffect(() => {
    loadInterviews()
  }, [])

  const loadInterviews = async () => {
    try {
      setLoading(true)
      const data = await interviewsApi.list()
      setInterviews(data)
    } catch (error) {
      console.error('Failed to load interviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const upcoming = interviews.filter(i => new Date(i.scheduledDate) >= new Date())
  const past = interviews.filter(i => new Date(i.scheduledDate) < new Date())

  const displayedInterviews = filter === 'upcoming' ? upcoming : filter === 'past' ? past : interviews

  const renderInterviewCard = (interview: Interview, index: number) => {
    const date = new Date(interview.scheduledDate)
    const isToday = new Date().toDateString() === date.toDateString()
    
    return (
      <motion.div
        key={interview.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow ${
          isToday ? 'border-primary-500 dark:border-primary-500 ring-1 ring-primary-500' : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">
                {interview.applicationCompany?.charAt(0) || '?'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                {interview.applicationCompany || 'Unknown Company'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {interview.applicationRole || 'Unknown Role'}
              </p>
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
            <span>{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({interview.durationMinutes} min)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
            <Video className="w-4 h-4 text-slate-400" />
            <span>{interview.interviewType}</span>
          </div>
        </div>

        {interview.location && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            📍 {interview.location}
          </p>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Link 
            to={`/applications/${interview.applicationId}`} 
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700"
          >
            View Application →
          </Link>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Loading interviews...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Interviews</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Manage your upcoming and past interviews</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['upcoming', 'past', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-2 text-xs">
              ({f === 'upcoming' ? upcoming.length : f === 'past' ? past.length : interviews.length})
            </span>
          </button>
        ))}
      </div>

      {displayedInterviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedInterviews.map((interview, i) => renderInterviewCard(interview, i))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
            No {filter === 'upcoming' ? 'upcoming' : filter === 'past' ? 'past' : ''} interviews
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {filter === 'upcoming' ? 'Keep applying! Your next interview is just around the corner.' : 'No interviews found.'}
          </p>
        </div>
      )}
    </div>
  )
}
