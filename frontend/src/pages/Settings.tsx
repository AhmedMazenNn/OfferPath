import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppContext } from '../context/AppContext'
import { 
  UserCircle, 
  Camera, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  ShieldCheck, 
  Trash2,
  Lock,
  ChevronRight,
  Settings as SettingsIcon
} from 'lucide-react'

export function Settings() {
  const { user, isAuthenticated, updateProfile } = useAppContext()
  const navigate = useNavigate()
  
  const [name, setName] = useState(() => user?.name || '')
  const [email, setEmail] = useState(() => user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatar, setAvatar] = useState<string | null>(() => user?.avatar || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await updateProfile({
        name,
        email,
        avatar: avatar || undefined,
        password: newPassword || undefined
      })
      setSuccess('Profile identity successfully synchronized.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Synchronization failed')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Avatar payload exceeds 5MB limit')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatar(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const sidebarItems = [
    { id: 'profile', label: 'Profile Intelligence', icon: UserCircle },
    { id: 'security', label: 'Security Protocols', icon: ShieldCheck },
  ]

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-10">
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-widest mb-2"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Preferences</span>
        </motion.div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Account Control</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium max-w-md">Manage your digital identity, security protocols, and system behaviors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3">
           <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                    activeTab === item.id 
                      ? 'bg-slate-900 dark:bg-primary-600 text-white shadow-xl shadow-slate-900/10 dark:shadow-primary-500/20' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="text-[xs] font-black uppercase tracking-tight">{item.label}</span>
                  </div>
                  {activeTab === item.id && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
           </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-8">
           {activeTab === 'profile' && (
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
             >
                {/* Visual Identity */}
                <div className="card p-8 flex flex-col md:flex-row items-center gap-8">
                   <div className="relative group">
                      <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl relative z-10">
                        {avatar ? (
                          <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black">
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 dark:bg-primary-600 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-xl z-20 hover:scale-110 transition-transform"
                      >
                        <Camera className="w-5 h-5" />
                      </label>
                      <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                   </div>
                   <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{user?.name || 'Incomplete Profile'}</h2>
                      <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">{user?.email}</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4">
                         <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-black text-slate-400 block uppercase mb-0.5">Access Tier</span>
                            <span className="text-xs font-black text-primary-500 uppercase">Enterprise Beta</span>
                         </div>
                         <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-black text-slate-400 block uppercase mb-0.5">Uptime Status</span>
                            <div className="flex items-center gap-1">
                               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                               <span className="text-xs font-black text-emerald-500 uppercase">Synchronized</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Form Information */}
                <div className="card p-8">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-primary-500" />
                    Identity Core
                  </h3>

                  {(error || success) && (
                    <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 ${
                      error ? 'bg-pink-50 dark:bg-pink-900/10 border-pink-100 dark:border-pink-900/30' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                    }`}>
                       {error ? <AlertCircle className="w-5 h-5 text-pink-500" /> : <CheckCircle className="w-5 h-5 text-emerald-500" />}
                       <p className={`text-xs font-black uppercase tracking-widest ${error ? 'text-pink-500' : 'text-emerald-500'}`}>{error || success}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="input-base"
                          placeholder="Full identifier"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Endpoint</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="input-base"
                          placeholder="your@path.com"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary py-3 px-10 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl shadow-primary-500/20"
                      >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        Push Updates
                      </button>
                    </div>
                  </form>
                </div>
             </motion.div>
           )}

           {activeTab === 'security' && (
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
             >
                <div className="card p-8">
                   <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-primary-500" />
                      Credential Vault
                   </h3>

                   <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Secret</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="input-base"
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Sequence</label>
                           <input
                             type="password"
                             value={newPassword}
                             onChange={(e) => setNewPassword(e.target.value)}
                             className="input-base"
                             placeholder="Min. 8 characters"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verify Sequence</label>
                           <input
                             type="password"
                             value={confirmPassword}
                             onChange={(e) => setConfirmPassword(e.target.value)}
                             className="input-base"
                             placeholder="Repeat sequence"
                           />
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-primary py-3 px-10 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl shadow-primary-500/20"
                        >
                           <ShieldCheck className="w-4 h-4" />
                           Rotate Secrets
                        </button>
                      </div>
                   </form>
                </div>

                <div className="card-red p-8">
                   <div className="flex items-start gap-6 border-b border-red-500/10 pb-6 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                         <Trash2 className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                         <h3 className="text-lg font-black text-red-600 dark:text-red-400 uppercase tracking-tight">Termination Protocol</h3>
                         <p className="text-sm text-red-500/70 font-medium mt-1">Permanent erasure of all records, identifiers, and progress metadata. This action is irreversible.</p>
                      </div>
                   </div>
                   <button className="w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-red-500/20">
                      Liquidate Account
                   </button>
                </div>
             </motion.div>
           )}


        </div>
      </div>
    </div>
  )
}

export default Settings

