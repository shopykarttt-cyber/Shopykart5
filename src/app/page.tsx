
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
import { Package, Star, RotateCcw, Truck, Heart } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function FeatureBar() {
  return (
    <div className="bg-[#FF6B00] mx-4 rounded-xl py-3 px-4 flex justify-between items-center text-white shadow-lg -mt-3 mb-6 relative z-10">
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-white fill-current" />
        <span className="text-[10px] font-bold leading-none">Top Rated<br/>Products</span>
      </div>
      <div className="h-6 w-[1px] bg-white/20" />
      <div className="flex items-center gap-2">
        <RotateCcw className="w-4 h-4 text-white" />
        <span className="text-[10px] font-bold leading-none">7 Days<br/>Easy Returns</span>
      </div>
      <div className="h-6 w-[1px] bg-white/20" />
      <div className="flex items-center gap-2">
        <Truck className="w-4 h-4 text-white" />
        <span className="text-[10px] font-bold leading-none">Cash<br/>on Delivery</span>
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
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col">
        <div className="bg-gradient-to-b from-[#FF6B00] via-[#FFD54F] to-[#FFD54F]">
          <CategoryScroller 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
          />
          <BannerSlider />
        </div>
        
        <FeatureBar />

        {/* Top Rated Section - Only shows if manually selected in admin */}
        {topRatedProducts.length > 0 && (
          <div className="px-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight italic flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                Top Rated For You
              </h2>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4 pb-4">
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

        {/* Main Grid Tags */}
        <div className="px-6 flex gap-2 overflow-x-auto hide-scrollbar mb-6">
          <button className="bg-[#4B2C1A] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0">
             All Products
          </button>
          <button className="bg-white border text-gray-600 px-4 py-2 rounded-xl text-xs font-bold shrink-0">Organic Fresh</button>
          <button className="bg-white border text-gray-600 px-4 py-2 rounded-xl text-xs font-bold shrink-0">Fast Delivery</button>
        </div>

        <div className="px-6 pb-12 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight italic">
              {selectedCategory === "For you" ? "Popular Products" : selectedCategory}
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                 <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </AuthGuard>
  );
}
