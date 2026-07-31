"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Globe,
  Landmark,
  Loader2,
  Radar,
  ShieldCheck,
  Sparkles,
  Wallet,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://terraiq-api.onrender.com";

type DealCheck = { category: string; name: string; status: string; detail: string };
type Deal = {
  commodity?: string;
  quantity_tons?: number;
  price_per_unit?: number;
  currency?: string;
  delivery_terms?: string;
  delivery_port?: string;
  delivery_date?: string;
  buyer_wallet?: string;
  seller_wallet?: string;
  buyer_name?: string;
  seller_name?: string;
  benchmark_source?: string;
};

type DealResult = {
  status?: string;
  inquiry_id?: string;
  deal_status?: string;
  verdict?: string;
  confidence?: number;
  draft?: string;
  trade_id?: string | null;
  kontor21_url?: string | null;
  orchestrator_result?: {
    sales_analysis?: string;
    finance_analysis?: string;
    final_recommendation?: string;
    trade_id?: string | null;
    kontor21_url?: string | null;
    deal?: Deal | null;
    verification?: {
      verdict?: string;
      confidence?: number;
      reasons?: string[];
      checks?: DealCheck[];
    } | null;
  } | null;
};

type DealForm = {
  client_name: string;
  client_email: string;
  requested_crop: string;
  quantity_tons: string;
  destination: string;
  buyer_wallet: string;
  additional_notes: string;
};

const demoFallback: DealResult = {
  status: "success",
  inquiry_id: "demo_inq_001",
  deal_status: "Deal Created",
  verdict: "APPROVED",
  confidence: 0.92,
  trade_id: "demo_trade_0001",
  kontor21_url: "https://kontor21.onrender.com",
  draft:
    "Demo fallback: proceed with the trade. Price is within market range, buyer passes the checks and escrow protects both parties until delivery.",
  orchestrator_result: {
    sales_analysis: "Demo response: Proposed offer 500t wheat CIF Varna at market price with a 14-day delivery window.",
    finance_analysis: "Demo response: FX exposure is low (USDC), logistics cost is within budget, margin is acceptable after escrow fees.",
    final_recommendation:
      "Demo fallback: the deal is approved. Funds go to a kontor21 escrow and are released after delivery confirmation.",
    trade_id: "demo_trade_0001",
    kontor21_url: "https://kontor21.onrender.com",
    deal: {
      commodity: "Wheat",
      quantity_tons: 500,
      price_per_unit: 221,
      currency: "USDC",
      delivery_terms: "CIF",
      delivery_port: "Varna Port",
      delivery_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      buyer_wallet: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
      seller_wallet: "0xA3E5bCfE2fA7D1b2F4e9c8D5b0a9Ef4c2D1b0A7e",
      buyer_name: "AgroTrade Hub EOOD",
      seller_name: "TerraIQ Supply Desk",
      benchmark_source: "sample benchmark",
    },
    verification: {
      verdict: "APPROVED",
      confidence: 0.92,
      reasons: [],
      checks: [
        { category: "deal", name: "Price vs market", status: "PASS", detail: "500t Wheat @ 221 USDC/t — within market range." },
        { category: "buyer", name: "Wallet format", status: "PASS", detail: "Buyer wallet has valid EIP-55 format." },
        { category: "buyer", name: "Trade history", status: "PASS", detail: "New counterparty — acceptable for first deal." },
        { category: "compliance", name: "Sanctions screen", status: "PASS", detail: "No sanctioned keywords in deal context." },
      ],
    },
  },
};

const emptyForm: DealForm = {
  client_name: "AgroTrade Hub EOOD",
  client_email: "buyers@agrotrade.eu",
  requested_crop: "Wheat",
  quantity_tons: "500",
  destination: "Varna Port",
  buyer_wallet: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
  additional_notes: "AI-verified demo trade",
};

const presets: Record<string, DealForm> = {
  clean: emptyForm,
  sanctioned: {
    client_name: "IRAN FOOD IMPORTERS",
    client_email: "orders@irfood.com",
    requested_crop: "Wheat",
    quantity_tons: "900",
    destination: "Bandar Abbas",
    buyer_wallet: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
    additional_notes: "Rush order, cash settlement",
  },
  selfdealing: {
    client_name: "TerraIQ Supply Desk",
    client_email: "ops@terraiq.com",
    requested_crop: "Corn",
    quantity_tons: "400",
    destination: "Constanta Port",
    buyer_wallet: "0xA3E5bCfE2fA7D1b2F4e9c8D5b0a9Ef4c2D1b0A7e",
    additional_notes: "Internal transfer",
  },
};

const crops = ["Wheat", "Corn", "Sunflower", "Rapeseed", "Barley", "Soybean"];

type StepState = "done" | "active" | "blocked" | "pending";

function computeFlow(running: boolean, result: DealResult | null): StepState[] {
  const steps = Array(5).fill("pending");
  if (running) {
    steps[0] = "done";
    steps[1] = "active";
    return steps;
  }
  if (!result) return steps;
  const verdict = result.orchestrator_result?.verification?.verdict ?? result.verdict;
  const escrow = result.orchestrator_result?.kontor21_url ?? result.kontor21_url;
  if (verdict === "REJECTED") {
    for (let i = 0; i < 3; i++) steps[i] = "done";
    for (let i = 3; i < 5; i++) steps[i] = "blocked";
    return steps;
  }
  if (verdict === "MANUAL_REVIEW") {
    for (let i = 0; i < 3; i++) steps[i] = "done";
    for (let i = 3; i < 5; i++) steps[i] = "blocked";
    return steps;
  }
  if (escrow) return steps.map(() => "done");
  for (let i = 0; i < 4; i++) steps[i] = "done";
  steps[4] = "active";
  return steps;
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-[#243041] bg-[#131A26] p-5 ${className}`}>{children}</section>;
}

export default function DemoPage() {
  const { t, i18n } = useTranslation();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<DealResult | null>(null);
  const [fallback, setFallback] = useState(false);
  const [form, setForm] = useState<DealForm>(emptyForm);

  const flowSteps = [t("demo.flow_step_1"), t("demo.flow_step_2"), t("demo.flow_step_3"), t("demo.flow_step_4"), t("demo.flow_step_5")];
  const flowState = computeFlow(running, result);

  const verdict = result?.orchestrator_result?.verification?.verdict ?? result?.verdict;
  const confidence = result?.orchestrator_result?.verification?.confidence ?? result?.confidence;
  const checks = result?.orchestrator_result?.verification?.checks ?? [];
  const reasons = result?.orchestrator_result?.verification?.reasons ?? [];
  const salesAnalysis = result?.orchestrator_result?.sales_analysis;
  const financeAnalysis = result?.orchestrator_result?.finance_analysis;
  const recommendation = result?.orchestrator_result?.final_recommendation ?? result?.draft;
  const deal = result?.orchestrator_result?.deal ?? null;
  const kontor21Url = result?.orchestrator_result?.kontor21_url ?? result?.kontor21_url;
  const total = deal ? (deal.price_per_unit ?? 0) * (deal.quantity_tons ?? 0) : 0;

  const verdictTone =
    verdict === "APPROVED"
      ? { badge: "border-emerald-300/40 bg-emerald-300/10 text-emerald-300", icon: CheckCircle2 }
      : verdict === "REJECTED"
        ? { badge: "border-red-300/40 bg-red-300/10 text-red-300", icon: XCircle }
        : { badge: "border-amber-300/40 bg-amber-300/10 text-amber-300", icon: AlertTriangle };

  const statusTone = (status: string) =>
    status === "PASS"
      ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-300"
      : status === "FAIL"
        ? "border-red-300/30 bg-red-300/10 text-red-300"
        : "border-amber-300/30 bg-amber-300/10 text-amber-300";

  async function runDeal() {
    setRunning(true);
    setResult(null);
    setFallback(false);
    const payload = {
      client_name: form.client_name.trim(),
      client_email: form.client_email.trim(),
      requested_crop: form.requested_crop.trim(),
      quantity_tons: Number(form.quantity_tons),
      destination: form.destination.trim(),
      additional_notes: form.additional_notes.trim(),
      buyer_wallet: form.buyer_wallet.trim(),
    };
    try {
      const res = await fetch(apiBaseUrl + "/crm/inbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as DealResult;
      if (!res.ok) throw new Error(data.draft || "Deal verification failed");
      try {
        const listRes = await fetch(apiBaseUrl + "/crm/inquiries", { cache: "no-store" });
        const list = (await listRes.json()) as { data?: (DealResult & { id: string })[] };
        const record = (list.data || []).find((r) => r.id === data.inquiry_id);
        if (record) data.orchestrator_result = record.orchestrator_result;
      } catch {
        // full record unavailable — keep the summary response
      }
      setResult(data);
    } catch (error) {
      console.error("[demo-deal]", error);
      setResult(demoFallback);
      setFallback(true);
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
            <button
              onClick={() => i18n.changeLanguage(i18n.language === "bg" ? "en" : "bg")}
              className="flex items-center gap-1.5 rounded-md border border-[#243041] bg-[#131A26] px-2 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:text-cyan-300"
            >
              <Globe size={14} />
              <span className={i18n.language !== "bg" ? "text-cyan-300" : ""}>EN</span>
              <span className="opacity-50">|</span>
              <span className={i18n.language === "bg" ? "text-cyan-300" : ""}>BG</span>
            </button>
            <Link href="/pricing" className="rounded-lg border border-[#243041] px-3 py-2 text-sm text-slate-300 hover:text-white">{t("demo.plans")}</Link>
            <Link href="/crm" className="rounded-lg border border-[#243041] px-3 py-2 text-sm text-slate-300 hover:text-white">{t("demo.workspace")}</Link>
            <Link href="/admin" className="rounded-lg border border-[#243041] px-3 py-2 text-sm text-slate-300 hover:text-white">Admin</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{t("demo.badge")}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
              {t("demo.title")}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
              {t("demo.subtitle")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {[
                { label: t("demo.preset_clean"), desc: t("demo.preset_clean_desc"), tone: "border-emerald-300/30 text-emerald-200 hover:bg-emerald-300/10" },
                { label: t("demo.preset_sanction"), desc: t("demo.preset_sanction_desc"), tone: "border-red-300/30 text-red-200 hover:bg-red-300/10" },
                { label: t("demo.preset_selfdealing"), desc: t("demo.preset_selfdealing_desc"), tone: "border-amber-300/30 text-amber-200 hover:bg-amber-300/10" },
              ].map((p, i) => {
                const key = ["clean", "sanctioned", "selfdealing"][i];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm(presets[key])}
                    className={`rounded-lg border bg-transparent px-4 py-3 text-left transition ${p.tone}`}
                  >
                    <span className="block text-sm font-bold">{p.label}</span>
                    <span className="block text-xs opacity-70">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Panel>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-cyan-300/10 p-3 text-cyan-300"><Wallet size={24} /></span>
              <div>
                <p className="text-2xl font-bold">{t("demo.deal_card")}</p>
                <p className="text-sm text-slate-400">{t("demo.deal_card_note")}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-400">{t("demo.buyer")}</span>
                <input
                  className="w-full rounded-lg border border-[#243041] bg-[#0B0F19] px-3 py-2 text-sm outline-none focus:border-[#00D4FF]"
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-400">{t("demo.email")}</span>
                <input
                  className="w-full rounded-lg border border-[#243041] bg-[#0B0F19] px-3 py-2 text-sm outline-none focus:border-[#00D4FF]"
                  value={form.client_email}
                  onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-400">{t("demo.commodity")}</span>
                <select
                  className="w-full rounded-lg border border-[#243041] bg-[#0B0F19] px-3 py-2 text-sm outline-none focus:border-[#00D4FF]"
                  value={form.requested_crop}
                  onChange={(e) => setForm({ ...form, requested_crop: e.target.value })}
                >
                  {crops.map((crop) => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-400">{t("demo.quantity")}</span>
                <input
                  type="number"
                  min="1"
                  className="w-full rounded-lg border border-[#243041] bg-[#0B0F19] px-3 py-2 text-sm outline-none focus:border-[#00D4FF]"
                  value={form.quantity_tons}
                  onChange={(e) => setForm({ ...form, quantity_tons: e.target.value })}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-slate-400">{t("demo.destination")}</span>
                <input
                  className="w-full rounded-lg border border-[#243041] bg-[#0B0F19] px-3 py-2 text-sm outline-none focus:border-[#00D4FF]"
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-slate-400">{t("demo.buyer_wallet")}</span>
                <input
                  className="w-full rounded-lg border border-[#243041] bg-[#0B0F19] px-3 py-2 font-mono text-xs outline-none focus:border-[#00D4FF]"
                  value={form.buyer_wallet}
                  onChange={(e) => setForm({ ...form, buyer_wallet: e.target.value })}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-slate-400">{t("demo.notes")}</span>
                <input
                  className="w-full rounded-lg border border-[#243041] bg-[#0B0F19] px-3 py-2 text-sm outline-none focus:border-[#00D4FF]"
                  value={form.additional_notes}
                  onChange={(e) => setForm({ ...form, additional_notes: e.target.value })}
                />
              </label>
            </div>
            <button
              type="button"
              onClick={runDeal}
              disabled={running}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#00D4FF] px-6 py-4 font-bold text-[#0B0F19] transition hover:bg-cyan-200 disabled:opacity-60"
            >
              {running ? (
                <>
                  {t("demo.running")}
                  <Loader2 size={18} className="animate-spin" />
                </>
              ) : (
                <>
                  {t("demo.run")}
                  <Radar size={18} />
                </>
              )}
            </button>
          </Panel>
        </div>

        {(running || result) && (
          <Panel className="border-cyan-300/35 bg-cyan-300/10">
            <div className="mb-4 flex items-center gap-2"><Radar className="text-cyan-200" /><h2 className="text-xl font-bold">{t("demo.flow_title")}</h2></div>
            {fallback ? (
              <p className="mb-4 rounded-lg border border-amber-300/25 bg-amber-300/10 p-3 text-sm font-semibold text-amber-100">
                {t("demo.fallback_note")}
              </p>
            ) : result && !running ? (
              <p className="mb-4 rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-3 text-sm font-semibold text-emerald-200">
                {t("demo.backends_status", { status: result.deal_status || verdict || "completed" })}
              </p>
            ) : null}
            <div className="grid gap-3 md:grid-cols-5">
              {flowSteps.map((step, index) => {
                const state = flowState[index];
                const tone =
                  state === "done"
                    ? "border-emerald-300/40 bg-emerald-300/10"
                    : state === "active"
                      ? "border-cyan-300/60 bg-cyan-300/15 animate-pulse"
                      : state === "blocked"
                        ? "border-red-300/30 bg-red-300/5 opacity-70"
                        : "border-[#243041] bg-[#0B0F19] opacity-50";
                return (
                  <div key={step} className={`rounded-lg border p-4 ${tone}`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">0{index + 1}</p>
                    <p className="mt-2 text-sm font-bold">
                      {state === "done" ? "✓ " : state === "blocked" ? "✗ " : ""}{step}
                    </p>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}

        {result && !running && (
          <>
            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <Panel>
                <div className="mb-5 flex items-center gap-2"><ShieldCheck className="text-cyan-300" /><h2 className="text-2xl font-bold">{t("demo.verification_title")}</h2></div>
                <div className="rounded-lg border border-[#243041] bg-[#0B0F19] p-5">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-lg font-black ${verdictTone.badge}`}>
                      <verdictTone.icon size={20} />
                      {verdict === "APPROVED"
                        ? t("demo.approved")
                        : verdict === "REJECTED"
                          ? t("demo.rejected")
                          : t("demo.manual_review")}
                    </span>
                    <span className="text-sm text-slate-400">
                      {t("demo.confidence")}: <strong className="text-white">{confidence != null ? Math.round(confidence * 100) + "%" : "—"}</strong>
                    </span>
                  </div>
                  {reasons.length > 0 ? (
                    <ul className="mt-4 space-y-1">
                      {reasons.slice(0, 5).map((reason, i) => (
                        <li key={i} className="text-sm leading-6 text-slate-300">{reason}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                {checks.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {checks.map((check, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-[#243041] bg-[#0B0F19] p-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white">{check.name}</p>
                          <p className="truncate text-xs text-slate-400">{check.detail}</p>
                        </div>
                        <span className={`h-fit shrink-0 rounded-md border px-2 py-0.5 text-xs font-bold ${statusTone(check.status)}`}>{check.status}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </Panel>

              <Panel>
                <div className="mb-5 flex items-center gap-2"><CircleDollarSign className="text-cyan-300" /><h2 className="text-2xl font-bold">{t("demo.deal_title")}</h2></div>
                <div className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-5">
                  <p className="text-sm text-slate-300">{deal?.commodity || "—"}</p>
                  <p className="mt-2 text-4xl font-black text-emerald-300">
                    {total.toLocaleString()} <span className="text-lg">USDC</span>
                  </p>
                  <p className="mt-2 text-sm text-emerald-200">
                    {deal?.quantity_tons || 0} t × {deal?.price_per_unit ?? 0} USDC/t
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: t("demo.market_ref"), value: `${deal?.price_per_unit ?? "—"} USDC/t${deal?.benchmark_source ? " · " + deal.benchmark_source : ""}` },
                    { label: t("demo.total_value"), value: total.toLocaleString() + " USDC" },
                    { label: t("demo.delivery"), value: `${deal?.delivery_terms || "—"} ${deal?.delivery_port || ""}` },
                    { label: t("demo.quantity"), value: `${deal?.quantity_tons ?? 0} t` },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-[#243041] bg-[#0B0F19] p-3">
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className="mt-1 text-sm font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg border border-[#243041] bg-[#0B0F19] p-4 font-mono text-xs leading-6 text-slate-400">
                  <p>{t("demo.buyer_label")}: <span className="text-slate-200">{deal?.buyer_wallet || "—"}</span></p>
                  <p>{t("demo.seller")}: <span className="text-slate-200">{deal?.seller_wallet || "—"}</span></p>
                  {deal?.delivery_date ? (
                    <p>ETA: <span className="text-slate-200">{deal.delivery_date}</span></p>
                  ) : null}
                </div>
              </Panel>
            </div>

            <Panel>
              <div className="mb-5 flex items-center gap-2"><Briefcase className="text-cyan-300" /><h2 className="text-2xl font-bold">{t("demo.agents_title")}</h2></div>
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-lg border border-[#243041] border-l-2 border-l-indigo-500 bg-[#0B0F19] p-4">
                  <p className="mb-1 font-mono text-[10px] tracking-widest text-indigo-400">{t("demo.sales_agent")}</p>
                  <p className="text-sm leading-6 text-slate-300">{salesAnalysis || "—"}</p>
                </div>
                <div className="rounded-lg border border-[#243041] border-l-2 border-l-amber-500 bg-[#0B0F19] p-4">
                  <p className="mb-1 font-mono text-[10px] tracking-widest text-amber-400">{t("demo.finance_agent")}</p>
                  <p className="text-sm leading-6 text-slate-300">{financeAnalysis || "—"}</p>
                </div>
                <div className="rounded-lg border border-[#243041] border-l-2 border-l-cyan-500 bg-[#0B0F19] p-4">
                  <p className="mb-1 flex items-center gap-1 font-mono text-[10px] tracking-widest text-cyan-400"><FileText size={12} />{t("demo.recommendation")}</p>
                  <p className="text-sm leading-6 text-slate-300">{recommendation || "—"}</p>
                </div>
              </div>
            </Panel>

            <Panel className={kontor21Url ? "border-emerald-300/35 bg-emerald-300/10" : ""}>
              <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div>
                  <div className="mb-3 flex items-center gap-2"><Landmark className="text-emerald-300" /><h2 className="text-2xl font-bold">{t("demo.escrow_title")}</h2></div>
                  <p className="text-sm leading-6 text-slate-300">
                    {kontor21Url ? t("demo.escrow_ready") : t("demo.escrow_waiting")}
                  </p>
                </div>
                {kontor21Url ? (
                  <a
                    href={kontor21Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-300 px-5 py-3 font-bold text-[#0B0F19] transition hover:bg-emerald-200"
                  >
                    <Landmark size={18} />
                    {t("demo.open_deal")}
                    <ArrowRight size={18} />
                  </a>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#243041] px-5 py-3 font-bold text-slate-500"
                  >
                    <LockIcon />
                    {t("demo.escrow_waiting")}
                  </button>
                )}
              </div>
            </Panel>
          </>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-[#243041] px-5 py-3 font-bold text-white hover:border-cyan-300/60">{t("demo.back")}</Link>
          <Link href="/crm" className="inline-flex items-center gap-2 rounded-lg bg-[#00D4FF] px-5 py-3 font-bold text-[#0B0F19]">{t("demo.workspace")} <Sparkles size={18} /></Link>
          <Link href="/pricing" className="inline-flex items-center gap-2 rounded-lg border border-[#243041] px-5 py-3 font-bold text-white hover:border-cyan-300/60"><BarChart3 size={18} />{t("demo.plans")}</Link>
        </div>
      </section>
    </main>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
