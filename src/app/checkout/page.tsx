
"use client";

import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Truck, 
  MapPin, 
  Coins, 
  Bike,
  ChevronRight,
  Loader2,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp, doc, setDoc, query, where, getDocs, updateDoc, increment } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

const FREE_DELIVERY_THRESHOLD = 400;
const POINTS_TO_INR = 0.2; // 1 point = 0.2₹

export default function CheckoutPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  
  // Settings and User Data
  const customerRef = useMemo(() => user ? doc(db, "customers", user.uid) : null, [db, user]);
  const { data: customerData } = useDoc(customerRef);
  const { data: settingsData } = useDoc(doc(db, "settings", "global"));

  // Form states
  const [promoCode, setPromoCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [tip, setTip] = useState<number | null>(null);
  const [redeemPoints, setRedeemPoints] = useState(false);
  
  // Address states
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: "", phone: "", pincode: "", state: "", city: "", detailedAddress: ""
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Slider state
  const [sliderVal, setSliderVal] = useState(0);

  // Points Calculation
  const availablePoints = customerData?.rewardPoints || 0;
  const pointsDiscount = redeemPoints ? Math.min(availablePoints * POINTS_TO_INR, total) : 0;
  
  const taxChargesTotal = useMemo(() => {
    if (!settingsData?.taxCharges) return 0;
    return settingsData.taxCharges.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
  }, [settingsData]);

  const grandTotal = Math.max(0, total + (tip || 0) + taxChargesTotal - couponDiscount - pointsDiscount);

  useEffect(() => {
    if (customerData) {
      setAddressForm({
        name: customerData.name || "",
        phone: customerData.phone || "",
        pincode: customerData.pincode || "",
        state: customerData.state || "",
        city: customerData.city || "",
        detailedAddress: customerData.address || ""
      });
    }
  }, [customerData]);

  const handleApplyCoupon = async () => {
    if (!promoCode) return;
    try {
      const q = query(collection(db, "coupons"), where("code", "==", promoCode.toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        toast({ variant: "destructive", title: "Invalid Coupon" });
        setCouponDiscount(0);
        return;
      }
      const coupon = snap.docs[0].data();
      if (total < (coupon.minOrder || 0)) {
        toast({ variant: "destructive", title: "Min Order Not Met", description: `Minimum order is ₹${coupon.minOrder}` });
        setCouponDiscount(0);
        return;
      }
      let discount = coupon.discountType === 'fixed' ? coupon.value : (total * coupon.value) / 100;
      setCouponDiscount(discount);
      toast({ title: "Coupon Applied!" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error applying coupon" });
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || !customerData?.address) {
      toast({ variant: "destructive", title: "Address Incomplete" });
      setSliderVal(0);
      setIsAddressSheetOpen(true);
      return;
    }

    setLoading(true);
    const orderData = {
      customerId: user.uid,
      customerName: customerData.name || user.displayName,
      items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      total: grandTotal,
      discount: couponDiscount + pointsDiscount,
      address: `${customerData.address}, ${customerData.city}, ${customerData.pincode}`,
      status: "Processing",
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "orders"), orderData);
      
      // Award 10 points and update stats
      const pointsToDeduct = redeemPoints ? Math.floor(pointsDiscount / POINTS_TO_INR) : 0;
      await updateDoc(customerRef!, {
        rewardPoints: increment(10 - pointsToDeduct),
        totalOrders: increment(1),
        totalSpent: increment(grandTotal)
      });

      clearCart();
      toast({ title: "Order Placed Successfully!" });
      router.push(`/orders/${docRef.id}/tracking`);
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to place order" });
      setSliderVal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = () => {
    if (!customerRef) return;
    setSavingAddress(true);
    const updateData = { 
      name: addressForm.name,
      phone: addressForm.phone,
      pincode: addressForm.pincode,
      city: addressForm.city,
      state: addressForm.state,
      address: addressForm.detailedAddress,
      updatedAt: serverTimestamp()
    };
    setDoc(customerRef, updateData, { merge: true })
      .then(() => {
        toast({ title: "Address Saved" });
        setSavingAddress(false);
        setIsAddressSheetOpen(false);
      })
      .catch(() => setSavingAddress(false));
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <header className="bg-white px-6 py-6 border-b flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => router.back()} className="p-2 -ml-2"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
        <h1 className="text-lg font-black italic uppercase tracking-tighter">Checkout</h1>
        <div className="w-8" />
      </header>

      <main className="p-4 space-y-4 max-w-xl mx-auto pb-40">
        <div className="bg-[#2D2D2D] rounded-[2rem] p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FFB800] p-2 rounded-xl"><Truck className="w-5 h-5 text-black" /></div>
            <div>
              <p className="text-[10px] font-black uppercase italic tracking-tighter text-[#FFB800]">Delivery Status</p>
              <p className="text-xs font-bold text-gray-300">
                {total >= FREE_DELIVERY_THRESHOLD ? "Free delivery unlocked!" : `Add ₹${FREE_DELIVERY_THRESHOLD - total} more for free delivery`}
              </p>
            </div>
          </div>
          <div className="w-full h-1.5 bg-gray-600 rounded-full overflow-hidden">
            <div className="h-full bg-[#FFB800] transition-all" style={{ width: `${Math.min((total / FREE_DELIVERY_THRESHOLD) * 100, 100)}%` }} />
          </div>
        </div>

        <div className="bg-[#2D2D2D] rounded-2xl p-5 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="bg-black/40 p-3 rounded-2xl"><MapPin className="w-6 h-6 text-[#FFB800] fill-[#FFB800]" /></div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-black uppercase italic tracking-tighter text-[#FFB800]">Deliver To</p>
              <p className="text-sm font-bold truncate">{customerData?.address ? `${customerData.address}, ${customerData.city}` : "No address found"}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => setIsAddressSheetOpen(true)} className="bg-white/10 text-white rounded-xl text-[10px] font-black uppercase">Change</Button>
        </div>

        <div className="bg-[#2D2D2D] rounded-[2.5rem] p-6 text-white shadow-lg space-y-6">
          <h3 className="font-black italic uppercase text-sm tracking-tight">Redeem & Coupons</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="bg-orange-500/20 p-2.5 rounded-xl"><Coins className="w-5 h-5 text-orange-500" /></div>
                <div>
                  <h4 className="font-bold text-xs uppercase">Redeem Grosify Coins</h4>
                  <p className="text-[10px] text-gray-500 font-bold">Balance: {availablePoints} pts (₹{availablePoints * POINTS_TO_INR})</p>
                </div>
              </div>
              <Switch checked={redeemPoints} onCheckedChange={setRedeemPoints} disabled={availablePoints === 0} />
            </div>
            
            <div className="flex gap-2">
              <Input 
                placeholder="PROMO CODE" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="h-14 rounded-2xl bg-black/30 border-white/10 text-white font-bold"
              />
              <Button onClick={handleApplyCoupon} className="h-14 rounded-2xl bg-[#D2B48C] text-black font-black uppercase italic px-8">Apply</Button>
            </div>
          </div>
        </div>

        <div className="bg-[#2D2D2D] rounded-[2.5rem] p-6 text-white shadow-lg space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-2xl"><Bike className="w-6 h-6 text-blue-400" /></div>
            <div><h3 className="font-black italic uppercase text-sm">Tip Your Partner</h3><p className="text-[10px] font-bold text-gray-500 uppercase">100% tip goes to them</p></div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[10, 20, 40].map((amt) => (
              <button key={amt} onClick={() => setTip(amt)} className={cn("h-14 rounded-2xl border-2 font-black transition-all", tip === amt ? "border-[#FFB800] bg-[#FFB800]/20 text-white" : "border-white/5 bg-black/20 text-gray-400")}>₹{amt}</button>
            ))}
            <button onClick={() => setTip(null)} className={cn("h-14 rounded-2xl border-2 transition-all flex items-center justify-center", tip === null ? "border-red-500/50 text-red-500" : "border-white/5 text-gray-400")}><X className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="bg-[#2D2D2D] rounded-[2.5rem] p-8 text-white shadow-lg space-y-6">
          <h3 className="text-xl font-black italic uppercase tracking-tighter">Bill Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400 italic"><span>Subtotal</span><span className="text-white">₹{total}</span></div>
            {settingsData?.taxCharges?.map((c: any, i: number) => <div key={i} className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400 italic"><span>{c.label}</span><span className="text-white">₹{c.amount}</span></div>)}
            {couponDiscount > 0 && <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-green-400 italic"><span>Coupon Discount</span><span>-₹{couponDiscount}</span></div>}
            {pointsDiscount > 0 && <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-green-400 italic"><span>Coins Redeemed</span><span>-₹{pointsDiscount}</span></div>}
            <div className="h-px bg-white/10 my-2" />
            <div className="flex justify-between items-center"><span className="text-lg font-black italic uppercase">Total Payable</span><span className="text-4xl font-black italic text-[#FFB800]">₹{grandTotal}</span></div>
          </div>
        </div>

        <div className="pt-8 pb-12 w-full max-w-sm mx-auto">
          <div className="bg-[#3D3D33] h-20 rounded-full p-2 flex items-center relative overflow-hidden shadow-2xl border border-white/5">
            <input type="range" min="0" max="100" value={sliderVal} onChange={(e) => {
              const val = parseInt(e.target.value);
              setSliderVal(val);
              if (val > 90) handlePlaceOrder();
            }} className="absolute inset-0 w-full h-full opacity-0 z-10" disabled={loading} />
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center transition-all duration-200" style={{ marginLeft: `${sliderVal * 0.8}%` }}>
              {loading ? <Loader2 className="animate-spin text-primary" /> : <ChevronRight className="text-primary" />}
            </div>
            <div className="flex-1 text-center pr-12 text-white font-black italic uppercase text-lg">Slide to Order ₹{grandTotal}</div>
          </div>
        </div>
      </main>

      <Sheet open={isAddressSheetOpen} onOpenChange={setIsAddressSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-[3rem] bg-white border-none p-8 z-[1001]">
          <ScrollArea className="h-full">
            <div className="max-w-md mx-auto space-y-6 pb-20">
              <SheetHeader><SheetTitle className="text-3xl font-black italic uppercase tracking-tighter text-center">Delivery Info</SheetTitle></SheetHeader>
              <Input placeholder="Full Name" value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none font-bold" />
              <Input placeholder="Phone Number" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none font-bold" />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Pincode" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none font-bold" />
                <Input placeholder="City" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none font-bold" />
              </div>
              <Input placeholder="State" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none font-bold" />
              <textarea placeholder="House No, Street, Landmark..." value={addressForm.detailedAddress} onChange={e => setAddressForm({...addressForm, detailedAddress: e.target.value})} className="w-full h-24 rounded-2xl bg-gray-50 border-none p-4 font-bold outline-none resize-none" />
              <Button onClick={handleSaveAddress} disabled={savingAddress} className="w-full h-16 rounded-[2rem] bg-black text-white font-black italic uppercase text-lg">{savingAddress ? "Saving..." : "Save Address"}</Button>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
