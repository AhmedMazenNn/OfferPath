import React, { useState } from 'react'
import { X, Briefcase, Globe, Calendar, Link as LinkIcon, FileText, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '../context/AppContext'
import { DEFAULT_STAGES } from '../types'
import type { ApplicationSource } from '../types'

interface NewApplicationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewApplicationModal({
  isOpen,
  onClose,
}: NewApplicationModalProps) {
  const { addApplication } = useAppContext()
  
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    jobUrl: '',
    appliedDate: new Date().toISOString().split('T')[0],
    source: 'LinkedIn Easy Apply' as ApplicationSource,
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await addApplication({
      company: formData.company,
      role: formData.role,
      jobUrl: formData.jobUrl,
      appliedDate: formData.appliedDate,
      source: formData.source,
      status: 'Applied',
      currentStageIndex: 0,
      customStages: DEFAULT_STAGES,
      notes: formData.notes,
    })
    setFormData({
      company: '',
      role: '',
      jobUrl: '',
      appliedDate: new Date().toISOString().split('T')[0],
      source: 'LinkedIn Easy Apply',
      notes: '',
    })
    onClose()
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
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
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-800 pointer-events-auto"
            >
              <div className="relative p-10">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 rounded-2xl"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="mb-10">
                  <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-6">
                    <Briefcase className="w-6 h-6 text-primary-500" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">
                    Initialize Entry
                  </h2>
                  <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Capture application metadata</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Globe className="w-3 h-3" />
                        Target Entity
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        className="input-base"
                        placeholder="Organization Name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Briefcase className="w-3 h-3" />
                        Designation
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.role}
                        onChange={(e) => handleChange('role', e.target.value)}
                        className="input-base"
                        placeholder="Professional Role"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <LinkIcon className="w-3 h-3" />
                      Digital Source
                    </label>
                    <input
                      type="url"
                      value={formData.jobUrl}
                      onChange={(e) => handleChange('jobUrl', e.target.value)}
                      className="input-base"
                      placeholder="https://career-portal.path"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Timestamp
                      </label>
                      <input
                        type="date"
                        value={formData.appliedDate}
                        onChange={(e) => handleChange('appliedDate', e.target.value)}
                        className="input-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        Channel
                      </label>
                      <select
                        value={formData.source}
                        onChange={(e) => handleChange('source', e.target.value)}
                        className="input-base appearance-none cursor-pointer"
                      >
                        <option value="LinkedIn Easy Apply">LinkedIn Easy Apply</option>
                        <option value="Company Site">Company Site</option>
                        <option value="Referral">Referral</option>
                        <option value="Job Board">Job Board</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      Internal Intelligence
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      rows={3}
                      className="input-base resize-none py-4"
                      placeholder="Contextual observations..."
                    />
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      type="submit"
                      className="btn-primary py-4 px-12 text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary-500/20 flex items-center gap-3"
                    >
                      <Plus className="w-4 h-4" />
                      Initialize Record
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}