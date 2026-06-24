
"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { BannerSlider } from "@/components/home/banner-slider";
import { CategoryScroller } from "@/components/home/category-scroller";
import { ProductCard } from "@/components/home/product-card";
import { SmartBasketAssistant } from "@/components/ai/smart-basket-assistant";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Package } from "lucide-react";

export default function Home() {
  const db = useFirestore();
  const [selectedCategory, setSelectedCategory] = useState("For you");

  const productsQuery = useMemo(() => query(collection(db, "products"), orderBy("createdAt", "desc"), limit(50)), [db]);
  const { data: liveProducts, loading: productsLoading } = useCollection(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!liveProducts) return [];
    if (selectedCategory === "For you") return liveProducts;
    return liveProducts.filter((p: any) => p.category === selectedCategory);
  }, [liveProducts, selectedCategory]);

  return (
    <AuthGuard>
      <TopBar />
      <div className="flex-1 space-y-4 max-w-7xl mx-auto w-full">
        <CategoryScroller 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />
        <BannerSlider />
        <SmartBasketAssistant />
        
        <div className="px-6 pb-12 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tight">
              {selectedCategory === "For you" ? "Popular Products" : selectedCategory}
            </h2>
            <button className="text-primary text-sm font-bold hover:underline uppercase tracking-widest">View All</button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product: any) => (
                <ProductCard 
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  unit={product.unit}
                  discount={product.mrp > product.price ? `${Math.round(((product.mrp - product.price) / product.mrp) * 100)}%` : undefined}
                  imageId={product.imageUrl}
                />
              ))
            ) : !productsLoading && (
              <div className="col-span-full py-20 text-center space-y-4">
                 <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                   <Package className="w-8 h-8 text-gray-300" />
                 </div>
                 <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No products found</p>
                 <p className="text-[10px] text-gray-400">Try a different category or check back later.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </AuthGuard>
  );
}
