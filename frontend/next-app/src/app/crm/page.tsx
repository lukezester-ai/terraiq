"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bot, Briefcase, CheckCircle2, MessageSquare, RefreshCw, Send } from "lucide-react";

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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const quickPrompts = [
  "??????? ?????? ?? 500 ???? ?????? ??????? FOB ?????. ??? ????, ????, ????, ????????? ?? ??????? ? ????? email.",
  "?????? ???? ???????? ?? ?????. ????? ????? ?? ???????, ??? ?? ?????? ???? ? ????? ??????? ?? ????????",
  "???? ?????????? 1200 ??? ??????? ? ??????????. ??????? ?????????? ???? ?? ?????????? 30 ???.",
  "??????? ???? ??????: ????, ???????, ??????? ????, ????????? ? ??????? ?? ?????? ??? ?????.",
];

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
    additional_notes: "Fallback ?????, ??????? ?????? FastAPI ?? ? ????????.",
  },
  orchestrator_result: {
    sales_analysis: "Demo ??????: ???????? ????? 500 ???? ??????? FOB ?????.",
    finance_analysis: "Demo ??????: ???????? ?????? ??????? ????, ?????????, ??????? ??????? ? ?????? ????.",
    final_recommendation: "???? ? demo fallback. ??????????? FastAPI ? Postgres, ????????? migrations ? ???????? CRM ?????? ?? ?? ???????? ???.",
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
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState("????????? ?? CRM ??????...");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [form, setForm] = useState<InquiryForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const contactEmail = "lukezester@gmail.com";

  const activeContext = useMemo(() => {
    const first = inquiries[0];
    if (!first) return "???? ??????? CRM ??????.";
    return "CRM ?????: " + first.inquiry.client_name + " ???? " + first.inquiry.quantity_tons + " ???? " + first.inquiry.requested_crop + " ?? " + first.inquiry.destination + ". ??????: " + first.status + ".";
  }, [inquiries]);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiBaseUrl + "/crm/inquiries", { cache: "no-store" });
      const data = (await res.json()) as InquiryResponse;
      if (!res.ok || data.status !== "success") throw new Error("CRM API failed");
      const records = data.data || [];
      setInquiries(records);
      setAiStatus(records.length ? "CRM ? ??????? ? FastAPI ? Postgres." : "CRM ? ???????, ?? ??? ???? ???????? ??????.");
    } catch (error) {
      console.error("[crm-load]", error);
      setInquiries([demoInquiry]);
      setAiStatus("FastAPI CRM ?? ? ????????. ??????? ? demo fallback ?????.");
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
    setAiStatus("????????? ?? CRM ???????? ??? FastAPI...");
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
      setAiStatus(data.status === "failed" ? "???????? ? ????????, ?? AI draft ?? ???? ?????????." : "???????? ? ???????? ? AI draft ? ?????????.");
      await loadInquiries();
    } catch (error) {
      console.error("[crm-submit]", error);
      setAiStatus("CRM ???????? ?? ???? ????????. ??????? FastAPI, Postgres ? OPENAI_API_KEY.");
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
          context: activeContext + " ????????? ???? ???????? ????????. ??? ??????? live ??????? ?????, ???? ?? ????.",
        }),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      if (!res.ok || !data.answer) throw new Error(data.error || "AI failed");
      setAnswer(data.answer);
    } catch (error) {
      console.error("[crm-ask-ai]", error);
      setAnswer("?? ????? ?? ?????? ??????? ?? TerraIQ AI. ??????? OpenAI ??????????? ??? Vercel ??? ????????? ????? ? ?????? ???.");
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
            <h1 className="text-2xl font-semibold tracking-wide">Commercial CRM</h1>
            <p className="mt-1 text-sm text-[var(--secondary)]">Inbound Leads & AI Deal Strategies</p>
            <p className="mt-2 text-xs text-[var(--accent)]">{aiStatus}</p>
          </div>
          <button type="button" onClick={loadInquiries} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
            <RefreshCw size={14} />
            Refresh
          </button>
        </header>

        {loading ? (
          <div className="flex items-center gap-3 text-[var(--secondary)]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            Loading CRM records...
          </div>
        ) : (
          <div className="grid gap-8">
            <section className="glass-panel rounded-2xl p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">???? CRM ??????</h2>
              <form onSubmit={submitInquiry} className="grid gap-3 md:grid-cols-2">
                <input className="rounded-lg border border-[var(--border-glass)] bg-black/30 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" placeholder="??????" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} required />
                <input className="rounded-lg border border-[var(--border-glass)] bg-black/30 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" placeholder="Email" type="email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} required />
                <input className="rounded-lg border border-[var(--border-glass)] bg-black/30 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" placeholder="???????" value={form.requested_crop} onChange={(e) => setForm({ ...form, requested_crop: e.target.value })} required />
                <input className="rounded-lg border border-[var(--border-glass)] bg-black/30 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" placeholder="??????" type="number" min="1" value={form.quantity_tons} onChange={(e) => setForm({ ...form, quantity_tons: e.target.value })} required />
                <input className="rounded-lg border border-[var(--border-glass)] bg-black/30 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" placeholder="??????????" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
                <input className="rounded-lg border border-[var(--border-glass)] bg-black/30 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" placeholder="???????" value={form.additional_notes} onChange={(e) => setForm({ ...form, additional_notes: e.target.value })} />
                <button disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#00bfff] disabled:opacity-50 md:col-span-2">
                  <Send size={16} />
                  {submitting ? "?????????..." : "?????? ? ????????? AI draft"}
                </button>
              </form>
            </section>

            <section className="glass-panel rounded-2xl p-6">
              <div className="mb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-white">??????? TerraIQ AI</h2>
                  <a href={"mailto:" + contactEmail + "?subject=TerraIQ%20CRM%20contact"} className="rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-2 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-black">??? ???????</a>
                </div>
                <p className="mt-1 text-sm text-[var(--secondary)]">?????? ?????? ?? ??????????, ??????, ????, ????, ????????? ??? ??????.</p>
              </div>
              <div className="grid gap-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  {quickPrompts.map((prompt) => (
                    <button key={prompt} type="button" onClick={() => setQuestion(prompt)} className="rounded-xl border border-[var(--border-glass)] bg-white/[0.03] p-3 text-left text-xs leading-5 text-[var(--secondary)] transition hover:border-[var(--accent)] hover:text-white">{prompt}</button>
                  ))}
                </div>
                <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={4} className="w-full rounded-xl border border-[var(--border-glass)] bg-black/30 p-4 text-sm text-white outline-none placeholder:text-[var(--secondary)] focus:border-[var(--accent)]" placeholder="????????: ??????? ?????? ?? 500 ???? ??????? FOB ????? ? ???? ? ???????? ????????..." />
                <button onClick={askTerraIq} disabled={asking || !question.trim()} className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#00bfff] disabled:cursor-not-allowed disabled:opacity-50">{asking ? "TerraIQ AI ?????..." : "??????? ??? TerraIQ AI"}</button>
                {answer ? <div className="rounded-xl border border-[var(--border-glass)] bg-black/40 p-4"><div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">???????</div><pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-[var(--secondary)]">{answer}</pre></div> : null}
              </div>
            </section>

            {inquiries.length === 0 ? <div className="rounded-xl border border-[var(--border-glass)] bg-black/30 p-5 text-sm text-[var(--secondary)]">???? ???????? CRM ??????.</div> : null}

            {inquiries.map((inq) => (
              <div key={inq.id} className="glass-panel flex flex-col gap-6 rounded-2xl p-6">
                <div className="flex justify-between gap-4 border-b border-[var(--border-glass)] pb-4">
                  <div>
                    <h2 className="text-xl font-medium text-white">{inq.inquiry.client_name}</h2>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--secondary)]">
                      <span>Demand: <strong className="text-white">{inq.inquiry.quantity_tons}t {inq.inquiry.requested_crop}</strong></span>
                      <span>Dest: <strong className="text-white">{inq.inquiry.destination}</strong></span>
                    </div>
                  </div>
                  <span className="h-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-400">{inq.status}</span>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-[var(--border-glass)] bg-black/30 p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-white"><Bot size={16} className="text-[var(--accent)]" /> AI Agent Strategy</h3>
                    <div className="space-y-4">
                      <div className="rounded-lg border border-[var(--border-glass)] border-l-2 border-l-indigo-500 bg-[var(--card)]/50 p-3"><div className="mb-1 font-mono text-[10px] tracking-widest text-indigo-400">SALES AGENT</div><p className="text-sm leading-relaxed text-[var(--secondary)]">{inq.orchestrator_result?.sales_analysis || "?????? sales analysis."}</p></div>
                      <div className="rounded-lg border border-[var(--border-glass)] border-l-2 border-l-amber-500 bg-[var(--card)]/50 p-3"><div className="mb-1 font-mono text-[10px] tracking-widest text-amber-400">FINANCE AGENT</div><p className="text-sm leading-relaxed text-[var(--secondary)]">{inq.orchestrator_result?.finance_analysis || "?????? finance analysis."}</p></div>
                    </div>
                  </div>

                  <div className="flex flex-col rounded-xl border border-[var(--border-glass)] bg-[var(--card)] p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-white"><MessageSquare size={16} className="text-[var(--accent)]" /> Generated Draft</h3>
                    <div className="flex-1 overflow-auto rounded-lg border border-[var(--border-glass)] bg-black/50 p-4"><pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--secondary)]">{inq.orchestrator_result?.final_recommendation || "??? ???? ????????? draft."}</pre></div>
                    <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-3 text-sm font-semibold text-black transition-colors hover:bg-[#00bfff]"><CheckCircle2 size={18} />Approve & Send to Client</button>
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
