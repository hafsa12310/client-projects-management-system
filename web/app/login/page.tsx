"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Eye,
  EyeOff,
  FolderKanban,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { getToken, login, setToken } from "@/lib/api";

const features = [
  { icon: FolderKanban, text: "Track every project and milestone in one place" },
  { icon: MessageSquare, text: "Share updates and comments with your clients" },
  { icon: ShieldCheck, text: "Clients only see the projects assigned to them" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);

  // already logged in → skip the form
  useEffect(() => {
    if (getToken()) router.replace("/projects");
  }, [router]);

  // the free-tier backend can take a while to wake up
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(t);
  }, [loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSlow(false);
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
    <div className="min-h-screen flex bg-gray-50 font-sans text-gray-900">
      {/* Brand panel */}
      <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-12 flex-col justify-between">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5" />

        <div className="relative flex items-center space-x-2">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold">
            P
          </div>
          <span className="text-xl font-bold tracking-tight">ProjectHub</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight">
            Keep clients and projects in sync.
          </h2>
          <ul className="mt-8 space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center space-x-3 text-blue-50">
                <span className="w-9 h-9 shrink-0 rounded-lg bg-white/15 flex items-center justify-center">
                  <Icon size={18} />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-blue-100">
          © {new Date().getFullYear()} ProjectHub
        </p>
      </aside>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center justify-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              P
            </div>
            <span className="text-xl font-bold tracking-tight">
              Project<span className="text-blue-600">Hub</span>
            </span>
          </div>

          <form
            onSubmit={onSubmit}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8"
          >
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">
              Sign in with your admin or client account.
            </p>

            {err && (
              <div
                role="alert"
                className="mt-6 flex items-start space-x-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <AlertCircle size={18} className="shrink-0 mt-px" />
                <span>{err}</span>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    autoFocus
                    className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="w-full border border-gray-200 rounded-xl pl-11 pr-12 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center rounded-xl py-3 bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>

            {loading && slow && (
              <p className="mt-3 text-xs text-center text-gray-500">
                The server is waking up — this can take up to a minute on first load.
              </p>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account? Ask your project admin to invite you.
          </p>
        </div>
      </main>
    </div>
  );
}
