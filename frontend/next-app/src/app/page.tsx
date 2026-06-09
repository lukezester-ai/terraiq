"use client";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Brain, Shield, LineChart, Truck } from "lucide-react";
import Link from "next/link";

const ECOSYSTEM_LINKS = [
  { href: "https://www.agrinexuslaw.com", label: "Agrinexus Law" },
  { href: "https://www.fieldlot.io", label: "FIELDLOT" },
];

export default function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.2 } 
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  const agents = [
    { name: "AI Агроном", icon: <Brain className="w-8 h-8 text-emerald-400" />, desc: "Анализира почви и дава препоръки за сеитба." },
    { name: "Търговски Агент", icon: <LineChart className="w-8 h-8 text-cyan-400" />, desc: "Сключва договори и намира най-добрите пазари." },
    { name: "Рисков Мениджър", icon: <Shield className="w-8 h-8 text-rose-400" />, desc: "Предпазва от климатични аномалии и болести." },
    { name: "Оперативен Център", icon: <Truck className="w-8 h-8 text-amber-400" />, desc: "Следи телеметрията на тракторите в реално време." },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[150px]" />
      </div>

      <nav className="absolute left-1/2 top-5 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-neutral-950/70 px-3 py-2 text-sm text-neutral-300 shadow-2xl backdrop-blur-xl">
        {ECOSYSTEM_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-full px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        
        {/* Header Section */}
        <motion.div 
          className="text-center max-w-4xl mt-20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm text-sm text-neutral-300">
            Първата AI-Native Платформа за Земеделие
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8">
            <span className="bg-gradient-to-br from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">Terra</span>
            <span className="bg-gradient-to-br from-emerald-400 to-cyan-500 bg-clip-text text-transparent">IQ</span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Управлявайте стопанството си чрез разпределен интелект. Мрежа от специализирани AI агенти взима решения вместо вас.
          </p>

          <Link href="/pricing">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center mx-auto transition-colors"
            >
              Избери План
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* 3D-like Glassmorphism Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mt-32 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {agents.map((agent) => (
            <motion.div 
              key={agent.name}
              variants={itemVariants}
              className="group relative p-8 rounded-3xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-xl overflow-hidden hover:border-neutral-600 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="mb-6 p-4 bg-neutral-950 rounded-2xl inline-block border border-neutral-800 shadow-2xl">
                {agent.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{agent.name}</h3>
              <p className="text-neutral-400 leading-relaxed">{agent.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
