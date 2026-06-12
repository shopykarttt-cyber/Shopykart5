
"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-out fade-out duration-1000 fill-mode-forwards">
      {/* Center Logo Container */}
      <div className="relative group animate-in zoom-in-95 duration-700">
        <div className="px-12 py-8 rounded-[3rem] border border-[#2E2E2E] bg-gradient-to-b from-[#0F0F0F] to-black shadow-[0_0_50px_rgba(212,175,55,0.1)] flex flex-col items-center gap-2 min-w-[280px]">
          <div className="flex items-baseline leading-none">
            <span className="text-4xl font-black italic tracking-tighter text-white uppercase">GROSI</span>
            <span className="text-4xl font-black italic tracking-tighter text-[#D4AF37] uppercase">FY</span>
          </div>
          <span className="text-[8px] font-black tracking-[0.4em] text-gray-500 uppercase mt-2">
            QUALITY FIRST
          </span>
        </div>
        {/* Subtle Glow Effect */}
        <div className="absolute inset-0 bg-[#D4AF37]/5 blur-3xl -z-10 rounded-full"></div>
      </div>

      {/* Handcrafted Footer */}
      <div className="absolute bottom-10 w-full text-center animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
        <p className="text-[7px] font-black tracking-[0.3em] text-gray-700 uppercase">
          HANDCRAFTED BY DEVANSH
        </p>
      </div>
      
      {/* Loading bar animation */}
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-full opacity-20 animate-pulse"></div>
    </div>
  );
}
