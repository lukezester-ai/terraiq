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

export default function CRMDashboard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching from FastAPI
    setTimeout(() => {
      setInquiries([
        {
          id: "inq_17100001",
          timestamp: new Date().toISOString(),
          status: "Draft Ready",
          inquiry: {
            client_name: "AgroTrade Hub",
            client_email: "buyers@agrotrade.eu",
            requested_crop: "Wheat",
            quantity_tons: 500,
            destination: "Varna Port",
          },
          orchestrator_result: {
            sales_analysis: "Client profile is solid. Propose FOB terms at Varna Port. Include volume discount.",
            finance_analysis: "MATIF is 220 EUR/t. Transport to Varna is 15 EUR/t. Minimum acceptable price: 245 EUR/t.",
            final_recommendation: "SUBJECT: Offer for 500t Wheat FOB Varna\n\nDear AgroTrade Hub,\n\nBased on your inquiry, we can supply 500 tons of high-protein wheat delivered FOB Varna Port. \n\nPrice: 248 EUR/t.\nDelivery Window: Next week.\n\nPlease confirm if acceptable."
          }
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

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
          </div>
        </header>
        
        {loading ? (
          <div className="flex items-center gap-3 text-[var(--secondary)]">
            <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            Loading AI Insights...
          </div>
        ) : (
          <div className="grid gap-8">
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
