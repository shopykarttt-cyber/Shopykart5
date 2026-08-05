
"use client";

import { useState, useEffect, useRef } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { useUser, useFirestore } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Truck, 
  ShoppingBag, 
  MessageSquare, 
  Camera, 
  MapPin, 
  Box, 
  Coins, 
  Ticket, 
  Bike,
  Plus,
  Minus,
  CheckCircle2,
  ChevronRight,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { cn } from "@/lib/utils";

const FREE_DELIVERY_THRESHOLD = 400;

export default function CheckoutPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);
  
  // Custom states matching the UI
  const [instructions, setInstructions] = useState("");
  const [premiumPacking, setPremiumPacking] = useState(false);
  const [redeemCoins, setRedeemCoins] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [tip, setTip] = useState<number | null>(10);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'COD'>('UPI');
  
  // Slider state
  const [sliderVal, setSliderVal] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Calculations
  const deliveryCharge = total >= FREE_DELIVERY_THRESHOLD ? 0 : 10;
  const packingCharge = premiumPacking ? 10 : 0;
  const tipAmount = tip || 0;
  const grandTotal = total + deliveryCharge + packingCharge + tipAmount;

  const handlePlaceOrder = async () => {
    if (!user) return;
    setLoading(true);
    
    const orderData = {
      customerId: user.uid,
      customerName: user.displayName,
      items: items,
      total: grandTotal,
      instructions,
      tipAmount,
      packingUsed: premiumPacking,
      paymentMode,
      status: "Processing",
      createdAt: serverTimestamp(),
    };

    addDoc(collection(db, "orders"), orderData)
      .then(() => {
        setIsOrdered(true);
        clearCart();
        setLoading(false);
      })
      .catch(async () => {
        setLoading(false);
        setSliderVal(0);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'orders',
          operation: 'create',
          requestResourceData: orderData
        } satisfies SecurityRuleContext));
      });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderVal(val);
    if (val > 90) {
      setSliderVal(100);
      handlePlaceOrder();
    }
  };

  useEffect(() => {
    if (sliderVal < 90 && sliderVal > 0) {
      const timer = setTimeout(() => setSliderVal(0), 200);
      return () => clearTimeout(timer);
    }
  }, [sliderVal]);

  if (items.length === 0 && !isOrdered) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-6 bg-[#F8F9FA]">
        <div className="bg-gray-100 p-8 rounded-full"><ShoppingBag className="w-12 h-12 text-gray-300" /></div>
        <h2 className="text-2xl font-black italic uppercase">Bag is Empty</h2>
        <Button onClick={() => router.push('/')} className="rounded-2xl bg-black text-white px-8 h-14">Shop Now</Button>
      </div>
    );
  }

  if (isOrdered) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 space-y-6 text-center">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black italic uppercase leading-none">Order <br/><span className="text-primary">Success!</span></h2>
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Your order is confirmed</p>
        </div>
        <Button onClick={() => router.push('/')} className="h-16 rounded-[2rem] bg-black text-white px-12 font-black italic uppercase">Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32">
      {/* Header */}
      <header className="bg-white px-6 py-6 border-b flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-black italic uppercase tracking-tighter text-gray-900">Secure Checkout</h1>
        <div className="w-8" />
      </header>

      <main className="p-4 space-y-4 max-w-xl mx-auto">
        
        {/* Free Delivery Target */}
        <div className="bg-[#2D2D2D] rounded-[2rem] p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FFB800] p-2 rounded-xl">
              <Truck className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase italic tracking-tighter text-[#FFB800]">Free Delivery Target</p>
              <p className="text-xs font-bold text-gray-300">
                {total >= FREE_DELIVERY_THRESHOLD 
                  ? "Congratulations! Free delivery applied." 
                  : `Add ₹${FREE_DELIVERY_THRESHOLD - total} more for free delivery`}
              </p>
            </div>
          </div>
          <div className="w-full h-1.5 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#FFB800] transition-all duration-500" 
              style={{ width: `${Math.min((total / FREE_DELIVERY_THRESHOLD) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[9px] font-black uppercase tracking-widest text-gray-500">
            <span>Subtotal: ₹{total}</span>
            <span>Target: ₹{FREE_DELIVERY_THRESHOLD}</span>
          </div>
        </div>

        {/* Items in Bag */}
        <div className="bg-[#2D2D2D] rounded-[2.5rem] p-6 text-white shadow-lg space-y-5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#FFB800]" />
            <h3 className="font-black italic uppercase text-sm tracking-tight">Items in Bag</h3>
          </div>
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm leading-tight truncate">{item.name}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-4 bg-black/20 rounded-xl px-3 py-1.5 border border-white/5">
                      <button onClick={() => item.quantity === 1 ? removeItem(item.id) : updateQuantity(item.id, -1)} className="text-[#FFB800]"><Minus className="w-3 h-3 stroke-[4px]" /></button>
                      <span className="font-black text-xs">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="text-[#FFB800]"><Plus className="w-3 h-3 stroke-[4px]" /></button>
                    </div>
                  </div>
                </div>
                <span className="font-black text-lg italic tracking-tighter">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#2D2D2D] rounded-[2.5rem] p-6 text-white shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-[#FFB800]" />
            <h3 className="font-black italic uppercase text-sm tracking-tight">Global Instructions <span className="text-gray-500 font-bold">(Optional)</span></h3>
          </div>
          <textarea 
            placeholder="e.g. Make it extra spicy, Leave at the gate..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full h-24 bg-black/30 border border-white/10 rounded-2xl p-4 text-sm font-medium focus:ring-1 focus:ring-[#FFB800] outline-none"
          />
        </div>

        {/* Verification Photo */}
        <div className="bg-[#2D2D2D] rounded-[2.5rem] p-6 text-white shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 text-[#FFB800]" />
            <h3 className="font-black italic uppercase text-sm tracking-tight">Verification Photo <span className="text-gray-500 font-bold">(Optional)</span></h3>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Upload house photo, your selfie, or nearby landmark</p>
          <div className="w-full h-32 bg-black/30 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer group hover:border-[#FFB800]/30 transition-colors">
            <Camera className="w-8 h-8 text-gray-600 group-hover:text-[#FFB800]/50 mb-2" />
            <span className="text-[10px] font-black uppercase text-gray-500">Tap to upload photo</span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-[#2D2D2D] rounded-2xl p-4 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-black/40 p-2 rounded-xl">
              <MapPin className="w-5 h-5 text-[#FFB800] fill-[#FFB800]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase italic tracking-tighter text-gray-500">Delivery to: {user?.displayName || "User"}</p>
              <p className="text-xs font-bold truncate max-w-[150px]">NEAR JIO-CINEMA, DELHI</p>
            </div>
          </div>
          <Button variant="ghost" className="bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase h-8 px-4">Change</Button>
        </div>

        {/* Enhancements */}
        <div className="bg-[#2D2D2D] rounded-[2.5rem] p-6 text-white shadow-lg space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#FFB800] w-1 h-4 rounded-full" />
            <h3 className="font-black italic uppercase text-sm tracking-tight">Gourmet Enhancements</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="bg-pink-500/20 p-2.5 rounded-xl"><Box className="w-5 h-5 text-pink-500" /></div>
                <div>
                  <h4 className="font-bold text-xs uppercase">Premium Packing</h4>
                  <p className="text-[10px] text-gray-500 font-bold">Extra Protection +₹10</p>
                </div>
              </div>
              <Switch checked={premiumPacking} onCheckedChange={setPremiumPacking} />
            </div>

            <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="bg-orange-500/20 p-2.5 rounded-xl"><Coins className="w-5 h-5 text-orange-500" /></div>
                <div>
                  <h4 className="font-bold text-xs uppercase">Redeem Wallet Coins</h4>
                  <p className="text-[10px] text-gray-500 font-bold">Value ₹0</p>
                </div>
              </div>
              <Switch checked={redeemCoins} onCheckedChange={setRedeemCoins} />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#FFB800]" />
              <span className="text-[10px] font-black uppercase text-[#FFB800] italic">Apply Promo Code</span>
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="ENTER CODE" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="h-14 rounded-2xl bg-black/30 border-white/10 text-white font-bold"
              />
              <Button className="h-14 rounded-2xl bg-[#D2B48C] hover:bg-[#C1A37B] text-black font-black uppercase italic px-8">Apply</Button>
            </div>
          </div>
        </div>

        {/* Tip Rider */}
        <div className="bg-[#2D2D2D] rounded-[2.5rem] p-6 text-white shadow-lg space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-2xl"><Bike className="w-6 h-6 text-blue-400" /></div>
            <div>
              <h3 className="font-black italic uppercase text-sm">Appreciate Your Rider</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">100% tip goes to rider</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {[10, 20, 40].map((amt) => (
              <button
                key={amt}
                onClick={() => setTip(amt)}
                className={cn(
                  "h-14 rounded-2xl border-2 font-black transition-all flex flex-col items-center justify-center relative",
                  tip === amt ? "border-[#FFB800] bg-[#FFB800]/10 text-white" : "border-white/5 bg-black/20 text-gray-400"
                )}
              >
                {amt === 10 && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-[6px] px-1.5 py-0.5 rounded-full whitespace-nowrap">MOST TIPPED</span>
                )}
                ₹{amt}
              </button>
            ))}
            <button className="h-14 rounded-2xl border-2 border-white/5 bg-black/20 text-gray-400 font-bold uppercase text-[10px]">Other</button>
          </div>
        </div>

        {/* Bill Summary */}
        <div className="bg-[#2D2D2D] rounded-[2.5rem] p-8 text-white shadow-lg space-y-6">
          <h3 className="text-xl font-black italic uppercase italic tracking-tighter">Bill Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
              <span className="text-gray-400 italic">Items Subtotal:</span>
              <span className="text-lg">₹{total}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
              <span className="text-gray-400 italic">Delivery & Handling:</span>
              <span className={cn("text-lg", deliveryCharge === 0 ? "text-green-400" : "")}>
                {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
              </span>
            </div>
            {premiumPacking && (
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                <span className="text-gray-400 italic">Packing:</span>
                <span className="text-lg">₹10</span>
              </div>
            )}
            {tipAmount > 0 && (
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                <span className="text-gray-400 italic">Rider Tip:</span>
                <span className="text-lg">₹{tipAmount}</span>
              </div>
            )}
            <div className="h-px bg-white/10 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-lg font-black italic uppercase tracking-tighter">Grand Total:</span>
              <span className="text-4xl font-black italic text-[#FFB800]">₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Payment Selection */}
        <div className="bg-[#2D2D2D] rounded-[2.5rem] p-8 text-white shadow-lg space-y-6">
          <h3 className="text-sm font-black italic uppercase tracking-widest">Select Payment Mode:</h3>
          <div className="space-y-4">
            <button 
              onClick={() => setPaymentMode('UPI')}
              className={cn(
                "w-full p-6 rounded-3xl border-2 flex items-center justify-between transition-all",
                paymentMode === 'UPI' ? "border-[#FFB800] bg-black/40 shadow-[0_0_20px_rgba(255,184,0,0.1)]" : "border-white/5 bg-black/20"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-6 h-6 rounded-full border-4 flex items-center justify-center", paymentMode === 'UPI' ? "border-[#FFB800]" : "border-gray-700")}>
                  {paymentMode === 'UPI' && <div className="w-2.5 h-2.5 bg-[#FFB800] rounded-full" />}
                </div>
                <div className="text-left">
                  <h4 className={cn("font-black uppercase text-sm italic", paymentMode === 'UPI' ? "text-[#FFB800]" : "text-gray-500")}>UPI / QR / APP</h4>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">PhonePe, Gpay, Paytm</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => setPaymentMode('COD')}
              className={cn(
                "w-full p-6 rounded-3xl border-2 flex items-center justify-between transition-all",
                paymentMode === 'COD' ? "border-[#FFB800] bg-black/40 shadow-[0_0_20px_rgba(255,184,0,0.1)]" : "border-white/5 bg-black/20"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-6 h-6 rounded-full border-4 flex items-center justify-center", paymentMode === 'COD' ? "border-[#FFB800]" : "border-gray-700")}>
                  {paymentMode === 'COD' && <div className="w-2.5 h-2.5 bg-[#FFB800] rounded-full" />}
                </div>
                <div className="text-left">
                  <h4 className={cn("font-black uppercase text-sm italic", paymentMode === 'COD' ? "text-[#FFB800]" : "text-gray-500")}>Cash on Delivery</h4>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Pay at Doorstep</p>
                </div>
              </div>
            </button>
          </div>
        </div>

      </main>

      {/* Slide to Order Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-[100]">
        <div className="bg-[#3D3D33] h-20 rounded-full p-2 flex items-center relative overflow-hidden shadow-2xl">
          <input 
            type="range"
            min="0"
            max="100"
            value={sliderVal}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={loading}
          />
          <div 
            className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 pointer-events-none"
            style={{ marginLeft: `${sliderVal * 0.8}%` }}
          >
            {loading ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : <ChevronRight className="w-8 h-8 text-primary" />}
          </div>
          <div className="flex-1 text-center pr-12">
            <span className="text-white font-black italic uppercase tracking-tighter text-lg flex items-center justify-center gap-3">
              Slide to Order <span className="text-[#FFB800] text-2xl">₹{grandTotal}</span>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </span>
          </div>
          
          {/* Progress fill */}
          <div 
            className="absolute left-0 top-0 h-full bg-[#FFB800]/10 -z-1"
            style={{ width: `${sliderVal}%` }}
          />
        </div>
      </div>
    </div>
  );
}
