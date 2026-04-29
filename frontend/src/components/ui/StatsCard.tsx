import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
  }
  delay?: number
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      className="card group hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="p-6 flex items-start justify-between relative overflow-hidden">
        {/* Subtle Decorative Background */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-colors duration-500" />
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-primary-500 transition-colors">
              {label}
            </p>
            {trend && (
              <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                trend.isPositive 
                  ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' 
                  : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
              }`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          <p className="text-4xl font-bold text-slate-900 dark:text-white mt-2 tabular-nums tracking-tight">
            {value}
          </p>
        </div>

        <div className="flex-shrink-0 ml-4">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 group-hover:bg-primary-600 group-hover:border-primary-500 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary-500/30">
            <Icon className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-white transition-colors duration-300" />
          </div>
        </div>
      </div>
      
      {/* Bottom Bar Indicator */}
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.5, delay: delay + 0.5 }}
          className="h-full bg-primary-600/10" 
        />
      </div>
    </motion.div>
  )
}