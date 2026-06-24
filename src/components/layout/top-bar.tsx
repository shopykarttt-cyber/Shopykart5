
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Zap, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CartSheet } from "@/components/cart/cart-sheet";
import { useCart } from "@/components/cart/cart-provider";

const SUGGESTIONS = ["masala", "shampoo", "haldi", "atta", "milk", "bread"];

export function TopBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { items } = useCart();
  
  // Typewriter effect states
  const [placeholder, setPlaceholder] = useState("");
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = SUGGESTIONS[suggestionIndex];
    const fullText = `Search "${currentWord}"...`;
    const speed = isDeleting ? 40 : 80;

    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < fullText.length) {
        setPlaceholder(fullText.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      } else if (isDeleting && charIndex > 0) {
        setPlaceholder(fullText.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
      } else if (!isDeleting && charIndex === fullText.length) {
        // Wait before starting to delete
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setSuggestionIndex((prev) => (prev + 1) % SUGGESTIONS.length);
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, suggestionIndex]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = searchQuery.toLowerCase().trim();
      if (query === 'admin/dashboard') {
        router.push('/admin');
        setSearchQuery("");
      }
    }
  };

  return (
    <div className="bg-[#FF6B00] px-5 pt-4 pb-3 sticky top-0 z-40 md:rounded-t-[2.5rem]">
      <div className="flex items-center gap-3 max-w-7xl mx-auto w-full">
        {/* Animated Search Bar */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
          <Input 
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-10 h-10 bg-white border-2 border-transparent rounded-full focus-visible:ring-0 text-gray-800 placeholder:text-gray-400 text-sm font-semibold animate-search-glow transition-all"
          />
        </div>

        {/* Points Indicator */}
        <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
            <Zap className="w-2.5 h-2.5 text-black fill-current" />
          </div>
          <span className="text-white font-bold text-xs tracking-tight">28</span>
        </div>

        {/* Cart Action */}
        <CartSheet>
          <button className="relative p-1 text-white hover:scale-110 active:scale-95 transition-all">
            <ShoppingCart className="w-6 h-6 stroke-[2.5px]" />
            {items.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-white text-[#FF6B00] text-[9px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-[#FF6B00] shadow-sm">
                {items.length}
              </span>
            )}
          </button>
        </CartSheet>
      </div>
    </div>
  );
}
