"use client";

import { useEffect, useState } from "react";
import { Briefcase, MessageSquare, Bot, CheckCircle2 } from "lucide-react";

type Inquiry = {
  id: string;
  timestamp: string;
  status: string;
  inquiry: {
    client_name: string;
    client_email: string;
    requested_crop: string;
    quantity_tons: number;
    destination: string;
  };
  orchestrator_result?: {
    final_recommendation: string;
    finance_analysis?: string;
    sales_analysis?: string;
  };
};

const quickPrompts = [
  "Направи оферта за 500 тона хлебна пшеница FOB Варна. Дай цена, риск, марж, аргументи за клиента и готов email.",
  "Клиент иска царевица за износ. Какви данни да поискам, как да сметна цена и какви рискове да проверя?",
  "Имам стопанство 1200 дка пшеница и слънчоглед. Направи оперативен план за следващите 30 дни.",
  "Направи риск анализ: суша, болести, пазарна цена, логистика и плащане за сделка със зърно.",
];

export default function CRMDashboard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState("Свързване с TerraIQ AI...");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const contactEmail = "lukezester@gmail.com";

  useEffect(() => {
    async function loadDemoDeal() {
      const demoInquiry = {
        client_name: "AgroTrade Hub",
        client_email: "buyers@agrotrade.eu",
        requested_crop: "Wheat",
        quantity_tons: 500,
        destination: "Varna Port",
      };

      let generated = {
        sales_analysis:
          "Client profile is solid. Propose FOB terms at Varna Port. Include volume discount.",
        finance_analysis:
          "MATIF is 220 EUR/t. Transport to Varna is 15 EUR/t. Minimum acceptable price: 245 EUR/t.",
        final_recommendation:
          "SUBJECT: Offer for 500t Wheat FOB Varna\n\nDear AgroTrade Hub,\n\nBased on your inquiry, we can supply 500 tons of high-protein wheat delivered FOB Varna Port.\n\nPrice: 248 EUR/t.\nDelivery Window: Next week.\n\nPlease confirm if acceptable.",
      };

      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context:
              "Demo CRM deal: buyer AgroTrade Hub wants 500 tons wheat FOB Varna Port. Prepare sales analysis, finance analysis and a short offer email.",
            query:
              "Направи кратък търговски анализ, финансов анализ и готова оферта за клиента. Върни отговора с ясни секции.",
          }),
        });
        const data = (await res.json()) as { answer?: string; error?: string };
        if (!res.ok || !data.answer) throw new Error(data.error || "AI failed");
        generated = {
          sales_analysis: "Генерирано от TerraIQ AI.",
          finance_analysis:
            "AI анализът комбинира търговска логика, ориентировъчна цена, марж и следващо действие.",
          final_recommendation: data.answer,
        };
        setAiStatus("TerraIQ AI е свързан и генерира тази оферта.");
      } catch (error) {
        console.error("[crm-ai]", error);
        setAiStatus("AI връзката не отговори. Показан е резервен demo текст.");
      }

      setInquiries([
        {
          id: "inq_17100001",
          timestamp: new Date().toISOString(),
          status: "Draft Ready",
          inquiry: demoInquiry,
          orchestrator_result: generated,
        }
      ]);
      setLoading(false);
    }

    void loadDemoDeal();
  }, []);

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
            "User is working inside TerraIQ CRM. Available demo record: AgroTrade Hub requests 500 tons wheat FOB Varna Port. TerraIQ has no live market feed or real database connected yet. Act as a senior agri deal analyst and give operational next actions.",
        }),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      if (!res.ok || !data.answer) throw new Error(data.error || "AI failed");
      setAnswer(data.answer);
    } catch (error) {
      console.error("[crm-ask-ai]", error);
      setAnswer("Не успях да получа отговор от TerraIQ AI. Провери OpenAI настройките във Vercel и опитай пак.");
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--background)] p-8 font-sans text-[var(--foreground)]">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex items-center gap-4 border-b border-[var(--border-glass)] pb-6">
          <div className="p-3 bg-[var(--card)] rounded-xl border border-[var(--border-glass)]">
            <Briefcase className="text-[var(--accent)]" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-wide">Commercial CRM</h1>
            <p className="text-[var(--secondary)] text-sm mt-1">Inbound Leads & AI Deal Strategies</p>
            <p className="text-[var(--accent)] text-xs mt-2">{aiStatus}</p>
          </div>
        </header>
        
        {loading ? (
          <div className="flex items-center gap-3 text-[var(--secondary)]">
            <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            Loading AI Insights...
          </div>
        ) : (
          <div className="grid gap-8">
            <section className="glass-panel p-6 rounded-2xl">
              <div className="mb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-white">Попитай TerraIQ AI</h2>
                  <a
                    href={`mailto:${contactEmail}?subject=TerraIQ%20CRM%20contact`}
                    className="rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-2 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-black"
                  >
                    Жив контакт
                  </a>
                </div>
                <p className="mt-1 text-sm text-[var(--secondary)]">
                  Напиши въпрос за стопанство, оферта, цена, риск, логистика или клиент.
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
                  placeholder="Например: Направи оферта за 500 тона пшеница FOB Варна с цена и следващи действия..."
                />
                <button
                  onClick={askTerraIq}
                  disabled={asking || !question.trim()}
                  className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#00bfff] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {asking ? "TerraIQ AI мисли..." : "Изпрати към TerraIQ AI"}
                </button>
                {answer ? (
                  <div className="rounded-xl border border-[var(--border-glass)] bg-black/40 p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
                      Отговор
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-[var(--secondary)]">
                      {answer}
                    </pre>
                  </div>
                ) : null}
              </div>
            </section>

            {inquiries.map((inq) => (
              <div key={inq.id} className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
                
                {/* Header of the Deal */}
                <div className="flex justify-between items-start border-b border-[var(--border-glass)] pb-4">
                  <div>
                    <h2 className="text-xl font-medium text-white">{inq.inquiry.client_name}</h2>
                    <div className="flex gap-4 mt-2 text-sm text-[var(--secondary)]">
                      <span>Demand: <strong className="text-white">{inq.inquiry.quantity_tons}t {inq.inquiry.requested_crop}</strong></span>
                      <span>Dest: <strong className="text-white">{inq.inquiry.destination}</strong></span>
                    </div>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                    {inq.status}
                  </span>
                </div>

                {/* Body of the Deal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Agents Debate */}
                  <div className="bg-black/30 rounded-xl p-5 border border-[var(--border-glass)]">
                    <h3 className="font-medium text-white mb-4 flex items-center gap-2 text-sm">
                      <Bot size={16} className="text-[var(--accent)]" /> AI Agent Strategy
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-[var(--card)]/50 p-3 rounded-lg border border-[var(--border-glass)] border-l-2 border-l-indigo-500">
                        <div className="text-[10px] text-indigo-400 font-mono tracking-widest mb-1">SALES AGENT</div>
                        <p className="text-sm text-[var(--secondary)] leading-relaxed">{inq.orchestrator_result?.sales_analysis}</p>
                      </div>

                      <div className="bg-[var(--card)]/50 p-3 rounded-lg border border-[var(--border-glass)] border-l-2 border-l-amber-500">
                        <div className="text-[10px] text-amber-400 font-mono tracking-widest mb-1">FINANCE AGENT</div>
                        <p className="text-sm text-[var(--secondary)] leading-relaxed">{inq.orchestrator_result?.finance_analysis}</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Draft Proposal */}
                  <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border-glass)] flex flex-col">
                    <h3 className="font-medium text-white mb-4 flex items-center gap-2 text-sm">
                      <MessageSquare size={16} className="text-[var(--accent)]" /> Generated Draft
                    </h3>
                    <div className="flex-1 bg-black/50 p-4 rounded-lg border border-[var(--border-glass)] overflow-auto">
                      <pre className="text-sm text-[var(--secondary)] whitespace-pre-wrap font-sans leading-relaxed">
                        {inq.orchestrator_result?.final_recommendation}
                      </pre>
                    </div>
                    <button className="mt-4 w-full bg-[var(--accent)] hover:bg-[#00bfff] text-black font-semibold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 text-sm">
                      <CheckCircle2 size={18} />
                      Approve & Send to Client
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
