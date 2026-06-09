"use client";

import React, { type ReactNode } from "react";
import Image from "next/image";
import { useSpring, animated } from "@react-spring/web";

export const Hero: React.FC = () => {
  const renderAnimatedNumber = (value: unknown): ReactNode => value as ReactNode;

  // Animated counters
  const fields = useSpring({ from: { number: 0 }, to: { number: 12450 }, config: { duration: 2000 } });
  const decisions = useSpring({ from: { number: 0 }, to: { number: 84932 }, config: { duration: 2000 } });
  const flights = useSpring({ from: { number: 0 }, to: { number: 2156 }, config: { duration: 2000 } });
  const health = useSpring({ from: { number: 0 }, to: { number: 98.4 }, config: { duration: 2000 } });

  return (
    <section className="relative h-screen flex items-center justify-center bg-deep-forest text-white overflow-hidden">
      {/* Background image (placeholder for final video) */}
      <Image
        src="/hero_mockup.png"
        alt="TerraIQ hero background"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Glassmorphism overlay */}
      <div className="relative z-10 flex flex-col items-center gap-8 p-8 backdrop-blur-[20px] bg-white/5 border border-white/15 rounded-xl max-w-2xl text-center">
        <h1 className="font-space-grotesk text-5xl md:text-6xl font-bold">TerraIQ</h1>
        <h2 className="font-inter text-lg md:text-xl">AI Operating System for Modern Agriculture</h2>
        <p className="mt-4 text-base md:text-lg max-w-md">
          Manage fields, machinery, markets and decisions from one intelligent platform.
        </p>
        <div className="flex gap-4 mt-6">
          <a href="#" className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-6 py-3 rounded-md transition-colors">Start Free</a>
          <a href="#" className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-md transition-colors">Watch Demo</a>
        </div>
        {/* Animated stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 text-center">
          <div>
            <animated.span className="block text-2xl font-bold">{renderAnimatedNumber(fields.number.to((n) => Math.floor(n).toLocaleString()))}</animated.span>
            <span className="text-sm">Fields Managed</span>
          </div>
          <div>
            <animated.span className="block text-2xl font-bold">{renderAnimatedNumber(decisions.number.to((n) => Math.floor(n).toLocaleString()))}</animated.span>
            <span className="text-sm">AI Decisions Today</span>
          </div>
          <div>
            <animated.span className="block text-2xl font-bold">{renderAnimatedNumber(flights.number.to((n) => Math.floor(n).toLocaleString()))}</animated.span>
            <span className="text-sm">Drone Flights</span>
          </div>
          <div>
            <animated.span className="block text-2xl font-bold">{renderAnimatedNumber(health.number.to((n) => `${n.toFixed(1)}%`))}</animated.span>
            <span className="text-sm">Crop Health</span>
          </div>
        </div>
      </div>
    </section>
  );
};
