import React, { useState } from 'react'
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  User, 
  FileText, 
  ChevronDown,
  Search,
  Globe
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { interviewsApi } from '../services/api'

interface ScheduleInterviewModalProps {
  isOpen: boolean
  onClose: () => void
  applicationId: string
  company: string
  role: string
  onScheduled?: () => void
}

const SUGGESTED_TITLES = [
  'Technical Interview',
  'Soft Skills Interview',
  'HR Screening',
  'System Design Interview',
  'Behavioral Interview',
  'Take-Home Assignment',
  'Culture Fit Interview',
  'Final Round Interview',
]

export function ScheduleInterviewModal({
  isOpen,
  onClose,
  applicationId,
  company,
  role,
  onScheduled,
}: ScheduleInterviewModalProps) {
  const [formData, setFormData] = useState({
    interviewTitle: '',
    date: '',
    time: '10:00',
    durationMinutes: 60,
    isRemote: true,
    meetingLink: '',
    location: '',
    interviewerName: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!formData.interviewTitle.trim() || !formData.date) return

    setSubmitting(true)
    try {
      const scheduledDate = new Date(`${formData.date}T${formData.time}:00`)
      await interviewsApi.create({
        applicationId: applicationId,
        interviewType: formData.interviewTitle.trim(),
        scheduledDate: scheduledDate.toISOString(),
        durationMinutes: formData.durationMinutes,
        isRemote: formData.isRemote,
        meetingLink: formData.isRemote ? formData.meetingLink : undefined,
        location: !formData.isRemote ? formData.location : undefined,
        interviewerName: formData.interviewerName || undefined,
        notes: formData.notes || undefined,
        status: 'scheduled',
      })
      onScheduled?.()
      onClose()
      // Reset form
      setFormData({
        interviewTitle: '',
        date: '',
        time: '10:00',
        durationMinutes: 60,
        isRemote: true,
        meetingLink: '',
        location: '',
        interviewerName: '',
        notes: '',
      })
    } catch (err) {
      console.error('Failed to schedule interview:', err)
    } finally {
      setSubmitting(false)
    }
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
              className="bg-white dark:bg-slate-900 md:rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[95vh] md:max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 pointer-events-auto overflow-hidden rounded-t-[2.5rem] md:rounded-b-[2.5rem]"
            >
              {/* Header */}
              <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/50 backdrop-blur-xl relative z-10">
                <div className="min-w-0">
                   <div className="flex items-center gap-2 text-primary-500 font-black text-[10px] uppercase tracking-widest mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Engagement Scheduling</span>
                   </div>
                   <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                     Initialize Interview
                   </h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 truncate">
                      {company} // {role}
                    </p>
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
                <form id="schedule-form" onSubmit={handleSubmit} className="space-y-10">
                  
                  {/* Phase & Classification */}
                  <section>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                       <Search className="w-3.5 h-3.5" />
                       Phase Classification
                    </h3>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.interviewTitle}
                        onChange={e => handleChange('interviewTitle', e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="Select or specify phase type..."
                        className="input-base !text-base !font-black !py-4"
                      />
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />

                      <AnimatePresence>
                        {showSuggestions && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                          >
                            <div className="p-2 max-h-60 overflow-y-auto custom-scrollbar">
                              {SUGGESTED_TITLES.filter(t =>
                                t.toLowerCase().includes(formData.interviewTitle.toLowerCase())
                              ).map(title => (
                                <button
                                  key={title}
                                  type="button"
                                  onClick={() => {
                                    handleChange('interviewTitle', title)
                                    setShowSuggestions(false)
                                  }}
                                  className="w-full text-left px-5 py-3 text-xs font-black uppercase tracking-tight text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary-600 dark:hover:text-primary-400 rounded-2xl transition-all"
                                >
                                  {title}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </section>

                  {/* Temporal Coordination */}
                  <section>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                       <Clock className="w-3.5 h-3.5" />
                       Temporal Coordination
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Date</label>
                          <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={formData.date}
                            onChange={e => handleChange('date', e.target.value)}
                            className="input-base"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Global Time</label>
                          <input
                            type="time"
                            value={formData.time}
                            onChange={e => handleChange('time', e.target.value)}
                            className="input-base"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Min)</label>
                          <select
                            value={formData.durationMinutes}
                            onChange={e => handleChange('durationMinutes', parseInt(e.target.value))}
                            className="input-base"
                          >
                            {[15, 30, 45, 60, 90, 120].map(d => (
                              <option key={d} value={d}>{d} Minutes</option>
                            ))}
                          </select>
                       </div>
                    </div>
                  </section>

                  {/* Operational Settings */}
                  <section className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800/50">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                       <Globe className="w-3.5 h-3.5 text-primary-500" />
                       Operational Environment
                    </h3>
                    
                    <div className="flex gap-4 mb-8">
                       <button
                         type="button"
                         onClick={() => handleChange('isRemote', true)}
                         className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${
                            formData.isRemote 
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-white/10 scale-[1.02]' 
                            : 'bg-white dark:bg-slate-700/50 text-slate-400 border border-slate-100 dark:border-slate-700'
                         }`}
                       >
                         <Video className="w-4 h-4" /> Remote Interface
                       </button>
                       <button
                         type="button"
                         onClick={() => handleChange('isRemote', false)}
                         className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${
                            !formData.isRemote 
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-white/10 scale-[1.02]' 
                            : 'bg-white dark:bg-slate-700/50 text-slate-400 border border-slate-100 dark:border-slate-700'
                         }`}
                       >
                         <MapPin className="w-4 h-4" /> Physical Presence
                       </button>
                    </div>

                    {formData.isRemote ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Virtual Gateway (URL)</label>
                        <input
                          type="url"
                          value={formData.meetingLink}
                          onChange={e => handleChange('meetingLink', e.target.value)}
                          placeholder="Zoom, Meet, or Teams protocol..."
                          className="input-base"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Geographic Coordinates</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={e => handleChange('location', e.target.value)}
                          placeholder="HQ Address or specified room..."
                          className="input-base"
                        />
                      </div>
                    )}
                  </section>

                  {/* Personnel & Preparation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <section>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                           <User className="w-3.5 h-3.5" />
                           Counterparty
                        </h3>
                        <input
                          type="text"
                          value={formData.interviewerName}
                          onChange={e => handleChange('interviewerName', e.target.value)}
                          placeholder="Lead Interviewer name..."
                          className="input-base"
                        />
                     </section>
                     <section>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                           <FileText className="w-3.5 h-3.5" />
                           Preparation Guidelines
                        </h3>
                        <textarea
                          value={formData.notes}
                          onChange={e => handleChange('notes', e.target.value)}
                          rows={2}
                          placeholder="Key objectives or focus areas..."
                          className="input-base resize-none"
                        />
                     </section>
                  </div>
                </form>
              </div>

              {/* Footer Actions */}
              <div className="px-6 md:px-10 py-6 md:py-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 backdrop-blur-xl flex flex-col-reverse md:flex-row items-center justify-end gap-3 md:gap-4 relative z-10">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full md:w-auto px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Suspend
                </button>
                <button
                  type="submit"
                  form="schedule-form"
                  disabled={submitting || !formData.interviewTitle.trim() || !formData.date}
                  className="w-full md:w-auto btn-primary px-10 py-3.5 text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Calendar className="w-4 h-4" />
                  )}
                  {submitting ? 'Synchronizing...' : 'Finalize Schedule'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
