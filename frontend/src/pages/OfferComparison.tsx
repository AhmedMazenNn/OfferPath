import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppContext } from '../context/AppContext'

export function OfferComparison() {
  const { applications } = useAppContext()
  const offers = applications.filter(app => app.status === 'offer')

  if (offers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/applications" className="text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Offers</h1>
            <p className="text-slate-600 dark:text-slate-400">Compare your job offers side by side</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
          <CheckCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No offers yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Keep applying - your offer will appear here!</p>
          <Link to="/applications" className="inline-block mt-4 text-primary-600 hover:text-primary-700">View all applications →</Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Offers</h1>
        <p className="text-slate-600 dark:text-slate-400">Comparing {offers.length} offer{offers.length > 1 ? 's' : ''}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400"></th>
              {offers.map(app => (
                <th key={app.id} className="px-4 py-3 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">{app.company.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{app.company}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{app.role}</p>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Salary</td>
              {offers.map(app => (
                <td key={app.id} className="px-4 py-3">
                  <span className="text-slate-900 dark:text-white font-semibold">${app.salary?.toLocaleString() || 'N/A'}</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Location</td>
              {offers.map(app => (
                <td key={app.id} className="px-4 py-3 text-slate-900 dark:text-white">{app.location || 'N/A'}</td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Applied Date</td>
              {offers.map(app => (
                <td key={app.id} className="px-4 py-3 text-slate-900 dark:text-white">{new Date(app.appliedDate).toLocaleDateString()}</td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Days to Offer</td>
              {offers.map(app => {
                const days = Math.ceil((new Date(app.lastUpdated).getTime() - new Date(app.appliedDate).getTime()) / (1000 * 60 * 60 * 24))
                return (
                  <td key={app.id} className="px-4 py-3 text-slate-900 dark:text-white">{days} days</td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.map(app => (
          <motion.div key={app.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <Link to={`/applications/${app.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">View details →</Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}