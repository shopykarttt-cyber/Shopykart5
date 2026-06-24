
"use client";

import Image from "next/image";
import { Plus, Heart, Star, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/components/cart/cart-provider";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  unit: string;
  imageId: string;
  category?: string;
  discount?: string;
}

export function ProductCard({ id, name, price, mrp, unit, imageId, category, discount }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price,
      unit,
      imageUrl: imageId,
      quantity: 1
    });
    toast({
      title: "Added to Basket",
      description: `${name} is ready for checkout.`,
      duration: 2000
    });
  };

  // Calculate discount percentage if not provided but mrp is
  const displayDiscount = discount || (mrp && mrp > price ? `${Math.round(((mrp - price) / mrp) * 100)}%` : null);
  const displayMrp = mrp || (price * 1.2); // Fallback for demo if no mrp provided

  return (
    <Card className="border border-gray-100 bg-white rounded-3xl overflow-hidden group transition-all duration-300 shadow-sm hover:shadow-md">
      {/* Image Section */}
      <div className="relative aspect-[1/1.1] w-full bg-[#F9F9F9] p-4">
        {/* Favorite Icon */}
        <button className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-gray-300 hover:text-red-500 transition-colors">
          <Heart className="w-4 h-4" />
        </button>

        {/* Veg Indicator */}
        <div className="absolute bottom-3 right-3 z-10">
          <div className="w-4 h-4 border border-green-600 flex items-center justify-center bg-white p-0.5 rounded-sm">
            <div className="w-full h-full bg-green-600 rounded-full" />
          </div>
        </div>

        {/* Product Image */}
        <div className="relative w-full h-full">
          <Image
            src={imageId}
            alt={name}
            fill
            className="object-contain p-2 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Add Button - Overlapping the image bottom */}
        <div className="absolute -bottom-2 right-4 z-20">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col items-center">
            <Button 
              onClick={handleAddToCart}
              className="bg-white hover:bg-gray-50 text-[#0C831F] border border-gray-200 h-9 px-6 rounded-xl font-black text-sm uppercase shadow-sm flex items-center gap-1 group/btn"
            >
              ADD
            </Button>
          </div>
        </div>

        {/* Unit Indicator */}
        <div className="absolute bottom-3 left-4 bg-gray-100/80 backdrop-blur-sm px-2 py-0.5 rounded-md">
          <span className="text-[10px] font-bold text-gray-600">{unit}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 pt-5 space-y-1">
        {/* Pricing */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-gray-900">₹{price}</span>
          <span className="text-xs text-gray-400 line-through">₹{Math.round(displayMrp)}</span>
        </div>
        
        {displayDiscount && (
          <p className="text-[11px] font-black text-blue-600 uppercase tracking-tight">
            {displayDiscount} OFF on MRP
          </p>
        )}

        {/* Name */}
        <h3 className="font-bold text-sm text-gray-800 line-clamp-2 leading-tight min-h-[40px] mt-1">
          {name}
        </h3>

        {/* Stars & Ratings */}
        <div className="flex items-center gap-1 mt-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={cn("w-3 h-3", s <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-200")} />
            ))}
          </div>
          <span className="text-[10px] text-gray-400 font-bold">3.5 lac</span>
        </div>

        {/* Delivery Time */}
        <div className="flex items-center gap-1 pt-1">
          <div className="bg-gray-100 p-0.5 rounded-full">
            <Clock className="w-2.5 h-2.5 text-gray-500" />
          </div>
          <span className="text-[11px] text-gray-500 font-bold italic">9 mins</span>
        </div>

        {/* Category Button */}
        <button className="mt-3 w-fit bg-green-50/50 hover:bg-green-50 text-[#0C831F] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
          <span className="text-[10px] font-black uppercase">All {category || 'Products'}</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </Card>
  );
}

