"use client";

import { motion, type Variants } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BadgeEuro,
  BarChart3,
  Brain,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Command,
  Database,
  ExternalLink,
  Factory,
  FileSearch,
  Gauge,
  GitBranch,
  Globe,
  Landmark,
  LineChart,
  LockKeyhole,
  Map,
  Network,
  Radar,
  Scale,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "lukezester@gmail.com";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// executiveKpis moved inside component for translations

const chartBars = [38, 72, 54, 88, 48, 66, 92, 58, 76, 44, 84, 64];

const intelligenceActions = [
  { title: "Reduce fertilizer cost", impact: "+4.8%", icon: BadgeEuro },
  { title: "Change crop in Block 12", impact: "+6.2%", icon: Map },
  { title: "Sell wheat in October", impact: "+3.4%", icon: BarChart3 },
];

const commandItems = [
  { label: "Fields", icon: Map, active: true },
  { label: "Machines", icon: Truck, active: false },
  { label: "Finance", icon: CircleDollarSign, active: false },
  { label: "Contracts", icon: FileSearch, active: false },
  { label: "Markets", icon: LineChart, active: false },
  { label: "Risk", icon: Radar, active: false },
];

const strategicCapabilities = [
  { title: "Decision Memory", text: "Measures every trade recommendation against real outcomes and profit impact across all commodity markets.", icon: Brain, href: "/crm", status: "BETA" },
  { title: "Commodity Intelligence", text: "Real-time prices, term structures, and spreads across energy, metals, agriculture, and chemicals.", icon: Landmark, href: "/crm", status: "LIVE" },
  { title: "Trade Finance", text: "Smart contract escrow, USDC settlement, milestone payments, and automated dispute resolution via kontor21.", icon: Scale, href: "/crm", status: "BETA" },
  { title: "Executive Copilot", text: "Daily briefing on markets, risks, logistics, cash flow, and actionable trade opportunities.", icon: Command, href: "/crm", status: "LIVE" },
  { title: "Risk Engine", text: "Multi-factor risk assessment: market, credit, geopolitical, sanctions, and counterparty exposure.", icon: BarChart3, href: "/crm", status: "LIVE" },
  { title: "Scenario Engine", text: "What-if simulations across price shocks, supply disruptions, FX moves, and trade policy changes.", icon: GitBranch, href: "/demo", status: "LIVE" },
  { title: "Capital Allocation", text: "Ranks the best deployment of capital across commodities, geographies, and trade structures.", icon: CircleDollarSign, href: "/crm", status: "LIVE" },
  { title: "Document Brain", text: "RAG over contracts, sanctions lists, regulations, shipping docs, and trade correspondence.", icon: Database, href: "/crm", status: "LIVE" },
  { title: "Predictive Analytics", text: "Forecasts commodity prices, freight rates, FX moves, and counterparty credit trends 6-24 months out.", icon: LineChart, href: "/crm", status: "PLANNED" },
  { title: "Multi-Market", text: "One operating view across physical commodities, financial derivatives, and on-chain settlement.", icon: Factory, href: "/admin", status: "LIVE" },
];

function LogoMark() {
  return (
    <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-cyan-300/35 bg-cyan-300/10">
      <span className="absolute h-7 w-7 rotate-45 border border-cyan-200/70" />
      <span className="absolute h-3 w-3 rotate-45 bg-cyan-300 shadow-[0_0_24px_rgba(0,212,255,0.8)]" />
    </span>
  );
}

function DataField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(36,48,65,0.32)_1px,transparent_1px),linear-gradient(90deg,rgba(36,48,65,0.32)_1px,transparent_1px)] bg-[size:58px_58px] opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,212,255,0.16)_1px,transparent_1.5px)] bg-[size:28px_28px] opacity-55" />
      <span className="data-stream top-[18%]" />
      <span className="data-stream top-[42%] animation-delay-700" />
      <span className="data-stream top-[66%] animation-delay-1400" />
      <span className="data-stream data-stream-reverse top-[30%] animation-delay-2100" />
      <span className="absolute left-[12%] top-[24%] h-px w-[34vw] bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
      <span className="absolute right-[8%] top-[70%] h-px w-[28vw] bg-gradient-to-r from-transparent via-emerald-300/45 to-transparent" />
      <span className="absolute left-[24%] top-[78%] h-[28vh] w-px bg-gradient-to-b from-transparent via-cyan-300/35 to-transparent" />
    </div>
  );
}

export default function LandingPage() {
  const { t, i18n } = useTranslation();

  const executiveKpis = [
    { label: t('kpi.expected_profit'), value: "EUR 2.4M", detail: t('kpi.expected_profit_desc'), icon: CircleDollarSign, state: "text-emerald-300" },
    { label: t('kpi.risk_index'), value: "23%", detail: t('kpi.risk_index_desc'), icon: Gauge, state: "text-cyan-300" },
    { label: t('kpi.strategic_actions'), value: "4", detail: t('kpi.strategic_actions_desc'), icon: ClipboardCheck, state: "text-amber-300" },
    { label: t('kpi.cash_flow'), value: "+12.8%", detail: t('kpi.cash_flow_desc'), icon: LineChart, state: "text-emerald-300" },
  ];
  
  return (
    <main className="min-h-screen bg-[#0B0F19] text-[#F8FAFC]">
      <section className="relative min-h-screen overflow-hidden border-b border-[#243041]">
        <DataField />
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <LogoMark />
            <span className="text-lg font-bold tracking-tight">TerraIQ</span>
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/demo" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white">{t('nav.demo')}</Link>
            <Link href="/crm" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white">{t('nav.workspace')}</Link>
            <Link href="/pricing" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white">{t('nav.plans')}</Link>
            <Link href="/admin" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white">{t('nav.admin')}</Link>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => i18n.changeLanguage(i18n.language === 'bg' ? 'en' : 'bg')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors bg-[#131A26] px-2 py-1.5 rounded-md border border-[#243041]"
            >
              <Globe size={14} />
              <span className={i18n.language !== 'bg' ? 'text-cyan-300' : ''}>EN</span>
              <span className="opacity-50">|</span>
              <span className={i18n.language === 'bg' ? 'text-cyan-300' : ''}>BG</span>
            </button>
            <Link
              href="/register"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-bold text-neutral-950 transition hover:brightness-110 shadow-[0_0_15px_rgba(0,212,255,0.2)]"
            >
              Регистрация
            </Link>
            <a
              href={`mailto:${contactEmail}?subject=TerraIQ%20demo%20request`}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-[#0B0F19]"
            >
              {t('nav.request_demo')}
              <ExternalLink size={16} />
            </a>
          </div>
        </nav>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-84px)] max-w-7xl items-center px-5 py-12 sm:px-8">
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="mx-auto max-w-5xl text-center">
            <motion.p variants={itemVariants} className="mx-auto mb-8 flex w-fit items-center gap-3 rounded-full border border-[#243041] bg-[#131A26]/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200 backdrop-blur">
              <Network size={15} />
              {t('hero.subtitle')}
            </motion.p>
            <motion.div variants={itemVariants} className="mx-auto mb-7 flex justify-center">
              <LogoMark />
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-6xl font-black tracking-tight sm:text-7xl lg:text-8xl">
              {t('hero.title')}<span className="text-cyan-300 glow-text">{t('hero.title_hl')}</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-5 text-2xl font-semibold text-slate-200 sm:text-3xl">
              {t('hero.desc1')}<br className="sm:hidden" /> {t('hero.desc2')}
            </motion.p>
            <motion.p variants={itemVariants} className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              AI-native decision intelligence across energy, metals, agriculture, and finance. <br />
              Web3-powered settlement via smart contract escrow.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-10 flex flex-wrap justify-center gap-3">
              <a
                href={`mailto:${contactEmail}?subject=TerraIQ%20demo%20request`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#00D4FF] px-6 py-4 font-bold text-[#0B0F19] transition hover:bg-cyan-200"
              >
                {t('hero.btn_request')}
                <ArrowRight size={18} />
              </a>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-lg border border-[#243041] bg-[#131A26]/70 px-6 py-4 font-bold text-white transition hover:border-cyan-300/70 hover:text-cyan-200"
              >
                {t('hero.btn_demo')}
                <Sparkles size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="platform" className="mx-auto grid max-w-7xl gap-6 px-5 py-14 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{t('platform.kpi_title')}</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{t('platform.title')}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{t('platform.desc')}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-200">
            <CheckCircle2 size={16} />
            {t('platform.status')}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {executiveKpis.map(({ label, value, detail, icon: Icon, state }) => (
            <section key={label} className="rounded-lg border border-[#243041] bg-[#131A26] p-5 shadow-2xl shadow-black/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
                  <p className="mt-4 text-3xl font-bold">{value}</p>
                  <p className={`mt-2 text-sm font-semibold ${state}`}>{detail}</p>
                </div>
                <span className="rounded-lg border border-[#243041] bg-[#0B0F19] p-2 text-cyan-300"><Icon size={20} /></span>
              </div>
            </section>
          ))}
        </div>

        <section className="rounded-lg border border-[#243041] bg-[#131A26] p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold">Executive KPIs</h3>
            <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Profit / Risk / Actions / Growth</span>
          </div>
          <div className="flex h-52 items-end gap-3 border-b border-l border-[#243041] px-4 pb-4">
            {chartBars.map((height, index) => (
              <span
                key={index}
                className="flex-1 rounded-t bg-gradient-to-t from-cyan-500/35 to-cyan-200 shadow-[0_0_18px_rgba(0,212,255,0.18)]"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <span>0</span><span>65</span><span>130</span><span>260</span>
          </div>
        </section>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-[#243041] bg-[#131A26] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">AI Intelligence Workspace</p>
          <h2 className="mt-3 text-3xl font-bold">TerraIQ Intelligence</h2>
          <div className="my-6 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
          <p className="text-3xl font-semibold leading-tight text-white sm:text-4xl">How do I increase my profit in 2027?</p>
          <Link href="/crm" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#00D4FF] px-5 py-3 font-bold text-[#0B0F19] transition hover:bg-cyan-200">
            Analyze
            <Brain size={18} />
          </Link>
        </div>

        <div className="rounded-lg border border-[#243041] bg-[#131A26] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-xl font-bold">Recommended Actions</h3>
            <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-300">Strategy Agent</span>
          </div>
          <div className="grid gap-3">
            {intelligenceActions.map(({ title, impact, icon: Icon }, index) => (
              <div key={title} className="flex items-center justify-between gap-4 rounded-lg border border-[#243041] bg-[#0B0F19] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-300">{index + 1}</span>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-1 text-xs text-slate-500">Decision Memory ready</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 text-lg font-bold text-emerald-300"><Icon size={17} />{impact}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-14 sm:px-8 xl:grid-cols-[240px_1fr_320px]">
        <aside className="rounded-lg border border-[#243041] bg-[#131A26] p-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Command Center</p>
          <div className="grid gap-2">
            {commandItems.map(({ label, icon: Icon, active }) => (
              <Link key={label} href="/admin" className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${active ? "bg-cyan-300 text-[#0B0F19]" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </div>
        </aside>

        <section className="relative min-h-[420px] overflow-hidden rounded-lg border border-[#243041] bg-[#101722] p-5">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(36,48,65,0.34)_1px,transparent_1px),linear-gradient(90deg,rgba(36,48,65,0.34)_1px,transparent_1px)] bg-[size:42px_42px] opacity-50" />
          <div className="absolute inset-8 rounded-lg border border-cyan-300/15" />
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">3D Farm Map</p>
              <h2 className="mt-3 text-2xl font-bold">Digital operating terrain</h2>
            </div>
            <span className="rounded-lg border border-[#243041] bg-[#0B0F19] px-3 py-2 text-xs font-semibold text-slate-300">Live model v1</span>
          </div>
          <div className="relative z-10 mt-12 grid grid-cols-6 gap-3">
            {Array.from({ length: 36 }).map((_, index) => (
              <span
                key={index}
                className={`h-12 rounded border ${index % 11 === 0 ? "border-amber-300/50 bg-amber-300/15" : index % 7 === 0 ? "border-emerald-300/50 bg-emerald-300/15" : "border-cyan-300/25 bg-cyan-300/8"}`}
              />
            ))}
          </div>
        </section>

        <aside className="rounded-lg border border-[#243041] bg-[#131A26] p-5">
          <div className="mb-5 flex items-center gap-2"><AlertTriangle className="text-amber-300" size={19} /><h3 className="text-xl font-bold">Alerts</h3></div>
          <div className="grid gap-3">
            <div className="rounded-lg border border-red-400/25 bg-red-400/10 p-4"><p className="text-2xl font-bold text-red-300">2</p><p className="text-sm text-slate-300">High Priority</p></div>
            <div className="rounded-lg border border-amber-400/25 bg-amber-400/10 p-4"><p className="text-2xl font-bold text-amber-300">4</p><p className="text-sm text-slate-300">Medium Priority</p></div>
            <div className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 p-4"><p className="text-2xl font-bold text-cyan-300">12</p><p className="text-sm text-slate-300">Recommendations</p></div>
          </div>
        </aside>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-14 sm:px-8 lg:grid-cols-2">
        <div className="rounded-lg border border-[#243041] bg-[#131A26] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Digital Twin</p>
          <h2 className="mt-3 text-3xl font-bold">Scenario Simulation</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-[#243041] bg-[#0B0F19] p-5"><p className="text-sm text-slate-400">Current Strategy</p><p className="mt-3 text-3xl font-bold">EUR 2.4M</p></div>
            <div className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-5"><p className="text-sm text-slate-300">Alternative Strategy</p><p className="mt-3 text-3xl font-bold text-emerald-300">EUR 2.9M</p></div>
          </div>
          <div className="mt-4 rounded-lg border border-cyan-300/25 bg-cyan-300/10 p-5"><p className="text-sm text-slate-300">Difference</p><p className="mt-2 text-4xl font-black text-cyan-200">+ EUR 500,000</p></div>
        </div>

        <div className="rounded-lg border border-[#243041] bg-[#131A26] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Data Foundation</p>
          <h2 className="mt-3 text-3xl font-bold">From data fabric to decisions</h2>
          <div className="mt-6 grid gap-3">
            {["Enterprise Data Foundation", "Real Knowledge Graph", "Agent Mesh", "Real Digital Twin", "Executive Intelligence", "Autonomous Workflows"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-lg border border-[#243041] bg-[#0B0F19] p-4">
                <span className="font-semibold text-white">{item}</span>
                <CheckCircle2 className="text-emerald-300" size={18} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Strategic Operating System</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Built for a EUR 100M agriculture company</h2>
          </div>
          <Link href="/admin" className="inline-flex items-center gap-2 rounded-lg border border-[#243041] bg-[#131A26] px-4 py-3 text-sm font-bold text-white transition hover:border-cyan-300/70 hover:text-cyan-200">
            Admin Control
            <LockKeyhole size={16} />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {strategicCapabilities.map(({ title, text, icon: Icon, href, status }) => (
            <Link key={title} href={href} className="group flex flex-col justify-between rounded-lg border border-[#243041] bg-[#131A26] p-5 transition-all hover:border-cyan-300/70 hover:bg-[#182232] hover:shadow-[0_0_24px_rgba(0,212,255,0.15)]">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#243041] bg-[#0B0F19] text-cyan-300 transition-transform group-hover:scale-110"><Icon size={20} /></span>
                  <span className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold group-hover:border-cyan-300/40 group-hover:text-cyan-300 ${
                    status === 'LIVE'
                      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                      : status === 'BETA'
                      ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                      : 'border-slate-400/30 bg-slate-400/10 text-slate-400'
                  }`}>
                    {status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-200">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400 group-hover:text-slate-300">{text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#243041] px-5 py-6 text-sm text-slate-500 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-cyan-300" />TerraIQ Strategic Operating System</span>
          <span>Transform Data Into Decisions</span>
        </div>
      </footer>
    </main>
  );
}

