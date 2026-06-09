"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Activity, 
  Globe, 
  Command,
  BarChart4
} from "lucide-react";

export default function ExecutiveDashboard() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResponse(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          context:
            "Executive dashboard request for TerraIQ. Give practical agricultural business analysis with next actions.",
        }),
      });
      const data = await res.json();
      setResponse(data.answer || data.error || "TerraIQ AI did not return an answer.");
    } catch (e) {
      console.error(e);
      setResponse("ERROR: CONNECTION TO INTELLIGENCE CORE FAILED.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-[var(--background)]">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-10 bg-gradient-to-b from-[var(--background)] to-[#0f172a]" />

      {/* Header */}
      <header className="w-full flex items-center justify-between p-6 z-10 glass-panel rounded-none border-t-0 border-x-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 relative flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-[var(--accent)] transform rotate-45 opacity-80" />
            <div className="w-2 h-2 bg-[var(--accent)]" />
          </div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">
            Terra<span className="text-[var(--accent)]">IQ</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6 text-[var(--secondary)] text-sm tracking-wide">
          <div className="flex items-center gap-2"><Activity size={14} className="text-[var(--accent)]" /> SYSTEM NOMINAL</div>
          <div>06.06.2026 23:03 GMT+3</div>
          <div className="px-3 py-1 glass-panel text-white text-xs">EXECUTIVE ACCESS</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 grid grid-cols-12 gap-8 z-10">
        
        {/* Left Column - Executive View */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <div className="uppercase text-[10px] tracking-widest text-[var(--secondary)] mb-2 font-mono flex items-center gap-2">
            <Command size={10} />
            Executive View
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 glass-panel-hover"
          >
            <div className="text-[var(--secondary)] text-sm mb-4 font-mono tracking-wide">Expected Profit</div>
            <div className="text-4xl font-light text-white mb-2">€2.4M</div>
            <div className="text-emerald-400 flex items-center gap-1 text-sm font-mono bg-emerald-400/10 w-fit px-2 py-1 rounded">
              <TrendingUp size={14} /> +12.8%
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6 glass-panel-hover"
          >
            <div className="text-[var(--secondary)] text-sm mb-4 font-mono tracking-wide">Risk Index</div>
            <div className="text-4xl font-light text-white mb-2">23%</div>
            <div className="text-[var(--accent)] flex items-center gap-1 text-sm font-mono bg-[var(--accent)]/10 w-fit px-2 py-1 rounded">
              <AlertTriangle size={14} /> LOW
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-6 glass-panel-hover"
          >
            <div className="text-[var(--secondary)] text-sm mb-4 font-mono tracking-wide">Strategic Actions</div>
            <div className="text-4xl font-light text-white mb-2">4</div>
            <div className="text-orange-400 flex items-center gap-1 text-sm font-mono bg-orange-400/10 w-fit px-2 py-1 rounded cursor-pointer hover:bg-orange-400/20 transition-colors">
              <Target size={14} /> REQUIRES REVIEW
            </div>
          </motion.div>
        </div>

        {/* Center Column - AI Workspace */}
        <div className="col-span-12 lg:col-span-6 flex flex-col h-full">
          <div className="flex-1 glass-panel p-1 flex flex-col">
            {/* Workspace Header */}
            <div className="px-6 py-4 border-b border-[var(--border-glass)] flex items-center gap-3">
              <Globe size={18} className="text-[var(--accent)]" />
              <span className="font-mono text-sm tracking-widest text-white/80">TERRAIQ INTELLIGENCE</span>
            </div>
            
            {/* Chat/Analytics Area */}
            <div className="flex-1 p-6 flex flex-col justify-end gap-6">
              
              {/* Real/Mock AI Response */}
              {(response || isLoading) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="w-full"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-8 h-8 rounded-sm bg-[var(--accent)]/20 border border-[var(--accent)]/50 flex items-center justify-center shrink-0">
                      <BarChart4 size={14} className="text-[var(--accent)]" />
                    </div>
                    <div className="glass-panel p-5 bg-[var(--card)]/40 border-l-2 border-l-[var(--accent)] flex-1">
                      {isLoading ? (
                        <div className="flex flex-col gap-2">
                          <div className="h-2 w-full bg-[var(--accent)]/20 animate-pulse rounded"></div>
                          <div className="h-2 w-3/4 bg-[var(--accent)]/20 animate-pulse rounded"></div>
                          <div className="h-2 w-1/2 bg-[var(--accent)]/20 animate-pulse rounded"></div>
                        </div>
                      ) : (
                        <>
                          <p className="text-white/90 text-sm leading-relaxed mb-6 font-mono">
                            {response}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 opacity-70">
                            <div className="glass-panel p-4 bg-black/20 hover:bg-black/40 cursor-pointer transition-colors border-[var(--border-glass)]">
                              <div className="text-[10px] text-[var(--accent)] mb-1 font-mono">SCENARIO A</div>
                              <div className="text-sm text-white">Aggressive Hedging</div>
                              <div className="text-xs text-[var(--secondary)] mt-2">Expected Yield: +18.2%</div>
                            </div>
                            <div className="glass-panel p-4 bg-black/20 hover:bg-black/40 cursor-pointer transition-colors border-[var(--border-glass)]">
                              <div className="text-[10px] text-[var(--accent)] mb-1 font-mono">SCENARIO B</div>
                              <div className="text-sm text-white">Resource Reallocation</div>
                              <div className="text-xs text-[var(--secondary)] mt-2">Expected Yield: +14.5%</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}


            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[var(--border-glass)]">
              <div className="relative">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Как да увелича печалбата с 15% през 2027?"
                  className="w-full bg-black/30 border border-[var(--border-glass)] rounded-lg py-4 pl-4 pr-32 text-sm text-white placeholder:text-[var(--secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
                <button 
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="absolute right-2 top-2 bottom-2 px-4 bg-[var(--card)] hover:bg-[var(--accent)] hover:text-black disabled:opacity-50 border border-[var(--border-glass)] rounded text-[10px] tracking-widest uppercase font-mono transition-all flex items-center gap-2"
                >
                  {isLoading ? "[ ИЗЧИСЛЯВАНЕ... ]" : "[ АНАЛИЗИРАЙ ]"}
                </button>

              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Map/Context */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 h-full">
           <div className="uppercase text-[10px] tracking-widest text-[var(--secondary)] mb-2 font-mono flex items-center justify-end gap-2">
            Global Context
            <Globe size={10} />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex-1 glass-panel relative overflow-hidden flex items-center justify-center group"
          >
            {/* Map placeholder */}
            <div className="absolute inset-0 bg-black/40" />
            <div className="w-[80%] h-[80%] opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-contain bg-no-repeat bg-center invert filter brightness-200" />
            
            {/* Static Gradient overlay instead of Radar */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--accent)]/0 via-[var(--accent)]/5 to-[var(--accent)]/0 origin-center" />
            
            <div className="absolute bottom-4 left-4 right-4 glass-panel bg-black/60 p-3 text-xs text-[var(--secondary)] font-mono border-t border-[var(--border-glass)] backdrop-blur-md">
              <div className="flex justify-between items-center mb-1">
                <span>SAT-LINK</span>
                <span className="text-[var(--accent)]">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center">
                <span>DATA STREAMS</span>
                <span className="text-white">1,204/sec</span>
              </div>
            </div>
          </motion.div>
        </div>

      </main>
    </div>
  );
}
