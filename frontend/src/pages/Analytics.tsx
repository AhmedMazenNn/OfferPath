import { useEffect, useMemo, useState } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, PieChart as PieIcon, Activity } from 'lucide-react'
import { analyticsApi } from '../services/api'
import { StatsCard } from '../components/ui/StatsCard'

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
      { name: 'Applied', value: funnel.total_applications || 0, fill: '#6366f1' },
      { name: 'Screening', value: funnel.screening || 0, fill: '#8b5cf6' },
      { name: 'Interview', value: funnel.interview || 0, fill: '#a855f7' },
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

  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#10b981', '#f59e0b']

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Crunching Data</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div>
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-widest mb-2"
          >
            <Activity className="w-4 h-4" />
            <span>Reporting</span>
        </motion.div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Analytics</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-md font-medium">Deep dive into your job search performance and conversion metrics.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={TrendingUp}
          label="Total Leads"
          value={metrics?.total_applications || 0}
          delay={0}
        />
        <StatsCard
          icon={Activity}
          label="Active Funnel"
          value={metrics?.active_applications || 0}
          delay={0.1}
        />
        <StatsCard
          icon={BarChart3}
          label="Response Rate"
          value={`${metrics?.response_rate || 0}%`}
          trend={{ value: 5, isPositive: true }}
          delay={0.2}
        />
        <StatsCard
          icon={PieIcon}
          label="Direct Offers"
          value={metrics?.offers_received || 0}
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                Conversion Funnel
             </h2>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart 
              data={funnelDataChart} 
              layout="vertical" 
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#94a3b8" 
                width={100}
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass p-3 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800">
                        <p className="text-xs font-bold uppercase text-slate-500 mb-1">{payload[0].payload.name}</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{payload[0].value} <span className="text-sm font-medium text-slate-400">Applications</span></p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={32}>
                {funnelDataChart.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={funnelDataChart[index].fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8"
        >
           <div className="flex items-center justify-between mb-8">
             <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-primary-500" />
                Status Distribution
             </h2>
          </div>
          <div className="relative">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {sourceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass p-3 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800">
                          <p className="text-xs font-bold uppercase text-slate-500 mb-1">{payload[0].name}</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white">{payload[0].value}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="block text-4xl font-black text-slate-900 dark:text-white leading-none">
                {metrics?.total_applications || 0}
              </span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Funnel</span>
            </div>
          </div>
        </motion.div>

        {/* Trend Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-8 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-10">
             <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-500" />
                Momentum Over Time
             </h2>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-primary-500" />
                   <span className="text-xs font-bold text-slate-500 uppercase">Cumulative</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-pink-500" />
                   <span className="text-xs font-bold text-slate-500 uppercase">New Leads</span>
                </div>
             </div>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.1} />
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
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '16px', 
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorTotal)"
                name="Total Funnel"
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

      {/* Conversion Grid */}
      {funnel?.conversion_rates && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-8"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-8 tracking-tight">Stage Conversion Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(funnel.conversion_rates).map(([key, value], i) => (
              <motion.div 
                key={key} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="relative overflow-hidden p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl group"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary-500/5 rounded-full blur-xl translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">
                  {key.replace('_', ' ')}
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
                    {String(value)}
                  </span>
                  <span className="text-lg font-black text-primary-500 leading-none">%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

