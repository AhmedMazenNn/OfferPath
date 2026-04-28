import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, DollarSign, MapPin, Calendar, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { offersApi } from '../services/api'
import type { Offer } from '../types'

export function OfferComparison() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOffers()
  }, [])

  const loadOffers = async () => {
    try {
      setLoading(true)
      const data = await offersApi.list({ status: 'pending' })
      setOffers(data)
    } catch (error) {
      console.error('Failed to load offers:', error)
    } finally {
      setLoading(false)
    }
  }

  const allOffers = useMemo(() => offers, [offers])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Loading offers...</p>
      </div>
    )
  }

  if (allOffers.length === 0) {
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
        <p className="text-slate-600 dark:text-slate-400">Comparing {allOffers.length} offer{allOffers.length > 1 ? 's' : ''}</p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400"></th>
              {allOffers.map(offer => (
                <th key={offer.id} className="px-4 py-3 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">{offer.applicationCompany?.charAt(0) || '?'}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{offer.applicationCompany || 'Unknown'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{offer.applicationRole || 'Unknown Role'}</p>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Base Salary
                </div>
              </td>
              {allOffers.map(offer => (
                <td key={offer.id} className="px-4 py-3">
                  <span className="text-slate-900 dark:text-white font-semibold">
                    ${offer.baseSalary?.toLocaleString() || 'N/A'}
                    <span className="text-sm font-normal text-slate-500">/{offer.currency || 'USD'}</span>
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Bonus
                </div>
              </td>
              {allOffers.map(offer => (
                <td key={offer.id} className="px-4 py-3 text-slate-900 dark:text-white">
                  {offer.bonus ? `$${offer.bonus.toLocaleString()}` : 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Equity
                </div>
              </td>
              {allOffers.map(offer => (
                <td key={offer.id} className="px-4 py-3 text-slate-900 dark:text-white">
                  {offer.equity || 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </div>
              </td>
              {allOffers.map(offer => {
                // Get location from the linked application
                return (
                  <td key={offer.id} className="px-4 py-3 text-slate-900 dark:text-white">
                    {offer.applicationCompany || 'N/A'}
                  </td>
                )
              })}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </div>
              </td>
              {allOffers.map(offer => (
                <td key={offer.id} className="px-4 py-3 text-slate-900 dark:text-white">
                  {offer.startDate ? new Date(offer.startDate).toLocaleDateString() : 'TBD'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Deadline
                </div>
              </td>
              {allOffers.map(offer => (
                <td key={offer.id} className="px-4 py-3 text-slate-900 dark:text-white">
                  {offer.deadline ? new Date(offer.deadline).toLocaleDateString() : 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Benefits</td>
              {allOffers.map(offer => (
                <td key={offer.id} className="px-4 py-3">
                  <div className="space-y-1">
                    {offer.benefits?.slice(0, 3).map((benefit, i) => (
                      <span key={i} className="inline-block px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded mr-1">
                        {benefit}
                      </span>
                    ))}
                    {(offer.benefits?.length || 0) > 3 && (
                      <span className="text-xs text-slate-500">+{(offer.benefits?.length || 0) - 3} more</span>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Offer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allOffers.map(offer => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{offer.applicationCompany}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{offer.applicationRole}</p>
              </div>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                ${offer.baseSalary?.toLocaleString()}
              </span>
            </div>
            {offer.notes && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{offer.notes}</p>
            )}
            <Link
              to={`/applications/${offer.applicationId}`}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View application details →
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
