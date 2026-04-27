import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppContext } from '../context/AppContext'
import { StatusBadge } from '../components/ui/StatusBadge'
import type { Application } from '../types'

interface ApplicationDetailProps {
  onEdit: (app: Application) => void
}

export function ApplicationDetail({ onEdit }: ApplicationDetailProps) {
  const { id } = useParams()
  const { applications } = useAppContext()
  
  const app = applications.find(a => a.id === id)

  if (!app) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Application not found</h2>
          <Link to="/applications" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">← Back to Applications</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/applications" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{app.company}</h1>
          <p className="text-slate-600 dark:text-slate-400">{app.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Application Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-slate-500">Status</span>
                <div className="mt-1"><StatusBadge status={app.status} /></div>
              </div>
              <div>
                <span className="text-sm text-slate-500">Source</span>
                <p className="mt-1 text-slate-900 dark:text-white">{app.source}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Applied Date</span>
                <p className="mt-1 text-slate-900 dark:text-white">{new Date(app.appliedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Last Updated</span>
                <p className="mt-1 text-slate-900 dark:text-white">{new Date(app.lastUpdated).toLocaleDateString()}</p>
              </div>
              {app.salary && (
                <div>
                  <span className="text-sm text-slate-500">Salary</span>
                  <p className="mt-1 text-slate-900 dark:text-white">${app.salary.toLocaleString()}</p>
                </div>
              )}
              {app.location && (
                <div>
                  <span className="text-sm text-slate-500">Location</span>
                  <p className="mt-1 text-slate-900 dark:text-white">{app.location}</p>
                </div>
              )}
            </div>
            {app.jobUrl && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                  <ExternalLink className="w-4 h-4" />
                  View Job Posting
                </a>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Timeline</h2>
            <div className="space-y-4">
              {app.timeline.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary-500" />
                    {index < app.timeline.length - 1 && <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700" />}
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-slate-900 dark:text-white">{event.stage}</p>
                    <p className="text-sm text-slate-500">{new Date(event.date).toLocaleDateString()}</p>
                    {event.notes && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{event.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Pipeline</h2>
            <div className="space-y-2">
              {app.customStages.map((stage, index) => (
                <div key={index} className={`p-3 rounded-lg text-sm font-medium ${index === app.currentStageIndex ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : index < app.currentStageIndex ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {stage}
                </div>
              ))}
            </div>
          </motion.div>

          {app.notes && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Notes</h2>
              <p className="text-slate-600 dark:text-slate-400">{app.notes}</p>
            </motion.div>
          )}

          <button onClick={() => onEdit(app)} className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
            Edit Application
          </button>
        </div>
      </div>
    </div>
  )
}