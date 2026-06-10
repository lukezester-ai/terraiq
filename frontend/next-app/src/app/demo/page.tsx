"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  CloudSun,
  FileText,
  Landmark,
  LineChart,
  Map,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Sprout,
  Truck,
} from "lucide-react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";

const flow = ["Data", "Analysis", "Risk", "Simulation", "Recommendation", "Action"];

const risks = [
  { label: "Climate risk", value: 78, icon: CloudSun },
  { label: "Market risk", value: 69, icon: BarChart3 },
  { label: "Operational risk", value: 54, icon: Truck },
  { label: "Financial risk", value: 81, icon: CircleDollarSign },
];

const market = [
  { label: "Wheat", value: "EUR 221/t", trend: "-4.6%", tone: "text-red-300" },
  { label: "Sunflower", value: "EUR 417/t", trend: "+3.1%", tone: "text-emerald-300" },
  { label: "Corn", value: "EUR 188/t", trend: "+0.8%", tone: "text-cyan-300" },
  { label: "Diesel", value: "EUR 1.42/l", trend: "+5.4%", tone: "text-amber-300" },
  { label: "Urea", value: "EUR 392/t", trend: "-7.8%", tone: "text-emerald-300" },
];

const actions = [
  { title: "Delay wheat sale until October", impact: "+3.4% margin" },
  { title: "Activate hail insurance review", impact: "lower downside" },
  { title: "Lock fertilizer quote", impact: "+4.8% savings" },
  { title: "Switch Block 12 scenario", impact: "+6.2% contribution" },
];

const eventSteps = [
  "Kafka event emitted: hailstorm.warning",
  "Risk Agent calculated HIGH overall risk: 72",
  "Digital Twin simulated EUR 500,000 strategy delta",
  "Finance Agent estimated liquidity pressure and expected uplift",
  "Dashboard generated approval-ready recommendation",
];

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-[#243041] bg-[#131A26] p-5 ${className}`}>{children}</section>;
}

export default function DemoPage() {
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null);

  async function runSimulation() {
    setRunning(true);
    setCompleted(false);
    setSimulationError(null);
    setSimulationStatus(null);

    try {
      const response = await fetch(`${apiBaseUrl}/intelligence/crisis-simulation/run`, {
        method: "POST",
      });
      const data = (await response.json()) as { event_status?: string; status?: string; detail?: string };
      if (!response.ok) {
        throw new Error(data.detail || "Simulation failed");
      }
      setSimulationStatus(data.event_status || data.status || "completed");
      setCompleted(true);
    } catch (error) {
      console.error("[crisis-simulation]", error);
      setSimulationError("Backend simulation is unavailable. Showing the demo flow with static seed data.");
      setCompleted(true);
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0F19] text-[#F8FAFC]">
      <header className="border-b border-[#243041] bg-[#0B0F19]/95 px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="font-bold text-white">TerraIQ</Link>
          <div className="flex items-center gap-2">
            <Link href="/crm" className="rounded-lg border border-[#243041] px-3 py-2 text-sm text-slate-300 hover:text-white">AI Workspace</Link>
            <Link href="/admin" className="rounded-lg border border-[#243041] px-3 py-2 text-sm text-slate-300 hover:text-white">Admin</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Phase 5: Investor-Ready Demo</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
              Crisis simulation for Terra Holding.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
              A 12,400 dka farm faces hail risk, wheat price pressure and cash-flow squeeze.
              TerraIQ receives an event, analyzes risk, simulates financial effect and proposes a management decision.
            </p>
            <button
              type="button"
              onClick={runSimulation}
              disabled={running}
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#00D4FF] px-6 py-4 font-bold text-[#0B0F19] transition hover:bg-cyan-200 disabled:opacity-60"
            >
              {running ? "Running Simulation..." : "Run Crisis Simulation"}
              <RadioTower size={18} />
            </button>
          </div>
          <Panel>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-cyan-300/10 p-3 text-cyan-300"><Landmark size={24} /></span>
              <div>
                <p className="text-2xl font-bold">Terra Holding</p>
                <p className="text-sm text-slate-400">Seed data for investor/client demo</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {["18 fields", "12,400 dka", "14 machines", "wheat, corn, sunflower", "EUR 3.8M expected revenue"].map((item) => (
                <div key={item} className="rounded-lg border border-[#243041] bg-[#0B0F19] p-3 text-sm font-semibold text-slate-200">{item}</div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel>
          <div className="grid gap-3 md:grid-cols-6">
            {flow.map((step, index) => (
              <div key={step} className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">0{index + 1}</p>
                <p className="mt-2 text-lg font-bold">{step}</p>
              </div>
            ))}
          </div>
        </Panel>

        {(running || completed) && (
          <Panel className="border-cyan-300/35 bg-cyan-300/10">
            <div className="mb-4 flex items-center gap-2"><RadioTower className="text-cyan-200" /><h2 className="text-xl font-bold">Crisis Simulation Flow</h2></div>
            {simulationStatus ? (
              <p className="mb-4 rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-3 text-sm font-semibold text-emerald-200">
                Backend event status: {simulationStatus}
              </p>
            ) : null}
            {simulationError ? (
              <p className="mb-4 rounded-lg border border-amber-300/25 bg-amber-300/10 p-3 text-sm font-semibold text-amber-100">
                {simulationError}
              </p>
            ) : null}
            <div className="grid gap-3 md:grid-cols-5">
              {eventSteps.map((step, index) => (
                <div key={step} className="rounded-lg border border-cyan-300/25 bg-[#0B0F19] p-4 text-sm leading-6 text-slate-300">
                  <p className="mb-2 text-xs font-bold text-cyan-200">STEP {index + 1}</p>
                  {step}
                </div>
              ))}
            </div>
          </Panel>
        )}

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel>
            <div className="mb-5 flex items-center gap-2"><AlertTriangle className="text-red-300" /><h2 className="text-2xl font-bold">Risk Agent</h2></div>
            <div className="rounded-lg border border-red-400/25 bg-red-400/10 p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-red-200">Overall risk</p>
              <p className="mt-2 text-6xl font-black text-red-300">72</p>
              <p className="mt-2 font-bold text-red-200">HIGH</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">Expected hail window plus weak wheat price and low cash reserve before debt service.</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {risks.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-lg border border-[#243041] bg-[#0B0F19] p-4">
                  <Icon className="text-cyan-300" size={18} />
                  <p className="mt-3 text-sm text-slate-400">{label}</p>
                  <p className="mt-1 text-2xl font-bold">{value}%</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="mb-5 flex items-center gap-2"><LineChart className="text-cyan-300" /><h2 className="text-2xl font-bold">Market Agent</h2></div>
            <div className="grid gap-3 sm:grid-cols-5">
              {market.map((item) => (
                <div key={item.label} className="rounded-lg border border-[#243041] bg-[#0B0F19] p-4">
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-xl font-bold">{item.value}</p>
                  <p className={`mt-2 text-sm font-bold ${item.tone}`}>{item.trend}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
              Signal: fertilizer is favorable, wheat selling pressure is unfavorable, diesel is increasing logistics cost.
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <div className="mb-5 flex items-center gap-2"><Sprout className="text-emerald-300" /><h2 className="text-2xl font-bold">Digital Twin Simulation</h2></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[#243041] bg-[#0B0F19] p-5"><p className="text-sm text-slate-400">Current strategy</p><p className="mt-3 text-3xl font-bold">EUR 2.4M</p><p className="mt-2 text-red-300">Risk 72 / strained cash</p></div>
              <div className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-5"><p className="text-sm text-slate-300">Alternative strategy</p><p className="mt-3 text-3xl font-bold text-emerald-300">EUR 2.9M</p><p className="mt-2 text-emerald-200">Risk 49 / stable cash</p></div>
            </div>
            <div className="mt-4 rounded-lg border border-cyan-300/25 bg-cyan-300/10 p-5"><p className="text-sm text-slate-300">Difference</p><p className="mt-2 text-4xl font-black text-cyan-200">+ EUR 500,000</p></div>
          </Panel>

          <Panel>
            <div className="mb-5 flex items-center gap-2"><ClipboardCheck className="text-cyan-300" /><h2 className="text-2xl font-bold">AI Recommendation Panel</h2></div>
            <div className="grid gap-3">
              {actions.map((action, index) => (
                <div key={action.title} className="flex items-center justify-between gap-4 rounded-lg border border-[#243041] bg-[#0B0F19] p-4">
                  <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300 text-[#0B0F19] font-bold">{index + 1}</span><p className="font-semibold">{action.title}</p></div>
                  <span className="font-bold text-emerald-300">{action.impact}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel>
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="mb-5 flex items-center gap-2"><FileText className="text-cyan-300" /><h2 className="text-2xl font-bold">AI Decision Report</h2></div>
              <div className="grid gap-4 text-sm leading-6 text-slate-300">
                <p><strong className="text-white">Executive Summary:</strong> Avoid forced wheat selling, protect downside weather exposure and use fertilizer price drop to improve 2027 margin.</p>
                <p><strong className="text-white">Risk Analysis:</strong> HIGH overall risk caused by hail exposure, wheat price decline and weak 90-day liquidity.</p>
                <p><strong className="text-white">Financial Impact:</strong> Alternative strategy increases expected profit from EUR 2.4M to EUR 2.9M.</p>
                <p><strong className="text-white">Recommended Actions:</strong> delay wheat sale, review insurance, lock fertilizer quote, move Block 12 to agronomist approval.</p>
                <p><strong className="text-white">Expected ROI:</strong> +20.8% profit improvement versus current strategy.</p>
              </div>
            </div>
            <div className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-5">
              <ShieldCheck className="text-emerald-300" size={28} />
              <h3 className="mt-4 text-xl font-bold">Action Approval</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">Approve strategy package and create tasks for finance, agronomy and legal review.</p>
              <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-3 font-bold text-[#0B0F19]">
                Approve Action Plan
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </Panel>

        <div className="flex flex-wrap gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-[#243041] px-5 py-3 font-bold text-white hover:border-cyan-300/60">Back to Landing</Link>
          <Link href="/crm" className="inline-flex items-center gap-2 rounded-lg bg-[#00D4FF] px-5 py-3 font-bold text-[#0B0F19]">Open AI Workspace <Sparkles size={18} /></Link>
        </div>
      </section>
    </main>
  );
}
