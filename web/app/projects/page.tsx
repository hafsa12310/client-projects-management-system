"use client";

import {
  FolderKanban,
  Activity,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Bell,
} from "lucide-react";

import { ProjectCard } from "@/components/ProjectCard";
import { Project } from "@/components/ProjectCard";
import { MetricCard } from "@/components/MetricCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useEffect, useMemo, useState } from "react";
import { apiFetch, clearToken } from "@/lib/api";
import { useRouter } from "next/navigation";


// Mock Data
const metrics = [
  {
    label: "Total Projects",
    value: 24,
    change: 12,
    icon: FolderKanban,
    color: "blue" as const,
  },
  {
    label: "Active Now",
    value: 8,
    change: 5,
    icon: Activity,
    color: "orange" as const,
  },
  {
    label: "Completed",
    value: 14,
    change: 8,
    icon: CheckCircle2,
    color: "green" as const,
  },
  {
    label: "Overdue",
    value: 2,
    change: -3,
    icon: AlertCircle,
    color: "red" as const,
  },
];

const projects: Project[] = [
  {
    id: "1",
    title: "Rebrand Campaign",
    client: "Acme Corp",
    clientInitials: "AC",
    thumbnailGradient: "bg-gradient-to-br from-blue-400 to-indigo-600",
    progress: 75,
    status: "active",
    dueDate: "Oct 24",
    description:
      "Complete overhaul of brand identity including logo, typography, and guidelines.",
  },
  {
    id: "2",
    title: "Mobile App Design",
    client: "TechStart Inc",
    clientInitials: "TS",
    thumbnailGradient: "bg-gradient-to-br from-emerald-400 to-teal-600",
    progress: 45,
    status: "active",
    dueDate: "Nov 12",
    description: "UX/UI design for the new customer-facing mobile application.",
  },
  {
    id: "3",
    title: "Q3 Marketing Report",
    client: "Global Finance",
    clientInitials: "GF",
    thumbnailGradient: "bg-gradient-to-br from-orange-400 to-red-500",
    progress: 100,
    status: "completed",
    dueDate: "Sep 30",
    description: "Comprehensive analysis of Q3 performance metrics and ROI.",
  },
  {
    id: "4",
    title: "Website Migration",
    client: "Local Bakery",
    clientInitials: "LB",
    thumbnailGradient: "bg-gradient-to-br from-pink-400 to-rose-600",
    progress: 90,
    status: "overdue",
    dueDate: "Oct 05",
    description:
      "Migrating legacy Wordpress site to Next.js headless architecture.",
  },
  {
    id: "5",
    title: "Social Media Assets",
    client: "Fashion Week",
    clientInitials: "FW",
    thumbnailGradient: "bg-gradient-to-br from-purple-400 to-fuchsia-600",
    progress: 15,
    status: "planning",
    dueDate: "Dec 01",
    description: "Creating a suite of social media templates for the upcoming season.",
  },
  {
    id: "6",
    title: "Internal Dashboard",
    client: "Acme Corp",
    clientInitials: "AC",
    thumbnailGradient: "bg-gradient-to-br from-cyan-400 to-blue-500",
    progress: 60,
    status: "active",
    dueDate: "Nov 20",
    description: "Employee portal for tracking leave, benefits, and internal news.",
  },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              P
            </div>
            <span className="text-xl font-bold tracking-tight">
              Project<span className="text-blue-600">Hub</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <Search size={18} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search projects..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-500"
              />
            </div>

            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* FIX: tailwind gradient class */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-white shadow-sm" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Projects Overview
          </h1>
          <p className="text-gray-500">
            Welcome back! Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Projects Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            Recent Projects
            <span className="ml-3 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
              {projects.length}
            </span>
          </h2>

          <div className="flex items-center space-x-3">
            <button className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <Filter size={16} className="mr-2" />
              Filter
            </button>
            <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>All Projects</option>
              <option>Active</option>
              <option>Completed</option>
              <option>Overdue</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>

      <FloatingActionButton onClick={() => console.log("New Project")} />
    </div>
  );
}
