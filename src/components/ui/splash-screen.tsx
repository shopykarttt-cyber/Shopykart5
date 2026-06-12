
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
    <div className="fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center animate-out fade-out duration-1000 fill-mode-forwards">
      <div className="flex flex-col items-center gap-6 animate-in zoom-in-50 duration-500">
        <div className="bg-white p-6 rounded-[3rem] shadow-2xl shadow-black/20 animate-bounce">
          <ShoppingBasket className="w-16 h-16 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-white tracking-tighter">Grosify</h1>
          <p className="text-white/80 font-medium tracking-widest text-sm uppercase">Premium Groceries</p>
        </div>
      </div>
      <div className="absolute bottom-12">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse [animation-delay:0.2s]" />
          <div className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}
