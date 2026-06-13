
"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export function CategoryScroller() {
  const db = useFirestore();
  const catQuery = useMemo(() => query(collection(db, "categories"), orderBy("name", "asc")), [db]);
  const { data: categories, loading } = useCollection(catQuery);

  return (
    <div className="py-6 space-y-4">
      <div className="px-6 flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight">Categories</h2>
        <button className="text-primary text-sm font-semibold hover:underline">See all</button>
      </div>
      <div className="flex overflow-x-auto gap-4 px-6 hide-scrollbar">
        {categories && categories.length > 0 ? (
          categories.map((cat: any) => (
            <div key={cat.id} className="flex flex-col items-center gap-3 shrink-0 group cursor-pointer">
              <div className="w-20 h-20 rounded-[1.75rem] bg-gray-50 p-3 premium-shadow transition-all duration-300 group-hover:bg-primary/5 group-hover:-translate-y-1 overflow-hidden relative">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xs font-semibold text-gray-700">{cat.name}</span>
            </div>
          ))
        ) : !loading && (
          <div className="w-full text-center py-4">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No Categories Live</p>
          </div>
        )}
        {loading && <p className="text-xs text-gray-400 px-6">Loading...</p>}
      </div>
    </div>
  );
}
