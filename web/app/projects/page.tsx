"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  Activity,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Bell,
} from "lucide-react";

import { apiFetch, clearToken } from "@/lib/api";
import { ProjectCard } from "@/components/ProjectCard";
import type { Project } from "@/components/ProjectCard";
import { MetricCard } from "@/components/MetricCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { AdminAddClientButton } from "@/components/AdminAddClientButton";
import { AddClientModal } from "@/components/AddClientModal";
import { AddProjectModal } from "@/components/AddProjectModal";

// Helpers to map API -> UI card
function initialsFromTitle(title: string) {
  const parts = (title || "").trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]!.toUpperCase()).join("") || "PR";
}

function statusToUi(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "done" || s === "completed") return "completed";
  if (s === "in_progress") return "active";
  if (s === "ongoing") return "active";
  return s || "active";
}

function progressFromStatus(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "done" || s === "completed") return 100;
  if (s === "in_progress") return 60;
  if (s === "ongoing") return 45;
  return 25;
}

function gradientForIndex(i: number) {
  const grads = [
    "bg-gradient-to-br from-blue-400 to-indigo-600",
    "bg-gradient-to-br from-emerald-400 to-teal-600",
    "bg-gradient-to-br from-orange-400 to-red-500",
    "bg-gradient-to-br from-pink-400 to-rose-600",
    "bg-gradient-to-br from-purple-400 to-fuchsia-600",
    "bg-gradient-to-br from-cyan-400 to-blue-500",
  ];
  return grads[i % grads.length];
}

export default function ProjectsPage() {
  const router = useRouter();

  const [rawProjects, setRawProjects] = useState<any[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);

  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "completed" | "overdue" | "planning"
  >("all");

  const loadProjects = useCallback(async () => {
    try {
      setErr("");
      setLoading(true);
      // Get current user to determine role
      try {
        const me = await apiFetch("/me");
        setIsAdmin((me as any)?.role === "admin");
      } catch (e) {
        // ignore; handled below via error redirects on projects fetch
      }

      const data = await apiFetch("/projects");
      setRawProjects(Array.isArray(data) ? data : []);
    } catch (e: any) {
      const msg = e?.message || "Failed to load projects";
      setErr(msg);

      // if token missing/invalid → push to login
      if (
        msg.toLowerCase().includes("missing") ||
        msg.toLowerCase().includes("invalid") ||
        msg.toLowerCase().includes("token")
      ) {
        clearToken();
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Map API -> UI Project type used by ProjectCard
  const projects: Project[] = useMemo(() => {
    return rawProjects.map((p, i) => {
      const title = p?.title ?? "Untitled";
      const createdAt = p?.created_at ? new Date(p.created_at) : null;

      return {
        id: p?.id,
        title,
        client: "Client", // optional: later fetch real client name
        clientInitials: initialsFromTitle(title),
        thumbnailGradient: gradientForIndex(i),
        progress: progressFromStatus(p?.status),
        status: statusToUi(p?.status),
        dueDate: createdAt ? createdAt.toLocaleDateString() : "",
        description: p?.description ?? "",
      } as Project;
    });
  }, [rawProjects]);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();

    return projects.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.client || "").toLowerCase().includes(q);

      const matchesStatus =
        filterStatus === "all" ? true : p.status === filterStatus;

      return matchesQuery && matchesStatus;
    });
  }, [projects, query, filterStatus]);

  const metrics = useMemo(() => {
    const total = projects.length;

    const active = projects.filter((p) => p.status === "active").length;
    const completed = projects.filter((p) => p.status === "completed").length;

    // You don’t have due dates from API yet; keep 0 for now
    const overdue = projects.filter((p) => p.status === "overdue").length;

    return [
      {
        label: "Total Projects",
        value: total,
        change: 0,
        icon: FolderKanban,
        color: "blue" as const,
      },
      {
        label: "Active Now",
        value: active,
        change: 0,
        icon: Activity,
        color: "orange" as const,
      },
      {
        label: "Completed",
        value: completed,
        change: 0,
        icon: CheckCircle2,
        color: "green" as const,
      },
      {
        label: "Overdue",
        value: overdue,
        change: 0,
        icon: AlertCircle,
        color: "red" as const,
      },
    ];
  }, [projects]);

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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-500"
              />
            </div>

            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <button
              onClick={() => {
                clearToken();
                router.push("/login");
              }}
              className="text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Logout"
            >
              Logout
            </button>

            <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-500 to-purple-500 border-2 border-white shadow-sm" />
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

          {err ? (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {err}
            </div>
          ) : null}
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
              {filteredProjects.length}
            </span>
          </h2>

          <div className="flex items-center space-x-3">
            {isAdmin ? (
              <button
                onClick={() => setShowAddProject(true)}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                + Create Project
              </button>
            ) : null}

            <button className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <Filter size={16} className="mr-2" />
              Filter
            </button>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Projects</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="planning">Planning</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {loading ? (
            <div className="text-gray-500">Loading projects…</div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-gray-500">No projects found.</div>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="cursor-pointer"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <ProjectCard project={project} />
              </div>
            ))
          )}
        </div>
      </main>

      {/* Admin-only: Add Client action */}
      {isAdmin ? (
        <>
          <AdminAddClientButton onClick={() => setShowAddClient(true)} />
          <AddClientModal open={showAddClient} onClose={() => setShowAddClient(false)} />
          <AddProjectModal
            open={showAddProject}
            onClose={() => setShowAddProject(false)}
            onCreated={loadProjects}
          />
        </>
      ) : null}
    </div>
  );
}
