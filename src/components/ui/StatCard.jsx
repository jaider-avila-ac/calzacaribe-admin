import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendLabel, accent = 'default' }) {
  const accents = {
    default: 'bg-gray-100 text-gray-600',
    lime: 'bg-lime-300 text-black',
    violet: 'bg-violet-950 text-white',
    red: 'bg-red-600 text-white',
  }

  const isPositive = trend >= 0

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-black text-black mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accents[accent]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
          {isPositive ? (
            <TrendingUp size={14} className="text-lime-600" />
          ) : (
            <TrendingDown size={14} className="text-red-500" />
          )}
          <span className={`text-xs font-semibold ${isPositive ? 'text-lime-600' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{trend}%
          </span>
          {trendLabel && <span className="text-xs text-gray-400">{trendLabel}</span>}
        </div>
      )}
    </div>
  )
}
