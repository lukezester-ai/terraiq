"use client";
import { motion } from "framer-motion";
import { Check, ArrowRight, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://terraiq-api.onrender.com";

export default function PricingPage() {
  const { t, i18n } = useTranslation();

  const plans = [
    { id: "start", key: "start", price: "19", annualPrice: "15" },
    { id: "business", key: "business", price: "59", annualPrice: "47", popular: true },
    { id: "enterprise", key: "enterprise", price: "199", annualPrice: "159" },
  ];

  const handleCheckout = async (planId: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/payments/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      });
      const data = await response.json();
      if (data.checkout_url) {
        window.location.assign(data.checkout_url);
        return;
      }
    } catch (error) {
      console.warn("API checkout fallback triggered:", error);
    }
    // Smooth navigation to user registration if checkout session requires prior registration
    window.location.assign(`/register?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 font-sans flex flex-col items-center justify-center relative">
      <button
        onClick={() => i18n.changeLanguage(i18n.language === "bg" ? "en" : "bg")}
        className="absolute top-6 right-6 flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors bg-[#131A26] px-2 py-1.5 rounded-md border border-[#243041]"
      >
        <Globe size={14} />
        <span className={i18n.language !== "bg" ? "text-cyan-300" : ""}>EN</span>
        <span className="opacity-50">|</span>
        <span className={i18n.language === "bg" ? "text-cyan-300" : ""}>BG</span>
      </button>

      <div className="text-center max-w-3xl mb-16 mt-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent"
        >
          {t("pricing.title")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-neutral-400"
        >
          {t("pricing.subtitle")}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full">
        {plans.map((plan, idx) => {
          const features = t(`pricing.${plan.key}.features`, { returnObjects: true }) as string[];
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className={`relative p-8 rounded-2xl border ${
                plan.popular ? "border-emerald-500 bg-emerald-950/20" : "border-neutral-800 bg-neutral-900/50"
              } flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-neutral-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {t("pricing.popular")}
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{t(`pricing.${plan.key}.name`)}</h3>
              <p className="text-neutral-400 mb-6 h-12">{t(`pricing.${plan.key}.desc`)}</p>

              <div className="mb-8 flex flex-col items-start">
                <div className="flex items-baseline">
                  <span className="text-5xl font-extrabold">{plan.price}</span>
                  <span className="text-xl text-neutral-500 ml-2">{t("pricing.monthly")}</span>
                </div>
                <span className="text-sm text-emerald-400 mt-2">
                  {t("pricing.annual_note", { price: plan.annualPrice })}
                </span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="w-5 h-5 text-emerald-400 mr-3 shrink-0 mt-0.5" />
                    <span className="text-neutral-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.id)}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
                  plan.popular
                    ? "bg-emerald-500 hover:bg-emerald-400 text-neutral-950"
                    : "bg-neutral-800 hover:bg-neutral-700 text-white"
                }`}
              >
                {t("pricing.subscribe")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
