
"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/components/cart/cart-provider";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface PricingTier {
  minQty: number;
  maxQty: number | null;
  price: number;
}

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  mrp: number;
  unit: string;
  imageId: string;
  category?: string;
  pricingTiers?: PricingTier[];
}

export function ProductCard({ id, name, price, mrp, unit, imageId, pricingTiers = [] }: ProductCardProps) {
  const { items, addItem, removeItem, updateQuantity } = useCart();
  const [showQtySheet, setShowQtySheet] = useState(false);
  const [tempQty, setTempQty] = useState(1);
  
  const cartItem = items.find(i => i.id === id);
  const quantity = cartItem ? cartItem.quantity : 0;

  // Find effective price based on quantity and tiers
  const getEffectivePrice = (qty: number) => {
    if (!pricingTiers || pricingTiers.length === 0) return price;
    const sortedTiers = [...pricingTiers].sort((a, b) => b.minQty - a.minQty);
    const matchedTier = sortedTiers.find(tier => qty >= tier.minQty);
    return matchedTier ? matchedTier.price : price;
  };

  const currentPrice = getEffectivePrice(quantity > 0 ? quantity : tempQty);

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price, // Base price, provider will handle tier lookup
      mrp,
      unit,
      imageUrl: imageId,
      quantity: tempQty,
      pricingTiers
    });
    setShowQtySheet(false);
    toast({
      title: "Added to Basket",
      description: `${tempQty} ${unit} of ${name} added.`,
      duration: 2000
    });
  };

  const calculateMargin = (tierPrice: number) => {
    if (!mrp) return 0;
    return (((mrp - tierPrice) / mrp) * 100).toFixed(2);
  };

  return (
    <>
      <Card className="border border-orange-50/50 bg-white rounded-[3.5rem] p-8 flex flex-col gap-6 group transition-all duration-300 shadow-sm hover:shadow-md w-full relative overflow-hidden">
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex-1 pr-6">
            <h3 className="font-black text-xl text-gray-800 italic uppercase leading-tight line-clamp-2 tracking-tighter">
              {name}
            </h3>
            <p className="text-4xl font-black text-primary italic mt-2 tracking-tighter">
              ₹{currentPrice}
            </p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">MRP: ₹{mrp}</p>
          </div>

          <div className="relative shrink-0 flex flex-col items-center">
            <div className="w-28 h-28 rounded-[2rem] overflow-hidden relative border border-gray-100 shadow-inner bg-white">
              <Image
                src={imageId}
                alt={name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* Add Button / Quantity Selector */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20">
              {quantity > 0 ? (
                <div className="bg-white border-2 border-primary h-12 px-2 rounded-2xl shadow-xl flex items-center justify-between gap-4 min-w-[110px] animate-in fade-in zoom-in-95 duration-200">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      quantity === 1 ? removeItem(id) : updateQuantity(id, -1);
                    }} 
                    className="text-primary p-1 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Minus className="w-5 h-5 stroke-[4px]" />
                  </button>
                  <span className="font-black text-primary text-base w-4 text-center">{quantity}</span>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      updateQuantity(id, 1);
                    }} 
                    className="text-primary p-1 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Plus className="w-5 h-5 stroke-[4px]" />
                  </button>
                </div>
              ) : (
                <Button 
                  onClick={() => {
                    setTempQty(1);
                    setShowQtySheet(true);
                  }}
                  className="bg-white hover:bg-white text-primary border-2 border-primary h-12 px-8 rounded-2xl font-black text-sm uppercase shadow-xl flex items-center gap-1 transition-all active:scale-95"
                >
                  ADD
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Tiers Table */}
        {pricingTiers && pricingTiers.length > 0 && (
          <div className="w-full overflow-x-auto rounded-2xl border border-gray-100 bg-gray-50/50">
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="p-3 text-left font-black uppercase text-gray-800 border-r border-gray-100 bg-white">Quantity</th>
                  {pricingTiers.map((tier, idx) => (
                    <th key={idx} className={cn(
                      "p-3 text-center font-bold text-gray-600 border-r border-gray-100",
                      quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty) ? "bg-primary/5" : ""
                    )}>
                      {tier.minQty}{tier.maxQty ? `-${tier.maxQty}` : '+'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <th className="p-3 text-left font-black uppercase text-gray-800 border-r border-gray-100 bg-white">Price in ₹</th>
                  {pricingTiers.map((tier, idx) => (
                    <td key={idx} className={cn(
                      "p-3 text-center font-black text-gray-800 border-r border-gray-100",
                      quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty) ? "bg-primary/5 border-x-2 border-primary/20" : ""
                    )}>
                      ₹{tier.price}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="p-3 text-left font-black uppercase text-green-600 border-r border-gray-100 bg-white">Margin in %</th>
                  {pricingTiers.map((tier, idx) => (
                    <td key={idx} className={cn(
                      "p-3 text-center font-bold text-green-600 border-r border-gray-100",
                      quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty) ? "bg-primary/5" : ""
                    )}>
                      {calculateMargin(tier.price)}%
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quantity Selection Popup (Sheet) */}
      <Sheet open={showQtySheet} onOpenChange={setShowQtySheet}>
        <SheetContent side="bottom" className="h-[65vh] rounded-t-[3rem] p-0 bg-white border-none shadow-2xl">
          <div className="p-8 space-y-8 flex flex-col h-full">
            <SheetHeader className="text-center">
              <div className="w-12 h-1 bg-gray-100 rounded-full mx-auto mb-6" />
              <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter">
                SELECT <span className="text-primary">QUANTITY</span>
              </SheetTitle>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{name}</p>
            </SheetHeader>

            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-2 border-gray-50 p-2 bg-white shadow-inner">
                <img src={imageId} alt={name} className="w-full h-full object-cover" />
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-8">
                  <button 
                    onClick={() => setTempQty(prev => Math.max(1, prev - 1))}
                    className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-primary hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-8 h-8 stroke-[3px]" />
                  </button>
                  <span className="text-6xl font-black italic text-gray-900 min-w-[80px] text-center">{tempQty}</span>
                  <button 
                    onClick={() => setTempQty(prev => prev + 1)}
                    className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-primary hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-8 h-8 stroke-[3px]" />
                  </button>
                </div>
                <p className="text-3xl font-black text-primary italic mt-4">
                  ₹{getEffectivePrice(tempQty) * tempQty}
                </p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  ₹{getEffectivePrice(tempQty)} per {unit}
                </p>
              </div>

              {/* Dynamic Tier Hint */}
              {pricingTiers.length > 0 && (
                <div className="w-full bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase text-primary italic">Quantity Pricing Info</span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                    {pricingTiers.map((tier, i) => {
                      const isActive = tempQty >= tier.minQty && (tier.maxQty === null || tempQty <= tier.maxQty);
                      return (
                        <div key={i} className={cn(
                          "min-w-[100px] p-3 rounded-xl border transition-all",
                          isActive ? "bg-white border-primary shadow-sm" : "bg-transparent border-gray-100 opacity-60"
                        )}>
                          <p className="text-[10px] font-black uppercase">{tier.minQty}{tier.maxQty ? `-${tier.maxQty}` : '+'} Qty</p>
                          <p className="text-sm font-black text-gray-800">₹{tier.price}</p>
                          {isActive && <Check className="w-3 h-3 text-primary mt-1" />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <Button 
              onClick={handleAddToCart}
              className="w-full h-16 rounded-[2rem] bg-black text-white font-black italic uppercase text-lg shadow-xl mb-4"
            >
              Add to Basket
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
