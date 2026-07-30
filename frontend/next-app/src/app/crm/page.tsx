"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bot, Briefcase, CheckCircle2, Globe, MessageSquare, RefreshCw, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

type Inquiry = {
  id: string;
  timestamp: string | null;
  status: string;
  inquiry: {
    client_name: string;
    client_email: string;
    requested_crop: string;
    quantity_tons: number;
    destination: string;
    additional_notes?: string;
  };
  orchestrator_result?: {
    final_recommendation?: string;
    finance_analysis?: string;
    sales_analysis?: string;
  } | null;
};

type InquiryResponse = {
  status: string;
  data?: Inquiry[];
};

type InquiryForm = {
  client_name: string;
  client_email: string;
  requested_crop: string;
  quantity_tons: string;
  destination: string;
  additional_notes: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://terraiq-api.onrender.com";

const demoInquiry: Inquiry = {
  id: "demo_inq_001",
  timestamp: new Date().toISOString(),
  status: "Demo fallback",
  inquiry: {
    client_name: "AgroTrade Hub",
    client_email: "buyers@agrotrade.eu",
    requested_crop: "Wheat",
    quantity_tons: 500,
    destination: "Varna Port",
    additional_notes: "Fallback data because FastAPI backend is not available.",
  },
  orchestrator_result: {
    sales_analysis: "Demo response: Proposed offer 500t wheat FOB Varna.",
    finance_analysis: "Demo response: Analyzed margins, logistics, FX risk and pricing.",
    final_recommendation:
      "This is a demo fallback. Start FastAPI and Postgres, apply migrations and submit a real CRM inquiry to use AI.",
  },
};

const emptyForm: InquiryForm = {
  client_name: "",
  client_email: "",
  requested_crop: "Wheat",
  quantity_tons: "500",
  destination: "Varna Port",
  additional_notes: "",
};

export default function CRMDashboard() {
  const { t, i18n } = useTranslation();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState(t("crm.loading"));
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [form, setForm] = useState<InquiryForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "lukezester@gmail.com";

  const quickPrompts = [
    t("crm.prompt_1"),
    t("crm.prompt_2"),
    t("crm.prompt_3"),
    t("crm.prompt_4"),
  ];

  const activeContext = useMemo(() => {
    const first = inquiries[0];
    if (!first) return t("crm.empty");
    return (
      "CRM record: " +
      first.inquiry.client_name +
      " wants " +
      first.inquiry.quantity_tons +
      "t " +
      first.inquiry.requested_crop +
      " to " +
      first.inquiry.destination +
      ". Status: " +
      first.status +
      "."
    );
  }, [inquiries, t]);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiBaseUrl + "/crm/inquiries", { cache: "no-store" });
      const data = (await res.json()) as InquiryResponse;
      if (!res.ok || data.status !== "success") throw new Error("CRM API failed");
      const records = data.data || [];
      setInquiries(records);
      setAiStatus(
        records.length
          ? t("crm.connected")
          : t("crm.empty_status"),
      );
    } catch (error) {
      console.error("[crm-load]", error);
      setInquiries([demoInquiry]);
      setAiStatus(t("crm.unavailable"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInquiries();
  }, []);

  const submitInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setAiStatus(t("crm.submitting_status"));
    try {
      const payload = {
        client_name: form.client_name.trim(),
        client_email: form.client_email.trim(),
        requested_crop: form.requested_crop.trim(),
        quantity_tons: Number(form.quantity_tons),
        destination: form.destination.trim(),
        additional_notes: form.additional_notes.trim(),
      };
      const res = await fetch(apiBaseUrl + "/crm/inbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "CRM submit failed");
      setForm(emptyForm);
      setAiStatus(
        data.status === "failed"
          ? t("crm.failed_no_draft")
          : t("crm.accepted"),
      );
      await loadInquiries();
    } catch (error) {
      console.error("[crm-submit]", error);
      setAiStatus(t("crm.submit_error"));
    } finally {
      setSubmitting(false);
    }
  };

  const askTerraIq = async () => {
    const q = question.trim();
    if (!q) return;

    setAsking(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          context:
            activeContext +
            " Context comes from active inquiries. For real live data connect the backend when available.",
        }),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      if (!res.ok || !data.answer) throw new Error(data.error || "AI failed");
      setAnswer(data.answer);
    } catch (error) {
      console.error("[crm-ask-ai]", error);
      setAnswer(t("crm.ai_error"));
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--background)] p-8 font-sans text-[var(--foreground)]">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center gap-4 border-b border-[var(--border-glass)] pb-6">
          <div className="rounded-xl border border-[var(--border-glass)] bg-[var(--card)] p-3">
            <Briefcase className="text-[var(--accent)]" size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-wide">{t("crm.title")}</h1>
            <p className="mt-1 text-sm text-[var(--secondary)]">{t("crm.subtitle")}</p>
            <p className="mt-2 text-xs text-[var(--accent)]">{aiStatus}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => i18n.changeLanguage(i18n.language === "bg" ? "en" : "bg")}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors bg-[#131A26] px-2 py-1.5 rounded-md border border-[#243041]"
            >
              <Globe size={14} />
              <span className={i18n.language !== "bg" ? "text-cyan-300" : ""}>EN</span>
              <span className="opacity-50">|</span>
              <span className={i18n.language === "bg" ? "text-cyan-300" : ""}>BG</span>
            </button>
            <button
              type="button"
              onClick={loadInquiries}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <RefreshCw size={14} />
              {t("crm.refresh")}
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center gap-3 text-[var(--secondary)]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            {t("crm.loading")}
          </div>
        ) : (
          <div className="grid gap-8">
            <section className="glass-panel rounded-2xl p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">{t("crm.new_inquiry")}</h2>
              <form onSubmit={submitInquiry} className="grid gap-3 md:grid-cols-2">
                <input
                  className="rounded-lg border border-[var(--border-glass)] bg-black/30 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
                  placeholder={t("crm.client")}
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  required
                />
                <input
                  className="rounded-lg border border-[var(--border-glass)] bg-black/30 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
                  placeholder={t("crm.email")}
                  type="email"
                  value={form.client_email}
                  onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                  required
                />
                <input
                  className="rounded-lg border border-[var(--border-glass)] bg-black/30 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
                  placeholder={t("crm.crop")}
                  value={form.requested_crop}
                  onChange={(e) => setForm({ ...form, requested_crop: e.target.value })}
                  required
                />
                <input
                  className="rounded-lg border border-[var(--border-glass)] bg-black/30 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
                  placeholder={t("crm.tons")}
                  type="number"
                  min="1"
                  value={form.quantity_tons}
                  onChange={(e) => setForm({ ...form, quantity_tons: e.target.value })}
                  required
                />
                <input
                  className="rounded-lg border border-[var(--border-glass)] bg-black/30 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
                  placeholder={t("crm.destination")}
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  required
                />
                <input
                  className="rounded-lg border border-[var(--border-glass)] bg-black/30 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
                  placeholder={t("crm.notes")}
                  value={form.additional_notes}
                  onChange={(e) => setForm({ ...form, additional_notes: e.target.value })}
                />
                <button
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#00bfff] disabled:opacity-50 md:col-span-2"
                >
                  <Send size={16} />
                  {submitting ? t("crm.submitting") : t("crm.submit")}
                </button>
              </form>
            </section>

            <section className="glass-panel rounded-2xl p-6">
              <div className="mb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-white">{t("crm.ask_title")}</h2>
                  <a
                    href={"mailto:" + contactEmail + "?subject=TerraIQ%20CRM%20contact"}
                    className="rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-2 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-black"
                  >
                    {t("crm.contact")}
                  </a>
                </div>
                <p className="mt-1 text-sm text-[var(--secondary)]">
                  {t("crm.ask_placeholder")}
                </p>
              </div>
              <div className="grid gap-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setQuestion(prompt)}
                      className="rounded-xl border border-[var(--border-glass)] bg-white/[0.03] p-3 text-left text-xs leading-5 text-[var(--secondary)] transition hover:border-[var(--accent)] hover:text-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-[var(--border-glass)] bg-black/30 p-4 text-sm text-white outline-none placeholder:text-[var(--secondary)] focus:border-[var(--accent)]"
                  placeholder={t("crm.ask_example")}
                />
                <button
                  onClick={askTerraIq}
                  disabled={asking || !question.trim()}
                  className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#00bfff] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {asking ? t("crm.thinking") : t("crm.ask_button")}
                </button>
                {answer ? (
                  <div className="rounded-xl border border-[var(--border-glass)] bg-black/40 p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
                      {t("crm.answer")}
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-[var(--secondary)]">
                      {answer}
                    </pre>
                  </div>
                ) : null}
              </div>
            </section>

            {inquiries.length === 0 ? (
              <div className="rounded-xl border border-[var(--border-glass)] bg-black/30 p-5 text-sm text-[var(--secondary)]">
                {t("crm.empty")}
              </div>
            ) : null}

            {inquiries.map((inq) => (
              <div key={inq.id} className="glass-panel flex flex-col gap-6 rounded-2xl p-6">
                <div className="flex justify-between gap-4 border-b border-[var(--border-glass)] pb-4">
                  <div>
                    <h2 className="text-xl font-medium text-white">{inq.inquiry.client_name}</h2>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--secondary)]">
                      <span>
                        {t("crm.demand")}:{" "}
                        <strong className="text-white">
                          {inq.inquiry.quantity_tons}t {inq.inquiry.requested_crop}
                        </strong>
                      </span>
                      <span>
                        {t("crm.dest")}: <strong className="text-white">{inq.inquiry.destination}</strong>
                      </span>
                    </div>
                  </div>
                  <span className="h-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-400">
                    {inq.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-[var(--border-glass)] bg-black/30 p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
                      <Bot size={16} className="text-[var(--accent)]" /> {t("crm.agent_strategy")}
                    </h3>
                    <div className="space-y-4">
                      <div className="rounded-lg border border-[var(--border-glass)] border-l-2 border-l-indigo-500 bg-[var(--card)]/50 p-3">
                        <div className="mb-1 font-mono text-[10px] tracking-widest text-indigo-400">
                          {t("crm.sales_agent")}
                        </div>
                        <p className="text-sm leading-relaxed text-[var(--secondary)]">
                          {inq.orchestrator_result?.sales_analysis || t("crm.no_sales")}
                        </p>
                      </div>
                      <div className="rounded-lg border border-[var(--border-glass)] border-l-2 border-l-amber-500 bg-[var(--card)]/50 p-3">
                        <div className="mb-1 font-mono text-[10px] tracking-widest text-amber-400">
                          {t("crm.finance_agent")}
                        </div>
                        <p className="text-sm leading-relaxed text-[var(--secondary)]">
                          {inq.orchestrator_result?.finance_analysis || t("crm.no_finance")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col rounded-xl border border-[var(--border-glass)] bg-[var(--card)] p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
                      <MessageSquare size={16} className="text-[var(--accent)]" /> {t("crm.generated_draft")}
                    </h3>
                    <div className="flex-1 overflow-auto rounded-lg border border-[var(--border-glass)] bg-black/50 p-4">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--secondary)]">
                        {inq.orchestrator_result?.final_recommendation || t("crm.no_draft")}
                      </pre>
                    </div>
                    <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-3 text-sm font-semibold text-black transition-colors hover:bg-[#00bfff]">
                      <CheckCircle2 size={18} />
                      {t("crm.approve_send")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
