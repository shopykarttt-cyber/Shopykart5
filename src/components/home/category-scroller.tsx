
"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryScrollerProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryScroller({ selectedCategory, onSelectCategory }: CategoryScrollerProps) {
  const db = useFirestore();
  const catQuery = useMemo(() => query(collection(db, "categories"), orderBy("name", "asc")), [db]);
  const { data: categories, loading } = useCollection(catQuery);

  return (
    <div className="py-6 space-y-4">
      <div className="flex overflow-x-auto gap-6 px-6 hide-scrollbar">
        {/* For You Category */}
        <button 
          onClick={() => onSelectCategory("For you")}
          className="flex flex-col items-center gap-3 shrink-0 group"
        >
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-md",
            selectedCategory === "For you" ? "bg-[#FFF9C4] ring-4 ring-[#FFD54F]" : "bg-[#FFF9C4] group-hover:scale-105"
          )}>
            <Heart className="w-10 h-10 text-red-500 fill-current" />
          </div>
          <span className={cn(
            "text-xs font-black uppercase tracking-tight text-center max-w-[80px]",
            selectedCategory === "For you" ? "text-gray-900" : "text-gray-600"
          )}>
            For you
          </span>
        </button>

        {/* Dynamic Categories */}
        {categories && categories.map((cat: any) => (
          <button 
            key={cat.id} 
            onClick={() => onSelectCategory(cat.name)}
            className="flex flex-col items-center gap-3 shrink-0 group"
          >
            <div className={cn(
              "w-20 h-20 rounded-full overflow-hidden relative shadow-md transition-all duration-300 bg-gray-100",
              selectedCategory === cat.name ? "ring-4 ring-primary" : "group-hover:scale-105"
            )}>
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                fill
                className="object-cover"
              />
            </div>
            <span className={cn(
              "text-xs font-black uppercase tracking-tight text-center max-w-[80px] leading-tight",
              selectedCategory === cat.name ? "text-gray-900" : "text-gray-600"
            )}>
              {cat.name}
            </span>
          </button>
        ))}

        {loading && (
          <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-3 shrink-0 animate-pulse">
                <div className="w-20 h-20 rounded-full bg-gray-200" />
                <div className="h-2 w-12 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
