import React, { useEffect, useState } from 'react'
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Briefcase, 
  FileText, 
  ChevronUp, 
  ChevronDown,
  Layers
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '../context/AppContext'
import { interviewsApi, offersApi } from '../services/api'
import type { Application, ApplicationSource, Interview, Offer } from '../types'

interface EditApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  application: Application | null
}

export function EditApplicationModal({
  isOpen,
  onClose,
  application,
}: EditApplicationModalProps) {
  const { updateApplication } = useAppContext()
  
  const [formData, setFormData] = useState<Partial<Application>>({})
  const [customStages, setCustomStages] = useState<string[]>(() => {
    if (application?.customStages) return application.customStages
    return []
  })
  const [newStageName, setNewStageName] = useState('')

  // Related records
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'interview' | 'offer'; id: string; label: string } | null>(null)

  useEffect(() => {
    if (isOpen && application) {
      setFormData({
        company: application.company,
        role: application.role,
        jobUrl: application.jobUrl || '',
        source: application.source,
        notes: application.notes || '',
        currentStageIndex: application.currentStageIndex || 0,
      })
      setCustomStages(application.customStages || [])
      
      // Load related data
      const loadRelated = async () => {
        try {
          const ivs = await interviewsApi.list({ application_id: application.id })
          setInterviews(ivs)
        } catch (err) {
          console.error('Failed to load interviews', err)
        }
        try {
          const ofs = await offersApi.listByApplication(application.id)
          setOffers(ofs)
        } catch (err) {
          console.error('Failed to load offers', err)
        }
      }
      loadRelated()
    }
  }, [isOpen, application])

  const handleDeleteInterview = async (id: string) => {
    setIsDeleting(true)
    try {
      await interviewsApi.delete(id)
      setInterviews(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      console.error('Failed to delete interview', err)
    } finally {
      setIsDeleting(false)
      setConfirmDelete(null)
    }
  }

  const handleDeleteOffer = async (id: string) => {
    setIsDeleting(true)
    try {
      await offersApi.delete(id)
      setOffers(prev => prev.filter(o => o.id !== id))
    } catch (err) {
      console.error('Failed to delete offer', err)
    } finally {
      setIsDeleting(false)
      setConfirmDelete(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (application) {
      await updateApplication(application.id, {
        ...formData,
        customStages,
      })
    }
    onClose()
  }

  const handleChange = (field: keyof Application, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddStage = () => {
    if (newStageName.trim()) {
      setCustomStages([...customStages, newStageName.trim()])
      setNewStageName('')
    }
  }

  const handleRemoveStage = (index: number) => {
    if (customStages.length <= 1) return
    const newStages = customStages.filter((_, i) => i !== index)
    setCustomStages(newStages)
    if (formData.currentStageIndex !== undefined) {
      if (formData.currentStageIndex >= newStages.length) {
        handleChange('currentStageIndex', newStages.length - 1)
      } else if (formData.currentStageIndex === index) {
        handleChange('currentStageIndex', Math.max(0, index - 1))
      }
    }
  }

  const handleStageNameChange = (index: number, newName: string) => {
    const newStages = [...customStages]
    newStages[index] = newName
    setCustomStages(newStages)
  }

  const moveStage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newStages = [...customStages]
      const temp = newStages[index]
      newStages[index] = newStages[index - 1]
      newStages[index - 1] = temp
      setCustomStages(newStages)
      if (formData.currentStageIndex === index) {
        handleChange('currentStageIndex', index - 1)
      } else if (formData.currentStageIndex === index - 1) {
        handleChange('currentStageIndex', index)
      }
    } else if (direction === 'down' && index < customStages.length - 1) {
      const newStages = [...customStages]
      const temp = newStages[index]
      newStages[index] = newStages[index + 1]
      newStages[index + 1] = temp
      setCustomStages(newStages)
      if (formData.currentStageIndex === index) {
        handleChange('currentStageIndex', index + 1)
      } else if (formData.currentStageIndex === index + 1) {
        handleChange('currentStageIndex', index)
      }
    }
  }

  const hasRelated = interviews.length > 0 || offers.length > 0

  return (
    <AnimatePresence>
      {isOpen && application && (
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
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 pointer-events-auto"
            >
              {/* Header */}
              <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/50 backdrop-blur-xl relative z-10">
                <div>
                   <div className="flex items-center gap-2 text-primary-500 font-black text-[10px] uppercase tracking-widest mb-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Revising Context</span>
                   </div>
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                     Case File: {application.company}
                   </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 rounded-2xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
                <form id="edit-form" onSubmit={handleSubmit} className="space-y-12">
                  
                  {/* Grid Layout for sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    {/* Left Column: Core Data */}
                    <div className="space-y-10">
                       <section>
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                             <Briefcase className="w-3.5 h-3.5" />
                             Core Intelligence
                          </h3>
                          <div className="space-y-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company</label>
                                <input
                                  type="text"
                                  required
                                  value={formData.company || ''}
                                  onChange={(e) => handleChange('company', e.target.value)}
                                  className="input-base"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Role</label>
                                <input
                                  type="text"
                                  required
                                  value={formData.role || ''}
                                  onChange={(e) => handleChange('role', e.target.value)}
                                  className="input-base"
                                />
                             </div>
                             <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Channel</label>
                                   <select
                                      value={formData.source || 'Other'}
                                      onChange={(e) => handleChange('source', e.target.value as ApplicationSource)}
                                      className="input-base appearance-none"
                                   >
                                      <option value="LinkedIn Easy Apply">LinkedIn Easy Apply</option>
                                      <option value="Company Site">Company Site</option>
                                      <option value="Referral">Referral</option>
                                      <option value="Job Board">Job Board</option>
                                      <option value="Other">Other</option>
                                   </select>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital Link</label>
                                   <input
                                      type="url"
                                      value={formData.jobUrl || ''}
                                      onChange={(e) => handleChange('jobUrl', e.target.value)}
                                      className="input-base"
                                      placeholder="https://..."
                                   />
                                </div>
                             </div>
                          </div>
                       </section>

                       <section>
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                             <FileText className="w-3.5 h-3.5" />
                             Strategic Notes
                          </h3>
                          <textarea
                             value={formData.notes || ''}
                             onChange={(e) => handleChange('notes', e.target.value)}
                             rows={5}
                             className="input-base resize-none py-4"
                             placeholder="Internal observations..."
                          />
                       </section>
                    </div>

                    {/* Right Column: Pipeline & Relations */}
                    <div className="space-y-10">
                       <section className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800/50">
                          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                             <Layers className="w-3.5 h-3.5 text-primary-500" />
                             Funnel Orchestration
                          </h3>
                          
                          <div className="space-y-3 mb-6">
                            {customStages.map((stage, index) => (
                              <div
                                key={index}
                                className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 border-2 ${
                                  formData.currentStageIndex === index 
                                    ? 'bg-white dark:bg-slate-900 border-primary-500 shadow-xl shadow-primary-500/10' 
                                    : 'bg-slate-100/50 dark:bg-slate-800/50 border-transparent'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="currentStage"
                                  checked={formData.currentStageIndex === index}
                                  onChange={() => handleChange('currentStageIndex', index)}
                                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-slate-300"
                                />

                                <input
                                  type="text"
                                  value={stage}
                                  onChange={(e) => handleStageNameChange(index, e.target.value)}
                                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-black text-slate-900 dark:text-white px-0"
                                />

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => moveStage(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 disabled:opacity-20"
                                  >
                                    <ChevronUp className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveStage(index, 'down')}
                                    disabled={index === customStages.length - 1}
                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 disabled:opacity-20"
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveStage(index)}
                                    disabled={customStages.length <= 1}
                                    className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-20 translate-y-[1px]"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                             <input
                                type="text"
                                value={newStageName}
                                onChange={(e) => setNewStageName(e.target.value)}
                                placeholder="Add custom phase..."
                                className="flex-1 input-base !py-2.5 !text-xs"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStage())}
                             />
                             <button
                                type="button"
                                onClick={handleAddStage}
                                disabled={!newStageName.trim()}
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2.5 rounded-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-20"
                             >
                                <Plus className="w-5 h-5" />
                             </button>
                          </div>
                       </section>

                       {hasRelated && (
                          <section className="space-y-6">
                             <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex-shrink-0">Linked Objects</span>
                                <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
                             </div>

                             <div className="space-y-4">
                                {/* Interviews */}
                                {interviews.map(iv => (
                                  <div key={iv.id} className="group flex items-center justify-between p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                                           <Calendar className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <div>
                                           <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{iv.interviewType}</p>
                                           <p className="text-[10px] text-slate-500 font-bold uppercase">{new Date(iv.scheduledDate).toLocaleDateString()}</p>
                                        </div>
                                     </div>
                                     <button
                                        type="button"
                                        onClick={() => setConfirmDelete({ type: 'interview', id: iv.id, label: iv.interviewType })}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                     >
                                        <Trash2 className="w-4 h-4" />
                                     </button>
                                  </div>
                                ))}

                                {/* Offers */}
                                {offers.map(of => (
                                  <div key={of.id} className="group flex items-center justify-between p-4 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                           <DollarSign className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                           <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                              {of.currency} {of.baseSalary?.toLocaleString()} Offer
                                           </p>
                                           <p className="text-[10px] text-slate-500 font-bold uppercase">{of.status}</p>
                                        </div>
                                     </div>
                                     <button
                                        type="button"
                                        onClick={() => setConfirmDelete({ type: 'offer', id: of.id, label: `${of.baseSalary} offer` })}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                     >
                                        <Trash2 className="w-4 h-4" />
                                     </button>
                                  </div>
                                ))}
                             </div>
                          </section>
                       )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer Actions */}
              <div className="px-10 py-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 backdrop-blur-xl flex items-center justify-end gap-4 relative z-10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  form="edit-form"
                  className="btn-primary px-10 py-3.5 text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary-500/20 flex items-center gap-2"
                >
                  <SaveIcon className="w-4 h-4" />
                  Apply Changes
                </button>
              </div>
            </motion.div>
          </div>

          {/* Confirm Delete Sub-Modal */}
          <AnimatePresence>
            {confirmDelete && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[150]"
                />
                <div className="fixed inset-0 flex items-center justify-center z-[160] p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-sm p-8 border border-red-500/20"
                  >
                    <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
                      <AlertTriangle className="w-7 h-7 text-red-500" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Liquidate Object?</h3>
                    <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
                      Confirm permanent erasure of <span className="text-slate-900 dark:text-white font-black underline">"{confirmDelete.label}"</span>. This action bypasses recovery protocols.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl"
                      >
                        Abort
                      </button>
                      <button
                        onClick={() => confirmDelete.type === 'interview' ? handleDeleteInterview(confirmDelete.id) : handleDeleteOffer(confirmDelete.id)}
                        disabled={isDeleting}
                        className="flex-1 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 flex items-center justify-center gap-2"
                      >
                        {isDeleting ? (
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                           'Erase'
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}

function SaveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}