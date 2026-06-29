
"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { BannerSlider } from "@/components/home/banner-slider";
import { CategoryScroller } from "@/components/home/category-scroller";
import { FeaturedProductCard } from "@/components/home/featured-product-card";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Package, Star, ShieldCheck, Zap, Award } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { SmartBasketAssistant } from "@/components/ai/smart-basket-assistant";
import { ProductCard } from "@/components/home/product-card";
import { ZoneSelector } from "@/components/layout/zone-selector";

export default function Home() {
  const db = useFirestore();
  const [selectedCategory, setSelectedCategory] = useState("For you");

  const productsQuery = useMemo(() => query(collection(db, "products"), orderBy("createdAt", "desc"), limit(500)), [db]);
  const { data: liveProducts } = useCollection(productsQuery);

  // Logic to get exactly 7 featured products
  const featuredProducts = useMemo(() => {
    if (!liveProducts) return [];
    const topRated = liveProducts.filter((p: any) => p.isTopRated === true);
    if (topRated.length > 0) {
      return topRated.slice(0, 7);
    }
    return liveProducts.slice(0, 7);
  }, [liveProducts]);

  const filteredProducts = useMemo(() => {
    if (!liveProducts) return [];
    if (selectedCategory !== "For you") {
      return liveProducts.filter((p: any) => p.category === selectedCategory);
    } else {
      return liveProducts; // Show ALL products including top rated in the general list
    }
  }, [liveProducts, selectedCategory]);

  return (
    <AuthGuard>
      <ZoneSelector />
      <TopBar />
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col bg-white">
        <div className="bg-gradient-to-b from-[#FF6B00] to-[#FFD54F] rounded-b-[3rem] shadow-sm pb-16">
          <CategoryScroller 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
          />
          
          {featuredProducts.length > 0 && selectedCategory === "For you" && (
            <div className="px-6 mt-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-black text-black uppercase tracking-tight italic flex items-center gap-2">
                  <div className="bg-white/30 backdrop-blur-md p-1.5 rounded-lg shadow-sm">
                    <Star className="w-4 h-4 text-white fill-current" />
                  </div>
                  Premium Choice
                </h2>
              </div>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-4 pb-4">
                  {featuredProducts.map((product: any, idx: number) => (
                    <FeaturedProductCard 
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      mrp={product.mrp}
                      imageUrl={product.imageUrl}
                      index={idx}
                    />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="px-5 -mt-8 relative z-10">
          <div className="bg-white rounded-3xl p-5 flex justify-between items-center shadow-xl border border-gray-50">
            <div className="flex items-center gap-2">
              <div className="bg-green-50 p-2 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-tight text-gray-800">Secure</span>
                <span className="text-[8px] text-gray-400 font-bold uppercase">Payments</span>
              </div>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="flex items-center gap-2">
              <div className="bg-orange-50 p-2 rounded-xl">
                <Zap className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-tight text-gray-800">Fast</span>
                <span className="text-[8px] text-gray-400 font-bold uppercase">Delivery</span>
              </div>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="flex items-center gap-2">
              <div className="bg-blue-50 p-2 rounded-xl">
                <Award className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-tight text-gray-800">Quality</span>
                <span className="text-[8px] text-gray-400 font-bold uppercase">Organic</span>
              </div>
            </div>
          </div>
        </div>

        {selectedCategory === "For you" && (
          <div className="mt-8 mb-4">
            <BannerSlider />
          </div>
        )}

        {selectedCategory === "For you" && (
          <div className="mt-2">
            <SmartBasketAssistant />
          </div>
        )}
        
        <div className="px-6 pb-28 pt-6">
          <h2 className="text-xl font-black text-gray-900 uppercase italic mb-6">
            {selectedCategory === "For you" ? "All Products" : selectedCategory}
          </h2>
          
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
                 <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </AuthGuard>
  );
}
