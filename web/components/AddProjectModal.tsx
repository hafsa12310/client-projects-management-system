"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createProject, fetchClients, type ClientUser } from "@/lib/api";

interface AddProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export function AddProjectModal({ open, onClose, onCreated }: AddProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [clientId, setClientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsErr, setClientsErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    (async () => {
      setClientsLoading(true);
      setClientsErr(null);
      try {
        const data = await fetchClients("client");
        const list = Array.isArray(data) ? (data as ClientUser[]) : [];
        setClients(list);
        if (!clientId && list.length > 0) {
          setClientId(list[0].id);
        }
      } catch (e: any) {
        setClientsErr(e?.message || "Failed to load clients");
        setClients([]);
      } finally {
        setClientsLoading(false);
      }
    })();
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !clientId.trim()) {
      setErr("Title and client are required");
      return;
    }

    setLoading(true);
    setErr(null);
    setSuccess(false);

    try {
      await createProject({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        client_id: clientId.trim(),
      });
      setSuccess(true);
      await onCreated?.();
      // Reset before closing
      setTitle("");
      setDescription("");
      setStatus("active");
      setClientId("");
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 500);
    } catch (e: any) {
      setErr(e?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => !loading && onClose()} />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Create Project</h2>
          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={() => !loading && onClose()}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Description (optional)"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              className="border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Client</label>
            <select
              className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={clientsLoading || clients.length === 0}
              required
            >
              <option value="" disabled>
                {clientsLoading ? "Loading clients..." : "Select a client"}
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name ? `${c.name} (${c.email})` : c.email}
                </option>
              ))}
            </select>
            {clientsErr ? (
              <span className="text-xs text-red-600">{clientsErr}</span>
            ) : null}
            {!clientsErr && !clientsLoading && clients.length === 0 ? (
              <span className="text-xs text-gray-500">No clients found. Create a client first.</span>
            ) : null}
          </div>

          {err ? (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              {err}
            </div>
          ) : null}

          {success ? (
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>Project created.</span>
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              onClick={() => !loading && onClose()}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
