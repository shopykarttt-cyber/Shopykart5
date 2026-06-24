
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
      <div className="flex-1 px-6 py-8 space-y-8 max-w-7xl mx-auto w-full">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Shop by Category</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories && categories.length > 0 ? (
            categories.map((cat: any) => (
              <button key={cat.id} className="bg-white p-6 rounded-[2.5rem] premium-shadow border border-gray-50 flex justify-between items-center group hover:-translate-y-2 hover:border-primary/20 transition-all duration-300">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[2rem] overflow-hidden relative bg-gray-50 p-2">
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <span className="font-black text-2xl text-gray-800 uppercase italic leading-none">{cat.name}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl group-hover:bg-primary transition-colors">
                  <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-white" />
                </div>
              </button>
            ))
          ) : !loading && (
            <div className="col-span-full py-32 text-center space-y-4">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Grid className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No categories live</p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
