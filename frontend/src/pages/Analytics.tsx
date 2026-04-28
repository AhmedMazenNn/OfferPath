import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { motion } from 'framer-motion'
import { analyticsApi } from '../services/api'

export function Analytics() {
  const [metrics, setMetrics] = useState<any>(null)
  const [funnel, setFunnel] = useState<any>(null)
  const [trends, setTrends] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const [metricsData, funnelData, trendsData] = await Promise.all([
        analyticsApi.getMetrics('all'),
        analyticsApi.getFunnel(),
        analyticsApi.getTrends(56)
      ])
      setMetrics(metricsData)
      setFunnel(funnelData)
      setTrends(trendsData)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const sourceData = useMemo(() => {
    if (!metrics) return []
    return Object.entries(metrics.applications_by_status || {}).map(([name, value]) => ({ name, value }))
  }, [metrics])

  const funnelDataChart = useMemo(() => {
    if (!funnel) return []
    return [
      { name: 'Applied', value: funnel.total_applications || 0, fill: '#3b82f6' },
      { name: 'Screening', value: funnel.screening || 0, fill: '#8b5cf6' },
      { name: 'Interview', value: funnel.interview || 0, fill: '#ec4899' },
      { name: 'Offer', value: funnel.offer || 0, fill: '#10b981' },
    ]
  }, [funnel])

  const timelineData = useMemo(() => {
    if (!trends?.daily_trend) return []
    let cumulative = 0
    return trends.daily_trend.map((item: any) => {
      cumulative += item.count
      return {
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        new: item.count,
        total: cumulative,
      }
    })
  }, [trends])

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Deep dive into your job search metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics && Object.entries({
          'Total Applications': metrics.total_applications,
          'Active': metrics.active_applications,
          'Response Rate': `${metrics.response_rate}%`,
          'Offers': metrics.offers_received,
        }).map(([label, value], i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Conversion Funnel</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelDataChart} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
              <Tooltip
                cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: 'white' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {funnelDataChart.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={funnelDataChart[index].fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Applications by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {sourceData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: 'white' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 lg:col-span-2"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Application Volume Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: 'white' }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
                name="Total Applications"
              />
              <Area
                type="monotone"
                dataKey="new"
                stroke="#ec4899"
                strokeWidth={2}
                fillOpacity={0}
                name="New Applications"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Conversion Rates */}
      {funnel?.conversion_rates && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Conversion Rates</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(funnel.conversion_rates).map(([key, value]) => (
              <div key={key} className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                  {key.replace('_', ' ')}
                </p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">
                  {String(value)}%
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
