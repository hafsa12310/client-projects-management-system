import React from 'react'
import { Plus } from 'lucide-react'
interface FloatingActionButtonProps {
  onClick?: () => void
}
export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 z-50 group focus:outline-none focus:ring-4 focus:ring-blue-200"
      aria-label="Create new project"
    >
      <Plus
        size={28}
        className="group-hover:rotate-90 transition-transform duration-200"
      />
    </button>
  )
}
