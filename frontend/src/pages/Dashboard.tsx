import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  TrendingUp,
  Percent,
  Calendar,
  ArrowRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { StatsCard } from '../components/ui/StatsCard'
import { useAppContext } from '../context/AppContext'
import type { Application } from '../types'
import { analyticsApi, interviewsApi } from '../services/api'

export function Dashboard() {
  const { applications, applicationsLoading } = useAppContext()
  const [stats, setStats] = useState<any>(null)
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([])
  const [trends, setTrends] = useState<any>(null)

  useEffect(() => {
    loadAnalytics()
    loadUpcomingInterviews()
  }, [])

  const loadAnalytics = async () => {
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
    try {
      const data = await interviewsApi.getUpcoming(30)
      setUpcomingInterviews(data)
    } catch (error) {
      console.error('Failed to load interviews:', error)
    }
  }

  const statusGroups = useMemo(() => {
    const groups: Record<string, Application[]> = {}
    applications.forEach((app) => {
      const stage = app.customStages?.[app.currentStageIndex || 0] || 'Applied'
      if (!groups[stage]) groups[stage] = []
      groups[stage].push(app)
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
    const stageCounts: Record<string, number> = {}
    applications.forEach((app) => {
      const stage = app.customStages?.[app.currentStageIndex || 0] || 'Applied'
      stageCounts[stage] = (stageCounts[stage] || 0) + 1
    })
    return Object.entries(stageCounts).map(([name, value]) => ({
      name,
      value,
      color: stageColors[name] || '#64748b'
    }))
  }, [applications])

  const timelineData = useMemo(() => {
    if (!trends) return []
    return trends.daily_trend?.map((item: any) => ({
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
      const stage = app.customStages?.[app.currentStageIndex || 0] || 'Applied'
      stages.add(stage)
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Track your job search progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Briefcase}
          label="Total Applications"
          value={stats?.total_applications || applications.length}
          delay={0}
        />
        <StatsCard
          icon={TrendingUp}
          label="Total Applications"
          value={applications.length}
          delay={0.1}
        />
        <StatsCard
          icon={Percent}
          label="Response Rate"
          value={`${stats?.response_rate || 0}%`}
          delay={0.2}
        />
        <StatsCard
          icon={Calendar}
          label="Upcoming Interviews"
          value={upcomingInterviews.length}
          delay={0.3}
        />
      </div>

      {/* Status Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
      >
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            {uniqueStages.map((stage) => (
              <button
                key={stage}
                onClick={() => setActiveTab(stage)}
                className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === stage
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span className="capitalize">{stage}</span>
                <span className="ml-2 text-xs">({(statusGroups[stage] || []).length})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {statusGroups[activeTab].length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">
              No applications in this status
            </p>
          ) : (
            <div className="space-y-3">
              {statusGroups[activeTab].slice(0, 5).map((app) => (
                <Link
                  key={app.id}
                  to={`/applications/${app.id}`}
                  className="block p-4 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {app.company}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {app.role}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(app.appliedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Applications by Status
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Applications Over Time
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timelineData}>
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Applications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
      >
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Applications
          </h2>
          <Link
            to="/applications"
            className="flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {recentApplications.map((app) => (
            <Link
              key={app.id}
              to={`/applications/${app.id}`}
              className="block px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {app.company.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {app.company}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {app.role}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                    {app.customStages?.[app.currentStageIndex || 0] || 'Applied'}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(app.appliedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
