import React from 'react'
interface ProgressRingProps {
  progress: number // 0 to 100
  size?: number
  strokeWidth?: number
}
export function ProgressRing({
  progress,
  size = 60,
  strokeWidth = 4,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference
  // Determine color based on progress
  const getColor = (p: number) => {
    if (p < 34) return 'text-orange-500'
    if (p < 67) return 'text-blue-500'
    return 'text-green-500'
  }
  const colorClass = getColor(progress)
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        className="transform -rotate-90 w-full h-full"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          className="text-gray-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={`${colorClass} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-xs font-semibold text-gray-700">
        {Math.round(progress)}%
      </span>
    </div>
  )
}