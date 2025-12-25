import React from 'react'
import { Eye, Edit2, MoreVertical, Calendar } from 'lucide-react'
import { ProgressRing } from './ProgressRing'
export type ProjectStatus = 'active' | 'completed' | 'overdue' | 'planning'
export interface Project {
  id: string
  title: string
  client: string
  clientInitials: string
  thumbnailGradient: string
  progress: number
  status: ProjectStatus
  dueDate: string
  description: string
}
interface ProjectCardProps {
  project: Project
}
export function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    active: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    overdue: 'bg-red-100 text-red-700 border-red-200',
    planning: 'bg-gray-100 text-gray-700 border-gray-200',
  }
  const statusLabels = {
    active: 'In Progress',
    completed: 'Completed',
    overdue: 'Overdue',
    planning: 'Planning',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full group">
      {/* Thumbnail Area */}
      <div className={`h-32 w-full ${project.thumbnailGradient} relative`}>
        <div className="absolute -bottom-6 left-6">
          <div className="w-12 h-12 rounded-full bg-white p-1 shadow-md">
            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm">
              {project.clientInitials}
            </div>
          </div>
        </div>

        {/* Quick Actions Overlay (Visible on Hover) */}
        <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white text-gray-600 hover:text-blue-600 shadow-sm transition-colors">
            <Eye size={16} />
          </button>
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white text-gray-600 hover:text-blue-600 shadow-sm transition-colors">
            <Edit2 size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-10 px-6 pb-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
              {project.title}
            </h3>
            <p className="text-sm text-gray-500">{project.client}</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-1">
          {project.description}
        </p>

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center space-x-3">
            <ProgressRing
              progress={project.progress}
              size={48}
              strokeWidth={3}
            />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                Progress
              </span>
              <div className="flex items-center text-xs text-gray-500 mt-0.5">
                <Calendar size={12} className="mr-1" />
                {project.dueDate}
              </div>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[project.status]} flex items-center`}
          >
            {project.status === 'active' && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" />
            )}
            {statusLabels[project.status]}
          </span>
        </div>
      </div>
    </div>
  )
}