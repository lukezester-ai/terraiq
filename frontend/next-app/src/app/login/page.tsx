"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("Грешна парола");
      }
    } catch (err) {
      setError("Възникна грешка при свързване.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-5 font-sans">
      <form onSubmit={handleLogin} className="w-full max-w-sm rounded-xl border border-[#243041] bg-[#131A26] p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-300/10 text-cyan-300 ring-1 ring-cyan-300/30 shadow-[0_0_15px_rgba(0,212,255,0.2)]">
            <LockKeyhole size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">TerraIQ Админ</h1>
          <p className="mt-2 text-sm text-slate-400">Моля, въведете паролата си за достъп</p>
          <p className="mt-1 text-xs font-semibold text-cyan-300">Парола по подразбиране: admin</p>
        </div>
        
        <div className="mb-5">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Парола..."
            className="w-full rounded-lg border border-[#243041] bg-[#0B0F19] px-4 py-3 text-white placeholder:text-slate-600 focus:border-cyan-300/50 focus:outline-none focus:ring-1 focus:ring-cyan-300/50 transition"
            autoFocus
          />
          {error && <p className="mt-2 text-sm font-medium text-red-400">{error}</p>}
        </div>

        <button 
          type="submit" 
          disabled={loading || !password}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00D4FF] px-4 py-3 font-bold text-[#0B0F19] transition hover:bg-cyan-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Проверка..." : "Вход"}
          <ArrowRight size={18} />
        </button>
      </form>
    </main>
  );
}
