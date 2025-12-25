"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const data = await login(email, password);
      setToken(data.access_token);
      router.push("/projects");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white rounded-2xl p-6 shadow">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="text-gray-500 text-sm mt-1">Use admin or client credentials</p>

        <div className="mt-4 space-y-3">
          <input
            className="w-full border rounded-xl p-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full border rounded-xl p-3"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button disabled={loading} className="w-full rounded-xl p-3 bg-black text-white">
            {loading ? "Logging in..." : "Login"}
          </button>

          {err && <div className="text-red-600 text-sm">{err}</div>}
        </div>
      </form>
    </div>
  );
}
