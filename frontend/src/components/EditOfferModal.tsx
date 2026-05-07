import React, { useEffect, useState } from 'react'
import { 
  X, 
  Plus, 
  DollarSign, 
  Calendar, 
  FileText,
  Save,
  CheckCircle2,
  XCircle,
  Layout
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Offer } from '../types'

interface EditOfferModalProps {
  isOpen: boolean
  onClose: () => void
  offer: Offer | null
  onUpdate: (id: string, updates: Partial<Offer>) => Promise<void>
}

export function EditOfferModal({
  isOpen,
  onClose,
  offer,
  onUpdate,
}: EditOfferModalProps) {
  const [formData, setFormData] = useState<Partial<Offer>>(() => {
    if (offer) {
      return {
        baseSalary: offer.baseSalary,
        currency: offer.currency,
        bonus: offer.bonus,
        equity: offer.equity,
        benefits: offer.benefits || [],
        startDate: offer.startDate,
        deadline: offer.deadline,
        status: offer.status,
        notes: offer.notes,
      }
    }
    return {}
  })
  const [pros, setPros] = useState<string[]>(() => offer?.pros || [])
  const [cons, setCons] = useState<string[]>(() => offer?.cons || [])
  const [newPro, setNewPro] = useState('')
  const [newCon, setNewCon] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen && offer) {
      setFormData({
        baseSalary: offer.baseSalary,
        currency: offer.currency,
        bonus: offer.bonus,
        equity: offer.equity,
        benefits: offer.benefits || [],
        startDate: offer.startDate,
        deadline: offer.deadline,
        status: offer.status,
        notes: offer.notes,
      })
      setPros(offer.pros || [])
      setCons(offer.cons || [])
    }
  }, [isOpen, offer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (offer) {
      setSaving(true)
      try {
        await onUpdate(offer.id, {
          ...formData,
          pros,
          cons,
        })
        onClose()
      } finally {
        setSaving(false)
      }
    }
  }

  const handleChange = (field: keyof Offer, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addPro = () => {
    if (newPro.trim()) {
      setPros([...pros, newPro.trim()])
      setNewPro('')
    }
  }

  const removePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index))
  }

  const addCon = () => {
    if (newCon.trim()) {
      setCons([...cons, newCon.trim()])
      setNewCon('')
    }
  }

  const removeCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index))
  }

  return (
    <AnimatePresence>
      {isOpen && offer && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100]"
          />

          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 md:rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 pointer-events-auto overflow-hidden rounded-t-[2.5rem] md:rounded-b-[2.5rem]"
            >
              {/* Header */}
              <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/50 backdrop-blur-xl relative z-10">
                <div className="min-w-0">
                   <div className="flex items-center gap-2 text-primary-500 font-black text-[10px] uppercase tracking-widest mb-1">
                      <Layout className="w-3.5 h-3.5" />
                      <span>Financial Architecture</span>
                   </div>
                   <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                     Refine Offer: {offer.applicationCompany}
                   </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 md:p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 rounded-xl md:rounded-2xl flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="px-6 md:p-10 py-8 overflow-y-auto flex-1 custom-scrollbar">
                <form id="edit-offer-form" onSubmit={handleSubmit} className="space-y-12">
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    {/* Left Column: Remuneration */}
                    <div className="space-y-10">
                       <section>
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                             <DollarSign className="w-3.5 h-3.5" />
                             Compensation Package
                          </h3>
                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Currency</label>
                                <select
                                  value={formData.currency || 'USD'}
                                  onChange={(e) => handleChange('currency', e.target.value)}
                                  className="input-base"
                                >
                                  <option value="USD">USD</option>
                                  <option value="EUR">EUR</option>
                                  <option value="GBP">GBP</option>
                                  <option value="CAD">CAD</option>
                                  <option value="EGP">EGP</option>
                                </select>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Salary</label>
                                <input
                                  type="number"
                                  value={formData.baseSalary || ''}
                                  onChange={(e) => handleChange('baseSalary', parseInt(e.target.value))}
                                  className="input-base"
                                  placeholder="0"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Performance Bonus</label>
                                <input
                                  type="number"
                                  value={formData.bonus || ''}
                                  onChange={(e) => handleChange('bonus', parseInt(e.target.value) || undefined)}
                                  className="input-base"
                                  placeholder="Annual % or amount"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Equity & Stock</label>
                                <input
                                  type="text"
                                  value={formData.equity || ''}
                                  onChange={(e) => handleChange('equity', e.target.value)}
                                  className="input-base"
                                  placeholder="0.1% / $100k options"
                                />
                             </div>
                          </div>
                       </section>

                       <section>
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                             <Calendar className="w-3.5 h-3.5" />
                             Chronology & Status
                          </h3>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deployment Date</label>
                                  <input
                                    type="date"
                                    value={formData.startDate?.split('T')[0] || ''}
                                    onChange={(e) => handleChange('startDate', e.target.value)}
                                    className="input-base"
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Decision Deadline</label>
                                  <input
                                    type="date"
                                    value={formData.deadline?.split('T')[0] || ''}
                                    onChange={(e) => handleChange('deadline', e.target.value)}
                                    className="input-base"
                                  />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocal Status</label>
                               <select
                                 value={formData.status || 'pending'}
                                 onChange={(e) => handleChange('status', e.target.value)}
                                 className="input-base"
                               >
                                 <option value="pending">Pending Review</option>
                                 <option value="negotiating">Active Negotiation</option>
                                 <option value="accepted">Accepted / Finalized</option>
                                 <option value="declined">Declined / Closed</option>
                               </select>
                            </div>
                          </div>
                       </section>
                    </div>

                    {/* Right Column: Narrative Analysis */}
                    <div className="space-y-10">
                       <section>
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                             <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                             Strategic Advantages
                          </h3>
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {pros.map((pro, index) => (
                                <motion.span
                                  layout
                                  key={index}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-xs font-black uppercase tracking-tight"
                                >
                                  {pro}
                                  <button type="button" onClick={() => removePro(index)} className="hover:text-emerald-900 dark:hover:text-white transition-colors">
                                    <X className="w-3 h-3" />
                                  </button>
                                </motion.span>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newPro}
                                onChange={(e) => setNewPro(e.target.value)}
                                placeholder="Add advantage..."
                                className="input-base !py-2.5 !text-xs italic"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
                              />
                              <button type="button" onClick={addPro} className="p-2.5 bg-emerald-500 text-white rounded-xl hover:scale-110 active:scale-95 transition-all">
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                       </section>

                       <section>
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                             <XCircle className="w-3.5 h-3.5 text-rose-500" />
                             Critical Risks
                          </h3>
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {cons.map((con, index) => (
                                <motion.span
                                  layout
                                  key={index}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-xs font-black uppercase tracking-tight"
                                >
                                  {con}
                                  <button type="button" onClick={() => removeCon(index)} className="hover:text-rose-900 dark:hover:text-white transition-colors">
                                    <X className="w-3 h-3" />
                                  </button>
                                </motion.span>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newCon}
                                onChange={(e) => setNewCon(e.target.value)}
                                placeholder="Add risk factor..."
                                className="input-base !py-2.5 !text-xs italic"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
                              />
                              <button type="button" onClick={addCon} className="p-2.5 bg-rose-500 text-white rounded-xl hover:scale-110 active:scale-95 transition-all">
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                       </section>

                       <section>
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                             <FileText className="w-3.5 h-3.5" />
                             Confidential Notes
                          </h3>
                          <textarea
                             value={formData.notes || ''}
                             onChange={(e) => handleChange('notes', e.target.value)}
                             rows={3}
                             className="input-base resize-none py-4"
                             placeholder="Internal appraisal..."
                          />
                       </section>
                    </div>

                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="px-6 md:px-10 py-6 md:py-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 backdrop-blur-xl flex flex-col-reverse md:flex-row items-center justify-end gap-3 md:gap-4 relative z-10">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full md:w-auto px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  form="edit-offer-form"
                  disabled={saving}
                  className="w-full md:w-auto btn-primary px-10 py-3.5 text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Syncing...' : 'Seal Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}