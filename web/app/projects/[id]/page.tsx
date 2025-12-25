"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Comment = {
  id: string;
  project_id: string;
  author_id: string;
  author_role: string;
  message: string;
  created_at: string;
};

type Milestone = {
  id: string;
  project_id: string;
  title: string;
  status: string;
  due_date?: string | null;
  created_at: string;
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = params?.id;

  const [project, setProject] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function loadAll() {
    if (!projectId) return;
    setErr("");
    setLoading(true);
    try {
      const p = await apiFetch(`/projects/${projectId}`);
      const c = await apiFetch(`/projects/${projectId}/comments`);
      const m = await apiFetch(`/projects/${projectId}/milestones`);
      setProject(p);
      setComments(Array.isArray(c) ? c : []);
      setMilestones(Array.isArray(m) ? m : []);
    } catch (e: any) {
      setErr(e.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const milestoneStats = useMemo(() => {
    const total = milestones.length;
    const done = milestones.filter((m) => (m.status || "").toLowerCase() === "done").length;
    const pending = total - done;
    return { total, done, pending };
  }, [milestones]);

  async function sendComment() {
    if (!projectId) return;
    const text = message.trim();
    if (!text) return;

    setSending(true);
    setErr("");
    try {
      await apiFetch(`/projects/${projectId}/comments`, {
        method: "POST",
        body: JSON.stringify({ message: text }),
      });
      setMessage("");
      // refresh comments only (faster)
      const c = await apiFetch(`/projects/${projectId}/comments`);
      setComments(Array.isArray(c) ? c : []);
    } catch (e: any) {
      setErr(e.message || "Failed to send comment");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top bar similar to your dashboard */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/projects")}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            ← Back to Projects
          </button>
          <div className="text-sm text-gray-500">Project Detail</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {err ? (
          <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {err}
          </div>
        ) : null}

        {loading ? (
          <div className="text-gray-500">Loading…</div>
        ) : !project ? (
          <div className="text-gray-500">Project not found.</div>
        ) : (
          <>
            {/* Project header */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                  <p className="text-gray-600 mt-2">{project.description || "—"}</p>
                  <div className="mt-3 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">Status:</span>{" "}
                    {project.status}
                  </div>
                </div>

                {/* quick stats */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-w-[220px]">
                  <div className="text-sm font-semibold text-gray-900">Milestones</div>
                  <div className="mt-2 text-sm text-gray-600">
                    Total: <span className="font-medium">{milestoneStats.total}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Done: <span className="font-medium">{milestoneStats.done}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Pending: <span className="font-medium">{milestoneStats.pending}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <section className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Milestones</h2>
              </div>

              <div className="mt-4 grid gap-4">
                {milestones.length === 0 ? (
                  <div className="text-gray-500">No milestones yet.</div>
                ) : (
                  milestones.map((m) => (
                    <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-gray-900">{m.title}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            Due:{" "}
                            {m.due_date ? new Date(m.due_date).toLocaleString() : "—"}
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-gray-50 text-gray-700">
                          {m.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Comments */}
            <section className="mt-10">
              <h2 className="text-xl font-bold text-gray-900">Comments</h2>

              <div className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex gap-3">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Write an update for the client/admin…"
                  />
                  <button
                    onClick={sendComment}
                    disabled={sending}
                    className="px-5 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-black disabled:opacity-60"
                  >
                    {sending ? "Sending…" : "Send"}
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {comments.length === 0 ? (
                  <div className="text-gray-500">No comments yet.</div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="font-medium text-gray-700">
                          {c.author_role}
                        </span>
                        <span>
                          {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-800">{c.message}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
