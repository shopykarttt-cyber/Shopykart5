
"use client";

import { useMemo } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";
import { ChevronRight, Grid } from "lucide-react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function MenuPage() {
  const db = useFirestore();
  const catQuery = useMemo(() => query(collection(db, "categories"), orderBy("name", "asc")), [db]);
  const { data: categories, loading } = useCollection(catQuery);

  return (
    <>
      <TopBar />
      <div className="flex-1 px-6 py-4 space-y-8">
        <h1 className="text-3xl font-bold">Shop by Category</h1>
        
        <div className="grid grid-cols-1 gap-4">
          {categories && categories.length > 0 ? (
            categories.map((cat: any) => (
              <button key={cat.id} className="bg-white p-6 rounded-[2rem] premium-shadow border border-gray-50 flex justify-between items-center group hover:-translate-y-1 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-3xl overflow-hidden relative bg-gray-50">
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-bold text-xl text-gray-800">{cat.name}</span>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-primary" />
              </button>
            ))
          ) : !loading && (
            <div className="py-20 text-center space-y-4">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Grid className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No categories live</p>
            </div>
          )}
          {loading && <p className="text-center text-gray-400 py-10">Loading categories...</p>}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
