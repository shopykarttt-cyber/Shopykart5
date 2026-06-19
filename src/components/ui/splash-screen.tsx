
"use client";

import { useEffect, useState } from "react";
import { ShoppingBasket } from "lucide-react";

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
      <div className="relative group animate-in zoom-in-95 duration-700 flex flex-col items-center">
        <div className="bg-primary/20 w-24 h-24 rounded-[3rem] flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,77,77,0.2)]">
          <ShoppingBasket className="w-12 h-12 text-primary" />
        </div>
        <div className="px-12 py-8 rounded-[3rem] border border-[#2E2E2E] bg-gradient-to-b from-[#0F0F0F] to-black shadow-[0_0_50px_rgba(212,175,55,0.05)] flex flex-col items-center gap-2 min-w-[280px]">
          <div className="flex items-baseline leading-none">
            <span className="text-4xl font-black italic tracking-tighter text-white uppercase">GROSI</span>
            <span className="text-4xl font-black italic tracking-tighter text-primary uppercase">FY</span>
          </div>
          <span className="text-[8px] font-black tracking-[0.4em] text-gray-500 uppercase mt-2">
            QUALITY FIRST
          </span>
        </div>
      </div>

      <div className="absolute bottom-10 w-full text-center animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
        <p className="text-[7px] font-black tracking-[0.3em] text-gray-700 uppercase">
          HANDCRAFTED BY DEVANSH
        </p>
      </div>
      
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent w-full opacity-20 animate-pulse"></div>
    </div>
  );
}
