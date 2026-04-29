import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  Clock, 
  Plus, 
  Minus, 
  Edit3,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Scale
} from 'lucide-react'
import { motion } from 'framer-motion'
import { offersApi } from '../services/api'
import { EditOfferModal } from '../components/EditOfferModal'
import type { Offer } from '../types'

export function OfferComparison() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [expandedPros, setExpandedPros] = useState<Record<string, boolean>>({})
  const [expandedCons, setExpandedCons] = useState<Record<string, boolean>>({})

  const loadOffers = async () => {
    try {
      setLoading(true)
      const data = await offersApi.list()
      setOffers(data)
    } catch (error) {
      console.error('Failed to load offers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOffers()
  }, [loadOffers])

  const handleUpdateOffer = async (id: string, updates: Partial<Offer>) => {
    const updated = await offersApi.update(id, updates)
    setOffers(prev => prev.map(o => o.id === id ? updated : o))
  }

  const openEditModal = (offer: Offer) => {
    setSelectedOffer(offer)
    setEditModalOpen(true)
  }

  const togglePros = (offerId: string) => {
    setExpandedPros(prev => ({ ...prev, [offerId]: !prev[offerId] }))
  }

  const toggleCons = (offerId: string) => {
    setExpandedCons(prev => ({ ...prev, [offerId]: !prev[offerId] }))
  }

  const allOffers = useMemo(() => offers, [offers])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Analyzing Offers</p>
      </div>
    )
  }

  if (allOffers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
           <Scale className="w-10 h-10 text-slate-300 dark:text-slate-700" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Offers Logged</h2>
        <p className="text-slate-500 mt-2 mb-8 max-w-sm mx-auto font-medium">Capture your wins. Once you receive an offer, it will appear here for comparison.</p>
        <Link 
          to="/applications" 
          className="btn-primary py-3 px-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
        >
          Explore Funnel
          <ArrowLeft className="w-4 h-4 rotate-180" />
        </Link>
      </div>
    )
  }
  
  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-widest mb-2"
          >
            <Scale className="w-4 h-4" />
            <span>Decision Intelligence</span>
          </motion.div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Offer Benchmarking</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">Evaluating {allOffers.length} potential career paths.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {allOffers.map((offer, idx) => {
          const prosExpanded = expandedPros[offer.id] ?? true // default expanded for premium feel
          const consExpanded = expandedCons[offer.id] ?? false
          
          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card group overflow-hidden border-2 border-transparent hover:border-primary-500/50 transition-all duration-500"
            >
              {/* Card Header */}
              <div className="p-8 pb-0">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-xl text-slate-400 border border-slate-100 dark:border-slate-800 shadow-inner group-hover:scale-110 transition-transform">
                      {offer.applicationCompany?.charAt(0) ?? '-'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{offer.applicationCompany}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">{offer.applicationRole}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Base Salary</span>
                    <span className="text-3xl font-black text-primary-500 tabular-nums leading-none">
                      ${offer.baseSalary?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-2 mb-2">
                       <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incentives</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {offer.bonus ? `$${offer.bonus.toLocaleString()} Bonus` : 'No Bonus'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-2 mb-2">
                       <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equity</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {offer.equity || 'None'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-2 mb-2">
                       <Calendar className="w-3.5 h-3.5 text-slate-500" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Date</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {offer.startDate ? new Date(offer.startDate).toLocaleDateString() : 'TBD'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-2 mb-2">
                       <Clock className="w-3.5 h-3.5 text-pink-500" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Decision By</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {offer.deadline ? new Date(offer.deadline).toLocaleDateString() : 'Rolling'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {/* Pros Section */}
                  <div className="space-y-2">
                    <button
                      onClick={() => togglePros(offer.id)}
                      className="w-full flex items-center justify-between py-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-500/80 hover:text-emerald-500 transition-colors"
                    >
                      <span>Advantages ({offer.pros?.length || 0})</span>
                      {prosExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </button>
                    
                    {prosExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex flex-wrap gap-2"
                      >
                        {offer.pros && offer.pros.length > 0 ? (
                          offer.pros.map((pro, i) => (
                            <span key={i} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold border border-emerald-100/50 dark:border-emerald-900/30">
                              {pro}
                            </span>
                          ))
                        ) : (
                          <p className="text-[10px] font-bold text-slate-400 uppercase italic">No advantages specified</p>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Cons Section */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => toggleCons(offer.id)}
                      className="w-full flex items-center justify-between py-2 text-xs font-black uppercase tracking-[0.2em] text-pink-500/80 hover:text-pink-500 transition-colors"
                    >
                      <span>Considerations ({offer.cons?.length || 0})</span>
                      {consExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </button>
                    
                    {consExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex flex-wrap gap-2"
                      >
                        {offer.cons && offer.cons.length > 0 ? (
                          offer.cons.map((con, i) => (
                            <span key={i} className="px-3 py-1.5 bg-pink-50 dark:bg-pink-900/10 text-pink-600 dark:text-pink-400 rounded-xl text-xs font-bold border border-pink-100/50 dark:border-pink-900/30">
                              {con}
                            </span>
                          ))
                        ) : (
                          <p className="text-[10px] font-bold text-slate-400 uppercase italic">No considerations logged</p>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <Link
                  to={`/applications/${offer.applicationId}`}
                  className="flex-1 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-center flex items-center justify-center gap-2 group/link"
                >
                  Inspect Case
                  <ChevronRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => openEditModal(offer)}
                  className="flex-1 py-3 px-4 bg-slate-900 dark:bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 dark:shadow-primary-500/20"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Terms
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      <EditOfferModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        offer={selectedOffer}
        onUpdate={handleUpdateOffer}
      />
    </div>
  )
}