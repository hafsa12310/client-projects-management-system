"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddClientModal({ open, onClose }: AddClientModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSuccess(false);
    setLoading(true);
    try {
      await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      setSuccess(true);
      // Reset form fields
      setName("");
      setEmail("");
      setPassword("");
      // Auto-close after 1.5 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (e: any) {
      setErr(e?.message || "Failed to create client");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !loading && onClose()}
      />
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add Client</h2>
          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={() => !loading && onClose()}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Temporary Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {err ? (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              {err}
            </div>
          ) : null}

          {success ? (
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>Client created successfully!</span>
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
              {loading ? "Creating..." : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
