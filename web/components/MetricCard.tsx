import React from 'react'
import { ArrowUpRight, ArrowDownRight, BoxIcon } from 'lucide-react'
interface MetricCardProps {
  label: string
  value: string | number
  change: number // percentage
  icon: typeof BoxIcon
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple'
}
export function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  color,
}: MetricCardProps) {
  const isPositive = change >= 0
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-lg ${colorMap[color]} transition-transform group-hover:scale-110 duration-200`}
        >
          <Icon size={24} />
        </div>
        <div
          className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}
        >
          {isPositive ? (
            <ArrowUpRight size={16} className="mr-1" />
          ) : (
            <ArrowDownRight size={16} className="mr-1" />
          )}
          {Math.abs(change)}%
        </div>
      </div>

      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
      </div>
    </div>
  )
}