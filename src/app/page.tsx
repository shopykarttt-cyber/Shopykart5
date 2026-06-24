
"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { BannerSlider } from "@/components/home/banner-slider";
import { CategoryScroller } from "@/components/home/category-scroller";
import { ProductCard } from "@/components/home/product-card";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Package, Star, ShieldCheck, Truck } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function FeatureBar() {
  return (
    <div className="bg-[#FF6B00] mx-4 rounded-2xl py-3 px-5 flex justify-between items-center text-white shadow-xl -mt-4 mb-8 relative z-10 border border-white/10">
      <div className="flex items-center gap-2.5">
        <Star className="w-4 h-4 text-white fill-current" />
        <span className="text-[10px] font-black leading-none uppercase tracking-tighter">Top Rated<br/>Products</span>
      </div>
      <div className="h-6 w-[1px] bg-white/20" />
      <div className="flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-white" />
        <span className="text-[10px] font-black leading-none uppercase tracking-tighter">Secure<br/>Payment</span>
      </div>
      <div className="h-6 w-[1px] bg-white/20" />
      <div className="flex items-center gap-2.5">
        <Truck className="w-4 h-4 text-white" />
        <span className="text-[10px] font-black leading-none uppercase tracking-tighter">Cash<br/>on Delivery</span>
      </div>
    </div>
  );
}

export default function Home() {
  const db = useFirestore();
  const [selectedCategory, setSelectedCategory] = useState("For you");

  const productsQuery = useMemo(() => query(collection(db, "products"), orderBy("createdAt", "desc"), limit(50)), [db]);
  const { data: liveProducts, loading: productsLoading } = useCollection(productsQuery);

  const topRatedProducts = useMemo(() => {
    if (!liveProducts) return [];
    return liveProducts.filter((p: any) => p.isTopRated === true);
  }, [liveProducts]);

  const filteredProducts = useMemo(() => {
    if (!liveProducts) return [];
    if (selectedCategory === "For you") return liveProducts;
    return liveProducts.filter((p: any) => p.category === selectedCategory);
  }, [liveProducts, selectedCategory]);

  return (
    <AuthGuard>
      <TopBar />
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col bg-white">
        {/* Main Header-to-Banner Smooth Gradient Flow */}
        <div className="bg-gradient-to-b from-[#FF6B00] via-[#FFD54F] to-white">
          <CategoryScroller 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
          />
          <BannerSlider />
          <div className="h-4" /> {/* Spacer for transition */}
        </div>
        
        <FeatureBar />

        {/* Top Rated Section */}
        {topRatedProducts.length > 0 && (
          <div className="px-6 mb-10">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight italic flex items-center gap-2">
                <div className="bg-yellow-400 p-1.5 rounded-lg">
                  <Star className="w-4 h-4 text-white fill-current" />
                </div>
                Premium Choice
              </h2>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4 pb-6">
                {topRatedProducts.map((product: any) => (
                  <div key={product.id} className="w-[200px] shrink-0">
                    <ProductCard 
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      unit={product.unit}
                      discount={product.mrp > product.price ? `${Math.round(((product.mrp - product.price) / product.mrp) * 100)}%` : undefined}
                      imageId={product.imageUrl}
                    />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

        {/* Popular Tags */}
        <div className="px-6 flex gap-2.5 overflow-x-auto hide-scrollbar mb-8">
          <button className="bg-black text-white px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest italic shrink-0 shadow-lg">
             All Items
          </button>
          <button className="bg-gray-50 border border-gray-100 text-gray-500 px-5 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest shrink-0">Organic</button>
          <button className="bg-gray-50 border border-gray-100 text-gray-500 px-5 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest shrink-0">Fresh Pick</button>
        </div>

        <div className="px-6 pb-20 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight italic">
              {selectedCategory === "For you" ? "Popular Products" : selectedCategory}
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
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
              <div className="col-span-full py-28 text-center space-y-4">
                 <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                   <Package className="w-10 h-10 text-gray-200" />
                 </div>
                 <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Store is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </AuthGuard>
  );
}
