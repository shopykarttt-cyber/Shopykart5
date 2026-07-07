
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useCart } from "@/components/cart/cart-provider";
import { useUser, useFirestore } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, CreditCard, ShoppingBag, ArrowLeft, CheckCircle2, Loader2, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const AddressMap = dynamic(() => import('@/components/checkout/AddressMap'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-gray-50 animate-pulse rounded-3xl flex items-center justify-center font-bold text-gray-400">Loading Map...</div> 
});

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const [address, setAddress] = useState({
    pincode: "",
    street: "",
    landmark: "",
    lat: 28.6139,
    lng: 77.2090
  });

  const [selectedMapPos, setSelectedMapPos] = useState<[number, number] | null>([28.6139, 77.2090]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLocationSelect = (pos: [number, number]) => {
    setSelectedMapPos(pos);
    setAddress(prev => ({ ...prev, lat: pos[0], lng: pos[1] }));
    toast({ title: "Location Updated", description: "Delivery pin dropped successfully." });
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    setLoading(true);
    
    const orderData = {
      customerId: user.uid,
      customerName: user.displayName,
      items: items,
      total: total,
      address: {
        ...address,
        mapLocation: selectedMapPos ? { lat: selectedMapPos[0], lng: selectedMapPos[1] } : null
      },
      status: "Processing",
      createdAt: serverTimestamp(),
    };

    addDoc(collection(db, "orders"), orderData)
      .then(() => {
        setStep(3);
        clearCart();
        setLoading(false);
      })
      .catch(async () => {
        setLoading(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'orders',
          operation: 'create',
          requestResourceData: orderData
        } satisfies SecurityRuleContext));
      });
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-6">
        <div className="bg-gray-100 p-8 rounded-full"><ShoppingBag className="w-12 h-12 text-gray-300" /></div>
        <h2 className="text-2xl font-black italic uppercase">Basket Empty</h2>
        <Button onClick={() => router.push('/')} className="rounded-2xl bg-black text-white">Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      <header className="bg-white p-6 border-b flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => step === 1 ? router.push('/') : setStep(step - 1)}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black italic uppercase tracking-tighter">Checkout</h1>
      </header>

      <main className="p-6 space-y-8 max-w-2xl mx-auto">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-black italic uppercase">Delivery Point</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pin your location on street map</p>
            </div>
            
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
               <div className="h-[300px] w-full relative">
                  {isClient && (
                    <AddressMap 
                      center={[28.6139, 77.2090]}
                      selectedPos={selectedMapPos}
                      onLocationSelect={handleLocationSelect}
                    />
                  )}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl flex items-center gap-2 border border-gray-100 shadow-lg pointer-events-none z-[1000]">
                    <Navigation className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-gray-600">Tap on street map to set pin</span>
                  </div>
               </div>
               <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-primary mb-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Enter Address Details</span>
                </div>
                <Input placeholder="Flat/House No., Street *" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Pincode *" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                  <Input placeholder="Landmark" value={address.landmark} onChange={e => setAddress({...address, landmark: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-none px-6 font-bold" />
                </div>
               </div>
            </Card>

            <Button 
              onClick={() => address.pincode && address.street ? setStep(2) : toast({ title: "Required", description: "Fill address and street details." })}
              className="w-full h-16 rounded-[2rem] bg-black text-white font-black italic uppercase text-lg shadow-xl"
            >
              Confirm & Pay
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-black italic uppercase">Payment</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select method</p>
            </div>

            <div className="space-y-4">
              {['Cash on Delivery', 'Credit/Debit Card', 'UPI'].map((method) => (
                <Card key={method} className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${method === 'Cash on Delivery' ? 'border-primary bg-primary/5' : 'border-transparent bg-white shadow-lg'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${method === 'Cash on Delivery' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-gray-800">{method}</span>
                    </div>
                    {method === 'Cash on Delivery' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6 rounded-[2.5rem] border-none shadow-xl bg-black text-white">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>Delivery</span>
                  <span className="text-green-400">FREE</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm font-black uppercase">To Pay</span>
                  <span className="text-3xl font-black italic">₹{total}</span>
                </div>
              </div>
            </Card>

            <Button 
              disabled={loading}
              onClick={handlePlaceOrder}
              className="w-full h-16 rounded-[2rem] bg-primary text-white font-black italic uppercase text-lg shadow-xl"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Place Order"}
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 space-y-6 text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-200">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black italic uppercase leading-none">Order <br/><span className="text-primary">Success!</span></h2>
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Your groceries are on the way</p>
            </div>
            <Button onClick={() => router.push('/')} className="h-16 rounded-[2rem] bg-black text-white px-12 font-black italic uppercase">Go Home</Button>
          </div>
        )}
      </main>
    </div>
  );
}
