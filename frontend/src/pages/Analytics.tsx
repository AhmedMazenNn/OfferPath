import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { motion } from 'framer-motion'
import { useAppContext } from '../context/AppContext'

export function Analytics() {
  const { applications } = useAppContext()

  const sourceData = useMemo(() => {
    const sources: Record<string, number> = {}
    applications.forEach((app) => {
      sources[app.source] = (sources[app.source] || 0) + 1
    })
    return Object.entries(sources).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [applications])

  const funnelData = useMemo(() => {
    const total = applications.length
    const screening = applications.filter(a => a.currentStageIndex > 0 || a.status === 'screening' || a.status === 'interview' || a.status === 'offer').length
    const interview = applications.filter(a => a.status === 'interview' || a.status === 'offer' || a.currentStageIndex > 1).length
    const offer = applications.filter(a => a.status === 'offer').length
    return [
      { name: 'Applied', value: total, fill: '#3b82f6' },
      { name: 'Screening', value: screening, fill: '#8b5cf6' },
      { name: 'Interview', value: interview, fill: '#ec4899' },
      { name: 'Offer', value: offer, fill: '#10b981' },
    ]
  }, [applications])

  const timelineData = useMemo(() => {
    const weeks: Record<string, number> = {}
    applications.forEach((app) => {
      const date = new Date(app.appliedDate)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]
      weeks[weekKey] = (weeks[weekKey] || 0) + 1
    })
    let cumulative = 0
    return Object.entries(weeks).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => {
      cumulative += count
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        new: count,
        total: cumulative,
      }
    })
  }, [applications])

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Deep dive into your job search metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Conversion Funnel</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
              <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: 'white' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {funnelData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={funnelData[index].fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Applications by Source</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={sourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {sourceData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: 'white' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 lg:col-span-2">
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
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: 'white' }} />
              <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Total Applications" />
              <Area type="monotone" dataKey="new" stroke="#ec4899" strokeWidth={2} fillOpacity={0} name="New Applications" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  )
}