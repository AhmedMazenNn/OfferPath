import React, { useEffect, useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '../context/AppContext'
import type { Application, ApplicationSource } from '../types'

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
  const [customStages, setCustomStages] = useState<string[]>([])
  const [newStageName, setNewStageName] = useState('')

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
    }
  }, [isOpen, application])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (application) {
      await updateApplication(application.id, {
        ...formData,
        customStages,
      })
    }
    setTimeout(() => {
      onClose()
    }, 100)
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

  return (
    <AnimatePresence>
      {isOpen && application && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Edit Application
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <form
                  id="edit-form"
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  {/* Basic Info Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Company *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.company || ''}
                          onChange={(e) =>
                            handleChange('company', e.target.value)
                          }
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.role || ''}
                          onChange={(e) => handleChange('role', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Source
                        </label>
                        <select
                          value={formData.source || 'Other'}
                          onChange={(e) =>
                            handleChange(
                              'source',
                              e.target.value as ApplicationSource,
                            )
                          }
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="LinkedIn Easy Apply">
                            LinkedIn Easy Apply
                          </option>
                          <option value="Company Site">Company Site</option>
                          <option value="Referral">Referral</option>
                          <option value="Job Board">Job Board</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Job URL
                        </label>
                        <input
                          type="url"
                          value={formData.jobUrl || ''}
                          onChange={(e) =>
                            handleChange('jobUrl', e.target.value)
                          }
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pipeline Editor */}
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      Pipeline Stages
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      Customize the hiring stages for this application. Select the radio button to set the current stage.
                    </p>

                    <div className="space-y-2">
                      {customStages.map((stage, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <input
                            type="radio"
                            name="currentStage"
                            checked={formData.currentStageIndex === index}
                            onChange={() =>
                              handleChange('currentStageIndex', index)
                            }
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-slate-300"
                            title="Set as current stage"
                          />

                          <input
                            type="text"
                            value={stage}
                            onChange={(e) =>
                              handleStageNameChange(index, e.target.value)
                            }
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-900 dark:text-white px-2 py-1"
                          />

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveStage(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveStage(index, 'down')}
                              disabled={index === customStages.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveStage(index)}
                              disabled={customStages.length <= 1}
                              className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30 ml-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={newStageName}
                        onChange={(e) => setNewStageName(e.target.value)}
                        placeholder="New stage name..."
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddStage()
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddStage}
                        disabled={!newStageName.trim()}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                      Additional Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={formData.notes || ''}
                          onChange={(e) =>
                            handleChange('notes', e.target.value)
                          }
                          rows={4}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="edit-form"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}