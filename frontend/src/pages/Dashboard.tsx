import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  TrendingUp,
  Percent,
  Calendar,
  ArrowRight,
  GitCompare,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { StatsCard } from '../components/ui/StatsCard'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useAppContext } from '../context/AppContext'
import type { Application, Interview } from '../types'
import { analyticsApi, interviewsApi } from '../services/api'

export function Dashboard({ onQuickLog }: { onQuickLog?: () => void }) {
  const { applications, applicationsLoading, user } = useAppContext()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null)
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [trends, setTrends] = useState<any>(null)

  const hasAuthToken = () => !!localStorage.getItem('offerpath_token')

  const loadAnalytics = async () => {
    if (!hasAuthToken()) return
    try {
      const [metrics, funnel, trendsData] = await Promise.all([
        analyticsApi.getMetrics(),
        analyticsApi.getFunnel(),
        analyticsApi.getTrends(56)
      ])
      setStats({ ...metrics, funnel })
      setTrends(trendsData)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    }
  }

  const loadUpcomingInterviews = async () => {
    if (!hasAuthToken()) return
    try {
      const data = await interviewsApi.getUpcoming(30)
      setUpcomingInterviews(data)
    } catch (error) {
      console.error('Failed to load interviews:', error)
    }
  }

  useEffect(() => {
    if (!hasAuthToken()) return
    loadAnalytics()
    loadUpcomingInterviews()
  }, [])

  const statusGroups = useMemo(() => {
    const groups: Record<string, Application[]> = {}
    applications.forEach((app) => {
      const stageObj = app.customStages?.[app.currentStageIndex || 0]
      const stageName = typeof stageObj === 'string' ? stageObj : stageObj?.name || 'Applied'
      if (!groups[stageName]) groups[stageName] = []
      groups[stageName].push(app)
    })
    return groups
  }, [applications])

  const stageColors: Record<string, string> = {
    'Applied': '#3b82f6',
    'Screening': '#eab308',
    'Phone Screen': '#f59e0b',
    'Technical': '#a855f7',
    'Onsite': '#8b5cf6',
    'Offer': '#22c55e',
  }

  const pieData = useMemo(() => {
    const stageData: Record<string, { count: number; color: string }> = {}
    applications.forEach((app) => {
      const stageObj = app.customStages?.[app.currentStageIndex || 0]
      const name = typeof stageObj === 'string' ? stageObj : stageObj?.name || 'Applied'
      const color = typeof stageObj === 'string' ? (stageColors[name] || '#64748b') : (stageObj?.color || '#64748b')
      
      if (!stageData[name]) {
        stageData[name] = { count: 0, color }
      }
      stageData[name].count += 1
    })
    return Object.entries(stageData).map(([name, data]) => ({
      name,
      value: data.count,
      color: data.color
    }))
  }, [applications])

  const timelineData = useMemo(() => {
    if (!trends) return []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (trends.daily_trend as any[])?.map((item: { date: string; count: number }) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      applications: item.count,
    })) || []
  }, [trends])

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort(
        (a, b) =>
          new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime(),
      )
      .slice(0, 6)
  }, [applications])

  const uniqueStages = useMemo(() => {
    const stages = new Set<string>()
    applications.forEach((app) => {
      const stageObj = app.customStages?.[app.currentStageIndex || 0]
      const stageName = typeof stageObj === 'string' ? stageObj : stageObj?.name || 'Applied'
      stages.add(stageName)
    })
    return Array.from(stages)
  }, [applications])

  const [activeTab, setActiveTab] = useState<string>(uniqueStages[0] || 'Applied')

  if (applicationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-widest mb-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Overview</span>
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-md">
            Welcome back, <span className="text-slate-900 dark:text-white font-semibold">{user?.name || 'User'}</span>. 
            You have {upcomingInterviews.length} interviews scheduled for this month.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            to="/applications"
            className="btn-secondary py-2 px-4 text-xs font-bold uppercase tracking-wider"
          >
            View Applications
          </Link>
          <button
            onClick={onQuickLog}
            className="btn-primary py-2 px-4 text-xs font-bold uppercase tracking-wider"
          >
            + New Application
          </button>
        </div>
      </div>

      {/* Hero Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Briefcase}
          label="Total Funnel"
          value={stats?.total_applications || applications.length}
          delay={0}
        />
        <StatsCard
          icon={Percent}
          label="Success Rate"
          value={`${stats?.response_rate || 0}%`}
          trend={{ value: 12, isPositive: true }}
          delay={0.1}
        />
        <StatsCard
          icon={Calendar}
          label="Interviews"
          value={upcomingInterviews.length}
          delay={0.2}
        />
        <StatsCard
          icon={TrendingUp}
          label="Active Pipeline"
          value={applications.filter(a => a.status !== 'rejected').length}
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Pipeline Widget */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="lg:col-span-2 space-y-6"
        >
          <div className="card h-full flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-primary-500" />
                Pipeline Stages
              </h2>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {uniqueStages.slice(0, 3).map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setActiveTab(stage)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      activeTab === stage
                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 flex-1 bg-slate-50/50 dark:bg-slate-900/50">
              {(!statusGroups[activeTab] || statusGroups[activeTab].length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 transition-transform hover:rotate-12">
                    <Briefcase className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">No applications in {activeTab}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {statusGroups[activeTab].slice(0, 4).map((app, i) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + (i * 0.05) }}
                      key={app.id}
                    >
                      <Link
                        to={`/applications/${app.id}`}
                        className="group block p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl hover:border-primary-500/50 hover:shadow-xl dark:hover:bg-slate-700/30 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center font-bold text-slate-400 group-hover:text-primary-500 group-hover:bg-primary-500/10 transition-all">
                            {app.company.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
                              {app.company}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {app.role}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                  {statusGroups[activeTab].length > 4 && (
                    <Link 
                      to="/applications"
                      className="md:col-span-2 text-center py-2 text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      +{statusGroups[activeTab].length - 4} more in {activeTab}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Status Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6 flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Status Mix</h2>
            <p className="text-xs text-slate-500 mb-6 font-medium">Distribution by current stage</p>
          </div>
          
          <div className="relative flex-1 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className="hover:opacity-80 transition-opacity cursor-pointer shadow-lg"
                    />
                  ))}
                </Pie>
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass p-3 rounded-xl shadow-2xl">
                          <p className="text-xs font-bold uppercase text-slate-500">{payload[0].name}</p>
                          <p className="text-lg font-bold text-slate-900 dark:text-white">{payload[0].value} apps</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="block text-3xl font-black text-slate-900 dark:text-white">{applications.length}</span>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Total</span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {pieData.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {Math.round((item.value / applications.length) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timeline Chart */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.6 }}
           className="card p-6"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Activity Trends</h2>
              <p className="text-xs font-medium text-slate-500">Application volume over time</p>
            </div>
            <div className="flex gap-2">
               <div className="flex items-center gap-1.5 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                 <span className="text-[10px] font-bold text-primary-700 dark:text-primary-400">Applications</span>
               </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '10px', fontWeight: 'bold' }} 
                dy={10}
              />
              <YAxis 
                stroke="#94a3b8" 
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '10px', fontWeight: 'bold' }} 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
                itemStyle={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="applications"
                stroke="#8b5cf6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorApps)"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Applications List */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.7 }}
           className="card flex flex-col"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h2>
            <Link to="/applications" className="text-xs font-bold text-primary-500 uppercase tracking-widest hover:text-primary-600 transition-colors">
              Full List
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            {recentApplications.map((app, i) => (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + (i * 0.05) }}
                key={app.id}
              >
                <Link
                  to={`/applications/${app.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border-b border-slate-100 dark:border-slate-800 last:border-0 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center font-bold text-slate-400 group-hover:bg-primary-600 group-hover:text-white transition-all transform group-hover:rotate-[10deg]">
                      {app.company.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{app.company}</h3>
                      <p className="text-xs text-slate-500 font-medium">{app.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge 
                      status={app.status || 'Applied'} 
                      color={app.customStages?.find(s => s.name === app.status)?.color || app.customStages?.[app.currentStageIndex || 0]?.color}
                    />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

