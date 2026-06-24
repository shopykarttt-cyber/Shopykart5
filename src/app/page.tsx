
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
import { Package, Star, ShieldCheck, Zap, Award } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { SmartBasketAssistant } from "@/components/ai/smart-basket-assistant";

export default function Home() {
  const db = useFirestore();
  const [selectedCategory, setSelectedCategory] = useState("For you");

  const productsQuery = useMemo(() => query(collection(db, "products"), orderBy("createdAt", "desc"), limit(50)), [db]);
  const { data: liveProducts } = useCollection(productsQuery);

  const topRatedProducts = useMemo(() => {
    if (!liveProducts) return [];
    // Ensuring we only pick products where isTopRated is strictly true
    return liveProducts.filter((p: any) => p.isTopRated === true);
  }, [liveProducts]);

  const filteredProducts = useMemo(() => {
    if (!liveProducts) return [];
    
    const topRatedIds = new Set(topRatedProducts.map((p: any) => p.id));
    
    let products = liveProducts;
    
    if (selectedCategory !== "For you") {
      products = liveProducts.filter((p: any) => p.category === selectedCategory);
    } else {
      // For "For you", we show everything EXCEPT those already shown in Premium Choice section to avoid duplication
      products = liveProducts.filter((p: any) => !topRatedIds.has(p.id));
    }
    
    return products;
  }, [liveProducts, selectedCategory, topRatedProducts]);

  return (
    <AuthGuard>
      <TopBar />
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col bg-white">
        {/* Top Section with Gradient and Curve */}
        <div className="bg-gradient-to-b from-[#FF6B00] to-[#FFD54F] rounded-b-[4rem] shadow-sm pb-10">
          <CategoryScroller 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
          />
          <BannerSlider />
        </div>

        {/* Feature Bar - Floating over the curve */}
        <div className="px-5 -mt-8 relative z-10">
          <div className="bg-white rounded-3xl p-4 flex justify-between items-center shadow-lg border border-gray-50">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="text-[10px] font-black uppercase tracking-tight text-gray-700">Secure Payment</span>
            </div>
            <div className="w-px h-4 bg-gray-100" />
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-tight text-gray-700">Fast Delivery</span>
            </div>
            <div className="w-px h-4 bg-gray-100" />
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-tight text-gray-700">Fresh Quality</span>
            </div>
          </div>
        </div>

        {/* Smart Basket AI Section - Always visible above listings */}
        {selectedCategory === "For you" && (
          <div className="mt-4">
            <SmartBasketAssistant />
          </div>
        )}
        
        {/* Premium Choice (Top Rated) Section - Only your manually selected products */}
        {topRatedProducts.length > 0 && selectedCategory === "For you" && (
          <div className="px-6 mb-10 mt-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight italic flex items-center gap-2">
                <div className="bg-yellow-400 p-1.5 rounded-lg shadow-sm">
                  <Star className="w-4 h-4 text-white fill-current" />
                </div>
                Premium Choice
              </h2>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4 pb-6">
                {topRatedProducts.map((product: any) => (
                  <div key={product.id} className="w-[180px] shrink-0">
                    <ProductCard 
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      mrp={product.mrp}
                      unit={product.unit}
                      category={product.category}
                      imageId={product.imageUrl}
                    />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

        {/* Main Product Grid */}
        <div className="px-6 pb-20 pt-4">
          {selectedCategory !== "For you" && (
            <h2 className="text-xl font-black text-gray-900 uppercase italic mb-6">
              {selectedCategory}
            </h2>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product: any) => (
                <ProductCard 
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  mrp={product.mrp}
                  unit={product.unit}
                  category={product.category}
                  imageId={product.imageUrl}
                />
              ))
            ) : (
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
