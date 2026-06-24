
"use client";

import Image from "next/image";
import { Plus, Heart, Star, Clock, ChevronRight, Minus } from "lucide-react";
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
  const { items, addItem, removeItem, updateQuantity } = useCart();
  
  // Find if item is already in cart
  const cartItem = items.find(i => i.id === id);
  const quantity = cartItem ? cartItem.quantity : 0;

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

  const displayDiscount = discount || (mrp && mrp > price ? `${Math.round(((mrp - price) / mrp) * 100)}%` : null);
  const displayMrp = mrp || (price * 1.2);

  return (
    <Card className="border border-gray-100 bg-white rounded-3xl overflow-hidden group transition-all duration-300 shadow-sm hover:shadow-md h-full flex flex-col">
      {/* Image Section */}
      <div className="relative aspect-square w-full bg-white shrink-0 overflow-hidden">
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
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Add Button / Quantity Selector */}
        <div className="absolute -bottom-1.5 right-3 z-20">
          {quantity > 0 ? (
            <div className="bg-white border border-gray-200 h-8 px-2 rounded-xl shadow-md flex items-center justify-between gap-3 min-w-[80px] animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  quantity === 1 ? removeItem(id) : updateQuantity(id, -1);
                }} 
                className="text-[#0C831F] p-1 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Minus className="w-3.5 h-3.5 stroke-[3px]" />
              </button>
              <span className="font-black text-[#0C831F] text-xs w-4 text-center">{quantity}</span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  updateQuantity(id, 1);
                }} 
                className="text-[#0C831F] p-1 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3px]" />
              </button>
            </div>
          ) : (
            <Button 
              onClick={handleAddToCart}
              className="bg-white hover:bg-gray-50 text-[#0C831F] border border-gray-200 h-8 px-4 rounded-xl font-black text-[10px] uppercase shadow-md flex items-center gap-1"
            >
              ADD
            </Button>
          )}
        </div>

        {/* Unit Indicator */}
        <div className="absolute bottom-3 left-4 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-md">
          <span className="text-[9px] font-bold text-gray-600">{unit}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 pt-5 space-y-1 flex-1 flex flex-col">
        {/* Pricing */}
        <div className="flex items-center gap-2">
          <span className="text-base font-black text-gray-900">₹{price}</span>
          <span className="text-[10px] text-gray-400 line-through">₹{Math.round(displayMrp)}</span>
        </div>
        
        {displayDiscount && (
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-tight">
            {displayDiscount} OFF
          </p>
        )}

        {/* Name */}
        <h3 className="font-bold text-xs text-gray-800 line-clamp-2 leading-tight min-h-[32px] mt-1">
          {name}
        </h3>

        {/* Stars & Ratings */}
        <div className="flex items-center gap-1 mt-auto pt-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={cn("w-2.5 h-2.5", s <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-200")} />
            ))}
          </div>
          <span className="text-[9px] text-gray-400 font-bold">3.5 lac</span>
        </div>

        {/* Delivery Time */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-gray-500" />
            <span className="text-[10px] text-gray-500 font-bold italic">9 mins</span>
          </div>
          <button className="bg-green-50/50 hover:bg-green-50 text-[#0C831F] px-2 py-1 rounded-md flex items-center gap-0.5 transition-colors">
            <span className="text-[9px] font-black uppercase">ALL {category?.slice(0, 5) || 'PROD'}</span>
            <ChevronRight className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </Card>
  );
}
