
"use client";

import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-provider";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CartSheet({ children }: { children: React.ReactNode }) {
  const { items, removeItem, updateQuantity, total } = useCart();
  const router = useRouter();

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-white">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            MY <span className="text-primary">BASKET</span>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          {items.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-gray-200" />
              </div>
              <p className="font-bold text-gray-400 uppercase text-xs tracking-widest">Your basket is empty</p>
            </div>
          ) : (
            <div className="py-6 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-gray-400 font-bold mb-2 uppercase">{item.unit}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-2 py-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400 hover:text-primary"><Minus className="w-4 h-4" /></button>
                        <span className="font-black text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-400 hover:text-primary"><Plus className="w-4 h-4" /></button>
                      </div>
                      <span className="font-black text-primary">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-gray-200 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {items.length > 0 && (
          <div className="p-6 border-t bg-gray-50 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Total Amount</span>
              <span className="text-2xl font-black italic">₹{total}</span>
            </div>
            <Button 
              onClick={() => router.push('/checkout')}
              className="w-full h-16 rounded-[2rem] bg-black text-white font-black italic uppercase text-lg shadow-xl flex items-center justify-center gap-2 group"
            >
              Checkout <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
