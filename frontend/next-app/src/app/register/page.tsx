"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Sprout, Building2, Mail, KeyRound, MapPin } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [mainCrop, setMainCrop] = useState("Пшеница & Слънчоглед");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate instant account initialization and AI setup
    setTimeout(() => {
      // Store registration state locally for demo/MVP persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("terraiq_user_email", email);
        localStorage.setItem("terraiq_user_company", companyName);
        localStorage.setItem("terraiq_user_size", farmSize);
      }
      setLoading(false);
      router.push("/crm?registered=true&status=welcome");
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col justify-between p-5 font-sans">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-cyan-300/35 bg-cyan-300/10">
            <span className="absolute h-6 w-6 rotate-45 border border-cyan-200/70" />
            <span className="absolute h-2.5 w-2.5 rotate-45 bg-cyan-300 shadow-[0_0_20px_rgba(0,212,255,0.8)]" />
          </span>
          <span className="text-lg font-bold tracking-tight">TerraIQ</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-400">Вече имате акаунт?</span>
          <Link href="/login" className="font-semibold text-cyan-300 hover:text-cyan-200 transition">Вход</Link>
        </div>
      </div>

      <div className="my-auto flex flex-col items-center justify-center py-10">
        <div className="w-full max-w-xl rounded-2xl border border-[#243041] bg-[#131A26] p-8 shadow-2xl sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-300 border border-cyan-300/30 shadow-[0_0_24px_rgba(0,212,255,0.2)]">
              <Sprout size={28} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Регистрация в <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">TerraIQ</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Стартирайте вашата AI операционна система за земеделие
            </p>
          </div>

          <form onSubmit={handleRegister} className="grid gap-5">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <Building2 size={14} className="text-cyan-400" />
                Име на Стопанство / Компания
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="напр. Агро Трейд Холдинг ЕООД"
                className="w-full rounded-lg border border-[#243041] bg-[#0B0F19] px-4 py-3 text-white placeholder:text-slate-600 focus:border-cyan-300/50 focus:outline-none focus:ring-1 focus:ring-cyan-300/50 transition"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <Mail size={14} className="text-cyan-400" />
                  Работен Имейл
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.eu"
                  className="w-full rounded-lg border border-[#243041] bg-[#0B0F19] px-4 py-3 text-white placeholder:text-slate-600 focus:border-cyan-300/50 focus:outline-none focus:ring-1 focus:ring-cyan-300/50 transition"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <KeyRound size={14} className="text-cyan-400" />
                  Парола за Достъп
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#243041] bg-[#0B0F19] px-4 py-3 text-white placeholder:text-slate-600 focus:border-cyan-300/50 focus:outline-none focus:ring-1 focus:ring-cyan-300/50 transition"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <MapPin size={14} className="text-cyan-400" />
                  Площ в Декари / Хектари
                </label>
                <input
                  type="text"
                  required
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  placeholder="напр. 15,000 дка"
                  className="w-full rounded-lg border border-[#243041] bg-[#0B0F19] px-4 py-3 text-white placeholder:text-slate-600 focus:border-cyan-300/50 focus:outline-none focus:ring-1 focus:ring-cyan-300/50 transition"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Основна Култура
                </label>
                <select
                  value={mainCrop}
                  onChange={(e) => setMainCrop(e.target.value)}
                  className="w-full rounded-lg border border-[#243041] bg-[#0B0F19] px-4 py-3 text-white focus:border-cyan-300/50 focus:outline-none focus:ring-1 focus:ring-cyan-300/50 transition"
                >
                  <option value="Пшеница & Слънчоглед">Пшеница & Слънчоглед</option>
                  <option value="Царевица & Ечемик">Царевица & Ечемик</option>
                  <option value="Маслодейна Роза / Лавандула">Маслодейна Роза / Лавандула</option>
                  <option value="Овощни градини & Лозя">Овощни градини & Лозя</option>
                  <option value="Търговия / Експорт на Зърно">Търговия / Експорт на Зърно</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 py-3.5 text-base font-bold text-neutral-950 transition-all hover:brightness-110 shadow-[0_0_24px_rgba(0,212,255,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <span>Активиране на AI Агроном и RAG база...</span>
              ) : (
                <>
                  <span>Създай Акаунт и Влез в Системата</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-[#243041] pt-6 grid grid-cols-3 gap-4 text-center text-xs text-slate-400">
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>12 ДФЗ/МЗХ Наредби</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 size={16} className="text-cyan-400" />
              <span>4 AI Агента</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 size={16} className="text-amber-400" />
              <span>100% Защита на Данни</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="mx-auto w-full max-w-7xl border-t border-[#243041] py-4 text-center text-xs text-slate-500">
        © 2026 TerraIQ Strategic Operating System. Всички права запазени.
      </footer>
    </main>
  );
}
